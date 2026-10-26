import { z } from 'zod';

// ─── Adzuna Country Mapping ────────────────────────────────────────────────────
// Maps application-level country names to Adzuna API country codes.
// Adzuna uses its own country code scheme which does not always match
// our application configuration value (e.g. JOB_PROVIDER_COUNTRY=india → 'in').
const ADZUNA_COUNTRY_MAP: Record<string, string> = {
  india: 'in',
  'united kingdom': 'gb',
  'united states': 'us',
  australia: 'au',
  canada: 'ca',
  germany: 'de',
  france: 'fr',
  netherlands: 'nl',
  singapore: 'sg',
  brazil: 'br',
  mexico: 'mx',
  austria: 'at',
  belgium: 'be',
  'new zealand': 'nz',
  poland: 'pl',
  russia: 'ru',
  'south africa': 'za',
  spain: 'es',
  switzerland: 'ch',
  italy: 'it',
};

export function resolveAdzunaCountryCode(country: string): string {
  const key = country.trim().toLowerCase();
  const code = ADZUNA_COUNTRY_MAP[key];
  if (!code) {
    throw new Error(
      `Adzuna: No country code mapping for "${country}". ` +
        `Supported countries: ${Object.keys(ADZUNA_COUNTRY_MAP).join(', ')}`,
    );
  }
  return code;
}

// ─── Adzuna API Response Schema ────────────────────────────────────────────────
const adzunaLocationSchema = z.object({
  display_name: z.string().default(''),
});

const adzunaCompanySchema = z.object({
  display_name: z.string().default(''),
});

const adzunaJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(''),
  redirect_url: z.string().default(''),
  created: z.string().optional(),
  location: adzunaLocationSchema.optional(),
  company: adzunaCompanySchema.default({}),
});

export const adzunaResponseSchema = z.object({
  results: z.array(adzunaJobSchema).default([]),
  count: z.number().optional(),
});

export type AdzunaJob = z.infer<typeof adzunaJobSchema>;
export type AdzunaResponse = z.infer<typeof adzunaResponseSchema>;
