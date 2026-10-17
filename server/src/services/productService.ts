import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
  slugifyText,
} from '../validation/productSchemas.js';

export class ProductService {
  private static seedingPromise: Promise<void> | null = null;

  static async ensureSeeded() {
    try {
      const count = await prisma.product.count();
      if (count === 0) {
        if (!this.seedingPromise) {
          console.log('⚡ Product count in database is 0. Running database auto-seed...');
          const { runSeed } = await import('../db/seed.js');
          this.seedingPromise = runSeed()
            .then(() => {
              console.log('✅ Auto-seed completed successfully.');
            })
            .catch((err) => {
              console.error('Auto-seed failed:', err);
            })
            .finally(() => {
              this.seedingPromise = null;
            });
        }
        await this.seedingPromise;
      }
    } catch (e) {
      console.warn('Auto-seed check non-fatal error:', e);
    }
  }

  // Public catalog: ONLY published products in enabled categories
  static async getPublicProducts(query: ProductQueryInput) {
    await this.ensureSeeded();
    const page = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(String(query.limit || 24), 10) || 24));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: 'published',
      category: {
        enabled: true,
      },
    };

    if (query.category && query.category !== 'all') {
      where.OR = [
        { categoryId: query.category },
        { category: { slug: query.category } },
      ];
    }

    if (query.search) {
      const term = query.search;
      where.AND = [
        {
          OR: [
            { name: { contains: term } },
            { shortDescription: { contains: term } },
            { description: { contains: term } },
          ],
        },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'name_asc') orderBy = { name: 'asc' };
    else if (query.sortBy === 'name_desc') orderBy = { name: 'desc' };
    else if (query.sortBy === 'price_asc') orderBy = { priceAmount: 'asc' };
    else if (query.sortBy === 'price_desc') orderBy = { priceAmount: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map(this.formatProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // Public: Get published product by slug
  static async getPublicProductBySlug(slug: string) {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: 'published',
        category: { enabled: true },
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found or currently unavailable', 404);
    }

    return this.formatProduct(product);
  }

  // Admin: Get all products with filters
  static async getAdminProducts(query: ProductQueryInput) {
    await this.ensureSeeded();
    const page = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(String(query.limit || 50), 10) || 50));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }

    if (query.category && query.category !== 'all') {
      where.OR = [
        { categoryId: query.category },
        { category: { slug: query.category } },
      ];
    }

    if (query.search) {
      const term = query.search;
      where.AND = [
        {
          OR: [
            { name: { contains: term } },
            { slug: { contains: term } },
            { shortDescription: { contains: term } },
          ],
        },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { updatedAt: 'desc' };
    if (query.sortBy === 'name_asc') orderBy = { name: 'asc' };
    else if (query.sortBy === 'name_desc') orderBy = { name: 'desc' };
    else if (query.sortBy === 'price_asc') orderBy = { priceAmount: 'asc' };
    else if (query.sortBy === 'price_desc') orderBy = { priceAmount: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { affiliateClicks: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => ({
        ...this.formatProduct(p),
        clickCount: p._count.affiliateClicks,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // Admin: Get single product by ID
  static async getAdminProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { affiliateClicks: true } },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return {
      ...this.formatProduct(product),
      clickCount: product._count.affiliateClicks,
    };
  }

  // Admin: Create product with slug de-duplication
  static async createProduct(data: CreateProductInput) {
    // Verify category exists by ID or Slug
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: data.categoryId },
          { slug: data.categoryId },
        ],
      },
    });
    if (!category) {
      throw new AppError('Specified category does not exist', 400);
    }

    let slug = data.slug ? slugifyText(data.slug) : slugifyText(data.name);
    if (!slug) slug = `prod-${Date.now().toString(36)}`;

    // Handle duplicate slug collision
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        shortDescription: data.shortDescription || '',
        description: data.description || '',
        categoryId: category.id,
        imageUrl: data.imageUrl,
        displayPrice: data.displayPrice,
        priceAmount: new Prisma.Decimal(data.priceAmount),
        originalPrice: data.originalPrice || null,
        originalPriceAmount: data.originalPriceAmount
          ? new Prisma.Decimal(data.originalPriceAmount)
          : null,
        verifiedPriceSource: data.verifiedPriceSource || 'Curator Direct',
        priceLastVerifiedAt: new Date(),
        amazonUrl: data.amazonUrl || '',
        flipkartUrl: data.flipkartUrl || '',
        aspectRatio: data.aspectRatio || 'aspect-[4/5]',
        heightClass: data.heightClass || 'h-72 sm:h-80 lg:h-[355px]',
        status: data.status || 'published',
        isFeatured: Boolean(data.isFeatured),
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return this.formatProduct(product);
  }

  // Admin: Update product
  static async updateProduct(id: string, data: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    let targetCategoryId: string | undefined = undefined;
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { id: data.categoryId },
            { slug: data.categoryId },
          ],
        },
      });
      if (!category) {
        throw new AppError('Specified category does not exist', 400);
      }
      targetCategoryId = category.id;
    }

    let slug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      slug = slugifyText(data.slug);
      const duplicate = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (duplicate) {
        throw new AppError('A product with this slug already exists', 409);
      }
    }

    const updatePayload: Prisma.ProductUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug }),
      ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
      ...(data.description !== undefined && { description: data.description }),
      ...(targetCategoryId && { category: { connect: { id: targetCategoryId } } }),
      ...(data.imageUrl && { imageUrl: data.imageUrl }),
      ...(data.displayPrice && { displayPrice: data.displayPrice }),
      ...(data.priceAmount !== undefined && {
        priceAmount: new Prisma.Decimal(data.priceAmount),
        priceLastVerifiedAt: new Date(),
      }),
      ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice }),
      ...(data.originalPriceAmount !== undefined && {
        originalPriceAmount: data.originalPriceAmount
          ? new Prisma.Decimal(data.originalPriceAmount)
          : null,
      }),
      ...(data.verifiedPriceSource !== undefined && {
        verifiedPriceSource: data.verifiedPriceSource,
      }),
      ...(data.amazonUrl !== undefined && { amazonUrl: data.amazonUrl || '' }),
      ...(data.flipkartUrl !== undefined && { flipkartUrl: data.flipkartUrl || '' }),
      ...(data.aspectRatio && { aspectRatio: data.aspectRatio }),
      ...(data.heightClass && { heightClass: data.heightClass }),
      ...(data.status && { status: data.status }),
      ...(data.isFeatured !== undefined && { isFeatured: Boolean(data.isFeatured) }),
    };

    const updated = await prisma.product.update({
      where: { id },
      data: updatePayload,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return this.formatProduct(updated);
  }

  // Admin: Delete product
  static async deleteProduct(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    await prisma.product.delete({ where: { id } });
    return { success: true, id };
  }

  // Admin: Toggle publish status
  static async togglePublish(id: string, status: 'published' | 'draft') {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { status },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return this.formatProduct(updated);
  }

  // Helper formatter ensuring clean serialization of Decimals and Category fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static formatProduct(product: any) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      categoryId: product.categoryId,
      category: product.category?.slug || product.categoryId,
      categoryLabel: product.category?.name || 'Curated Specimen',
      imageUrl: product.imageUrl,
      displayPrice: product.displayPrice,
      priceAmount: Number(product.priceAmount),
      priceValue: Number(product.priceAmount),
      originalPrice: product.originalPrice || null,
      originalPriceAmount: product.originalPriceAmount
        ? Number(product.originalPriceAmount)
        : null,
      verifiedPriceSource: product.verifiedPriceSource || 'Curator Specimen Selection',
      priceLastVerifiedAt: product.priceLastVerifiedAt,
      amazonUrl: product.amazonUrl,
      flipkartUrl: product.flipkartUrl,
      aspectRatio: product.aspectRatio || 'aspect-[3/4]',
      heightClass: product.heightClass || 'h-80 sm:h-96 lg:h-[410px]',
      status: product.status,
      isFeatured: Boolean(product.isFeatured),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

