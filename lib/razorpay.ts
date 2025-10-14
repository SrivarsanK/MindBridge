import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * Create a Razorpay sub-account for a professional
 * This allows for split payments where the professional receives 85% directly
 */
export async function createSubAccount(professional: {
  name: string;
  email: string;
  contact: string;
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
}) {
  try {
    const subAccount = await razorpay.subscriptions.createSubaccount({
      name: professional.name,
      type: "individual",
      email: professional.email,
      contact: professional.contact,
      payout_settings: {
        method: "bank_transfer",
        bank_account: {
          account_number: professional.bankAccount.accountNumber,
          ifsc_code: professional.bankAccount.ifscCode,
          beneficiary_name: professional.bankAccount.accountHolderName,
        },
      },
    });

    return subAccount.id;
  } catch (error) {
    console.error("Error creating Razorpay sub-account:", error);
    throw new Error("Failed to create professional payment account");
  }
}

/**
 * Validate Razorpay payment signature
 * This ensures the payment callback is authentic and from Razorpay
 */
export function validateSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Create a Razorpay order with split payment configuration
 */
export async function createOrder(params: {
  amount: number; // in paise
  currency: string;
  professionalSubAccountId: string;
}) {
  try {
    const professionalAmount = Math.floor(params.amount * 0.85); // 85% to professional
    
    const order = await razorpay.orders.create({
      amount: params.amount,
      currency: params.currency,
      splits: [
        {
          account: params.professionalSubAccountId,
          amount: professionalAmount,
          currency: params.currency,
        },
      ],
    });

    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new Error("Failed to create payment order");
  }
}

/**
 * Capture a payment
 */
export async function capturePayment(paymentId: string, amount: number, currency: string) {
  try {
    const payment = await razorpay.payments.capture(paymentId, amount, currency);
    return payment;
  } catch (error) {
    console.error("Error capturing payment:", error);
    throw new Error("Failed to capture payment");
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(paymentId: string, amount?: number) {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount, // If not provided, full amount is refunded
    });
    return refund;
  } catch (error) {
    console.error("Error refunding payment:", error);
    throw new Error("Failed to refund payment");
  }
}

export { razorpay };
