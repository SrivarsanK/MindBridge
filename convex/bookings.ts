import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new booking
 * This is called when user selects a time slot and proceeds to payment
 */
export const createBooking = mutation({
  args: {
    professionalId: v.id("professionals"),
    sessionType: v.union(v.literal("video"), v.literal("phone"), v.literal("chat")),
    scheduledAt: v.number(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get professional details
    const professional = await ctx.db.get(args.professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }

    if (!professional.verified || professional.status !== "active") {
      throw new Error("Professional is not available");
    }

    // Get session price
    const amount = professional.sessionPrices[args.sessionType];

    // Create booking
    const bookingId = await ctx.db.insert("bookings", {
      userId: identity.subject as any,
      professionalId: args.professionalId,
      sessionType: args.sessionType,
      scheduledAt: args.scheduledAt,
      duration: args.duration,
      amount,
      currency: "INR",
      status: "pending",
      createdAt: Date.now(),
    });

    return {
      bookingId,
      amount,
      currency: "INR",
    };
  },
});

/**
 * Update booking with payment details
 */
export const updateBookingPayment = mutation({
  args: {
    bookingId: v.id("bookings"),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    razorpaySignature: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking || booking.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.bookingId, {
      razorpayOrderId: args.razorpayOrderId,
      razorpayPaymentId: args.razorpayPaymentId,
      razorpaySignature: args.razorpaySignature,
    });
  },
});

/**
 * Confirm a booking (after payment verification)
 */
export const confirmBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      confirmedAt: Date.now(),
    });

    // Update professional stats
    const professional = await ctx.db.get(booking.professionalId);
    if (professional) {
      await ctx.db.patch(booking.professionalId, {
        totalSessions: professional.totalSessions + 1,
      });
    }
  },
});

/**
 * Complete a booking
 */
export const completeBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify authorization (user or professional can complete)
    const professional = await ctx.db
      .query("professionals")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    const isAuthorized =
      booking.userId === identity.subject ||
      (professional && professional._id === booking.professionalId);

    if (!isAuthorized) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.bookingId, {
      status: "completed",
      completedAt: Date.now(),
      notes: args.notes,
    });
  },
});

/**
 * Cancel a booking
 */
export const cancelBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify authorization
    const professional = await ctx.db
      .query("professionals")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    const isUser = booking.userId === identity.subject;
    const isProfessional = professional && professional._id === booking.professionalId;

    if (!isUser && !isProfessional) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      cancelledAt: Date.now(),
      cancellationReason: args.reason,
      cancelledBy: isUser ? "user" : "professional",
    });
  },
});

/**
 * Get user's bookings
 */
export const getUserBookings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .collect();

    // Fetch professional details for each booking
    const bookingsWithProfessionals = await Promise.all(
      bookings.map(async (booking) => {
        const professional = await ctx.db.get(booking.professionalId);
        return {
          ...booking,
          professional,
        };
      })
    );

    return bookingsWithProfessionals;
  },
});

/**
 * Get professional's bookings
 */
export const getProfessionalBookings = query({
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

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_professional_id", (q) => q.eq("professionalId", professional._id))
      .order("desc")
      .collect();

    return bookings;
  },
});

/**
 * Get single booking details
 */
export const getBooking = query({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      return null;
    }

    const professional = await ctx.db.get(booking.professionalId);
    
    return {
      ...booking,
      professional,
    };
  },
});
