import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../db/prisma.js';

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

const DEFAULT_REVIEW_KITS: ReviewKit[] = [
  {
    id: 'kit-desk-setup-2026',
    title: 'Ultimate Clean Desk Setup 2026',
    slug: 'desk-setup',
    subtitle: 'All 5 gadgets reviewed in Reel #04 with verified affiliate buy links',
    description: 'Keychron Mechanical Keyboard, 100W GaN Fast Charger, Fellow Stagg Kettle, iPhone 16 Titanium, and Logitech MX Master 3S.',
    videoUrl: 'https://youtube.com',
    badgeText: 'YouTube / Reel #04',
    productIds: [], // Populated dynamically or matched with catalog products
    isFeatured: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class ReviewKitService {
  private static cachedKits: ReviewKit[] | null = null;
  private static tableEnsured = false;

  private static async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
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
      this.tableEnsured = true;
    } catch {
      // Non-fatal if table exists or permissions handled
    }
  }

  static async getKits(): Promise<ReviewKit[]> {
    if (this.cachedKits !== null) {
      return this.cachedKits;
    }

    // 1. Try reading from Supabase PostgreSQL
    try {
      await this.ensureTable();
      const rows = await prisma.$queryRawUnsafe<Array<any>>(
        `SELECT id, title, slug, subtitle, description, 
                video_url AS "videoUrl", 
                badge_text AS "badgeText", 
                product_ids AS "productIds", 
                is_featured AS "isFeatured", 
                display_order AS "displayOrder", 
                created_at AS "createdAt", 
                updated_at AS "updatedAt" 
         FROM review_kits 
         ORDER BY display_order ASC, created_at DESC`
      );

      if (rows && rows.length > 0) {
        const resolved: ReviewKit[] = rows.map((r) => ({
          id: String(r.id),
          title: String(r.title),
          slug: String(r.slug),
          subtitle: r.subtitle ? String(r.subtitle) : undefined,
          description: r.description ? String(r.description) : undefined,
          videoUrl: r.videoUrl ? String(r.videoUrl) : undefined,
          badgeText: r.badgeText ? String(r.badgeText) : 'Reel / Review',
          productIds: Array.isArray(r.productIds) ? r.productIds : [],
          isFeatured: r.isFeatured !== false,
          displayOrder: Number(r.displayOrder || 0),
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        }));
        this.cachedKits = resolved;
        return resolved;
      } else if (Array.isArray(rows)) {
        // Table exists and query was successful, but table is empty (user deleted all kits)
        this.cachedKits = [];
        return [];
      }
    } catch (dbErr) {
      console.warn('Database query for review_kits failed, checking fallbacks:', dbErr);
    }

    // 2. Try reading from /tmp cache
    try {
      if (fs.existsSync(TMP_KITS_FILE)) {
        const raw = fs.readFileSync(TMP_KITS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.cachedKits = parsed;
          return parsed;
        }
      }
    } catch {
      // Continue to next fallback
    }

    // 3. Try reading from project data file
    try {
      if (fs.existsSync(KITS_FILE)) {
        const raw = fs.readFileSync(KITS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.cachedKits = parsed;
          return parsed;
        }
      }
    } catch {
      // Continue to default
    }

    // 4. Default Kits (seed with top 5 products if available)
    try {
      const topProducts = await prisma.product.findMany({
        where: { status: 'published' },
        take: 5,
        select: { id: true },
      });
      if (topProducts.length > 0) {
        DEFAULT_REVIEW_KITS[0].productIds = topProducts.map((p) => p.id);
      }
    } catch {
      // Ignore if products not queryable
    }

    this.cachedKits = DEFAULT_REVIEW_KITS;
    return DEFAULT_REVIEW_KITS;
  }

  static async getKitBySlug(slug: string): Promise<ReviewKit | null> {
    const kits = await this.getKits();
    const cleanSlug = slug.toLowerCase().trim();
    return kits.find((k) => k.slug.toLowerCase().trim() === cleanSlug) || null;
  }

  static async createKit(data: Partial<ReviewKit>): Promise<ReviewKit> {
    const title = data.title ? data.title.trim() : 'Untitled Review Kit';
    const slug = (data.slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `kit-${Date.now()}`;

    const newKit: ReviewKit = {
      id: data.id || `kit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      slug,
      subtitle: data.subtitle ? data.subtitle.trim() : undefined,
      description: data.description ? data.description.trim() : undefined,
      videoUrl: data.videoUrl ? data.videoUrl.trim() : undefined,
      badgeText: data.badgeText ? data.badgeText.trim() : 'Reel / Review',
      productIds: Array.isArray(data.productIds) ? data.productIds : [],
      isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : true,
      displayOrder: Number(data.displayOrder || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentKits = await this.getKits();
    // Prevent duplicate slug
    const filteredKits = currentKits.filter((k) => k.slug !== newKit.slug && k.id !== newKit.id);
    const updatedList = [newKit, ...filteredKits];
    this.cachedKits = updatedList;

    // Persist to Supabase DB
    try {
      await this.ensureTable();
      await prisma.$executeRawUnsafe(
        `INSERT INTO review_kits (id, title, slug, subtitle, description, video_url, badge_text, product_ids, is_featured, display_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET 
           title = EXCLUDED.title,
           subtitle = EXCLUDED.subtitle,
           description = EXCLUDED.description,
           video_url = EXCLUDED.video_url,
           badge_text = EXCLUDED.badge_text,
           product_ids = EXCLUDED.product_ids,
           is_featured = EXCLUDED.is_featured,
           display_order = EXCLUDED.display_order,
           updated_at = NOW()`,
        newKit.id,
        newKit.title,
        newKit.slug,
        newKit.subtitle || null,
        newKit.description || null,
        newKit.videoUrl || null,
        newKit.badgeText || 'Reel / Review',
        JSON.stringify(newKit.productIds),
        newKit.isFeatured,
        newKit.displayOrder
      );
    } catch (dbErr) {
      console.error('Failed saving review kit to DB:', dbErr);
    }

    this.persistLocalFiles(updatedList);
    return newKit;
  }

  static async updateKit(id: string, updates: Partial<ReviewKit>): Promise<ReviewKit | null> {
    const currentKits = await this.getKits();
    const existingIndex = currentKits.findIndex((k) => k.id === id);
    if (existingIndex === -1) return null;

    const existing = currentKits[existingIndex];
    const updated: ReviewKit = {
      ...existing,
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : existing.title,
      slug: updates.slug !== undefined ? updates.slug.trim().toLowerCase() : existing.slug,
      subtitle: updates.subtitle !== undefined ? updates.subtitle.trim() : existing.subtitle,
      description: updates.description !== undefined ? updates.description.trim() : existing.description,
      videoUrl: updates.videoUrl !== undefined ? updates.videoUrl.trim() : existing.videoUrl,
      badgeText: updates.badgeText !== undefined ? updates.badgeText.trim() : existing.badgeText,
      productIds: Array.isArray(updates.productIds) ? updates.productIds : existing.productIds,
      isFeatured: updates.isFeatured !== undefined ? Boolean(updates.isFeatured) : existing.isFeatured,
      displayOrder: updates.displayOrder !== undefined ? Number(updates.displayOrder) : existing.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    currentKits[existingIndex] = updated;
    this.cachedKits = [...currentKits];

    // Persist to Supabase DB
    try {
      await this.ensureTable();
      await prisma.$executeRawUnsafe(
        `UPDATE review_kits 
         SET title = $2,
             slug = $3,
             subtitle = $4,
             description = $5,
             video_url = $6,
             badge_text = $7,
             product_ids = $8::jsonb,
             is_featured = $9,
             display_order = $10,
             updated_at = NOW()
         WHERE id = $1`,
        updated.id,
        updated.title,
        updated.slug,
        updated.subtitle || null,
        updated.description || null,
        updated.videoUrl || null,
        updated.badgeText || 'Reel / Review',
        JSON.stringify(updated.productIds),
        updated.isFeatured,
        updated.displayOrder
      );
    } catch (dbErr) {
      console.error('Failed updating review kit in DB:', dbErr);
    }

    this.persistLocalFiles(this.cachedKits);
    return updated;
  }

  static async deleteKit(id: string): Promise<boolean> {
    const currentKits = await this.getKits();
    const filtered = currentKits.filter((k) => k.id !== id && k.slug !== id);
    this.cachedKits = filtered;

    try {
      await this.ensureTable();
      await prisma.$executeRawUnsafe('DELETE FROM review_kits WHERE id = $1 OR slug = $1', id);
    } catch (dbErr) {
      console.error('Failed deleting review kit from DB:', dbErr);
    }

    this.persistLocalFiles(filtered);
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

