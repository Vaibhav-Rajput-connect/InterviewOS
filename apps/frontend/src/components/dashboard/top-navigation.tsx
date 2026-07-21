"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, User, Command, Zap, ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

export function TopNavigation() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [, setIsSearching] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLButtonElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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
            onFocus={() => setIsSearching(true)}
            onBlur={() => setIsSearching(false)}
            className="w-full bg-white/[0.03] border border-white/5 hover:border-red-500/30 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-300 shadow-sm backdrop-blur-md transition-all cursor-text focus:outline-none focus:ring-1 focus:ring-red-500/50"
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
        <button 
          onClick={() => router.push('/resume')}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20 border border-red-500/20 rounded-xl px-4 py-2 text-sm text-red-400 transition-colors"
        >
          <Zap size={16} className="fill-red-400/20" />
          <span>Quick Scan</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            ref={notifRef}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-[#0f1115] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                </div>
                <div className="p-4 flex flex-col gap-3 max-h-64 overflow-y-auto">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                      <Zap size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-200">System initialization complete.</p>
                      <p className="text-xs text-slate-500 mt-1">Just now</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 p-0.5 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  </>
                ) : (
                  <User size={18} className="text-red-400" />
                )}
              </div>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">
                {user?.full_name || "Agent Zero"}
              </p>
              <p className="text-xs text-slate-500">Candidate</p>
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${showProfileMenu ? "rotate-180" : ""} hidden md:block`} />
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-4 w-56 bg-[#0f1115] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-white/5">
                  <p className="text-sm font-medium text-white truncate">{user?.full_name || "User"}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || "user@example.com"}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <Settings size={16} />
                    Account Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors mt-1"
                  >
                    <LogOut size={16} />
                    Disconnect
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
