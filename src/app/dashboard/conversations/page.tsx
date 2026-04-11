"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, Clock, User } from "lucide-react";

interface IConversationListItem {
  id: string;
  chatbotId: string;
  chatbotName: string;
  visitorId: string;
  status: "active" | "closed";
  messageCount: number;
  lastMessagePreview: string;
  startedAt: string;
  lastMessageAt: string;
}

interface IChatbotOption {
  id: string;
  name: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<IConversationListItem[]>(
    [],
  );
  const [chatbots, setChatbots] = useState<IChatbotOption[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard/chatbots")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setChatbots(
            data.chatbots.map((c: { id: string; name: string }) => ({
              id: c.id,
              name: c.name,
            })),
          );
        }
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedChatbot
      ? `/api/dashboard/conversations?chatbot_id=${selectedChatbot}`
      : "/api/dashboard/conversations";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setConversations(data.conversations);
      })
      .finally(() => setLoading(false));
  }, [selectedChatbot]);

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-white">
          Conversations
        </h1>
        <p className="text-sm text-white/40">
          Review chat conversations from your visitors
        </p>
      </div>

      {/* Filter */}
      {chatbots.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/40">Filter:</span>
          <select
            value={selectedChatbot}
            onChange={(e) => setSelectedChatbot(e.target.value)}
            className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/60 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All chatbots</option>
            {chatbots.map((bot) => (
              <option key={bot.id} value={bot.id}>
                {bot.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-white/40">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-16 backdrop-blur-xl">
          <MessageSquare className="size-8 text-white/20" />
          <p className="text-white/40">No conversations yet</p>
          <p className="text-xs text-white/25">
            Conversations will appear here when visitors use your chatbot
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() =>
                router.push(`/dashboard/conversations/${conv.id}`)
              }
              className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
            >
              <div className="flex items-center gap-4">
                {/* Visitor avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-xs font-bold text-white/60">
                  {conv.visitorId.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {conv.chatbotName}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        conv.status === "active"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      <span
                        className={`h-1 w-1 rounded-full ${
                          conv.status === "active"
                            ? "bg-green-400"
                            : "bg-white/30"
                        }`}
                      />
                      {conv.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      {conv.visitorId.slice(0, 8)}...
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-3" />
                      {conv.messageCount} messages
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  {conv.lastMessagePreview && (
                    <p className="mt-1 text-xs text-white/25 line-clamp-1">
                      {conv.lastMessagePreview}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
