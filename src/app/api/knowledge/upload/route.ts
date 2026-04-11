import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { processDocument } from "@/lib/ai/process-document";

const MAX_TEXT_LENGTH = 100_000;
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const URL_FETCH_TIMEOUT = 10_000; // 10s

const textSchema = z.object({
  type: z.literal("text"),
  title: z.string().min(1, "Title is required").max(200),
  content: z
    .string()
    .min(1, "Content is required")
    .max(MAX_TEXT_LENGTH, `Content must be under ${MAX_TEXT_LENGTH} characters`),
});

const urlSchema = z.object({
  type: z.literal("url"),
  url: z.string().url("Must be a valid URL"),
});

function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : "Untitled Page";
}

async function fetchUrlContent(
  url: string,
): Promise<{ title: string; content: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DevfrendBot/1.0; +https://devfrend.com)",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    const title = extractTitle(html);
    const content = stripHtmlTags(html);

    if (!content) {
      throw new Error("No text content could be extracted from the URL");
    }

    return { title, content: content.slice(0, MAX_TEXT_LENGTH) };
  } finally {
    clearTimeout(timeout);
  }
}

async function extractPdfText(
  buffer: Buffer,
): Promise<{ text: string; numPages: number }> {
  // Dynamic import to keep pdf-parse server-only
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();
  return { text: result.text, numPages: result.total };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    let type: string;
    let title: string;
    let content: string;
    let source: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // PDF upload
      const formData = await request.formData();
      const file = formData.get("file");
      const formType = formData.get("type");

      if (formType !== "pdf" || !(file instanceof File)) {
        return NextResponse.json(
          { success: false, error: "Invalid PDF upload" },
          { status: 400 },
        );
      }

      if (file.size > MAX_PDF_SIZE) {
        return NextResponse.json(
          { success: false, error: "PDF must be under 10MB" },
          { status: 400 },
        );
      }

      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { success: false, error: "File must be a PDF" },
          { status: 400 },
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { text, numPages } = await extractPdfText(buffer);

      if (!text.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "No text could be extracted from the PDF",
          },
          { status: 400 },
        );
      }

      type = "pdf";
      title = file.name.replace(/\.pdf$/i, "");
      content = text.slice(0, MAX_TEXT_LENGTH);
      source = file.name;
    } else {
      // JSON body — text or url
      const body: unknown = await request.json();

      // Try text schema first
      const textResult = textSchema.safeParse(body);
      if (textResult.success) {
        type = "text";
        title = textResult.data.title;
        content = textResult.data.content;
      } else {
        // Try url schema
        const urlResult = urlSchema.safeParse(body);
        if (urlResult.success) {
          const fetched = await fetchUrlContent(urlResult.data.url);
          type = "url";
          title = fetched.title;
          content = fetched.content;
          source = urlResult.data.url;
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid request. Provide text (title + content) or a valid URL.",
            },
            { status: 400 },
          );
        }
      }
    }

    const supabase = getSupabaseAdmin();

    const { data: document, error: dbError } = await supabase
      .from("documents")
      .insert({
        title,
        type,
        source,
        raw_content: content,
        status: "pending",
        chunk_count: 0,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save document" },
        { status: 500 },
      );
    }

    // Process document: chunk + embed + store
    let chunkCount = 0;
    let finalStatus: string = document.status;

    try {
      chunkCount = await processDocument(document.id);
      finalStatus = "completed";
    } catch (processErr) {
      console.error("Document processing failed:", processErr);
      finalStatus = "failed";
    }

    const mapped = {
      id: document.id,
      title: document.title,
      type: document.type,
      source: document.source,
      rawContent: document.raw_content,
      status: finalStatus,
      chunkCount,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    };

    return NextResponse.json({ success: true, document: mapped });
  } catch (err) {
    console.error("Knowledge upload error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
