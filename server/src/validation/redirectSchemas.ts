import { z } from 'zod';

export const redirectParamsSchema = z.object({
  productId: z.string().trim().min(1, 'Product ID is required'),
  platform: z.enum(['amazon', 'flipkart']),
});

export type RedirectParams = z.infer<typeof redirectParamsSchema>;
