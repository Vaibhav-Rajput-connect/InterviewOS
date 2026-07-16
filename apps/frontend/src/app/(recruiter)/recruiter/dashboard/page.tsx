"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  UserPlus,
  Shield,
  Crown,
  Eye,
  Globe,
  Mail,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Activity,
  Calendar,
  Video,
  FileText,
  Star,
  Zap,
  Target,
  BarChart3,
  CircleDot,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useRecruiterStore, TeamMember } from "@/stores/recruiter-store";

// ─── Mock Data ───────────────────────────────────────────────────────
// In production, these would come from the backend API.

const PIPELINE_STAGES = [
  { label: "Applied", count: 34, color: "bg-slate-500", glow: "shadow-slate-500/20" },
  { label: "Screening", count: 18, color: "bg-cyan-500", glow: "shadow-cyan-500/20" },
  { label: "Interview", count: 12, color: "bg-blue-500", glow: "shadow-blue-500/20" },
  { label: "Assessment", count: 7, color: "bg-violet-500", glow: "shadow-violet-500/20" },
  { label: "Offer", count: 3, color: "bg-emerald-500", glow: "shadow-emerald-500/20" },
  { label: "Hired", count: 2, color: "bg-amber-500", glow: "shadow-amber-500/20" },
];

const TOP_CANDIDATES = [
  { name: "Aarav Sharma", role: "Senior Frontend Engineer", score: 94, avatar: "A", trend: "up" },
  { name: "Priya Patel", role: "Full Stack Developer", score: 91, avatar: "P", trend: "up" },
  { name: "Rahul Mehta", role: "Backend Engineer", score: 88, avatar: "R", trend: "stable" },
  { name: "Sneha Kumar", role: "ML Engineer", score: 86, avatar: "S", trend: "up" },
  { name: "Vikram Singh", role: "DevOps Engineer", score: 83, avatar: "V", trend: "down" },
];

const RECENT_ACTIVITY = [
  { action: "New application received", candidate: "Aarav Sharma", time: "2 min ago", icon: FileText, color: "text-cyan-400" },
  { action: "Interview completed", candidate: "Priya Patel", time: "1 hr ago", icon: Video, color: "text-emerald-400" },
  { action: "Assessment submitted", candidate: "Rahul Mehta", time: "3 hrs ago", icon: CheckCircle2, color: "text-violet-400" },
  { action: "Offer extended", candidate: "Sneha Kumar", time: "5 hrs ago", icon: Star, color: "text-amber-400" },
  { action: "Screening scheduled", candidate: "Vikram Singh", time: "1 day ago", icon: Calendar, color: "text-blue-400" },
];

const UPCOMING_INTERVIEWS = [
  { candidate: "Aarav Sharma", role: "Sr. Frontend Engineer", time: "Today, 2:00 PM", type: "Technical", avatar: "A" },
  { candidate: "Priya Patel", role: "Full Stack Developer", time: "Today, 4:30 PM", type: "System Design", avatar: "P" },
  { candidate: "Rahul Mehta", role: "Backend Engineer", time: "Tomorrow, 10:00 AM", type: "Behavioral", avatar: "R" },
];

const WEEKLY_DATA = [
  { day: "Mon", applications: 8, interviews: 3 },
  { day: "Tue", applications: 12, interviews: 5 },
  { day: "Wed", applications: 6, interviews: 2 },
  { day: "Thu", applications: 15, interviews: 7 },
  { day: "Fri", applications: 10, interviews: 4 },
  { day: "Sat", applications: 3, interviews: 1 },
  { day: "Sun", applications: 2, interviews: 0 },
];

// ─── Role helpers ────────────────────────────────────────────────────

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Crown size={14} className="text-amber-400" />,
  admin: <Shield size={14} className="text-cyan-400" />,
  recruiter: <Briefcase size={14} className="text-blue-400" />,
  viewer: <Eye size={14} className="text-slate-400" />,
};

