import type {
  PrismaClient,
  EvidenceLevel,
} from '@prisma/client';

import {
  AlignmentService,
} from '../alignment/alignment.service.js';

import {
  AcademicService,
} from '../academic/academic.service.js';

import {
  calculatePriority,
} from './priority.engine.js';

import {
  GAP_SEVERITY,
  EVIDENCE_GAP,
  ROLE_RELEVANCE,
} from './priority.constants.js';

import type {
  PriorityWeights,
} from './priority.types.js';

interface RecommendationOptions {
  priorityWeights?: PriorityWeights;
}

export class RecommendationService {
  private readonly alignmentService: AlignmentService;
  private readonly academicService: AcademicService;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly options:
      RecommendationOptions = {},
  ) {
    this.alignmentService =
      new AlignmentService({
        prisma,
      });

    this.academicService =
      new AcademicService(prisma);
  }

  async generateForTargetRole(
    studentId: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: studentId,
        },
        select: {
          targetRoleId: true,
          careerHoursPerWeek: true,
        },
      });

    if (!user?.targetRoleId) {
      throw new Error(
        'TARGET_ROLE_NOT_SET',
      );
    }

    return this.generateForRole(
      studentId,
      user.targetRoleId,
      user.careerHoursPerWeek,
    );
  }

  async generateForRole(
    studentId: string,
    roleId: string,
    careerHoursPerWeek?: number,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: studentId,
        },
        select: {
          careerHoursPerWeek: true,
        },
      });

    if (!user) {
      throw new Error(
        'USER_NOT_FOUND',
      );
    }

    const hours =
      careerHoursPerWeek ??
      user.careerHoursPerWeek;

    const alignment =
      await this.alignmentService.analyzeRole(
        studentId,
        roleId,
      );

    const gaps =
      await this.alignmentService.analyzeGaps(
        studentId,
        roleId,
      );

    const academic =
      await this.academicService.getCurrentConstraint(
        studentId,
      );

    /*
     * Re-generate active recommendations for
     * the current state rather than accumulating
     * stale duplicates.
     */
    await this.prisma.recommendation.updateMany({
      where: {
        studentId,
        roleId,
        status: 'ACTIVE',
      },
      data: {
        status: 'DISMISSED',
      },
    });

    const recommendations = [];

    for (const gap of gaps.gaps) {
      const roleSkill =
        alignment.skills.find(
          (skill) =>
            skill.skillId ===
            gap.skillId,
        );

      if (!roleSkill) {
        continue;
      }

      const roleRelevance =
        roleSkill.isCore
          ? ROLE_RELEVANCE.CORE
          : roleSkill.relevanceScore >= 75
            ? ROLE_RELEVANCE.STRONGLY_RELEVANT
            : roleSkill.relevanceScore >= 50
              ? ROLE_RELEVANCE.USEFUL
              : roleSkill.relevanceScore >= 25
                ? ROLE_RELEVANCE.PERIPHERAL
                : ROLE_RELEVANCE.IRRELEVANT;

      const gapSeverity =
        calculateGapSeverity(
          gap.knowledgeLevel,
          gap.abilityLevel,
          gap.evidenceLevel,
        );

      const evidenceGap =
        calculateEvidenceGap(
          gap.evidenceLevel,
        );

      const priority =
        calculatePriority(
          {
            marketRelevance:
              gap.marketDemandPercentage,

            roleRelevance,

            gapSeverity,

            evidenceGap,

            academicConstraint:
              academic.score,
          },
          this.options.priorityWeights,
        );

      const effortHours =
        calculateEffortHours(
          academic.score,
          hours,
        );

      const recommendation =
        await this.prisma.recommendation.create({
          data: {
            studentId,
            roleId,
            skillId:
              gap.skillId,

            status: 'ACTIVE',

            priorityScore:
              priority.priorityScore,

            what:
              buildWhat(
                gap.skillName,
                academic.score,
              ),

            why:
              buildWhy(
                gap,
                academic.score,
              ),

            how:
              buildHow(
                gap.skillName,
                academic.score,
              ),

            effortHours,

            proof:
              buildProof(
                gap.skillName,
              ),

            when:
              buildWhen(
                academic.score,
                academic.activeEventCount,
              ),

            marketRelevance:
              priority.marketRelevance,

            roleRelevance:
              priority.roleRelevance,

            gapSeverity:
              priority.gapSeverity,

            evidenceGap:
              priority.evidenceGap,

            academicConstraint:
              priority.academicConstraint,
          },
        });

      recommendations.push(
        recommendation,
      );
    }

    return {
      roleId,
      roleCode:
        alignment.roleCode,
      roleName:
        alignment.roleName,

      academicConstraint:
        academic,

      careerHoursPerWeek:
        hours,

      recommendations:
        recommendations.sort(
          (a, b) =>
            b.priorityScore -
            a.priorityScore,
        ),
    };
  }

  async listActive(
    studentId: string,
  ) {
    return this.prisma.recommendation.findMany({
      where: {
        studentId,
        status: 'ACTIVE',
      },
      include: {
        role: true,
        skill: true,
      },
      orderBy: {
        priorityScore: 'desc',
      },
    });
  }

  async getById(
    studentId: string,
    recommendationId: string,
  ) {
    const result =
      await this.prisma.recommendation.findFirst({
        where: {
          id: recommendationId,
          studentId,
        },
        include: {
          role: true,
          skill: true,
        },
      });

    if (!result) {
      throw new Error(
        'RECOMMENDATION_NOT_FOUND',
      );
    }

    return result;
  }

  async complete(
    studentId: string,
    recommendationId: string,
  ) {
    const existing =
      await this.getById(
        studentId,
        recommendationId,
      );

    return this.prisma.recommendation.update({
      where: {
        id: existing.id,
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  async dismiss(
    studentId: string,
    recommendationId: string,
  ) {
    const existing =
      await this.getById(
        studentId,
        recommendationId,
      );

    return this.prisma.recommendation.update({
      where: {
        id: existing.id,
      },
      data: {
        status: 'DISMISSED',
      },
    });
  }
}

function calculateGapSeverity(
  knowledge: string,
  ability: string,
  evidence: EvidenceLevel,
): number {
  if (knowledge === 'NONE') {
    return GAP_SEVERITY.MISSING_SKILL;
  }

  if (
    ability === 'NONE' ||
    ability === 'BASIC'
  ) {
    return GAP_SEVERITY.BASIC_KNOWLEDGE_NO_ABILITY;
  }

  if (
    ability === 'WORKING' &&
    evidence === 'MISSING'
  ) {
    return GAP_SEVERITY.WORKING_ABILITY_NO_EVIDENCE;
  }

  if (
    evidence === 'PARTIAL'
  ) {
    return GAP_SEVERITY.PARTIAL_EVIDENCE;
  }

  return GAP_SEVERITY.STRONG_EVIDENCE;
}

function calculateEvidenceGap(
  evidence: EvidenceLevel,
): number {
  switch (evidence) {
    case 'MISSING':
      return EVIDENCE_GAP.NONE;

    case 'PARTIAL':
      return EVIDENCE_GAP.PARTIAL;

    case 'GOOD':
      return EVIDENCE_GAP.GOOD;

    case 'STRONG':
      return EVIDENCE_GAP.STRONG;
  }
}

function calculateEffortHours(
  academicConstraint: number,
  careerHoursPerWeek: number,
): number {
  if (academicConstraint >= 100) {
    return Math.min(
      4,
      Math.max(2, careerHoursPerWeek),
    );
  }

  if (academicConstraint >= 60) {
    return Math.min(
      6,
      Math.max(2, careerHoursPerWeek),
    );
  }

  if (academicConstraint >= 20) {
    return Math.min(
      8,
      Math.max(2, careerHoursPerWeek),
    );
  }

  return Math.min(
    15,
    Math.max(8, careerHoursPerWeek),
  );
}

function buildWhat(
  skillName: string,
  academicConstraint: number,
): string {
  if (academicConstraint >= 60) {
    return `Complete a focused ${skillName} micro-action in an existing project.`;
  }

  return `Build or extend a meaningful ${skillName} feature in an existing project.`;
}

function buildWhy(
  gap: {
    skillName: string;
    marketDemandPercentage: number;
    abilityLevel: string;
    evidenceLevel: string;
  },
  academicConstraint: number,
): string {
  const workloadText =
    academicConstraint >= 60
      ? 'Your current academic workload is also high, so the recommended scope is intentionally smaller.'
      : 'Your current academic constraint does not require reducing the action to a micro-task.';

  return `${gap.skillName} appears in ${gap.marketDemandPercentage.toFixed(
    1,
  )}% of the current analyzed postings for this role. Your recorded ability is ${gap.abilityLevel.toLowerCase()} and evidence is ${gap.evidenceLevel.toLowerCase()}. ${workloadText}`;
}

function buildHow(
  skillName: string,
  academicConstraint: number,
): string {
  if (academicConstraint >= 60) {
    return [
      `1. Select one existing project feature involving ${skillName}.`,
      `2. Improve or implement one focused part.`,
      '3. Test the change.',
      '4. Document what you implemented.',
      '5. Add the result as student-provided project evidence.',
    ].join('\n');
  }

  return [
    `1. Select a project feature that requires ${skillName}.`,
    `2. Implement the feature end-to-end.`,
    '3. Test the implementation.',
    '4. Document the technical decisions.',
    '5. Push the completed work to the project repository.',
    '6. Add the result as student-provided project evidence.',
  ].join('\n');
}

function buildProof(
  skillName: string,
): string {
  return `Student-provided project evidence demonstrating ${skillName}, including implementation notes and repository changes.`;
}

function buildWhen(
  academicConstraint: number,
  eventCount: number,
): string {
  if (academicConstraint >= 100) {
    return eventCount > 0
      ? 'Use a short micro-action around the current academic event period.'
      : 'Complete a short micro-action this week.';
  }

  if (academicConstraint >= 60) {
    return 'Complete this in a short career-work session before the next major academic deadline.';
  }

  return 'Complete this during the current career-work cycle.';
}