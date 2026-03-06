import { z } from "zod";
import { logger } from "@/shared/infrastructure/logger";

const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Nevada Inventory System"),

  // API
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:8080"),
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().default(30000),

  // Auth
  NEXT_PUBLIC_AUTH_COOKIE_NAME: z.string().default("nevada_auth_token"),
  NEXT_PUBLIC_REFRESH_COOKIE_NAME: z.string().default("nevada_refresh_token"),

  // Feature flags
  NEXT_PUBLIC_ENABLE_MOCK_API: z.coerce.boolean().default(false),
});

type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
    NEXT_PUBLIC_AUTH_COOKIE_NAME: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME,
    NEXT_PUBLIC_REFRESH_COOKIE_NAME:
      process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME,
    NEXT_PUBLIC_ENABLE_MOCK_API: process.env.NEXT_PUBLIC_ENABLE_MOCK_API,
  });

  if (!parsed.success) {
    logger.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = getEnv();
export type { Env };
