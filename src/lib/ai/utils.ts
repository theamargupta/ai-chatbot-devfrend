import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { type Message } from "@/types";
import { env } from "@/lib/env";

export type MessageRole = "user" | "assistant";

export const MODEL = "claude-sonnet-4-20250514";

export const SYSTEM_PROMPT =
  "You are a helpful AI assistant. Answer questions clearly and concisely.";

export function getAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function createMessage(
  role: MessageRole,
  content: string
): Message {
  return {
    id: generateId(),
    role,
    content,
    createdAt: new Date(),
  };
}

export function formatMessagesForAPI(messages: Message[]) {
  return messages.map(({ role, content }) => ({ role, content }));
}
