import type { EvidenceLevel } from '@prisma/client';

export interface AddProjectSkillInput {
  skillId: string;
  evidenceLevel: EvidenceLevel;
  evidenceNotes?: string | null;
}

export interface UpdateProjectSkillInput {
  evidenceLevel?: EvidenceLevel;
  evidenceNotes?: string | null;
}