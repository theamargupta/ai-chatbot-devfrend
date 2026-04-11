"use client";

import { type KeyboardEvent, type FormEvent, useState, useRef, useEffect, useCallback } from "react";

interface IChatInputProps {
  onSend: (content: string) => void;
  isStreaming: boolean;
  onAbort: () => void;
}

export function ChatInput({ onSend, isStreaming, onAbort }: IChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 4 * 24;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send();
  }

  function send() {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
    setTimeout(() => {
      textareaRef.current?.focus();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }, 0);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
    if (e.key === "Escape" && isStreaming) {
      e.preventDefault();
      onAbort();
    }
  }

  const hasText = value.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 z-10 border-t border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl"
    >
      <div className="relative flex items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message AI Chat..."
          disabled={isStreaming}
          rows={1}
          aria-label="Message input"
          className="w-full resize-none rounded-xl border border-border bg-background py-3 pl-4 pr-12 text-sm leading-6 shadow-sm transition-shadow placeholder:text-muted-foreground focus:border-ring/50 focus:shadow-md focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !hasText}
          className={
            "absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-all " +
            (hasText
              ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              : "pointer-events-none bg-muted text-muted-foreground opacity-0")
          }
          aria-label="Send message"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
