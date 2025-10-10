# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

MindBridge is a privacy-first mental wellness platform for students built with Next.js 15. All data processing happens on-device, with no personal information uploaded to servers. The application features on-device AI companionship, mood tracking, dream analysis, peer matching, and crisis-aware support features.

## Development Commands

### Core Commands
- **Start development server**: `pnpm dev` (runs on http://localhost:3000)
- **Build for production**: `pnpm build`
- **Start production server**: `pnpm start`
- **Lint code**: `pnpm lint`

### Package Management
This project uses **pnpm** as the package manager. Always use `pnpm` commands instead of npm or yarn.

## Architecture

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5 (strict mode enabled)
- **UI Library**: 21dev components (based on Radix UI primitives)
- **Styling**: Tailwind CSS 4.1.9 with CSS variables for theming
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation
- **Analytics**: Vercel Analytics

### Project Structure

```
app/
  (marketing)/          # Marketing pages (landing page)
  dashboard/            # Main dashboard after login
  login/                # Authentication flow
  onboarding/           # Multi-step onboarding (step-1 through step-4)
  layout.tsx            # Root layout with providers
  globals.css           # Global styles and Tailwind imports

components/
  dashboard/            # Dashboard-specific feature cards
    ai-companion-card.tsx
    daily-checkin-card.tsx
    dream-analysis-card.tsx
    micro-interventions-card.tsx
    peer-matching-card.tsx
  ui/                   # Reusable 21dev UI components
  emergency-support-bar.tsx
  locale-provider.tsx   # Internationalization (i18n) context
  mood-provider.tsx     # Mood-aware UI context
  pseudonym-generator.ts
  recorder-control.tsx

lib/
  emergency.ts          # India emergency hotline numbers
  utils.ts              # Utility functions (cn helper)
```

### Key Architectural Patterns

#### 1. Route Groups
The app uses Next.js route groups:
- `(marketing)/` - Public-facing pages (no authentication required)
- `dashboard/` - Protected dashboard area
- `onboarding/` - Multi-step onboarding flow

#### 2. Context Providers
Two main providers wrap the application in `app/layout.tsx`:

**LocaleProvider** (`components/locale-provider.tsx`):
- Manages internationalization for Indian languages (en-IN, hi, bn, ta, te, mr)
- Provides `useLocale()` hook with `t()` translation function
- Dictionary fallback: regional → en-IN → key

**MoodProvider** (`components/mood-provider.tsx`):
- Tracks user mood state: `neutral | anxious | low | lonely | crisis`
- Sets `data-mood` attribute on `<body>` for mood-aware styling
- Used by crisis-detection features to adapt UI tone

#### 3. Privacy-First Design
- **Pseudonym Generation**: Random anonymous identifiers (e.g., "CalmRiver", "BraveHorizon")
- **On-Device Processing**: No personal data leaves the device
- **Emergency Support**: Always-visible support bar with Indian crisis hotlines
- **Optional Federated Learning**: Opt-in only, no forced data collection

#### 4. Crisis-Aware Features
- Emergency support bar is sticky at the bottom of all pages
- Direct calling buttons for Tele-MANAS (14416) and KIRAN (18005990019)
- Mood-based UI adaptations surface support resources gently

## UI/UX Development with 21dev Library

### Component System
This project uses **21dev** (a curated component library based on Radix UI). Components are located in `components/ui/`.

### Adding New 21dev Components
When you need a new UI component:

1. Check if it exists in `components/ui/`
2. If not, add it using the pattern from existing components (Button, Card, Dialog, etc.)
3. Import from `@/components/ui/[component-name]`

### Styling Guidelines
- Use Tailwind CSS utility classes
- Use the `cn()` helper from `lib/utils.ts` to merge className conditionally
- Leverage CSS variables defined in `app/globals.css` for consistent theming
- Support dark mode through `next-themes` (if implemented)

### Example Component Usage
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function MyComponent() {
  return (
    <Card className={cn("custom-class")}>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

### 21dev Component Configuration
The `components.json` file configures the component system:
- **Style**: "new-york" variant
- **RSC**: React Server Components enabled
- **Base Color**: neutral
- **CSS Variables**: enabled for theming
- **Icon Library**: lucide-react

## TypeScript Configuration

### Path Aliases
- `@/*` maps to project root
- Example: `@/components/ui/button` → `components/ui/button.tsx`

### Strict Mode
TypeScript strict mode is **enabled**. However, build errors are currently ignored in production builds (`next.config.mjs`). When fixing TypeScript issues, aim to enable strict checking.

## Internationalization (i18n)

### Supported Locales
- `en-IN` (English - India) - default
- `hi` (Hindi)
- `bn` (Bengali)
- `ta` (Tamil)
- `te` (Telugu)
- `mr` (Marathi)

### Adding Translations
Edit `components/locale-provider.tsx` and add keys to the `dictionaries` object:

```tsx
const dictionaries: Record<Locale, Dict> = {
  "en-IN": {
    new_key: "English text",
  },
  hi: {
    new_key: "हिंदी पाठ",
  },
  // ... other locales
}
```

### Using Translations
```tsx
const { t } = useLocale()
return <h1>{t("hero_title")}</h1>
```

## Working with Forms

Forms use **React Hook Form** + **Zod** for validation:

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const schema = z.object({
  field: z.string().min(1, "Required"),
})

const form = useForm({
  resolver: zodResolver(schema),
})
```

## Crisis Support Integration

When adding features that might detect distress:
1. Use `useMood()` hook to access/update mood state
2. Consider showing emergency resources when mood is "anxious", "low", or "crisis"
3. The `EmergencySupportBar` is always visible but can be enhanced
4. Reference `lib/emergency.ts` for Indian crisis hotline numbers

## Client vs Server Components

### Client Components (use `"use client"`)
- Components using hooks (`useState`, `useEffect`, `useContext`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs

### Server Components (default)
- Static content
- Data fetching
- No interactivity

Most components in this project are client components due to the interactive nature of mental wellness features.

## Deployment

This project is deployed on **Vercel** and syncs with **v0.app**:
- Production URL: https://vercel.com/bindsrinesh-2003s-projects/v0-mind-bridge-ui-ux-design
- v0.app Project: https://v0.app/chat/projects/3b8LAIvZPHe
- Changes pushed from v0.app automatically deploy to Vercel

## Important Notes

### Privacy & Security
- Never add code that uploads user data without explicit consent
- Keep emergency hotline numbers updated (currently configured for India)
- Test anonymization features (pseudonym generation) thoroughly

### Accessibility
- All interactive elements should have proper ARIA labels
- Test keyboard navigation
- Skip-to-content link is present in root layout
- Emergency support must remain accessible at all times

### Performance
- Images are unoptimized (`next.config.mjs`) - optimize before production
- Consider lazy loading for dashboard cards
- Mood detection should be lightweight and non-blocking
