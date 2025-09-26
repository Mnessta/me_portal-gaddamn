import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/jwt'
import { ApiResponse } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    } as ApiResponse)

    // Clear authentication cookie
    clearAuthCookie(response)

    return response

  } catch (error) {
    console.error('Logout error:', error)
    
    const response: ApiResponse = {
      success: false,
      message: 'Logout failed',
      error: 'An unexpected error occurred',
    }
    return NextResponse.json(response, { status: 500 })
  }
}
