/**
 * NormalizedJob — the canonical representation of a job posting
 * as returned by any provider after normalization.
 *
 * Do NOT use `any`. Use `unknown` for provider-specific raw data.
 */
export interface NormalizedJob {
  externalId: string;
  provider: string;
  title: string;
  company: string;
  location: string;
  description: string;
  sourceUrl: string;
  postedDate: Date | null;
  updatedDate: Date | null;
  /** Raw provider-specific payload. Opaque to the collection layer. */
  rawData: unknown;
}

/**
 * Options passed to any JobProvider's searchJobs method.
 */
export interface JobSearchOptions {
  query: string;
  country: string;
  page: number;
  resultsPerPage: number;
  /** Optional extra hint — providers may interpret as appropriate */
  locationHint?: string;
}

/**
 * The result returned by any JobProvider.
 * Pagination fields are optional because not all providers
 * return identical metadata.
 */
export interface JobSearchResult {
  jobs: NormalizedJob[];
  /** Total number of results available on the provider (if returned) */
  totalCount?: number;
  /** Current page number (if returned) */
  currentPage?: number;
  /** Number of results per page (if returned) */
  resultsPerPage?: number;
}

/**
 * JobProvider — the interface every provider must implement.
 * The collection service depends on this interface, not on
 * any specific provider class.
 */
export interface JobProvider {
  /** Human-readable identifier, e.g. 'adzuna', 'jooble', 'test-fixture' */
  readonly providerName: string;

  searchJobs(options: JobSearchOptions): Promise<JobSearchResult>;
}
