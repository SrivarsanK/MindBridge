import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Create or update user profile
export const createOrUpdateProfile = mutation({
  args: {
    timezone: v.string(),
    displayName: v.optional(v.string()),
    privacySettings: v.optional(v.object({
      allowPeerMatching: v.boolean(),
      allowDreamAnalysis: v.boolean(),
      shareEmotionalPatterns: v.boolean(),
      dataRetentionDays: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    const defaultPrivacySettings = {
      allowPeerMatching: true,
      allowDreamAnalysis: true,
      shareEmotionalPatterns: false,
      dataRetentionDays: 90,
    };

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        timezone: args.timezone,
        displayName: args.displayName,
        privacySettings: args.privacySettings || existingProfile.privacySettings,
        lastActive: Date.now(),
      });

      // Audit log for privacy settings change
      if (args.privacySettings) {
        await ctx.db.insert("auditLogs", {
          userId,
          actorId: userId,
          action: "privacy_settings_updated",
          resourceType: "userProfile",
          resourceId: existingProfile._id,
          details: JSON.stringify(args.privacySettings),
          timestamp: Date.now(),
          severity: "info",
        });
      }

      return existingProfile._id;
    }

    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      role: "student",
      timezone: args.timezone,
      displayName: args.displayName,
      encryptedMoodHistory: JSON.stringify([]), // Empty encrypted history
      privacySettings: args.privacySettings || defaultPrivacySettings,
      consentVersion: "1.0",
      consentTimestamp: Date.now(),
      lastActive: Date.now(),
      isAnonymous: false,
      accountStatus: "active",
    });

    // Audit log for profile creation
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "profile_created",
      resourceType: "userProfile",
      resourceId: profileId,
      details: "User profile created",
      timestamp: Date.now(),
      severity: "info",
    });

    return profileId;
  },
});

// Get current user profile
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

// Update privacy settings
export const updatePrivacySettings = mutation({
  args: {
    privacySettings: v.object({
      allowPeerMatching: v.boolean(),
      allowDreamAnalysis: v.boolean(),
      shareEmotionalPatterns: v.boolean(),
      dataRetentionDays: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      privacySettings: args.privacySettings,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "privacy_settings_updated",
      resourceType: "userProfile",
      resourceId: profile._id,
      details: JSON.stringify(args.privacySettings),
      timestamp: Date.now(),
      severity: "info",
    });

    return { success: true };
  },
});

// Update last active timestamp
export const updateLastActive = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        lastActive: Date.now(),
      });
    }

    return null;
  },
});

// Internal: Update user role (for admin operations)
export const updateUserRole = internalMutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("student"), v.literal("moderator"), v.literal("crisis_responder")),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      role: args.role,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: "role_updated",
      resourceType: "userProfile",
      resourceId: profile._id,
      details: `Role updated to ${args.role}`,
      timestamp: Date.now(),
      severity: "warning",
    });

    return null;
  },
});
