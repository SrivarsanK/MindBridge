/**
 * XP System Constants & Configuration
 * 
 * Defines all XP values, level progression, achievements, and gamification rules
 */

// ============================================
// XP VALUES FOR ACTIONS
// ============================================

export const XP_VALUES = {
  // Daily Activities
  DAILY_CHECKIN: 50,
  DAILY_CHECKIN_STREAK_BONUS: 25, // +25 per consecutive day (max 200)
  
  // Breathing Exercises
  BREATHING_START: 20,
  BREATHING_COMPLETE_5MIN: 50,
  BREATHING_COMPLETE_10MIN: 100,
  BREATHING_COMPLETE_15MIN: 150,
  BREATHING_COMPLETE_CUSTOM: 30, // Base + (minutes * 5)
  
  // AI Chat Interactions
  AI_CHAT_MESSAGE: 10, // Per message sent
  AI_CHAT_POSITIVE_RESPONSE: 50, // When AI detects positive sentiment
  AI_CHAT_BREAKTHROUGH: 100, // When AI detects significant progress
  AI_CHAT_SESSION_COMPLETE: 75, // Completing meaningful conversation (10+ messages)
  
  // Peer Chat
  PEER_CHAT_MESSAGE: 15, // Per message sent
  PEER_CHAT_SESSION_START: 30,
  PEER_CHAT_SESSION_10MIN: 75,
  PEER_CHAT_SESSION_30MIN: 150,
  PEER_CHAT_HELPFUL_FEEDBACK: 100, // When peer marks chat as helpful
  
  // Content Engagement
  ARTICLE_OPENED: 10,
  ARTICLE_READ_COMPLETE: 50, // Spent >2 min reading
  VIDEO_WATCHED: 40,
  RESOURCE_BOOKMARKED: 15,
  
  // Journaling & Mood
  MOOD_LOG: 25,
  DREAM_JOURNAL_ENTRY: 60,
  REFLECTION_ENTRY: 45,
  
  // Profile & Setup
  PROFILE_COMPLETE: 100,
  ONBOARDING_COMPLETE: 150,
  BIO_ADDED: 50,
  AVATAR_CUSTOMIZED: 30,
  
  // Milestones
  FIRST_TIME_BONUSES: {
    FIRST_BREATHING: 100,
    FIRST_CHAT: 100,
    FIRST_PEER_CHAT: 150,
    FIRST_CHECKIN: 75,
    FIRST_ARTICLE: 50,
    FIRST_DREAM_JOURNAL: 100,
  },
  
  // Special
  REFERRAL_BONUS: 200,
  FEEDBACK_SUBMITTED: 50,
  BUG_REPORT: 75,
} as const;

// ============================================
// LEVEL PROGRESSION
// ============================================

/**
 * Calculate XP required for next level
 * Formula: baseXP * (level^exponent) + (level * linearIncrease)
 */
export const LEVEL_CONFIG = {
  BASE_XP: 100,
  EXPONENT: 1.5,
  LINEAR_INCREASE: 50,
  MAX_LEVEL: 100,
  PRESTIGE_LEVEL_REQUIREMENT: 100, // Reset with bonuses
};

/**
 * Get XP required for a specific level
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(
    LEVEL_CONFIG.BASE_XP * Math.pow(level, LEVEL_CONFIG.EXPONENT) +
    level * LEVEL_CONFIG.LINEAR_INCREASE
  );
}

/**
 * Get total XP required to reach a level from level 1
 */
export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXP(totalXP: number): { level: number; currentLevelXP: number; xpForNextLevel: number } {
  let level = 1;
  let xpSum = 0;
  
  while (level < LEVEL_CONFIG.MAX_LEVEL) {
    const xpForNext = getXPForLevel(level + 1);
    if (xpSum + xpForNext > totalXP) {
      break;
    }
    xpSum += xpForNext;
    level++;
  }
  
  const currentLevelXP = totalXP - xpSum;
  const xpForNextLevel = getXPForLevel(level + 1);
  
  return { level, currentLevelXP, xpForNextLevel };
}

// ============================================
// STREAK BONUSES
// ============================================

export const STREAK_BONUSES = {
  DAILY: {
    3: 50,    // 3 day streak
    7: 150,   // 1 week
    14: 300,  // 2 weeks
    30: 750,  // 1 month
    60: 1500, // 2 months
    90: 2500, // 3 months
    180: 5000, // 6 months
    365: 10000, // 1 year!
  },
  WEEKLY: {
    4: 200,   // 1 month of weekly streaks
    12: 1000, // 3 months
    26: 2500, // 6 months
    52: 7500, // 1 year
  },
};

