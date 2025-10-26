/**
 * XP System - Convex Functions
 * 
 * Server-side functions for managing XP, levels, achievements, and gamification
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import {
  XP_VALUES,
  getLevelFromXP,
  getXPForLevel,
  STREAK_BONUSES,
  XP_MULTIPLIERS,
  ACHIEVEMENTS,
  generateAnonymousName,
  generateRandomAvatar,
  getLevelUpRewards,
  RANDOM_BONUSES,
} from "../lib/xp/constants";

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize XP data for a new user
 */
export const initializeUserXP = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId as Id<"users">;
    // Check if already initialized
    const existing = await ctx.db
      .query("userXP")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new XP record
    const xpId = await ctx.db.insert("userXP", {
      userId: userId,
      totalXP: 0,
      currentLevelXP: 0,
      level: 1,
      prestige: 0,
      dailyStreak: 0,
      weeklyStreak: 0,
      longestDailyStreak: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      lastStreakCheckDate: new Date().toISOString().split('T')[0],
      totalActions: 0,
      todayActions: 0,
      weeklyActions: 0,
      monthlyActions: 0,
      xpMultiplier: 1.0,
      milestonesReached: [],
      totalBreathingSessions: 0,
      totalChatMessages: 0,
      totalPeerChats: 0,
      totalCheckIns: 0,
      totalArticlesRead: 0,
      positiveAIResponses: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastXPGainedAt: Date.now(),
    });

    // Create leaderboard entry
    await ctx.db.insert("leaderboardEntries", {
      userId,
      period: "all_time",
      metric: "total_xp",
      value: 0,
      rank: 0,
      lastUpdated: Date.now(),
    });

    return xpId;
  },
});

// ============================================
// XP GAIN
// ============================================

/**
 * Award XP to a user for an action
 */
