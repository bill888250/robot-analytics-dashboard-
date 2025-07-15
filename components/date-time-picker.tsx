"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "lucide-react"

interface DateTimePickerProps {
  onDateChange: (startDate: string, endDate: string) => void
}

export function DateTimePicker({ onDateChange }: DateTimePickerProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("00:00")
  const [endTime, setEndTime] = useState("23:59")

  const handleApply = () => {
    const start = `${startDate} ${startTime}`
    const end = `${endDate} ${endTime}`
    onDateChange(start, end)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700">
          <Calendar className="w-4 h-4 mr-2" />
          自訂時間
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-900 border-slate-700" align="end">
        <div className="space-y-4">
          <h4 className="font-semibold text-emerald-400">選擇日期時間範圍</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">開始日期</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-300">結束日期</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <Button
            onClick={handleApply}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={!startDate || !endDate}
          >
            套用
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
