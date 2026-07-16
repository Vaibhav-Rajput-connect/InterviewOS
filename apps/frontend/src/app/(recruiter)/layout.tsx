"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserPlus,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useRecruiterStore } from "@/stores/recruiter-store";
import { DigitalTunnelTransition } from "@/components/transitions/digital-tunnel";
import { NotificationBell } from "@/components/recruiter/notification-bell";

const navItems = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Candidates", href: "/recruiter/candidates", icon: Users },
  { label: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
  { label: "Team", href: "/recruiter/team", icon: UserPlus },
  { label: "Settings", href: "/recruiter/settings", icon: Settings },
];

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, fetchUser, logout } = useAuthStore();
  const { organization, fetchOrganization } = useRecruiterStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showTransition, setShowTransition] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  useEffect(() => {
    if (isAuthenticated && !organization) {
      fetchOrganization();
    }
  }, [isAuthenticated, organization, fetchOrganization]);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("hasPlayedRecruiterTransition");
    if (hasPlayed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowTransition(false);
    }
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    sessionStorage.setItem("hasPlayedRecruiterTransition", "true");
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black z-0 pointer-events-none" />

      {/* Transition */}
      <DigitalTunnelTransition
        isActive={showTransition}
        onComplete={handleTransitionComplete}
      />

      <div className={`relative z-10 flex min-h-screen transition-opacity duration-1000 ${showTransition ? "opacity-0" : "opacity-100"}`}>
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-r border-white/5 bg-black/40 backdrop-blur-2xl ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-white" />
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
                <p className="font-display font-bold text-white text-sm truncate">
                  {organization?.name || "Command Center"}
                </p>
                <p className="text-[10px] text-cyan-400/70 font-mono">HIRING_OS</p>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="recruiter-nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-500 rounded-r-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon size={20} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-3 pb-4 space-y-2 border-t border-white/5 pt-4">
            {/* Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.03] transition-colors"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              {!collapsed && <span className="text-sm">Collapse</span>}
            </button>

            {/* User */}
            {user && !collapsed && (
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user.full_name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <LogOut size={18} />
              {!collapsed && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-4 pr-4 flex flex-col ${
            collapsed ? "pl-28" : "pl-72"
          }`}
        >
          <div className="flex-1 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute top-6 right-8 z-50">
              <NotificationBell />
            </div>
            <div className="relative h-full overflow-y-auto p-8 pt-20 custom-scrollbar">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
