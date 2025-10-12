"use client"
import { useMood } from "./mood-provider"
import { Cloud, Frown, Heart, Smile, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const moodConfig = {
  neutral: {
    icon: Smile,
    label: "Feeling calm",
    description: "Your space is balanced and neutral",
    color: "text-primary",
  },
  anxious: {
    icon: Cloud,
    label: "Feeling anxious",
    description: "Your space has extra breathing room",
    color: "text-blue-500",
  },
  low: {
    icon: Frown,
    label: "Feeling low",
    description: "Your space is softer and warmer",
    color: "text-amber-600",
  },
  lonely: {
    icon: Heart,
    label: "Feeling lonely",
    description: "Your space feels more welcoming",
    color: "text-orange-500",
  },
  crisis: {
    icon: AlertTriangle,
    label: "In crisis mode",
    description: "Your space is clear and focused",
    color: "text-destructive",
  },
}

export function MoodIndicator({ compact = false }: { compact?: boolean }) {
  const { mood } = useMood()
  const config = moodConfig[mood]
  const Icon = config.icon

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", config.color)} />
        <span>{config.label}</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card/40 backdrop-blur-sm p-4 mood-adaptive-card">
      <div className="flex items-start gap-3">
        <div className={cn("rounded-lg p-2 bg-background/50", config.color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">{config.label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
        </div>
      </div>
    </div>
  )
}
