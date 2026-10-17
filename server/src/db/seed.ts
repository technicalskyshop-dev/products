import { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';
import { AuthService } from '../services/authService.js';
import { SEED_CATEGORIES, SEED_PRODUCTS } from './fixtures.js';

export async function runSeed() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Categories
  console.log(`Seeding ${SEED_CATEGORIES.length} categories...`);

  for (const cat of SEED_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        enabled: cat.enabled,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        enabled: cat.enabled,
      },
    });
  }

  // 2. Seed Initial Products
  console.log(`Seeding ${SEED_PRODUCTS.length} initial products...`);
  for (const prod of SEED_PRODUCTS) {
    const existing = await prisma.product.findFirst({
      where: { OR: [{ id: prod.id }, { slug: prod.slug }] },
    });

    const productData = {
      name: prod.name,
      slug: prod.slug,
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      categoryId: prod.category,
      imageUrl: prod.imageUrl,
      displayPrice: prod.displayPrice,
      priceAmount: new Prisma.Decimal(prod.priceValue || 0),
      originalPrice: prod.originalPrice || null,
      verifiedPriceSource: prod.verifiedPriceSource || 'Curator Partner',
      priceLastVerifiedAt: new Date(),
      amazonUrl: prod.amazonUrl,
      flipkartUrl: prod.flipkartUrl,
      aspectRatio: prod.aspectRatio || 'aspect-[3/4]',
      heightClass: prod.heightClass || 'h-80 sm:h-96 lg:h-[410px]',
      status: prod.status || 'published',
      isFeatured: Boolean(prod.isFeatured),
    };

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: productData,
      });
    } else {
      await prisma.product.create({
        data: {
          id: prod.id,
          ...productData,
        },
      });
    }
  }

  // 3. Seed Default Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@curatedstudio.internal';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'CuratorAdmin2026!';
  console.log(`Bootstrapping admin user '${adminEmail}'...`);

  await AuthService.bootstrapAdmin({
    email: adminEmail,
    password: adminPassword,
    role: 'ADMIN',
  });

  // 4. Seed Default Review Kit (only on fresh database bootstrap)
  try {
    const existingCount = await prisma.reviewKit.count();
    if (existingCount === 0) {
      console.log('Seeding initial review kit...');
      await prisma.reviewKit.create({
        data: {
          id: 'kit-desk-setup-2026',
          title: 'Ultimate Clean Desk Setup 2026',
          slug: 'desk-setup',
          subtitle: 'All 4 gadgets reviewed in Reel #04 with verified affiliate buy links',
          description: 'Keychron Mechanical Keyboard, 100W GaN Fast Charger, Fellow Stagg Kettle, and Sony WH-1000XM5.',
          videoUrl: 'https://youtube.com',
          badgeText: 'YouTube / Reel #04',
          productIds: ['prod-01', 'prod-02', 'prod-03', 'prod-04'],
          isFeatured: true,
          displayOrder: 1,
        },
      });
    }
  } catch (kitErr) {
    console.warn('Initial review kit seeding error (non-fatal):', kitErr);
  }

  console.log('✅ Seeding completed successfully!');
}

// Execute directly if run as CLI script
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('❌ Seeding failed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
