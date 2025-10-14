"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPBarProps {
  currentXP: number;
  xpForNextLevel: number;
  level: number;
  totalXP: number;
  className?: string;
  showDetails?: boolean;
  animated?: boolean;
}

export function XPBar({
  currentXP,
  xpForNextLevel,
  level,
  totalXP,
  className,
  showDetails = true,
  animated = true,
}: XPBarProps) {
  const [displayXP, setDisplayXP] = useState(0);
  const progressPercent = (currentXP / xpForNextLevel) * 100;

  // Animate XP counter
  useEffect(() => {
    if (!animated) {
      setDisplayXP(currentXP);
      return;
    }

    const duration = 1000;
    const steps = 60;
    const increment = currentXP / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(currentXP, current + increment);
      setDisplayXP(Math.floor(current));

      if (step >= steps || current >= currentXP) {
        clearInterval(timer);
        setDisplayXP(currentXP);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentXP, animated]);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Level & XP Display */}
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Level {level}</span>
            </div>
            <span className="text-muted-foreground">
              {displayXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
            </span>
          </div>
          <div className="text-muted-foreground">
            {progressPercent.toFixed(0)}%
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        {/* Background Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Progress Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{
            duration: animated ? 1 : 0,
            ease: "easeOut",
          }}
        >
          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Milestone Markers (every 25%) */}
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-0 bottom-0 w-px bg-background/30"
            style={{ left: `${milestone}%` }}
          />
        ))}
      </div>

      {/* Total XP Badge */}
      {showDetails && (
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          <span>{totalXP.toLocaleString()} Total XP</span>
        </div>
      )}
    </div>
  );
}

interface XPGainPopupProps {
  amount: number;
  source: string;
  multiplier?: number;
  onComplete?: () => void;
}

export function XPGainPopup({
  amount,
  source,
  multiplier = 1,
  onComplete,
}: XPGainPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 25,
      }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 py-3 rounded-lg shadow-2xl border-2 border-primary/20">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.2, 1.2, 1.2, 1],
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <Zap className="w-6 h-6 fill-current" />
          </motion.div>

          <div>
            <div className="font-bold text-lg">
              +{amount} XP
              {multiplier > 1 && (
                <span className="ml-2 text-sm opacity-80">
                  (×{multiplier.toFixed(1)})
                </span>
              )}
            </div>
            <div className="text-xs opacity-80 capitalize">
              {source.replace(/_/g, " ")}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface LevelUpModalProps {
  newLevel: number;
  rewards?: {
    bonusXP?: number;
    xpBoost?: { multiplier: number; duration: number };
    streakFreeze?: number;
  };
  onClose: () => void;
}

export function LevelUpModal({ newLevel, rewards, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 100 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="bg-gradient-to-br from-primary/20 via-background to-primary/10 p-8 rounded-2xl shadow-2xl border-2 border-primary/30 max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Celebration Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full"
                initial={{
                  x: "50%",
                  y: "50%",
                  opacity: 1,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  opacity: 0,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.05,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          <div className="text-center space-y-4 relative">
            {/* Icon */}
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.2, 1.2, 1.2, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="inline-block text-6xl"
            >
              🎉
            </motion.div>

            {/* Level Up Text */}
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Level Up!
              </h2>
              <p className="text-5xl font-black text-primary mt-2">
                Level {newLevel}
              </p>
            </div>

            {/* Rewards */}
            {rewards && (
              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-sm text-muted-foreground">
                  Rewards Unlocked:
                </p>
                <div className="space-y-1 text-sm">
                  {rewards.bonusXP && (
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>+{rewards.bonusXP} Bonus XP</span>
                    </div>
                  )}
                  {rewards.xpBoost && (
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>
                        {rewards.xpBoost.multiplier}x XP Boost (24hrs)
                      </span>
                    </div>
                  )}
                  {rewards.streakFreeze && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">🛡️</span>
                      <span>{rewards.streakFreeze} Streak Freezes</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function XPMultiplierBadge({
  multiplier,
  expiresAt,
}: {
  multiplier: number;
  expiresAt?: number;
}) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-bold rounded-full shadow-lg"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        ⚡
      </motion.div>
      <span>{multiplier}x XP</span>
      {timeLeft && <span className="text-xs opacity-80">({timeLeft})</span>}
    </motion.div>
  );
}
