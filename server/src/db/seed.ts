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

  // 4. Seed Default Review Kit (if table is empty)
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS review_kits (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        subtitle VARCHAR(500),
        description TEXT,
        video_url VARCHAR(500),
        badge_text VARCHAR(100) DEFAULT 'Reel / Review',
        product_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_featured BOOLEAN DEFAULT true,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const existingKits = await prisma.$queryRawUnsafe<any[]>('SELECT id FROM review_kits LIMIT 1');
    if (!existingKits || existingKits.length === 0) {
      console.log('Seeding initial review kit...');
      await prisma.$executeRawUnsafe(
        `INSERT INTO review_kits (id, title, slug, subtitle, description, video_url, badge_text, product_ids, is_featured, display_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        'kit-desk-setup-2026',
        'Ultimate Clean Desk Setup 2026',
        'desk-setup',
        'All 4 gadgets reviewed in Reel #04 with verified affiliate buy links',
        'Keychron Mechanical Keyboard, 100W GaN Fast Charger, Fellow Stagg Kettle, and Sony WH-1000XM5.',
        'https://youtube.com',
        'YouTube / Reel #04',
        JSON.stringify(['prod-01', 'prod-02', 'prod-03', 'prod-04']),
        true,
        1
      );
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
