"use client";

import { motion } from "framer-motion";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center max-w-lg p-10 rounded-3xl border border-white/5 bg-white/[0.02]"
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Analytics Engine</h1>
        <p className="text-slate-400 mb-8">Compiling historical performance metrics. Data visualizer is offline for maintenance.</p>
        <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">
          Sync Telemetry Data
        </button>
      </motion.div>
    </div>
  );
}
