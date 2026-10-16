import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../db/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.resolve(__dirname, '../../../data/settings.json');

export interface StoreSettings {
  storeName: string;
  brandWordmark: string;
  storeTagline: string;
  currencySymbol: string;
  defaultAmazonTag: string;
  defaultFlipkartTag: string;
  inquiryEmail: string;
  announcementNotice: string;
  activeTheme?: string;
  customBgUrl?: string;
  customBgMobileUrl?: string;
  themeMode?: string;
  glassBlur?: string;
  glassOpacity?: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'TechnicalSky',
  brandWordmark: 'TECHNICALSKY',
  storeTagline: 'TechnicalSky — Curated Product Discoveries',
  currencySymbol: '₹',
  defaultAmazonTag: 'technicalsky-21',
  defaultFlipkartTag: 'technicalsky',
  inquiryEmail: 'contact@technicalsky.com',
  announcementNotice: 'TechnicalSky verified affiliate partner of Amazon & Flipkart',
  activeTheme: 'offwhite-grid',
  customBgUrl: '',
  customBgMobileUrl: '',
  themeMode: 'light',
  glassBlur: 'medium',
  glassOpacity: 'medium',
};

const TMP_SETTINGS_FILE = '/tmp/curator_settings.json';

export class SettingsService {
  private static cachedSettings: StoreSettings | null = null;
  private static tableEnsured = false;

  private static async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS store_settings (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      this.tableEnsured = true;
    } catch {
      // Non-fatal if table exists or permission handled
    }
  }

  static async getSettings(): Promise<StoreSettings> {
    if (this.cachedSettings) {
      return this.cachedSettings;
    }

    // 1. Try reading from Supabase PostgreSQL database (shared across all Vercel lambdas)
    try {
      await this.ensureTable();
      const rows = await prisma.$queryRawUnsafe<Array<{ data: any }>>(
        'SELECT data FROM store_settings WHERE id = $1 LIMIT 1',
        'current'
      );
      if (rows && rows.length > 0 && rows[0].data) {
        const resolved: StoreSettings = { ...DEFAULT_SETTINGS, ...rows[0].data };
        this.cachedSettings = resolved;
        return resolved;
      }
    } catch (dbErr) {
      console.warn('Database read for settings failed, checking fallbacks:', dbErr);
    }

    // 2. Try reading from /tmp (local container cache)
    try {
      if (fs.existsSync(TMP_SETTINGS_FILE)) {
        const raw = fs.readFileSync(TMP_SETTINGS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const resolved: StoreSettings = { ...DEFAULT_SETTINGS, ...parsed };
        this.cachedSettings = resolved;
        return resolved;
      }
    } catch {
      // Fallback to project root file
    }

    // 3. Try reading from project data file
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const resolved: StoreSettings = { ...DEFAULT_SETTINGS, ...parsed };
        this.cachedSettings = resolved;
        return resolved;
      }
    } catch (err) {
      console.warn('Could not read settings file, using defaults:', err);
    }

    const fallback: StoreSettings = { ...DEFAULT_SETTINGS };
    this.cachedSettings = fallback;
    return fallback;
  }

  static getSettingsSync(): StoreSettings {
    if (this.cachedSettings) return this.cachedSettings;
    try {
      if (fs.existsSync(TMP_SETTINGS_FILE)) {
        const raw = fs.readFileSync(TMP_SETTINGS_FILE, 'utf-8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch {}
    return { ...DEFAULT_SETTINGS };
  }

  static async updateSettings(partial: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getSettings();
    const updated: StoreSettings = {
      ...current,
      ...partial,
      defaultAmazonTag: partial.defaultAmazonTag !== undefined ? partial.defaultAmazonTag.trim() : current.defaultAmazonTag,
      defaultFlipkartTag: partial.defaultFlipkartTag !== undefined ? partial.defaultFlipkartTag.trim() : current.defaultFlipkartTag,
    };

    // 1. Immediately update memory cache
    this.cachedSettings = updated;

    // 2. Persist to Supabase PostgreSQL database
    try {
      await this.ensureTable();
      await prisma.$executeRawUnsafe(
        `INSERT INTO store_settings (id, data, updated_at) 
         VALUES ($1, $2::jsonb, NOW()) 
         ON CONFLICT (id) DO UPDATE SET data = $2::jsonb, updated_at = NOW()`,
        'current',
        JSON.stringify(updated)
      );
    } catch (dbErr) {
      console.error('Failed saving settings to Supabase DB:', dbErr);
    }

    // 3. Write to /tmp for guaranteed write access in serverless environments
    try {
      fs.writeFileSync(TMP_SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {
      // Non-critical
    }

    // 4. Try writing to project data file
    try {
      const dir = path.dirname(SETTINGS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {
      // In read-only serverless lambdas, writing to root dir may be prevented
    }

    return updated;
  }
}
