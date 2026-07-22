"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollIndicator } from "@/components/ui/section";
import { ArrowRightIcon } from "@/components/ui/icons";

export function HeroSection() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-6 drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]"
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Now in Public Beta
          </span>
        </motion.div>

        {/* Background glow to ensure contrast against 3D crystal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-black/60 blur-[100px] rounded-full pointer-events-none -z-10" />

        {/* Headline */}
        <h1 className="relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] font-[family-name:var(--font-display)] tracking-tight">
          <motion.span
            className="inline-block text-white"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Master
          </motion.span>{" "}
          <motion.span
            className="inline-block gradient-text"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Every Interview
          </motion.span>
          <br />
          <motion.span
            className="inline-block text-white"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            with AI.
          </motion.span>
        </h1>

        {/* Subheading */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-[0_0_16px_rgba(0,0,0,0.8)] font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          The AI-powered operating system that prepares you for any interview.
          Practice with intelligent mock interviews, ace coding challenges, and
          get real-time coaching — all in one platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <Link href="/boot">
            <Button size="lg" variant="glow">
              Launch InterviewOS
              <ArrowRightIcon size={18} />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  );
}
