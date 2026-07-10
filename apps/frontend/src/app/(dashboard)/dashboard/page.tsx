"use client";

import { motion } from "framer-motion";
import { AICoreScene } from "@/components/three/ai-core-scene";
import { StatCard } from "@/components/dashboard/widgets/stat-card";
import { 
  TargetIcon, 
  TrendingUpIcon, 
  AwardIcon, 
  ClockIcon, 
  TerminalIcon 
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 h-full w-full">
      
      {/* Header */}
      <motion.header 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Command Center
          </h1>
          <p className="text-slate-400 mt-1">AI Systems Online. All telemetry nominal.</p>
        </div>
        
        {/* Profile / Notifications placeholder */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
            <span className="text-sm font-bold text-white">VR</span>
          </div>
        </div>
      </motion.header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Stats & Analytics */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          <StatCard
            title="Readiness Score"
            value="87%"
            subtitle="Top 15% of candidates"
            icon={<TargetIcon />}
            trend={{ value: 4, isPositive: true }}
            delay={0.1}
          />
          <StatCard
            title="Interview Streak"
            value="5 Days"
            icon={<TrendingUpIcon />}
            delay={0.2}
          />
          <StatCard
            title="Experience Points"
            value="14,200 XP"
            icon={<AwardIcon />}
            delay={0.3}
          />
          <StatCard
            title="Next Interview"
            value="System Design"
            subtitle="Tomorrow, 10:00 AM"
            icon={<ClockIcon />}
            delay={0.4}
          />
        </div>

        {/* Center Column: AI Core */}
        <div className="lg:col-span-6 relative rounded-3xl border border-white/5 bg-black/40 overflow-hidden shadow-2xl flex items-center justify-center group">
          <div className="absolute top-6 left-6 z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuitIcon className="text-red-500" size={24} />
              AI Coach
            </h2>
            <p className="text-sm text-slate-400 mt-1">Analyzing your previous mock interview...</p>
          </div>
          
          <div className="absolute inset-0 pointer-events-auto">
            <AICoreScene />
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-10">
            <motion.div 
              className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 animate-pulse" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white">Suggestion:</span> Your explanation of the Paxos consensus algorithm was solid, but you should practice explaining edge cases regarding network partitions.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Activity & Goals */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          
          {/* Daily Goals */}
          <motion.div 
            className="p-6 rounded-3xl border border-white/5 bg-white/[0.02]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Daily Objectives</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <TerminalIcon className="text-slate-400" size={18} />
                  <span className="text-sm font-medium text-slate-200">Solve 2 Leetcode</span>
                </div>
                <span className="text-xs font-bold text-red-400">1/2</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <VideoIcon className="text-green-400" size={18} />
                  <span className="text-sm font-medium text-green-100">Mock Interview</span>
                </div>
                <span className="text-xs font-bold text-green-400">Done</span>
              </div>
            </div>
          </motion.div>

          {/* Activity Timeline Placeholder */}
          <motion.div 
            className="flex-1 p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-12 h-12 rounded-full border border-dashed border-slate-600 flex items-center justify-center mb-3">
              <ClockIcon className="text-slate-500" size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-300">No recent activity</h3>
            <p className="text-xs text-slate-500 mt-1">Start a mock interview to see telemetry.</p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// Temporary icon to avoid import error above
function BrainCircuitIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-5.224 4.668ab4.3 4.3 0 0 0-.204 2.103 4 4 0 0 0 3.14 4.035 4 4 0 0 0 5.424 2.946 5.6 5.6 0 0 0 2.651 2.292 5.5 5.5 0 0 0 5.474-.823 4 4 0 0 0 3.256-4.526 4 4 0 0 0-2.825-4.49 4 4 0 0 0-2.825-4.49 4 4 0 0 0-3.324-1.842v.002Z" />
      <path d="M8.92 8.92c1.782-1.782 4.38-2.38 6.643-1.464M15 15l2-2" />
      <path d="M9 15l-2 2" />
    </svg>
  );
}
function VideoIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}
