"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wind, Eye, BookOpen, Sparkles, Timer } from "lucide-react"
import { useState } from "react"

const interventions = [
  { id: "breathing", icon: Wind, label: "60s Breathing", duration: "1 min", color: "text-blue-500" },
  { id: "grounding", icon: Eye, label: "Grounding 5-4-3-2-1", duration: "2 min", color: "text-green-500" },
  { id: "reflection", icon: BookOpen, label: "Brief Reflection", duration: "3 min", color: "text-purple-500" },
]

export default function MicroInterventionsCard() {
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  
  return (
    <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Quick Relief</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Instant wellness exercises</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-2">
          {interventions.map((intervention) => {
            const Icon = intervention.icon
            const isActive = activeExercise === intervention.id
            
            return (
              <button
                key={intervention.id}
                onClick={() => setActiveExercise(isActive ? null : intervention.id)}
                className="group relative flex items-center gap-3 p-4 rounded-2xl border-2 border-border bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center transition-all duration-300 group-hover:from-primary/20 group-hover:to-primary/10 ${intervention.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{intervention.label}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Timer className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{intervention.duration}</span>
                  </div>
                </div>
                <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
                
                {isActive && (
                  <div className="absolute inset-0 border-2 border-primary rounded-2xl bg-primary/5 animate-pulse" />
                )}
              </button>
            )
          })}
          
          <div className="mt-2 p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
            <p className="text-xs text-muted-foreground">
              🎯 Take a moment anytime you need
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
