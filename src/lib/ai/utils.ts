import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { type IMessage } from "@/types";
import { getEnv } from "@/lib/env";

export type MessageRole = "user" | "assistant";

export const MODEL = "claude-sonnet-4-20250514";

export const SYSTEM_PROMPT =
  "You are a helpful AI assistant. Answer questions clearly and concisely.";

export function buildSystemPrompt(
  chunks?: string[],
  basePrompt?: string,
): string {
  const base = basePrompt ?? SYSTEM_PROMPT;

  if (!chunks || chunks.length === 0) {
    return base;
  }

  const contextBlock = chunks.map((c) => `---\n${c}\n---`).join("\n");

  return `${base}

Answer questions based on the following context. If the context doesn't contain relevant information, say so and answer from your general knowledge.

Context from knowledge base:
${contextBlock}`;
}

export function getAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: getEnv().ANTHROPIC_API_KEY });
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function createMessage(
  role: MessageRole,
  content: string
): IMessage {
  return {
    id: generateId(),
    role,
    content,
    createdAt: new Date(),
  };
}

export function formatMessagesForAPI(messages: IMessage[]) {
  return messages.map(({ role, content }) => ({ role, content }));
}
