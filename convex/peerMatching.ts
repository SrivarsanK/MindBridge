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
    userId: v.string(),
    mood: v.string(),
    lonelinessLevel: v.number(),
    interests: v.array(v.string()),
    timezone: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"peerMatches"> | null> => {
    console.log(`🔍 Processing peer match for user ${args.userId}`);
    
    // Get potential matches
    const candidates: any[] = await ctx.runQuery(internal.peerMatching.loadPotentialMatches, {
      userId: args.userId,
      timezone: args.timezone,
    });

    console.log(`📋 Found ${candidates.length} potential candidates`);

    if (candidates.length === 0) {
      console.log(`❌ No candidates found for user ${args.userId}`);
      return null;
    }

    // Calculate scores for all candidates
    const scoredCandidates = candidates.map(candidate => {
      const score = calculateMatchScore(
        args.mood,
        args.lonelinessLevel,
        args.interests,
        candidate
      );
      
      console.log(`   Candidate ${candidate.userId}: score ${score.toFixed(2)}`);
      
      return { candidate, score };
    });

    // Sort by score (highest first)
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Select from top matches with weighted randomness
    // This prevents always matching with the exact same person
    // while still favoring better matches
    let selectedMatch;
    
    if (scoredCandidates.length === 1) {
      selectedMatch = scoredCandidates[0];
    } else {
      // Weight the selection towards higher scores
      // Top match has highest chance, but not guaranteed
      const topCandidates = scoredCandidates.slice(0, Math.min(5, scoredCandidates.length));
      const weights = topCandidates.map((_, index) => Math.pow(2, topCandidates.length - index));
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      
      let random = Math.random() * totalWeight;
      let selectedIndex = 0;
      
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          selectedIndex = i;
          break;
        }
      }
      
      selectedMatch = topCandidates[selectedIndex];
    }

    console.log(`✅ Selected match with score: ${selectedMatch.score.toFixed(2)}`);

    // Generate ice-breaker
    const iceBreaker = await generateIceBreaker(args.mood, args.interests);

    // Create match
    const matchId: Id<"peerMatches"> = await ctx.runMutation(internal.peerMatching.createMatch, {
      user1Id: args.userId,
      user2Id: selectedMatch.candidate.userId,
      matchScore: selectedMatch.score,
      mood: args.mood,
      lonelinessLevel: args.lonelinessLevel,
      interests: args.interests,
      iceBreaker,
    });

    console.log(`🎉 Match created: ${matchId}`);

    return matchId;
  },
});

