'use client'

import Link from "next/link"

export function ClerkAuthButtons() {
  return (
    <div className="flex items-center gap-3">
      <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline transition-colors flex items-center h-9 px-3">
        Sign In
      </Link>
      <Link href="/sign-up" className="bg-primary text-white rounded-full font-medium text-sm h-9 px-5 hover:bg-primary/90 transition-all shadow-sm hover:shadow-md inline-flex items-center justify-center">
        Sign Up
      </Link>
    </div>
  )
}
