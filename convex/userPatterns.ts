import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Store conversation embeddings for semantic search
export const storeConversationEmbedding = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageIndex: v.number(),
    embedding: v.array(v.number()),
    contentHash: v.string(),
    messageCount: v.optional(v.number()),
    timestamp: v.optional(v.number()),
    sentimentScore: v.optional(v.number()),
    sessionDuration: v.optional(v.number()),
    embeddingVector: v.optional(v.string()),
    emotionalState: v.optional(v.string()),
    topics: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("conversationEmbeddings", {
      userId: userId,
      ...args,
      createdAt: Date.now(),
    });
  },
});