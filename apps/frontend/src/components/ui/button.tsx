"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// Button Variants
// ============================================

const buttonVariants = {
  primary:
    "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]",
  secondary:
    "bg-white/[0.06] text-white border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.2]",
  ghost:
    "bg-transparent text-slate-300 hover:text-white hover:bg-white/[0.06]",
  outline:
    "bg-transparent text-white border border-white/[0.15] hover:bg-white/[0.06] hover:border-white/[0.25]",
  glow: "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]",
} as const;

const buttonSizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
} as const;

// ============================================
// Button Component
// ============================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  children: ReactNode;
  className?: string;
  magnetic?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      className,
      magnetic = true,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        whileHover={magnetic ? { scale: 1.03 } : undefined}
        whileTap={{ scale: 0.97 }}
        {...(props as HTMLMotionProps<"button">)}
      >
        {/* Ripple overlay */}
        <span className="absolute inset-0 overflow-hidden rounded-xl">
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.07] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </span>
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";
