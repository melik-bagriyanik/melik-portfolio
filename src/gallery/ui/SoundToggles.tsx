interface SoundTogglesProps {
  musicOn: boolean;
  sfxOn: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  /** Kapsayıcı bir tıklama alanının içindeyse yayılımı durdur */
  stopPropagation?: boolean;
}

function Pill({
  on,
  label,
  onClick,
  stopPropagation,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
  stopPropagation?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        onClick();
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-[0.18em] transition-all ${
        on
          ? 'bg-gold-500/15 border-gold-500/50 text-gold-700'
          : 'bg-white/70 border-stone-200 text-stone-400'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-gold-500' : 'bg-stone-300'}`}
      />
      {label}: {on ? 'Açık' : 'Kapalı'}
    </button>
  );
}

/** Müzik ve efekt sesleri için aç/kapa düğmeleri */
export function SoundToggles({
  musicOn,
  sfxOn,
  onToggleMusic,
  onToggleSfx,
  stopPropagation,
}: SoundTogglesProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Pill on={musicOn} label="Müzik" onClick={onToggleMusic} stopPropagation={stopPropagation} />
      <Pill on={sfxOn} label="Sesler" onClick={onToggleSfx} stopPropagation={stopPropagation} />
    </div>
  );
}
