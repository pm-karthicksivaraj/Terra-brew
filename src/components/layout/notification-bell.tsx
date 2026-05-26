'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, Check, CheckCheck, AlertTriangle, Clock, Info, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: string
  isRead: boolean
  actionUrl: string | null
  createdAt: string
}

interface NotificationResponse {
  data: Notification[]
  total: number
  unreadCount: number
}

const PRIORITY_STYLES: Record<string, { bg: string; icon: typeof AlertTriangle; iconColor: string }> = {
  urgent: { bg: 'bg-red-50 dark:bg-red-950/30', icon: AlertTriangle, iconColor: 'text-red-600 dark:text-red-400' },
  high: { bg: 'bg-amber-50 dark:bg-amber-950/30', icon: AlertTriangle, iconColor: 'text-amber-600 dark:text-amber-400' },
  normal: { bg: 'bg-blue-50 dark:bg-blue-950/30', icon: Clock, iconColor: 'text-blue-600 dark:text-blue-400' },
  low: { bg: 'bg-gray-50 dark:bg-gray-950/30', icon: Info, iconColor: 'text-gray-600 dark:text-gray-400' },
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function NotificationBell() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return
    try {
      setLoading(true)
      const res = await fetch('/api/notifications?pageSize=20')
      if (res.ok) {
        const json = await res.json()
        const data = json.data as NotificationResponse
        setNotifications(data.data || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  // Fetch on mount and every 60 seconds
  useEffect(() => {
    fetchNotifications()
    intervalRef.current = setInterval(fetchNotifications, 60000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch {
      // Silently fail
    }
  }

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true)
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch {
      // Silently fail
    } finally {
      setMarkingAll(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    // Navigate if there's an action URL
    if (notification.actionUrl) {
      setIsOpen(false)
      router.push(notification.actionUrl)
    }
  }

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      if (res.ok) {
        const deleted = notifications.find(n => n.id === id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (deleted && !deleted.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch {
      // Silently fail
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-muted-foreground hover:text-foreground rounded-xl w-9 h-9 p-0"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-red-500 rounded-full animate-in zoom-in-50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[360px] p-0 rounded-xl shadow-lg border-border"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1 px-2"
              onClick={markAllAsRead}
              disabled={markingAll}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {markingAll ? 'Marking...' : 'Mark all read'}
            </Button>
          )}
        </div>

        {/* Notification list */}
        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification, index) => {
                const style = PRIORITY_STYLES[notification.priority] || PRIORITY_STYLES.normal
                const IconComponent = style.icon

                return (
                  <div key={notification.id}>
                    {index > 0 && <Separator className="!my-0" />}
                    <div
                      className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                        !notification.isRead ? style.bg : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleNotificationClick(notification)
                        }
                      }}
                    >
                      {/* Icon */}
                      <div className={`mt-0.5 shrink-0 ${style.iconColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs leading-tight ${!notification.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                                aria-label="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-red-500"
                              onClick={(e) => deleteNotification(notification.id, e)}
                              aria-label="Dismiss notification"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-muted-foreground/70">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {notification.actionUrl && (
                            <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/50" />
                          )}
                          {notification.priority === 'urgent' && (
                            <Badge variant="destructive" className="text-[9px] h-4 px-1 py-0">
                              URGENT
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-border px-4 py-2">
            <p className="text-[10px] text-muted-foreground/60 text-center">
              Auto-refreshes every 60 seconds
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
