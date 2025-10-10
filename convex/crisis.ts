import { v } from "convex/values";
import { mutation, query, internalMutation, action, internalAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Internal: Create crisis event
export const createCrisisEvent = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    keywords: v.array(v.string()),
    contextSnippet: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Determine response level based on severity
    let responseLevel: "self_help" | "peer_support" | "counselor_notification" | "emergency_intervention";
    
    switch (args.severity) {
      case "critical":
        responseLevel = "emergency_intervention";
        break;
      case "high":
        responseLevel = "counselor_notification";
        break;
      case "medium":
        responseLevel = "peer_support";
        break;
      default:
        responseLevel = "self_help";
    }

    const crisisEventId = await ctx.db.insert("crisisEvents", {
      userId: conversation.userId,
      source: "chat",
      severity: args.severity,
      detectionData: {
        keywords: args.keywords,
        sentimentScore: 0.2, // Low sentiment
        contextSnippet: args.contextSnippet,
      },
      responseLevel,
      status: "detected",
      detectedAt: Date.now(),
      followUpScheduled: args.severity === "high" || args.severity === "critical",
      followUpAt: args.severity === "critical" ? Date.now() + 3600000 : undefined, // 1 hour for critical
    });

    // Update conversation
    await ctx.db.patch(args.conversationId, {
      crisisDetected: true,
      crisisLevel: args.severity,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: conversation.userId,
      action: "crisis_detected",
      resourceType: "crisisEvent",
      resourceId: crisisEventId,
      details: JSON.stringify({
        severity: args.severity,
        keywords: args.keywords,
        responseLevel,
      }),
      timestamp: Date.now(),
      severity: "critical",
    });

    // Notify crisis responders for high/critical events
    if (args.severity === "high" || args.severity === "critical") {
      await ctx.scheduler.runAfter(0, internal.crisis.sendCrisisNotification, {
        crisisEventId,
      });
    }

    return crisisEventId;
  },
});

// Get active crisis events (for crisis responders)
export const getActiveCrisisEvents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Check if user is a crisis responder
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.role !== "crisis_responder") {
      throw new Error("Access denied: Not a crisis responder");
    }

    const events = await ctx.db
      .query("crisisEvents")
      .withIndex("by_status", (q) => q.eq("status", "detected"))
      .order("desc")
      .take(50);

    return events;
  },
});

// Acknowledge crisis event
export const acknowledgeCrisisEvent = mutation({
  args: {
    crisisEventId: v.id("crisisEvents"),
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

    if (!profile || profile.role !== "crisis_responder") {
      throw new Error("Access denied: Not a crisis responder");
    }

    const event = await ctx.db.get(args.crisisEventId);
    if (!event) {
      throw new Error("Crisis event not found");
    }

    await ctx.db.patch(args.crisisEventId, {
      status: "acknowledged",
      assignedResponderId: userId,
      acknowledgedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: event.userId,
      actorId: userId,
      action: "crisis_acknowledged",
      resourceType: "crisisEvent",
      resourceId: args.crisisEventId,
      details: `Crisis event acknowledged by responder`,
      timestamp: Date.now(),
      severity: "warning",
    });

    return { success: true };
  },
});

// Update crisis event status
export const updateCrisisEventStatus = mutation({
  args: {
    crisisEventId: v.id("crisisEvents"),
    status: v.union(
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("escalated")
    ),
    notes: v.optional(v.string()),
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

    if (!profile || profile.role !== "crisis_responder") {
      throw new Error("Access denied: Not a crisis responder");
    }

    const event = await ctx.db.get(args.crisisEventId);
    if (!event) {
      throw new Error("Crisis event not found");
    }

    const updateData: any = {
      status: args.status,
      notes: args.notes,
    };

    if (args.status === "resolved") {
      updateData.resolvedAt = Date.now();
    }

    await ctx.db.patch(args.crisisEventId, updateData);

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: event.userId,
      actorId: userId,
      action: "crisis_status_updated",
      resourceType: "crisisEvent",
      resourceId: args.crisisEventId,
      details: `Status updated to ${args.status}`,
      timestamp: Date.now(),
      severity: "warning",
    });

    // Record metric
    if (args.status === "resolved") {
      const responseTime = Date.now() - event.detectedAt;
      await ctx.db.insert("systemMetrics", {
        metricType: "crisis_response_time",
        value: responseTime,
        metadata: JSON.stringify({ crisisEventId: args.crisisEventId }),
        timestamp: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get user's crisis history
export const getUserCrisisHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const events = await ctx.db
      .query("crisisEvents")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);

    return events;
  },
});

// Internal action: Send crisis notification
export const sendCrisisNotification = internalAction({
  args: {
    crisisEventId: v.id("crisisEvents"),
  },
  handler: async (ctx, args) => {
    // In production, this would send notifications via email, SMS, or push notifications
    // For now, we'll just log it
    console.log(`CRISIS ALERT: Event ${args.crisisEventId} requires immediate attention`);
    
    // Record notification metric
    await ctx.runMutation(internal.metrics.recordMetric, {
      metricType: "active_connections",
      value: 1,
      metadata: JSON.stringify({ type: "crisis_notification", crisisEventId: args.crisisEventId }),
    });

    return null;
  },
});

// Manual crisis trigger (user-initiated)
export const triggerManualCrisis = mutation({
  args: {
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const crisisEventId = await ctx.db.insert("crisisEvents", {
      userId,
      source: "manual_trigger",
      severity: "high",
      detectionData: {
        keywords: ["manual_trigger"],
        sentimentScore: 0,
        contextSnippet: args.notes || "User manually triggered crisis support",
      },
      responseLevel: "counselor_notification",
      status: "detected",
      detectedAt: Date.now(),
      followUpScheduled: true,
      followUpAt: Date.now() + 3600000, // 1 hour
      notes: args.notes,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "manual_crisis_triggered",
      resourceType: "crisisEvent",
      resourceId: crisisEventId,
      details: "User manually triggered crisis support",
      timestamp: Date.now(),
      severity: "critical",
    });

    // Notify responders
    await ctx.scheduler.runAfter(0, internal.crisis.sendCrisisNotification, {
      crisisEventId,
    });

    return { success: true, crisisEventId };
  },
});
