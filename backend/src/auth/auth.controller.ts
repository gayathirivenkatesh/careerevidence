import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from './auth.service.js';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

export async function register(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email, password, name } = req.body ?? {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof name !== 'string'
    ) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'email, password and name are required',
      });
      return;
    }

    const result = await authService.register({
      email,
      password,
      name,
    });

    res.status(201).json({
      data: result,
    });
  } catch (error) {
    handleAuthError(error, res);
  }
}

export async function login(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'email and password are required',
      });
      return;
    }

    const result = await authService.login({
      email,
      password,
    });

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    handleAuthError(error, res);
  }
}

export async function getMe(
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
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        targetRoleId: true,
        careerHoursPerWeek: true,
        education: true,
        graduationYear: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      data: user,
    });
  } catch {
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
}

function handleAuthError(
  error: unknown,
  res: Response,
): void {
  const message =
    error instanceof Error ? error.message : 'UNKNOWN_ERROR';

  switch (message) {
    case 'EMAIL_ALREADY_EXISTS':
      res.status(409).json({
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists',
      });
      return;

    case 'INVALID_CREDENTIALS':
      res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;

    case 'INVALID_EMAIL':
      res.status(400).json({
        error: 'INVALID_EMAIL',
      });
      return;

    case 'INVALID_NAME':
      res.status(400).json({
        error: 'INVALID_NAME',
      });
      return;

    case 'PASSWORD_TOO_SHORT':
      res.status(400).json({
        error: 'PASSWORD_TOO_SHORT',
        message: 'Password must contain at least 8 characters',
      });
      return;

    default:
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
      });
  }
}