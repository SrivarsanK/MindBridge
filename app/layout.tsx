import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import EmergencySupportBar from "@/components/emergency-support-bar"
import { MoodProvider } from "@/components/mood-provider"
import { LocaleProvider } from "@/components/locale-provider"
import LocaleSwitcher from "@/components/locale-switcher" // Placeholder for LocaleSwitcher component
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MindBridge",
  description: "Privacy-first mental wellness for students, on-device.",
  generator: "v0.app",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans">
        {/* Accessibility skip link */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground rounded-md px-3 py-1"
        >
          Skip to content
        </a>
        {/* Locale + mood providers for adaptive UI */}
        <Suspense fallback={<div>Loading...</div>}>
          <LocaleProvider defaultLocale="en-IN">
            <MoodProvider>
              <div className="min-h-dvh flex flex-col">
                {/* Site header */}
                <header className="w-full border-b bg-background">
                  <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                    <a
                      href="/"
                      className="inline-flex items-baseline gap-1 font-semibold tracking-tight text-foreground text-lg"
                      aria-label="MindBridge Home"
                    >
                      <span>Mind</span>
                      <span className="text-primary">Bridge</span>
                    </a>
                    {/* Simple locale switcher placeholder */}
                    <nav aria-label="Locale">
                      <LocaleSwitcher />
                    </nav>
                  </div>
                </header>

                <main id="main" className="flex-1">
                  {children}
                </main>

                {/* Always-visible emergency support */}
                <EmergencySupportBar />
              </div>
            </MoodProvider>
          </LocaleProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
