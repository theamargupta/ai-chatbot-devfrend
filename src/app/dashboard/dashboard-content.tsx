"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, FileText, MessagesSquare, Plus, Users } from "lucide-react";

interface IDashboardContentProps {
  email: string;
}

interface IStats {
  chatbots: number;
  documents: number;
  conversations: number;
  leads: number;
}

export function DashboardContent({ email }: IDashboardContentProps) {
  const router = useRouter();
  const [stats, setStats] = useState<IStats>({
    chatbots: 0,
    documents: 0,
    conversations: 0,
    leads: 0,
  });

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      });
  }, []);

  const statCards = [
    {
      title: "Total Chatbots",
      value: stats.chatbots,
      description: "Active chatbots",
      icon: <MessageSquare className="size-4 text-muted-foreground" />,
    },
    {
      title: "Total Documents",
      value: stats.documents,
      description: "Knowledge base documents",
      icon: <FileText className="size-4 text-muted-foreground" />,
    },
    {
      title: "Total Conversations",
      value: stats.conversations,
      description: "All-time conversations",
      icon: <MessagesSquare className="size-4 text-muted-foreground" />,
    },
    {
      title: "Total Leads",
      value: stats.leads,
      description: "Captured from chat widget",
      icon: <Users className="size-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                {stat.icon}
                {stat.title}
              </CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Button onClick={() => router.push("/dashboard/chatbots")}>
          <Plus className="size-4" />
          Create Chatbot
        </Button>
      </div>
    </div>
  );
}
