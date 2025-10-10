# 🌉 MindBridge - Privacy-First Mental Wellness Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/bindsrinesh-2003s-projects/v0-mind-bridge-ui-ux-design)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=for-the-badge)](https://clerk.com)

> **A premium, production-ready mental wellness platform for students with enterprise-grade privacy and beautiful UI/UX**

## ✨ Features

### 🎨 Premium UI/UX ($100k Design)
- **Stunning Dashboard** with gradient backgrounds and smooth animations
- **AI Companion Chat** with typing indicators and message bubbles
- **Interactive Mood Selector** with emoji icons and visual feedback
- **Beautiful Charts** for dream analysis and emotional patterns
- **Quick Relief Exercises** with hover effects and timers
- **Peer Matching Interface** with E2E encryption badges
- **Emergency Support Bar** always visible at bottom

### 🔐 Enterprise Security
- **Clerk Authentication** with social logins and guest access
- **Convex Backend** with real-time data synchronization
- **GDPR/CCPA Compliant** data management
- **End-to-End Encryption** for peer messaging
- **Audit Logging** for all sensitive operations
- **Crisis Detection** with multi-level response system

### 🏗️ Technical Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + 21dev components (shadcn/ui)
- **Auth**: Clerk (multi-provider authentication)
- **Backend**: Convex (real-time database)
- **AI**: OpenAI GPT-4 integration (optional)
- **Icons**: Lucide React (500+ icons)
- **Analytics**: Vercel Analytics

## 🚀 Quick Start

### Development (Guest Mode)
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```
Visit http://localhost:3000 and click "Continue as Guest"

### Full Setup (With Authentication)

1. **Get Clerk API Keys**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your Publishable and Secret keys

2. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_here
   ```

3. **Start Development**
   ```bash
   pnpm dev
   ```

## 📂 Project Structure

```
MindBridge/
├── app/                          # Next.js 15 App Router
│   ├── (marketing)/page.tsx      # Landing page
│   ├── dashboard/page.tsx        # Premium dashboard
│   ├── login/page.tsx           # Clerk authentication
│   ├── onboarding/              # 4-step onboarding wizard
│   └── layout.tsx               # Root layout with providers
├── components/
│   ├── dashboard/               # Premium dashboard cards
│   │   ├── ai-companion-card.tsx      # Chat interface
│   │   ├── daily-checkin-card.tsx     # Mood selector
│   │   ├── dream-analysis-card.tsx    # Dream patterns
│   │   ├── micro-interventions-card.tsx # Quick relief
│   │   └── peer-matching-card.tsx     # Peer support
│   ├── ui/                      # 21dev components (Button, Card, etc.)
│   ├── emergency-support-bar.tsx
│   ├── mood-provider.tsx        # Mood state management
│   └── locale-provider.tsx      # i18n support (6 languages)
├── convex/                      # Backend (15 database tables)
│   ├── schema.ts               # Database schema
│   ├── chatbot.ts              # AI chatbot logic
│   ├── peerMatching.ts         # Peer matching algorithm
│   ├── dreamAnalysis.ts        # Dream pattern analysis
│   ├── crisis.ts               # Crisis detection system
│   └── privacy.ts              # GDPR/CCPA compliance
├── lib/
│   ├── utils.ts                # Utility functions (cn helper)
│   └── emergency.ts            # Indian crisis hotline numbers
├── middleware.ts               # Clerk authentication middleware
├── WARP.md                     # Development guide for AI agents
├── BACKEND_INTEGRATION_GUIDE.md # Full backend setup guide
└── QUICK_START.md              # Quick reference guide
```

## 🎨 Design System

### Colors
- **Primary**: Sage/teal (`hsl(172 32% 35%)`) - Calm, growth, safety
- **Accent**: Warm orange (`hsl(35 90% 48%)`) - Notices, highlights
- **Destructive**: Crisis red (`hsl(355 80% 45%)`) - Emergency actions
- **Background**: Soft neutral (`hsl(180 15% 98%)`)

