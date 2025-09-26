'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Student Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/register')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Your
            <span className="text-primary block">Student Portal</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Manage your courses, track assignments, view grades, and stay connected with your academic journey all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/register')}
              className="text-lg px-8 py-3"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/login')}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Course Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View your enrolled courses, access materials, and track your progress.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Grade Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your grades, calculate GPA, and track academic performance.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Stay connected with instructors and classmates through announcements and messaging.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Assignment Hub</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Submit assignments, track deadlines, and receive feedback from instructors.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription>
                Join thousands of students who are already using our platform to manage their academic journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                onClick={() => router.push('/register')}
                className="w-full sm:w-auto"
              >
                Create Your Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
