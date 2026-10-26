export const ENTRY_LEVEL_TITLE_SIGNALS = [
  'fresher',
  'entry level',
  'entry-level',
  'junior',
  'jr',
  'graduate',
  'trainee',
  'associate',
] as const;

export const ENTRY_LEVEL_EXPERIENCE_SIGNALS = [
  '0 years',
  '0-1 years',
  '0 - 1 years',
  '0–1 years',
  '0—1 years',
  '0-2 years',
  '0 - 2 years',
  '0–2 years',
  '0—2 years',
  '1 year',
  '1 year experience',
  '1-2 years',
  '1 - 2 years',
  '1–2 years',
  '1—2 years',
] as const;

export const SENIOR_TITLE_SIGNALS = [
  'senior',
  'sr.',
  'sr ',
  'lead',
  'tech lead',
  'principal',
  'staff',
  'architect',
  'manager',
  'head of',
  'director',
] as const;

export const SENIOR_EXPERIENCE_PATTERNS = [
  /\b5\+?\s*years?\b/i,
  /\b6\+?\s*years?\b/i,
  /\b7\+?\s*years?\b/i,
  /\b8\+?\s*years?\b/i,
  /\b9\+?\s*years?\b/i,
  /\b10\+?\s*years?\b/i,
] as const;