const roleBadgeColors: Record<string, string> = {
  owner: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  admin: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  recruiter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  viewer: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

// ─── Animation variants ─────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

// ─── Tiny sparkline chart (pure CSS/div) ─────────────────────────────

function MiniBarChart({ data, barColor }: { data: number[]; barColor: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px] h-10">
      {data.map((v, i) => (
        <motion.div
          key={i}
          className={`w-[6px] rounded-full ${barColor}`}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function RecruiterDashboardPage() {
  const { user } = useAuthStore();
  const { organization, orgRole, members, fetchOrganization, fetchMembers, isLoading } = useRecruiterStore();
  const [hasFetched, setHasFetched] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!hasFetched) {
      fetchOrganization();
      fetchMembers();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasFetched(true);
    }
  }, [hasFetched, fetchOrganization, fetchMembers]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, [currentTime]);

  const pipelineTotal = useMemo(() => PIPELINE_STAGES.reduce((s, p) => s + p.count, 0), []);

  if (isLoading && !organization) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ═══════════════════════════ HEADER ═══════════════════════════ */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            {greeting}, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.full_name?.split(" ")[0]}</span>
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <Building2 size={14} />
            {organization?.name || "Your Organization"} &middot; Hiring Command Center
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live system status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CircleDot size={12} className="text-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono">SYSTEMS_ONLINE</span>
          </div>
          {orgRole && (
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${roleBadgeColors[orgRole] || roleBadgeColors.viewer}`}>
              {roleIcons[orgRole]} {orgRole.charAt(0).toUpperCase() + orgRole.slice(1)}
            </span>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════ STAT CARDS ═══════════════════════════ */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Candidates", value: 76, change: "+12%", up: true, icon: Users, color: "from-cyan-500 to-blue-500", sparkData: [4, 7, 5, 9, 12, 8, 14], sparkColor: "bg-cyan-400" },
          { label: "Active Interviews", value: 12, change: "+3", up: true, icon: Video, color: "from-violet-500 to-purple-500", sparkData: [2, 3, 1, 4, 5, 3, 6], sparkColor: "bg-violet-400" },
          { label: "Pending Reviews", value: 8, change: "-2", up: false, icon: FileText, color: "from-amber-500 to-orange-500", sparkData: [6, 5, 7, 4, 3, 5, 2], sparkColor: "bg-amber-400" },
          { label: "Offers Extended", value: 3, change: "+1", up: true, icon: Star, color: "from-emerald-500 to-green-500", sparkData: [0, 1, 0, 1, 2, 1, 3], sparkColor: "bg-emerald-400" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="group p-5 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl hover:border-white/20 transition-all duration-300 relative overflow-hidden"
          >
            {/* Subtle glow on hover */}
            <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

            <div className="relative flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <MiniBarChart data={stat.sparkData} barColor={stat.sparkColor} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-emerald-400" : "text-rose-400"}`}>
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══════════════════ PIPELINE + ANALYTICS ═════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hiring Pipeline */}
        <motion.div variants={itemVariants} className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Hiring Pipeline</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">{pipelineTotal} TOTAL</span>
          </div>

          {/* Pipeline funnel visualization */}
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage, i) => {
              const pct = pipelineTotal > 0 ? (stage.count / pipelineTotal) * 100 : 0;
              return (
                <div key={stage.label} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-300">{stage.label}</span>
                    <span className="text-sm font-semibold text-white">{stage.count}</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${stage.color} shadow-md ${stage.glow}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Weekly Hiring Analytics (mini bar chart) */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Weekly Analytics</h2>
          </div>

          <div className="flex items-end justify-between gap-2 h-36 mb-4">
            {WEEKLY_DATA.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-[2px]" style={{ height: "120px", justifyContent: "flex-end", display: "flex" }}>
                  <motion.div
                    className="w-full max-w-[18px] rounded-t-md bg-gradient-to-t from-cyan-500/80 to-cyan-400/40"
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.applications / 16) * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                  />
                  <motion.div
                    className="w-full max-w-[18px] rounded-t-md bg-gradient-to-t from-violet-500/80 to-violet-400/40"
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.interviews / 16) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
              Applications
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-violet-500" />
              Interviews
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════ TOP CANDIDATES + ACTIVITY + INTERVIEWS ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Candidates */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Top Candidates</h2>
          </div>

          <div className="space-y-3">
            {TOP_CANDIDATES.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-sm font-bold text-cyan-400">
                    {c.avatar}
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">{c.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{c.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{c.score}</p>
                  <p className={`text-[10px] ${c.trend === "up" ? "text-emerald-400" : c.trend === "down" ? "text-rose-400" : "text-slate-500"}`}>
                    {c.trend === "up" ? "↑" : c.trend === "down" ? "↓" : "—"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={18} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>

          <div className="space-y-4">
            {RECENT_ACTIVITY.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className={`w-8 h-8 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center flex-shrink-0 ${a.color}`}>
                  <a.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200">{a.action}</p>
                  <p className="text-xs text-slate-500">{a.candidate} &middot; {a.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Interviews */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Upcoming Interviews</h2>
          </div>

          <div className="space-y-3">
            {UPCOMING_INTERVIEWS.map((interview, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                    {interview.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">{interview.candidate}</p>
                    <p className="text-[11px] text-slate-500 truncate">{interview.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={11} />
                    {interview.time}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {interview.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══════════════ ORG CARD + TEAM + SYSTEM STATUS ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Profile Card */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{organization?.name || "—"}</h2>
              <p className="text-xs text-slate-500 font-mono">/{organization?.slug || "—"}</p>
            </div>
          </div>

          <div className="relative space-y-3">
            {organization?.website && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Globe size={14} className="text-slate-500" />
                <span className="truncate">{organization.website}</span>
              </div>
            )}
            {organization?.industry && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Briefcase size={14} className="text-slate-500" />
                <span>{organization.industry}</span>
              </div>
            )}
            {organization?.size && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Users size={14} className="text-slate-500" />
                <span>{organization.size} employees</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Team Members */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Team</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">{members.length} ACTIVE</span>
          </div>

          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">No team members yet.</p>
              <p className="text-slate-500 text-xs mt-1">Invite your team to get started.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {members.slice(0, 5).map((member: TeamMember) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                      {member.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{member.full_name}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Mail size={9} /> {member.email}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 ${roleBadgeColors[member.role] || roleBadgeColors.viewer}`}>
                    {roleIcons[member.role]}
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* System Status */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">System Status</h2>
          </div>

          <div className="space-y-4">
            {[
              { name: "AI Interview Engine", status: "Operational", ok: true },
              { name: "Resume Scanner", status: "Operational", ok: true },
              { name: "Coding Arena", status: "Operational", ok: true },
              { name: "AI Coach", status: "Operational", ok: true },
              { name: "Vector Database", status: "Operational", ok: true },
              { name: "Analytics Engine", status: "Operational", ok: true },
            ].map((sys) => (
              <div key={sys.name} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{sys.name}</span>
                <div className="flex items-center gap-1.5">
                  <CircleDot size={10} className={sys.ok ? "text-emerald-400" : "text-rose-400"} />
                  <span className={`text-xs font-mono ${sys.ok ? "text-emerald-400" : "text-rose-400"}`}>
                    {sys.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Last updated</span>
              <span className="text-slate-400 font-mono">
                {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
