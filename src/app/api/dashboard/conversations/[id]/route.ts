import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Verify ownership: conversation → chatbot → business → user
    const admin = getSupabaseAdmin();

    const { data: conversation, error: convError } = await admin
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Verify user owns this chatbot (via RLS on authenticated client)
    const { data: chatbot } = await supabase
      .from("chatbots")
      .select("id, name")
      .eq("id", conversation.chatbot_id)
      .single();

    if (!chatbot) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Fetch all messages
    const { data: messages, error: msgError } = await admin
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgError) {
      console.error("Messages fetch error:", msgError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch messages" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        chatbotId: conversation.chatbot_id,
        chatbotName: chatbot.name,
        visitorId: conversation.visitor_id,
        status: conversation.status,
        startedAt: conversation.started_at,
        lastMessageAt: conversation.last_message_at,
      },
      messages: (messages ?? []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        contextChunks: m.context_chunks,
        createdAt: m.created_at,
      })),
    });
  } catch (err) {
    console.error("Conversation detail error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
