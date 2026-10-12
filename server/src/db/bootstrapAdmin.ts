import { AuthService } from '../services/authService.js';
import { prisma } from './prisma.js';

async function bootstrap() {
  const args = process.argv.slice(2);
  const email = args[0] || process.env.ADMIN_EMAIL || 'admin@curatedstudio.internal';
  const password = args[1] || process.env.ADMIN_INITIAL_PASSWORD || 'CuratorAdmin2026!';
  const role = (args[2] as 'ADMIN' | 'SUPER_ADMIN') || 'ADMIN';

  console.log(`Creating or updating admin user: ${email}...`);

  try {
    const result = await AuthService.bootstrapAdmin({ email, password, role });
    console.log(`✅ Admin user ready:`);
    console.log(`   ID:    ${result.user.id}`);
    console.log(`   Email: ${result.user.email}`);
    console.log(`   Role:  ${result.user.role}`);
    console.log(`   Password: [Securely hashed with bcrypt]`);
  } catch (error) {
    console.error('❌ Failed bootstrapping admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

bootstrap();