// Internal query: Load potential matches
export const loadPotentialMatches = internalQuery({
  args: {
    userId: v.string(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    // Get recently active profiles (last 30 minutes for better real-time matching)
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    
    const profiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_last_active")
      .order("desc")
      .filter((q) => q.gte(q.field("lastActive"), thirtyMinutesAgo))
      .take(100); // Increased to get more candidates

    // Get existing matches for this user to avoid re-matching
    const existingMatches = await ctx.db
      .query("peerMatches")
      .withIndex("by_user1", (q) => q.eq("user1Id", args.userId))
      .collect();

    const reverseMatches = await ctx.db
      .query("peerMatches")
      .withIndex("by_user2", (q) => q.eq("user2Id", args.userId))
      .collect();

    // Create a set of user IDs to exclude (already matched in last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const excludedUserIds = new Set<string>();
    
    [...existingMatches, ...reverseMatches].forEach(match => {
      // Only exclude recent matches (last 24 hours)
      if (match.createdAt > oneDayAgo) {
        const otherUserId = match.user1Id === args.userId ? match.user2Id : match.user1Id;
        if (otherUserId) {
          excludedUserIds.add(otherUserId);
        }
      }
    });

    // Filter for eligible matches
    const candidates = profiles.filter((profile) => {
      return (
        profile.userId !== args.userId &&
        !excludedUserIds.has(profile.userId) &&
        profile.privacySettings.allowPeerMatching &&
        profile.accountStatus === "active" &&
        Math.abs(getTimezoneOffset(profile.timezone) - getTimezoneOffset(args.timezone)) <= 4
      );
    });

    console.log(`✅ Filtered to ${candidates.length} eligible candidates (excluded ${excludedUserIds.size} recent matches)`);

    return candidates;
  },
});

// Internal: Create match
export const createMatch = internalMutation({
  args: {
    user1Id: v.string(),
    user2Id: v.string(),
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

    // Get active matches where user is user1
    const matches1 = await ctx.db
      .query("peerMatches")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .filter((q) => q.or(
        q.eq(q.field("status"), "active"),
        q.eq(q.field("status"), "pending")
      ))
      .collect();

    // Get active matches where user is user2
    const matches2 = await ctx.db
      .query("peerMatches")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const allMatches = [...matches1, ...matches2];
    
    // Enrich matches with peer display names
    const enrichedMatches = await Promise.all(
      allMatches.map(async (match) => {
        // For pending matches without user2Id
        if (match.status === "pending" && !match.user2Id) {
          return {
            ...match,
            peerId: null,
            peerDisplayName: "Waiting for someone to join...",
            isPending: true,
          };
        }

        // Determine who is the peer (the other user)
        const peerId = match.user1Id === userId ? match.user2Id : match.user1Id;
        
        if (!peerId) {
          // Skip if peerId is undefined (shouldn't happen but TypeScript safety)
          return {
            ...match,
            peerId: null,
            peerDisplayName: "Unknown",
            isPending: match.status === "pending",
          };
        }
        
        // Get peer's profile for display name
        const peerProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", peerId))
          .first();
        
        // Generate or use existing display name (keep anonymous)
        const peerDisplayName = peerProfile?.displayName || `Peer${peerId.slice(-4)}`;
        
        return {
          ...match,
          peerId,
          peerDisplayName,
          isPending: match.status === "pending",
        };
      })
    );
    
    return enrichedMatches;
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

// Send peer message (E2E Encrypted)
export const sendPeerMessage = mutation({
  args: {
    matchId: v.id("peerMatches"),
    encryptedContent: v.string(),
    iv: v.string(),
    ephemeralPublicKey: v.optional(v.string()),
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

    // Note: Content is encrypted client-side, server cannot moderate encrypted content
    // Moderation happens through user reports only

    const messageId = await ctx.db.insert("peerMessages", {
      matchId: args.matchId,
      senderId: userId,
      encryptedContent: args.encryptedContent,
      iv: args.iv,
      ephemeralPublicKey: args.ephemeralPublicKey,
      timestamp: Date.now(),
      flaggedForModeration: false,
      deliveryStatus: "sent",
    });

    // Update match
    await ctx.db.patch(args.matchId, {
      lastActivityAt: Date.now(),
      messageCount: match.messageCount + 1,
    });

    return messageId;
  },
});

// Get peer messages (returns encrypted messages for client-side decryption)
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

    return messages.reverse().map((msg) => ({
      _id: msg._id,
      senderId: msg.senderId,
      encryptedContent: msg.encryptedContent,
      iv: msg.iv,
      ephemeralPublicKey: msg.ephemeralPublicKey,
      timestamp: msg.timestamp,
      deliveryStatus: msg.deliveryStatus,
      isMine: msg.senderId === userId,
    }));
  },
});

// Mark messages as delivered (called when peer receives messages)
export const markMessagesAsDelivered = mutation({
  args: {
    matchId: v.id("peerMatches"),
    messageIds: v.array(v.id("peerMessages")),
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

    // Update all specified messages to "delivered" if they're still "sent"
    for (const messageId of args.messageIds) {
      const message = await ctx.db.get(messageId);
      if (message && message.senderId !== userId && message.deliveryStatus === "sent") {
        await ctx.db.patch(messageId, {
          deliveryStatus: "delivered",
        });
      }
    }

    return { success: true };
  },
});

// Mark messages as seen (called when user is viewing the chat)
export const markMessagesAsSeen = mutation({
  args: {
    matchId: v.id("peerMatches"),
    messageIds: v.array(v.id("peerMessages")),
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

    // Update all specified messages to "read" if sent by peer
    for (const messageId of args.messageIds) {
      const message = await ctx.db.get(messageId);
      if (message && message.senderId !== userId && message.deliveryStatus !== "read") {
        await ctx.db.patch(messageId, {
          deliveryStatus: "read",
        });
      }
    }

    return { success: true };
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
      violations: [], // No automated violations for user reports
      severity: "medium", // User reports are medium priority by default
      confidence: 1.0, // User reports have full confidence
      autoBlocked: false, // User reports don't auto-block
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

  // Base score for timezone compatibility (already filtered)
  score += 20;

  // Loneliness level compatibility
  // Since candidates don't have loneliness level stored, we give a base score
  // In a real system, you'd want to store this temporarily or in profile
  score += 15;

  // Recent activity bonus - prioritize recently active users
  const minutesSinceActive = (Date.now() - candidate.lastActive) / 60000;
  if (minutesSinceActive < 5) score += 25; // Very active (last 5 min)
  else if (minutesSinceActive < 15) score += 20; // Active (last 15 min)
  else if (minutesSinceActive < 30) score += 15; // Recently active (last 30 min)
  else if (minutesSinceActive < 60) score += 10; // Active (last hour)
  else score += 5; // Active today

  // Privacy settings bonus - users who share emotional patterns are better matches
  if (candidate.privacySettings?.shareEmotionalPatterns) {
    score += 15;
  }

  // Bonus for users who have peer matching enabled (should always be true due to filtering)
  if (candidate.privacySettings?.allowPeerMatching) {
    score += 10;
  }

  // Account status and bio completeness
  if (candidate.bio && candidate.bio.length > 20) {
    score += 10; // Has a meaningful bio
  }

  // Add some randomness to avoid always matching with the same person
  // This creates variety in matches while still favoring better matches
  const randomBonus = Math.random() * 10;
  score += randomBonus;

  return Math.min(100, Math.round(score));
}

async function generateIceBreaker(mood: string, interests: string[]): Promise<string> {
  // Mood-based ice breakers
  const moodIceBreakers: Record<string, string[]> = {
    anxious: [
      "What helps you feel calm when things get overwhelming?",
      "What's something you're looking forward to?",
      "Do you have any go-to relaxation techniques?",
    ],
    lonely: [
      "What's something you wish more people understood about you?",
      "What's been on your mind lately?",
      "If you could talk to anyone right now, what would you say?",
    ],
    stressed: [
      "What's taking up most of your mental energy right now?",
      "How do you usually decompress after a tough day?",
      "What's one small thing that would make today better?",
    ],
    sad: [
      "What's something that usually lifts your spirits?",
      "Would you like to share what's been weighing on you?",
      "What's a memory that makes you smile?",
    ],
    hopeful: [
      "What's something you're excited about?",
      "What positive changes have you noticed lately?",
      "What goals are you working toward?",
    ],
    confused: [
      "What's been puzzling you lately?",
      "Sometimes talking helps sort things out - what's on your mind?",
      "What decision or situation has you feeling uncertain?",
    ],
  };

  // Interest-based ice breakers
  const interestIceBreakers: Record<string, string> = {
    interest_music: "What kind of music have you been listening to lately?",
    interest_reading: "Read anything interesting recently?",
    interest_gaming: "What games are you playing right now?",
    interest_sports: "Do you play any sports or follow any teams?",
    interest_art: "What kind of art inspires you?",
    interest_coding: "What are you building or learning in code?",
    interest_movies: "Seen any good movies or shows lately?",
    interest_travel: "Where's a place you'd love to visit?",
    interest_cooking: "What's your favorite thing to cook?",
    interest_photography: "What do you like to photograph?",
    interest_fitness: "What's your workout routine like?",
    interest_meditation: "How long have you been practicing meditation?",
    interest_writing: "What do you like to write about?",
    interest_dancing: "What style of dance do you enjoy?",
    interest_nature: "What's your favorite outdoor activity?",
    interest_science: "What scientific topics fascinate you?",
    interest_fashion: "What's your style aesthetic?",
    interest_volunteering: "What causes are you passionate about?",
  };

  // Try mood-specific ice breaker first
  if (mood && moodIceBreakers[mood.toLowerCase()]) {
    const moodOptions = moodIceBreakers[mood.toLowerCase()];
    return moodOptions[Math.floor(Math.random() * moodOptions.length)];
  }

  // Try interest-based ice breaker
  if (interests.length > 0) {
    const randomInterest = interests[Math.floor(Math.random() * interests.length)];
    if (interestIceBreakers[randomInterest]) {
      return interestIceBreakers[randomInterest];
    }
  }

  // Fallback to generic ice breakers
  const genericIceBreakers = [
    "What's been on your mind lately?",
    "How has your day been going?",
    "What's something that made you smile recently?",
    "If you could do anything right now, what would it be?",
    "What's your favorite way to relax?",
    "What's something you're grateful for today?",
    "What's a hobby you've always wanted to try?",
  ];

  return genericIceBreakers[Math.floor(Math.random() * genericIceBreakers.length)];
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

// ===== E2E Encryption Functions =====

/**
 * Upload public keys for E2E encryption (called on first login)
 */
export const uploadPreKeys = mutation({
  args: {
    identityPublicKey: v.string(),
    signedPreKeyPublic: v.string(),
    preKeys: v.array(v.string()),
    preKeySignature: v.string(),
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

    await ctx.db.patch(profile._id, {
      identityPublicKey: args.identityPublicKey,
      signedPreKeyPublic: args.signedPreKeyPublic,
      preKeys: args.preKeys,
      preKeySignature: args.preKeySignature,
    });

    return { success: true };
  },
});

/**
 * Get pre-key bundle for a user (for initiating E2E encrypted conversation)
 */
export const getPreKeyBundle = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId!))
      .first();

    if (!profile) {
      return null;
    }

    if (!profile.identityPublicKey || !profile.signedPreKeyPublic || !profile.preKeys || profile.preKeys.length === 0) {
      return null;
    }

    // Return one pre-key (and remove it to ensure one-time use)
    const preKey = profile.preKeys[0];

    return {
      identityKey: profile.identityPublicKey,
      signedPreKey: profile.signedPreKeyPublic,
      preKey: preKey,
      signature: profile.preKeySignature || "",
    };
  },
});

