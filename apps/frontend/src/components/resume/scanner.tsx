"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloudIcon, ScanLineIcon, CheckCircle2Icon } from "lucide-react";

export function ResumeScanner() {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Simulate scan
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsComplete(true);
    }, 4000);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto h-[400px]">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none rounded-3xl" />

      {/* Main Container */}
      <motion.div
        className={`relative w-full h-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden ${
          isDragging ? "border-red-500 bg-red-500/10" : "border-white/10 bg-white/[0.02]"
        } ${isScanning || isComplete ? "border-solid border-red-500/50 bg-black/60" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={!isScanning && !isComplete ? { scale: 1.01 } : {}}
      >
        <AnimatePresence mode="wait">
          {!isScanning && !isComplete && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 text-center pointer-events-none"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <UploadCloudIcon size={32} className="text-slate-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Initialize Scanner</h3>
                <p className="text-slate-400 max-w-sm">Drag and drop your resume PDF to begin deep learning extraction.</p>
              </div>
            </motion.div>
          )}

          {isScanning && (
            <motion.div
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <FileTextIcon className="text-white w-64 h-64" />
              </div>
              
              {/* Laser Line */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-red-500 shadow-[0_0_20px_#ef4444]"
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              <div className="z-10 flex flex-col items-center gap-4">
                <ScanLineIcon size={40} className="text-red-500 animate-pulse" />
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                  Extracting Metadata...
                </h3>
              </div>
            </motion.div>
          )}

          {isComplete && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                <CheckCircle2Icon size={40} className="text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Analysis Complete</h3>
                <p className="text-green-400 font-medium">94 Data points extracted.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Minimal placeholder
function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}
