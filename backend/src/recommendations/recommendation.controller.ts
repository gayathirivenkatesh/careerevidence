import type { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';
import { RecommendationService } from './recommendation.service.js';

const prisma = new PrismaClient();
const service = new RecommendationService(prisma);

export async function generateTargetRecommendations(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const result = await service.generateForTargetRole(req.user.id);

    res.status(200).json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function generateRoleRecommendations(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const result = await service.generateForRole(
      req.user.id,
      req.params.roleId,
    );

    res.status(200).json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function listRecommendations(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const result = await service.listActive(req.user.id);

    res.status(200).json({ data: result });
  } catch {
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
}

export async function getRecommendation(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const result = await service.getById(
      req.user.id,
      req.params.recommendationId,
    );

    res.status(200).json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function completeRecommendation(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const result = await service.complete(
      req.user.id,
      req.params.recommendationId,
    );

    res.status(200).json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function dismissRecommendation(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const result = await service.dismiss(
      req.user.id,
      req.params.recommendationId,
    );

    res.status(200).json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

function handleError(
  error: unknown,
  res: Response,
): void {
  const message =
    error instanceof Error ? error.message : 'UNKNOWN_ERROR';

  if (message === 'TARGET_ROLE_NOT_SET') {
    res.status(400).json({
      error: 'TARGET_ROLE_NOT_SET',
      message:
        'Set a target role before generating recommendations.',
    });
    return;
  }

  if (message === 'RECOMMENDATION_NOT_FOUND') {
    res.status(404).json({
      error: 'RECOMMENDATION_NOT_FOUND',
    });
    return;
  }

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
  });
}