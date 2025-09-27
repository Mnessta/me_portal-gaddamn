// Course-related types for the student portal

export interface Course {
  id: string
  name: string
  code: string
  description?: string
  instructor: string
  credits: number
  semester: string
  year: number
  isEnrolled: boolean
  enrolledAt?: Date
  enrollmentStatus?: string
  upcomingAssignments?: Assignment[]
  recentAnnouncements?: Announcement[]
  stats: CourseStats
}

export interface CourseDetail extends Course {
  assignments: AssignmentWithSubmission[]
  announcements: Announcement[]
  materials: CourseMaterial[]
}

export interface Assignment {
  id: string
  title: string
  dueDate: Date
}

export interface AssignmentWithSubmission extends Assignment {
  description?: string
  createdAt: Date
  submission?: {
    id: string
    submittedAt: Date
    status: string
  }
  grade?: {
    score: number
    maxScore: number
    feedback?: string
    gradedAt: Date
  }
}

export interface Announcement {
  id: string
  title: string
  content: string
  createdAt: Date
}

export interface CourseMaterial {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileName: string
  fileSize: number
  uploadedAt: Date
}

export interface CourseStats {
  totalAssignments: number
  totalAnnouncements: number
  totalMaterials: number
  completedAssignments?: number
  gradedAssignments?: number
}

export interface CourseFilters {
  search?: string
  semester?: string
  year?: string
}

export interface CourseListResponse {
  success: boolean
  data: Course[]
  message?: string
}

export interface CourseDetailResponse {
  success: boolean
  data: CourseDetail
  message?: string
}
