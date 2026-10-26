import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  addProjectSkill,
  createProject,
  deleteProject,
  deleteProjectSkill,
  getProject,
  getProjects,
  updateProject,
  updateProjectSkill,
} from './project.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', getProjects);
router.post('/', createProject);

router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/skills', addProjectSkill);
router.put('/:id/skills/:skillId', updateProjectSkill);
router.delete('/:id/skills/:skillId', deleteProjectSkill);

export default router;