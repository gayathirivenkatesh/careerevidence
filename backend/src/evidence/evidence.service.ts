import {
  EvidenceLevel,
  type PrismaClient,
} from '@prisma/client';
import type {
  AddProjectSkillInput,
  UpdateProjectSkillInput,
} from './evidence.types.js';

export class EvidenceService {
  constructor(private readonly prisma: PrismaClient) {}

  async addSkillToProject(
    studentId: string,
    projectId: string,
    input: AddProjectSkillInput,
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        studentId,
      },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const skill = await this.prisma.skill.findUnique({
      where: {
        id: input.skillId,
      },
    });

    if (!skill) {
      throw new Error('SKILL_NOT_FOUND');
    }

    if (!Object.values(EvidenceLevel).includes(input.evidenceLevel)) {
      throw new Error('INVALID_EVIDENCE_LEVEL');
    }

    const existing = await this.prisma.projectSkill.findUnique({
      where: {
        projectId_skillId: {
          projectId,
          skillId: input.skillId,
        },
      },
    });

    if (existing) {
      throw new Error('PROJECT_SKILL_ALREADY_EXISTS');
    }

    return this.prisma.projectSkill.create({
      data: {
        projectId,
        skillId: input.skillId,
        evidenceLevel: input.evidenceLevel,
        evidenceNotes: input.evidenceNotes?.trim() || null,
      },
      include: {
        skill: true,
      },
    });
  }

  async updateProjectSkill(
    studentId: string,
    projectId: string,
    skillId: string,
    input: UpdateProjectSkillInput,
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        studentId,
      },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    if (
      input.evidenceLevel !== undefined &&
      !Object.values(EvidenceLevel).includes(input.evidenceLevel)
    ) {
      throw new Error('INVALID_EVIDENCE_LEVEL');
    }

    const projectSkill =
      await this.prisma.projectSkill.findUnique({
        where: {
          projectId_skillId: {
            projectId,
            skillId,
          },
        },
      });

    if (!projectSkill) {
      throw new Error('PROJECT_SKILL_NOT_FOUND');
    }

    const data: {
      evidenceLevel?: EvidenceLevel;
      evidenceNotes?: string | null;
    } = {};

    if (input.evidenceLevel !== undefined) {
      data.evidenceLevel = input.evidenceLevel;
    }

    if (input.evidenceNotes !== undefined) {
      data.evidenceNotes =
        input.evidenceNotes?.trim() || null;
    }

    return this.prisma.projectSkill.update({
      where: {
        projectId_skillId: {
          projectId,
          skillId,
        },
      },
      data,
      include: {
        skill: true,
      },
    });
  }

  async removeSkillFromProject(
    studentId: string,
    projectId: string,
    skillId: string,
  ): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        studentId,
      },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const projectSkill =
      await this.prisma.projectSkill.findUnique({
        where: {
          projectId_skillId: {
            projectId,
            skillId,
          },
        },
      });

    if (!projectSkill) {
      throw new Error('PROJECT_SKILL_NOT_FOUND');
    }

    await this.prisma.projectSkill.delete({
      where: {
        projectId_skillId: {
          projectId,
          skillId,
        },
      },
    });
  }
}