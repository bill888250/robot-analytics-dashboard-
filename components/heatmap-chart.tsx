"use client"

interface HeatmapData {
  session: string
  metric: string
  value: number
}

interface HeatmapChartProps {
  data: HeatmapData[]
}

export function HeatmapChart({ data }: HeatmapChartProps) {
  const sessions = Array.from(new Set(data.map((d) => d.session)))
  const metrics = Array.from(new Set(data.map((d) => d.metric)))

  const getColor = (value: number) => {
    if (value >= 80) return "#10B981" // emerald-500
    if (value >= 60) return "#F59E0B" // amber-500
    if (value >= 40) return "#EF4444" // red-500
    return "#6B7280" // gray-500
  }

  const getValue = (session: string, metric: string) => {
    const item = data.find((d) => d.session === session && d.metric === metric)
    return item?.value || 0
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-1 text-xs">
        <div></div>
        {metrics.map((metric) => (
          <div key={metric} className="text-center text-slate-400 font-medium p-2">
            {metric}
          </div>
        ))}

        {sessions.slice(0, 10).map((session) => (
          <>
            <div key={session} className="text-slate-400 text-right p-2 truncate">
              {session}
            </div>
            {metrics.map((metric) => {
              const value = getValue(session, metric)
              return (
                <div
                  key={`${session}-${metric}`}
                  className="aspect-square rounded flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: getColor(value) }}
                  title={`${session} - ${metric}: ${value}%`}
                >
                  {value}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}
