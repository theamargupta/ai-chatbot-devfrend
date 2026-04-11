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

    // Check if user already has a business
    const { data: existing, error: fetchError } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Business fetch error:", fetchError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch business" },
        { status: 500 },
      );
    }

    if (existing) {
      return NextResponse.json({
        success: true,
        business: mapBusiness(existing),
      });
    }

    // Auto-create business on first visit (use admin to bypass RLS for insert)
    const domain = user.email?.split("@")[1] ?? "My Business";
    const businessName =
      domain === "gmail.com" || domain === "outlook.com" || domain === "yahoo.com"
        ? "My Business"
        : domain;

    const admin = getSupabaseAdmin();
    const { data: created, error: createError } = await admin
      .from("businesses")
      .insert({ name: businessName, owner_id: user.id })
      .select()
      .single();

    if (createError) {
      console.error("Business create error:", createError);
      return NextResponse.json(
        { success: false, error: "Failed to create business" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      business: mapBusiness(created),
    });
  } catch (err) {
    console.error("Business route error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
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

    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Business name is required" },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdmin();
    const { data: updated, error } = await admin
      .from("businesses")
      .update({ name })
      .eq("owner_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Business update error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update business" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      business: mapBusiness(updated),
    });
  } catch (err) {
    console.error("Business PATCH error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

function mapBusiness(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    plan: row.plan,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
