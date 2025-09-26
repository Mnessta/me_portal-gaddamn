import jwt from 'jsonwebtoken'
import { JWTPayload, UserData } from '@/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Generate JWT token
export function generateToken(user: UserData): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

// Create secure cookie options
export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  }
}

// Set authentication cookie
export function setAuthCookie(response: Response, token: string): void {
  const cookieOptions = getCookieOptions()
  
  response.headers.set(
    'Set-Cookie',
    `auth-token=${token}; HttpOnly; ${cookieOptions.secure ? 'Secure;' : ''} SameSite=Strict; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}`
  )
}

// Clear authentication cookie
export function clearAuthCookie(response: Response): void {
  response.headers.set(
    'Set-Cookie',
    'auth-token=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/'
  )
}
