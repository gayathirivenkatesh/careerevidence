import {
  Router,
} from 'express';

import {
  PrismaClient,
} from '@prisma/client';

import {
  MarketAnalyticsService,
} from './market-analytics.service';

export function createMarketAnalyticsRouter(
  prisma: PrismaClient,
  options: {
    freshnessDays: number;
    minimumSampleSize: number;
  },
): Router {
  const router =
    Router();

  router.get(
    '/',
    async (_req, res) => {
      try {
        const service =
          new MarketAnalyticsService({
            prisma,
            freshnessDays:
              options.freshnessDays,
            minimumSampleSize:
              options.minimumSampleSize,
          });

        const result =
          await service.generateAnalytics();

        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (error) {
        console.error(
          '[MarketAnalytics] Failed:',
          error,
        );

        res.status(500).json({
          success: false,
          error:
            'Failed to generate market analytics.',
        });
      }
    },
  );

  return router;
}