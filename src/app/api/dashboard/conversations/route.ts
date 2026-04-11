import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const chatbotIdFilter = searchParams.get("chatbot_id");
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "50", 10),
      100,
    );
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    // Get user's chatbot IDs for ownership verification
    const { data: chatbots } = await supabase
      .from("chatbots")
      .select("id, name");

    if (!chatbots || chatbots.length === 0) {
      return NextResponse.json({
        success: true,
        conversations: [],
        total: 0,
      });
    }

    const chatbotMap = new Map(
      chatbots.map((c) => [c.id as string, c.name as string]),
    );
    const chatbotIds = chatbots.map((c) => c.id as string);

    // Use admin client to query conversations with message counts
    const admin = getSupabaseAdmin();

    let query = admin
      .from("conversations")
      .select("*, messages(count)", { count: "exact" })
      .in("chatbot_id", chatbotIds)
      .order("last_message_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (chatbotIdFilter && chatbotIds.includes(chatbotIdFilter)) {
      query = query.eq("chatbot_id", chatbotIdFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Conversations fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch conversations" },
        { status: 500 },
      );
    }

    // Fetch last message preview for each conversation
    const conversationIds = (data ?? []).map((c) => c.id as string);
    let lastMessages = new Map<string, string>();

    if (conversationIds.length > 0) {
      const { data: msgs } = await admin
        .from("messages")
        .select("conversation_id, content, role")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });

      if (msgs) {
        // Get the first (most recent) message per conversation
        for (const msg of msgs) {
          const convId = msg.conversation_id as string;
          if (!lastMessages.has(convId)) {
            const preview =
              (msg.content as string).slice(0, 100) +
              ((msg.content as string).length > 100 ? "..." : "");
            lastMessages.set(convId, preview);
          }
        }
      }
    }

    const conversations = (data ?? []).map((row) => ({
      id: row.id,
      chatbotId: row.chatbot_id,
      chatbotName: chatbotMap.get(row.chatbot_id as string) ?? "Unknown",
      visitorId: row.visitor_id,
      status: row.status,
      messageCount: row.messages?.[0]?.count ?? 0,
      lastMessagePreview: lastMessages.get(row.id as string) ?? "",
      startedAt: row.started_at,
      lastMessageAt: row.last_message_at,
    }));

    return NextResponse.json({
      success: true,
      conversations,
      total: count ?? 0,
    });
  } catch (err) {
    console.error("Conversations list error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
