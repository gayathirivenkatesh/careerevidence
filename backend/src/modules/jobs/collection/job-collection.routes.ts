import { Router } from 'express';

import {
  JobCollectionScheduler,
} from './job-collection.scheduler.js';

export function createJobCollectionRouter(
  scheduler: JobCollectionScheduler,
): Router {
  const router = Router();

  /**
   * TEMPORARY INTERNAL ENDPOINT
   *
   * Authentication/admin authorization is not implemented yet.
   * This route will be protected when the auth module is added.
   */
  router.post('/run', async (_req, res) => {
    try {
      const result =
        await scheduler.runCollection();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        '[JobCollection] Manual collection failed:',
        error,
      );

      res.status(500).json({
        success: false,
        error: 'Job collection failed.',
      });
    }
  });

  return router;
}