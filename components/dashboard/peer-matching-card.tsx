"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Users, Lock, Search, MessageCircle, X, Loader2, Sparkles, UserPlus, Clock } from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useRouter } from "next/navigation"
import { useLocale } from "@/components/locale-provider"

export default function PeerMatchingCard() {
  const { t } = useLocale()
  const router = useRouter()
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMood, setSelectedMood] = useState("neutral")
  const [lonelinessLevel, setLonelinessLevel] = useState(5)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [showOpenMatchDialog, setShowOpenMatchDialog] = useState(false)
  const [matchDescription, setMatchDescription] = useState("")
  
  // Convex mutations and queries
  const currentUser = useQuery(api.auth.loggedInUser)
  const currentProfile = useQuery(api.users.getCurrentProfile)
  const updatePrivacy = useMutation(api.users.updatePrivacySettings)
  const createProfile = useMutation(api.users.createOrUpdateProfile)
  const requestMatch = useMutation(api.peerMatching.requestPeerMatch)
  const createOpenMatch = useMutation(api.peerMatching.createOpenMatch)
  const activeMatches = useQuery(api.peerMatching.getActiveMatches)
  const pendingMatches = useQuery(api.peerMatching.getPendingMatches)
  const joinMatch = useMutation(api.peerMatching.joinPendingMatch)
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

  const handleCreateOpenMatch = async () => {
    if (!enabled || !matchDescription.trim()) return
    
    try {
      const result = await createOpenMatch({
        mood: selectedMood,
        lonelinessLevel,
        interests: ["general support", "listening", "conversation"],
        description: matchDescription.trim(),
      })
      
      if (result.success) {
        setShowOpenMatchDialog(false)
        setMatchDescription("")
        // Navigate to the chat
        router.push(`/peer-chat/${result.matchId}`)
      }
    } catch (error) {
      console.error("Error creating open match:", error)
      alert(error instanceof Error ? error.message : "Failed to create open match")
    }
  }

  const handleJoinMatch = async (matchId: Id<"peerMatches">) => {
    try {
      const result = await joinMatch({ matchId })
      if (result.success) {
        router.push(`/peer-chat/${matchId}`)
      }
    } catch (error) {
      console.error("Error joining match:", error)
      alert(error instanceof Error ? error.message : "Failed to join match")
    }
  }
  
  return (
      <Card className="flex flex-col overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300 card-fixed-layout">
      <div className="bg-gradient-to-br from-primary/5 to-transparent border-b flex-shrink-0">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20 flex-shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">{t("peer_matching")}</CardTitle>
            </div>
            {/* Online Users Stats */}
            {onlineStats && (
              <div className="flex flex-wrap items-center gap-2 text-xs flex-shrink-0">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></div>
                  <span className="text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                    {onlineStats.onlineCount} {t("online_users")}
                  </span>
                </div>
                {onlineStats.searchingCount > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 flex-shrink-0">
                    <Loader2 className="h-2.5 w-2.5 text-orange-500 animate-spin flex-shrink-0" />
                    <span className="text-orange-600 dark:text-orange-400 font-medium whitespace-nowrap">
                      {onlineStats.searchingCount} {t("searching_peer")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t("peer_subtitle")}</p>
        </CardHeader>
      </div>
      <CardContent className="flex-1 p-4 flex flex-col">
        <div className="flex flex-col gap-3 h-full">
          {/* Toggle Section */}
          <div className="flex items-center justify-between p-3 rounded-2xl border-2 border-border bg-card/50 transition-all duration-300 hover:border-primary/30 hover:shadow-md flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20 flex-shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="text-sm font-medium">{t("enable_peer")}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {isCreatingProfile ? "Setting up..." : t("peer_disabled")}
                </div>
              </div>
            </div>
            <Switch 
              checked={enabled} 
              onCheckedChange={handleToggle} 
              aria-label="Enable peer matching"
              className="data-[state=checked]:bg-primary flex-shrink-0"
              disabled={!currentProfile || isCreatingProfile}
            />
          </div>
          
          {/* Active Matches */}
          {activeMatches && activeMatches.length > 0 && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="text-sm font-medium text-muted-foreground">{t("active_chats")}</div>
              {activeMatches.map((match) => (
                <div key={match._id} className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group">
                  <button
                    onClick={() => router.push(`/peer-chat/${match._id}`)}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20 flex-shrink-0">
                      {match.isPending ? <Clock className="h-4 w-4 text-white" /> : <MessageCircle className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {match.peerDisplayName}
                        {match.isPending && <span className="ml-2 text-xs text-orange-500">(Waiting)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {match.description || match.iceBreaker || "Start chatting"}
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEndMatch(match._id)
                    }}
                    className="h-8 w-8 p-0 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Available Pending Matches */}
          {enabled && pendingMatches && pendingMatches.length > 0 && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Available Recovery Partners
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {pendingMatches.map((match) => (
                  <div key={match._id} className="flex items-start justify-between p-2.5 rounded-xl bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-colors group">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{match.creatorDisplayName}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {match.description}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {match.timeAgo}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleJoinMatch(match._id)}
                      className="ml-2 flex-shrink-0 h-8 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Info Badges */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm flex-shrink-0">
            <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20 flex-shrink-0">
              <Lock className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-medium text-primary">E2E Encrypted</span>
          </div>
          
          {/* Mood Selection (when enabled) */}
          {enabled && !isSearching && (!activeMatches || activeMatches.length === 0) && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="text-sm font-medium text-muted-foreground">How are you feeling?</div>
              <div className="grid grid-cols-2 gap-2">
                {["Neutral", "Anxious", "Low", "Lonely"].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood.toLowerCase())}
                    className={`flex items-center justify-center p-2.5 rounded-xl border-2 transition-all shadow-sm ${
                      selectedMood === mood.toLowerCase()
                        ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-primary/20"
                        : "border-border bg-card hover:border-primary/30 hover:shadow-md"
                    }`}
                  >
                    <span className="text-sm font-medium">{mood}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          {(!activeMatches || activeMatches.length === 0) && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              {isSearching ? (
                <Button 
                  disabled
                  className="w-full h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center gap-2">
                  <Search className="h-4 w-4 animate-pulse text-white" />
                  <span>{t("searching_peer")}</span>
                </Button>
              ) : (
                <>
                  <Button 
                    disabled={!enabled}
                    onClick={() => setShowOpenMatchDialog(true)}
                    className="w-full h-11 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-600/20 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4 text-white" />
                    <span>Find Recovery Partner</span>
                  </Button>
                  <Button 
                    disabled={!enabled}
                    onClick={handleFindMatch}
                    className="w-full h-9 rounded-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2">
                    <Search className="h-4 w-4 text-white" />
                    <span>{t("find_peer")}</span>
                  </Button>
                  <Button 
                    variant="outline"
                    disabled={!enabled}
                    onClick={() => router.push("/peer-search")}
                    className="w-full h-9 rounded-2xl border-primary/20 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Advanced Search</span>
                  </Button>
                </>
              )}
            </div>
          )}
          
          {/* Privacy Notice */}
          <div className="flex items-center justify-center p-2.5 rounded-xl bg-muted/50 border flex-shrink-0">
            <p className="text-xs text-muted-foreground text-center">
              🔒 You can leave anytime. All chats are private.
            </p>
          </div>
        </div>
      </CardContent>

      {/* Open Match Dialog */}
      <Dialog open={showOpenMatchDialog} onOpenChange={setShowOpenMatchDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-600" />
              Create Open Recovery Match
            </DialogTitle>
            <DialogDescription>
              Create an open chat where others can join. Describe what you're looking for help with.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Mood Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">How are you feeling?</label>
              <div className="grid grid-cols-2 gap-2">
                {["Neutral", "Anxious", "Low", "Lonely"].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood.toLowerCase())}
                    className={`flex items-center justify-center p-2.5 rounded-xl border-2 transition-all shadow-sm ${
                      selectedMood === mood.toLowerCase()
                        ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-primary/20"
                        : "border-border bg-card hover:border-primary/30 hover:shadow-md"
                    }`}
                  >
                    <span className="text-sm font-medium">{mood}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">What are you looking for help with?</label>
              <Textarea
                value={matchDescription}
                onChange={(e) => setMatchDescription(e.target.value)}
                placeholder="E.g., 'Need someone to talk to about anxiety', 'Looking for peer support during recovery', 'Want to chat with someone who understands'..."
                className="min-h-[100px] resize-none"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {matchDescription.length}/200 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowOpenMatchDialog(false)
                setMatchDescription("")
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOpenMatch}
              disabled={!matchDescription.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Open Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
