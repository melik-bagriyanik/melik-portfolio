import { useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import type * as THREE from 'three';
import { GUESTBOOK } from './data';
import { useRegisterTarget, type TargetMeta } from './interaction';

const OUTFIT = '/fonts/outfit-700.ttf';

/**
 * Giriş/çıkış holündeki Ziyaretçi Defteri kürsüsü.
 * Tıklanınca mesaj formu açılır; mesajlar e-posta olarak iletilir.
 */
export function Guestbook({ hovered }: { hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [gx, , gz] = GUESTBOOK.position;

  const meta = useMemo<TargetMeta>(
    () => ({
      id: GUESTBOOK.id,
      kind: 'guestbook',
      label: 'Ziyaretçi Defteri',
      center: [gx, 1.05, gz],
      width: 1.0,
    }),
    [gx, gz]
  );
  useRegisterTarget(groupRef, meta);

  return (
    <group ref={groupRef} position={[gx, 0, gz]} rotation-y={GUESTBOOK.rotationY}>
      {/* Taban */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.1, 0.55]} />
        <meshStandardMaterial color="#3a3229" roughness={0.55} />
      </mesh>
      {/* Gövde — öne hafif eğimli zarif ayak */}
      <mesh position={[0, 0.6, -0.02]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.24, 1.02, 0.2]} />
        <meshStandardMaterial color="#3a3229" roughness={0.5} />
      </mesh>
      {/* Eğimli okuma yüzeyi */}
      <group position={[0, 1.14, 0.05]} rotation={[-0.42, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.74, 0.05, 0.52]} />
          <meshStandardMaterial color="#2e2823" roughness={0.45} metalness={0.15} />
        </mesh>
        {/* Altın kenar profili */}
        <mesh position={[0, -0.005, 0.26]}>
          <boxGeometry args={[0.76, 0.035, 0.03]} />
          <meshStandardMaterial color="#c9a44b" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Açık defter: iki sayfa */}
        <mesh position={[-0.165, 0.032, -0.01]} rotation={[0, 0.05, 0.035]}>
          <boxGeometry args={[0.31, 0.012, 0.42]} />
          <meshStandardMaterial color="#fbf7ec" roughness={0.9} />
        </mesh>
        <mesh position={[0.165, 0.032, -0.01]} rotation={[0, -0.05, -0.035]}>
          <boxGeometry args={[0.31, 0.012, 0.42]} />
          <meshStandardMaterial color="#f6f1e2" roughness={0.9} />
        </mesh>
        {/* Sırt çizgisi + kurdele */}
        <mesh position={[0, 0.034, -0.01]}>
          <boxGeometry args={[0.02, 0.014, 0.42]} />
          <meshStandardMaterial color="#8a6f3a" roughness={0.5} />
        </mesh>
        <mesh position={[0.08, 0.042, 0.12]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.035, 0.004, 0.2]} />
          <meshStandardMaterial
            color="#c9a44b"
            metalness={0.6}
            roughness={0.4}
            emissive="#c9a44b"
            emissiveIntensity={hovered ? 0.5 : 0.15}
          />
        </mesh>
      </group>
      {/* Ön yüz plaketi */}
      <Text
        font={OUTFIT}
        position={[0, 0.78, 0.13]}
        rotation={[0.08, 0, 0]}
        fontSize={0.042}
        letterSpacing={0.16}
        color={hovered ? '#a98438' : '#8a8378'}
        anchorX="center"
        anchorY="middle"
      >
        ZİYARETÇİ DEFTERİ
      </Text>
      <Text
        font={OUTFIT}
        position={[0, 0.7, 0.135]}
        rotation={[0.08, 0, 0]}
        fontSize={0.026}
        letterSpacing={0.12}
        color="#a8a29e"
        anchorX="center"
        anchorY="middle"
      >
        MESAJ BIRAK
      </Text>
    </group>
  );
}
