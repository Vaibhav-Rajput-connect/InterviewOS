import { create } from "zustand";

interface DashboardState {
  isSidebarCollapsed: boolean;
  isAssistantOpen: boolean;
  activeWidget: string | null;
  unreadNotifications: number;
  toggleSidebar: () => void;
  toggleAssistant: () => void;
  setActiveWidget: (widget: string | null) => void;
  setUnreadNotifications: (count: number) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isSidebarCollapsed: false,
  isAssistantOpen: false,
  activeWidget: null,
  unreadNotifications: 0,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleAssistant: () =>
    set((state) => ({ isAssistantOpen: !state.isAssistantOpen })),
  setActiveWidget: (widget) => set({ activeWidget: widget }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
}));
