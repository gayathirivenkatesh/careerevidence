import {
  apiRequest,
} from './client';

export interface CollectionRun {
  id: string;
  provider: string;
  status: string;
  startedAt: string;
  finishedAt?: string | null;
  queriesExecuted: number;
  jobsReceived: number;
  jobsNew: number;
  jobsUpdated: number;
  jobsDuplicate: number;
  jobsRejected: number;
  jobsReview: number;
  jobsAccepted: number;
  errors: number;
  errorSummary?: string | null;
  queryDetails?: unknown;
  createdAt: string;
}

export function getCollectionRuns(): Promise<CollectionRun[]> {
  return apiRequest<{
    success: boolean;
    data: CollectionRun[];
  }>(
    '/api/admin/collection/runs',
  ).then((response) => response.data);
}

export function runCollection() {
  return apiRequest<{
    success: boolean;
    data: unknown;
  }>(
    '/api/admin/collection/run',
    {
      method: 'POST',
    },
  );
}