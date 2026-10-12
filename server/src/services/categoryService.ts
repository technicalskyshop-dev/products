import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../validation/categorySchemas.js';
import { slugifyText } from '../validation/productSchemas.js';

export class CategoryService {
  // Public: Enabled categories sorted by order
  static async getPublicCategories() {
    const categories = await prisma.category.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
        enabled: true,
      },
    });

    return categories;
  }

  // Public: Category products by category slug
  static async getPublicCategoryProducts(slug: string) {
    const category = await prisma.category.findFirst({
      where: { slug, enabled: true },
    });

    if (!category) {
      throw new AppError('Category not found or inactive', 404);
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        status: 'published',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription || '',
        description: p.description || '',
        categoryId: p.categoryId,
        category: p.category.slug,
        categoryLabel: p.category.name,
        imageUrl: p.imageUrl,
        displayPrice: p.displayPrice,
        priceAmount: Number(p.priceAmount),
        priceValue: Number(p.priceAmount),
        originalPrice: p.originalPrice || null,
        amazonUrl: p.amazonUrl,
        flipkartUrl: p.flipkartUrl,
        aspectRatio: p.aspectRatio || 'aspect-[3/4]',
        heightClass: p.heightClass || 'h-80 sm:h-96 lg:h-[410px]',
        status: p.status,
        isFeatured: p.isFeatured,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      total: products.length,
    };
  }

  // Admin: All categories with product count
  static async getAdminCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      order: c.order,
      enabled: c.enabled,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      productCount: c._count.products,
    }));
  }

  // Admin: Create category
  static async createCategory(data: CreateCategoryInput) {
    let slug = data.slug ? slugifyText(data.slug) : slugifyText(data.name);
    if (!slug) slug = `cat-${Date.now().toString(36)}`;

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('A category with this slug already exists', 409);
    }

    let order = data.order;
    if (order === undefined || order === 0) {
      const highest = await prisma.category.findFirst({
        orderBy: { order: 'desc' },
      });
      order = (highest?.order ?? 0) + 1;
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        order,
        enabled: data.enabled ?? true,
      },
    });

    return category;
  }

  // Admin: Update category
  static async updateCategory(id: string, data: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Category not found', 404);
    }

    let slug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      slug = slugifyText(data.slug);
      const duplicate = await prisma.category.findFirst({
        where: { slug, id: { not: id } },
      });
      if (duplicate) {
        throw new AppError('A category with this slug already exists', 409);
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.enabled !== undefined && { enabled: data.enabled }),
      },
    });

    return updated;
  }

  // Admin: Delete category with safe reassignment
  static async deleteCategory(id: string, reassignToCategoryId?: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const productCount = category._count.products;

    if (productCount > 0) {
      if (!reassignToCategoryId) {
        throw new AppError(
          `Cannot delete category '${category.name}' containing ${productCount} products without specifying a reassignment category.`,
          400
        );
      }

      if (reassignToCategoryId === id) {
        throw new AppError('Cannot reassign products to the category being deleted', 400);
      }

      const targetCategory = await prisma.category.findUnique({
        where: { id: reassignToCategoryId },
      });

      if (!targetCategory) {
        throw new AppError('Target reassignment category does not exist', 400);
      }

      // Perform reassignment and deletion in transaction
      await prisma.$transaction([
        prisma.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: reassignToCategoryId },
        }),
        prisma.category.delete({ where: { id } }),
      ]);

      return {
        success: true,
        reassignedCount: productCount,
        reassignedTo: targetCategory.name,
      };
    }

    await prisma.category.delete({ where: { id } });
    return { success: true, reassignedCount: 0 };
  }
}