export const awardXP = mutation({
  args: {
    userId: v.string(),
    source: v.union(
      v.literal("daily_checkin"),
      v.literal("breathing_session"),
      v.literal("ai_chat_positive"),
      v.literal("chat_message"),
      v.literal("peer_chat"),
      v.literal("peer_chat"),
      v.literal("article_read"),
      v.literal("bonus"),
      v.literal("streak_bonus"),
      v.literal("bonus"),
      v.literal("achievement"),
      v.literal("bonus"),
      v.literal("bonus"),
      v.literal("bonus"),
      v.literal("bonus"),
      v.literal("bonus"),
      v.literal("admin_grant")
    ),
    amount: v.number(),
    description: v.optional(v.string()),
    metadata: v.optional(v.object({
      activityId: v.optional(v.string()),
      achievementId: v.optional(v.string()),
      bonusReason: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = args.userId as Id<"users">;
    // Get user XP data
    let userXP = await ctx.db
      .query("userXP")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userXP) {
      throw new Error("User XP not initialized. Please initialize first.");
    }

    // Calculate multiplier
    let multiplier = userXP.xpMultiplier || 1.0;
    
    // Check for active XP boost
    const activeBoost = await ctx.db
      .query("xpBoosts")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.gt(q.field("expiresAt"), Date.now())
        )
      )
      .first();
    
    if (activeBoost?.multiplier) {
      multiplier *= activeBoost.multiplier;
    }

    // Apply streak bonuses
    if (userXP.dailyStreak >= 30) {
      multiplier *= XP_MULTIPLIERS.STREAK_ACTIVE_30DAY;
    } else if (userXP.dailyStreak >= 7) {
      multiplier *= XP_MULTIPLIERS.STREAK_ACTIVE_7DAY;
    }

    // Weekend bonus
    const now = new Date();
    if (now.getDay() === 0 || now.getDay() === 6) {
      multiplier *= XP_MULTIPLIERS.WEEKEND_BONUS;
    }

    // Evening bonus (8 PM - 11 PM)
    const hour = now.getHours();
    if (hour >= 20 && hour <= 23) {
      multiplier *= XP_MULTIPLIERS.EVENING_BONUS;
    }

    // First activity of day bonus
    const today = now.toISOString().split('T')[0];
    if (userXP.lastActivityDate !== today && userXP.todayActions === 0) {
      multiplier *= XP_MULTIPLIERS.FIRST_ACTIVITY_TODAY;
    }

    // Random bonus chance
    if (Math.random() < RANDOM_BONUSES.LUCKY_MOMENT.chance) {
      const bonus = Math.floor(
        Math.random() * (RANDOM_BONUSES.LUCKY_MOMENT.xpRange[1] - RANDOM_BONUSES.LUCKY_MOMENT.xpRange[0])
      ) + RANDOM_BONUSES.LUCKY_MOMENT.xpRange[0];
      args.amount += bonus;
    }

    // Calculate final XP
    const finalXP = Math.floor(args.amount * multiplier);

    // Update totals
    const newTotalXP = userXP.totalXP + finalXP;
    const { level: newLevel, currentLevelXP: newCurrentLevelXP } = getLevelFromXP(newTotalXP);
    const leveledUp = newLevel > userXP.level;

    // Update user XP record
    await ctx.db.patch(userXP._id, {
      totalXP: newTotalXP,
      currentLevelXP: newCurrentLevelXP,
      level: newLevel,
      totalActions: userXP.totalActions + 1,
      todayActions: userXP.lastActivityDate === today ? userXP.todayActions + 1 : 1,
      lastActivityDate: today,
      lastXPGainedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create XP transaction record
    await ctx.db.insert("xpTransactions", {
      userId: userId,
      amount: finalXP,
      source: args.source,
      reason: args.description || `Earned ${finalXP} XP from ${args.source}`,
      createdAt: Date.now(),
      metadata: args.metadata,
    });

    // Check for level up rewards
    if (leveledUp) {
      const rewards = getLevelUpRewards(newLevel);
      
      // Note: Rewards will be claimed via separate mutations
      // Store rewards for user to claim
    }

    // Note: Achievements will be checked via separate mutation call
    // await checkAchievements(ctx, { userId: args.userId });

    return {
      xpGained: finalXP,
      multiplier,
      newTotalXP,
      newLevel,
      leveledUp,
      currentLevelXP: newCurrentLevelXP,
      xpForNextLevel: getXPForLevel(newLevel + 1),
    };
  },
});

// ============================================
// STREAKS
// ============================================

/**
 * Update user streak (called on daily check-in)
 */
export const updateStreak = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId as Id<"users">;
    const userXP = await ctx.db
      .query("userXP")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userXP) throw new Error("User XP not found");

    const today = new Date().toISOString().split('T')[0];
    const lastDate = new Date(userXP.lastStreakCheckDate);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    let newDailyStreak = userXP.dailyStreak;
    
    if (daysDiff === 0) {
      // Already checked in today
      return { streakMaintained: true, newStreak: newDailyStreak };
    } else if (daysDiff === 1) {
      // Consecutive day
      newDailyStreak += 1;
    } else {
      // Streak broken - check for freeze
      const freezeBoost = await ctx.db
        .query("xpBoosts")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .filter((q) =>
          q.and(
            q.eq(q.field("boostType"), "streak_freeze"),
            q.eq(q.field("isActive"), false)
          )
        )
        .first();

      if (freezeBoost) {
        // Use streak freeze
        await ctx.db.patch(freezeBoost._id, { usedAt: Date.now() });
        // Streak maintained
      } else {
        // Streak broken
        newDailyStreak = 1;
      }
    }

    // Update longest streak
    const longestStreak = Math.max(userXP.longestDailyStreak, newDailyStreak);

    // Update user XP
    await ctx.db.patch(userXP._id, {
      dailyStreak: newDailyStreak,
      longestDailyStreak: longestStreak,
      lastStreakCheckDate: today,
      totalCheckIns: userXP.totalCheckIns + 1,
      updatedAt: Date.now(),
    });

    // Award streak bonuses
    if (STREAK_BONUSES.DAILY[newDailyStreak as keyof typeof STREAK_BONUSES.DAILY]) {
      const bonusXP = STREAK_BONUSES.DAILY[newDailyStreak as keyof typeof STREAK_BONUSES.DAILY];
      
      // Create XP transaction for streak bonus
      const newTotalXP = userXP.totalXP + bonusXP;
      const { level: newLevel, currentLevelXP: newCurrentLevelXP } = getLevelFromXP(newTotalXP);
      
      await ctx.db.patch(userXP._id, {
        totalXP: newTotalXP,
        currentLevelXP: newCurrentLevelXP,
        level: newLevel,
      });
      
      await ctx.db.insert("xpTransactions", {
        userId: userId,
        amount: bonusXP,
        source: "streak_bonus",
        reason: `${newDailyStreak}-day streak bonus!`,
        createdAt: Date.now(),
      });
    }

    return {
      streakMaintained: true,
      newStreak: newDailyStreak,
      longestStreak,
    };
  },
});

