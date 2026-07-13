/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { GlassCard } from "@/components/ui/cards";
import { Tag, AlertCircle, FileText, History, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { codingApi } from "@/lib/api/coding";

export const ProblemPanel = React.memo(function ProblemPanel({ problemId, onViewSubmission }: { problemId: string, onViewSubmission?: (result: unknown) => void }) {
  const [activeTab, setActiveTab] = useState<"description" | "submissions">("description");

  const { data: problem, isLoading, isError } = useQuery({
    queryKey: ["coding-problem", problemId],
    queryFn: () => codingApi.getProblem(problemId),
    enabled: !!problemId
  });

  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["coding-submissions", problemId],
    queryFn: () => codingApi.getSubmissions({ problem_id: problemId }),
    enabled: !!problemId && activeTab === "submissions"
  });

  const handleViewSubmission = async (submissionId: string) => {
    if (!onViewSubmission) return;
    try {
      const result = await codingApi.getSubmission(submissionId);
      onViewSubmission({
        status: result.status,
        execution: result.execution_log,
        evaluation: result.evaluation
      });
    } catch (e) {
      console.error("Failed to load submission", e);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-2">
        <GlassCard className="flex-1 flex flex-col items-center justify-center p-6" glow="none">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </GlassCard>
      </div>
    );
  }

  if (isError || !problem) {
    return (
      <div className="h-full flex flex-col p-2">
        <GlassCard className="flex-1 flex flex-col items-center justify-center p-6 text-red-400" glow="none">
          <AlertCircle size={32} className="mb-2" />
          <p>Failed to load problem</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-2">
      <GlassCard className="flex-1 flex flex-col overflow-hidden relative" glow="none">
        
        {/* Tabs */}
        <div className="flex items-center p-2 border-b border-white/10 shrink-0 gap-1 bg-black/20">
          <button 
            onClick={() => setActiveTab("description")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "description" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <FileText size={14} /> Description
          </button>
          <button 
            onClick={() => setActiveTab("submissions")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "submissions" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <History size={14} /> Submissions
          </button>
        </div>

        {activeTab === "description" ? (
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-xl font-bold text-white">{problem.title}</h2>
              <div className="flex gap-2">
                <span className={`px-3 py-1 border rounded-full text-xs font-medium ${
                  problem.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  problem.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {problem.difficulty}
                </span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300">
              <p className="mb-4 whitespace-pre-line">
                {problem.description}
              </p>

              {problem.examples && problem.examples.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-white text-lg font-semibold mb-4">Examples</h3>
                  <div className="space-y-4">
                    {problem.examples.map((ex: any, i: number) => (
                      <div key={i} className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-sm">
                        <div className="font-semibold text-white mb-2 font-sans">Example {i + 1}:</div>
                        <div className="space-y-1">
                          <div><strong className="text-slate-400">Input:</strong> <span className="text-slate-300">{ex.input}</span></div>
                          <div><strong className="text-slate-400">Output:</strong> <span className="text-slate-300">{ex.output}</span></div>
                          {ex.explanation && (
                            <div className="mt-2"><strong className="text-slate-400">Explanation:</strong> <span className="text-slate-300">{ex.explanation}</span></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {problem.constraints && problem.constraints.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle size={16} /> Constraints
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-slate-300 font-mono">
                    {problem.constraints.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {problem.topics && problem.topics.length > 0 && (
              <div className="mt-auto pt-4 shrink-0 flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                {problem.topics.map((topic: string, index: number) => (
                  <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                    <Tag size={12} /> {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {isLoadingSubmissions ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !submissions || submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <History className="w-8 h-8 mb-3 text-slate-500 opacity-50" />
                <p>No past submissions found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub: any) => {
                  const isSuccess = sub.status === "success";
                  return (
                    <div 
                      key={sub.id} 
                      onClick={() => handleViewSubmission(sub.id)}
                      className="p-4 rounded-xl border bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isSuccess ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                          <span className={`font-medium text-sm ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                            {isSuccess ? "Accepted" : "Failed"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> {new Date(sub.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="bg-white/5 px-2 py-1 rounded-lg font-mono">{sub.language}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-slate-300">
                          View details <FileText size={12} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
});
