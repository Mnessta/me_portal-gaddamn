'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, BookOpen, FileText, AlertCircle } from 'lucide-react'
import { UpcomingAssignment } from '@/types/dashboard'
import Link from 'next/link'

interface AssignmentCardProps {
  assignment: UpcomingAssignment
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const dueDate = new Date(assignment.dueDate)
  const now = new Date()
  const timeDiff = dueDate.getTime() - now.getTime()
  const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24))
  
  const getUrgencyColor = () => {
    if (daysUntilDue <= 1) return 'text-red-600 bg-red-50 border-red-200'
    if (daysUntilDue <= 3) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  const getUrgencyIcon = () => {
    if (daysUntilDue <= 1) return <AlertCircle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  const getUrgencyText = () => {
    if (daysUntilDue <= 0) return 'Due today'
    if (daysUntilDue === 1) return 'Due tomorrow'
    return `Due in ${daysUntilDue} days`
  }

  return (
    <Card className={`hover:shadow-md transition-shadow border-l-4 ${getUrgencyColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base font-semibold line-clamp-2">
              {assignment.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {assignment.courseCode} • {assignment.courseName}
            </CardDescription>
          </div>
          <div className="flex items-center text-xs font-medium">
            {getUrgencyIcon()}
            <span className="ml-1">{getUrgencyText()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignment.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {assignment.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <FileText className="h-4 w-4 mr-1" />
            <span>{assignment.maxPoints} points</span>
          </div>
          <div className="text-muted-foreground">
            Due: {dueDate.toLocaleDateString()}
          </div>
        </div>
        
        <Button asChild size="sm" className="w-full">
          <Link href={`/assignments/${assignment.id}`}>
            View Assignment
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
