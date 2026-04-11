"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useKnowledge } from "@/hooks/useKnowledge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IDocument } from "@/types";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  FileText,
  Globe,
  FileUp,
  Upload,
  Loader2,
  Code,
  Check,
  Copy,
} from "lucide-react";

const STATUS_VARIANT: Record<
  IDocument["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  processing: "secondary",
  completed: "default",
  failed: "destructive",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function KnowledgePage() {
  const {
    documents,
    isLoading,
    isUploading,
    error,
    uploadText,
    uploadUrl,
    uploadPdf,
    clearError,
  } = useKnowledge();

  // Text form state
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  // URL form state
  const [urlValue, setUrlValue] = useState("");

  // PDF form state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Widget embed config state
  const [widgetTitle, setWidgetTitle] = useState("Chat with us");
  const [widgetWelcome, setWidgetWelcome] = useState(
    "Hi! How can I help you today?",
  );
  const [widgetColor, setWidgetColor] = useState("#2563eb");
  const [widgetPosition, setWidgetPosition] = useState<"left" | "right">(
    "right",
  );
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://your-domain.vercel.app";

  const embedCode = `<script
  src="${origin}/widget.js"
  data-api-url="${origin}"
  data-primary-color="${widgetColor}"
  data-title="${widgetTitle}"
  data-welcome-message="${widgetWelcome}"
  data-position="${widgetPosition}">
</script>`;

  function handleCopyEmbed() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleTextSubmit() {
    if (!textTitle.trim() || !textContent.trim()) return;
    await uploadText(textTitle.trim(), textContent.trim());
    setTextTitle("");
    setTextContent("");
  }

  async function handleUrlSubmit() {
    if (!urlValue.trim()) return;
    await uploadUrl(urlValue.trim());
    setUrlValue("");
  }

  async function handlePdfSubmit() {
    if (!pdfFile) return;
    await uploadPdf(pdfFile);
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileSelect(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      return;
    }
    setPdfFile(file);
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center bg-background">
      <div className="flex w-full max-w-3xl flex-1 flex-col max-md:px-0">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="size-4 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight">
              Knowledge Base
            </h1>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-3.5" />
              Back to Chat
            </Button>
          </Link>
        </header>

        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Testing Banner */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            This page is for quick testing. For production, manage knowledge
            from your{" "}
            <Link href="/dashboard/chatbots" className="font-medium underline underline-offset-2">
              Dashboard &rarr; Chatbots &rarr; Knowledge Base
            </Link>
            .
          </div>

          {/* Page Title */}
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Knowledge Base
            </h2>
            <p className="text-sm text-muted-foreground">
              Upload content to train your chatbot
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-2 text-xs font-medium underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Processing Banner */}
          {isUploading && (
            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
              <Loader2 className="size-4 animate-spin shrink-0" />
              <span>
                Uploading and processing document — chunking text and generating
                embeddings. This may take up to 30 seconds...
              </span>
            </div>
          )}

          {/* Upload Tabs */}
          <Tabs defaultValue="text">
            <TabsList className="w-full">
              <TabsTrigger value="text" className="flex-1">
                <FileText className="size-3.5" />
                Text
              </TabsTrigger>
              <TabsTrigger value="url" className="flex-1">
                <Globe className="size-3.5" />
                URL
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex-1">
                <FileUp className="size-3.5" />
                PDF
              </TabsTrigger>
            </TabsList>

            {/* Text Tab */}
            <TabsContent value="text">
              <Card>
                <CardHeader>
                  <CardTitle>Paste Text Content</CardTitle>
                  <CardDescription>
                    Add text content directly. Great for FAQs, documentation, or
                    any text-based knowledge.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Input
                    placeholder="Document title"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    disabled={isUploading}
                  />
                  <Textarea
                    placeholder="Paste your content here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="min-h-32"
                    disabled={isUploading}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {textContent.length.toLocaleString()} / 100,000 characters
                    </span>
                    <Button
                      onClick={handleTextSubmit}
                      disabled={
                        isUploading ||
                        !textTitle.trim() ||
                        !textContent.trim()
                      }
                    >
                      {isUploading ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      Process
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* URL Tab */}
            <TabsContent value="url">
              <Card>
                <CardHeader>
                  <CardTitle>Import from URL</CardTitle>
                  <CardDescription>
                    Paste a website URL and we'll extract the text content
                    automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Input
                    type="url"
                    placeholder="https://example.com/docs/getting-started"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    disabled={isUploading}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleUrlSubmit}
                      disabled={isUploading || !urlValue.trim()}
                    >
                      {isUploading ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Globe className="size-3.5" />
                      )}
                      Process
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PDF Tab */}
            <TabsContent value="pdf">
              <Card>
                <CardHeader>
                  <CardTitle>Upload PDF</CardTitle>
                  <CardDescription>
                    Drag and drop a PDF file or click to browse. Maximum 10MB.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <FileUp className="size-8 text-muted-foreground" />
                    {pdfFile ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium">
                          {pdfFile.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium">
                          Drop a PDF here or click to browse
                        </span>
                        <span className="text-xs text-muted-foreground">
                          PDF files only, up to 10MB
                        </span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handlePdfSubmit}
                      disabled={isUploading || !pdfFile}
                    >
                      {isUploading ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      Process
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Documents List */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Uploaded Documents</h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="size-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No documents yet. Upload content above to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {documents.map((doc) => (
                  <Card key={doc.id} size="sm">
                    <CardContent className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                          {doc.type === "pdf" && (
                            <FileUp className="size-3.5 text-muted-foreground" />
                          )}
                          {doc.type === "url" && (
                            <Globe className="size-3.5 text-muted-foreground" />
                          )}
                          {doc.type === "text" && (
                            <FileText className="size-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {doc.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.chunkCount} chunks &middot;{" "}
                            {formatDate(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={STATUS_VARIANT[doc.status]}>
                        {doc.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Embed Widget */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Code className="size-4" />
              Embed Widget
            </h3>

            <Card>
              <CardHeader>
                <CardTitle>Widget Configuration</CardTitle>
                <CardDescription>
                  Customize and copy the embed code to add the chat widget to
                  your website.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="widget-title">Title</Label>
                  <Input
                    id="widget-title"
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                    placeholder="Chat with us"
                  />
                </div>

                {/* Welcome message */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="widget-welcome">Welcome Message</Label>
                  <Input
                    id="widget-welcome"
                    value={widgetWelcome}
                    onChange={(e) => setWidgetWelcome(e.target.value)}
                    placeholder="Hi! How can I help you today?"
                  />
                </div>

                {/* Primary color */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="widget-color">Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="widget-color"
                      type="color"
                      value={widgetColor}
                      onChange={(e) => setWidgetColor(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">
                      {widgetColor}
                    </span>
                  </div>
                </div>

                {/* Position */}
                <div className="flex flex-col gap-1.5">
                  <Label>Position</Label>
                  <div className="flex gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="widget-position"
                        value="left"
                        checked={widgetPosition === "left"}
                        onChange={() => setWidgetPosition("left")}
                        className="accent-primary"
                      />
                      Left
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="widget-position"
                        value="right"
                        checked={widgetPosition === "right"}
                        onChange={() => setWidgetPosition("right")}
                        className="accent-primary"
                      />
                      Right
                    </label>
                  </div>
                </div>

                {/* Generated code */}
                <div className="flex flex-col gap-1.5">
                  <Label>Embed Code</Label>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs leading-relaxed">
                    <code>{embedCode}</code>
                  </pre>
                </div>

                {/* Copy button */}
                <div className="flex justify-end">
                  <Button onClick={handleCopyEmbed} variant="outline" size="sm">
                    {copied ? (
                      <>
                        <Check className="size-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
