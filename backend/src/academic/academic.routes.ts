import {
  Router,
} from 'express';

import {
  requireAuth,
} from '../middleware/auth.middleware.js';

import {
  createAcademicEvent,
  listAcademicEvents,
  getAcademicEvent,
  updateAcademicEvent,
  deleteAcademicEvent,
  getAcademicConstraint,
} from './academic.controller.js';

const router =
  Router();

router.use(requireAuth);

router.post(
  '/',
  createAcademicEvent,
);

router.get(
  '/',
  listAcademicEvents,
);

router.get(
  '/constraint',
  getAcademicConstraint,
);

router.get(
  '/:eventId',
  getAcademicEvent,
);

router.patch(
  '/:eventId',
  updateAcademicEvent,
);

router.delete(
  '/:eventId',
  deleteAcademicEvent,
);

export default router;