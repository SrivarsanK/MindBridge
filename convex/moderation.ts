import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get moderation queue (moderators only)
export const getModerationQueue = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("resolved"),
      v.literal("escalated")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.role !== "moderator") {
      throw new Error("Access denied: Moderator privileges required");
    }

    let items;

    if (args.status) {
      items = await ctx.db
        .query("moderationQueue")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(50);
    } else {
      items = await ctx.db
        .query("moderationQueue")
        .order("desc")
        .take(50);
    }

    return items;
  },
});

// Assign moderation item
export const assignModerationItem = mutation({
  args: {
    itemId: v.id("moderationQueue"),
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

    if (!profile || profile.role !== "moderator") {
      throw new Error("Access denied: Moderator privileges required");
    }

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Moderation item not found");
    }

    await ctx.db.patch(args.itemId, {
      status: "reviewing",
      assignedModeratorId: userId,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "moderation_assigned",
      resourceType: "moderationQueue",
      resourceId: args.itemId,
      details: "Moderation item assigned to moderator",
      timestamp: Date.now(),
      severity: "info",
    });

    return { success: true };
  },
});

// Resolve moderation item
export const resolveModerationItem = mutation({
  args: {
    itemId: v.id("moderationQueue"),
    resolution: v.string(),
    escalate: v.optional(v.boolean()),
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

    if (!profile || profile.role !== "moderator") {
      throw new Error("Access denied: Moderator privileges required");
    }

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Moderation item not found");
    }

    await ctx.db.patch(args.itemId, {
      status: args.escalate ? "escalated" : "resolved",
      resolution: args.resolution,
      reviewedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: args.escalate ? "moderation_escalated" : "moderation_resolved",
      resourceType: "moderationQueue",
      resourceId: args.itemId,
      details: args.resolution,
      timestamp: Date.now(),
      severity: args.escalate ? "warning" : "info",
    });

    return { success: true };
  },
});
