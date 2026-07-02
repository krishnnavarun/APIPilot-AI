import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRouter from './routes/health.route.js';
import authRouter from './routes/auth.route.js';
import workspaceRouter from './routes/workspace.route.js';
import projectRouter from './routes/project.route.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { env } from './config/env.js';

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1', (_req, res) => {
  res.status(200).json({
    message: 'APIPilot AI API is online',
  });
});

app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/workspaces', workspaceRouter);
app.use('/api/v1/projects', projectRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
