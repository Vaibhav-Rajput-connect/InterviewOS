"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./hero-scene-inner").then((m) => m.HeroSceneInner), {
  ssr: false,
});

/**
 * Lazy-loaded hero scene wrapper with SSR protection.
 */
export function HeroScene() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <Suspense fallback={<SceneFallback />}>
        <Scene />
      </Suspense>
    </div>
  );
}

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-32 w-32 rounded-full bg-blue-500/10 animate-pulse-glow" />
    </div>
  );
}
