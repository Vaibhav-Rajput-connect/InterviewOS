"use client";

import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardHover } from "@/lib/animations/variants";

// ============================================
// Glass Card
// ============================================

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "red" | "rose" | "orange" | "none";
}

const glowStyles = {
  red: "hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
  rose: "hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
  orange: "hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]",
  none: "",
} as const;

export function GlassCard({
  children,
  className,
  hover = true,
  glow = "red",
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-6 transition-all duration-500",
        hover && "hover:bg-white/[0.07] hover:border-white/[0.15]",
        glowStyles[glow],
        className
      )}
      variants={hover ? cardHover : undefined}
      initial={hover ? "rest" : undefined}
      whileHover={hover ? "hover" : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Feature Card
// ============================================

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient?: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <GlassCard
      className={cn("group flex flex-col gap-4", className)}
      glow="rose"
    >
      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/20 text-red-400 transition-colors duration-300 group-hover:from-red-500/30 group-hover:to-rose-500/30">
        {icon}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>

      {/* Subtle bottom gradient line */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </GlassCard>
  );
}

// ============================================
// Testimonial Card
// ============================================

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
  className?: string;
}

export function TestimonialCard({
  name,
  role,
  content,
  avatar,
  className,
}: TestimonialCardProps) {
  return (
    <GlassCard
      className={cn("flex flex-col gap-4 min-w-[320px] max-w-[400px]", className)}
      glow="orange"
    >
      {/* Quote */}
      <p className="text-sm text-slate-300 leading-relaxed italic">
        &ldquo;{content}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/[0.06]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-500 text-xs font-bold text-white">
          {avatar}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-slate-400">{role}</p>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// Stat Card
// ============================================

interface StatCardProps {
  value: string;
  label: string;
  className?: string;
}

export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
        {value}
      </div>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
