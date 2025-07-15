"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Activity } from "lucide-react"

interface SystemStatusProps {
  isMonitoring: boolean
  lastUpdateTime: Date
}

export function SystemStatus({ isMonitoring, lastUpdateTime }: SystemStatusProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const timeSinceUpdate = Math.floor((currentTime.getTime() - lastUpdateTime.getTime()) / 1000)
  const isConnected = timeSinceUpdate < 60 // Consider connected if updated within last minute

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        {isConnected ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
        <span className="text-slate-400">{isConnected ? "已連線" : "連線中斷"}</span>
      </div>

      <div className="flex items-center gap-1">
        <Activity className={`w-4 h-4 ${isMonitoring ? "text-emerald-400" : "text-slate-400"}`} />
        <Badge
          variant={isMonitoring ? "default" : "secondary"}
          className={isMonitoring ? "bg-emerald-600" : "bg-slate-600"}
        >
          {isMonitoring ? "監控中" : "已暫停"}
        </Badge>
      </div>

      <span className="text-xs text-slate-500">更新於 {lastUpdateTime.toLocaleTimeString()}</span>
    </div>
  )
}
