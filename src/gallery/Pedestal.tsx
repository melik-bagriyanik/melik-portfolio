import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TechEntry, SculptureKind } from './data';
import { makeBlobShadowTexture } from './textures';
import { useRegisterTarget, type TargetMeta } from './interaction';

const OUTFIT = '/fonts/outfit-700.ttf';

let blobTexture: THREE.Texture | null = null;
function getBlobTexture() {
  if (!blobTexture) blobTexture = makeBlobShadowTexture();
  return blobTexture;
}

const MATERIALS = {
  gold: { color: '#c9a44b', metalness: 0.9, roughness: 0.24 },
  stone: { color: '#35312a', metalness: 0.15, roughness: 0.48 },
  bronze: { color: '#8c6a3f', metalness: 0.85, roughness: 0.34 },
} as const;

function Sculpture({ kind, material }: { kind: SculptureKind; material: TechEntry['material'] }) {
  const props = MATERIALS[material];
  switch (kind) {
    case 'rings':
      // React atomu: üç yörünge + çekirdek
      return (
        <group>
          {[0, Math.PI / 3, (2 * Math.PI) / 3].map((rz) => (
            <mesh key={rz} rotation={[Math.PI / 2.6, 0, rz]} castShadow>
              <torusGeometry args={[0.3, 0.026, 16, 64]} />
              <meshStandardMaterial {...props} />
            </mesh>
          ))}
          <mesh castShadow>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshStandardMaterial {...props} />
          </mesh>
        </group>
      );
    case 'cube':
      return (
        <mesh rotation={[Math.PI / 5, Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial {...props} />
        </mesh>
      );
    case 'torusKnot':
      return (
        <mesh castShadow>
          <torusKnotGeometry args={[0.22, 0.07, 160, 20]} />
          <meshStandardMaterial {...props} />
        </mesh>
      );
    case 'prism':
      return (
        <mesh castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.58, 6]} />
          <meshStandardMaterial {...props} flatShading />
        </mesh>
      );
    case 'stack':
      // Veritabanı sembolü: üç disk
      return (
        <group>
          {[-0.19, 0, 0.19].map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow>
              <cylinderGeometry args={[0.28, 0.28, 0.12, 32]} />
              <meshStandardMaterial {...props} />
            </mesh>
          ))}
        </group>
      );
    case 'icosahedron':
      return (
        <mesh castShadow>
          <icosahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial {...props} flatShading />
        </mesh>
      );
    case 'slab':
      // Telefon plakası: mobil geliştirme
      return (
        <group rotation={[0.12, 0.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.58, 0.05]} />
            <meshStandardMaterial {...props} />
          </mesh>
          <mesh position={[0, 0, 0.028]}>
            <boxGeometry args={[0.27, 0.5, 0.006]} />
            <meshStandardMaterial color="#1c1917" metalness={0.4} roughness={0.18} />
          </mesh>
        </group>
      );
  }
}

export function Pedestal({ entry, hovered }: { entry: TechEntry; hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const sculptureRef = useRef<THREE.Group>(null);

  const meta = useMemo<TargetMeta>(
    () => ({
      id: entry.id,
      kind: 'tech',
      label: entry.title,
      center: [entry.position[0], 1.35, entry.position[2]],
      width: 1.2,
    }),
    [entry]
  );
  useRegisterTarget(groupRef, meta);

  useFrame((state, dt) => {
    if (sculptureRef.current) {
      sculptureRef.current.rotation.y += dt * 0.4;
      sculptureRef.current.position.y =
        1.58 + Math.sin(state.clock.elapsedTime * 1.1 + entry.position[2]) * 0.02;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[entry.position[0], 0, entry.position[2]]}
      rotation-y={entry.rotationY}
    >
      {/* Taban + gövde + tabla */}
      <mesh position={[0, 0.075, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.92, 0.15, 0.92]} />
        <meshStandardMaterial color="#e9e2d2" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[0.6, 1.0, 0.6]} />
        <meshStandardMaterial color="#efe8d8" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.18, 0]} castShadow>
        <boxGeometry args={[0.76, 0.06, 0.76]} />
        <meshStandardMaterial
          color="#e9e2d2"
          roughness={0.8}
          emissive="#c9a44b"
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      {/* Altın kaide bileziği */}
      <mesh position={[0, 1.13, 0]}>
        <boxGeometry args={[0.64, 0.025, 0.64]} />
        <meshStandardMaterial color="#c9a44b" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Dönen heykel */}
      <group ref={sculptureRef} position={[0, 1.58, 0]}>
        <Sculpture kind={entry.sculpture} material={entry.material} />
      </group>

      {/* Plaket */}
      <Text
        font={OUTFIT}
        position={[0, 0.78, 0.315]}
        fontSize={0.05}
        letterSpacing={0.12}
        color={hovered ? '#a98438' : '#57534e'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.56}
        textAlign="center"
      >
        {entry.title.toUpperCase()}
      </Text>

      {/* Temas gölgesi — crosshair bunu hedef saymasın */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0]} raycast={() => null}>
        <planeGeometry args={[1.7, 1.7]} />
        <meshBasicMaterial map={getBlobTexture()} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}
