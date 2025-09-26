import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@university.edu' },
    update: {},
    create: {
      email: 'instructor@university.edu',
      name: 'Dr. Sarah Johnson',
      password: hashedPassword,
      role: 'INSTRUCTOR',
    },
  })

  const student1 = await prisma.user.upsert({
    where: { email: 'john.doe@student.edu' },
    update: {},
    create: {
      email: 'john.doe@student.edu',
      name: 'John Doe',
      password: hashedPassword,
      role: 'STUDENT',
    },
  })

  const student2 = await prisma.user.upsert({
    where: { email: 'jane.smith@student.edu' },
    update: {},
    create: {
      email: 'jane.smith@student.edu',
      name: 'Jane Smith',
      password: hashedPassword,
      role: 'STUDENT',
    },
  })

  console.log('✅ Users created:', { instructor: instructor.name, students: [student1.name, student2.name] })

  // Create sample courses
  const course1 = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      name: 'Introduction to Computer Science',
      code: 'CS101',
      description: 'Fundamental concepts of computer science and programming',
      instructor: 'Dr. Sarah Johnson',
      credits: 3,
      semester: 'Fall 2024',
      year: 2024,
    },
  })

  const course2 = await prisma.course.upsert({
    where: { code: 'MATH201' },
    update: {},
    create: {
      name: 'Calculus II',
      code: 'MATH201',
      description: 'Advanced calculus concepts and applications',
      instructor: 'Dr. Michael Brown',
      credits: 4,
      semester: 'Fall 2024',
      year: 2024,
    },
  })

  console.log('✅ Courses created:', { courses: [course1.name, course2.name] })

  // Create enrollments
  const enrollments = [
    { userId: student1.id, courseId: course1.id },
    { userId: student1.id, courseId: course2.id },
    { userId: student2.id, courseId: course1.id },
  ]

  for (const enrollment of enrollments) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
        },
      },
      update: {},
      create: enrollment,
    })
  }

  console.log('✅ Enrollments created')

  // Create sample assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Programming Assignment 1',
      description: 'Create a simple calculator program',
      instructions: 'Write a Python program that can perform basic arithmetic operations',
      dueDate: new Date('2024-10-15T23:59:59Z'),
      maxPoints: 100,
      courseId: course1.id,
      isPublished: true,
    },
  })

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Integration Problems',
      description: 'Solve integration problems from chapter 5',
      instructions: 'Complete problems 1-20 from the textbook',
      dueDate: new Date('2024-10-20T23:59:59Z'),
      maxPoints: 50,
      courseId: course2.id,
      isPublished: true,
    },
  })

  console.log('✅ Assignments created:', { assignments: [assignment1.title, assignment2.title] })

  // Create sample submissions
  const submission1 = await prisma.submission.create({
    data: {
      content: 'Here is my calculator program...',
      studentId: student1.id,
      assignmentId: assignment1.id,
      status: 'SUBMITTED',
    },
  })

  const submission2 = await prisma.submission.create({
    data: {
      content: 'My solutions to the integration problems...',
      studentId: student1.id,
      assignmentId: assignment2.id,
      status: 'SUBMITTED',
    },
  })

  console.log('✅ Submissions created')

  // Create sample grades
  await prisma.grade.create({
    data: {
      score: 85,
      maxScore: 100,
      feedback: 'Good work! The program works correctly but could use better error handling.',
      status: 'GRADED',
      gradedAt: new Date(),
      studentId: student1.id,
      submissionId: submission1.id,
    },
  })

  await prisma.grade.create({
    data: {
      score: 45,
      maxScore: 50,
      feedback: 'Excellent solutions! Minor calculation errors in problems 15 and 18.',
      status: 'GRADED',
      gradedAt: new Date(),
      studentId: student1.id,
      submissionId: submission2.id,
    },
  })

  console.log('✅ Grades created')

  // Create sample announcements
  await prisma.announcement.create({
    data: {
      title: 'Welcome to CS101!',
      content: 'Welcome to Introduction to Computer Science. Please review the syllabus and course schedule.',
      courseId: course1.id,
      authorId: instructor.id,
      isPinned: true,
    },
  })

  await prisma.announcement.create({
    data: {
      title: 'Assignment 1 Due Date Reminder',
      content: 'Just a reminder that Assignment 1 is due on October 15th at 11:59 PM.',
      courseId: course1.id,
      authorId: instructor.id,
    },
  })

  console.log('✅ Announcements created')

  // Create sample notifications
  const notifications = [
    {
      title: 'New Assignment Posted',
      message: 'A new assignment has been posted in CS101',
      type: 'ASSIGNMENT',
      userId: student1.id,
    },
    {
      title: 'Grade Posted',
      message: 'Your grade for Programming Assignment 1 has been posted',
      type: 'GRADE',
      userId: student1.id,
    },
  ]

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    })
  }

  console.log('✅ Notifications created')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
