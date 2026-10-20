import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService.js';
import { CategoryService } from '../services/categoryService.js';
import { SettingsService } from '../services/settingsService.js';
import { ReviewKitService } from '../services/reviewKitService.js';
import { prisma } from '../db/prisma.js';

export class PublicController {
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ProductService.getPublicProducts(req.query as any);
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getPublicProductBySlug(String(req.params.slug));
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoryService.getPublicCategories();
      res.status(200).json({
        success: true,
        categories,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await CategoryService.getPublicCategoryProducts(String(req.params.slug));
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async health(_req: Request, res: Response): Promise<void> {
    try {
      // Fast database query check
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      });
    } catch (dbError) {
      res.status(503).json({
        status: 'degraded',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      const settings = await SettingsService.getSettings();
      res.status(200).json({
        success: true,
        settings,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReviewKits(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kits = await ReviewKitService.getKits();
      res.status(200).json({
        success: true,
        kits,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReviewKitBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kit = await ReviewKitService.getKitBySlug(String(req.params.slug));
      if (!kit) {
        res.status(404).json({
          success: false,
          error: 'Review kit not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        kit,
      });
    } catch (error) {
      next(error);
    }
  }
}

