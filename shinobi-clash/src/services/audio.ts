/**
 * Audio entièrement synthétisé (WebAudio) : effets chiptune et petites boucles musicales originales.
 * Aucun échantillon externe ; les sons se remplacent en changeant `play()`.
 */
export type SoundId =
  | 'click'
  | 'hover'
  | 'back'
  | 'error'
  | 'tear'
  | 'flip'
  | 'reveal'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'heartbeat'
  | 'jutsu'
  | 'charge'
  | 'impact'
  | 'crit'
  | 'weak'
  | 'miss'
  | 'heal'
  | 'buff'
  | 'debuff'
  | 'poof'
  | 'dark'
  | 'status'
  | 'faint'
  | 'victory'
  | 'defeat'
  | 'coin'
  | 'levelup'
  | 'whoosh';

export type MusicTrack = 'menu' | 'battle' | 'pack';

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

class AudioService {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private musicTimer: number | null = null;
  private currentTrack: MusicTrack | null = null;
  private pendingTrack: MusicTrack | null = null;
  private sfxVolume = 0.8;
  private musicVolume = 0.5;

  /** Les navigateurs exigent un geste utilisateur avant de produire du son. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain.connect(this.ctx.destination);
    this.musicGain.connect(this.ctx.destination);
    this.applyVolumes();
    const length = this.ctx.sampleRate * 0.5;
    this.noiseBuf = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    if (this.pendingTrack) this.playMusic(this.pendingTrack);
  }

  setVolumes(sfx: number, music: number): void {
    this.sfxVolume = sfx;
    this.musicVolume = music;
    this.applyVolumes();
  }

  private applyVolumes(): void {
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume * 0.35;
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume * 0.12;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 1,
    slideTo?: number,
    delay = 0,
    destination?: AudioNode | null,
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(destination ?? this.sfxGain!);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  private noise(duration: number, volume = 1, cutoff = 2000, delay = 0, cutoffTo?: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuf) return;
    const start = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, start);
    if (cutoffTo) filter.frequency.exponentialRampToValueAtTime(cutoffTo, start + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    src.connect(filter).connect(gain).connect(this.sfxGain!);
    src.start(start);
    src.stop(start + duration + 0.02);
  }

  play(id: SoundId): void {
    if (!this.ctx || this.sfxVolume <= 0) return;
    switch (id) {
      case 'click':
        this.tone(880, 0.05, 'square', 0.5);
        this.tone(1320, 0.04, 'square', 0.3, undefined, 0.03);
        break;
      case 'hover':
        this.tone(1200, 0.025, 'square', 0.15);
        break;
      case 'back':
        this.tone(660, 0.06, 'square', 0.4, 440);
        break;
      case 'error':
        this.tone(180, 0.12, 'square', 0.5);
        this.tone(150, 0.14, 'square', 0.5, undefined, 0.1);
        break;
      case 'tear':
        this.noise(0.35, 0.9, 6000, 0, 800);
        this.tone(300, 0.2, 'sawtooth', 0.2, 900);
        break;
      case 'flip':
        this.noise(0.08, 0.5, 3000);
        this.tone(500, 0.06, 'triangle', 0.4, 900);
        break;
      case 'reveal':
        this.tone(660, 0.1, 'square', 0.4);
        this.tone(990, 0.12, 'square', 0.35, undefined, 0.08);
        break;
      case 'rare':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'square', 0.35, undefined, i * 0.06));
        break;
      case 'epic':
        [440, 554, 659, 880, 1109].forEach((f, i) => this.tone(f, 0.25, 'square', 0.35, undefined, i * 0.07));
        this.tone(110, 0.6, 'triangle', 0.6, 55);
        break;
      case 'legendary':
        this.tone(55, 1.4, 'triangle', 0.9, 40);
        [523, 659, 784, 1047, 1319, 1568].forEach((f, i) =>
          this.tone(f, 0.5, 'square', 0.3, undefined, 0.15 + i * 0.09),
        );
        [1047, 1319, 1568].forEach((f) => this.tone(f, 1.2, 'triangle', 0.25, undefined, 0.8));
        this.noise(1, 0.3, 8000, 0.1, 500);
        break;
      case 'heartbeat':
        this.tone(60, 0.12, 'sine', 1, 40);
        this.tone(55, 0.14, 'sine', 0.8, 38, 0.18);
        break;
      case 'jutsu':
        this.tone(220, 0.25, 'sawtooth', 0.35, 880);
        this.noise(0.2, 0.3, 4000);
        break;
      case 'charge':
        this.tone(110, 0.6, 'sawtooth', 0.3, 660);
        this.tone(220, 0.6, 'square', 0.15, 1320);
        break;
      case 'impact':
        this.noise(0.18, 1, 1800, 0, 200);
        this.tone(120, 0.15, 'square', 0.6, 50);
        break;
      case 'crit':
        this.noise(0.25, 1, 5000, 0, 300);
        this.tone(1400, 0.08, 'square', 0.4);
        this.tone(90, 0.25, 'square', 0.7, 40);
        break;
      case 'weak':
        this.noise(0.12, 0.5, 900);
        break;
      case 'miss':
        this.tone(800, 0.15, 'triangle', 0.3, 300);
        break;
      case 'heal':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.15, 'triangle', 0.4, undefined, i * 0.05));
        break;
      case 'buff':
        this.tone(330, 0.25, 'square', 0.3, 990);
        break;
      case 'debuff':
        this.tone(660, 0.25, 'square', 0.3, 220);
        break;
      case 'poof':
        this.noise(0.3, 0.8, 2500, 0, 300);
        break;
      case 'dark':
        this.tone(110, 0.8, 'sawtooth', 0.4, 55);
        this.tone(116, 0.8, 'sawtooth', 0.3, 58);
        break;
      case 'status':
        this.tone(400, 0.08, 'square', 0.3);
        this.tone(300, 0.1, 'square', 0.3, undefined, 0.07);
        break;
      case 'faint':
        this.tone(440, 0.6, 'square', 0.4, 60);
        break;
      case 'victory':
        [523, 523, 523, 659, 784, 659, 784, 1047].forEach((f, i) =>
          this.tone(f, i === 7 ? 0.6 : 0.12, 'square', 0.35, undefined, i * 0.11),
        );
        break;
      case 'defeat':
        [392, 370, 349, 262].forEach((f, i) => this.tone(f, 0.35, 'triangle', 0.5, undefined, i * 0.3));
        break;
      case 'coin':
        this.tone(988, 0.05, 'square', 0.3);
        this.tone(1319, 0.12, 'square', 0.3, undefined, 0.05);
        break;
      case 'levelup':
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, 0.1, 'square', 0.35, undefined, i * 0.07));
        break;
      case 'whoosh':
        this.noise(0.18, 0.6, 1200, 0, 5000);
        break;
    }
  }

  /** Petites boucles en gamme pentatonique mineure ; `null` coupe la musique. */
  playMusic(track: MusicTrack | null): void {
    this.pendingTrack = track;
    if (!this.ctx || track === this.currentTrack) return;
    if (this.musicTimer) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.currentTrack = track;
    if (!track) return;
    const scale = [0, 3, 5, 7, 10, 12, 15];
    const root = track === 'battle' ? 146.83 : track === 'pack' ? 110 : 196;
    const bpm = track === 'battle' ? 150 : track === 'pack' ? 70 : 96;
    const melody =
      track === 'battle'
        ? [0, 2, 3, 2, 4, 3, 2, 1, 0, 2, 3, 5, 4, 3, 2, -1]
        : track === 'pack'
          ? [0, -1, 2, -1, 1, -1, 3, -1]
          : [0, 2, 4, 2, 3, 1, 2, -1, 4, 5, 4, 2, 3, 2, 0, -1];
    const bass = track === 'battle' ? [0, 0, 3, 3, 4, 4, 2, 2] : [0, 0, 0, 0, 3, 3, 4, 4];
    let step = 0;
    const beat = 60 / bpm / 2;
    const tick = () => {
      if (!this.ctx || this.musicVolume <= 0) {
        step++;
        return;
      }
      const note = melody[step % melody.length];
      if (note >= 0) {
        this.tone(root * 2 * 2 ** (scale[note] / 12), beat * 0.9, 'square', 0.5, undefined, 0, this.musicGain);
      }
      if (step % 2 === 0) {
        const b = bass[Math.floor(step / 2) % bass.length];
        this.tone((root / 2) * 2 ** (scale[b] / 12), beat * 1.8, 'triangle', 0.9, undefined, 0, this.musicGain);
      }
      if (track === 'battle' && step % 4 === 2) this.hiHat(0.05, 0.4);
      step++;
    };
    this.musicTimer = window.setInterval(tick, beat * 1000);
  }

  private hiHat(duration: number, volume: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuf || !this.musicGain) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;
    src.connect(filter).connect(gain).connect(this.musicGain);
    src.start();
    src.stop(ctx.currentTime + duration);
  }
}

export const audio = new AudioService();
