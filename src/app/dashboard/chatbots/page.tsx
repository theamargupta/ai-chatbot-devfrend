"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
        <p className="text-white/40">Loading chatbots...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-white">
            Chatbots
          </h1>
          <p className="text-sm text-white/40">Manage your AI chatbots</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-shadow hover:shadow-xl hover:shadow-purple-500/30"
        >
          <Plus className="size-4" />
          Create Chatbot
        </motion.button>
      </div>

      {/* Create dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDialogOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0f]/95 p-6 shadow-2xl backdrop-blur-xl"
          >
            <h2 className="text-lg font-semibold text-white">
              Create a new chatbot
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Give your chatbot a name. You can configure it after creation.
            </p>
            <form onSubmit={handleCreate} className="mt-6">
              <label className="text-sm font-medium text-white/60">Name</label>
              <input
                placeholder="e.g. Customer Support Bot"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="h-10 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 text-sm font-medium text-white transition-all duration-200 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Empty state */}
      {chatbots.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-16 backdrop-blur-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/30">
            <MessageSquareIcon />
          </div>
          <p className="text-white/40">No chatbots yet</p>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            <Plus className="size-4" />
            Create your first chatbot
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {chatbots.map((bot, i) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => router.push(`/dashboard/chatbots/${bot.id}`)}
              className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-purple-500/5"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold text-white">
                  {bot.name}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    bot.isActive
                      ? "bg-green-500/10 text-green-400"
                      : "bg-white/5 text-white/30"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      bot.isActive ? "bg-green-400" : "bg-white/30"
                    }`}
                  />
                  {bot.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-white/30">
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3" />
                  {bot.documentCount} docs
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3" />
                  {new Date(bot.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageSquareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}
