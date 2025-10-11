import { v } from "convex/values";
import { mutation, query, internalMutation, action, internalAction, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Request peer match
export const requestPeerMatch = mutation({
  args: {
    mood: v.string(),
    lonelinessLevel: v.number(),
    interests: v.array(v.string()),
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

    if (!profile.privacySettings.allowPeerMatching) {
      throw new Error("Peer matching is disabled in privacy settings");
    }

    // Schedule AI-powered matching
    await ctx.scheduler.runAfter(0, internal.peerMatching.processPeerMatch, {
      userId,
      mood: args.mood,
      lonelinessLevel: args.lonelinessLevel,
      interests: args.interests,
      timezone: profile.timezone,
    });

    return { success: true, message: "Finding a peer match for you..." };
  },
});

// Internal action: Process peer match
export const processPeerMatch = internalAction({
  args: {
    userId: v.id("users"),
    mood: v.string(),
    lonelinessLevel: v.number(),
    interests: v.array(v.string()),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    // Get potential matches
    const candidates = await ctx.runQuery(internal.peerMatching.loadPotentialMatches, {
      userId: args.userId,
      timezone: args.timezone,
    });

    if (candidates.length === 0) {
      return null;
    }

    // Simple matching algorithm (in production, use ML model)
    let bestMatch = candidates[0];
    let bestScore = 0;

    for (const candidate of candidates) {
      const score = calculateMatchScore(
        args.mood,
        args.lonelinessLevel,
        args.interests,
        candidate
      );

      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    // Generate ice-breaker
    const iceBreaker = await generateIceBreaker(args.mood, args.interests);

    // Create match
    await ctx.runMutation(internal.peerMatching.createMatch, {
      user1Id: args.userId,
      user2Id: bestMatch.userId,
      matchScore: bestScore,
      mood: args.mood,
      lonelinessLevel: args.lonelinessLevel,
      interests: args.interests,
      iceBreaker,
    });

    return null;
  },
});

// Internal query: Load potential matches
export const loadPotentialMatches = internalQuery({
  args: {
    userId: v.id("users"),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_last_active")
      .order("desc")
      .take(50);

    // Filter for eligible matches
    const candidates = profiles.filter((profile) => {
      return (
        profile.userId !== args.userId &&
        profile.privacySettings.allowPeerMatching &&
        profile.accountStatus === "active" &&
        Math.abs(getTimezoneOffset(profile.timezone) - getTimezoneOffset(args.timezone)) <= 3
      );
    });

    return candidates;
  },
});

// Internal: Create match
export const createMatch = internalMutation({
  args: {
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    matchScore: v.number(),
    mood: v.string(),
    lonelinessLevel: v.number(),
    interests: v.array(v.string()),
    iceBreaker: v.string(),
  },
  handler: async (ctx, args) => {
    const matchId = await ctx.db.insert("peerMatches", {
      user1Id: args.user1Id,
      user2Id: args.user2Id,
      matchScore: args.matchScore,
      matchCriteria: {
        moodCompatibility: args.matchScore,
        timezoneMatch: true,
        lonelinessLevel: args.lonelinessLevel,
        sharedInterests: args.interests,
      },
      status: "active",
      iceBreaker: args.iceBreaker,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      messageCount: 0,
    });

    // Audit logs
    await ctx.db.insert("auditLogs", {
      userId: args.user1Id,
      action: "peer_match_created",
      resourceType: "peerMatch",
      resourceId: matchId,
      details: `Matched with peer (score: ${args.matchScore})`,
      timestamp: Date.now(),
      severity: "info",
    });

    await ctx.db.insert("auditLogs", {
      userId: args.user2Id,
      action: "peer_match_created",
      resourceType: "peerMatch",
      resourceId: matchId,
      details: `Matched with peer (score: ${args.matchScore})`,
      timestamp: Date.now(),
      severity: "info",
    });

    return matchId;
  },
});

// Get user's active matches
export const getActiveMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const matches1 = await ctx.db
      .query("peerMatches")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const matches2 = await ctx.db
      .query("peerMatches")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return [...matches1, ...matches2];
  },
});

// Get online users statistics
export const getOnlineUsersStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000; // 5 minutes ago
    
    // Get all recently active users with peer matching enabled
    const onlineUsers = await ctx.db
      .query("userProfiles")
      .withIndex("by_last_active")
      .order("desc")
      .filter((q) => 
        q.and(
          q.gte(q.field("lastActive"), fiveMinutesAgo),
          q.eq(q.field("privacySettings.allowPeerMatching"), true),
          q.eq(q.field("accountStatus"), "active")
        )
      )
      .collect();
    
    // Count users currently searching for matches (pending matches in last 30 seconds)
    const thirtySecondsAgo = now - 30 * 1000;
    const recentMatches = await ctx.db
      .query("peerMatches")
      .withIndex("by_last_activity")
      .order("desc")
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), thirtySecondsAgo),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();
    
    return {
      onlineCount: onlineUsers.length,
      searchingCount: recentMatches.length,
      totalAvailable: onlineUsers.length - recentMatches.length
    };
  },
});

