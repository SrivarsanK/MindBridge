"use client"
import RecorderControl from "@/components/recorder-control"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Moon, TrendingUp, Brain } from "lucide-react"

const data = [
  { day: "Mon", valence: 0.3, arousal: 0.4 },
  { day: "Tue", valence: 0.45, arousal: 0.35 },
  { day: "Wed", valence: 0.5, arousal: 0.42 },
  { day: "Thu", valence: 0.38, arousal: 0.5 },
  { day: "Fri", valence: 0.52, arousal: 0.48 },
  { day: "Sat", valence: 0.48, arousal: 0.38 },
  { day: "Sun", valence: 0.55, arousal: 0.36 },
]

export default function DreamAnalysisCard() {
  const avgValence = (data.reduce((sum, d) => sum + d.valence, 0) / data.length).toFixed(2)
  const avgArousal = (data.reduce((sum, d) => sum + d.arousal, 0) / data.length).toFixed(2)
  
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
          {/* Recorder Control */}
          <div className="p-4 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300">
            <RecorderControl />
          </div>
          
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
              <span className="text-sm font-medium">7-Day Emotional Patterns</span>
            </div>
            <ChartContainer
              config={{
                valence: { label: "Valence", color: "hsl(var(--chart-1))" },
                arousal: { label: "Arousal", color: "hsl(var(--chart-2))" },
              }}
              className="h-[240px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
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
