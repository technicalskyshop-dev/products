import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default(
    'postgresql://postgres.heqqvftveskxsdtxytql:Product0088558855@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
  ),
  DIRECT_URL: z.string().default(
    'postgresql://postgres.heqqvftveskxsdtxytql:Product0088558855@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres'
  ),
  JWT_SECRET: z.string().default('development-curator-secret-key-32-chars-minimum-safe'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_COOKIE_NAME: z.string().default('curator_session'),
  FRONTEND_URL: z.string().default(''),
  ALLOWED_REDIRECT_HOSTS: z.string().default(
    'amazon.in,www.amazon.in,amzn.to,amzn.in,flipkart.com,www.flipkart.com,fkrt.it,fkrt.co'
  ),
  CLOUDINARY_CLOUD_NAME: z.string().default('gc7ha4cd'),
  CLOUDINARY_API_KEY: z.string().default('891317787659386'),
  CLOUDINARY_API_SECRET: z.string().default('6PqWox2FQ5nRphulDyzDK7offH0'),
  CLOUDINARY_UPLOAD_PRESET: z.string().default('product_uploads'),
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

