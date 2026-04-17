---
description: Scaffold a new Next.js App Router API route
---

Create a new `src/app/api/<path>/route.ts` that follows the patterns in `src/app/api/CLAUDE.md`:

- `OPTIONS` handler with CORS headers if the route is called from the widget
- `zod/v4` schema for request body
- `checkRateLimit(...)` for public endpoints
- `getSupabaseAdmin()` for service-role access, `createSupabaseServerClient()` for user-authed calls
- Response shape `{ success: true, data }` or `{ success: false, error }`
- Typed error helper `createErrorResponse(status, message)`

Route: $ARGUMENTS
