# Clerk + Razorpay Integration for MindBridge Professional Support

## Overview
Complete integration guide for enabling payments to counselors, therapists, and psychiatrists using Clerk authentication + Razorpay Marketplace.

---

## 1. Prerequisites

### Required Accounts & Packages
- ✅ Clerk account with billing enabled
- ✅ Razorpay account with **Marketplace (Partners)** access
- ✅ Next.js 15+ (already in use)
- ✅ Convex backend (already in use)

### Install Required Packages
```bash
npm install razorpay @clerk/nextjs
npm install --save-dev @types/razorpay
```

### Environment Variables
Add to `.env.local`:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

---

## 2. Database Schema Updates

### Convex Schema Extensions
Add to `convex/schema.ts`:

```typescript
// Professional/Seller profiles
professionals: defineTable({
  userId: v.id("users"),
  name: v.string(),
  title: v.string(), // "Clinical Psychologist", "Psychiatrist", etc.
  specializations: v.array(v.string()),
  languages: v.array(v.string()),
  experience: v.string(),
  verified: v.boolean(),
  
  // Razorpay Integration
  razorpaySubAccountId: v.optional(v.string()),
  
  // Pricing (per session type)
  sessionPrices: v.object({
    video: v.number(), // in paise (INR)
    phone: v.number(),
    chat: v.number(),
  }),
  
  // Payout details
  bankAccount: v.optional(v.object({
    accountNumber: v.string(),
    ifsc: v.string(),
    accountHolderName: v.string(),
  })),
  
  // Availability
  availability: v.array(v.object({
    day: v.string(),
    slots: v.array(v.object({
      startTime: v.string(),
      endTime: v.string(),
    })),
  })),
})
.index("by_userId", ["userId"])
.index("by_subAccountId", ["razorpaySubAccountId"]),

// Bookings
bookings: defineTable({
  userId: v.id("users"), // Client
  professionalId: v.id("professionals"),
  
  sessionType: v.union(
    v.literal("video"),
    v.literal("phone"),
    v.literal("chat")
  ),
  
  scheduledAt: v.number(), // timestamp
  duration: v.number(), // in minutes
  
  // Payment details
  amount: v.number(), // in paise
  currency: v.string(), // "INR"
  razorpayOrderId: v.optional(v.string()),
  razorpayPaymentId: v.optional(v.string()),
  razorpaySignature: v.optional(v.string()),
  
  // Status
  status: v.union(
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("completed"),
    v.literal("cancelled"),
    v.literal("refunded")
  ),
  
  // Notes
  clientNotes: v.optional(v.string()),
  professionalNotes: v.optional(v.string()),
})
.index("by_user", ["userId"])
.index("by_professional", ["professionalId"])
.index("by_order", ["razorpayOrderId"])
.index("by_status", ["status"]),

// Payment transactions
transactions: defineTable({
  bookingId: v.id("bookings"),
  razorpayOrderId: v.string(),
  razorpayPaymentId: v.optional(v.string()),
  amount: v.number(),
  currency: v.string(),
  status: v.string(),
  createdAt: v.number(),
})
.index("by_booking", ["bookingId"])
.index("by_order", ["razorpayOrderId"]),
```

---

## 3. Backend Implementation

### File: `lib/razorpay.ts`
```typescript
import Razorpay from "razorpay"

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Create sub-account for professional
export async function createSubAccount(professional: {
  name: string
  email: string
  phone: string
  bankAccount: {
    accountNumber: string
    ifsc: string
    accountHolderName: string
  }
}) {
  const subAccount = await razorpay.subscriptions.createSubaccount({
    name: professional.name,
    type: "individual",
    email: professional.email,
    contact: professional.phone,
    payout_settings: {
      method: "bank_transfer",
      bank_account: {
        account_number: professional.bankAccount.accountNumber,
        ifsc_code: professional.bankAccount.ifsc,
        beneficiary_name: professional.bankAccount.accountHolderName,
      },
    },
  })

  return subAccount.id
}

// Validate Razorpay signature
export function validateSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require("crypto")
  const secret = process.env.RAZORPAY_KEY_SECRET!

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex")

  return expectedSignature === signature
}
```

### File: `convex/professionals.ts`
```typescript
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Register professional
export const registerProfessional = mutation({
  args: {
    name: v.string(),
    title: v.string(),
    specializations: v.array(v.string()),
    languages: v.array(v.string()),
    experience: v.string(),
    sessionPrices: v.object({
      video: v.number(),
      phone: v.number(),
      chat: v.number(),
    }),
    bankAccount: v.object({
      accountNumber: v.string(),
      ifsc: v.string(),
      accountHolderName: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const userId = identity.subject

    // Create professional profile
    const professionalId = await ctx.db.insert("professionals", {
      userId: userId as any,
      name: args.name,
      title: args.title,
      specializations: args.specializations,
      languages: args.languages,
      experience: args.experience,
      verified: false, // Requires admin verification
      sessionPrices: args.sessionPrices,
      bankAccount: args.bankAccount,
      availability: [],
    })

    return professionalId
  },
})

// Get all verified professionals
export const getVerifiedProfessionals = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("professionals")
      .filter((q) => q.eq(q.field("verified"), true))
      .collect()
  },
})

// Get professional by ID
export const getProfessional = query({
  args: { professionalId: v.id("professionals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.professionalId)
  },
})
```

