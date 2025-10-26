import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

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

// Flag message for moderation (called from server-side validation)
export const flagMessageForModeration = internalMutation({
  args: {
    messageId: v.id("peerMessages"),
    userId: v.id("users"),
    matchId: v.id("peerMatches"),
    violations: v.array(v.object({
      type: v.string(),
      matched: v.string(),
      severity: v.string(),
      position: v.number(),
    })),
    severity: v.union(
      v.literal("none"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    confidence: v.number(),
    autoBlocked: v.boolean(),
    originalText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Update message with moderation flags
    await ctx.db.patch(args.messageId, {
      flaggedForModeration: true,
      moderationSeverity: args.severity,
      moderationViolations: args.violations.map(v => v.type),
      autoBlocked: args.autoBlocked,
    });

    // Add to moderation queue if high severity or auto-blocked
    if (args.autoBlocked || args.severity === "critical" || args.severity === "high") {
      const priority = args.severity === "critical" ? "urgent" : "high";
      
      await ctx.db.insert("moderationQueue", {
        contentType: "peer_message",
        contentId: args.messageId,
        userId: args.userId,
        matchId: args.matchId,
        originalText: args.originalText,
        reason: `Automated detection: ${args.violations.map(v => v.type).join(", ")}`,
        violations: args.violations,
        severity: args.severity,
        confidence: args.confidence,
        autoBlocked: args.autoBlocked,
        priority,
        status: "pending",
        createdAt: Date.now(),
      });

      // Log audit trail
      await ctx.db.insert("auditLogs", {
        userId: args.userId,
        action: "content_auto_moderated",
        resourceType: "peerMessages",
        resourceId: args.messageId,
        details: `Auto-flagged: ${args.severity} severity, ${args.violations.length} violations`,
        timestamp: Date.now(),
        severity: args.autoBlocked ? "critical" : "warning",
      });
    }

    return { success: true };
  },
});

// Get moderation analytics (admin only)
export const getModerationAnalytics = query({
  args: {
    timeRange: v.optional(v.union(
      v.literal("day"),
      v.literal("week"),
      v.literal("month")
    )),
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

    if (!profile || (profile.role !== "moderator" && profile.role !== "admin")) {
      throw new Error("Access denied: Admin privileges required");
    }

    const now = Date.now();
    const timeRangeMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };
    const rangeMs = timeRangeMs[args.timeRange || "week"];
    const startTime = now - rangeMs;

    // Get all moderation queue items in time range
    const items = await ctx.db
      .query("moderationQueue")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();

    // Calculate statistics
    const stats = {
      totalFlags: items.length,
      autoBlocked: items.filter(i => i.autoBlocked).length,
      bySeverity: {
        critical: items.filter(i => i.severity === "critical").length,
        high: items.filter(i => i.severity === "high").length,
        medium: items.filter(i => i.severity === "medium").length,
        low: items.filter(i => i.severity === "low").length,
        none: items.filter(i => i.severity === "none").length,
      },
      byStatus: {
        pending: items.filter(i => i.status === "pending").length,
        reviewing: items.filter(i => i.status === "reviewing").length,
        resolved: items.filter(i => i.status === "resolved").length,
        escalated: items.filter(i => i.status === "escalated").length,
      },
      topViolationTypes: getTopViolationTypes(items),
    };

    return stats;
  },
});

function getTopViolationTypes(items: any[]): Array<{ type: string; count: number }> {
  const violationCounts = new Map<string, number>();
  
  items.forEach(item => {
    item.violations?.forEach((v: any) => {
      const count = violationCounts.get(v.type) || 0;
      violationCounts.set(v.type, count + 1);
    });
  });

  return Array.from(violationCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// Update user moderation warnings
export const updateUserWarnings = mutation({
  args: {
    userId: v.id("users"),
    action: v.union(
      v.literal("warn"),
      v.literal("suspend"),
      v.literal("clear")
    ),
    reason: v.string(),
    duration: v.optional(v.number()), // Suspension duration in ms
  },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) {
      throw new Error("Not authenticated");
    }

    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", adminId))
      .first();

    if (!adminProfile || (adminProfile.role !== "moderator" && adminProfile.role !== "admin")) {
      throw new Error("Access denied: Moderator privileges required");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    if (args.action === "warn") {
      await ctx.db.patch(userProfile._id, {
        moderationWarnings: (userProfile.moderationWarnings || 0) + 1,
        lastWarningAt: Date.now(),
      });
    } else if (args.action === "suspend") {
      const suspensionHistory = userProfile.suspensionHistory || [];
      suspensionHistory.push({
        reason: args.reason,
        suspendedAt: Date.now(),
        duration: args.duration || 0,
      });

      await ctx.db.patch(userProfile._id, {
        accountStatus: "suspended",
        suspensionHistory,
      });
    } else if (args.action === "clear") {
      await ctx.db.patch(userProfile._id, {
        moderationWarnings: 0,
        lastWarningAt: undefined,
      });
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      actorId: adminId,
      action: `user_${args.action}`,
      resourceType: "userProfiles",
      resourceId: userProfile._id,
      details: args.reason,
      timestamp: Date.now(),
      severity: args.action === "suspend" ? "critical" : "warning",
    });

    return { success: true };
  },
});
