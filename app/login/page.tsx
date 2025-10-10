"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Shield, Lock, Heart, Sparkles } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur-2xl opacity-20" />
          
          <div className="relative bg-card border border-primary/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-primary/5 text-primary text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                <span>Privacy-First</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Welcome to MindBridge
              </h1>
              <p className="text-muted-foreground">
                Your secure, on-device mental wellness companion
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">100% Private</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Lock className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">Encrypted</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Heart className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">24/7 Support</p>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="space-y-3 mb-6">
              <SignInButton mode="modal">
                <Button className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all hover:shadow-xl">
                  Sign In
                </Button>
              </SignInButton>
              
              <SignUpButton mode="modal">
                <Button variant="outline" className="w-full h-12 hover:bg-primary/5">
                  Create Account
                </Button>
              </SignUpButton>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Guest Access */}
            <Button asChild variant="outline" className="w-full h-12 hover:bg-primary/5">
              <Link href="/dashboard">
                Continue as Guest (Anonymous)
              </Link>
            </Button>

            {/* Footer */}
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground text-center">
                🔒 Your data stays on-device. By continuing you agree to our{" "}
                <Link href="/terms" className="underline hover:text-primary">
                  Terms
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="underline hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
