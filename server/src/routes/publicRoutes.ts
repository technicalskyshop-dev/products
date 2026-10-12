import { Router } from 'express';
import { PublicController } from '../controllers/publicController.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Rate limiting on public API requests
router.use(apiRateLimiter);

router.get('/products', PublicController.getProducts);
router.get('/products/:slug', PublicController.getProductBySlug);
router.get('/categories', PublicController.getCategories);
router.get('/categories/:slug/products', PublicController.getCategoryProducts);
router.get('/settings', PublicController.getSettings);
router.get('/health', PublicController.health);

export const publicRoutes = router;

