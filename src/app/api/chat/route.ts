import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getAnthropicClient, MODEL, buildSystemPrompt } from "@/lib/ai/utils";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { getSupabaseAdmin } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// CORS — widget runs on a different origin
// ---------------------------------------------------------------------------

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*', // TODO: restrict to allowed origins
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Visitor-ID',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .min(1, "Messages array must have at least 1 message"),
});

interface ISSEEvent {
  type: "message_start" | "content_delta" | "message_end" | "error" | "context_used";
  content?: string;
  chunkCount?: number;
}

function encodeSSE(event: ISSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function createErrorResponse(status: number, message: string): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: corsHeaders }
  );
}

interface IMatchedChunk {
  id: string;
  content: string;
  similarity: number;
}

async function retrieveContext(query: string): Promise<string[]> {
  try {
    const supabase = getSupabaseAdmin();

    // Check if any documents exist before generating embeddings
    const { count } = await supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed");

    if (!count || count === 0) {
      return [];
    }

    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc("match_chunks", {
      query_embedding: queryEmbedding,
      match_count: 5,
      match_threshold: 0.3,
    });

    if (error) {
      console.error("[rag] Supabase RPC error:", error.message);
      return [];
    }

    const chunks = data as IMatchedChunk[] | null;
    if (!chunks || chunks.length === 0) {
      return [];
    }

    return chunks.map((chunk) => chunk.content);
  } catch (err) {
    console.error("[rag] Context retrieval failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse(400, "Invalid JSON body");
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return createErrorResponse(400, parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { messages } = parsed.data;
  const encoder = new TextEncoder();

  // Get the latest user message for RAG query
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const ragQuery = lastUserMessage?.content ?? "";

  // Retrieve context chunks
  const contextChunks = ragQuery ? await retrieveContext(ragQuery) : [];
  const systemPrompt = buildSystemPrompt(contextChunks.length > 0 ? contextChunks : undefined);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = getAnthropicClient();

        // Send context_used event before streaming starts
        if (contextChunks.length > 0) {
          controller.enqueue(
            encoder.encode(encodeSSE({ type: "context_used", chunkCount: contextChunks.length }))
          );
        }

        controller.enqueue(
          encoder.encode(encodeSSE({ type: "message_start" }))
        );

        const messageStream = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        });

        messageStream.on("text", (text) => {
          controller.enqueue(
            encoder.encode(encodeSSE({ type: "content_delta", content: text }))
          );
        });

        await messageStream.finalMessage();

        controller.enqueue(
          encoder.encode(encodeSSE({ type: "message_end" }))
        );
        controller.close();
      } catch (error) {
        const errorEvent = encodeSSE({
          type: "error",
          content: error instanceof Error ? error.message : "Unknown error",
        });
        controller.enqueue(encoder.encode(errorEvent));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
