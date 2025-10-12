'use client'

import { SignInButton, SignUpButton } from "@clerk/nextjs"

export function ClerkAuthButtons() {
  return (
    <>
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
    </>
  )
}
