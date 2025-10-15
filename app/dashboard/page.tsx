"use client"
import { AICompanionCard } from "@/components/dashboard/ai-companion-card"
import DreamAnalysisCard from "@/components/dashboard/dream-analysis-card"
import PeerMatchingCard from "@/components/dashboard/peer-matching-card"
import DailyCheckinCard from "@/components/dashboard/daily-checkin-card"
import MicroInterventionsCard from "@/components/dashboard/micro-interventions-card"
import InsightsCard from "@/components/dashboard/insights-card"
import { MoodIndicator } from "@/components/mood-indicator"
import { XPBar } from "@/components/xp/XPBar"
import { useLocale } from "@/components/locale-provider"
import { Sparkles, TrendingUp, Trophy } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuthActions } from "@convex-dev/auth/react"
import { useEffect } from "react"
import { useMood } from "@/components/mood-provider"

export default function DashboardPage() {
  const { signIn } = useAuthActions()
  const { mood } = useMood()
  const { t } = useLocale()
  const currentUser = useQuery(api.auth.loggedInUser)
  
  // Get user's timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const streakData = useQuery(api.analytics.getStreak, { timezone })
  const insightsCount = useQuery(api.analytics.getInsightsCount)
  
  // TODO: XP system - Uncomment when convex/xp.ts is added to API
  // const xpData = useQuery(
  //   api.xp.getUserXP,
  //   currentUser ? { userId: currentUser._id } : "skip"
  // )
  
  // Mock XP data for now - remove when backend is ready
  const xpData = currentUser ? {
    level: 5,
    totalXP: 2450,
    currentLevelXP: 450,
    xpForNextLevel: 1000,
    progressPercent: 45,
    dailyStreak: 7,
    weeklyStreak: 3,
    longestDailyStreak: 12,
    totalActions: 156,
    todayActions: 8,
    totalBreathingSessions: 42,
    totalChatMessages: 89,
    totalCheckIns: 25,
  } : null

  // Auto sign-in anonymous users
  useEffect(() => {
    if (currentUser === null) {
      signIn("anonymous").catch((error) => {
        console.error("Failed to sign in anonymously:", error)
      })
    }
  }, [currentUser, signIn])

  // Mood-adaptive welcome messages
  const getMoodMessage = () => {
    switch (mood) {
      case "anxious":
        return { title: t('mood_msg_anxious_title'), subtitle: t('mood_msg_anxious_sub') }
      case "low":
        return { title: t('mood_msg_low_title'), subtitle: t('mood_msg_low_sub') }
      case "lonely":
        return { title: t('mood_msg_lonely_title'), subtitle: t('mood_msg_lonely_sub') }
      case "crisis":
        return { title: t('mood_msg_crisis_title'), subtitle: t('mood_msg_crisis_sub') }
      default:
        return { title: t('welcome_back'), subtitle: t('welcome_subtitle') }
    }
  }

  const welcomeMessage = getMoodMessage()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Hero Header */}
        <div className="mb-4 md:mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 mb-2.5 pl-0 lg:pl-0">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent break-words">
                {welcomeMessage.title}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 break-words">{welcomeMessage.subtitle}</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            {/* XP Progress Card */}
            {xpData && (
              <div className="sm:col-span-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm border border-primary/20 rounded-2xl p-4 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Your Progress</h3>
                      <span className="text-xs text-muted-foreground">
                        {xpData.totalXP.toLocaleString()} Total XP
                      </span>
                    </div>
                  </div>
                </div>
                <XPBar
                  currentXP={xpData.currentLevelXP}
                  xpForNextLevel={xpData.xpForNextLevel}
                  level={xpData.level}
                  totalXP={xpData.totalXP}
                  showDetails={true}
                  animated={true}
                />
              </div>
            )}
            
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-3 hover:bg-card/80 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-2 text-accent mb-1">
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">{t('streak')}</span>
              </div>
              <p className="text-2xl font-bold">{streakData?.currentStreak ?? 0}</p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">{t('days_active')}</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-3 hover:bg-card/80 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">{t('insights')}</span>
              </div>
              <p className="text-2xl font-bold">{insightsCount ?? 0}</p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">{t('insights_generated')}</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-4 lg:grid-cols-12 mood-adaptive-grid">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 grid gap-4 mood-adaptive-grid min-w-0">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100 min-w-0">
              <AICompanionCard />
            </div>
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-200 min-w-0">
              <DreamAnalysisCard />
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="lg:col-span-4 grid gap-4 content-start mood-adaptive-grid min-w-0">
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-75 min-w-0">
              <MoodIndicator />
            </div>
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100 min-w-0">
              <DailyCheckinCard />
            </div>
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-150 min-w-0">
              <InsightsCard />
            </div>
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-200 min-w-0">
              <MicroInterventionsCard />
            </div>
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300 min-w-0">
              <PeerMatchingCard />
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-4 p-3 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in duration-700 delay-500">
          <p className="text-[10px] text-center text-muted-foreground">
            🔒 100% Anonymous Recovery Support. No personal data uploaded. All processing happens on your device. You are in control.
          </p>
        </div>
      </div>
    </div>
  )
}
