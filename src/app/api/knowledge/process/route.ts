import { NextResponse } from "next/server";
import { z } from "zod";
import { processDocument } from "@/lib/ai/process-document";

const processSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const result = processSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const chunkCount = await processDocument(result.data.documentId);

    return NextResponse.json({ success: true, chunkCount });
  } catch (err) {
    console.error("Knowledge process error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
