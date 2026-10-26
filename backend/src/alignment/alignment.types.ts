export type AlignmentLevel =
  | 'Strong'
  | 'Good'
  | 'Possible'
  | 'Needs Development';

export interface AlignmentSkillInput {
  skillId: string;
  skillName: string;
  isCore: boolean;
  relevanceScore: number;

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
}

export interface AlignmentSkillResult
  extends AlignmentSkillInput {
  abilityScore: number;
  evidenceScore: number;
  skillAlignmentScore: number;
  explanation: string;
}

export interface RoleAlignmentResult {
  roleId: string;
  roleCode: string;
  roleName: string;

  alignment: AlignmentLevel;
  alignmentScore: number;

  totalRoleSkills: number;
  coreSkills: number;
  coveredSkills: number;
  coreSkillsCovered: number;

  skills: AlignmentSkillResult[];

  explanation: string;
}