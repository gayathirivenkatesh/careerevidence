import {
  ABILITY_SCORE,
  ALIGNMENT_THRESHOLDS,
  EVIDENCE_SCORE,
} from './alignment.constants.js';

import type {
  AlignmentLevel,
  AlignmentSkillInput,
  AlignmentSkillResult,
} from './alignment.types.js';

export function calculateAbilityScore(
  level: AlignmentSkillInput['abilityLevel'],
): number {
  return ABILITY_SCORE[level];
}

export function calculateEvidenceScore(
  level: AlignmentSkillInput['evidenceLevel'],
): number {
  return EVIDENCE_SCORE[level];
}

export function calculateSkillAlignment(
  input: AlignmentSkillInput,
): AlignmentSkillResult {
  const abilityScore =
    calculateAbilityScore(input.abilityLevel);

  const evidenceScore =
    calculateEvidenceScore(input.evidenceLevel);

  /*
   * Ability is weighted at 60%.
   * Evidence is weighted at 40%.
   *
   * Both values use a 0–100 scale.
   */
  const skillAlignmentScore =
    abilityScore * 0.6 +
    evidenceScore * 0.4;

  return {
    ...input,
    abilityScore,
    evidenceScore,
    skillAlignmentScore: round(
      skillAlignmentScore,
    ),
    explanation: buildSkillExplanation(
      input,
      abilityScore,
      evidenceScore,
    ),
  };
}

export function calculateRoleAlignment(
  skills: AlignmentSkillInput[],
): {
  score: number;
  level: AlignmentLevel;
  coveredSkills: number;
  coreSkillsCovered: number;
} {
  if (skills.length === 0) {
    return {
      score: 0,
      level: 'Needs Development',
      coveredSkills: 0,
      coreSkillsCovered: 0,
    };
  }

  let totalWeight = 0;
  let weightedScore = 0;

  let coveredSkills = 0;
  let coreSkillsCovered = 0;

  for (const skill of skills) {
    const result =
      calculateSkillAlignment(skill);

    const weight = Math.max(
      1,
      skill.relevanceScore,
    );

    totalWeight += weight;

    weightedScore +=
      result.skillAlignmentScore * weight;

    if (skill.abilityLevel !== 'NONE') {
      coveredSkills += 1;
    }

    if (
      skill.isCore &&
      skill.abilityLevel !== 'NONE'
    ) {
      coreSkillsCovered += 1;
    }
  }

const rawScore = totalWeight === 0 ? 0 : weightedScore / totalWeight;
const score = Math.round(rawScore);

return {
  score,
  level: getAlignmentLevel(score),
  coveredSkills,
  coreSkillsCovered,
};
}

export function getAlignmentLevel(
  score: number,
): AlignmentLevel {
  if (score >= ALIGNMENT_THRESHOLDS.STRONG) {
    return 'Strong';
  }

  if (score >= ALIGNMENT_THRESHOLDS.GOOD) {
    return 'Good';
  }

  if (score >= ALIGNMENT_THRESHOLDS.POSSIBLE) {
    return 'Possible';
  }

  return 'Needs Development';
}

function buildSkillExplanation(
  input: AlignmentSkillInput,
  abilityScore: number,
  evidenceScore: number,
): string {
  if (input.abilityLevel === 'NONE') {
    return `${input.skillName} currently has no recorded ability.`;
  }

  if (
    input.evidenceLevel === 'MISSING' &&
    abilityScore > 0
  ) {
    return `${input.skillName} has recorded ability but no project evidence.`;
  }

  if (
    input.projectEvidenceCount > 0 &&
    evidenceScore > 0
  ) {
    return `${input.skillName} has recorded ability and student-provided project evidence.`;
  }

  return `${input.skillName} has recorded ${input.abilityLevel.toLowerCase()} ability.`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}