import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { createOrder } from "@/lib/razorpay";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(req: NextRequest) {
  try {
    const { professionalId, sessionType, scheduledAt, duration } = await req.json();

    // Validate input
    if (!professionalId || !sessionType || !scheduledAt || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create booking in Convex
    const booking = await fetchMutation(api.bookings.createBooking, {
      professionalId: professionalId as Id<"professionals">,
      sessionType,
      scheduledAt,
      duration,
    });

    // Get professional details to get sub-account ID
    const professional = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "professionals:getProfessional",
        args: { professionalId },
      }),
    }).then(res => res.json());

    if (!professional.razorpaySubAccountId) {
      return NextResponse.json(
        { error: "Professional payment account not configured" },
        { status: 400 }
      );
    }

    // Create Razorpay order with split payment
    const order = await createOrder({
      amount: booking.amount,
      currency: booking.currency,
      professionalSubAccountId: professional.razorpaySubAccountId,
    });

    // Update booking with order ID
    await fetchMutation(api.bookings.updateBookingPayment, {
      bookingId: booking.bookingId as Id<"bookings">,
      razorpayOrderId: order.id,
    });

    // Create transaction record
    await fetchMutation(api.transactions.createTransaction, {
      bookingId: booking.bookingId as Id<"bookings">,
      razorpayOrderId: order.id,
      amount: booking.amount,
      currency: booking.currency,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: booking.amount,
      currency: booking.currency,
      bookingId: booking.bookingId,
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
