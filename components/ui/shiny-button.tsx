"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ShinyButtonProps = Omit<HTMLMotionProps<"button">, 'children'> & {
  children: React.ReactNode;
  className?: string;
};

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ children, className, ...props }, ref) => {
    // Check if custom background is provided
    const hasCustomBg = className?.includes('bg-') || className?.includes('from-') || className?.includes('to-');
    
    return (
      <motion.button
        ref={ref}
        initial={{ "--x": "100%", scale: 0.8 } as any}
        animate={{ "--x": "-100%", scale: 1 } as any}
        whileTap={{ scale: 0.95 }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 1,
          type: "spring",
          stiffness: 20,
          damping: 15,
          mass: 2,
          scale: {
            type: "spring",
            stiffness: 200,
            damping: 5,
            mass: 0.5,
          },
        }}
        className={cn(
          "relative rounded-md h-9 px-4 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out inline-flex items-center justify-center gap-2 whitespace-nowrap",
          // Only apply default colors if no custom background is provided
          !hasCustomBg && "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20",
          "shadow-md hover:shadow-[0_0_20px_hsl(var(--primary)/20%)]",
          "disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        <span
          className="relative flex items-center justify-center gap-2 text-sm font-medium z-20"
          style={{
            maskImage:
              "linear-gradient(-75deg,hsl(var(--primary-foreground)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--primary-foreground)) calc(var(--x) + 100%))",
          }}
        >
          {children}
        </span>
        <span
          style={{
            mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
            maskComposite: "exclude",
          }}
          className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,hsl(var(--primary)/10%)_calc(var(--x)+20%),hsl(var(--primary)/50%)_calc(var(--x)+25%),hsl(var(--primary)/10%)_calc(var(--x)+100%))] p-px"
        ></span>
      </motion.button>
    );
  }
);

ShinyButton.displayName = "ShinyButton";

export default ShinyButton;
