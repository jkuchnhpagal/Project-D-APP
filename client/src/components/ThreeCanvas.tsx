"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Frosted Glass Cube with glowing inner core
const PremiumGlassBlock = ({ position, color, size }: { position: [number, number, number]; color: string; size: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Rotating animation
      groupRef.current.rotation.x += 0.003;
      groupRef.current.rotation.y += 0.006;
      
      // Floating wave animation
      const time = state.clock.elapsedTime;
      groupRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.15;
      
      // Scaling on hover
      const targetScale = clicked ? size * 1.25 : hovered ? size * 1.12 : size;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(!clicked)}
    >
      {/* Outer Frosted Glass Block */}
      <mesh>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshPhysicalMaterial
          color={hovered ? "#d8b4fe" : "#ffffff"}
          transmission={0.9}
          roughness={0.15}
          thickness={1.2}
          ior={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Inner Glowing Core */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 4.0 : 2.0}
          roughness={0.1}
        />
      </mesh>

      {/* Wireframe wrapper for technical grid look */}
      <mesh>
        <boxGeometry args={[1.22, 1.22, 1.22]} />
        <meshBasicMaterial
          color={color}
          wireframe={true}
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
};

// Animated Node Connections (glowing network paths)
const BlockchainNetwork = () => {
  const count = 35;
  const lineGeometry = useMemo(() => new THREE.BufferGeometry(), []);
  
  // Random coordinates for nodes
  const points = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        )
      );
    }
    return arr;
  }, []);

  const speeds = useMemo(() => {
    return points.map(() => new THREE.Vector3(
      (Math.random() - 0.5) * 0.008,
      (Math.random() - 0.5) * 0.008,
      (Math.random() - 0.5) * 0.008
    ));
  }, [points]);

  const linesRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame(() => {
    // Move points
    points.forEach((p, idx) => {
      p.add(speeds[idx]);
      if (Math.abs(p.x) > 8) speeds[idx].x *= -1;
      if (Math.abs(p.y) > 5) speeds[idx].y *= -1;
      if (Math.abs(p.z) > 5) speeds[idx].z *= -1;
    });

    // Rebuild line indices connecting close nodes
    const linePairs: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = points[i].distanceTo(points[j]);
        if (dist < 4.0) {
          linePairs.push(points[i].x, points[i].y, points[i].z);
          linePairs.push(points[j].x, points[j].y, points[j].z);
        }
      }
    }

    if (linesRef.current) {
      linesRef.current.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePairs, 3)
      );
      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Update point positions
    if (pointsRef.current) {
      const positions = points.flatMap(p => [p.x, p.y, p.z]);
      pointsRef.current.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Node Spheres */}
      <points ref={pointsRef}>
        <bufferGeometry />
        <pointsMaterial color="#a78bfa" size={0.14} transparent opacity={0.7} />
      </points>
      {/* Connector Lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.2} linewidth={1} />
      </lineSegments>
    </group>
  );
};

// Background Particle Starfield
const StarfieldBackground = () => {
  const count = 600;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 35;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.25}
      />
    </Points>
  );
};

// Main Canvas Exports
const ThreeCanvas = () => {
  return (
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "auto" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#3b82f6" />
        <directionalLight position={[0, 10, 0]} intensity={0.7} color="#8b5cf6" />
        
        {/* Animated blockchain nodes */}
        <BlockchainNetwork />
        
        {/* Floating premium glass block nodes */}
        <PremiumGlassBlock position={[-2.8, 1.3, 0]} color="#3b82f6" size={0.75} />
        <PremiumGlassBlock position={[3.2, -0.8, 0.4]} color="#9b66ff" size={1.0} />
        <PremiumGlassBlock position={[0.4, -2.0, -0.8]} color="#06b6d4" size={0.55} />

        {/* Ambient starfield */}
        <StarfieldBackground />

        {/* Damped Interactive Orbit Camera Controls */}
        <OrbitControls 
          enableZoom={false} // Disable scroll wheel hijacking
          enablePan={false}  // Keep focus centered
          enableDamping={true} 
          dampingFactor={0.05} 
          maxPolarAngle={Math.PI / 1.8} 
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};

export default ThreeCanvas;
