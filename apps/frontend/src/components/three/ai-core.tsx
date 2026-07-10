/* eslint-disable react-hooks/purity */
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePerformanceStore } from "@/stores/performance-store";
import { useScrollY } from "@/lib/animations/hooks";
import { lerp } from "@/lib/utils";
import { SCENE_CONFIG } from "@/lib/constants";

// ============================================
// Neural Crystal Component (Centerpiece)
// ============================================

export function AICore() {
  const groupRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const scrollYRef = useScrollY();
  const tier = usePerformanceStore((s) => s.tier);

  // Memoize materials to avoid re-creation on every render
  const outerMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        emissive: new THREE.Color("#2a0000"),
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.9,
        thickness: 1.5,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transparent: true,
      }),
    []
  );

  const wireframeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ef4444",
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      }),
    []
  );

  const innerMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f43f5e",
        emissive: new THREE.Color("#ef4444"),
        emissiveIntensity: 2,
        toneMapped: false,
        wireframe: tier === "low",
      }),
    [tier]
  );

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !crystalRef.current || !innerRef.current) return;
    const time = clock.getElapsedTime();

    // Rotate the entire crystal group slowly
    crystalRef.current.rotation.y += delta * 0.2;
    crystalRef.current.rotation.x += delta * 0.15;

    // Rotate inner core in opposite direction for dynamic feel
    innerRef.current.rotation.y -= delta * 0.3;
    innerRef.current.rotation.z += delta * 0.2;

    // Pulse the scale slightly
    const pulse = 1 + Math.sin(time * 2) * 0.03;
    innerRef.current.scale.setScalar(pulse);

    // Get current scroll height proportion (approximate section tracking)
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const scrollProgress = scrollYRef.current / vh;

    // Smoothly interpolate positions based on scrollProgress
    let targetX = 0;
    let targetY = 0;
    let targetScale = 1;

    if (scrollProgress < 0.5) {
      // Hero (0)
      targetX = 0;
      targetY = 0;
      targetScale = 1;
    } else if (scrollProgress >= 0.5 && scrollProgress < 1.5) {
      // Features (1)
      const t = Math.min((scrollProgress - 0.5) * 1.5, 1);
      targetX = lerp(0, 3, t);
      targetY = lerp(0, -1, t);
      targetScale = lerp(1, 0.7, t);
    } else {
      // Why Section (2)
      const t = Math.min((scrollProgress - 1.5) * 1.5, 1);
      targetX = lerp(3, 0, t);
      targetY = lerp(-1, 2, t);
      targetScale = lerp(0.7, 0.9, t);
    }

    // Apply Lerp for smooth transition (mouse parallax handled by CameraRig)
    groupRef.current.position.x = lerp(
      groupRef.current.position.x,
      targetX,
      0.05
    );
    groupRef.current.position.y = lerp(
      groupRef.current.position.y,
      targetY,
      0.05
    );

    // Apply scale to crystal (1.2 is base scale)
    crystalRef.current.scale.setScalar(
      lerp(crystalRef.current.scale.x, targetScale * 1.2, 0.05)
    );
  });

  return (
    <group ref={groupRef}>
      {/* Outer Crystal (Glass/Transmission effect) */}
      <mesh ref={crystalRef} scale={1.2} material={outerMaterial}>
        <icosahedronGeometry args={[SCENE_CONFIG.coreRadius, 0]} />

        {/* Wireframe overlay for structural tech feel */}
        <mesh material={wireframeMaterial}>
          <icosahedronGeometry args={[SCENE_CONFIG.coreRadius + 0.02, 0]} />
        </mesh>
      </mesh>

      {/* Inner Glowing Core */}
      <mesh ref={innerRef} scale={0.7} material={innerMaterial}>
        <octahedronGeometry args={[SCENE_CONFIG.coreRadius, 1]} />
      </mesh>

      {/* Orbiting Shards */}
      <OrbitingShards
        count={tier === "high" ? 12 : tier === "medium" ? 8 : 4}
      />

      {/* Orbiting Particles */}
      <OrbitalParticles count={SCENE_CONFIG.particleCount[tier]} />

      {/* Point lights for dramatic red/orange illumination */}
      <pointLight
        position={[3, 2, 3]}
        color="#ef4444"
        intensity={2.5}
        distance={12}
      />
      <pointLight
        position={[-3, -1, 2]}
        color="#ea580c"
        intensity={2}
        distance={10}
      />
      <pointLight
        position={[0, -3, -2]}
        color="#f43f5e"
        intensity={1.5}
        distance={8}
      />

      {/* Ambient fill */}
      <ambientLight color="#ff0000" intensity={0.1} />
    </group>
  );
}

// ============================================
// Orbiting Shards
// ============================================

interface OrbitingShardsProps {
  count: number;
}

function OrbitingShards({ count }: OrbitingShardsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const shardMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        emissive: new THREE.Color("#ea580c"),
        emissiveIntensity: 0.2,
        roughness: 0.2,
        transmission: 0.8,
        thickness: 0.5,
      }),
    []
  );

  const shards = useMemo(() => {
    return Array.from({ length: count }, () => ({
      orbitRadius: 2.5 + Math.random() * 1.5,
      orbitSpeed:
        (Math.random() > 0.5 ? 1 : -1) * (0.1 + Math.random() * 0.3),
      orbitPhase: Math.random() * Math.PI * 2,
      yOffset: (Math.random() - 0.5) * 3,
      scale: 0.1 + Math.random() * 0.2,
      tiltAxis: new THREE.Vector3(
        Math.random(),
        Math.random(),
        Math.random()
      ).normalize(),
      rotationSpeed: 0.5 + Math.random() * 1.5,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    shards.forEach((s, i) => {
      const angle = time * s.orbitSpeed + s.orbitPhase;

      dummy.position.set(
        Math.cos(angle) * s.orbitRadius,
        s.yOffset + Math.sin(angle * 1.5) * 0.5,
        Math.sin(angle) * s.orbitRadius
      );

      dummy.quaternion.setFromAxisAngle(s.tiltAxis, time * s.rotationSpeed);

      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} material={shardMaterial}>
      <tetrahedronGeometry args={[1, 0]} />
    </instancedMesh>
  );
}

// ============================================
// Orbital Particles (InstancedMesh)
// ============================================

interface OrbitalParticlesProps {
  count: number;
}

function OrbitalParticles({ count }: OrbitalParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particleMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#f87171",
        transparent: true,
        opacity: 0.8,
      }),
    []
  );

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      orbitRadius: 1.8 + Math.random() * 2.0,
      orbitSpeed: 0.2 + Math.random() * 0.5,
      orbitPhase: Math.random() * Math.PI * 2,
      yOffset: (Math.random() - 0.5) * 2.5,
      scale: 0.015 + Math.random() * 0.02,
      tilt: Math.random() * Math.PI,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    particles.forEach((p, i) => {
      const angle = time * p.orbitSpeed + p.orbitPhase;
      dummy.position.set(
        Math.cos(angle) * p.orbitRadius * Math.cos(p.tilt),
        p.yOffset + Math.sin(angle * 0.5) * 0.4,
        Math.sin(angle) * p.orbitRadius
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} material={particleMaterial}>
      <sphereGeometry args={[1, 4, 4]} />
    </instancedMesh>
  );
}
