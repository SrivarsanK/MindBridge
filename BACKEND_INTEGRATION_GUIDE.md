# MindBridge Backend Integration Guide

## 🎉 Integration Status

✅ **Clerk Authentication** - Installed and configured
✅ **Convex Backend** - Files copied and ready
✅ **Premium UI/UX** - Dashboard enhanced with 21dev components
✅ **Middleware** - Clerk authentication middleware setup

## 📋 Setup Steps

### 1. Clerk Authentication Setup

#### Get Your Clerk Keys
1. Go to [https://clerk.com](https://clerk.com) and sign up/sign in
2. Create a new application (or use existing one)
3. Go to **API Keys** in the Clerk dashboard
4. Copy your **Publishable Key** and **Secret Key**

#### Update Environment Variables
Edit `.env.local` and replace the placeholder values:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_here

# Clerk URLs (already configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/step-1
```

### 2. Convex Backend Setup (Optional - For Full Backend Features)

The backend is already copied from `mindbridge_backend_implementation.zip`. To activate it:

#### Initialize Convex
```bash
npx convex dev
```

This will:
- Open a browser to authenticate
- Create a new Convex deployment
- Generate the necessary configuration files

#### Features Available in Backend
- **AI Chatbot**: OpenAI GPT-4 integration with crisis detection
- **Dream Analysis**: Emotional pattern recognition
- **Peer Matching**: Anonymous peer-to-peer support
- **Crisis Detection**: Multi-level crisis response system
- **Privacy Controls**: GDPR/CCPA compliant data management
- **Audit Logging**: Comprehensive activity tracking

### 3. Start Development Server

```bash
pnpm dev
```

Your app will be available at: **http://localhost:3000**

## 🏗️ Architecture Overview

### Frontend (Next.js 15)
```
app/
├── (marketing)/page.tsx    # Landing page
├── dashboard/page.tsx       # Main dashboard with premium UI
├── login/page.tsx           # Clerk SignIn component
├── onboarding/             # 4-step onboarding flow
└── layout.tsx              # Root layout with Clerk provider

components/
├── dashboard/              # Premium dashboard cards
│   ├── ai-companion-card.tsx       # Chat interface
│   ├── daily-checkin-card.tsx      # Mood selector
│   ├── dream-analysis-card.tsx     # Dream patterns
│   ├── micro-interventions-card.tsx # Quick relief
│   └── peer-matching-card.tsx      # Peer support
├── ui/                     # 21dev components
└── convex-client-provider.tsx
```

### Backend (Convex)
```
convex/
├── schema.ts               # Database schema (15 tables)
├── auth.ts                # Authentication
├── chatbot.ts             # AI chatbot logic
├── peerMatching.ts        # Peer matching algorithm
├── dreamAnalysis.ts       # Dream analysis
├── crisis.ts              # Crisis detection & management
├── privacy.ts             # GDPR/CCPA compliance
└── metrics.ts             # System metrics
```

## 🔐 Authentication Flow

1. **Sign In/Sign Up** → Clerk handles authentication
2. **New User** → Redirected to `/onboarding/step-1`
3. **Returning User** → Redirected to `/dashboard`
4. **Guest Access** → Direct access without authentication

## 🎨 Premium UI Features

### Dashboard Enhancements
- ✨ Gradient backgrounds with subtle animations
- 📊 Stats cards (Privacy, Streak, Insights)
- 💬 Premium chat interface with typing indicators
- 🎯 Interactive mood selector with emoji icons
- 🌙 Dream analysis with beautiful charts
- ⚡ Quick relief exercises with hover effects
- 👥 Peer matching with E2E encryption badges

### Design System
- **Colors**: Sage/teal primary, warm accent, crisis red
- **Animations**: Smooth transitions, fade-ins, hover effects
- **Typography**: Clear hierarchy with Inter font
- **Components**: 21dev (shadcn/ui) with Radix primitives
- **Icons**: Lucide React
- **Theming**: CSS custom properties for dynamic colors

## 🔗 Integrating Components with Backend

### AI Companion Card
To connect to real Convex backend:

```tsx
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

// In component:
const createConversation = useMutation(api.chatbot.createConversation)
const sendMessage = useMutation(api.chatbot.sendMessage)
const messages = useQuery(api.chatbot.getConversationMessages, {
  conversationId: conversationId 
})
```

### Dream Analysis Card
```tsx
const createDreamAnalysis = useMutation(api.dreamAnalysis.createDreamAnalysis)
const dreamAnalyses = useQuery(api.dreamAnalysis.getUserDreamAnalyses)
```

### Peer Matching Card
```tsx
const requestMatch = useMutation(api.peerMatching.requestPeerMatch)
const activeMatches = useQuery(api.peerMatching.getActiveMatches)
```

## 📱 Pages Overview

### Landing Page (`/`)
- Hero section with trust indicators
- Privacy-first messaging
- CTA buttons (Start privately, Learn more)

### Login Page (`/login`)
- Clerk SignIn component
- Guest access option
- Terms & Privacy links

### Dashboard (`/dashboard`)
- Premium hero header with stats
- AI Companion chat
- Dream Analysis with charts
- Daily Check-in mood selector
- Micro-interventions
- Peer Matching

### Onboarding (`/onboarding/step-1` to `/step-4`)
- Step 1: Privacy & Consent
- Step 2: Language preference
- Step 3: Initial mood baseline
- Step 4: Feature tour

## 🚀 Deployment Checklist

### Before Deploying to Production

1. **Environment Variables**
   - [ ] Set Clerk production keys
   - [ ] Set Convex production deployment
   - [ ] Add OpenAI API key (if using AI features)

2. **Clerk Configuration**
   - [ ] Set production URLs in Clerk dashboard
   - [ ] Configure allowed redirect URLs
   - [ ] Set up email/SMS providers

3. **Convex Configuration**
   - [ ] Deploy to production: `npx convex deploy`
   - [ ] Update NEXT_PUBLIC_CONVEX_URL in environment

4. **Security**
   - [ ] Review CORS settings
   - [ ] Enable rate limiting
   - [ ] Configure proper CSP headers

5. **Testing**
   - [ ] Test authentication flow
   - [ ] Test guest access
   - [ ] Verify all protected routes
   - [ ] Test crisis detection
   - [ ] Verify privacy controls

## 🔧 Troubleshooting

### Clerk Issues
**Problem**: "Clerk key not found"
**Solution**: Make sure `.env.local` has the correct keys and restart dev server

### Convex Issues
**Problem**: "Cannot connect to Convex"
**Solution**: Run `npx convex dev` to initialize the deployment

### Build Issues
**Problem**: TypeScript errors
**Solution**: The project has `ignoreBuildErrors: true` in `next.config.mjs` for development

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [21dev/shadcn UI](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)

## 🆘 Emergency Resources

The app includes Indian crisis hotlines:
- **Tele-MANAS**: 14416 / 1800-891-4416
- **KIRAN**: 1800-599-0019

These are always visible in the emergency support bar at the bottom.

## 🎯 Next Steps

1. **Get Clerk Keys** - Sign up at clerk.com and get your API keys
2. **Update .env.local** - Replace placeholder keys with real ones
3. **Restart Dev Server** - `pnpm dev`
4. **Test Authentication** - Try signing in and guest access
5. **Optional**: Set up Convex for full backend features

## 💡 Tips

- Use **Guest Access** during development to skip authentication
- The dashboard is fully functional with mock data
- Backend integration is modular - connect features incrementally
- All sensitive data should use Clerk's user ID for association
- Privacy settings are stored per-user in the backend

---

**Built with ❤️ for student mental health**

🌉 **MindBridge** - Privacy-First Mental Wellness Platform
