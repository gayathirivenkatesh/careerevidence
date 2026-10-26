export interface Recommendation {
  id: string;
  priorityScore: number;
  what: string;
  why: string;
  how: string;
  effortHours: number;
  proof: string;
  when: string;
  marketRelevance: number;
  roleRelevance: number;
  gapSeverity: number;
  evidenceGap: number;
  academicConstraint: number;
  status: string;
}