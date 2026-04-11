"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import type { Message } from "@/types";

interface IChatWindowProps {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  onClearError: () => void;
  onRetry: () => void;
}

export function ChatWindow({
  messages,
  isStreaming,
  error,
  onClearError,
  onRetry,
}: IChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Auto-dismiss error after 10 seconds
  useEffect(() => {
    if (error) {
      errorTimerRef.current = setTimeout(() => {
        onClearError();
      }, 10000);
    }
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
    };
  }, [error, onClearError]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            How can I help you today?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask me anything — I am powered by Claude AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto" role="log" aria-live="polite">
      <div className="flex flex-col py-6">
        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const isSameSender = prev?.role === message.role;
          const isLastAssistant =
            message.role === "assistant" && index === messages.length - 1;

          return (
            <div
              key={message.id}
              className={isSameSender ? "mt-2" : index === 0 ? "" : "mt-5"}
            >
              <ChatMessage
                message={message}
                isStreaming={isLastAssistant && isStreaming}
                isFirstInGroup={!isSameSender}
              />
            </div>
          );
        })}

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-4 py-2.5">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={onRetry}
              className="shrink-0 rounded-md bg-destructive/15 px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/25"
            >
              Try again
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