// ============================================
// MULTIPLIERS
// ============================================

export const XP_MULTIPLIERS = {
  STREAK_ACTIVE_7DAY: 1.2,   // +20% XP with 7+ day streak
  STREAK_ACTIVE_30DAY: 1.5,  // +50% XP with 30+ day streak
  WEEKEND_BONUS: 1.3,        // +30% XP on weekends
  EVENING_BONUS: 1.2,        // +20% XP 8PM-11PM (wind-down time)
  FIRST_ACTIVITY_TODAY: 1.5, // +50% XP for first action of the day
};

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================

export interface Achievement {
  id: string;
  category: 'breathing' | 'chat' | 'peer_support' | 'streaks' | 'milestones' | 'exploration' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  isSecret: boolean;
  requirement: {
    type: string;
    value: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // ============================================
  // BREATHING ACHIEVEMENTS
  // ============================================
  {
    id: 'breath_first',
    category: 'breathing',
    tier: 'bronze',
    rarity: 'common',
    title: 'First Breath',
    description: 'Complete your first breathing exercise',
    icon: '🫁',
    xpReward: 100,
    isSecret: false,
    requirement: { type: 'breathing_sessions', value: 1 },
  },
  {
    id: 'breath_enthusiast',
    category: 'breathing',
    tier: 'silver',
    rarity: 'uncommon',
    title: 'Breath Enthusiast',
    description: 'Complete 25 breathing sessions',
    icon: '🌬️',
    xpReward: 300,
    isSecret: false,
    requirement: { type: 'breathing_sessions', value: 25 },
  },
  {
    id: 'breath_master',
    category: 'breathing',
    tier: 'gold',
    rarity: 'rare',
    title: 'Breath Master',
    description: 'Complete 100 breathing sessions',
    icon: '🧘',
    xpReward: 1000,
    isSecret: false,
    requirement: { type: 'breathing_sessions', value: 100 },
  },
  {
    id: 'zen_warrior',
    category: 'breathing',
    tier: 'platinum',
    rarity: 'epic',
    title: 'Zen Warrior',
    description: 'Complete 500 breathing sessions',
    icon: '☯️',
    xpReward: 3000,
    isSecret: false,
    requirement: { type: 'breathing_sessions', value: 500 },
  },
  {
    id: 'marathon_breather',
    category: 'breathing',
    tier: 'gold',
    rarity: 'rare',
    title: 'Marathon Breather',
    description: 'Complete a 30-minute breathing session',
    icon: '⏱️',
    xpReward: 500,
    isSecret: false,
    requirement: { type: 'breathing_duration', value: 30 },
  },

  // ============================================
  // CHAT ACHIEVEMENTS
  // ============================================
  {
    id: 'chat_beginner',
    category: 'chat',
    tier: 'bronze',
    rarity: 'common',
    title: 'Opening Up',
    description: 'Send 10 messages to Recovery Coach AI',
    icon: '💬',
    xpReward: 150,
    isSecret: false,
    requirement: { type: 'chat_messages', value: 10 },
  },
  {
    id: 'chat_regular',
    category: 'chat',
    tier: 'silver',
    rarity: 'uncommon',
    title: 'Regular Talker',
    description: 'Send 100 messages to Recovery Coach AI',
    icon: '💭',
    xpReward: 500,
    isSecret: false,
    requirement: { type: 'chat_messages', value: 100 },
  },
  {
    id: 'chat_champion',
    category: 'chat',
    tier: 'gold',
    rarity: 'rare',
    title: 'Conversation Champion',
    description: 'Send 500 messages to Recovery Coach AI',
    icon: '🗣️',
    xpReward: 1500,
    isSecret: false,
    requirement: { type: 'chat_messages', value: 500 },
  },
  {
    id: 'positive_vibes',
    category: 'chat',
    tier: 'gold',
    rarity: 'rare',
    title: 'Positive Vibes',
    description: 'Receive 50 positive responses from AI',
    icon: '✨',
    xpReward: 800,
    isSecret: false,
    requirement: { type: 'positive_responses', value: 50 },
  },
  {
    id: 'breakthrough_moment',
    category: 'chat',
    tier: 'platinum',
    rarity: 'epic',
    title: 'Breakthrough!',
    description: 'AI detects a significant breakthrough in your recovery',
    icon: '🎯',
    xpReward: 2000,
    isSecret: true,
    requirement: { type: 'breakthrough_detected', value: 1 },
  },

  // ============================================
  // PEER SUPPORT ACHIEVEMENTS
  // ============================================
  {
    id: 'peer_first',
    category: 'peer_support',
    tier: 'bronze',
    rarity: 'common',
    title: 'Peer Connection',
    description: 'Start your first peer chat',
    icon: '🤝',
    xpReward: 150,
    isSecret: false,
    requirement: { type: 'peer_chats', value: 1 },
  },
  {
    id: 'peer_supporter',
    category: 'peer_support',
    tier: 'silver',
    rarity: 'uncommon',
    title: 'Peer Supporter',
    description: 'Complete 10 peer chat sessions',
    icon: '👥',
    xpReward: 600,
    isSecret: false,
    requirement: { type: 'peer_chats', value: 10 },
  },
  {
    id: 'peer_hero',
    category: 'peer_support',
    tier: 'gold',
    rarity: 'rare',
    title: 'Peer Hero',
    description: 'Receive 20 "helpful" ratings from peers',
    icon: '🦸',
    xpReward: 1200,
    isSecret: false,
    requirement: { type: 'helpful_ratings', value: 20 },
  },
  {
    id: 'peer_legend',
    category: 'peer_support',
    tier: 'platinum',
    rarity: 'epic',
    title: 'Community Legend',
    description: 'Send 1000 peer chat messages',
    icon: '👑',
    xpReward: 3000,
    isSecret: false,
    requirement: { type: 'peer_messages', value: 1000 },
  },

  // ============================================
  // STREAK ACHIEVEMENTS
  // ============================================
  {
    id: 'streak_3',
    category: 'streaks',
    tier: 'bronze',
    rarity: 'common',
    title: '3 Day Warrior',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    xpReward: 200,
    isSecret: false,
    requirement: { type: 'daily_streak', value: 3 },
  },
  {
    id: 'streak_7',
    category: 'streaks',
    tier: 'silver',
    rarity: 'uncommon',
    title: 'Week Strong',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 500,
    isSecret: false,
    requirement: { type: 'daily_streak', value: 7 },
  },
  {
    id: 'streak_30',
    category: 'streaks',
    tier: 'gold',
    rarity: 'rare',
    title: 'Monthly Dedication',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    xpReward: 1500,
    isSecret: false,
    requirement: { type: 'daily_streak', value: 30 },
  },
  {
    id: 'streak_100',
    category: 'streaks',
    tier: 'platinum',
    rarity: 'epic',
    title: 'Centurion',
    description: 'Maintain a 100-day streak',
    icon: '🔥',
    xpReward: 5000,
    isSecret: false,
    requirement: { type: 'daily_streak', value: 100 },
  },
  {
    id: 'streak_365',
    category: 'streaks',
    tier: 'diamond',
    rarity: 'legendary',
    title: 'Year of Commitment',
    description: 'Maintain a 365-day streak',
    icon: '💎',
    xpReward: 15000,
    isSecret: false,
    requirement: { type: 'daily_streak', value: 365 },
  },

  // ============================================
  // MILESTONE ACHIEVEMENTS
  // ============================================
  {
    id: 'level_10',
    category: 'milestones',
    tier: 'bronze',
    rarity: 'common',
    title: 'Rising Star',
    description: 'Reach Level 10',
    icon: '⭐',
    xpReward: 500,
    isSecret: false,
    requirement: { type: 'level', value: 10 },
  },
  {
    id: 'level_25',
    category: 'milestones',
    tier: 'silver',
    rarity: 'uncommon',
    title: 'Dedicated User',
    description: 'Reach Level 25',
    icon: '🌟',
    xpReward: 1000,
    isSecret: false,
    requirement: { type: 'level', value: 25 },
  },
  {
    id: 'level_50',
    category: 'milestones',
    tier: 'gold',
    rarity: 'rare',
    title: 'Half Century',
    description: 'Reach Level 50',
    icon: '✨',
    xpReward: 2500,
    isSecret: false,
    requirement: { type: 'level', value: 50 },
  },
  {
    id: 'level_100',
    category: 'milestones',
    tier: 'platinum',
    rarity: 'epic',
    title: 'Legendary',
    description: 'Reach Level 100',
    icon: '🏆',
    xpReward: 10000,
    isSecret: false,
    requirement: { type: 'level', value: 100 },
  },

  // ============================================
  // EXPLORATION ACHIEVEMENTS
  // ============================================
  {
    id: 'explorer',
    category: 'exploration',
    tier: 'bronze',
    rarity: 'common',
    title: 'Explorer',
    description: 'Read 10 articles',
    icon: '📚',
    xpReward: 300,
    isSecret: false,
    requirement: { type: 'articles_read', value: 10 },
  },
  {
    id: 'knowledge_seeker',
    category: 'exploration',
    tier: 'silver',
    rarity: 'uncommon',
    title: 'Knowledge Seeker',
    description: 'Read 50 articles',
    icon: '📖',
    xpReward: 800,
    isSecret: false,
    requirement: { type: 'articles_read', value: 50 },
  },
  {
    id: 'all_rounder',
    category: 'exploration',
    tier: 'gold',
    rarity: 'rare',
    title: 'All-Rounder',
    description: 'Try every feature at least once',
    icon: '🎪',
    xpReward: 1500,
    isSecret: false,
    requirement: { type: 'features_tried', value: 10 },
  },

  // ============================================
  // SPECIAL ACHIEVEMENTS (Hidden/Secret)
  // ============================================
  {
    id: 'night_owl',
    category: 'special',
    tier: 'silver',
    rarity: 'uncommon',
    title: 'Night Owl',
    description: 'Complete activities between 12 AM - 4 AM on 10 different nights',
    icon: '🦉',
    xpReward: 500,
    isSecret: true,
    requirement: { type: 'night_activities', value: 10 },
  },
  {
    id: 'early_bird',
    category: 'special',
    tier: 'silver',
    rarity: 'uncommon',
    title: 'Early Bird',
    description: 'Complete activities between 5 AM - 7 AM on 15 different days',
    icon: '🐦',
    xpReward: 500,
    isSecret: true,
    requirement: { type: 'morning_activities', value: 15 },
  },
  {
    id: 'weekend_warrior',
    category: 'special',
    tier: 'gold',
    rarity: 'rare',
    title: 'Weekend Warrior',
    description: 'Be most active on weekends for 8 consecutive weeks',
    icon: '⚔️',
    xpReward: 1000,
    isSecret: true,
    requirement: { type: 'weekend_streaks', value: 8 },
  },
  {
    id: 'lucky_seven',
    category: 'special',
    tier: 'gold',
    rarity: 'rare',
    title: 'Lucky Seven',
    description: 'Gain exactly 777 XP in a single day',
    icon: '🎰',
    xpReward: 777,
    isSecret: true,
    requirement: { type: 'daily_xp', value: 777 },
  },
  {
    id: 'perfect_week',
    category: 'special',
    tier: 'platinum',
    rarity: 'epic',
    title: 'Perfect Week',
    description: 'Complete all daily challenges for 7 consecutive days',
    icon: '💯',
    xpReward: 2000,
    isSecret: true,
    requirement: { type: 'perfect_days', value: 7 },
  },
  {
    id: 'founder',
    category: 'special',
    tier: 'diamond',
    rarity: 'legendary',
    title: 'Founding Member',
    description: 'One of the first 100 users',
    icon: '👑',
    xpReward: 5000,
    isSecret: false,
    requirement: { type: 'user_number', value: 100 },
  },
];

// ============================================
// DAILY CHALLENGE TEMPLATES
// ============================================

export interface ChallengeTemplate {
  id: string;
  type: 'breathing' | 'chat' | 'peer' | 'mood' | 'streak' | 'explore';
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  targetValue: number;
  xpReward: number;
  bonusXPReward: number;
}

export const DAILY_CHALLENGES: ChallengeTemplate[] = [
  // Easy Challenges
  {
    id: 'breathe_once',
    type: 'breathing',
    difficulty: 'easy',
    title: 'Take a Breath',
    description: 'Complete 1 breathing exercise',
    targetValue: 1,
    xpReward: 50,
    bonusXPReward: 25,
  },
  {
    id: 'chat_5_messages',
    type: 'chat',
    difficulty: 'easy',
    title: 'Quick Chat',
    description: 'Send 5 messages to Recovery Coach AI',
    targetValue: 5,
    xpReward: 50,
    bonusXPReward: 25,
  },
  {
    id: 'log_mood',
    type: 'mood',
    difficulty: 'easy',
    title: 'Mood Check',
    description: 'Log your mood once today',
    targetValue: 1,
    xpReward: 40,
    bonusXPReward: 20,
  },
  
  // Medium Challenges
  {
    id: 'breathe_10min',
    type: 'breathing',
    difficulty: 'medium',
    title: 'Mindful Breathing',
    description: 'Complete a 10-minute breathing session',
    targetValue: 10,
    xpReward: 100,
    bonusXPReward: 50,
  },
  {
    id: 'chat_meaningful',
    type: 'chat',
    difficulty: 'medium',
    title: 'Deep Conversation',
    description: 'Have a meaningful conversation (15+ messages)',
    targetValue: 15,
    xpReward: 120,
    bonusXPReward: 60,
  },
  {
    id: 'peer_support',
    type: 'peer',
    difficulty: 'medium',
    title: 'Connect with Peer',
    description: 'Start a peer chat session',
    targetValue: 1,
    xpReward: 100,
    bonusXPReward: 50,
  },
  {
    id: 'read_article',
    type: 'explore',
    difficulty: 'medium',
    title: 'Learn Something New',
    description: 'Read 2 articles completely',
    targetValue: 2,
    xpReward: 80,
    bonusXPReward: 40,
  },
  
  // Hard Challenges
  {
    id: 'breathe_triple',
    type: 'breathing',
    difficulty: 'hard',
    title: 'Triple Threat',
    description: 'Complete 3 different breathing exercises',
    targetValue: 3,
    xpReward: 200,
    bonusXPReward: 100,
  },
  {
    id: 'super_active',
    type: 'streak',
    difficulty: 'hard',
    title: 'Super Active Day',
    description: 'Perform 20 different activities today',
    targetValue: 20,
    xpReward: 250,
    bonusXPReward: 150,
  },
  {
    id: 'peer_marathon',
    type: 'peer',
    difficulty: 'hard',
    title: 'Peer Marathon',
    description: 'Spend 30 minutes in peer chat',
    targetValue: 30,
    xpReward: 300,
    bonusXPReward: 150,
  },
];

// ============================================
// RANDOM BONUS EVENTS
// ============================================

export const RANDOM_BONUSES = {
  LUCKY_MOMENT: {
    chance: 0.05, // 5% chance
    xpRange: [50, 200],
    message: '🍀 Lucky moment! Bonus XP!',
  },
  DOUBLE_XP: {
    chance: 0.02, // 2% chance
    multiplier: 2,
    message: '⚡ Double XP activated!',
  },
  SURPRISE_GIFT: {
    chance: 0.01, // 1% chance
    xpRange: [200, 500],
    message: '🎁 Surprise gift! Extra XP!',
  },
};

// ============================================
// LEVEL UP REWARDS
// ============================================

export function getLevelUpRewards(level: number): {
  xpBoost?: { multiplier: number; duration: number };
  streakFreeze?: number;
  bonusXP?: number;
  achievement?: string;
} {
  const rewards: any = {};
  
  // Every 5 levels: Bonus XP
  if (level % 5 === 0) {
    rewards.bonusXP = level * 10;
  }
  
  // Every 10 levels: XP Boost
  if (level % 10 === 0) {
    rewards.xpBoost = {
      multiplier: 1.5,
      duration: 86400, // 24 hours
    };
  }
  
  // Every 25 levels: Streak Freeze
  if (level % 25 === 0) {
    rewards.streakFreeze = 3; // 3 free days
  }
  
  return rewards;
}

// ============================================
// ANONYMOUS NAMES FOR LEADERBOARD
// ============================================

export const ANONYMOUS_ADJECTIVES = [
  'Brave', 'Calm', 'Determined', 'Fierce', 'Gentle', 'Happy', 'Inspiring',
  'Kind', 'Loyal', 'Mindful', 'Noble', 'Optimistic', 'Peaceful', 'Radiant',
  'Serene', 'Tranquil', 'Valiant', 'Wise', 'Zen', 'Bold', 'Courageous',
  'Resilient', 'Strong', 'Hopeful', 'Bright', 'Cheerful', 'Graceful',
];

export const ANONYMOUS_NOUNS = [
  'Warrior', 'Phoenix', 'Lion', 'Eagle', 'Dolphin', 'Butterfly', 'Tiger',
  'Bear', 'Wolf', 'Owl', 'Dragon', 'Panda', 'Hawk', 'Falcon', 'Raven',
  'Fox', 'Deer', 'Swan', 'Crane', 'Lotus', 'Mountain', 'River', 'Ocean',
  'Star', 'Moon', 'Sun', 'Tree', 'Flame',
];

export function generateAnonymousName(): string {
  const adj = ANONYMOUS_ADJECTIVES[Math.floor(Math.random() * ANONYMOUS_ADJECTIVES.length)];
  const noun = ANONYMOUS_NOUNS[Math.floor(Math.random() * ANONYMOUS_NOUNS.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
}

// ============================================
// AVATAR IDENTIFIERS
// ============================================

export const AVATAR_EMOJIS = [
  '🦁', '🐯', '🐺', '🦅', '🦉', '🦋', '🐬', '🐼', '🦊', '🦌',
  '🦢', '🦩', '🐲', '🦄', '🌟', '⭐', '💫', '🔥', '💎', '🌈',
  '🌺', '🌸', '🌻', '🌹', '🍀', '🌙', '☀️', '🌊', '⛰️', '🌲',
];

export function generateRandomAvatar(): string {
  return AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
}
