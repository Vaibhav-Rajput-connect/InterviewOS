"use client";

import { motion } from "framer-motion";
import { ResumeScanner } from "@/components/resume/scanner";

export default function ResumeLabPage() {
  return (
    <div className="flex flex-col gap-8 h-full w-full max-w-5xl mx-auto">
      
      <motion.header 
        className="flex flex-col items-center justify-center text-center mt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Intelligence Lab Active
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Resume Upload Protocol
        </h1>
        <p className="text-slate-400 mt-4 max-w-2xl text-lg">
          Feed your resume into the core. Our deep learning engine will extract your experience, map your skill graph, and calibrate the mock interview parameters.
        </p>
      </motion.header>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <ResumeScanner />
      </motion.div>

    </div>
  );
}
