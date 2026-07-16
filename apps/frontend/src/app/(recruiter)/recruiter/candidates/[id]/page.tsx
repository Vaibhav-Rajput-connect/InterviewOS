"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Github,
  Linkedin,
  FileText,
  Star,
  Activity,
  Code,
  Brain,
  TrendingUp,
  Target,
  Zap,
  Calendar,
  Briefcase,
  GraduationCap,
  ChevronLeft,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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

const CANDIDATE = {
  id: "1",
  name: "Aarav Sharma",
  role: "Senior Frontend Engineer",
  location: "San Francisco, CA",
  email: "aarav@example.com",
  phone: "+1 (555) 123-4567",
  website: "aarav.dev",
  github: "github.com/aarav",
  linkedin: "linkedin.com/in/aarav",
  aiScore: 94,
  status: "Shortlisted",
  avatar: "A",

  aiSummary:
    "Aarav demonstrates exceptional proficiency in React and modern frontend architecture. His performance in the coding arena highlights strong problem-solving skills, particularly in optimizing rendering performance. He shows high coachability and rapid learning progress, making him an ideal fit for senior roles requiring independent architectural decisions.",

  strengths: ["React Performance Optimization", "System Architecture", "Mentorship", "Rapid Prototyping"],
  weaknesses: ["Deep Backend knowledge (Node.js)", "GraphQL API Design"],

  skills: [
    { name: "React / Next.js", score: 98 },
    { name: "TypeScript", score: 95 },
    { name: "System Design", score: 88 },
    { name: "CSS / Animations", score: 92 },
    { name: "Testing (Jest/Cypress)", score: 85 },
  ],

  experience: [
    {
      role: "Senior Frontend Engineer",
      company: "TechNova Inc.",
      date: "2023 - Present",
      description: "Lead the migration of a legacy monolithic SPA to a Next.js App Router architecture, improving LCP by 45%. Mentored a team of 4 junior developers.",
    },
    {
      role: "Frontend Developer",
      company: "Creative Solutions",
      date: "2020 - 2023",
      description: "Developed and maintained 15+ client websites using React and Tailwind CSS. Implemented complex data visualization dashboards.",
    },
  ],

  education: [
    {
      degree: "B.S. Computer Science",
      university: "University of California, Berkeley",
      date: "2016 - 2020",
    },
  ],

  interviews: [
    { type: "Technical Screen", date: "Jul 12, 2026", score: 95, feedback: "Excellent grasp of core JavaScript concepts and event loop." },
    { type: "System Design", date: "Jul 15, 2026", score: 89, feedback: "Solid component architecture. Could improve on state management tradeoffs." },
  ],

  codingPerformance: {
    totalProblems: 45,
    easy: 15,
    medium: 25,
    hard: 5,
    accuracy: "92%",
    timeComplexity: "Optimal in 85% of cases",
  },
};

// ─── Mini Radar Chart (CSS-based Mockup) ─────────────────────────────

