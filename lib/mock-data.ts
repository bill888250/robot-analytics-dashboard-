// 生成豐富的模擬資料
export interface Robot {
  id: string
  number: string
  tasks: number
  distance: number
  runtime: number
  isActive: boolean
}

export interface Session {
  id: number
  name: string
  store: string
  tasks: number
  runtime: string
  distance: string
  bound: number
  online: number
  active: number
  activeRate: number
  isActive: boolean
  robots: Robot[]
}

// 門店列表
const stores = [
  "台北101",
  "信義威秀",
  "西門町",
  "板橋大遠百",
  "桃園統領",
  "新竹巨城",
  "台中廣三",
  "高雄夢時代",
  "台南新光",
  "基隆廟口",
  "淡水老街",
  "九份老街",
  "宜蘭羅東",
  "花蓮遠百",
  "台東秀泰",
  "嘉義文化",
  "彰化員林",
  "南投草屯",
  "苗栗頭份",
  "屏東太平洋",
]

// 生成機器人資料
const generateRobots = (count: number, sessionActiveRate: number): Robot[] => {
  const robots: Robot[] = []
  const activeCount = Math.floor(count * (sessionActiveRate / 100))

  for (let i = 1; i <= count; i++) {
    const isActive = i <= activeCount
    robots.push({
      id: `robot-${i}`,
      number: `R${i.toString().padStart(3, "0")}`,
      tasks: isActive ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 10),
      distance: isActive ? Math.random() * 8 + 2 : Math.random() * 2,
      runtime: isActive ? Math.random() * 6 + 2 : Math.random() * 2,
      isActive,
    })
  }

  return robots
}

// 生成場次資料
export const generateMockSessions = (): Session[] => {
  const sessions: Session[] = []

  for (let i = 1; i <= 20; i++) {
    const bound = Math.floor(Math.random() * 18) + 3 // 3-20台機器人
    const online = Math.floor(Math.random() * bound) + Math.floor(bound * 0.7) // 至少70%在線
    const activeRate = Math.floor(Math.random() * 100)
    const active = Math.floor((activeRate / 100) * bound)
    const tasks = Math.floor(Math.random() * 300) + 50
    const distance = (Math.random() * 15 + 5).toFixed(1)
    const runtime = (Math.random() * 8 + 2).toFixed(1)

    const robots = generateRobots(bound, activeRate)

    sessions.push({
      id: i,
      name: `${stores[i - 1]}店`,
      store: stores[i - 1],
      tasks,
      runtime: `${runtime}h`,
      distance: `${distance}km`,
      bound,
      online: Math.min(online, bound),
      active,
      activeRate,
      isActive: activeRate >= 60,
      robots,
    })
  }

  return sessions.sort((a, b) => b.tasks - a.tasks) // 按任務數排序
}

// 生成圖表資料
export const generateChartData = (sessions: Session[]) => {
  const timePoints = ["09:00", "12:00", "15:00", "18:00", "21:00"]

  return timePoints.map((time) => {
    const dataPoint: any = { time }
    sessions.slice(0, 5).forEach((session, index) => {
      const baseValue = session.tasks / 5
      const variation = (Math.random() - 0.5) * baseValue * 0.3
      dataPoint[`session${index + 1}`] = Math.max(0, Math.floor(baseValue + variation))
    })
    return dataPoint
  })
}

// 生成堆疊圖資料
export const generateStackedData = (sessions: Session[]) => {
  return sessions.map((session) => ({
    session: session.name.length > 8 ? session.name.substring(0, 6) + "..." : session.name,
    bound: session.bound,
    online: session.online,
    active: session.active,
  }))
}

// 生成熱力圖資料
export const generateHeatmapData = (sessions: Session[]) => {
  const metrics = ["任務數", "活躍比", "運行距離", "在線率"]
  const data: any[] = []

  sessions.forEach((session) => {
    metrics.forEach((metric) => {
      let value = 0
      switch (metric) {
        case "任務數":
          value = Math.min(100, (session.tasks / 300) * 100)
          break
        case "活躍比":
          value = session.activeRate
          break
        case "運行距離":
          value = Math.min(100, (Number.parseFloat(session.distance) / 20) * 100)
          break
        case "在線率":
          value = (session.online / session.bound) * 100
          break
      }

      data.push({
        session: session.name,
        metric,
        value: Math.floor(value),
      })
    })
  })

  return data
}
