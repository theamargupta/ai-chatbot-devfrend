---
description: Show the correct order to reset the Supabase schema
---

Print the exact SQL commands the user should run in the Supabase SQL Editor to drop and recreate schema. Order:

1. Drop tables in reverse dependency order (leads, messages, conversations, chunks, documents, chatbots, businesses)
2. Re-run `001_initial_schema.sql`, `002_multi_tenant.sql`, `003_leads.sql` in order
3. Re-enable RLS on every table (it should already be on via the migration files)

Do NOT actually execute these — just output them for the user to paste.
