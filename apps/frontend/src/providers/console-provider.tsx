"use client";

import { useEffect } from "react";

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalWarn = console.warn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.warn = (...args: any[]) => {
        if (args.length > 0 && typeof args[0] === "string" && args[0].includes("THREE.Clock")) {
          // Suppress THREE.Clock deprecation warning from react-three-fiber
          return;
        }
        originalWarn.apply(console, args);
      };
    }
  }, []);

  return <>{children}</>;
}
