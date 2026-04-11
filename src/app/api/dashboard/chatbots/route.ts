import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase-server";

const createChatbotSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  businessId: z.string().uuid("Invalid business ID"),
});

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

    // RLS ensures only user's chatbots are returned
    const { data, error } = await supabase
      .from("chatbots")
      .select("*, documents(count)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Chatbots fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch chatbots" },
        { status: 500 },
      );
    }

    const chatbots = (data ?? []).map((row) => ({
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      systemPrompt: row.system_prompt,
      branding: row.branding,
      embedKey: row.embed_key,
      isActive: row.is_active,
      documentCount: row.documents?.[0]?.count ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ success: true, chatbots });
  } catch (err) {
    console.error("Chatbots list error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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

    const body: unknown = await request.json();
    const parsed = createChatbotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    // RLS will verify the user owns the business
    const { data, error } = await supabase
      .from("chatbots")
      .insert({
        name: parsed.data.name,
        business_id: parsed.data.businessId,
      })
      .select()
      .single();

    if (error) {
      console.error("Chatbot create error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create chatbot" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      chatbot: {
        id: data.id,
        businessId: data.business_id,
        name: data.name,
        systemPrompt: data.system_prompt,
        branding: data.branding,
        embedKey: data.embed_key,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (err) {
    console.error("Chatbot create error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
