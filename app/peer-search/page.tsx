"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/components/locale-provider"
import { generateKeyPair, exportPublicKey } from "@/lib/crypto"
import { 
  Search, 
  Users, 
  Heart, 
  MapPin, 
  Clock, 
  Sparkles, 
  Filter,
  X,
  Loader2,
  MessageCircle,
  Shield,
  Globe,
  Frown,
  CloudRain,
  Zap,
  Meh,
  Smile,
  HelpCircle,
  UserCircle2
} from "lucide-react"

const MOOD_OPTIONS = [
  { value: "anxious", label: "mood_anxious", icon: Zap },
  { value: "lonely", label: "mood_lonely", icon: CloudRain },
  { value: "stressed", label: "mood_stressed", icon: Frown },
  { value: "sad", label: "mood_sad", icon: Meh },
  { value: "hopeful", label: "mood_hopeful", icon: Smile },
  { value: "confused", label: "mood_confused", icon: HelpCircle },
]

const INTEREST_OPTIONS = [
  "interest_music", "interest_reading", "interest_gaming", "interest_sports", 
  "interest_art", "interest_coding", "interest_movies", "interest_travel", 
  "interest_cooking", "interest_photography", "interest_fitness", "interest_meditation",
  "interest_writing", "interest_dancing", "interest_nature", "interest_science", 
  "interest_fashion", "interest_volunteering"
]

