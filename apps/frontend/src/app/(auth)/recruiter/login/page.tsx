"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

import { NeuralBackground } from "@/components/three/neural-background";
import { AnimatedInput } from "@/components/ui/animated-input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/api-client";

export default function RecruiterLoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await apiClient.post("/recruiter/login", { email, password });
      setToken(res.data.access_token);

      setIsUnlocked(true);
      setTimeout(() => {
        router.push("/recruiter/dashboard");
      }, 1500);
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Authentication failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ alpha: true }}>
          <NeuralBackground />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />

      {/* Login Interface */}
      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div
              key="login-form"
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center mb-10">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-cyan-500 blur-[30px] opacity-30 rounded-full" />
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center backdrop-blur-xl relative z-10">
                    <Building2 size={32} className="text-cyan-400" />
                  </div>
                </div>
                <h1 className="text-3xl font-display font-bold text-white tracking-tight">Hiring Command Center</h1>
                <p className="text-slate-400 text-sm mt-2 font-mono">RECRUITER_ACCESS_PORTAL</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <AnimatedInput
                  label="Email Designation"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                  required
                />

                <div className="space-y-2">
                  <AnimatedInput
                    label="Security Key"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock size={18} />}
                    error={error}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="glow"
                  className="w-full py-4 text-base tracking-wide flex justify-between items-center group !bg-gradient-to-r !from-cyan-600 !to-blue-600 hover:!from-cyan-500 hover:!to-blue-500"
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Authenticating..." : "Initialize Session"}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#050816] px-2 text-slate-500 font-mono">OR</span>
                  </div>
                </div>

                <Link href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/google/login`} className="w-full block">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full py-3"
                  >
                    Connect with Google Nexus
                  </Button>
                </Link>
              </form>

              <p className="text-center text-sm text-slate-400 mt-8">
                No recruiter account?{" "}
                <Link href="/recruiter/signup" className="text-white hover:text-cyan-400 font-medium transition-colors border-b border-white/20 pb-0.5 hover:border-cyan-400/50">
                  Register Organization
                </Link>
              </p>

              <p className="text-center text-xs text-slate-500 mt-4">
                <Link href="/login" className="hover:text-slate-300 transition-colors">
                  ← Candidate Login
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-6" />
              <h2 className="text-2xl font-display font-bold text-white mb-2">Access Granted</h2>
              <p className="text-cyan-400 font-mono text-sm animate-pulse">Entering Command Center...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
