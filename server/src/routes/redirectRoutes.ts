import { Router } from 'express';
import { RedirectController } from '../controllers/redirectController.js';
import { redirectRateLimiter } from '../middleware/rateLimiter.js';
import { validateParams } from '../middleware/validate.js';
import { redirectParamsSchema } from '../validation/redirectSchemas.js';

const router = Router();

router.get(
  '/go/:productId/:platform',
  redirectRateLimiter,
  validateParams(redirectParamsSchema),
  RedirectController.handleAffiliateRedirect
);

export const redirectRoutes = router;

