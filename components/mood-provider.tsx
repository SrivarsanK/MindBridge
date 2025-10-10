"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Mood = "neutral" | "anxious" | "low" | "lonely" | "crisis"

const MoodCtx = createContext<{
  mood: Mood
  setMood: (m: Mood) => void
} | null>(null)

export function MoodProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<Mood>("neutral")

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-mood", mood)
    }
  }, [mood])

  return <MoodCtx.Provider value={{ mood, setMood }}>{children}</MoodCtx.Provider>
}

export function useMood() {
  const ctx = useContext(MoodCtx)
  if (!ctx) throw new Error("useMood must be used within MoodProvider")
  return ctx
}
