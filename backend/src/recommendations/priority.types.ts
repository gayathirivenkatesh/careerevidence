export interface PriorityWeights {
  market: number;
  role: number;
  gap: number;
  evidence: number;
  academic: number;
}

export interface PriorityInputs {
  marketRelevance: number;
  roleRelevance: number;
  gapSeverity: number;
  evidenceGap: number;
  academicConstraint: number;
}

export interface PriorityResult {
  priorityScore: number;
  marketRelevance: number;
  roleRelevance: number;
  gapSeverity: number;
  evidenceGap: number;
  academicConstraint: number;
}