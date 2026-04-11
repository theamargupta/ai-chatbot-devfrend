-- ============================================
-- AI Chat Devfrend — Multi-Tenant Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- Businesses table
-- ============================================
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Chatbots table
-- ============================================
create table chatbots (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  system_prompt text default 'You are a helpful AI assistant. Answer questions based on the provided context.',
  branding jsonb default '{"primaryColor": "#2563eb", "title": "Chat with us", "welcomeMessage": "Hi! How can I help you today?", "position": "right"}'::jsonb,
  embed_key text unique default encode(gen_random_bytes(16), 'hex'),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Conversations table
-- ============================================
create table conversations (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid references chatbots(id) on delete cascade,
  visitor_id text not null,
  status text default 'active' check (status in ('active', 'closed')),
  started_at timestamptz default now(),
  last_message_at timestamptz default now()
);

-- ============================================
-- Messages table
-- ============================================
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  context_chunks integer default 0,
  created_at timestamptz default now()
);

-- ============================================
-- Add chatbot_id to existing tables
-- ============================================
alter table documents add column chatbot_id uuid references chatbots(id) on delete cascade;
alter table chunks add column chatbot_id uuid references chatbots(id) on delete cascade;

-- ============================================
-- Triggers: auto-update updated_at
-- ============================================
create trigger businesses_updated_at
  before update on businesses
  for each row execute function update_updated_at();

create trigger chatbots_updated_at
  before update on chatbots
  for each row execute function update_updated_at();

-- ============================================
-- Update match_chunks to filter by chatbot_id
-- ============================================
create or replace function match_chunks(
  query_embedding vector(384),
  filter_chatbot_id uuid default null,
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    chunks.id,
    chunks.document_id,
    chunks.content,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  where 1 - (chunks.embedding <=> query_embedding) > match_threshold
  and (filter_chatbot_id is null or chunks.chatbot_id = filter_chatbot_id)
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================
-- Row Level Security
-- ============================================
alter table businesses enable row level security;
alter table chatbots enable row level security;
alter table documents enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Businesses: owner can manage their own
create policy "Users can view own businesses"
  on businesses for select
  using (owner_id = auth.uid());

create policy "Users can insert own businesses"
  on businesses for insert
  with check (owner_id = auth.uid());

create policy "Users can update own businesses"
  on businesses for update
  using (owner_id = auth.uid());

-- Chatbots: business owner can manage
create policy "Users can view own chatbots"
  on chatbots for select
  using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Users can insert own chatbots"
  on chatbots for insert
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Users can update own chatbots"
  on chatbots for update
  using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Users can delete own chatbots"
  on chatbots for delete
  using (business_id in (select id from businesses where owner_id = auth.uid()));

-- Documents: chatbot owner can manage
create policy "Users can view own documents"
  on documents for select
  using (chatbot_id in (
    select id from chatbots where business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  ));

create policy "Users can insert own documents"
  on documents for insert
  with check (chatbot_id in (
    select id from chatbots where business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  ));

-- Conversations: chatbot owner can view
create policy "Users can view own conversations"
  on conversations for select
  using (chatbot_id in (
    select id from chatbots where business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  ));

-- Messages: conversation owner can view
create policy "Users can view own messages"
  on messages for select
  using (conversation_id in (
    select id from conversations where chatbot_id in (
      select id from chatbots where business_id in (
        select id from businesses where owner_id = auth.uid()
      )
    )
  ));
