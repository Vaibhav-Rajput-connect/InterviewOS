/**
 * UI store — application-wide UI state.
 */

import { create } from "zustand";

interface UIState {
  isMenuOpen: boolean;
  activeSection: string;
  isScrolled: boolean;

  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
  setActiveSection: (section: string) => void;
  setIsScrolled: (scrolled: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMenuOpen: false,
  activeSection: "hero",
  isScrolled: false,

  setMenuOpen: (open) => set({ isMenuOpen: open }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  setActiveSection: (section) => set({ activeSection: section }),
  setIsScrolled: (scrolled) => set({ isScrolled: scrolled }),
}));
