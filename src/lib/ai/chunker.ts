import "server-only";

import type { IChunkData } from "@/types";

const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_OVERLAP = 100;
const MIN_CHUNK_LENGTH = 50;
const MAX_CHUNK_LENGTH = 600;

interface IChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

const SEPARATORS = ["\n\n", "\n", ". ", "? ", "! ", " "];

function cleanText(text: string): string {
  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function splitBySeparator(text: string, separator: string): string[] {
  if (separator === ". " || separator === "? " || separator === "! ") {
    // Keep the punctuation with the preceding segment
    const parts: string[] = [];
    let remaining = text;
    let idx = remaining.indexOf(separator);

    while (idx !== -1) {
      parts.push(remaining.slice(0, idx + 1)); // include the punctuation char
      remaining = remaining.slice(idx + 2); // skip the space after punctuation
      idx = remaining.indexOf(separator);
    }

    if (remaining) {
      parts.push(remaining);
    }

    return parts;
  }

  return text.split(separator);
}

function recursiveSplit(
  text: string,
  chunkSize: number,
  separatorIndex: number,
): string[] {
  if (text.length <= chunkSize) {
    return [text];
  }

  if (separatorIndex >= SEPARATORS.length) {
    // Last resort: hard split by character
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  const separator = SEPARATORS[separatorIndex];
  const parts = splitBySeparator(text, separator);

  if (parts.length <= 1) {
    // This separator didn't help, try the next one
    return recursiveSplit(text, chunkSize, separatorIndex + 1);
  }

  const chunks: string[] = [];
  let current = "";

  for (const part of parts) {
    const candidate = current
      ? current + (separator === " " ? " " : separator) + part
      : part;

    if (candidate.length <= chunkSize) {
      current = candidate;
    } else {
      if (current) {
        chunks.push(current);
      }

      if (part.length > chunkSize) {
        // Part itself is too big, recursively split with next separator
        const subChunks = recursiveSplit(part, chunkSize, separatorIndex + 1);
        chunks.push(...subChunks);
        current = "";
      } else {
        current = part;
      }
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function applyOverlap(chunks: string[], overlap: number): string[] {
  if (overlap <= 0 || chunks.length <= 1) {
    return chunks;
  }

  const result: string[] = [chunks[0]];

  for (let i = 1; i < chunks.length; i++) {
    const prevChunk = chunks[i - 1];
    const overlapText = prevChunk.slice(-overlap);
    result.push(overlapText + chunks[i]);
  }

  return result;
}

export function chunkText(text: string, options?: IChunkOptions): IChunkData[] {
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options?.overlap ?? DEFAULT_OVERLAP;

  const cleaned = cleanText(text);
  if (!cleaned) {
    return [];
  }

  const rawChunks = recursiveSplit(cleaned, chunkSize, 0);
  const overlappedChunks = applyOverlap(rawChunks, overlap);

  const result: IChunkData[] = [];
  let chunkIndex = 0;

  for (const chunk of overlappedChunks) {
    const trimmed = chunk.trim();

    if (trimmed.length < MIN_CHUNK_LENGTH) {
      continue;
    }

    const content =
      trimmed.length > MAX_CHUNK_LENGTH
        ? trimmed.slice(0, MAX_CHUNK_LENGTH)
        : trimmed;

    result.push({
      content,
      chunkIndex,
      tokenCount: Math.ceil(content.length / 4),
    });

    chunkIndex++;
  }

  return result;
}
