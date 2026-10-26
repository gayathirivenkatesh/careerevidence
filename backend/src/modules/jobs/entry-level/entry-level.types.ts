export type EntryLevelStatus =
  | 'ACCEPTED'
  | 'REJECTED'
  | 'REVIEW';

export interface EntryLevelResult {
  status: EntryLevelStatus;
  reason: string;
}