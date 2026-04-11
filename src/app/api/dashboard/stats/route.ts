import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
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

    // Get chatbot IDs owned by this user (via RLS)
    const { data: chatbots } = await supabase
      .from("chatbots")
      .select("id");

    const chatbotCount = chatbots?.length ?? 0;
    const chatbotIds = (chatbots ?? []).map((c) => c.id as string);

    let documentCount = 0;
    let conversationCount = 0;
    let leadCount = 0;

    if (chatbotIds.length > 0) {
      const admin = getSupabaseAdmin();

      const { count: docCount } = await admin
        .from("documents")
        .select("id", { count: "exact", head: true })
        .in("chatbot_id", chatbotIds);

      const { count: convCount } = await admin
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .in("chatbot_id", chatbotIds);

      const { count: leadsCount } = await admin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .in("chatbot_id", chatbotIds);

      documentCount = docCount ?? 0;
      conversationCount = convCount ?? 0;
      leadCount = leadsCount ?? 0;
    }

    return NextResponse.json({
      success: true,
      stats: {
        chatbots: chatbotCount,
        documents: documentCount,
        conversations: conversationCount,
        leads: leadCount,
      },
    });
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
