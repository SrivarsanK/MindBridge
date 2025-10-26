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
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import NavigationSidebar from "@/components/navigation-sidebar"
import { BGPattern } from "@/components/ui/bg-pattern"
import { AuthSection } from "@/components/auth-section"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoWithBackground } from "@/components/ui/logo-with-background"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
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
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk',
      }}
    >
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.png" type="image/png" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    // Get theme from localStorage
                    var theme = localStorage.getItem('mindbridge-theme') || 'system';
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    var effectiveTheme = theme === 'system' ? systemTheme : theme;
                    
                    // Apply dark class to HTML (will be transferred to body by React)
                    if (effectiveTheme === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
          {/* Razorpay Checkout Script */}
          <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        </head>
        <body className="font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="mindbridge-theme"
            disableTransitionOnChange
          >
            {/* Wrapper with theme-aware styles applied instantly */}
            <div className="relative min-h-screen bg-background text-foreground">
              {/* Global Grid Background Pattern with Fade Edges */}
              <div className="fixed inset-0 z-0 pointer-events-none animate-breathe dark:opacity-40">
                <BGPattern 
                  variant="grid" 
                  mask="fade-edges" 
                  size={32} 
                  fill="currentColor" 
                  className="text-primary/30 dark:text-primary/20"
                />
              </div>
              
              <div className="relative z-10">
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
                    <header className="w-full glass sticky top-0 z-50">
                      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                        <a
                          href="/"
                          className="inline-flex items-center gap-2 font-semibold tracking-tight text-foreground text-lg hover:opacity-80 transition-opacity"
                          aria-label="MindBridge Home"
                        >
                          <LogoWithBackground size="sm" />
                          <span className="flex items-center gap-1">
                            <span>Mind</span>
                            <span className="text-primary">Bridge</span>
                          </span>
                        </a>
                        {/* Right side navigation */}
                        <div className="flex items-center gap-3">
                          <nav aria-label="Locale">
                            <LocaleSwitcher />
                          </nav>
                          <ThemeToggle />
                          <AuthSection />
                        </div>
                      </div>
                    </header>

                    {/* Main content with sidebar */}
                    <div className="flex-1 flex min-h-0">
                      <NavigationSidebar />
                      <main id="main" className="flex-1 overflow-x-hidden overflow-y-auto">
                        {children}
                      </main>
                    </div>

                    {/* Always-visible emergency support */}
                    <EmergencySupportBar />
                  </div>
                </MoodProvider>
              </LocaleProvider>
            </Suspense>
            <Analytics />
          </ConvexClientProvider>
              </div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
