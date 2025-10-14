# XP System - Quick Start Guide

## 🚀 Quick Implementation (5 Steps)

### Step 1: Initialize User XP (On Sign Up)

```tsx
// app/onboarding/step-3/page.tsx or wherever user completes onboarding

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OnboardingComplete() {
  const initializeXP = useMutation(api.xp.initializeUserXP);

  const handleComplete = async () => {
    // Initialize XP system for new user
    await initializeXP({ userId: user._id });
    
    // Award onboarding completion bonus
    await awardXP({
      userId: user._id,
      source: "profile_complete",
      amount: 150,
      description: "Completed onboarding!",
    });
  };
}
```

### Step 2: Add XP Bar to Dashboard

```tsx
// app/dashboard/page.tsx

import { XPBar } from "@/components/xp/XPBar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Dashboard() {
  const userXP = useQuery(api.xp.getUserXP, { userId: user._id });

  return (
    <div className="space-y-6">
      {/* XP Bar at top of dashboard */}
      {userXP && (
        <XPBar
          currentXP={userXP.currentLevelXP}
          xpForNextLevel={userXP.xpForNextLevel}
          level={userXP.level}
          totalXP={userXP.totalXP}
          showDetails={true}
          animated={true}
        />
      )}

      {/* Rest of dashboard content */}
    </div>
  );
}
```

### Step 3: Award XP for Activities

```tsx
// app/breathing/page.tsx

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { XP_VALUES } from "@/lib/xp/constants";
import { XPGainPopup } from "@/components/xp/XPBar";

export default function BreathingPage() {
  const [xpGain, setXpGain] = useState<any>(null);
  const awardXP = useMutation(api.xp.awardXP);

  const handleBreathingComplete = async (durationMinutes: number) => {
    // Calculate XP based on duration
    let xpAmount = XP_VALUES.BREATHING_START;
    
    if (durationMinutes >= 15) {
      xpAmount = XP_VALUES.BREATHING_COMPLETE_15MIN;
    } else if (durationMinutes >= 10) {
      xpAmount = XP_VALUES.BREATHING_COMPLETE_10MIN;
    } else if (durationMinutes >= 5) {
      xpAmount = XP_VALUES.BREATHING_COMPLETE_5MIN;
    }

    // Award XP
    const result = await awardXP({
      userId: user._id,
      source: "breathing_exercise",
      amount: xpAmount,
      description: `Completed ${durationMinutes}-minute breathing session`,
    });

    // Show XP gain popup
    setXpGain(result);

    // Check for level up
    if (result.leveledUp) {
      // Show level up modal (implement this)
      showLevelUpModal(result.newLevel);
    }
  };

  return (
    <>
      {/* Breathing exercise UI */}
      
      {/* XP Gain Popup */}
      {xpGain && (
        <XPGainPopup
          amount={xpGain.xpGained}
          source="breathing_exercise"
          multiplier={xpGain.multiplier}
          onComplete={() => setXpGain(null)}
        />
      )}
    </>
  );
}
```

### Step 4: Daily Check-in with Streak

```tsx
// app/dashboard/page.tsx

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { XP_VALUES } from "@/lib/xp/constants";

export default function Dashboard() {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const updateStreak = useMutation(api.xp.updateStreak);
  const awardXP = useMutation(api.xp.awardXP);

  const handleDailyCheckIn = async () => {
    // Update streak
    const streakResult = await updateStreak({ userId: user._id });
    
    // Award check-in XP with streak bonus
    const bonusXP = Math.min(
      streakResult.newStreak * XP_VALUES.DAILY_CHECKIN_STREAK_BONUS,
      200
    );
    
    await awardXP({
      userId: user._id,
      source: "daily_checkin",
      amount: XP_VALUES.DAILY_CHECKIN + bonusXP,
      description: `Daily check-in (${streakResult.newStreak} day streak!)`,
    });

    setHasCheckedIn(true);
  };

  return (
    <div>
      {!hasCheckedIn && (
        <button onClick={handleDailyCheckIn}>
          Daily Check-in 🔥
        </button>
      )}
    </div>
  );
}
```

### Step 5: Award XP in AI Chat

```tsx
// components/chat/ChatInterface.tsx

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { XP_VALUES } from "@/lib/xp/constants";

export function ChatInterface() {
  const awardXP = useMutation(api.xp.awardXP);

  const handleSendMessage = async (message: string) => {
    // Send message to AI
    const response = await sendToAI(message);

    // Award XP for message
    await awardXP({
      userId: user._id,
      source: "ai_chat_message",
      amount: XP_VALUES.AI_CHAT_MESSAGE,
    });

    // Check for positive sentiment
    if (response.sentiment === "positive") {
      await awardXP({
        userId: user._id,
        source: "ai_chat_positive",
        amount: XP_VALUES.AI_CHAT_POSITIVE_RESPONSE,
        description: "Positive progress detected! 🎉",
      });
    }

    // Check for breakthrough
    if (response.breakthrough) {
      await awardXP({
        userId: user._id,
        source: "ai_chat_positive",
        amount: XP_VALUES.AI_CHAT_BREAKTHROUGH,
        description: "Major breakthrough! 🌟",
      });
    }
  };
}
```