---

## 4. API Routes

### File: `app/api/create-order/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server"
import { razorpay } from "@/lib/razorpay"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  try {
    const { professionalId, sessionType, scheduledAt } = await req.json()

    // Get professional details
    const professional = await convex.query(api.professionals.getProfessional, {
      professionalId,
    })

    if (!professional) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      )
    }

    const amount = professional.sessionPrices[sessionType as keyof typeof professional.sessionPrices]

    // Create Razorpay order with split payment
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        professionalId,
        sessionType,
        scheduledAt: scheduledAt.toString(),
      },
      splits: [
        {
          sub_account: professional.razorpaySubAccountId!,
          amount: Math.floor(amount * 0.85), // 85% to professional
          currency: "INR",
        },
      ],
    })

    // Create booking in database
    const bookingId = await convex.mutation(api.bookings.createBooking, {
      professionalId,
      sessionType,
      scheduledAt,
      amount,
      currency: "INR",
      razorpayOrderId: order.id,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      bookingId,
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
```

### File: `app/api/verify-payment/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server"
import { razorpay, validateSignature } from "@/lib/razorpay"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json()

    // Validate signature
    const isValid = validateSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Capture payment
    const payment = await razorpay.payments.fetch(razorpay_payment_id)
    await razorpay.payments.capture(
      razorpay_payment_id,
      payment.amount,
      payment.currency
    )

    // Update booking status
    await convex.mutation(api.bookings.confirmBooking, {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    })

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    )
  }
}
```

### File: `app/api/webhook/razorpay/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  try {
    const event = await req.json()

    if (event.event === "payment.captured") {
      const { order_id, payment_id } = event.payload.payment.entity

      // Update booking to confirmed
      await convex.mutation(api.bookings.confirmBooking, {
        razorpayOrderId: order_id,
        razorpayPaymentId: payment_id,
        razorpaySignature: "", // Not needed for webhook
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
```

---

## 5. Frontend Component

### File: `components/booking-payment.tsx`
```typescript
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface BookingPaymentProps {
  professionalId: string
  sessionType: "video" | "phone" | "chat"
  amount: number
  professionalName: string
  scheduledAt: number
}

export function BookingPayment({
  professionalId,
  sessionType,
  amount,
  professionalName,
  scheduledAt,
}: BookingPaymentProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Create order
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          sessionType,
          scheduledAt,
        }),
      })

      const { orderId, amount: orderAmount, bookingId } = await response.json()

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderAmount,
        currency: "INR",
        name: "MindBridge",
        description: `${sessionType} session with ${professionalName}`,
        order_id: orderId,
        handler: async (response: any) => {
          // Verify payment
          await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          })

          router.push(`/bookings/${bookingId}/success`)
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#0f766e", // primary color
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Payment error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className="w-full"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Pay ₹${amount / 100}`
      )}
    </Button>
  )
}
```

---

## 6. Integration Steps

### Step 1: Add Razorpay Script
In `app/layout.tsx`:
```tsx
<Script src="https://checkout.razorpay.com/v1/checkout.js" />
```

### Step 2: Update Professional Support Page
Integrate booking flow with payment component

### Step 3: Configure Razorpay Webhook
In Razorpay Dashboard:
- Webhook URL: `https://yourdomain.com/api/webhook/razorpay`
- Events: `payment.captured`, `payment.failed`
- Secret: Copy to `.env.local`

### Step 4: Test Flow
1. Register professional with bank details
2. Admin verifies professional
3. Create Razorpay sub-account via API
4. Client books session
5. Payment splits automatically (85% to professional, 15% platform)

---

## 7. Key Benefits

✅ **Sellers (Professionals)**:
- Manage own pricing
- Direct payouts to bank account
- 85% revenue share

✅ **Buyers (Clients)**:
- Secure Razorpay checkout
- Save cards for future (via Clerk)
- Instant booking confirmation

✅ **Platform**:
- 15% commission via splits
- Automated compliance
- Professional verification workflow

---

## Security Considerations

1. **Never expose secrets** in client-side code
2. **Validate all payments** on server-side
3. **Use webhook secrets** for verification
4. **Implement rate limiting** on API routes
5. **Store sensitive data** encrypted

---

## Next Steps

1. Install packages: `npm install razorpay @clerk/nextjs`
2. Add environment variables
3. Update Convex schema
4. Create API routes
5. Build booking UI
6. Test in Razorpay test mode
7. Deploy and enable production keys

