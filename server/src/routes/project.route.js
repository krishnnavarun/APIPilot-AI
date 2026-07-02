import express from 'express';
import {
  createProject,
  getProjectsByWorkspace,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET projects in workspace
router.get('/workspace/:workspaceId', getProjectsByWorkspace);

// POST create new project
router.post('/', createProject);

// GET specific project
router.get('/:id', getProjectById);

// PATCH update project
router.patch('/:id', updateProject);

// DELETE project
router.delete('/:id', deleteProject);

export default router;
