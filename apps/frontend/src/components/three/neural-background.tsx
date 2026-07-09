"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GridFloor } from "@/components/three/environment";

/**
 * Reusable animated neural network background.
 */
export function NeuralBackground() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const particleCount = 100;
  const maxDistance = 4;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = [];
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      
      vel.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }
    return { positions: pos, velocities: vel };
  }, [particleCount]);

  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const linesGeometry = useMemo(() => new THREE.BufferGeometry(), []);

  const pointMaterial = useMemo(() => new THREE.PointsMaterial({
    color: "#ef4444",
    size: 0.05,
    transparent: true,
    opacity: 0.8,
  }), []);

  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: "#f43f5e",
    transparent: true,
    opacity: 0.15,
  }), []);

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return;
    
    const posAttr = pointsRef.current.geometry.getAttribute("position");
    const posArray = posAttr.array as Float32Array;

    // Update positions
    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] += velocities[i].x;
      posArray[i * 3 + 1] += velocities[i].y;
      posArray[i * 3 + 2] += velocities[i].z;

      // Bounce
      if (Math.abs(posArray[i * 3]) > 10) velocities[i].x *= -1;
      if (Math.abs(posArray[i * 3 + 1]) > 10) velocities[i].y *= -1;
      if (posArray[i * 3 + 2] < -15 || posArray[i * 3 + 2] > 0) velocities[i].z *= -1;
    }
    posAttr.needsUpdate = true;

    // Update lines
    const linePositions = [];
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = posArray[i * 3] - posArray[j * 3];
        const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
        const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (dist < maxDistance) {
          linePositions.push(
            posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2],
            posArray[j * 3], posArray[j * 3 + 1], posArray[j * 3 + 2]
          );
        }
      }
    }
    linesRef.current.geometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  });

  return (
    <group>
      <points ref={pointsRef} geometry={pointsGeometry} material={pointMaterial} />
      <lineSegments ref={linesRef} geometry={linesGeometry} material={lineMaterial} />
      <GridFloor />
      <ambientLight intensity={0.2} color="#ff0000" />
      <directionalLight position={[0, 0, 5]} intensity={0.5} color="#ea580c" />
    </group>
  );
}
