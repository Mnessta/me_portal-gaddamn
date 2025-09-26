'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, User, Calendar, FileText, Bell } from 'lucide-react'
import { Course } from '@/types/dashboard'
import Link from 'next/link'

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{course.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {course.code} • {course.credits} credits
            </CardDescription>
          </div>
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <span>{course.instructor}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{course.semester} {course.year}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              <span>{course.assignmentCount} assignments</span>
            </div>
            <div className="flex items-center">
              <Bell className="h-4 w-4 mr-1" />
              <span>{course.announcementCount} announcements</span>
            </div>
          </div>
        </div>
        
        <Button asChild className="w-full">
          <Link href={`/courses/${course.id}`}>
            View Course
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
