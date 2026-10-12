import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { env } from '../config/env.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, user } = await AuthService.login(req.body);

      // Set secure HttpOnly cookie
      res.cookie(env.ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        user,
        token, // Included for authorization header support if cookies are blocked
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie(env.ADMIN_COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      user: req.adminUser,
    });
  }
}

