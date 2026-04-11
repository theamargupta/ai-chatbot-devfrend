"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Download, Mail } from "lucide-react";

interface ILeadItem {
  id: string;
  name: string;
  email: string;
  chatbotId: string;
  chatbotName: string;
  conversationId: string | null;
  visitorId: string;
  createdAt: string;
}

interface IChatbotOption {
  id: string;
  name: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<ILeadItem[]>([]);
  const [total, setTotal] = useState(0);
  const [chatbots, setChatbots] = useState<IChatbotOption[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState("");
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
    const params = new URLSearchParams();
    if (selectedChatbot) params.set("chatbot_id", selectedChatbot);

    fetch(`/api/dashboard/leads?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setLeads(data.leads);
          setTotal(data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedChatbot]);

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function exportCSV(): void {
    const header = "Name,Email,Chatbot,Date,Conversation ID\n";
    const rows = leads
      .map(
        (l) =>
          `"${l.name}","${l.email}","${l.chatbotName}","${formatDate(l.createdAt)}","${l.conversationId ?? ""}"`,
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-white">
            Leads
          </h1>
          <p className="text-sm text-white/40">
            {total} {total === 1 ? "lead" : "leads"} captured from your chatbots
          </p>
        </div>
        {leads.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportCSV}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 text-sm font-medium text-white shadow-lg shadow-purple-500/20"
          >
            <Download className="size-4" />
            Export CSV
          </motion.button>
        )}
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
          <p className="text-white/40">Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-16 backdrop-blur-xl">
          <Users className="size-8 text-white/20" />
          <p className="text-white/40">No leads yet</p>
          <p className="text-xs text-white/25">
            Leads will appear here when visitors fill out the chat form
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                  Name
                </th>
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                  Email
                </th>
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                  Chatbot
                </th>
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                  Date
                </th>
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                  Conversation
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/5"
                >
                  <td className="px-5 py-4 text-white/70">
                    {lead.name || "\u2014"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-white/60">
                      <Mail className="size-3 text-white/30" />
                      {lead.email}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/50">
                      {lead.chatbotName}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/30">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    {lead.conversationId ? (
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/conversations/${lead.conversationId}`,
                          )
                        }
                        className="text-xs text-purple-400 underline-offset-4 hover:underline"
                      >
                        View
                      </button>
                    ) : (
                      <span className="text-xs text-white/20">&mdash;</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
