/**
 * InterviewOS — Design & Application Constants
 */

// ============================================
// Navigation
// ============================================

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Why InterviewOS", href: "#why" },
] as const;

// ============================================
// Features
// ============================================

export const FEATURES = [
  {
    id: "ai-mock-interviews",
    title: "AI Mock Interviews",
    description:
      "Practice with AI-powered interviewers that adapt to your level. Get real-time feedback on your answers, body language, and confidence.",
    icon: "mic",
    gradient: "from-red-500 to-orange-400",
  },
  {
    id: "coding-arena",
    title: "Coding Arena",
    description:
      "Solve coding challenges in a real IDE environment. AI evaluates your approach, time complexity, and code quality in real-time.",
    icon: "code",
    gradient: "from-rose-500 to-red-400",
  },
  {
    id: "resume-intelligence",
    title: "Resume Intelligence",
    description:
      "AI analyzes your resume against job descriptions. Get actionable suggestions to boost your match score and stand out.",
    icon: "file",
    gradient: "from-orange-500 to-rose-400",
  },
  {
    id: "ai-coach",
    title: "AI Coach",
    description:
      "Your personal interview coach that learns your strengths and weaknesses. Provides personalized study plans and improvement strategies.",
    icon: "brain",
    gradient: "from-red-400 to-rose-500",
  },
  {
    id: "analytics",
    title: "Performance Analytics",
    description:
      "Track your progress with detailed analytics. Visualize improvement over time across technical skills, communication, and confidence.",
    icon: "chart",
    gradient: "from-rose-400 to-orange-500",
  },
  {
    id: "recruiter-mode",
    title: "Recruiter Mode",
    description:
      "Companies use InterviewOS to streamline their hiring. AI-assisted candidate evaluation with bias detection and structured scoring.",
    icon: "users",
    gradient: "from-orange-400 to-red-500",
  },
] as const;



// ============================================
// Timeline / Why InterviewOS
// ============================================

export const TIMELINE_ITEMS = [
  {
    title: "Traditional Interview Prep is Broken",
    description:
      "Hours of generic practice, no personalized feedback, and zero insight into real interview patterns. Most candidates go in unprepared.",
  },
  {
    title: "AI That Understands Context",
    description:
      "InterviewOS uses advanced AI to simulate real interviews tailored to your target company, role, and experience level.",
  },
  {
    title: "Practice Makes Perfect",
    description:
      "With unlimited AI-powered mock interviews, coding challenges, and real-time coaching, you build confidence that shows.",
  },
  {
    title: "Data-Driven Improvement",
    description:
      "Track every metric that matters. Our analytics engine identifies patterns in your performance and creates personalized improvement plans.",
  },
] as const;

// ============================================
// Three.js Scene
// ============================================

export const SCENE_CONFIG = {
  particleCount: {
    high: 200,
    medium: 100,
    low: 50,
  },
  coreRadius: 1.2,
  ringCount: 3,
  starCount: 2000,
  floatingParticleCount: {
    high: 150,
    medium: 80,
    low: 40,
  },
  cameraPosition: [0, 0, 6] as const,
  ambientLightIntensity: 0.15,
} as const;

// ============================================
// Performance Tiers
// ============================================

export const PERFORMANCE_THRESHOLDS = {
  high: 50, // FPS above this = high tier
  medium: 30, // FPS above this = medium tier
  // Below medium = low tier
} as const;

// ============================================
// Breakpoints (matching Tailwind)
// ============================================

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// ============================================
// API
// ============================================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
