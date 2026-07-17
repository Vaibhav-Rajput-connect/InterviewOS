/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { GlassCard } from "@/components/ui/cards";
import { Settings, Play, CloudLightning, Save, Monitor, Type, Layout, Check, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { codingApi, ExecutionResult } from "@/lib/api/coding";
import { useQuery } from "@tanstack/react-query";

export interface CodeEditorProps {
  problemId?: string;
  onExecuteStart?: () => void;
  onExecuteComplete?: (result: ExecutionResult) => void;
  onSubmitStart?: () => void;
  onSubmitComplete?: (result: any) => void;
  isExecuting?: boolean;
  isSubmitting?: boolean;
  onCodeChange?: (code: string) => void;
  customTestcases?: string;
  sessionId?: string;
}

const LANGUAGES = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
];

const THEMES = [
  { id: "vs-dark", label: "Dark+" },
  { id: "light", label: "Light+" },
  { id: "hc-black", label: "High Contrast" },
];

const FONT_SIZES = [12, 14, 16, 18, 20];

export function CodeEditor({ 
  problemId, 
  onExecuteStart, 
  onExecuteComplete, 
  onSubmitStart,
  onSubmitComplete,
  isExecuting, 
  isSubmitting,
  onCodeChange
}: CodeEditorProps) {
  const [language, setLanguage] = useState("typescript");
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [minimap, setMinimap] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Default fallback code if problem boilerplate is missing
  const fallbackCode = `// Write your code here...`;

  const [code, setCode] = useState(fallbackCode);
  const [userEdited, setUserEdited] = useState(false);

  // Fetch problem data to get boilerplate
  const { data: problem } = useQuery({
    queryKey: ["coding-problem", problemId],
    queryFn: () => codingApi.getProblem(problemId!),
    enabled: !!problemId
  });

  // Apply boilerplate when language or problem changes (only if user hasn't edited)
  useEffect(() => {
    if (!userEdited) {
      if (problem?.boilerplate && problem.boilerplate[language]) {
        setCode(problem.boilerplate[language]);
        if (onCodeChange) onCodeChange(problem.boilerplate[language]);
      } else {
        setCode(fallbackCode);
        if (onCodeChange) onCodeChange(fallbackCode);
      }
    }
  }, [language, problem, userEdited, fallbackCode, onCodeChange]);

  // Handle click outside for settings popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (!autoSave || isSaved) return;
    
    const timer = setTimeout(() => {
      // Here you would typically dispatch to backend
      console.log("Auto-saving code...");
      setIsSaved(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [code, autoSave, isSaved]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setUserEdited(true);
      setIsSaved(false);
      if (onCodeChange) onCodeChange(value);
    }
  };

  const handleRunCode = async () => {
    if (!onExecuteStart || !onExecuteComplete) return;
    
    onExecuteStart();
    try {
      const result = await codingApi.executeCode({
        language,
        code,
        problem_id: problemId
      });
      onExecuteComplete(result);
    } catch (error) {
      console.error("Execution failed:", error);
      onExecuteComplete({
        stdout: "",
        stderr: "Failed to connect to execution server.",
        exit_code: -1,
        time_ms: 0,
        status: "Network Error"
      });
    }
  };

  const handleSubmitCode = async () => {
    if (!onSubmitStart || !onSubmitComplete) return;
    
    onSubmitStart();
    try {
      const result = await codingApi.submitCode({
        language,
        code,
        problem_id: problemId
      });
      onSubmitComplete(result);
    } catch (error) {
      console.error("Submission failed:", error);
      onSubmitComplete({
        status: "error",
        execution: null,
        evaluation: null,
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-2">
      <GlassCard className="flex-1 flex flex-col overflow-visible relative" glow="none">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 shrink-0 bg-black/20 z-10 relative">
          <div className="flex items-center gap-3 relative">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-red-500 transition-colors cursor-pointer appearance-none pr-8"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(148, 163, 184, 1)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1em 1em" }}
            >
              {LANGUAGES.map(l => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>

            <div className="relative" ref={settingsRef}>
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  isSettingsOpen ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Settings size={16} />
              </button>

              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
                  >
                    <div className="p-3 border-b border-white/10">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Settings size={14} className="text-slate-400" /> Editor Settings
                      </h3>
                    </div>
                    
                    <div className="p-2 flex flex-col gap-1">
                      {/* Theme */}
                      <div className="px-3 py-2 flex items-center justify-between text-sm hover:bg-white/5 rounded-lg transition-colors group">
                        <span className="flex items-center gap-2 text-slate-300 group-hover:text-white">
                          <Monitor size={14} /> Theme
                        </span>
                        <select 
                          value={theme} 
                          onChange={(e) => setTheme(e.target.value)}
                          className="bg-transparent text-slate-300 outline-none text-right appearance-none cursor-pointer hover:text-white"
                        >
                          {THEMES.map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.label}</option>)}
                        </select>
                      </div>

                      {/* Font Size */}
                      <div className="px-3 py-2 flex items-center justify-between text-sm hover:bg-white/5 rounded-lg transition-colors group">
                        <span className="flex items-center gap-2 text-slate-300 group-hover:text-white">
                          <Type size={14} /> Font Size
                        </span>
                        <select 
                          value={fontSize} 
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="bg-transparent text-slate-300 outline-none text-right appearance-none cursor-pointer hover:text-white"
                        >
                          {FONT_SIZES.map(s => <option key={s} value={s} className="bg-slate-900">{s}px</option>)}
                        </select>
                      </div>

                      <div className="h-px bg-white/5 my-1 mx-2" />

                      {/* Minimap Toggle */}
                      <button 
                        onClick={() => setMinimap(!minimap)}
                        className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-white/5 rounded-lg transition-colors group text-left"
                      >
                        <span className="flex items-center gap-2 text-slate-300 group-hover:text-white">
                          <Layout size={14} /> Minimap
                        </span>
                        {minimap && <Check size={14} className="text-green-400" />}
                      </button>

                      {/* Auto Save Toggle */}
                      <button 
                        onClick={() => setAutoSave(!autoSave)}
                        className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-white/5 rounded-lg transition-colors group text-left"
                      >
                        <span className="flex items-center gap-2 text-slate-300 group-hover:text-white">
                          <Save size={14} /> Auto Save
                        </span>
                        {autoSave && <Check size={14} className="text-green-400" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="text-xs text-slate-500 hidden md:flex items-center gap-1.5 ml-2">
              {autoSave && (
                isSaved ? (
                  <span className="flex items-center gap-1 text-slate-400"><CheckCircle2 size={12} /> Saved</span>
                ) : (
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" /> Saving...</span>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleRunCode}
              disabled={isExecuting || isSubmitting}
              className={`flex items-center gap-2 px-4 py-1.5 border border-white/10 rounded-lg text-sm font-medium transition-colors ${
                isExecuting 
                  ? "bg-white/10 text-slate-500 cursor-not-allowed" 
                  : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {isExecuting ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={14} />
              )}
              {isExecuting ? "Running..." : "Run Code"}
            </button>
            <button 
              onClick={handleSubmitCode}
              disabled={isExecuting || isSubmitting}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CloudLightning size={14} />
              )}
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>

        {/* Monaco Editor Wrapper */}
        <div className={`flex-1 w-full ${theme === 'vs-dark' || theme === 'hc-black' ? 'bg-[#1e1e1e]' : 'bg-[#fffffe]'}`}>
          <Editor
            height="100%"
            language={language}
            theme={theme}
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: minimap },
              fontSize: fontSize,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineHeight: Math.round(fontSize * 1.5),
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste: true,
              suggest: {
                showWords: false,
              },
              bracketPairColorization: {
                enabled: true
              },
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              folding: true
            }}
            loading={
              <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                Loading Editor...
              </div>
            }
          />
        </div>
      </GlassCard>
    </div>
  );
}
