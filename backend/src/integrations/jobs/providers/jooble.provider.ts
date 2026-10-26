import axios, { AxiosError } from 'axios';
import {
  type JobProvider,
  type JobSearchOptions,
  type JobSearchResult,
  type NormalizedJob,
} from '../types';
import { joobleResponseSchema, type JoobleJob } from './jooble.schema';

const JOOBLE_API_ROOT = 'https://jooble.org/api';
const REQUEST_TIMEOUT_MS = 15_000;

interface JoobleProviderConfig {
  apiKey: string;
}

function normalizeJoobleJob(job: JoobleJob): NormalizedJob {
  return {
    externalId: job.id,
    provider: 'jooble',
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.snippet,
    sourceUrl: job.link,
    postedDate: null,
    updatedDate: job.updated ? new Date(job.updated) : null,
    rawData: job,
  };
}

export class JoobleProvider implements JobProvider {
  readonly providerName = 'jooble';

  private readonly apiKey: string;

  constructor(config: JoobleProviderConfig) {
    if (!config.apiKey) {
      throw new Error(
        'JoobleProvider requires JOOBLE_API_KEY. It was not supplied.',
      );
    }
    this.apiKey = config.apiKey;
  }

  async searchJobs(options: JobSearchOptions): Promise<JobSearchResult> {
    // The API key is part of the URL path — Jooble's design
    const url = `${JOOBLE_API_ROOT}/${this.apiKey}`;

    let rawResponse: unknown;

    try {
      const response = await axios.post(
        url,
        {
          keywords: options.query,
          location: options.locationHint ?? options.country,
          page: options.page,
          ResultOnPage: options.resultsPerPage,
        },
        {
          timeout: REQUEST_TIMEOUT_MS,
          headers: { 'Content-Type': 'application/json' },
          validateStatus: (status) => status < 500,
        },
      );

      if (response.status === 401 || response.status === 403) {
        // Do NOT include the API key in the error message
        throw new Error(
          `Jooble authentication failed (HTTP ${response.status}). ` +
            'Verify that JOOBLE_API_KEY is correct and is a valid key for this region.',
        );
      }

      if (response.status !== 200) {
        throw new Error(
          `Jooble returned an unexpected HTTP status: ${response.status}.`,
        );
      }

      rawResponse = response.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.code === 'ECONNABORTED') {
          throw new Error(
            `Jooble request timed out after ${REQUEST_TIMEOUT_MS}ms.`,
          );
        }
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
          throw new Error(
            `Jooble: Cannot reach API server. ` +
              `Check network connectivity. (${err.code})`,
          );
        }
        throw new Error(`Jooble network error: ${err.message}`);
      }
      throw err;
    }

    const parsed = joobleResponseSchema.safeParse(rawResponse);
    if (!parsed.success) {
      throw new Error(
        `Jooble returned an unexpected response structure: ` +
          parsed.error.errors.map((e) => e.message).join(', '),
      );
    }

    const jobs = parsed.data.jobs.map(normalizeJoobleJob);

    return {
      jobs,
      totalCount: parsed.data.totalCount,
      currentPage: options.page,
      resultsPerPage: options.resultsPerPage,
    };
  }
}
