---
description: Scaffold a new Supabase migration SQL file
---

Create a new file under `supabase/migrations/` with the next sequential number (NNN_name.sql) based on existing files. Use the conventions from `supabase/CLAUDE.md`:

- Header comment block
- `create table` with `uuid primary key default gen_random_uuid()`
- `alter table X enable row level security`
- At least one SELECT policy scoped by `auth.uid()` through the business/chatbot ownership chain
- Indexes on foreign keys

After writing the SQL, remind the user to run it manually in the Supabase SQL Editor (no CLI workflow in this project).

Migration purpose: $ARGUMENTS
