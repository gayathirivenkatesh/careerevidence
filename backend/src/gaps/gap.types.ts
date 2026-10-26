export type GapCategory =
  | 'MISSING_SKILL'
  | 'WEAK_ABILITY'
  | 'MISSING_EVIDENCE';

export interface SkillGapResult {
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

  categories: GapCategory[];

  primaryGap: GapCategory | null;

  explanation: string;
}

export interface GapAnalysisResult {
  roleId: string;
  roleCode: string;
  roleName: string;

  marketSkillThresholdPercentage: number;

  datasetSize: number;

  gaps: SkillGapResult[];
}