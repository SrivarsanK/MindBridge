/**
 * XP System Integration Example
 * 
 * Copy-paste examples for integrating XP into your app
 */

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { XPBar, XPGainPopup, LevelUpModal, XPMultiplierBadge } from "@/components/xp/XPBar";
import { AchievementGrid, AchievementUnlockModal } from "@/components/xp/AchievementDisplay";
import { XP_VALUES, getLevelUpRewards } from "@/lib/xp/constants";
import { useState, useEffect } from "react";

// ============================================
// 1. DASHBOARD PAGE INTEGRATION
// ============================================

export function DashboardPage() {
  const user = useUser(); // Your auth hook
  const userXP = useQuery(api.xp.getUserXP, { userId: user?._id });
  const activeBoosts = useQuery(api.xp.getActiveBoosts, { userId: user?._id });
  const recentTransactions = useQuery(api.xp.getXPTransactions, { 
    userId: user?._id,
    limit: 5 
  });

  if (!userXP) return <LoadingSkeleton />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* XP Bar at top */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <XPBar
            currentXP={userXP.currentLevelXP}
            xpForNextLevel={userXP.xpForNextLevel}
            level={userXP.level}
            totalXP={userXP.totalXP}
            showDetails={true}
            animated={true}
          />
        </div>

        {/* Active multipliers */}
        <div className="flex gap-2">
          {activeBoosts?.map((boost) => (
            <XPMultiplierBadge
              key={boost._id}
              multiplier={boost.multiplier!}
              expiresAt={boost.expiresAt}
            />
          ))}
        </div>
      </div>

      {/* Streak Display */}
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Daily Streak</h3>
            <p className="text-3xl font-bold text-primary">
              {userXP.dailyStreak} days 🔥
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Longest</p>
            <p className="text-lg font-semibold">
              {userXP.longestDailyStreak} days
            </p>
          </div>
        </div>
      </div>

      {/* Recent XP Gains */}
      <div className="bg-card rounded-lg p-4 border">
        <h3 className="font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {recentTransactions?.map((tx) => (
            <div key={tx._id} className="flex justify-between text-sm">
              <span>{tx.description}</span>
              <span className="text-primary font-semibold">+{tx.amount} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rest of dashboard */}
    </div>
  );
}

// ============================================
// 2. BREATHING EXERCISE INTEGRATION
// ============================================

