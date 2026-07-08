"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePerformanceStore } from "@/stores/performance-store";
import { SCENE_CONFIG } from "@/lib/constants";

/**
 * Ambient floating particles for background atmosphere.
 * Uses Points geometry for lightweight rendering.
 */
export function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const tier = usePerformanceStore((s) => s.tier);
  const count = SCENE_CONFIG.floatingParticleCount[tier];

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  const speeds = useMemo(() => {
    return Array.from({ length: count }, () => 0.001 + Math.random() * 0.003);
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame(() => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i];
      if (arr[i * 3 + 1] > 10) arr[i * 3 + 1] = -10;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.015}
        color="#f43f5e"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Star field background.
 */
export function StarField() {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(SCENE_CONFIG.starCount * 3);
    for (let i = 0; i < SCENE_CONFIG.starCount; i++) {
      const radius = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.005;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        color="#e2e8f0"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Infinite grid floor with distance fade.
 */
export function GridFloor() {
  const ref = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[50, 50, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vWorldPos;
          void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          varying vec3 vWorldPos;
          uniform float uTime;

          float grid(vec2 st, float res) {
            vec2 grid = abs(fract(st * res) - 0.5) / fwidth(st * res);
            return 1.0 - min(min(grid.x, grid.y), 1.0);
          }

          void main() {
            float g = grid(vWorldPos.xz, 0.5) * 0.3;
            float dist = length(vWorldPos.xz) * 0.05;
            float fade = 1.0 - smoothstep(0.0, 1.0, dist);
            gl_FragColor = vec4(0.88, 0.11, 0.28, g * fade * 0.3);
          }
        `}
      />
    </mesh>
  );
}
