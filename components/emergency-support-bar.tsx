"use client"
import { INDIA_EMERGENCY } from "@/lib/emergency"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EmergencySupportBar() {
  return (
    <div
      role="region"
      aria-label="Emergency support"
      className="sticky bottom-0 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto max-w-6xl px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
          <p className="text-sm">
            Need help now? <span className="font-medium">Tele-MANAS {INDIA_EMERGENCY.teleManas}</span> or{" "}
            <span className="font-medium">KIRAN {INDIA_EMERGENCY.kiran}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="destructive" className="h-8">
            <a href={`tel:${INDIA_EMERGENCY.teleManas}`} aria-label="Call Tele-MANAS now">
              Call 14416
            </a>
          </Button>
          <Button asChild variant="outline" className="h-8 bg-transparent">
            <a href={`tel:${INDIA_EMERGENCY.kiran}`} aria-label="Call KIRAN now">
              Call KIRAN
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
