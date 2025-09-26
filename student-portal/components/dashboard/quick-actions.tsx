'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  FileText, 
  Award, 
  Bell, 
  Plus, 
  Search,
  Calendar,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  const actions = [
    {
      title: 'View All Courses',
      description: 'Browse your enrolled courses',
      icon: BookOpen,
      href: '/courses',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Assignments',
      description: 'View and submit assignments',
      icon: FileText,
      href: '/assignments',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Grades',
      description: 'Check your grades and GPA',
      icon: Award,
      href: '/grades',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Announcements',
      description: 'Read latest announcements',
      icon: Bell,
      href: '/announcements',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Calendar',
      description: 'View academic calendar',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Messages',
      description: 'Communicate with instructors',
      icon: MessageSquare,
      href: '/messages',
      color: 'bg-pink-500 hover:bg-pink-600'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>
          Quick access to key features and tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                asChild
                variant="outline"
                className="h-auto p-4 justify-start hover:shadow-md transition-all"
              >
                <Link href={action.href}>
                  <div className="flex items-center space-x-3 w-full">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
