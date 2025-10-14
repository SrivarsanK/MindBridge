/**
 * API Route: Pattern Analysis
 * Triggers LSTM-based analysis of user conversation patterns
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
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
    const { api } = await import('@/convex/_generated/api');

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
    const convex = new ConvexHttpClient(convexUrl);

    // Check if user has enough conversations
    const eligibility = await convex.query(api.userPatterns.canEnablePersonalization, {
      userId: userId as any,
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
      userId: userId as any,
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
      userId: userId as any,
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
      currentConv.push({
        role: msg.role,
        content: msg.encryptedContent, // Note: Would need decryption in real scenario
        timestamp: msg.timestamp,
      });
      lastTimestamp = msg.timestamp;
    });

    if (currentConv.length > 0) {
      conversations.push(currentConv);
    }

    const startTime = Date.now();

    // Analyze patterns using LSTM
    const analyzer = getLSTMAnalyzer();
    const pattern = await analyzer.analyzeConversations(conversations, userId);

    const processingTime = Date.now() - startTime;

    // Store patterns in Convex
    await convex.mutation(api.userPatterns.upsertUserPatterns, {
      userId: userId as any,
      ...pattern,
      conversationCount: conversations.length,
    });

    // Create embedding for recent conversations
    if (conversations.length > 0) {
      const recentConv = conversations[0];
      const embedding = await analyzer.createEmbedding(recentConv);
      
      await convex.mutation(api.userPatterns.storeConversationEmbedding, {
        userId: userId as any,
        conversationId: chatHistory[0].conversationId,
        embeddingVector: JSON.stringify(embedding),
        timestamp: Date.now(),
        emotionalState: pattern.emotionalProfile.dominantEmotions[0] || 'neutral',
        topics: pattern.topicPreferences.interests.slice(0, 3),
        sentimentScore: 0, // Would need sentiment analysis
        messageCount: recentConv.length,
        sessionDuration: Math.floor(pattern.conversationPatterns.sessionDuration),
      });
    }

    // Record learning session
    await convex.mutation(api.userPatterns.recordLearningSession, {
      userId: userId as any,
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
          description: `Prefers ${pattern.communicationStyle.preferredTone} tone, ${pattern.communicationStyle.responseLength} responses`,
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
      const { userId } = await auth();
      if (userId) {
        const { ConvexHttpClient } = await import('convex/browser');
        const { api } = await import('@/convex/_generated/api');
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
        const convex = new ConvexHttpClient(convexUrl);
        
        await convex.mutation(api.userPatterns.recordLearningSession, {
          userId: userId as any,
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { ConvexHttpClient } = await import('convex/browser');
    const { api } = await import('@/convex/_generated/api');

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
    const convex = new ConvexHttpClient(convexUrl);

    const [pattern, eligibility, sessions] = await Promise.all([
      convex.query(api.userPatterns.getUserPatterns, { userId: userId as any }),
      convex.query(api.userPatterns.canEnablePersonalization, { userId: userId as any }),
      convex.query(api.userPatterns.getLearningSessions, { userId: userId as any, limit: 5 }),
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { ConvexHttpClient } = await import('convex/browser');
    const { api } = await import('@/convex/_generated/api');

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
    const convex = new ConvexHttpClient(convexUrl);

    await convex.mutation(api.userPatterns.deleteUserPatterns, {
      userId: userId as any,
    });

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
