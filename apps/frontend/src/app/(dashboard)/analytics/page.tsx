"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, BookOpen, Target, Calendar, ListTodo, TrendingUp, AlertCircle, Loader2, Activity, Award, CheckCircle2, Sparkles } from "lucide-react";
import apiClient from "@/lib/api-client";
import dynamic from "next/dynamic";

const AnalyticsCharts = dynamic(() => import('./analytics-charts'), { ssr: false });

interface WeakTopic {
  type: string;
  content: string;
  created_at: string;
}

interface LearningPlan {
  daily_tasks: string[];
  weekly_roadmap: string[];
  monthly_goals: string[];
  recommended_problems: string[];
  recommended_resources: string[];
  difficulty_progression: string;
}

interface DashboardMetrics {
  interview_readiness: number;
  consistency_streak: number;
  total_problems: number;
  resume_trend: any[];
  coding_accuracy: any[];
  skill_distribution: any[];
  activity_heatmap: any[];
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"analytics" | "learning">("analytics");
  
  // Learning Plan State
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Analytics State
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [topicsRes, planRes, metricsRes, insightsRes] = await Promise.all([
          apiClient.get("/coach/topics"),
          apiClient.get("/coach/learning-plan"),
          apiClient.get("/analytics"),
          apiClient.get("/coach/insights")
        ]);
        
        if (topicsRes.data?.weak_topics) setWeakTopics(topicsRes.data.weak_topics);
        if (planRes.data?.plan) setLearningPlan(planRes.data.plan);
        if (metricsRes.data) setMetrics(metricsRes.data);
        if (insightsRes.data?.insights) setAiInsights(insightsRes.data.insights);
        
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const response = await apiClient.post("/coach/learning-plan/generate");
      if (response.data?.success && response.data?.plan) {
        setLearningPlan(response.data.plan);
      }
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto py-8 px-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Performance Dashboard</h1>
            <p className="text-slate-400">Track your interview readiness and learning progress</p>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "analytics" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Analytics & Progress
          </button>
          <button
            onClick={() => setActiveTab("learning")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "learning" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Learning Plan
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "analytics" ? (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Interview Readiness</p>
                  <h3 className="text-3xl font-bold text-white">{metrics.interview_readiness}%</h3>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Consistency Streak</p>
                  <h3 className="text-3xl font-bold text-white">{metrics.consistency_streak} <span className="text-lg text-slate-500 font-normal">days</span></h3>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Problems Solved</p>
                  <h3 className="text-3xl font-bold text-white">{metrics.total_problems}</h3>
                </div>
              </div>
            </div>

            {/* AI Insights Card */}
            {aiInsights.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-2 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiInsights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <AnalyticsCharts metrics={metrics} />
          </motion.div>
        ) : (
          <motion.div
            key="learning"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Learning Plan Generator Header */}
            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Dynamic Learning Roadmap</h2>
                <p className="text-slate-400 text-sm max-w-xl">
                  AI analyzes your resume, mock interview feedback, and coding accuracy to craft a perfectly tailored progression plan.
                </p>
              </div>
              <button 
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                {isGenerating ? "Analyzing Telemetry..." : "Generate New Plan"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Identified Weaknesses */}
              <div className="lg:col-span-1 flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-2 text-rose-400 mb-2">
                  <AlertCircle size={20} />
                  <h2 className="font-semibold text-lg text-white">Identified Skill Gaps</h2>
                </div>
                {weakTopics.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {weakTopics.map((topic, i) => (
                      <div key={i} className="p-3 rounded-lg bg-white/5 border border-rose-500/20 text-sm text-slate-300">
                        {topic.content}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm text-center border border-emerald-500/20">
                    No recent weaknesses detected! Keep practicing.
                  </div>
                )}
              </div>

              {/* Plan Overview */}
              <div className="lg:col-span-2 flex flex-col">
                {learningPlan ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-6"
                  >
                    {/* Daily Tasks */}
                    <div className="p-6 rounded-2xl bg-blue-500/5 backdrop-blur-md border border-blue-500/20 shadow-xl shadow-blue-900/10">
                      <div className="flex items-center gap-2 text-blue-400 mb-4">
                        <ListTodo size={20} />
                        <h2 className="font-semibold text-lg text-white">Today&apos;s Focus</h2>
                      </div>
                      <ul className="space-y-3">
                        {learningPlan.daily_tasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-300">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span className="leading-relaxed">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Roadmap */}
                      <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
                        <div className="flex items-center gap-2 text-purple-400 mb-4">
                          <Calendar size={20} />
                          <h2 className="font-semibold text-lg text-white">Weekly Roadmap</h2>
                        </div>
                        <ul className="space-y-3">
                          {learningPlan.weekly_roadmap.map((goal, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                              <span className="text-purple-400 font-mono text-xs mt-0.5">W{i+1}</span>
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Goals */}
                      <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl">
                        <div className="flex items-center gap-2 text-emerald-400 mb-4">
                          <TrendingUp size={20} />
                          <h2 className="font-semibold text-lg text-white">Monthly Goals</h2>
                        </div>
                        <ul className="space-y-3">
                          {learningPlan.monthly_goals.map((goal, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                              <div className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl mb-8">
                      <div className="flex items-center gap-2 text-amber-400 mb-4">
                        <BookOpen size={20} />
                        <h2 className="font-semibold text-lg text-white">Recommended Resources & Problems</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Practice Problems</h3>
                          <div className="flex flex-col gap-2">
                            {learningPlan.recommended_problems.map((prob, i) => (
                              <div key={i} className="px-3 py-2 rounded-lg bg-white/5 text-sm text-slate-300">
                                {prob}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Reading Material</h3>
                          <div className="flex flex-col gap-2">
                            {learningPlan.recommended_resources.map((res, i) => (
                              <div key={i} className="px-3 py-2 rounded-lg bg-white/5 text-sm text-slate-300 border-l-2 border-amber-500">
                                {res}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                        <TrendingUp className="text-amber-400 shrink-0 mt-0.5" size={18} />
                        <div>
                          <h4 className="text-sm font-medium text-amber-400 mb-1">Difficulty Progression</h4>
                          <p className="text-sm text-amber-200/80 leading-relaxed">{learningPlan.difficulty_progression}</p>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] p-12 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] backdrop-blur-sm">
                    <Target className="w-12 h-12 text-slate-600 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No Learning Plan Active</h3>
                    <p className="text-slate-400 text-center max-w-md">
                      Click &quot;Generate New Plan&quot; to let the AI analyze your resume, coding history, and interview feedback to create a personalized roadmap.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
