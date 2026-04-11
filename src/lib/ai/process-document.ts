import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase";
import { chunkText } from "@/lib/ai/chunker";

export async function processDocument(documentId: string): Promise<number> {
  const supabase = getSupabaseAdmin();

  // Fetch document
  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("id, raw_content, status, chatbot_id")
    .eq("id", documentId)
    .single();

  if (fetchError || !doc) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // Update status to processing
  await supabase
    .from("documents")
    .update({ status: "processing" })
    .eq("id", documentId);

  try {
    // Chunk the content
    const chunks = chunkText(doc.raw_content as string);

    if (chunks.length === 0) {
      throw new Error("No chunks could be generated from document content");
    }

    console.log(
      `[process] Document ${documentId}: generated ${chunks.length} chunks`,
    );

    // Dynamically import embeddings to avoid module-level crash
    const { generateEmbeddings } = await import("@/lib/ai/embeddings");

    // Generate embeddings for all chunks
    const texts = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(texts);

    // Insert all chunks — with or without embeddings
    const chunkRows = chunks.map((chunk, i) => ({
      document_id: documentId,
      content: chunk.content,
      chunk_index: chunk.chunkIndex,
      token_count: chunk.tokenCount,
      ...(embeddings ? { embedding: JSON.stringify(embeddings[i]) } : {}),
      ...(doc.chatbot_id ? { chatbot_id: doc.chatbot_id } : {}),
    }));

    if (!embeddings) {
      console.warn(
        "[process] Embeddings disabled — chunks saved without vectors",
      );
    }

    const { error: insertError } = await supabase
      .from("chunks")
      .insert(chunkRows);

    if (insertError) {
      throw new Error(`Failed to insert chunks: ${insertError.message}`);
    }

    // Update document status to completed
    await supabase
      .from("documents")
      .update({ status: "completed", chunk_count: chunks.length })
      .eq("id", documentId);

    console.log(
      `[process] Document ${documentId}: completed with ${chunks.length} chunks`,
    );

    return chunks.length;
  } catch (err) {
    // Update status to failed
    await supabase
      .from("documents")
      .update({ status: "failed" })
      .eq("id", documentId);

    throw err;
  }
}
