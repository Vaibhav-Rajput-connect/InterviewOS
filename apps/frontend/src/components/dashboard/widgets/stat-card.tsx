import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; isPositive: boolean };
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-md overflow-hidden group"
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex justify-between items-start z-10">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-400">{title}</span>
          <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
          {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
          {trend && (
            <span className={`text-xs font-semibold mt-1 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% from last week
            </span>
          )}
        </div>
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 group-hover:text-red-400 group-hover:border-red-500/30 transition-all duration-300">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
