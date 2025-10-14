"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuthActions } from "@convex-dev/auth/react"

export default function Step4() {
  const [dreams, setDreams] = useState(true)
  const [peer, setPeer] = useState(false) // opt-in OFF by default
  const [anxiety, setAnxiety] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  
  const router = useRouter()
  const { signIn } = useAuthActions()
  const currentUser = useQuery(api.auth.loggedInUser)
  const createOrUpdateProfile = useMutation(api.users.createOrUpdateProfile)

  // Auto sign-in anonymous users when component mounts
  useEffect(() => {
    if (currentUser === null && !isAuthenticating) {
      setIsAuthenticating(true)
      signIn("anonymous").catch((error) => {
        console.error("Failed to sign in anonymously:", error)
        setIsAuthenticating(false)
      })
    } else if (currentUser) {
      setIsAuthenticating(false)
    }
  }, [currentUser, signIn, isAuthenticating])

  // Retry helper with exponential backoff for auth timing issues
  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 500
  ): Promise<T> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const isAuthError = error instanceof Error && 
          (error.message.includes("Not authenticated") || 
           error.message.includes("authentication"));
        
        const isLastAttempt = attempt === maxRetries - 1;
        
        if (!isAuthError || isLastAttempt) {
          throw error; // Re-throw if not auth error or last attempt
        }
        
        // Wait with exponential backoff before retry
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`[Step4] Auth not ready, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("Max retries exceeded");
  };

  const handleFinish = async () => {
    // Ensure user is authenticated before saving
    if (!currentUser) {
      alert("Please wait while we set up your account...")
      return
    }

    setIsSaving(true)
    try {
      // Create user profile with privacy settings - use retry logic
      await retryWithBackoff(() => 
        createOrUpdateProfile({
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          privacySettings: {
            allowPeerMatching: peer,
            allowDreamAnalysis: dreams,
            shareEmotionalPatterns: anxiety,
            dataRetentionDays: 90,
          }
        })
      );
      
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating profile:", error)
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // Check if it's still an auth error after retries
      if (errorMessage.includes("Not authenticated") || errorMessage.includes("authentication")) {
        alert("Authentication is taking longer than expected. Please try again in a moment, or refresh the page if the issue persists.")
      } else {
        alert("Failed to complete onboarding. Please try again.")
      }
      
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-semibold">Onboarding — Step 4/4</h1>
      <p className="text-sm text-muted-foreground mt-1">Choose focus areas (optional)</p>
      
      {/* Authentication Status */}
      {isAuthenticating && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Setting up your account securely...</span>
          </div>
        </div>
      )}
      
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
        <Button onClick={handleFinish} disabled={isSaving || isAuthenticating || !currentUser}>
          {isAuthenticating ? "Setting up..." : isSaving ? "Saving..." : "Finish"}
        </Button>
      </div>
    </div>
  )
}
