import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { securityHeaders, corsMiddleware } from './middleware/security.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { publicRoutes } from './routes/publicRoutes.js';
import { redirectRoutes } from './routes/redirectRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../public/uploads');

export const app = express();

// Trust reverse proxy headers (Vercel, Cloudflare, etc.)
app.set('trust proxy', 1);

// Security and Parsing Middlewares
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Asset Uploads with CDN caching
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    },
  })
);

// Admin endpoints must always bypass cache across proxies, CDNs, and browsers
app.use(['/api/admin', '/admin'], (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// API Routes (Mounted under /api and root fallback for serverless functions)
app.use('/api', publicRoutes);
app.use('/api', redirectRoutes);
app.use('/api/admin', adminRoutes);

// Serverless fallback mounts (if runtime rewrites strip the /api prefix)
app.use('/admin', adminRoutes);
app.use('/go', redirectRoutes);
app.use('/', publicRoutes);

// Catch-all 404 for unknown endpoints
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

