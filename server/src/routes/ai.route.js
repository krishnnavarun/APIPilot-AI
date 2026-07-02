import express from 'express';
import {
  generateTestCases,
  generateMockData,
  analyzeSecurityVulnerabilities,
  generateDocumentation,
} from '../controllers/ai.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST generate test cases from endpoint
router.post('/generate-tests', generateTestCases);

// POST generate mock data for endpoint
router.post('/generate-mock', generateMockData);

// GET security analysis for project
router.get('/security/:projectId', analyzeSecurityVulnerabilities);

// GET documentation for project
router.get('/docs/:projectId', generateDocumentation);

export default router;
