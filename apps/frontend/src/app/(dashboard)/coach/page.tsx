"use client";

import { motion } from "framer-motion";

export default function AICoachPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center max-w-lg p-10 rounded-3xl border border-white/5 bg-white/[0.02]"
      >
        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-5.224 4.668ab4.3 4.3 0 0 0-.204 2.103 4 4 0 0 0 3.14 4.035 4 4 0 0 0 5.424 2.946 5.6 5.6 0 0 0 2.651 2.292 5.5 5.5 0 0 0 5.474-.823 4 4 0 0 0 3.256-4.526 4 4 0 0 0-2.825-4.49 4 4 0 0 0-2.825-4.49 4 4 0 0 0-3.324-1.842v.002Z"/><path d="M8.92 8.92c1.782-1.782 4.38-2.38 6.643-1.464M15 15l2-2"/><path d="M9 15l-2 2"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">AI Coach</h1>
        <p className="text-slate-400 mb-8">Your dedicated AI mentor is currently reviewing your telemetry. Feedback cycles will resume shortly.</p>
        <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">
          Force Analysis Run
        </button>
      </motion.div>
    </div>
  );
}
