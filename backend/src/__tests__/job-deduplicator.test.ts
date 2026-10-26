import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  deduplicateJobs,
  getJobDeduplicationKey,
} from '../modules/jobs/collection/job-deduplicator';

import type {
  NormalizedJob,
} from '../integrations/jobs/types';

function createJob(
  externalId: string,
  provider: NormalizedJob['provider'] = 'test',
): NormalizedJob {
  return {
    externalId,
    provider,
    title: 'Junior React Developer',
    company: 'Test Company',
    location: 'India',
    description: 'React developer role',
    sourceUrl: 'https://example.com/job',
    postedDate: new Date('2026-09-01'),
    updatedDate: null,
    rawData: {},
  };
}

describe('job deduplication', () => {
  it('creates provider + externalId key', () => {
    const job = createJob('123');

    expect(
      getJobDeduplicationKey(job),
    ).toBe('test:123');
  });

  it('removes duplicate jobs', () => {
    const jobs = [
      createJob('123'),
      createJob('123'),
      createJob('456'),
    ];

    const result = deduplicateJobs(jobs);

    expect(result).toHaveLength(2);
    expect(
      result.map((job) => job.externalId),
    ).toEqual(['123', '456']);
  });

  it('does not treat different providers as duplicates', () => {
    const jobs = [
      createJob('123', 'adzuna'),
      createJob('123', 'jooble'),
    ];

    const result = deduplicateJobs(jobs);

    expect(result).toHaveLength(2);
  });
});