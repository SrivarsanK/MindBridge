"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, X, TrendingUp, Sparkles } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { useLocale } from "@/components/locale-provider"

export default function InsightsCard() {
  const { t } = useLocale()
  const insights = useQuery(api.analytics.getUserInsights)
  const dismissInsight = useMutation(api.analytics.dismissInsight)

  if (!insights || insights.length === 0) {
    return (
      <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300 !py-0 !gap-0 card-fixed-layout">
        <div className="bg-gradient-to-br from-primary/5 to-transparent border-b">
          <CardHeader className="py-2.5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/20">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-base">{t("insights_card")}</CardTitle>
              </div>
              <p className="text-[10px] text-muted-foreground">{t("insights_desc")}</p>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-3">
          <div className="text-center py-6">
            <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">
              {t("insights_empty")}
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
    <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300 !py-0 !gap-0">
      <div className="bg-gradient-to-br from-primary/5 to-transparent border-b">
        <CardHeader className="py-2.5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/20">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-base">{t("insights_card")}</CardTitle>
            </div>
            <p className="text-[10px] text-muted-foreground">{t("insights_desc")}</p>
          </div>
        </CardHeader>
      </div>
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          {insights.slice(0, 3).map((insight) => {
            const Icon = getInsightIcon(insight.insightType)
            
            return (
              <div
                key={insight._id}
                className="relative group p-3 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => dismissInsight({ insightId: insight._id })}
                  className="absolute top-2 right-2 p-1 rounded-lg hover:bg-background/80 transition-colors opacity-0 group-hover:opacity-100"
                  title={t("dismiss")}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
                
                <div className="flex gap-2.5">
                  <div className="flex items-center justify-center flex-shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold mb-1">
                      {insight.insightType === "mood_pattern" ? t("insight_mood_pattern") : 
                       insight.insightType === "activity_streak" ? t("insight_activity_streak") : 
                       insight.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                    <div className="mt-1.5 text-[9px] text-muted-foreground/60">
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