### Components (21dev)
Built on Radix UI primitives with custom styling:
- Button (6 variants, 4 sizes)
- Card, Dialog, Dropdown Menu
- Input, Textarea, Checkbox, Switch
- Charts (Recharts integration)
- Toast notifications (Sonner)

### Mood-Adaptive Theming
UI subtly adapts based on user mood:
- `neutral` - Standard sage/teal
- `anxious` - Slightly warmer tones
- `low` - Softer, muted colors
- `lonely` - Deeper, embracing tones
- `crisis` - Emergency resources highlighted

## 📱 Pages & Features

### Landing Page (`/`)
- Hero section with trust indicators
- Privacy-first messaging
- Indian language support (en-IN, hi, bn, ta, te, mr)

### Dashboard (`/dashboard`)
- Premium hero header with stats (Privacy, Streak, Insights)
- AI Companion chat with crisis detection
- Dream Analysis with emotional pattern charts
- Daily Check-in mood selector
- Micro-interventions (breathing, grounding exercises)
- Peer Matching with anonymous connections

### Onboarding (`/onboarding/step-1` to `/step-4`)
- **Step 1**: Privacy consent & federated learning opt-in
- **Step 2**: Language preference
- **Step 3**: Initial mood baseline
- **Step 4**: Feature tour & completion

### Authentication (`/login`)
- Clerk SignIn component
- Guest access option
- Terms & Privacy links

## 🔧 Development

### Available Scripts
```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

### Environment Variables
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# Convex Backend (Optional)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# OpenAI (Optional)
CONVEX_OPENAI_API_KEY=sk-...
```

## 🗄️ Backend Features (Convex)

### Available with Backend Setup
- **AI Chatbot**: OpenAI GPT-4 with streaming responses
- **Crisis Detection**: Keyword + sentiment analysis
- **Dream Analysis**: Emotional pattern recognition
- **Peer Matching**: AI-powered compatibility algorithm
- **Privacy Controls**: GDPR/CCPA data export & deletion
- **Audit Logging**: Comprehensive activity tracking
- **Rate Limiting**: Abuse prevention (20 req/min)

### Database Schema
15 tables including:
- `userProfiles` - User data with privacy settings
- `conversations` - AI chatbot conversations
- `dreamAnalysis` - Dream pattern records
- `peerMatches` - Anonymous peer connections
- `crisisEvents` - Crisis detection & response
- `auditLogs` - Compliance & security logs

## 🆘 Emergency Resources

Built-in Indian crisis hotlines:
- **Tele-MANAS**: 14416 / 1800-891-4416
- **KIRAN**: 1800-599-0019

Always visible in emergency support bar at bottom of app.

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Quick reference guide
- **[BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)** - Full backend setup
- **[WARP.md](./WARP.md)** - Development guide for AI agents
- **[Clerk Docs](https://clerk.com/docs)** - Authentication
- **[Convex Docs](https://docs.convex.dev)** - Backend database

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Production Checklist
- [ ] Set Clerk production keys
- [ ] Deploy Convex backend (`npx convex deploy`)
- [ ] Configure production URLs in Clerk dashboard
- [ ] Enable rate limiting
- [ ] Test crisis detection
- [ ] Verify GDPR compliance

## 🤝 Contributing

Contributions welcome! This is a mental health platform, so please:
- Follow accessibility best practices
- Maintain privacy-first principles
- Test thoroughly before submitting PRs
- Keep crisis detection sensitive and accurate

## 📄 License

MIT License - Built for student mental health ❤️

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **Convex** for real-time database
- **Clerk** for authentication
- **Radix UI** for accessible components
- **v0.app** for initial UI generation
- All contributors and supporters

---

**Built with ❤️ for student mental health**

🌉 **MindBridge** - Privacy-First Mental Wellness Platform
