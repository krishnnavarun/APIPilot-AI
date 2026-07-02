import express from 'express';
import {
  createTestCase,
  getTestCasesByProject,
  getTestCasesByEndpoint,
  runTestCase,
  updateTestCase,
  deleteTestCase,
} from '../controllers/testcase.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET test cases by project
router.get('/project/:projectId', getTestCasesByProject);

// GET test cases by endpoint
router.get('/endpoint/:endpointId', getTestCasesByEndpoint);

// POST create new test case
router.post('/', createTestCase);

// POST run test case
router.post('/:id/run', runTestCase);

// PATCH update test case
router.patch('/:id', updateTestCase);

// DELETE test case
router.delete('/:id', deleteTestCase);

export default router;
