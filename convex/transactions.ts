import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a transaction record
 */
export const createTransaction = mutation({
  args: {
    bookingId: v.id("bookings"),
    razorpayOrderId: v.string(),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const professional = await ctx.db.get(booking.professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }

    // Calculate split amounts
    const platformFee = Math.floor(args.amount * 0.15); // 15%
    const professionalAmount = args.amount - platformFee; // 85%

    const transactionId = await ctx.db.insert("transactions", {
      bookingId: args.bookingId,
      userId: booking.userId,
      professionalId: booking.professionalId,
      razorpayOrderId: args.razorpayOrderId,
      amount: args.amount,
      currency: args.currency,
      platformFee,
      professionalAmount,
      status: "created",
      createdAt: Date.now(),
    });

    return transactionId;
  },
});

/**
 * Update transaction with payment details
 */
export const updateTransaction = mutation({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    status: v.union(
      v.literal("authorized"),
      v.literal("captured"),
      v.literal("refunded"),
      v.literal("failed")
    ),
    paymentMethod: v.optional(v.string()),
    errorCode: v.optional(v.string()),
    errorDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_razorpay_order", (q) => q.eq("razorpayOrderId", args.razorpayOrderId))
      .first();

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const updateData: any = {
      razorpayPaymentId: args.razorpayPaymentId,
      status: args.status,
      paymentMethod: args.paymentMethod,
      errorCode: args.errorCode,
      errorDescription: args.errorDescription,
    };

    if (args.status === "captured") {
      updateData.capturedAt = Date.now();
    } else if (args.status === "refunded") {
      updateData.refundedAt = Date.now();
    }

    await ctx.db.patch(transaction._id, updateData);

    return transaction._id;
  },
});

/**
 * Get transaction by order ID
 */
export const getTransactionByOrderId = query({
  args: {
    razorpayOrderId: v.string(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_razorpay_order", (q) => q.eq("razorpayOrderId", args.razorpayOrderId))
      .first();

    return transaction;
  },
});

/**
 * Get transactions for a user
 */
export const getUserTransactions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .collect();

    // Fetch booking details for each transaction
    const transactionsWithDetails = await Promise.all(
      transactions.map(async (transaction) => {
        const booking = await ctx.db.get(transaction.bookingId);
        const professional = await ctx.db.get(transaction.professionalId);
        return {
          ...transaction,
          booking,
          professional,
        };
      })
    );

    return transactionsWithDetails;
  },
});

/**
 * Get transactions for a professional
 */
export const getProfessionalTransactions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get professional profile
    const professional = await ctx.db
      .query("professionals")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!professional) {
      return [];
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_professional_id", (q) => q.eq("professionalId", professional._id))
      .order("desc")
      .collect();

    // Fetch booking details for each transaction
    const transactionsWithDetails = await Promise.all(
      transactions.map(async (transaction) => {
        const booking = await ctx.db.get(transaction.bookingId);
        return {
          ...transaction,
          booking,
        };
      })
    );

    return transactionsWithDetails;
  },
});
