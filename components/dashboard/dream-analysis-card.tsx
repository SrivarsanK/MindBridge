"use client"
import { useState, useMemo } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Moon, TrendingUp, Brain, Sparkles, Clock, Radar, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/components/locale-provider"
import { DreamTimelineChart } from "./dream-timeline-chart"
import type { DreamSegment } from "./dream-timeline-chart"
import { D3DreamTimeline, type D3DreamSegment } from "./d3-dream-timeline"
import { D3EmotionalRadialChart, type EmotionData } from "./d3-emotional-radial"
import { D3EmotionalStreamGraph, type EmotionTimePoint } from "./d3-emotional-stream"

export default function DreamAnalysisCard() {
  const { t } = useLocale()
  const [dreamText, setDreamText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [viewMode, setViewMode] = useState<"timeline" | "d3timeline" | "radial" | "stream" | "graph">("d3timeline")
  
  const createDreamAnalysis = useMutation(api.dreamAnalysis.createDreamAnalysis)
  const dreamAnalyses = useQuery(api.dreamAnalysis.getUserDreamAnalyses, { limit: 7 })
  
  // Generate sample dream timeline segments from latest dream
  const dreamSegments = useMemo((): DreamSegment[] => {
    if (!dreamAnalyses || dreamAnalyses.length === 0) return []
    
    const latestDream = dreamAnalyses[0]
    const dreamDate = new Date(latestDream.analysisDate)
    
    // Create sample segments based on emotional tags and intensity
    const segments: DreamSegment[] = []
    const baseTime = new Date(dreamDate)
    baseTime.setHours(22, 0, 0, 0) // Start at 10 PM
    
    let currentTime = new Date(baseTime)
    const hasLucid = latestDream.emotionalTags.some(tag => 
      tag.includes("excited") || tag.includes("control")
    )
    const hasFear = latestDream.emotionalTags.some(tag => 
      tag.includes("fear") || tag.includes("anxiety")
    )
    const isCalm = latestDream.emotionalTags.some(tag => 
      tag.includes("calm") || tag.includes("peace")
    )
    
    // Build dream progression (typical sleep architecture)
    const addSegment = (stage: DreamSegment["stage"], duration: number, emotion?: string) => {
      const endTime = new Date(currentTime.getTime() + duration * 60 * 1000)
      segments.push({ stage, startTime: new Date(currentTime), endTime, emotion })
      currentTime = endTime
    }
    
    // Initial light sleep
    addSegment("light", 15)
    
    // First REM or Deep based on emotions
    if (hasFear) {
      addSegment("rem", 20, latestDream.emotionalTags[0])
      addSegment("awake", 5)
    } else {
      addSegment("deep", 30)
    }
    
    // Mid-sleep cycle
    addSegment("light", 10)
    addSegment("rem", 25, latestDream.emotionalTags[0])
    
    // Lucid dream if indicated
    if (hasLucid) {
      addSegment("lucid", 15, "lucid awareness")
    }
    
    // Deep sleep phase
    if (isCalm) {
      addSegment("deep", 40)
    } else {
      addSegment("deep", 25)
      addSegment("light", 10)
    }
    
    // Morning REM (most vivid dreams)
    addSegment("rem", 30, latestDream.emotionalTags[latestDream.emotionalTags.length - 1])
    addSegment("light", 15)
    
    // Wake up
    addSegment("awake", 10)
    
    return segments
  }, [dreamAnalyses])
  
  // Process dream data for visualization with proper date formatting
  const chartData = dreamAnalyses?.slice(0, 7).reverse().map((analysis) => {
    const date = new Date(analysis.analysisDate)
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
    
    // Format date as "Jan 15" or "Dec 3" (Month + Day)
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
    
    // For tooltip - full date with time
    const fullDateTime = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    return {
      date: formattedDate,
      fullDate: fullDateTime,
      timestamp: date.getTime(),
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
  
  // Transform data for D3 Timeline
  const d3DreamSegments = useMemo((): D3DreamSegment[] => {
    if (!dreamAnalyses || dreamAnalyses.length === 0) return []
    
    const latestDream = dreamAnalyses[0]
    const dreamDate = new Date(latestDream.analysisDate)
    const baseTime = new Date(dreamDate)
    baseTime.setHours(22, 0, 0, 0) // Start at 10 PM
    
    const segments: D3DreamSegment[] = []
    let currentTime = new Date(baseTime)
    
    const hasLucid = latestDream.emotionalTags.some(tag => 
      tag.includes("excited") || tag.includes("control")
    )
    const hasFear = latestDream.emotionalTags.some(tag => 
      tag.includes("fear") || tag.includes("anxiety")
    )
    const isCalm = latestDream.emotionalTags.some(tag => 
      tag.includes("calm") || tag.includes("peace")
    )
    
    const addSegment = (stage: D3DreamSegment["stage"], duration: number, emotion?: string, intensity?: number) => {
      const endTime = new Date(currentTime.getTime() + duration * 60 * 1000)
      segments.push({ 
        stage, 
        startTime: new Date(currentTime), 
        endTime, 
        emotion, 
        intensity: intensity || latestDream.visualizationData.intensityScore 
      })
      currentTime = endTime
    }
    
    // Build dream progression
    addSegment("light", 15, undefined, 0.3)
    if (hasFear) {
      addSegment("rem", 20, latestDream.emotionalTags[0], 0.8)
      addSegment("awake", 5, undefined, 0.2)
    } else {
      addSegment("deep", 30, undefined, 0.9)
    }
    addSegment("light", 10, undefined, 0.4)
    addSegment("rem", 25, latestDream.emotionalTags[0], 0.7)
    if (hasLucid) {
      addSegment("lucid", 15, "lucid awareness", 0.95)
    }
    if (isCalm) {
      addSegment("deep", 40, undefined, 0.85)
    } else {
      addSegment("deep", 25, undefined, 0.7)
      addSegment("light", 10, undefined, 0.5)
    }
    addSegment("rem", 30, latestDream.emotionalTags[latestDream.emotionalTags.length - 1], 0.75)
    addSegment("light", 15, undefined, 0.4)
    addSegment("awake", 10, undefined, 0.1)
    
    return segments
  }, [dreamAnalyses])
  
  // Transform data for Radial Chart
  const emotionRadialData = useMemo((): EmotionData[] => {
    if (!dreamAnalyses || dreamAnalyses.length === 0) return []
    
    const emotionCounts: Record<string, number> = {}
    const emotionIntensities: Record<string, number[]> = {}
    
    // Aggregate emotions across recent dreams
    dreamAnalyses.slice(0, 5).forEach(dream => {
      dream.emotionalTags.forEach(tag => {
        const emotion = tag.toLowerCase()
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
        if (!emotionIntensities[emotion]) emotionIntensities[emotion] = []
        emotionIntensities[emotion].push(dream.visualizationData.intensityScore)
      })
    })
    
    // Calculate average intensity for each emotion
    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: emotionIntensities[emotion].reduce((a, b) => a + b, 0) / emotionIntensities[emotion].length,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Top 8 emotions
  }, [dreamAnalyses])
  
  // Transform data for Stream Graph
  const emotionStreamData = useMemo((): EmotionTimePoint[] => {
    if (!dreamAnalyses || dreamAnalyses.length === 0) return []
    
    return dreamAnalyses.slice(0, 7).reverse().map(dream => {
      const emotions: Record<string, number> = {}
      dream.emotionalTags.forEach(tag => {
        const emotion = tag.toLowerCase()
        emotions[emotion] = dream.visualizationData.intensityScore
      })
      return {
        date: new Date(dream.analysisDate),
        emotions
      }
    })
  }, [dreamAnalyses])
  
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
    <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300 !py-0 !gap-0 card-fixed-layout">
      <div className="bg-gradient-to-br from-primary/5 to-transparent border-b">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 shrink-0">
                <Moon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{t("dream_analysis")}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t("dream_subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 shadow-sm">
              <Brain className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="text-xs font-medium text-indigo-500">AI-Powered</span>
            </div>
          </div>
        </CardHeader>
      </div>
      <CardContent className="p-6">
        <div className="grid gap-6">
          {/* Dream Entry Form */}
          <div className="p-4 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300">
            <Label htmlFor="dream-text" className="text-sm font-medium mb-2 block">
              {t("tell_dream")}
            </Label>
            <Textarea
              id="dream-text"
              placeholder={t("dream_placeholder")}
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
                  {t("analyzing")}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("analyze_dream")}
                </>
              )}
            </Button>
          </div>
          
          {chartData.length > 0 ? (
            <>
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit mx-auto overflow-x-auto">
                <button
                  onClick={() => setViewMode("d3timeline")}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    viewMode === "d3timeline" 
                      ? "bg-background shadow-sm text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Clock className="h-4 w-4 inline mr-2" />
                  D3 Timeline
                </button>
                <button
                  onClick={() => setViewMode("radial")}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    viewMode === "radial" 
                      ? "bg-background shadow-sm text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Radar className="h-4 w-4 inline mr-2" />
                  Radial
                </button>
                <button
                  onClick={() => setViewMode("stream")}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    viewMode === "stream" 
                      ? "bg-background shadow-sm text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Waves className="h-4 w-4 inline mr-2" />
                  Stream
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    viewMode === "timeline" 
                      ? "bg-background shadow-sm text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Clock className="h-4 w-4 inline mr-2" />
                  Basic Timeline
                </button>
                <button
                  onClick={() => setViewMode("graph")}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    viewMode === "graph" 
                      ? "bg-background shadow-sm text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TrendingUp className="h-4 w-4 inline mr-2" />
                  Graph
                </button>
              </div>

              {viewMode === "d3timeline" ? (
                /* D3 Timeline Visualization */
                <div className="p-4 rounded-2xl border bg-card/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Interactive Dream Stage Timeline (D3.js)</span>
                  </div>
                  {d3DreamSegments.length > 0 ? (
                    <D3DreamTimeline 
                      segments={d3DreamSegments} 
                      width={600} 
                      height={300}
                    />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                      No dream data available
                    </div>
                  )}
                </div>
              ) : viewMode === "radial" ? (
                /* Radial Chart Visualization */
                <div className="p-4 rounded-2xl border bg-card/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Radar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Emotional Intensity Radar (D3.js)</span>
                  </div>
                  {emotionRadialData.length > 0 ? (
                    <D3EmotionalRadialChart 
                      emotions={emotionRadialData}
                      width={400}
                      height={400}
                    />
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground text-sm">
                      No emotion data available
                    </div>
                  )}
                </div>
              ) : viewMode === "stream" ? (
                /* Stream Graph Visualization */
                <div className="p-4 rounded-2xl border bg-card/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Waves className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Emotional Flow Over Time (D3.js)</span>
                  </div>
                  {emotionStreamData.length > 0 ? (
                    <D3EmotionalStreamGraph 
                      data={emotionStreamData}
                      width={600}
                      height={300}
                    />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                      No historical data available
                    </div>
                  )}
                </div>
              ) : viewMode === "timeline" ? (
                /* Timeline Visualization */
                <div className="p-4 rounded-2xl border bg-card/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Dream Stage Timeline</span>
                  </div>
                  <DreamTimelineChart segments={dreamSegments} />
                </div>
              ) : (
                /* Original Graph View */
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-chart-1/10 to-chart-1/5 border border-chart-1/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-chart-1" />
                        <span className="text-xs font-medium text-muted-foreground">{t("valence_label")}</span>
                      </div>
                      <p className="text-2xl font-bold text-chart-1">{avgValence}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-chart-2/10 to-chart-2/5 border border-chart-2/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-chart-2" />
                        <span className="text-xs font-medium text-muted-foreground">{t("arousal_label")}</span>
                      </div>
                      <p className="text-2xl font-bold text-chart-2">{avgArousal}</p>
                    </div>
                  </div>
                  
                  {/* Chart */}
                  <div className="p-4 rounded-2xl border bg-card/50">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{t("recent_dreams")}</span>
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
                            dataKey="date" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis 
                            domain={[0, 1]} 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            ticks={[0, 0.25, 0.5, 0.75, 1]}
                          />
                          <ChartTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-md">
                                    <div className="text-xs font-medium mb-1">
                                      {payload[0].payload.fullDate}
                                    </div>
                                    {payload.map((entry: any, index: number) => (
                                      <div key={index} className="flex items-center gap-2 text-xs">
                                        <div 
                                          className={`h-2 w-2 rounded-full ${
                                            entry.dataKey === 'valence' ? 'bg-chart-1' : 'bg-chart-2'
                                          }`}
                                        />
                                        <span className="font-medium">{entry.name}:</span>
                                        <span>{entry.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                )
                              }
                              return null
                            }} 
                          />
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
              )}
            </>
          ) : (
            <div className="p-8 rounded-2xl border bg-card/50 text-center">
              <Moon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-1">{t("dream_empty_title")}</p>
              <p className="text-xs text-muted-foreground/70">{t("dream_empty_desc")}</p>
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