/**
 * Consume a pre-key after use (to ensure one-time use)
 */
export const consumePreKey = mutation({
  args: {
    userId: v.string(),
    preKey: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile || !profile.preKeys) {
      return;
    }

    // Remove the used pre-key
    const updatedPreKeys = profile.preKeys.filter((key) => key !== args.preKey);
    
    await ctx.db.patch(profile._id, {
      preKeys: updatedPreKeys,
    });
  },
});

/**
 * Get match details including peer info
 */
export const getMatchDetails = query({
  args: {
    matchId: v.id("peerMatches"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const match = await ctx.db.get(args.matchId);
    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
      return null;
    }

    // Get peer user ID
    const peerId = match.user1Id === userId ? match.user2Id : match.user1Id;

    if (!peerId) {
      // Handle edge case where peer ID is not set (shouldn't happen but handle gracefully)
      return {
        matchId: match._id,
        peerId: null,
        status: match.status,
        createdAt: match.createdAt,
        iceBreaker: match.iceBreaker,
        messageCount: match.messageCount,
        peerDisplayName: "Unknown Peer",
        matchScore: match.matchScore,
      };
    }

    // Get peer profile (only pseudonym, no PII)
    const peerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", peerId))
      .first();

    return {
      matchId: match._id,
      peerId,
      status: match.status,
      createdAt: match.createdAt,
      iceBreaker: match.iceBreaker,
      messageCount: match.messageCount,
      peerDisplayName: peerProfile?.displayName || "Anonymous Peer",
      matchScore: match.matchScore,
    };
  },
});

