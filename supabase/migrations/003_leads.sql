-- ============================================
-- AI Chat Devfrend — Leads Table
-- Run this in Supabase SQL Editor
-- ============================================

create table leads (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid references chatbots(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  visitor_id text,
  name text,
  email text not null,
  created_at timestamptz default now()
);

alter table leads enable row level security;

-- Business owners can view leads for their chatbots
create policy "Users can view own leads"
  on leads for select
  using (chatbot_id in (
    select id from chatbots where business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  ));

-- Public insert for widget (via service role or anon with embed key validation)
create policy "Anyone can insert leads"
  on leads for insert
  with check (true);
