import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'apipilot-ai-api',
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
