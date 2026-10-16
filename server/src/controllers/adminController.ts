import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService.js';
import { CategoryService } from '../services/categoryService.js';
import { AffiliateService } from '../services/affiliateService.js';
import { StorageService } from '../services/storageService.js';
import { SettingsService } from '../services/settingsService.js';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export class AdminController {
  // Dashboard Overview Metrics
  static async getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalProducts,
        publishedCount,
        draftCount,
        totalCategories,
        featuredCount,
        recentProducts,
        affiliateAnalytics,
      ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { status: 'published' } }),
        prisma.product.count({ where: { status: 'draft' } }),
        prisma.category.count(),
        prisma.product.count({ where: { isFeatured: true } }),
        prisma.product.findMany({
          take: 8,
          orderBy: { updatedAt: 'desc' },
          include: { category: { select: { name: true } } },
        }),
        AffiliateService.getClickAnalytics(),
      ]);

      res.status(200).json({
        success: true,
        metrics: {
          totalProducts,
          publishedProducts: publishedCount,
          draftProducts: draftCount,
          totalCategories,
          featuredProducts: featuredCount,
          totalAffiliateClicks: affiliateAnalytics.totalClicks,
        },
        recentActivity: recentProducts.map((p) => ({
          id: p.id,
          name: p.name,
          categoryLabel: p.category.name,
          displayPrice: p.displayPrice,
          status: p.status,
          updatedAt: p.updatedAt,
        })),
        affiliateAnalytics,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Product Management ---

  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ProductService.getAdminProducts(req.query as any);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  static async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getAdminProductById(String(req.params.id));
      res.status(200).json({ success: true, product });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json({ success: true, product });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.updateProduct(String(req.params.id), req.body);
      res.status(200).json({ success: true, product });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductService.deleteProduct(String(req.params.id));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async togglePublish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.body.status as 'published' | 'draft';
      const product = await ProductService.togglePublish(String(req.params.id), status);
      res.status(200).json({ success: true, product });
    } catch (error) {
      next(error);
    }
  }

  // --- Category Management ---

  static async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoryService.getAdminCategories();
      res.status(200).json({ success: true, categories });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.body);
      res.status(201).json({ success: true, category });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.updateCategory(String(req.params.id), req.body);
      res.status(200).json({ success: true, category });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reassignToCategoryId =
        req.body?.reassignToCategoryId ||
        (req.query?.reassignToCategoryId as string | undefined);
      const result = await CategoryService.deleteCategory(
        String(req.params.id),
        reassignToCategoryId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // --- Affiliate Clicks Analytics ---

  static async getAffiliateClicks(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AffiliateService.getClickAnalytics();
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  // --- Product Image Upload ---

  static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { base64Data, filename } = req.body;
      if (!base64Data || typeof base64Data !== 'string') {
        throw new AppError('base64Data is required for image upload', 400);
      }

      // Extract mime type and base64 string
      const match = base64Data.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
      if (!match) {
        throw new AppError('Invalid Base64 Data URI format', 400);
      }

      const mimeType = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      const originalname = filename || `upload-${Date.now()}`;

      const uploadResult = await StorageService.uploadImage(
        buffer,
        originalname,
        mimeType
      );

      res.status(201).json({
        success: true,
        ...uploadResult,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Storefront & Affiliate Settings Management ---

  static async getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await SettingsService.getSettings();
      res.status(200).json({ success: true, settings });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      res.status(200).json({ success: true, settings });
    } catch (error) {
      next(error);
    }
  }
}
