import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Request data export (GDPR/CCPA)
export const requestDataExport = mutation({
  args: {
    requestType: v.union(v.literal("gdpr"), v.literal("ccpa"), v.literal("user_initiated")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const requestId = await ctx.db.insert("dataExportRequests", {
      userId,
      requestType: args.requestType,
      status: "pending",
      requestedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "data_export_requested",
      resourceType: "dataExportRequest",
      resourceId: requestId,
      details: `Data export requested (${args.requestType})`,
      timestamp: Date.now(),
      severity: "info",
    });

    return { success: true, requestId };
  },
});

// Get data export status
export const getDataExportStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const requests = await ctx.db
      .query("dataExportRequests")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);

    return requests;
  },
});

// Request data deletion (GDPR/CCPA)
export const requestDataDeletion = mutation({
  args: {
    requestType: v.union(v.literal("gdpr"), v.literal("ccpa"), v.literal("user_initiated")),
    scheduledDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const scheduledFor = Date.now() + (args.scheduledDays || 30) * 24 * 60 * 60 * 1000;

    const requestId = await ctx.db.insert("dataDeletionRequests", {
      userId,
      requestType: args.requestType,
      status: "pending",
      requestedAt: Date.now(),
      scheduledFor,
      retentionOverride: false,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "data_deletion_requested",
      resourceType: "dataDeletionRequest",
      resourceId: requestId,
      details: `Data deletion requested (${args.requestType}), scheduled for ${new Date(scheduledFor).toISOString()}`,
      timestamp: Date.now(),
      severity: "warning",
    });

    return { success: true, requestId, scheduledFor };
  },
});

// Get data deletion status
export const getDataDeletionStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const requests = await ctx.db
      .query("dataDeletionRequests")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);

    return requests;
  },
});

// Get audit logs
export const getAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 50);

    return logs;
  },
});

// Cancel data deletion request
export const cancelDataDeletion = mutation({
  args: {
    requestId: v.id("dataDeletionRequests"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request || request.userId !== userId) {
      throw new Error("Request not found or access denied");
    }

    if (request.status !== "pending") {
      throw new Error("Cannot cancel request in current status");
    }

    await ctx.db.patch(args.requestId, {
      status: "failed",
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "data_deletion_cancelled",
      resourceType: "dataDeletionRequest",
      resourceId: args.requestId,
      details: "Data deletion request cancelled by user",
      timestamp: Date.now(),
      severity: "info",
    });

    return { success: true };
  },
});
