import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
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

const escalateSchema = z.object({
  embedKey: z.string(),
  conversationId: z.string().uuid().optional(),
  visitorId: z.string(),
  lead: z
    .object({
      name: z.string(),
      email: z.string().email(),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createErrorResponse(status: number, message: string): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: corsHeaders },
  );
}

interface IChatbotWithBusiness {
  id: string;
  name: string;
  business_id: string;
  businesses: { owner_id: string } | null;
}

async function sendEscalationEmail(
  ownerEmail: string,
  chatbotName: string,
  leadName: string | undefined,
  leadEmail: string | undefined,
  recentMessages: { role: string; content: string }[],
  conversationId: string | undefined,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      "[escalate] RESEND_API_KEY not configured — skipping email notification",
    );
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const messageSummary = recentMessages
    .map((m) => `${m.role === "user" ? "Visitor" : "Bot"}: ${m.content}`)
    .join("\n\n");

  const body = [
    `A visitor has requested to talk to a human on your chatbot "${chatbotName}".`,
    "",
    leadName ? `Name: ${leadName}` : null,
    leadEmail ? `Email: ${leadEmail}` : null,
    "",
    "--- Recent messages ---",
    messageSummary || "(no messages)",
    "",
    conversationId
      ? `View conversation: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : ""}Dashboard > Conversations > ${conversationId}`
      : "",
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    await resend.emails.send({
      from: "Devfrend Chat <onboarding@resend.dev>",
      to: ownerEmail,
      subject: `New escalation request — ${chatbotName}`,
      text: body,
    });
  } catch (err) {
    console.error(
      "[escalate] Failed to send email:",
      err instanceof Error ? err.message : err,
    );
  }
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

  const parsed = escalateSchema.safeParse(body);
  if (!parsed.success) {
    return createErrorResponse(
      400,
      parsed.error.issues.map((i) => i.message).join(", "),
    );
  }

  const { embedKey, conversationId, visitorId, lead } = parsed.data;

  // Rate limit escalation: max 3 per hour per visitor
  const { allowed } = checkRateLimit(
    `escalate:${visitorId}`,
    3,
    60 * 60 * 1000,
  );
  if (!allowed) {
    return createErrorResponse(429, "Too many escalation requests. Please wait.");
  }

  const supabase = getSupabaseAdmin();

  // Look up chatbot + business
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("id, name, business_id, businesses(owner_id)")
    .eq("embed_key", embedKey)
    .single();

  if (!chatbot) {
    return createErrorResponse(404, "Chatbot not found");
  }

  const typedChatbot = chatbot as unknown as IChatbotWithBusiness;

  // Mark conversation as closed (escalated)
  if (conversationId) {
    await supabase
      .from("conversations")
      .update({ status: "closed" })
      .eq("id", conversationId);
  }

  // Get last 5 messages from conversation
  let recentMessages: { role: string; content: string }[] = [];
  if (conversationId) {
    const { data: messages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (messages) {
      recentMessages = (messages as { role: string; content: string }[]).reverse();
    }
  }

  // Look up business owner's email
  const ownerId = typedChatbot.businesses?.owner_id;
  let ownerEmail: string | null = null;

  if (ownerId) {
    const { data: userData } = await supabase.auth.admin.getUserById(ownerId);
    ownerEmail = userData?.user?.email ?? null;
  }

  // Send email notification (non-blocking)
  if (ownerEmail) {
    sendEscalationEmail(
      ownerEmail,
      typedChatbot.name,
      lead?.name,
      lead?.email,
      recentMessages,
      conversationId,
    ).catch((err) =>
      console.error("[escalate] Email error:", err),
    );
  }

  // Store lead if provided
  if (lead?.email) {
    await supabase.from("leads").insert({
      chatbot_id: typedChatbot.id,
      conversation_id: conversationId ?? null,
      visitor_id: visitorId,
      name: lead.name || null,
      email: lead.email,
    });
  }

  return NextResponse.json(
    { success: true, message: "Escalation recorded" },
    { headers: corsHeaders },
  );
}
