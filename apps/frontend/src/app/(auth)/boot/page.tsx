"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogoIcon } from "@/components/ui/icons";

const BOOT_SEQUENCE = [
  "Initializing Neural Core...",
  "Loading AI Engine...",
  "Securing Environment...",
  "Connecting Intelligence Network...",
  "Loading User Modules...",
  "Boot Complete.",
];

export default function BootPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const startTime = Date.now();
    const duration = 3000; // 3 seconds total boot time
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);
      
      // Update text steps based on progress
      const stepIndex = Math.floor((p / 100) * BOOT_SEQUENCE.length);
      if (stepIndex < BOOT_SEQUENCE.length) {
        setCurrentStep(stepIndex);
      }

      if (p >= 100) {
        clearInterval(progressInterval);
        // Navigate to login after a brief pause
        setTimeout(() => {
          router.push("/login");
        }, 800);
      }
    }, 50);

    return () => {
      clearInterval(progressInterval);
    };
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0,transparent_50%)]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-md w-full"
      >
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-red-500 blur-[40px] opacity-20 rounded-full animate-pulse-glow" />
          <LogoIcon size={80} className="relative z-10 text-white" />
        </div>

        <h1 className="text-2xl font-display font-bold text-white mb-2 tracking-wide">
          InterviewOS <span className="text-red-500 font-mono text-sm ml-2">v1.0</span>
        </h1>
        
        {/* Terminal output */}
        <div className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-4 font-mono text-xs text-slate-400 min-h-[120px] flex flex-col justify-end overflow-hidden mt-8 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          {BOOT_SEQUENCE.slice(0, currentStep + 1).map((text, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={idx === currentStep ? "text-red-400 font-semibold" : "opacity-50"}
            >
              <span className="text-slate-600 mr-2">{">"}</span> {text}
            </motion.div>
          ))}
          <div className="mt-1 flex items-center h-4">
            {currentStep < BOOT_SEQUENCE.length - 1 && (
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-3 bg-red-500"
              />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-orange-500 to-red-600"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>
    </div>
  );
}
