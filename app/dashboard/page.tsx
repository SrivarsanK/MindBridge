"use client"
import { AICompanionCard } from "@/components/dashboard/ai-companion-card"
import DreamAnalysisCard from "@/components/dashboard/dream-analysis-card"
import PeerMatchingCard from "@/components/dashboard/peer-matching-card"
import DailyCheckinCard from "@/components/dashboard/daily-checkin-card"
import MicroInterventionsCard from "@/components/dashboard/micro-interventions-card"
import { Sparkles, Shield, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Hero Header */}
        <div className="mb-8 md:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Your personal wellness sanctuary</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4 hover:bg-card/80 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium">Privacy</span>
              </div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-muted-foreground">On-device</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4 hover:bg-card/80 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-2 text-accent mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Streak</span>
              </div>
              <p className="text-2xl font-bold">7</p>
              <p className="text-xs text-muted-foreground">Days active</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4 hover:bg-card/80 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-medium">Insights</span>
              </div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">Generated</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 grid gap-6">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
              <AICompanionCard />
            </div>
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
              <DreamAnalysisCard />
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="lg:col-span-4 grid gap-6 content-start">
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
              <DailyCheckinCard />
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
