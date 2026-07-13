import React, { useState } from "react";
import { GlassCard } from "@/components/ui/cards";
import { Sparkles, MessageSquare, Lightbulb, Zap, Send, Brain, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { codingApi } from "@/lib/api/coding";

export interface AIPanelProps {
  problemId: string;
  currentCode: string;
}

export function AIPanel({ problemId, currentCode }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "hints" | "complexity">("chat");

  // Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'assistant' | 'user', content: string}[]>([
    { role: 'assistant', content: "Hi! I'm your AI Copilot. I can help you understand the problem, debug your code, or brainstorm approaches. Just ask!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Hints State
  const [hints, setHints] = useState<{title: string, content: string}[]>([]);
  const [isHintsLoading, setIsHintsLoading] = useState(false);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);

  // Complexity State
  const [complexityResult, setComplexityResult] = useState<{
    time_complexity: string;
    space_complexity: string;
    time_reasoning: string;
    space_reasoning: string;
    overall_feedback: string;
  } | null>(null);
  const [isComplexityLoading, setIsComplexityLoading] = useState(false);

  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput;
    setChatInput("");
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMessage }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      const historyStr = newMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      const res = await codingApi.chatWithCopilot(problemId, currentCode, userMessage, historyStr);
      setChatMessages([...newMessages, { role: 'assistant', content: res.response }]);
    } catch (error) {
      console.error(error);
      setChatMessages([...newMessages, { role: 'assistant', content: "Sorry, I encountered an error connecting to the AI Gateway." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateHints = async () => {
    if (isHintsLoading) return;
    setIsHintsLoading(true);
    try {
      const res = await codingApi.getHints(problemId, currentCode);
      setHints(res.hints);
      setRevealedHints([0]); // Reveal the first hint by default
    } catch (error) {
      console.error(error);
    } finally {
      setIsHintsLoading(false);
    }
  };

  const handleAnalyzeComplexity = async () => {
    if (isComplexityLoading) return;
    setIsComplexityLoading(true);
    try {
      const res = await codingApi.analyzeComplexity(problemId, currentCode);
      setComplexityResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsComplexityLoading(false);
    }
  };

  const revealHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index]);
    }
  };

  return (
    <div className="h-full flex flex-col p-2">
      <GlassCard className="flex-1 flex flex-col overflow-hidden relative" glow="none">
        {/* Tabs */}
        <div className="flex items-center p-2 border-b border-white/10 shrink-0 gap-1 bg-black/20">
          <button 
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "chat" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <MessageSquare size={14} /> Copilot
          </button>
          <button 
            onClick={() => setActiveTab("hints")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "hints" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <Lightbulb size={14} /> Hints
          </button>
          <button 
            onClick={() => setActiveTab("complexity")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "complexity" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <Zap size={14} /> Analyze
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full gap-4"
              >
                <div className="flex-1 flex flex-col gap-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full p-0.5 shrink-0 flex items-center justify-center ${msg.role === 'assistant' ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-slate-700'}`}>
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                          {msg.role === 'assistant' ? <Sparkles size={14} className="text-white" /> : <UserIcon size={14} className="text-slate-300" />}
                        </div>
                      </div>
                      <div className={`flex-1 border rounded-2xl p-3 text-sm text-slate-300 whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-white/5 border-white/10 rounded-tl-sm' : 'bg-red-500/10 border-red-500/20 rounded-tr-sm text-right'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 p-0.5 shrink-0 flex items-center justify-center">
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                          <Sparkles size={14} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-3 flex items-center gap-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75" />
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "hints" && (
              <motion.div
                key="hints"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-3 h-full"
              >
                {hints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Lightbulb className="w-8 h-8 text-yellow-500/50 mb-3" />
                    <p className="text-sm text-slate-400 max-w-[200px] mb-4">Stuck? Get progressive hints without revealing the full solution.</p>
                    <button 
                      onClick={handleGenerateHints}
                      disabled={isHintsLoading}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
                    >
                      {isHintsLoading ? "Generating..." : "Generate Hints"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hints.map((hint, idx) => {
                      const isRevealed = revealedHints.includes(idx);
                      const canReveal = idx === 0 || revealedHints.includes(idx - 1);
                      return (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-xl border relative overflow-hidden group transition-all ${isRevealed ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5'}`}
                        >
                          <div className={`absolute top-0 left-0 w-1 h-full ${isRevealed ? 'bg-yellow-500/50' : 'bg-slate-700'}`} />
                          <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                            <Lightbulb size={14} className={isRevealed ? 'text-yellow-500' : 'text-slate-500'} /> {hint.title}
                          </h4>
                          {isRevealed ? (
                            <p className="text-sm text-slate-300">{hint.content}</p>
                          ) : (
                            <div className="mt-2">
                              {canReveal ? (
                                <button onClick={() => revealHint(idx)} className="text-xs px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                                  Reveal Hint {idx + 1}
                                </button>
                              ) : (
                                <p className="text-xs text-slate-500 italic">Reveal previous hints first.</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "complexity" && (
              <motion.div
                key="complexity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4 items-center justify-center h-full text-center"
              >
                {!complexityResult ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                      <Brain className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Complexity Analyzer</h3>
                    <p className="text-sm text-slate-400 max-w-[200px]">Run an analysis to see the Time and Space complexity of your current solution.</p>
                    <button 
                      onClick={handleAnalyzeComplexity}
                      disabled={isComplexityLoading}
                      className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
                    >
                      {isComplexityLoading ? "Analyzing..." : "Analyze Code"}
                    </button>
                  </>
                ) : (
                  <div className="w-full text-left space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                        <div className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Time</div>
                        <div className="text-2xl font-mono text-red-400 font-bold">{complexityResult.time_complexity}</div>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                        <div className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Space</div>
                        <div className="text-2xl font-mono text-blue-400 font-bold">{complexityResult.space_complexity}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <h4 className="text-xs font-semibold text-slate-500 mb-1">Time Reasoning</h4>
                        <p className="text-sm text-slate-300">{complexityResult.time_reasoning}</p>
                      </div>
                      <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <h4 className="text-xs font-semibold text-slate-500 mb-1">Space Reasoning</h4>
                        <p className="text-sm text-slate-300">{complexityResult.space_reasoning}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="text-xs font-semibold text-slate-500 mb-1">Feedback</h4>
                        <p className="text-sm text-white font-medium">{complexityResult.overall_feedback}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleAnalyzeComplexity}
                      disabled={isComplexityLoading}
                      className="w-full mt-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-white/10"
                    >
                      {isComplexityLoading ? "Re-analyzing..." : "Re-analyze Code"}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area (Only for chat) */}
        {activeTab === "chat" && (
          <div className="p-3 border-t border-white/10 shrink-0 bg-black/20">
            <form onSubmit={handleChatSubmit} className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Copilot..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
