"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import PseudonymAvatar from "@/components/pseudonym-avatar"
import { generatePseudonym } from "@/components/pseudonym-generator"

export default function Step2() {
  const [name, setName] = useState(generatePseudonym())
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-semibold">Onboarding — Step 2/4</h1>
      <p className="text-sm text-muted-foreground mt-1">Choose a pseudonym and avatar</p>
      <div className="mt-6 flex items-center gap-4">
        <PseudonymAvatar name={name} size={56} />
        <div className="flex-1 grid gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Pseudonym" />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setName(generatePseudonym())}>
              Randomize
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/onboarding/step-1">Back</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/step-3">Continue</Link>
        </Button>
      </div>
    </div>
  )
}
