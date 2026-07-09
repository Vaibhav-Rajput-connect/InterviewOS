"use client";

import { useState, forwardRef, InputHTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, icon, type = "text", className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;
    const hasValue = Boolean(props.value || props.defaultValue);
    const isFloating = isFocused || hasValue;

    return (
      <div className={cn("relative w-full", className)}>
        <div
          className={cn(
            "relative flex items-center rounded-xl bg-white/[0.03] border transition-colors duration-300",
            error
              ? "border-red-500/50 bg-red-500/[0.02]"
              : isFocused
              ? "border-rose-500/50 bg-white/[0.06]"
              : "border-white/[0.1] hover:border-white/[0.2]"
          )}
        >
          {icon && (
            <div className="pl-4 text-slate-400">
              {icon}
            </div>
          )}

          <div className="relative flex-1">
            <motion.label
              initial={false}
              animate={{
                y: isFloating ? -12 : 0,
                scale: isFloating ? 0.8 : 1,
                color: error ? "#ef4444" : isFocused ? "#f43f5e" : "#94a3b8",
              }}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 origin-left pointer-events-none transition-colors",
                icon && "left-0"
              )}
            >
              {label}
            </motion.label>

            <input
              ref={ref}
              type={currentType}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              className={cn(
                "w-full bg-transparent px-4 pb-2 pt-6 text-sm text-white outline-none placeholder:text-transparent",
                icon && "pl-3"
              )}
              {...props}
            />
          </div>

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-4 text-slate-400 hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {error && !isPassword && (
            <div className="pr-4 text-red-400">
              <AlertCircle size={18} />
            </div>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-6 left-1 text-xs text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";