// ============================================
// ACHIEVEMENTS
// ============================================

/**
 * Check and unlock achievements for a user
 */
export const checkAchievements = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId as Id<"users">;
    const userXP = await ctx.db
      .query("userXP")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userXP) return { unlockedAchievements: [] };

    // Get already unlocked achievements
    const unlockedIds = await ctx.db
      .query("achievements")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect()
      .then((achievements) => achievements.map((a) => a.achievementId));

    const newlyUnlocked: string[] = [];

    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.includes(achievement.id)) continue;

      let shouldUnlock = false;

      // Check requirement
      switch (achievement.requirement.type) {
        case "breathing_sessions":
          shouldUnlock = userXP.totalBreathingSessions >= achievement.requirement.value;
          break;
        case "chat_messages":
          shouldUnlock = userXP.totalChatMessages >= achievement.requirement.value;
          break;
        case "peer_chats":
          shouldUnlock = userXP.totalPeerChats >= achievement.requirement.value;
          break;
        case "positive_responses":
          shouldUnlock = userXP.positiveAIResponses >= achievement.requirement.value;
          break;
        case "daily_streak":
          shouldUnlock = userXP.dailyStreak >= achievement.requirement.value;
          break;
        case "level":
          shouldUnlock = userXP.level >= achievement.requirement.value;
          break;
        case "articles_read":
          shouldUnlock = userXP.totalArticlesRead >= achievement.requirement.value;
          break;
      }

      if (shouldUnlock) {
        // Unlock achievement
        await ctx.db.insert("achievements", {
          userId,
          achievementId: achievement.id,
          category: achievement.category,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          unlockedAt: Date.now(),
          claimed: false,
        });

        // Award XP directly
        const userXP = await ctx.db
          .query("userXP")
          .withIndex("by_user_id", (q) => q.eq("userId", userId))
          .first();
          
        if (userXP) {
          const newTotalXP = userXP.totalXP + achievement.xpReward;
          const { level: newLevel, currentLevelXP: newCurrentLevelXP } = getLevelFromXP(newTotalXP);
          
          await ctx.db.patch(userXP._id, {
            totalXP: newTotalXP,
            currentLevelXP: newCurrentLevelXP,
            level: newLevel,
          });
          
          await ctx.db.insert("xpTransactions", {
            userId,
            amount: achievement.xpReward,
            source: "achievement",
            reason: `Achievement unlocked: ${achievement.title}`,
            createdAt: Date.now(),
            metadata: { achievementId: achievement.id },
          });
        }

        newlyUnlocked.push(achievement.id);
      }
    }

    return { unlockedAchievements: newlyUnlocked };
  },
});

// ============================================
// QUERIES
// ============================================

/**
 * Get user XP data
 */
export const getUserXP = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId as Id<"users">;
    const userXP = await ctx.db
      .query("userXP")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userXP) return null;

    const xpForNextLevel = getXPForLevel(userXP.level + 1);
    const progressPercent = (userXP.currentLevelXP / xpForNextLevel) * 100;

    return {
      ...userXP,
      xpForNextLevel,
      progressPercent,
    };
  },
});

/**
 * Get user achievements
 */
export const getUserAchievements = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId as Id<"users">;
    return await ctx.db
      .query("achievements")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
  },
});

/**
 * Get recent XP transactions
 */
export const getXPTransactions = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = args.userId as Id<"users">;
    const limit = args.limit || 20;
    return await ctx.db
      .query("xpTransactions")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

/**
 * Get leaderboard
 */
export const getLeaderboard = query({
  args: {
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("all_time")
    ),
    metric: v.union(
      v.literal("total_xp"),
      v.literal("streak"),
      v.literal("achievements")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db
      .query("leaderboardEntries")
      .withIndex("by_period_and_metric", (q) =>
        q.eq("period", args.period).eq("metric", args.metric)
      )
      .order("desc")
      .take(limit);
  },
});

/**
 * Get daily challenges
 */
export const getDailyChallenges = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId as Id<"users">;
    const now = Date.now();
    return await ctx.db
      .query("dailyChallenges")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .collect();
  },
});

/**
 * Get active XP boosts
 */
export const getActiveBoosts = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId as Id<"users">;
    const now = Date.now();
    return await ctx.db
      .query("xpBoosts")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .collect();
  },
});