// Get available peers for browsing and direct chat
export const getAvailablePeers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!currentProfile) {
      return [];
    }

    // Get all profiles that have peer matching enabled and are active
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const allProfiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_last_active")
      .filter((q) => 
        q.and(
          q.neq(q.field("userId"), userId), // Not current user
          q.eq(q.field("privacySettings.allowPeerMatching"), true), // Has peer matching enabled
          q.eq(q.field("accountStatus"), "active"), // Active account
          q.gte(q.field("lastActive"), fiveMinutesAgo) // Active in last 5 minutes
        )
      )
      .take(20);

    // Get existing matches for this user to exclude
    const existingMatches = await ctx.db
      .query("peerMatches")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();

    const matchedUserIds = new Set(existingMatches.map(m => m.user2Id));

    // Also check reverse matches
    const reverseMatches = await ctx.db
      .query("peerMatches")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();

    reverseMatches.forEach(m => matchedUserIds.add(m.user1Id));

    // Filter out already matched users
    const availablePeers = allProfiles
      .filter(profile => !matchedUserIds.has(profile.userId))
      .map(profile => ({
        userId: profile.userId,
        displayName: profile.displayName || "Anonymous User",
        bio: profile.bio || "No bio yet",
        age: profile.age,
        timezone: profile.timezone,
        lastActive: profile.lastActive,
      }));

    return availablePeers;
  },
});

// Create a direct peer match (for browsing-based matching)
export const createDirectPeerMatch = mutation({
  args: {
    targetUserId: v.string(),
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

    // Check if match already exists
    const existingMatch = await ctx.db
      .query("peerMatches")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("user2Id"), args.targetUserId),
          q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("status"), "pending")
          )
        )
      )
      .first();

    if (existingMatch) {
      return { success: true, matchId: existingMatch._id, message: "Match already exists" };
    }

    // Check reverse match
    const reverseMatch = await ctx.db
      .query("peerMatches")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("user1Id"), args.targetUserId),
          q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("status"), "pending")
          )
        )
      )
      .first();

    if (reverseMatch) {
      return { success: true, matchId: reverseMatch._id, message: "Match already exists" };
    }

    // Create new match
    const matchId = await ctx.db.insert("peerMatches", {
      user1Id: userId,
      user2Id: args.targetUserId,
      matchScore: 80, // Default score for direct matches
      matchCriteria: {
        moodCompatibility: 0.8,
        timezoneMatch: true,
        lonelinessLevel: 5,
        sharedInterests: ["general support"],
      },
      status: "active",
      iceBreaker: "Hey! I'd like to connect with you. How are you doing today?",
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      messageCount: 0,
    });

    return { success: true, matchId, message: "Match created successfully" };
  },
});

