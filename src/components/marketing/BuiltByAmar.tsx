import Link from "next/link";

export function BuiltByAmar() {
  return (
    <div className="border-t border-white/10 bg-white/[0.02]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-2 w-2 rounded-full bg-purple-400" />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
            Portfolio piece
          </p>
        </div>
        <p className="text-sm text-white/60">
          Built by{" "}
          <Link
            href="https://amargupta.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline decoration-purple-400 decoration-2 underline-offset-4 hover:text-purple-300"
          >
            Amar Gupta
          </Link>{" "}
          &mdash; AI / MCP / full-stack engineer. Devfrend Chat is one of several dogfooded products in the portfolio.
        </p>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <Link
            href="/about"
            className="rounded-full border border-white/10 px-3 py-1.5 text-white/60 hover:border-white/20 hover:text-white"
          >
            About this project
          </Link>
          <Link
            href="https://amargupta.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1.5 text-white"
          >
            Hire me &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
