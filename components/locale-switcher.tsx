"use client"

import { useLocale } from "@/components/locale-provider"

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocale()
  const locales = [
    { code: "en-IN", name: "English" },
    { code: "hi", name: "हिन्दी" },
    { code: "bn", name: "বাংলা" },
    { code: "ta", name: "தமிழ்" },
    { code: "te", name: "తెలుగు" },
    { code: "mr", name: "मराठी" },
  ] as const

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value
    console.log("Locale changed from", locale, "to", newLocale)
    setLocale(newLocale as any)
  }

  return (
    <label className="text-sm text-muted-foreground inline-flex items-center gap-2">
      <span className="sr-only">Select language</span>
      <select
        aria-label="Select language"
        className="border rounded-md px-2 py-1 bg-background text-sm"
        value={locale}
        onChange={handleChange}
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  )
}
