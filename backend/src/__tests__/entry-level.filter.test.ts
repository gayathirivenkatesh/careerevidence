import { describe, expect, it } from 'vitest';

import { filterEntryLevelJob } from '../modules/jobs/entry-level';
import type { NormalizedJob } from '../integrations/jobs/types';

function createJob(
  overrides: Partial<NormalizedJob> = {},
): NormalizedJob {
  const job = {
    externalId: 'test-1',
    provider: 'test',
    title: 'Developer',
    company: 'Test Company',
    location: 'India',
    description: 'Software development opportunity.',
    sourceUrl: 'https://example.com/job',
    postedDate: new Date(),
    rawData: undefined,
    ...overrides,
  };

  return {
    ...job,
    updatedDate: job.updatedDate ?? null,
  };
}

describe('Entry-level filter', () => {
  it('accepts a junior role with 0-1 years experience', () => {
    const job = createJob({
      title: 'Junior React Developer',
      description: 'Looking for candidates with 0-1 years experience.',
    });

    const result = filterEntryLevelJob(job);

    expect(result.status).toBe('ACCEPTED');
  });

  it('accepts a fresher role', () => {
    const job = createJob({
      title: 'Fresher Software Developer',
      description: 'Fresh graduates are welcome.',
    });

    const result = filterEntryLevelJob(job);

    expect(result.status).toBe('ACCEPTED');
  });

  it('rejects a senior role with 5+ years experience', () => {
    const job = createJob({
      title: 'Senior React Developer',
      description: 'Requires 5+ years of experience.',
    });

    const result = filterEntryLevelJob(job);

    expect(result.status).toBe('REJECTED');
  });

  it('rejects a lead role', () => {
    const job = createJob({
      title: 'Tech Lead',
      description: 'Lead a software engineering team.',
    });

    const result = filterEntryLevelJob(job);

    expect(result.status).toBe('REJECTED');
  });

  it('rejects an architect role', () => {
    const job = createJob({
      title: 'Software Architect',
      description: 'Design enterprise architecture.',
    });

    const result = filterEntryLevelJob(job);

    expect(result.status).toBe('REJECTED');
  });

  it('reviews conflicting junior title and senior experience', () => {
    const job = createJob({
      title: 'Junior React Developer',
      description: 'Requires 5+ years of experience.',
    });

    const result = filterEntryLevelJob(job);

    expect(result.status).toBe('REVIEW');
  });

  it('does not reject because senior engineers are mentioned contextually', () => {
    const job = createJob({
      title: 'React Developer',
      description:
        'Work closely with senior engineers while building React applications.',
    });

    const result = filterEntryLevelJob(job);

    expect(result.status).not.toBe('REJECTED');
  });
});