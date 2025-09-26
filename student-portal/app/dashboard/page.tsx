'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, BookOpen, FileText, Award, Bell, RefreshCw } from 'lucide-react'
import { DashboardData } from '@/types/dashboard'
import { StatisticsWidget } from '@/components/dashboard/statistics-widget'
import { CourseCard } from '@/components/dashboard/course-card'
import { AssignmentCard } from '@/components/dashboard/assignment-card'
import { GradeCard } from '@/components/dashboard/grade-card'
import { AnnouncementCard } from '@/components/dashboard/announcement-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const handleLogout = async () => {
    await logout()
    // The logout function in auth context will handle the redirect
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/overview', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const result = await response.json()
      if (result.success) {
        setDashboardData(result.data)
      } else {
        throw new Error(result.message || 'Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Please wait while we load your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Student Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Welcome, {user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, {user.name}! Here's what's happening with your courses.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Statistics Widget */}
            <div className="mb-8">
              <StatisticsWidget statistics={dashboardData.statistics} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Left Column - Courses and Quick Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* My Courses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>My Courses</span>
                    </CardTitle>
                    <CardDescription>
                      Your enrolled courses for this semester
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.courses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dashboardData.courses.map((course) => (
                          <CourseCard key={course.id} course={course} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No courses enrolled yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Assignments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Upcoming Assignments</span>
                    </CardTitle>
                    <CardDescription>
                      Assignments due in the next 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.upcomingAssignments.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.upcomingAssignments.map((assignment) => (
                          <AssignmentCard key={assignment.id} assignment={assignment} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No upcoming assignments</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Recent Activity */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <QuickActions />

                {/* Recent Grades */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5" />
                      <span>Recent Grades</span>
                    </CardTitle>
                    <CardDescription>
                      Your latest graded assignments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.recentGrades.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.recentGrades.map((grade) => (
                          <GradeCard key={grade.id} grade={grade} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No grades yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Announcements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Recent Announcements</span>
                    </CardTitle>
                    <CardDescription>
                      Latest updates from your instructors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.recentAnnouncements.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.recentAnnouncements.map((announcement) => (
                          <AnnouncementCard key={announcement.id} announcement={announcement} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No announcements yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load dashboard data</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Try Again
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
