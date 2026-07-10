import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SoundToggles } from './SoundToggles';

interface IntroOverlayProps {
  visible: boolean;
  progress: number;
  loading: boolean;
  isTouch: boolean;
  onEnter: () => void;
  musicOn: boolean;
  sfxOn: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
}

export function IntroOverlay({
  visible,
  progress,
  loading,
  isTouch,
  onEnter,
  musicOn,
  sfxOn,
  onToggleMusic,
  onToggleSfx,
}: IntroOverlayProps) {
  // useProgress ilk boyamada 0/false döner; en az bir yükleme başlangıcı görmeden
  // "hazır" deme. Yükleyici hiç tetiklenmezse 7 sn sonra yine de kapıyı aç.
  const [started, setStarted] = useState(false);
  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    if (loading) setStarted(true);
  }, [loading]);

  useEffect(() => {
    const t = setTimeout(() => setForceReady(true), 7000);
    return () => clearTimeout(t);
  }, []);

  const ready = forceReady || (started && !loading && progress >= 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            // Kapanış solması sırasında ilk joystick/fare girişini yutma
            pointerEvents: 'none',
            transition: { duration: 0.9, ease: 'easeInOut' },
          }}
          className={`fixed inset-0 z-50 overflow-y-auto [scrollbar-gutter:stable] ${
            // Mobil GPU'da canlı sahne üzerinde backdrop-blur çok pahalı — dokunmatikte opak zemin
            // Galeriyle aynı koyu ton; mobilde blur pahalı olduğundan opak zemin
            isTouch ? 'bg-[#221f1b]' : 'bg-[#221f1b]/95 backdrop-blur-md'
          }`}
        >
          <div className="min-h-full flex items-center justify-center px-6 py-10">
          <div className="max-w-2xl mx-auto text-center">
            {/* Giriş koreografisi yalnızca solma — y kayması, arka plan geldiği anda
                "metinler yukarı kayıyor" izlenimi veriyordu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 mb-6 sm:mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-600" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-bold">
                Sanal Sanat Galerisi
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tighter text-stone-100 mb-4"
            >
              MELİK <span className="italic font-light text-gold-500">BAĞRIYANIK</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-[10px] sm:text-xs font-bold tracking-[0.3em] sm:tracking-[0.4em] text-stone-400 uppercase mb-6 sm:mb-8"
            >
              Full Stack Developer · React & Mobile · İstanbul
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-stone-300 text-sm sm:text-base md:text-lg leading-relaxed mb-7 sm:mb-10 max-w-lg mx-auto"
            >
              Projelerim bir galerinin duvarlarında sergileniyor. İçeride özgürce dolaş;
              bir eserin önünde durup incelediğinde hikayesi, canlı önizlemesi ve kaynak
              kodlarıyla karşına çıkacak.
            </motion.p>

            {/* Kontrol şeması */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-12"
            >
              {(isTouch
                ? [
                    ['Joystick', 'Yürü'],
                    ['Kenara it', 'Koş'],
                    ['Sürükle', 'Etrafına bak'],
                    ['Esere dokun', 'İncele'],
                  ]
                : [
                    ['W A S D', 'Yürü'],
                    ['Fare', 'Etrafına bak'],
                    ['Sol tık', 'Eseri incele'],
                    ['Boşluk', 'Zıpla'],
                    ['ESC', 'Duraklat'],
                  ]
              ).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 border border-white/15"
                >
                  <span className="text-[11px] font-black tracking-widest text-stone-100">{key}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              onClick={ready ? onEnter : undefined}
              disabled={!ready}
              // Sabit genişlik + tek satır: metin "hazırlanıyor %x" ↔ "Galeriye Gir"
              // değişince buton boyutu ve sayfa düzeni kıpırdamasın
              className={`button-primary text-base py-4 w-80 max-w-full tabular-nums whitespace-nowrap ${
                ready ? '' : 'opacity-60 cursor-wait'
              }`}
            >
              {ready ? 'Galeriye Gir →' : `Galeri hazırlanıyor… %${Math.round(progress)}`}
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8"
            >
              <SoundToggles
                musicOn={musicOn}
                sfxOn={sfxOn}
                onToggleMusic={onToggleMusic}
                onToggleSfx={onToggleSfx}
                dark
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold"
            >
              En iyi deneyim için masaüstü önerilir
            </motion.p>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
