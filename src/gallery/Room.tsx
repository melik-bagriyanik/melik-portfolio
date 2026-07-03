import { Text } from '@react-three/drei';
import { ROOM, ABOUT } from './data';

const W = ROOM.width;
const L = ROOM.length;
const H = ROOM.height;

const WALL_COLOR = '#f6f1e6';
const OUTFIT = '/fonts/outfit-700.ttf';
const INTER = '/fonts/inter-500.ttf';

export function Room() {
  return (
    <group>
      {/* Zemin — cilalı taş görünümü (env yansımasıyla yumuşak parlaklık) */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color="#dfd6c3" roughness={0.32} metalness={0.06} envMapIntensity={0.55} />
      </mesh>

      {/* Tavan */}
      <mesh rotation-x={Math.PI / 2} position={[0, H, 0]}>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color="#fbf8f0" roughness={0.95} />
      </mesh>

      {/* Tavan ışıklığı — galeri boyunca süzülen sıcak şerit */}
      <mesh rotation-x={Math.PI / 2} position={[0, H - 0.015, 0]}>
        <planeGeometry args={[2.6, L - 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff3d6" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      {/* Işıklık altın kenar profilleri */}
      {[-1.38, 1.38].map((x) => (
        <mesh key={x} position={[x, H - 0.04, 0]}>
          <boxGeometry args={[0.09, 0.07, L - 8]} />
          <meshStandardMaterial color="#c9a44b" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}

      {/* Duvarlar */}
      <mesh position={[-W / 2 - 0.15, H / 2, 0]}>
        <boxGeometry args={[0.3, H, L]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[W / 2 + 0.15, H / 2, 0]}>
        <boxGeometry args={[0.3, H, L]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[0, H / 2, -L / 2 - 0.15]}>
        <boxGeometry args={[W + 0.6, H, 0.3]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[0, H / 2, L / 2 + 0.15]}>
        <boxGeometry args={[W + 0.6, H, 0.3]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>

      {/* Süpürgelikler */}
      <mesh position={[-W / 2 + 0.03, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.16, L]} />
        <meshStandardMaterial color="#3a352c" roughness={0.6} />
      </mesh>
      <mesh position={[W / 2 - 0.03, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.16, L]} />
        <meshStandardMaterial color="#3a352c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.08, -L / 2 + 0.03]}>
        <boxGeometry args={[W, 0.16, 0.06]} />
        <meshStandardMaterial color="#3a352c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.08, L / 2 - 0.03]}>
        <boxGeometry args={[W, 0.16, 0.06]} />
        <meshStandardMaterial color="#3a352c" roughness={0.6} />
      </mesh>

      {/* Onur duvarı tipografisi (galerinin sonu) */}
      <Text
        font={OUTFIT}
        position={[0, 4.15, -L / 2 + 0.02]}
        fontSize={0.5}
        letterSpacing={0.14}
        color="#292524"
        anchorX="center"
        anchorY="middle"
      >
        {ABOUT.name}
      </Text>
      <Text
        font={OUTFIT}
        position={[0, 3.62, -L / 2 + 0.02]}
        fontSize={0.15}
        letterSpacing={0.42}
        color="#a98438"
        anchorX="center"
        anchorY="middle"
      >
        {ABOUT.role}
      </Text>

      {/* Giriş duvarı */}
      <Text
        font={OUTFIT}
        position={[0, 3.0, L / 2 - 0.02]}
        rotation-y={Math.PI}
        fontSize={0.34}
        letterSpacing={0.3}
        color="#57534e"
        anchorX="center"
        anchorY="middle"
      >
        SANAL GALERİ
      </Text>
      <Text
        font={INTER}
        position={[0, 2.55, L / 2 - 0.02]}
        rotation-y={Math.PI}
        fontSize={0.12}
        letterSpacing={0.5}
        color="#a8a29e"
        anchorX="center"
        anchorY="middle"
      >
        MMXXVI · İSTANBUL
      </Text>

      {/* Işıklandırma */}
      <ambientLight intensity={0.5} color="#fff8ec" />
      <hemisphereLight args={['#fffbf0', '#cfc2a6', 0.55]} />
      <directionalLight
        position={[5, 9, 4]}
        intensity={1.35}
        color="#fff6e2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0004}
      />
    </group>
  );
}
