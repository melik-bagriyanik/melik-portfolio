import { Text } from '@react-three/drei';
import {
  ROOM,
  WALLS,
  LINTELS,
  SIGNS,
  ABOUT,
  WALL_THICKNESS,
  DOOR_HEIGHT,
  type WallSegment,
} from './data';

const H = ROOM.height;
const T = WALL_THICKNESS;

const WALL_COLOR = '#f6f1e6';
const OUTFIT = '/fonts/outfit-700.ttf';

function WallBox({ seg }: { seg: WallSegment }) {
  const size: [number, number, number] =
    seg.axis === 'x' ? [seg.len, H, T] : [T, H, seg.len];
  // Köşelerde dik kesişen süpürgelikler üst üste biner; üst yüzeyleri aynı
  // yükseklikte kalırsa z-fighting titremesi olur. Eksene göre göze görünmez
  // bir yükseklik farkı düzlemleri ayırır.
  const bbH = seg.axis === 'x' ? 0.16 : 0.152;
  // Uç yüzler kapı sövelerinde duvarın uç yüzüyle aynı düzleme denk gelir;
  // 2'şer cm içeri çekerek çakışmayı kaldır (köşelerde dik süpürgelik örter).
  const bbLen = seg.len - 0.04;
  return (
    <group position={[seg.cx, 0, seg.cz]}>
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      {/* Süpürgelik */}
      <mesh position={[0, bbH / 2, 0]}>
        <boxGeometry
          args={
            seg.axis === 'x'
              ? [bbLen, bbH, T + 0.05]
              : [T + 0.05, bbH, bbLen]
          }
        />
        <meshStandardMaterial color="#3a352c" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Lintel({ seg }: { seg: WallSegment }) {
  const height = H - DOOR_HEIGHT;
  const size: [number, number, number] =
    seg.axis === 'x' ? [seg.len, height, T] : [T, height, seg.len];
  return (
    <group position={[seg.cx, DOOR_HEIGHT + height / 2, seg.cz]}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      {/* Kapı üstü altın profil — alt yüzü lentodan aşağı, uçları 1.5'er cm
          dışarı taşırılır; aynı düzlemde kalan yüzeyler z-fighting titremesi yapar */}
      <mesh position={[0, -height / 2 - 0.012, 0]}>
        <boxGeometry
          args={
            seg.axis === 'x'
              ? [seg.len + 0.03, 0.09, T + 0.04]
              : [T + 0.04, 0.09, seg.len + 0.03]
          }
        />
        <meshStandardMaterial color="#c9a44b" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Skylight({
  x,
  z,
  sx,
  sz,
}: {
  x: number;
  z: number;
  sx: number;
  sz: number;
}) {
  return (
    <mesh rotation-x={Math.PI / 2} position={[x, H - 0.015, z]}>
      <planeGeometry args={[sx, sz]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#fff3d6"
        emissiveIntensity={1.5}
        toneMapped={false}
      />
    </mesh>
  );
}

export function Room() {
  return (
    <group>
      {/* Zemin — cilalı taş (tüm kompleksi kaplar) */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[39.2, 41.2]} />
        <meshStandardMaterial
          color="#dfd6c3"
          roughness={0.32}
          metalness={0.06}
          envMapIntensity={0.55}
        />
      </mesh>

      {/* Tavan */}
      <mesh rotation-x={Math.PI / 2} position={[0, H, 0]}>
        <planeGeometry args={[39.2, 41.2]} />
        <meshStandardMaterial color="#fbf8f0" roughness={0.95} />
      </mesh>

      {/* Oda ışıklıkları */}
      <Skylight x={0} z={2} sx={2.6} sz={12} />
      <Skylight x={-13} z={2} sx={9} sz={2.2} />
      <Skylight x={13} z={2} sx={9} sz={2.2} />
      <Skylight x={0} z={-13} sx={2.6} sz={10} />
      <Skylight x={0} z={15} sx={2.2} sz={7} />
      {/* Ana salon ışıklık altın profilleri */}
      {[-1.42, 1.42].map((x) => (
        <mesh key={x} position={[x, H - 0.045, 2]}>
          <boxGeometry args={[0.09, 0.07, 12]} />
          <meshStandardMaterial color="#c9a44b" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}

      {/* Duvarlar ve kapı lentoları */}
      {WALLS.map((seg, i) => (
        <WallBox key={`w${i}`} seg={seg} />
      ))}
      {LINTELS.map((seg, i) => (
        <Lintel key={`l${i}`} seg={seg} />
      ))}

      {/* Onur duvarı tipografisi — ana salon, Teknoloji kapısının üstü */}
      <Text
        font={OUTFIT}
        position={[0, 4.5, -5.82]}
        fontSize={0.46}
        letterSpacing={0.14}
        color="#292524"
        anchorX="center"
        anchorY="middle"
      >
        {ABOUT.name}
      </Text>
      <Text
        font={OUTFIT}
        position={[0, 3.98, -5.82]}
        fontSize={0.14}
        letterSpacing={0.42}
        color="#a98438"
        anchorX="center"
        anchorY="middle"
      >
        {ABOUT.role}
      </Text>

      {/* Yönlendirme tabelaları */}
      {SIGNS.map((sign) => (
        <Text
          key={sign.text}
          font={OUTFIT}
          position={sign.position}
          rotation-y={sign.rotationY}
          fontSize={sign.size ?? 0.13}
          letterSpacing={0.32}
          color={sign.size && sign.size > 0.2 ? '#57534e' : '#a98438'}
          anchorX="center"
          anchorY="middle"
        >
          {sign.text}
        </Text>
      ))}

      {/* Işıklandırma */}
      <ambientLight intensity={0.5} color="#fff8ec" />
      <hemisphereLight args={['#fffbf0', '#cfc2a6', 0.55]} />
      <directionalLight
        position={[5, 9, 4]}
        intensity={1.3}
        color="#fff6e2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-bias={-0.0004}
        // shadow-camera-* prop'ları projeksiyonu otomatik yenilemez
        onUpdate={(self) => self.shadow.camera.updateProjectionMatrix()}
      />
      {/* Oda dolgu ışıkları (spotu olmayan bölgeler) */}
      <pointLight position={[-13, 4.2, 2]} intensity={14} distance={17} decay={1.8} color="#fff2d9" />
      <pointLight position={[0, 4.2, -13]} intensity={14} distance={17} decay={1.8} color="#fff2d9" />
      <pointLight position={[0, 4.2, 15]} intensity={10} distance={13} decay={1.8} color="#fff2d9" />
    </group>
  );
}
