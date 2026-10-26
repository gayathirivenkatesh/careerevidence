import type { PrismaClient } from '@prisma/client';

import type {
  CreateProjectInput,
  UpdateProjectInput,
} from './project.types.js';

export class ProjectService {
  constructor(
    private readonly prisma: PrismaClient,
  ) {}

  async createProject(
    studentId: string,
    input: CreateProjectInput,
  ) {
    this.validateProjectInput(input);

    return this.prisma.project.create({
      data: {
        studentId,
        title: input.title.trim(),
        description: input.description.trim(),

        githubUrl:
          this.normalizeOptionalString(
            input.githubUrl,
          ),

        liveUrl:
          this.normalizeOptionalString(
            input.liveUrl,
          ),

        // Your Prisma schema requires features
        features:
          this.normalizeRequiredString(
            input.features,
          ),

        implementationNotes:
          this.normalizeOptionalString(
            input.implementationNotes,
          ),
      },

      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  async getProjects(studentId: string) {
    return this.prisma.project.findMany({
      where: {
        studentId,
      },

      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getProject(
    studentId: string,
    projectId: string,
  ) {
    const project =
      await this.prisma.project.findFirst({
        where: {
          id: projectId,
          studentId,
        },

        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return project;
  }

  async updateProject(
    studentId: string,
    projectId: string,
    input: UpdateProjectInput,
  ) {
    const existing =
      await this.prisma.project.findFirst({
        where: {
          id: projectId,
          studentId,
        },
      });

    if (!existing) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    if (
      input.title !== undefined &&
      !input.title.trim()
    ) {
      throw new Error('INVALID_TITLE');
    }

    if (
      input.description !== undefined &&
      !input.description.trim()
    ) {
      throw new Error('INVALID_DESCRIPTION');
    }

    const data: {
      title?: string;
      description?: string;
      githubUrl?: string | null;
      liveUrl?: string | null;
      features?: string;
      implementationNotes?: string | null;
    } = {};

    if (input.title !== undefined) {
      data.title = input.title.trim();
    }

    if (input.description !== undefined) {
      data.description =
        input.description.trim();
    }

    if (input.githubUrl !== undefined) {
      data.githubUrl =
        this.normalizeOptionalString(
          input.githubUrl,
        );
    }

    if (input.liveUrl !== undefined) {
      data.liveUrl =
        this.normalizeOptionalString(
          input.liveUrl,
        );
    }

    if (input.features !== undefined) {
      data.features =
        this.normalizeRequiredString(
          input.features,
        );
    }

    if (
      input.implementationNotes !== undefined
    ) {
      data.implementationNotes =
        this.normalizeOptionalString(
          input.implementationNotes,
        );
    }

    return this.prisma.project.update({
      where: {
        id: projectId,
      },

      data,

      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  async deleteProject(
    studentId: string,
    projectId: string,
  ): Promise<void> {
    const existing =
      await this.prisma.project.findFirst({
        where: {
          id: projectId,
          studentId,
        },
      });

    if (!existing) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    await this.prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  }

  private validateProjectInput(
    input: CreateProjectInput,
  ): void {
    if (!input.title?.trim()) {
      throw new Error('INVALID_TITLE');
    }

    if (!input.description?.trim()) {
      throw new Error('INVALID_DESCRIPTION');
    }
  }

  private normalizeOptionalString(
    value: string | null | undefined,
  ): string | null {
    if (
      value === undefined ||
      value === null
    ) {
      return null;
    }

    const normalized = value.trim();

    return normalized || null;
  }

  private normalizeRequiredString(
    value: string | null | undefined,
  ): string {
    if (
      value === undefined ||
      value === null
    ) {
      return '';
    }

    return value.trim();
  }
}