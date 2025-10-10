# 🌉 MindBridge - Privacy-First Mental Wellness Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/bindsrinesh-2003s-projects/v0-mind-bridge-ui-ux-design)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=for-the-badge)](https://clerk.com)

> **A production-ready mental wellness platform for students with enterprise-grade security, privacy-first architecture, and premium UI/UX design.**

## 📖 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Guide](#-setup-guide)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## 🎯 Overview

**MindBridge** is a comprehensive mental health support platform designed specifically for students. It combines AI-powered companionship, mood tracking, dream analysis, and peer support in a secure, privacy-first environment.

### Why MindBridge?

- ✅ **Privacy-First**: On-device processing, encrypted data, GDPR/CCPA compliant
- ✅ **Crisis-Aware**: Multi-level crisis detection with automatic escalation
- ✅ **AI-Powered**: GPT-4 chatbot with contextual emotional support
- ✅ **Peer Support**: Anonymous peer matching with E2E encryption
- ✅ **Beautiful UI**: Premium design with smooth animations and accessibility
- ✅ **Multi-Language**: Support for 6 Indian languages

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** installed
- **Clerk account** (for authentication) - [Sign up here](https://clerk.com)
- **Convex account** (optional, for backend) - [Sign up here](https://convex.dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/SrivarsanK/MindBridge.git
cd MindBridge

# Install dependencies
pnpm install
```

### Running Locally

**Option 1: Quick Preview (No Setup Required)**

```bash
pnpm dev
```

Visit <http://localhost:3000> - The app will work with guest mode and mock data.

**Option 2: Full Setup (With Authentication)**

1. Create `.env.local` file in the root directory
2. Add your Clerk API keys (see [Setup Guide](#setup-guide))
3. Run the development server:

```bash
pnpm dev
```

---

## ✨ Features

### 🎯 Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **AI Companion** | 24/7 GPT-4 powered emotional support chatbot | ✅ Ready |
| **Crisis Detection** | Multi-level crisis detection with auto-escalation | ✅ Ready |
| **Dream Analysis** | Emotional pattern recognition from dream journals | ✅ Ready |
| **Peer Matching** | Anonymous peer-to-peer support connections | ✅ Ready |
| **Mood Tracking** | Daily mood check-ins with visualization | ✅ Ready |
| **Quick Relief** | Breathing exercises and grounding techniques | ✅ Ready |

### 🔒 Security & Privacy

- **On-Device Processing**: Sensitive data encrypted before storage
- **End-to-End Encryption**: Peer messages fully encrypted
- **GDPR/CCPA Compliant**: Data export, deletion, and retention controls
- **Role-Based Access**: Student, moderator, and crisis responder roles
- **Audit Logging**: Comprehensive activity tracking
- **Anonymous Mode**: Optional pseudonym generation

### 🌐 Localization

Supports 6 languages:
- English (India) - `en-IN`
- Hindi - `hi`
- Bengali - `bn`
- Tamil - `ta`
- Telugu - `te`
- Marathi - `mr`

---

## 🏗️ Tech Stack

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org)
- **UI Library**: [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Charts**: [Recharts](https://recharts.org)

### Backend

- **Authentication**: [Clerk](https://clerk.com)
- **Database**: [Convex](https://convex.dev) (Real-time serverless)
- **AI**: [OpenAI GPT-4](https://openai.com)

### Dev Tools

- **Package Manager**: pnpm
- **Linting**: ESLint
- **Deployment**: Vercel

---

## 📂 Project Structure

```plaintext
MindBridge/
├── app/                           # Next.js App Router
│   ├── (marketing)/               # Public pages
│   │   └── page.tsx              # Landing page
│   ├── dashboard/                 # Protected dashboard
│   │   └── page.tsx              # Main dashboard
│   ├── login/                     # Authentication
│   │   └── page.tsx              # Login page
│   ├── onboarding/                # 4-step onboarding
│   │   ├── step-1/               # Privacy consent
│   │   ├── step-2/               # Language selection
│   │   ├── step-3/               # Initial mood
│   │   └── step-4/               # Feature tour
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
│
├── components/                    # React components
│   ├── dashboard/                 # Dashboard feature cards
│   │   ├── ai-companion-card.tsx
│   │   ├── daily-checkin-card.tsx
│   │   ├── dream-analysis-card.tsx
│   │   ├── micro-interventions-card.tsx
│   │   └── peer-matching-card.tsx
│   ├── ui/                        # Reusable UI components
│   └── emergency-support-bar.tsx  # Crisis hotline bar
│
├── convex/                        # Convex backend
│   ├── schema.ts                  # Database schema (15 tables)
│   ├── chatbot.ts                 # AI chatbot logic
│   ├── crisis.ts                  # Crisis detection
│   ├── peerMatching.ts            # Peer algorithm
│   ├── dreamAnalysis.ts           # Dream patterns
│   └── privacy.ts                 # GDPR compliance
│
├── lib/                           # Utility functions
│   ├── utils.ts                   # Helper functions
│   └── emergency.ts               # Crisis hotlines
│
├── middleware.ts                  # Clerk auth middleware
├── .env.local                     # Environment variables
└── README.md                      # This file
```

---

## 📚 Setup Guide

### Step 1: Clone and Install

```bash
git clone https://github.com/SrivarsanK/MindBridge.git
cd MindBridge
pnpm install
```

### Step 2: Configure Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Go to **API Keys** in the dashboard
4. Copy your keys and add them to `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/step-1
```

### Step 3: Configure Convex Backend (Optional)

1. Go to [convex.dev](https://convex.dev) and sign up
2. Install Convex CLI:

```bash
npx convex dev
```

3. Follow the prompts to create a deployment
4. Add the generated URLs to `.env.local`:

```env
# Convex Backend
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Step 4: Add OpenAI API Key (Optional)

For AI chatbot functionality:

```env
# OpenAI API
CONVEX_OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Step 5: Run the Application

```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Deploy!

### Deploy Convex Backend

```bash
npx convex deploy
```

Update your Vercel environment variables with the production Convex URL.

### Production Checklist

- [ ] Update Clerk keys to production keys
- [ ] Deploy Convex backend to production
- [ ] Configure Clerk production URLs
- [ ] Test all authentication flows
- [ ] Verify crisis detection works
- [ ] Test GDPR data export
- [ ] Enable rate limiting
- [ ] Set up monitoring and analytics

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](./QUICK_START.md) | Quick reference guide |
| [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md) | Full backend setup instructions |
| [WARP.md](./WARP.md) | Development guide for AI agents |
| [Clerk Docs](https://clerk.com/docs) | Authentication documentation |
| [Convex Docs](https://docs.convex.dev) | Backend database documentation |

---

## 🆘 Emergency Resources

MindBridge includes built-in crisis support with Indian mental health hotlines:

- **Tele-MANAS**: 14416 / 1800-891-4416
- **KIRAN**: 1800-599-0019

These are always visible in the emergency support bar at the bottom of the app.

---

## 🤝 Contributing

We welcome contributions! This is a mental health platform, so please:

1. **Follow best practices**: Accessibility, privacy, and security
2. **Test thoroughly**: Especially crisis detection features
3. **Maintain sensitivity**: Handle mental health topics with care
4. **Document changes**: Update README and comments

### Development Workflow

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and test
pnpm dev

# Build and verify
pnpm build

# Commit and push
git commit -m "Add your feature"
git push origin feature/your-feature-name

# Create a pull request
```

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

---

## 🙏 Acknowledgments

- **OpenAI** - GPT-4 API for AI companionship
- **Convex** - Real-time serverless database
- **Clerk** - Authentication infrastructure
- **Radix UI** - Accessible component primitives
- **Vercel** - Deployment and hosting
- **v0.app** - Initial UI generation
- All contributors and mental health advocates

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/SrivarsanK/MindBridge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SrivarsanK/MindBridge/discussions)
- **Email**: support@mindbridge.app

---

**Built with ❤️ for student mental health**

🌉 **MindBridge** - Privacy-First Mental Wellness Platform
