import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file if present
dotenv.config();

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().min(1).default('0.0.0.0'),
  WEB_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1),
  API_SECRET: z.string().min(16, 'API_SECRET must be at least 16 characters long'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function parseEnv(customEnv?: Record<string, string | undefined>): EnvConfig {
  const source = customEnv ?? process.env;
  const result = EnvSchema.safeParse(source);

  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(
      `Invalid application configuration. Missing or invalid environment variables:\n${formattedErrors}`
    );
  }

  return result.data;
}

// Lazy-loaded or singleton env config
let currentConfig: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!currentConfig) {
    currentConfig = parseEnv();
  }
  return currentConfig;
}

export function setConfig(config: EnvConfig | null): void {
  currentConfig = config;
}

