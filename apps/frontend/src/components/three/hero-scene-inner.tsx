"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { AICore } from "./ai-core";
import { FloatingParticles, StarField, GridFloor } from "./environment";
import { PerformanceManager, CameraRig } from "./scene-utils";
import { usePerformanceStore } from "@/stores/performance-store";
import { SCENE_CONFIG } from "@/lib/constants";

export function HeroSceneInner() {
  const dpr = usePerformanceStore((s) => s.dpr);

  return (
    <Canvas
      camera={{ position: [...SCENE_CONFIG.cameraPosition], fov: 45 }}
      dpr={Math.min(dpr, window.devicePixelRatio)}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      <PerformanceManager />
      <CameraRig />

      {/* Lighting */}
      <ambientLight intensity={SCENE_CONFIG.ambientLightIntensity} />

      {/* Core scene */}
      <AICore />

      {/* Environment */}
      <FloatingParticles />
      <StarField />
      <GridFloor />

      <Preload all />
    </Canvas>
  );
}
