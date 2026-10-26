import type {
  JobProvider,
  JobSearchResult,
  NormalizedJob,
} from '../../../integrations/jobs/types';

export interface CollectionQuery {
  role: string;
  query: string;
}

export interface CollectionConfig {
  resultsPerQuery: number;
  maxPagesPerQuery: number;
  maxRetries: number;
  retryDelayMs: number;
  requestDelayMs: number;
}

export interface CollectionCounters {
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

export interface CollectionContext {
  provider: JobProvider;
  country: string;
  queries: CollectionQuery[];
  config: CollectionConfig;
}

export interface CollectionPageResult {
  jobs: NormalizedJob[];
  page: number;
  hasMore: boolean;
}

export interface CollectionProvider {
  searchJobs(
    query: string,
    page: number,
    resultsPerPage: number,
    country: string,
  ): Promise<JobSearchResult>;
}