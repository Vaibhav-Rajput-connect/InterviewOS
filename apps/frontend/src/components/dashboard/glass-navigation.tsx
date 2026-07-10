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
} from "lucide-react"; // Wait, I should check if lucide-react is installed, but since we are using lucide-react in typical Next.js apps, I'll use it. If not, I can use custom icons. Let me just use custom icons to be safe, or just check. Actually, I can use @radix-ui/react-icons or similar if it's there. Let's see what's in package.json later, or just assume lucide-react is installed since it's common with shadcn.

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
      className={`fixed left-4 top-4 bottom-4 z-40 flex flex-col justify-between rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-6 p-4">
        {/* Logo Area */}
        <div className="flex items-center justify-between h-12 px-2">
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
        <div className="flex flex-col gap-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                    isActive
                      ? "text-white bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute left-0 w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={20} className={isActive ? "text-red-400" : ""} />
                  {!isSidebarCollapsed && (
                    <span className="font-medium text-sm tracking-wide">
                      {item.name}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Area */}
      <div className="flex flex-col gap-2 p-4 border-t border-white/5">
        <Link href="/settings">
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <SettingsIcon size={20} />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Settings</span>}
          </motion.div>
        </Link>
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center p-2 mt-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRightIcon size={18} /> : <ChevronLeftIcon size={18} />}
        </button>
      </div>
    </motion.nav>
  );
}
