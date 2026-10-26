import type {
  GapCategory,
  SkillGapResult,
} from './gap.types.js';

export interface GapEngineInput {
  skillId: string;
  skillName: string;

  marketDemandPercentage: number;
  marketJobCount: number;
  marketDatasetSize: number;

  knowledgeLevel:
    | 'NONE'
    | 'BASIC'
    | 'WORKING'
    | 'STRONG';

  abilityLevel:
    | 'NONE'
    | 'BASIC'
    | 'WORKING'
    | 'STRONG';

  evidenceLevel:
    | 'MISSING'
    | 'PARTIAL'
    | 'GOOD'
    | 'STRONG';

  projectEvidenceCount: number;

  marketSkillThresholdPercentage: number;
}

export function analyzeSkillGap(
  input: GapEngineInput,
): SkillGapResult | null {
  /*
   * A skill below the market threshold is not normally treated
   * as a significant market gap.
   */
  if (
    input.marketDemandPercentage <
    input.marketSkillThresholdPercentage
  ) {
    return null;
  }

  const categories: GapCategory[] = [];

  if (input.knowledgeLevel === 'NONE') {
    categories.push('MISSING_SKILL');
  } else if (
    input.abilityLevel === 'NONE' ||
    input.abilityLevel === 'BASIC'
  ) {
    categories.push('WEAK_ABILITY');
  }

  if (
    input.evidenceLevel === 'MISSING'
  ) {
    categories.push('MISSING_EVIDENCE');
  }

  /*
   * A project connection counts as student-provided evidence.
   * If a project has evidence but StudentSkill has not yet been
   * updated, the project evidence is still visible to the engine.
   */
  if (
    input.projectEvidenceCount > 0 &&
    input.evidenceLevel === 'MISSING'
  ) {
    categories.splice(
      categories.indexOf('MISSING_EVIDENCE'),
      1,
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const primaryGap =
    determinePrimaryGap(categories);

  return {
    skillId: input.skillId,
    skillName: input.skillName,
    marketDemandPercentage:
      input.marketDemandPercentage,
    marketJobCount: input.marketJobCount,
    marketDatasetSize:
      input.marketDatasetSize,
    knowledgeLevel: input.knowledgeLevel,
    abilityLevel: input.abilityLevel,
    evidenceLevel: input.evidenceLevel,
    projectEvidenceCount:
      input.projectEvidenceCount,
    categories,
    primaryGap,
    explanation: buildGapExplanation(
      input,
      primaryGap,
    ),
  };
}

function determinePrimaryGap(
  categories: GapCategory[],
): GapCategory | null {
  if (categories.includes('MISSING_SKILL')) {
    return 'MISSING_SKILL';
  }

  if (categories.includes('WEAK_ABILITY')) {
    return 'WEAK_ABILITY';
  }

  if (
    categories.includes('MISSING_EVIDENCE')
  ) {
    return 'MISSING_EVIDENCE';
  }

  return null;
}

function buildGapExplanation(
  input: GapEngineInput,
  primaryGap: GapCategory | null,
): string {
  switch (primaryGap) {
    case 'MISSING_SKILL':
      return `${input.skillName} is demanded in ${formatPercentage(
        input.marketDemandPercentage,
      )}% of the analyzed postings, but no knowledge is currently recorded.`;

    case 'WEAK_ABILITY':
      return `${input.skillName} is demanded in ${formatPercentage(
        input.marketDemandPercentage,
      )}% of the analyzed postings, but the recorded ability level is ${input.abilityLevel.toLowerCase()}.`;

    case 'MISSING_EVIDENCE':
      return `${input.skillName} is recorded in the student's profile but currently lacks project evidence.`;

    default:
      return `${input.skillName} has a market-relevant gap.`;
  }
}

function formatPercentage(
  value: number,
): string {
  return value.toFixed(1);
}