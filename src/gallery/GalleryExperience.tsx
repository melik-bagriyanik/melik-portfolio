import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import type * as THREE from 'three';
import { Scene } from './Scene';
import { Player, createTouchState, type PlayerApi } from './Player';
import { FocusRig } from './FocusRig';
import {
  InteractionManager,
  type FocusPose,
  type TargetMeta,
} from './interaction';
import { IntroOverlay } from './ui/IntroOverlay';
import { Hud } from './ui/Hud';
import { InfoPanel } from './ui/InfoPanel';
import { PausedOverlay } from './ui/PausedOverlay';
import { TouchControls } from './ui/TouchControls';
import { CONTACT } from './data';
import { galleryAudio } from './audio';

type Phase = 'intro' | 'walk' | 'paused' | 'focus' | 'returning';

function WebGLFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#faf8f2] p-8">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-display font-black text-stone-900 mb-3">
          MELİK<span className="text-gold-600 italic">.AI</span>
        </h1>
        <p className="text-stone-600 mb-6">
          Bu galeri WebGL gerektiriyor ancak tarayıcın desteklemiyor görünüyor. Yine de bana
          ulaşabilirsin:
        </p>
        <div className="flex flex-col gap-2 text-sm font-bold">
          <a className="text-gold-700 hover:underline" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
          <a className="text-gold-700 hover:underline" href={CONTACT.github}>
            GitHub
          </a>
          <a className="text-gold-700 hover:underline" href={CONTACT.linkedin}>
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}

export default function GalleryExperience() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [hovered, setHovered] = useState<TargetMeta | null>(null);
  const [focus, setFocus] = useState<{ meta: TargetMeta; pose: FocusPose } | null>(null);

  const objectsRef = useRef<THREE.Object3D[]>([]);
  const playerApi = useRef<PlayerApi | null>(null);
  const interactApi = useRef<{ trigger: () => void } | null>(null);
  const touchRef = useRef(createTouchState());
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const isTouch = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    []
  );

  const { progress, active: loading } = useProgress();

  // Ses tercihleri (kalıcı)
  const [musicOn, setMusicOn] = useState(
    () => typeof localStorage === 'undefined' || localStorage.getItem('galleryMusic') !== 'off'
  );
  const [sfxOn, setSfxOn] = useState(
    () => typeof localStorage === 'undefined' || localStorage.getItem('gallerySfx') !== 'off'
  );

  useEffect(() => {
    galleryAudio.setMusic(musicOn);
    localStorage.setItem('galleryMusic', musicOn ? 'on' : 'off');
  }, [musicOn]);

  useEffect(() => {
    galleryAudio.setSfx(sfxOn);
    localStorage.setItem('gallerySfx', sfxOn ? 'on' : 'off');
  }, [sfxOn]);

  // M tuşu müziği her fazda açıp kapatır
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') setMusicOn((m) => !m);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Sayfa kaydırmasını kilitle — deneyim tam ekran
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const enter = useCallback(() => {
    // Ses motoru ancak kullanıcı hareketiyle başlayabilir (tarayıcı politikası)
    galleryAudio.init();
    if (isTouch) {
      setPhase('walk');
    } else {
      playerApi.current?.lock();
    }
  }, [isTouch]);

  const onLockChange = useCallback((locked: boolean) => {
    if (locked) {
      // Dönüş animasyonu sürerken kilit erken gelebilir; fazı bozma
      setPhase((p) => (p === 'focus' || p === 'returning' ? p : 'walk'));
    } else {
      setPhase((p) => (p === 'focus' || p === 'returning' || p === 'intro' ? p : 'paused'));
    }
  }, []);

  const onSelect = useCallback((meta: TargetMeta, pose: FocusPose) => {
    galleryAudio.playSelect();
    setFocus({ meta, pose });
    setPhase('focus');
    playerApi.current?.unlock();
  }, []);

  const onHover = useCallback((meta: TargetMeta | null) => {
    if (meta) galleryAudio.playHover();
    setHovered(meta);
  }, []);

  /**
   * Paneli kapat. Tıklamayla kapatılıyorsa (buton/dış alan) aynı kullanıcı
   * hareketiyle pointer kilidini hemen geri iste — dönüş animasyonu bitince
   * araya duraklatma ekranı girmeden yürüyüşe devam edilir.
   */
  const closeFocus = useCallback(
    (relock: boolean) => {
      if (phaseRef.current === 'focus') galleryAudio.playClose();
      setPhase((p) => (p === 'focus' ? 'returning' : p));
      if (relock && !isTouch) playerApi.current?.lock();
    },
    [isTouch]
  );

  const onReturned = useCallback(() => {
    setFocus(null);
    const locked = typeof document !== 'undefined' && !!document.pointerLockElement;
    setPhase(isTouch || locked ? 'walk' : 'paused');
  }, [isTouch]);

  // Odak modunda ESC panel kapatır (ESC kullanıcı hareketi sayılmaz → kilit istenmez)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phaseRef.current === 'focus') closeFocus(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeFocus]);

  const walking = phase === 'walk';

  return (
    <div className="fixed inset-0 bg-[#f2eee3]">
      <Canvas
        shadows={!isTouch}
        dpr={isTouch ? [1, 1.5] : [1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 70, near: 0.1, far: 90 }}
        fallback={<WebGLFallback />}
      >
        <Suspense fallback={null}>
          <Scene hoveredId={hovered?.id ?? null} objectsRef={objectsRef} lite={isTouch} />
        </Suspense>
        <Player
          enabled={walking}
          apiRef={playerApi}
          touchRef={touchRef}
          onLockChange={onLockChange}
        />
        <InteractionManager
          enabled={walking}
          objectsRef={objectsRef}
          onHover={onHover}
          onSelect={onSelect}
          triggerRef={interactApi}
        />
        <FocusRig
          pose={focus?.pose ?? null}
          returning={phase === 'returning'}
          onReturned={onReturned}
        />
      </Canvas>

      {/* DOM katmanları */}
      <IntroOverlay
        visible={phase === 'intro'}
        progress={progress}
        loading={loading}
        isTouch={isTouch}
        onEnter={enter}
        musicOn={musicOn}
        sfxOn={sfxOn}
        onToggleMusic={() => setMusicOn((m) => !m)}
        onToggleSfx={() => setSfxOn((s) => !s)}
      />
      <Hud
        visible={walking}
        hovered={hovered}
        isTouch={isTouch}
        musicOn={musicOn}
        sfxOn={sfxOn}
        onToggleMusic={() => setMusicOn((m) => !m)}
        onToggleSfx={() => setSfxOn((s) => !s)}
      />
      <TouchControls
        visible={isTouch && walking}
        touchRef={touchRef}
        onInteract={() => interactApi.current?.trigger()}
      />
      <PausedOverlay
        visible={phase === 'paused'}
        onResume={enter}
        musicOn={musicOn}
        sfxOn={sfxOn}
        onToggleMusic={() => setMusicOn((m) => !m)}
        onToggleSfx={() => setSfxOn((s) => !s)}
      />
      <InfoPanel
        meta={phase === 'focus' ? focus?.meta ?? null : null}
        onClose={() => closeFocus(true)}
      />
    </div>
  );
}
