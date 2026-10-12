import { z } from 'zod';

export function slugifyText(text: string): string {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const httpUrlSchema = z
  .string()
  .trim()
  .refine((val) => /^https?:\/\/.+/i.test(val), {
    message: 'URL must begin with http:// or https://',
  });

const optionalHttpUrlSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((val) => !val || /^https?:\/\/.+/i.test(val), {
    message: 'URL must begin with http:// or https://',
  })
  .transform((val) => val || '');

const baseProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().trim().optional(),
  shortDescription: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  categoryId: z.string().trim().min(1, 'Category ID is required'),
  imageUrl: z.string().trim().min(1, 'Product image URL is required'),
  displayPrice: z.string().trim().min(1, 'Display price is required'),
  priceAmount: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
  originalPrice: z.string().trim().optional().nullable(),
  originalPriceAmount: z.coerce.number().optional().nullable(),
  verifiedPriceSource: z.string().trim().optional().nullable().default('Curator Verified'),
  amazonUrl: optionalHttpUrlSchema,
  flipkartUrl: optionalHttpUrlSchema,
  aspectRatio: z.string().trim().optional().default('aspect-[3/4]'),
  heightClass: z.string().trim().optional().default('h-80 sm:h-96 lg:h-[410px]'),
  status: z.enum(['published', 'draft']).default('published'),
  isFeatured: z.boolean().default(false),
});

export const createProductSchema = baseProductSchema.refine(
  (data) => Boolean((data.amazonUrl && data.amazonUrl.trim()) || (data.flipkartUrl && data.flipkartUrl.trim())),
  {
    message: 'At least one affiliate destination URL (Amazon or Flipkart) is required',
    path: ['amazonUrl'],
  }
);

export const updateProductSchema = baseProductSchema.partial();

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(['all', 'published', 'draft']).optional().default('all'),
  isFeatured: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z
    .enum(['name_asc', 'name_desc', 'price_asc', 'price_desc', 'newest'])
    .optional()
    .default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(24),
});

export const publishToggleSchema = z.object({
  status: z.enum(['published', 'draft']),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;

