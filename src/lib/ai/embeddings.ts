import "server-only";

const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
const BATCH_SIZE = 10;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EmbeddingPipeline = any;

let pipelineInstance: EmbeddingPipeline | null = null;
let pipelineLoading: Promise<EmbeddingPipeline | null> | null = null;
let pipelineFailed = false;

async function getEmbeddingPipeline(): Promise<EmbeddingPipeline | null> {
  if (process.env.EMBEDDINGS_ENABLED === "false") {
    return null;
  }

  if (pipelineFailed) {
    return null;
  }

  if (pipelineInstance) {
    return pipelineInstance;
  }

  if (pipelineLoading) {
    return pipelineLoading;
  }

  pipelineLoading = (async () => {
    try {
      const { pipeline } = await import("@xenova/transformers");
      console.log(`[embeddings] Loading model ${EMBEDDING_MODEL}...`);
      const pipe = await pipeline("feature-extraction", EMBEDDING_MODEL);
      console.log(
        `[embeddings] Model ${EMBEDDING_MODEL} loaded successfully.`,
      );
      pipelineInstance = pipe;
      return pipe;
    } catch (err) {
      pipelineFailed = true;
      console.warn(
        "[embeddings] Failed to load embedding model:",
        err instanceof Error ? err.message : err,
      );
      return null;
    }
  })();

  return pipelineLoading;
}

function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(
    vector.reduce((sum, val) => sum + val * val, 0),
  );
  if (magnitude === 0) return vector;
  return vector.map((val) => val / magnitude);
}

export async function generateEmbedding(
  text: string,
): Promise<number[] | null> {
  try {
    const pipe = await getEmbeddingPipeline();
    if (!pipe) return null;
    const output = await pipe(text, { pooling: "mean", normalize: true });
    const embedding = Array.from(output.data as Float32Array).slice(0, 384);
    return normalizeVector(embedding);
  } catch (err) {
    console.warn(
      "[embeddings] generateEmbedding failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

export async function generateEmbeddings(
  texts: string[],
): Promise<number[][] | null> {
  try {
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      console.log(
        `[embeddings] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)} (${batch.length} texts)`,
      );

      const batchResults = await Promise.all(
        batch.map((text) => generateEmbedding(text)),
      );

      // If any embedding failed, return null
      if (batchResults.some((r) => r === null)) {
        return null;
      }

      results.push(...(batchResults as number[][]));
    }

    return results;
  } catch (err) {
    console.warn(
      "[embeddings] generateEmbeddings failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
