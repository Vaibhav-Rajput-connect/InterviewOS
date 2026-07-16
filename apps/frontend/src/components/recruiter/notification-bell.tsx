"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, Calendar, Activity, Brain, UserPlus, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useNotificationStore, NotificationType } from "@/stores/notification-store";
import { formatDistanceToNow } from "date-fns";

import React from "react";

const ICONS: Record<NotificationType, React.ElementType> = {
  "Interview Scheduled": Calendar,
  "Candidate Status Changed": Activity,
  "AI Evaluation Ready": Brain,
  "New Candidate": UserPlus,
  "Reminder": Clock,
};

const COLORS: Record<NotificationType, string> = {
  "Interview Scheduled": "text-blue-400 bg-blue-500/20 border-blue-500/30",
  "Candidate Status Changed": "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
  "AI Evaluation Ready": "text-violet-400 bg-violet-500/20 border-violet-500/30",
  "New Candidate": "text-cyan-400 bg-cyan-500/20 border-cyan-500/30",
  "Reminder": "text-amber-400 bg-amber-500/20 border-amber-500/30",
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-black" />
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Mark all as read"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Clear all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Bell size={20} className="text-slate-500" />
                  </div>
                  <p className="text-slate-400 text-sm">You&apos;re all caught up!</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notification) => {
                    const Icon = ICONS[notification.type];
                    return (
                      <div
                        key={notification.id}
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                        className={`group relative p-4 flex gap-4 border-b border-white/5 transition-colors cursor-pointer ${
                          notification.isRead ? "hover:bg-white/[0.02]" : "bg-cyan-500/[0.02] hover:bg-cyan-500/[0.04]"
                        }`}
                      >
                        {!notification.isRead && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-cyan-500 rounded-r-full" />
                        )}
                        
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${COLORS[notification.type]}`}>
                          <Icon size={16} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`text-sm font-semibold truncate ${notification.isRead ? "text-slate-300" : "text-white"}`}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap shrink-0 mt-0.5">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.link && (
                            <Link 
                              href={notification.link}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              View details <ChevronRight size={12} className="ml-0.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-white/10 bg-black/50">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors text-center"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
