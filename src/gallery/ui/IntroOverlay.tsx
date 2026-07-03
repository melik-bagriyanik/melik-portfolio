import { AnimatePresence, motion } from 'framer-motion';

interface IntroOverlayProps {
  visible: boolean;
  progress: number;
  loading: boolean;
  isTouch: boolean;
  onEnter: () => void;
}

export function IntroOverlay({ visible, progress, loading, isTouch, onEnter }: IntroOverlayProps) {
  const ready = !loading || progress >= 100;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#faf8f2]/92 backdrop-blur-md"
        >
          <div className="max-w-2xl mx-auto px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-600" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold-700 font-bold">
                Sanal Sanat Galerisi
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl font-display font-black tracking-tighter text-stone-900 mb-4"
            >
              MELİK <span className="italic font-light text-gold-600">BAĞRIYANIK</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-xs font-bold tracking-[0.4em] text-stone-500 uppercase mb-8"
            >
              Full-Stack Developer · AI Mimarı · İstanbul
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-stone-600 text-base md:text-lg leading-relaxed mb-10 max-w-lg mx-auto"
            >
              Projelerim bir galerinin duvarlarında sergileniyor. İçeride özgürce dolaş;
              bir eserin önünde durup incelediğinde hikayesi, canlı önizlemesi ve kaynak
              kodlarıyla karşına çıkacak.
            </motion.p>

            {/* Kontrol şeması */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-12"
            >
              {(isTouch
                ? [
                    ['Sol joystick', 'Yürü'],
                    ['Sürükle', 'Etrafına bak'],
                    ['Dokun', 'Eseri incele'],
                  ]
                : [
                    ['W A S D', 'Yürü'],
                    ['Fare', 'Etrafına bak'],
                    ['Sol tık', 'Eseri incele'],
                    ['ESC', 'Duraklat'],
                  ]
              ).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/80 border border-stone-200 shadow-sm"
                >
                  <span className="text-[11px] font-black tracking-widest text-stone-800">{key}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              onClick={ready ? onEnter : undefined}
              disabled={!ready}
              className={`button-primary text-base px-12 py-4 ${
                ready ? '' : 'opacity-60 cursor-wait'
              }`}
            >
              {ready ? 'Galeriye Gir →' : `Galeri hazırlanıyor… %${Math.round(progress)}`}
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold"
            >
              En iyi deneyim için masaüstü önerilir
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
