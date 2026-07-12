"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Precompute particles for the tunnel
const particleCount = 2000;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  // Create a cylindrical tunnel
  const theta = Math.random() * Math.PI * 2;
  const radius = 2 + Math.random() * 2;
  const z = (Math.random() - 0.5) * 50;
  
  positions[i * 3] = Math.cos(theta) * radius;
  positions[i * 3 + 1] = Math.sin(theta) * radius;
  positions[i * 3 + 2] = z;
}

function TunnelScene() {
  useFrame((state) => {
    // Move the camera forward through the tunnel
    state.camera.position.z -= 0.5;
    // Rotate slightly for a cinematic effect
    state.camera.rotation.z += 0.002;
  });

  return (
    <group>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ff4a4a" // Match InterviewOS primary glow
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {/* Subtle ambient light */}
      <ambientLight intensity={0.5} />
      {/* Fog to hide the end of the tunnel */}
      <fog attach="fog" args={["#000000", 10, 40]} />
    </group>
  );
}

export const DigitalTunnelTransition = React.memo(function DigitalTunnelTransition({
  isActive,
  onComplete,
}: {
  isActive: boolean;
  onComplete: () => void;
}) {
  const [show, setShow] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true);
      // Play transition for 3 seconds before completing
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onComplete, 1000); // Wait for fade out
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(false);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
        >
          <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
            <TunnelScene />
          </Canvas>
          
          {/* Overlay Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-white text-3xl font-bold tracking-[0.2em] uppercase mix-blend-screen"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                Initializing AI Core...
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
