import type { PrismaClient } from '@prisma/client';

import {
  calculateRoleAlignment,
  calculateSkillAlignment,
} from './alignment.engine.js';

import type {
  AlignmentSkillInput,
  RoleAlignmentResult,
} from './alignment.types.js';

import {
  DEFAULT_MARKET_SKILL_THRESHOLD_PERCENT,
} from './alignment.constants.js';

import {
  analyzeSkillGap,
} from '../gaps/gap.engine.js';

import type {
  GapAnalysisResult,
} from '../gaps/gap.types.js';

interface AlignmentServiceOptions {
  prisma: PrismaClient;
  marketSkillThresholdPercentage?: number;
}

export class AlignmentService {
  private readonly threshold: number;

  constructor(
    private readonly options: AlignmentServiceOptions,
  ) {
    this.threshold =
      options.marketSkillThresholdPercentage ??
      DEFAULT_MARKET_SKILL_THRESHOLD_PERCENT;
  }

  async analyzeRole(
    studentId: string,
    roleId: string,
  ): Promise<RoleAlignmentResult> {
    const role =
      await this.options.prisma.role.findUnique({
        where: {
          id: roleId,
        },
        include: {
          roleSkills: {
            include: {
              skill: true,
            },
            orderBy: {
              relevanceScore: 'desc',
            },
          },
        },
      });

    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    const studentSkills =
      await this.options.prisma.studentSkill.findMany({
        where: {
          studentId,
        },
        include: {
          skill: true,
        },
      });

    const projectSkills =
      await this.options.prisma.projectSkill.findMany({
        where: {
          project: {
            studentId,
          },
        },
        include: {
          skill: true,
        },
      });

    const projectEvidence =
      new Map<
        string,
        {
          count: number;
          levels: string[];
        }
      >();

    for (const projectSkill of projectSkills) {
      const current =
        projectEvidence.get(
          projectSkill.skillId,
        ) ?? {
          count: 0,
          levels: [],
        };

      current.count += 1;
      current.levels.push(
        projectSkill.evidenceLevel,
      );

      projectEvidence.set(
        projectSkill.skillId,
        current,
      );
    }

    const studentSkillMap =
      new Map(
        studentSkills.map((studentSkill) => [
          studentSkill.skillId,
          studentSkill,
        ]),
      );

    const alignmentInputs: AlignmentSkillInput[] =
      role.roleSkills.map((roleSkill) => {
        const studentSkill =
          studentSkillMap.get(
            roleSkill.skillId,
          );

        const project =
          projectEvidence.get(
            roleSkill.skillId,
          );

        const evidenceLevel =
          getEffectiveEvidenceLevel(
            studentSkill?.evidenceLevel ??
              'MISSING',
            project?.levels ?? [],
          );

        return {
          skillId: roleSkill.skillId,
          skillName: roleSkill.skill.name,
          isCore: roleSkill.isCore,
          relevanceScore:
            roleSkill.relevanceScore,

          knowledgeLevel:
            studentSkill?.knowledgeLevel ??
            'NONE',

          abilityLevel:
            studentSkill?.abilityLevel ??
            'NONE',

          evidenceLevel,

          projectEvidenceCount:
            project?.count ?? 0,
        };
      });

    const calculated =
      calculateRoleAlignment(
        alignmentInputs,
      );

    const skillResults =
      alignmentInputs.map(
        calculateSkillAlignment,
      );

    const coreSkills =
      alignmentInputs.filter(
        (skill) => skill.isCore,
      ).length;

    return {
      roleId: role.id,
      roleCode: role.code,
      roleName: role.name,

      alignment: calculated.level,
      alignmentScore: calculated.score,

      totalRoleSkills:
        alignmentInputs.length,

      coreSkills,

      coveredSkills:
        calculated.coveredSkills,

      coreSkillsCovered:
        calculated.coreSkillsCovered,

      skills: skillResults,

      explanation:
        buildRoleExplanation(
          calculated.level,
          calculated.score,
          calculated.coreSkillsCovered,
          coreSkills,
        ),
    };
  }

  async analyzeAllRoles(
    studentId: string,
  ): Promise<RoleAlignmentResult[]> {
    const roles =
      await this.options.prisma.role.findMany({
        orderBy: {
          name: 'asc',
        },
      });

    const results: RoleAlignmentResult[] = [];

    for (const role of roles) {
      results.push(
        await this.analyzeRole(
          studentId,
          role.id,
        ),
      );
    }

    return results;
  }

