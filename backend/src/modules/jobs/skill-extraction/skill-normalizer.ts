import {
  CANONICAL_SKILLS,
  SKILL_ALIASES,
  type CanonicalSkill,
} from './skill-extraction.constants';

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[()[\],;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts an extracted skill/alias into its canonical skill name.
 *
 * Example:
 *
 * reactjs   -> REACT
 * nodejs    -> NODE.JS
 * postgres  -> POSTGRESQL
 * js        -> JAVASCRIPT
 */
export function normalizeSkill(
  value: string,
): CanonicalSkill | null {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return null;
  }

  for (const canonicalSkill of CANONICAL_SKILLS) {
    const aliases = SKILL_ALIASES[canonicalSkill];

    if (
      aliases.some(
        (alias) =>
          normalizeText(alias) === normalizedValue,
      )
    ) {
      return canonicalSkill;
    }
  }

  return null;
}