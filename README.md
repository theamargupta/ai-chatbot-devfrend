# AI Chat Devfrend

AI-powered customer support chatbot. Upload your content, embed on any website, answer customers 24/7.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS v4, ShadCN UI v4
- **LLM:** Anthropic Claude (streaming via SSE)
- **Database:** Supabase (PostgreSQL + pgvector)
- **Embeddings:** Xenova/Transformers (local, no API cost)
- **Email:** Resend (escalation notifications)
- **Widget:** Vanilla JS, 3.9KB gzipped, Shadow DOM

## Features

- RAG pipeline — answers grounded in your uploaded content
- Embeddable chat widget — single script tag, works on any website
- Custom branding — colors, logo, welcome message
- Lead capture — collect emails before or during chat
- Human escalation — seamless handoff when AI can't help
- Conversation analytics — view all chats, track popular questions
- Multi-tenant dashboard — manage multiple chatbots
- Rate limiting — protect public endpoints

## Quick Start

```bash
# Clone
git clone https://github.com/theamargupta/ai-chat-devfrend.git
cd ai-chat-devfrend

# Install dependencies (also installs widget deps via postinstall)
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo on [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel project settings (see `.env.example`)
4. Deploy — Vercel auto-detects Next.js and runs the build command

The `vercel.json` and `postinstall` script handle the widget build automatically.

## Project Structure

```
src/
  app/
    page.tsx              # Marketing landing page
    demo/page.tsx         # Live chat demo
    login/page.tsx        # Authentication
    dashboard/            # Multi-tenant admin dashboard
    knowledge/page.tsx    # Knowledge base management
    api/                  # API routes (chat, auth, dashboard, knowledge)
  components/
    chat/                 # Chat-specific components
    ui/                   # ShadCN components
  lib/
    ai/                   # Claude API + RAG utilities
    config.ts             # Base URL helper
  hooks/                  # Custom React hooks
  types/index.ts          # TypeScript interfaces
packages/
  widget/                 # Embeddable chat widget (Vite build)
```

<!-- Screenshot placeholder: add a screenshot of the landing page here -->

## License

MIT

---

Built by [Amar Gupta](https://amargupta.tech)
