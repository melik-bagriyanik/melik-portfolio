import { useEffect, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  WALLS,
  WALL_THICKNESS,
  ROOMS_INFO,
  PAINTINGS,
  PORTRAIT,
  TECHS,
  MONUMENT,
  GUESTBOOK,
  EXPERIENCES,
  EDUCATION_PLACEMENT,
  BOARDS,
  WORLD_BOUNDS,
} from '../data';
import type { MinimapState } from './minimapState';

/** Canvas İÇİNDE yaşar: her karede kamera konum/yönünü paylaşılan duruma yazar */
export function MinimapTracker({ stateRef }: { stateRef: RefObject<MinimapState> }) {
  useFrame(({ camera }) => {
    const s = stateRef.current;
    s.x = camera.position.x;
    s.z = camera.position.z;
    s.yaw = camera.rotation.y;
  });
  return null;
}

/** Haritanın ekran ölçeği (CSS px / metre) — GTA gibi yakın çevre görünür */
const VIEW_SCALE = 7;
/** Statik katman kenar payı (metre) */
const LAYER_PAD = 2;
/** Harita çapı (CSS px) */
const SIZE = 172;
const R = SIZE / 2;

/**
 * Statik kat planı bir kez offscreen tuvale çizilir (odalar, duvarlar, eserler);
 * kare başına yalnızca döndürülüp kırpılarak kopyalanır.
 */
const staticLayers = new Map<number, HTMLCanvasElement>();

function getStaticLayer(dpr: number): HTMLCanvasElement {
  const cached = staticLayers.get(dpr);
  if (cached) return cached;

  const s = VIEW_SCALE * dpr;
  const minX = WORLD_BOUNDS.minX - LAYER_PAD;
  const minZ = WORLD_BOUNDS.minZ - LAYER_PAD;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil((WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX + LAYER_PAD * 2) * s);
  canvas.height = Math.ceil((WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ + LAYER_PAD * 2) * s);
  const ctx = canvas.getContext('2d')!;
  const px = (x: number) => (x - minX) * s;
  const py = (z: number) => (z - minZ) * s;

  // Oda zeminleri
  ctx.fillStyle = '#f7f1e2';
  for (const room of ROOMS_INFO) {
    const [x1, z1, x2, z2] = room.rect;
    ctx.fillRect(px(x1), py(z1), (x2 - x1) * s, (z2 - z1) * s);
  }

  // Duvarlar — kapı boşlukları segment aralarında kendiliğinden oluşur
  ctx.fillStyle = '#3f3a33';
  const t = WALL_THICKNESS * 1.6; // haritada okunaklı kalınlık
  for (const w of WALLS) {
    if (w.axis === 'x') {
      ctx.fillRect(px(w.cx - w.len / 2), py(w.cz - t / 2), w.len * s, t * s);
    } else {
      ctx.fillRect(px(w.cx - t / 2), py(w.cz - w.len / 2), t * s, w.len * s);
    }
  }

  // Eser noktaları
  const dot = (x: number, z: number, color: string, r = 0.34) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px(x), py(z), r * s, 0, Math.PI * 2);
    ctx.fill();
  };
  for (const p of PAINTINGS) dot(p.placement.position[0], p.placement.position[2], '#c9a44b');
  dot(PORTRAIT.placement.position[0], PORTRAIT.placement.position[2], '#c9a44b');
  for (const e of EXPERIENCES) dot(e.placement.position[0], e.placement.position[2], '#c9a44b');
  dot(EDUCATION_PLACEMENT.position[0], EDUCATION_PLACEMENT.position[2], '#c9a44b');
  for (const b of BOARDS) dot(b.placement.position[0], b.placement.position[2], '#c9a44b');
  for (const tech of TECHS) dot(tech.position[0], tech.position[2], '#8a6f4e');
  dot(GUESTBOOK.position[0], GUESTBOOK.position[2], '#57534e', 0.3);

  // Anıt — altın elmas
  const mx = px(MONUMENT.position[0]);
  const mz = py(MONUMENT.position[2]);
  const mr = 0.5 * s;
  ctx.fillStyle = '#b8860b';
  ctx.beginPath();
  ctx.moveTo(mx, mz - mr);
  ctx.lineTo(mx + mr, mz);
  ctx.lineTo(mx, mz + mr);
  ctx.lineTo(mx - mr, mz);
  ctx.closePath();
  ctx.fill();

  staticLayers.set(dpr, canvas);
  return canvas;
}

