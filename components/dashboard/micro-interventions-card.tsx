"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MicroInterventionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Micro‑interventions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button variant="outline">60s breathing</Button>
        <Button variant="outline">Grounding (5‑4‑3‑2‑1)</Button>
        <Button variant="outline">Brief reflection</Button>
      </CardContent>
    </Card>
  )
}
