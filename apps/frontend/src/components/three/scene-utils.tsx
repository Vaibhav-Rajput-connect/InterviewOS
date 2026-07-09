"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { usePerformanceStore } from "@/stores/performance-store";
import { lerp } from "@/lib/utils";

/**
 * Monitors FPS and dynamically adjusts performance tier.
 */
export function PerformanceManager() {
  const setFps = usePerformanceStore((s) => s.setFps);
  const detectPerformance = usePerformanceStore((s) => s.detectPerformance);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    detectPerformance();
  }, [detectPerformance]);

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    const elapsed = now - lastTime.current;

    // Measure FPS every second
    if (elapsed >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / elapsed);
      setFps(fps);
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return null;
}

/**
 * Subtle camera rig that follows mouse position.
 * Uses refs internally to avoid re-creating callbacks on mouse state changes.
 */
export function CameraRig() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetX = useRef(0);
  const targetY = useRef(0);

  // Track mouse position via a ref to avoid re-renders
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    targetX.current = lerp(targetX.current, mouseRef.current.x * 0.3, 0.05);
    targetY.current = lerp(targetY.current, mouseRef.current.y * 0.2, 0.05);

    camera.position.x = targetX.current;
    camera.position.y = targetY.current;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
