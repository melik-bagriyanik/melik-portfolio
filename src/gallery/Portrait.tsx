import { useEffect, useMemo, useRef } from 'react';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PORTRAIT } from './data';
import { FloorLightPool, PictureSpot } from './Painting';
import { useRegisterTarget, type TargetMeta } from './interaction';

const OUTFIT = '/fonts/outfit-700.ttf';
const INTER = '/fonts/inter-500.ttf';

interface PortraitProps {
  hovered: boolean;
  lite?: boolean;
}

/** Ana salondaki sanatçı portresi — tıklanınca Hakkımda paneli açılır */
export function Portrait({ hovered, lite }: PortraitProps) {
  const { placement } = PORTRAIT;
  const { width, height } = placement;
  const groupRef = useRef<THREE.Group>(null);

  const texture = useTexture(PORTRAIT.image);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  const meta = useMemo<TargetMeta>(
    () => ({
      id: PORTRAIT.id,
      kind: 'about',
      label: 'Melik Bağrıyanık',
      center: placement.position,
      normal: placement.normal,
      width,
    }),
    [placement, width]
  );
  useRegisterTarget(groupRef, meta);

  return (
    <group ref={groupRef} position={placement.position} rotation-y={placement.rotationY}>
      {/* Dış çerçeve — koyu bronz */}
      <mesh position={[0, 0, 0.035]} castShadow>
        <boxGeometry args={[width + 0.26, height + 0.26, 0.07]} />
        <meshStandardMaterial
          color="#2e2a23"
          metalness={0.6}
          roughness={0.42}
          emissive="#c9a44b"
          emissiveIntensity={hovered ? 0.32 : 0}
        />
      </mesh>
      {/* İç altın fileto — portreyi onore eden ikinci çerçeve */}
      <mesh position={[0, 0, 0.068]}>
        <planeGeometry args={[width + 0.14, height + 0.14]} />
        <meshStandardMaterial color="#c9a44b" metalness={0.8} roughness={0.32} />
      </mesh>
      {/* Paspartu */}
      <mesh position={[0, 0, 0.071]}>
        <planeGeometry args={[width + 0.08, height + 0.08]} />
        <meshStandardMaterial color="#f8f4ea" roughness={0.9} />
      </mesh>
      {/* Portre */}
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.82} metalness={0} />
      </mesh>

      {/* Plaket */}
      <group position={[0, -height / 2 - 0.42, 0.02]}>
        <mesh>
          <boxGeometry args={[1.1, 0.3, 0.02]} />
          <meshStandardMaterial color={hovered ? '#f6efdd' : '#f1ece0'} roughness={0.7} />
        </mesh>
        <Text
          font={OUTFIT}
          position={[0, 0.055, 0.015]}
          fontSize={0.062}
          letterSpacing={0.1}
          color="#292524"
          anchorX="center"
          anchorY="middle"
        >
          {PORTRAIT.title}
        </Text>
        <Text
          font={INTER}
          position={[0, -0.055, 0.015]}
          fontSize={0.038}
          letterSpacing={0.04}
          color="#8a8378"
          anchorX="center"
          anchorY="middle"
        >
          {PORTRAIT.subtitle}
        </Text>
      </group>

      {/* Zemindeki ışık havuzu */}
      <FloorLightPool centerY={placement.position[1]} width={width + 0.6} />

      {/* Tavan ray spotu — galerinin tek gerçek gölge üreten spotu */}
      <PictureSpot
        centerY={placement.position[1]}
        width={width}
        height={height}
        hovered={hovered}
        lite={lite}
        castShadow
        intensity={24}
        hoverIntensity={32}
      />
    </group>
  );
}
