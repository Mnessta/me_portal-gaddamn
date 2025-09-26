export interface Course {
  id: string
  name: string
  code: string
  instructor: string
  credits: number
  semester: string
  year: number
  assignmentCount: number
  announcementCount: number
}

export interface UpcomingAssignment {
  id: string
  title: string
  description?: string
  dueDate: string
  maxPoints: number
  courseName: string
  courseCode: string
}

export interface RecentAnnouncement {
  id: string
  title: string
  content: string
  courseName: string
  courseCode: string
  isPinned: boolean
  createdAt: string
}

export interface RecentGrade {
  id: string
  score: number
  maxScore: number
  feedback?: string
  gradedAt?: string
  assignmentTitle: string
  courseName: string
  courseCode: string
}

export interface DashboardStatistics {
  totalCourses: number
  totalAssignments: number
  submittedAssignments: number
  gradedAssignments: number
  gpa: number
  totalPoints: number
  earnedPoints: number
}

export interface DashboardData {
  courses: Course[]
  upcomingAssignments: UpcomingAssignment[]
  recentAnnouncements: RecentAnnouncement[]
  recentGrades: RecentGrade[]
  statistics: DashboardStatistics
}
