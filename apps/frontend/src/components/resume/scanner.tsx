"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloudIcon, ScanLineIcon, CheckCircle2Icon, FileTextIcon } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";

export function ResumeScanner() {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [dataPoints, setDataPoints] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Validate
    if (file.type !== "application/pdf" && !file.type.includes("wordprocessingml")) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit.");
      return;
    }
    
    setError(null);
    setIsScanning(true);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await apiClient.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      const data = res.data;
      console.log("Upload successful:", data);
      
      if (data.data?.data_points_extracted) {
        setDataPoints(data.data.data_points_extracted);
      }
      
      // Polling for processing status
      const pollStatus = async (id: string) => {
        try {
          const statusRes = await apiClient.get(`/resume/${id}/status`);
          if (statusRes.data.status === "completed") {
            setIsScanning(false);
            setIsComplete(true);
            setTimeout(() => {
              router.push(`/resume/${id}`);
            }, 1500); // short delay to show the completion checkmark
          } else if (statusRes.data.status === "failed") {
            setIsScanning(false);
            setError("Resume parsing failed on the server.");
          } else {
            // Still processing
            setTimeout(() => pollStatus(id), 2000);
          }
        } catch (err) {
          console.error("Polling error", err);
          setTimeout(() => pollStatus(id), 2000);
        }
      };
      
      pollStatus(data.data.id);
    } catch (err: any) {
      console.error("Upload error:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          setError(detail);
        } else if (Array.isArray(detail) && detail.length > 0) {
          setError(detail[0].msg || JSON.stringify(detail));
        } else {
          setError(JSON.stringify(detail));
        }
      } else {
        setError(err.message || "Failed to upload resume.");
      }
      setIsScanning(false);
    }
  };

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
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
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
                <p className="text-slate-400 max-w-sm mb-4">Drag and drop your resume PDF to begin deep learning extraction.</p>
                
                {error && (
                  <p className="text-red-400 text-sm mb-4 bg-red-500/10 py-1 px-3 rounded-lg border border-red-500/20">{error}</p>
                )}
                
                <label className="pointer-events-auto cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-medium transition-colors">
                  <span>Browse Files</span>
                  <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileSelect} />
                </label>
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
                <p className="text-green-400 font-medium">{dataPoints > 0 ? `${dataPoints} Data points extracted.` : "AI Extraction Complete."}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}


