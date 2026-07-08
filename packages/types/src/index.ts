/**
 * InterviewOS — Shared TypeScript Type Definitions
 *
 * These types mirror the backend database models and API contracts.
 * They are the source of truth for frontend type safety.
 */

// ============================================
// User
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Resume
// ============================================

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Interview
// ============================================

export type InterviewType =
  | "behavioral"
  | "technical"
  | "system_design"
  | "coding"
  | "hr";

export type InterviewStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Interview {
  id: string;
  user_id: string;
  type: InterviewType;
  status: InterviewStatus;
  score: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// ============================================
// Question
// ============================================

export interface Question {
  id: string;
  interview_id: string;
  content: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  order: number;
}

// ============================================
// Answer
// ============================================

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  score: number | null;
  feedback: string | null;
  created_at: string;
}

// ============================================
// API Response Wrappers
// ============================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================
// Health
// ============================================

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}
