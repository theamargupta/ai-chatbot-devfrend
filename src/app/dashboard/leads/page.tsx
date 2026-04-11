"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Download, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

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
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "lead" : "leads"} captured from your chatbots
          </p>
        </div>
        {leads.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="size-4" />
            Export CSV
          </Button>
        )}
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
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Users className="size-8 text-muted-foreground" />
            <p className="text-muted-foreground">No leads yet</p>
            <p className="text-xs text-muted-foreground">
              Leads will appear here when visitors fill out the chat form
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Chatbot
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Conversation
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">{lead.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3 text-muted-foreground" />
                      {lead.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{lead.chatbotName}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {lead.conversationId ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() =>
                          router.push(
                            `/dashboard/conversations/${lead.conversationId}`,
                          )
                        }
                      >
                        View
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
