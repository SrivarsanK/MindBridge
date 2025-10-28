import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // User Profiles with Privacy Settings
  userProfiles: defineTable({
    userId: v.string(),
    role: v.union(
      v.literal("student"),
      v.literal("moderator"),
      v.literal("admin"),
      v.literal("crisis_responder")
    ),
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
    // Moderation tracking
    moderationWarnings: v.optional(v.number()), // Count of warnings received
    lastWarningAt: v.optional(v.number()),
    suspensionHistory: v.optional(v.array(v.object({
      reason: v.string(),
      suspendedAt: v.number(),
      duration: v.number(),
    }))),
  })
    .index("by_user_id", ["userId"])
    .index("by_role", ["role"])
    .index("by_last_active", ["lastActive"]),

  // AI Chatbot Conversations
  conversations: defineTable({
    userId: v.string(),
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
    userId: v.string(),
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
    userId: v.string(),
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
    user1Id: v.string(),
    user2Id: v.optional(v.string()), // Optional for pending matches waiting for someone to join
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
    chatName: v.optional(v.string()), // AI-generated unique name for the chat
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
    senderId: v.string(),
    encryptedContent: v.string(), // AES-GCM encrypted message
    iv: v.string(), // Initialization vector for AES-GCM
    ephemeralPublicKey: v.optional(v.string()), // Sender's ephemeral public key (for first message)
    adminEncryptedContent: v.optional(v.string()), // Admin-accessible encrypted copy
    adminEncryptionIv: v.optional(v.string()), // IV for admin encryption
    timestamp: v.number(),
    flaggedForModeration: v.boolean(),
    moderationReason: v.optional(v.string()),
    moderationSeverity: v.optional(v.union(
      v.literal("none"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    )),
    moderationViolations: v.optional(v.array(v.string())), // Types of violations detected
    autoBlocked: v.optional(v.boolean()), // Auto-blocked by moderation system
    reviewedByAdmin: v.optional(v.boolean()),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    deliveryStatus: v.union(v.literal("sent"), v.literal("delivered"), v.literal("read")),
  })
    .index("by_match_id", ["matchId"])
    .index("by_flagged", ["flaggedForModeration"])
    .index("by_timestamp", ["timestamp"])
    .index("by_auto_blocked", ["autoBlocked"]),

  // Crisis Events
  crisisEvents: defineTable({
    userId: v.string(),
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
    assignedResponderId: v.optional(v.string()),
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
    userId: v.optional(v.string()),
    actorId: v.optional(v.string()),
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
    userId: v.string(),
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
    userId: v.string(),
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
    userId: v.string(),
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
    userId: v.optional(v.string()), // User who sent the content
    matchId: v.optional(v.id("peerMatches")), // For peer messages
    decryptedContent: v.optional(v.string()), // Admin-decrypted content for review
    originalText: v.optional(v.string()), // Pre-moderation text
    reportedBy: v.optional(v.string()),
    reason: v.string(),
    violations: v.array(v.object({
      type: v.string(),
      matched: v.string(),
      severity: v.string(),
      position: v.number(),
    })),
    severity: v.union(
      v.literal("none"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    confidence: v.number(), // AI confidence score
    autoBlocked: v.boolean(), // Auto-blocked without sending
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("resolved"),
      v.literal("escalated")
    ),
    assignedModeratorId: v.optional(v.string()),
    action: v.optional(v.union(
      v.literal("approved"),
      v.literal("blocked"),
      v.literal("warned"),
      v.literal("user_suspended")
    )),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
    resolution: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_severity", ["severity"])
    .index("by_created_at", ["createdAt"])
    .index("by_user_id", ["userId"])
    .index("by_auto_blocked", ["autoBlocked"]),

  // Daily Check-ins for Streak Tracking
  dailyCheckins: defineTable({
    userId: v.string(),
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
    userId: v.string(),
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

  // User XP and Gamification System
  userXP: defineTable({
    userId: v.string(),
    totalXP: v.number(),
    currentLevelXP: v.number(),
    level: v.number(),
    prestige: v.number(),
    dailyStreak: v.number(),
    weeklyStreak: v.number(),
    longestDailyStreak: v.number(),
    lastActivityDate: v.string(),
    lastStreakCheckDate: v.string(),
    totalActions: v.number(),
    todayActions: v.number(),
    weeklyActions: v.number(),
    monthlyActions: v.number(),
    xpMultiplier: v.number(),
    milestonesReached: v.array(v.string()),
    totalBreathingSessions: v.number(),
    totalChatMessages: v.number(),
    totalPeerChats: v.number(),
    totalCheckIns: v.number(),
    totalArticlesRead: v.number(),
    positiveAIResponses: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastXPGainedAt: v.number(),
  })
    .index("by_user_id", ["userId"]),

  // Bookings System
  bookings: defineTable({
    userId: v.string(),
    professionalId: v.id("professionals"),
    sessionType: v.union(v.literal("chat"), v.literal("video"), v.literal("phone")),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
    scheduledAt: v.number(),
    duration: v.number(), // in minutes
    amount: v.number(),
    currency: v.string(),
    notes: v.optional(v.string()),
    meetingLink: v.optional(v.string()),
    cancellationReason: v.optional(v.string()),
    cancelledAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    confirmedAt: v.optional(v.number()),
    cancelledBy: v.optional(v.string()),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    razorpaySignature: v.optional(v.string()),
    rating: v.optional(v.number()),
    review: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_professional_id", ["professionalId"])
    .index("by_status", ["status"])
    .index("by_scheduled_at", ["scheduledAt"]),

  // Professionals Directory
  professionals: defineTable({
    userId: v.string(),
    name: v.string(),
    title: v.string(),
    verified: v.boolean(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended")),
    specializations: v.array(v.string()),
    languages: v.array(v.string()),
    experience: v.number(), // years of experience
    licenseNumber: v.optional(v.string()),
    licenseExpiry: v.optional(v.number()),
    hourlyRate: v.number(),
    sessionPrices: v.object({
      chat: v.number(),
      video: v.number(),
      phone: v.number(),
    }),
    currency: v.string(),
    availability: v.array(
      v.object({
        day: v.union(
          v.literal("monday"),
          v.literal("tuesday"),
          v.literal("wednesday"),
          v.literal("thursday"),
          v.literal("friday"),
          v.literal("saturday"),
          v.literal("sunday")
        ),
        slots: v.array(
          v.object({
            start: v.string(),
            end: v.string(),
          })
        ),
      })
    ),
    bio: v.string(),
    profileImage: v.optional(v.string()),
    qualifications: v.array(v.string()),
    approach: v.string(),
    emergencyContact: v.boolean(),
    acceptsInsurance: v.boolean(),
    insuranceProviders: v.optional(v.array(v.string())),
    bankAccount: v.optional(
      v.object({
        accountNumber: v.string(),
        ifscCode: v.string(),
        accountHolderName: v.string(),
      })
    ),
    razorpaySubAccountId: v.optional(v.string()),
    rating: v.number(),
    reviewCount: v.number(),
    totalSessions: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_verified", ["verified"])
    .index("by_specializations", ["specializations"]),

  // Payment Transactions
  transactions: defineTable({
    userId: v.string(),
    bookingId: v.id("bookings"),
    professionalId: v.id("professionals"),
    amount: v.number(),
    platformFee: v.number(),
    professionalAmount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("cancelled"),
      v.literal("created")
    ),
    paymentMethod: v.union(v.literal("razorpay"), v.literal("stripe"), v.literal("paypal")),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    razorpaySignature: v.optional(v.string()),
    refundId: v.optional(v.string()),
    refundAmount: v.optional(v.number()),
    refundReason: v.optional(v.string()),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_booking_id", ["bookingId"])
    .index("by_professional_id", ["professionalId"])
    .index("by_razorpay_order", ["razorpayOrderId"])
    .index("by_status", ["status"]),

  // User Conversation Patterns for AI Personalization
  userConversationPatterns: defineTable({
    userId: v.string(),
    patterns: v.string(), // JSON string of conversation patterns
    version: v.number(),
    personalizationEnabled: v.boolean(),
    emotionalProfile: v.optional(v.object({
      dominantEmotions: v.array(v.string()),
      emotionalTrends: v.array(v.object({
        emotion: v.string(),
        frequency: v.number(),
        recentOccurrences: v.array(v.number()),
      })),
      responsePreferences: v.array(v.string()),
    })),
    communicationStyle: v.optional(v.object({
      tone: v.string(),
      verbosity: v.string(),
      preferredResponseLength: v.string(),
      communicationPatterns: v.array(v.string()),
      supportNeeds: v.array(v.string()),
    })),
    preferredTopics: v.optional(v.array(v.string())),
    avoidedTopics: v.optional(v.array(v.string())),
    crisisIndicators: v.optional(v.array(v.string())),
    lastUpdated: v.number(),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"]),

  // Conversation Embeddings for Semantic Search
  conversationEmbeddings: defineTable({
    userId: v.string(),
    conversationId: v.id("conversations"),
    messageIndex: v.number(),
    embedding: v.array(v.number()), // Vector embedding
    contentHash: v.string(),
    messageCount: v.optional(v.number()),
    timestamp: v.optional(v.number()),
    sentimentScore: v.optional(v.number()),
    sessionDuration: v.optional(v.number()),
    embeddingVector: v.optional(v.string()),
    emotionalState: v.optional(v.string()),
    topics: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_conversation", ["conversationId"]),

  // Pattern Learning Sessions
  patternLearningSessions: defineTable({
    userId: v.string(),
    sessionData: v.string(), // JSON string of learning session data
    patternsLearned: v.number(),
    accuracy: v.number(),
    duration: v.number(),
    completedAt: v.number(),
    errorMessage: v.optional(v.string()),
    timestamp: v.optional(v.number()),
    success: v.optional(v.boolean()),
    conversationsAnalyzed: v.optional(v.number()),
    patternsExtracted: v.optional(v.array(v.object({
      description: v.string(),
      confidence: v.number(),
      patternType: v.string(),
    }))),
    modelVersion: v.optional(v.string()),
    processingTime: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_completed_at", ["completedAt"]),

  // XP Boosts and Multipliers
  xpBoosts: defineTable({
    userId: v.string(),
    boostType: v.union(
      v.literal("streak_freeze"),
      v.literal("xp_multiplier"),
      v.literal("bonus_points")
    ),
    multiplier: v.optional(v.number()),
    bonusXP: v.optional(v.number()),
    isActive: v.boolean(),
    activatedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    usedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_boost_type", ["boostType"])
    .index("by_is_active", ["isActive"]),

  // XP Transaction History
  xpTransactions: defineTable({
    userId: v.string(),
    amount: v.number(),
    reason: v.string(),
    source: v.union(
      v.literal("daily_checkin"),
      v.literal("chat_message"),
      v.literal("breathing_session"),
      v.literal("peer_chat"),
      v.literal("article_read"),
      v.literal("achievement"),
      v.literal("bonus"),
      v.literal("streak_bonus"),
      v.literal("breathing_exercise"),
      v.literal("ai_chat_positive"),
      v.literal("ai_chat_message"),
      v.literal("peer_chat_message"),
      v.literal("peer_chat_session"),
      v.literal("dream_journal"),
      v.literal("meditation_session"),
      v.literal("journal_entry"),
      v.literal("mood_tracking"),
      v.literal("goal_achievement"),
      v.literal("streak_maintenance"),
      v.literal("admin_grant")
    ),
    metadata: v.optional(v.union(v.string(), v.object({
      achievementId: v.optional(v.string()),
      activityId: v.optional(v.string()),
      bonusReason: v.optional(v.string()),
      multiplier: v.optional(v.number()),
      description: v.optional(v.string()),
      levelBefore: v.optional(v.number()),
      levelAfter: v.optional(v.number()),
      timestamp: v.optional(v.number()),
    }))),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_created_at", ["createdAt"]),

  // Achievements System
  achievements: defineTable({
    userId: v.string(),
    achievementId: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.union(
      v.literal("streak"),
      v.literal("engagement"),
      v.literal("wellness"),
      v.literal("social"),
      v.literal("milestone"),
      v.literal("chat"),
      v.literal("peer_support"),
      v.literal("breathing"),
      v.literal("streaks"),
      v.literal("milestones"),
      v.literal("exploration"),
      v.literal("special")
    ),
    xpReward: v.number(),
    unlockedAt: v.number(),
    claimed: v.boolean(),
    claimedAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_achievement_id", ["achievementId"])
    .index("by_category", ["category"]),

  // Leaderboard Entries
  leaderboardEntries: defineTable({
    userId: v.string(),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("all_time")),
    metric: v.union(v.literal("xp"), v.literal("streak"), v.literal("achievements"), v.literal("sessions"), v.literal("total_xp")),
    value: v.number(),
    rank: v.number(),
    lastUpdated: v.number(),
    anonymousName: v.optional(v.string()),
    avatar: v.optional(v.string()),
  })
    .index("by_period_and_metric", ["period", "metric"])
    .index("by_user_id", ["userId"]),

  // Daily Challenges
  dailyChallenges: defineTable({
    userId: v.string(),
    challengeType: v.union(
      v.literal("checkin"),
      v.literal("chat"),
      v.literal("breathing"),
      v.literal("reading"),
      v.literal("peer_support")
    ),
    target: v.number(),
    progress: v.number(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    xpReward: v.number(),
    date: v.string(), // YYYY-MM-DD
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_date", ["date"])
    .index("by_completed", ["completed"]),
});

