import { useMemo, useRef } from 'react';
import type * as THREE from 'three';
import type { BoardEntry } from './data';
import { drawBoard, useCanvasTexture } from './textures';
import { useRegisterTarget, type TargetMeta } from './interaction';

/** Hakkımda / İletişim duvar panoları — ince çerçeveli bilgi levhaları */
export function Board({ entry, hovered }: { entry: BoardEntry; hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { placement } = entry;
  const { width, height } = placement;
  const texture = useCanvasTexture(() => drawBoard(entry));

  const meta = useMemo<TargetMeta>(
    () => ({
      id: entry.id,
      kind: entry.id,
      label: entry.title === 'HAKKIMDA' ? 'Hakkımda' : 'İletişim',
      center: placement.position,
      normal: placement.normal,
      width,
    }),
    [entry, placement, width]
  );
  useRegisterTarget(groupRef, meta);

  return (
    <group ref={groupRef} position={placement.position} rotation-y={placement.rotationY}>
      <mesh position={[0, 0, 0.025]}>
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
