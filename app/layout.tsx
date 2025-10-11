import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import EmergencySupportBar from "@/components/emergency-support-bar"
import { MoodProvider } from "@/components/mood-provider"
import { LocaleProvider } from "@/components/locale-provider"
import LocaleSwitcher from "@/components/locale-switcher"
import { Suspense } from "react"
import { ClerkProvider, SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs"
import { ConvexClientProvider } from "@/components/convex-client-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

// Check if Clerk keys are properly configured
const hasValidClerkKeys = () => {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return publishableKey && 
         publishableKey !== 'your_clerk_publishable_key_here' && 
         publishableKey !== 'pk_test_your_actual_publishable_key_here' &&
         publishableKey.startsWith('pk_')
}

export const metadata: Metadata = {
  title: "MindBridge",
  description: "Privacy-first mental wellness for students, on-device.",
  generator: "v0.app",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_')

  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} antialiased`}>
        <body className="font-sans">
          <ConvexClientProvider>
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
                        {/* Right side navigation */}
                        <div className="flex items-center gap-3">
                          <nav aria-label="Locale">
                            <LocaleSwitcher />
                          </nav>
                          {hasClerkKeys ? (
                            <>
                              {/* Show user button when signed in */}
                              <SignedIn>
                                <UserButton 
                                  appearance={{
                                    elements: {
                                      avatarBox: "w-9 h-9"
                                    }
                                  }}
                                  afterSignOutUrl="/"
                                />
                              </SignedIn>
                              {/* Show sign in/up buttons when signed out */}
                              <SignedOut>
                                <SignInButton mode="modal">
                                  <button className="text-sm font-medium text-primary hover:underline transition-colors">
                                    Sign In
                                  </button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                  <button className="bg-primary text-white rounded-full font-medium text-sm h-9 px-5 hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">
                                    Sign Up
                                  </button>
                                </SignUpButton>
                              </SignedOut>
                            </>
                          ) : (
                            <>
                              <a href="/login" className="text-sm font-medium text-primary hover:underline transition-colors">
                                Sign In
                              </a>
                              <a href="/login" className="bg-primary text-white rounded-full font-medium text-sm h-9 px-5 flex items-center hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">
                                Sign Up
                              </a>
                            </>
                          )}
                        </div>
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
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