## 🎯 Integration Checklist

### Immediate (Must Have)
- [ ] Initialize XP on user registration
- [ ] Add XP bar to dashboard
- [ ] Award XP for breathing exercises
- [ ] Award XP for AI chat messages
- [ ] Daily check-in with streak

### High Priority (This Week)
- [ ] Award XP for peer chat
- [ ] Award XP for mood logging
- [ ] Display achievements page
- [ ] Show level-up modal
- [ ] Show XP gain popups

### Medium Priority (Next Week)
- [ ] Daily challenges system
- [ ] Achievement unlock notifications
- [ ] Leaderboard page (optional)
- [ ] Profile XP stats

### Nice to Have (Future)
- [ ] XP boost power-ups UI
- [ ] Streak calendar visualization
- [ ] Achievement sharing
- [ ] Custom avatars

## 📝 All XP Award Points

Copy-paste these into your app:

### 1. Breathing Page
```tsx
// After completing exercise
await awardXP({
  userId: user._id,
  source: "breathing_exercise",
  amount: XP_VALUES.BREATHING_COMPLETE_10MIN, // or based on duration
});
```

### 2. AI Chat
```tsx
// After each message
await awardXP({
  userId: user._id,
  source: "ai_chat_message",
  amount: XP_VALUES.AI_CHAT_MESSAGE,
});

// On positive response
await awardXP({
  userId: user._id,
  source: "ai_chat_positive",
  amount: XP_VALUES.AI_CHAT_POSITIVE_RESPONSE,
});
```

### 3. Peer Chat
```tsx
// After each message
await awardXP({
  userId: user._id,
  source: "peer_chat_message",
  amount: XP_VALUES.PEER_CHAT_MESSAGE,
});

// On session start
await awardXP({
  userId: user._id,
  source: "peer_chat_session",
  amount: XP_VALUES.PEER_CHAT_SESSION_START,
});
```

### 4. Dashboard Check-in
```tsx
// Daily check-in
await updateStreak({ userId: user._id });
await awardXP({
  userId: user._id,
  source: "daily_checkin",
  amount: XP_VALUES.DAILY_CHECKIN,
});
```

### 5. Mood Logging
```tsx
// After mood log
await awardXP({
  userId: user._id,
  source: "mood_log",
  amount: XP_VALUES.MOOD_LOG,
});
```

### 6. Dream Journal
```tsx
// After dream entry
await awardXP({
  userId: user._id,
  source: "dream_journal",
  amount: XP_VALUES.DREAM_JOURNAL_ENTRY,
});
```

### 7. Articles
```tsx
// On article open
await awardXP({
  userId: user._id,
  source: "article_read",
  amount: XP_VALUES.ARTICLE_OPENED,
});

// After reading for >2 min
await awardXP({
  userId: user._id,
  source: "article_read",
  amount: XP_VALUES.ARTICLE_READ_COMPLETE,
});
```

### 8. Profile Completion
```tsx
// When profile is complete
await awardXP({
  userId: user._id,
  source: "profile_complete",
  amount: XP_VALUES.PROFILE_COMPLETE,
});

// When bio added
await awardXP({
  userId: user._id,
  source: "profile_complete",
  amount: XP_VALUES.BIO_ADDED,
});
```

## 🎨 UI Components Usage

### Compact XP Bar (Header)
```tsx
<XPBar
  currentXP={userXP.currentLevelXP}
  xpForNextLevel={userXP.xpForNextLevel}
  level={userXP.level}
  totalXP={userXP.totalXP}
  showDetails={false}
  animated={false}
  className="max-w-xs"
/>
```

### Full XP Bar (Dashboard)
```tsx
<XPBar
  currentXP={userXP.currentLevelXP}
  xpForNextLevel={userXP.xpForNextLevel}
  level={userXP.level}
  totalXP={userXP.totalXP}
  showDetails={true}
  animated={true}
/>
```

### XP Popup (After Actions)
```tsx
const [xpGains, setXpGains] = useState<any[]>([]);

// After awarding XP
setXpGains([...xpGains, result]);

// Render
{xpGains.map((gain, i) => (
  <XPGainPopup
    key={i}
    amount={gain.xpGained}
    source={gain.source}
    multiplier={gain.multiplier}
    onComplete={() => {
      setXpGains(xpGains.filter((_, idx) => idx !== i));
    }}
  />
))}
```

