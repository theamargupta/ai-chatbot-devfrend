import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getAnthropicClient, MODEL, SYSTEM_PROMPT } from "@/lib/ai/utils";

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
  type: "message_start" | "content_delta" | "message_end" | "error";
  content?: string;
}

function encodeSSE(event: ISSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function createErrorResponse(status: number, message: string): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
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

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = getAnthropicClient();

        controller.enqueue(
          encoder.encode(encodeSSE({ type: "message_start" }))
        );

        const messageStream = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
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
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
