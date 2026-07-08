// SynthEngine.ts
// Motor de áudio do PHASE. Independente de React e de GSAP/Lenis.
// Uma única instância por app. O AudioContext é criado no primeiro gesto do usuário.
//
// Grafo: osc -> voiceGain(env) -> filter(lowpass) -> master -> analyser -> destination
//        filter -> wet -> delay -> feedback(loop) -> delay -> master  (delay opcional)

export type Waveform = OscillatorType; // 'sine' | 'square' | 'sawtooth' | 'triangle'

interface Voice {
  osc: OscillatorNode;
  gain: GainNode;
}

export class SynthEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private analyser!: AnalyserNode;
  private filter!: BiquadFilterNode;
  private delay!: DelayNode;
  private feedback!: GainNode;
  private wet!: GainNode;

  private voices = new Map<string, Voice>();
  private waveform: Waveform = 'sawtooth';
  private timeData: Uint8Array<ArrayBuffer> | null = null;

  private readonly maxVoices = 8;
  private readonly attack = 0.012;
  private readonly release = 0.25;
  private readonly peak = 0.22;

  /** Cria o grafo de áudio. Chamar SEMPRE dentro de um gesto do usuário. Idempotente. */
  init(): void {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.timeData = new Uint8Array(this.analyser.fftSize);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 2400;
    this.filter.Q.value = 6;

    this.delay = this.ctx.createDelay(1);
    this.delay.delayTime.value = 0.28;
    this.feedback = this.ctx.createGain();
    this.feedback.gain.value = 0.34;
    this.wet = this.ctx.createGain();
    this.wet.gain.value = 0; // delay começa desligado

    this.filter.connect(this.master);
    this.filter.connect(this.wet);
    this.wet.connect(this.delay);
    this.delay.connect(this.feedback);
    this.feedback.connect(this.delay);
    this.delay.connect(this.master);

    this.master.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  resume(): void {
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
  }

  setWaveform(w: Waveform): void {
    this.waveform = w;
  }

  /** cutoff em Hz, com smoothing para não estalar. */
  setCutoff(hz: number): void {
    if (!this.ctx) return;
    this.filter.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.01);
  }

  setDelay(on: boolean): void {
    if (!this.ctx) return;
    this.wet.gain.setTargetAtTime(on ? 0.4 : 0, this.ctx.currentTime, 0.02);
  }

  private static mtof(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /** Dispara uma nota. `id` único por tecla pressionada (ex.: 'm60'). */
  noteOn(id: string, midi: number): void {
    this.init();
    this.resume();
    if (!this.ctx || this.voices.has(id)) return;
    if (this.voices.size >= this.maxVoices) this.stealVoice();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = this.waveform;
    osc.frequency.value = SynthEngine.mtof(midi);
    osc.connect(gain);
    gain.connect(this.filter);

    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(this.peak, t + this.attack);

    osc.start(t);
    this.voices.set(id, { osc, gain });
  }

  /** Solta a nota com release suave e limpa os nós. */
  noteOff(id: string): void {
    if (!this.ctx) return;
    const v = this.voices.get(id);
    if (!v) return;
    const t = this.ctx.currentTime;
    v.gain.gain.cancelScheduledValues(t);
    v.gain.gain.setValueAtTime(v.gain.gain.value, t);
    v.gain.gain.exponentialRampToValueAtTime(0.0001, t + this.release);
    v.osc.stop(t + this.release + 0.02);
    v.osc.onended = () => {
      v.osc.disconnect();
      v.gain.disconnect();
    };
    this.voices.delete(id);
  }

  private stealVoice(): void {
    const oldest = this.voices.keys().next().value;
    if (oldest) this.noteOff(oldest);
  }

  /** Toca um arpejo curto — usado no preview dos sound packs. */
  playArp(midis: number[], stepMs = 110, holdMs = 360): void {
    midis.forEach((m, i) => {
      const id = `arp-${m}-${i}-${Date.now()}`;
      window.setTimeout(() => {
        this.noteOn(id, m);
        window.setTimeout(() => this.noteOff(id), holdMs);
      }, i * stepMs);
    });
  }

  get activeVoices(): number {
    return this.voices.size;
  }

  /** Lê e retorna a forma de onda atual. Chamar dentro do rAF do osciloscópio. */
  getWaveform(): Uint8Array | null {
    if (!this.analyser || !this.timeData) return null;
    this.analyser.getByteTimeDomainData(this.timeData);
    return this.timeData;
  }

  dispose(): void {
    this.voices.forEach((v) => {
      try { v.osc.stop(); } catch { /* já parado */ }
    });
    this.voices.clear();
    void this.ctx?.close();
    this.ctx = null;
  }
}

// Mapa de teclado físico -> MIDI (uma oitava + tônica). Use em <Keyboard />.
export const KEY_MAP: Record<string, number> = {
  a: 60, w: 61, s: 62, e: 63, d: 64, f: 65,
  t: 66, g: 67, y: 68, h: 69, u: 70, j: 71, k: 72,
};
