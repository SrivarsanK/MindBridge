import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { validateSignature, capturePayment } from "@/lib/razorpay";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(req: NextRequest) {
  try {
    const { order_id, payment_id, signature, bookingId } = await req.json();

    // Validate input
    if (!order_id || !payment_id || !signature || !bookingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate Razorpay signature
    const isValid = validateSignature(order_id, payment_id, signature);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "bookings:getBooking",
        args: { bookingId },
      }),
    }).then(res => res.json());

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Capture payment
    try {
      await capturePayment(payment_id, booking.amount, booking.currency);
    } catch (error) {
      console.error("Error capturing payment:", error);
      // Update transaction as failed
      await fetchMutation(api.transactions.updateTransaction, {
        razorpayOrderId: order_id,
        razorpayPaymentId: payment_id,
        status: "failed",
        errorDescription: "Failed to capture payment",
      });
      
      return NextResponse.json(
        { error: "Failed to capture payment" },
        { status: 500 }
      );
    }

    // Update booking with payment details
    await fetchMutation(api.bookings.updateBookingPayment, {
      bookingId: bookingId as Id<"bookings">,
      razorpayOrderId: order_id,
      razorpayPaymentId: payment_id,
      razorpaySignature: signature,
    });

    // Confirm booking
    await fetchMutation(api.bookings.confirmBooking, {
      bookingId: bookingId as Id<"bookings">,
    });

    // Update transaction
    await fetchMutation(api.transactions.updateTransaction, {
      razorpayOrderId: order_id,
      razorpayPaymentId: payment_id,
      status: "captured",
    });

    return NextResponse.json({
      success: true,
      bookingId,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