export default function PeerSearchPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [lonelinessLevel, setLonelinessLevel] = useState<number>(5)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [encryptionInitialized, setEncryptionInitialized] = useState(false)
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null)
  const [userBio, setUserBio] = useState<string>("")
  const [isSavingBio, setIsSavingBio] = useState(false)

  const requestPeerMatch = useMutation(api.peerMatching.requestPeerMatch)
  const uploadPreKeys = useMutation(api.peerMatching.uploadPreKeys)
  const createDirectMatch = useMutation(api.peerMatching.createDirectPeerMatch)
  const activeMatches = useQuery(api.peerMatching.getActiveMatches)
  const availablePeers = useQuery(api.peerMatching.getAvailablePeers)
  const currentUser = useQuery(api.auth.loggedInUser)
  const currentProfile = useQuery(api.users.getCurrentProfile)
  const onlineStats = useQuery(api.peerMatching.getOnlineUsersStats)
  const updateProfile = useMutation(api.users.createOrUpdateProfile)

  // Initialize encryption keys on first load
  useEffect(() => {
    async function initializeEncryption() {
      if (!currentUser || encryptionInitialized) return

      try {
        // Check if keys already exist
        const hasKeys = localStorage.getItem(`encryption_initialized_${currentUser._id}`)
        if (hasKeys) {
          setEncryptionInitialized(true)
          return
        }

        // Generate identity key pair
        const identityKeyPair = await generateKeyPair()
        const identityPublicKey = await exportPublicKey(identityKeyPair.publicKey)

        // Generate signed pre-key
        const signedPreKeyPair = await generateKeyPair()
        const signedPreKeyPublic = await exportPublicKey(signedPreKeyPair.publicKey)

        // Generate one-time pre-keys (10 keys)
        const preKeys: string[] = []
        for (let i = 0; i < 10; i++) {
          const preKeyPair = await generateKeyPair()
          const preKeyPublic = await exportPublicKey(preKeyPair.publicKey)
          preKeys.push(preKeyPublic)
        }

        // Create signature (simplified - in production use proper signing)
        const preKeySignature = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(signedPreKeyPublic)
        ).then(buffer => btoa(String.fromCharCode(...new Uint8Array(buffer))))

        // Upload to server
        await uploadPreKeys({
          identityPublicKey,
          signedPreKeyPublic,
          preKeys,
          preKeySignature,
        })

        // Mark as initialized
        localStorage.setItem(`encryption_initialized_${currentUser._id}`, 'true')
        setEncryptionInitialized(true)
        console.log("✅ Encryption keys initialized successfully")
      } catch (error) {
        console.error("Failed to initialize encryption:", error)
      }
    }

    initializeEncryption()
  }, [currentUser, encryptionInitialized, uploadPreKeys])

  // Load user's existing bio
  useEffect(() => {
    if (currentProfile?.bio) {
      setUserBio(currentProfile.bio)
    }
  }, [currentProfile])

  // Save user bio
  const handleSaveBio = async () => {
    if (!currentProfile) return
    
    setIsSavingBio(true)
    try {
      await updateProfile({
        timezone: currentProfile.timezone,
        displayName: currentProfile.displayName,
        bio: userBio,
        age: currentProfile.age,
        gender: currentProfile.gender,
      })
      alert(t("bio_saved") || "Bio saved successfully!")
    } catch (error) {
      console.error("Failed to save bio:", error)
      alert(t("bio_save_failed") || "Failed to save bio")
    } finally {
      setIsSavingBio(false)
    }
  }

  const filteredInterests = INTEREST_OPTIONS.filter(interest =>
    t(interest).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  // Handle direct peer chat
  const handleDirectChat = async (targetUserId: any) => {
    try {
      setConnectingUserId(targetUserId)
      const result = await createDirectMatch({ targetUserId })
      
      if (result.success && result.matchId) {
        // Navigate to chat
        router.push(`/peer-chat/${result.matchId}`)
      }
    } catch (error) {
      console.error("Failed to create direct match:", error)
      alert(t("failed_peer_match") || "Failed to connect")
    } finally {
      setConnectingUserId(null)
    }
  }

  // Format time ago
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return t("just_now") || "Just now"
    if (seconds < 300) return t("few_minutes_ago") || "Few minutes ago"
    return t("recently_active") || "Recently active"
  }

  const handleSearch = async () => {
    if (!selectedMood) {
      alert(t("select_mood_first"))
      return
    }

    if (selectedInterests.length === 0) {
      alert(t("select_interest_first"))
      return
    }

    setIsSearching(true)
    try {
      const result = await requestPeerMatch({
        mood: selectedMood,
        lonelinessLevel,
        interests: selectedInterests,
      })
      
      console.log("🔍 Searching for peer match...")
      
      // Use activeMatches subscription to detect new matches
      let timeoutId: NodeJS.Timeout | null = null
      let attempts = 0
      const maxAttempts = 30 // 30 attempts * 2 seconds = 60 seconds

      const checkInterval = setInterval(() => {
        attempts++
        
        if (activeMatches && activeMatches.length > 0) {
          // Found a match!
          const latestMatch = activeMatches[activeMatches.length - 1]
          console.log("✅ Match found:", latestMatch._id)
          
          clearInterval(checkInterval)
          if (timeoutId) clearTimeout(timeoutId)
          setIsSearching(false)
          
          // Redirect to chat
          router.push(`/peer-chat/${latestMatch._id}`)
        } else if (attempts >= maxAttempts) {
          // Timeout
          console.log("⏱️ Match search timeout")
          clearInterval(checkInterval)
          setIsSearching(false)
          alert(t("no_matches_found"))
        } else {
          console.log(`⏳ Still searching... (${attempts}/${maxAttempts})`)
        }
      }, 2000)

      // Safety timeout
      timeoutId = setTimeout(() => {
        clearInterval(checkInterval)
        setIsSearching(false)
        console.log("🚫 Search timeout reached")
      }, 60000)
    } catch (error) {
      console.error("Error requesting peer match:", error)
      alert(t("failed_peer_match"))
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between pl-0 lg:pl-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/25">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{t("find_peer_title")}</h1>
                <p className="text-xs text-muted-foreground">{t("peer_anonymous_encrypted")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Online Stats */}
              {onlineStats && (
                <div className="hidden sm:flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {onlineStats.onlineCount} {t("online")}
                    </span>
                  </div>
                  {onlineStats.searchingCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                      <Loader2 className="h-3 w-3 text-orange-500 animate-spin" />
                      <span className="font-medium text-orange-700 dark:text-orange-400">
                        {onlineStats.searchingCount} {t("searching_status")}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                {t("back")}
              </Button>
            </div>
          </div>
          
          {/* Mobile Stats */}
          {onlineStats && (
            <div className="flex sm:hidden items-center gap-2 mt-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium text-green-700 dark:text-green-400">
                  {onlineStats.onlineCount} {t("online_text")}
                </span>
              </div>
              {onlineStats.searchingCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <Loader2 className="h-3 w-3 text-orange-500 animate-spin" />
                  <span className="font-medium text-orange-700 dark:text-orange-400">
                    {onlineStats.searchingCount} {t("searching_text")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Stats Banner */}
        {onlineStats && (
          <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 animate-in fade-in slide-in-from-top-2 duration-500">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("community_status")}</p>
                    <p className="text-xs text-muted-foreground">{t("realtime_availability")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                  <div className="text-center p-2.5 rounded-lg bg-card/50 border">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {onlineStats.onlineCount}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("users_online")}</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-card/50 border">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Loader2 className="h-3 w-3 text-orange-500 animate-spin" />
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {onlineStats.searchingCount}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("in_search_queue")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy Notice */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-start gap-2.5">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{t("privacy_protected")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("privacy_protected_desc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Search Panel */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Browse Available Peers */}
            {availablePeers && availablePeers.length > 0 && (
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {t("available_peers_title") || "Available Peers"}
                      </CardTitle>
                      <CardDescription>
                        {t("available_peers_desc") || "Connect directly with available peers"}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {availablePeers.length} {t("online_text") || "online"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
                    {availablePeers.map((peer: any) => (
                      <div
                        key={peer.userId}
                        className="p-2 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          {/* Peer Avatar & Name */}
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {peer.displayName ? peer.displayName[0].toUpperCase() : "A"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <h3 className="font-medium text-xs truncate">
                                  {peer.displayName || "Anonymous User"}
                                </h3>
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0"></div>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                {peer.age && (
                                  <span>{peer.age}y</span>
                                )}
                                {peer.age && <span>•</span>}
                                <span>{formatTimeAgo(peer.lastActive)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Bio */}
                          {peer.bio && peer.bio !== "No bio yet" ? (
                            <div className="p-1.5 rounded bg-muted/30">
                              <p className="text-[10px] text-muted-foreground italic line-clamp-2 leading-snug">
                                "{peer.bio}"
                              </p>
                            </div>
                          ) : null}

                          {/* Timezone */}
                          {peer.timezone && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <MapPin className="h-2.5 w-2.5" />
                              <span className="truncate">{peer.timezone.replace(/_/g, ' ')}</span>
                            </div>
                          )}
                        </div>

                        {/* Chat Button */}
                        <Button
                          onClick={() => handleDirectChat(peer.userId)}
                          disabled={connectingUserId === peer.userId}
                          className="w-full h-7 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-sm text-[10px]"
                          size="sm"
                        >
                          {connectingUserId === peer.userId ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {t("connecting") || "Connecting..."}
                            </>
                          ) : (
                            <>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              {t("chat_button") || "Chat"}
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Divider */}
            {availablePeers && availablePeers.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-muted-foreground">
                    {t("or_algorithm_match") || "Or use algorithm matching"}
                  </span>
                </div>
              </div>
            )}

            {/* User Bio Section */}
            <Card className="min-w-0 border-accent/20 bg-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCircle2 className="h-5 w-5 text-primary" />
                  {t("your_profile") || "Your Profile"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("profile_description") || "Share a bit about yourself to help others connect with you"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="userBio" className="text-sm">
                    {t("bio_label") || "Bio"} ({userBio.length}/200)
                  </Label>
                  <textarea
                    id="userBio"
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value.slice(0, 200))}
                    placeholder={t("bio_placeholder") || "e.g., I enjoy reading and gaming. Looking for someone to talk about daily life and share experiences..."}
                    className="w-full min-h-[80px] p-2.5 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("bio_tip") || "💡 Be genuine! Avoid sharing personal details like full name, address, or contact info."}
                  </p>
                </div>
                <Button
                  onClick={handleSaveBio}
                  disabled={isSavingBio || !userBio.trim()}
                  className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white"
                  size="sm"
                >
                  {isSavingBio ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("saving") || "Saving..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t("save_profile") || "Save Profile"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Mood Selection */}
            <Card className="min-w-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-5 w-5 text-primary" />
                  {t("how_feeling")}
                </CardTitle>
                <CardDescription className="text-xs">{t("select_mood_desc")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {MOOD_OPTIONS.map((mood) => {
                    const IconComponent = mood.icon
                    return (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                          selectedMood === mood.value
                            ? `border-primary bg-primary/10 shadow-lg`
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <IconComponent className="w-6 h-6" />
                          <p className="text-xs font-medium text-center">{t(mood.label)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Loneliness Level */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-5 w-5 text-primary" />
                  {t("connection_need_level")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("connection_need_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("just_browsing")}</span>
                    <span className="text-2xl font-bold text-primary">{lonelinessLevel}</span>
                    <span className="text-sm text-muted-foreground">{t("really_need_someone")}</span>
                  </div>
                  <Label htmlFor="loneliness-slider" className="sr-only">
                    Connection need level slider from 1 to 10
                  </Label>
                  <input
                    id="loneliness-slider"
                    type="range"
                    min="1"
                    max="10"
                    value={lonelinessLevel}
                    onChange={(e) => setLonelinessLevel(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    aria-label="Connection need level"
                  />
                  <div className="grid grid-cols-10 gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all ${
                          i < lonelinessLevel ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests Selection */}
            <Card className="min-w-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-5 w-5 text-primary" />
                      {t("interests_title")}
                    </CardTitle>
                    <CardDescription className="text-xs">{t("interests_desc")}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? t("hide") : t("show")} {t("search_text")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Search Bar */}
                {showFilters && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("search_interests")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}

                {/* Selected Interests */}
                {selectedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                    {selectedInterests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="px-2.5 py-1 gap-1 cursor-pointer hover:bg-destructive/20 text-xs"
                        onClick={() => toggleInterest(interest)}
                      >
                        {t(interest)}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Interest Options */}
                <div className="flex flex-wrap gap-2">
                  {filteredInterests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      className="px-2.5 py-1 cursor-pointer hover:scale-105 transition-transform text-xs">
                      {t(interest)}
                    </Badge>
                  ))}
                </div>

                {filteredInterests.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("no_interests_match")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={isSearching || !selectedMood || selectedInterests.length === 0}
              className="w-full h-12 text-base font-semibold bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
              {isSearching ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {t("searching_peer")}
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  {t("find_peer_connection")}
                </>
              )}
            </Button>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4 min-w-0">
            {/* Active Matches */}
            <Card className="min-w-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  {t("active_matches_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {activeMatches && activeMatches.length > 0 ? (
                  <div className="space-y-2">
                    {activeMatches.map((match: any) => (
                      <div
                        key={match._id}
                        className="p-2.5 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium">{t("anonymous_peer")}</span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(match.matchScore * 100)}{t("percent_match")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {match.iceBreaker}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          <span>{match.messageCount} {t("messages")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("no_active_matches")}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("start_search")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card className="min-w-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("matching_tips")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("tip_honest")}</p>
                    <p className="text-xs text-muted-foreground">{t("tip_honest_desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("tip_interests")}</p>
                    <p className="text-xs text-muted-foreground">{t("tip_interests_desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("tip_available")}</p>
                    <p className="text-xs text-muted-foreground">{t("tip_available_desc")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="border-yellow-500/20 bg-yellow-500/5 min-w-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  {t("safety_first")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1.5 text-xs text-muted-foreground">
                <p>• {t("safety_no_personal_info")}</p>
                <p>• {t("safety_report_behavior")}</p>
                <p>• {t("safety_end_anytime")}</p>
                <p>• {t("safety_crisis_support")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
