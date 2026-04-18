import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default(''),
  JWT_SECRET: z.string().default('dev-jwt-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().default('dev-jwt-refresh-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('4h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  UPLOAD_DIR: z.string().default('./uploads'),
});

export const config = envSchema.parse(process.env);
