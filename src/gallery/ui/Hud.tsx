import { AnimatePresence, motion } from 'framer-motion';
import type { TargetMeta } from '../interaction';

interface HudProps {
  visible: boolean;
  hovered: TargetMeta | null;
  isTouch: boolean;
}

export function Hud({ visible, hovered, isTouch }: HudProps) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      {/* Logo */}
      <div className="absolute top-5 left-6 text-lg font-display font-black tracking-tighter text-stone-800/90">
        MELİK<span className="text-gold-600 italic">.AI</span>
      </div>

      {/* Duraklatma ipucu */}
      {!isTouch && (
        <div className="absolute top-6 right-6 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500/80">
          ESC — Duraklat
        </div>
      )}

      {/* Crosshair */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <span
            className={`block rounded-full transition-all duration-200 ${
              hovered ? 'w-2 h-2 bg-gold-500' : 'w-1.5 h-1.5 bg-stone-800/70'
            }`}
          />
          <span
            className={`absolute rounded-full border transition-all duration-200 ${
              hovered
                ? 'w-9 h-9 border-gold-500/80'
                : 'w-5 h-5 border-stone-800/25'
            }`}
          />
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="mt-7 flex flex-col items-center gap-1"
            >
              <span className="px-3 py-1 rounded-full bg-stone-900/85 text-white text-[11px] font-bold tracking-wide backdrop-blur">
                {hovered.label}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-700/90">
                {isTouch ? 'İncele — dokun' : 'İncele — tıkla'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Kontrol ipuçları */}
      {!isTouch && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {[
            ['W A S D', 'Yürü'],
            ['Fare', 'Bak'],
            ['Shift', 'Hızlı'],
          ].map(([key, label]) => (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-stone-200/80 backdrop-blur-sm"
            >
              <span className="text-[10px] font-black tracking-widest text-stone-800">{key}</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-stone-500">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
