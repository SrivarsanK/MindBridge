import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Record a daily check-in
export const recordDailyCheckin = mutation({
  args: {
    mood: v.union(v.literal("neutral"), v.literal("anxious"), v.literal("low"), v.literal("lonely")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Check if user already checked in today
    const existingCheckin = await ctx.db
      .query("dailyCheckins")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("checkinDate", today)
      )
      .first();

    if (existingCheckin) {
      // Update existing check-in
      await ctx.db.patch(existingCheckin._id, {
        mood: args.mood,
        timestamp: Date.now(),
        notes: args.notes,
      });
      return existingCheckin._id;
    }

    // Create new check-in
    const checkinId = await ctx.db.insert("dailyCheckins", {
      userId,
      mood: args.mood,
      checkinDate: today,
      timestamp: Date.now(),
      notes: args.notes,
    });

    // Generate insights after check-in
    await generateInsightsHelper(ctx, userId);

    return checkinId;
  },
});

// Get current streak
export const getStreak = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { currentStreak: 0, longestStreak: 0, hasCheckedInToday: false };
    }

    // Get all check-ins ordered by date
    const checkins = await ctx.db
      .query("dailyCheckins")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    if (checkins.length === 0) {
      return { currentStreak: 0, longestStreak: 0, hasCheckedInToday: false };
    }

    // Sort by date descending
    const sortedCheckins = checkins.sort((a, b) => 
      new Date(b.checkinDate).getTime() - new Date(a.checkinDate).getTime()
    );

    const today = new Date().toISOString().split('T')[0];
    const hasCheckedInToday = sortedCheckins[0].checkinDate === today;

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();
    
    // If not checked in today, start from yesterday
    if (!hasCheckedInToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < sortedCheckins.length; i++) {
      const checkinDate = sortedCheckins[i].checkinDate;
      const expectedDate = checkDate.toISOString().split('T')[0];
      
      if (checkinDate === expectedDate) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 0; i < sortedCheckins.length - 1; i++) {
      const currentDate = new Date(sortedCheckins[i].checkinDate);
      const nextDate = new Date(sortedCheckins[i + 1].checkinDate);
      const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { 
      currentStreak, 
      longestStreak,
      hasCheckedInToday,
      totalCheckins: checkins.length,
    };
  },
});

// Get mood history for the past 30 days
export const getMoodHistory = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const daysToFetch = args.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);
    
    const checkins = await ctx.db
      .query("dailyCheckins")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("timestamp"), startDate.getTime()))
      .collect();

    return checkins
      .sort((a, b) => new Date(a.checkinDate).getTime() - new Date(b.checkinDate).getTime())
      .map(c => ({
        date: c.checkinDate,
        mood: c.mood,
        timestamp: c.timestamp,
      }));
  },
});

// Generate insights based on mood patterns (internal helper)
async function generateInsightsHelper(
  ctx: any,
  userId: any
) {
  // Get recent check-ins (last 7 days)
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  const recentCheckins = await ctx.db
    .query("dailyCheckins")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.gte(q.field("timestamp"), sevenDaysAgo))
    .collect();

  if (recentCheckins.length === 0) return;

  // Count mood occurrences
  const moodCounts = {
    neutral: 0,
    anxious: 0,
    low: 0,
    lonely: 0,
  };

  recentCheckins.forEach((checkin: any) => {
    moodCounts[checkin.mood as keyof typeof moodCounts]++;
  });

  const dominantMood = Object.entries(moodCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0][0];

  // Generate mood pattern insight
  const moodMessages = {
    neutral: "You've been maintaining a calm state this week. Keep up the balanced mindset! 😌",
    anxious: "You've been feeling anxious lately. Consider trying some breathing exercises or talking to someone. 💙",
    low: "It seems you've been feeling low recently. Remember, it's okay to reach out for support. 🌟",
    lonely: "You've been feeling lonely this week. Consider connecting with peers or joining group activities. 🤝",
  };

  // Check if this insight already exists
  const existingInsight = await ctx.db
    .query("userInsights")
    .withIndex("by_user_and_type", (q: any) => 
      q.eq("userId", userId).eq("insightType", "mood_pattern")
    )
    .filter((q: any) => q.gt(q.field("generatedAt"), sevenDaysAgo))
    .first();

  if (!existingInsight) {
    await ctx.db.insert("userInsights", {
      userId: userId,
      insightType: "mood_pattern",
      title: "Weekly Mood Pattern",
      description: moodMessages[dominantMood as keyof typeof moodMessages],
      metadata: JSON.stringify({ 
        moodCounts, 
        dominantMood,
        checkinCount: recentCheckins.length,
      }),
      generatedAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // Expires in 7 days
      dismissed: false,
    });
  }
}

// Generate insights based on mood patterns
export const generateInsights = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await generateInsightsHelper(ctx, args.userId);
  },
});

// Get user insights
export const getUserInsights = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const insights = await ctx.db
      .query("userInsights")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("dismissed"), false))
      .collect();

    // Filter out expired insights
    const now = Date.now();
    return insights
      .filter(i => !i.expiresAt || i.expiresAt > now)
      .sort((a, b) => b.generatedAt - a.generatedAt)
      .slice(0, 10); // Return up to 10 most recent insights
  },
});

// Get total insights count
export const getInsightsCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const insights = await ctx.db
      .query("userInsights")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    return insights.length;
  },
});

// Dismiss an insight
export const dismissInsight = mutation({
  args: {
    insightId: v.id("userInsights"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const insight = await ctx.db.get(args.insightId);
    if (!insight || insight.userId !== userId) {
      throw new Error("Insight not found or unauthorized");
    }

    await ctx.db.patch(args.insightId, { dismissed: true });
  },
});
