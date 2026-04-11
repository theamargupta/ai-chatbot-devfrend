import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
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

    // Get user's chatbot IDs (via RLS)
    const { data: chatbots } = await supabase
      .from("chatbots")
      .select("id, name");

    const chatbotIds = (chatbots ?? []).map((c) => c.id as string);
    const chatbotNameMap = new Map(
      (chatbots ?? []).map((c) => [c.id as string, c.name as string]),
    );

    if (chatbotIds.length === 0) {
      return NextResponse.json({
        success: true,
        leads: [],
        total: 0,
      });
    }

    const searchParams = req.nextUrl.searchParams;
    const filterChatbotId = searchParams.get("chatbot_id");
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "50", 10),
      100,
    );
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const admin = getSupabaseAdmin();

    let query = admin
      .from("leads")
      .select("*", { count: "exact" })
      .in("chatbot_id", chatbotIds)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (filterChatbotId && chatbotIds.includes(filterChatbotId)) {
      query = query.eq("chatbot_id", filterChatbotId);
    }

    const { data: leads, count } = await query;

    const formattedLeads = (leads ?? []).map((lead) => ({
      id: lead.id as string,
      name: (lead.name as string) || "",
      email: lead.email as string,
      chatbotId: lead.chatbot_id as string,
      chatbotName: chatbotNameMap.get(lead.chatbot_id as string) ?? "Unknown",
      conversationId: (lead.conversation_id as string) || null,
      visitorId: (lead.visitor_id as string) || "",
      createdAt: lead.created_at as string,
    }));

    return NextResponse.json({
      success: true,
      leads: formattedLeads,
      total: count ?? 0,
    });
  } catch (err) {
    console.error("Leads API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
