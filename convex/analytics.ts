import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Record a daily check-in
export const recordDailyCheckin = mutation({
  args: {
    mood: v.union(v.literal("neutral"), v.literal("anxious"), v.literal("low"), v.literal("lonely")),
    notes: v.optional(v.string()),
    timezone: v.optional(v.string()), // User's timezone
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    console.log('[recordDailyCheckin] User:', userId, 'Mood:', args.mood);

    // Get user's timezone from profile or use provided timezone
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    const timezone = args.timezone || userProfile?.timezone || "UTC";
    console.log('[recordDailyCheckin] Timezone:', timezone);
    
    // Get today's date in user's timezone
    const today = getTodayInTimezone(timezone);
    console.log('[recordDailyCheckin] Today date:', today);
    
    // Check if user already checked in today
    const existingCheckin = await ctx.db
      .query("dailyCheckins")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("checkinDate", today)
      )
      .first();

    console.log('[recordDailyCheckin] Existing check-in:', existingCheckin ? 'Found' : 'Not found');

    if (existingCheckin) {
      // Update existing check-in
      await ctx.db.patch(existingCheckin._id, {
        mood: args.mood,
        timestamp: Date.now(),
        notes: args.notes,
      });
      console.log('[recordDailyCheckin] Updated existing check-in:', existingCheckin._id);
      return { checkinId: existingCheckin._id, isNewCheckin: false };
    }

    // Create new check-in
    const checkinId = await ctx.db.insert("dailyCheckins", {
      userId,
      mood: args.mood,
      checkinDate: today,
      timestamp: Date.now(),
      notes: args.notes,
    });

    console.log('[recordDailyCheckin] Created new check-in:', checkinId);

    // Generate insights after check-in
    await generateInsightsHelper(ctx, userId);

    // Check for streak milestones
    await checkStreakMilestones(ctx, userId);

    return { checkinId, isNewCheckin: true };
  },
});

// Helper function to get today's date in a specific timezone
function getTodayInTimezone(timezone: string): string {
  try {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-CA', { 
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }); // en-CA format is YYYY-MM-DD
    return dateString;
  } catch {
    // Fallback to UTC if timezone is invalid
    return new Date().toISOString().split('T')[0];
  }
}

// Helper function to check and create streak milestone insights
async function checkStreakMilestones(ctx: any, userId: any) {
  const checkins = await ctx.db
    .query("dailyCheckins")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .collect();

  if (checkins.length === 0) return;

  // Calculate current streak
  const sortedCheckins = checkins.sort((a: any, b: any) => 
    new Date(b.checkinDate).getTime() - new Date(a.checkinDate).getTime()
  );

  let currentStreak = 0;
  let checkDate = new Date();
  
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

  // Milestone thresholds
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
  
  if (milestones.includes(currentStreak)) {
    // Check if milestone insight already exists
    const existingMilestone = await ctx.db
      .query("userInsights")
      .withIndex("by_user_and_type", (q: any) => 
        q.eq("userId", userId).eq("insightType", "progress_milestone")
      )
      .filter((q: any) => {
        const metadata = JSON.parse(q.field("metadata") || "{}");
        return metadata.streakValue === currentStreak;
      })
      .first();

    if (!existingMilestone) {
      const milestoneMessages: Record<number, { title: string; description: string; emoji: string }> = {
        3: {
          title: "🔥 3-Day Streak!",
          description: "You're building a habit! Three days in a row shows commitment. Keep it up!",
          emoji: "🔥"
        },
        7: {
          title: "⭐ One Week Streak!",
          description: "Amazing! You've maintained your check-in habit for a full week. You're doing great!",
          emoji: "⭐"
        },
        14: {
          title: "💫 Two Week Champion!",
          description: "Two weeks of consistent check-ins! Your dedication is truly inspiring.",
          emoji: "💫"
        },
        30: {
          title: "🏆 30-Day Milestone!",
          description: "Incredible! A full month of daily check-ins. You've built a powerful self-care routine!",
          emoji: "🏆"
        },
        60: {
          title: "🌟 60-Day Legend!",
          description: "Two months of unwavering commitment! Your mental health journey is remarkable.",
          emoji: "🌟"
        },
        90: {
          title: "👑 90-Day Champion!",
          description: "Three months strong! You're a true champion of self-care and consistency.",
          emoji: "👑"
        },
        180: {
          title: "💎 Half-Year Hero!",
          description: "Six months of dedication! Your commitment to mental wellness is extraordinary.",
          emoji: "💎"
        },
        365: {
          title: "🎉 ONE YEAR STREAK!",
          description: "A full year! You're a mental health warrior. This is a truly remarkable achievement!",
          emoji: "🎉"
        }
      };

      const milestone = milestoneMessages[currentStreak];
      if (milestone) {
        await ctx.db.insert("userInsights", {
          userId: userId,
          insightType: "progress_milestone",
          title: milestone.title,
          description: milestone.description,
          metadata: JSON.stringify({ 
            streakValue: currentStreak,
            achievedAt: Date.now(),
            emoji: milestone.emoji
          }),
          generatedAt: Date.now(),
          dismissed: false,
        });
      }
    }
  }
}

