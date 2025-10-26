'use client'

import { useEffect, useState } from "react"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { ClerkUserButton } from "@/components/clerk-user-button"
import { ClerkAuthButtons } from "@/components/clerk-auth-buttons"

export function AuthSection() {
  const [hasClerkKeys, setHasClerkKeys] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const isValid = publishableKey &&
      !publishableKey.includes('your_') &&
      publishableKey.startsWith('pk_')
    setHasClerkKeys(!!isValid)
  }, [])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-9 bg-muted/50 rounded animate-pulse"></div>
        <div className="w-24 h-9 bg-muted/50 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!hasClerkKeys) {
    return (
      <div className="flex items-center gap-3">
        <a href="/login" className="text-sm font-medium text-primary hover:underline transition-colors flex items-center h-9 px-3">
          Sign In
        </a>
        <a href="/login" className="bg-primary text-white rounded-full font-medium text-sm h-9 px-5 flex items-center hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">
          Get Started
        </a>
      </div>
    )
  }

  return (
    <>
      {/* Show user button when signed in */}
      <SignedIn>
        <ClerkUserButton />
      </SignedIn>
      {/* Show sign in/up buttons when signed out */}
      <SignedOut>
        <ClerkAuthButtons />
      </SignedOut>
    </>
  )
}