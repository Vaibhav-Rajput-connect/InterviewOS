import React from "react";
import { GlassCard } from "@/components/ui/cards";
import { Tag, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { codingApi } from "@/lib/api/coding";

export function ProblemPanel({ problemId }: { problemId: string }) {
  const { data: problem, isLoading, isError } = useQuery({
    queryKey: ["coding-problem", problemId],
    queryFn: () => codingApi.getProblem(problemId),
    enabled: !!problemId
  });

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
      <GlassCard className="flex-1 flex flex-col overflow-hidden p-6 relative" glow="none">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="prose prose-invert max-w-none text-slate-300">
            <p className="mb-4 whitespace-pre-line">
              {problem.description}
            </p>

            {problem.examples && problem.examples.length > 0 && (
              <div className="mt-8">
                <h3 className="text-white text-lg font-semibold mb-4">Examples</h3>
                <div className="space-y-4">
                  {problem.examples.map((ex, i) => (
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
                  {problem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        {problem.topics && problem.topics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 shrink-0 flex gap-2 overflow-x-auto custom-scrollbar pb-2">
            {problem.topics.map((topic, index) => (
              <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <Tag size={12} /> {topic}
              </span>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
