import crypto from 'crypto';
import { Request } from 'express';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { allowedRedirectHostList } from '../config/env.js';
import { SettingsService } from './settingsService.js';

export class AffiliateService {
  static async resolveAndRecordClick(
    productId: string,
    platform: 'amazon' | 'flipkart',
    req: Request
  ): Promise<string> {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: productId }, { slug: productId }],
      },
    });

    if (!product) {
      throw new AppError('Product not found for affiliate redirection', 404);
    }

    const destinationUrl =
      platform === 'amazon' ? product.amazonUrl : product.flipkartUrl;

    if (!destinationUrl) {
      throw new AppError(`No destination URL configured for ${platform}`, 404);
    }

    // Strict Open-Redirect Protection
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(destinationUrl);
    } catch {
      throw new AppError('Configured destination URL is invalid', 500);
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowed = allowedRedirectHostList.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );

    if (!isAllowed) {
      throw new AppError(
        `Destination host '${hostname}' is not permitted by affiliate allowlist`,
        403
      );
    }

    // Automatically inject active client affiliate tags from settings
    const currentSettings = await SettingsService.getSettings();
    if (platform === 'amazon' && currentSettings.defaultAmazonTag) {
      parsedUrl.searchParams.set('tag', currentSettings.defaultAmazonTag.trim());
    } else if (platform === 'flipkart' && currentSettings.defaultFlipkartTag) {
      parsedUrl.searchParams.set('affid', currentSettings.defaultFlipkartTag.trim());
    }

    const finalAffiliateUrl = parsedUrl.toString();

    // Generate non-reversible hash of client IP for aggregate uniqueness without storing PII
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '';
    const ipHash = clientIp
      ? crypto.createHash('sha256').update(clientIp).digest('hex').slice(0, 16)
      : null;

    // Record click asynchronously without blocking redirect response
    prisma.affiliateClick
      .create({
        data: {
          productId: product.id,
          platform,
          referrer: req.get('referrer')?.slice(0, 500) || null,
          userAgent: req.get('user-agent')?.slice(0, 300) || null,
          ipHash,
        },
      })
      .catch((err) => {
        console.error('Failed to record affiliate click:', err);
      });

    return finalAffiliateUrl;
  }

  // Admin Click Analytics
  static async getClickAnalytics() {
    const totalClicks = await prisma.affiliateClick.count();

    const [amazonClicks, flipkartClicks] = await Promise.all([
      prisma.affiliateClick.count({ where: { platform: 'amazon' } }),
      prisma.affiliateClick.count({ where: { platform: 'flipkart' } }),
    ]);

    const recentClicks = await prisma.affiliateClick.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        product: {
          select: { id: true, name: true, slug: true, displayPrice: true },
        },
      },
    });

    return {
      totalClicks,
      byPlatform: {
        amazon: amazonClicks,
        flipkart: flipkartClicks,
      },
      recentClicks: recentClicks.map((c) => ({
        id: c.id,
        platform: c.platform,
        productId: c.productId,
        productName: c.product.name,
        productSlug: c.product.slug,
        createdAt: c.createdAt,
      })),
    };
  }
}

