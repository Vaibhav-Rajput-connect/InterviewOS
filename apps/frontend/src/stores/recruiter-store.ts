import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/api-client";

export interface RecruiterOrganization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
  description?: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: string;
  joined_at: string;
}

interface RecruiterState {
  organization: RecruiterOrganization | null;
  orgRole: string | null;
  members: TeamMember[];
  isLoading: boolean;

  // Actions
  fetchOrganization: () => Promise<void>;
  fetchMembers: () => Promise<void>;
  setOrganization: (org: RecruiterOrganization) => void;
  reset: () => void;
}

export const useRecruiterStore = create<RecruiterState>()(
  persist(
    (set) => ({
      organization: null,
      orgRole: null,
      members: [],
      isLoading: false,

      fetchOrganization: async () => {
        set({ isLoading: true });
        try {
          const res = await apiClient.get("/recruiter/me");
          set({
            organization: res.data.organization,
            orgRole: res.data.org_role,
          });
        } catch {
          set({ organization: null, orgRole: null });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMembers: async () => {
        try {
          const res = await apiClient.get<TeamMember[]>("/recruiter/org/members");
          set({ members: res.data });
        } catch {
          set({ members: [] });
        }
      },

      setOrganization: (org) => set({ organization: org }),

      reset: () => set({ organization: null, orgRole: null, members: [] }),
    }),
    {
      name: "recruiter-storage",
      partialize: (state) => ({
        organization: state.organization,
        orgRole: state.orgRole,
      }),
    }
  )
);
