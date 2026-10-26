import { PrismaClient } from '@prisma/client';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  upsertMarketSnapshot,
} from '../../modules/jobs/market-analytics/market-snapshot.service';

const prisma = new PrismaClient();

describe('MarketSnapshotService - integration', () => {
  let roleId: string;
  let skillId: string;

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
        'Required seeded role JUNIOR_REACT_DEVELOPER was not found.',
      );
    }

    if (!skill) {
      throw new Error(
        'Required seeded skill REACT was not found.',
      );
    }

    roleId = role.id;
    skillId = skill.id;
  });

  afterEach(async () => {
    await prisma.marketSnapshot.deleteMany({
      where: {
        roleId,
        skillId,
        provider: 'test-fixture',
        geography: 'india',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a real market snapshot in PostgreSQL', async () => {
    const periodStart =
      new Date('2026-09-01T00:00:00.000Z');

    const periodEnd =
      new Date('2026-09-30T23:59:59.999Z');

    const collectionStart =
      new Date('2026-09-20T10:00:00.000Z');

    const collectionEnd =
      new Date('2026-09-20T10:05:00.000Z');

    const result =
      await upsertMarketSnapshot({
        roleId,
        skillId,
        periodStart,
        periodEnd,
        jobCount: 10,
        datasetSize: 20,
        demandPercentage: 50,
        provider: 'test-fixture',
        geography: 'india',
        collectionStart,
        collectionEnd,
      });

    expect(result.id).toBeDefined();

    const saved =
      await prisma.marketSnapshot.findUnique({
        where: {
          id: result.id,
        },
      });

    expect(saved).not.toBeNull();

    expect(saved?.roleId).toBe(roleId);
    expect(saved?.skillId).toBe(skillId);
    expect(saved?.periodStart).toEqual(
      periodStart,
    );
    expect(saved?.periodEnd).toEqual(
      periodEnd,
    );
    expect(saved?.jobCount).toBe(10);
    expect(saved?.datasetSize).toBe(20);
    expect(saved?.demandPercentage).toBe(50);
    expect(saved?.provider).toBe(
      'test-fixture',
    );
    expect(saved?.geography).toBe('india');
    expect(saved?.collectionStart).toEqual(
      collectionStart,
    );
    expect(saved?.collectionEnd).toEqual(
      collectionEnd,
    );
    expect(saved?.generatedAt).toBeInstanceOf(
      Date,
    );
  });

  it('updates an existing real market snapshot instead of creating a duplicate', async () => {
    const periodStart =
      new Date('2026-09-01T00:00:00.000Z');

    const periodEnd =
      new Date('2026-09-30T23:59:59.999Z');

    const collectionStart =
      new Date('2026-09-20T10:00:00.000Z');

    const collectionEnd =
      new Date('2026-09-20T10:05:00.000Z');

    const first =
      await upsertMarketSnapshot({
        roleId,
        skillId,
        periodStart,
        periodEnd,
        jobCount: 10,
        datasetSize: 20,
        demandPercentage: 50,
        provider: 'test-fixture',
        geography: 'india',
        collectionStart,
        collectionEnd,
      });

    const second =
      await upsertMarketSnapshot({
        roleId,
        skillId,
        periodStart,
        periodEnd,
        jobCount: 15,
        datasetSize: 30,
        demandPercentage: 50,
        provider: 'test-fixture',
        geography: 'india',
        collectionStart,
        collectionEnd,
      });

    expect(second.id).toBe(
      first.id,
    );

    const snapshots =
      await prisma.marketSnapshot.findMany({
        where: {
          roleId,
          skillId,
          provider: 'test-fixture',
          geography: 'india',
        },
      });

    expect(snapshots).toHaveLength(1);

    expect(
      snapshots[0].jobCount,
    ).toBe(15);

    expect(
      snapshots[0].datasetSize,
    ).toBe(30);
  });
});