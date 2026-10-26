import {
  CANONICAL_SKILLS,
  SKILL_ALIASES,
  type CanonicalSkill,
} from './skill-extraction.constants';

import type {
  ExtractedSkill,
  SkillExtractionResult,
} from './skill-extraction.types';

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsAlias(
  text: string,
  alias: string,
): boolean {
  const normalizedText = normalizeText(text);
  const normalizedAlias = normalizeText(alias);

  if (!normalizedAlias) {
    return false;
  }

  const pattern = new RegExp(
    `(^|\\s)${escapeRegExp(normalizedAlias)}(?=\\s|$|[.,!?;:])`,
    'i',
  );

  return pattern.test(normalizedText);
}

function findMatchedAlias(
  text: string,
  canonicalSkill: CanonicalSkill,
): string | null {
  const aliases = SKILL_ALIASES[canonicalSkill];

  for (const alias of aliases) {
    if (containsAlias(text, alias)) {
      return alias;
    }
  }

  return null;
}

/**
 * Extracts canonical skills from a job description.
 *
 * Deterministic extraction is always attempted first.
 */
export function extractSkills(
  text: string,
): SkillExtractionResult {
  const skills: ExtractedSkill[] = [];

  for (const canonicalSkill of CANONICAL_SKILLS) {
    const matchedAlias = findMatchedAlias(
      text,
      canonicalSkill,
    );

    if (!matchedAlias) {
      continue;
    }

    skills.push({
      canonicalName: canonicalSkill,
      source: 'deterministic',
      matchedText: matchedAlias,
    });
  }

  return {
    skills,
    method: 'deterministic',
    ambiguousTerms: [],
  };
}