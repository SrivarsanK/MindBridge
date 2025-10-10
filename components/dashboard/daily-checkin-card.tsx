"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMood } from "@/components/mood-provider"
import { Button } from "@/components/ui/button"

export default function DailyCheckinCard() {
  const { mood, setMood } = useMood()
  const moods = ["neutral", "anxious", "low", "lonely"] as const
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily check-in</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => (
            <Button
              key={m}
              variant={mood === m ? "default" : "outline"}
              onClick={() => setMood(m as any)}
              className="capitalize"
            >
              {m}
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">Your UI adapts gently to your state.</div>
      </CardContent>
    </Card>
  )
}
