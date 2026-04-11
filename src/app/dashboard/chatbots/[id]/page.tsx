"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save,
  Copy,
  Check,
  Trash2,
  ArrowLeft,
  Upload,
  Globe,
  FileText,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import type { IChatbot, IDocument, IBranding } from "@/types";

export default function ChatbotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [chatbot, setChatbot] = useState<IChatbot | null>(null);
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [botRes, docsRes] = await Promise.all([
          fetch(`/api/dashboard/chatbots/${id}`),
          fetch(`/api/knowledge/documents?chatbot_id=${id}`),
        ]);

        const botData = await botRes.json();
        const docsData = await docsRes.json();

        if (!botData.success) {
          setError("Chatbot not found");
          return;
        }

        setChatbot(botData.chatbot);
        if (docsData.success) setDocuments(docsData.documents);
      } catch {
        setError("Failed to load chatbot");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/40">Loading...</p>
      </div>
    );
  }

  if (error || !chatbot) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-red-400">{error ?? "Chatbot not found"}</p>
        <button
          onClick={() => router.push("/dashboard/chatbots")}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-all duration-200 hover:bg-white/10"
        >
          <ArrowLeft className="size-4" />
          Back to chatbots
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => router.push("/dashboard/chatbots")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-white">
          {chatbot.name}
        </h1>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            chatbot.isActive
              ? "bg-green-500/10 text-green-400"
              : "bg-white/5 text-white/30"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              chatbot.isActive ? "bg-green-400" : "bg-white/30"
            }`}
          />
          {chatbot.isActive ? "Active" : "Inactive"}
        </span>
      </motion.div>

      <EmbedSection embedKey={chatbot.embedKey} />
      <SettingsSection chatbot={chatbot} onUpdate={setChatbot} />
      <BrandingSection chatbot={chatbot} onUpdate={setChatbot} />
      <KnowledgeSection
        chatbotId={id}
        documents={documents}
        onDocumentsChange={setDocuments}
      />
      <DangerSection chatbotId={id} chatbotName={chatbot.name} />
    </div>
  );
}

/* ── Glass Card wrapper ─────────────────────────────────────────── */

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-white/40">{description}</p>
    </div>
  );
}

function GlassInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 ${className}`}
    />
  );
}

function GlassTextarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 ${className}`}
    />
  );
}

function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:shadow-xl disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      className={`inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white ${className}`}
    >
      {children}
    </button>
  );
}

/* ── Settings Section ──────────────────────────────────────────── */

function SettingsSection({
  chatbot,
  onUpdate,
}: {
  chatbot: IChatbot;
  onUpdate: (c: IChatbot) => void;
}) {
  const [name, setName] = useState(chatbot.name);
  const [systemPrompt, setSystemPrompt] = useState(chatbot.systemPrompt);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/dashboard/chatbots/${chatbot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, systemPrompt }),
    });
    const data = await res.json();
    if (data.success) {
      onUpdate(data.chatbot);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <GlassCard>
      <SectionTitle title="Settings" description="Configure your chatbot's behavior" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/60">Name</label>
          <GlassInput value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/60">System Prompt</label>
          <GlassTextarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            className="resize-y"
          />
        </div>
        <PrimaryButton onClick={handleSave} disabled={saving}>
          {saved ? <Check className="size-4" /> : <Save className="size-4" />}
          {saving ? "Saving..." : saved ? "Saved" : "Save settings"}
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}

/* ── Branding Section ──────────────────────────────────────────── */

function BrandingSection({
  chatbot,
  onUpdate,
}: {
  chatbot: IChatbot;
  onUpdate: (c: IChatbot) => void;
}) {
  const [branding, setBranding] = useState<IBranding>(chatbot.branding);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateField<K extends keyof IBranding>(key: K, value: IBranding[K]) {
    setBranding((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/dashboard/chatbots/${chatbot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branding }),
    });
    const data = await res.json();
    if (data.success) {
      onUpdate(data.chatbot);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <GlassCard>
      <SectionTitle title="Branding" description="Customize the chat widget appearance" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/60">Primary Color</label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => updateField("primaryColor", e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-xl border border-white/10 bg-transparent"
                />
                {/* Glow circle */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-50 blur-sm"
                  style={{ backgroundColor: branding.primaryColor }}
                />
              </div>
              <GlassInput
                value={branding.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="w-28"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/60">Chat Title</label>
            <GlassInput
              value={branding.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/60">Welcome Message</label>
            <GlassInput
              value={branding.welcomeMessage}
              onChange={(e) => updateField("welcomeMessage", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/60">Position</label>
            <div className="flex gap-2">
              {(["left", "right"] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => updateField("position", pos)}
                  className={`h-9 rounded-xl px-4 text-sm font-medium transition-all duration-200 ${
                    branding.position === pos
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "border border-white/10 bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <label className="text-sm font-medium text-white/60">Widget Features</label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/50">
              <input
                type="checkbox"
                checked={branding.collectLead !== false}
                onChange={(e) => updateField("collectLead", e.target.checked)}
                className="size-4 rounded border-white/20 bg-white/5 accent-purple-500"
              />
              Collect leads (show email form before chat)
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/50">
              <input
                type="checkbox"
                checked={branding.showEscalation !== false}
                onChange={(e) => updateField("showEscalation", e.target.checked)}
                className="size-4 rounded border-white/20 bg-white/5 accent-purple-500"
              />
              Show &ldquo;Talk to a human&rdquo; escalation button
            </label>
          </div>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {saving ? "Saving..." : saved ? "Saved" : "Save branding"}
          </PrimaryButton>
        </div>

        {/* Live preview */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/60">Preview</label>
          <div className="w-72 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <div
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: branding.primaryColor }}
            >
              {branding.title}
            </div>
            <div className="flex flex-col gap-2 p-4">
              <div className="max-w-[200px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                {branding.welcomeMessage}
              </div>
              <div
                className="self-end rounded-xl px-3 py-2 text-xs text-white"
                style={{ backgroundColor: branding.primaryColor }}
              >
                Hello!
              </div>
            </div>
            <div className="border-t border-white/10 px-4 py-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/30">
                Type a message...
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── Embed Code Section ────────────────────────────────────────── */

