"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Eye,
  EyeOff,
  Search,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { generateMockSessions, generateChartData, generateStackedData, generateHeatmapData } from "@/lib/mock-data"
import type { Session } from "@/lib/mock-data"
import { DateTimePicker } from "@/components/date-time-picker"
import { StoreFilter } from "@/components/store-filter"
import { SessionSelector } from "@/components/session-selector"
import { ChartSwitcher } from "@/components/chart-switcher"
import { HeatmapChart } from "@/components/heatmap-chart"
import { SparklineCards } from "@/components/sparkline-cards"

export default function RobotAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("yesterday")
  const [selectedStore, setSelectedStore] = useState("all")
  const [selectedSessions, setSelectedSessions] = useState<number[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [chartType, setChartType] = useState("tasks")
  const [currentChart, setCurrentChart] = useState<"line" | "heatmap" | "sparkline">("line")
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Session | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // 生成模擬資料
  const allSessions = useMemo(() => generateMockSessions(), [])
  const stores = useMemo(() => Array.from(new Set(allSessions.map((s) => s.store))), [allSessions])

  // 篩選和排序資料
  const filteredSessions = useMemo(() => {
    let filtered = allSessions

    // 門店篩選
    if (selectedStore !== "all") {
      filtered = filtered.filter((session) => session.store === selectedStore)
    }

    // 搜尋篩選
    if (searchTerm) {
      filtered = filtered.filter(
        (session) =>
          session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.store.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // 排序
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortField]
        let bValue = b[sortField]

        // 處理字串類型的數值
        if (typeof aValue === "string" && aValue.includes("km")) {
          aValue = Number.parseFloat(aValue) as any
          bValue = Number.parseFloat(bValue as string) as any
        }
        if (typeof aValue === "string" && aValue.includes("h")) {
          aValue = Number.parseFloat(aValue) as any
          bValue = Number.parseFloat(bValue as string) as any
        }

        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    return filtered
  }, [allSessions, selectedStore, searchTerm, sortField, sortDirection])

  // 預設選擇前5個場次
  const displaySessions =
    selectedSessions.length > 0
      ? filteredSessions.filter((s) => selectedSessions.includes(s.id))
      : filteredSessions.slice(0, 5)

  // 生成圖表資料
  const chartData = useMemo(() => generateChartData(displaySessions), [displaySessions])
  const stackedData = useMemo(() => generateStackedData(filteredSessions), [filteredSessions])
  const heatmapData = useMemo(() => generateHeatmapData(filteredSessions), [filteredSessions])

  // 計算摘要資料
  const topTaskSession = filteredSessions.reduce(
    (prev, current) => (prev.tasks > current.tasks ? prev : current),
    filteredSessions[0],
  )
  const topActiveSession = filteredSessions.reduce(
    (prev, current) => (prev.activeRate > current.activeRate ? prev : current),
    filteredSessions[0],
  )
  const topDistanceSession = filteredSessions.reduce(
    (prev, current) => (Number.parseFloat(prev.distance) > Number.parseFloat(current.distance) ? prev : current),
    filteredSessions[0],
  )
  const silentSessions = filteredSessions.filter((s) => s.activeRate < 60).slice(0, 3)

  // 同步可見線條（避免重複 render）
  useEffect(() => {
    setVisibleLines((prev) => {
      const updated: Record<string, boolean> = {}
      displaySessions.forEach((_, idx) => {
        const key = `session${idx + 1}`
        // 若先前已有設定，沿用；否則預設 true
        updated[key] = prev[key] ?? true
      })

      // 若內容相同則不更新，避免無限重渲染
      const same =
        Object.keys(updated).length === Object.keys(prev).length &&
        Object.keys(updated).every((k) => updated[k] === prev[k])

      return same ? prev : updated
    })
  }, [displaySessions])

  const toggleRowExpansion = (sessionId: number) => {
    setExpandedRows((prev) => (prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]))
  }

  const toggleLineVisibility = (line: string) => {
    setVisibleLines((prev) => ({ ...prev, [line]: !prev[line] }))
  }

  const handleSort = (field: keyof Session) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleDateTimeChange = (startDate: string, endDate: string) => {
    console.log("Date range selected:", startDate, endDate)
    // 這裡可以實現實際的日期篩選邏輯
  }

  const exportToCSV = () => {
    const headers = ["場次名稱", "門店", "任務數", "運行時間", "運行距離", "綁定數", "開機數", "活躍數", "活躍比"]
    const csvContent = [
      headers.join(","),
      ...filteredSessions.map((session) =>
        [
          session.name,
          session.store,
          session.tasks,
          session.runtime,
          session.distance,
          session.bound,
          session.online,
          session.active,
          `${session.activeRate}%`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `場次分析報表_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-emerald-400">場次分析總覽</h1>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Date Range Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="yesterday">昨天</SelectItem>
                    <SelectItem value="7days">近 7 日</SelectItem>
                    <SelectItem value="30days">近 30 日</SelectItem>
                    <SelectItem value="custom">自訂</SelectItem>
                  </SelectContent>
                </Select>
                {dateRange === "custom" && <DateTimePicker onDateChange={handleDateTimeChange} />}
              </div>

              {/* Store Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <StoreFilter stores={stores} selectedStore={selectedStore} onStoreChange={setSelectedStore} />
              </div>

              {/* Session Selector */}
              <SessionSelector
                sessions={filteredSessions}
                selectedSessions={selectedSessions}
                onSessionsChange={setSelectedSessions}
              />

              {/* Compare Mode Toggle */}
              <Button
                variant={compareMode ? "default" : "outline"}
                onClick={() => setCompareMode(!compareMode)}
                className={
                  compareMode
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "border-slate-700 hover:bg-slate-800 bg-transparent text-white"
                }
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                切換為比較模式
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">任務最多場次</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">{topTaskSession?.name}</div>
              <p className="text-xs text-slate-400 mt-1">
                {topTaskSession?.tasks} 任務 • 活躍比 {topTaskSession?.activeRate}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">活躍比最高場次</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{topActiveSession?.name}</div>
              <p className="text-xs text-slate-400 mt-1">活躍比 {topActiveSession?.activeRate}%</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">運行距離最長場次</CardTitle>
              <MapPin className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">{topDistanceSession?.name}</div>
              <p className="text-xs text-slate-400 mt-1">運行距離 {topDistanceSession?.distance}</p>
            </CardContent>
          </Card>

          <Card className="bg-red-900/20 border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-300">沉默場次</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {silentSessions.map((session, index) => (
                  <div key={session.id} className="flex justify-between items-center">
                    <span className="text-sm text-red-300 truncate">{session.name}</span>
                    <Badge variant="destructive" className="bg-red-600 text-xs">
                      {session.activeRate}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Dynamic Chart */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-emerald-400">場次表現分析</CardTitle>
                <div className="flex items-center gap-2">
                  <ChartSwitcher currentChart={currentChart} onChartChange={setCurrentChart} />
                  {currentChart === "line" && (
                    <Select value={chartType} onValueChange={setChartType}>
                      <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="tasks">任務總數</SelectItem>
                        <SelectItem value="active">活躍比</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {currentChart === "line" && (
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {displaySessions.map((session, index) => {
                    const lineKey = `session${index + 1}`
                    const visible = visibleLines[lineKey]
                    return (
                      <button
                        key={session.id}
                        onClick={() => toggleLineVisibility(lineKey)}
                        className="flex items-center gap-2 text-sm"
                      >
                        {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className={visible ? "text-white" : "text-slate-500"}>{session.name}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {currentChart === "line" && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                      }}
                    />
                    <Legend />
                    {displaySessions.map((session, index) => {
                      const lineKey = `session${index + 1}`
                      const colors = ["#10B981", "#3B82F6", "#06B6D4", "#F59E0B", "#EF4444"]
                      return visibleLines[lineKey] ? (
                        <Line
                          key={session.id}
                          type="monotone"
                          dataKey={lineKey}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                          name={session.name}
                        />
                      ) : null
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}

              {currentChart === "heatmap" && <HeatmapChart data={heatmapData} />}

              {currentChart === "sparkline" && (
                <div className="h-80 overflow-y-auto">
                  <SparklineCards sessions={filteredSessions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stacked Bar Chart */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-emerald-400">機器人配置狀況</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stackedData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="session" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="bound" fill="#10B981" name="綁定數量" />
                  <Bar dataKey="online" fill="#3B82F6" name="開機數量" />
                  <Bar dataKey="active" fill="#06B6D4" name="活躍數量" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table (when compare mode is on) */}
        {compareMode && (
          <Card className="bg-slate-900 border-slate-800 mb-8">
            <CardHeader>
              <CardTitle className="text-emerald-400">場次指標比較</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">場次</th>
                      <th className="text-center py-3 px-4 text-slate-300 font-medium">任務數</th>
                      <th className="text-center py-3 px-4 text-slate-300 font-medium">活躍比</th>
                      <th className="text-center py-3 px-4 text-slate-300 font-medium">運行距離</th>
                      <th className="text-center py-3 px-4 text-slate-300 font-medium">運行時間</th>
                      <th className="text-center py-3 px-4 text-slate-300 font-medium">活躍機器人數</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displaySessions.slice(0, 5).map((session) => (
                      <tr key={session.id} className="border-b border-slate-800">
                        <td className="py-3 px-4 font-medium text-white">{session.name}</td>
                        <td className="text-center py-3 px-4 text-white">{session.tasks}</td>
                        <td className="text-center py-3 px-4">
                          <Badge
                            variant={session.activeRate >= 60 ? "default" : "destructive"}
                            className={session.activeRate >= 60 ? "bg-emerald-600" : "bg-red-600"}
                          >
                            {session.activeRate}%
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-4 text-white">{session.distance}</td>
                        <td className="text-center py-3 px-4 text-white">{session.runtime}</td>
                        <td className="text-center py-3 px-4 text-white">{session.active}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-emerald-400">場次分析資料</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="搜尋場次或門店..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  className="border-slate-700 hover:bg-slate-800 bg-transparent text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  導出 CSV 報表
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-300"></TableHead>
                    <TableHead className="text-slate-300">
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium text-slate-300 hover:text-white"
                        onClick={() => handleSort("name")}
                      >
                        場次名稱 <ArrowUpDown className="ml-1 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-slate-300">門店</TableHead>
                    <TableHead className="text-slate-300">
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium text-slate-300 hover:text-white"
                        onClick={() => handleSort("tasks")}
                      >
                        任務數 <ArrowUpDown className="ml-1 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-slate-300">
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium text-slate-300 hover:text-white"
                        onClick={() => handleSort("runtime")}
                      >
                        運行時間 <ArrowUpDown className="ml-1 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-slate-300">
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium text-slate-300 hover:text-white"
                        onClick={() => handleSort("distance")}
                      >
                        運行距離 <ArrowUpDown className="ml-1 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-slate-300">機器人狀態</TableHead>
                    <TableHead className="text-slate-300">
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium text-slate-300 hover:text-white"
                        onClick={() => handleSort("activeRate")}
                      >
                        活躍比 <ArrowUpDown className="ml-1 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <>
                      <TableRow key={session.id} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(session.id)}
                            className="p-0 h-auto text-slate-400 hover:text-white"
                          >
                            {expandedRows.includes(session.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-white">{session.name}</TableCell>
                        <TableCell className="text-slate-300">{session.store}</TableCell>
                        <TableCell className="text-white">{session.tasks}</TableCell>
                        <TableCell className="text-slate-300">{session.runtime}</TableCell>
                        <TableCell className="text-slate-300">{session.distance}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-emerald-400">{session.bound}</span> /
                            <span className="text-blue-400 mx-1">{session.online}</span> /
                            <span className="text-cyan-400">{session.active}</span>
                          </div>
                          <div className="text-xs text-slate-500">綁定/開機/活躍</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={session.activeRate} className="w-16 h-2" />
                            <Badge
                              variant={session.activeRate >= 60 ? "default" : "destructive"}
                              className={session.activeRate >= 60 ? "bg-emerald-600" : "bg-red-600"}
                              title={`活躍比 = 活躍機器人數 ÷ 綁定機器人數，若活躍比 ≥ 60%，視為活躍場次`}
                            >
                              {session.activeRate}%
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      {expandedRows.includes(session.id) && (
                        <TableRow className="border-slate-800 bg-slate-800/30">
                          <TableCell colSpan={8}>
                            <div className="py-4">
                              <h4 className="text-sm font-medium text-emerald-400 mb-3">機器人詳細資料</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {session.robots.map((robot) => (
                                  <div key={robot.id} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-white">{robot.number}</span>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`w-2 h-2 rounded-full ${
                                            robot.isActive ? "bg-emerald-400" : "bg-red-400"
                                          }`}
                                        />
                                        <Badge
                                          variant={robot.isActive ? "default" : "secondary"}
                                          className={robot.isActive ? "bg-emerald-600" : "bg-slate-600"}
                                        >
                                          {robot.isActive ? "活躍" : "待機"}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="space-y-1 text-sm text-slate-400">
                                      <div>
                                        任務數: <span className="text-white">{robot.tasks}</span>
                                      </div>
                                      <div>
                                        距離: <span className="text-white">{robot.distance.toFixed(1)}km</span>
                                      </div>
                                      <div>
                                        時間: <span className="text-white">{robot.runtime.toFixed(1)}h</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
