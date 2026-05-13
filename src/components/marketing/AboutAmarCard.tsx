import Link from "next/link";

const SKILLS = [
  "RAG pipeline design",
  "Vector embeddings (pgvector)",
  "Multi-tenancy + Postgres RLS",
  "Embeddable widgets (Shadow DOM)",
  "Streaming chat (SSE)",
  "LLM integration (Claude + OpenAI)",
] as const;

const LINKS = [
  { label: "amargupta.tech", href: "https://amargupta.tech", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/theamargupta/", external: true },
  { label: "Email", href: "mailto:theamargupta.tech@gmail.com", external: false },
] as const;

export function AboutAmarCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg md:p-8">
      <div className="flex items-start gap-5">
        <div
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 font-mono text-base text-purple-300"
        >
          AG
        </div>
        <div className="space-y-1.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-purple-400">
            About the builder
          </p>
          <h3 className="text-xl font-medium text-white md:text-2xl">Amar Gupta</h3>
          <p className="text-sm text-white/50">
            AI-powered full-stack engineer &middot; 7+ years &middot; building agent-native software
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-white/70 md:text-base">
        Devfrend Chat is a multi-tenant RAG chatbot platform &mdash; embeddable widget,
        per-tenant knowledge base, streaming Claude answers grounded in customer content.
        I built every layer: the RAG pipeline, pgvector schema with row-level security, the
        3.9KB Shadow-DOM widget, the dashboard, and the rate-limited public API.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
            Currently building
          </p>
          <p className="mt-1 text-sm text-white/70">
            Devfrend Chat (this), Setu (chat relay), Sandesh (publishing), Sankalp (job autopilot),
            Swayam (automation), Sathi (personal manager), Sutra (desktop relay), project-memory
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
            Open to
          </p>
          <p className="mt-1 text-sm text-white/70">
            Senior / staff full-stack &middot; AI eng &middot; MCP and agent infra roles
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {SKILLS.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-white/60"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="rounded-full border border-white/10 px-4 py-2 font-mono text-xs text-white hover:border-purple-400/50 hover:text-purple-300"
          >
            {link.label} &rarr;
          </Link>
        ))}
      </div>
    </div>
  );
}