// Create a pending match that others can join
export const createOpenMatch = mutation({
  args: {
    mood: v.string(),
    lonelinessLevel: v.number(),
    interests: v.array(v.string()),
    description: v.string(), // What the user is looking for help with
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

    // Check if user already has a pending match
    const existingPending = await ctx.db
      .query("peerMatches")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingPending) {
      return { 
        success: true, 
        matchId: existingPending._id, 
        message: "You already have a pending match" 
      };
    }

    // Generate ice breaker based on mood
    const iceBreaker = await generateIceBreaker(args.mood, args.interests);

    // Create pending match (no user2Id yet)
    const matchId = await ctx.db.insert("peerMatches", {
      user1Id: userId,
      user2Id: undefined, // Will be set when someone joins
      matchScore: 0, // Will be calculated when someone joins
      matchCriteria: {
        moodCompatibility: 0,
        timezoneMatch: true,
        lonelinessLevel: args.lonelinessLevel,
        sharedInterests: args.interests,
      },
      status: "pending",
      description: args.description,
      iceBreaker,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      messageCount: 0,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "open_match_created",
      resourceType: "peerMatch",
      resourceId: matchId,
      details: `Created open match: ${args.description}`,
      timestamp: Date.now(),
      severity: "info",
    });

    return { success: true, matchId, message: "Open match created successfully" };
  },
});

// Get all pending matches that others can join
export const getPendingMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!profile?.privacySettings.allowPeerMatching) {
      return [];
    }

    // Get all pending matches (exclude user's own pending matches)
    const pendingMatches = await ctx.db
      .query("peerMatches")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.neq(q.field("user1Id"), userId))
      .order("desc")
      .take(20); // Limit to 20 most recent

    // Enrich with creator information
    const enrichedMatches = await Promise.all(
      pendingMatches.map(async (match) => {
        const creatorProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", match.user1Id))
          .first();

        const creatorDisplayName = creatorProfile?.displayName || `Peer${match.user1Id.slice(-4)}`;
        
        // Calculate time ago
        const minutesAgo = Math.floor((Date.now() - match.createdAt) / 60000);
        const timeAgo = 
          minutesAgo < 1 ? "Just now" :
          minutesAgo < 60 ? `${minutesAgo}m ago` :
          minutesAgo < 1440 ? `${Math.floor(minutesAgo / 60)}h ago` :
          `${Math.floor(minutesAgo / 1440)}d ago`;

        return {
          ...match,
          creatorId: match.user1Id,
          creatorDisplayName,
          timeAgo,
        };
      })
    );

    return enrichedMatches;
  },
});

// Join a pending match
export const joinPendingMatch = mutation({
  args: {
    matchId: v.id("peerMatches"),
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

    // Get the pending match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (match.status !== "pending") {
      throw new Error("This match is no longer available");
    }

    if (match.user1Id === userId) {
      throw new Error("You cannot join your own match");
    }

    if (match.user2Id) {
      throw new Error("This match has already been joined");
    }

    // Calculate match score based on compatibility
    const creatorProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", match.user1Id))
      .first();

    const matchScore = calculateMatchScore(
      "", // mood not needed for joining
      match.matchCriteria.lonelinessLevel,
      match.matchCriteria.sharedInterests,
      {
        lastActive: profile.lastActive,
        privacySettings: profile.privacySettings,
        bio: profile.bio,
        timezone: profile.timezone,
      }
    );

    // Update match to active with user2Id
    await ctx.db.patch(args.matchId, {
      user2Id: userId,
      status: "active",
      matchScore,
      lastActivityAt: Date.now(),
    });

    // Audit logs
    await ctx.db.insert("auditLogs", {
      userId,
      action: "joined_pending_match",
      resourceType: "peerMatch",
      resourceId: args.matchId,
      details: `Joined pending match (score: ${matchScore})`,
      timestamp: Date.now(),
      severity: "info",
    });

    await ctx.db.insert("auditLogs", {
      userId: match.user1Id,
      action: "pending_match_joined",
      resourceType: "peerMatch",
      resourceId: args.matchId,
      details: `Your pending match was joined`,
      timestamp: Date.now(),
      severity: "info",
    });

    return { success: true, matchId: args.matchId, message: "Successfully joined the match" };
  },
});
