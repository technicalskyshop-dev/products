import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional().default(''),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_COOKIE_NAME: z.string().default('curator_session'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  ALLOWED_REDIRECT_HOSTS: z.string().default('amazon.in,www.amazon.in,amzn.to,amzn.in,flipkart.com,www.flipkart.com,fkrt.it,fkrt.co'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Environment configuration error');
}

export const env = parsed.data;

export const allowedRedirectHostList = env.ALLOWED_REDIRECT_HOSTS
  .split(',')
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

