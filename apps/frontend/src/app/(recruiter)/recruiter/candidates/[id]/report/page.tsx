"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Printer,
  FileText,
  Brain,
  Code,
  MessageSquare,
  Award,
  ThumbsUp,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Mock Data ───────────────────────────────────────────────────────

const REPORT = {
  candidate: {
    id: "1",
    name: "Aarav Sharma",
    role: "Senior Frontend Engineer",
    date: "July 16, 2026",
    overallScore: 94,
    recommendation: "Strong Hire",
  },
  summary:
    "Aarav demonstrated exceptional proficiency in React and modern frontend architecture. His performance in the coding arena highlighted strong problem-solving skills, particularly in optimizing rendering performance and state management. He communicated complex technical concepts clearly and concisely.",
  aiFeedback:
    "The candidate showed a very structured approach to problem-solving. They clarified requirements before jumping into code, which is a strong positive signal for a Senior role.",
  strengths: [
    "Deep understanding of React rendering lifecycle.",
    "Strong system design intuition (component boundaries).",
    "Excellent communication and requirement gathering.",
  ],
  weaknesses: [
    "Could optimize edge-case handling in the initial coding pass.",
    "Less familiarity with deep Node.js backend optimization.",
  ],
  codingReport: {
    score: 92,
    feedback: "Optimal time complexity achieved (O(N)). Code was clean, modular, and followed best practices.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
  },
  communicationReport: {
    score: 96,
    feedback: "Highly articulate. Explained tradeoffs between different state management approaches effectively.",
  },
  questions: [
    {
      q: "Design a virtualized list component in React.",
      a: "Candidate successfully designed a windowing approach, correctly calculating scroll offsets and rendering only visible nodes. Used useMemo for expensive calculations.",
      score: 95,
    },
    {
      q: "Explain the differences between useTransition and startTransition.",
      a: "Accurately described concurrent rendering concepts and how to keep the UI responsive during expensive state updates.",
      score: 90,
    },
    {
      q: "How would you handle global state in a large Next.js application?",
      a: "Suggested Zustand for client state and React Query for server state. Justified choices well against Context API.",
      score: 96,
    },
  ],
};

// ─── Component ───────────────────────────────────────────────────────

