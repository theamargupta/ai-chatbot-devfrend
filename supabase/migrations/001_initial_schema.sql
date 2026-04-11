-- ============================================
-- AI Chat Devfrend — Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- ============================================
-- Documents table (raw uploaded content)
-- ============================================
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('pdf', 'url', 'text')),
  source text, -- URL or filename
  raw_content text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  chunk_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Chunks table with vector embeddings
-- ============================================
create table chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  token_count integer not null,
  chunk_index integer not null,
  embedding vector(384),
  created_at timestamptz default now()
);

-- Index for vector similarity search (cosine distance)
create index on chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ============================================
-- Function: similarity search over chunks
-- ============================================
create or replace function match_chunks(
  query_embedding vector(384),
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
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================
-- Trigger: auto-update updated_at on documents
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_updated_at
  before update on documents
  for each row execute function update_updated_at();
