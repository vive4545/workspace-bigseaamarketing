"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh, Group } from "three";

function Blob() {
  const mesh = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.12;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.1}>
      <mesh ref={mesh} scale={2.35}>
        <icosahedronGeometry args={[1, 24]} />
        <MeshDistortMaterial
          color="#1b6e85"
          emissive="#0c3b49"
          emissiveIntensity={0.35}
          roughness={0.18}
          metalness={0.55}
          distort={0.4}
          speed={1.6}
        />
      </mesh>
    </Float>
  );
}

function Accents() {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (group.current)
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });
  const dots: [number, number, number, number][] = [
    [3.2, 1.6, -2, 0.28],
    [-3.4, -1.2, -1, 0.2],
    [2.6, -2, -2, 0.16],
    [-2.8, 2.1, -1.5, 0.22],
  ];
  return (
    <group ref={group}>
      {dots.map((d, i) => (
        <Float key={i} speed={2 + i * 0.3} floatIntensity={2}>
          <mesh position={[d[0], d[1], d[2]]} scale={d[3]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color={i % 2 ? "#f0875a" : "#3fb6c9"}
              roughness={0.25}
              metalness={0.4}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.6} />
      <pointLight position={[-6, -2, 2]} intensity={40} color="#f0875a" />
      <pointLight position={[6, 3, 4]} intensity={30} color="#3fb6c9" />
      <Blob />
      <Accents />
    </Canvas>
  );
}
