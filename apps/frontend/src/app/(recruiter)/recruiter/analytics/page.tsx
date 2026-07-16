"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Target,
  Award,
  BarChart3,
  Calendar,
  Filter,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

// ─── Lazy Loaded Recharts ────────────────────────────────────────────

const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const RechartsTooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const RadarChart = dynamic(() => import("recharts").then(mod => mod.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import("recharts").then(mod => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import("recharts").then(mod => mod.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import("recharts").then(mod => mod.PolarRadiusAxis), { ssr: false });
const Radar = dynamic(() => import("recharts").then(mod => mod.Radar), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });

// ─── Animation Variants ──────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

// ─── Mock Data ───────────────────────────────────────────────────────

const TRENDS_DATA = [
  { month: "Jan", applications: 400, offers: 24, hires: 18 },
  { month: "Feb", applications: 300, offers: 18, hires: 12 },
  { month: "Mar", applications: 550, offers: 35, hires: 25 },
  { month: "Apr", applications: 480, offers: 28, hires: 20 },
  { month: "May", applications: 600, offers: 42, hires: 30 },
  { month: "Jun", applications: 750, offers: 55, hires: 42 },
];

const FUNNEL_DATA = [
  { stage: "Sourced", count: 1000, color: "#94a3b8" }, // slate-400
  { stage: "Applied", count: 750, color: "#38bdf8" }, // sky-400
  { stage: "Screened", count: 400, color: "#818cf8" }, // indigo-400
  { stage: "Interviewed", count: 150, color: "#a78bfa" }, // violet-400
  { stage: "Offered", count: 45, color: "#2dd4bf" }, // teal-400
  { stage: "Hired", count: 32, color: "#34d399" }, // emerald-400
];

const SKILL_DATA = [
  { subject: "React/Next.js", A: 85, fullMark: 100 },
  { subject: "System Design", A: 65, fullMark: 100 },
  { subject: "Algorithms", A: 70, fullMark: 100 },
  { subject: "Communication", A: 90, fullMark: 100 },
  { subject: "Cloud/DevOps", A: 55, fullMark: 100 },
  { subject: "Databases", A: 75, fullMark: 100 },
];

const DEPT_DATA = [
  { name: "Engineering", active: 45, hired: 120 },
  { name: "Product", active: 15, hired: 45 },
  { name: "Design", active: 8, hired: 30 },
  { name: "Marketing", active: 12, hired: 40 },
  { name: "Sales", active: 25, hired: 85 },
];

// ─── Custom Tooltips ─────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number | string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 shadow-xl">
        <p className="text-white font-bold mb-2">{label}</p>
        {payload.map((entry: { color: string; name: string; value: number | string }, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 capitalize">{entry.name}</span>
            </div>
            <span className="font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Component ───────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("6M");

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-12">
      
      {/* ═══════════════════════════ HEADER ═══════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">AI-driven insights into your hiring pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-white/[0.02] border border-white/10">
            {["1M", "3M", "6M", "1Y", "ALL"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  timeframe === tf
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <Button variant="outline" className="border-white/10 text-white bg-white/[0.02]">
            <Filter size={16} className="mr-2" /> Filters
          </Button>
        </div>
      </div>

      {/* ════════════════════════ KEY METRICS ═════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Acceptance Rate", value: "71.1%", trend: "+5.2%", icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { title: "Interview Success", value: "48.3%", trend: "+2.1%", icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
          { title: "Avg AI Score", value: "86/100", trend: "+1.5", icon: Award, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
          { title: "Time to Hire", value: "18 Days", trend: "-3 Days", icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        ].map((metric, i) => (
          <motion.div key={i} variants={itemVariants} className="p-5 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-lg relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${metric.bg} rounded-bl-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${metric.bg} ${metric.border} border`}>
                <metric.icon size={18} className={metric.color} />
              </div>
              <h3 className="text-sm font-medium text-slate-400">{metric.title}</h3>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className={`text-xs font-bold ${metric.trend.startsWith("+") || metric.trend.startsWith("-3") ? "text-emerald-400" : "text-rose-400"} flex items-center`}>
                {metric.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ════════════════════════ HIRING TRENDS ═══════════════════════ */}
      <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" />
            <h3 className="font-semibold text-white">Hiring Trends</h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={TRENDS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="applications" name="Applications" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
            <Area type="monotone" dataKey="hires" name="Hires" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHires)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ════════════════════════ SECOND ROW ══════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        
        {/* Hiring Funnel */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6 shrink-0">
            <BarChart3 size={18} className="text-violet-400" />
            <h3 className="font-semibold text-white">Hiring Funnel</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                <Bar dataKey="count" name="Candidates" radius={[0, 4, 4, 0]} barSize={24}>
                  {FUNNEL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skill Distribution */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2 shrink-0">
            <Target size={18} className="text-fuchsia-400" />
            <h3 className="font-semibold text-white">Candidate Skill Distribution</h3>
          </div>
          <div className="flex-1 min-h-0 relative -mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILL_DATA}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Radar name="Average Score" dataKey="A" stroke="#c084fc" fill="#c084fc" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ════════════════════════ THIRD ROW ═══════════════════════════ */}
      <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-400" />
            <h3 className="font-semibold text-white">Department Statistics</h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DEPT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
            <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
            <Bar dataKey="active" name="Active Interviews" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="hired" name="Total Hired" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

    </motion.div>
  );
}
