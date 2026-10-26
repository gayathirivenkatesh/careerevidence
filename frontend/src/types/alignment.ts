export type AlignmentLevel =
  | 'Strong'
  | 'Good'
  | 'Possible'
  | 'Needs Development';

export type GapCategory =
  | 'MISSING_SKILL'
  | 'WEAK_ABILITY'
  | 'MISSING_EVIDENCE';

export interface SkillAlignment {
  skillId: string;
  skillName: string;

  knowledgeScore: number;
  abilityScore: number;
  evidenceScore: number;

  alignmentScore: number;
  level: AlignmentLevel;
}

export interface RoleAlignment {
  roleId: string;
  roleCode: string;
  roleName: string;

  alignment: AlignmentLevel;
  alignmentScore: number;

  totalRoleSkills: number;
  coreSkills: number;
  coveredSkills: number;
  coreSkillsCovered: number;

  skills: SkillAlignment[];
  explanation: string;
}

export interface TargetAlignmentResponse {
  role: RoleAlignment;
  generatedAt?: string;
}

export type RoleDiscoveryResponse = RoleAlignment[];

export interface GapResponse {
  roleId: string;
  gaps: SkillGap[];
}

export interface SkillGap {
  skillId: string;
  skillName: string;

  category: GapCategory;

  marketDemandPercentage: number;
  currentAbilityScore: number;
  evidenceScore: number;

  explanation: string;
}