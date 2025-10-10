"use client"
import { createContext, useContext, useMemo, useState } from "react"

type Locale = "en-IN" | "hi" | "bn" | "ta" | "te" | "mr"
type Dict = Record<string, string>

const dictionaries: Record<Locale, Dict> = {
  "en-IN": {
    hero_title: "Clinically-grounded support. Private by design.",
    hero_sub: "MindBridge supports students with on-device AI. No data leaves your device.",
    cta_start: "Start privately",
    cta_privacy: "How your data stays on‑device",
    trust_ondevice: "On-device processing",
    trust_federated: "Federated learning (opt-in)",
    trust_encryption: "End-to-end encryption",
    trust_247: "24/7 crisis escalation",
    login_title: "Sign in or continue as guest",
    login_guest: "Continue as Guest (anonymous)",
    onboarding: "Onboarding",
    dashboard: "Dashboard",
  },
  hi: {},
  bn: {},
  ta: {},
  te: {},
  mr: {},
}

const LocaleCtx = createContext<{
  locale: Locale
  t: (key: string) => string
  setLocale: (l: Locale) => void
} | null>(null)

export function LocaleProvider({ children, defaultLocale = "en-IN" as Locale }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const t = useMemo(() => {
    const dict = dictionaries[locale] || {}
    return (key: string) => dict[key] ?? dictionaries["en-IN"][key] ?? key
  }, [locale])

  return <LocaleCtx.Provider value={{ locale, t, setLocale }}>{children}</LocaleCtx.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleCtx)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale()
  const locales: Locale[] = ["en-IN", "hi", "bn", "ta", "te", "mr"]
  return (
    <label className="text-sm text-muted-foreground inline-flex items-center gap-2">
      <span className="sr-only">Select language</span>
      <select
        aria-label="Select language"
        className="border rounded-md px-2 py-1 bg-background"
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}
