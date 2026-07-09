"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Briefcase, Target, UploadCloud, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedInput } from "@/components/ui/animated-input";

const ONBOARDING_STEPS = [
  { id: "career", title: "Career Trajectory", icon: Briefcase },
  { id: "tech", title: "Technology Stack", icon: Code },
  { id: "goals", title: "Objective Parameters", icon: Target },
  { id: "resume", title: "Data Ingestion", icon: UploadCloud },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Dummy state for UI purposes
  const [data, setData] = useState({
    role: "",
    experience: "",
    targetCompany: "",
    languages: "",
  });

  const nextStep = () => {
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      router.push("/dashboard"); // Final transition
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Holographic Rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="w-[800px] h-[800px] rounded-full border border-red-500/30 border-dashed"
        />
        <motion.div 
          animate={{ rotate: -360 }} 
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] rounded-full border border-orange-500/20"
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-bold text-white mb-4"
          >
            Configure Environment
          </motion.h1>
          <div className="flex justify-center gap-4">
            {ONBOARDING_STEPS.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${
                  idx === currentStep ? "border-red-500 bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]" :
                  idx < currentStep ? "border-green-500/50 bg-green-500/10 text-green-400" :
                  "border-white/10 bg-white/5 text-slate-500"
                }`}>
                  {idx < currentStep ? <CheckCircle size={18} /> : <step.icon size={18} />}
                </div>
                <span className="text-[10px] uppercase tracking-widest mt-2 text-slate-500 font-mono">
                  Module {idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl text-white font-medium mb-6">Current Designation</h2>
                <AnimatedInput 
                  label="Current Role (e.g. Frontend Engineer)" 
                  value={data.role}
                  onChange={e => setData({...data, role: e.target.value})}
                />
                <AnimatedInput 
                  label="Years of Experience" 
                  type="number"
                  value={data.experience}
                  onChange={e => setData({...data, experience: e.target.value})}
                />
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl text-white font-medium mb-6">Core Competencies</h2>
                <AnimatedInput 
                  label="Primary Languages (comma separated)" 
                  value={data.languages}
                  onChange={e => setData({...data, languages: e.target.value})}
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {["React", "Python", "Node.js", "Go", "AWS"].map(tech => (
                    <span key={tech} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 cursor-pointer">
                      + {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl text-white font-medium mb-6">Target Objectives</h2>
                <AnimatedInput 
                  label="Dream Company" 
                  value={data.targetCompany}
                  onChange={e => setData({...data, targetCompany: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {["System Design", "Algorithms", "Behavioral", "Frontend"].map(type => (
                    <div key={type} className="p-4 rounded-xl border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 cursor-pointer transition-colors text-center text-sm text-slate-300">
                      {type}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-red-500/50 flex items-center justify-center mb-6 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer group">
                  <UploadCloud className="text-red-400 group-hover:scale-110 transition-transform" size={32} />
                </div>
                <h2 className="text-xl text-white font-medium mb-2">Ingest Resume Data</h2>
                <p className="text-slate-400 text-sm text-center max-w-sm">
                  Upload your PDF resume. Our Neural Core will automatically parse and configure your interview environment.
                </p>
                <p className="text-xs text-slate-500 mt-6 cursor-pointer hover:text-white transition-colors">Skip for now</p>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-10 flex justify-end">
            <Button onClick={nextStep} variant={currentStep === 3 ? "glow" : "primary"}>
              {currentStep === 3 ? "Initialize System" : "Next Module"} <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
