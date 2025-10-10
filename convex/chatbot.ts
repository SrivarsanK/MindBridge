import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Create a new conversation
export const createConversation = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const conversationId = await ctx.db.insert("conversations", {
      userId,
      encryptedMessages: JSON.stringify([]),
      contextSummary: "",
      messageCount: 0,
      lastMessageAt: Date.now(),
      crisisDetected: false,
      exportRequested: false,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "conversation_created",
      resourceType: "conversation",
      resourceId: conversationId,
      details: "New conversation started",
      timestamp: Date.now(),
      severity: "info",
    });

    return conversationId;
  },
});

// Get user's conversations
export const getUserConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);

    return conversations;
  },
});

// Get conversation messages
export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found or access denied");
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .take(args.limit || 50);

    return messages.reverse();
  },
});

// Send a message (triggers AI response)
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check rate limit
    const rateLimitOk = await checkRateLimit(ctx, userId, "chatbot_message");
    if (!rateLimitOk) {
      throw new Error("Rate limit exceeded. Please wait before sending more messages.");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found or access denied");
    }

    // Store user message (encrypted in production)
    const encryptedContent = args.content; // In production: encrypt(args.content)
    
    const messageId = await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      userId,
      role: "user",
      encryptedContent,
      timestamp: Date.now(),
      crisisKeywordsDetected: [],
      tokenCount: Math.ceil(args.content.length / 4),
    });

    // Update conversation
    await ctx.db.patch(args.conversationId, {
      messageCount: conversation.messageCount + 1,
      lastMessageAt: Date.now(),
    });

    // Schedule AI response and crisis detection
    await ctx.scheduler.runAfter(0, internal.chatbot.processAIResponse, {
      conversationId: args.conversationId,
      userMessage: args.content,
    });

    return messageId;
  },
});

// Internal action: Process AI response
export const processAIResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // Crisis detection
    const crisisDetection = detectCrisisKeywords(args.userMessage);
    
    if (crisisDetection.detected) {
      await ctx.runMutation(internal.crisis.createCrisisEvent, {
        conversationId: args.conversationId,
        severity: crisisDetection.severity,
        keywords: crisisDetection.keywords,
        contextSnippet: args.userMessage.substring(0, 200),
      });
    }

    // Get conversation history
    const messages = await ctx.runQuery(internal.chatbot.loadConversationHistory, {
      conversationId: args.conversationId,
    });

    // Call OpenAI API
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [
            {
              role: "system",
              content: "You are a compassionate mental health support assistant. Provide empathetic, supportive responses. If you detect crisis language, encourage professional help. Never provide medical advice.",
            },
            ...messages,
            { role: "user", content: args.userMessage },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      // Store AI response
      await ctx.runMutation(internal.chatbot.storeAIMessage, {
        conversationId: args.conversationId,
        content: aiMessage,
        tokenCount: data.usage.total_tokens,
      });

      // Record metric
      await ctx.runMutation(internal.metrics.recordMetric, {
        metricType: "response_time",
        value: Date.now(),
        metadata: JSON.stringify({ conversationId: args.conversationId }),
      });

    } catch (error) {
      console.error("AI response error:", error);
      
      // Fallback response
      await ctx.runMutation(internal.chatbot.storeAIMessage, {
        conversationId: args.conversationId,
        content: "I'm here to listen. Could you tell me more about what you're experiencing?",
        tokenCount: 20,
      });
    }

    return null;
  },
});

// Internal query: Load conversation history
export const loadConversationHistory = internalQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .take(10);

    return messages.reverse().map((msg) => ({
      role: msg.role,
      content: msg.encryptedContent, // In production: decrypt(msg.encryptedContent)
    }));
  },
});

// Internal: Store AI message
export const storeAIMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    tokenCount: v.number(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const encryptedContent = args.content; // In production: encrypt(args.content)

    await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      userId: conversation.userId,
      role: "assistant",
      encryptedContent,
      timestamp: Date.now(),
      crisisKeywordsDetected: [],
      tokenCount: args.tokenCount,
    });

    await ctx.db.patch(args.conversationId, {
      messageCount: conversation.messageCount + 1,
      lastMessageAt: Date.now(),
    });

    return null;
  },
});

// Request conversation export
export const requestConversationExport = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found or access denied");
    }

    await ctx.db.patch(args.conversationId, {
      exportRequested: true,
      exportedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "conversation_export_requested",
      resourceType: "conversation",
      resourceId: args.conversationId,
      details: "User requested conversation export",
      timestamp: Date.now(),
      severity: "info",
    });

    return { success: true };
  },
});

// Helper: Crisis detection
function detectCrisisKeywords(message: string): {
  detected: boolean;
  severity: "low" | "medium" | "high" | "critical";
  keywords: string[];
} {
  const lowerMessage = message.toLowerCase();
  
  const criticalKeywords = ["suicide", "kill myself", "end my life", "want to die"];
  const highKeywords = ["self-harm", "hurt myself", "cutting", "overdose"];
  const mediumKeywords = ["hopeless", "worthless", "can't go on", "give up"];
  const lowKeywords = ["depressed", "anxious", "scared", "alone"];

  const detectedKeywords: string[] = [];
  let severity: "low" | "medium" | "high" | "critical" = "low";

  for (const keyword of criticalKeywords) {
    if (lowerMessage.includes(keyword)) {
      detectedKeywords.push(keyword);
      severity = "critical";
    }
  }

  if (severity !== "critical") {
    for (const keyword of highKeywords) {
      if (lowerMessage.includes(keyword)) {
        detectedKeywords.push(keyword);
        severity = "high";
      }
    }
  }

  if (severity === "low") {
    for (const keyword of mediumKeywords) {
      if (lowerMessage.includes(keyword)) {
        detectedKeywords.push(keyword);
        severity = "medium";
      }
    }
  }

  if (detectedKeywords.length === 0) {
    for (const keyword of lowKeywords) {
      if (lowerMessage.includes(keyword)) {
        detectedKeywords.push(keyword);
        severity = "low";
      }
    }
  }

  return {
    detected: detectedKeywords.length > 0,
    severity,
    keywords: detectedKeywords,
  };
}

// Helper: Rate limiting
async function checkRateLimit(
  ctx: any,
  userId: Id<"users">,
  endpoint: string
): Promise<boolean> {
  const now = Date.now();
  const windowDuration = 60000; // 1 minute
  const maxRequests = 20;

  const existingLimit = await ctx.db
    .query("rateLimits")
    .withIndex("by_user_and_endpoint", (q: any) => 
      q.eq("userId", userId).eq("endpoint", endpoint)
    )
    .first();

  if (existingLimit) {
    if (now > existingLimit.windowEnd) {
      // Reset window
      await ctx.db.patch(existingLimit._id, {
        requestCount: 1,
        windowStart: now,
        windowEnd: now + windowDuration,
        blocked: false,
      });
      return true;
    }

    if (existingLimit.requestCount >= maxRequests) {
      await ctx.db.patch(existingLimit._id, {
        blocked: true,
      });
      return false;
    }

    await ctx.db.patch(existingLimit._id, {
      requestCount: existingLimit.requestCount + 1,
    });
    return true;
  }

  // Create new rate limit entry
  await ctx.db.insert("rateLimits", {
    userId,
    endpoint,
    requestCount: 1,
    windowStart: now,
    windowEnd: now + windowDuration,
    blocked: false,
  });

  return true;
}
