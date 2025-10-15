"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface LogoWithBackgroundProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-[37px] w-[37px]',
  md: 'h-[53px] w-[53px]', 
  lg: 'h-[69px] w-[69px]',
  xl: 'h-[85px] w-[85px]'
}

const logoSizeClasses = {
  sm: 'h-[29px] w-[29px]',
  md: 'h-[41px] w-[41px]',
  lg: 'h-[53px] w-[53px]', 
  xl: 'h-[69px] w-[69px]'
}

export function LogoWithBackground({ size = 'md', className }: LogoWithBackgroundProps) {
  return (
    <div className={cn(
      'relative inline-flex items-center justify-center rounded-xl overflow-hidden',
      sizeClasses[size],
      className
    )}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/30 to-primary/40 dark:from-primary/30 dark:via-primary/40 dark:to-primary/50" />
      
      {/* Inner glow effect */}
      <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 dark:to-transparent" />
      
      {/* Logo */}
      <picture className={cn('relative z-10', logoSizeClasses[size])}>
        <source 
          srcSet="/mindbridge-logo.png" 
          media="(prefers-color-scheme: dark)" 
        />
        <img 
          src="/mindbridge-logo.png" 
          alt="MindBridge Logo" 
          className={cn(
            'drop-shadow-sm',
            logoSizeClasses[size]
          )}
        />
      </picture>
    </div>
  )
}