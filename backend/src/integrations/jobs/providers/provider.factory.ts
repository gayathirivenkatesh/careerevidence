import { type JobProvider } from '../types';

import { AdzunaProvider } from './adzuna.provider';
import { JoobleProvider } from './jooble.provider';
import { TestFixtureProvider } from './test-fixture.provider';

export type JobDataMode = 'live' | 'test';
export type JobProviderName = 'adzuna' | 'jooble';

interface ProviderFactoryConfig {
  mode: JobDataMode;
  providerName: JobProviderName;
  adzunaAppId?: string;
  adzunaAppKey?: string;
  joobleApiKey?: string;
}

/**
 * createJobProvider — factory that selects the appropriate provider
 * based on environment configuration.
 *
 * Rules:
 *  - JOB_DATA_MODE=test  → TestFixtureProvider (no credentials required)
 *  - JOB_DATA_MODE=live + JOB_PROVIDER=adzuna  → AdzunaProvider (credentials required)
 *  - JOB_DATA_MODE=live + JOB_PROVIDER=jooble  → JoobleProvider (credentials required)
 *
 * NEVER silently falls back from live to test mode.
 * Invalid configuration throws immediately.
 */
export function createJobProvider(config: ProviderFactoryConfig): JobProvider {
  if (config.mode === 'test') {
    return new TestFixtureProvider();
  }

  if (config.mode === 'live') {
    if (config.providerName === 'adzuna') {
      if (!config.adzunaAppId || !config.adzunaAppKey) {
        throw new Error(
          'Live mode with Adzuna requires ADZUNA_APP_ID and ADZUNA_APP_KEY. ' +
          'Both environment variables must be set.',
        );
      }
      return new AdzunaProvider({
        appId: config.adzunaAppId,
        appKey: config.adzunaAppKey,
      });
    }

    if (config.providerName === 'jooble') {
      if (!config.joobleApiKey) {
        throw new Error(
          'Live mode with Jooble requires JOOBLE_API_KEY. ' +
          'The environment variable must be set.',
        );
      }
      return new JoobleProvider({ apiKey: config.joobleApiKey });
    }

    // TypeScript exhaustive check — should never reach here at runtime
    throw new Error(
      `Invalid job provider: "${config.providerName as string}". ` +
      'Valid providers are: adzuna, jooble.',
    );
  }

  throw new Error(
    `Invalid JOB_DATA_MODE: "${config.mode as string}". ` +
    'Valid modes are: live, test.',
  );
}

/**
 * Convenience factory that reads directly from the validated env object.
 */
export function createJobProviderFromEnv(env: {
  JOB_DATA_MODE: string;
  JOB_PROVIDER: string;
  ADZUNA_APP_ID?: string;
  ADZUNA_APP_KEY?: string;
  JOOBLE_API_KEY?: string;
}): JobProvider {
  return createJobProvider({
    mode: env.JOB_DATA_MODE as JobDataMode,
    providerName: env.JOB_PROVIDER as JobProviderName,
    adzunaAppId: env.ADZUNA_APP_ID,
    adzunaAppKey: env.ADZUNA_APP_KEY,
    joobleApiKey: env.JOOBLE_API_KEY,
  });
}
