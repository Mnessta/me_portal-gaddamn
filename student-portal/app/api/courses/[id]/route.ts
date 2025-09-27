import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'

export async function GET(
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

    // Fetch course details - show all active courses, not just enrolled ones
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        isActive: true
      },
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
          include: {
            submissions: {
              where: {
                studentId: payload.userId
              },
              select: {
                id: true,
                submittedAt: true,
                status: true,
                grades: {
                  select: {
                    score: true,
                    maxScore: true,
                    feedback: true,
                    gradedAt: true
                  }
                }
              }
            }
          },
          orderBy: {
            dueDate: 'asc'
          }
        },
        announcements: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        materials: {
          orderBy: {
            uploadedAt: 'desc'
          }
        },
        _count: {
          select: {
            assignments: true,
            announcements: true,
            materials: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    // Transform assignments with submission status
    const transformedAssignments = course.assignments.map(assignment => {
      const submission = assignment.submissions[0]
      const grade = submission?.grades[0]
      
      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
        submission: submission ? {
          id: submission.id,
          submittedAt: submission.submittedAt,
          status: submission.status
        } : null,
        grade: grade ? {
          score: grade.score,
          maxScore: grade.maxScore,
          feedback: grade.feedback,
          gradedAt: grade.gradedAt
        } : null
      }
    })

    // Transform the course data
    const transformedCourse = {
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
      assignments: transformedAssignments,
      announcements: course.announcements,
      materials: course.materials,
      stats: {
        totalAssignments: course._count.assignments,
        totalAnnouncements: course._count.announcements,
        totalMaterials: course._count.materials,
        completedAssignments: transformedAssignments.filter(a => a.submission?.status === 'SUBMITTED' || a.submission?.status === 'GRADED').length,
        gradedAssignments: transformedAssignments.filter(a => a.grade).length
      }
    }

    return NextResponse.json({
      success: true,
      data: transformedCourse
    })

  } catch (error) {
    console.error('Error fetching course details:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course details' },
      { status: 500 }
    )
  }
}
