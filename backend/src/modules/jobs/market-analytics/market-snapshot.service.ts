import {
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

export interface MarketSnapshotInput {
  roleId: string;
  skillId: string;
  periodStart: Date;
  periodEnd: Date;
  jobCount: number;
  datasetSize: number;
  demandPercentage: number;
  provider: string;
  geography: string;
  collectionStart: Date;
  collectionEnd: Date;
}

export async function upsertMarketSnapshot(
  input: MarketSnapshotInput,
) {
  return prisma.marketSnapshot.upsert({
    where: {
      roleId_skillId_periodStart_periodEnd_provider_geography: {
        roleId: input.roleId,
        skillId: input.skillId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        provider: input.provider,
        geography: input.geography,
      },
    },
    update: {
      jobCount: input.jobCount,
      datasetSize: input.datasetSize,
      demandPercentage: input.demandPercentage,
      collectionStart: input.collectionStart,
      collectionEnd: input.collectionEnd,
      generatedAt: new Date(),
    },
    create: {
      roleId: input.roleId,
      skillId: input.skillId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      jobCount: input.jobCount,
      datasetSize: input.datasetSize,
      demandPercentage: input.demandPercentage,
      provider: input.provider,
      geography: input.geography,
      collectionStart: input.collectionStart,
      collectionEnd: input.collectionEnd,
    },
  });
}