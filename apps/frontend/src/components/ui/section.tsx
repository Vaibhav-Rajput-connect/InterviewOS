"use client";

import { type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations/variants";

// ============================================
// Section Container
// ============================================

interface SectionContainerProps {
  id?: string;
  children: ReactNode;
  className?: string;
  withGradient?: boolean;
}

export function SectionContainer({
  id,
  children,
  className,
  withGradient = false,
}: SectionContainerProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      id={id}
      ref={ref}
      className={cn("relative py-24 md:py-32", className)}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Optional gradient decoration */}
      {withGradient && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px]" />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {children}
      </div>
    </motion.section>
  );
}

// ============================================
// Section Header
// ============================================

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      className={cn("text-center max-w-2xl mx-auto mb-16", className)}
      variants={fadeInUp}
    >
      {label && (
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-red-400 mb-4 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-base md:text-lg text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}

// ============================================
// Animated Text Reveal
// ============================================

interface AnimatedTextProps {
  text: string;
  className?: string;
  gradient?: boolean;
}

export function AnimatedText({
  text,
  className,
  gradient = false,
}: AnimatedTextProps) {
  const words = text.split(" ");

  return (
    <motion.span
      className={cn("inline-flex flex-wrap justify-center gap-x-2", className)}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.06 },
        },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className={cn(
            "inline-block",
            gradient && "gradient-text"
          )}
          variants={{
            hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ============================================
// Scroll Indicator
// ============================================

export function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <span className="text-xs text-slate-500 uppercase tracking-widest">
        Scroll
      </span>
      <motion.div
        className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5"
        initial={{ opacity: 0.5 }}
      >
        <motion.div
          className="w-1 h-2 bg-white/50 rounded-full"
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// ============================================
// Badge / Pill
// ============================================

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "glow";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full",
        variant === "default" &&
          "bg-white/[0.06] text-slate-300 border border-white/[0.1]",
        variant === "glow" &&
          "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]",
        className
      )}
    >
      {children}
    </span>
  );
}
