import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../../public/uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  url: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  storageProvider: 'local' | 'cloudinary';
}

export class StorageService {
  static async uploadImage(
    buffer: Buffer,
    originalname: string,
    mimetype: string
  ): Promise<UploadResult> {
    if (!ALLOWED_MIME_TYPES.includes(mimetype.toLowerCase())) {
      throw new AppError(
        `Invalid image type '${mimetype}'. Only JPEG, PNG, and WebP are allowed.`,
        400
      );
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new AppError(
        `Image size exceeds 5MB limit (${(buffer.length / (1024 * 1024)).toFixed(2)}MB).`,
        400
      );
    }

    // Check if Cloudinary credentials are provided
    if (
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
    ) {
      // Cloudinary upload workflow
      try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const formData = new FormData();
        const base64Data = `data:${mimetype};base64,${buffer.toString('base64')}`;
        formData.append('file', base64Data);
        formData.append('api_key', env.CLOUDINARY_API_KEY);
        formData.append('timestamp', timestamp);

        // Cloudinary signed upload using API Key and Secret
        const signature = crypto
          .createHash('sha1')
          .update(`timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`)
          .digest('hex');
        formData.append('signature', signature);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );
        const data = (await res.json()) as { secure_url?: string; public_id?: string; error?: { message?: string } };

        if (data.secure_url) {
          return {
            url: data.secure_url,
            filename: data.public_id || originalname,
            sizeBytes: buffer.length,
            mimeType: mimetype,
            storageProvider: 'cloudinary',
          };
        } else if (data.error) {
          console.warn('Cloudinary API response warning:', data.error.message);
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back to local storage:', cloudErr);
      }
    }

    // Local secure storage
    const ext = path.extname(originalname).toLowerCase() || '.jpg';
    const randomName = `specimen-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const destinationPath = path.join(UPLOADS_DIR, randomName);

    await fs.promises.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${randomName}`;

    return {
      url: publicUrl,
      filename: randomName,
      sizeBytes: buffer.length,
      mimeType: mimetype,
      storageProvider: 'local',
    };
  }

  static async deleteLocalImage(urlPath: string): Promise<boolean> {
    try {
      if (!urlPath.startsWith('/uploads/')) return false;
      const filename = path.basename(urlPath);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Failed deleting local image file:', err);
      return false;
    }
  }
}

