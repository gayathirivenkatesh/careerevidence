import type { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';
import { AlignmentService } from './alignment.service.js';
import { GapService } from '../gaps/gap.service.js';

const prisma = new PrismaClient();

const alignmentService = new AlignmentService({ prisma });
const gapService = new GapService(prisma);

export async function getTargetRoleAlignment(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { targetRoleId: true },
    });

    if (!user?.targetRoleId) {
      res.status(400).json({
        error: 'TARGET_ROLE_NOT_SET',
        message: 'Set a target role before requesting target-role alignment.',
      });
      return;
    }

    const result = await alignmentService.analyzeRole(
      req.user.id,
      user.targetRoleId,
    );

    res.status(200).json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function getRoleAlignment(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const result = await alignmentService.analyzeRole(
      req.user.id,
      req.params.roleId,
    );

    res.status(200).json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function getRoleDiscovery(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const results = await alignmentService.analyzeAllRoles(req.user.id);

    res.status(200).json({ data: results });
  } catch {
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
}

export async function getTargetRoleGaps(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { targetRoleId: true },
    });

    if (!user?.targetRoleId) {
      res.status(400).json({
        error: 'TARGET_ROLE_NOT_SET',
      });
      return;
    }

    const result = await gapService.getRoleGaps(
      req.user.id,
      user.targetRoleId,
    );

    res.status(200).json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function getRoleGaps(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const result = await gapService.getRoleGaps(
      req.user.id,
      req.params.roleId,
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

  if (message === 'ROLE_NOT_FOUND') {
    res.status(404).json({
      error: 'ROLE_NOT_FOUND',
    });
    return;
  }

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
  });
}