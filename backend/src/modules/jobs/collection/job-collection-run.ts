import { Prisma, JobCollectionRunStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

import type { QueryCollectionDetail } from './job-collection.service';

export interface CollectionRunCompletionData {
  queriesExecuted: number;
  jobsReceived: number;
  jobsNew: number;
  jobsUpdated: number;
  jobsDuplicate: number;
  jobsRejected: number;
  jobsReview: number;
  jobsAccepted: number;
  errors: number;
  queryDetails: QueryCollectionDetail[];
}

export async function startCollectionRun(
  provider: string,
) {
  return prisma.jobCollectionRun.create({
    data: {
      provider,
      status: JobCollectionRunStatus.RUNNING,
      startedAt: new Date(),
      queriesExecuted: 0,
      jobsReceived: 0,
      jobsNew: 0,
      jobsUpdated: 0,
      jobsDuplicate: 0,
      jobsRejected: 0,
      jobsReview: 0,
      jobsAccepted: 0,
      errors: 0,
    },
  });
}

export async function completeCollectionRun(
  id: string,
  data: CollectionRunCompletionData,
) {
  const status =
    data.errors > 0
      ? JobCollectionRunStatus.PARTIAL
      : JobCollectionRunStatus.COMPLETED;

  return prisma.jobCollectionRun.update({
    where: {
      id,
    },
    data: {
      status,
      finishedAt: new Date(),
      queriesExecuted:
        data.queriesExecuted,
      jobsReceived:
        data.jobsReceived,
      jobsNew:
        data.jobsNew,
      jobsUpdated:
        data.jobsUpdated,
      jobsDuplicate:
        data.jobsDuplicate,
      jobsRejected:
        data.jobsRejected,
      jobsReview:
        data.jobsReview,
      jobsAccepted:
        data.jobsAccepted,
      errors:
        data.errors,
      queryDetails:
        data.queryDetails as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function failCollectionRun(
  id: string,
  error: unknown,
) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : String(error);

  return prisma.jobCollectionRun.update({
    where: {
      id,
    },
    data: {
      status:
        JobCollectionRunStatus.FAILED,
      finishedAt: new Date(),
      errorSummary: errorMessage,
    },
  });
}