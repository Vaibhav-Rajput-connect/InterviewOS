"use client";

import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { ProblemPanel } from "@/components/coding/problem-panel";
import { AIPanel } from "@/components/coding/ai-panel";
import { ConsolePanel } from "@/components/coding/console-panel";
import { GripVertical, GripHorizontal } from "lucide-react";
import { motion } from "framer-motion";

import { use, useState, useRef, useCallback } from "react";
import { ExecutionResult } from "@/lib/api/coding";
import { useSearchParams } from "next/navigation";
import { SubmissionModal } from "@/components/coding/submission-modal";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(() => import("@/components/coding/code-editor").then(mod => mod.CodeEditor), { ssr: false });

export default function CodingArenaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const currentCodeRef = useRef("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<unknown>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [customInput, setCustomInput] = useState<string>("");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session") || undefined;
  const [copiedLink, setCopiedLink] = useState(false);

  const handleExecuteStart = useCallback(() => setIsExecuting(true), []);
  const handleExecuteComplete = useCallback((res: ExecutionResult | null) => {
    setExecutionResult(res);
    setIsExecuting(false);
  }, []);
  const handleSubmitStart = useCallback(() => setIsSubmitting(true), []);
  const handleSubmitComplete = useCallback((res: unknown) => {
    setSubmissionResult(res);
    setIsSubmitting(false);
    setIsModalOpen(true);
  }, []);
  const handleCodeChange = useCallback((code: string) => { currentCodeRef.current = code; }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-64px)] w-full overflow-hidden flex"
    >
      <PanelGroup orientation="horizontal" className="w-full h-full">
        {/* Left Panel: Problem Description */}
        <Panel defaultSize={30} minSize={20}>
          <ProblemPanel 
            problemId={id} 
            onViewSubmission={(result) => {
              setSubmissionResult(result);
              setIsModalOpen(true);
            }}
          />
        </Panel>

        <PanelResizeHandle className="w-4 flex flex-col items-center justify-center group cursor-col-resize relative z-10">
          <div className="w-[2px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent group-hover:via-red-500/50 transition-colors duration-300"></div>
          <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white/10 rounded-full group-hover:bg-red-500 group-hover:shadow-[0_0_12px_rgba(239,68,68,0.8)] transition-all duration-300 flex items-center justify-center border border-white/5 group-hover:border-red-400">
            <GripVertical size={10} className="text-white/30 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </div>
        </PanelResizeHandle>

        {/* Center Panel: Editor + Console */}
        <Panel defaultSize={45} minSize={30}>
          <div className="h-10 border-b border-white/10 flex items-center justify-between px-4">
            <span className="text-sm font-semibold text-slate-300">Code Editor</span>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {sessionId ? (
                <span className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Collaboration Active
                </span>
              ) : (
                <button 
                  onClick={() => {
                    const newSession = Math.random().toString(36).substring(2, 10);
                    const url = `${window.location.origin}${window.location.pathname}?session=${newSession}`;
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="flex items-center gap-2 hover:text-white transition-colors border border-white/10 bg-white/5 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {copiedLink ? "Link Copied!" : "Share Live Session"}
                </button>
              )}
            </div>
          </div>
          <PanelGroup orientation="vertical">
            <Panel defaultSize={70} minSize={30}>
              <CodeEditor 
                problemId={id}
                onExecuteStart={handleExecuteStart}
                onExecuteComplete={handleExecuteComplete}
                onSubmitStart={handleSubmitStart}
                onSubmitComplete={handleSubmitComplete}
                isExecuting={isExecuting}
                isSubmitting={isSubmitting}
                onCodeChange={handleCodeChange}
                sessionId={sessionId}
              />
            </Panel>
            
            <PanelResizeHandle className="h-4 flex items-center justify-center group cursor-row-resize relative z-10">
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-red-500/50 transition-colors duration-300"></div>
            <div className="absolute left-1/2 -translate-x-1/2 h-1.5 w-10 bg-white/10 rounded-full group-hover:bg-red-500 group-hover:shadow-[0_0_12px_rgba(239,68,68,0.8)] transition-all duration-300 flex items-center justify-center border border-white/5 group-hover:border-red-400">
              <GripHorizontal size={10} className="text-white/30 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
          </PanelResizeHandle>

            <Panel defaultSize={30} minSize={10}>
              <ConsolePanel 
                executionResult={executionResult} 
                isExecuting={isExecuting} 
                customInput={customInput}
                onCustomInputChange={setCustomInput}
              />
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="w-4 flex flex-col items-center justify-center group cursor-col-resize relative z-10">
          <div className="w-[2px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent group-hover:via-red-500/50 transition-colors duration-300"></div>
          <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white/10 rounded-full group-hover:bg-red-500 group-hover:shadow-[0_0_12px_rgba(239,68,68,0.8)] transition-all duration-300 flex items-center justify-center border border-white/5 group-hover:border-red-400">
            <GripVertical size={10} className="text-white/30 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </div>
        </PanelResizeHandle>

        {/* Right Panel: AI Copilot */}
        <Panel defaultSize={25} minSize={20}>
          <AIPanel problemId={id} getCurrentCode={() => currentCodeRef.current} />
        </Panel>
      </PanelGroup>

      <SubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        result={submissionResult} 
      />
    </motion.div>
  );
}
