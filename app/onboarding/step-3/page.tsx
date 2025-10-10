"use client"
import { useMood } from "@/components/mood-provider"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Step3() {
  const { mood, setMood } = useMood()
  const moods: Array<{ key: any; label: string }> = [
    { key: "neutral", label: "Neutral" },
    { key: "anxious", label: "Anxious" },
    { key: "low", label: "Low" },
    { key: "lonely", label: "Lonely" },
  ]
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-semibold">Onboarding — Step 3/4</h1>
      <p className="text-sm text-muted-foreground mt-1">How are you feeling today?</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {moods.map((m) => (
          <button
            key={m.key}
            onClick={() => setMood(m.key)}
            className={`rounded-lg border px-4 py-6 text-center text-sm ${mood === m.key ? "border-primary ring-2 ring-primary/40" : "hover:border-primary/40"}`}
            aria-pressed={mood === m.key}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/onboarding/step-2">Back</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/step-4">Continue</Link>
        </Button>
      </div>
    </div>
  )
}
