"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FileText, Calendar } from "lucide-react";
import type { IBusiness } from "@/types";

interface IChatbotListItem {
  id: string;
  businessId: string;
  name: string;
  embedKey: string;
  isActive: boolean;
  documentCount: number;
  createdAt: string;
}

export default function ChatbotsPage() {
  const [business, setBusiness] = useState<IBusiness | null>(null);
  const [chatbots, setChatbots] = useState<IChatbotListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const [bizRes, botsRes] = await Promise.all([
          fetch("/api/dashboard/business"),
          fetch("/api/dashboard/chatbots"),
        ]);

        const bizData = await bizRes.json();
        const botsData = await botsRes.json();

        if (bizData.success) setBusiness(bizData.business);
        if (botsData.success) setChatbots(botsData.chatbots);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!business || !newName.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), businessId: business.id }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      setChatbots((prev) => [
        { ...data.chatbot, documentCount: 0 },
        ...prev,
      ]);
      setNewName("");
      setDialogOpen(false);
    } catch {
      setError("Failed to create chatbot");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading chatbots...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Chatbots</h1>
          <p className="text-sm text-muted-foreground">
            Manage your AI chatbots
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              Create Chatbot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create a new chatbot</DialogTitle>
                <DialogDescription>
                  Give your chatbot a name. You can configure it after creation.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2 py-4">
                <Label htmlFor="chatbot-name">Name</Label>
                <Input
                  id="chatbot-name"
                  placeholder="e.g. Customer Support Bot"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={creating || !newName.trim()}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {chatbots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <p className="text-muted-foreground">No chatbots yet</p>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              Create your first chatbot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chatbots.map((bot) => (
            <Card
              key={bot.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/dashboard/chatbots/${bot.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{bot.name}</CardTitle>
                  <Badge variant={bot.isActive ? "default" : "secondary"}>
                    {bot.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="size-3" />
                    {bot.documentCount} docs
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(bot.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
