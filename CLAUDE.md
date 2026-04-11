# AI Chat Devfrend - Project Conventions

## Project Overview
AI-powered embeddable chatbot widget for businesses. Customers get instant answers from business content 24/7 using RAG (Retrieval Augmented Generation).

## Tech Stack (ALWAYS use these exact versions)
- Next.js 16.2.x (App Router, Turbopack, src/ directory)
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4.2 (CSS-first config, @theme inline in globals.css, NO tailwind.config.js)
- ShadCN UI v4 (radix-nova style, unified radix-ui imports, NOT @radix-ui/react-*)
- Anthropic Claude SDK (@anthropic-ai/sdk) for LLM
- Supabase for database + pgvector + auth (to be added later)
- Geist + Geist Mono fonts

## Code Style Rules
- Use 'use client' directive only when component needs client-side interactivity
- Server Components by default — only add 'use client' when needed
- All API routes in src/app/api/ directory
- All shared types in src/types/index.ts
- All AI/LLM utilities in src/lib/ai/
- All custom hooks in src/hooks/
- All chat components in src/components/chat/
- Use named exports, not default exports (except page.tsx)
- Use TypeScript interfaces, not types (unless union types needed)
- Always handle loading, error, and empty states in components
- Use ShadCN components for UI — never write raw HTML buttons/inputs

## Naming Conventions
- Components: PascalCase (ChatWindow.tsx, ChatMessage.tsx)
- Hooks: camelCase with 'use' prefix (useChat.ts, useAutoScroll.ts)
- Utils: camelCase (formatMessage.ts)
- Types/Interfaces: PascalCase with 'I' prefix for interfaces (IMessage, IChatState)
- API routes: kebab-case folders
- CSS: Tailwind classes only, no custom CSS files (except globals.css for @theme)

## API Design
- All API responses follow: { success: boolean, data?: T, error?: string }
- Use streaming (SSE) for chat responses
- Always validate request body with zod
- Rate limit all public endpoints
- Include CORS headers for widget endpoints

## File Organization
src/
  app/
    (chat)/page.tsx          # Main chat page
    api/
      chat/route.ts          # Chat streaming endpoint
  components/
    chat/                    # Chat-specific components
    ui/                      # ShadCN components (auto-managed)
  lib/
    ai/                      # Claude API utilities
    utils.ts                 # General utilities
  hooks/                     # Custom React hooks
  types/
    index.ts                 # All TypeScript interfaces

## Git
- Conventional commits: feat:, fix:, chore:, docs:
- Never commit .env files
- Always commit CLAUDE.md changes

## Important
- NEVER use any deprecated APIs
- ALWAYS handle errors gracefully
- ALWAYS add TypeScript types - no 'any' allowed
- Test every feature before marking complete
