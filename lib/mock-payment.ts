/**
 * Mock Payment Gateway using Clerk
 * Simulates payment processing for testing without real payment integration
 */

export interface MockPaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  professionalId: string;
  userId: string;
  status: "pending" | "success" | "failed";
  createdAt: number;
}

export interface MockPaymentResponse {
  success: boolean;
  orderId: string;
  paymentId: string;
  signature: string;
  amount: number;
  timestamp: number;
}

/**
 * Generate a mock order ID
 */
export function generateMockOrderId(): string {
  return `mock_order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a mock payment ID
 */
export function generateMockPaymentId(): string {
  return `mock_pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a mock signature
 */
export function generateMockSignature(orderId: string, paymentId: string): string {
  return `mock_signature_${orderId}_${paymentId}`;
}

/**
 * Validate mock payment signature
 */
export function validateMockSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const expectedSignature = generateMockSignature(orderId, paymentId);
  return signature === expectedSignature;
}

/**
 * Create a mock payment order
 */
export async function createMockOrder(params: {
  amount: number;
  currency: string;
  professionalId: string;
  userId: string;
}): Promise<MockPaymentOrder> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const orderId = generateMockOrderId();

  return {
    orderId,
    amount: params.amount,
    currency: params.currency,
    professionalId: params.professionalId,
    userId: params.userId,
    status: "pending",
    createdAt: Date.now(),
  };
}

/**
 * Process a mock payment
 * Simulates payment success/failure based on test scenarios
 */
export async function processMockPayment(
  orderId: string,
  amount: number,
  testScenario: "success" | "failure" = "success"
): Promise<MockPaymentResponse> {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (testScenario === "failure") {
    throw new Error("Mock payment failed");
  }

  const paymentId = generateMockPaymentId();
  const signature = generateMockSignature(orderId, paymentId);

  return {
    success: true,
    orderId,
    paymentId,
    signature,
    amount,
    timestamp: Date.now(),
  };
}

/**
 * Simulate split payment (85% to professional, 15% to platform)
 */
export function calculateSplitPayment(amount: number) {
  const platformFee = Math.floor(amount * 0.15); // 15%
  const professionalAmount = amount - platformFee; // 85%

  return {
    totalAmount: amount,
    platformFee,
    professionalAmount,
    platformPercentage: 15,
    professionalPercentage: 85,
  };
}

/**
 * Mock webhook event
 */
export interface MockWebhookEvent {
  event: "payment.captured" | "payment.failed";
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
      };
    };
  };
}

/**
 * Generate a mock webhook event
 */
export function generateMockWebhook(
  orderId: string,
  paymentId: string,
  amount: number,
  status: "captured" | "failed"
): MockWebhookEvent {
  return {
    event: status === "captured" ? "payment.captured" : "payment.failed",
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount,
          currency: "INR",
          status,
          method: "card",
        },
      },
    },
  };
}

/**
 * Test card numbers for mock payment
 */
export const MOCK_TEST_CARDS = {
  SUCCESS: "4111111111111111",
  FAILURE: "4000000000000002",
  INSUFFICIENT_FUNDS: "4000000000000341",
  EXPIRED: "4000000000000069",
};

/**
 * Determine payment outcome based on card number
 */
export function getMockPaymentOutcome(cardNumber: string): "success" | "failure" {
  if (cardNumber === MOCK_TEST_CARDS.SUCCESS) {
    return "success";
  }
  return "failure";
}
