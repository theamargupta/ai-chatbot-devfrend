"use client";

import { useState, useEffect, useCallback } from "react";
import type { IDocument } from "@/types";

interface IUploadError {
  message: string;
}

export function useKnowledge() {
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/knowledge/documents");
      const data = (await res.json()) as
        | { success: true; documents: IDocument[] }
        | { success: false; error: string };

      if (!data.success) {
        setError(data.error);
        return;
      }

      setDocuments(data.documents);
    } catch {
      setError("Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  async function uploadText(title: string, content: string) {
    setIsUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", title, content }),
      });
      const data = (await res.json()) as
        | { success: true; document: IDocument }
        | { success: false; error: string };

      if (!data.success) {
        setError(data.error);
        return;
      }

      setDocuments((prev) => [data.document, ...prev]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload text";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadUrl(url: string) {
    setIsUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "url", url }),
      });
      const data = (await res.json()) as
        | { success: true; document: IDocument }
        | { success: false; error: string };

      if (!data.success) {
        setError(data.error);
        return;
      }

      setDocuments((prev) => [data.document, ...prev]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload URL";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadPdf(file: File) {
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "pdf");

      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as
        | { success: true; document: IDocument }
        | { success: false; error: string };

      if (!data.success) {
        setError(data.error);
        return;
      }

      setDocuments((prev) => [data.document, ...prev]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload PDF";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  return {
    documents,
    isLoading,
    isUploading,
    error,
    fetchDocuments,
    uploadText,
    uploadUrl,
    uploadPdf,
    clearError,
  };
}
