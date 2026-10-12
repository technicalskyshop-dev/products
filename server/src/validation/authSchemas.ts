import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const bootstrapAdminSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']).default('ADMIN'),
});

export const updateCredentialsSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required to verify identity'),
    newEmail: z.string().trim().email('Invalid email address format').optional().or(z.literal('')),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long').optional().or(z.literal('')),
  })
  .refine((data) => Boolean(data.newEmail || data.newPassword), {
    message: 'Please provide either a new email or a new password to update',
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type BootstrapAdminInput = z.infer<typeof bootstrapAdminSchema>;
export type UpdateCredentialsInput = z.infer<typeof updateCredentialsSchema>;

