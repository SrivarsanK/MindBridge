"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { Users, Lock, Search, MessageCircle, X, Loader2 } from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export default function PeerMatchingCard() {
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMood, setSelectedMood] = useState("neutral")
  const [lonelinessLevel, setLonelinessLevel] = useState(5)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  
  // Convex mutations and queries
  const currentUser = useQuery(api.auth.loggedInUser)
  const currentProfile = useQuery(api.users.getCurrentProfile)
  const updatePrivacy = useMutation(api.users.updatePrivacySettings)
  const createProfile = useMutation(api.users.createOrUpdateProfile)
  const requestMatch = useMutation(api.peerMatching.requestPeerMatch)
  const activeMatches = useQuery(api.peerMatching.getActiveMatches)
  const onlineStats = useQuery(api.peerMatching.getOnlineUsersStats)
  const endMatch = useMutation(api.peerMatching.endPeerMatch)
  const updateLastActive = useMutation(api.users.updateLastActive)
  
  const enabled = currentProfile?.privacySettings?.allowPeerMatching ?? false
  
  // Create profile if it doesn't exist (only after user is authenticated)
  useEffect(() => {
    // Only create profile if:
    // 1. User is authenticated (currentUser is not null and not undefined)
    // 2. Profile doesn't exist (currentProfile is null, not undefined which means loading)
    // 3. Not already creating profile
    if (currentUser && currentProfile === null && !isCreatingProfile) {
      setIsCreatingProfile(true)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      console.log("Creating profile for authenticated user...")
      createProfile({
        timezone,
        privacySettings: {
          allowPeerMatching: false,
          allowDreamAnalysis: true,
          shareEmotionalPatterns: false,
          dataRetentionDays: 90,
        }
      }).then(() => {
        console.log("Profile created successfully")
        setIsCreatingProfile(false)
      }).catch((error) => {
        console.error("Failed to create profile:", error)
        setIsCreatingProfile(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, currentProfile, isCreatingProfile])
  
  // Debug logging
  useEffect(() => {
    console.log("Auth state:", {
      currentUser: currentUser ? "authenticated" : currentUser === null ? "not authenticated" : "loading",
      currentProfile: currentProfile ? "exists" : currentProfile === null ? "missing" : "loading",
      isCreatingProfile
    })
  }, [currentUser, currentProfile, isCreatingProfile])
  
  // Update last active status periodically (only when authenticated)
  useEffect(() => {
    if (!currentUser) return
    
    const interval = setInterval(() => {
      updateLastActive().catch(err => console.error("Failed to update last active:", err))
    }, 60000) // Update every minute
    
    // Initial update
    updateLastActive().catch(err => console.error("Failed to update last active:", err))
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])
  
  const handleToggle = async (checked: boolean) => {
    if (!currentProfile) {
      console.error("No profile found")
      alert("Please wait while your profile is being created...")
      return
    }
    
    console.log("Toggling peer matching:", checked, "Current profile:", currentProfile)
    
    try {
      await updatePrivacy({
        privacySettings: {
          ...currentProfile.privacySettings,
          allowPeerMatching: checked
        }
      })
      console.log("Privacy settings updated successfully")
    } catch (error) {
      console.error("Error updating privacy settings:", error)
      alert(`Failed to update privacy settings: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
  
  const handleFindMatch = async () => {
    if (!enabled) return
    
    setIsSearching(true)
    
    try {
      await requestMatch({
        mood: selectedMood,
        lonelinessLevel,
        interests: ["general support", "listening", "conversation"]
      })
    } catch (error) {
      console.error("Error requesting match:", error)
      setIsSearching(false)
      alert(error instanceof Error ? error.message : "Failed to request peer match. Please check your privacy settings.")
    }
  }
  
  const handleEndMatch = async (matchId: Id<"peerMatches">) => {
    try {
      await endMatch({ matchId, reason: "User ended the conversation" })
    } catch (error) {
      console.error("Error ending match:", error)
      alert("Failed to end match")
    }
  }
  
  return (
    <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Peer Matching</CardTitle>
          </div>
          {/* Online Users Stats */}
          {onlineStats && (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-muted-foreground">
                  {onlineStats.onlineCount} Online
                </span>
              </div>
              {onlineStats.searchingCount > 0 && (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 text-orange-500 animate-spin" />
                  <span className="text-muted-foreground">
                    {onlineStats.searchingCount} Matching
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Anonymous & encrypted</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-4">
          {/* Toggle Section */}
          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-border bg-card/50 transition-all duration-300 hover:border-primary/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Enable matching</div>
                <div className="text-xs text-muted-foreground">
                  {isCreatingProfile ? "Setting up..." : "18+ only"}
                </div>
              </div>
            </div>
            <Switch 
              checked={enabled} 
              onCheckedChange={handleToggle} 
              aria-label="Enable peer matching"
              className="data-[state=checked]:bg-primary"
              disabled={!currentProfile || isCreatingProfile}
            />
          </div>
          
          {/* Active Matches */}
          {activeMatches && activeMatches.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Active Matches</div>
              {activeMatches.map((match) => (
                <div key={match._id} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Peer Connection</div>
                      <div className="text-xs text-muted-foreground">
                        {match.messageCount} messages • {match.iceBreaker}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEndMatch(match._id)}
                    className="h-8 px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* Info Badges */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">E2E Encrypted</span>
          </div>
          
          {/* Mood Selection (when enabled) */}
          {enabled && !isSearching && (!activeMatches || activeMatches.length === 0) && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">How are you feeling?</div>
              <div className="grid grid-cols-2 gap-2">
                {["neutral", "anxious", "low", "lonely"].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedMood === mood
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <span className="text-xs font-medium capitalize">{mood}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          {(!activeMatches || activeMatches.length === 0) && (
            <div className="grid gap-2">
              {isSearching ? (
                <Button 
                  disabled
                  className="w-full h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80"
                >
                  <Search className="h-4 w-4 mr-2 animate-pulse" />
                  Finding a match...
                </Button>
              ) : (
                <Button 
                  disabled={!enabled}
                  onClick={handleFindMatch}
                  className="w-full h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find a match
                </Button>
              )}
            </div>
          )}
          
          {/* Privacy Notice */}
          <div className="p-3 rounded-xl bg-muted/50 border">
            <p className="text-xs text-muted-foreground text-center">
              🔒 You can leave anytime. All chats are private.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
