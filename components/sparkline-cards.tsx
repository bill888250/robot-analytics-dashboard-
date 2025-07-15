"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { Session } from "@/lib/mock-data"

interface SparklineCardsProps {
  sessions: Session[]
}

export function SparklineCards({ sessions }: SparklineCardsProps) {
  const generateSparklineData = (baseValue: number) => {
    const points = []
    for (let i = 0; i < 12; i++) {
      const variation = (Math.random() - 0.5) * baseValue * 0.3
      points.push(Math.max(0, baseValue + variation))
    }
    return points
  }

  const createSparklinePath = (data: number[], width: number, height: number) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width
        const y = height - ((value - min) / range) * height
        return `${x},${y}`
      })
      .join(" ")

    return `M ${points.replace(/,/g, " L ")}`
  }

  const getTrend = (data: number[]) => {
    const first = data[0]
    const last = data[data.length - 1]
    const change = ((last - first) / first) * 100

    if (change > 5) return { icon: TrendingUp, color: "text-emerald-400", value: `+${change.toFixed(1)}%` }
    if (change < -5) return { icon: TrendingDown, color: "text-red-400", value: `${change.toFixed(1)}%` }
    return { icon: Minus, color: "text-slate-400", value: "持平" }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sessions.slice(0, 12).map((session) => {
        const sparklineData = generateSparklineData(session.tasks / 5)
        const trend = getTrend(sparklineData)
        const TrendIcon = trend.icon

        return (
          <Card key={session.id} className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white truncate">{session.name}</CardTitle>
                <Badge
                  variant={session.activeRate >= 60 ? "default" : "destructive"}
                  className={`text-xs ${session.activeRate >= 60 ? "bg-emerald-600" : "bg-red-600"}`}
                >
                  {session.activeRate}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Sparkline */}
                <div className="h-12 w-full">
                  <svg width="100%" height="100%" className="overflow-visible">
                    <path
                      d={createSparklinePath(sparklineData, 200, 40)}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      className="drop-shadow-sm"
                    />
                  </svg>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-slate-400">任務數</div>
                    <div className="text-white font-medium">{session.tasks}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">距離</div>
                    <div className="text-white font-medium">{session.distance}</div>
                  </div>
                </div>

                {/* Trend */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">趨勢</span>
                  <div className={`flex items-center gap-1 ${trend.color}`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{trend.value}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
