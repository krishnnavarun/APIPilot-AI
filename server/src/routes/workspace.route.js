import express from 'express';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
} from '../controllers/workspace.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET all workspaces for current user
router.get('/', getWorkspaces);

// POST create new workspace
router.post('/', createWorkspace);

// GET specific workspace
router.get('/:id', getWorkspaceById);

// PATCH update workspace
router.patch('/:id', updateWorkspace);

// DELETE workspace
router.delete('/:id', deleteWorkspace);

// POST add member to workspace
router.post('/:id/members', addWorkspaceMember);

// DELETE remove member from workspace
router.delete('/:id/members/:memberId', removeWorkspaceMember);

export default router;
