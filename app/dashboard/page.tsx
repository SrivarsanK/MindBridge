"use client"
import { AICompanionCard } from "@/components/dashboard/ai-companion-card"
import DreamAnalysisCard from "@/components/dashboard/dream-analysis-card"
import PeerMatchingCard from "@/components/dashboard/peer-matching-card"
import DailyCheckinCard from "@/components/dashboard/daily-checkin-card"
import MicroInterventionsCard from "@/components/dashboard/micro-interventions-card"
import InsightsCard from "@/components/dashboard/insights-card"
import { MoodIndicator } from "@/components/mood-indicator"
import { useLocale } from "@/components/locale-provider"
import { Sparkles, TrendingUp } from "lucide-react"
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
  const streakData = useQuery(api.analytics.getStreak)
  const insightsCount = useQuery(api.analytics.getInsightsCount)

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Header */}
        <div className="mb-8 md:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 pl-0 lg:pl-0">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent break-words">
                {welcomeMessage.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 break-words">{welcomeMessage.subtitle}</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4 hover:bg-card/80 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-2 text-accent mb-1">
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">{t('streak')}</span>
              </div>
              <p className="text-2xl font-bold">{streakData?.currentStreak ?? 0}</p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">{t('days_active')}</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4 hover:bg-card/80 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
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
        <div className="grid gap-6 lg:grid-cols-12 mood-adaptive-grid">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 grid gap-6 mood-adaptive-grid">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
              <AICompanionCard />
            </div>
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
              <DreamAnalysisCard />
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="lg:col-span-4 grid gap-6 content-start mood-adaptive-grid">
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-75">
              <MoodIndicator />
            </div>
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
              <DailyCheckinCard />
            </div>
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
              <InsightsCard />
            </div>
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
              <MicroInterventionsCard />
            </div>
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
              <PeerMatchingCard />
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in duration-700 delay-500">
          <p className="text-xs text-center text-muted-foreground">
            🔒 Crisis-aware features surface support gently. No personal data is uploaded. All processing happens on your device.
          </p>
        </div>
      </div>
    </div>
  )
}
