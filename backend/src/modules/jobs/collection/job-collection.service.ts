import type {
  JobProvider,
  NormalizedJob,
} from '../../../integrations/jobs/types';

import {
  COLLECTION_QUERIES,
} from './collection.constants';

import {
  deduplicateJobs,
} from './job-deduplicator';

import {
  RateLimiter,
} from './rate-limiter';

import {
  withRetry,
} from './retry';

import {
  persistCollectedJobs,
} from './job-collection.persistence';

import {
  startCollectionRun,
  completeCollectionRun,
  failCollectionRun,
} from './job-collection-run';

export interface CollectionServiceOptions {
  provider: JobProvider;
  country: string;
  resultsPerQuery: number;
  maxPagesPerQuery: number;
  maxRetries: number;
  retryDelayMs: number;
  requestDelayMs: number;
}

export interface QueryCollectionDetail {
  query: string;
  pages: number;
  jobsReceived: number;
  jobsUnique: number;
  errors: number;
}

export interface CollectionResult {
  jobs: NormalizedJob[];
  queriesExecuted: number;
  jobsReceived: number;
  jobsNew: number;
  jobsUpdated: number;
  jobsDuplicate: number;
  jobsRejected: number;
  jobsReview: number;
  jobsAccepted: number;
  errors: number;
}

export class JobCollectionService {
  private readonly rateLimiter: RateLimiter;

  constructor(
    private readonly options: CollectionServiceOptions,
  ) {
    this.rateLimiter = new RateLimiter(
      options.requestDelayMs,
    );
  }

  async collect(): Promise<CollectionResult> {
    const allJobs: NormalizedJob[] = [];

    const queryDetails: QueryCollectionDetail[] = [];

    let queriesExecuted = 0;
    let jobsReceived = 0;
    let collectionErrors = 0;

    const collectionRun =
      await startCollectionRun(
        this.getProviderName(),
      );

    try {
      for (const searchQuery of COLLECTION_QUERIES) {
        queriesExecuted += 1;

        let queryPages = 0;
        let queryJobsReceived = 0;
        let queryErrors = 0;

        const queryUniqueKeys = new Set<string>();

        for (
          let page = 1;
          page <= this.options.maxPagesPerQuery;
          page += 1
        ) {
          try {
            await this.rateLimiter.wait();

            const result =
              await withRetry(
                () =>
                  this.options.provider.searchJobs({
                    query: searchQuery.query,
                    country: this.options.country,
                    page,
                    resultsPerPage:
                      this.options.resultsPerQuery,
                  }),
                {
                  retries:
                    this.options.maxRetries,
                  delayMs:
                    this.options.retryDelayMs,
                },
              );

            queryPages += 1;

            queryJobsReceived +=
              result.jobs.length;

            jobsReceived +=
              result.jobs.length;

            for (const job of result.jobs) {
              queryUniqueKeys.add(
                `${job.provider}:${job.externalId}`,
              );
            }

            allJobs.push(
              ...result.jobs,
            );

            if (result.jobs.length === 0) {
              break;
            }
          } catch {
            collectionErrors += 1;
            queryErrors += 1;
            break;
          }
        }

        queryDetails.push({
          query: searchQuery.query,
          pages: queryPages,
          jobsReceived: queryJobsReceived,
          jobsUnique: queryUniqueKeys.size,
          errors: queryErrors,
        });
      }

      const uniqueJobs =
        deduplicateJobs(allJobs);

      const jobsDuplicate =
        allJobs.length -
        uniqueJobs.length;

      const persisted =
        await persistCollectedJobs(
          uniqueJobs,
          {
            collectionRunId:
              collectionRun.id,
          },
        );

      const totalErrors =
        collectionErrors +
        persisted.errors;

      const result: CollectionResult = {
        jobs: uniqueJobs,
        queriesExecuted,
        jobsReceived,
        jobsNew:
          persisted.jobsNew,
        jobsUpdated:
          persisted.jobsUpdated,
        jobsDuplicate,
        jobsRejected:
          persisted.jobsRejected,
        jobsReview:
          persisted.jobsReview,
        jobsAccepted:
          persisted.jobsAccepted,
        errors: totalErrors,
      };
console.log(
  '[JobCollection] Query details:',
  JSON.stringify(queryDetails, null, 2),
);
      await completeCollectionRun(
        collectionRun.id,
        {
          queriesExecuted,
          jobsReceived,
          jobsNew:
            result.jobsNew,
          jobsUpdated:
            result.jobsUpdated,
          jobsDuplicate:
            result.jobsDuplicate,
          jobsRejected:
            result.jobsRejected,
          jobsReview:
            result.jobsReview,
          jobsAccepted:
            result.jobsAccepted,
          errors:
            result.errors,
          queryDetails,
        },
      );

      return result;
    } catch (error) {
      await failCollectionRun(
        collectionRun.id,
        error,
      );

      throw error;
    }
  }

  private getProviderName(): string {
    return this.options.provider.providerName;
  }
}