export default function InterviewReportPage() {
  const router = useRouter();
  const params = useParams();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* ═══════════════════════════ HEADER (NO PRINT) ═══════════════════════════ */}
      <div className="print:hidden flex items-center justify-between bg-white/[0.02] border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Interview Report</h1>
            <p className="text-sm text-slate-400">Candidate ID: {params.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handlePrint} variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20">
            <Printer size={16} className="mr-2" /> Print PDF
          </Button>
          <Button variant="glow" className="!bg-gradient-to-r !from-cyan-600 !to-blue-600">
            <Download size={16} className="mr-2" /> Export JSON
          </Button>
        </div>
      </div>

      {/* ════════════════════════ REPORT BODY (PRINTABLE) ═══════════════════════ */}
      <div className="bg-white/[0.02] border border-white/10 p-8 md:p-12 rounded-2xl backdrop-blur-xl print:bg-white print:border-none print:shadow-none print:text-black">
        
        {/* Title Section */}
        <div className="flex justify-between items-start border-b border-white/10 print:border-black/20 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="text-cyan-400 print:text-cyan-700" size={28} />
              <h2 className="text-2xl font-display font-bold text-white print:text-black tracking-tight">InterviewOS AI Report</h2>
            </div>
            <h1 className="text-4xl font-bold text-white print:text-black mt-4">{REPORT.candidate.name}</h1>
            <p className="text-lg text-cyan-400 print:text-cyan-700 font-medium mt-1">{REPORT.candidate.role}</p>
            <p className="text-sm text-slate-400 print:text-slate-600 mt-2">{REPORT.candidate.date}</p>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <div className="text-sm text-slate-400 print:text-slate-600 uppercase tracking-widest font-bold mb-2">Overall AI Score</div>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 print:from-cyan-700 print:to-blue-900 leading-none">
              {REPORT.candidate.overallScore}
            </div>
            <div className="mt-4 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 print:bg-emerald-100 print:border-emerald-300 print:text-emerald-800 font-bold tracking-wide">
              {REPORT.candidate.recommendation}
            </div>
          </div>
        </div>

        {/* Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
              <FileText size={18} className="text-blue-400 print:text-blue-700" />
              Interview Summary
            </h3>
            <p className="text-slate-300 print:text-slate-700 leading-relaxed text-sm">
              {REPORT.summary}
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
              <Brain size={18} className="text-violet-400 print:text-violet-700" />
              AI Feedback
            </h3>
            <p className="text-slate-300 print:text-slate-700 leading-relaxed text-sm">
              {REPORT.aiFeedback}
            </p>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 print:bg-emerald-50 print:border-emerald-200">
            <h3 className="text-emerald-400 print:text-emerald-700 font-bold flex items-center gap-2 mb-4">
              <ThumbsUp size={18} /> Strengths
            </h3>
            <ul className="space-y-3">
              {REPORT.strengths.map((item, i) => (
                <li key={i} className="text-slate-300 print:text-slate-800 text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 print:bg-emerald-600 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-xl bg-rose-500/5 border border-rose-500/20 print:bg-rose-50 print:border-rose-200">
            <h3 className="text-rose-400 print:text-rose-700 font-bold flex items-center gap-2 mb-4">
              <AlertTriangle size={18} /> Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {REPORT.weaknesses.map((item, i) => (
                <li key={i} className="text-slate-300 print:text-slate-800 text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 print:bg-rose-600 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 border-t border-white/10 print:border-black/20 pt-12">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
                <Code size={18} className="text-cyan-400 print:text-cyan-700" />
                Coding Report
              </h3>
              <span className="text-xl font-bold text-cyan-400 print:text-cyan-700">{REPORT.codingReport.score}/100</span>
            </div>
            <div className="flex gap-4 mb-2">
              <div className="px-3 py-1 rounded bg-white/5 border border-white/10 print:bg-slate-100 print:border-slate-300 text-xs font-mono text-slate-300 print:text-slate-800">
                Time: {REPORT.codingReport.timeComplexity}
              </div>
              <div className="px-3 py-1 rounded bg-white/5 border border-white/10 print:bg-slate-100 print:border-slate-300 text-xs font-mono text-slate-300 print:text-slate-800">
                Space: {REPORT.codingReport.spaceComplexity}
              </div>
            </div>
            <p className="text-slate-300 print:text-slate-700 leading-relaxed text-sm">
              {REPORT.codingReport.feedback}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
                <MessageSquare size={18} className="text-violet-400 print:text-violet-700" />
                Communication
              </h3>
              <span className="text-xl font-bold text-violet-400 print:text-violet-700">{REPORT.communicationReport.score}/100</span>
            </div>
            <p className="text-slate-300 print:text-slate-700 leading-relaxed text-sm">
              {REPORT.communicationReport.feedback}
            </p>
          </div>

        </div>

        {/* Question History */}
        <div className="border-t border-white/10 print:border-black/20 pt-12">
          <h3 className="text-xl font-bold text-white print:text-black flex items-center gap-2 mb-6">
            <Award size={20} className="text-amber-400 print:text-amber-600" />
            Question History & Analysis
          </h3>
          
          <div className="space-y-6">
            {REPORT.questions.map((q, i) => (
              <div key={i} className="p-6 rounded-xl bg-white/[0.03] border border-white/10 print:bg-slate-50 print:border-slate-200">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 print:bg-cyan-100 print:text-cyan-800 text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <h4 className="font-semibold text-white print:text-black leading-tight">
                      {q.q}
                    </h4>
                  </div>
                  <span className="text-sm font-bold text-cyan-400 print:text-cyan-700 whitespace-nowrap bg-cyan-500/10 px-2 py-0.5 rounded">
                    Score: {q.score}
                  </span>
                </div>
                <div className="pl-9">
                  <p className="text-sm text-slate-400 print:text-slate-600">
                    <strong className="text-slate-300 print:text-slate-800">AI Analysis:</strong> {q.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 print:border-black/20 text-center text-xs text-slate-500 print:text-slate-400">
          Generated automatically by InterviewOS AI Engine on {REPORT.candidate.date}
        </div>

      </div>
    </div>
  );
}
