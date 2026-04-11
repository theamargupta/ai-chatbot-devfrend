import "server-only";

import { z } from "zod";

const envSchema = z.object({
  ANTHROPIC_API_KEY: z
    .string({
      error:
        "ANTHROPIC_API_KEY is missing. Get one from console.anthropic.com",
    })
    .startsWith("sk-ant-", {
      message:
        "ANTHROPIC_API_KEY must start with 'sk-ant-'. Get a valid key from console.anthropic.com",
    }),
});

export const env = envSchema.parse({
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
});
