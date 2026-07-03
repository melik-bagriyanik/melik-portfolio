import { useCallback, useRef, useState, type RefObject } from 'react';
import type { TouchState } from '../Player';

interface TouchControlsProps {
  visible: boolean;
  touchRef: RefObject<TouchState>;
  onInteract: () => void;
}

const STICK_RADIUS = 48;

/** Mobil: sol joystick ile yürüme, sağ yarıda sürükleyerek bakış, kısa dokunuş = incele */
export function TouchControls({ visible, touchRef, onInteract }: TouchControlsProps) {
  const [stick, setStick] = useState<{ baseX: number; baseY: number; dx: number; dy: number } | null>(
    null
  );
  const moveTouchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const lookLast = useRef({ x: 0, y: 0 });
  const tapInfo = useRef({ t: 0, x: 0, y: 0, moved: 0 });

  const handleStart = useCallback(
    (e: React.TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        const isLeft = t.clientX < window.innerWidth * 0.42;
        if (isLeft && moveTouchId.current === null) {
          moveTouchId.current = t.identifier;
          setStick({ baseX: t.clientX, baseY: t.clientY, dx: 0, dy: 0 });
        } else if (lookTouchId.current === null) {
          lookTouchId.current = t.identifier;
          lookLast.current = { x: t.clientX, y: t.clientY };
          tapInfo.current = { t: performance.now(), x: t.clientX, y: t.clientY, moved: 0 };
        }
      }
    },
    []
  );

  const handleMove = useCallback(
    (e: React.TouchEvent) => {
      const ts = touchRef.current;
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === moveTouchId.current && stick) {
          let dx = t.clientX - stick.baseX;
          let dy = t.clientY - stick.baseY;
          const len = Math.hypot(dx, dy);
          if (len > STICK_RADIUS) {
            dx = (dx / len) * STICK_RADIUS;
            dy = (dy / len) * STICK_RADIUS;
          }
          setStick((s) => (s ? { ...s, dx, dy } : s));
          ts.move.x = dx / STICK_RADIUS;
          ts.move.y = -dy / STICK_RADIUS;
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
    [stick, touchRef]
  );

  const handleEnd = useCallback(
    (e: React.TouchEvent) => {
      const ts = touchRef.current;
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === moveTouchId.current) {
          moveTouchId.current = null;
          setStick(null);
          ts.move.x = 0;
          ts.move.y = 0;
        } else if (t.identifier === lookTouchId.current) {
          lookTouchId.current = null;
          const dt = performance.now() - tapInfo.current.t;
          if (dt < 280 && tapInfo.current.moved < 14) {
            onInteract();
          }
        }
      }
    },
    [touchRef, onInteract]
  );

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-30 touch-none"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
    >
      {/* Joystick görseli */}
      {stick ? (
        <div
          className="absolute pointer-events-none"
          style={{ left: stick.baseX - 56, top: stick.baseY - 56 }}
        >
          <div className="w-28 h-28 rounded-full border-2 border-stone-400/40 bg-white/20 backdrop-blur-sm" />
          <div
            className="absolute w-12 h-12 rounded-full bg-gold-500/80 border border-gold-600 shadow-lg"
            style={{ left: 32 + stick.dx, top: 32 + stick.dy }}
          />
        </div>
      ) : (
        <div className="absolute bottom-10 left-8 pointer-events-none opacity-50">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-stone-400/60 flex items-center justify-center">
            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 text-center leading-tight">
              Yürümek için
              <br />
              dokun
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
