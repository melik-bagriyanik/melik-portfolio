import { useCallback, useEffect, useRef, type RefObject } from 'react';
import type { TouchState } from '../Player';

interface TouchControlsProps {
  visible: boolean;
  touchRef: RefObject<TouchState>;
  /** Dokunulan noktadan (NDC) esere ışın atıp inceleme açar */
  onInteract: (ndc: { x: number; y: number }) => void;
}

/** Knob'un tabandan uzaklaşabileceği yarıçap (px) */
const KNOB_RADIUS = 46;
/** Bu orandan fazla itilince koşu başlar */
const SPRINT_THRESHOLD = 0.86;
/** Joystick'i yakalama alanı: taban merkezinden bu kadar uzağa kadar */
const GRAB_RADIUS = 96;

/**
 * Mobil kontroller:
 * - Sol altta SABİT sanal joystick (kenara itince koşu)
 * - Ekranın kalanında sürükleyerek bakış
 * - Kısa dokunuş = dokunulan eseri incele
 * - Sağ altta zıplama butonu
 * Knob doğrudan DOM transform ile hareket eder — dokunma başına render yok.
 */
export function TouchControls({ visible, touchRef, onInteract }: TouchControlsProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const moveTouchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const lookLast = useRef({ x: 0, y: 0 });
  const tapInfo = useRef({ t: 0, moved: 0, x: 0, y: 0 });

  const setKnob = useCallback((dx: number, dy: number, active: boolean) => {
    const knob = knobRef.current;
    const base = baseRef.current;
    if (knob) {
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      knob.style.transition = active ? 'none' : 'transform 160ms ease-out';
    }
    if (base) {
      base.dataset.active = active ? 'true' : 'false';
      base.dataset.sprint =
        active && Math.hypot(dx, dy) / KNOB_RADIUS > SPRINT_THRESHOLD ? 'true' : 'false';
    }
  }, []);

  const releaseMove = useCallback(() => {
    const ts = touchRef.current;
    moveTouchId.current = null;
    ts.move.x = 0;
    ts.move.y = 0;
    ts.sprint = false;
    setKnob(0, 0, false);
  }, [touchRef, setKnob]);

  // Katman gizlenirken (yürüyüş → odak) aktif dokunuşlar yarıda kalır:
  // tüm takip durumunu ve paylaşılan girdiyi sıfırla.
  useEffect(() => {
    if (visible) return;
    const ts = touchRef.current;
    lookTouchId.current = null;
    ts.look.dx = 0;
    ts.look.dy = 0;
    ts.jump = false;
    releaseMove();
  }, [visible, touchRef, releaseMove]);

  const applyMove = useCallback(
    (clientX: number, clientY: number) => {
      const base = baseRef.current;
      const ts = touchRef.current;
      if (!base) return;
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const len = Math.hypot(dx, dy);
      if (len > KNOB_RADIUS) {
        dx = (dx / len) * KNOB_RADIUS;
        dy = (dy / len) * KNOB_RADIUS;
      }
      const norm = Math.min(len / KNOB_RADIUS, 1);
      ts.move.x = dx / KNOB_RADIUS;
      ts.move.y = -dy / KNOB_RADIUS;
      ts.sprint = norm > SPRINT_THRESHOLD;
      setKnob(dx, dy, true);
    },
    [touchRef, setKnob]
  );

  const handleStart = useCallback(
    (e: React.TouchEvent) => {
      const base = baseRef.current;
      for (const t of Array.from(e.changedTouches)) {
        let grabbed = false;
        if (base && moveTouchId.current === null) {
          const rect = base.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          if (Math.hypot(t.clientX - cx, t.clientY - cy) < GRAB_RADIUS) {
            moveTouchId.current = t.identifier;
            applyMove(t.clientX, t.clientY);
            grabbed = true;
          }
        }
        if (!grabbed && lookTouchId.current === null && t.identifier !== moveTouchId.current) {
          lookTouchId.current = t.identifier;
          lookLast.current = { x: t.clientX, y: t.clientY };
          tapInfo.current = { t: performance.now(), moved: 0, x: t.clientX, y: t.clientY };
        }
      }
    },
    [applyMove]
  );

  const handleMove = useCallback(
    (e: React.TouchEvent) => {
      const ts = touchRef.current;
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === moveTouchId.current) {
          applyMove(t.clientX, t.clientY);
        } else if (t.identifier === lookTouchId.current) {
          const ddx = t.clientX - lookLast.current.x;
          const ddy = t.clientY - lookLast.current.y;
          lookLast.current = { x: t.clientX, y: t.clientY };
          ts.look.dx += ddx;
          ts.look.dy += ddy;
          tapInfo.current.moved += Math.abs(ddx) + Math.abs(ddy);
        }
      }
    },
    [touchRef, applyMove]
  );

  const handleEnd = useCallback(
    (e: React.TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === moveTouchId.current) {
          releaseMove();
        } else if (t.identifier === lookTouchId.current) {
          lookTouchId.current = null;
          const dt = performance.now() - tapInfo.current.t;
          if (dt < 280 && tapInfo.current.moved < 14) {
            // Kısa dokunuş: hayalet "click"i engelle (yeni açılan paneli
            // anında kapatmasın), sonra dokunulan noktadan esere ışın at
            if (e.cancelable) e.preventDefault();
            onInteract({
              x: (tapInfo.current.x / window.innerWidth) * 2 - 1,
              y: -(tapInfo.current.y / window.innerHeight) * 2 + 1,
            });
          }
        }
      }
    },
    [releaseMove, onInteract]
  );

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-30 touch-none select-none"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
    >
      {/* Sabit joystick — sol alt */}
      <div
        ref={baseRef}
        data-active="false"
        data-sprint="false"
        className="absolute pointer-events-none w-[124px] h-[124px] rounded-full border-2 border-stone-400/50 bg-white/25 backdrop-blur-sm transition-colors duration-200 data-[active=true]:border-gold-500/70 data-[active=true]:bg-white/35 data-[sprint=true]:border-gold-500 data-[sprint=true]:bg-gold-500/15 flex items-center justify-center"
        style={{
          left: 'calc(1.75rem + env(safe-area-inset-left, 0px))',
          bottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Yön işaretleri */}
        <span className="absolute top-2 text-[9px] font-black text-stone-500/70">▲</span>
        <span className="absolute bottom-2 text-[9px] font-black text-stone-500/70">▼</span>
        <span className="absolute left-2.5 text-[9px] font-black text-stone-500/70">◀</span>
        <span className="absolute right-2.5 text-[9px] font-black text-stone-500/70">▶</span>
        {/* Knob */}
        <div
          ref={knobRef}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 border border-gold-700/60 shadow-lg shadow-gold-700/30"
        />
      </div>

      {/* Zıplama butonu — sağ alt */}
      <button
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
          touchRef.current.jump = true;
        }}
        className="absolute w-[72px] h-[72px] rounded-full bg-white/40 backdrop-blur-sm border-2 border-stone-400/60 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.15em] text-stone-600 active:bg-gold-500/50 active:border-gold-600 active:text-white transition-colors"
        style={{
          right: 'calc(1.75rem + env(safe-area-inset-right, 0px))',
          bottom: 'calc(2.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        Zıpla
      </button>

      {/* İpucu — sağ altta zıplamanın üstünde, ilk saniyelerde kaybolan değil kalıcı ince yazı */}
      <div
        className="absolute text-[9px] font-semibold uppercase tracking-[0.2em] text-stone-300/70 text-right leading-relaxed pointer-events-none"
        style={{
          right: 'calc(1.75rem + env(safe-area-inset-right, 0px))',
          bottom: 'calc(8.5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        Sürükle — bak
        <br />
        Esere dokun — incele
      </div>
    </div>
  );
}
