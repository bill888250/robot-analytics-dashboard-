"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Settings } from "lucide-react"
import type { Session } from "@/lib/mock-data"

interface SessionSelectorProps {
  sessions: Session[]
  selectedSessions: number[]
  onSessionsChange: (sessionIds: number[]) => void
}

export function SessionSelector({ sessions, selectedSessions, onSessionsChange }: SessionSelectorProps) {
  const [open, setOpen] = useState(false)

  const handleSessionToggle = (sessionId: number) => {
    if (selectedSessions.includes(sessionId)) {
      onSessionsChange(selectedSessions.filter((id) => id !== sessionId))
    } else if (selectedSessions.length < 5) {
      onSessionsChange([...selectedSessions, sessionId])
    }
  }

  const removeSession = (sessionId: number) => {
    onSessionsChange(selectedSessions.filter((id) => id !== sessionId))
  }

  const selectedSessionNames = sessions.filter((s) => selectedSessions.includes(s.id)).map((s) => s.name)

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700">
            <Settings className="w-4 h-4 mr-2" />
            場次選擇 ({selectedSessions.length}/5)
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-slate-900 border-slate-700" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-emerald-400">選擇場次 (最多5個)</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSessionsChange([])}
                className="text-slate-400 hover:text-white"
              >
                清除全部
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`session-${session.id}`}
                    checked={selectedSessions.includes(session.id)}
                    onCheckedChange={() => handleSessionToggle(session.id)}
                    disabled={!selectedSessions.includes(session.id) && selectedSessions.length >= 5}
                    className="border-slate-600"
                  />
                  <label
                    htmlFor={`session-${session.id}`}
                    className={`text-sm cursor-pointer flex-1 ${
                      selectedSessions.includes(session.id) ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {session.name}
                  </label>
                  <span className="text-xs text-slate-400">{session.tasks} 任務</span>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Sessions Display */}
      <div className="flex items-center gap-1 flex-wrap">
        {selectedSessionNames.map((name, index) => (
          <Badge key={name} variant="secondary" className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
            {name}
            <button onClick={() => removeSession(selectedSessions[index])} className="ml-1 hover:text-emerald-300">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
