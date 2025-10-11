"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, X, TrendingUp, Sparkles } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"

export default function InsightsCard() {
  const insights = useQuery(api.analytics.getUserInsights)
  const dismissInsight = useMutation(api.analytics.dismissInsight)

  if (!insights || insights.length === 0) {
    return (
      <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Personal Insights</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Your wellness patterns</p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Check in daily to unlock personalized insights about your wellness journey
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "mood_pattern":
        return TrendingUp
      case "activity_streak":
        return Sparkles
      default:
        return Lightbulb
    }
  }

  return (
    <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Personal Insights</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Your wellness patterns</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {insights.slice(0, 3).map((insight) => {
            const Icon = getInsightIcon(insight.insightType)
            
            return (
              <div
                key={insight._id}
                className="relative group p-4 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300"
              >
                <button
                  onClick={() => dismissInsight({ insightId: insight._id })}
                  className="absolute top-2 right-2 p-1 rounded-lg hover:bg-background/80 transition-colors opacity-0 group-hover:opacity-100"
                  title="Dismiss"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold mb-1">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                    <div className="mt-2 text-[10px] text-muted-foreground/60">
                      {new Date(insight.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {insights.length > 3 && (
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                +{insights.length - 3} more insights available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
