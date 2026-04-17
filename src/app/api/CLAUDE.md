# API Route Conventions

## Imports
- `import { NextRequest, NextResponse } from "next/server"`
- `import { z } from "zod/v4"` (NOT `"zod"`)
- `import { getSupabaseAdmin } from "@/lib/supabase"` — service-role
- `import { createSupabaseServerClient } from "@/lib/supabase-server"` — user-authed SSR
- `import { checkRateLimit } from "@/lib/rate-limit"`

## Shape
Every route MUST:
- Export `OPTIONS` with CORS headers if called from the widget (chat/, widget/, chat/escalate).
- Validate body with a Zod schema.
- Return `{ success: true, data }` or `{ success: false, error }`.
- Use a `createErrorResponse(status, message)` helper.

## Rate limiting
Public endpoints (anything the widget calls) MUST call `checkRateLimit(visitorId)` BEFORE hitting the model.

## Streaming
Use SSE. Define `ISSEEvent` locally or import a shared type. Never use WebSockets.

## Auth
User-authed endpoints (under `dashboard/`) must get the Supabase SSR client and verify `user` before reading/writing. Do NOT accept `business_id` from the client — derive it from `auth.uid()`.
