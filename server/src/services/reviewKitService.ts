import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KITS_FILE = path.resolve(__dirname, '../../../data/review_kits.json');
const TMP_KITS_FILE = '/tmp/curator_review_kits.json';

export interface ReviewKit {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  videoUrl?: string;
  badgeText?: string;
  productIds: string[];
  isFeatured?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class ReviewKitService {
  // Short in-process memory cache to reduce redundant DB queries within the same request lifecycle
  private static cachedKits: ReviewKit[] | null = null;
  private static cacheTime: number = 0;
  private static readonly CACHE_TTL_MS = 2000; // 2 seconds TTL

  private static formatKit(record: any): ReviewKit {
    return {
      id: String(record.id),
      title: String(record.title),
      slug: String(record.slug),
      subtitle: record.subtitle ? String(record.subtitle) : undefined,
      description: record.description ? String(record.description) : undefined,
      videoUrl: record.videoUrl ? String(record.videoUrl) : undefined,
      badgeText: record.badgeText ? String(record.badgeText) : 'Reel / Review',
      productIds: Array.isArray(record.productIds) ? (record.productIds as string[]) : [],
      isFeatured: record.isFeatured !== false,
      displayOrder: Number(record.displayOrder || 0),
      createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : (record.createdAt ? String(record.createdAt) : new Date().toISOString()),
      updatedAt: record.updatedAt instanceof Date ? record.updatedAt.toISOString() : (record.updatedAt ? String(record.updatedAt) : new Date().toISOString()),
    };
  }

  static async getKits(): Promise<ReviewKit[]> {
    const now = Date.now();
    if (this.cachedKits !== null && (now - this.cacheTime < this.CACHE_TTL_MS)) {
      return this.cachedKits;
    }

    // 1. Primary Source of Truth: Supabase PostgreSQL via Prisma ORM
    try {
      const records = await prisma.reviewKit.findMany({
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      });

      const kits = records.map(this.formatKit);
      this.cachedKits = kits;
      this.cacheTime = now;
      this.persistLocalFiles(kits);
      return kits;
    } catch (dbErr) {
      console.warn('Database query for review_kits failed, falling back to local storage:', dbErr);
    }

    // 2. If memory cache exists (even if older than TTL), return it during DB errors
    if (this.cachedKits !== null) {
      return this.cachedKits;
    }

    // 3. Fallback: Local JSON file (/tmp or data/review_kits.json)
    try {
      if (fs.existsSync(TMP_KITS_FILE)) {
        const raw = fs.readFileSync(TMP_KITS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.cachedKits = parsed;
          this.cacheTime = now;
          return parsed;
        }
      }
    } catch {}

    try {
      if (fs.existsSync(KITS_FILE)) {
        const raw = fs.readFileSync(KITS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.cachedKits = parsed;
          this.cacheTime = now;
          return parsed;
        }
      }
    } catch {}

    // 4. Default: Return empty list (valid empty state)
    this.cachedKits = [];
    this.cacheTime = now;
    return [];
  }

  static async getKitBySlug(slug: string): Promise<ReviewKit | null> {
    const cleanSlug = slug.toLowerCase().trim();
    try {
      const record = await prisma.reviewKit.findUnique({
        where: { slug: cleanSlug },
      });
      if (record) return this.formatKit(record);
    } catch {
      // Fall through to in-memory/fallback check
    }

    const kits = await this.getKits();
    return kits.find((k) => k.slug.toLowerCase().trim() === cleanSlug) || null;
  }

  static async createKit(data: Partial<ReviewKit>): Promise<ReviewKit> {
    const title = data.title ? data.title.trim() : 'Untitled Review Kit';
    const slug = (data.slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `kit-${Date.now()}`;

    const newKitId = data.id || `kit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const productIds = Array.isArray(data.productIds) ? data.productIds : [];

    const created = await prisma.reviewKit.upsert({
      where: { slug },
      create: {
        id: newKitId,
        title,
        slug,
        subtitle: data.subtitle ? data.subtitle.trim() : null,
        description: data.description ? data.description.trim() : null,
        videoUrl: data.videoUrl ? data.videoUrl.trim() : null,
        badgeText: data.badgeText ? data.badgeText.trim() : 'Reel / Review',
        productIds,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : true,
        displayOrder: Number(data.displayOrder || 0),
      },
      update: {
        title,
        subtitle: data.subtitle ? data.subtitle.trim() : null,
        description: data.description ? data.description.trim() : null,
        videoUrl: data.videoUrl ? data.videoUrl.trim() : null,
        badgeText: data.badgeText ? data.badgeText.trim() : 'Reel / Review',
        productIds,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : true,
        displayOrder: Number(data.displayOrder || 0),
      },
    });

    const formatted = this.formatKit(created);
    this.cachedKits = null; // Invalidate cache so fresh list is read on next query
    this.cacheTime = 0;

    // Background update local files
    this.getKits().catch(() => {});
    return formatted;
  }

  static async updateKit(id: string, updates: Partial<ReviewKit>): Promise<ReviewKit | null> {
    const existing = await prisma.reviewKit.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      throw new AppError('Review kit not found', 404);
    }

    const dataToUpdate: any = {};
    if (updates.title !== undefined) dataToUpdate.title = updates.title.trim();
    if (updates.slug !== undefined) dataToUpdate.slug = updates.slug.trim().toLowerCase();
    if (updates.subtitle !== undefined) dataToUpdate.subtitle = updates.subtitle.trim();
    if (updates.description !== undefined) dataToUpdate.description = updates.description.trim();
    if (updates.videoUrl !== undefined) dataToUpdate.videoUrl = updates.videoUrl.trim();
    if (updates.badgeText !== undefined) dataToUpdate.badgeText = updates.badgeText.trim();
    if (updates.productIds !== undefined) dataToUpdate.productIds = updates.productIds;
    if (updates.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(updates.isFeatured);
    if (updates.displayOrder !== undefined) dataToUpdate.displayOrder = Number(updates.displayOrder);

    const updated = await prisma.reviewKit.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });

    const formatted = this.formatKit(updated);
    this.cachedKits = null; // Invalidate cache
    this.cacheTime = 0;

    this.getKits().catch(() => {});
    return formatted;
  }

  static async deleteKit(id: string): Promise<boolean> {
    await prisma.reviewKit.deleteMany({
      where: { OR: [{ id }, { slug: id }] },
    });

    this.cachedKits = null; // Invalidate cache
    this.cacheTime = 0;

    this.getKits().catch(() => {});
    return true;
  }

  private static persistLocalFiles(kits: ReviewKit[]): void {
    try {
      fs.writeFileSync(TMP_KITS_FILE, JSON.stringify(kits, null, 2), 'utf-8');
    } catch {}

    try {
      const dir = path.dirname(KITS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(KITS_FILE, JSON.stringify(kits, null, 2), 'utf-8');
    } catch {}
  }
}
