"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Conversations</h1>
          <p className="text-sm text-muted-foreground">
            Review chat conversations from your visitors
          </p>
        </div>
      </div>

      {/* Filter */}
      {chatbots.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <select
            value={selectedChatbot}
            onChange={(e) => setSelectedChatbot(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <MessageSquare className="size-8 text-muted-foreground" />
            <p className="text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground">
              Conversations will appear here when visitors use your chatbot
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conv) => (
            <Card
              key={conv.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() =>
                router.push(`/dashboard/conversations/${conv.id}`)
              }
            >
              <CardContent className="flex items-center gap-4 py-3">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {conv.chatbotName}
                    </span>
                    <Badge
                      variant={
                        conv.status === "active" ? "default" : "secondary"
                      }
                    >
                      {conv.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {conv.lastMessagePreview}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
