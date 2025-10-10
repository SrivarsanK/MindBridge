"use client"
import RecorderControl from "@/components/recorder-control"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dream analysis</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <RecorderControl />
        <ChartContainer
          config={{
            valence: { label: "Valence", color: "hsl(var(--chart-1))" },
            arousal: { label: "Arousal", color: "hsl(var(--chart-2))" },
          }}
          className="h-[220px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 1]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="valence" stroke="var(--color-valence)" dot={false} />
              <Line type="monotone" dataKey="arousal" stroke="var(--color-arousal)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <p className="text-xs text-muted-foreground">
          Emotional patterns are computed on-device from your dream notes.
        </p>
      </CardContent>
    </Card>
  )
}
