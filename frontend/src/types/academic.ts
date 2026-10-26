export type AcademicWorkload =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH';

export type AcademicEventType =
  | 'EXAM'
  | 'ASSIGNMENT'
  | 'PROJECT_REVIEW'
  | 'INTERNAL_ASSESSMENT'
  | 'DEADLINE'
  | 'CUSTOM';

export interface AcademicEvent {
  id: string;
  type: AcademicEventType;
  title: string;
  description: string;
  workload: AcademicWorkload;
  startDate: string;
  endDate: string;
}