export interface CreateProjectInput {
  title: string;
  description: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
  features?: string | null;
  implementationNotes?: string | null;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
  features?: string | null;
  implementationNotes?: string | null;
}