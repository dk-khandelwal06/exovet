"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "../theme/ThemeProvider";

// Scientifically inspired relative planetary data
const PLANETS = [
  { name: "Mercury", size: 0.28, dist: 3.8, speed: 1.6, color: "#A5A5A5", rotSpeed: 0.01 },
  { name: "Venus", size: 0.52, dist: 5.6, speed: 1.2, color: "#E3BB7B", rotSpeed: 0.008 },
  { name: "Earth", size: 0.58, dist: 7.8, speed: 1.0, color: "#2B82C9", hasAtmosphere: true, rotSpeed: 0.02 },
  { name: "Mars", size: 0.38, dist: 10.2, speed: 0.8, color: "#C1440E", rotSpeed: 0.018 },
  { name: "Jupiter", size: 1.35, dist: 14.2, speed: 0.45, color: "#D4A373", isGasGiant: true, rotSpeed: 0.04 },
  { name: "Saturn", size: 1.15, dist: 18.5, speed: 0.32, color: "#E0CA94", hasRings: true, rotSpeed: 0.038 },
  { name: "Uranus", size: 0.82, dist: 22.8, speed: 0.22, color: "#70D6FF", rotSpeed: 0.025 },
  { name: "Neptune", size: 0.80, dist: 26.5, speed: 0.16, color: "#2A6F97", rotSpeed: 0.022 },
];

function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.15;
    }
    if (glowRef.current) {
      const scale = 1.0 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Star Core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#FFAA00" />
      </mesh>
      {/* Corona Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#FFDD44" transparent opacity={0.25} side={THREE.BackSide} />
      </mesh>
      {/* Omnidirectional Starlight */}
      <pointLight color="#FFE8A3" intensity={3.5} distance={80} decay={1.2} />
    </group>
  );
}

function OrbitRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.025, radius + 0.025, 64]} />
      <meshBasicMaterial color="#00E5FF" transparent opacity={0.14} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SaturnRings({ innerRadius, outerRadius }: { innerRadius: number; outerRadius: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2.5, 0.2, 0]}>
      <ringGeometry args={[innerRadius, outerRadius, 64]} />
      <meshStandardMaterial
        color="#D6B885"
        side={THREE.DoubleSide}
        transparent
        opacity={0.75}
        roughness={0.6}
      />
    </mesh>
  );
}

function Planet({ data, reducedMotion }: { data: typeof PLANETS[0]; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (reducedMotion) return;

    // Orbital revolution
    angleRef.current += delta * data.speed * 0.2;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * data.dist;
      groupRef.current.position.z = Math.sin(angleRef.current) * data.dist;
    }

    // Axial rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * data.rotSpeed * 2.0;
    }
  });

  // Procedural Earth atmosphere or Jupiter cloud simulation
  return (
    <group ref={groupRef} position={[Math.cos(angleRef.current) * data.dist, 0, Math.sin(angleRef.current) * data.dist]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial
          color={data.color}
          roughness={data.isGasGiant ? 0.3 : 0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Earth Cloud / Atmosphere Layer */}
      {data.hasAtmosphere && (
        <mesh scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[data.size, 24, 24]} />
          <meshBasicMaterial color="#70D6FF" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Saturn's Iconic Rings */}
      {data.hasRings && (
        <SaturnRings innerRadius={data.size * 1.3} outerRadius={data.size * 2.4} />
      )}
    </group>
  );
}

function Starfield({ count = 3500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribute stars on a wide spherical shell
      const r = 40 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = (r * Math.sin(phi) * Math.sin(theta)) * 0.7; // slight galactic disc flattening
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Star hues: bluish white, warm gold, white
      const hueChoice = Math.random();
      if (hueChoice < 0.6) {
        col[i * 3] = 0.9; col[i * 3 + 1] = 0.95; col[i * 3 + 2] = 1.0; // Cool white
      } else if (hueChoice < 0.85) {
        col[i * 3] = 0.4; col[i * 3 + 1] = 0.85; col[i * 3 + 2] = 1.0; // Cyan
      } else {
        col[i * 3] = 1.0; col[i * 3 + 1] = 0.8; col[i * 3 + 2] = 0.5; // Amber/Gold
      }
    }
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.22}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function Scene({ reducedMotion, theme }: { reducedMotion: boolean; theme: string }) {
  useFrame(({ camera, clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime() * 0.05;
    // Slow cinematic camera drift
    camera.position.x = Math.sin(t) * 4.0;
    camera.position.y = 14 + Math.sin(t * 0.7) * 2.0;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={theme === "light" ? 0.8 : 0.25} />
      <Starfield count={theme === "light" ? 1500 : 3500} />
      <Sun />
      {PLANETS.map((planet) => (
        <React.Fragment key={planet.name}>
          <OrbitRing radius={planet.dist} />
          <Planet data={planet} reducedMotion={reducedMotion} />
        </React.Fragment>
      ))}
    </>
  );
}

export default function SolarSystemBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);

    // WebGL check
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setWebGLSupported(false);
    } catch {
      setWebGLSupported(false);
    }

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (!mounted) return null;

  // Fallback CSS starfield if WebGL not supported
  if (!webGLSupported) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 overflow-hidden"
      style={{
        opacity: theme === "light" ? 0.35 : theme === "twilight" ? 0.6 : 0.85,
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 16, 26], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <Scene reducedMotion={reducedMotion} theme={theme} />
      </Canvas>
    </div>
  );
}
