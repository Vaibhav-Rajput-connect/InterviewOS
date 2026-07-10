/* eslint-disable react-hooks/purity */
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function EnergyCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.5;
      coreRef.current.rotation.x = t * 0.2;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 0.8;
      ringRef1.current.rotation.y = t * 0.3;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x = -t * 0.5;
      ringRef2.current.rotation.z = t * 0.6;
    }
  });

  return (
    <group>
      {/* Outer Rings */}
      <mesh ref={ringRef1} scale={2.5}>
        <torusGeometry args={[1, 0.02, 16, 100]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.3} />
      </mesh>
      <mesh ref={ringRef2} scale={2.8}>
        <torusGeometry args={[1, 0.01, 16, 100]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.2} />
      </mesh>

      {/* Pulsing Core */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere ref={coreRef} args={[1, 64, 64]} scale={1.5}>
          <MeshDistortMaterial
            color="#ef4444"
            emissive="#b91c1c"
            emissiveIntensity={2}
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            wireframe={true}
          />
        </Sphere>
        {/* Inner solid core */}
        <Sphere args={[0.8, 32, 32]} scale={1.5}>
          <meshStandardMaterial
            color="#000000"
            emissive="#450a0a"
            emissiveIntensity={1}
            roughness={0.4}
            metalness={1}
          />
        </Sphere>
      </Float>
    </group>
  );
}

function Particles() {
  const count = 200;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      p[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = radius * Math.cos(phi);
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.z = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#fca5a5"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function AICoreScene() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ef4444" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f97316" />
        
        <EnergyCore />
        <Particles />
      </Canvas>
      {/* Overlay gradient to blend with background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
