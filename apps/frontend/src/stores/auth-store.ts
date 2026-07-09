import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  is_verified: boolean;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setToken: (token) => set({ accessToken: token, isAuthenticated: true }),
      
      setUser: (user) => set({ user }),

      logout: async () => {
        try {
          await apiClient.post("/auth/logout");
        } catch (e) {
          console.error("Logout failed", e);
        } finally {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      fetchUser: async () => {
        if (!get().accessToken) return;
        set({ isLoading: true });
        try {
          const res = await apiClient.get<User>("/auth/me");
          set({ user: res.data, isAuthenticated: true });
        } catch (error) {
          console.error("Failed to fetch user:", error);
          set({ user: null, accessToken: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated 
      }), // Only persist token
    }
  )
);
