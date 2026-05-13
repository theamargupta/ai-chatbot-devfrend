import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devfrend Chat sign-in is invite-only",
  description:
    "Devfrend Chat is a dogfooded portfolio piece by Amar Gupta. Sign-in is invite-only. See the architecture, watch the demo, or request access.",
  alternates: { canonical: "/login" },
  robots: { index: true, follow: true },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1/3 right-1/4 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl"
      />

      <div className="relative w-full max-w-[560px] rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-purple-300">
          Invite-only
        </p>
        <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.01em] text-white">
          Sign-in is closed by design.
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-white/70">
          Devfrend Chat is part of{" "}
          <Link
            href="https://amargupta.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white underline decoration-purple-400 decoration-2 underline-offset-4 hover:text-purple-300"
          >
            Amar Gupta&apos;s
          </Link>{" "}
          portfolio &mdash; a dogfooded multi-tenant RAG chatbot platform running
          on real Claude API tokens, live pgvector embeddings, and a production
          widget pipeline. Public access would leak secrets and rate-limit the
          apps demoed to recruiters, so the gate stays on.
        </p>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-center text-[13px] text-white hover:border-white/30 hover:bg-white/[0.06]"
          >
            See the architecture &rarr;
          </Link>
          <Link
            href="/about"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-center text-[13px] text-white hover:border-white/30 hover:bg-white/[0.06]"
          >
            About the builder &rarr;
          </Link>
          <Link
            href="https://amargupta.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-center text-[13px] text-white hover:border-white/30 hover:bg-white/[0.06]"
          >
            Portfolio site &rarr;
          </Link>
          <Link
            href="mailto:theamargupta.tech@gmail.com?subject=Devfrend%20Chat%20demo%20access%20request"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-center text-[13px] font-medium text-white hover:from-blue-500 hover:to-purple-500"
          >
            Request demo access &rarr;
          </Link>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
            What Devfrend Chat is
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/70">
            Multi-tenant RAG chatbot platform with a 3.9KB embeddable widget,
            streaming chat, human escalation, lead capture, and a Claude-backed
            answer engine over pgvector embeddings. Built end-to-end as a
            portfolio piece for AI / MCP / full-stack roles.
          </p>
        </div>

        <p className="mt-6 text-center text-[12px] text-white/40">
          Operator?{" "}
          <Link
            href="/admin/login"
            className="text-purple-300 underline-offset-2 hover:underline"
          >
            Admin sign-in
          </Link>
        </p>
      </div>
    </div>
  );
}
