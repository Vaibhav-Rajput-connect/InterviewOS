import apiClient from "@/lib/api-client";

export interface DashboardStats {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  interview_streak: number;
  readiness_score: number;
  coding_progress: number;
}

export interface DailyGoal {
  id: string;
  title: string;
  type: string;
  target_value: number;
  current_value: number;
  is_completed: boolean;
}

export interface ActivityLog {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  goals: DailyGoal[];
  recent_activity: ActivityLog[];
}

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await apiClient.get("/dashboard/overview");
    return res.data;
  },
};
