"use client"
import { useLocale } from "@/components/locale-provider"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Shield, Brain, Users, Moon, Heart, Sparkles, ArrowRight, Lock, Zap } from "lucide-react"
import Link from "next/link"
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"

export default function Page() {
  const { t } = useLocale()
  const trust = [
    { text: t("trust_ondevice"), icon: Shield },
    { text: t("trust_federated"), icon: Brain },
    { text: t("trust_encryption"), icon: Lock },
    { text: t("trust_247"), icon: Heart },
  ]

  const features = [
    {
      icon: Brain,
      title: "AI Companion",
      description: "Compassionate support powered by advanced AI, available 24/7",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Moon,
      title: "Dream Analysis",
      description: "Understand your emotional patterns through dream interpretation",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Users,
      title: "Peer Support",
      description: "Connect anonymously with others who understand what you're going through",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Zap,
      title: "Quick Relief",
      description: "Instant access to breathing exercises and grounding techniques",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Enhanced Gradient Background with Multiple Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary),0.15),transparent_50%)] -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(var(--accent),0.1),transparent_50%)] -z-10" />
      
      {/* Animated Floating Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse -z-10" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse -z-10" style={{ animationDuration: '6s', animationDelay: '1s' }} />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-start lg:items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            {/* Badge with Animation */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-medium shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all hover:scale-105 cursor-default max-w-full">
              <Sparkles className="h-4 w-4 animate-pulse shrink-0" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold truncate">Privacy-First Mental Wellness</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] break-words">
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent drop-shadow-sm">
                  {t("hero_title")}
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed break-words">
                {t("hero_sub")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6">
              {/* Show Dashboard link when signed in, Sign Up when signed out */}
              <SignedIn>
                <Button asChild size="lg" className="group relative h-14 px-8 text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/80 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 overflow-hidden">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <span className="relative z-10">Go to Dashboard</span>
                    <ArrowRight className="h-5 w-5 relative z-10 transition-transform group-hover:translate-x-2" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Link>
                </Button>
              </SignedIn>
              
              <SignedOut>
                <SignUpButton mode="modal" forceRedirectUrl="/onboarding/step-1">
                  <Button size="lg" className="group relative h-14 px-8 text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/80 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 overflow-hidden">
                    <span className="relative z-10">{t("cta_start")}</span>
                    <ArrowRight className="h-5 w-5 relative z-10 transition-transform group-hover:translate-x-2" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              
              <Button variant="outline" asChild size="lg" className="h-14 px-8 text-base font-semibold border-2 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 shadow-lg">
                <Link href="#features" className="flex items-center gap-2">
                  Learn More
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Enhanced Stats with Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-10 border-t border-border/50">
              <div className="space-y-2 group cursor-default min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">100%</div>
                </div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors break-words">Private & Secure</div>
              </div>
              <div className="space-y-2 group cursor-default min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" style={{ animationDelay: '0.5s' }} />
                  <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">24/7</div>
                </div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors break-words">Always Available</div>
              </div>
              <div className="space-y-2 group cursor-default min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" style={{ animationDelay: '1s' }} />
                  <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-500 to-green-500/70 bg-clip-text text-transparent">E2E</div>
                </div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors break-words">Encrypted</div>
              </div>
            </div>
          </div>

          {/* Right Column - Enhanced Trust Card */}
          <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <div className="relative group">
              {/* Enhanced Multi-layer Glow Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl blur-xl opacity-40" />
              
              <div className="relative rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl p-10 shadow-2xl hover:shadow-[0_0_50px_rgba(var(--primary),0.3)] transition-all duration-500">
                {/* Header with Enhanced Icon */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-md opacity-50" />
                    <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                      <Shield className="h-8 w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Your Privacy Matters</h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Enterprise-grade security
                    </p>
                  </div>
                </div>

                {/* Enhanced Trust Items */}
                <ul className="space-y-3">
                  {trust.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <li 
                        key={item.text} 
                        className="flex items-center gap-4 group/item hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 p-4 rounded-2xl transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-lg cursor-default"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/15 to-accent/10 flex items-center justify-center shrink-0 group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300 shadow-md">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold group-hover/item:text-primary transition-colors">{item.text}</span>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-primary shrink-0 opacity-50 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all" />
                      </li>
                    )
                  })}
                </ul>

                {/* Enhanced Info Box */}
                <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-2 border-primary/20 shadow-inner hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">100% On-Device Processing:</span> All data processing happens on your device. We never see your personal information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-accent/5 text-accent text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything You Need for Mental Wellness
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed specifically for student mental health
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-14 w-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 md:p-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Start Your Wellness Journey Today
            </h2>
            <p className="text-lg text-primary-foreground/90">
              Join thousands of students who trust MindBridge for their mental wellness
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {/* Show Dashboard when signed in, Sign Up when signed out */}
              <SignedIn>
                <Button asChild size="lg" variant="secondary" className="h-12 px-8 bg-white text-primary hover:bg-white/90 shadow-lg">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </SignedIn>
              
              <SignedOut>
                <SignUpButton mode="modal" forceRedirectUrl="/onboarding/step-1">
                  <Button size="lg" variant="secondary" className="h-12 px-8 bg-white text-primary hover:bg-white/90 shadow-lg">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              
              <Button asChild size="lg" variant="outline" className="h-12 px-8 border-white text-white hover:bg-white/10">
                <Link href="#features">
                  View Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
