import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '8080', 10),
  mongoUri: process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
};
