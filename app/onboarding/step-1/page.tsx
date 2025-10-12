"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Shield, Brain, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Step1() {
  const [consent, setConsent] = useState(false)
  const [federated, setFederated] = useState(false)
  const [escalation, setEscalation] = useState(true)

  const options = [
    {
      id: "consent",
      checked: consent,
      onChange: setConsent,
      icon: Shield,
      title: "On-Device Processing",
      description: "I understand MindBridge processes data on-device.",
      required: true,
      color: "text-primary",
    },
    {
      id: "federated",
      checked: federated,
      onChange: setFederated,
      icon: Brain,
      title: "Federated Learning",
      description: "Opt in to federated learning (improve models without sharing raw data).",
      required: false,
      color: "text-blue-500",
    },
    {
      id: "escalation",
      checked: escalation,
      onChange: setEscalation,
      icon: AlertCircle,
      title: "Crisis Support",
      description: "Allow crisis escalation prompts when risk signals are detected.",
      required: false,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Step 1 of 4</span>
            <span className="text-sm font-medium text-primary">25%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500" style={{ width: "25%" }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur-2xl opacity-20" />
          
          <div className="relative bg-card border border-primary/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-primary/5 text-primary text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                <span>Privacy & Consent</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Welcome to MindBridge
              </h1>
              <p className="text-muted-foreground">
                Let's set up your privacy preferences. Your data stays on your device.
              </p>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {options.map((option) => {
                const Icon = option.icon
                return (
                  <label
                    key={option.id}
                    className={cn(
                      "group relative flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                      option.checked
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    {/* Checkbox */}
                    <Checkbox
                      checked={option.checked}
                      onCheckedChange={(v) => option.onChange(!!v)}
                      className="mt-1"
                    />

                    {/* Icon */}
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
                      option.checked ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Icon className={cn("h-6 w-6", option.checked ? option.color : "text-muted-foreground")} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{option.title}</h3>
                        {option.required && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>

                    {/* Check indicator */}
                    {option.checked && (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 animate-in zoom-in duration-200" />
                    )}
                  </label>
                )
              })}
            </div>

            {/* Info Box */}
            <div className="mb-8 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <p className="text-sm text-muted-foreground text-center">
                🔒 <strong>Your Privacy Matters:</strong> All data processing happens locally on your device. We never upload your personal information to our servers.
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" asChild className="h-11">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
              <Button 
                asChild 
                disabled={!consent}
                className="h-11 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Link href="/onboarding/step-2" className="flex items-center gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
