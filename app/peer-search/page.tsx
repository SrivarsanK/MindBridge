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
  Globe
} from "lucide-react"

const MOOD_OPTIONS = [
  { value: "anxious", label: "Anxious", color: "bg-orange-500" },
  { value: "lonely", label: "Lonely", color: "bg-blue-500" },
  { value: "stressed", label: "Stressed", color: "bg-red-500" },
  { value: "sad", label: "Sad", color: "bg-purple-500" },
  { value: "hopeful", label: "Hopeful", color: "bg-green-500" },
  { value: "confused", label: "Confused", color: "bg-yellow-500" },
]

const INTEREST_OPTIONS = [
  "Music", "Reading", "Gaming", "Sports", "Art", "Coding",
  "Movies", "Travel", "Cooking", "Photography", "Fitness", "Meditation",
  "Writing", "Dancing", "Nature", "Science", "Fashion", "Volunteering"
]

export default function PeerSearchPage() {
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
    interest.toLowerCase().includes(searchQuery.toLowerCase())
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
      alert("Please select your current mood")
      return
    }

    if (selectedInterests.length === 0) {
      alert("Please select at least one interest")
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
        alert("No matches found. Please try again later.")
      }, 60000)
    } catch (error) {
      console.error("Error requesting peer match:", error)
      alert("Failed to request peer match. Please try again.")
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between pl-0 lg:pl-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Find a Peer</h1>
                <p className="text-xs text-muted-foreground">Anonymous & encrypted connections</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Online Stats */}
              {onlineStats && (
                <div className="hidden sm:flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {onlineStats.onlineCount} Online
                    </span>
                  </div>
                  {onlineStats.searchingCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                      <Loader2 className="h-3 w-3 text-orange-500 animate-spin" />
                      <span className="font-medium text-orange-700 dark:text-orange-400">
                        {onlineStats.searchingCount} Searching
                      </span>
                    </div>
                  )}
                </div>
              )}
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                Back
              </Button>
            </div>
          </div>
          
          {/* Mobile Stats */}
          {onlineStats && (
            <div className="flex sm:hidden items-center gap-2 mt-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium text-green-700 dark:text-green-400">
                  {onlineStats.onlineCount} Online
                </span>
              </div>
              {onlineStats.searchingCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <Loader2 className="h-3 w-3 text-orange-500 animate-spin" />
                  <span className="font-medium text-orange-700 dark:text-orange-400">
                    {onlineStats.searchingCount} Searching
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
                    <p className="text-sm font-medium">Community Status</p>
                    <p className="text-xs text-muted-foreground">Real-time peer availability</p>
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
                    <p className="text-xs text-muted-foreground">Users Online</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-card/50 border">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Loader2 className="h-3 w-3 text-orange-500 animate-spin" />
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {onlineStats.searchingCount}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">In Search Queue</p>
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
                <p className="text-sm font-medium">Your Privacy is Protected</p>
                <p className="text-xs text-muted-foreground">
                  All conversations are encrypted end-to-end. Your identity remains anonymous. 
                  Connections are based on mood compatibility and shared interests.
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
                  How are you feeling?
                </CardTitle>
                <CardDescription>Select your current mood to find compatible peers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        selectedMood === mood.value
                          ? `border-primary bg-primary/10 shadow-lg`
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full ${mood.color} mx-auto mb-2`} />
                      <p className="text-sm font-medium text-center">{mood.label}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Loneliness Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Connection Need Level
                </CardTitle>
                <CardDescription>
                  How much do you need to connect right now? (1-10)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Just browsing</span>
                    <span className="text-2xl font-bold text-primary">{lonelinessLevel}</span>
                    <span className="text-sm text-muted-foreground">Really need someone</span>
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
                      Your Interests
                    </CardTitle>
                    <CardDescription>Select topics you'd like to talk about</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? "Hide" : "Show"} Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Bar */}
                {showFilters && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search interests..."
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
                        {interest}
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
                      {interest}
                    </Badge>
                  ))}
                </div>

                {filteredInterests.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No interests found matching "{searchQuery}"
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={isSearching || !selectedMood || selectedInterests.length === 0}
              className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Finding Your Perfect Match...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Find a Peer Connection
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
                  Active Connections
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
                          <span className="text-sm font-medium">Anonymous Peer</span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(match.matchScore * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {match.iceBreaker}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          <span>{match.messageCount} messages</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No active connections yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start searching to connect with peers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How Peer Matching Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Share Your Mood</p>
                    <p className="text-xs text-muted-foreground">Tell us how you're feeling</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Finds Matches</p>
                    <p className="text-xs text-muted-foreground">Based on mood & interests</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Start Chatting</p>
                    <p className="text-xs text-muted-foreground">Anonymous & encrypted</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  Safety First
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>• Never share personal information</p>
                <p>• Report inappropriate behavior</p>
                <p>• You can end conversations anytime</p>
                <p>• Crisis support available 24/7</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
