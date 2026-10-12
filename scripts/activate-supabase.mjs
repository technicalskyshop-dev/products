import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const dbUrl = process.env.DATABASE_URL || '';
const directUrl = process.env.DIRECT_URL || '';

console.log('====================================================');
console.log('   🚀 SUPABASE CLOUD DATABASE ACTIVATOR             ');
console.log('====================================================\n');

if (dbUrl.startsWith('file:')) {
  console.log('ℹ️  Currently using local SQLite (file:./dev.db).');
  console.log('👉 To activate Supabase Cloud:');
  console.log('   1. Open .env file.');
  console.log('   2. Uncomment DATABASE_URL and DIRECT_URL (remove #).');
  console.log('   3. Replace [YOUR-PASSWORD] with your real Supabase database password.');
  console.log('   4. Comment out or replace DATABASE_URL="file:./dev.db".');
  console.log('   5. Re-run: npm run db:activate-supabase\n');
  process.exit(0);
}

if (!dbUrl || dbUrl.includes('[YOUR-PASSWORD]') || (directUrl && directUrl.includes('[YOUR-PASSWORD]'))) {
  console.error('❌ ERROR: [YOUR-PASSWORD] placeholder detected in .env!');
  console.error('👉 Please open .env, replace [YOUR-PASSWORD] with your actual Supabase database password, and re-run:');
  console.error('   npm run db:activate-supabase\n');
  process.exit(1);
}

if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
  console.error('❌ ERROR: DATABASE_URL must be a PostgreSQL connection string.');
  console.error(`Current DATABASE_URL: ${dbUrl}\n`);
  process.exit(1);
}

try {
  console.log('1️⃣ Switching Prisma schema to Supabase PostgreSQL...');
  const supabaseSchema = path.join(rootDir, 'prisma/schema.supabase.prisma');
  const mainSchema = path.join(rootDir, 'prisma/schema.prisma');
  fs.copyFileSync(supabaseSchema, mainSchema);
  console.log('   ✅ schema.prisma updated for PostgreSQL.');

  console.log('\n2️⃣ Generating Prisma client for PostgreSQL...');
  execSync('npx prisma generate', { cwd: rootDir, stdio: 'inherit' });

  console.log('\n3️⃣ Pushing tables to Supabase Cloud...');
  execSync('npx prisma db push --accept-data-loss', { cwd: rootDir, stdio: 'inherit' });
  console.log('   ✅ Tables created successfully in Supabase!');

  console.log('\n4️⃣ Seeding initial products and admin user into Supabase...');
  execSync('npx tsx server/src/db/seed.ts', { cwd: rootDir, stdio: 'inherit' });
  console.log('   ✅ Initial catalog and admin user seeded into Supabase!');

  console.log('\n5️⃣ Rebuilding backend server...');
  execSync('npm run server:build', { cwd: rootDir, stdio: 'inherit' });

  console.log('\n====================================================');
  console.log('  🎉 SUPABASE CLOUD DATABASE IS NOW FULLY LIVE!');
  console.log('====================================================\n');
} catch (error) {
  console.error('\n❌ Activation failed:', error.message || error);
  process.exit(1);
}
