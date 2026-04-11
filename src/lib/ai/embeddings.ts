import "server-only";

import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 384;

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

export async function generateEmbedding(
  text: string,
): Promise<number[] | null> {
  try {
    const client = getOpenAIClient();
    if (!client) {
      console.warn("[embeddings] OPENAI_API_KEY not set — skipping embedding");
      return null;
    }

    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data[0].embedding;
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
    const client = getOpenAIClient();
    if (!client) {
      console.warn("[embeddings] OPENAI_API_KEY not set — skipping embeddings");
      return null;
    }

    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data.map((item) => item.embedding);
  } catch (err) {
    console.warn(
      "[embeddings] generateEmbeddings failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
