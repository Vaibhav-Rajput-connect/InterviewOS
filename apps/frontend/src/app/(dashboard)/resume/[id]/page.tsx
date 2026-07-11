"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import apiClient from "@/lib/api-client";
import { GlassCard } from "@/components/ui/cards";

export default function ResumeDashboardPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const [overview, skills, experience, projects, education] = await Promise.all([
          apiClient.get(`/resume/${id}`),
          apiClient.get(`/resume/${id}/skills`),
          apiClient.get(`/resume/${id}/experience`),
          apiClient.get(`/resume/${id}/projects`),
          apiClient.get(`/resume/${id}/education`),
        ]);

        setData({
          overview: overview.data,
          skills: skills.data,
          experience: experience.data,
          projects: projects.data,
          education: education.data,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load resume data.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p>{error || "Resume data not found."}</p>
      </div>
    );
  }

  const { overview, skills, experience, projects, education } = data;
  const analysis = overview.analysis;

  return (
    <div className="flex flex-col gap-8 h-full w-full max-w-6xl mx-auto pb-12">
      <motion.header
        className="flex flex-col items-start mt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">{overview.title}</h1>
        {analysis?.summary && (
          <p className="text-slate-400 text-lg">{analysis.summary}</p>
        )}
      </motion.header>

      {analysis && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlassCard className="p-6 border-white/10 bg-white/[0.02]">
            <h3 className="text-xl font-bold text-slate-300 mb-2">Overall Score</h3>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              {analysis.overall_score}%
            </div>
          </GlassCard>
          <GlassCard className="p-6 border-white/10 bg-white/[0.02]">
            <h3 className="text-xl font-bold text-slate-300 mb-2">ATS Score</h3>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">
              {analysis.ats_score}%
            </div>
          </GlassCard>
          <GlassCard className="p-6 border-white/10 bg-white/[0.02]">
            <h3 className="text-xl font-bold text-slate-300 mb-2">Technical Score</h3>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
              {analysis.technical_score}%
            </div>
          </GlassCard>
        </motion.div>
      )}

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <GlassCard className="p-6 border-white/10 bg-white/[0.02]">
            <h3 className="text-lg font-bold text-green-400 mb-4">Strengths</h3>
            <ul className="list-disc pl-5 text-slate-300 space-y-2">
              {analysis.strengths.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </GlassCard>
          
          <GlassCard className="p-6 border-white/10 bg-white/[0.02]">
            <h3 className="text-lg font-bold text-red-400 mb-4">Areas for Improvement</h3>
            <ul className="list-disc pl-5 text-slate-300 space-y-2">
              {analysis.weaknesses.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-6 border-white/10 bg-white/[0.02] md:col-span-2">
            <h3 className="text-lg font-bold text-blue-400 mb-4">Actionable Recommendations</h3>
            <ul className="list-disc pl-5 text-slate-300 space-y-2">
              {analysis.recommendations.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </GlassCard>

          {analysis.skill_gap && analysis.skill_gap.length > 0 && (
            <GlassCard className="p-6 border-white/10 bg-white/[0.02]">
              <h3 className="text-lg font-bold text-orange-400 mb-4">Skill Gaps</h3>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                {analysis.skill_gap.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </GlassCard>
          )}

          {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
            <GlassCard className="p-6 border-white/10 bg-white/[0.02]">
              <h3 className="text-lg font-bold text-yellow-400 mb-4">Missing ATS Keywords</h3>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                {analysis.missing_keywords.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </GlassCard>
          )}
          
          {analysis.learning_roadmap && analysis.learning_roadmap.length > 0 && (
            <GlassCard className="p-6 border-white/10 bg-white/[0.02] md:col-span-2">
              <h3 className="text-lg font-bold text-purple-400 mb-4">Learning Roadmap</h3>
              <ul className="list-decimal pl-5 text-slate-300 space-y-2">
                {analysis.learning_roadmap.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </GlassCard>
          )}

          {analysis.interview_readiness && (
            <GlassCard className="p-6 border-white/10 bg-white/[0.02] md:col-span-2">
              <h3 className="text-lg font-bold text-pink-400 mb-4">Interview Readiness</h3>
              <p className="text-slate-300">{analysis.interview_readiness}</p>
            </GlassCard>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Skills & Technologies</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill: any) => (
            <span key={skill.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300">
              {skill.name} {skill.years_experience ? `(${skill.years_experience}y)` : ""}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Experience</h2>
        <div className="flex flex-col gap-4">
          {experience.map((exp: any) => (
            <GlassCard key={exp.id} className="p-6 border-white/10 bg-white/[0.02]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                  <p className="text-red-400 font-medium">{exp.company_name}</p>
                </div>
                <div className="text-slate-500 text-sm whitespace-nowrap">
                  {exp.start_date || "Unknown"} - {exp.end_date || "Present"}
                </div>
              </div>
              <p className="text-slate-300 mt-4 whitespace-pre-wrap">{exp.description}</p>
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {exp.technologies.map((tech: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-xs text-slate-200">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
