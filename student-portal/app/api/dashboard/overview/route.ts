import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'
import { ApiResponse } from '@/types/auth'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const userId = payload.userId

    // Fetch user's enrolled courses
    const enrollments = await db.enrollment.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        course: {
          include: {
            assignments: {
              where: { isPublished: true },
              orderBy: { dueDate: 'asc' },
              take: 5
            },
            announcements: {
              orderBy: { createdAt: 'desc' },
              take: 3
            }
          }
        }
      }
    })

    // Fetch user's recent submissions and grades
    const submissions = await db.submission.findMany({
      where: { studentId: userId },
      include: {
        assignment: {
          include: { course: true }
        },
        grades: {
          orderBy: { gradedAt: 'desc' }
        }
      },
      orderBy: { submittedAt: 'desc' },
      take: 10
    })

    // Calculate GPA
    const grades = await db.grade.findMany({
      where: { studentId: userId, status: 'GRADED' },
      include: { submission: { include: { assignment: true } } }
    })

    let totalPoints = 0
    let earnedPoints = 0
    let gpa = 0

    if (grades.length > 0) {
      grades.forEach(grade => {
        totalPoints += grade.maxScore
        earnedPoints += grade.score
      })
      gpa = totalPoints > 0 ? (earnedPoints / totalPoints) * 4 : 0
    }

    // Get upcoming assignments (due in next 7 days)
    const upcomingAssignments = enrollments.flatMap(enrollment =>
      enrollment.course.assignments
        .filter(assignment => {
          const dueDate = new Date(assignment.dueDate)
          const now = new Date()
          const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          return dueDate > now && dueDate <= sevenDaysFromNow
        })
        .map(assignment => ({
          ...assignment,
          courseName: enrollment.course.name,
          courseCode: enrollment.course.code
        }))
    )

    // Get recent announcements
    const recentAnnouncements = enrollments.flatMap(enrollment =>
      enrollment.course.announcements.map(announcement => ({
        ...announcement,
        courseName: enrollment.course.name,
        courseCode: enrollment.course.code
      }))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

    // Get recent grades
    const recentGrades = grades
      .sort((a, b) => new Date(b.gradedAt || 0).getTime() - new Date(a.gradedAt || 0).getTime())
      .slice(0, 5)
      .map(grade => ({
        ...grade,
        assignmentTitle: grade.submission.assignment.title,
        courseName: grade.submission.assignment.course.name,
        courseCode: grade.submission.assignment.course.code
      }))

    const dashboardData = {
      courses: enrollments.map(enrollment => ({
        id: enrollment.course.id,
        name: enrollment.course.name,
        code: enrollment.course.code,
        instructor: enrollment.course.instructor,
        credits: enrollment.course.credits,
        semester: enrollment.course.semester,
        year: enrollment.course.year,
        assignmentCount: enrollment.course.assignments.length,
        announcementCount: enrollment.course.announcements.length
      })),
      upcomingAssignments,
      recentAnnouncements,
      recentGrades,
      statistics: {
        totalCourses: enrollments.length,
        totalAssignments: enrollments.reduce((sum, e) => sum + e.course.assignments.length, 0),
        submittedAssignments: submissions.filter(s => s.status === 'SUBMITTED').length,
        gradedAssignments: grades.length,
        gpa: Math.round(gpa * 100) / 100,
        totalPoints,
        earnedPoints
      }
    }

    const response: ApiResponse = {
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Dashboard overview error:', error)
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve dashboard data',
      error: 'An unexpected error occurred'
    }
    return NextResponse.json(response, { status: 500 })
  }
}
