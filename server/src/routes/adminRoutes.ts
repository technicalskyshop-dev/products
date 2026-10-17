import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { AdminController } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, updateCredentialsSchema } from '../validation/authSchemas.js';
import {
  createProductSchema,
  updateProductSchema,
  publishToggleSchema,
} from '../validation/productSchemas.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validation/categorySchemas.js';

const router = Router();

// --- Unprotected Auth Endpoints ---
router.post(
  '/auth/login',
  loginRateLimiter,
  validateBody(loginSchema),
  AuthController.login
);
router.post('/auth/logout', AuthController.logout);

// --- Protected Endpoints (Requires Admin Authentication) ---
router.use(requireAdmin);

// Current User & Session
router.get('/auth/me', AuthController.getMe);
router.patch(
  '/auth/credentials',
  validateBody(updateCredentialsSchema),
  AuthController.updateCredentials
);

// Overview Metrics & Analytics
router.get('/dashboard', AdminController.getDashboard);
router.get('/affiliate-clicks', AdminController.getAffiliateClicks);

// Image Upload
router.post('/upload-image', AdminController.uploadImage);

// Product Management
router.get('/products', AdminController.getProducts);
router.post(
  '/products',
  validateBody(createProductSchema),
  AdminController.createProduct
);
router.get('/products/:id', AdminController.getProduct);
router.patch(
  '/products/:id',
  validateBody(updateProductSchema),
  AdminController.updateProduct
);
router.delete('/products/:id', AdminController.deleteProduct);
router.patch(
  '/products/:id/publish',
  validateBody(publishToggleSchema),
  AdminController.togglePublish
);

// Category Management
router.get('/categories', AdminController.getCategories);
router.post(
  '/categories',
  validateBody(createCategorySchema),
  AdminController.createCategory
);
router.patch(
  '/categories/:id',
  validateBody(updateCategorySchema),
  AdminController.updateCategory
);
router.delete('/categories/:id', AdminController.deleteCategory);

// Storefront & Affiliate Settings
router.get('/settings', AdminController.getSettings);
router.patch('/settings', AdminController.updateSettings);
router.put('/settings', AdminController.updateSettings);

// Review Kits / Bundles
router.get('/kits', AdminController.getReviewKits);
router.post('/kits', AdminController.createReviewKit);
router.patch('/kits/:id', AdminController.updateReviewKit);
router.delete('/kits/:id', AdminController.deleteReviewKit);

export const adminRoutes = router;


