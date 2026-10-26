import { Router } from 'express';

import {
  requireAuth,
} from '../middleware/auth.middleware.js';

import {
  getRoleAlignment,
  getRoleDiscovery,
  getRoleGaps,
  getTargetRoleAlignment,
  getTargetRoleGaps,
} from './alignment.controller.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/target',
  getTargetRoleAlignment,
);

router.get(
  '/discovery',
  getRoleDiscovery,
);

router.get(
  '/roles/:roleId',
  getRoleAlignment,
);

router.get(
  '/gaps/target',
  getTargetRoleGaps,
);

router.get(
  '/gaps/roles/:roleId',
  getRoleGaps,
);

export default router;