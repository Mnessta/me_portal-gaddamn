'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen, FileText, Award, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { DashboardStatistics } from '@/types/dashboard'

interface StatisticsWidgetProps {
  statistics: DashboardStatistics
}

export function StatisticsWidget({ statistics }: StatisticsWidgetProps) {
  const completionRate = statistics.totalAssignments > 0 
    ? (statistics.submittedAssignments / statistics.totalAssignments) * 100 
    : 0

  const gradePercentage = statistics.totalPoints > 0 
    ? (statistics.earnedPoints / statistics.totalPoints) * 100 
    : 0

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600'
    if (gpa >= 3.0) return 'text-blue-600'
    if (gpa >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGPALabel = (gpa: number) => {
    if (gpa >= 3.5) return 'Excellent'
    if (gpa >= 3.0) return 'Good'
    if (gpa >= 2.5) return 'Average'
    return 'Needs Improvement'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Courses</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalCourses}</div>
          <p className="text-xs text-muted-foreground">
            Currently enrolled
          </p>
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assignments</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.submittedAssignments}</div>
          <p className="text-xs text-muted-foreground">
            of {statistics.totalAssignments} submitted
          </p>
          <Progress value={completionRate} className="mt-2" />
        </CardContent>
      </Card>

      {/* GPA */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">GPA</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getGPAColor(statistics.gpa)}`}>
            {statistics.gpa.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {getGPALabel(statistics.gpa)}
          </p>
        </CardContent>
      </Card>

      {/* Grade Average */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Grade Average</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {gradePercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {statistics.earnedPoints}/{statistics.totalPoints} points
          </p>
          <Progress value={gradePercentage} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  )
}
