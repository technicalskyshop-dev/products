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

// Security and Parsing Middlewares
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Asset Uploads
app.use('/uploads', express.static(UPLOADS_DIR));

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

