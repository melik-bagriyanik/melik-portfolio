import { AnimatePresence, motion } from 'framer-motion';
import { SoundToggles } from './SoundToggles';

interface PausedOverlayProps {
  visible: boolean;
  onResume: () => void;
  musicOn: boolean;
  sfxOn: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
}

export function PausedOverlay({
  visible,
  onResume,
  musicOn,
  sfxOn,
  onToggleMusic,
  onToggleSfx,
}: PausedOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onResume}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-[#221f1b]/60 backdrop-blur-[3px] cursor-pointer"
        >
          <div className="px-8 py-4 rounded-2xl bg-[#28231d]/95 border border-white/10 shadow-xl shadow-black/40 text-center">
            <div className="text-sm font-display font-black tracking-tight text-stone-100 mb-1">
              Tur duraklatıldı
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-400">
              Devam etmek için tıkla
            </div>
          </div>
          <SoundToggles
            musicOn={musicOn}
            sfxOn={sfxOn}
            onToggleMusic={onToggleMusic}
            onToggleSfx={onToggleSfx}
            stopPropagation
            dark
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
