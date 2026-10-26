export type PrimaryRole =
  | 'JUNIOR_REACT_DEVELOPER'
  | 'JUNIOR_FRONTEND_DEVELOPER'
  | 'JUNIOR_FULLSTACK_DEVELOPER'
  | 'JUNIOR_NODE_DEVELOPER'
  | 'JUNIOR_SOFTWARE_DEVELOPER';

export type ClassificationMethod = 'DETERMINISTIC';

export interface RoleClassificationResult {
  primaryRole: PrimaryRole | null;
  confidence: number;
  classificationMethod: ClassificationMethod;
  reason: string;
}