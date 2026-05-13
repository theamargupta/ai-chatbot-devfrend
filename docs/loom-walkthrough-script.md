# Devfrend Chat — 60-90s Loom walkthrough

Target length: **75-90 seconds.** Audience: hiring engineer / panel.
Tone: calm, specific, demonstrate ownership of every layer.

---

## Cold open (0:00 - 0:08)

> "This is Devfrend Chat — a multi-tenant RAG chatbot platform I built end-to-end.
> Customers upload their content, embed one script tag, and get an AI bot that
> answers grounded in their own docs."

Action: landing page, scroll past the hero, pause on the Architecture section.

---

## Architecture pause (0:08 - 0:18)

> "One Postgres database with pgvector. One local embedding model — no external
> embedding API costs. One streaming SSE endpoint. Multi-tenant from the
> database boundary up: every row is row-level-security scoped."

Action: hover over the architecture diagram. Don't read the diagram aloud —
let it speak.

---

## Live demo — embed on a third-party page (0:18 - 0:40)

> "Here's the widget mounted on a real page outside the platform — Shadow DOM
> root, so no host-page CSS bleeds in. 3.9KB gzipped."

Action: open `/demo` (or `/test-widget`). Show the chat bubble in the corner.

> "I'll ask it something specific to the uploaded knowledge base."

Action: open the widget. Ask a question that requires retrieval, e.g.:
> "What's the cheapest plan and what does it include?"

Show the streaming response paint chunk-by-chunk.

> "Answer streams via Server-Sent Events from a rate-limited Next.js route.
> Under the hood: the query gets embedded locally, pgvector does a similarity
> search across this tenant's chunks, top-K go into the prompt, Claude streams
> the answer. If nothing matches, the bot offers human escalation — and we
> send a Resend email to the operator."

---

## Dashboard — multi-tenancy (0:40 - 1:00)

Action: navigate to `/dashboard`. Show the list of chatbots.

> "Each chatbot is a tenant. Documents, conversations, leads, analytics — all
> scoped per chatbot via RLS on the database side, not just the UI. I can hop
> into a conversation log and see exactly which retrieved chunks Claude used."

Action: open a conversation, show the source citations panel (if visible).
Otherwise: show the knowledge base page, an uploaded PDF, and the chunk count.

---

## Close (1:00 - 1:15)

Action: scroll to footer, hover over "Portfolio piece" strip.

> "Devfrend Chat is a real product — open signup, live customers — and it's also
> a dogfooded portfolio piece. If you're hiring for AI / full-stack / RAG roles,
> the /about page has the full case study. I'd be happy to walk through any
> layer — the pgvector schema, the widget build, the rate limiter, or the
> streaming route handler."

> "Thanks for watching."

End screen: amargupta.tech / LinkedIn / email.

---

## What NOT to do in the recording

- Don't open `/admin/login` — operator surface, not for the customer demo.
- Don't paste real API keys into the dashboard during the demo.
- Don't claim the security audit is "done" — the codebase has known latent
  hazards (see CLAUDE.md "Latent bugs" table). Be honest: "There's a logged
  hazard list I'd address before scaling."
