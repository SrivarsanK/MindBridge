"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function Step4() {
  const [dreams, setDreams] = useState(true)
  const [peer, setPeer] = useState(false) // opt-in OFF by default
  const [anxiety, setAnxiety] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const router = useRouter()
  const createOrUpdateProfile = useMutation(api.users.createOrUpdateProfile)

  const handleFinish = async () => {
    setIsSaving(true)
    try {
      // Create user profile with privacy settings
      await createOrUpdateProfile({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        privacySettings: {
          allowPeerMatching: peer,
          allowDreamAnalysis: dreams,
          shareEmotionalPatterns: anxiety,
          dataRetentionDays: 90,
        }
      })
      
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating profile:", error)
      alert("Failed to complete onboarding. Please try again.")
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-semibold">Onboarding — Step 4/4</h1>
      <p className="text-sm text-muted-foreground mt-1">Choose focus areas (optional)</p>
      <div className="mt-6 grid gap-3">
        <label className="flex items-start gap-3">
          <Checkbox checked={anxiety} onCheckedChange={(v) => setAnxiety(!!v)} />
          <span className="text-sm">Anxiety support</span>
        </label>
        <label className="flex items-start gap-3">
          <Checkbox checked={dreams} onCheckedChange={(v) => setDreams(!!v)} />
          <span className="text-sm">Voice-recorded dream analysis</span>
        </label>
        <label className="flex items-start gap-3">
          <Checkbox checked={peer} onCheckedChange={(v) => setPeer(!!v)} />
          <span className="text-sm">Anonymous peer matching (18+, time windows, encrypted)</span>
        </label>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/onboarding/step-3")}>
          Back
        </Button>
        <Button onClick={handleFinish} disabled={isSaving}>
          {isSaving ? "Saving..." : "Finish"}
        </Button>
      </div>
    </div>
  )
}
