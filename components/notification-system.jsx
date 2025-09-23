"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Poll for new automation logs to show as notifications
    const pollNotifications = async () => {
      try {
        const response = await fetch("/api/automation")
        if (response.ok) {
          const data = await response.json()
          const recentLogs = data.logs?.slice(0, 5) || []

          // Check for new published posts
          const publishedPosts = recentLogs.filter(
            (log) => log.message.includes("AUTOMATED POST PUBLISHED") || log.message.includes("POST PUBLISHED"),
          )

          publishedPosts.forEach((log) => {
            if (!notifications.find((n) => n.id === log.id)) {
              const notification = {
                id: log.id,
                type: "success",
                title: "🎉 Post Published!",
                message: "Your automated post has been successfully published",
                timestamp: log.timestamp,
                data: log.data,
                isNew: true,
              }

              setNotifications((prev) => [notification, ...prev.slice(0, 9)])

              // Show toast notification
              toast({
                title: "🎉 Automated Post Published!",
                description: `Successfully posted to ${log.data?.platform || "social media"}`,
              })
            }
          })
        }
      } catch (error) {
        console.log("[v0] Error polling notifications:", error)
      }
    }

    const interval = setInterval(pollNotifications, 30000) // Poll every 30 seconds
    pollNotifications() // Initial poll

    return () => clearInterval(interval)
  }, [notifications, toast])

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const unreadCount = notifications.filter((n) => n.isNew).length

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsVisible(!isVisible)} className="relative neon-border">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs animate-pulse">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isVisible && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden glass-effect neon-border z-50">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-glow">Notifications</h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="text-xs">
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs">You'll see updates when posts are published</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-border/20 hover:bg-muted/20 transition-colors ${
                      notification.isNew ? "bg-primary/5 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          {notification.data && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Platform: {notification.data.platform}
                              {notification.data.contentPreview && (
                                <span className="block mt-1">"{notification.data.contentPreview}"</span>
                              )}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearNotification(notification.id)}
                        className="ml-2"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
