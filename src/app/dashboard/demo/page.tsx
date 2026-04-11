"use client";

import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { useChat } from "@/hooks/useChat";

export default function DashboardDemoPage() {
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
            <span className="text-sm font-bold text-white">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              AI Chat Demo
            </h1>
            <p className="text-xs text-white/40">
              Test your chatbot in real time
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/50 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <ChatWindow
          messages={messages}
          isStreaming={isStreaming}
          error={error}
          onClearError={clearError}
          onRetry={retryLastMessage}
        />
        <ChatInput
          onSend={handleSend}
          isStreaming={isStreaming}
          onAbort={abortStream}
        />
      </div>
    </div>
  );
}
