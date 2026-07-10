"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { User, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { NeuralBackground } from "@/components/three/neural-background";
import { AnimatedInput } from "@/components/ui/animated-input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { LogoIcon } from "@/components/ui/icons";

// Animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
  }),
};

export default function SignupPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const handleNext = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      handleNext();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Register User
      await authApi.register(formData);
      
      // 2. Auto-login to get token
      const loginData = await authApi.login({ email: formData.email, password: formData.password });
      setToken(loginData.access_token);
      
      // 3. Go to onboarding
      router.push("/onboard");
      
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Registration failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ alpha: true }}>
          <NeuralBackground />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-0" />

      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="flex flex-col items-center mb-8">
          <LogoIcon size={40} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Identity Creation</h1>
          
          {/* Stepper */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-12 h-1 rounded-full transition-colors duration-500 ${step >= i ? "bg-red-500" : "bg-white/10"}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[360px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="absolute inset-0"
            >
              <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
                
                {step === 1 && (
                  <div className="space-y-5">
                    <AnimatedInput
                      label="Designation (Full Name)"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      icon={<User size={18} />}
                      required
                    />
                    <AnimatedInput
                      label="Communication Uplink (Email)"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      icon={<Mail size={18} />}
                      required
                    />
                    <div className="flex justify-between items-center mt-6">
                      <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                        Cancel Protocol
                      </Link>
                      <Button type="button" onClick={handleNext} disabled={!formData.full_name || !formData.email}>
                        Proceed <ArrowRight size={18} />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <AnimatedInput
                      label="Security Key (Password)"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      icon={<Lock size={18} />}
                      error={error}
                      required
                    />
                    <p className="text-xs text-slate-500 pl-2">Security key must be at least 8 characters long.</p>
                    
                    <div className="flex justify-between items-center mt-6">
                      <Button type="button" variant="ghost" onClick={handleBack} disabled={isLoading}>
                        <ArrowLeft size={18} /> Revert
                      </Button>
                      <Button type="submit" variant="glow" disabled={!formData.password || isLoading}>
                        {isLoading ? "Creating Identity..." : "Finalize"}
                      </Button>
                    </div>
                  </div>
                )}

              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
