"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-destructive">{error ?? "Not found"}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/conversations")}
        >
          <ArrowLeft className="size-4" />
          Back to conversations
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/dashboard/conversations")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">
              {conversation.chatbotName}
            </h1>
            <Badge
              variant={
                conversation.status === "active" ? "default" : "secondary"
              }
            >
              {conversation.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Visitor: {conversation.visitorId.slice(0, 12)}... · Started{" "}
            {new Date(conversation.startedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {messages.length} messages
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="size-3.5" />
                ) : (
                  <Bot className="size-3.5" />
                )}
              </div>
              <div
                className={`flex max-w-[75%] flex-col gap-1 ${
                  msg.role === "user" ? "items-end" : ""
                }`}
              >
                <div
                  className={`rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {msg.role === "assistant" && msg.contextChunks > 0 && (
                    <span className="rounded bg-muted px-1">
                      {msg.contextChunks} sources
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No messages in this conversation
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
