import {
  JobEntryLevelStatus,
  JobProcessingStatus,
  JobStatus,
  PrismaClient,
} from '@prisma/client';

import type {
  MarketAnalyticsResult,
  RoleMarketAnalytics,
  SkillDemandSummary,
} from './market-analytics.types';

import { evaluateMarketEligibility } from './market-eligibility';

export interface MarketAnalyticsServiceOptions {
  prisma: PrismaClient;
  freshnessDays: number;
  minimumSampleSize: number;
  provider?: string;
  geography?: string;
  now?: Date;
}

export class MarketAnalyticsService {
  constructor(
    private readonly options: MarketAnalyticsServiceOptions,
  ) {}

  async generateAnalytics(): Promise<MarketAnalyticsResult> {
    const now = this.options.now ?? new Date();

    const jobs = await this.options.prisma.jobPosting.findMany({
      where: {
        entryLevelStatus: JobEntryLevelStatus.ACCEPTED,
        processingStatus: JobProcessingStatus.PROCESSED,
        status: JobStatus.ACTIVE,
        primaryRoleId: {
          not: null,
        },
        ...(this.options.provider
          ? { provider: this.options.provider }
          : {}),
        ...(this.options.geography
          ? { location: this.options.geography }
          : {}),
      },
      include: {
        primaryRole: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    const eligibleJobs = jobs.filter((job) =>
      evaluateMarketEligibility(
        {
          entryLevelStatus: job.entryLevelStatus,
          processingStatus: job.processingStatus,
          status: job.status,
          primaryRoleId: job.primaryRoleId,
          postedDate: job.postedDate,
          lastCheckedAt: job.lastCheckedAt,
        },
        {
          freshnessDays: this.options.freshnessDays,
          now,
        },
      ).eligible,
    );

    // Initialize all supported roles so every role is represented
    const allRoles = await this.options.prisma.role.findMany({
      orderBy: { code: 'asc' },
    });

    const roleMap = new Map<string, RoleMarketAnalytics>();

    for (const role of allRoles) {
      roleMap.set(role.id, {
        roleId: role.id,
        roleCode: role.code,
        roleName: role.name,
        sampleSize: 0,
        sufficientSampleSize: false,
        skills: [],
      });
    }

    for (const job of eligibleJobs) {
      if (!job.primaryRole) {
        continue;
      }

      if (!roleMap.has(job.primaryRole.id)) {
        roleMap.set(job.primaryRole.id, {
          roleId: job.primaryRole.id,
          roleCode: job.primaryRole.code,
          roleName: job.primaryRole.name,
          sampleSize: 0,
          sufficientSampleSize: false,
          skills: [],
        });
      }

      roleMap.get(job.primaryRole.id)!.sampleSize++;
    }

    for (const role of roleMap.values()) {
      role.sufficientSampleSize =
        role.sampleSize >= this.options.minimumSampleSize;
    }

    for (const role of roleMap.values()) {
      if (!role.sufficientSampleSize) {
        continue;
      }

      const roleJobs = eligibleJobs.filter(
        (job) => job.primaryRoleId === role.roleId,
      );

      const skillMap = new Map<string, SkillDemandSummary>();

      for (const job of roleJobs) {
        const uniqueSkills = new Map(
          job.skills.map((jobSkill) => [jobSkill.skillId, jobSkill]),
        );

        for (const [skillId, jobSkill] of uniqueSkills) {
          const existing = skillMap.get(skillId);

          if (existing) {
            existing.jobCount++;
          } else {
            skillMap.set(skillId, {
              skillId,
              skillCode: jobSkill.skill.code,
              skillName: jobSkill.skill.name,
              jobCount: 1,
              demandPercentage: 0,
            });
          }
        }
      }

      for (const skill of skillMap.values()) {
        skill.demandPercentage = Number(
          ((skill.jobCount / role.sampleSize) * 100).toFixed(2),
        );
      }

      role.skills = [...skillMap.values()].sort(
        (a, b) => b.jobCount - a.jobCount,
      );
    }

    return {
      generatedAt: now,
      freshnessDays: this.options.freshnessDays,
      minimumSampleSize: this.options.minimumSampleSize,
      roles: [...roleMap.values()].sort((a, b) =>
        a.roleCode.localeCompare(b.roleCode),
      ),
    };
  }
}