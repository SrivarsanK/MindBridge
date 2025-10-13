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
  
  // Get user's timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const streakData = useQuery(api.analytics.getStreak, { timezone })
  
  const [autoCheckedIn, setAutoCheckedIn] = useState(false)
  const [showStreakCelebration, setShowStreakCelebration] = useState(false)

  // Automatically record check-in when dashboard loads (if not already checked in today)
  useEffect(() => {
    const autoRecordCheckin = async () => {
      // Only auto-checkin once per session and if not already checked in today
      if (!autoCheckedIn && streakData && !streakData.hasCheckedInToday && recordCheckin) {
        console.log('[DailyCheckinCard] Auto-recording daily check-in...')
        
        try {
          const result = await recordCheckin({ 
            mood: "neutral", // Default mood for automatic check-in
            timezone 
          })
          
          console.log('[DailyCheckinCard] Auto check-in successful:', result)
          setAutoCheckedIn(true)
          
          // Show celebration if this is a streak
          if (result.isNewCheckin && streakData.currentStreak >= 1) {
            setShowStreakCelebration(true)
            setTimeout(() => setShowStreakCelebration(false), 5000)
          }
        } catch (error) {
          console.error("[DailyCheckinCard] Auto check-in failed:", error)
        }
      }
    }

    autoRecordCheckin()
  }, [streakData, autoCheckedIn, recordCheckin, timezone])

  const handleMoodSelect = (selectedMood: typeof moods[number]) => {
    setMood(selectedMood)
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
          <p className="text-xs text-muted-foreground">
            You're checked in! Select your current mood (optional)
          </p>
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
          
          {/* Auto Check-in Message */}
          {streakData?.hasCheckedInToday && (
            <div className="flex items-center justify-center mt-3 p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-md shrink-0">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                  Checked in today
                </p>
              </div>
            </div>
          )}

          {/* Streak Display - Always show when we have data */}
          {streakData && (
            <div className="mt-2 p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 shadow-sm">
              {streakData.currentStreak > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shrink-0">
                      <span className="text-lg">🔥</span>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                        {streakData.currentStreak} {streakData.currentStreak === 1 ? 'Day' : 'Days'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Current Streak • Best: {streakData.longestStreak}
                      </div>
                    </div>
                  </div>
                  {!streakData.hasCheckedInToday && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-medium bg-orange-500/10 px-3 py-1.5 rounded-full">
                      Check in today!
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg shrink-0">
                    <span className="text-lg">✨</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-400">
                      Start Your Streak!
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Check in daily to build a healthy habit
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Streak Celebration */}
          {showStreakCelebration && streakData && (
            <div className="mt-2 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 shadow-lg animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shrink-0 animate-pulse">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-purple-700 dark:text-purple-400">
                    Amazing! {streakData.currentStreak + 1} days in a row!
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Keep up the great work! You're building a healthy habit.
                  </div>
                </div>
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
