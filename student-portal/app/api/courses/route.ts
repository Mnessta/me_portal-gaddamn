import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
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

    // Get query parameters for search and filtering
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const semester = searchParams.get('semester') || ''
    const year = searchParams.get('year') || ''

    // Build where clause for filtering - show all active courses
    const whereClause: any = {
      isActive: true
    }

    // Add search filter (case-insensitive using OR conditions for SQLite compatibility)
    if (search) {
      const searchLower = search.toLowerCase()
      const searchUpper = search.toUpperCase()
      const searchCapitalized = search.charAt(0).toUpperCase() + search.slice(1).toLowerCase()
      
      whereClause.OR = [
        // Course name matches
        { name: { contains: search } },
        { name: { contains: searchLower } },
        { name: { contains: searchUpper } },
        { name: { contains: searchCapitalized } },
        // Course code matches
        { code: { contains: search } },
        { code: { contains: searchLower } },
        { code: { contains: searchUpper } },
        { code: { contains: searchCapitalized } },
        // Instructor name matches
        { instructor: { contains: search } },
        { instructor: { contains: searchLower } },
        { instructor: { contains: searchUpper } },
        { instructor: { contains: searchCapitalized } }
      ]
    }

    // Add semester filter
    if (semester) {
      whereClause.semester = semester
    }

    // Add year filter
    if (year) {
      whereClause.year = parseInt(year)
    }

    // Fetch all courses with enrollment status for current user
    const courses = await db.course.findMany({
      where: whereClause,
      include: {
        enrollments: {
          where: {
            userId: payload.userId
          },
          select: {
            enrolledAt: true,
            status: true
          }
        },
        assignments: {
          select: {
            id: true,
            title: true,
            dueDate: true
          },
          orderBy: {
            dueDate: 'asc'
          }
        },
        announcements: {
          select: {
            id: true,
            title: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        },
        _count: {
          select: {
            assignments: true,
            announcements: true,
            materials: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { semester: 'asc' },
        { name: 'asc' }
      ]
    })

    // Transform the data for the frontend
    const transformedCourses = courses.map(course => ({
      id: course.id,
      name: course.name,
      code: course.code,
      description: course.description,
      instructor: course.instructor,
      credits: course.credits,
      semester: course.semester,
      year: course.year,
      isEnrolled: course.enrollments.length > 0,
      enrolledAt: course.enrollments[0]?.enrolledAt,
      enrollmentStatus: course.enrollments[0]?.status,
      upcomingAssignments: course.assignments.slice(0, 3),
      recentAnnouncements: course.announcements,
      stats: {
        totalAssignments: course._count.assignments,
        totalAnnouncements: course._count.announcements,
        totalMaterials: course._count.materials
      }
    }))

    return NextResponse.json({
      success: true,
      data: transformedCourses
    })

  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
