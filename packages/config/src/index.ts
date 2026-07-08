/**
 * Shared configuration constants.
 */

export const APP_CONFIG = {
  name: "InterviewOS",
  tagline: "The AI Operating System for Interview Success.",
  version: "0.1.0",
  url: "https://interviewos.ai",
} as const;

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  timeout: 30000,
} as const;
