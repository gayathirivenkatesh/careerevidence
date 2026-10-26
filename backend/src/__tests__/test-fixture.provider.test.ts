import { describe, it, expect } from 'vitest';
import { TestFixtureProvider } from '../integrations/jobs/providers/test-fixture.provider';

describe('TestFixtureProvider', () => {
  const provider = new TestFixtureProvider();

  it('has the correct provider name', () => {
    expect(provider.providerName).toBe('test-fixture');
  });

  it('returns deterministic jobs', async () => {
    const result1 = await provider.searchJobs({
      query: 'react developer',
      country: 'india',
      page: 1,
      resultsPerPage: 10,
    });
    const result2 = await provider.searchJobs({
      query: 'react developer',
      country: 'india',
      page: 1,
      resultsPerPage: 10,
    });
    expect(result1.jobs).toEqual(result2.jobs);
  });

  it('returns jobs with all required NormalizedJob fields', async () => {
    const result = await provider.searchJobs({
      query: 'developer',
      country: 'india',
      page: 1,
      resultsPerPage: 10,
    });

    expect(result.jobs.length).toBeGreaterThan(0);

    for (const job of result.jobs) {
      expect(typeof job.externalId).toBe('string');
      expect(job.externalId.length).toBeGreaterThan(0);
      expect(job.provider).toBe('test-fixture');
      expect(typeof job.title).toBe('string');
      expect(typeof job.company).toBe('string');
      expect(typeof job.location).toBe('string');
      expect(typeof job.description).toBe('string');
      expect(typeof job.sourceUrl).toBe('string');
      // postedDate may be null or a Date
      expect(job.postedDate === null || job.postedDate instanceof Date).toBe(true);
      // updatedDate may be null or a Date
      expect(job.updatedDate === null || job.updatedDate instanceof Date).toBe(true);
    }
  });

  it('paginates deterministically', async () => {
    const page1 = await provider.searchJobs({
      query: 'developer',
      country: 'india',
      page: 1,
      resultsPerPage: 2,
    });
    const page2 = await provider.searchJobs({
      query: 'developer',
      country: 'india',
      page: 2,
      resultsPerPage: 2,
    });

    expect(page1.jobs.length).toBe(2);
    expect(page2.jobs.length).toBe(2);
    // Jobs on page 1 and page 2 must be different
    expect(page1.jobs[0].externalId).not.toBe(page2.jobs[0].externalId);
  });

  it('returns empty page gracefully when beyond total', async () => {
    const result = await provider.searchJobs({
      query: 'developer',
      country: 'india',
      page: 999,
      resultsPerPage: 10,
    });
    expect(result.jobs).toEqual([]);
  });

  it('returns correct totalCount', async () => {
    const result = await provider.searchJobs({
      query: 'developer',
      country: 'india',
      page: 1,
      resultsPerPage: 10,
    });
    expect(typeof result.totalCount).toBe('number');
    expect(result.totalCount).toBeGreaterThan(0);
  });

  it('test fixture jobs are clearly identifiable as test data', async () => {
    const result = await provider.searchJobs({
      query: 'developer',
      country: 'india',
      page: 1,
      resultsPerPage: 10,
    });
    for (const job of result.jobs) {
      // All fixture jobs use 'test-fixture' as provider
      expect(job.provider).toBe('test-fixture');
      // rawData must have _fixture marker
      expect((job.rawData as Record<string, unknown>)['_fixture']).toBe(true);
    }
  });
});
