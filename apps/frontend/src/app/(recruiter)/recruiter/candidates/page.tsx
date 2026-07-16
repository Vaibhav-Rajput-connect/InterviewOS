"use client";

import { useState, useMemo, useEffect as import_react_useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Archive,
  Star,
  MessageSquare,
  ChevronDown,
  Download,
  Tag,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types & Mock Data ───────────────────────────────────────────────

type CandidateStatus = "Applied" | "Screening" | "Interview Scheduled" | "Shortlisted" | "Offer Sent" | "Rejected" | "Archived";

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  status: CandidateStatus;
  aiScore: number;
  tags: string[];
  appliedDate: string;
  avatar: string;
  notes: number;
}

const MOCK_CANDIDATES: Candidate[] = [
  { id: "1", name: "Aarav Sharma", email: "aarav@example.com", role: "Senior Frontend Engineer", status: "Shortlisted", aiScore: 94, tags: ["React", "System Design"], appliedDate: "2026-07-10", avatar: "A", notes: 3 },
  { id: "2", name: "Priya Patel", email: "priya@example.com", role: "Full Stack Developer", status: "Interview Scheduled", aiScore: 91, tags: ["Node.js", "PostgreSQL"], appliedDate: "2026-07-12", avatar: "P", notes: 1 },
  { id: "3", name: "Rahul Mehta", email: "rahul@example.com", role: "Backend Engineer", status: "Applied", aiScore: 88, tags: ["Go", "Microservices"], appliedDate: "2026-07-14", avatar: "R", notes: 0 },
  { id: "4", name: "Sneha Kumar", email: "sneha@example.com", role: "ML Engineer", status: "Offer Sent", aiScore: 96, tags: ["PyTorch", "NLP"], appliedDate: "2026-07-05", avatar: "S", notes: 5 },
  { id: "5", name: "Vikram Singh", email: "vikram@example.com", role: "DevOps Engineer", status: "Rejected", aiScore: 65, tags: ["Kubernetes", "AWS"], appliedDate: "2026-07-08", avatar: "V", notes: 2 },
  { id: "6", name: "Ananya Desai", email: "ananya@example.com", role: "Product Manager", status: "Screening", aiScore: 82, tags: ["Agile", "B2B"], appliedDate: "2026-07-15", avatar: "A", notes: 1 },
  { id: "7", name: "Rohan Gupta", email: "rohan@example.com", role: "Frontend Engineer", status: "Archived", aiScore: 71, tags: ["Vue"], appliedDate: "2026-06-20", avatar: "R", notes: 0 },
];

const STATUS_CONFIG: Record<CandidateStatus, { color: string; icon: LucideIcon }> = {
  "Applied": { color: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: Filter },
  "Screening": { color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", icon: Search },
  "Interview Scheduled": { color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: CalendarClock },
  "Shortlisted": { color: "text-violet-400 bg-violet-500/10 border-violet-500/20", icon: Star },
  "Offer Sent": { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  "Rejected": { color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: XCircle },
  "Archived": { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Archive },
};

// ─── Component ───────────────────────────────────────────────────────

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | "All">("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Filtered Data
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      // If "All" is selected, hide Archived candidates. Otherwise, show whatever status is selected (including Archived if they click that tab)
      const matchesStatus = statusFilter === "All" ? c.status !== "Archived" : c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, candidates]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(startIndex, startIndex + pageSize);
  }, [filteredCandidates, currentPage, pageSize]);

  // Reset to page 1 when filters change
  import_react_useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedIds.size === filteredCandidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCandidates.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkStatusChange = (newStatus: CandidateStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (selectedIds.has(c.id) ? { ...c, status: newStatus } : c))
    );
    setSelectedIds(new Set());
  };

  const handleArchive = (id: string) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Archived" } : c)));
  };

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════ HEADER ═══════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Candidates</h1>
          <p className="text-slate-400 mt-1">Manage and evaluate your talent pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 text-white bg-white/[0.02]">
            <Download size={16} className="mr-2" /> Export
          </Button>
          <Button variant="glow" className="!bg-gradient-to-r !from-cyan-600 !to-blue-600">
            Add Candidate
          </Button>
        </div>
      </div>

      {/* ═════════════════════════ FILTERS ════════════════════════════ */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/10 overflow-x-auto hide-scrollbar">
          {(["All", "Applied", "Screening", "Interview Scheduled", "Shortlisted", "Offer Sent", "Rejected", "Archived"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════ BULK ACTIONS TOOLBAR ════════════════════ */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
          >
            <span className="text-sm font-medium text-cyan-400 pl-2">
              {selectedIds.size} candidate{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-100 bg-cyan-500/10 hover:bg-cyan-500/20">
                  Change Status <ChevronDown size={14} className="ml-2" />
                </Button>
                {/* Dropdown (CSS hover) */}
                <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-xl bg-[#0a0a0a] border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {(Object.keys(STATUS_CONFIG) as CandidateStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleBulkStatusChange(status)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/[0.02]">
                <Tag size={14} className="mr-2" /> Tag
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 hover:text-amber-300"
                onClick={() => handleBulkStatusChange("Archived")}
              >
                <Archive size={14} className="mr-2" /> Archive
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════ DATA TABLE ══════════════════════════ */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredCandidates.length}
                    ref={(input) => {
                      if (input) input.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredCandidates.length;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0"
                  />
                </th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Score</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Applied</th>
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((candidate) => {
                  const StatusIcon = STATUS_CONFIG[candidate.status].icon;
                  const isSelected = selectedIds.has(candidate.id);
                  
                  return (
                    <motion.tr
                      key={candidate.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`group hover:bg-white/[0.02] transition-colors ${isSelected ? "bg-cyan-500/5" : ""}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(candidate.id)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-sm font-bold text-cyan-400">
                            {candidate.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors cursor-pointer">{candidate.name}</p>
                            <p className="text-xs text-slate-500">{candidate.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[candidate.status].color}`}>
                          <StatusIcon size={12} />
                          {candidate.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 text-sm font-bold text-white">{candidate.aiScore}</div>
                          <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                              style={{ width: `${candidate.aiScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-300 border border-white/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(candidate.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors relative">
                            <MessageSquare size={16} />
                            {candidate.notes > 0 && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                                {candidate.notes}
                              </span>
                            )}
                          </button>
                          <button 
                            onClick={() => handleArchive(candidate.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            title="Archive Candidate"
                          >
                            <Archive size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* ════════════════════════ PAGINATION ══════════════════════════ */}
        <div className="flex items-center justify-between p-4 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>rows per page</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-slate-300 bg-white/[0.02]"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-slate-300 bg-white/[0.02]"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
