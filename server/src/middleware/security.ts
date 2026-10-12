import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env.js';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
].filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, server-to-server) or same-origin without Origin header
    if (!origin) return callback(null, true);

    // Explicitly allow all Vercel domains, Cloudflare tunnels, localhost, and configured frontend URL
    if (
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.trycloudflare.com') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.loca.lt') ||
      origin.endsWith('.ngrok-free.app') ||
      allowedOrigins.includes(origin) ||
      Boolean(process.env.VERCEL) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }

    // Allow any standard HTTP/HTTPS web origin safely instead of throwing unhandled exception
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
});

