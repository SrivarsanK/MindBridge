"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  achievementId: string;
  category: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: number;
  isSecret: boolean;
  progress?: number;
}

const TIER_COLORS = {
  bronze: "from-orange-700 to-orange-900",
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-cyan-400 to-blue-500",
  diamond: "from-purple-400 to-pink-500",
};

const TIER_GLOW = {
  bronze: "shadow-orange-500/50",
  silver: "shadow-gray-400/50",
  gold: "shadow-yellow-400/50",
  platinum: "shadow-cyan-400/50",
  diamond: "shadow-purple-400/50",
};

const RARITY_BORDER = {
  common: "border-gray-500",
  uncommon: "border-green-500",
  rare: "border-blue-500",
  epic: "border-purple-500",
  legendary: "border-yellow-500",
};

interface AchievementCardProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  onClick?: () => void;
}

export function AchievementCard({
  achievement,
  size = "md",
  showProgress = false,
  onClick,
}: AchievementCardProps) {
  const isUnlocked = !!achievement.unlockedAt;
  const isLocked = !isUnlocked && achievement.isSecret;

  const sizeClasses = {
    sm: "w-20 h-24",
    md: "w-32 h-40",
    lg: "w-40 h-48",
  };

  const iconSizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-5xl",
  };

  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
      whileTap={isUnlocked ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={cn(
        "relative rounded-xl border-2 cursor-pointer transition-all",
        sizeClasses[size],
        isUnlocked
          ? cn(
              "bg-gradient-to-br shadow-lg",
              TIER_COLORS[achievement.tier],
              TIER_GLOW[achievement.tier],
              RARITY_BORDER[achievement.rarity]
            )
          : "bg-secondary border-muted-foreground/30 grayscale opacity-60"
      )}
    >
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      {/* Achievement Content */}
      {(!isLocked || isUnlocked) && (
        <div className="relative h-full flex flex-col items-center justify-center p-3 text-center">
          {/* Icon */}
          <div className={cn("mb-2", iconSizes[size])}>
            {achievement.icon}
          </div>

          {/* Title */}
          <h4
            className={cn(
              "font-bold text-white line-clamp-2",
              size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
            )}
          >
            {achievement.title}
          </h4>

          {/* XP Reward */}
          <div
            className={cn(
              "mt-1 flex items-center gap-1 text-white/80",
              size === "sm" ? "text-xs" : "text-sm"
            )}
          >
            <Sparkles className="w-3 h-3" />
            <span>+{achievement.xpReward}</span>
          </div>

          {/* Progress Bar (if applicable) */}
          {showProgress && achievement.progress !== undefined && !isUnlocked && (
            <div className="absolute bottom-2 left-2 right-2 h-1 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${achievement.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}

          {/* Tier Badge */}
          <div className="absolute top-1 right-1">
            <div
              className={cn(
                "px-2 py-0.5 text-xs font-bold rounded-full text-white",
                `bg-${achievement.tier}-500`
              )}
            >
              {achievement.tier.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Unlock Date (for unlocked achievements) */}
          {isUnlocked && achievement.unlockedAt && size !== "sm" && (
            <div className="absolute bottom-1 left-0 right-0 text-center">
              <span className="text-xs text-white/60">
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Shine Effect for Unlocked */}
      {isUnlocked && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
          }}
        />
      )}
    </motion.div>
  );
}

interface AchievementUnlockModalProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementUnlockModal({
  achievement,
  onClose,
}: AchievementUnlockModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className={cn(
            "relative bg-gradient-to-br p-8 rounded-2xl shadow-2xl border-4 max-w-md w-full",
            TIER_COLORS[achievement.tier],
            RARITY_BORDER[achievement.rarity]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Celebration Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{
                  x: "50%",
                  y: "50%",
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  opacity: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.03,
                  ease: "easeOut",
                }}
              >
                {["🎉", "✨", "🌟", "💫", "⭐"][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>

          <div className="relative text-center space-y-4 text-white">
            {/* Header */}
            <div>
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1],
                }}
                transition={{
                  duration: 0.6,
                }}
                className="text-2xl mb-2"
              >
                🏆
              </motion.div>
              <h2 className="text-2xl font-bold">Achievement Unlocked!</h2>
            </div>

            {/* Achievement Icon */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="text-7xl"
            >
              {achievement.icon}
            </motion.div>

            {/* Title & Description */}
            <div>
              <h3 className="text-3xl font-black mb-2">{achievement.title}</h3>
              <p className="text-white/80">{achievement.description}</p>
            </div>

            {/* Tier & Rarity */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="px-3 py-1 bg-black/30 rounded-full">
                <span className="capitalize">{achievement.tier} Tier</span>
              </div>
              <div className="px-3 py-1 bg-black/30 rounded-full">
                <span className="capitalize">{achievement.rarity}</span>
              </div>
            </div>

            {/* XP Reward */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="bg-black/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6" />
                <span className="text-3xl font-bold">
                  +{achievement.xpReward} XP
                </span>
              </div>
            </motion.div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface AchievementGridProps {
  achievements: Achievement[];
  columns?: number;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  onAchievementClick?: (achievement: Achievement) => void;
}

export function AchievementGrid({
  achievements,
  columns = 4,
  size = "md",
  showProgress = false,
  onAchievementClick,
}: AchievementGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns as keyof typeof gridCols] || gridCols[4])}>
      {achievements.map((achievement) => (
        <AchievementCard
          key={achievement.achievementId}
          achievement={achievement}
          size={size}
          showProgress={showProgress}
          onClick={() => onAchievementClick?.(achievement)}
        />
      ))}
    </div>
  );
}

interface AchievementStatsProps {
  total: number;
  unlocked: number;
  categories: Record<string, number>;
}

export function AchievementStats({
  total,
  unlocked,
  categories,
}: AchievementStatsProps) {
  const percent = ((unlocked / total) * 100).toFixed(0);

  return (
    <div className="bg-card rounded-lg p-6 border">
      <h3 className="text-lg font-semibold mb-4">Achievement Progress</h3>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Overall</span>
          <span className="text-muted-foreground">
            {unlocked} / {total} ({percent}%)
          </span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">By Category</h4>
        {Object.entries(categories).map(([category, count]) => (
          <div key={category} className="flex justify-between text-sm">
            <span className="capitalize">{category.replace(/_/g, " ")}</span>
            <span className="text-muted-foreground">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
