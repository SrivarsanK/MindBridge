import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create dream analysis
export const createDreamAnalysis = mutation({
  args: {
    encryptedMetadata: v.string(),
    emotionalTags: v.array(v.string()),
    stressIndicators: v.array(v.string()),
    recurringThemes: v.array(v.string()),
    emotionalWeather: v.string(),
    intensityScore: v.number(),
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

    if (!profile.privacySettings.allowDreamAnalysis) {
      throw new Error("Dream analysis is disabled in privacy settings");
    }

    const analysisId = await ctx.db.insert("dreamAnalysis", {
      userId,
      encryptedMetadata: args.encryptedMetadata,
      emotionalTags: args.emotionalTags,
      stressIndicators: args.stressIndicators,
      recurringThemes: args.recurringThemes,
      analysisDate: Date.now(),
      visualizationData: {
        emotionalWeather: args.emotionalWeather,
        intensityScore: args.intensityScore,
        themeEvolution: args.recurringThemes.map((theme) => ({
          theme,
          frequency: 1,
          timestamp: Date.now(),
        })),
      },
      privacyLevel: "private",
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "dream_analysis_created",
      resourceType: "dreamAnalysis",
      resourceId: analysisId,
      details: "Dream analysis recorded",
      timestamp: Date.now(),
      severity: "info",
    });

    return analysisId;
  },
});

// Get user's dream analyses
export const getUserDreamAnalyses = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const analyses = await ctx.db
      .query("dreamAnalysis")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 30);

    return analyses;
  },
});

// Get emotional patterns
export const getEmotionalPatterns = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const daysAgo = (args.days || 30) * 24 * 60 * 60 * 1000;
    const cutoffDate = Date.now() - daysAgo;

    const analyses = await ctx.db
      .query("dreamAnalysis")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("analysisDate"), cutoffDate))
      .collect();

    // Aggregate patterns
    const emotionalTags: Record<string, number> = {};
    const stressIndicators: Record<string, number> = {};
    const recurringThemes: Record<string, number> = {};

    for (const analysis of analyses) {
      for (const tag of analysis.emotionalTags) {
        emotionalTags[tag] = (emotionalTags[tag] || 0) + 1;
      }
      for (const indicator of analysis.stressIndicators) {
        stressIndicators[indicator] = (stressIndicators[indicator] || 0) + 1;
      }
      for (const theme of analysis.recurringThemes) {
        recurringThemes[theme] = (recurringThemes[theme] || 0) + 1;
      }
    }

    return {
      emotionalTags,
      stressIndicators,
      recurringThemes,
      totalAnalyses: analyses.length,
      dateRange: {
        start: cutoffDate,
        end: Date.now(),
      },
    };
  },
});

// Export dream data
export const exportDreamData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const analyses = await ctx.db
      .query("dreamAnalysis")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "dream_data_exported",
      resourceType: "dreamAnalysis",
      details: `Exported ${analyses.length} dream analyses`,
      timestamp: Date.now(),
      severity: "info",
    });

    return {
      success: true,
      count: analyses.length,
      data: analyses,
    };
  },
});
