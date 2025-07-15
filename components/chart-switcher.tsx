"use client"

import { Button } from "@/components/ui/button"
import { LineChart, Grid3X3, BarChart3 } from "lucide-react"

interface ChartSwitcherProps {
  currentChart: "line" | "heatmap" | "sparkline"
  onChartChange: (chart: "line" | "heatmap" | "sparkline") => void
}

export function ChartSwitcher({ currentChart, onChartChange }: ChartSwitcherProps) {
  const charts = [
    { id: "line" as const, label: "折線圖", icon: LineChart },
    { id: "heatmap" as const, label: "熱力格子", icon: Grid3X3 },
    { id: "sparkline" as const, label: "Sparkline群組", icon: BarChart3 },
  ]

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
      {charts.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={currentChart === id ? "default" : "ghost"}
          size="sm"
          onClick={() => onChartChange(id)}
          className={`text-xs ${
            currentChart === id
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-700"
          }`}
        >
          <Icon className="w-3 h-3 mr-1" />
          {label}
        </Button>
      ))}
    </div>
  )
}
