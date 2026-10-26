import type { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { AcademicService } from './academic.service.js';

const service = new AcademicService(prisma);

export async function createAcademicEvent(
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
    const result = await service.create(req.user.id, {
      type: req.body.type,
      title: req.body.title,
      description: req.body.description ?? '',
      workload: req.body.workload,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    });

    res.status(201).json({
      data: result,
    });
  } catch (error) {
    handleError(error, res);
  }
}

export async function listAcademicEvents(
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
    const result = await service.list(req.user.id);

    res.status(200).json({
      data: result,
    });
  } catch {
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
}

export async function getAcademicEvent(
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
    const result = await service.getById(
      req.user.id,
      req.params.eventId,
    );

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    handleError(error, res);
  }
}

export async function updateAcademicEvent(
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
    const result = await service.update(
      req.user.id,
      req.params.eventId,
      {
        ...(req.body.type !== undefined
          ? { type: req.body.type }
          : {}),

        ...(req.body.title !== undefined
          ? { title: req.body.title }
          : {}),

        ...(req.body.description !== undefined
          ? { description: req.body.description }
          : {}),

        ...(req.body.workload !== undefined
          ? { workload: req.body.workload }
          : {}),

        ...(req.body.startDate !== undefined
          ? {
              startDate: new Date(req.body.startDate),
            }
          : {}),

        ...(req.body.endDate !== undefined
          ? {
              endDate: new Date(req.body.endDate),
            }
          : {}),
      },
    );

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    handleError(error, res);
  }
}

export async function deleteAcademicEvent(
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
    await service.delete(
      req.user.id,
      req.params.eventId,
    );

    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
}

export async function getAcademicConstraint(
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
    const result = await service.getCurrentConstraint(
      req.user.id,
    );

    res.status(200).json({
      data: result,
    });
  } catch {
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
}

function handleError(
  error: unknown,
  res: Response,
): void {
  const message =
    error instanceof Error
      ? error.message
      : 'UNKNOWN_ERROR';

  if (
    message ===
    'ACADEMIC_EVENT_NOT_FOUND'
  ) {
    res.status(404).json({
      error: 'ACADEMIC_EVENT_NOT_FOUND',
    });
    return;
  }

  if (
    message.endsWith('_REQUIRED') ||
    message.endsWith('_TOO_LONG') ||
    message.startsWith('INVALID_') ||
    message.startsWith(
      'ACADEMIC_END_DATE',
    )
  ) {
    res.status(400).json({
      error: message,
    });
    return;
  }

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
  });
}