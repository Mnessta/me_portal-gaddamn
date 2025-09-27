'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Award,
  FileText,
  Bell,
  FolderOpen,
  ArrowRight,
  Clock
} from 'lucide-react'
import { Course, CourseFilters } from '@/types/course'
import { format } from 'date-fns'

export default function CoursesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<CourseFilters>({
    search: '',
    semester: '',
    year: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true)
        const response = await fetch('/api/courses')
        const result = await response.json()
        
        if (result.success) {
          setCourses(result.data)
          setFilteredCourses(result.data)
        } else {
          console.error('Failed to fetch courses:', result.message)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoadingCourses(false)
      }
    }

    if (user) {
      fetchCourses()
    }
  }, [user])

  // Apply filters
  useEffect(() => {
    let filtered = courses

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchLower) ||
        course.code.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower)
      )
    }

    if (filters.semester) {
      filtered = filtered.filter(course => course.semester === filters.semester)
    }

    if (filters.year) {
      filtered = filtered.filter(course => course.year.toString() === filters.year)
    }

    setFilteredCourses(filtered)
  }, [courses, filters])

  // Get unique semesters and years for filter options
  const semesters = [...new Set(courses.map(c => c.semester))].sort()
  const years = [...new Set(courses.map(c => c.year))].sort((a, b) => b - a)

  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }

  const handleEnroll = async (courseId: string, courseName: string) => {
    try {
      setEnrollingCourses(prev => new Set(prev).add(courseId))
      
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // Update the course enrollment status
        setCourses(prev => prev.map(course => 
          course.id === courseId 
            ? { ...course, isEnrolled: true, enrolledAt: new Date() }
            : course
        ))
        
        // Show success message
        alert(`Successfully enrolled in ${courseName}!`)
      } else {
        alert(`Failed to enroll: ${result.message}`)
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
      alert('Failed to enroll in course. Please try again.')
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev)
        newSet.delete(courseId)
        return newSet
      })
    }
  }

  if (loading || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Courses...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your courses.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">All Courses</h1>
          </div>
          <p className="text-muted-foreground">
            Browse available courses and enroll in the ones that interest you.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              {/* Semester Filter */}
              <select
                value={filters.semester}
                onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Semesters</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>

              {/* Year Filter */}
              <select
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => setFilters({ search: '', semester: '', year: '' })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {courses.length} available courses
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                {courses.length === 0 
                  ? "No courses are currently available."
                  : "No courses match your current filters."
                }
              </p>
              {courses.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setFilters({ search: '', semester: '', year: '' })}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card 
                key={course.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{course.name}</CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{course.code}</p>
                    </div>
                    <Badge variant="secondary">{course.credits} credits</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Instructor */}
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{course.instructor}</span>
                    </div>

                    {/* Semester & Year */}
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{course.semester} {course.year}</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>{course.stats.totalAssignments}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Assignments</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                          <Bell className="h-3 w-3" />
                          <span>{course.stats.totalAnnouncements}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Notices</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                          <FolderOpen className="h-3 w-3" />
                          <span>{course.stats.totalMaterials}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Materials</p>
                      </div>
                    </div>

                    {/* Upcoming Assignments */}
                    {course.upcomingAssignments && course.upcomingAssignments.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Upcoming Assignments</p>
                        {course.upcomingAssignments.slice(0, 2).map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between text-xs">
                            <span className="truncate flex-1">{assignment.title}</span>
                            <div className="flex items-center space-x-1 text-muted-foreground ml-2">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(assignment.dueDate), 'MMM dd')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 space-y-2">
                      {course.isEnrolled ? (
                        <div className="space-y-2">
                          <Badge variant="default" className="w-full justify-center bg-green-500">
                            ✓ Enrolled
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCourseClick(course.id)
                            }}
                          >
                            View Course
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full"
                            disabled={enrollingCourses.has(course.id)}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEnroll(course.id, course.name)
                            }}
                          >
                            {enrollingCourses.has(course.id) ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Enrolling...
                              </>
                            ) : (
                              'Enroll in Course'
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCourseClick(course.id)
                            }}
                          >
                            View Details
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
