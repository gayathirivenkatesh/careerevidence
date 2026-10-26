import axios, { AxiosError } from 'axios';
import {
  type JobProvider,
  type JobSearchOptions,
  type JobSearchResult,
  type NormalizedJob,
} from '../types';
import {
  resolveAdzunaCountryCode,
  adzunaResponseSchema,
  type AdzunaJob,
} from './adzuna.schema';

const ADZUNA_API_ROOT = 'https://api.adzuna.com/v1/api';
const REQUEST_TIMEOUT_MS = 15_000;

interface AdzunaProviderConfig {
  appId: string;
  appKey: string;
}

function normalizeAdzunaJob(job: AdzunaJob): NormalizedJob {
  return {
    externalId: job.id,
    provider: 'adzuna',
    title: job.title,
    company: job.company?.display_name ?? '',
    location: job.location?.display_name ?? '',
    description: job.description,
    sourceUrl: job.redirect_url,
    postedDate: job.created ? new Date(job.created) : null,
    updatedDate: null,
    rawData: job,
  };
}

export class AdzunaProvider implements JobProvider {
  readonly providerName = 'adzuna';

  private readonly appId: string;
  private readonly appKey: string;

  constructor(config: AdzunaProviderConfig) {
    if (!config.appId || !config.appKey) {
      throw new Error(
        'AdzunaProvider requires ADZUNA_APP_ID and ADZUNA_APP_KEY. ' +
          'These were not supplied.',
      );
    }
    this.appId = config.appId;
    this.appKey = config.appKey;
  }

  async searchJobs(options: JobSearchOptions): Promise<JobSearchResult> {
    const countryCode = resolveAdzunaCountryCode(options.country);
    const url = `${ADZUNA_API_ROOT}/jobs/${countryCode}/search/${options.page}`;

    let rawResponse: unknown;

    try {
      const response = await axios.get(url, {
        timeout: REQUEST_TIMEOUT_MS,
        params: {
          app_id: this.appId,
          app_key: this.appKey,
          what: options.query,
          results_per_page: options.resultsPerPage,
          content_type: 'application/json',
        },
        // Never throw on 4xx so we can surface a clean error
        validateStatus: (status) => status < 500,
      });

      if (response.status === 401 || response.status === 403) {
        // Do NOT expose credentials in the error message
        throw new Error(
          `Adzuna authentication failed (HTTP ${response.status}). ` +
            'Verify that ADZUNA_APP_ID and ADZUNA_APP_KEY are correct.',
        );
      }

      if (response.status === 400) {
        throw new Error(
          `Adzuna bad request (HTTP 400). Check your query parameters. ` +
            `Country code used: "${countryCode}".`,
        );
      }

      if (response.status !== 200) {
        throw new Error(
          `Adzuna returned an unexpected HTTP status: ${response.status}.`,
        );
      }

      rawResponse = response.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.code === 'ECONNABORTED') {
          throw new Error(
            `Adzuna request timed out after ${REQUEST_TIMEOUT_MS}ms.`,
          );
        }
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
          throw new Error(
            `Adzuna: Cannot reach API server. ` +
              `Check network connectivity. (${err.code})`,
          );
        }
        // Re-throw only the message, not the full error which may
        // contain URL parameters (and therefore credentials)
        throw new Error(`Adzuna network error: ${err.message}`);
      }
      // Already a clean Error from our own code above
      throw err;
    }

    // Validate the payload structure before trusting it
    const parsed = adzunaResponseSchema.safeParse(rawResponse);
    if (!parsed.success) {
      throw new Error(
        `Adzuna returned an unexpected response structure: ` +
          parsed.error.errors.map((e) => e.message).join(', '),
      );
    }

    const jobs = parsed.data.results.map(normalizeAdzunaJob);

    return {
      jobs,
      totalCount: parsed.data.count,
      currentPage: options.page,
      resultsPerPage: options.resultsPerPage,
    };
  }
}
