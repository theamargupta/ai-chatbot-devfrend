import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const chatbotId = searchParams.get("chatbot_id");

    let query = supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (chatbotId) {
      query = query.eq("chatbot_id", chatbotId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch documents" },
        { status: 500 },
      );
    }

    const documents = (data ?? []).map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      source: doc.source,
      rawContent: doc.raw_content,
      status: doc.status,
      chunkCount: doc.chunk_count,
      chatbotId: doc.chatbot_id,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    }));

    return NextResponse.json({ success: true, documents });
  } catch (err) {
    console.error("Knowledge documents error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
