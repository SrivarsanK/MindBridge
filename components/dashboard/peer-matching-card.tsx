"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { Users, Lock, Clock, Search, Settings } from "lucide-react"

export default function PeerMatchingCard() {
  const [enabled, setEnabled] = useState(false)
  const [hours, setHours] = useState({ start: "08:00", end: "22:00" })
  
  return (
    <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Peer Matching</CardTitle>
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
                <div className="text-xs text-muted-foreground">18+ only</div>
              </div>
            </div>
            <Switch 
              checked={enabled} 
              onCheckedChange={(v) => setEnabled(!!v)} 
              aria-label="Enable peer matching"
              className="data-[state=checked]:bg-primary"
            />
          </div>
          
          {/* Info Badges */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">E2E Encrypted</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">{hours.start}–{hours.end}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid gap-2">
            <Button 
              disabled={!enabled}
              className="w-full h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="h-4 w-4 mr-2" />
              Find a match
            </Button>
            <Button 
              variant="outline" 
              disabled={!enabled}
              className="w-full h-10 rounded-2xl transition-all hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Settings className="h-4 w-4 mr-2" />
              Adjust hours
            </Button>
          </div>
          
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
