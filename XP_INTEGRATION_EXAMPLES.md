# XP System Integration Examples

## Quick Integration Guide

This document shows you exactly how to integrate the XP system into different parts of your app.

---

## 1. Breathing Exercise Completion

### Location: `app/breathing/page.tsx`

Add XP when user completes a breathing exercise:

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function BreathingPage() {
  const addXP = useMutation(api.xp.addXP);
  
  const handleExerciseComplete = async (duration: number) => {
    // Award XP based on duration
    const xpAmount = Math.floor(duration / 60) * 5; // 5 XP per minute
    
    try {
      const result = await addXP({
        amount: xpAmount,
        activityType: "breathing_exercise",
        metadata: {
          duration,
          exerciseType: selectedExercise,
        },
      });
      
      // Show XP notification
      showXPNotification(result.xpGained, result.leveledUp);
    } catch (error) {
      console.error("Failed to award XP:", error);
    }
  };
  
  return (
    // Your breathing exercise UI
  );
}
```

---

## 2. AI Chat Positive Response

### Location: `app/ai-chat/page.tsx` or wherever AI chat is implemented

Award XP when AI gives positive/encouraging responses:

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AIChatPage() {
  const addXP = useMutation(api.xp.addXP);
  
  const handleAIResponse = async (response: string, sentiment: string) => {
    // Check if response is positive
    if (sentiment === "positive" || sentiment === "encouraging") {
      try {
        await addXP({
          amount: 15, // 15 XP for positive AI interaction
          activityType: "ai_positive_response",
          metadata: {
            sentiment,
            responseLength: response.length,
          },
        });
      } catch (error) {
        console.error("Failed to award XP:", error);
      }
    }
  };
  
  const sendMessage = async (message: string) => {
    // Send message to AI
    const aiResponse = await getAIResponse(message);
    
    // Analyze sentiment (you might use Gemini API for this)
    const sentiment = analyzeSentiment(aiResponse);
    
    // Award XP if positive
    await handleAIResponse(aiResponse, sentiment);
    
    return aiResponse;
  };
  
  return (
    // Your AI chat UI
  );
}
```

### Sentiment Analysis Helper:

```typescript
// utils/sentimentAnalysis.ts
export function analyzeSentiment(text: string): string {
  const positiveKeywords = [
    "great", "excellent", "proud", "achievement", "success",
    "well done", "amazing", "fantastic", "wonderful", "progress",
    "improvement", "strong", "resilient", "brave", "courage"
  ];
  
  const lowercaseText = text.toLowerCase();
  const positiveCount = positiveKeywords.filter(keyword => 
    lowercaseText.includes(keyword)
  ).length;
  
  if (positiveCount >= 2) return "positive";
  if (positiveCount >= 1) return "encouraging";
  return "neutral";
}
```

---

## 3. Anonymous Chat Participation

### Location: `app/anonymous-chat/page.tsx`

Award XP for sending messages and receiving replies:

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AnonymousChatPage() {
  const addXP = useMutation(api.xp.addXP);
  
  const sendChatMessage = async (message: string) => {
    // Send the message
    await sendMessage(message);
    
    // Award XP for participation
    try {
      await addXP({
        amount: 5, // 5 XP per message sent
        activityType: "anonymous_chat_message",
        metadata: {
          messageLength: message.length,
        },
      });
    } catch (error) {
      console.error("Failed to award XP:", error);
    }
  };
  
  const handleMessageReceived = async (senderId: string) => {
    // Award XP for receiving replies (engagement bonus)
    try {
      await addXP({
        amount: 3, // 3 XP for receiving a reply
        activityType: "anonymous_chat_reply_received",
        metadata: {
          senderId,
        },
      });
    } catch (error) {
      console.error("Failed to award XP:", error);
    }
  };
  
  return (
    // Your anonymous chat UI
  );
}
```

---

## 4. Daily Check-In

### Location: `app/dashboard/page.tsx` or check-in component

Award XP for daily mood check-ins:

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DashboardPage() {
  const addXP = useMutation(api.xp.addXP);
  const recordCheckIn = useMutation(api.checkIns.create);
  
  const handleCheckIn = async (mood: string, notes: string) => {
    // Record the check-in
    await recordCheckIn({ mood, notes });
    
    // Award XP for checking in
    try {
      const result = await addXP({
        amount: 20, // 20 XP for daily check-in
        activityType: "daily_checkin",
        metadata: {
          mood,
          hasNotes: notes.length > 0,
        },
      });
      
      // Extra XP if they wrote notes
      if (notes.length > 50) {
        await addXP({
          amount: 10, // Bonus 10 XP for detailed notes
          activityType: "detailed_checkin",
          metadata: {
            notesLength: notes.length,
          },
        });
      }
      
      showXPNotification(result.xpGained, result.leveledUp);
    } catch (error) {
      console.error("Failed to award XP:", error);
    }
  };
  
  return (
    // Your dashboard UI
  );
}
```

---

## 5. Displaying XP in Navigation

### Location: `components/navigation-sidebar.tsx`

