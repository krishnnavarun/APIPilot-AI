import express from 'express';
import {
  createEndpoint,
  getEndpointsByProject,
  getEndpointById,
  updateEndpoint,
  deleteEndpoint,
  executeEndpoint,
} from '../controllers/endpoint.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET endpoints in project
router.get('/project/:projectId', getEndpointsByProject);

// POST create new endpoint
router.post('/', createEndpoint);

// GET specific endpoint
router.get('/:id', getEndpointById);

// PATCH update endpoint
router.patch('/:id', updateEndpoint);

// DELETE endpoint
router.delete('/:id', deleteEndpoint);

// POST execute endpoint
router.post('/:id/execute', executeEndpoint);

export default router;
