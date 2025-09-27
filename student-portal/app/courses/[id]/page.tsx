'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  ArrowLeft, 
  User, 
  Calendar, 
  Award,
  FileText,
  Bell,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  ExternalLink
} from 'lucide-react'
import { CourseDetail } from '@/types/course'
import { format } from 'date-fns'

export default function CourseDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loadingCourse, setLoadingCourse] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'materials' | 'announcements'>('overview')

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoadingCourse(true)
        setError(null)
        const response = await fetch(`/api/courses/${params.id}`)
        const result = await response.json()
        
        if (result.success) {
          setCourse(result.data)
        } else {
          console.error('Failed to fetch course:', result.message)
          setError(result.message || 'Failed to load course details')
        }
      } catch (error) {
        console.error('Error fetching course:', error)
        setError('Network error. Please try again.')
      } finally {
        setLoadingCourse(false)
      }
    }

    if (user && params.id) {
      fetchCourse()
    }
  }, [user, params.id])

  const getAssignmentStatus = (assignment: any) => {
    if (assignment.grade) return 'graded'
    if (assignment.submission) return 'submitted'
    const now = new Date()
    const dueDate = new Date(assignment.dueDate)
    if (now > dueDate) return 'overdue'
    return 'pending'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge variant="default" className="bg-green-500">Graded</Badge>
      case 'submitted':
        return <Badge variant="default" className="bg-blue-500">Submitted</Badge>
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const handleEnroll = async () => {
    if (!course) return

    try {
      setEnrolling(true)
      
      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // Update the course enrollment status
        setCourse(prev => prev ? { ...prev, isEnrolled: true, enrolledAt: new Date() } : null)
        alert(`Successfully enrolled in ${course.name}!`)
      } else {
        alert(`Failed to enroll: ${result.message}`)
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
      alert('Failed to enroll in course. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading || loadingCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Course...</h2>
          <p className="text-muted-foreground">Please wait while we fetch course details.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Course</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/courses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  const progressPercentage = course.stats.totalAssignments > 0 
    ? (course.stats.completedAssignments! / course.stats.totalAssignments) * 100 
    : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/courses')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">{course.name}</h1>
              </div>
              <p className="text-lg text-muted-foreground font-mono mb-2">{course.code}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{course.semester} {course.year}</span>
                </div>
                <Badge variant="secondary">{course.credits} credits</Badge>
              </div>
            </div>
            
            {/* Enrollment Status/Action */}
            <div className="flex flex-col items-end space-y-2">
              {course.isEnrolled ? (
                <Badge variant="default" className="bg-green-500">
                  ✓ Enrolled
                </Badge>
              ) : (
                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="min-w-[120px]"
                >
                  {enrolling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enrolling...
                    </>
                  ) : (
                    'Enroll in Course'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{course.stats.totalAssignments}</p>
                  <p className="text-sm text-muted-foreground">Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{course.stats.totalAnnouncements}</p>
                  <p className="text-sm text-muted-foreground">Notices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{course.stats.totalMaterials}</p>
                  <p className="text-sm text-muted-foreground">Materials</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{course.stats.gradedAssignments}</p>
                  <p className="text-sm text-muted-foreground">Graded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Assignments Completed</span>
                <span>{course.stats.completedAssignments} / {course.stats.totalAssignments}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}% of assignments completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'assignments', label: 'Assignments', icon: FileText },
                { id: 'materials', label: 'Materials', icon: FolderOpen },
                { id: 'announcements', label: 'Notices', icon: Bell }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {course.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{course.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Recent Announcements */}
            {course.announcements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.announcements.slice(0, 3).map((announcement) => (
                      <div key={announcement.id} className="border-l-4 border-primary pl-4">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {announcement.content.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(announcement.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {course.assignments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                  <p className="text-muted-foreground">Assignments will appear here when they are created.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {course.assignments.map((assignment) => {
                    const status = getAssignmentStatus(assignment)
                    return (
                      <div key={assignment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(status)}
                              <h4 className="font-medium">{assignment.title}</h4>
                              {getStatusBadge(status)}
                            </div>
                            {assignment.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {assignment.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}</span>
                              </div>
                              {assignment.submission && (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Submitted: {format(new Date(assignment.submission.submittedAt), 'MMM dd, yyyy')}</span>
                                </div>
                              )}
                            </div>
                            {assignment.grade && (
                              <div className="mt-2 p-2 bg-muted rounded">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Grade: {assignment.grade.score}/{assignment.grade.maxScore}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {format(new Date(assignment.grade.gradedAt), 'MMM dd, yyyy')}
                                  </span>
                                </div>
                                {assignment.grade.feedback && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {assignment.grade.feedback}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'materials' && (
          <Card>
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
            </CardHeader>
            <CardContent>
              {course.materials.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No materials yet</h3>
                  <p className="text-muted-foreground">Course materials will appear here when they are uploaded.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {course.materials.map((material) => (
                    <div key={material.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{material.title}</h4>
                          {material.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {material.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                            <Badge variant="outline">{material.fileName}</Badge>
                            <span>{format(new Date(material.uploadedAt), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        {material.fileUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'announcements' && (
          <Card>
            <CardHeader>
              <CardTitle>Course Notices</CardTitle>
            </CardHeader>
            <CardContent>
              {course.announcements.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notices yet</h3>
                  <p className="text-muted-foreground">Course notices will appear here when they are posted.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {course.announcements.map((announcement) => (
                    <div key={announcement.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{announcement.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {announcement.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(announcement.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