// Get current streak
export const getStreak = query({
  args: {
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { currentStreak: 0, longestStreak: 0, hasCheckedInToday: false, totalCheckins: 0 };
    }

    // Get user's timezone
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    const timezone = args.timezone || userProfile?.timezone || "UTC";
    const today = getTodayInTimezone(timezone);

    console.log('[getStreak] User:', userId, 'Timezone:', timezone, 'Today:', today);

    // Get all check-ins ordered by date
    const checkins = await ctx.db
      .query("dailyCheckins")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    console.log('[getStreak] Total check-ins found:', checkins.length);

    if (checkins.length === 0) {
      return { currentStreak: 0, longestStreak: 0, hasCheckedInToday: false, totalCheckins: 0 };
    }

    // Sort by date descending
    const sortedCheckins = checkins.sort((a, b) => 
      new Date(b.checkinDate).getTime() - new Date(a.checkinDate).getTime()
    );

    console.log('[getStreak] Most recent check-in date:', sortedCheckins[0].checkinDate);
    console.log('[getStreak] All check-in dates:', sortedCheckins.map(c => c.checkinDate).join(', '));

    const hasCheckedInToday = sortedCheckins[0].checkinDate === today;
    console.log('[getStreak] Has checked in today?', hasCheckedInToday);

    // Calculate current streak
    let currentStreak = 0;
    const todayDate = new Date(today);
    
    // Start from today if checked in, otherwise yesterday
    let checkDate = new Date(todayDate);
    if (!hasCheckedInToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    console.log('[getStreak] Starting streak calculation from date:', formatDateYYYYMMDD(checkDate));

    // Count consecutive days
    for (let i = 0; i < sortedCheckins.length; i++) {
      const checkinDate = sortedCheckins[i].checkinDate;
      const expectedDate = formatDateYYYYMMDD(checkDate);
      
      console.log('[getStreak] Comparing:', checkinDate, '===', expectedDate);
      
      if (checkinDate === expectedDate) {
        currentStreak++;
        console.log('[getStreak] Match! Current streak:', currentStreak);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Check if we skipped a day
        const checkinDateObj = new Date(checkinDate);
        const daysDiff = Math.floor((checkDate.getTime() - checkinDateObj.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log('[getStreak] No match. Days difference:', daysDiff);
        
        if (daysDiff > 0) {
          // There's a gap, streak is broken
          console.log('[getStreak] Gap detected. Breaking streak.');
          break;
        }
      }
    }

    console.log('[getStreak] Final current streak:', currentStreak);

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

    console.log('[getStreak] Final longest streak:', longestStreak);

    // Get check-in dates for the last 30 days for calendar view
    const thirtyDaysAgo = new Date(todayDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCheckinDates = sortedCheckins
      .filter(c => new Date(c.checkinDate) >= thirtyDaysAgo)
      .map(c => c.checkinDate);

    return { 
      currentStreak, 
      longestStreak,
      hasCheckedInToday,
      totalCheckins: checkins.length,
      recentCheckinDates,
      todayDate: today,
    };
  },
});

// Helper function to format date as YYYY-MM-DD
function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
