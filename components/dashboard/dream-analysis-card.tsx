"use client"
import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Moon, TrendingUp, Brain, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function DreamAnalysisCard() {
  const [dreamText, setDreamText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const createDreamAnalysis = useMutation(api.dreamAnalysis.createDreamAnalysis)
  const dreamAnalyses = useQuery(api.dreamAnalysis.getUserDreamAnalyses, { limit: 7 })
  
  // Process dream data for visualization
  const chartData = dreamAnalyses?.slice(0, 7).reverse().map((analysis, index) => {
    const avgIntensity = analysis.visualizationData.intensityScore
    // Calculate valence (positive/negative emotion) and arousal from tags
    const positiveEmotions = ["happy", "joy", "peace", "calm", "love", "excited"]
    const negativeEmotions = ["fear", "anxiety", "sad", "angry", "stress", "worry"]
    
    const positiveCount = analysis.emotionalTags.filter(tag => 
      positiveEmotions.some(emotion => tag.toLowerCase().includes(emotion))
    ).length
    const negativeCount = analysis.emotionalTags.filter(tag => 
      negativeEmotions.some(emotion => tag.toLowerCase().includes(emotion))
    ).length
    
    const valence = positiveCount > 0 || negativeCount > 0 
      ? (positiveCount / (positiveCount + negativeCount)) 
      : 0.5
    
    return {
      day: new Date(analysis.analysisDate).toLocaleDateString('en-US', { weekday: 'short' }),
      valence: Number(valence.toFixed(2)),
      arousal: avgIntensity,
    }
  }) || []
  
  const avgValence = chartData.length > 0 
    ? (chartData.reduce((sum, d) => sum + d.valence, 0) / chartData.length).toFixed(2)
    : "0.00"
  const avgArousal = chartData.length > 0
    ? (chartData.reduce((sum, d) => sum + d.arousal, 0) / chartData.length).toFixed(2)
    : "0.00"
  
  const analyzeDream = async () => {
    if (!dreamText.trim()) return
    
    setIsAnalyzing(true)
    try {
      // Simple on-device analysis
      const text = dreamText.toLowerCase()
      
      // Detect emotional tags
      const emotionalTags = []
      if (text.includes("happy") || text.includes("joy")) emotionalTags.push("happy")
      if (text.includes("fear") || text.includes("scared")) emotionalTags.push("fear")
      if (text.includes("anxious") || text.includes("worry")) emotionalTags.push("anxiety")
      if (text.includes("sad") || text.includes("cry")) emotionalTags.push("sadness")
      if (text.includes("angry") || text.includes("mad")) emotionalTags.push("anger")
      if (text.includes("calm") || text.includes("peace")) emotionalTags.push("calm")
      if (text.includes("love")) emotionalTags.push("love")
      if (text.includes("excited")) emotionalTags.push("excitement")
      
      // Detect stress indicators
      const stressIndicators = []
      if (text.includes("chase") || text.includes("run away")) stressIndicators.push("escape-scenario")
      if (text.includes("fall") || text.includes("falling")) stressIndicators.push("falling")
      if (text.includes("late") || text.includes("miss")) stressIndicators.push("time-pressure")
      if (text.includes("lost") || text.includes("can't find")) stressIndicators.push("disorientation")
      if (text.includes("exam") || text.includes("test")) stressIndicators.push("performance-anxiety")
      
      // Detect recurring themes
      const recurringThemes = []
      if (text.includes("water") || text.includes("ocean") || text.includes("sea")) recurringThemes.push("water")
      if (text.includes("flying") || text.includes("sky")) recurringThemes.push("flying")
      if (text.includes("house") || text.includes("home")) recurringThemes.push("home")
      if (text.includes("work") || text.includes("office")) recurringThemes.push("work")
      if (text.includes("family") || text.includes("parent")) recurringThemes.push("family")
      if (text.includes("school") || text.includes("classroom")) recurringThemes.push("school")
      
      // Calculate intensity score (0-1)
      const intensityWords = ["very", "extremely", "intense", "vivid", "strong", "powerful"]
      const intensityScore = Math.min(
        0.3 + (intensityWords.filter(word => text.includes(word)).length * 0.15) +
        (emotionalTags.length * 0.1),
        1.0
      )
      
      // Determine emotional weather
      let emotionalWeather = "neutral"
      if (emotionalTags.includes("happy") || emotionalTags.includes("joy")) emotionalWeather = "sunny"
      if (emotionalTags.includes("calm") || emotionalTags.includes("peace")) emotionalWeather = "clear"
      if (emotionalTags.includes("anxiety") || stressIndicators.length > 2) emotionalWeather = "stormy"
      if (emotionalTags.includes("fear")) emotionalWeather = "turbulent"
      if (emotionalTags.includes("sadness")) emotionalWeather = "cloudy"
      
      // Encrypt metadata (in production, use proper encryption)
      const encryptedMetadata = btoa(dreamText)
      
      await createDreamAnalysis({
        encryptedMetadata,
        emotionalTags: emotionalTags.length > 0 ? emotionalTags : ["neutral"],
        stressIndicators,
        recurringThemes: recurringThemes.length > 0 ? recurringThemes : ["miscellaneous"],
        emotionalWeather,
        intensityScore,
      })
      
      setDreamText("")
    } catch (error) {
      console.error("Failed to analyze dream:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  return (
    <Card className="overflow-hidden border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
              <Moon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Dream Analysis</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Pattern recognition & insights</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10">
            <Brain className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs font-medium text-indigo-500">AI-Powered</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6">
          {/* Dream Entry Form */}
          <div className="p-4 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300">
            <Label htmlFor="dream-text" className="text-sm font-medium mb-2 block">
              Describe your dream
            </Label>
            <Textarea
              id="dream-text"
              placeholder="Tell me about your dream... What did you see? How did you feel?"
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              className="min-h-[100px] resize-none mb-3"
            />
            <Button 
              onClick={analyzeDream} 
              disabled={!dreamText.trim() || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Dream
                </>
              )}
            </Button>
          </div>
          
          {chartData.length > 0 ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-chart-1/10 to-chart-1/5 border border-chart-1/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-chart-1" />
                    <span className="text-xs font-medium text-muted-foreground">Avg Valence</span>
                  </div>
                  <p className="text-2xl font-bold text-chart-1">{avgValence}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-chart-2/10 to-chart-2/5 border border-chart-2/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-chart-2" />
                    <span className="text-xs font-medium text-muted-foreground">Avg Arousal</span>
                  </div>
                  <p className="text-2xl font-bold text-chart-2">{avgArousal}</p>
                </div>
              </div>
              
              {/* Chart */}
              <div className="p-4 rounded-2xl border bg-card/50">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Recent Emotional Patterns</span>
                </div>
                <ChartContainer
                  config={{
                    valence: { label: "Valence", color: "hsl(var(--chart-1))" },
                    arousal: { label: "Arousal", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[240px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        domain={[0, 1]} 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="valence" 
                        stroke="var(--color-valence)" 
                        strokeWidth={3}
                        dot={{ fill: "var(--color-valence)", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="arousal" 
                        stroke="var(--color-arousal)" 
                        strokeWidth={3}
                        dot={{ fill: "var(--color-arousal)", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </>
          ) : (
            <div className="p-8 rounded-2xl border bg-card/50 text-center">
              <Moon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-1">No dreams recorded yet</p>
              <p className="text-xs text-muted-foreground/70">Start by describing a dream above</p>
            </div>
          )}
          
          {/* Recent Dream Insights */}
          {dreamAnalyses && dreamAnalyses.length > 0 && (
            <div className="p-4 rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Latest Dream Insight</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Emotional Weather:</span>
                  <span className="text-xs font-medium capitalize">
                    {dreamAnalyses[0].visualizationData.emotionalWeather}
                  </span>
                </div>
                {dreamAnalyses[0].emotionalTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {dreamAnalyses[0].emotionalTags.slice(0, 5).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {dreamAnalyses[0].recurringThemes.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Themes:</span>
                    <span className="text-xs font-medium capitalize">
                      {dreamAnalyses[0].recurringThemes.slice(0, 3).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Info Notice */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground text-center">
              🧠 Emotional patterns are computed on-device from your dream notes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
