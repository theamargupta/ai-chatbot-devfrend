import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase-server";

const updateChatbotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  systemPrompt: z.string().max(2000).optional(),
  branding: z
    .object({
      primaryColor: z.string().optional(),
      title: z.string().max(100).optional(),
      welcomeMessage: z.string().max(500).optional(),
      position: z.enum(["left", "right"]).optional(),
      collectLead: z.boolean().optional(),
      showEscalation: z.boolean().optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

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

    const { data, error } = await supabase
      .from("chatbots")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Chatbot not found" },
        { status: 404 },
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
    console.error("Chatbot get error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
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

    const body: unknown = await request.json();
    const parsed = updateChatbotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.systemPrompt !== undefined)
      updates.system_prompt = parsed.data.systemPrompt;
    if (parsed.data.isActive !== undefined)
      updates.is_active = parsed.data.isActive;

    if (parsed.data.branding !== undefined) {
      // Fetch current branding to merge
      const { data: current } = await supabase
        .from("chatbots")
        .select("branding")
        .eq("id", id)
        .single();

      if (!current) {
        return NextResponse.json(
          { success: false, error: "Chatbot not found" },
          { status: 404 },
        );
      }

      updates.branding = {
        ...(current.branding as Record<string, unknown>),
        ...parsed.data.branding,
      };
    }

    // RLS ensures the user owns this chatbot
    const { data, error } = await supabase
      .from("chatbots")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Chatbot update error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update chatbot" },
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
    console.error("Chatbot update error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    // RLS ensures the user owns this chatbot
    const { error } = await supabase
      .from("chatbots")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Chatbot delete error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete chatbot" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Chatbot delete error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