function EmbedSection({ embedKey }: { embedKey: string }) {
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const embedCode = `<script\n  src="${origin}/widget.js"\n  data-embed-key="${embedKey}"\n  data-api-url="${origin}">\n<\/script>`;

  function handleCopy() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <GlassCard>
      <SectionTitle
        title="Embed Code"
        description="Add this snippet to your website to embed the chatbot"
      />
      <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed">
        <code className="text-purple-300">{embedCode}</code>
      </pre>
      <div className="mt-4 flex flex-wrap gap-2">
        <SecondaryButton onClick={handleCopy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy code"}
        </SecondaryButton>
        <SecondaryButton
          onClick={() =>
            window.open(`/test-widget?embed_key=${embedKey}`, "_blank")
          }
        >
          <ExternalLink className="size-4" />
          Test Widget
        </SecondaryButton>
        <Link
          href="/demo"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white"
        >
          <MessageCircle className="size-4" />
          Open Demo Chat
        </Link>
      </div>
    </GlassCard>
  );
}

/* ── Knowledge Base Section ────────────────────────────────────── */

function KnowledgeSection({
  chatbotId,
  documents,
  onDocumentsChange,
}: {
  chatbotId: string;
  documents: IDocument[];
  onDocumentsChange: (docs: IDocument[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [activeTab, setActiveTab] = useState<"text" | "url" | "pdf">("text");

  async function handleTextUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);

    try {
      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "text",
          title: textTitle,
          content: textContent,
          chatbotId,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setUploadError(data.error);
        return;
      }
      onDocumentsChange([data.document, ...documents]);
      setTextTitle("");
      setTextContent("");
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleUrlUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);

    try {
      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "url", url: urlValue, chatbotId }),
      });
      const data = await res.json();
      if (!data.success) {
        setUploadError(data.error);
        return;
      }
      onDocumentsChange([data.document, ...documents]);
      setUrlValue("");
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "pdf");
      formData.append("chatbotId", chatbotId);

      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        setUploadError(data.error);
        return;
      }
      onDocumentsChange([data.document, ...documents]);
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const statusColor: Record<string, string> = {
    completed: "bg-green-400",
    processing: "bg-amber-400",
    failed: "bg-red-400",
  };

  return (
    <GlassCard>
      <SectionTitle
        title="Knowledge Base"
        description="Upload content for this chatbot to reference when answering questions"
      />
      <div className="flex flex-col gap-4">
        {/* Tab buttons */}
        <div className="flex gap-2">
          {(["text", "url", "pdf"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "border border-white/10 bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {tab === "text" && <FileText className="size-3" />}
              {tab === "url" && <Globe className="size-3" />}
              {tab === "pdf" && <Upload className="size-3" />}
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Text upload */}
        {activeTab === "text" && (
          <form onSubmit={handleTextUpload} className="flex flex-col gap-3">
            <GlassInput
              placeholder="Title"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              required
            />
            <GlassTextarea
              placeholder="Paste your content here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={4}
              required
            />
            <PrimaryButton type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload text"}
            </PrimaryButton>
          </form>
        )}

        {/* URL upload */}
        {activeTab === "url" && (
          <form onSubmit={handleUrlUpload} className="flex flex-col gap-3">
            <GlassInput
              type="url"
              placeholder="https://example.com/page"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              required
            />
            <PrimaryButton type="submit" disabled={uploading}>
              {uploading ? "Fetching..." : "Fetch URL"}
            </PrimaryButton>
          </form>
        )}

        {/* PDF upload */}
        {activeTab === "pdf" && (
          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] py-8 transition-colors hover:border-white/30 hover:bg-white/5">
              <Upload className="size-8 text-white/20" />
              <span className="text-sm text-white/40">
                {uploading ? "Processing PDF..." : "Click to upload PDF"}
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        )}

        {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}

        {/* Document list */}
        {documents.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
            <label className="text-sm font-medium text-white/60">
              Documents ({documents.length})
            </label>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/5"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {doc.title}
                  </span>
                  <span className="text-xs text-white/30">
                    {doc.type.toUpperCase()} &middot; {doc.chunkCount} chunks
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-white/40">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusColor[doc.status] ?? "bg-white/30"}`}
                  />
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/* ── Danger Zone ───────────────────────────────────────────────── */

function DangerSection({
  chatbotId,
  chatbotName,
}: {
  chatbotId: string;
  chatbotName: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/dashboard/chatbots/${chatbotId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      router.push("/dashboard/chatbots");
    }
    setDeleting(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl"
    >
      <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
      <p className="mt-1 text-sm text-white/40">
        Permanently delete this chatbot and all its data
      </p>

      <button
        onClick={() => setDialogOpen(true)}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-red-500/10 px-5 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/20"
      >
        <Trash2 className="size-4" />
        Delete chatbot
      </button>

      {/* Delete confirm dialog */}
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
            <h3 className="text-lg font-semibold text-white">
              Delete &ldquo;{chatbotName}&rdquo;?
            </h3>
            <p className="mt-2 text-sm text-white/40">
              This will permanently delete the chatbot, all its documents,
              conversations, and messages. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <SecondaryButton onClick={() => setDialogOpen(false)}>
                Cancel
              </SecondaryButton>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-500/20 px-5 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/30 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
