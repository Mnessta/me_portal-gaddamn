import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const { id: courseId } = await params

    // Check if course exists and is active
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        isActive: true
      }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found or not available' },
        { status: 404 }
      )
    }

    // Check if user is already enrolled
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: payload.userId,
        courseId: courseId
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, message: 'You are already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId: payload.userId,
        courseId: courseId,
        enrolledAt: new Date(),
        status: 'ACTIVE'
      },
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in ${enrollment.course.name}`,
      data: {
        enrollmentId: enrollment.id,
        courseName: enrollment.course.name,
        courseCode: enrollment.course.code,
        enrolledAt: enrollment.enrolledAt
      }
    })

  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to enroll in course' },
      { status: 500 }
    )
  }
}
