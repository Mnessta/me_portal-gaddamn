'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, BookOpen, MessageSquare } from 'lucide-react'
import { RecentGrade } from '@/types/dashboard'

interface GradeCardProps {
  grade: RecentGrade
}

export function GradeCard({ grade }: GradeCardProps) {
  const percentage = (grade.score / grade.maxScore) * 100
  
  const getGradeColor = () => {
    if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (percentage >= 80) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getGradeBadge = () => {
    if (percentage >= 90) return { label: 'A', color: 'bg-green-100 text-green-800' }
    if (percentage >= 80) return { label: 'B', color: 'bg-blue-100 text-blue-800' }
    if (percentage >= 70) return { label: 'C', color: 'bg-yellow-100 text-yellow-800' }
    if (percentage >= 60) return { label: 'D', color: 'bg-orange-100 text-orange-800' }
    return { label: 'F', color: 'bg-red-100 text-red-800' }
  }

  const gradeBadge = getGradeBadge()

  return (
    <Card className={`hover:shadow-md transition-shadow border-l-4 ${getGradeColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base font-semibold line-clamp-2">
              {grade.assignmentTitle}
            </CardTitle>
            <CardDescription className="text-sm">
              {grade.courseCode} • {grade.courseName}
            </CardDescription>
          </div>
          <Badge className={gradeBadge.color}>
            {gradeBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <Award className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="font-medium">{grade.score}/{grade.maxScore}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {percentage.toFixed(1)}%
            </div>
          </div>
          {grade.gradedAt && (
            <div className="text-xs text-muted-foreground">
              {new Date(grade.gradedAt).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {grade.feedback && (
          <div className="pt-2 border-t">
            <div className="flex items-start space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground line-clamp-2">
                {grade.feedback}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
