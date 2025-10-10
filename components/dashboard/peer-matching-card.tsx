"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export default function PeerMatchingCard() {
  const [enabled, setEnabled] = useState(false)
  const [hours, setHours] = useState({ start: "08:00", end: "22:00" })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anonymous peer matching</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-center justify-between">
          <div className="text-sm">Enable matching (18+)</div>
          <Switch checked={enabled} onCheckedChange={(v) => setEnabled(!!v)} aria-label="Enable peer matching" />
        </div>
        <div className="text-xs text-muted-foreground">
          End-to-end encrypted. You can leave anytime. Availability window: {hours.start}–{hours.end}.
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent" disabled={!enabled}>
            Adjust hours
          </Button>
          <Button className="flex-1" disabled={!enabled}>
            Find match
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
