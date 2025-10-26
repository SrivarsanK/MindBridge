"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClockTimePickerProps {
  selectedTime: string
  onTimeSelect: (time: string) => void
  availableTimes: string[]
}

export function ClockTimePicker({ selectedTime, onTimeSelect, availableTimes }: ClockTimePickerProps) {
  const [hoveredTime, setHoveredTime] = useState<string | null>(null)

  // Convert time string to angle (12:00 = 0°, 3:00 = 90°, etc.)
  const timeToAngle = (time: string) => {
    const [timeStr, period] = time.split(' ')
    let [hours, minutes] = timeStr.split(':').map(Number)
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    
    // Calculate angle (12 o'clock = -90°, clockwise)
    const angle = ((hours % 12) * 30) - 90
    return angle
  }

  // Calculate position on clock face
  const getClockPosition = (angle: number, radius: number = 100) => {
    const radian = (angle * Math.PI) / 180
    return {
      x: radius + radius * Math.cos(radian),
      y: radius + radius * Math.sin(radian)
    }
  }

  const clockRadius = 100
  const dotRadius = 12

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Clock Face */}
      <div className="relative" style={{ width: clockRadius * 2 + 40, height: clockRadius * 2 + 40 }}>
        <svg
          width={clockRadius * 2 + 40}
          height={clockRadius * 2 + 40}
          className="absolute inset-0"
        >
          {/* Clock circle */}
          <circle
            cx={clockRadius + 20}
            cy={clockRadius + 20}
            r={clockRadius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
          
          {/* Center dot */}
          <circle
            cx={clockRadius + 20}
            cy={clockRadius + 20}
            r="4"
            fill="hsl(var(--primary))"
          />

          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) - 90
            const outer = getClockPosition(angle, clockRadius)
            const inner = getClockPosition(angle, clockRadius - 10)
            
            return (
              <line
                key={i}
                x1={outer.x + 20}
                y1={outer.y + 20}
                x2={inner.x + 20}
                y2={inner.y + 20}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                opacity="0.3"
              />
            )
          })}

          {/* Selected time hand */}
          {selectedTime && (
            <line
              x1={clockRadius + 20}
              y1={clockRadius + 20}
              x2={getClockPosition(timeToAngle(selectedTime), clockRadius - 20).x + 20}
              y2={getClockPosition(timeToAngle(selectedTime), clockRadius - 20).y + 20}
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Time slot buttons positioned on clock */}
        {availableTimes.map((time) => {
          const angle = timeToAngle(time)
          const position = getClockPosition(angle, clockRadius - 20)
          const isSelected = selectedTime === time
          const isHovered = hoveredTime === time

          return (
            <button
              key={time}
              onClick={() => onTimeSelect(time)}
              onMouseEnter={() => setHoveredTime(time)}
              onMouseLeave={() => setHoveredTime(null)}
              className={cn(
                "absolute flex items-center justify-center rounded-full transition-all duration-200",
                "font-medium text-xs",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-lg scale-110 z-10"
                  : isHovered
                  ? "bg-primary/20 scale-105 z-10"
                  : "bg-background border-2 border-border hover:border-primary"
              )}
              style={{
                width: dotRadius * 2 + 20,
                height: dotRadius * 2 + 20,
                left: position.x + 20 - dotRadius - 10,
                top: position.y + 20 - dotRadius - 10,
              }}
            >
              {time.replace(' ', '\n').split('\n')[0]}
            </button>
          )
        })}
      </div>

      {/* Selected time display */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
        <Clock className="h-4 w-4 text-primary" />
        <span className="font-semibold">
          {selectedTime || "Select a time"}
        </span>
      </div>
    </div>
  )
}
