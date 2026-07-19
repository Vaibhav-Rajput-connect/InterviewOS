import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/cards";
import { Terminal, CheckCircle2, XCircle, ChevronRight, Clock, Cpu, Type } from "lucide-react";
import { ExecutionResult } from "@/lib/api/coding";

export interface ConsolePanelProps {
  executionResult?: ExecutionResult | null;
  isExecuting?: boolean;
  customInput?: string;
  onCustomInputChange?: (val: string) => void;
}

export const ConsolePanel = React.memo(function ConsolePanel({ executionResult, isExecuting, customInput, onCustomInputChange }: ConsolePanelProps) {
  const [activeTab, setActiveTab] = useState<"testcases" | "custom" | "output">("testcases");
  const [activeTestCase, setActiveTestCase] = useState(0);

  // Switch to output tab when executing or when result arrives
  useEffect(() => {
    if (isExecuting || executionResult) {
      setActiveTab("output");
    }
  }, [isExecuting, executionResult]);

  const testCases = [
    { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]" },
    { input: "nums = [3,2,4], target = 6", expected: "[1,2]" },
    { input: "nums = [3,3], target = 6", expected: "[0,1]" },
  ];

  return (
    <div className="h-full flex flex-col p-2 pt-0">
      <GlassCard className="flex-1 flex flex-col overflow-hidden relative" glow="rose">
        {/* Header Tabs */}
        <div className="flex items-center gap-4 p-2 border-b border-white/10 shrink-0 bg-black/20">
          <button 
            onClick={() => setActiveTab("testcases")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "testcases" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <CheckCircle2 size={14} className={activeTab === "testcases" ? "text-green-500" : ""} /> Test Cases
          </button>
          <button 
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "custom" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <Type size={14} /> Custom Input
          </button>
          <button 
            onClick={() => setActiveTab("output")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "output" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <Terminal size={14} /> Output
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === "testcases" && (
            <div className="flex flex-col h-full">
              <div className="flex gap-2 mb-4 shrink-0">
                {testCases.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveTestCase(i)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTestCase === i ? "bg-white/10 text-white border border-white/20" : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10"}`}
                  >
                    Case {i + 1}
                  </button>
                ))}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">Input:</div>
                  <div className="p-3 bg-black/40 border border-white/5 rounded-lg font-mono text-sm text-slate-300">
                    {testCases[activeTestCase].input}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">Expected Output:</div>
                  <div className="p-3 bg-black/40 border border-white/5 rounded-lg font-mono text-sm text-slate-300">
                    {testCases[activeTestCase].expected}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "custom" && (
            <div className="flex flex-col h-full">
              <div className="text-xs font-semibold text-slate-500 mb-2">
                Define Custom Test Cases (JSON Format)
              </div>
              <textarea
                value={customInput || ""}
                onChange={(e) => onCustomInputChange?.(e.target.value)}
                placeholder={'[\n  {\n    "args": [[2,7,11,15], 9],\n    "expected": [0,1]\n  }\n]'}
                className="flex-1 w-full bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-sm text-slate-300 resize-none outline-none focus:border-red-500/50 transition-colors custom-scrollbar"
              />
              <div className="text-[10px] text-slate-500 mt-2">
                Provide an array of testcase objects with &quot;args&quot; and an optional &quot;expected&quot; output.
              </div>
            </div>
          )}

          {activeTab === "output" && (
            <div className="font-mono text-sm h-full flex flex-col">
              {isExecuting ? (
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  Executing code...
                </div>
              ) : executionResult ? (
                <div className="space-y-4">
                  <div className={`flex items-center gap-2 font-bold ${
                    executionResult.status === 'Accepted' || ((executionResult.test_results?.length ?? 0) > 0 && executionResult.failed_count === 0) ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {executionResult.status === 'Accepted' || ((executionResult.test_results?.length ?? 0) > 0 && executionResult.failed_count === 0) ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {executionResult.status === 'Accepted' || ((executionResult.test_results?.length ?? 0) > 0 && executionResult.failed_count === 0) ? 'Accepted' : executionResult.status}
                    {(executionResult.test_results?.length ?? 0) > 0 && (
                        <span className="text-slate-400 font-normal ml-2 text-xs">
                          ({executionResult.passed_count}/{executionResult.test_results?.length ?? 0} cases passed)
                        </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5"><Clock size={12} /> {executionResult.time_ms} ms</span>
                    {executionResult.memory_kb && (
                      <span className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5"><Cpu size={12} /> {executionResult.memory_kb} KB</span>
                    )}
                  </div>

                  {executionResult.test_results && executionResult.test_results.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {executionResult.test_results?.map((tr: any, idx: number) => (
                        <div key={idx} className={`p-3 rounded-lg border ${tr.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                          <div className="flex items-center gap-2 font-bold mb-2 text-xs">
                            {tr.passed ? <CheckCircle2 size={14} className="text-green-500"/> : <XCircle size={14} className="text-red-500"/>}
                            <span className={tr.passed ? 'text-green-400' : 'text-red-400'}>Case {tr.test_case}</span>
                            <span className="text-slate-500 ml-auto">{tr.time_ms || 0} ms</span>
                          </div>
                          {!tr.passed && (
                            <div className="space-y-2 text-xs text-slate-300">
                              {tr.error ? (
                                <div className="text-red-400">{tr.error}</div>
                              ) : (
                                <>
                                  <div className="flex flex-col">
                                    <span className="text-slate-500">Expected:</span>
                                    <span className="font-mono bg-black/40 p-1 rounded mt-1">{JSON.stringify(tr.expected)}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-slate-500">Actual:</span>
                                    <span className="font-mono bg-black/40 p-1 rounded mt-1">{JSON.stringify(tr.actual)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {executionResult.stdout && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">Stdout:</div>
                      <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-slate-300 whitespace-pre-wrap">
                        {executionResult.stdout}
                      </div>
                    </div>
                  )}
                  
                  {executionResult.stderr && (
                    <div>
                      <div className="text-xs font-semibold text-red-500 mb-1">Stderr:</div>
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 whitespace-pre-wrap">
                        {executionResult.stderr}
                      </div>
                    </div>
                  )}
                  
                  {!executionResult.stdout && !executionResult.stderr && (!executionResult.test_results || executionResult.test_results.length === 0) && (
                    <div className="text-slate-500 italic">No output produced.</div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <ChevronRight size={14} /> Run your code to see output here.
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
});
