"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/cards";
import apiClient from "@/lib/api-client";
import { 
  Trophy, 
  Brain, 
  Target, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from "lucide-react";

export default function InterviewSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [summary, setSummary] = useState<any | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await apiClient.get(`/interview/summary/${sessionId}`);
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p>Generating final performance report...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="w-full h-full min-h-[60vh] flex items-center justify-center text-slate-400">
        Summary not available.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto pb-12 pt-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Interview Debrief</h1>
          <p className="text-slate-400">Comprehensive analysis of your performance.</p>
        </div>
        <button 
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors font-medium flex items-center gap-2"
        >
          Return to Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-6 flex flex-col items-center text-center" glow="red">
            <Trophy className="w-8 h-8 text-red-500 mb-3" />
            <h3 className="text-sm font-medium text-slate-400 mb-1">Overall Score</h3>
            <div className="text-4xl font-bold text-white">{Math.round(summary.overall_score)}<span className="text-xl text-slate-500">/100</span></div>
          </GlassCard>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <GlassCard className="p-6 flex flex-col items-center text-center" glow="none">
            <Brain className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="text-sm font-medium text-slate-400 mb-1">Technical</h3>
            <div className="text-4xl font-bold text-white">{Math.round(summary.technical_score)}<span className="text-xl text-slate-500">/100</span></div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-6 flex flex-col items-center text-center" glow="none">
            <Target className="w-8 h-8 text-emerald-500 mb-3" />
            <h3 className="text-sm font-medium text-slate-400 mb-1">Behavioral</h3>
            <div className="text-4xl font-bold text-white">{Math.round(summary.behavioral_score)}<span className="text-xl text-slate-500">/100</span></div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-6 flex flex-col items-center text-center" glow="none">
            <MessageSquare className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="text-sm font-medium text-slate-400 mb-1">Communication</h3>
            <div className="text-4xl font-bold text-white">{Math.round(summary.communication_score)}<span className="text-xl text-slate-500">/100</span></div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard className="p-6 h-full border-t-4 border-t-emerald-500/50">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Key Strengths
            </h2>
            <ul className="space-y-4">
              {summary.strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300 leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <GlassCard className="p-6 h-full border-t-4 border-t-orange-500/50">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" /> Areas for Improvement
            </h2>
            <ul className="space-y-4">
              {summary.weaknesses.map((w: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <span className="text-slate-300 leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <GlassCard className="p-8 border-t-4 border-t-red-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-red-500" /> Recommended Study
              </h2>
              <div className="flex flex-wrap gap-2">
                {summary.recommended_topics.map((t: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-sm font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-white mb-4">Next Learning Plan</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {summary.next_learning_plan}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
