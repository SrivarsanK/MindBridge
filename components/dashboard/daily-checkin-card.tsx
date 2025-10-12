"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMood } from "@/components/mood-provider"
import { useLocale } from "@/components/locale-provider"
import { Button } from "@/components/ui/button"
import { Smile, Frown, Cloud, Users, Heart, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState, useEffect } from "react"

const moodConfig = {
  neutral: { icon: Smile, label: "mood_calm" },
  anxious: { icon: Cloud, label: "mood_anxious" },
  low: { icon: Frown, label: "mood_low" },
  lonely: { icon: Users, label: "mood_lonely" },
}

export default function DailyCheckinCard() {
  const { mood, setMood } = useMood()
  const { t } = useLocale()
  const moods = ["neutral", "anxious", "low", "lonely"] as const
  const recordCheckin = useMutation(api.analytics.recordDailyCheckin)
  const streakData = useQuery(api.analytics.getStreak)
  const [saved, setSaved] = useState(false)

  // Initialize saved state based on whether user checked in today
  useEffect(() => {
    if (streakData?.hasCheckedInToday) {
      setSaved(true)
    }
  }, [streakData?.hasCheckedInToday])

  const handleMoodSelect = async (selectedMood: typeof moods[number]) => {
    setMood(selectedMood)
    setSaved(false)
  }

  const handleSaveCheckin = async () => {
    const validMoods = ["neutral", "anxious", "low", "lonely"] as const
    if (!mood || !validMoods.includes(mood as any)) return
    try {
      await recordCheckin({ mood: mood as typeof validMoods[number] })
      setSaved(true)
    } catch (error) {
      console.error("Failed to save check-in:", error)
    }
  }
  
  return (
    <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/20">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg">{t('daily_checkin')}</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">{t('how_feeling_today')}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {moods.map((m) => {
              const config = moodConfig[m]
              const Icon = config.icon
              const isActive = mood === m
              
              return (
                <button
                  key={m}
                  onClick={() => handleMoodSelect(m)}
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
                    <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                      <div className="text-white text-xs font-bold">✓</div>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-lg shrink-0",
                        isActive ? "bg-gradient-to-br from-primary to-primary/80" : "bg-gradient-to-br from-muted to-muted/80",
                        "text-white"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{t(config.label)}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          {mood && !saved && (
            <Button 
              onClick={handleSaveCheckin}
              className="w-full mt-2"
              size="sm"
            >
              <Check className="h-4 w-4 mr-2" />
              {t('save_checkin')}
            </Button>
          )}

          {saved && (
            <div className="flex items-center justify-center mt-2 p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-md shrink-0">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                  {t('checkin_saved')}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-center p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground text-center">
                Your UI adapts gently to your state
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
