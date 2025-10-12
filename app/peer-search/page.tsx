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
  HelpCircle
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

  const requestPeerMatch = useMutation(api.peerMatching.requestPeerMatch)
  const activeMatches = useQuery(api.peerMatching.getActiveMatches)
  const currentUser = useQuery(api.auth.loggedInUser)
  const onlineStats = useQuery(api.peerMatching.getOnlineUsersStats)

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
      
      // Poll for match result
      // In a real app, use a subscription or webhook
      const checkForMatch = setInterval(async () => {
        const matches = activeMatches
        if (matches && matches.length > 0) {
          const latestMatch = matches[0]
          clearInterval(checkForMatch)
          setIsSearching(false)
          // Redirect to chat
          router.push(`/peer-chat/${latestMatch._id}`)
        }
      }, 2000)

      // Timeout after 60 seconds
      setTimeout(() => {
        clearInterval(checkForMatch)
        setIsSearching(false)
        alert(t("no_matches_found"))
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

      <div className="flex-1 flex flex-col mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Stats Banner */}
        {onlineStats && (
          <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 animate-in fade-in slide-in-from-top-2 duration-500">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("community_status")}</p>
                    <p className="text-xs text-muted-foreground">{t("realtime_availability")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                  <div className="text-center p-3 rounded-lg bg-card/50 border">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {onlineStats.onlineCount}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("users_online")}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-card/50 border">
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
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
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
          <div className="lg:col-span-2 space-y-6">
            {/* Mood Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  {t("how_feeling")}
                </CardTitle>
                <CardDescription>{t("select_mood_desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MOOD_OPTIONS.map((mood) => {
                    const IconComponent = mood.icon
                    return (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                          selectedMood === mood.value
                            ? `border-primary bg-primary/10 shadow-lg`
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <IconComponent className="w-8 h-8" />
                          <p className="text-sm font-medium text-center">{t(mood.label)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Loneliness Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  {t("connection_need_level")}
                </CardTitle>
                <CardDescription>
                  {t("connection_need_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      {t("interests_title")}
                    </CardTitle>
                    <CardDescription>{t("interests_desc")}</CardDescription>
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
              <CardContent className="space-y-4">
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
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    {selectedInterests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="px-3 py-1 gap-1 cursor-pointer hover:bg-destructive/20"
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
                      className="px-3 py-1.5 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleInterest(interest)}
                    >
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
              className="w-full h-14 text-lg font-semibold bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
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
          <div className="space-y-6">
            {/* Active Matches */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  {t("active_matches_title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeMatches && activeMatches.length > 0 ? (
                  <div className="space-y-3">
                    {activeMatches.map((match: any) => (
                      <div
                        key={match._id}
                        className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                        onClick={() => router.push(`/peer-chat/${match._id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{t("anonymous_peer")}</span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(match.matchScore * 100)}{t("percent_match")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {match.iceBreaker}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          <span>{match.messageCount} {t("messages")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("no_active_matches")}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("start_search")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("matching_tips")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("tip_honest")}</p>
                    <p className="text-xs text-muted-foreground">{t("tip_honest_desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("tip_interests")}</p>
                    <p className="text-xs text-muted-foreground">{t("tip_interests_desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("tip_available")}</p>
                    <p className="text-xs text-muted-foreground">{t("tip_available_desc")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  {t("safety_first")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
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
