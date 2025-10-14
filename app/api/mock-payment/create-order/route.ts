import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { createMockOrder } from "@/lib/mock-payment";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Mock Create Order API
 * Simulates Razorpay order creation for testing
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    // Create mock order
    const mockOrder = await createMockOrder({
      amount: booking.amount,
      currency: booking.currency,
      professionalId,
      userId,
    });

    // Update booking with order ID
    await fetchMutation(api.bookings.updateBookingPayment, {
      bookingId: booking.bookingId as Id<"bookings">,
      razorpayOrderId: mockOrder.orderId,
    });

    // Create transaction record
    await fetchMutation(api.transactions.createTransaction, {
      bookingId: booking.bookingId as Id<"bookings">,
      razorpayOrderId: mockOrder.orderId,
      amount: booking.amount,
      currency: booking.currency,
    });

    return NextResponse.json({
      orderId: mockOrder.orderId,
      amount: booking.amount,
      currency: booking.currency,
      bookingId: booking.bookingId,
      isMockPayment: true,
      message: "Mock payment order created successfully",
    });
  } catch (error: any) {
    console.error("Error creating mock order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
