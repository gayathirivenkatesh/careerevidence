export const ABILITY_SCORE = {
  NONE: 0,
  BASIC: 33,
  WORKING: 67,
  STRONG: 100,
} as const;

export const EVIDENCE_SCORE = {
  MISSING: 0,
  PARTIAL: 33,
  GOOD: 67,
  STRONG: 100,
} as const;

export const ALIGNMENT_THRESHOLDS = {
  STRONG: 80,
  GOOD: 60,
  POSSIBLE: 40,
} as const;

export const DEFAULT_MARKET_SKILL_THRESHOLD_PERCENT = 20;