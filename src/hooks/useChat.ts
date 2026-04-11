"use client";

import { useState, useCallback, useRef } from "react";
import { type Message } from "@/types";
import { generateId } from "@/lib/utils";

interface ISSEEvent {
  type: "message_start" | "content_delta" | "message_end" | "error";
  content?: string;
}

interface IUseChatReturn {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  abortStream: () => void;
  clearMessages: () => void;
  clearError: () => void;
}

function getErrorMessage(status: number, fallback: string): string {
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "Something went wrong. Please try again.";
  return fallback;
}

export function useChat(): IUseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    lastUserMessageRef.current = content;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const currentMessages = [...messages, userMessage];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages.map(({ role, content: c }) => ({
            role,
            content: c,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        let errorMsg = `Request failed (${response.status})`;
        try {
          const errorData = (await response.json()) as { error?: string };
          errorMsg = errorData.error ?? errorMsg;
        } catch {
          // Could not parse error body
        }
        throw Object.assign(new Error(getErrorMessage(response.status, errorMsg)), {
          status: response.status,
        });
      }

      const body = response.body;
      if (!body) {
        throw new Error("No response body received");
      }

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const jsonStr = trimmed.slice(6);
          let event: ISSEEvent;

          try {
            event = JSON.parse(jsonStr) as ISSEEvent;
          } catch {
            continue;
          }

          switch (event.type) {
            case "content_delta": {
              if (event.content) {
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (!last || last.role !== "assistant") return prev;

                  const updated: Message = {
                    ...last,
                    content: last.content + event.content,
                  };
                  return [...prev.slice(0, -1), updated];
                });
              }
              break;
            }
            case "message_end": {
              setIsStreaming(false);
              break;
            }
            case "error": {
              setError(event.content ?? "Unknown streaming error");
              setIsStreaming(false);
              break;
            }
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith("data: ")) {
          try {
            const event = JSON.parse(trimmed.slice(6)) as ISSEEvent;
            if (event.type === "message_end") {
              setIsStreaming(false);
            } else if (event.type === "error") {
              setError(event.content ?? "Unknown streaming error");
              setIsStreaming(false);
            }
          } catch {
            // Ignore malformed final chunk
          }
        }
      }

      setIsStreaming(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Keep partial response, just stop streaming
        setIsStreaming(false);
        return;
      }

      const isNetworkError =
        err instanceof TypeError && err.message.includes("fetch");
      const message = isNetworkError
        ? "Unable to connect. Please check your internet connection."
        : err instanceof Error
          ? err.message
          : "Failed to send message";
      setError(message);
      setIsStreaming(false);

      // Remove empty assistant placeholder on error, but keep partial responses
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      abortControllerRef.current = null;
    }
  }, [messages, isStreaming]);

  const retryLastMessage = useCallback(async () => {
    const lastUserContent = lastUserMessageRef.current;
    if (!lastUserContent || isStreaming) return;

    // Remove the last assistant message (failed/partial) and user message to re-send
    setMessages((prev) => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg?.role === "assistant") {
        // Also remove the user message before it
        const secondLast = prev[prev.length - 2];
        if (secondLast?.role === "user") {
          return prev.slice(0, -2);
        }
        return prev.slice(0, -1);
      }
      // If last is user (assistant was already removed on error), remove it
      if (lastMsg?.role === "user") {
        return prev.slice(0, -1);
      }
      return prev;
    });

    setError(null);

    // Use setTimeout to let state settle before re-sending
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 0);
    });

    await sendMessage(lastUserContent);
  }, [isStreaming, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    lastUserMessageRef.current = null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    retryLastMessage,
    abortStream,
    clearMessages,
    clearError,
  };
}
