import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

declare global {
  // eslint-disable-next-line no-var
  var __prismaInstance: PrismaClient | undefined;
}

// In serverless environments, enforce connection_limit=1 to avoid pool exhaustion with Supabase PgBouncer
let dbUrl = env.DATABASE_URL;
if (dbUrl && !dbUrl.includes('connection_limit=')) {
  const sep = dbUrl.includes('?') ? '&' : '?';
  dbUrl = `${dbUrl}${sep}connection_limit=1`;
}

export const prisma =
  global.__prismaInstance ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (!global.__prismaInstance) {
  global.__prismaInstance = prisma;
}

