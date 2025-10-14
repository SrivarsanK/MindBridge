"use client"

import { useMemo } from "react"

export interface DreamSegment {
  stage: "deep" | "rem" | "light" | "awake" | "lucid"
  startTime: Date
  endTime: Date
  emotion?: string
}

interface DreamTimelineChartProps {
  segments: DreamSegment[]
  className?: string
}

const stageColors = {
  deep: "hsl(var(--chart-1))", // Deep blue/indigo
  rem: "hsl(var(--chart-2))", // Purple
  light: "hsl(var(--chart-3))", // Light blue
  awake: "hsl(var(--chart-4))", // Orange/amber
  lucid: "hsl(var(--chart-5))", // Vibrant purple/pink
}

const stageNames = {
  deep: "Deep Dream",
  rem: "REM Dream",
  light: "Light Dream",
  awake: "Awake",
  lucid: "Lucid Dream",
}

export function DreamTimelineChart({ segments, className = "" }: DreamTimelineChartProps) {
  const { totalDuration, timelineSegments, timeLabels, stageDurations } = useMemo(() => {
    if (!segments || segments.length === 0) {
      return { totalDuration: 0, timelineSegments: [], timeLabels: [], stageDurations: {} }
    }

    const startTime = new Date(Math.min(...segments.map(s => s.startTime.getTime())))
    const endTime = new Date(Math.max(...segments.map(s => s.endTime.getTime())))
    const totalDuration = endTime.getTime() - startTime.getTime()

    // Calculate percentage positions for each segment
    const timelineSegments = segments.map(segment => {
      const segmentStart = segment.startTime.getTime() - startTime.getTime()
      const segmentDuration = segment.endTime.getTime() - segment.startTime.getTime()
      
      return {
        stage: segment.stage,
        emotion: segment.emotion,
        left: (segmentStart / totalDuration) * 100,
        width: (segmentDuration / totalDuration) * 100,
        startTime: segment.startTime,
        endTime: segment.endTime,
      }
    })

    // Generate time labels (every 2 hours)
    const timeLabels = []
    const labelInterval = 2 * 60 * 60 * 1000 // 2 hours in ms
    for (let time = startTime.getTime(); time <= endTime.getTime(); time += labelInterval) {
      const position = ((time - startTime.getTime()) / totalDuration) * 100
      const label = new Date(time).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
      timeLabels.push({ position, label })
    }

    // Calculate stage durations
    const stageDurations: Record<string, number> = {}
    segments.forEach(segment => {
      const duration = segment.endTime.getTime() - segment.startTime.getTime()
      stageDurations[segment.stage] = (stageDurations[segment.stage] || 0) + duration
    })

    return { totalDuration, timelineSegments, timeLabels, stageDurations }
  }, [segments])

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (timelineSegments.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 text-muted-foreground ${className}`}>
        No dream data to display
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Timeline Chart */}
      <div className="relative">
        {/* Time axis */}
        <div className="relative h-12 mb-2">
          {timeLabels.map((label, idx) => (
            <div
              key={idx}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${label.position}%`, transform: 'translateX(-50%)' }}
            >
              <div className="h-2 w-px bg-border mb-1" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {label.label}
              </span>
            </div>
          ))}
        </div>

        {/* Dream segments */}
        <div className="relative h-16 bg-muted/20 rounded-lg overflow-hidden">
          {timelineSegments.map((segment, idx) => (
            <div
              key={idx}
              className="absolute top-0 h-full transition-all hover:brightness-110 cursor-pointer group"
              style={{
                left: `${segment.left}%`,
                width: `${segment.width}%`,
                backgroundColor: stageColors[segment.stage],
              }}
              title={`${stageNames[segment.stage]}: ${segment.startTime.toLocaleTimeString()} - ${segment.endTime.toLocaleTimeString()}`}
            >
              {/* Segment label (only show if wide enough) */}
              {segment.width > 8 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-white drop-shadow-lg">
                    {stageNames[segment.stage].split(' ')[0]}
                  </span>
                </div>
              )}
              
              {/* Hover tooltip */}
              <div className="invisible group-hover:visible absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-lg border whitespace-nowrap">
                  <div className="font-medium">{stageNames[segment.stage]}</div>
                  <div className="text-muted-foreground">
                    {segment.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
                    {segment.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <div className="text-muted-foreground">
                    {formatDuration(segment.endTime.getTime() - segment.startTime.getTime())}
                  </div>
                  {segment.emotion && (
                    <div className="text-muted-foreground">Emotion: {segment.emotion}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(stageDurations).map(([stage, duration]) => (
          <div key={stage} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: stageColors[stage as keyof typeof stageColors] }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">
                {stageNames[stage as keyof typeof stageNames]}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDuration(duration)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total duration */}
      <div className="text-center pt-2 border-t">
        <div className="text-sm text-muted-foreground">Total Dream Duration</div>
        <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
      </div>
    </div>
  )
}
