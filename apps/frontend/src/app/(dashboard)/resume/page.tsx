"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ResumeScanner } from "@/components/resume/scanner";
import { ResumeManagementCard } from "@/components/resume/management-card";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { Loader2Icon } from "lucide-react";

interface ResumeSummary {
  id: string;
  title: string;
  parsing_status: string;
  created_at: string;
}

export default function ResumeLabPage() {
  const [existingResume, setExistingResume] = useState<ResumeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<ResumeSummary[]>("/resume");
      if (res.data && res.data.length > 0) {
        // Enforce 1-resume policy on the frontend as well
        setExistingResume(res.data[0]);
      } else {
        setExistingResume(null);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

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

      <div className="mt-8 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Loader2Icon className="w-8 h-8 text-red-500 animate-spin" />
            </motion.div>
          ) : existingResume ? (
            <motion.div
              key="management"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <ResumeManagementCard 
                resumeId={existingResume.id}
                title={existingResume.title}
                createdAt={existingResume.created_at}
                status={existingResume.parsing_status}
                onDelete={() => setExistingResume(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <ResumeScanner />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
