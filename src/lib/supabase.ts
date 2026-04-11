import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Supabase client using the anon key.
 * Respects Row Level Security — use for authenticated user operations.
 */
export function getSupabaseClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Supabase admin client using the service role key.
 * Bypasses RLS — use only on the server for admin operations.
 */
export function getSupabaseAdmin() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