Show user's current level and XP in the sidebar:

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { XPBar } from "@/components/xp/xp-bar";
import { Badge } from "@/components/ui/badge";

export function NavigationSidebar() {
  const xpData = useQuery(api.xp.getUserXP);
  
  return (
    <aside className="sidebar">
      {/* User Profile Section */}
      <div className="user-section">
        <Avatar />
        <div className="user-info">
          <h3>Welcome back!</h3>
          
          {/* Level Display */}
          {xpData && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                Level {xpData.level}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {xpData.totalXP.toLocaleString()} XP
              </span>
            </div>
          )}
          
          {/* XP Progress Bar */}
          {xpData && (
            <XPBar
              currentXP={xpData.currentLevelXP}
              requiredXP={xpData.xpToNextLevel}
              level={xpData.level}
              className="mt-3"
            />
          )}
        </div>
      </div>
      
      {/* Navigation Links */}
      {/* ... rest of sidebar ... */}
    </aside>
  );
}
```

---

## 6. Article Reading Completion

### Location: `app/resources/[articleId]/page.tsx`

Award XP when users finish reading articles:

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

export default function ArticlePage() {
  const addXP = useMutation(api.xp.addXP);
  const [hasAwarded, setHasAwarded] = useState(false);
  
  // Track scroll position to detect when article is read
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = 
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      // Award XP when user scrolls to 80% of article
      if (scrollPercentage >= 80 && !hasAwarded) {
        awardReadingXP();
        setHasAwarded(true);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasAwarded]);
  
  const awardReadingXP = async () => {
    try {
      await addXP({
        amount: 10, // 10 XP for reading an article
        activityType: "article_read",
        metadata: {
          articleId: article.id,
          articleTitle: article.title,
        },
      });
    } catch (error) {
      console.error("Failed to award XP:", error);
    }
  };
  
  return (
    // Your article content
  );
}
```

---

## 7. Streak Maintenance

### Location: Background job or daily check

Award bonus XP for maintaining streaks:

```typescript
// convex/xp.ts - Add this function

export const checkStreakBonus = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    
    // Get user's streak data
    const streakData = await ctx.db
      .query("streaks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!streakData) return;
    
    const { currentStreak } = streakData;
    
    // Award bonus XP for milestone streaks
    if (currentStreak === 7) {
      await ctx.runMutation(internal.xp.addXPInternal, {
        userId,
        amount: 50,
        activityType: "streak_week",
      });
    } else if (currentStreak === 30) {
      await ctx.runMutation(internal.xp.addXPInternal, {
        userId,
        amount: 200,
        activityType: "streak_month",
      });
    } else if (currentStreak === 100) {
      await ctx.runMutation(internal.xp.addXPInternal, {
        userId,
        amount: 1000,
        activityType: "streak_century",
      });
    }
  },
});
```

---

## 8. Achievement Unlocks

### Location: `app/profile/page.tsx` or achievements page

Display unlocked achievements:

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AchievementCard } from "@/components/xp/achievement-card";

export default function ProfilePage() {
  const achievements = useQuery(api.xp.getUserAchievements);
  
  return (
    <div className="profile-page">
      <h2>Your Achievements</h2>
      
      <div className="achievements-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements?.map((achievement) => (
          <AchievementCard
            key={achievement._id}
            achievement={achievement}
          />
        ))}
      </div>
      
      {/* Show locked achievements too */}
      <h3 className="mt-8">Locked Achievements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Show grayed-out locked achievements */}
      </div>
    </div>
  );
}
```

---

## 9. XP Notification Component

### Create: `components/xp/xp-notification.tsx`

Show animated XP gain notifications:

```typescript
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";

interface XPNotificationProps {
  xpGained: number;
  leveledUp?: boolean;
  newLevel?: number;
}

