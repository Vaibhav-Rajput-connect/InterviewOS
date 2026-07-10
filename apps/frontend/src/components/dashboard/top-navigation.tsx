"use client";

import { motion } from "framer-motion";
import { Search, Bell, User, Command, Zap, ChevronDown, Moon } from "lucide-react";

export function TopNavigation() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-40 w-full mb-6 flex items-center justify-between"
    >
      {/* Search / Command Menu Trigger */}
      <div className="flex-1 max-w-md">
        <div className="relative group cursor-pointer">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-hover:text-red-400 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            readOnly
            className="w-full bg-white/[0.03] border border-white/5 hover:border-red-500/30 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-300 shadow-sm backdrop-blur-md transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500/50"
            placeholder="Search Intelligence Core..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="flex items-center gap-1 bg-white/10 rounded px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Actions */}
        <button className="flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20 border border-red-500/20 rounded-xl px-4 py-2 text-sm text-red-400 transition-colors">
          <Zap size={16} className="fill-red-400/20" />
          <span>Quick Scan</span>
        </button>

        {/* Theme Toggle Placeholder */}
        <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <Moon size={20} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 p-0.5 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
              <User size={18} className="text-red-400" />
            </div>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">Agent Zero</p>
            <p className="text-xs text-slate-500">System Architect</p>
          </div>
          <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300 hidden md:block" />
        </div>
      </div>
    </motion.header>
  );
}
