"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboardStore } from "@/stores/dashboard-store";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  VideoIcon,
  Code2Icon,
  BrainCircuitIcon,
  BarChart3Icon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { name: "Resume Lab", href: "/resume", icon: FileTextIcon },
  { name: "Interview Chamber", href: "/interview", icon: VideoIcon },
  { name: "Coding Arena", href: "/coding", icon: Code2Icon },
  { name: "AI Coach", href: "/coach", icon: BrainCircuitIcon },
  { name: "Analytics", href: "/analytics", icon: BarChart3Icon },
];

export function GlassNavigation() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useDashboardStore();

  return (
    <motion.nav
      className={`fixed bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:top-4 z-40 flex flex-row md:flex-col justify-around md:justify-between rounded-t-3xl md:rounded-3xl border border-white/10 bg-black/80 md:bg-black/40 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full pb-safe md:pb-0 ${
        isSidebarCollapsed ? "md:w-20" : "md:w-64"
      }`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="flex flex-row md:flex-col w-full md:w-auto md:gap-6 p-2 md:p-4 justify-around md:justify-start items-center md:items-stretch">
        {/* Logo Area - Hidden on mobile */}
        <div className="hidden md:flex items-center justify-between h-12 px-2">
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-xl tracking-tight text-white flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
                <span className="text-sm font-black text-white">IOS</span>
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                InterviewOS
              </span>
            </motion.div>
          )}
          {isSidebarCollapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
              <span className="text-sm font-black text-white">IOS</span>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex flex-row md:flex-col gap-1 md:gap-2 w-full md:mt-4 justify-around md:justify-start">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href} className="flex-1 md:flex-none">
                <motion.div
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-1 md:gap-4 px-2 md:px-3 py-2 md:py-3 rounded-xl cursor-pointer transition-colors ${
                    isActive
                      ? "text-white bg-white/10 md:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute md:left-0 top-0 md:top-auto w-8 md:w-1 h-1 md:h-6 bg-gradient-to-r md:bg-gradient-to-b from-red-500 to-orange-500 rounded-b-full md:rounded-b-none md:rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={20} className={isActive ? "text-red-400" : ""} />
                  {!isSidebarCollapsed && (
                    <span className="hidden md:block font-medium text-sm tracking-wide">
                      {item.name}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
          
          {/* Settings - Mobile Only */}
          <Link href="/settings" className="flex-1 md:hidden">
            <motion.div
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl cursor-pointer transition-colors ${
                pathname === "/settings" ? "text-white bg-white/10" : "text-slate-400 hover:text-white"
              }`}
            >
              <SettingsIcon size={20} className={pathname === "/settings" ? "text-red-400" : ""} />
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Bottom Area - Desktop Only */}
      <div className="hidden md:flex flex-col gap-2 p-4 border-t border-white/5">
        <Link href="/settings">
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${
              pathname === "/settings" ? "text-white bg-white/10" : "text-slate-400 hover:text-white"
            }`}
          >
            <SettingsIcon size={20} className={pathname === "/settings" ? "text-red-400" : ""} />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Settings</span>}
          </motion.div>
        </Link>
        <button
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center p-2 mt-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          {isSidebarCollapsed ? <ChevronRightIcon size={18} /> : <ChevronLeftIcon size={18} />}
        </button>
      </div>
    </motion.nav>
  );
}
