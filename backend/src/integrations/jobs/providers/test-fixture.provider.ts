import {
  type JobProvider,
  type JobSearchOptions,
  type JobSearchResult,
  type NormalizedJob,
} from '../types';

/**
 * TestFixtureProvider — deterministic in-memory provider for local development
 * and testing. Requires no external API credentials.
 *
 * IMPORTANT: These are SYNTHETIC TEST RECORDS.
 * They must NEVER be inserted into the production database as market data.
 * They represent plausible job descriptions for testing the pipeline only.
 */

const BASE_FIXTURE_DATE = new Date();
BASE_FIXTURE_DATE.setUTCHours(0, 0, 0, 0);

function getDaysAgo(days: number): Date {
  return new Date(BASE_FIXTURE_DATE.getTime() - days * 24 * 60 * 60 * 1000);
}

const STATIC_FRESH_FIXTURES: ReadonlyArray<NormalizedJob> = [
    {
      externalId: 'test-fixture-001',
      provider: 'test-fixture',
      title: '[TEST] Junior React Developer',
      company: 'Test Company Alpha',
      location: 'Bangalore, India',
      description:
        '[SYNTHETIC TEST DATA] We are looking for a Junior React Developer. ' +
        'Required skills: React, JavaScript, TypeScript, HTML, CSS, Git. ' +
        'Experience with Redux or Zustand is a plus.',
      sourceUrl: 'https://example.com/jobs/test-fixture-001',
      postedDate: getDaysAgo(2),
      updatedDate: null,
      rawData: { _fixture: true, id: 'test-fixture-001' },
    },
    {
      externalId: 'test-fixture-002',
      provider: 'test-fixture',
      title: '[TEST] Junior Node.js Developer',
      company: 'Test Company Beta',
      location: 'Hyderabad, India',
      description:
        '[SYNTHETIC TEST DATA] Join us as a Junior Node.js Developer. ' +
        'Required: Node.js, JavaScript, REST APIs, Express. ' +
        'PostgreSQL or MongoDB experience preferred.',
      sourceUrl: 'https://example.com/jobs/test-fixture-002',
      postedDate: getDaysAgo(3),
      updatedDate: null,
      rawData: { _fixture: true, id: 'test-fixture-002' },
    },
    {
      externalId: 'test-fixture-003',
      provider: 'test-fixture',
      title: '[TEST] Junior Full-Stack Developer',
      company: 'Test Company Gamma',
      location: 'Mumbai, India',
      description:
        '[SYNTHETIC TEST DATA] Full-Stack role for entry-level developers. ' +
        'Stack: React, Node.js, Express, PostgreSQL, Git. TypeScript a strong plus.',
      sourceUrl: 'https://example.com/jobs/test-fixture-003',
      postedDate: getDaysAgo(4),
      updatedDate: getDaysAgo(3),
      rawData: { _fixture: true, id: 'test-fixture-003' },
    },
    {
      externalId: 'test-fixture-004',
      provider: 'test-fixture',
      title: '[TEST] Junior Frontend Developer',
      company: 'Test Company Delta',
      location: 'Pune, India',
      description:
        '[SYNTHETIC TEST DATA] We seek a Junior Frontend Developer. ' +
        'Must have: HTML, CSS, JavaScript. ' +
        'Familiarity with React, Tailwind CSS, and Jest testing is beneficial.',
      sourceUrl: 'https://example.com/jobs/test-fixture-004',
      postedDate: getDaysAgo(5),
      updatedDate: null,
      rawData: { _fixture: true, id: 'test-fixture-004' },
    },
    {
      externalId: 'test-fixture-005',
      provider: 'test-fixture',
      title: '[TEST] Junior Software Developer',
      company: 'Test Company Epsilon',
      location: 'Chennai, India',
      description:
        '[SYNTHETIC TEST DATA] Entry-level Software Developer position. ' +
        'Languages: JavaScript or TypeScript. ' +
        'Core skills: Git, SQL, Testing, problem solving.',
      sourceUrl: 'https://example.com/jobs/test-fixture-005',
      postedDate: getDaysAgo(6),
      updatedDate: null,
      rawData: { _fixture: true, id: 'test-fixture-005' },
    },
];

export class TestFixtureProvider implements JobProvider {
  readonly providerName = 'test-fixture';

  async searchJobs(options: JobSearchOptions): Promise<JobSearchResult> {
    const { page, resultsPerPage } = options;

    // Deterministic pagination
    const start = (page - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const pageJobs = STATIC_FRESH_FIXTURES.slice(start, end);

    return {
      jobs: pageJobs,
      totalCount: STATIC_FRESH_FIXTURES.length,
      currentPage: page,
      resultsPerPage,
    };
  }
}
