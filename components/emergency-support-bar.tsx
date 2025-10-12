"use client"
import { INDIA_EMERGENCY } from "@/lib/emergency"
import { AlertCircle, X, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export default function EmergencySupportBar() {
  const [isExpanded, setIsExpanded] = useState(true)

  // Bubble state - when closed, shows as floating bubble with theme color
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 z-50 group"
        aria-label="Open emergency support"
      >
        <div className="relative h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center">
          <Phone className="h-6 w-6 group-hover:animate-pulse" />
          {/* Red badge with notification */}
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full animate-pulse"
          >
            !
          </Badge>
        </div>
      </button>
    )
  }

  return (
    <div
      role="region"
      aria-label="Emergency support"
      className="sticky bottom-0 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-all duration-300 animate-in slide-in-from-bottom"
    >
      <div className="mx-auto max-w-6xl px-4 py-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
            <p className="text-sm">
              Need help now? <span className="font-medium">Tele-MANAS {INDIA_EMERGENCY.teleManas}</span> or{" "}
              <span className="font-medium">KIRAN {INDIA_EMERGENCY.kiran}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild className="h-8 bg-red-600 hover:bg-red-700 text-white border-red-600">
              <a href={`tel:${INDIA_EMERGENCY.teleManas}`} aria-label="Call Tele-MANAS now">
                Call 14416
              </a>
            </Button>
            <Button asChild variant="outline" className="h-8 bg-transparent">
              <a href={`tel:${INDIA_EMERGENCY.kiran}`} aria-label="Call KIRAN now">
                Call KIRAN
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 ml-2"
              onClick={() => setIsExpanded(false)}
              aria-label="Close emergency support bar to bubble"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