### Level Up Modal
```tsx
const [levelUpData, setLevelUpData] = useState<any>(null);

// When leveling up
if (result.leveledUp) {
  setLevelUpData({
    newLevel: result.newLevel,
    rewards: getLevelUpRewards(result.newLevel),
  });
}

// Render
{levelUpData && (
  <LevelUpModal
    newLevel={levelUpData.newLevel}
    rewards={levelUpData.rewards}
    onClose={() => setLevelUpData(null)}
  />
)}
```

### Achievement Grid
```tsx
const achievements = useQuery(api.xp.getUserAchievements, { userId: user._id });

<AchievementGrid
  achievements={achievements || []}
  columns={4}
  size="md"
  showProgress={true}
/>
```

### Active Multipliers
```tsx
const activeBoosts = useQuery(api.xp.getActiveBoosts, { userId: user._id });

{activeBoosts?.map((boost) => (
  <XPMultiplierBadge
    key={boost._id}
    multiplier={boost.multiplier!}
    expiresAt={boost.expiresAt}
  />
))}
```

## ⚡ Pro Tips

### 1. Batch XP Updates
```tsx
// DON'T do this:
await awardXP({ source: "action1", amount: 10 });
await awardXP({ source: "action2", amount: 20 });

// DO this instead:
await awardXP({ source: "action1", amount: 30 }); // Combined
```

### 2. Check for Achievements Periodically
```tsx
// After major milestones
useEffect(() => {
  if (userXP.totalBreathingSessions % 10 === 0) {
    checkAchievements({ userId: user._id });
  }
}, [userXP.totalBreathingSessions]);
```

### 3. Show Multipliers Prominently
```tsx
// Display active multipliers in header
const totalMultiplier = 
  (userXP.dailyStreak >= 7 ? 1.2 : 1.0) *
  (isWeekend ? 1.3 : 1.0) *
  (activeBoost?.multiplier || 1.0);

{totalMultiplier > 1 && (
  <XPMultiplierBadge multiplier={totalMultiplier} />
)}
```

### 4. Celebrate Level Ups
```tsx
// Add confetti, sounds, vibration
if (result.leveledUp) {
  confetti();
  playSound("levelup.mp3");
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
  setLevelUpData(result);
}
```

### 5. Preload User XP
```tsx
// Load XP data early in the app
const Preloader = useQuery(api.xp.getUserXP, { userId: user?._id });
```

## 🐛 Common Issues & Solutions

### Issue: XP not initializing
```tsx
// Solution: Initialize on first render
useEffect(() => {
  const initXP = async () => {
    const userXP = await getUserXP({ userId: user._id });
    if (!userXP) {
      await initializeUserXP({ userId: user._id });
    }
  };
  initXP();
}, [user._id]);
```

### Issue: Achievements not unlocking
```tsx
// Solution: Call checkAchievements after XP gain
const result = await awardXP({...});
await checkAchievements({ userId: user._id });
```

### Issue: Streak not updating
```tsx
// Solution: Call updateStreak before awarding check-in XP
await updateStreak({ userId: user._id });
await awardXP({ source: "daily_checkin", ... });
```

### Issue: Multipliers not applying
```tsx
// Solution: Multipliers are calculated server-side automatically
// Just award base XP, multipliers are added in the mutation
await awardXP({ amount: BASE_XP }); // Multipliers applied automatically
```

## 📊 Testing Your Implementation

### Test 1: XP Initialization
```tsx
// Create new user → Check userXP table has record
```

### Test 2: XP Gain
```tsx
// Complete action → Check XP increases → Check xpTransactions table
```

### Test 3: Level Up
```tsx
// Award enough XP to level up → Check level increases → Modal shows
```

### Test 4: Streaks
```tsx
// Check in daily → Streak should increment
// Skip a day → Streak should reset (or use freeze)
```

### Test 5: Achievements
```tsx
// Complete 25 breathing sessions → "Breath Enthusiast" should unlock
```

### Test 6: Multipliers
```tsx
// Build 7-day streak → XP should have 1.2x multiplier
// Weekend → XP should have 1.3x multiplier
```

## ✅ Quick Validation

Run this query to check if everything is working:

```tsx
// In your browser console after implementing
const userXP = await getUserXP({ userId: user._id });
console.log("Level:", userXP.level);
console.log("Total XP:", userXP.totalXP);
console.log("Streak:", userXP.dailyStreak);
console.log("Actions Today:", userXP.todayActions);

const transactions = await getXPTransactions({ userId: user._id });
console.log("Recent XP gains:", transactions);

const achievements = await getUserAchievements({ userId: user._id });
console.log("Unlocked achievements:", achievements.length);
```

## 🎯 Success!

You should now have:
- ✅ XP system fully functional
- ✅ Level progression working
- ✅ Streaks tracking daily activity
- ✅ Achievements unlocking automatically
- ✅ UI components displaying correctly
- ✅ Multipliers applying automatically

**Your users will be hooked! 🎉**

Need help? Check the full documentation in `XP_GAMIFICATION_SYSTEM.md`
