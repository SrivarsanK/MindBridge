import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User Profiles with Privacy Settings
  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("student"), v.literal("moderator"), v.literal("crisis_responder")),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()), // Short description for peer matching
    // User demographic information
    age: v.optional(v.number()),
    gender: v.optional(v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("non-binary"),
      v.literal("prefer-not-to-say"),
      v.literal("other")
    )),
    timezone: v.string(),
    encryptedMoodHistory: v.string(), // Encrypted JSON blob
    // E2E Encryption Keys (Public keys only - private keys stored client-side)
    identityPublicKey: v.optional(v.string()), // base64 ECDH public key
    signedPreKeyPublic: v.optional(v.string()), // base64 signed pre-key
    preKeys: v.optional(v.array(v.string())), // Array of base64 one-time pre-keys
    preKeySignature: v.optional(v.string()), // Signature of signed pre-key
    privacySettings: v.object({
      allowPeerMatching: v.boolean(),
      allowDreamAnalysis: v.boolean(),
      shareEmotionalPatterns: v.boolean(),
      dataRetentionDays: v.number(),
    }),
    consentVersion: v.string(),
    consentTimestamp: v.number(),
    lastActive: v.number(),
    isAnonymous: v.boolean(),
    accountStatus: v.union(v.literal("active"), v.literal("suspended"), v.literal("deleted")),
  })
    .index("by_user_id", ["userId"])
    .index("by_role", ["role"])
    .index("by_last_active", ["lastActive"]),

  // AI Chatbot Conversations
  conversations: defineTable({
    userId: v.id("users"),
    encryptedMessages: v.string(), // Encrypted message history
    contextSummary: v.string(), // Non-sensitive context for AI
    messageCount: v.number(),
    lastMessageAt: v.number(),
    crisisDetected: v.boolean(),
    crisisLevel: v.optional(v.union(
      v.literal("none"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    )),
    sentiment: v.optional(v.object({
      score: v.number(),
      magnitude: v.number(),
      trend: v.string(),
    })),
    exportRequested: v.boolean(),
    exportedAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_crisis_detected", ["crisisDetected"])
    .index("by_last_message", ["lastMessageAt"]),

  // Individual Chat Messages (for streaming and recent access)
  chatMessages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    encryptedContent: v.string(),
    timestamp: v.number(),
    crisisKeywordsDetected: v.array(v.string()),
    sentimentScore: v.optional(v.number()),
    tokenCount: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user_and_timestamp", ["userId", "timestamp"]),

  // Dream Analysis Records
  dreamAnalysis: defineTable({
    userId: v.id("users"),
    encryptedMetadata: v.string(), // Encrypted dream details
    emotionalTags: v.array(v.string()),
    stressIndicators: v.array(v.string()),
    recurringThemes: v.array(v.string()),
    analysisDate: v.number(),
    visualizationData: v.object({
      emotionalWeather: v.string(),
      intensityScore: v.number(),
      themeEvolution: v.array(v.object({
        theme: v.string(),
        frequency: v.number(),
        timestamp: v.number(),
      })),
    }),
    privacyLevel: v.union(v.literal("private"), v.literal("anonymized"), v.literal("shared")),
  })
    .index("by_user_id", ["userId"])
    .index("by_analysis_date", ["analysisDate"]),

  // Peer Matching System
  peerMatches: defineTable({
    user1Id: v.id("users"),
    user2Id: v.optional(v.id("users")), // Optional for pending matches waiting for someone to join
    matchScore: v.number(),
    matchCriteria: v.object({
      moodCompatibility: v.number(),
      timezoneMatch: v.boolean(),
      lonelinessLevel: v.number(),
      sharedInterests: v.array(v.string()),
    }),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("reported"),
      v.literal("blocked")
    ),
    description: v.optional(v.string()), // Description of what user is looking for help with
    iceBreaker: v.string(),
    createdAt: v.number(),
    lastActivityAt: v.number(),
    messageCount: v.number(),
  })
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"])
    .index("by_status", ["status"])
    .index("by_last_activity", ["lastActivityAt"]),

  // Peer Messages (End-to-End Encrypted)
  peerMessages: defineTable({
    matchId: v.id("peerMatches"),
    senderId: v.id("users"),
    encryptedContent: v.string(), // AES-GCM encrypted message
    iv: v.string(), // Initialization vector for AES-GCM
    ephemeralPublicKey: v.optional(v.string()), // Sender's ephemeral public key (for first message)
    timestamp: v.number(),
    flaggedForModeration: v.boolean(),
    moderationReason: v.optional(v.string()),
    deliveryStatus: v.union(v.literal("sent"), v.literal("delivered"), v.literal("read")),
  })
    .index("by_match_id", ["matchId"])
    .index("by_flagged", ["flaggedForModeration"])
    .index("by_timestamp", ["timestamp"]),

  // Crisis Events
  crisisEvents: defineTable({
    userId: v.id("users"),
    source: v.union(
      v.literal("chat"),
      v.literal("dream_analysis"),
      v.literal("peer_report"),
      v.literal("manual_trigger")
    ),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    detectionData: v.object({
      keywords: v.array(v.string()),
      sentimentScore: v.number(),
      contextSnippet: v.string(),
    }),
    responseLevel: v.union(
      v.literal("self_help"),
      v.literal("peer_support"),
      v.literal("counselor_notification"),
      v.literal("emergency_intervention")
    ),
    status: v.union(
      v.literal("detected"),
      v.literal("acknowledged"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("escalated")
    ),
    assignedResponderId: v.optional(v.id("users")),
    detectedAt: v.number(),
    acknowledgedAt: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),
    followUpScheduled: v.boolean(),
    followUpAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_severity", ["severity"])
    .index("by_detected_at", ["detectedAt"])
    .index("by_follow_up", ["followUpScheduled", "followUpAt"]),

  // Audit Logs
  auditLogs: defineTable({
    userId: v.optional(v.id("users")),
    actorId: v.optional(v.id("users")),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    details: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
  })
    .index("by_user_id", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"])
    .index("by_severity", ["severity"]),

  // Rate Limiting
  rateLimits: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    requestCount: v.number(),
    windowStart: v.number(),
    windowEnd: v.number(),
    blocked: v.boolean(),
  })
    .index("by_user_and_endpoint", ["userId", "endpoint"])
    .index("by_window_end", ["windowEnd"]),

  // System Metrics
  systemMetrics: defineTable({
    metricType: v.union(
      v.literal("response_time"),
      v.literal("error_rate"),
      v.literal("active_connections"),
      v.literal("crisis_response_time"),
      v.literal("user_satisfaction")
    ),
    value: v.number(),
    metadata: v.string(),
    timestamp: v.number(),
  })
    .index("by_metric_type", ["metricType"])
    .index("by_timestamp", ["timestamp"]),

  // Data Export Requests
  dataExportRequests: defineTable({
    userId: v.id("users"),
    requestType: v.union(v.literal("gdpr"), v.literal("ccpa"), v.literal("user_initiated")),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    requestedAt: v.number(),
    completedAt: v.optional(v.number()),
    exportFileId: v.optional(v.id("_storage")),
    expiresAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"]),

  // Data Deletion Requests
  dataDeletionRequests: defineTable({
    userId: v.id("users"),
    requestType: v.union(v.literal("gdpr"), v.literal("ccpa"), v.literal("user_initiated")),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    requestedAt: v.number(),
    scheduledFor: v.number(),
    completedAt: v.optional(v.number()),
    retentionOverride: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_scheduled_for", ["scheduledFor"])
    .index("by_status", ["status"]),

  // Content Moderation Queue
  moderationQueue: defineTable({
    contentType: v.union(v.literal("peer_message"), v.literal("chat_message"), v.literal("report")),
    contentId: v.string(),
    reportedBy: v.optional(v.id("users")),
    reason: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("resolved"),
      v.literal("escalated")
    ),
    assignedModeratorId: v.optional(v.id("users")),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
    resolution: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_created_at", ["createdAt"]),

  // Daily Check-ins for Streak Tracking
  dailyCheckins: defineTable({
    userId: v.id("users"),
    mood: v.union(v.literal("neutral"), v.literal("anxious"), v.literal("low"), v.literal("lonely")),
    checkinDate: v.string(), // YYYY-MM-DD format for easy querying
    timestamp: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_date", ["userId", "checkinDate"])
    .index("by_timestamp", ["timestamp"]),

  // User Insights and Analytics
  userInsights: defineTable({
    userId: v.id("users"),
    insightType: v.union(
      v.literal("mood_pattern"),
      v.literal("activity_streak"),
      v.literal("progress_milestone"),
      v.literal("wellness_tip")
    ),
    title: v.string(),
    description: v.string(),
    metadata: v.string(), // JSON string with additional data
    generatedAt: v.number(),
    expiresAt: v.optional(v.number()),
    dismissed: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_type", ["userId", "insightType"])
    .index("by_generated_at", ["generatedAt"]),

  // User Conversation Patterns for LSTM Personalization
  userConversationPatterns: defineTable({
    userId: v.id("users"),
    emotionalProfile: v.object({
      dominantEmotions: v.array(v.string()), // e.g., ["anxious", "hopeful", "stressed"]
      emotionalTrends: v.array(v.object({
        emotion: v.string(),
        frequency: v.number(),
        recentOccurrences: v.array(v.number()), // timestamps
      })),
      responsePreferences: v.array(v.string()), // e.g., ["empathetic", "solution-focused"]
    }),
    topicPreferences: v.object({
      interests: v.array(v.string()), // Topics user engages with
      avoidances: v.array(v.string()), // Topics user doesn't engage with
      favoriteTopics: v.array(v.object({
        topic: v.string(),
        engagementScore: v.number(),
      })),
    }),
    communicationStyle: v.object({
      preferredTone: v.union(
        v.literal("formal"),
        v.literal("casual"),
        v.literal("empathetic"),
        v.literal("direct"),
        v.literal("supportive")
      ),
      responseLength: v.union(
        v.literal("brief"),
        v.literal("moderate"),
        v.literal("detailed")
      ),
      languageComplexity: v.union(
        v.literal("simple"),
        v.literal("moderate"),
        v.literal("advanced")
      ),
    }),
    conversationPatterns: v.object({
      averageMessageLength: v.number(),
      commonPhrases: v.array(v.string()),
      timeOfDayPattern: v.array(v.object({
        hour: v.number(),
        frequency: v.number(),
      })),
      sessionDuration: v.number(), // average in seconds
      conversationFrequency: v.number(), // conversations per week
    }),
    personalizedContext: v.string(), // LSTM-generated summary for context injection
    conversationCount: v.number(), // Total conversations analyzed
    lastUpdated: v.number(),
    version: v.number(),
    personalizationEnabled: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_last_updated", ["lastUpdated"]),

  // Conversation Embeddings for LSTM Processing
  conversationEmbeddings: defineTable({
    userId: v.id("users"),
    conversationId: v.id("conversations"),
    // Store embedding as string (JSON array) due to Convex limitations
    embeddingVector: v.string(), // JSON stringified number array
    timestamp: v.number(),
    emotionalState: v.string(),
    topics: v.array(v.string()),
    sentimentScore: v.number(),
    messageCount: v.number(),
    sessionDuration: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_conversation", ["conversationId"])
    .index("by_timestamp", ["timestamp"]),

  // Pattern Learning Sessions (tracks LSTM model updates)
  patternLearningSessions: defineTable({
    userId: v.id("users"),
    conversationsAnalyzed: v.number(),
    patternsExtracted: v.array(v.object({
      patternType: v.string(),
      confidence: v.number(),
      description: v.string(),
    })),
    modelVersion: v.string(),
    processingTime: v.number(), // milliseconds
    timestamp: v.number(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  // Professional Support System
  professionals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    title: v.string(), // e.g., "Clinical Psychologist", "Psychiatrist"
    specializations: v.array(v.string()), // e.g., ["Addiction Recovery", "CBT"]
    languages: v.array(v.string()),
    experience: v.number(), // years of experience
    qualifications: v.array(v.string()), // e.g., ["Ph.D. Psychology", "Licensed Clinical Psychologist"]
    bio: v.string(),
    profileImage: v.optional(v.string()),
    
    // Razorpay Integration
    razorpaySubAccountId: v.optional(v.string()), // Razorpay sub-account ID
    bankAccount: v.optional(v.object({
      accountNumber: v.string(),
      ifscCode: v.string(),
      accountHolderName: v.string(),
    })),
    
    // Session Pricing (in paise, 1 INR = 100 paise)
    sessionPrices: v.object({
      video: v.number(),
      phone: v.number(),
      chat: v.number(),
    }),
    
    // Availability
    availability: v.array(v.object({
      day: v.union(
        v.literal("monday"),
        v.literal("tuesday"),
        v.literal("wednesday"),
        v.literal("thursday"),
        v.literal("friday"),
        v.literal("saturday"),
        v.literal("sunday")
      ),
      slots: v.array(v.object({
        start: v.string(), // "HH:MM" format
        end: v.string(),
      })),
    })),
    
    // Verification
    verified: v.boolean(),
    verifiedAt: v.optional(v.number()),
    verifiedBy: v.optional(v.id("users")),
    
    // Stats
    totalSessions: v.number(),
    averageRating: v.number(),
    totalReviews: v.number(),
    
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    ),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_verified", ["verified"])
    .index("by_specializations", ["specializations"]),

  // Booking System
  bookings: defineTable({
    userId: v.id("users"),
    professionalId: v.id("professionals"),
    
    // Session Details
    sessionType: v.union(v.literal("video"), v.literal("phone"), v.literal("chat")),
    scheduledAt: v.number(),
    duration: v.number(), // minutes
    
    // Payment Details
    amount: v.number(), // in paise
    currency: v.string(), // "INR"
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    razorpaySignature: v.optional(v.string()),
    
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    
    // Session Data
    meetingLink: v.optional(v.string()), // For video sessions
    notes: v.optional(v.string()),
    
    // Timestamps
    createdAt: v.number(),
    confirmedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    
    // Cancellation
    cancellationReason: v.optional(v.string()),
    cancelledBy: v.optional(v.union(v.literal("user"), v.literal("professional"), v.literal("system"))),
  })
    .index("by_user_id", ["userId"])
    .index("by_professional_id", ["professionalId"])
    .index("by_status", ["status"])
    .index("by_scheduled_at", ["scheduledAt"])
    .index("by_razorpay_order", ["razorpayOrderId"]),

  // Transactions
  transactions: defineTable({
    bookingId: v.id("bookings"),
    userId: v.id("users"),
    professionalId: v.id("professionals"),
    
    // Payment Details
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    amount: v.number(), // in paise
    currency: v.string(),
    
    // Split Details
    platformFee: v.number(), // in paise (15%)
    professionalAmount: v.number(), // in paise (85%)
    
    // Status
    status: v.union(
      v.literal("created"),
      v.literal("authorized"),
      v.literal("captured"),
      v.literal("refunded"),
      v.literal("failed")
    ),
    
    // Timestamps
    createdAt: v.number(),
    capturedAt: v.optional(v.number()),
    refundedAt: v.optional(v.number()),
    
    // Additional Info
    paymentMethod: v.optional(v.string()),
    errorCode: v.optional(v.string()),
    errorDescription: v.optional(v.string()),
  })
    .index("by_booking_id", ["bookingId"])
    .index("by_user_id", ["userId"])
    .index("by_professional_id", ["professionalId"])
    .index("by_razorpay_order", ["razorpayOrderId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // Professional Reviews
  professionalReviews: defineTable({
    bookingId: v.id("bookings"),
    userId: v.id("users"),
    professionalId: v.id("professionals"),
    rating: v.number(), // 1-5
    review: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_professional_id", ["professionalId"])
    .index("by_user_id", ["userId"])
    .index("by_booking_id", ["bookingId"]),

  // ============================================
  // XP & GAMIFICATION SYSTEM
  // ============================================

  // User XP & Level Data
  userXP: defineTable({
    userId: v.id("users"),
    totalXP: v.number(), // All-time XP earned
    currentLevelXP: v.number(), // XP in current level
    level: v.number(), // Current level (1-100+)
    prestige: v.number(), // Prestige level (resets at max level)
    
    // Streaks
    dailyStreak: v.number(), // Consecutive days
    weeklyStreak: v.number(), // Consecutive weeks
    longestDailyStreak: v.number(),
    lastActivityDate: v.string(), // ISO date for streak tracking
    lastStreakCheckDate: v.string(),
    
    // Activity Tracking
    totalActions: v.number(), // Total interactions
    todayActions: v.number(), // Today's interaction count
    weeklyActions: v.number(),
    monthlyActions: v.number(),
    
    // Bonus Multipliers
    xpMultiplier: v.number(), // Temporary boost (e.g., 1.5x, 2x)
    multiplierExpiresAt: v.optional(v.number()),
    
    // Milestones
    milestonesReached: v.array(v.string()), // Array of milestone IDs
    nextMilestone: v.optional(v.string()),
    
    // Statistics
    totalBreathingSessions: v.number(),
    totalChatMessages: v.number(),
    totalPeerChats: v.number(),
    totalCheckIns: v.number(),
    totalArticlesRead: v.number(),
    positiveAIResponses: v.number(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    lastXPGainedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_level", ["level"])
    .index("by_total_xp", ["totalXP"])
    .index("by_daily_streak", ["dailyStreak"]),

  // XP Transactions (History of XP gains)
  xpTransactions: defineTable({
    userId: v.id("users"),
    amount: v.number(), // XP gained (or lost)
    source: v.union(
      v.literal("daily_checkin"),
      v.literal("breathing_exercise"),
      v.literal("ai_chat_positive"),
      v.literal("ai_chat_message"),
      v.literal("peer_chat_message"),
      v.literal("peer_chat_session"),
      v.literal("article_read"),
      v.literal("dream_journal"),
      v.literal("mood_log"),
      v.literal("streak_bonus"),
      v.literal("milestone_reward"),
      v.literal("achievement_unlock"),
      v.literal("daily_challenge"),
      v.literal("referral"),
      v.literal("profile_complete"),
      v.literal("first_time_bonus"),
      v.literal("random_bonus"),
      v.literal("admin_grant")
    ),
    multiplier: v.number(), // Applied multiplier (default 1.0)
    description: v.string(), // Human-readable description
    metadata: v.optional(v.object({
      activityId: v.optional(v.string()),
      achievementId: v.optional(v.string()),
      bonusReason: v.optional(v.string()),
    })),
    levelBefore: v.number(),
    levelAfter: v.number(),
    timestamp: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_source", ["source"]),

  // Achievements & Badges
  achievements: defineTable({
    userId: v.id("users"),
    achievementId: v.string(), // Unique achievement identifier
    category: v.union(
      v.literal("breathing"),
      v.literal("chat"),
      v.literal("peer_support"),
      v.literal("streaks"),
      v.literal("milestones"),
      v.literal("exploration"),
      v.literal("special")
    ),
    tier: v.union(
      v.literal("bronze"),
      v.literal("silver"),
      v.literal("gold"),
      v.literal("platinum"),
      v.literal("diamond")
    ),
    title: v.string(),
    description: v.string(),
    icon: v.string(), // Emoji or icon name
    xpReward: v.number(),
    unlockedAt: v.number(),
    progress: v.optional(v.number()), // For progressive achievements (0-100)
    isSecret: v.boolean(), // Hidden until unlocked
    rarity: v.union(
      v.literal("common"),
      v.literal("uncommon"),
      v.literal("rare"),
      v.literal("epic"),
      v.literal("legendary")
    ),
  })
    .index("by_user_id", ["userId"])
    .index("by_category", ["category"])
    .index("by_unlocked_at", ["unlockedAt"])
    .index("by_achievement_id", ["achievementId"]),

  // Daily Challenges
  dailyChallenges: defineTable({
    userId: v.id("users"),
    challengeId: v.string(), // Daily rotating challenge
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("breathing"),
      v.literal("chat"),
      v.literal("peer"),
      v.literal("mood"),
      v.literal("streak"),
      v.literal("explore")
    ),
    targetValue: v.number(), // Goal to reach
    currentProgress: v.number(), // Current progress
    xpReward: v.number(),
    bonusXPReward: v.number(), // Extra XP for perfect completion
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("expired")
    ),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    expiresAt: v.number(), // End of day timestamp
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_expires_at", ["expiresAt"]),

  // Leaderboards (Anonymous)
  leaderboardEntries: defineTable({
    userId: v.id("users"),
    anonymousName: v.string(), // Generated anonymous name
    avatar: v.string(), // Random avatar identifier
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("all_time")
    ),
    metric: v.union(
      v.literal("total_xp"),
      v.literal("level"),
      v.literal("streak"),
      v.literal("achievements")
    ),
    value: v.number(),
    rank: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_period_and_metric", ["period", "metric"])
    .index("by_rank", ["rank"])
    .index("by_user_id", ["userId"]),

  // XP Boosts & Power-ups
  xpBoosts: defineTable({
    userId: v.id("users"),
    boostType: v.union(
      v.literal("xp_multiplier"), // 2x, 3x XP
      v.literal("streak_freeze"), // Protect streak
      v.literal("instant_level"), // Gain instant level
      v.literal("random_achievement"), // Unlock random achievement
      v.literal("bonus_challenge") // Extra daily challenge
    ),
    multiplier: v.optional(v.number()), // For XP multipliers
    duration: v.optional(v.number()), // Duration in seconds
    isActive: v.boolean(),
    activatedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    source: v.union(
      v.literal("earned"),
      v.literal("purchased"),
      v.literal("milestone"),
      v.literal("gift")
    ),
    usedAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_is_active", ["isActive"])
    .index("by_expires_at", ["expiresAt"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

