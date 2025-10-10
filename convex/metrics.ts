import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Internal: Record metric
export const recordMetric = internalMutation({
  args: {
    metricType: v.union(
      v.literal("response_time"),
      v.literal("error_rate"),
      v.literal("active_connections"),
      v.literal("crisis_response_time"),
      v.literal("user_satisfaction")
    ),
    value: v.number(),
    metadata: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("systemMetrics", {
      metricType: args.metricType,
      value: args.value,
      metadata: args.metadata,
      timestamp: Date.now(),
    });

    return null;
  },
});

// Get system metrics (admin only)
export const getSystemMetrics = query({
  args: {
    metricType: v.optional(v.union(
      v.literal("response_time"),
      v.literal("error_rate"),
      v.literal("active_connections"),
      v.literal("crisis_response_time"),
      v.literal("user_satisfaction")
    )),
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Check if user is admin/moderator
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!profile || (profile.role !== "moderator" && profile.role !== "crisis_responder")) {
      throw new Error("Access denied: Admin privileges required");
    }

    const hoursAgo = (args.hours || 24) * 60 * 60 * 1000;
    const cutoffTime = Date.now() - hoursAgo;

    let metrics;

    if (args.metricType) {
      metrics = await ctx.db
        .query("systemMetrics")
        .withIndex("by_metric_type", (q) => q.eq("metricType", args.metricType!))
        .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
        .collect();
    } else {
      metrics = await ctx.db
        .query("systemMetrics")
        .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
        .collect();
    }

    return metrics;
  },
});

// Get aggregated metrics
export const getAggregatedMetrics = query({
  args: {
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!profile || (profile.role !== "moderator" && profile.role !== "crisis_responder")) {
      throw new Error("Access denied: Admin privileges required");
    }

    const hoursAgo = (args.hours || 24) * 60 * 60 * 1000;
    const cutoffTime = Date.now() - hoursAgo;

    const metrics = await ctx.db
      .query("systemMetrics")
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .collect();

    // Aggregate by type
    const aggregated: Record<string, { count: number; sum: number; avg: number; min: number; max: number }> = {};

    for (const metric of metrics) {
      if (!aggregated[metric.metricType]) {
        aggregated[metric.metricType] = {
          count: 0,
          sum: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity,
        };
      }

      const agg = aggregated[metric.metricType];
      agg.count++;
      agg.sum += metric.value;
      agg.min = Math.min(agg.min, metric.value);
      agg.max = Math.max(agg.max, metric.value);
    }

    // Calculate averages
    for (const type in aggregated) {
      aggregated[type].avg = aggregated[type].sum / aggregated[type].count;
    }

    return aggregated;
  },
});

// Record user satisfaction
export const recordUserSatisfaction = mutation({
  args: {
    rating: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.insert("systemMetrics", {
      metricType: "user_satisfaction",
      value: args.rating,
      metadata: JSON.stringify({ userId, feedback: args.feedback }),
      timestamp: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "satisfaction_recorded",
      resourceType: "systemMetrics",
      details: `User rated satisfaction: ${args.rating}/5`,
      timestamp: Date.now(),
      severity: "info",
    });

    return { success: true };
  },
});
