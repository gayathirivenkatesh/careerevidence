import {
  JobEntryLevelStatus,
  JobProcessingStatus,
  JobStatus,
  PrismaClient,
} from '@prisma/client';

import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  MarketAnalyticsService,
} from '../../modules/jobs/market-analytics/market-analytics.service';

const prisma = new PrismaClient();

describe('MarketAnalyticsService - integration', () => {
  let roleId: string;
  let skillId: string;

  const createdJobIds: string[] = [];

  beforeAll(async () => {
    const role = await prisma.role.findUnique({
      where: {
        code: 'JUNIOR_REACT_DEVELOPER',
      },
    });

    const skill = await prisma.skill.findUnique({
      where: {
        code: 'REACT',
      },
    });

    if (!role) {
      throw new Error(
        'Required seeded role was not found.',
      );
    }

    if (!skill) {
      throw new Error(
        'Required seeded skill was not found.',
      );
    }

    roleId = role.id;
    skillId = skill.id;
  });

  afterEach(async () => {
    if (createdJobIds.length > 0) {
      await prisma.jobSkill.deleteMany({
        where: {
          jobId: {
            in: createdJobIds,
          },
        },
      });

      await prisma.jobPosting.deleteMany({
        where: {
          id: {
            in: createdJobIds,
          },
        },
      });

      createdJobIds.length = 0;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createJob(
    index: number,
    includeReact: boolean,
  ) {
    const job =
      await prisma.jobPosting.create({
        data: {
          externalId:
            `analytics-test-${Date.now()}-${index}`,

          provider:
            'test-analytics',

          title:
            'Junior React Developer',

          company:
            `Analytics Test Company ${index}`,

          location:
            'Chennai, Tamil Nadu, India',

          description:
            'Junior React Developer entry-level role requiring React.',

          sourceUrl:
            `https://example.com/analytics-test-${index}`,

          postedDate:
            new Date(
              '2026-09-10T12:00:00.000Z',
            ),

          updatedDate:
            new Date(
              '2026-09-10T12:00:00.000Z',
            ),

          firstSeenAt:
            new Date(
              '2026-09-10T12:00:00.000Z',
            ),

          lastSeenAt:
            new Date(
              '2026-09-20T12:00:00.000Z',
            ),

          lastCheckedAt:
            new Date(
              '2026-09-20T12:00:00.000Z',
            ),

          status:
            JobStatus.ACTIVE,

          entryLevelStatus:
            JobEntryLevelStatus.ACCEPTED,

          entryLevelReason:
            'Junior role.',

          primaryRoleId:
            roleId,

          classificationMethod:
            'test',

          classificationConfidence:
            1,

          processingStatus:
            JobProcessingStatus.PROCESSED,

          rawData: {},
        },
      });

    createdJobIds.push(job.id);

    if (includeReact) {
      await prisma.jobSkill.create({
        data: {
          jobId: job.id,
          skillId,
          extractionMethod:
            'test',
          confidence: 1,
        },
      });
    }

    return job;
  }

  it('does not calculate skill demand below the minimum sample size', async () => {
    for (let index = 0; index < 5; index += 1) {
      await createJob(index, true);
    }

    const service =
      new MarketAnalyticsService({
        prisma,
        freshnessDays: 30,
        minimumSampleSize: 15,
        provider: 'test-analytics',
        now:
          new Date(
            '2026-09-20T12:00:00.000Z',
          ),
      });

    const result =
      await service.generateAnalytics();

    const role =
      result.roles.find(
        (item) =>
          item.roleId === roleId,
      );

    expect(role).toBeDefined();

    expect(
      role?.sampleSize,
    ).toBe(5);

    expect(
      role?.sufficientSampleSize,
    ).toBe(false);

    expect(
      role?.skills,
    ).toHaveLength(0);
  });

  it('calculates real skill demand when sample size is sufficient', async () => {
    for (let index = 0; index < 15; index += 1) {
      await createJob(
        index,
        index < 10,
      );
    }

    const service =
      new MarketAnalyticsService({
        prisma,
        freshnessDays: 30,
        minimumSampleSize: 15,
        provider: 'test-analytics',
        now:
          new Date(
            '2026-09-20T12:00:00.000Z',
          ),
      });

    const result =
      await service.generateAnalytics();

    const role =
      result.roles.find(
        (item) =>
          item.roleId === roleId,
      );

    expect(role).toBeDefined();

    expect(
      role?.sampleSize,
    ).toBe(15);

    expect(
      role?.sufficientSampleSize,
    ).toBe(true);

    const react =
      role?.skills.find(
        (item) =>
          item.skillId === skillId,
      );

    expect(react).toBeDefined();

    expect(
      react?.jobCount,
    ).toBe(10);

    expect(
      react?.demandPercentage,
    ).toBe(66.67);
  });
});