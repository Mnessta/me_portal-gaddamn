import { z } from 'zod'
import { Role } from '@prisma/client'

// User registration validation schema
export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  role: z.nativeEnum(Role).optional().default('STUDENT'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// User login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

// Password update validation schema
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
})

// Profile update validation schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  avatar: z.string().url('Invalid avatar URL').optional(),
})

// Type exports for use in API routes
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
