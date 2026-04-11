import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// CORS — widget runs on a different origin
// ---------------------------------------------------------------------------

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// ---------------------------------------------------------------------------
// GET /api/widget/config?embed_key=xxx
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const embedKey = req.nextUrl.searchParams.get("embed_key");

  if (!embedKey) {
    return NextResponse.json(
      { success: false, error: "Missing embed_key parameter" },
      { status: 400, headers: corsHeaders },
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: chatbot, error } = await supabase
    .from("chatbots")
    .select("branding, is_active")
    .eq("embed_key", embedKey)
    .single();

  if (error || !chatbot) {
    return NextResponse.json(
      { success: false, error: "Invalid embed key" },
      { status: 404, headers: corsHeaders },
    );
  }

  if (!chatbot.is_active) {
    return NextResponse.json(
      { success: false, error: "Chatbot is inactive" },
      { status: 403, headers: corsHeaders },
    );
  }

  const branding = chatbot.branding ?? {};

  return NextResponse.json(
    {
      success: true,
      config: {
        primaryColor: branding.primaryColor ?? "#2563eb",
        title: branding.title ?? "Chat with us",
        welcomeMessage:
          branding.welcomeMessage ?? "Hi! How can I help you today?",
        position: branding.position ?? "right",
        collectLead: branding.collectLead ?? true,
        showEscalation: branding.showEscalation ?? true,
      },
    },
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=60",
      },
    },
  );
}
