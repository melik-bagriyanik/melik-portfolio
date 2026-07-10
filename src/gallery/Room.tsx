import { Text } from '@react-three/drei';
import {
  ROOM,
  WALLS,
  LINTELS,
  SIGNS,
  ARROW_SIGNS,
  ABOUT,
  WALL_THICKNESS,
  DOOR_HEIGHT,
  type WallSegment,
  type ArrowSignEntry,
} from './data';

const H = ROOM.height;
const T = WALL_THICKNESS;

const WALL_COLOR = '#45403a'; // sıcak koyu gri — modern galeri, siyaha kaçmadan
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
        <meshStandardMaterial color="#161310" roughness={0.6} />
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
        color="#fff6e0"
        emissive="#ffedc9"
        emissiveIntensity={1.25}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Altın geometrik ok + etiket — yön tabelası (font'a bağımlı değil) */
function ArrowSign({ sign }: { sign: ArrowSignEntry }) {
  const flip = sign.dir === 'left' ? -1 : 1;
  return (
    <group position={sign.position} rotation-y={sign.rotationY}>
      {/* Ok: şaft + uç */}
      <group position={[flip * 0.14, 0, 0]} scale={[flip, 1, 1]}>
        <mesh position={[0.06, 0, 0]}>
          <boxGeometry args={[0.16, 0.024, 0.014]} />
          <meshStandardMaterial color="#c9a44b" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0.17, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.045, 0.09, 4]} />
          <meshStandardMaterial color="#c9a44b" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>
      <Text
        font={OUTFIT}
        position={[flip * -0.1, 0, 0]}
        fontSize={0.082}
        letterSpacing={0.16}
        color="#d3aa54"
        anchorX={sign.dir === 'right' ? 'right' : 'left'}
        anchorY="middle"
      >
        {sign.label}
      </Text>
    </group>
  );
}

export function Room() {
  return (
    <group>
      {/* Zemin — koyu cilalı beton (tüm kompleksi kaplar) */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[39.2, 41.2]} />
        <meshStandardMaterial
          color="#403b34"
          roughness={0.3}
          metalness={0.08}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Tavan — duvarlardan bir tık açık sıcak gri; ışıklıklar çevresi okunur kalır */}
      <mesh rotation-x={Math.PI / 2} position={[0, H, 0]}>
        <planeGeometry args={[39.2, 41.2]} />
        <meshStandardMaterial color="#5a544b" roughness={0.95} />
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
        color="#f7f1e2"
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
        color="#e3c06c"
        anchorX="center"
        anchorY="middle"
      >
        {ABOUT.role}
      </Text>

      {/* Oklu yön tabelaları */}
      {ARROW_SIGNS.map((sign) => (
        <ArrowSign key={sign.label} sign={sign} />
      ))}

      {/* Yönlendirme tabelaları */}
      {SIGNS.map((sign) => (
        <Text
          key={sign.text}
          font={OUTFIT}
          position={sign.position}
          rotation-y={sign.rotationY}
          fontSize={sign.size ?? 0.13}
          letterSpacing={0.32}
          color={sign.size && sign.size > 0.2 ? '#b7b0a2' : '#d3aa54'}
          anchorX="center"
          anchorY="middle"
        >
          {sign.text}
        </Text>
      ))}

      {/* Işıklandırma — kısık genel ışık; sahneyi spotlar ve ışıklıklar taşır */}
      <ambientLight intensity={0.42} color="#ffeedd" />
      {/* Alt ton tavanın aldığı ışığı belirler (tavan aşağı bakar) — siyaha çekme */}
      <hemisphereLight args={['#8a8175', '#39342d', 0.55]} />
      <directionalLight
        position={[5, 9, 4]}
        intensity={0.75}
        color="#ffe9c8"
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
      <pointLight position={[-13, 4.2, 2]} intensity={13} distance={17} decay={1.8} color="#ffe6bb" />
      <pointLight position={[0, 4.2, -13]} intensity={13} distance={17} decay={1.8} color="#ffe6bb" />
      <pointLight position={[0, 4.2, 15]} intensity={9} distance={13} decay={1.8} color="#ffe6bb" />
    </group>
  );
}
