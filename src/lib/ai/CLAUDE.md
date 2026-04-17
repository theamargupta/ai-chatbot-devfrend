# RAG Pipeline

## Model
The Anthropic model is declared once in `utils.ts` as `export const MODEL`. Do NOT hardcode model strings anywhere else. Current: `claude-sonnet-4-20250514`.

## Client
`getAnthropicClient()` reads `ANTHROPIC_API_KEY` via `getEnv()` (lazy Zod validation — does not throw at import time).

## Embeddings
`embeddings.ts` uses Xenova/Transformers locally — 384-dim. No API cost. Must stay 384-dim to match `chunks.embedding vector(384)` in the migrations.

## Chunker
Target ~500 chars with ~50 overlap. Sentence-aware where possible.

## Prompt assembly
`buildSystemPrompt(chunks, basePrompt)`:
- Joins chunks with `---` separators.
- Always falls back to `SYSTEM_PROMPT` if no `basePrompt` passed.
- If no chunks, returns base prompt unchanged.

## server-only
`utils.ts` imports `"server-only"`. Never import this module from a client component.
