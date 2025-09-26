import { db } from '../lib/db'

async function testDatabase() {
  console.log('🔍 Testing database connection...')

  try {
    // Test basic connection
    await db.$connect()
    console.log('✅ Database connection successful')

    // Test user queries
    const userCount = await db.user.count()
    console.log(`📊 Total users: ${userCount}`)

    const courseCount = await db.course.count()
    console.log(`📚 Total courses: ${courseCount}`)

    const assignmentCount = await db.assignment.count()
    console.log(`📝 Total assignments: ${assignmentCount}`)

    // Test a complex query
    const studentWithCourses = await db.user.findFirst({
      where: { role: 'STUDENT' },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
        submissions: {
          include: {
            assignment: true,
            grades: true,
          },
        },
      },
    })

    if (studentWithCourses) {
      console.log(`👤 Sample student: ${studentWithCourses.name}`)
      console.log(`📚 Enrolled in ${studentWithCourses.enrollments.length} courses`)
      console.log(`📝 Has ${studentWithCourses.submissions.length} submissions`)
    }

    // Test GPA calculation
    const grades = await db.grade.findMany({
      where: { studentId: studentWithCourses?.id },
    })

    if (grades.length > 0) {
      const totalPoints = grades.reduce((sum, grade) => sum + grade.score, 0)
      const maxPoints = grades.reduce((sum, grade) => sum + grade.maxScore, 0)
      const gpa = maxPoints > 0 ? (totalPoints / maxPoints) * 4.0 : 0
      console.log(`🎯 Student GPA: ${gpa.toFixed(2)}`)
    }

    console.log('🎉 All database tests passed!')

  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testDatabase()
