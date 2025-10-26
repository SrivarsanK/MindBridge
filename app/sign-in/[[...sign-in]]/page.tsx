import { SignIn } from '@clerk/nextjs'
import { LogoWithBackground } from '@/components/ui/logo-with-background'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl animate-pulse-slower" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/3 to-accent/3 dark:from-primary/5 dark:to-accent/5 rounded-full blur-3xl animate-pulse-slowest" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <LogoWithBackground size="md" />
        </div>

        {/* Sign In Form with Glassmorphism */}
        <SignIn
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: 'hsl(var(--primary))',
              colorBackground: 'color-mix(in srgb, hsl(var(--card)) 60%, transparent)',
              colorInputBackground: 'hsl(var(--card))',
              colorInputText: 'hsl(var(--foreground))',
              colorText: 'hsl(var(--foreground))',
              colorTextSecondary: 'hsl(var(--muted-foreground))',
              borderRadius: '1rem'
            },
            elements: {
              formButtonPrimary: 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:scale-[1.02] font-semibold',
              card: 'glass-card p-8 rounded-2xl shadow-2xl border border-primary/10 dark:border-primary/20',
              headerTitle: 'text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-2',
              headerSubtitle: 'text-muted-foreground text-base leading-relaxed',
              socialButtonsBlockButton: 'border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all hover:scale-[1.02] shadow-sm hover:shadow-md',
              dividerLine: 'bg-gradient-to-r from-transparent via-primary/20 to-transparent',
              dividerText: 'text-muted-foreground font-medium px-4',
              formFieldInput: 'border-primary/20 focus:border-primary dark:border-primary/30 dark:focus:border-primary bg-card/50 dark:bg-card/30 backdrop-blur-sm transition-all focus:ring-2 focus:ring-primary/20',
              formFieldInputShowPasswordButton: 'text-muted-foreground hover:text-foreground transition-colors',
              formFieldLabel: 'text-foreground font-medium mb-2',
              footerActionLink: 'text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/70 font-medium transition-colors hover:underline',
              identityPreviewEditButton: 'text-primary hover:text-primary/80 transition-colors',
              formButtonReset: 'text-primary hover:text-primary/80 transition-colors font-medium',
              alert: 'bg-destructive/10 border-destructive/20 text-destructive dark:bg-destructive/20 dark:border-destructive/30',
              alertText: 'text-sm',
              otpCodeFieldInput: 'border-primary/20 focus:border-primary dark:border-primary/30 dark:focus:border-primary bg-card/50 dark:bg-card/30 backdrop-blur-sm text-center text-lg font-mono tracking-wider'
            }
          }}
        />

        {/* Footer text */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            🔒 Your data stays private and secure
          </p>
        </div>
      </div>
    </div>
  )
}