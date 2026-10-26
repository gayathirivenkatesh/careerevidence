export interface StudentProfile {
  id: string;
  email: string;
  name: string;
  education?: string | null;
  graduationYear?: number | null;
  targetRoleId?: string | null;
  careerHoursPerWeek: number;
  role?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  education?: string;
  graduationYear?: number;
  targetRoleId?: string | null;
  careerHoursPerWeek?: number;
}

export type CompetencyLevel =
  | 'NONE'
  | 'BASIC'
  | 'WORKING'
  | 'STRONG';

export type EvidenceLevel =
  | 'MISSING'
  | 'PARTIAL'
  | 'GOOD'
  | 'STRONG';

export interface StudentSkill {
  id: string;
  skillId: string;
  skill?: {
    id: string;
    code: string;
    name: string;
  };
  knowledgeLevel?: CompetencyLevel;
  abilityLevel?: CompetencyLevel;
  evidenceLevel?: EvidenceLevel;
}