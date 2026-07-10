import { useEffect, useMemo, useRef } from 'react';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ROOM } from './data';
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

/** Armatürün duvardan uzaklığı — eser merkezine ~30° "müze açısı" verir */
const SPOT_WALL_DIST = 1.5;
/** Işık kaynağının (spot kafası pivotu) tavandan sarkma payı */
const SPOT_HEAD_DROP = 0.22;

interface PictureSpotProps {
  /** Eser merkezinin dünya y yüksekliği (tavana kalan pay için) */
  centerY: number;
  width: number;
  height: number;
  hovered: boolean;
  lite?: boolean;
  castShadow?: boolean;
  intensity?: number;
  hoverIntensity?: number;
}

/**
 * Galeri tipi tavan spotu: tavana monte görünür armatür + esere üstten,
 * ~30° müze açısıyla düşen sıcak ışık. Koni, eserin köşegenini hafif
 * bir taşmayla kapsayacak kadar açılır — duvarda eseri saran yumuşak hale bırakır.
 */
export function PictureSpot({
  centerY,
  width,
  height,
  hovered,
  lite,
  castShadow,
  intensity = 20,
  hoverIntensity = 30,
}: PictureSpotProps) {
  const spotRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current;
    }
  }, [lite]);

  const ceilY = ROOM.height - centerY;
  const lightY = ceilY - SPOT_HEAD_DROP;
  const headTilt = Math.atan2(SPOT_WALL_DIST, lightY);
  // Koni açısı: ışıktan çerçevenin dört köşesine bakılarak kesin hesaplanır —
  // eğik eksene göre yaklaşık (köşegen/mesafe) formülü üst köşeleri karanlıkta bırakıyordu.
  const beamAngle = useMemo(() => {
    const pad = 0.26; // çerçeve payı (portrenin geniş çerçevesini de kapsar)
    const hx = (width + pad) / 2;
    const hy = (height + pad) / 2;
    const axLen = Math.hypot(lightY, SPOT_WALL_DIST);
    const ay = -lightY / axLen;
    const az = -SPOT_WALL_DIST / axLen;
    let max = 0;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const vx = sx * hx;
        const vy = sy * hy - lightY;
        const vz = -SPOT_WALL_DIST;
        const cos = (vy * ay + vz * az) / Math.hypot(vx, vy, vz);
        max = Math.max(max, Math.acos(Math.min(1, Math.max(-1, cos))));
      }
    }
    return Math.min(0.72, max + 0.06);
  }, [width, height, lightY]);

  return (
    <>
      {/* Görünür armatür: montaj tablası + sap + eğik spot kafası */}
      <group position={[0, ceilY, SPOT_WALL_DIST]}>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
          <meshStandardMaterial color="#1d1a16" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.13, 8]} />
          <meshStandardMaterial color="#1d1a16" metalness={0.5} roughness={0.5} />
        </mesh>
        <group position={[0, -SPOT_HEAD_DROP, 0]} rotation-x={headTilt}>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.055, 0.068, 0.21, 16]} />
            <meshStandardMaterial color="#26221c" metalness={0.55} roughness={0.4} />
          </mesh>
          {/* Lens — sıcak parıltı */}
          <mesh position={[0, -0.076, 0]} rotation-x={Math.PI / 2}>
            <circleGeometry args={[0.05, 16]} />
            <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
          </mesh>
        </group>
      </group>
      {!lite && (
        <>
          <object3D ref={targetRef} position={[0, 0, 0]} />
          <spotLight
            ref={spotRef}
            position={[0, lightY, SPOT_WALL_DIST]}
            angle={beamAngle}
            penumbra={0.4}
            intensity={hovered ? hoverIntensity : intensity}
            distance={9}
            decay={1.7}
            color="#fff2d9"
            castShadow={castShadow}
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0003}
          />
        </>
      )}
    </>
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

      {/* Tavan ray spotu — ışık esere üstten, müze açısıyla düşer (mobilde ışık kapalı) */}
      <PictureSpot
        centerY={placement.position[1]}
        width={width}
        height={height}
        hovered={hovered}
        lite={lite}
      />
    </group>
  );
}
