"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/cards";
import { Search, Filter, Bookmark, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import Link from "next/link";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { codingApi } from "@/lib/api/coding";
import { useDebounce } from "@/hooks/use-debounce";

export default function CodingDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  
  const queryClient = useQueryClient();

  // Reset page to 1 when search or filter changes
  // Reset page to 1 when search or filter changes
  // Updated to reset directly in handlers to prevent set-state-in-effect warning

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["coding-problems", filterDifficulty, debouncedSearch, currentPage],
    queryFn: () => codingApi.getProblems({
      difficulty: filterDifficulty !== "All" ? filterDifficulty : undefined,
      search: debouncedSearch || undefined,
      skip: (currentPage - 1) * pageSize,
      limit: pageSize
    })
  });

  const toggleBookmark = useMutation({
    mutationFn: (id: string) => codingApi.toggleBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coding-problems"] });
    }
  });

  const displayProblems = paginatedData?.items || [];
  const totalPages = paginatedData?.totalPages || 1;
  const totalCount = paginatedData?.totalCount || 0;

  const { data: stats } = useQuery({
    queryKey: ["coding-stats"],
    queryFn: () => codingApi.getStats(),
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Coding Arena</h1>
          <p className="text-slate-400">Master algorithmic challenges with an AI-assisted IDE.</p>
        </div>
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold text-white mb-1">{stats?.total_solved ?? 0}</div>
          <div className="text-sm text-slate-400">Total Solved</div>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">{stats?.easy_solved ?? 0}</div>
          <div className="text-sm text-slate-400">Easy</div>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-1">{stats?.medium_solved ?? 0}</div>
          <div className="text-sm text-slate-400">Medium</div>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold text-red-400 mb-1">{stats?.hard_solved ?? 0}</div>
          <div className="text-sm text-slate-400">Hard</div>
        </GlassCard>
      </div>

      {/* Main Content */}
      <GlassCard className="p-0 overflow-hidden border border-white/5 bg-white/[0.02]">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <select 
              value={filterDifficulty}
              onChange={(e) => {
                setFilterDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-slate-300 outline-none focus:border-red-500 transition-colors"
            >
              <option value="All">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl text-sm font-medium transition-colors">
              <Filter size={14} /> More Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-sm text-slate-400">
                <th className="p-4 font-medium w-12">Status</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium w-32">Difficulty</th>
                <th className="p-4 font-medium w-32 hidden md:table-cell">Acceptance</th>
                <th className="p-4 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="p-4"><div className="w-5 h-5 rounded-full bg-white/10 animate-pulse"></div></td>
                      <td className="p-4">
                        <div className="h-5 w-48 bg-white/10 rounded animate-pulse mb-2"></div>
                        <div className="flex gap-2">
                          <div className="h-4 w-16 bg-white/5 rounded animate-pulse"></div>
                          <div className="h-4 w-12 bg-white/5 rounded animate-pulse"></div>
                        </div>
                      </td>
                      <td className="p-4"><div className="h-5 w-16 bg-white/10 rounded animate-pulse"></div></td>
                      <td className="p-4 hidden md:table-cell"><div className="h-2 w-full bg-white/10 rounded-full animate-pulse"></div></td>
                      <td className="p-4 text-right"><div className="h-8 w-8 rounded-lg bg-white/10 animate-pulse ml-auto"></div></td>
                    </tr>
                  ))}
                </>
              ) : displayProblems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No problems found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayProblems.map((p, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={p.id} 
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                  <td className="p-4">
                    {p.status === "solved" ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : p.status === "attempted" ? (
                      <Circle size={18} className="text-yellow-500" />
                    ) : (
                      <Circle size={18} className="text-slate-600" />
                    )}
                  </td>
                  <td className="p-4">
                    <Link href={`/coding/${p.id}`} className="font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-2">
                      {p.title}
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      {p.topics.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm ${p.difficulty === "Easy" ? "text-green-400" : p.difficulty === "Medium" ? "text-yellow-400" : "text-red-400"}`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-slate-400">
                    {p.acceptance}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleBookmark.mutate(p.id)}
                      className="text-slate-500 hover:text-white transition-colors"
                      disabled={toggleBookmark.isPending}
                    >
                      <Bookmark size={16} className={p.bookmarked ? "fill-white text-white" : ""} />
                    </button>
                  </td>
                </motion.tr>
              )))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-slate-400">
            <div>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} problems
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNumber = idx + 1;
                  // Show max 5 pages logic could go here, for now just show all if small, or limit
                  if (totalPages > 7) {
                    if (pageNumber !== 1 && pageNumber !== totalPages && Math.abs(currentPage - pageNumber) > 1) {
                      if (pageNumber === 2 || pageNumber === totalPages - 1) return <span key={idx}>...</span>;
                      return null;
                    }
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                        currentPage === pageNumber ? 'bg-red-500/20 text-red-400 font-medium' : 'hover:bg-white/5'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
