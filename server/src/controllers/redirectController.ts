import { Request, Response, NextFunction } from 'express';
import { AffiliateService } from '../services/affiliateService.js';

export class RedirectController {
  static async handleAffiliateRedirect(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId, platform } = req.params as {
        productId: string;
        platform: 'amazon' | 'flipkart';
      };

      const destinationUrl = await AffiliateService.resolveAndRecordClick(
        productId,
        platform,
        req
      );

      // Issue HTTP 302 temporary redirect to verified partner
      res.redirect(302, destinationUrl);
    } catch (error) {
      next(error);
    }
  }
}

