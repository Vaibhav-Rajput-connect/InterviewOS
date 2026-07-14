"use client";

import React, { memo } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

interface DashboardMetrics {
  interview_readiness: number;
  consistency_streak: number;
  total_problems: number;
  resume_trend: { date: string; score: number }[];
  coding_accuracy: { date: string; accuracy: number; problems_solved: number }[];
  skill_distribution: { subject: string; score: number; fullMark: number }[];
  activity_heatmap: { date: string; count: number }[];
}

interface AnalyticsChartsProps {
  metrics: DashboardMetrics;
}

const AnalyticsCharts = memo(({ metrics }: AnalyticsChartsProps) => {
  return (
    <>
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Trend */}
        <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl h-[350px] flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Resume Score Trend</h3>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.resume_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coding Accuracy */}
        <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl h-[350px] flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Coding Accuracy & Volume</h3>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.coding_accuracy} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Accuracy (%)" />
                <Line yAxisId="right" type="step" dataKey="problems_solved" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Problems Solved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-6">
        {/* Skill Distribution */}
        <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl h-[350px] flex flex-col items-center">
          <h3 className="text-lg font-semibold text-white mb-2 w-full text-left">Skill Distribution</h3>
          <div className="flex-1 w-full h-full -mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={metrics.skill_distribution}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl h-[350px] flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Activity Heatmap</h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-1.5 flex-wrap">
              {metrics.activity_heatmap.map((day, i) => {
                let colorClass = "bg-slate-800";
                if (day.count === 1) colorClass = "bg-emerald-900";
                else if (day.count === 2) colorClass = "bg-emerald-700";
                else if (day.count >= 3 && day.count <= 4) colorClass = "bg-emerald-500";
                else if (day.count > 4) colorClass = "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]";

                return (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-sm ${colorClass} transition-colors hover:ring-2 ring-white/20`}
                    title={`${day.date}: ${day.count} activities`}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-slate-800" />
            <div className="w-3 h-3 rounded-sm bg-emerald-900" />
            <div className="w-3 h-3 rounded-sm bg-emerald-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400" />
            <span>More</span>
          </div>
        </div>
      </div>
    </>
  );
});

AnalyticsCharts.displayName = "AnalyticsCharts";
export default AnalyticsCharts;