function RadarChartMockup({ skills }: { skills: { name: string; score: number }[] }) {
  // A true radar chart requires SVG/Canvas. We will build a creative
  // concentric circle "spider web" mockup using CSS and Framer Motion.
  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center">
      {/* Webs */}
      {[20, 40, 60, 80, 100].map((radius, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-white/5"
          style={{ width: `${radius}%`, height: `${radius}%` }}
        />
      ))}

      {/* Axis Lines */}
      {skills.map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-[1px] bg-white/5"
          style={{ transform: `rotate(${(i * 360) / skills.length}deg)` }}
        />
      ))}

      {/* Data Points */}
      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
        <motion.polygon
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          points={skills
            .map((s, i) => {
              const angle = (Math.PI * 2 * i) / skills.length - Math.PI / 2;
              const radius = (s.score / 100) * 50;
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              return `${x},${y}`;
            })
            .join(" ")}
          fill="rgba(6, 182, 212, 0.2)"
          stroke="rgba(6, 182, 212, 0.8)"
          strokeWidth="1.5"
        />
        {skills.map((s, i) => {
          const angle = (Math.PI * 2 * i) / skills.length - Math.PI / 2;
          const radius = (s.score / 100) * 50;
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);
          return (
            <motion.circle
              key={i}
              initial={{ r: 0 }}
              animate={{ r: 2 }}
              transition={{ delay: 1 + i * 0.1 }}
              cx={x}
              cy={y}
              fill="#fff"
              className="drop-shadow-[0_0_4px_#22d3ee]"
            />
          );
        })}
      </svg>

      {/* Labels */}
      {skills.map((s, i) => {
        const angle = (Math.PI * 2 * i) / skills.length - Math.PI / 2;
        const radius = 62; // Push labels slightly outside
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        return (
          <div
            key={i}
            className="absolute text-[10px] text-slate-400 font-medium text-center w-20 -ml-10 -mt-2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {s.name}
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────

export default function CandidateProfilePage() {
  const router = useRouter();
  const params = useParams();

  // In production, fetch candidate data using params.id

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ═══════════════════════════ HEADER ═══════════════════════════ */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Candidate Profile</h1>
          <p className="text-slate-400 text-sm mt-0.5">ID: {params.id}</p>
        </div>
      </motion.div>

      {/* ════════════════════════ MAIN GRID ═══════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Identity & Skills */}
        <div className="space-y-6">
          
          {/* Identity Card */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full blur-2xl" />
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-500/30 flex items-center justify-center text-3xl font-bold text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)] mb-4">
                {CANDIDATE.avatar}
              </div>
              <h2 className="text-xl font-bold text-white">{CANDIDATE.name}</h2>
              <p className="text-cyan-400 text-sm font-medium">{CANDIDATE.role}</p>
              <span className="mt-3 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {CANDIDATE.status}
              </span>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                <Mail size={16} className="text-slate-500" /> {CANDIDATE.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                <Phone size={16} className="text-slate-500" /> {CANDIDATE.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                <MapPin size={16} className="text-slate-500" /> {CANDIDATE.location}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                <Globe size={16} className="text-slate-500" /> {CANDIDATE.website}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                <Github size={16} className="text-slate-500" /> {CANDIDATE.github}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                <Linkedin size={16} className="text-slate-500" /> {CANDIDATE.linkedin}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="glow" className="flex-1 !bg-gradient-to-r !from-cyan-600 !to-blue-600">
                Contact
              </Button>
              <Button variant="outline" className="flex-1 border-white/10 bg-white/[0.02]">
                <FileText size={16} className="mr-2" /> Resume
              </Button>
            </div>
          </motion.div>

          {/* AI Score & Skill Radar */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-emerald-400" />
                <h3 className="font-semibold text-white">AI Evaluation</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                <Star size={14} className="fill-emerald-400" />
                {CANDIDATE.aiScore}/100
              </div>
            </div>

            <RadarChartMockup skills={CANDIDATE.skills} />
            
            <div className="mt-8 space-y-3">
              {CANDIDATE.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{skill.name}</span>
                    <span className="text-cyan-400">{skill.score}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN: Insights & History */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* AI Coach Summary */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4">
              <Brain size={20} className="text-violet-400" />
              <h3 className="text-lg font-semibold text-white">AI Coach Summary</h3>
            </div>
            
            <p className="text-slate-300 leading-relaxed text-sm mb-6">
              {CANDIDATE.aiSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} className="text-emerald-400" />
                  <span className="font-semibold text-emerald-400 text-sm">Strengths</span>
                </div>
                <ul className="space-y-2">
                  {CANDIDATE.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-rose-400" />
                  <span className="font-semibold text-rose-400 text-sm">Areas for Growth</span>
                </div>
                <ul className="space-y-2">
                  {CANDIDATE.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coding Arena */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <Code size={18} className="text-blue-400" />
                <h3 className="font-semibold text-white">Coding Arena</h3>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{CANDIDATE.codingPerformance.totalProblems}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Solved</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-400">{CANDIDATE.codingPerformance.accuracy}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Accuracy</div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <span>Easy</span>
                  <span className="font-bold">{CANDIDATE.codingPerformance.easy}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <span>Medium</span>
                  <span className="font-bold">{CANDIDATE.codingPerformance.medium}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <span>Hard</span>
                  <span className="font-bold">{CANDIDATE.codingPerformance.hard}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center italic">
                &quot;{CANDIDATE.codingPerformance.timeComplexity}&quot;
              </p>
            </motion.div>

            {/* Interview History */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={18} className="text-cyan-400" />
                <h3 className="font-semibold text-white">Interview History</h3>
              </div>

              <div className="space-y-4">
                {CANDIDATE.interviews.map((interview, i) => (
                  <div key={i} className="relative pl-4 border-l border-white/10">
                    <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-white">{interview.type}</h4>
                      <span className="text-xs font-bold text-cyan-400">{interview.score}/100</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mb-2">{interview.date}</p>
                    <p className="text-xs text-slate-300 italic">&quot;{interview.feedback}&quot;</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Timeline (Experience & Education) */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
             <div className="flex items-center gap-2 mb-6">
                <Calendar size={18} className="text-amber-400" />
                <h3 className="font-semibold text-white">Timeline</h3>
              </div>

              <div className="space-y-8">
                {/* Experience */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Briefcase size={14} /> Experience
                  </h4>
                  <div className="space-y-6 ml-2">
                    {CANDIDATE.experience.map((exp, i) => (
                      <div key={i} className="relative pl-6 border-l border-white/10">
                        <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-white/20" />
                        <h5 className="text-sm font-semibold text-white">{exp.role}</h5>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                          <span className="text-cyan-400">{exp.company}</span>
                          <span>&bull;</span>
                          <span>{exp.date}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <GraduationCap size={14} /> Education
                  </h4>
                  <div className="space-y-6 ml-2">
                    {CANDIDATE.education.map((edu, i) => (
                      <div key={i} className="relative pl-6 border-l border-white/10">
                        <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-white/20" />
                        <h5 className="text-sm font-semibold text-white">{edu.degree}</h5>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                          <span className="text-amber-400">{edu.university}</span>
                          <span>&bull;</span>
                          <span>{edu.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
