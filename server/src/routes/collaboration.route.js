import express from 'express';
import {
  createComment,
  getCommentsByEndpoint,
  updateComment,
  deleteComment,
  resolveComment,
  getActivityFeed,
  logActivity,
} from '../controllers/collaboration.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Comments
router.post('/comments', createComment);
router.get('/comments/endpoint/:endpointId', getCommentsByEndpoint);
router.patch('/comments/:id', updateComment);
router.delete('/comments/:id', deleteComment);
router.patch('/comments/:id/resolve', resolveComment);

// Activity Feed
router.get('/activity/:projectId', getActivityFeed);
router.post('/activity', logActivity);

export default router;
