import { useEffect, useMemo, useRef } from 'react';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { PaintingEntry, ProjectEntry } from './data';
import { drawPoster, useCanvasTexture, makeLightPoolTexture } from './textures';
import { useRegisterTarget, type TargetMeta } from './interaction';

let lightPoolTexture: THREE.Texture | null = null;
export function getLightPoolTexture() {
  if (!lightPoolTexture) lightPoolTexture = makeLightPoolTexture();
  return lightPoolTexture;
}

/** Eserin önünde zemine vuran sıcak ışık havuzu — fırınlanmış spot izlenimi */
export function FloorLightPool({
  centerY,
  width,
}: {
  centerY: number;
  width: number;
}) {
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position={[0, -centerY + 0.012, 0.95]}
      scale={[width * 1.35, 1.9, 1]}
      raycast={() => null}
    >
      <planeGeometry args={[1.6, 1]} />
      <meshBasicMaterial
        map={getLightPoolTexture()}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

const OUTFIT = '/fonts/outfit-700.ttf';
const INTER = '/fonts/inter-500.ttf';

function ArtSurface({ texture, width, height }: { texture: THREE.Texture; width: number; height: number }) {
  return (
    <mesh position={[0, 0, 0.075]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} roughness={0.82} metalness={0} />
    </mesh>
  );
}

function ImageSurface({ project, width, height }: { project: ProjectEntry; width: number; height: number }) {
  const texture = useTexture(project.image!);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);
  return <ArtSurface texture={texture} width={width} height={height} />;
}

function PosterSurface({ project, width, height }: { project: ProjectEntry; width: number; height: number }) {
  const texture = useCanvasTexture(() => drawPoster(project));
  return <ArtSurface texture={texture} width={width} height={height} />;
}

interface PaintingProps {
  entry: PaintingEntry;
  hovered: boolean;
  /** Mobil performans modu: eser spotları kapalı, genel ışık yeterli */
  lite?: boolean;
}

export function Painting({ entry, hovered, lite }: PaintingProps) {
  const { project, placement } = entry;
  const { width, height } = placement;
  const groupRef = useRef<THREE.Group>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  const meta = useMemo<TargetMeta>(
    () => ({
      id: project.id,
      kind: 'project',
      label: project.title,
      center: placement.position,
      normal: placement.normal,
      width,
    }),
    [project.id, project.title, placement, width]
  );
  useRegisterTarget(groupRef, meta);

  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current;
    }
  }, []);

  return (
    <group ref={groupRef} position={placement.position} rotation-y={placement.rotationY}>
      {/* Çerçeve — koyu bronz */}
      <mesh position={[0, 0, 0.035]} castShadow>
        <boxGeometry args={[width + 0.22, height + 0.22, 0.07]} />
        <meshStandardMaterial
          color="#2e2a23"
          metalness={0.6}
          roughness={0.42}
          emissive="#c9a44b"
          emissiveIntensity={hovered ? 0.32 : 0}
        />
      </mesh>
      {/* Paspartu */}
      <mesh position={[0, 0, 0.072]}>
        <planeGeometry args={[width + 0.12, height + 0.12]} />
        <meshStandardMaterial color="#f8f4ea" roughness={0.9} />
      </mesh>
      {/* Eser yüzeyi */}
      {project.image ? (
        <ImageSurface project={project} width={width} height={height} />
      ) : (
        <PosterSurface project={project} width={width} height={height} />
      )}

      {/* Eser plaketi */}
      <group position={[0, -height / 2 - 0.42, 0.02]}>
        <mesh>
          <boxGeometry args={[0.92, 0.3, 0.02]} />
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
          {project.title.toUpperCase()}
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
          {`${project.subtitle} · ${project.year}`}
        </Text>
      </group>

      {/* Zemindeki ışık havuzu */}
      <FloorLightPool centerY={placement.position[1]} width={width} />

      {/* Esere yönelen sıcak spot (mobilde kapalı) */}
      {!lite && (
        <>
          <object3D ref={targetRef} position={[0, 0, 0]} />
          <spotLight
            ref={spotRef}
            position={[0, 2.3, 2.1]}
            angle={0.58}
            penumbra={0.78}
            intensity={hovered ? 30 : 20}
            distance={9}
            decay={1.7}
            color="#fff2d9"
          />
        </>
      )}
    </group>
  );
}
