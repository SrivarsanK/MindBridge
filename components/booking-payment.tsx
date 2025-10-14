"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, TestTube2 } from "lucide-react";
import { toast } from "sonner";
import { MockPaymentDialog } from "./mock-payment-dialog";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Toggle between mock and real payment
const USE_MOCK_PAYMENT = true;

interface BookingPaymentProps {
  professionalId: string;
  professionalName: string;
  sessionType: "video" | "phone" | "chat";
  scheduledAt: number;
  duration: number;
  amount: number; // in paise
}

export function BookingPayment({
  professionalId,
  professionalName,
  sessionType,
  scheduledAt,
  duration,
  amount,
}: BookingPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [showMockPayment, setShowMockPayment] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const router = useRouter();

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Determine API endpoint based on mock/real payment
      const endpoint = USE_MOCK_PAYMENT 
        ? "/api/mock-payment/create-order"
        : "/api/create-order";

      // Create order
      const orderResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          professionalId,
          sessionType,
          scheduledAt,
          duration,
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || "Failed to create order");
      }

      const data = await orderResponse.json();
      setOrderData(data);

      if (USE_MOCK_PAYMENT) {
        // Show mock payment dialog
        setShowMockPayment(true);
        setLoading(false);
        return;
      }

      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "MindBridge",
        description: `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} session with ${professionalName}`,
        handler: async function (response: any) {
          // Payment successful
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                bookingId: orderData.bookingId,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            toast.success("Booking confirmed!");
            router.push(`/bookings/${orderData.bookingId}`);
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#2dd4bf", // Primary color
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Payment Details</h3>
            <p className="text-sm text-muted-foreground">
              Complete your booking with {professionalName}
            </p>
          </div>

          {USE_MOCK_PAYMENT && (
            <Card className="p-3 bg-amber-500/10 border-amber-500/20">
              <div className="flex items-start gap-2">
                <TestTube2 className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-700 dark:text-amber-400">
                  <p className="font-semibold">Mock Payment Mode</p>
                  <p>Using simulated payment gateway for testing</p>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Session Type</span>
              <span className="text-sm font-medium">
                {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="text-sm font-medium">{duration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Scheduled</span>
              <span className="text-sm font-medium">
                {new Date(scheduledAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">Total Amount</span>
              <span className="font-semibold">₹{amount / 100}</span>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {USE_MOCK_PAYMENT && <TestTube2 className="mr-2 h-4 w-4" />}
                Pay ₹{amount / 100}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {USE_MOCK_PAYMENT 
              ? "🧪 Mock payment gateway for testing"
              : "Secure payment powered by Razorpay"}
          </p>
        </div>
      </Card>

      {/* Mock Payment Dialog */}
      {showMockPayment && orderData && (
        <MockPaymentDialog
          orderId={orderData.orderId}
          amount={orderData.amount}
          currency={orderData.currency}
          bookingId={orderData.bookingId}
          professionalName={professionalName}
          sessionType={sessionType}
          onSuccess={() => {
            setShowMockPayment(false);
            toast.success("Booking confirmed!");
          }}
          onCancel={() => {
            setShowMockPayment(false);
            setLoading(false);
            toast.info("Payment cancelled");
          }}
        />
      )}
    </>
  );
}
