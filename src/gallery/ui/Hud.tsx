import { AnimatePresence, motion } from 'framer-motion';
import type { TargetMeta } from '../interaction';

interface HudProps {
  visible: boolean;
  hovered: TargetMeta | null;
  isTouch: boolean;
  musicOn: boolean;
  sfxOn: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
}

export function Hud({
  visible,
  hovered,
  isTouch,
  musicOn,
  sfxOn,
  onToggleMusic,
  onToggleSfx,
}: HudProps) {
  if (!visible) return null;

  return (
    // z-40: TouchControls'un tam ekran dokunma katmanının (z-30) üzerinde kalmalı —
    // aksi halde mobildeki müzik/SFX butonları dokunuş alamıyor. Katman pointer-events-none
    // olduğundan buton dışı dokunuşlar alttaki bakış katmanına geçer.
    <div className="pointer-events-none fixed inset-0 z-40 select-none">
      {/* İsim */}
      <div className="absolute top-5 left-6 text-lg font-display font-black tracking-tighter text-stone-800/90">
        MELİK <span className="text-gold-600 italic font-light">BAĞRIYANIK</span>
      </div>

      {/* Duraklatma + müzik ipuçları / mobil ses düğmeleri */}
      {!isTouch ? (
        <div className="absolute top-6 right-6 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500/80">
          <span>M — Müzik {musicOn ? '♪' : '✕'}</span>
          <span>ESC — Duraklat</span>
        </div>
      ) : (
        <div className="absolute top-5 right-5 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onToggleMusic}
            className={`w-9 h-9 rounded-full border backdrop-blur-sm flex items-center justify-center text-sm ${
              musicOn
                ? 'bg-gold-500/20 border-gold-500/50 text-gold-700'
                : 'bg-white/50 border-stone-300 text-stone-400'
            }`}
            aria-label="Müzik aç/kapat"
          >
            ♪
          </button>
          <button
            onClick={onToggleSfx}
            className={`w-9 h-9 rounded-full border backdrop-blur-sm flex items-center justify-center text-[10px] font-black ${
              sfxOn
                ? 'bg-gold-500/20 border-gold-500/50 text-gold-700'
                : 'bg-white/50 border-stone-300 text-stone-400'
            }`}
            aria-label="Efekt seslerini aç/kapat"
          >
            SFX
          </button>
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2">
          {[
            ['W A S D', 'Yürü'],
            ['Fare', 'Bak'],
            ['Shift', 'Hızlı'],
            ['Boşluk', 'Zıpla'],
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
