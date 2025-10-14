import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { validateMockSignature, processMockPayment } from "@/lib/mock-payment";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Mock Verify Payment API
 * Simulates payment verification for testing
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

    const { order_id, payment_id, signature, bookingId, testScenario } = await req.json();

    // Validate input
    if (!order_id || !payment_id || !signature || !bookingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate mock signature
    const isValid = validateMockSignature(order_id, payment_id, signature);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Simulate payment processing
    const scenario = testScenario || "success";
    
    try {
      await processMockPayment(order_id, 0, scenario);
    } catch (error) {
      // Update transaction as failed
      await fetchMutation(api.transactions.updateTransaction, {
        razorpayOrderId: order_id,
        razorpayPaymentId: payment_id,
        status: "failed",
        errorDescription: "Mock payment failed",
      });
      
      return NextResponse.json(
        { error: "Payment processing failed" },
        { status: 400 }
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
      paymentMethod: "mock_card",
    });

    return NextResponse.json({
      success: true,
      bookingId,
      isMockPayment: true,
      message: "Mock payment verified and booking confirmed",
    });
  } catch (error: any) {
    console.error("Error verifying mock payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
