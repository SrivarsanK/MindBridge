import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User Profiles with Privacy Settings
  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("student"), v.literal("moderator"), v.literal("crisis_responder")),
    displayName: v.optional(v.string()),
    timezone: v.string(),
    encryptedMoodHistory: v.string(), // Encrypted JSON blob
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
    user2Id: v.id("users"),
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
    encryptedContent: v.string(),
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
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