interface MinimapProps {
  visible: boolean;
  stateRef: RefObject<MinimapState>;
}

/**
 * GTA usulü mini harita (sol alt): harita oyuncunun bakış yönüyle döner —
 * ileri daima yukarıdır. Ortada sabit oyuncu oku, çeperde dönen Kuzey rozeti,
 * altında bulunulan salonun adı.
 */
export function Minimap({ visible, stateRef }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const layer = getStaticLayer(dpr);

    let raf = 0;
    let lastRoom = '';

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const st = stateRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Dairesel maske + duvar dışı zemin
      ctx.save();
      ctx.beginPath();
      ctx.arc(R, R, R - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#e9e1cd';
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Harita bakış yönüyle döner: ileri daima yukarı
      ctx.translate(R, R);
      ctx.rotate(st.yaw);
      const lx = (st.x - (WORLD_BOUNDS.minX - LAYER_PAD)) * VIEW_SCALE;
      const lz = (st.z - (WORLD_BOUNDS.minZ - LAYER_PAD)) * VIEW_SCALE;
      ctx.drawImage(layer, -lx, -lz, layer.width / dpr, layer.height / dpr);
      ctx.restore();

      // Jant halkası
      ctx.beginPath();
      ctx.arc(R, R, R - 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#c9a44b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Oyuncu oku — merkezde sabit, daima yukarı bakar
      ctx.beginPath();
      ctx.moveTo(R, R - 7.5);
      ctx.lineTo(R - 5.5, R + 6);
      ctx.lineTo(R, R + 3.2);
      ctx.lineTo(R + 5.5, R + 6);
      ctx.closePath();
      ctx.fillStyle = '#c9a44b';
      ctx.strokeStyle = '#2c2823';
      ctx.lineWidth = 1.6;
      ctx.lineJoin = 'round';
      ctx.fill();
      ctx.stroke();

      // Kuzey rozeti — dünya -Z yönünü çeperde işaretler
      const nx = R + Math.sin(st.yaw) * (R - 11);
      const ny = R - Math.cos(st.yaw) * (R - 11);
      ctx.beginPath();
      ctx.arc(nx, ny, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#2c2823';
      ctx.fill();
      ctx.strokeStyle = '#f7f2e4';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#f3e3bb';
      ctx.font = '800 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('K', nx, ny + 0.5);

      // Bulunulan salon adı (GTA'daki sokak tabelası gibi)
      const room = ROOMS_INFO.find(
        (r) => st.x >= r.rect[0] && st.x <= r.rect[2] && st.z >= r.rect[1] && st.z <= r.rect[3]
      );
      const name = room ? room.name : 'Galeri';
      if (name !== lastRoom && labelRef.current) {
        lastRoom = name;
        labelRef.current.textContent = name;
      }
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [visible, stateRef]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-30 select-none flex flex-col items-center gap-2">
      <div className="rounded-full border border-stone-200/80 bg-white/55 backdrop-blur-sm shadow-xl p-1.5">
        <canvas
          ref={canvasRef}
          style={{ width: SIZE, height: SIZE }}
          className="block rounded-full"
        />
      </div>
      <div
        ref={labelRef}
        className="px-3 py-1 rounded-full bg-white/60 border border-stone-200/80 backdrop-blur-sm text-[9px] font-bold uppercase tracking-[0.25em] text-stone-600"
      >
        Giriş Holü
      </div>
    </div>
  );
}
