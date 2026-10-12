import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { LoginInput, BootstrapAdminInput } from '../validation/authSchemas.js';

const BCRYPT_ROUNDS = 12;

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user: { id: string; email: string; role: string }): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );
  }

  static async login(input: LoginInput): Promise<{
    token: string;
    user: { id: string; email: string; role: string };
  }> {
    const user = await prisma.adminUser.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await this.comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async bootstrapAdmin(input: BootstrapAdminInput): Promise<{
    user: { id: string; email: string; role: string };
  }> {
    const existing = await prisma.adminUser.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    const passwordHash = await this.hashPassword(input.password);

    if (existing) {
      const updated = await prisma.adminUser.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          role: input.role,
        },
        select: { id: true, email: true, role: true },
      });
      return { user: updated };
    }

    const created = await prisma.adminUser.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role,
      },
      select: { id: true, email: true, role: true },
    });

    return { user: created };
  }
}

