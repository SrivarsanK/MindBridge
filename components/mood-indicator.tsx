"use client"
import { useMood } from "./mood-provider"
import { Cloud, Frown, Heart, Smile, AlertTriangle, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/components/locale-provider"

const moodConfig = {
  neutral: {
    icon: Smile,
    label: "mood_calm",
    description: "mood_calm_desc",
    color: "text-primary",
    bgColor: "from-primary/10 to-primary/5",
  },
  anxious: {
    icon: Cloud,
    label: "mood_anxious",
    description: "mood_anxious_desc",
    color: "text-blue-500",
    bgColor: "from-blue-500/10 to-blue-500/5",
  },
  low: {
    icon: Frown,
    label: "mood_low",
    description: "mood_low_desc",
    color: "text-amber-600",
    bgColor: "from-amber-600/10 to-amber-600/5",
  },
  lonely: {
    icon: Users,
    label: "mood_lonely",
    description: "mood_lonely_desc",
    color: "text-orange-500",
    bgColor: "from-orange-500/10 to-orange-500/5",
  },
  crisis: {
    icon: AlertTriangle,
    label: "mood_crisis",
    description: "mood_crisis_desc",
    color: "text-destructive",
    bgColor: "from-destructive/10 to-destructive/5",
  },
}

export function MoodIndicator({ compact = false, interactive = false }: { compact?: boolean; interactive?: boolean }) {
  const { mood, setMood } = useMood()
  const { t } = useLocale()
  const config = moodConfig[mood]
  const Icon = config.icon

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", config.color)} />
        <span>{t(config.label)}</span>
      </div>
    )
  }

  if (interactive) {
    const moods = ["neutral", "anxious", "low", "lonely"] as const
    
    return (
      <div className="rounded-xl border bg-card/40 backdrop-blur-sm p-4 mood-adaptive-card">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className={cn("rounded-lg p-2 bg-gradient-to-br", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm">{t(config.label)}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t(config.description)}</p>
            </div>
          </div>
          
          {/* Mood Selection Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            {moods.map((m) => {
              const mConfig = moodConfig[m]
              const MIcon = mConfig.icon
              const isActive = mood === m
              
              return (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={cn(
                    "relative p-2 rounded-lg border transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    isActive
                      ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm"
                      : "border-border bg-card/50 hover:border-primary/30"
                  )}
                >
                  {isActive && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                      <div className="text-white text-[10px] font-bold">✓</div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                        isActive ? "bg-primary" : "bg-muted",
                        "text-white"
                      )}
                    >
                      <MIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-medium">{t(mConfig.label)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card/40 backdrop-blur-sm p-4 mood-adaptive-card">
      <div className="flex items-start gap-3">
        <div className={cn("rounded-lg p-2 bg-gradient-to-br", config.bgColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">{t(config.label)}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t(config.description)}</p>
        </div>
      </div>
    </div>
  )
}
