"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ProblemPanel } from "@/components/coding/problem-panel";
import { CodeEditor } from "@/components/coding/code-editor";
import { AIPanel } from "@/components/coding/ai-panel";
import { ConsolePanel } from "@/components/coding/console-panel";
import { GripVertical, GripHorizontal } from "lucide-react";
import { motion } from "framer-motion";

import { use, useState } from "react";
import { ExecutionResult } from "@/lib/api/coding";

export default function CodingArenaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentCode, setCurrentCode] = useState("");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-64px)] w-full overflow-hidden flex"
    >
      <PanelGroup direction="horizontal" className="w-full h-full">
        {/* Left Panel: Problem Description */}
        <Panel defaultSize={30} minSize={20}>
          <ProblemPanel problemId={id} />
        </Panel>

        <PanelResizeHandle className="w-2 flex items-center justify-center group cursor-col-resize">
          <div className="w-1 h-8 bg-white/10 rounded-full group-hover:bg-red-500/50 transition-colors flex items-center justify-center">
            <GripVertical size={10} className="text-white/30 group-hover:text-red-400 opacity-0 group-hover:opacity-100" />
          </div>
        </PanelResizeHandle>

        {/* Center Panel: Editor + Console */}
        <Panel defaultSize={45} minSize={30}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} minSize={30}>
              <CodeEditor 
                problemId={id}
                onExecuteStart={() => setIsExecuting(true)}
                onExecuteComplete={(res) => {
                  setExecutionResult(res);
                  setIsExecuting(false);
                }}
                isExecuting={isExecuting}
                onCodeChange={(code) => setCurrentCode(code)}
              />
            </Panel>
            
            <PanelResizeHandle className="h-2 flex items-center justify-center group cursor-row-resize">
              <div className="h-1 w-8 bg-white/10 rounded-full group-hover:bg-red-500/50 transition-colors flex items-center justify-center">
                <GripHorizontal size={10} className="text-white/30 group-hover:text-red-400 opacity-0 group-hover:opacity-100" />
              </div>
            </PanelResizeHandle>

            <Panel defaultSize={30} minSize={10}>
              <ConsolePanel 
                executionResult={executionResult} 
                isExecuting={isExecuting} 
              />
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="w-2 flex items-center justify-center group cursor-col-resize">
          <div className="w-1 h-8 bg-white/10 rounded-full group-hover:bg-red-500/50 transition-colors flex items-center justify-center">
            <GripVertical size={10} className="text-white/30 group-hover:text-red-400 opacity-0 group-hover:opacity-100" />
          </div>
        </PanelResizeHandle>

        {/* Right Panel: AI Copilot */}
        <Panel defaultSize={25} minSize={20}>
          <AIPanel problemId={id} currentCode={currentCode} />
        </Panel>
      </PanelGroup>
    </motion.div>
  );
}
