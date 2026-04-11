"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Loader2 } from "lucide-react";

interface IBusiness {
  id: string;
  name: string;
  plan: string;
}

export default function SettingsPage() {
  const [business, setBusiness] = useState<IBusiness | null>(null);
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/business")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.business) {
          setBusiness(data.business);
          setBusinessName(data.business.name);
        }
      })
      .finally(() => setLoading(false));

    import("@/lib/supabase-browser").then(({ getSupabaseBrowser }) => {
      const supabase = getSupabaseBrowser();
      supabase.auth.getUser().then(({ data }) => {
        setEmail(data.user?.email ?? "");
      });
    });
  }, []);

  async function handleSave() {
    if (!business || businessName.trim() === business.name) return;

    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/dashboard/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: businessName.trim() }),
    });

    const data = await res.json();

    if (data.success) {
      setBusiness({ ...business, name: businessName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    setSaving(false);
  }

  const planColors: Record<string, string> = {
    pro: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    enterprise: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    free: "bg-white/5 text-white/50 border-white/10",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/40">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-white">
          Settings
        </h1>
        <p className="text-sm text-white/40">
          Manage your account and business settings
        </p>
      </div>

      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center gap-2">
          <Settings className="size-4 text-white/40" />
          <h2 className="text-lg font-semibold text-white">Account</h2>
        </div>
        <p className="mb-1 text-sm text-white/40">Your account details</p>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/60">Email</label>
            <input
              value={email}
              disabled
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white/40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/60">Plan</label>
            <div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                  planColors[business?.plan ?? "free"] ?? planColors.free
                }`}
              >
                {(business?.plan ?? "free").toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Business */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
        <h2 className="text-lg font-semibold text-white">Business</h2>
        <p className="mt-1 text-sm text-white/40">
          Your business name appears in chatbot conversations
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/60">
              Business name
            </label>
            <input
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                setSaved(false);
              }}
              placeholder="My Business"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={
                saving ||
                !businessName.trim() ||
                businessName.trim() === business?.name
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:shadow-xl disabled:opacity-50"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save
            </button>
            {saved && (
              <span className="text-sm text-green-400">Saved!</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
