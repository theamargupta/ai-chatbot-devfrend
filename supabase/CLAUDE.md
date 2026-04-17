# Supabase Migrations

No CLI workflow — migrations are bare SQL files run manually in the Supabase SQL Editor.

## Filename
`NNN_snake_case_name.sql` — next available NNN in `supabase/migrations/`.

## Structure of every new migration
```sql
-- ============================================
-- <purpose>
-- ============================================

create table <name> (
  id uuid primary key default gen_random_uuid(),
  ...
  created_at timestamptz default now()
);

alter table <name> enable row level security;

create policy "..." on <name> for select using (...);
```

## RLS ownership chain
Every user-owned resource is reached through:
`businesses.owner_id = auth.uid()` → `chatbots.business_id` → (conversations | messages | leads | chunks | documents)

Always scope SELECT policies by this chain. Public inserts (widget) must validate an embed key or be service-role-only.

## Indexes
Every foreign key gets an index.

## pgvector
Embeddings are `vector(384)` (Xenova MiniLM). The `match_chunks(p_chatbot_id uuid, p_query_embedding vector, p_top_k int)` RPC handles similarity search.
