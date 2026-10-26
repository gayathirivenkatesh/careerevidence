import { Router } from 'express';
import {
  getRole,
  listRoles,
} from './role.controller.js';

const router = Router();

router.get('/', listRoles);
router.get('/:id', getRole);

export default router;