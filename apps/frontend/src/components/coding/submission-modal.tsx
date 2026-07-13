/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, X, Zap, Code, ShieldAlert, Cpu, Brain, Flame } from "lucide-react";
import { GlassCard } from "@/components/ui/cards";

export interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any; // Result from POST /submit
}

export const SubmissionModal = React.memo(function SubmissionModal({ isOpen, onClose, result }: SubmissionModalProps) {
  if (!result) return null;

  const isSuccess = result.status === "success";
  const execution = result.execution;
  const evaluation = result.evaluation;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            <GlassCard className="flex flex-col h-full overflow-hidden" glow={isSuccess ? "none" : "red"}>
              {/* Header */}
              <div className={`p-6 border-b border-white/10 flex items-center justify-between ${isSuccess ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <div className="flex items-center gap-4">
                  {isSuccess ? (
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                      <CheckCircle2 size={24} className="text-green-500" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                      <XCircle size={24} className="text-red-500" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {isSuccess ? "Accepted" : "Wrong Answer"}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {execution?.pass_count} / {execution?.total_cases} test cases passed
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-black/40">
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                      <Zap size={20} className="text-blue-400" />
                    </div>
                    <div className="text-xs text-slate-400 mb-1">Runtime</div>
                    <div className="text-lg font-bold text-white">{execution?.time_ms} ms</div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                      <Cpu size={20} className="text-purple-400" />
                    </div>
                    <div className="text-xs text-slate-400 mb-1">Memory</div>
                    <div className="text-lg font-bold text-white">{execution?.memory_kb ? `${(execution.memory_kb / 1024).toFixed(1)} MB` : "N/A"}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                      <Brain size={20} className="text-orange-400" />
                    </div>
                    <div className="text-xs text-slate-400 mb-1">Time Complexity</div>
                    <div className="text-lg font-bold text-white font-mono">{evaluation?.time_complexity || "N/A"}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                      <Code size={20} className="text-emerald-400" />
                    </div>
                    <div className="text-xs text-slate-400 mb-1">Space Complexity</div>
                    <div className="text-lg font-bold text-white font-mono">{evaluation?.space_complexity || "N/A"}</div>
                  </div>
                </div>

                {/* Code Evaluation AI Report */}
                {evaluation && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Flame className="text-red-500" /> AI Code Evaluation
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Readability & Quality */}
                      <div className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-slate-200">Code Quality</h4>
                          <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                            evaluation.code_quality_score >= 80 ? 'bg-green-500/20 text-green-400' :
                            evaluation.code_quality_score >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {evaluation.code_quality_score}/100
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">{evaluation.readability_feedback}</p>
                        <h4 className="font-medium text-slate-200 mb-1 text-sm">Best Practices</h4>
                        <p className="text-sm text-slate-400">{evaluation.best_practices_feedback}</p>
                      </div>

                      {/* Edge Cases & Optimization */}
                      <div className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
                        <h4 className="font-medium text-slate-200 mb-2 flex items-center gap-2">
                          <ShieldAlert size={16} className="text-orange-400" /> Edge Cases
                        </h4>
                        <p className="text-sm text-slate-400 mb-4">{evaluation.edge_case_feedback}</p>
                        
                        <h4 className="font-medium text-slate-200 mb-2">Optimization Suggestions</h4>
                        <p className="text-sm text-slate-400">{evaluation.optimization_suggestions}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Console Output if failed */}
                {!isSuccess && execution?.stderr && (
                  <div>
                    <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                      <XCircle size={18} /> Error Output
                    </h3>
                    <pre className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-sm overflow-x-auto font-mono">
                      {execution.stderr}
                    </pre>
                  </div>
                )}

              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
