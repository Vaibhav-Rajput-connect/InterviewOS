"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { Canvas } from "@react-three/fiber";
import { NeuralBackground } from "@/components/three/neural-background";
import { LogoIcon } from "@/components/ui/icons";

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      // Wait a moment for visual effect, then redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      router.push("/login?error=auth_failed");
    }
  }, [searchParams, router, setToken]);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ alpha: true }}>
          {/* eslint-disable-next-line react/jsx-no-undef */}
          <NeuralBackground />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />

      {/* Loading Interface */}
      <motion.div
        key="success-screen"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-500 blur-[30px] opacity-30 rounded-full" />
          <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center backdrop-blur-xl relative z-10">
            <LogoIcon size={32} className="text-white animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Access Granted</h2>
        <p className="text-red-400 font-mono text-sm animate-pulse">Establishing secure connection...</p>
      </motion.div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AuthCallbackHandler />
    </Suspense>
  );
}
