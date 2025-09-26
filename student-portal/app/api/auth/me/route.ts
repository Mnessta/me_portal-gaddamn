import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { findUserById, toUserData } from '@/lib/auth'
import { ApiResponse } from '@/types/auth'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Not authenticated',
        error: 'No authentication token found',
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid token',
        error: 'Authentication token is invalid or expired',
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Find user by ID
    const user = await findUserById(payload.userId)
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
        error: 'User account no longer exists',
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Convert to UserData
    const userData = toUserData(user)

    const response: ApiResponse = {
      success: true,
      message: 'User data retrieved successfully',
      data: userData,
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get user error:', error)
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to get user data',
      error: 'An unexpected error occurred',
    }
    return NextResponse.json(response, { status: 500 })
  }
}
