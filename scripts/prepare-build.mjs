import { execSync } from 'child_process';

const defaultDb =
  'postgresql://postgres.heqqvftveskxsdtxytql:Product0088558855@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const defaultDirect =
  'postgresql://postgres.heqqvftveskxsdtxytql:Product0088558855@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

process.env.DATABASE_URL = process.env.DATABASE_URL || defaultDb;
process.env.DIRECT_URL = process.env.DIRECT_URL || defaultDirect;

console.log('Generating Prisma Client for production database...');
execSync('npx prisma generate --schema=prisma/schema.prisma', {
  stdio: 'inherit',
  env: process.env,
});
console.log('Prisma Client generated successfully!');