export function XPNotification({ xpGained, leveledUp, newLevel }: XPNotificationProps) {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          className="fixed top-20 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <div>
              <p className="font-bold">+{xpGained} XP</p>
              {leveledUp && (
                <p className="text-sm flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Level {newLevel}!
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to show XP notifications
export function useXPNotification() {
  const [notification, setNotification] = useState<XPNotificationProps | null>(null);
  
  const showNotification = (xpGained: number, leveledUp?: boolean, newLevel?: number) => {
    setNotification({ xpGained, leveledUp, newLevel });
    setTimeout(() => setNotification(null), 3500);
  };
  
  return { notification, showNotification };
}
```

---

## 10. Daily Challenges

### Create: `app/challenges/page.tsx`

Show daily/weekly challenges for bonus XP:

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";

export default function ChallengesPage() {
  const challenges = useQuery(api.challenges.getDailyChallenges);
  const completeChallenge = useMutation(api.challenges.complete);
  
  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      await completeChallenge({ challengeId });
      // XP will be automatically awarded by the mutation
    } catch (error) {
      console.error("Failed to complete challenge:", error);
    }
  };
  
  return (
    <div className="challenges-page p-6">
      <h1 className="text-3xl font-bold mb-6">Daily Challenges</h1>
      
      <div className="grid gap-4">
        {challenges?.map((challenge) => (
          <Card key={challenge._id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {challenge.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                  <h3 className="text-xl font-semibold">{challenge.title}</h3>
                </div>
                
                <p className="text-muted-foreground mb-3">
                  {challenge.description}
                </p>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-purple-500">
                    +{challenge.xpReward} XP
                  </span>
                  
                  {challenge.progress !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      Progress: {challenge.progress}/{challenge.target}
                    </span>
                  )}
                </div>
              </div>
              
              {!challenge.completed && challenge.canComplete && (
                <Button
                  onClick={() => handleCompleteChallenge(challenge._id)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Complete
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 11. Global XP Context Provider

### Create: `contexts/xp-context.tsx`

Centralized XP state management:

```typescript
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useXPNotification } from "@/components/xp/xp-notification";

interface XPContextType {
  xpData: any;
  showNotification: (xpGained: number, leveledUp?: boolean, newLevel?: number) => void;
  isLoading: boolean;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export function XPProvider({ children }: { children: ReactNode }) {
  const xpData = useQuery(api.xp.getUserXP);
  const { notification, showNotification } = useXPNotification();
  
  return (
    <XPContext.Provider 
      value={{ 
        xpData, 
        showNotification,
        isLoading: xpData === undefined 
      }}
    >
      {children}
      {notification && (
        <XPNotification {...notification} />
      )}
    </XPContext.Provider>
  );
}

export function useXP() {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error("useXP must be used within XPProvider");
  }
  return context;
}
```

### Usage in `app/layout.tsx`:

```typescript
import { XPProvider } from "@/contexts/xp-context";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConvexProvider>
          <XPProvider>
            {children}
          </XPProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
```

---

## 12. Leaderboard (Optional)

### Create: `app/leaderboard/page.tsx`

Anonymous leaderboard for competitive motivation:

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";

export default function LeaderboardPage() {
  const leaderboard = useQuery(api.xp.getLeaderboard, { limit: 100 });
  const myRank = useQuery(api.xp.getMyRank);
  
  return (
    <div className="leaderboard-page p-6">
      <h1 className="text-3xl font-bold mb-6">Recovery Champions</h1>
      
      {/* Your Rank Card */}
      {myRank && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <h2 className="text-xl font-semibold mb-2">Your Rank</h2>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">#{myRank.rank}</span>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Level {myRank.level}</p>
              <p className="text-lg font-semibold">{myRank.totalXP.toLocaleString()} XP</p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Top Rankings */}
      <div className="space-y-3">
        {leaderboard?.map((user, index) => (
          <Card key={user._id} className="p-4">
            <div className="flex items-center gap-4">
              {/* Rank Badge */}
              <div className="flex items-center justify-center w-12 h-12">
                {index === 0 && <Trophy className="h-8 w-8 text-yellow-500" />}
                {index === 1 && <Medal className="h-8 w-8 text-gray-400" />}
                {index === 2 && <Medal className="h-8 w-8 text-amber-600" />}
                {index > 2 && (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                )}
              </div>
              
              {/* User Info (Anonymous) */}
              <div className="flex-1">
                <p className="font-semibold">
                  {user.anonymous ? `Champion #${user._id.slice(-6)}` : user.displayName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Level {user.level}
                </p>
              </div>
              
              {/* XP Display */}
              <div className="text-right">
                <p className="text-lg font-bold">{user.totalXP.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## Quick Reference: XP Amounts

| Activity | Base XP | Bonus Conditions |
|----------|---------|------------------|
| Daily Check-in | 20 XP | +10 XP for detailed notes |
| Breathing Exercise | 5 XP/min | +20 XP for completing 10+ min |
| AI Positive Response | 15 XP | +5 XP for deep conversation |
| Anonymous Chat Message | 5 XP | +3 XP per reply received |
| Article Read | 10 XP | +5 XP if shared |
| Journal Entry | 15 XP | +10 XP for 100+ words |
| 7-Day Streak | 50 XP | Streak milestone |
| 30-Day Streak | 200 XP | Streak milestone |
| Achievement Unlock | Varies | 25-500 XP per achievement |

---

## Best Practices

1. **Always catch errors** when awarding XP
2. **Show immediate feedback** with notifications
3. **Track metadata** for analytics
4. **Use meaningful activity types** for filtering
5. **Don't spam XP** - quality over quantity
6. **Test XP calculations** thoroughly
7. **Balance XP amounts** - not too easy, not too hard
8. **Celebrate milestones** with special effects
9. **Make progression visible** everywhere
10. **Keep it fun** - this is about recovery, not grinding

---

## Testing Checklist

- [ ] XP awarded correctly for each activity type
- [ ] Level progression works (1→2→3...)
- [ ] XP bar displays accurately
- [ ] Notifications appear and disappear
- [ ] Achievements unlock at correct thresholds
- [ ] Leaderboard updates in real-time
- [ ] No duplicate XP awards for same activity
- [ ] Error handling works properly
- [ ] UI is responsive on mobile
- [ ] Performance is smooth with many XP transactions

---

## Ready to Launch! 🚀

Your XP system is now ready to motivate users and keep them engaged in their recovery journey!
