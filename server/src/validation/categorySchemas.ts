import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().trim().optional(),
  order: z.coerce.number().int().default(0),
  enabled: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const deleteCategoryQuerySchema = z.object({
  reassignToCategoryId: z.string().trim().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

