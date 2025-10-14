"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  generateMockPaymentId,
  generateMockSignature,
  MOCK_TEST_CARDS,
} from "@/lib/mock-payment";

interface MockPaymentDialogProps {
  orderId: string;
  amount: number;
  currency: string;
  bookingId: string;
  professionalName: string;
  sessionType: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MockPaymentDialog({
  orderId,
  amount,
  currency,
  bookingId,
  professionalName,
  sessionType,
  onSuccess,
  onCancel,
}: MockPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState(MOCK_TEST_CARDS.SUCCESS);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [testScenario, setTestScenario] = useState<"success" | "failure">("success");
  const router = useRouter();

  const handlePayment = async () => {
    try {
      setLoading(true);
      setPaymentStatus("processing");

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock payment response
      const paymentId = generateMockPaymentId();
      const signature = generateMockSignature(orderId, paymentId);

      // Verify payment
      const verifyResponse = await fetch("/api/mock-payment/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: paymentId,
          signature,
          bookingId,
          testScenario,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Payment verification failed");
      }

      setPaymentStatus("success");
      toast.success("Mock payment successful! 🎉");
      
      // Wait a bit to show success state
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      onSuccess();
      router.push(`/bookings/${bookingId}`);
    } catch (error: any) {
      console.error("Mock payment error:", error);
      setPaymentStatus("failed");
      toast.error(error.message || "Payment failed");
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(" ");
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Mock Payment Gateway
          </DialogTitle>
          <DialogDescription>
            Testing payment for {sessionType} session with {professionalName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Summary */}
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-xs">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-lg">
                  {currency} {(amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Professional (85%)</span>
                <span>{currency} {(amount * 0.85 / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Platform Fee (15%)</span>
                <span>{currency} {(amount * 0.15 / 100).toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Test Scenario Selection */}
          <div className="space-y-2">
            <Label>Test Scenario</Label>
            <RadioGroup value={testScenario} onValueChange={(v) => setTestScenario(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="success" id="success" />
                <Label htmlFor="success" className="font-normal cursor-pointer">
                  ✅ Success - Payment will complete successfully
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="failure" id="failure" />
                <Label htmlFor="failure" className="font-normal cursor-pointer">
                  ❌ Failure - Payment will fail
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Mock Card Input */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number (Mock)</Label>
            <Input
              id="cardNumber"
              placeholder="4111 1111 1111 1111"
              value={formatCardNumber(cardNumber)}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
              maxLength={19}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Use test cards: Success (4111...), Failure (4000...)
            </p>
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry (Mock)</Label>
              <Input
                id="expiry"
                placeholder="12/28"
                defaultValue="12/28"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV (Mock)</Label>
              <Input
                id="cvv"
                placeholder="123"
                defaultValue="123"
                type="password"
                maxLength={3}
                className="font-mono"
              />
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus === "processing" && (
            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400">
                    Processing payment...
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500">
                    Please wait while we process your payment
                  </p>
                </div>
              </div>
            </Card>
          )}

          {paymentStatus === "success" && (
            <Card className="p-4 bg-green-500/10 border-green-500/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">
                    Payment successful!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    Redirecting to booking details...
                  </p>
                </div>
              </div>
            </Card>
          )}

          {paymentStatus === "failed" && (
            <Card className="p-4 bg-red-500/10 border-red-500/20">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">
                    Payment failed
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500">
                    Please try again or contact support
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading || paymentStatus === "success"}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${currency} ${(amount / 100).toFixed(2)}`
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          🧪 Mock Payment Gateway - For Testing Only
        </p>
      </DialogContent>
    </Dialog>
  );
}
