"use client";

import { useRef, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { usePerformanceStore } from "@/stores/performance-store";
import { useMousePosition } from "@/lib/animations/hooks";
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
 */
export function CameraRig() {
  const mouse = useMousePosition();
  const { camera } = useThree();
  const targetX = useRef(0);
  const targetY = useRef(0);

  const updateCamera = useCallback(() => {
    targetX.current = lerp(targetX.current, mouse.x * 0.3, 0.05);
    targetY.current = lerp(targetY.current, mouse.y * 0.2, 0.05);

    camera.position.x = targetX.current;
    camera.position.y = targetY.current;
    camera.lookAt(0, 0, 0);
  }, [mouse, camera]);

  useFrame(updateCamera);

  return null;
}
