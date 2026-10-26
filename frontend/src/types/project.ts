export type EvidenceLevel =
  | 'MISSING'
  | 'PARTIAL'
  | 'GOOD'
  | 'STRONG';

export interface ProjectSkill {
  id: string;
  projectId: string;
  skillId: string;
  evidenceLevel: EvidenceLevel;
  evidenceNotes?: string | null;

  skill?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  features: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
  implementationNotes?: string | null;
  createdAt: string;
  updatedAt: string;

  skills?: ProjectSkill[];
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  features: string;
  githubUrl?: string;
  liveUrl?: string;
  implementationNotes?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  features?: string;
  githubUrl?: string;
  liveUrl?: string;
  implementationNotes?: string;
}

export interface AddProjectSkillRequest {
  skillId: string;
  evidenceLevel: EvidenceLevel;
  evidenceNotes?: string;
}