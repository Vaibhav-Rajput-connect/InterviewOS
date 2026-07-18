"use client";

import { ReactNode } from "react";
import { GlassNavigation } from "@/components/dashboard/glass-navigation";
import { useDashboardStore } from "@/stores/dashboard-store";
import { DigitalTunnelTransition } from "@/components/transitions/digital-tunnel";
import { TopNavigation } from "@/components/dashboard/top-navigation";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isSidebarCollapsed } = useDashboardStore();
  const { fetchUser, user, isAuthenticated } = useAuthStore();
  const [showTransition, setShowTransition] = useState(true);

  // Fetch user if authenticated but user data is missing
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  // Play transition on first mount
  useEffect(() => {
    // Check if we already played it in this session to avoid playing on every navigation
    const hasPlayed = sessionStorage.getItem("hasPlayedTunnelTransition");
    if (hasPlayed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowTransition(false);
    }
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    sessionStorage.setItem("hasPlayedTunnelTransition", "true");
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-slate-200 font-sans selection:bg-red-500/30">
      {/* Background Gradient/Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black z-0 pointer-events-none" />
      
      {/* Cinematic Transition */}
      <DigitalTunnelTransition
        isActive={showTransition}
        onComplete={handleTransitionComplete}
      />

      {/* Main UI (faded in after transition, but we can just use normal rendering and let the transition overlay cover it) */}
      <div className={`relative z-10 flex min-h-screen transition-opacity duration-1000 ${showTransition ? 'opacity-0' : 'opacity-100'}`}>
        <GlassNavigation />
        
        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-4 pl-4 pr-4 pb-24 md:pb-4 flex flex-col ${
            isSidebarCollapsed ? "md:pl-28" : "md:pl-72"
          }`}
        >
          <TopNavigation />
          
          <div className="flex-1 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl overflow-hidden relative">
            {/* Soft inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="relative h-full overflow-y-auto p-8 custom-scrollbar">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
