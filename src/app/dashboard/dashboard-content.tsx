"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import { MessageSquare, FileText, MessagesSquare, Plus, Users, Upload, Eye } from "lucide-react";

interface IDashboardContentProps {
  email: string;
}

interface IStats {
  chatbots: number;
  documents: number;
  conversations: number;
  leads: number;
}

/* ---- Animated counter ---- */

function AnimatedStat({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration: 1.2, ease: "easeOut" });
    }
  }, [isInView, count, value]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
    return unsubscribe;
  }, [rounded]);

  return <span ref={ref}>0</span>;
}

/* ---- Main ---- */

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
      icon: <MessageSquare className="size-5" />,
      gradient: "from-purple-500 to-violet-500",
    },
    {
      title: "Documents",
      value: stats.documents,
      description: "Knowledge base docs",
      icon: <FileText className="size-5" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Conversations",
      value: stats.conversations,
      description: "All-time conversations",
      icon: <MessagesSquare className="size-5" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Leads",
      value: stats.leads,
      description: "Captured from widget",
      icon: <Users className="size-5" />,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  const quickActions = [
    {
      title: "Create Chatbot",
      description: "Set up a new AI assistant",
      icon: <Plus className="size-5" />,
      href: "/dashboard/chatbots",
    },
    {
      title: "Upload Content",
      description: "Add knowledge base documents",
      icon: <Upload className="size-5" />,
      href: "/dashboard/chatbots",
    },
    {
      title: "View Conversations",
      description: "Review chat transcripts",
      icon: <Eye className="size-5" />,
      href: "/dashboard/conversations",
    },
  ];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-white">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-white/40">
          {email} &middot; {today}
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
          >
            <div
              className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white opacity-80`}
            >
              {stat.icon}
            </div>
            <p className="text-3xl font-bold tracking-tight text-white">
              <AnimatedStat value={stat.value} />
            </p>
            <p className="mt-1 text-sm text-white/40">{stat.title}</p>
            <p className="mt-0.5 text-xs text-white/25">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/30">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(action.href)}
              className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60">
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {action.title}
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  {action.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
