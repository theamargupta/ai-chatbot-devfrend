@AGENTS.md

# AI Chat Devfrend

## Overview
AI-powered embeddable chatbot widget for businesses. RAG pipeline answers customers from uploaded business content 24/7. Includes multi-tenant dashboard, embeddable widget (Shadow DOM, 3.9KB gzip), lead capture, and human escalation.

## Tech Stack
- Next.js 16.2.x (App Router, Turbopack, src/ directory)
- React 19, TypeScript strict mode
- Tailwind CSS v4 (CSS-first, @theme in globals.css, NO tailwind.config.js)
- ShadCN UI v4 (radix-nova, unified radix-ui imports)
- Anthropic Claude SDK — model: claude-sonnet-4-20250514
- Supabase (PostgreSQL + pgvector + Auth)
- Xenova/Transformers for local embeddings (384-dim, no API cost)
- Resend for escalation emails
- Zod v4 for validation
- Vite for widget build (packages/widget/)
- Geist + Geist Mono fonts

## Commands
```
npm run dev           # Dev server on :3000
npm run build         # Widget + Next.js build
npm run widget:build  # Standalone widget only
npm run widget:dev    # Widget watch mode
npm run lint          # ESLint
```

## Project Structure
```
src/
  app/
    (chat)/             # Chat demo page
    dashboard/          # Protected multi-tenant dashboard
    api/
      chat/route.ts     # SSE streaming chat (RAG)
      chat/escalate/    # Human escalation + email
      widget/config/    # Widget config endpoint
      dashboard/        # CRUD APIs (chatbots, conversations, leads, stats)
    login/              # Auth
  components/
    chat/               # ChatWindow, ChatInput, ChatMessage
    ui/                 # ShadCN (auto-managed, don't edit)
  lib/
    ai/                 # Anthropic client, embeddings, chunker, document processor
    supabase.ts         # Admin + browser clients
    env.ts              # Zod env validation (lazy, doesn't fail build)
    rate-limit.ts       # Per-visitor rate limiting
  hooks/                # useChat, useKnowledge, useAutoScroll
  types/index.ts        # All interfaces (IMessage, IChatbot, etc.)
packages/widget/        # Embeddable vanilla JS widget (Vite build)
supabase/migrations/    # 001_initial, 002_multi_tenant, 003_leads
```

## Code Conventions
- Server Components by default — `'use client'` only when needed
- Components: PascalCase files (ChatWindow.tsx)
- Hooks: camelCase with `use` prefix (useChat.ts)
- Types: PascalCase with `I` prefix (IMessage, IChatbot)
- API routes: kebab-case folders
- Named exports everywhere (except page.tsx)
- Tailwind classes only — no custom CSS (except globals.css @theme)
- Zod for all request body validation
- Rate limit all public endpoints
- CORS headers on widget endpoints
- Streaming via SSE for chat responses
- API response format: `{ success: boolean, data?: T, error?: string }`

## Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_...           # Optional, for escalation emails
```

## Database
Supabase PostgreSQL + pgvector. Tables: documents, chunks (384-dim embeddings), conversations, messages, chatbots, businesses, leads. RPC: match_chunks() for vector similarity.

## Deployment
Vercel. vercel.json builds widget first, then Next.js. Standalone output mode.

## Rules
- No `any` in TypeScript
- No deprecated APIs
- Always handle loading/error/empty states
- Use ShadCN components, never raw HTML buttons/inputs
- Conventional commits: feat:, fix:, chore:, docs:
- Never commit .env files
