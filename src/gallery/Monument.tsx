import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { MONUMENT } from './data';
import { drawHoloChip, drawHoloCard } from './textures';
import { useRegisterTarget, type TargetMeta } from './interaction';

const OUTFIT = '/fonts/outfit-700.ttf';
const GOLD = '#c9a44b';

function toTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Ana salonun merkezindeki fütüristik anıt.
 * Oyuncu yaklaşınca yetenek çipleri ve eğitim kartı hologram gibi havada belirir;
 * tıklanınca Hakkımda paneli açılır.
 */
export function Monument({ hovered }: { hovered: boolean }) {
  const [mx, , mz] = MONUMENT.position;
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const holoRef = useRef<THREE.Group>(null);
  const chipRefs = useRef<(THREE.Mesh | null)[]>([]);
  const cardRef = useRef<THREE.Mesh>(null);
  const fade = useRef(0);
  const { camera } = useThree();

  const meta = useMemo<TargetMeta>(
    () => ({
      id: MONUMENT.id,
      kind: 'about',
      label: 'Hakkımda',
      center: [mx, 1.7, mz],
      width: 1.7,
    }),
    [mx, mz]
  );
  useRegisterTarget(groupRef, meta);

  // Hologram dokuları (mount'ta bir kez üretilir)
  const chipTextures = useMemo(() => MONUMENT.skills.map((s) => toTexture(drawHoloChip(s))), []);
  const cardTexture = useMemo(
    () => toTexture(drawHoloCard(MONUMENT.holoCard.title, [...MONUMENT.holoCard.rows])),
    []
  );
  useEffect(
    () => () => {
      chipTextures.forEach((t) => t.dispose());
      cardTexture.dispose();
    },
    [chipTextures, cardTexture]
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    // Çekirdek: sürekli yavaş dönüş + nefes alma
    if (coreRef.current) {
      coreRef.current.rotation.y += dt * 0.5;
      coreRef.current.rotation.x = Math.sin(t * 0.6) * 0.18;
      coreRef.current.position.y = 3.05 + Math.sin(t * 1.3) * 0.05;
    }

    // Yakınlık: hologramlar yumuşakça belirir/kaybolur
    const dx = camera.position.x - mx;
    const dz = camera.position.z - mz;
    const dist = Math.hypot(dx, dz);
    const target = dist < MONUMENT.activationDistance ? 1 : 0;
    fade.current = THREE.MathUtils.lerp(fade.current, target, 1 - Math.exp(-4.5 * dt));
    const f = fade.current;

    const holo = holoRef.current;
    if (holo) {
      holo.visible = f > 0.02;

      // Yetenek çipleri: yörüngede süzülür, kameraya döner (billboard)
      chipRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        const n = chipRefs.current.length;
        const angle = (i / n) * Math.PI * 2 + t * 0.22;
        const r = 1.55;
        const y = 2.05 + (i % 3) * 0.34 + Math.sin(t * 1.4 + i * 1.7) * 0.045;
        mesh.position.set(Math.cos(angle) * r, y - (1 - f) * 0.25, Math.sin(angle) * r);
        // lookAt dünya-uzayı bekler (grup y=0 ve dönmemiş → yerel y == dünya y)
        mesh.lookAt(camera.position.x, y, camera.position.z);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = f * 0.95;
      });

      // Eğitim kartı: her zaman oyuncunun olduğu tarafta, kameraya dönük
      const card = cardRef.current;
      if (card) {
        const toCam = Math.atan2(dx, dz);
        const cr = 1.35;
        card.position.set(Math.sin(toCam) * cr, 1.5 - (1 - f) * 0.2, Math.cos(toCam) * cr);
        card.lookAt(camera.position.x, 1.5, camera.position.z);
        (card.material as THREE.MeshBasicMaterial).opacity = f * 0.96;
      }
    }
  });

  return (
    <group ref={groupRef} position={[mx, 0, mz]}>
      {/* Kaide */}
      <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.9, 0.22, 48]} />
        <meshStandardMaterial color="#e9e2d2" roughness={0.85} />
      </mesh>
      {/* Sütun — koyu taş, hafif konik */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.42, 2.3, 48]} />
        <meshStandardMaterial
          color="#26221b"
          metalness={0.35}
          roughness={0.38}
          emissive={GOLD}
          emissiveIntensity={hovered ? 0.16 : 0.04}
        />
      </mesh>
      {/* Altın bilezikler */}
      {[0.55, 1.35, 2.15].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[y === 1.35 ? 0.37 : 0.4, 0.022, 12, 48]} />
          <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      {/* Sütun tepesi */}
      <mesh position={[0, 2.56, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.3, 0.12, 48]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Havada süzülen çekirdek: altın tel-kafes + iç küre */}
      <group ref={coreRef} position={[0, 3.05, 0]}>
        <mesh>
          <icosahedronGeometry args={[0.34, 1]} />
          <meshBasicMaterial color={GOLD} wireframe transparent opacity={0.85} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial
            color="#fff3d0"
            emissive="#ffdf9e"
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* İsim plakası */}
      <Text
        font={OUTFIT}
        position={[0, 0.34, 0.93]}
        fontSize={0.07}
        letterSpacing={0.18}
        color="#57534e"
        anchorX="center"
        anchorY="middle"
      >
        MELİK BAĞRIYANIK
      </Text>

      {/* Hologramlar (yaklaşınca belirir; ışın hedefi değildir) */}
      <group ref={holoRef} visible={false}>
        {MONUMENT.skills.map((skill, i) => (
          <mesh
            key={skill}
            ref={(m) => {
              chipRefs.current[i] = m;
            }}
            raycast={() => null}
          >
            <planeGeometry args={[0.74, 0.255]} />
            <meshBasicMaterial
              map={chipTextures[i]}
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        <mesh ref={cardRef} raycast={() => null}>
          <planeGeometry args={[1.6, 0.9]} />
          <meshBasicMaterial
            map={cardTexture}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
