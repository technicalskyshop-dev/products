import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
};

export class SettingsService {
  private static cachedSettings: StoreSettings | null = null;

  static getSettings(): StoreSettings {
    if (this.cachedSettings) {
      return this.cachedSettings;
    }

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

  static updateSettings(partial: Partial<StoreSettings>): StoreSettings {
    const current = this.getSettings();
    const updated: StoreSettings = {
      ...current,
      ...partial,
      defaultAmazonTag: partial.defaultAmazonTag !== undefined ? partial.defaultAmazonTag.trim() : current.defaultAmazonTag,
      defaultFlipkartTag: partial.defaultFlipkartTag !== undefined ? partial.defaultFlipkartTag.trim() : current.defaultFlipkartTag,
    };

    try {
      const dir = path.dirname(SETTINGS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      this.cachedSettings = updated;
    } catch (err) {
      console.error('Failed to write settings to disk:', err);
      this.cachedSettings = updated;
    }

    return updated;
  }
}
