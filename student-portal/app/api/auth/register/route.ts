import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { createUser, emailExists, toUserData } from '@/lib/auth'
import { generateToken, setAuthCookie } from '@/lib/jwt'
import { ApiResponse } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        error: validationResult.error.issues.map(e => e.message).join(', '),
      }
      return NextResponse.json(response, { status: 400 })
    }

    const { email, password, name, role } = validationResult.data

    // Check if email already exists
    if (await emailExists(email)) {
      const response: ApiResponse = {
        success: false,
        message: 'Email already registered',
        error: 'An account with this email already exists',
      }
      return NextResponse.json(response, { status: 409 })
    }

    // Create user
    const user = await createUser({ email, password, name, role })
    const userData = toUserData(user)

    // Generate JWT token
    const token = generateToken(userData)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token,
      },
    } as ApiResponse)

    // Set authentication cookie
    setAuthCookie(response, token)

    return response

  } catch (error) {
    console.error('Registration error:', error)
    
    const response: ApiResponse = {
      success: false,
      message: 'Registration failed',
      error: 'An unexpected error occurred',
    }
    return NextResponse.json(response, { status: 500 })
  }
}
