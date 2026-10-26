import {
  Router,
} from 'express';

import {
  requireAuth,
} from '../middleware/auth.middleware.js';

import {
  generateTargetRecommendations,
  generateRoleRecommendations,
  listRecommendations,
  getRecommendation,
  completeRecommendation,
  dismissRecommendation,
} from './recommendation.controller.js';

const router =
  Router();

router.use(requireAuth);

router.post(
  '/generate/target',
  generateTargetRecommendations,
);

router.post(
  '/generate/roles/:roleId',
  generateRoleRecommendations,
);

router.get(
  '/',
  listRecommendations,
);

router.get(
  '/:recommendationId',
  getRecommendation,
);

router.post(
  '/:recommendationId/complete',
  completeRecommendation,
);

router.post(
  '/:recommendationId/dismiss',
  dismissRecommendation,
);

export default router;