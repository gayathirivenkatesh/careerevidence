import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserService } from './user.service.js';
import type { UpdateProfileInput } from './user.types.js';

const prisma = new PrismaClient();
const userService = new UserService(prisma);

export async function getProfile(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
    });
    return;
  }

  try {
    const profile = await userService.getProfile(req.user.id);

    res.status(200).json({
      data: profile,
    });
  } catch (error) {
    handleUserError(error, res);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
    });
    return;
  }

  try {
    const body = req.body ?? {};

    const allowedFields = [
      'name',
      'education',
      'graduationYear',
      'targetRoleId',
      'careerHoursPerWeek',
    ];

    for (const key of Object.keys(body)) {
      if (!allowedFields.includes(key)) {
        res.status(400).json({
          error: 'INVALID_PROFILE_FIELD',
          message: `Field "${key}" cannot be updated`,
        });
        return;
      }
    }

    const input: UpdateProfileInput = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        res.status(400).json({
          error: 'INVALID_NAME',
        });
        return;
      }

      input.name = body.name;
    }

    if (body.education !== undefined) {
      if (
        body.education !== null &&
        typeof body.education !== 'string'
      ) {
        res.status(400).json({
          error: 'INVALID_EDUCATION',
        });
        return;
      }

      input.education = body.education;
    }

    if (body.graduationYear !== undefined) {
      if (
        body.graduationYear !== null &&
        typeof body.graduationYear !== 'number'
      ) {
        res.status(400).json({
          error: 'INVALID_GRADUATION_YEAR',
        });
        return;
      }

      input.graduationYear = body.graduationYear;
    }

    if (body.targetRoleId !== undefined) {
      if (
        body.targetRoleId !== null &&
        typeof body.targetRoleId !== 'string'
      ) {
        res.status(400).json({
          error: 'INVALID_TARGET_ROLE',
        });
        return;
      }

      input.targetRoleId = body.targetRoleId;
    }

    if (body.careerHoursPerWeek !== undefined) {
      if (typeof body.careerHoursPerWeek !== 'number') {
        res.status(400).json({
          error: 'INVALID_CAREER_HOURS',
        });
        return;
      }

      input.careerHoursPerWeek = body.careerHoursPerWeek;
    }

    const profile = await userService.updateProfile(
      req.user.id,
      input,
    );

    res.status(200).json({
      data: profile,
    });
  } catch (error) {
    handleUserError(error, res);
  }
}

function handleUserError(
  error: unknown,
  res: Response,
): void {
  const message =
    error instanceof Error ? error.message : 'UNKNOWN_ERROR';

  switch (message) {
    case 'USER_NOT_FOUND':
      res.status(404).json({
        error: 'USER_NOT_FOUND',
      });
      return;

    case 'INVALID_NAME':
      res.status(400).json({
        error: 'INVALID_NAME',
      });
      return;

    case 'INVALID_CAREER_HOURS':
      res.status(400).json({
        error: 'INVALID_CAREER_HOURS',
        message: 'Career hours per week must be between 1 and 168',
      });
      return;

    case 'INVALID_GRADUATION_YEAR':
      res.status(400).json({
        error: 'INVALID_GRADUATION_YEAR',
      });
      return;

    case 'INVALID_TARGET_ROLE':
      res.status(400).json({
        error: 'INVALID_TARGET_ROLE',
      });
      return;

    default:
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
      });
  }
}