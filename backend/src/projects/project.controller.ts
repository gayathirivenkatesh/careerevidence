import type { Request, Response } from 'express';
import { EvidenceLevel, PrismaClient } from '@prisma/client';

import { EvidenceService } from '../evidence/evidence.service.js';
import { ProjectService } from './project.service.js';

const prisma = new PrismaClient();

const projectService = new ProjectService(prisma);
const evidenceService = new EvidenceService(prisma);

export async function createProject(
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

    const project = await projectService.createProject(
      req.user.id,
      {
        title: body.title,
        description: body.description,
        githubUrl: body.githubUrl,
        liveUrl: body.liveUrl,
        features: body.features,
        implementationNotes: body.implementationNotes,
      },
    );

    res.status(201).json({
      data: project,
    });
  } catch (error) {
    handleProjectError(error, res);
  }
}

export async function getProjects(
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
    const projects = await projectService.getProjects(
      req.user.id,
    );

    res.status(200).json({
      data: projects,
    });
  } catch {
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
}

export async function getProject(
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
    const project = await projectService.getProject(
      req.user.id,
      req.params.id,
    );

    res.status(200).json({
      data: project,
    });
  } catch (error) {
    handleProjectError(error, res);
  }
}

export async function updateProject(
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

    const project = await projectService.updateProject(
      req.user.id,
      req.params.id,
      {
        title: body.title,
        description: body.description,
        githubUrl: body.githubUrl,
        liveUrl: body.liveUrl,
        features: body.features,
        implementationNotes: body.implementationNotes,
      },
    );

    res.status(200).json({
      data: project,
    });
  } catch (error) {
    handleProjectError(error, res);
  }
}

export async function deleteProject(
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
    await projectService.deleteProject(
      req.user.id,
      req.params.id,
    );

    res.status(204).send();
  } catch (error) {
    handleProjectError(error, res);
  }
}

export async function addProjectSkill(
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

    if (typeof body.skillId !== 'string') {
      res.status(400).json({
        error: 'INVALID_SKILL',
      });
      return;
    }

    if (
      !Object.values(EvidenceLevel).includes(
        body.evidenceLevel,
      )
    ) {
      res.status(400).json({
        error: 'INVALID_EVIDENCE_LEVEL',
      });
      return;
    }

    const result =
      await evidenceService.addSkillToProject(
        req.user.id,
        req.params.id,
        {
          skillId: body.skillId,
          evidenceLevel: body.evidenceLevel,
          evidenceNotes: body.evidenceNotes,
        },
      );

    res.status(201).json({
      data: result,
    });
  } catch (error) {
    handleEvidenceError(error, res);
  }
}

export async function updateProjectSkill(
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

    const result =
      await evidenceService.updateProjectSkill(
        req.user.id,
        req.params.id,
        req.params.skillId,
        {
          evidenceLevel: body.evidenceLevel,
          evidenceNotes: body.evidenceNotes,
        },
      );

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    handleEvidenceError(error, res);
  }
}

export async function deleteProjectSkill(
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
    await evidenceService.removeSkillFromProject(
      req.user.id,
      req.params.id,
      req.params.skillId,
    );

    res.status(204).send();
  } catch (error) {
    handleEvidenceError(error, res);
  }
}

function handleProjectError(
  error: unknown,
  res: Response,
): void {
  const message =
    error instanceof Error
      ? error.message
      : 'UNKNOWN_ERROR';

  switch (message) {
    case 'PROJECT_NOT_FOUND':
      res.status(404).json({
        error: 'PROJECT_NOT_FOUND',
      });
      return;

    case 'INVALID_TITLE':
      res.status(400).json({
        error: 'INVALID_TITLE',
      });
      return;

    case 'INVALID_DESCRIPTION':
      res.status(400).json({
        error: 'INVALID_DESCRIPTION',
      });
      return;

    default:
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
      });
  }
}

function handleEvidenceError(
  error: unknown,
  res: Response,
): void {
  const message =
    error instanceof Error
      ? error.message
      : 'UNKNOWN_ERROR';

  switch (message) {
    case 'PROJECT_NOT_FOUND':
      res.status(404).json({
        error: 'PROJECT_NOT_FOUND',
      });
      return;

    case 'SKILL_NOT_FOUND':
      res.status(404).json({
        error: 'SKILL_NOT_FOUND',
      });
      return;

    case 'PROJECT_SKILL_NOT_FOUND':
      res.status(404).json({
        error: 'PROJECT_SKILL_NOT_FOUND',
      });
      return;

    case 'PROJECT_SKILL_ALREADY_EXISTS':
      res.status(409).json({
        error: 'PROJECT_SKILL_ALREADY_EXISTS',
      });
      return;

    case 'INVALID_EVIDENCE_LEVEL':
      res.status(400).json({
        error: 'INVALID_EVIDENCE_LEVEL',
      });
      return;

    default:
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
      });
  }
}