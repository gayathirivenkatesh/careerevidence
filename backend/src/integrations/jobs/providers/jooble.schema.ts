import { z } from 'zod';

// ─── Jooble API Response Schema ────────────────────────────────────────────────
// Based on Jooble's public API documentation.
// POST https://jooble.org/api/{apiKey}
// Body: { keywords, location, page, ResultOnPage }
// Response: { totalCount, jobs: [{ id, title, location, snippet, link, company, updated }] }

const joobleJobSchema = z.object({
  id: z.string().or(z.number()).transform(String),
  title: z.string().default(''),
  location: z.string().default(''),
  snippet: z.string().default(''),
  link: z.string().default(''),
  company: z.string().default(''),
  updated: z.string().optional(),
});

export const joobleResponseSchema = z.object({
  totalCount: z.number().optional(),
  jobs: z.array(joobleJobSchema).default([]),
});

export type JoobleJob = z.infer<typeof joobleJobSchema>;
export type JoobleResponse = z.infer<typeof joobleResponseSchema>;
