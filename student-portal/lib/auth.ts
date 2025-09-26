import bcrypt from 'bcryptjs'
import { db } from './db'
import { UserData } from '@/types/auth'
import { Role } from '@prisma/client'

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Find user by email
export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  })
}

// Find user by ID
export async function findUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  })
}

// Create new user
export async function createUser(data: {
  email: string
  password: string
  name: string
  role?: Role
}) {
  const hashedPassword = await hashPassword(data.password)
  
  return db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || 'STUDENT',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  })
}

// Check if email already exists
export async function emailExists(email: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  })
  return !!user
}

// Convert Prisma user to UserData type
export function toUserData(user: any): UserData {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  }
}

// Validate user role
export function hasRole(user: UserData, requiredRole: Role): boolean {
  const roleHierarchy = {
    STUDENT: 1,
    INSTRUCTOR: 2,
    ADMIN: 3,
  }
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

// Check if user can access resource
export function canAccess(user: UserData, resourceOwnerId?: string): boolean {
  // Admin can access everything
  if (user.role === 'ADMIN') return true
  
  // Users can access their own resources
  if (resourceOwnerId && user.id === resourceOwnerId) return true
  
  // Instructors can access course-related resources
  if (user.role === 'INSTRUCTOR') return true
  
  return false
}
