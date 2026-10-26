import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getProfile,
  updateProfile,
} from './user.controller.js';

const router = Router();

router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, updateProfile);

export default router;