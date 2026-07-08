/**
 * Performance store — tracks device capability and adjusts quality.
 */

import { create } from "zustand";

export type PerformanceTier = "high" | "medium" | "low";

interface PerformanceState {
  tier: PerformanceTier;
  fps: number;
  dpr: number;
  particleCount: number;
  enablePostProcessing: boolean;
  isMobile: boolean;

  setTier: (tier: PerformanceTier) => void;
  setFps: (fps: number) => void;
  setIsMobile: (isMobile: boolean) => void;
  detectPerformance: () => void;
}

const TIER_CONFIG = {
  high: { dpr: 2, particleCount: 200, enablePostProcessing: true },
  medium: { dpr: 1.5, particleCount: 100, enablePostProcessing: false },
  low: { dpr: 1, particleCount: 50, enablePostProcessing: false },
} as const;

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  tier: "high",
  fps: 60,
  dpr: 2,
  particleCount: 200,
  enablePostProcessing: true,
  isMobile: false,

  setTier: (tier) => {
    const config = TIER_CONFIG[tier];
    set({ tier, ...config });
  },

  setFps: (fps) => {
    const state = get();
    set({ fps });

    // Auto-downgrade if sustained low FPS
    if (fps < 30 && state.tier !== "low") {
      state.setTier("low");
    } else if (fps < 50 && state.tier === "high") {
      state.setTier("medium");
    }
  },

  setIsMobile: (isMobile) => set({ isMobile }),

  detectPerformance: () => {
    if (typeof window === "undefined") return;

    const isMobile = window.innerWidth < 768;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;

    let tier: PerformanceTier = "high";
    if (isMobile || hardwareConcurrency <= 2 || deviceMemory <= 2) {
      tier = "low";
    } else if (hardwareConcurrency <= 4 || deviceMemory <= 4) {
      tier = "medium";
    }

    const config = TIER_CONFIG[tier];
    set({ tier, isMobile, ...config });
  },
}));
