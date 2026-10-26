import type {
  PriorityWeights,
} from './priority.types.js';

export const DEFAULT_PRIORITY_WEIGHTS:
  PriorityWeights = {
    market: 0.30,
    role: 0.20,
    gap: 0.25,
    evidence: 0.15,
    academic: 0.10,
};

export const PRIORITY_SCORE_MIN = 0;

export const PRIORITY_SCORE_MAX = 100;

export const ROLE_RELEVANCE = {
  CORE: 100,
  STRONGLY_RELEVANT: 75,
  USEFUL: 50,
  PERIPHERAL: 25,
  IRRELEVANT: 0,
} as const;

export const GAP_SEVERITY = {
  MISSING_SKILL: 100,
  BASIC_KNOWLEDGE_NO_ABILITY: 85,
  WORKING_ABILITY_NO_EVIDENCE: 60,
  PARTIAL_EVIDENCE: 30,
  STRONG_EVIDENCE: 0,
} as const;

export const EVIDENCE_GAP = {
  NONE: 100,
  PARTIAL: 50,
  GOOD: 20,
  STRONG: 0,
} as const;