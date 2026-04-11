"use client";

import Link from "next/link";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { useChat } from "@/hooks/useChat";

export default function DemoPage() {
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    retryLastMessage,
    abortStream,
    clearMessages,
    clearError,
  } = useChat();

  function handleSend(content: string) {
    clearError();
    sendMessage(content);
  }

  return (
    <main className="flex h-dvh flex-col items-center bg-[#0a0a0f]">
      <div className="flex w-full max-w-3xl flex-1 flex-col overflow-hidden max-md:px-0">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/50 px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <span className="text-sm font-bold text-white">AI</span>
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-white">
              AI Chat Demo
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/knowledge"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              Knowledge Base
            </Link>
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                Clear chat
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <ChatWindow
          messages={messages}
          isStreaming={isStreaming}
          error={error}
          onClearError={clearError}
          onRetry={retryLastMessage}
        />

        {/* Input */}
        <ChatInput onSend={handleSend} isStreaming={isStreaming} onAbort={abortStream} />
      </div>
    </main>
  );
}
