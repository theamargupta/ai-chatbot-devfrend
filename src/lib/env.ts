import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  ANTHROPIC_API_KEY: z
    .string({
      error:
        "ANTHROPIC_API_KEY is missing. Get one from console.anthropic.com",
    })
    .startsWith("sk-ant-", {
      message:
        "ANTHROPIC_API_KEY must start with 'sk-ant-'. Get a valid key from console.anthropic.com",
    }),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({
      error:
        "NEXT_PUBLIC_SUPABASE_URL is missing. Get it from your Supabase project settings.",
    })
    .url({ message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL." }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string({
    error:
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Get it from your Supabase project settings.",
  }),
  SUPABASE_SERVICE_ROLE_KEY: z.string({
    error:
      "SUPABASE_SERVICE_ROLE_KEY is missing. Get it from your Supabase project settings.",
  }),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

/**
 * Lazily validates and returns server environment variables.
 * Validation happens on first call (at runtime), NOT at import time,
 * so the build doesn't fail when env vars are unavailable.
 */
export function getEnv(): ServerEnv {
  if (!cachedEnv) {
    cachedEnv = serverEnvSchema.parse({
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  }
  return cachedEnv;
}

/**
 * Client-safe environment variables.
 * Only NEXT_PUBLIC_ prefixed vars — safe to use in 'use client' components.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({
      error: "NEXT_PUBLIC_SUPABASE_URL is missing.",
    })
    .url({ message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL." }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string({
    error: "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.",
  }),
});

type ClientEnv = z.infer<typeof clientEnvSchema>;

let cachedClientEnv: ClientEnv | null = null;

/**
 * Lazily validates and returns client-safe environment variables.
 */
export function getClientEnv(): ClientEnv {
  if (!cachedClientEnv) {
    cachedClientEnv = clientEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }
  return cachedClientEnv;
}
