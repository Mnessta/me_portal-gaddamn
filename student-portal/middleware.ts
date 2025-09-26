import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { findUserById, toUserData } from '@/lib/auth'
import { Role } from '@prisma/client'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
]

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/courses',
  '/assignments',
  '/grades',
  '/profile',
  '/settings',
]

// Define admin-only routes
const adminRoutes = [
  '/admin',
  '/api/admin',
]

// Define instructor-only routes
const instructorRoutes = [
  '/instructor',
  '/api/instructor',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isInstructorRoute = instructorRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute || isAdminRoute || isInstructorRoute) {
    // No token found
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }

    // Get user data
    const user = await findUserById(payload.userId)
    if (!user) {
      // User not found, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }

    const userData = toUserData(user)

    // Check role-based access
    if (isAdminRoute && userData.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isInstructorRoute && !['INSTRUCTOR', 'ADMIN'].includes(userData.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add user data to request headers for use in API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', userData.id)
    requestHeaders.set('x-user-email', userData.email)
    requestHeaders.set('x-user-role', userData.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
