"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wind, Eye, BookOpen, Sparkles, Timer } from "lucide-react"
import { useState } from "react"
import { useLocale } from "@/components/locale-provider"

export default function MicroInterventionsCard() {
  const { t } = useLocale()
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  
  const interventions = [
    { id: "breathing", icon: Wind, label: t("relief_breathing"), duration: t("duration_1min"), color: "text-blue-500" },
    { id: "grounding", icon: Eye, label: t("relief_grounding"), duration: t("duration_2min"), color: "text-green-500" },
    { id: "reflection", icon: BookOpen, label: t("relief_reflection"), duration: t("duration_3min"), color: "text-purple-500" },
  ]
  
  return (
    <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg">{t("micro_interventions")}</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">{t("micro_interventions_desc")}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          {interventions.map((intervention) => {
            const Icon = intervention.icon
            const isActive = activeExercise === intervention.id
            
            return (
              <button
                key={intervention.id}
                onClick={() => setActiveExercise(isActive ? null : intervention.id)}
                className="group relative flex items-center gap-3 p-4 rounded-2xl border-2 border-border bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
              >
                <div className={`flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br shadow-md transition-all duration-300 group-hover:shadow-lg shrink-0 ${
                  intervention.id === "breathing" ? "from-blue-500 to-blue-600 shadow-blue-500/20" :
                  intervention.id === "grounding" ? "from-green-500 to-green-600 shadow-green-500/20" :
                  "from-purple-500 to-purple-600 shadow-purple-500/20"
                }`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium">{intervention.label}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Timer className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">{intervention.duration}</span>
                  </div>
                </div>
                <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  →
                </div>
                
                {isActive && (
                  <div className="absolute inset-0 border-2 border-primary rounded-2xl bg-primary/5 animate-pulse pointer-events-none" />
                )}
              </button>
            )
          })}
          
          <div className="flex items-center justify-center mt-2 p-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="text-lg shrink-0">🎯</div>
              <p className="text-xs text-muted-foreground">
                {t("take_moment")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
