import type { PrismaClient } from '@prisma/client';
import type { UpdateProfileInput } from './user.types.js';

export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        targetRole: true,
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return this.toSafeProfile(user);
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ) {
    if (input.name !== undefined) {
      if (!input.name.trim()) {
        throw new Error('INVALID_NAME');
      }
    }

    if (input.careerHoursPerWeek !== undefined) {
      if (
        !Number.isInteger(input.careerHoursPerWeek) ||
        input.careerHoursPerWeek < 1 ||
        input.careerHoursPerWeek > 168
      ) {
        throw new Error('INVALID_CAREER_HOURS');
      }
    }

    if (input.graduationYear !== undefined && input.graduationYear !== null) {
      if (
        !Number.isInteger(input.graduationYear) ||
        input.graduationYear < 1900
      ) {
        throw new Error('INVALID_GRADUATION_YEAR');
      }
    }

    if (input.targetRoleId !== undefined && input.targetRoleId !== null) {
      const role = await this.prisma.role.findUnique({
        where: {
          id: input.targetRoleId,
        },
      });

      if (!role) {
        throw new Error('INVALID_TARGET_ROLE');
      }
    }

    const data: {
      name?: string;
      education?: string | null;
      graduationYear?: number | null;
      targetRoleId?: string | null;
      careerHoursPerWeek?: number;
    } = {};

    if (input.name !== undefined) {
      data.name = input.name.trim();
    }

    if (input.education !== undefined) {
      data.education = input.education?.trim() || null;
    }

    if (input.graduationYear !== undefined) {
      data.graduationYear = input.graduationYear;
    }

    if (input.targetRoleId !== undefined) {
      data.targetRoleId = input.targetRoleId;
    }

    if (input.careerHoursPerWeek !== undefined) {
      data.careerHoursPerWeek = input.careerHoursPerWeek;
    }

    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data,
      include: {
        targetRole: true,
      },
    });

    return this.toSafeProfile(user);
  }

  private toSafeProfile(user: {
    id: string;
    email: string;
    name: string;
    education: string | null;
    graduationYear: number | null;
    careerHoursPerWeek: number;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    targetRole: {
      id: string;
      code: string;
      name: string;
      description: string;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      education: user.education,
      graduationYear: user.graduationYear,
      targetRole: user.targetRole,
      careerHoursPerWeek: user.careerHoursPerWeek,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}