"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SectionContainer, SectionHeader } from "@/components/ui/section";
import { TIMELINE_ITEMS } from "@/lib/constants";

export function WhySection() {
  return (
    <SectionContainer id="why">
      <SectionHeader
        label="Why InterviewOS"
        title="The Interview Prep Revolution"
        description="We're building the future of interview preparation. Here's why thousands of candidates trust InterviewOS."
      />

      <div className="relative max-w-3xl mx-auto">
        {/* Vertical timeline line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/50 via-rose-500/50 to-orange-500/50" aria-hidden="true" />

        {TIMELINE_ITEMS.map((item, index) => (
          <TimelineItem
            key={item.title}
            title={item.title}
            description={item.description}
            index={index}
            isLeft={index % 2 === 0}
          />
        ))}
      </div>
    </SectionContainer>
  );
}

interface TimelineItemProps {
  title: string;
  description: string;
  index: number;
  isLeft: boolean;
}

function TimelineItem({ title, description, index, isLeft }: TimelineItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={`relative flex items-start mb-12 last:mb-0 pl-12 md:pl-0 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Dot on timeline */}
      <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500 ring-4 ring-[#050816] z-10 top-1" />

      {/* Content */}
      <div className={`md:w-1/2 ${isLeft ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] p-6 hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-500">
          <span className="inline-block text-xs font-mono text-red-400 mb-2">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
