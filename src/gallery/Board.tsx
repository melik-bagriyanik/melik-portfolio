import { useRef } from 'react';
import type * as THREE from 'three';
import type { WallPlacement } from './data';
import { useCanvasTexture } from './textures';
import { useRegisterTarget, type TargetMeta } from './interaction';

interface WallBoardProps {
  placement: WallPlacement;
  meta: TargetMeta;
  hovered: boolean;
  draw: () => HTMLCanvasElement;
}

/** İnce çerçeveli, tuval dokulu duvar panosu (Hakkımda, İletişim, Kariyer, Eğitim, Kroki) */
export function WallBoard({ placement, meta, hovered, draw }: WallBoardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { width, height } = placement;
  const texture = useCanvasTexture(draw);

  useRegisterTarget(groupRef, meta);

  return (
    <group ref={groupRef} position={placement.position} rotation-y={placement.rotationY}>
      <mesh position={[0, 0, 0.025]} castShadow>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.05]} />
        <meshStandardMaterial
          color="#2e2a23"
          metalness={0.6}
          roughness={0.42}
          emissive="#c9a44b"
          emissiveIntensity={hovered ? 0.32 : 0}
        />
      </mesh>
      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.85} toneMapped={false} />
      </mesh>
    </group>
  );
}
