"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react"

interface NotificationBannerProps {
  notifications: Array<{
    id: string
    type: "error" | "warning" | "info" | "success"
    title: string
    message: string
    priority: "high" | "medium" | "low"
    timestamp: Date
  }>
  onDismiss: (id: string) => void
}

export function NotificationBanner({ notifications, onDismiss }: NotificationBannerProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([])

  // Show high priority notifications as banners
  const highPriorityNotifications = notifications.filter((n) => n.priority === "high")

  useEffect(() => {
    // Auto-show new high priority notifications
    const newNotifications = highPriorityNotifications
      .filter((n) => !visibleNotifications.includes(n.id))
      .map((n) => n.id)

    if (newNotifications.length > 0) {
      setVisibleNotifications((prev) => [...prev, ...newNotifications])
    }
  }, [highPriorityNotifications, visibleNotifications])

  const handleDismiss = (id: string) => {
    setVisibleNotifications((prev) => prev.filter((nId) => nId !== id))
    onDismiss(id)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "success":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "default"
      default:
        return "default"
    }
  }

  const visibleBanners = highPriorityNotifications.filter((n) => visibleNotifications.includes(n.id))

  if (visibleBanners.length === 0) return null

  return (
    <div className="fixed top-20 left-0 right-0 z-40 px-6">
      <div className="container mx-auto space-y-2">
        {visibleBanners.map((notification) => (
          <Alert
            key={notification.id}
            variant={getAlertVariant(notification.type)}
            className="bg-slate-900/95 backdrop-blur-sm border-l-4 border-l-red-500"
          >
            {getIcon(notification.type)}
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>{notification.title}</strong>
                <span className="ml-2">{notification.message}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(notification.id)}
                className="ml-4 h-auto p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  )
}
