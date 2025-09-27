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
      title: 'Browse Courses',
      icon: BookOpen,
      href: '/courses',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Assignments',
      icon: FileText,
      href: '/assignments',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Grades',
      icon: Award,
      href: '/grades',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Notices',
      icon: Bell,
      href: '/notices',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Calendar',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Messages',
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                asChild
                variant="outline"
                className="h-auto p-4 justify-start hover:shadow-md transition-all min-h-[60px] w-full text-left"
              >
                <Link href={action.href}>
                  <div className="flex items-center space-x-3 w-full">
                    <div className={`p-2 rounded-lg ${action.color} text-white flex-shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-medium text-sm leading-tight">
                        {action.title}
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
