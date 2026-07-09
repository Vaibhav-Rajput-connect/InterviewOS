import apiClient from "@/lib/api-client";
import { User } from "@/stores/auth-store";

export const authApi = {
  login: async (data: Record<string, string>) => {
    const res = await apiClient.post("/auth/login", data);
    return res.data; // { access_token, token_type }
  },

  register: async (data: Record<string, string>) => {
    const res = await apiClient.post("/auth/register", data);
    return res.data as User;
  },

  verifyEmail: async (token: string) => {
    const res = await apiClient.post("/auth/verify-email", { token });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post("/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (data: Record<string, string>) => {
    const res = await apiClient.post("/auth/reset-password", data);
    return res.data;
  },
};
