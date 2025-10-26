/**
 * Convex Functions for User Conversation Patterns
 * Manages storage and retrieval of LSTM-analyzed user patterns
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get user conversation patterns for personalization
 */
export const getUserPatterns = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const pattern = await ctx.db
      .query("userConversationPatterns")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    return pattern;
  },
});

/**
 * Create or update user conversation patterns
 */
export const upsertUserPatterns = mutation({
  args: {
    userId: v.id("users"),
    emotionalProfile: v.object({
      dominantEmotions: v.array(v.string()),
      emotionalTrends: v.array(
        v.object({
          emotion: v.string(),
          frequency: v.number(),
          recentOccurrences: v.array(v.number()),
        })
      ),
      responsePreferences: v.array(v.string()),
    }),
    topicPreferences: v.object({
      interests: v.array(v.string()),
      avoidances: v.array(v.string()),
      favoriteTopics: v.array(
        v.object({
          topic: v.string(),
          engagementScore: v.number(),
        })
      ),
    }),
    communicationStyle: v.object({
      tone: v.string(),
      verbosity: v.string(),
      preferredResponseLength: v.string(),
      communicationPatterns: v.array(v.string()),
      supportNeeds: v.array(v.string()),
    }),
    conversationPatterns: v.object({
      averageMessageLength: v.number(),
      commonPhrases: v.array(v.string()),
      timeOfDayPattern: v.array(
        v.object({
          hour: v.number(),
          frequency: v.number(),
        })
      ),
      sessionDuration: v.number(),
      conversationFrequency: v.number(),
    }),
    personalizedContext: v.string(),
    conversationCount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userConversationPatterns")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    const patternData = {
      userId: args.userId,
      emotionalProfile: args.emotionalProfile,
      topicPreferences: args.topicPreferences,
      communicationStyle: args.communicationStyle,
      conversationPatterns: args.conversationPatterns,
      personalizedContext: args.personalizedContext,
      conversationCount: args.conversationCount,
      lastUpdated: Date.now(),
      version: existing ? existing.version + 1 : 1,
      personalizationEnabled: true,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patternData);
      return existing._id;
    } else {
      return await ctx.db.insert("userConversationPatterns", patternData);
    }
  },
});

/**
 * Toggle personalization on/off for a user
 */
export const togglePersonalization = mutation({
  args: {
    userId: v.id("users"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const pattern = await ctx.db
      .query("userConversationPatterns")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (pattern) {
      await ctx.db.patch(pattern._id, {
        personalizationEnabled: args.enabled,
      });
    }
  },
});

/**
 * Store conversation embedding
 */
export const storeConversationEmbedding = mutation({
  args: {
    userId: v.id("users"),
    conversationId: v.id("conversations"),
    embeddingVector: v.string(), // JSON stringified array
    timestamp: v.number(),
    emotionalState: v.string(),
    topics: v.array(v.string()),
    sentimentScore: v.number(),
    messageCount: v.number(),
    sessionDuration: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversationEmbeddings", args);
  },
});

/**
 * Get recent conversation embeddings for a user
 */
export const getRecentEmbeddings = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const embeddings = await ctx.db
      .query("conversationEmbeddings")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return embeddings;
  },
});

/**
 * Record a pattern learning session
 */
export const recordLearningSession = mutation({
  args: {
    userId: v.id("users"),
    conversationsAnalyzed: v.number(),
    patternsExtracted: v.array(
      v.object({
        patternType: v.string(),
        confidence: v.number(),
        description: v.string(),
      })
    ),
    modelVersion: v.string(),
    processingTime: v.number(),
    timestamp: v.number(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("patternLearningSessions", args);
  },
});

/**
 * Get user's learning session history
 */
export const getLearningSessions = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    
    const sessions = await ctx.db
      .query("patternLearningSessions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return sessions;
  },
});

/**
 * Get all chat messages for a user (for pattern analysis)
 */
export const getUserChatHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user_and_timestamp", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return messages;
  },
});

/**
 * Check if user has enough conversations for personalization
 */
export const canEnablePersonalization = query({
  args: {
    userId: v.id("users"),
    minConversations: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const minRequired = args.minConversations || 5;
    
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    const pattern = await ctx.db
      .query("userConversationPatterns")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    return {
      canEnable: conversations.length >= minRequired,
      conversationCount: conversations.length,
      minRequired,
      personalizationEnabled: pattern?.personalizationEnabled || false,
      hasPattern: !!pattern,
    };
  },
});

/**
 * Delete user pattern data (privacy control)
 */
export const deleteUserPatterns = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Delete patterns
    const pattern = await ctx.db
      .query("userConversationPatterns")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
    
    if (pattern) {
      await ctx.db.delete(pattern._id);
    }

    // Delete embeddings
    const embeddings = await ctx.db
      .query("conversationEmbeddings")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const embedding of embeddings) {
      await ctx.db.delete(embedding._id);
    }

    // Delete learning sessions
    const sessions = await ctx.db
      .query("patternLearningSessions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    return { deleted: true };
  },
});
