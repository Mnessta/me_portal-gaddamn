'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, BookOpen, Pin, Clock } from 'lucide-react'
import { RecentAnnouncement } from '@/types/dashboard'

interface AnnouncementCardProps {
  announcement: RecentAnnouncement
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const timeAgo = (date: string) => {
    const now = new Date()
    const announcementDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - announcementDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return announcementDate.toLocaleDateString()
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-base font-semibold line-clamp-2">
                {announcement.title}
              </CardTitle>
              {announcement.isPinned && (
                <Pin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <CardDescription className="text-sm">
              {announcement.courseCode} • {announcement.courseName}
            </CardDescription>
          </div>
          <Bell className="h-5 w-5 text-primary flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {announcement.content}
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{timeAgo(announcement.createdAt)}</span>
          </div>
          {announcement.isPinned && (
            <Badge variant="secondary" className="text-xs">
              Pinned
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
