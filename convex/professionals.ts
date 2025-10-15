import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Register a new professional
 * This creates the professional profile and can be called after user fills registration form
 */
export const registerProfessional = mutation({
  args: {
    name: v.string(),
    title: v.string(),
    specializations: v.array(v.string()),
    languages: v.array(v.string()),
    experience: v.number(),
    qualifications: v.array(v.string()),
    bio: v.string(),
    profileImage: v.optional(v.string()),
    sessionPrices: v.object({
      video: v.number(),
      phone: v.number(),
      chat: v.number(),
    }),
    availability: v.array(
      v.object({
        day: v.union(
          v.literal("monday"),
          v.literal("tuesday"),
          v.literal("wednesday"),
          v.literal("thursday"),
          v.literal("friday"),
          v.literal("saturday"),
          v.literal("sunday")
        ),
        slots: v.array(
          v.object({
            start: v.string(),
            end: v.string(),
          })
        ),
      })
    ),
    bankAccount: v.optional(
      v.object({
        accountNumber: v.string(),
        ifscCode: v.string(),
        accountHolderName: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if professional profile already exists
    const existingProfessional = await ctx.db
      .query("professionals")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .first();

    if (existingProfessional) {
      throw new Error("Professional profile already exists");
    }

    // Create professional profile
    const professionalId = await ctx.db.insert("professionals", {
      userId: identity.subject as any,
      name: args.name,
      title: args.title,
      specializations: args.specializations,
      languages: args.languages,
      experience: args.experience,
      qualifications: args.qualifications,
      bio: args.bio,
      profileImage: args.profileImage,
      sessionPrices: args.sessionPrices,
      availability: args.availability,
      bankAccount: args.bankAccount,
      verified: false,
      status: "pending",
      totalSessions: 0,
      averageRating: 0,
      totalReviews: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return professionalId;
  },
});

/**
 * Update professional's Razorpay sub-account ID
 * Called after successful sub-account creation
 */
export const updateRazorpaySubAccount = mutation({
  args: {
    professionalId: v.id("professionals"),
    razorpaySubAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the professional belongs to this user
    const professional = await ctx.db.get(args.professionalId);
    if (!professional || professional.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.professionalId, {
      razorpaySubAccountId: args.razorpaySubAccountId,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get verified professionals (for listing page)
 */
export const getVerifiedProfessionals = query({
  args: {
    specialization: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let professionals = await ctx.db
      .query("professionals")
      .withIndex("by_verified", (q) => q.eq("verified", true))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Filter by specialization if provided
    if (args.specialization) {
      professionals = professionals.filter((p) =>
        p.specializations.includes(args.specialization!)
      );
    }

    // Filter by language if provided
    if (args.language) {
      professionals = professionals.filter((p) =>
        p.languages.includes(args.language!)
      );
    }

    return professionals;
  },
});

/**
 * Get single professional details
 */
export const getProfessional = query({
  args: {
    professionalId: v.id("professionals"),
  },
  handler: async (ctx, args) => {
    const professional = await ctx.db.get(args.professionalId);
    
    if (!professional) {
      throw new Error("Professional not found");
    }

    return professional;
  },
});

/**
 * Get professional by user ID
 */
export const getProfessionalByUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const professional = await ctx.db
      .query("professionals")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .first();

    return professional;
  },
});

/**
 * Update professional profile
 */
export const updateProfessional = mutation({
  args: {
    professionalId: v.id("professionals"),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    specializations: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    experience: v.optional(v.number()),
    qualifications: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    sessionPrices: v.optional(
      v.object({
        video: v.number(),
        phone: v.number(),
        chat: v.number(),
      })
    ),
    availability: v.optional(
      v.array(
        v.object({
          day: v.union(
            v.literal("monday"),
            v.literal("tuesday"),
            v.literal("wednesday"),
            v.literal("thursday"),
            v.literal("friday"),
            v.literal("saturday"),
            v.literal("sunday")
          ),
          slots: v.array(
            v.object({
              start: v.string(),
              end: v.string(),
            })
          ),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const professional = await ctx.db.get(args.professionalId);
    if (!professional || professional.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const { professionalId, ...updateData } = args;
    
    await ctx.db.patch(professionalId, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});
