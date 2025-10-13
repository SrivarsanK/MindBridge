import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Create or update user profile
export const createOrUpdateProfile = mutation({
  args: {
    timezone: v.string(),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    age: v.optional(v.number()),
    gender: v.optional(v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("non-binary"),
      v.literal("prefer-not-to-say"),
      v.literal("other")
    )),
    privacySettings: v.optional(v.object({
      allowPeerMatching: v.boolean(),
      allowDreamAnalysis: v.boolean(),
      shareEmotionalPatterns: v.boolean(),
      dataRetentionDays: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    console.log('[createOrUpdateProfile] Starting profile creation/update');
    console.log('[createOrUpdateProfile] Args:', JSON.stringify(args));
    
    try {
      const userId = await getAuthUserId(ctx);
      console.log('[createOrUpdateProfile] User ID:', userId);
      
      if (!userId) {
        console.error('[createOrUpdateProfile] Not authenticated - no userId');
        throw new Error("Not authenticated");
      }

      const existingProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .first();

      console.log('[createOrUpdateProfile] Existing profile found:', !!existingProfile);

      const defaultPrivacySettings = {
        allowPeerMatching: true,
        allowDreamAnalysis: true,
        shareEmotionalPatterns: false,
        dataRetentionDays: 90,
      };

      if (existingProfile) {
        console.log('[createOrUpdateProfile] Updating existing profile:', existingProfile._id);
        
        await ctx.db.patch(existingProfile._id, {
          timezone: args.timezone,
          displayName: args.displayName,
          bio: args.bio,
          age: args.age,
          gender: args.gender,
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

        console.log('[createOrUpdateProfile] Profile updated successfully');
        return existingProfile._id;
      }

      console.log('[createOrUpdateProfile] Creating new profile for user:', userId);
      
      const profileData = {
        userId,
        role: "student" as const,
        timezone: args.timezone,
        displayName: args.displayName,
        bio: args.bio,
        age: args.age,
        gender: args.gender,
        encryptedMoodHistory: JSON.stringify([]), // Empty encrypted history
        privacySettings: args.privacySettings || defaultPrivacySettings,
        consentVersion: "1.0",
        consentTimestamp: Date.now(),
        lastActive: Date.now(),
        isAnonymous: false,
        accountStatus: "active" as const,
      };
      
      console.log('[createOrUpdateProfile] Profile data to insert:', JSON.stringify(profileData));

      const profileId = await ctx.db.insert("userProfiles", profileData);
      
      console.log('[createOrUpdateProfile] Profile created with ID:', profileId);

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

      console.log('[createOrUpdateProfile] Audit log created, returning profile ID');
      return profileId;
    } catch (error) {
      console.error('[createOrUpdateProfile] ERROR:', error);
      console.error('[createOrUpdateProfile] Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
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
