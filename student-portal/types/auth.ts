import { Role } from '@prisma/client'

// Authentication request/response types
export interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: Role
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: UserData
  token?: string
}

export interface UserData {
  id: string
  email: string
  name: string
  role: Role
  avatar?: string
  createdAt: Date
}

// JWT payload type
export interface JWTPayload {
  userId: string
  email: string
  role: Role
  iat: number
  exp: number
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// Middleware types
export interface AuthenticatedRequest extends Request {
  user?: UserData
}

// Session types
export interface SessionData {
  user: UserData
  token: string
  expiresAt: Date
}
