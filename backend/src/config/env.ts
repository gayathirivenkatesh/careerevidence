import 'dotenv/config';
import { z } from 'zod';

// ─── Base schema (always required) ────────────────────────────────────────────
const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  JOB_DATA_MODE: z.enum(['live', 'test']).default('test'),
  JOB_PROVIDER: z.enum(['adzuna', 'jooble']).default('adzuna'),
  JOB_PROVIDER_COUNTRY: z.string().default('india'),

  ADZUNA_APP_ID: z.string().optional(),
  ADZUNA_APP_KEY: z.string().optional(),
  JOOBLE_API_KEY: z.string().optional(),

  AI_PROVIDER: z.string().optional(),
  AI_API_KEY: z.string().optional(),

  JOB_COLLECTION_ENABLED: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
  JOB_COLLECTION_INTERVAL_HOURS: z.coerce.number().int().positive().default(24),
  JOB_RESULTS_PER_QUERY: z.coerce.number().int().positive().default(50),
  JOB_MAX_PAGES_PER_QUERY: z.coerce.number().int().positive().default(5),

  MIN_MARKET_SAMPLE_SIZE: z.coerce.number().int().positive().default(15),
  JOB_FRESHNESS_DAYS: z.coerce.number().int().positive().default(30),
});

function validateEnv() {
  const parsed = baseSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.errors
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Environment configuration invalid:\n${errors}`);
  }

  const env = parsed.data;

  // Live mode credential validation
  if (env.JOB_DATA_MODE === 'live') {
    if (env.JOB_PROVIDER === 'adzuna') {
      if (!env.ADZUNA_APP_ID || !env.ADZUNA_APP_KEY) {
        throw new Error(
          'Live mode with Adzuna requires ADZUNA_APP_ID and ADZUNA_APP_KEY to be set. ' +
            'Set JOB_DATA_MODE=test to run without credentials.',
        );
      }
    }
    if (env.JOB_PROVIDER === 'jooble') {
      if (!env.JOOBLE_API_KEY) {
        throw new Error(
          'Live mode with Jooble requires JOOBLE_API_KEY to be set. ' +
            'Set JOB_DATA_MODE=test to run without credentials.',
        );
      }
    }
  }

  return env;
}

export type Env = ReturnType<typeof validateEnv>;
export const env = validateEnv();
