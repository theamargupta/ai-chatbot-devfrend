"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, User } from "lucide-react";

interface IConversationDetail {
  id: string;
  chatbotId: string;
  chatbotName: string;
  visitorId: string;
  status: "active" | "closed";
  startedAt: string;
  lastMessageAt: string;
}

interface IMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  contextChunks: number;
  createdAt: string;
}

export default function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [conversation, setConversation] =
    useState<IConversationDetail | null>(null);
  const [messages, setMessages] = useState<IMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/conversations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error ?? "Not found");
          return;
        }
        setConversation(data.conversation);
        setMessages(data.messages);
      })
      .catch(() => setError("Failed to load conversation"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/40">Loading...</p>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-red-400">{error ?? "Not found"}</p>
        <button
          onClick={() => router.push("/dashboard/conversations")}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-all duration-200 hover:bg-white/10"
        >
          <ArrowLeft className="size-4" />
          Back to conversations
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => router.push("/dashboard/conversations")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">
              {conversation.chatbotName}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                conversation.status === "active"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-white/5 text-white/30"
              }`}
            >
              <span
                className={`h-1 w-1 rounded-full ${
                  conversation.status === "active"
                    ? "bg-green-400"
                    : "bg-white/30"
                }`}
              />
              {conversation.status}
            </span>
          </div>
          <p className="text-xs text-white/30">
            Visitor: {conversation.visitorId.slice(0, 12)}... &middot; Started{" "}
            {new Date(conversation.startedAt).toLocaleString()}
          </p>
        </div>
      </motion.div>

      {/* Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
        <p className="mb-4 text-sm font-medium text-white/40">
          {messages.length} messages
        </p>

        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-purple-500"
                    : "border border-white/10 bg-white/5"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="size-3.5 text-white" />
                ) : (
                  <Bot className="size-3.5 text-white/60" />
                )}
              </div>
              <div
                className={`flex max-w-[75%] flex-col gap-1 ${
                  msg.role === "user" ? "items-end" : ""
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600/80 text-white"
                      : "border border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/25">
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {msg.role === "assistant" && msg.contextChunks > 0 && (
                    <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5">
                      {msg.contextChunks} sources
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-white/30">
              No messages in this conversation
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