export function BreathingExercisePage() {
  const user = useUser();
  const awardXP = useMutation(api.xp.awardXP);
  const checkAchievements = useMutation(api.xp.checkAchievements);
  
  const [xpGain, setXpGain] = useState<any>(null);
  const [levelUpData, setLevelUpData] = useState<any>(null);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [isExercising, setIsExercising] = useState(false);
  const [duration, setDuration] = useState(0);

  const handleStartExercise = () => {
    setIsExercising(true);
    setDuration(0);
  };

  const handleCompleteExercise = async (durationMinutes: number) => {
    setIsExercising(false);

    // Calculate XP based on duration
    let xpAmount = XP_VALUES.BREATHING_START;
    
    if (durationMinutes >= 15) {
      xpAmount = XP_VALUES.BREATHING_COMPLETE_15MIN;
    } else if (durationMinutes >= 10) {
      xpAmount = XP_VALUES.BREATHING_COMPLETE_10MIN;
    } else if (durationMinutes >= 5) {
      xpAmount = XP_VALUES.BREATHING_COMPLETE_5MIN;
    } else {
      xpAmount = XP_VALUES.BREATHING_COMPLETE_CUSTOM + (durationMinutes * 5);
    }

    // Award XP
    const result = await awardXP({
      userId: user._id,
      source: "breathing_exercise",
      amount: xpAmount,
      description: `Completed ${durationMinutes}-minute breathing session`,
      metadata: {
        activityId: "breathing-" + Date.now(),
      },
    });

    // Show XP gain popup
    setXpGain(result);

    // Check for level up
    if (result.leveledUp) {
      setLevelUpData({
        newLevel: result.newLevel,
        rewards: getLevelUpRewards(result.newLevel),
      });
    }

    // Check for achievements
    const achievementResult = await checkAchievements({ userId: user._id });
    if (achievementResult.unlockedAchievements.length > 0) {
      // Fetch achievement details and show modals
      // (implement based on your needs)
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Breathing Exercise</h1>

      {/* Exercise interface */}
      <div className="bg-card rounded-lg p-8 border">
        {!isExercising ? (
          <button
            onClick={handleStartExercise}
            className="w-full py-4 bg-primary text-primary-foreground rounded-lg"
          >
            Start Breathing Exercise
          </button>
        ) : (
          <div className="text-center">
            <p className="text-4xl font-bold">{duration}s</p>
            <button
              onClick={() => handleCompleteExercise(Math.floor(duration / 60))}
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg"
            >
              Complete
            </button>
          </div>
        )}
      </div>

      {/* XP Gain Popup */}
      {xpGain && (
        <XPGainPopup
          amount={xpGain.xpGained}
          source="breathing_exercise"
          multiplier={xpGain.multiplier}
          onComplete={() => setXpGain(null)}
        />
      )}

      {/* Level Up Modal */}
      {levelUpData && (
        <LevelUpModal
          newLevel={levelUpData.newLevel}
          rewards={levelUpData.rewards}
          onClose={() => setLevelUpData(null)}
        />
      )}
    </div>
  );
}

// ============================================
// 3. AI CHAT INTEGRATION
// ============================================

export function AIChatInterface() {
  const user = useUser();
  const awardXP = useMutation(api.xp.awardXP);
  const [messages, setMessages] = useState<any[]>([]);
  const [xpGains, setXpGains] = useState<any[]>([]);

  const handleSendMessage = async (message: string) => {
    // Send message to AI
    const response = await sendToAI(message);
    
    // Add messages to state
    setMessages([...messages, { role: "user", content: message }, response]);

    // Award XP for message
    const messageXP = await awardXP({
      userId: user._id,
      source: "ai_chat_message",
      amount: XP_VALUES.AI_CHAT_MESSAGE,
      description: "Sent a message to Recovery Coach AI",
    });

    setXpGains([...xpGains, messageXP]);

    // Check for positive sentiment
    if (response.sentiment === "positive") {
      const positiveXP = await awardXP({
        userId: user._id,
        source: "ai_chat_positive",
        amount: XP_VALUES.AI_CHAT_POSITIVE_RESPONSE,
        description: "AI detected positive progress! 🎉",
      });

      setXpGains([...xpGains, positiveXP]);
    }

    // Check for breakthrough
    if (response.breakthrough) {
      const breakthroughXP = await awardXP({
        userId: user._id,
        source: "ai_chat_positive",
        amount: XP_VALUES.AI_CHAT_BREAKTHROUGH,
        description: "Major breakthrough detected! 🌟",
      });

      setXpGains([...xpGains, breakthroughXP]);
    }

    // Check for session completion (10+ messages)
    if (messages.length >= 10 && messages.length % 10 === 0) {
      const sessionXP = await awardXP({
        userId: user._id,
        source: "ai_chat_message",
        amount: XP_VALUES.AI_CHAT_SESSION_COMPLETE,
        description: "Completed meaningful conversation session",
      });

      setXpGains([...xpGains, sessionXP]);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : ""}>
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <input
          type="text"
          placeholder="Type a message..."
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* XP Popups */}
      {xpGains.map((gain, i) => (
        <XPGainPopup
          key={i}
          amount={gain.xpGained}
          source="ai_chat"
          multiplier={gain.multiplier}
          onComplete={() => {
            setXpGains(xpGains.filter((_, idx) => idx !== i));
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// 4. PEER CHAT INTEGRATION
// ============================================

export function PeerChatPage() {
  const user = useUser();
  const awardXP = useMutation(api.xp.awardXP);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [messageCount, setMessageCount] = useState(0);

  // Award XP when session starts
  const handleSessionStart = async () => {
    setSessionStartTime(Date.now());

    await awardXP({
      userId: user._id,
      source: "peer_chat_session",
      amount: XP_VALUES.PEER_CHAT_SESSION_START,
      description: "Started peer chat session",
    });
  };

  // Award XP for each message
  const handleMessageSent = async () => {
    setMessageCount(messageCount + 1);

    await awardXP({
      userId: user._id,
      source: "peer_chat_message",
      amount: XP_VALUES.PEER_CHAT_MESSAGE,
      description: "Sent peer chat message",
    });
  };

  // Award XP for session duration
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const duration = (Date.now() - sessionStartTime) / 1000 / 60; // minutes

      if (duration >= 30) {
        awardXP({
          userId: user._id,
          source: "peer_chat_session",
          amount: XP_VALUES.PEER_CHAT_SESSION_30MIN,
          description: "30-minute peer chat session!",
        });
        clearInterval(interval);
      } else if (duration >= 10) {
        awardXP({
          userId: user._id,
          source: "peer_chat_session",
          amount: XP_VALUES.PEER_CHAT_SESSION_10MIN,
          description: "10-minute peer chat session",
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  return (
    <div>
      {/* Peer chat interface */}
    </div>
  );
}

// ============================================
// 5. DAILY CHECK-IN INTEGRATION
// ============================================

export function DailyCheckInButton() {
  const user = useUser();
  const userXP = useQuery(api.xp.getUserXP, { userId: user?._id });
  const updateStreak = useMutation(api.xp.updateStreak);
  const awardXP = useMutation(api.xp.awardXP);
  
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [xpGain, setXpGain] = useState<any>(null);

  // Check if already checked in today
  useEffect(() => {
    if (userXP) {
      const today = new Date().toISOString().split('T')[0];
      setHasCheckedIn(userXP.lastActivityDate === today);
    }
  }, [userXP]);

  const handleCheckIn = async () => {
    // Update streak first
    const streakResult = await updateStreak({ userId: user._id });

    // Calculate bonus XP based on streak
    const baseXP = XP_VALUES.DAILY_CHECKIN;
    const streakBonus = Math.min(
      streakResult.newStreak * XP_VALUES.DAILY_CHECKIN_STREAK_BONUS,
      200
    );
    const totalXP = baseXP + streakBonus;

    // Award XP
    const result = await awardXP({
      userId: user._id,
      source: "daily_checkin",
      amount: totalXP,
      description: `Daily check-in! ${streakResult.newStreak} day streak 🔥`,
    });

    setXpGain(result);
    setHasCheckedIn(true);
  };

  if (hasCheckedIn) {
    return (
      <div className="text-center text-muted-foreground">
        ✅ Checked in today!
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleCheckIn}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
      >
        Daily Check-in 🔥
      </button>

      {xpGain && (
        <XPGainPopup
          amount={xpGain.xpGained}
          source="daily_checkin"
          multiplier={xpGain.multiplier}
          onComplete={() => setXpGain(null)}
        />
      )}
    </>
  );
}

// ============================================
// 6. ACHIEVEMENTS PAGE
// ============================================

export function AchievementsPage() {
  const user = useUser();
  const achievements = useQuery(api.xp.getUserAchievements, { userId: user?._id });
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  if (!achievements) return <LoadingSkeleton />;

  // Group by category
  const grouped = achievements.reduce((acc: any, achievement: any) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Achievements</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border text-center">
          <p className="text-3xl font-bold text-primary">{achievements.length}</p>
          <p className="text-sm text-muted-foreground">Unlocked</p>
        </div>
        <div className="bg-card p-4 rounded-lg border text-center">
          <p className="text-3xl font-bold text-primary">40</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="bg-card p-4 rounded-lg border text-center">
          <p className="text-3xl font-bold text-primary">
            {Math.round((achievements.length / 40) * 100)}%
          </p>
          <p className="text-sm text-muted-foreground">Complete</p>
        </div>
      </div>

      {/* Achievement Grids by Category */}
      {Object.entries(grouped).map(([category, items]: [string, any]) => (
        <div key={category}>
          <h2 className="text-xl font-semibold mb-4 capitalize">
            {category.replace(/_/g, " ")}
          </h2>
          <AchievementGrid
            achievements={items}
            columns={4}
            size="md"
            showProgress={false}
            onAchievementClick={setSelectedAchievement}
          />
        </div>
      ))}

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <AchievementUnlockModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
}

// ============================================
// 7. USER ONBOARDING INTEGRATION
// ============================================

export function OnboardingComplete() {
  const user = useUser();
  const initXP = useMutation(api.xp.initializeUserXP);
  const awardXP = useMutation(api.xp.awardXP);

  const handleComplete = async () => {
    // Initialize XP system
    await initXP({ userId: user._id });

    // Award onboarding bonus
    await awardXP({
      userId: user._id,
      source: "profile_complete",
      amount: XP_VALUES.ONBOARDING_COMPLETE,
      description: "Completed onboarding! Welcome! 🎉",
    });

    // Navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <button onClick={handleComplete} className="btn-primary">
      Complete Onboarding
    </button>
  );
}

// ============================================
// 8. GLOBAL HEADER WITH XP BAR
// ============================================

export function GlobalHeader() {
  const user = useUser();
  const userXP = useQuery(api.xp.getUserXP, { userId: user?._id });
  const activeBoosts = useQuery(api.xp.getActiveBoosts, { userId: user?._id });

  if (!userXP) return null;

  return (
    <header className="bg-card border-b px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="font-bold text-xl">MindBridge</div>

        {/* XP Bar (compact) */}
        <div className="flex-1 max-w-md mx-8">
          <XPBar
            currentXP={userXP.currentLevelXP}
            xpForNextLevel={userXP.xpForNextLevel}
            level={userXP.level}
            totalXP={userXP.totalXP}
            showDetails={false}
            animated={false}
          />
        </div>

        {/* Active Boosts */}
        <div className="flex gap-2">
          {activeBoosts?.map((boost) => (
            <XPMultiplierBadge
              key={boost._id}
              multiplier={boost.multiplier!}
              expiresAt={boost.expiresAt}
            />
          ))}
        </div>

        {/* User Menu */}
        <div>{/* User avatar/menu */}</div>
      </div>
    </header>
  );
}

// ============================================
// 9. MOOD LOGGING INTEGRATION
// ============================================

export function MoodLogButton() {
  const user = useUser();
  const awardXP = useMutation(api.xp.awardXP);
  const [xpGain, setXpGain] = useState<any>(null);

  const handleMoodLog = async (mood: string) => {
    // Save mood to database
    await saveMood(mood);

    // Award XP
    const result = await awardXP({
      userId: user._id,
      source: "mood_log",
      amount: XP_VALUES.MOOD_LOG,
      description: "Logged mood",
    });

    setXpGain(result);
  };

  return (
    <>
      {/* Mood logging interface */}
      
      {xpGain && (
        <XPGainPopup
          amount={xpGain.xpGained}
          source="mood_log"
          multiplier={xpGain.multiplier}
          onComplete={() => setXpGain(null)}
        />
      )}
    </>
  );
}

// ============================================
// HELPER: Check if user needs XP initialization
// ============================================

export function useInitializeXP() {
  const user = useUser();
  const userXP = useQuery(api.xp.getUserXP, { userId: user?._id });
  const initXP = useMutation(api.xp.initializeUserXP);

  useEffect(() => {
    const init = async () => {
      if (user && !userXP) {
        await initXP({ userId: user._id });
      }
    };
    init();
  }, [user, userXP]);
}

// Add to your main App component
export function App() {
  useInitializeXP(); // Automatically initialize XP for new users

  return (
    <div>
      {/* Your app */}
    </div>
  );
}
