import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

const bootstrap = async () => {
  try {
    if (env.mongoUri) {
      await connectDatabase(env.mongoUri);
      console.log('MongoDB connected');
    } else {
      console.warn('MONGODB_URI is not set. Starting API without database connection.');
    }
    app.listen(env.port, () => {
      console.log(`APIPilot AI API running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start API server', error);
    process.exit(1);
  }
};

bootstrap();
