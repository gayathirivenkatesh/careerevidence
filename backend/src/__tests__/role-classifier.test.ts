import { describe, expect, it } from 'vitest';

import { classifyPrimaryRole } from '../modules/jobs/role-classifier';
import type { NormalizedJob } from '../integrations/jobs/types';

function createJob(
  overrides: Partial<NormalizedJob> = {},
): NormalizedJob {
  const job = {
    externalId: 'test-role-1',
    provider: 'test',
    title: 'Developer',
    company: 'Test Company',
    location: 'India',
    description: 'Software development opportunity.',
    sourceUrl: 'https://example.com/job',
    postedDate: new Date(),
    ...overrides,
  };

  return {
    ...job,
    updatedDate: job.updatedDate ?? null,
    rawData: job.rawData ?? {},
  };
}

describe('Primary role classifier', () => {
  it('classifies a React developer', () => {
    const job = createJob({
      title: 'Junior React Developer',
      description:
        'Build React applications using JavaScript and TypeScript.',
    });

    const result = classifyPrimaryRole(job);

    expect(result.primaryRole).toBe(
      'JUNIOR_REACT_DEVELOPER',
    );
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('classifies a frontend developer', () => {
    const job = createJob({
      title: 'Junior Frontend Developer',
      description:
        'Build responsive user interfaces using HTML, CSS and JavaScript.',
    });

    const result = classifyPrimaryRole(job);

    expect(result.primaryRole).toBe(
      'JUNIOR_FRONTEND_DEVELOPER',
    );
  });

  it('classifies a full-stack developer', () => {
    const job = createJob({
      title: 'Junior Full Stack Developer',
      description:
        'Build frontend applications using React and backend services using Node.js, Express and PostgreSQL.',
    });

    const result = classifyPrimaryRole(job);

    expect(result.primaryRole).toBe(
      'JUNIOR_FULLSTACK_DEVELOPER',
    );
  });

  it('gives full-stack precedence over React and Node', () => {
    const job = createJob({
      title: 'Junior Full Stack Developer',
      description:
        'React frontend, Node.js backend, Express REST APIs and PostgreSQL.',
    });

    const result = classifyPrimaryRole(job);

    expect(result.primaryRole).toBe(
      'JUNIOR_FULLSTACK_DEVELOPER',
    );
  });

  it('classifies a Node developer', () => {
    const job = createJob({
      title: 'Junior Node.js Developer',
      description:
        'Develop backend APIs using Node.js, Express and PostgreSQL.',
    });

    const result = classifyPrimaryRole(job);

    expect(result.primaryRole).toBe(
      'JUNIOR_NODE_DEVELOPER',
    );
  });

  it('classifies a software developer', () => {
    const job = createJob({
      title: 'Junior Software Developer',
      description:
        'Develop applications and write software using JavaScript and Git.',
    });

    const result = classifyPrimaryRole(job);

    expect(result.primaryRole).toBe(
      'JUNIOR_SOFTWARE_DEVELOPER',
    );
  });

  it('does not force an uncertain job into a role', () => {
    const job = createJob({
      title: 'Technology Specialist',
      description:
        'Work with different technologies and support business operations.',
    });

    const result = classifyPrimaryRole(job);

    expect(result.primaryRole).toBeNull();
    expect(result.confidence).toBeLessThan(0.7);
  });
});