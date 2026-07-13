"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/cards";
import apiClient from "@/lib/api-client";
import { 
  Building, 
  Briefcase, 
  GraduationCap, 
  Trophy, 
  Clock, 
  Mic, 
  Code, 
  MessageSquare, 
  Cpu, 
  Zap 
} from "lucide-react";

export default function InterviewConfigurationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<Record<string, unknown>[]>([]);

  // Form State
  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
  const [difficulty, setDifficulty] = useState("Medium");
  const [interviewType, setInterviewType] = useState("Behavioral");
  const [duration, setDuration] = useState("30");
  
  useEffect(() => {
    // Fetch resumes to get the latest one
    apiClient.get("/resume").then((res) => {
      setResumes(res.data);
    }).catch(() => {
      // Ignore error silently (e.g. 401 if logged out) to avoid Next.js overlay
    });
  }, []);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resumes.length === 0) {
      alert("Please upload a resume first before starting an interview.");
      return;
    }
    
    setLoading(true);
    
    try {
      const latestResumeId = resumes[0].id;
      const res = await apiClient.post("/interview/start", {
        resume_id: latestResumeId,
        target_company: targetCompany,
        target_role: targetRole,
        difficulty: difficulty,
        interview_type: interviewType,
        duration_minutes: parseInt(duration, 10)
      });
      
      const sessionId = res.data.id;
      router.push(`/interview/${sessionId}`);
    } catch (error) {
      console.error("Failed to start interview", error);
      alert("Failed to start interview. Please try again.");
      setLoading(false);
    }
  };

  const types = [
    { id: "Behavioral", icon: <MessageSquare className="w-5 h-5" />, label: "Behavioral" },
    { id: "Technical", icon: <Cpu className="w-5 h-5" />, label: "Technical" },
    { id: "System Design", icon: <Building className="w-5 h-5" />, label: "System Design" },
    { id: "Coding", icon: <Code className="w-5 h-5" />, label: "Coding" },
    { id: "Mixed", icon: <Zap className="w-5 h-5" />, label: "Mixed" },
  ];

  const difficulties = ["Easy", "Medium", "Hard", "FAANG"];
  const experiences = ["Internship", "Entry-Level", "Mid-Level", "Senior", "Staff/Principal"];
  const durations = ["15", "30", "45", "60"];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto pb-12 pt-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Configure Interview</h1>
        <p className="text-slate-400">Tailor the AI simulator to match your upcoming real-world interview.</p>
      </motion.div>

      <form onSubmit={handleStartInterview}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Role & Target */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-red-400" />
                Target Position
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Target Company</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Google, Stripe, Meta" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Target Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Senior Frontend Engineer" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Mic className="w-5 h-5 text-red-400" />
                Interview Type
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {types.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setInterviewType(type.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                      interviewType === type.id 
                        ? "bg-red-500/20 border-red-500/50 text-white" 
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    }`}
                  >
                    <div className={`mb-2 ${interviewType === type.id ? "text-red-400" : "text-slate-500"}`}>
                      {type.icon}
                    </div>
                    <span className="text-sm font-medium text-center">{type.label}</span>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Parameters */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-red-400" />
                Calibration
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Experience Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {experiences.map((exp) => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => setExperienceLevel(exp)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          experienceLevel === exp
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Difficulty
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          difficulty === diff
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Duration (Minutes)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {durations.map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setDuration(dur)}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          duration === dur
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-auto bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Mic className="w-6 h-6" />
                  <span className="text-lg">Start Interview Simulator</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
