import type { Metadata } from "next";
import Link from "next/link";
import { AboutAmarCard } from "@/components/marketing/AboutAmarCard";
import { BuiltByAmar } from "@/components/marketing/BuiltByAmar";

export const metadata: Metadata = {
  title: "About Devfrend Chat — built by Amar Gupta",
  description:
    "Devfrend Chat is a real multi-tenant RAG chatbot platform, and also a dogfooded portfolio piece by Amar Gupta. Read what it demonstrates, why it exists, and how to get in touch.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Devfrend Chat — built by Amar Gupta",
    description:
      "Multi-tenant RAG chatbot platform with embeddable widget. A dogfooded portfolio piece by Amar Gupta.",
    url: "/about",
    type: "profile",
  },
};

const WHAT_THIS_DEMONSTRATES = [
  {
    skill: "RAG pipeline end-to-end",
    detail:
      "Ingest PDFs and web pages, chunk + embed with a local Xenova model, store in Postgres + pgvector, retrieve by cosine similarity, ground Claude's answer in retrieved citations. No hallucinations on customer content.",
  },
  {
    skill: "Multi-tenancy with RLS",
    detail:
      "One Postgres database, many tenants. Row-level security on every table — chatbots, documents, conversations, leads. RLS is the boundary, not application code.",
  },
  {
    skill: "Embeddable widget (Shadow DOM)",
    detail:
      "A 3.9KB gzipped vanilla-JS widget that mounts into a Shadow DOM root, isolating host-page CSS. Vite-built, single &lt;script&gt; tag embed, CORS-open for cross-origin sites.",
  },
  {
    skill: "Streaming SSE chat",
    detail:
      "Server-Sent Events from Next.js route handlers stream Claude responses chunk-by-chunk. Widget paints partial answers as they arrive — sub-second time-to-first-token UX.",
  },
  {
    skill: "Rate-limited public API",
    detail:
      "Every chat endpoint is reachable from any embed in the wild. Per-IP and per-chatbot rate limits sit in front of the LLM call so a buggy embed or abuse bot can't burn the API budget.",
  },
  {
    skill: "Next.js 16 + Supabase discipline",
    detail:
      "App Router, no middleware, Server Components by default, Supabase auth with host-only cookies. Vercel deploys with a Vite-built widget bundle stitched into the same output via vercel.json.",
  },
] as const;

const SIBLING_PRODUCTS = [
  {
    name: "Setu",
    role: "Real-time MCP-powered chat relay between browser, mobile, WhatsApp/Telegram, and Claude Code",
    href: "https://setu.devfrend.com",
  },
  {
    name: "Sandesh",
    role: "Content publishing &mdash; LinkedIn, Threads, Instagram, YouTube",
    href: "https://sandesh.devfrend.com",
  },
  {
    name: "Sankalp",
    role: "Job-application autopilot &mdash; scrape, store, auto-apply",
    href: "https://sankalp.devfrend.com",
  },
  {
    name: "Swayam",
    role: "Automation routines &mdash; scheduled Claude Code wakes",
    href: "https://swayam.devfrend.com",
  },
  {
    name: "Sathi",
    role: "Personal manager &mdash; daily routines, briefings, life ops",
    href: "https://sathi.devfrend.com",
  },
  {
    name: "Sutra",
    role: "Electron desktop relay &mdash; local MCP, SSE bridge, push fan-out",
    href: "https://sutra.devfrend.com",
  },
  {
    name: "project-memory",
    role: "Multi-tenant memory / task / code knowledge layer with remote MCP",
    href: "https://pm.devfrend.com",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white">
      {/* Top nav (lightweight) */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <span className="text-sm font-bold text-white">AI</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              Devfrend
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            &larr; Back to product
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="max-w-3xl space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-purple-400">
              About this project
            </p>
            <h1 className="text-3xl font-medium tracking-tight text-white md:text-5xl">
              A real product, and a portfolio piece.
            </h1>
            <p className="text-base text-white/50 md:text-lg">
              Devfrend Chat is a working multi-tenant RAG chatbot platform &mdash; customers
              sign up, upload content, and embed the widget on their own sites. It&apos;s also
              dogfooded by Amar Gupta to demonstrate end-to-end ownership of a non-trivial
              AI / full-stack system: pgvector schema with RLS, local embedding pipeline,
              Shadow-DOM widget, streaming SSE, rate limiting, and a multi-tenant dashboard.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <AboutAmarCard />
        </section>

        <section className="mx-auto w-full max-w-6xl space-y-6 px-6 py-12">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-purple-400">
              What this demonstrates
            </p>
            <h2 className="text-2xl font-medium text-white md:text-3xl">
              Six skills, one running product.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {WHAT_THIS_DEMONSTRATES.map((item, index) => (
              <div
                key={item.skill}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg"
              >
                <p className="font-mono text-[11px] text-purple-400">{`0${index + 1}`}</p>
                <p className="mt-1 text-base text-white">{item.skill}</p>
                <p
                  className="mt-2 text-sm text-white/50"
                  dangerouslySetInnerHTML={{ __html: item.detail }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl space-y-6 px-6 py-12">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-purple-400">
              Sibling products
            </p>
            <h2 className="text-2xl font-medium text-white md:text-3xl">
              Part of a multi-product portfolio.
            </h2>
            <p className="max-w-3xl text-sm text-white/50 md:text-base">
              Devfrend Chat is one of several dogfooded products. Each demonstrates a
              different end-to-end use case — from MCP relays to job automation to
              content publishing.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {SIBLING_PRODUCTS.map((product) => (
              <a
                key={product.name}
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg hover:border-purple-400/40"
              >
                <p className="text-base text-white group-hover:text-purple-300">{product.name}</p>
                <p
                  className="mt-1 text-sm text-white/50"
                  dangerouslySetInnerHTML={{ __html: product.role }}
                />
              </a>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-lg md:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-purple-400">
              Hiring?
            </p>
            <h2 className="mt-2 text-2xl font-medium text-white md:text-3xl">
              I&apos;m open to senior / staff roles.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/60 md:text-base">
              Full-stack, AI eng, MCP / agent infra. Happy to walk a hiring panel through
              any layer of this system live &mdash; RAG pipeline, pgvector schema, widget
              build, streaming SSE, or the multi-tenant dashboard.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:theamargupta.tech@gmail.com?subject=Devfrend%20Chat%20%E2%80%94%20hiring%20conversation"
                className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2.5 font-mono text-xs text-white shadow-lg shadow-purple-500/20"
              >
                Email Amar &rarr;
              </a>
              <a
                href="https://amargupta.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 px-5 py-2.5 font-mono text-xs text-white hover:border-purple-400/50"
              >
                amargupta.tech &rarr;
              </a>
              <a
                href="https://www.linkedin.com/in/theamargupta/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 px-5 py-2.5 font-mono text-xs text-white hover:border-purple-400/50"
              >
                LinkedIn &rarr;
              </a>
            </div>
          </div>
        </section>
      </main>
      <BuiltByAmar />
    </div>
  );
}