  async analyzeGaps(
    studentId: string,
    roleId: string,
  ): Promise<GapAnalysisResult> {
    const role =
      await this.options.prisma.role.findUnique({
        where: {
          id: roleId,
        },
        include: {
          roleSkills: {
            include: {
              skill: true,
            },
          },
        },
      });

    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    const studentSkills =
      await this.options.prisma.studentSkill.findMany({
        where: {
          studentId,
        },
      });

    const studentSkillMap =
      new Map(
        studentSkills.map((skill) => [
          skill.skillId,
          skill,
        ]),
      );

    const projectSkills =
      await this.options.prisma.projectSkill.findMany({
        where: {
          project: {
            studentId,
          },
        },
      });

    const projectEvidenceCount =
      new Map<string, number>();

    const projectEvidenceLevels =
      new Map<string, string[]>();

    for (const projectSkill of projectSkills) {
      projectEvidenceCount.set(
        projectSkill.skillId,
        (projectEvidenceCount.get(
          projectSkill.skillId,
        ) ?? 0) + 1,
      );

      const levels =
        projectEvidenceLevels.get(
          projectSkill.skillId,
        ) ?? [];

      levels.push(
        projectSkill.evidenceLevel,
      );

      projectEvidenceLevels.set(
        projectSkill.skillId,
        levels,
      );
    }

    const gaps = [];

    for (const roleSkill of role.roleSkills) {
      const market =
        await this.getMarketDemand(
          role.id,
          roleSkill.skillId,
        );

      const student =
        studentSkillMap.get(
          roleSkill.skillId,
        );

      const effectiveEvidence =
        getEffectiveEvidenceLevel(
          student?.evidenceLevel ??
            'MISSING',
          projectEvidenceLevels.get(
            roleSkill.skillId,
          ) ?? [],
        );

      const gap = analyzeSkillGap({
        skillId: roleSkill.skillId,
        skillName: roleSkill.skill.name,

        marketDemandPercentage:
          market.demandPercentage,

        marketJobCount:
          market.jobCount,

        marketDatasetSize:
          market.datasetSize,

        knowledgeLevel:
          student?.knowledgeLevel ??
          'NONE',

        abilityLevel:
          student?.abilityLevel ??
          'NONE',

        evidenceLevel:
          effectiveEvidence,

        projectEvidenceCount:
          projectEvidenceCount.get(
            roleSkill.skillId,
          ) ?? 0,

        marketSkillThresholdPercentage:
          this.threshold,
      });

      if (gap) {
        gaps.push(gap);
      }
    }

    return {
      roleId: role.id,
      roleCode: role.code,
      roleName: role.name,

      marketSkillThresholdPercentage:
        this.threshold,

      datasetSize:
        await this.getRoleDatasetSize(
          role.id,
        ),

      gaps,
    };
  }

  private async getMarketDemand(
    roleId: string,
    skillId: string,
  ): Promise<{
    demandPercentage: number;
    jobCount: number;
    datasetSize: number;
  }> {
    const now = new Date();

    const freshnessDays =
      this.getFreshnessDays();

    const freshnessCutoff =
      new Date(
        now.getTime() -
          freshnessDays *
            24 *
            60 *
            60 *
            1000,
      );

    const jobs =
      await this.options.prisma.jobPosting.findMany({
        where: {
          primaryRoleId: roleId,

          entryLevelStatus: 'ACCEPTED',

          processingStatus: 'PROCESSED',

          status: {
            not: 'EXPIRED',
          },

          lastCheckedAt: {
            gte: freshnessCutoff,
          },

          location: {
            contains: 'India',
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          skills: {
            where: {
              skillId,
            },
            select: {
              skillId: true,
            },
          },
        },
      });

    const datasetSize = jobs.length;

    const jobCount =
      jobs.filter(
        (job) => job.skills.length > 0,
      ).length;

    const demandPercentage =
      datasetSize === 0
        ? 0
        : (jobCount / datasetSize) * 100;

    return {
      demandPercentage,
      jobCount,
      datasetSize,
    };
  }

  private async getRoleDatasetSize(
    roleId: string,
  ): Promise<number> {
    const now = new Date();

    const freshnessDays =
      this.getFreshnessDays();

    const cutoff =
      new Date(
        now.getTime() -
          freshnessDays *
            24 *
            60 *
            60 *
            1000,
      );

    return this.options.prisma.jobPosting.count({
      where: {
        primaryRoleId: roleId,
        entryLevelStatus: 'ACCEPTED',
        processingStatus: 'PROCESSED',
        status: {
          not: 'EXPIRED',
        },
        lastCheckedAt: {
          gte: cutoff,
        },
        location: {
          contains: 'India',
          mode: 'insensitive',
        },
      },
    });
  }

  private getFreshnessDays(): number {
    const value =
      process.env.JOB_FRESHNESS_DAYS;

    if (!value) {
      return 30;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) &&
      parsed > 0
      ? parsed
      : 30;
  }
}

function getEffectiveEvidenceLevel(
  studentEvidence:
    | 'MISSING'
    | 'PARTIAL'
    | 'GOOD'
    | 'STRONG',
  projectEvidence: string[],
):
  | 'MISSING'
  | 'PARTIAL'
  | 'GOOD'
  | 'STRONG' {
  const levels = [
    'MISSING',
    'PARTIAL',
    'GOOD',
    'STRONG',
  ] as const;

  let strongest =
    levels.indexOf(studentEvidence);

  for (const level of projectEvidence) {
    const index =
      levels.indexOf(
        level as
          | 'MISSING'
          | 'PARTIAL'
          | 'GOOD'
          | 'STRONG',
      );

    if (index > strongest) {
      strongest = index;
    }
  }

  return levels[strongest];
}

function buildRoleExplanation(
  level:
    | 'Strong'
    | 'Good'
    | 'Possible'
    | 'Needs Development',
  score: number,
  coreCovered: number,
  coreTotal: number,
): string {
  return `${level} alignment with a deterministic alignment score of ${score}. ${coreCovered} of ${coreTotal} core skills currently have recorded ability.`;
}