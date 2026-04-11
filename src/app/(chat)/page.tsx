"use client";

import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { useChat } from "@/hooks/useChat";

export default function ChatPage() {
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
    <main className="flex h-dvh flex-col items-center bg-background">
      <div className="flex w-full max-w-3xl flex-1 flex-col overflow-hidden max-md:px-0">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">AI</span>
            </div>
            <h1 className="text-sm font-semibold tracking-tight">AI Chat</h1>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Clear chat
            </button>
          )}
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
