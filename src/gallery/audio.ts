/**
 * Galeri ses motoru — tamamen prosedürel (Web Audio API, ses dosyası yok).
 * Müzik: yavaş evrilen, yumuşak bir ambiyans pad'i (maj7 akor döngüsü).
 * Efektler: mermer zeminde adım, iniş, seçim (zoom), kapanış ve hover tıkları.
 * Tarayıcı politikası gereği ilk kullanıcı hareketinde init() çağrılmalıdır.
 */

const MUSIC_VOLUME = 0.14;
const SFX_VOLUME = 0.5;

/** Sıcak, havadar akor döngüsü (Hz) — Fmaj7 → Dm9 → Cmaj7 → Am7 hissi */
const CHORDS: number[][] = [
  [174.61, 220.0, 261.63, 329.63],
  [146.83, 220.0, 261.63, 349.23],
  [130.81, 196.0, 246.94, 329.63],
  [110.0, 164.81, 220.0, 261.63],
];
const CHORD_SECONDS = 9;

class GalleryAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private chordIndex = 0;
  private stepFlip = false;

  private musicOn = true;
  private sfxOn = true;

  /** İlk kullanıcı hareketiyle çağrılır; tekrarlanan çağrılar zararsızdır. */
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(ctx.destination);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = this.musicOn ? MUSIC_VOLUME : 0;
    // Pad'e hafif bir alan hissi: kısa geri beslemeli gecikme
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    const delayMix = ctx.createGain();
    delayMix.gain.value = 0.35;
    this.musicBus.connect(this.master);
    this.musicBus.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(delayMix);
    delayMix.connect(this.master);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = this.sfxOn ? SFX_VOLUME : 0;
    this.sfxBus.connect(this.master);

    // Efektler için beyaz gürültü tamponu
    const len = Math.floor(ctx.sampleRate * 0.25);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;

    // Sekme arka plana geçince sustur
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
    });

    this.scheduleChord();
  }

  setMusic(on: boolean) {
    this.musicOn = on;
    if (this.ctx && this.musicBus) {
      this.musicBus.gain.setTargetAtTime(on ? MUSIC_VOLUME : 0, this.ctx.currentTime, 0.4);
    }
  }

  setSfx(on: boolean) {
    this.sfxOn = on;
    if (this.ctx && this.sfxBus) {
      this.sfxBus.gain.setTargetAtTime(on ? SFX_VOLUME : 0, this.ctx.currentTime, 0.1);
    }
  }

  // ——— Müzik ———

  private scheduleChord() {
    const ctx = this.ctx;
    const bus = this.musicBus;
    if (!ctx || !bus) return;

    const chord = CHORDS[this.chordIndex % CHORDS.length];
    this.chordIndex++;
    const t0 = ctx.currentTime + 0.05;
    const dur = CHORD_SECONDS + 3; // akorlar birbirine yumuşakça karışsın

    for (const freq of chord) {
      // Hafif detune edilmiş çift osilatör = zengin, yumuşak pad
      for (const detune of [-3.5, 3.5]) {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = detune;

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 750;
        lp.Q.value = 0.4;

        const env = ctx.createGain();
        env.gain.setValueAtTime(0, t0);
        env.gain.linearRampToValueAtTime(0.06, t0 + 3.2);
        env.gain.setValueAtTime(0.06, t0 + dur - 3.5);
        env.gain.linearRampToValueAtTime(0, t0 + dur);

        osc.connect(lp).connect(env).connect(bus);
        osc.start(t0);
        osc.stop(t0 + dur + 0.1);
      }
    }

    // Ara sıra uzaktan gelen tek bir çan tınısı
    if (this.chordIndex % 2 === 0) {
      const bell = ctx.createOscillator();
      bell.type = 'sine';
      bell.frequency.value = chord[2] * 2;
      const bellEnv = ctx.createGain();
      const tb = t0 + 4 + Math.random() * 3;
      bellEnv.gain.setValueAtTime(0, tb);
      bellEnv.gain.linearRampToValueAtTime(0.045, tb + 0.02);
      bellEnv.gain.exponentialRampToValueAtTime(0.0001, tb + 2.6);
      bell.connect(bellEnv).connect(bus);
      bell.start(tb);
      bell.stop(tb + 2.8);
    }

    setTimeout(() => this.scheduleChord(), CHORD_SECONDS * 1000);
  }

  // ——— Efektler ———

  private noiseSource(): AudioBufferSourceNode | null {
    if (!this.ctx || !this.noiseBuffer) return null;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    return src;
  }

  /** Mermer zeminde yumuşak adım */
  playFootstep() {
    const ctx = this.ctx;
    const bus = this.sfxBus;
    if (!ctx || !bus || !this.sfxOn) return;
    const src = this.noiseSource();
    if (!src) return;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 550 + Math.random() * 250;
    bp.Q.value = 1.1;

    const pan = ctx.createStereoPanner();
    this.stepFlip = !this.stepFlip;
    pan.pan.value = this.stepFlip ? 0.16 : -0.16;

    const env = ctx.createGain();
    const t = ctx.currentTime;
    const vol = 0.16 + Math.random() * 0.05;
    env.gain.setValueAtTime(vol, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);

    src.connect(bp).connect(pan).connect(env).connect(bus);
    src.start(t, Math.random() * 0.1, 0.13);
  }

  /** Zıplama sonrası iniş */
  playLand() {
    const ctx = this.ctx;
    const bus = this.sfxBus;
    if (!ctx || !bus || !this.sfxOn) return;
    const t = ctx.currentTime;

    const thump = ctx.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(120, t);
    thump.frequency.exponentialRampToValueAtTime(55, t + 0.12);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.3, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    thump.connect(env).connect(bus);
    thump.start(t);
    thump.stop(t + 0.2);

    const src = this.noiseSource();
    if (src) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      const nEnv = ctx.createGain();
      nEnv.gain.setValueAtTime(0.12, t);
      nEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      src.connect(lp).connect(nEnv).connect(bus);
      src.start(t, 0, 0.1);
    }
  }

  /** Esere odaklanma — yumuşak yükselen "zoom" süpürmesi + ping */
  playSelect() {
    const ctx = this.ctx;
    const bus = this.sfxBus;
    if (!ctx || !bus || !this.sfxOn) return;
    const t = ctx.currentTime;

    const src = this.noiseSource();
    if (src) {
      src.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 2.5;
      bp.frequency.setValueAtTime(350, t);
      bp.frequency.exponentialRampToValueAtTime(2200, t + 0.4);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.09, t + 0.15);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      src.connect(bp).connect(env).connect(bus);
      src.start(t);
      src.stop(t + 0.5);
    }

    const ping = ctx.createOscillator();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(660, t + 0.28);
    ping.frequency.exponentialRampToValueAtTime(990, t + 0.42);
    const pEnv = ctx.createGain();
    pEnv.gain.setValueAtTime(0, t + 0.28);
    pEnv.gain.linearRampToValueAtTime(0.07, t + 0.31);
    pEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    ping.connect(pEnv).connect(bus);
    ping.start(t + 0.28);
    ping.stop(t + 0.8);
  }

  /** Panel kapanışı — kısa alçalan süpürme */
  playClose() {
    const ctx = this.ctx;
    const bus = this.sfxBus;
    if (!ctx || !bus || !this.sfxOn) return;
    const t = ctx.currentTime;
    const src = this.noiseSource();
    if (!src) return;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 2.5;
    bp.frequency.setValueAtTime(1600, t);
    bp.frequency.exponentialRampToValueAtTime(320, t + 0.3);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.07, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    src.connect(bp).connect(env).connect(bus);
    src.start(t);
    src.stop(t + 0.35);
  }

  /** Crosshair bir hedefe geldiğinde minik tık */
  playHover() {
    const ctx = this.ctx;
    const bus = this.sfxBus;
    if (!ctx || !bus || !this.sfxOn) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1320;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.05, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(env).connect(bus);
    osc.start(t);
    osc.stop(t + 0.09);
  }
}

export const galleryAudio = new GalleryAudio();
