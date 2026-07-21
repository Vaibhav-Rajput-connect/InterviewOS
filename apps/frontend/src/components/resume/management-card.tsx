"use client";

import { motion } from "framer-motion";
import { FileTextIcon, Trash2Icon, EyeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import apiClient from "@/lib/api-client";

interface ResumeManagementCardProps {
  resumeId: string;
  title: string;
  createdAt: string;
  status: string;
  onDelete: () => void;
}

export function ResumeManagementCard({
  resumeId,
  title,
  createdAt,
  status,
  onDelete,
}: ResumeManagementCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await apiClient.delete(`/resume/${resumeId}`);
      onDelete(); // Triggers parent to reset state
    } catch (err: any) {
      console.error("Failed to delete resume:", err);
      setError(err?.response?.data?.detail || "Failed to delete resume.");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto min-h-[400px] flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none rounded-3xl" />

      {/* Main Container */}
      <motion.div
        className="relative w-full p-8 rounded-3xl border-2 border-white/10 bg-white/[0.02] flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <FileTextIcon size={32} className="text-red-400" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 text-center">
          {title}
        </h3>
        
        <div className="flex flex-col items-center gap-1 mb-8">
          <p className="text-slate-400">Uploaded on {formattedDate}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-medium text-slate-500">Status:</span>
            <span className={`text-sm font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              status === 'completed' ? 'bg-green-500/10 text-green-400' :
              status === 'failed' ? 'bg-red-500/10 text-red-400' :
              'bg-orange-500/10 text-orange-400'
            }`}>
              {status}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-6 bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">
            {error}
          </p>
        )}

        {showConfirm ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 bg-red-500/5 border border-red-500/20 p-6 rounded-2xl w-full"
          >
            <p className="text-red-200 text-center font-medium">
              Are you sure you want to delete this resume? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-6 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <button
              onClick={() => router.push(`/resume/${resumeId}`)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors"
            >
              <EyeIcon size={18} />
              View Analysis
            </button>
            
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 font-medium transition-colors"
            >
              <Trash2Icon size={18} />
              Delete
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
