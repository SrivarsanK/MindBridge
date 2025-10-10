"use client"

import { useLocale } from "@/components/locale-provider"

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocale()
  const locales = ["en-IN", "hi", "bn", "ta", "te", "mr"] as const

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
