/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api-client";

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description?: string;
  constraints?: string[];
  examples?: Array<{input: string; output: string; explanation?: string}>;
  companies?: string[];
  topics: string[];
  boilerplate?: Record<string, string>;
  status: "solved" | "attempted" | "untouched";
  bookmarked: boolean;
  acceptance?: string; // We don't have this in DB yet, but frontend expects it
}

export interface ExecutionRequest {
  language: string;
  code: string;
  problem_id?: string;
  custom_testcases?: any[];
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  time_ms: number;
  memory_kb?: number;
  status: string;
  test_results?: any[];
  passed_count?: number;
  failed_count?: number;
}

export const codingApi = {
  getProblems: async (params?: { difficulty?: string, search?: string, skip?: number, limit?: number }): Promise<CodingProblem[]> => {
    const { data } = await api.get("/coding/problems", { params });
    // Add fake acceptance rate for UI
    return data.map((p: CodingProblem) => ({
      ...p,
      acceptance: ["Easy", "Medium"].includes(p.difficulty) ? "65.2%" : "30.1%"
    }));
  },
  
  getProblem: async (id: string): Promise<CodingProblem> => {
    const { data } = await api.get(`/coding/problem/${id}`);
    return data;
  },

  toggleBookmark: async (id: string): Promise<{bookmarked: boolean}> => {
    const { data } = await api.post(`/coding/problem/${id}/bookmark`);
    return data;
  },
  
  executeCode: async (payload: ExecutionRequest): Promise<ExecutionResult> => {
    const { data } = await api.post("/coding/run", payload);
    return data;
  },

  submitCode: async (payload: ExecutionRequest): Promise<any> => {
    const { data } = await api.post("/coding/submit", payload);
    return data;
  },

  getSubmissions: async (params?: { problem_id?: string, skip?: number, limit?: number }): Promise<any> => {
    const { data } = await api.get("/coding/submissions", { params });
    return data;
  },

  getSubmission: async (id: string): Promise<any> => {
    const { data } = await api.get(`/coding/submission/${id}`);
    return data;
  },

  getHints: async (problemId: string, currentCode: string) => {
    const { data } = await api.post("/coding/hint", { problem_id: problemId, current_code: currentCode });
    return data; // { hints: [...] }
  },

  analyzeComplexity: async (problemId: string, currentCode: string) => {
    const { data } = await api.post("/coding/review", { problem_id: problemId, current_code: currentCode });
    return data;
  },

  chatWithCopilot: async (problemId: string, currentCode: string, userMessage: string, chatHistory: string) => {
    const { data } = await api.post("/coding/assistant/chat", { 
      problem_id: problemId, 
      current_code: currentCode,
      user_message: userMessage,
      chat_history: chatHistory
    });
    return data;
  }
};
