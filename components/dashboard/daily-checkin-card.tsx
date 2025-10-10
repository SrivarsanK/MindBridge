"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMood } from "@/components/mood-provider"
import { Button } from "@/components/ui/button"
import { Smile, Frown, Cloud, Users, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

const moodConfig = {
  neutral: { icon: Smile, color: "bg-primary", label: "Calm", emoji: "😌" },
  anxious: { icon: Cloud, color: "bg-orange-500", label: "Anxious", emoji: "😰" },
  low: { icon: Frown, color: "bg-blue-500", label: "Low", emoji: "😔" },
  lonely: { icon: Users, color: "bg-purple-500", label: "Lonely", emoji: "🥺" },
}

export default function DailyCheckinCard() {
  const { mood, setMood } = useMood()
  const moods = ["neutral", "anxious", "low", "lonely"] as const
  
  return (
    <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Daily Check-in</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">How are you feeling today?</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            {moods.map((m) => {
              const config = moodConfig[m]
              const Icon = config.icon
              const isActive = mood === m
              
              return (
                <button
                  key={m}
                  onClick={() => setMood(m as any)}
                  className={cn(
                    "relative group p-4 rounded-2xl border-2 transition-all duration-300",
                    "hover:scale-105 hover:shadow-md active:scale-95",
                    isActive
                      ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-card/50 hover:border-primary/30"
                  )}
                >
                  {/* Selected indicator */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                      <div className="text-white text-xs">✓</div>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300",
                        isActive ? config.color : "bg-muted",
                        "text-white shadow-md group-hover:shadow-lg"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{config.emoji} {config.label}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground text-center">
              ✨ Your UI adapts gently to your state
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
