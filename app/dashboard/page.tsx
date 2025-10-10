"use client"
import AICompanionCard from "@/components/dashboard/ai-companion-card"
import DreamAnalysisCard from "@/components/dashboard/dream-analysis-card"
import PeerMatchingCard from "@/components/dashboard/peer-matching-card"
import DailyCheckinCard from "@/components/dashboard/daily-checkin-card"
import MicroInterventionsCard from "@/components/dashboard/micro-interventions-card"

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 grid gap-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 grid gap-6">
          <AICompanionCard />
          <DreamAnalysisCard />
        </div>
        <div className="grid gap-6">
          <DailyCheckinCard />
          <PeerMatchingCard />
          <MicroInterventionsCard />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Crisis-aware features surface support gently. No personal data is uploaded.
      </p>
    </div>
  )
}
