"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const AICoreScene = dynamic(
  () => import("@/components/three/ai-core-scene").then((mod) => mod.AICoreScene),
  { ssr: false }
);
import { GlassCard } from "@/components/ui/cards";
import { 
  Mic, 
  Square, 
  Send, 
  Clock, 
  Activity, 
  FileText, 
  ChevronRight,
  ShieldAlert,
  Loader2
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";

// Extract Timer to prevent parent re-renders every second
const TimerDisplay = React.memo(() => {
  const [timer, setTimer] = useState("00:00");
  
  useEffect(() => {
    let seconds = 0;
    const interval = setInterval(() => {
      seconds += 1;
      const m = Math.floor(seconds / 60).toString().padStart(2, "0");
      const s = (seconds % 60).toString().padStart(2, "0");
      setTimer(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="font-mono text-lg">{timer}</span>;
});
TimerDisplay.displayName = "TimerDisplay";

export default function InterviewChamberPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [isRecording, setIsRecording] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5); // Hardcoded for now
  const [status, setStatus] = useState("Initializing...");
  const [showNotes, setShowNotes] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(true);

  const fetchNextQuestion = useCallback(async () => {
    setStatus("AI is generating the next question...");
    setIsAiThinking(true);
    try {
      const res = await apiClient.post(`/interview/sessions/${sessionId}/next-question`);
      setQuestionText(res.data.content);
      setCurrentQuestionId(res.data.id);
      setIsAiThinking(false);
      setStatus("Listening...");
    } catch (err) {
      console.error("Failed to fetch next question", err);
      setIsAiThinking(false);
      setStatus("Error getting question");
    }
  }, [sessionId]);

  // Initialize session and fetch first question
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionRes = await apiClient.get(`/interview/${sessionId}`);
        const sessionData = sessionRes.data;
        
        if (sessionData.status === "completed") {
          router.push(`/interview/${sessionId}/summary`);
          return;
        }

        setProgress(sessionData.questions_count);

        if (sessionData.questions_count === 0) {
          // Get first question
          await fetchNextQuestion();
        } else {
          // In a real app we'd fetch the latest question text from the DB.
          // For now just fetch next.
          await fetchNextQuestion();
        }
      } catch (err) {
        console.error("Failed to initialize session", err);
      }
    };
    initSession();
  }, [sessionId, router, fetchNextQuestion]);


  const handleSubmitAnswer = async () => {
    if (!answerText.trim() && !isRecording) return;
    if (!currentQuestionId) return;
    
    setIsAiThinking(true);
    setStatus("Evaluating Answer...");
    
    try {
      // 1. Submit answer
      await apiClient.post("/interview/answer", {
        session_id: sessionId,
        question_id: currentQuestionId,
        content: answerText
      });

      setAnswerText("");
      const newProgress = progress + 1;
      setProgress(newProgress);

      // 2. Check for completion
      if (newProgress >= totalQuestions) {
        setStatus("Concluding Interview...");
        await apiClient.post("/interview/end", { session_id: sessionId });
        router.push(`/interview/${sessionId}/summary`);
        return;
      }

      // 3. Get next question
      await fetchNextQuestion();

    } catch (err) {
      console.error("Failed to submit answer", err);
      setIsAiThinking(false);
      setStatus("Error submitting answer");
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#030712] text-white">
      {/* Background Three.js Centerpiece */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div className="w-[800px] h-[800px] opacity-80">
          <AICoreScene />
        </div>
      </div>

      {/* Main UI Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-6">
        
        {/* Top Header Panel */}
        <header className="w-full flex justify-between items-start">
          <GlassCard className="flex items-center gap-6 px-6 py-4" glow="rose">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAiThinking ? 'bg-orange-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isAiThinking ? 'bg-orange-500' : 'bg-red-500'}`}></span>
              </div>
              <span className="font-medium text-sm tracking-widest uppercase text-slate-300">
                {isAiThinking ? "AI Processing" : "AI Listening"}
              </span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-red-400" />
              <TimerDisplay />
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2 text-slate-300">
              <Activity className="w-4 h-4 text-red-400" />
              <span className="font-medium">Q {progress} / {totalQuestions}</span>
            </div>
          </GlassCard>

          <button 
            onClick={() => setShowNotes(!showNotes)}
            className={`p-4 rounded-2xl border transition-all ${
              showNotes ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
            } backdrop-blur-xl`}
          >
            <FileText className="w-5 h-5" />
          </button>
        </header>

        {/* Optional Notes Panel (Right Side) */}
        <AnimatePresence>
          {showNotes && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-6 top-28 w-80 h-[50vh] z-20"
            >
              <GlassCard className="w-full h-full p-5 flex flex-col" glow="none">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
                  <FileText className="w-4 h-4 text-red-400" />
                  Scratchpad
                </h3>
                <textarea 
                  className="flex-1 w-full bg-black/20 rounded-xl border border-white/5 p-4 text-sm text-slate-300 resize-none focus:outline-none focus:border-red-500/50"
                  placeholder="Take notes, structure your thoughts, or write pseudo-code here... This is hidden from the AI."
                />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Interaction Panel */}
        <div className="w-full max-w-4xl mx-auto mb-4 flex flex-col gap-4">
          
          {/* Question Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={questionText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="p-6 border-l-4 border-l-red-500" glow="red">
                <p className="text-lg md:text-xl text-white leading-relaxed font-medium">
                  {questionText}
                </p>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Answer Input Area */}
          <GlassCard className="p-4" glow="none">
            <div className="flex items-end gap-4">
              
              {/* Mic / Record Button */}
              <button 
                onClick={() => setIsRecording(!isRecording)}
                disabled={isAiThinking}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                  isRecording 
                    ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse" 
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-6 h-6" />}
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                {isRecording && (
                  <div className="absolute -top-8 left-0 text-xs font-mono text-red-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Recording audio...
                  </div>
                )}
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  disabled={isAiThinking || isRecording}
                  placeholder={isRecording ? "Transcribing speech..." : "Type your answer or use the microphone..."}
                  className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
                />
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleSubmitAnswer}
                disabled={isAiThinking || (!answerText.trim() && !isRecording)}
                className="w-14 h-14 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white flex items-center justify-center shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 group"
              >
                {isAiThinking ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                )}
              </button>
            </div>
          </GlassCard>
          
        </div>
      </div>
    </div>
  );
}
