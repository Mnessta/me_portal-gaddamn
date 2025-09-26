import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations'
import { findUserByEmail, verifyPassword, toUserData } from '@/lib/auth'
import { generateToken, setAuthCookie } from '@/lib/jwt'
import { ApiResponse } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        error: validationResult.error.issues.map(e => e.message).join(', '),
      }
      return NextResponse.json(response, { status: 400 })
    }

    const { email, password } = validationResult.data

    // Find user by email
    const user = await findUserByEmail(email)
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid credentials',
        error: 'Email or password is incorrect',
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid credentials',
        error: 'Email or password is incorrect',
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Convert to UserData (exclude password)
    const userData = toUserData(user)

    // Generate JWT token
    const token = generateToken(userData)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
      },
    } as ApiResponse)

    // Set authentication cookie
    setAuthCookie(response, token)

    return response

  } catch (error) {
    console.error('Login error:', error)
    
    const response: ApiResponse = {
      success: false,
      message: 'Login failed',
      error: 'An unexpected error occurred',
    }
    return NextResponse.json(response, { status: 500 })
  }
}
