"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PseudonymAvatar from "@/components/pseudonym-avatar"
import { generatePseudonym } from "@/components/pseudonym-generator"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { User, Calendar, Users } from "lucide-react"

export default function Step2() {
  const router = useRouter()
  const [name, setName] = useState(generatePseudonym())
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "non-binary" | "prefer-not-to-say" | "other" | "">("")
  const [bio, setBio] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const createProfile = useMutation(api.users.createOrUpdateProfile)

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
        console.log(`[Step2] Auth not ready, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("Max retries exceeded");
  };

  const handleContinue = async () => {
    console.log('[Step2] handleContinue called');
    console.log('[Step2] Form data:', { name, age, gender });
    
    if (!name.trim()) {
      console.error('[Step2] Validation failed: name is empty');
      alert("Please enter a display name")
      return
    }

    setIsSubmitting(true)
    console.log('[Step2] Starting profile creation...');
    
    try {
      const profileData = {
        displayName: name,
        bio: bio || undefined,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      
      console.log('[Step2] Calling createProfile with:', profileData);
      
      // Use retry logic for authentication timing issues
      const result = await retryWithBackoff(() => createProfile(profileData));
      
      console.log('[Step2] Profile created successfully:', result);
      console.log('[Step2] Navigating to step 3...');
      router.push("/onboarding/step-3")
    } catch (error) {
      console.error("[Step2] Failed to save profile:", error)
      console.error("[Step2] Error type:", typeof error)
      console.error("[Step2] Error details:", JSON.stringify(error, null, 2))
      
      // Show a more detailed error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // Check if it's still an auth error after retries
      if (errorMessage.includes("Not authenticated") || errorMessage.includes("authentication")) {
        alert(`Authentication is taking longer than expected. Please try again in a moment, or refresh the page if the issue persists.`)
      } else {
        alert(`Failed to save profile: ${errorMessage}. Please try again.`)
      }
      
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Step 2 of 4</span>
              <span className="text-sm font-medium text-primary">50%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500" style={{ width: "50%" }} />
            </div>
          </div>

          {/* Main Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur-2xl opacity-20" />
            
            <div className="relative bg-card border border-primary/10 rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-primary/5 text-primary text-sm font-medium mb-4">
                  <User className="h-4 w-4" />
                  <span>Profile Setup</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                  Create Your Profile
                </h1>
                <p className="text-muted-foreground">
                  Choose a pseudonym and share some basic info. This helps us personalize your experience.
                </p>
              </div>

              {/* Avatar and Name */}
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-6">
                  <PseudonymAvatar name={name} size={80} />
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor="displayName" className="text-sm font-medium mb-2 block">
                        Display Name (Pseudonym)
                      </Label>
                      <Input 
                        id="displayName"
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Your pseudonym"
                        className="h-12"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setName(generatePseudonym())}
                      className="w-full sm:w-auto"
                    >
                      🎲 Generate Random Name
                    </Button>
                  </div>
                </div>

                {/* Age Input */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Age (Optional)
                  </Label>
                  <Input 
                    id="age"
                    type="number"
                    min="13"
                    max="120"
                    value={age} 
                    onChange={(e) => setAge(e.target.value)} 
                    placeholder="Enter your age"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps us provide age-appropriate support
                  </p>
                </div>

                {/* Gender Select */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Gender (Optional)
                  </Label>
                  <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    We respect all gender identities
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">
                    Short Bio (Optional)
                  </Label>
                  <Textarea 
                    id="bio"
                    value={bio} 
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setBio(e.target.value)
                      }
                    }} 
                    placeholder="Tell others a bit about yourself..."
                    className="min-h-[80px] resize-none"
                    maxLength={200}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      This will help others connect with you during peer matching
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {bio.length}/200
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">🔒 Privacy Note:</span> Your age and gender are optional and stored securely. This information helps us provide better peer matching and personalized support.
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/onboarding/step-1">
                    Back
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  onClick={handleContinue}
                  disabled={!name.trim() || isSubmitting}
                  className="min-w-32"
                >
                  {isSubmitting ? "Saving..." : "Continue"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
