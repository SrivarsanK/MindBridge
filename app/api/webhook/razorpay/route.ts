import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Parse webhook payload
    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    const orderId = payment.order_id;
    const paymentId = payment.id;

    // Get transaction
    const transaction = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "transactions:getTransactionByOrderId",
        args: { razorpayOrderId: orderId },
      }),
    }).then(res => res.json());

    if (!transaction) {
      console.error("Transaction not found for order:", orderId);
      return;
    }

    // Update transaction status
    await fetchMutation(api.transactions.updateTransaction, {
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      status: "captured",
      paymentMethod: payment.method,
    });

    // Confirm booking
    await fetchMutation(api.bookings.confirmBooking, {
      bookingId: transaction.bookingId,
    });

    console.log(`Payment captured successfully: ${paymentId}`);
  } catch (error) {
    console.error("Error handling payment.captured:", error);
    throw error;
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    const orderId = payment.order_id;
    const paymentId = payment.id;

    // Update transaction status
    await fetchMutation(api.transactions.updateTransaction, {
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      status: "failed",
      errorCode: payment.error_code,
      errorDescription: payment.error_description,
    });

    console.log(`Payment failed: ${paymentId}`);
  } catch (error) {
    console.error("Error handling payment.failed:", error);
    throw error;
  }
}
