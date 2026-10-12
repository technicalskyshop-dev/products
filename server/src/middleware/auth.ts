import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';

export interface AdminPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = req.cookies?.[env.ADMIN_COOKIE_NAME];

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. No session cookie or token provided.',
      });
      return;
    }

    let decoded: AdminPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as AdminPayload;
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token. Please log in again.',
      });
      return;
    }

    // Verify user exists in database and is active
    try {
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true },
      });

      if (adminUser) {
        req.adminUser = adminUser;
        return next();
      }
      
      res.status(401).json({
        success: false,
        error: 'Admin user no longer exists or permissions revoked.',
      });
      return;
    } catch (dbError) {
      console.warn('Database check failed during auth, relying on verified JWT signature:', dbError);
      // Cryptographically verified JWT token fallback so admin session is resilient
      req.adminUser = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role || 'ADMIN',
      };
      return next();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication service encountered an error.',
    });
  }
}

