/**
 * API Route: Pattern Analysis
 * Triggers LSTM-based analysis of user conversation patterns
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { force = false } = await req.json();

    // Import analyzer dynamically to avoid loading TensorFlow on every request
    const { getLSTMAnalyzer } = await import('@/lib/ml/lstm-analyzer');
    const { ConvexHttpClient } = await import('convex/browser');

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
    const convex = new ConvexHttpClient(convexUrl);

    // Set auth token for Convex client
    const token = await getToken();
    if (token) {
      convex.setAuth(token);
    }

    // Check if user has enough conversations
    const eligibility = await convex.query(api.userPatterns.canEnablePersonalization, {
      userId: userId as Id<"users">,
      minConversations: 5,
    });

    if (!eligibility.canEnable && !force) {
      return NextResponse.json({
        success: false,
        message: `Need at least ${eligibility.minRequired} conversations for personalization. Current: ${eligibility.conversationCount}`,
        conversationCount: eligibility.conversationCount,
        minRequired: eligibility.minRequired,
      });
    }

    // Check if pattern analysis was done recently (within last 24 hours)
    const existingPattern = await convex.query(api.userPatterns.getUserPatterns, {
      userId: userId as Id<"users">,
    });

    if (!force && existingPattern && Date.now() - existingPattern.lastUpdated < 86400000) {
      return NextResponse.json({
        success: true,
        message: "Pattern analysis is up to date",
        pattern: existingPattern,
        cached: true,
      });
    }

    // Fetch user's conversation history
    const chatHistory = await convex.query(api.userPatterns.getUserChatHistory, {
      userId: userId as Id<"users">,
      limit: 100,
    });

    if (chatHistory.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No conversation history found",
      });
    }

    // Group messages into conversations (simplified - should be done by conversationId)
    const conversations: any[][] = [];
    let currentConv: any[] = [];
    let lastTimestamp = 0;

    chatHistory.forEach((msg: any) => {
      // If gap is more than 30 minutes, start new conversation
      if (lastTimestamp && msg.timestamp - lastTimestamp > 1800000) {
        if (currentConv.length > 0) {
          conversations.push([...currentConv]);
        }
        currentConv = [];
      }

      // Skip encrypted messages that can't be decrypted in this context
      // In a real implementation, you'd decrypt using user's private keys
      let content = msg.encryptedContent;
      if (typeof content === 'string' && content.startsWith('encrypted:')) {
        // Skip encrypted messages for analysis
        return;
      }

      currentConv.push({
        role: msg.role,
        content: content,
        timestamp: msg.timestamp,
      });
      lastTimestamp = msg.timestamp;
    });

    if (currentConv.length > 0) {
      conversations.push(currentConv);
    }

    const startTime = Date.now();

    // Analyze patterns using Gemini AI
    const analyzer = getLSTMAnalyzer();
    const allMessages = conversations.flat();
    const pattern = await analyzer.analyzePatterns(allMessages);

    const processingTime = Date.now() - startTime;

    // Store patterns in Convex
    await convex.mutation(api.userPatterns.upsertUserPatterns, {
      userId: userId as Id<"users">,
      emotionalProfile: pattern.emotionalProfile,
      topicPreferences: pattern.topicPreferences,
      communicationStyle: pattern.communicationStyle,
      conversationCount: conversations.length,
      personalizedContext: `User prefers ${pattern.communicationStyle.tone} communication with ${pattern.communicationStyle.preferredResponseLength} responses.`,
    });

    // Create embedding for recent conversations (simplified for Gemini)
    if (conversations.length > 0) {
      const recentConv = conversations[0];

      await convex.mutation(api.userPatterns.storeConversationEmbedding, {
        userId: userId as Id<"users">,
        conversationId: chatHistory[0].conversationId,
        embeddingVector: JSON.stringify([0.5, 0.5, 0.5]), // Placeholder for Gemini
        timestamp: Date.now(),
        emotionalState: pattern.emotionalProfile.dominantEmotions[0] || 'neutral',
        topics: pattern.topicPreferences.interests.slice(0, 3),
        sentimentScore: 0, // Would need sentiment analysis
        messageCount: recentConv.length,
        sessionDuration: 300, // Default 5 minutes
      });
    }

    // Record learning session
    await convex.mutation(api.userPatterns.recordLearningSession, {
      userId: userId as Id<"users">,
      conversationsAnalyzed: conversations.length,
      patternsExtracted: [
        {
          patternType: 'emotional',
          confidence: 0.85,
          description: `Dominant emotions: ${pattern.emotionalProfile.dominantEmotions.join(', ')}`,
        },
        {
          patternType: 'topic',
          confidence: 0.80,
          description: `Interests: ${pattern.topicPreferences.interests.slice(0, 3).join(', ')}`,
        },
        {
          patternType: 'style',
          confidence: 0.90,
          description: `Prefers ${pattern.communicationStyle.tone} tone, ${pattern.communicationStyle.preferredResponseLength} responses`,
        },
      ],
      modelVersion: '1.0.0',
      processingTime,
      timestamp: Date.now(),
      success: true,
    });

    return NextResponse.json({
      success: true,
      message: "Pattern analysis completed successfully",
      pattern,
      conversationsAnalyzed: conversations.length,
      processingTime,
    });
  } catch (error: any) {
    console.error("Pattern analysis error:", error);
    
    // Record failed learning session
    try {
      const { userId, getToken } = await auth();
      if (userId) {
        const { ConvexHttpClient } = await import('convex/browser');
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
        const convex = new ConvexHttpClient(convexUrl);
        
        // Set auth token for Convex client
        const token = await getToken();
        if (token) {
          convex.setAuth(token);
        }

        await convex.mutation(api.userPatterns.recordLearningSession, {
          userId: userId as Id<"users">,
          conversationsAnalyzed: 0,
          patternsExtracted: [],
          modelVersion: '1.0.0',
          processingTime: 0,
          timestamp: Date.now(),
          success: false,
          errorMessage: error.message,
        });
      }
    } catch (recordError) {
      console.error("Error recording failed session:", recordError);
    }

    return NextResponse.json(
      {
        error: "Pattern analysis failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Check pattern analysis status
 */
export async function GET(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { ConvexHttpClient } = await import('convex/browser');

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
    const convex = new ConvexHttpClient(convexUrl);

    // Set auth token for Convex client
    const token = await getToken();
    if (token) {
      convex.setAuth(token);
    }

    const [pattern, eligibility, sessions] = await Promise.all([
      convex.query(api.userPatterns.getUserPatterns, { userId: userId as Id<"users"> }),
      convex.query(api.userPatterns.canEnablePersonalization, { userId: userId as Id<"users"> }),
      convex.query(api.userPatterns.getLearningSessions, { userId: userId as Id<"users">, limit: 5 }),
    ]);

    return NextResponse.json({
      hasPattern: !!pattern,
      pattern,
      eligibility,
      recentSessions: sessions,
      lastUpdated: pattern?.lastUpdated,
      version: pattern?.version,
    });
  } catch (error: any) {
    console.error("Pattern status check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check pattern status",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete user pattern data
 */
export async function DELETE(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { ConvexHttpClient } = await import('convex/browser');

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
    const convex = new ConvexHttpClient(convexUrl);

    // Set auth token for Convex client
    const token = await getToken();
    if (token) {
      convex.setAuth(token);
    }

    await convex.mutation(api.userPatterns.deleteUserPatterns, { userId: userId as Id<"users"> });

    return NextResponse.json({
      success: true,
      message: "All pattern data deleted successfully",
    });
  } catch (error: any) {
    console.error("Pattern deletion error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete pattern data",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
