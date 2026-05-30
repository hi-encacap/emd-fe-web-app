import { z } from "zod";

/**
 * Typed, validated environment configuration.
 *
 * Only `NEXT_PUBLIC_*` vars are referenced here so this module is safe to import
 * from client components. When the first server-side secret lands, split this
 * into `clientEnv` / `serverEnv` so secrets never reach the browser bundle.
 */
const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Mood Deck"),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
});

export type Env = z.infer<typeof envSchema>;
