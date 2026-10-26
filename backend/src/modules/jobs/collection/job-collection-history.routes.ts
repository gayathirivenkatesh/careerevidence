import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export function createJobCollectionHistoryRouter(): Router {
  const router = Router();

  router.get('/runs', async (_req, res) => {
    try {
      const runs = await prisma.jobCollectionRun.findMany({
        orderBy: {
          startedAt: 'desc',
        },
        take: 20,
        select: {
          id: true,
          provider: true,
          status: true,
          startedAt: true,
          finishedAt: true,
          queriesExecuted: true,
          jobsReceived: true,
          jobsNew: true,
          jobsUpdated: true,
          jobsDuplicate: true,
          jobsRejected: true,
          jobsReview: true,
          jobsAccepted: true,
          errors: true,
          errorSummary: true,
          queryDetails: true,
          createdAt: true,
        },
      });

      res.status(200).json({
        success: true,
        data: runs,
      });
    } catch (error) {
      console.error('[JobCollectionHistory] Failed to fetch runs:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to fetch collection runs.',
      });
    }
  });

  return router;
}