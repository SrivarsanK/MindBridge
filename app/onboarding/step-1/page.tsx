"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

export default function Step1() {
  const [consent, setConsent] = useState(false)
  const [federated, setFederated] = useState(false)
  const [escalation, setEscalation] = useState(true)

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-semibold">Onboarding — Step 1/4</h1>
      <p className="text-sm text-muted-foreground mt-1">Privacy and consent</p>
      <div className="mt-6 grid gap-4">
        <label className="flex items-start gap-3">
          <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
          <span className="text-sm">I understand MindBridge processes data on-device.</span>
        </label>
        <label className="flex items-start gap-3">
          <Checkbox checked={federated} onCheckedChange={(v) => setFederated(!!v)} />
          <span className="text-sm">Opt in to federated learning (improve models without sharing raw data).</span>
        </label>
        <label className="flex items-start gap-3">
          <Checkbox checked={escalation} onCheckedChange={(v) => setEscalation(!!v)} />
          <span className="text-sm">Allow crisis escalation prompts when risk signals are detected.</span>
        </label>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/">Back</Link>
        </Button>
        <Button asChild disabled={!consent}>
          <Link href="/onboarding/step-2">Continue</Link>
        </Button>
      </div>
    </div>
  )
}
