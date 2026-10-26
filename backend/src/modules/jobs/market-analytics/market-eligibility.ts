import {
  JobEntryLevelStatus,
  JobProcessingStatus,
  JobStatus,
} from '@prisma/client';

export interface MarketEligibilityInput {
  entryLevelStatus: JobEntryLevelStatus;
  processingStatus: JobProcessingStatus;
  status: JobStatus;
  primaryRoleId: string | null;
  postedDate: Date | null;
  lastCheckedAt: Date;
}

interface EligibilityEvaluationOptions {
  freshnessDays: number;
  now?: Date;
}

export interface MarketEligibilityResult {
  eligible: boolean;
  reason: string;
}

export function evaluateMarketEligibility(
  job: MarketEligibilityInput,
  options: EligibilityEvaluationOptions,
): MarketEligibilityResult {
  if (
    job.entryLevelStatus !==
    JobEntryLevelStatus.ACCEPTED
  ) {
    return {
      eligible: false,
      reason: 'Job did not pass entry-level filtering.',
    };
  }

  if (
    job.processingStatus !==
    JobProcessingStatus.PROCESSED
  ) {
    return {
      eligible: false,
      reason: 'Job has not been successfully processed.',
    };
  }

  if (
    job.status !==
    JobStatus.ACTIVE
  ) {
    return {
      eligible: false,
      reason: 'Job is not active.',
    };
  }

  if (!job.primaryRoleId) {
    return {
      eligible: false,
      reason: 'Job has no primary role.',
    };
  }

  const now =
    options.now ?? new Date();

  const freshnessCutoff =
    new Date(
      now.getTime() -
        options.freshnessDays *
          24 *
          60 *
          60 *
          1000,
    );

  const referenceDate =
    job.postedDate ??
    job.lastCheckedAt;

  if (referenceDate < freshnessCutoff) {
    return {
      eligible: false,
      reason:
        'Job is outside the market freshness window.',
    };
  }

  return {
    eligible: true,
    reason:
      'Job is eligible for current-market analytics.',
  };
}