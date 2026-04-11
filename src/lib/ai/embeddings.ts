import "server-only";

import { pipeline } from "@xenova/transformers";

const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
const BATCH_SIZE = 10;

type EmbeddingPipeline = Awaited<
  ReturnType<typeof pipeline<"feature-extraction">>
>;

let pipelineInstance: EmbeddingPipeline | null = null;
let pipelineLoading: Promise<EmbeddingPipeline> | null = null;

async function getEmbeddingPipeline(): Promise<EmbeddingPipeline> {
  if (pipelineInstance) {
    return pipelineInstance;
  }

  if (pipelineLoading) {
    return pipelineLoading;
  }

  pipelineLoading = (async () => {
    console.log(`[embeddings] Loading model ${EMBEDDING_MODEL}...`);
    const pipe = await pipeline("feature-extraction", EMBEDDING_MODEL);
    console.log(`[embeddings] Model ${EMBEDDING_MODEL} loaded successfully.`);
    pipelineInstance = pipe;
    return pipe;
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

export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(text, { pooling: "mean", normalize: true });
  const embedding = Array.from(output.data as Float32Array).slice(0, 384);
  return normalizeVector(embedding);
}

export async function generateEmbeddings(
  texts: string[],
): Promise<number[][]> {
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    console.log(
      `[embeddings] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)} (${batch.length} texts)`,
    );

    const batchResults = await Promise.all(
      batch.map((text) => generateEmbedding(text)),
    );
    results.push(...batchResults);
  }

  return results;
}
