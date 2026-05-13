const DECISIONS = [
  {
    title: "Per-tenant RAG with pgvector",
    body:
      "Each chatbot is a tenant. Content chunks are embedded once with Xenova/Transformers (local, no API cost), stored in Postgres with pgvector, and retrieved per-query by cosine similarity. Row-level security keeps tenants isolated at the database boundary — not at the application layer.",
  },
  {
    title: "Embeddable widget — 3.9KB, Shadow DOM",
    body:
      "A single <script> tag mounts the chat widget into a Shadow DOM root so host-page CSS never bleeds in. Vanilla JS, no React runtime on the customer site. Vite-built, served with long-cache + stale-while-revalidate, CORS open for cross-origin embedding.",
  },
  {
    title: "Streaming SSE answers grounded in citations",
    body:
      "Claude streams via Server-Sent Events back to the widget. Each chunk paints as it arrives, with retrieved source documents attached so the AI cites the customer's own content. No hallucinated answers — if RAG returns nothing, the bot says so and offers human escalation.",
  },
  {
    title: "Rate-limited public endpoints",
    body:
      "The public chat API is reachable from every embed in the wild. Per-IP and per-chatbot rate limits live in front of the LLM call so a runaway widget or abuse bot can't burn the budget. Escalation emails go out through Resend on hand-off.",
  },
  {
    title: "Multi-tenant dashboard, single Supabase project",
    body:
      "One Postgres database, one auth surface, RLS-scoped tables for chatbots / documents / conversations / leads. Add a chatbot, upload PDFs, paste a script tag — no infra to provision per customer.",
  },
] as const;

export function Architecture() {
  return (
    <section className="relative py-24 md:py-32" id="architecture">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-6">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-purple-400">
            Architecture
          </p>
          <h2 className="text-2xl font-medium text-white md:text-3xl">
            How the RAG pipeline actually works.
          </h2>
          <p className="max-w-3xl text-sm text-white/50 md:text-base">
            One Postgres database with pgvector, one embedding model running locally, one
            streaming SSE endpoint &mdash; routed across an embeddable widget, a multi-tenant
            dashboard, and the Anthropic API.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg shadow-[0_0_60px_rgba(168,85,247,0.08)]">
          <pre className="min-w-[640px] font-mono text-[11px] leading-[1.55] text-white/70 md:text-[12px]">
{`┌────────────────────┐    <script src="/widget.js">    ┌──────────────────┐
│  Customer Website  │ ────────────────────────────▶  │  Shadow DOM      │
└─────────┬──────────┘                                │  Chat Widget     │
          │                                           └────────┬─────────┘
          │  POST /api/chat (SSE)                              │
          ▼                                                    │
┌────────────────────┐                                         │
│   Vercel Next.js   │  ◀── streaming chunks ─────────────────┘
│   rate-limited     │
└─────────┬──────────┘
          │  1. embed query (Xenova, local)
          │  2. similarity search in pgvector
          │  3. construct prompt with retrieved chunks
          ▼
┌────────────────────┐         ┌──────────────────┐
│   Anthropic API    │ ──────▶ │  Claude streams  │
│   (Claude)         │         │  cited answer    │
└────────────────────┘         └────────┬─────────┘
                                        │
                                        ▼
                       ┌──────────────────────────┐
                       │  Supabase + pgvector     │  ← per-tenant RLS
                       │  chatbots · documents    │
                       │  conversations · leads   │
                       └────────┬─────────────────┘
                                │
                ┌───────────────┴────────────────┐
                ▼                                ▼
        Multi-tenant dashboard          Resend escalation email
        (analytics + lead capture)      (human hand-off)`}
          </pre>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {DECISIONS.map((decision, index) => (
            <div
              key={decision.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg"
            >
              <p className="font-mono text-[11px] text-purple-400">{`0${index + 1}`}</p>
              <p className="mt-1 text-base text-white">{decision.title}</p>
              <p className="mt-2 text-sm text-white/50">{decision.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
