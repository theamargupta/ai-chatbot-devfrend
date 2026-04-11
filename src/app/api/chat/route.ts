import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getAnthropicClient, MODEL, buildSystemPrompt } from "@/lib/ai/utils";
import { getSupabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// CORS — widget runs on a different origin
// ---------------------------------------------------------------------------

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Visitor-ID",
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
      }),
    )
    .min(1, "Messages array must have at least 1 message"),
  embedKey: z.string().optional(),
  chatbotId: z.string().uuid().optional(),
});

interface ISSEEvent {
  type:
    | "message_start"
    | "content_delta"
    | "message_end"
    | "error"
    | "context_used";
  content?: string;
  chunkCount?: number;
}

function encodeSSE(event: ISSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function createErrorResponse(status: number, message: string): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: corsHeaders },
  );
}

interface IMatchedChunk {
  id: string;
  content: string;
  similarity: number;
}

interface IChatbotRow {
  id: string;
  system_prompt: string | null;
  is_active: boolean;
}

async function retrieveContext(
  query: string,
  chatbotId?: string,
): Promise<string[]> {
  try {
    const supabase = getSupabaseAdmin();

    let docQuery = supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed");

    if (chatbotId) {
      docQuery = docQuery.eq("chatbot_id", chatbotId);
    }

    const { count } = await docQuery;

    if (!count || count === 0) {
      return [];
    }

    // Dynamic import to avoid module-level crash from @xenova/transformers
    const embeddings = await import("@/lib/ai/embeddings").catch(() => null);
    if (!embeddings) {
      console.warn("[rag] Embeddings module unavailable — skipping RAG");
      return [];
    }

    const queryEmbedding = await embeddings.generateEmbedding(query);
    if (!queryEmbedding) {
      console.warn("[rag] Embedding generation returned null — skipping RAG");
      return [];
    }

    const rpcParams: Record<string, unknown> = {
      query_embedding: queryEmbedding,
      match_count: 5,
      match_threshold: 0.3,
    };

    if (chatbotId) {
      rpcParams.filter_chatbot_id = chatbotId;
    }

    const { data, error } = await supabase.rpc("match_chunks", rpcParams);

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
    console.error(
      "[rag] Context retrieval failed:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

// ---------------------------------------------------------------------------
// Conversation helpers
// ---------------------------------------------------------------------------

async function resolveChatbot(
  embedKey?: string,
  chatbotId?: string,
): Promise<IChatbotRow | null> {
  if (!embedKey && !chatbotId) return null;

  const supabase = getSupabaseAdmin();

  if (embedKey) {
    const { data } = await supabase
      .from("chatbots")
      .select("id, system_prompt, is_active")
      .eq("embed_key", embedKey)
      .single();
    return (data as IChatbotRow | null) ?? null;
  }

  if (chatbotId) {
    const { data } = await supabase
      .from("chatbots")
      .select("id, system_prompt, is_active")
      .eq("id", chatbotId)
      .single();
    return (data as IChatbotRow | null) ?? null;
  }

  return null;
}

async function getOrCreateConversation(
  chatbotId: string,
  visitorId: string,
): Promise<string> {
  const supabase = getSupabaseAdmin();

  // Look for existing active conversation
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("chatbot_id", chatbotId)
    .eq("visitor_id", visitorId)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return existing.id as string;
  }

  // Create new conversation
  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ chatbot_id: chatbotId, visitor_id: visitorId })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error("Failed to create conversation");
  }

  return created.id as string;
}

async function storeMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  contextChunks: number = 0,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
    context_chunks: contextChunks,
  });

  // Update last_message_at on conversation
  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse(400, "Invalid JSON body");
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return createErrorResponse(
      400,
      parsed.error.issues.map((i) => i.message).join(", "),
    );
  }

  const { messages, embedKey, chatbotId: requestChatbotId } = parsed.data;
  const visitorId = req.headers.get("X-Visitor-ID") ?? "anonymous";

  // Rate limit by visitor (skip for anonymous/direct usage)
  if (visitorId !== "anonymous") {
    const { allowed } = checkRateLimit(`chat:${visitorId}`, 20, 60 * 1000);
    if (!allowed) {
      return createErrorResponse(
        429,
        "Too many messages. Please wait a moment.",
      );
    }
  }

  // Resolve chatbot (if widget or scoped request)
  const chatbot = await resolveChatbot(embedKey, requestChatbotId);

  if (embedKey && !chatbot) {
    return createErrorResponse(404, "Chatbot not found");
  }

  if (chatbot && !chatbot.is_active) {
    return createErrorResponse(403, "Chatbot is currently inactive");
  }

  const effectiveChatbotId = chatbot?.id;

  // Get or create conversation (only if we have a chatbot)
  let conversationId: string | null = null;
  if (effectiveChatbotId) {
    try {
      conversationId = await getOrCreateConversation(
        effectiveChatbotId,
        visitorId,
      );

      // Store the user message
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === "user");
      if (lastUserMessage) {
        await storeMessage(conversationId, "user", lastUserMessage.content);
      }
    } catch (err) {
      console.error("[chat] Conversation error:", err);
      // Non-fatal — continue with chat even if DB write fails
    }
  }

  const encoder = new TextEncoder();

  // Get the latest user message for RAG query
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  const ragQuery = lastUserMessage?.content ?? "";

  // Retrieve context chunks (scoped to chatbot if available)
  const contextChunks = ragQuery
    ? await retrieveContext(ragQuery, effectiveChatbotId)
    : [];

  // Use chatbot's custom system prompt if set
  const basePrompt = chatbot?.system_prompt ?? undefined;
  const systemPrompt =
    contextChunks.length > 0
      ? buildSystemPrompt(contextChunks, basePrompt)
      : basePrompt ?? buildSystemPrompt();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = getAnthropicClient();

        // Send context_used event before streaming starts
        if (contextChunks.length > 0) {
          controller.enqueue(
            encoder.encode(
              encodeSSE({
                type: "context_used",
                chunkCount: contextChunks.length,
              }),
            ),
          );
        }

        controller.enqueue(
          encoder.encode(encodeSSE({ type: "message_start" })),
        );

        const messageStream = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        });

        let fullResponse = "";

        messageStream.on("text", (text) => {
          fullResponse += text;
          controller.enqueue(
            encoder.encode(
              encodeSSE({ type: "content_delta", content: text }),
            ),
          );
        });

        await messageStream.finalMessage();

        // Store the assistant response in DB
        if (conversationId && fullResponse) {
          storeMessage(
            conversationId,
            "assistant",
            fullResponse,
            contextChunks.length,
          ).catch((err) =>
            console.error("[chat] Failed to store assistant message:", err),
          );
        }

        controller.enqueue(
          encoder.encode(encodeSSE({ type: "message_end" })),
        );
        controller.close();
      } catch (error) {
        const errorEvent = encodeSSE({
          type: "error",
          content:
            error instanceof Error ? error.message : "Unknown error",
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
