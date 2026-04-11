"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Save,
  Copy,
  Check,
  Trash2,
  ArrowLeft,
  Upload,
  Globe,
  FileText,
} from "lucide-react";
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
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !chatbot) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-destructive">{error ?? "Chatbot not found"}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/chatbots")}>
          <ArrowLeft className="size-4" />
          Back to chatbots
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/dashboard/chatbots")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold">{chatbot.name}</h1>
        <Badge variant={chatbot.isActive ? "default" : "secondary"}>
          {chatbot.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <SettingsSection chatbot={chatbot} onUpdate={setChatbot} />
      <BrandingSection chatbot={chatbot} onUpdate={setChatbot} />
      <EmbedSection embedKey={chatbot.embedKey} />
      <KnowledgeSection
        chatbotId={id}
        documents={documents}
        onDocumentsChange={setDocuments}
      />
      <DangerSection chatbotId={id} chatbotName={chatbot.name} />
    </div>
  );
}

// ── Settings Section ──────────────────────────────────────────────

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
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Configure your chatbot&apos;s behavior</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="bot-name">Name</Label>
          <Input
            id="bot-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="system-prompt">System Prompt</Label>
          <Textarea
            id="system-prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            className="resize-y"
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-fit"
        >
          {saved ? (
            <Check className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Saving..." : saved ? "Saved" : "Save settings"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Branding Section ──────────────────────────────────────────────

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
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>Customize the chat widget appearance</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="primary-color"
                type="color"
                value={branding.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="h-8 w-12 cursor-pointer rounded border border-input"
              />
              <Input
                value={branding.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="w-28"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="chat-title">Chat Title</Label>
            <Input
              id="chat-title"
              value={branding.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="welcome-msg">Welcome Message</Label>
            <Input
              id="welcome-msg"
              value={branding.welcomeMessage}
              onChange={(e) => updateField("welcomeMessage", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Position</Label>
            <div className="flex gap-2">
              <Button
                variant={branding.position === "left" ? "default" : "outline"}
                size="sm"
                onClick={() => updateField("position", "left")}
                type="button"
              >
                Left
              </Button>
              <Button
                variant={branding.position === "right" ? "default" : "outline"}
                size="sm"
                onClick={() => updateField("position", "right")}
                type="button"
              >
                Right
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-fit"
          >
            {saved ? (
              <Check className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved" : "Save branding"}
          </Button>
        </div>

        {/* Live preview */}
        <div className="flex flex-col gap-2">
          <Label>Preview</Label>
          <div className="w-72 overflow-hidden rounded-xl border border-border bg-background">
            <div
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: branding.primaryColor }}
            >
              {branding.title}
            </div>
            <div className="flex flex-col gap-2 p-4">
              <div className="max-w-[200px] rounded-lg bg-muted px-3 py-2 text-xs">
                {branding.welcomeMessage}
              </div>
              <div className="self-end rounded-lg px-3 py-2 text-xs text-white" style={{ backgroundColor: branding.primaryColor }}>
                Hello!
              </div>
            </div>
            <div className="border-t px-4 py-2">
              <div className="rounded-md border border-input px-3 py-1.5 text-xs text-muted-foreground">
                Type a message...
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Embed Code Section ────────────────────────────────────────────

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
    <Card>
      <CardHeader>
        <CardTitle>Embed Code</CardTitle>
        <CardDescription>
          Add this snippet to your website to embed the chatbot
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
          <code>{embedCode}</code>
        </pre>
        <Button variant="outline" onClick={handleCopy} className="w-fit">
          {copied ? (
            <Check className="size-4" />
          ) : (
            <Copy className="size-4" />
          )}
          {copied ? "Copied" : "Copy code"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Knowledge Base Section ────────────────────────────────────────

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base</CardTitle>
        <CardDescription>
          Upload content for this chatbot to reference when answering questions
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Tab buttons */}
        <div className="flex gap-2">
          {(["text", "url", "pdf"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab === "text" && <FileText className="size-3" />}
              {tab === "url" && <Globe className="size-3" />}
              {tab === "pdf" && <Upload className="size-3" />}
              {tab.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Text upload */}
        {activeTab === "text" && (
          <form onSubmit={handleTextUpload} className="flex flex-col gap-3">
            <Input
              placeholder="Title"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Paste your content here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={4}
              required
            />
            <Button type="submit" disabled={uploading} className="w-fit">
              {uploading ? "Uploading..." : "Upload text"}
            </Button>
          </form>
        )}

        {/* URL upload */}
        {activeTab === "url" && (
          <form onSubmit={handleUrlUpload} className="flex flex-col gap-3">
            <Input
              type="url"
              placeholder="https://example.com/page"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              required
            />
            <Button type="submit" disabled={uploading} className="w-fit">
              {uploading ? "Fetching..." : "Fetch URL"}
            </Button>
          </form>
        )}

        {/* PDF upload */}
        {activeTab === "pdf" && (
          <div className="flex flex-col gap-3">
            <Input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              disabled={uploading}
            />
            {uploading && (
              <p className="text-sm text-muted-foreground">Processing PDF...</p>
            )}
          </div>
        )}

        {uploadError && (
          <p className="text-sm text-destructive">{uploadError}</p>
        )}

        {/* Document list */}
        {documents.length > 0 && (
          <div className="flex flex-col gap-2 border-t pt-4">
            <Label>Documents ({documents.length})</Label>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{doc.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.type.toUpperCase()} · {doc.chunkCount} chunks
                  </span>
                </div>
                <Badge
                  variant={doc.status === "completed" ? "default" : "secondary"}
                >
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Danger Zone ───────────────────────────────────────────────────

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
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete this chatbot and all its data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="size-4" />
              Delete chatbot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete &ldquo;{chatbotName}&rdquo;?</DialogTitle>
              <DialogDescription>
                This will permanently delete the chatbot, all its documents,
                conversations, and messages. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete permanently"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
