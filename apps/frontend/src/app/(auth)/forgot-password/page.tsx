"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";

import { NeuralBackground } from "@/components/three/neural-background";
import { AnimatedInput } from "@/components/ui/animated-input";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/ui/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
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

      {/* Interface */}
      <motion.div 
        className="relative z-10 w-full max-w-md px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center mb-10 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-red-500 blur-[30px] opacity-30 rounded-full" />
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center backdrop-blur-xl relative z-10">
                    <LogoIcon size={32} className="text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-display font-bold text-white tracking-tight">Security Bypass</h1>
                <p className="text-slate-400 text-sm mt-2 font-mono">INITIATE_PASSWORD_RESET</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatedInput
                  label="Email Designation"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                  required
                />
                
                <Button 
                  type="submit" 
                  variant="glow" 
                  className="w-full py-4 text-base tracking-wide flex justify-between items-center group"
                >
                  <span>Transmit Reset Link</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="flex justify-center mt-6">
                  <Link href="/login" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Return to Login
                  </Link>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="w-20 h-20 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center mb-6">
                <Mail className="text-green-400" size={32} />
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Transmission Sent</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                If the designation matches our records, a secure reset link has been dispatched to your terminal.
              </p>
              <Link href="/login" className="w-full block">
                <Button variant="secondary" className="w-full">
                  Return to Access Port
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