// Send peer message
export const sendPeerMessage = mutation({
  args: {
    matchId: v.id("peerMatches"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new Error("Access denied");
    }

    if (match.status !== "active") {
      throw new Error("Match is not active");
    }

    // Content moderation check
    const flagged = moderateContent(args.content);

    const encryptedContent = args.content; // In production: encrypt(args.content)

    const messageId = await ctx.db.insert("peerMessages", {
      matchId: args.matchId,
      senderId: userId,
      encryptedContent,
      timestamp: Date.now(),
      flaggedForModeration: flagged.isFlagged,
      moderationReason: flagged.reason,
      deliveryStatus: "sent",
    });

    // Update match
    await ctx.db.patch(args.matchId, {
      lastActivityAt: Date.now(),
      messageCount: match.messageCount + 1,
    });

    // If flagged, add to moderation queue
    if (flagged.isFlagged) {
      await ctx.db.insert("moderationQueue", {
        contentType: "peer_message",
        contentId: messageId,
        reason: flagged.reason || "Automated content filter",
        priority: flagged.priority,
        status: "pending",
        createdAt: Date.now(),
      });
    }

    return messageId;
  },
});

// Get peer messages
export const getPeerMessages = query({
  args: {
    matchId: v.id("peerMatches"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new Error("Access denied");
    }

    const messages = await ctx.db
      .query("peerMessages")
      .withIndex("by_match_id", (q) => q.eq("matchId", args.matchId))
      .order("desc")
      .take(args.limit || 50);

    return messages.reverse();
  },
});

// End peer match
export const endPeerMatch = mutation({
  args: {
    matchId: v.id("peerMatches"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.matchId, {
      status: "completed",
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "peer_match_ended",
      resourceType: "peerMatch",
      resourceId: args.matchId,
      details: args.reason || "User ended peer match",
      timestamp: Date.now(),
      severity: "info",
    });

    return { success: true };
  },
});

// Report peer match
export const reportPeerMatch = mutation({
  args: {
    matchId: v.id("peerMatches"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.matchId, {
      status: "reported",
    });

    // Add to moderation queue
    await ctx.db.insert("moderationQueue", {
      contentType: "report",
      contentId: args.matchId,
      reportedBy: userId,
      reason: args.reason,
      priority: "high",
      status: "pending",
      createdAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      actorId: userId,
      action: "peer_match_reported",
      resourceType: "peerMatch",
      resourceId: args.matchId,
      details: args.reason,
      timestamp: Date.now(),
      severity: "warning",
    });

    return { success: true };
  },
});

// Helper functions
function calculateMatchScore(
  mood: string,
  lonelinessLevel: number,
  interests: string[],
  candidate: any
): number {
  let score = 0;

  // Timezone compatibility (already filtered)
  score += 30;

  // Loneliness level compatibility (prefer similar levels)
  const lonelinessScore = Math.max(0, 30 - Math.abs(lonelinessLevel - 5) * 5);
  score += lonelinessScore;

  // Shared interests
  const sharedInterests = interests.filter((interest) =>
    candidate.privacySettings.shareEmotionalPatterns
  ).length;
  score += sharedInterests * 10;

  // Recent activity bonus
  const hoursSinceActive = (Date.now() - candidate.lastActive) / 3600000;
  if (hoursSinceActive < 1) score += 20;
  else if (hoursSinceActive < 24) score += 10;

  return Math.min(100, score);
}

async function generateIceBreaker(mood: string, interests: string[]): Promise<string> {
  const iceBreakers = [
    "What's been on your mind lately?",
    "How has your day been going?",
    "What's something that made you smile recently?",
    "If you could do anything right now, what would it be?",
    "What's your favorite way to relax?",
  ];

  return iceBreakers[Math.floor(Math.random() * iceBreakers.length)];
}

function moderateContent(content: string): {
  isFlagged: boolean;
  reason?: string;
  priority: "low" | "medium" | "high" | "urgent";
} {
  const lowerContent = content.toLowerCase();
  
  const urgentKeywords = ["kill", "suicide", "harm"];
  const highKeywords = ["hate", "threat", "abuse"];
  const mediumKeywords = ["spam", "scam", "inappropriate"];

  for (const keyword of urgentKeywords) {
    if (lowerContent.includes(keyword)) {
      return { isFlagged: true, reason: "Crisis language detected", priority: "urgent" };
    }
  }

  for (const keyword of highKeywords) {
    if (lowerContent.includes(keyword)) {
      return { isFlagged: true, reason: "Harmful content detected", priority: "high" };
    }
  }

  for (const keyword of mediumKeywords) {
    if (lowerContent.includes(keyword)) {
      return { isFlagged: true, reason: "Potentially inappropriate content", priority: "medium" };
    }
  }

  return { isFlagged: false, priority: "low" };
}

function getTimezoneOffset(timezone: string): number {
  // Simplified timezone offset calculation
  // In production, use a proper timezone library
  const offsets: Record<string, number> = {
    "America/New_York": -5,
    "America/Chicago": -6,
    "America/Denver": -7,
    "America/Los_Angeles": -8,
    "Europe/London": 0,
    "Europe/Paris": 1,
    "Asia/Tokyo": 9,
    "Australia/Sydney": 10,
  };

  return offsets[timezone] || 0;
}
