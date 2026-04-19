import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const GlobePoints = () => {
  const pointsRef = useRef<THREE.Points>(null!);
  
  // Create a sphere of points
  const [positions] = useMemo(() => {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 2.5;
      pos[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      pos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return [pos];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.1;
    pointsRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#2563eb"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const GlobeAtmosphere = () => {
  return (
    <Sphere args={[2.55, 64, 64]}>
      <meshBasicMaterial
        color="#1e40af"
        transparent
        opacity={0.05}
        side={THREE.BackSide}
      />
    </Sphere>
  );
};

const GlowCore = () => {
  return (
    <Sphere args={[2.45, 64, 64]}>
      <MeshDistortMaterial
        color="#0f172a"
        speed={2}
        distort={0.4}
        transparent
        opacity={0.3}
      />
    </Sphere>
  );
};

export const Globe = () => {
  return (
    <group>
      <GlobePoints />
      <GlobeAtmosphere />
      <GlowCore />
      
      {/* Dynamic Lighting */}
      <pointLight position={[10, 10, 10]} intensity={2} color="#2563eb" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#1e40af" />
    </group>
  );
};
