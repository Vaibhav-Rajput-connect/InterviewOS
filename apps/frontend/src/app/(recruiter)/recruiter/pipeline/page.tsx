"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreHorizontal, MessageSquare, Clock } from "lucide-react";

// ─── Types & Mock Data ───────────────────────────────────────────────

type PipelineStage = 
  | "Applied" 
  | "Resume Review" 
  | "Technical Interview" 
  | "Coding Interview" 
  | "Behavioral Interview" 
  | "HR Round" 
  | "Offer" 
  | "Hired" 
  | "Rejected";

const STAGES: PipelineStage[] = [
  "Applied",
  "Resume Review",
  "Technical Interview",
  "Coding Interview",
  "Behavioral Interview",
  "HR Round",
  "Offer",
  "Hired",
  "Rejected",
];

interface CandidateCard {
  id: string;
  name: string;
  role: string;
  stage: PipelineStage;
  avatar: string;
  aiScore: number;
  timeInStage: string;
  notes: number;
}

const INITIAL_DATA: CandidateCard[] = [
  { id: "c1", name: "Aarav Sharma", role: "Senior Frontend Engineer", stage: "Coding Interview", avatar: "A", aiScore: 94, timeInStage: "2 days", notes: 3 },
  { id: "c2", name: "Priya Patel", role: "Full Stack Developer", stage: "Technical Interview", avatar: "P", aiScore: 91, timeInStage: "1 day", notes: 1 },
  { id: "c3", name: "Rahul Mehta", role: "Backend Engineer", stage: "Applied", avatar: "R", aiScore: 88, timeInStage: "4 hours", notes: 0 },
  { id: "c4", name: "Sneha Kumar", role: "ML Engineer", stage: "Offer", avatar: "S", aiScore: 96, timeInStage: "5 days", notes: 5 },
  { id: "c5", name: "Vikram Singh", role: "DevOps Engineer", stage: "Resume Review", avatar: "V", aiScore: 75, timeInStage: "3 days", notes: 2 },
  { id: "c6", name: "Ananya Desai", role: "Product Manager", stage: "Behavioral Interview", avatar: "A", aiScore: 82, timeInStage: "1 day", notes: 1 },
  { id: "c7", name: "Rohan Gupta", role: "Frontend Engineer", stage: "Rejected", avatar: "R", aiScore: 71, timeInStage: "1 week", notes: 0 },
];

const STAGE_COLORS: Record<PipelineStage, string> = {
  "Applied": "border-slate-500/30 text-slate-400 bg-slate-500/10",
  "Resume Review": "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
  "Technical Interview": "border-blue-500/30 text-blue-400 bg-blue-500/10",
  "Coding Interview": "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
  "Behavioral Interview": "border-violet-500/30 text-violet-400 bg-violet-500/10",
  "HR Round": "border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/10",
  "Offer": "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  "Hired": "border-emerald-500/50 text-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
  "Rejected": "border-rose-500/30 text-rose-400 bg-rose-500/10",
};

// ─── Component ───────────────────────────────────────────────────────

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<CandidateCard[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    
    if (id && draggedItemId === id) {
      setCandidates((prev) => 
        prev.map((c) => (c.id === id ? { ...c, stage: targetStage } : c))
      );
    }
    setDraggedItemId(null);
  };

  const filteredCandidates = candidates.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 overflow-hidden">
      
      {/* ═══════════════════════════ HEADER ═══════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Hiring Pipeline</h1>
          <p className="text-slate-400 mt-1">Manage candidate progression with drag-and-drop.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* ════════════════════════ KANBAN BOARD ════════════════════════ */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden hide-scrollbar">
        <div className="flex h-full gap-4 pb-4 px-1" style={{ width: "max-content" }}>
          
          {STAGES.map((stage) => {
            const columnCandidates = filteredCandidates.filter((c) => c.stage === stage);
            const isDropTarget = draggedItemId && !columnCandidates.find(c => c.id === draggedItemId);

            return (
              <div 
                key={stage}
                className={`flex flex-col w-72 shrink-0 rounded-2xl border transition-colors duration-300 ${isDropTarget ? "border-cyan-500/50 bg-cyan-500/5" : "border-white/5 bg-white/[0.01]"}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Column Header */}
                <div className={`p-3 border-b border-white/5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${STAGE_COLORS[stage].split(" ")[2]}`} />
                    <h3 className="font-semibold text-white text-sm">{stage}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs font-medium text-slate-400 border border-white/10">
                    {columnCandidates.length}
                  </span>
                </div>

                {/* Column Body */}
                <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-3">
                  <AnimatePresence>
                    {columnCandidates.map((candidate) => (
                      <motion.div
                        layout
                        layoutId={candidate.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        key={candidate.id}
                      >
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, candidate.id)}
                          className={`p-4 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-lg cursor-grab active:cursor-grabbing hover:border-cyan-500/30 hover:bg-white/[0.06] transition-colors ${draggedItemId === candidate.id ? "opacity-50 border-cyan-500/50" : ""}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0">
                                {candidate.avatar}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-white leading-tight">{candidate.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{candidate.role}</p>
                              </div>
                            </div>
                            <button className="text-slate-500 hover:text-white transition-colors">
                              <MoreHorizontal size={14} />
                            </button>
                          </div>

                          {/* AI Score & Tags */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-medium text-slate-300">
                              <span className="text-emerald-400 font-bold">{candidate.aiScore}</span> AI Score
                            </div>
                            
                            <div className="flex items-center gap-2 text-slate-500">
                              {candidate.notes > 0 && (
                                <div className="flex items-center gap-1 text-[10px]">
                                  <MessageSquare size={10} /> {candidate.notes}
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-[10px]">
                                <Clock size={10} /> {candidate.timeInStage}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty State visual aid */}
                  {columnCandidates.length === 0 && (
                    <div className="h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-slate-600 text-xs">
                      Drop candidate here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
