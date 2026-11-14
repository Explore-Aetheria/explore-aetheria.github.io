export type MusicTrackId =
  | 'title'
  | 'brightfall'
  | 'whispering_woods'
  | 'sunset_coast'
  | 'frostpeak'
  | 'forgotten_kingdom'
  | 'ocean'
  | 'frozen_kingdom'
  | 'wild_jungle'
  | 'volcanic_island'
  | 'sky_island'
  | 'haunted_island'
  | 'lost_kingdom'
  | 'guardian'
  | 'minigame'
  | 'ending';

interface NoteStep {
  freq: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
  harmony?: number;
}

const TRACKS: Record<MusicTrackId, { tempoMs: number; steps: NoteStep[] }> = {
  title: {
    tempoMs: 420,
    steps: [
      { freq: 329.63, dur: 0.35, type: 'triangle', vol: 0.14, harmony: 196.0 },
      { freq: 392.0, dur: 0.35, type: 'triangle', vol: 0.12 },
      { freq: 493.88, dur: 0.4, type: 'sine', vol: 0.14, harmony: 246.94 },
      { freq: 587.33, dur: 0.4, type: 'sine', vol: 0.13 },
      { freq: 523.25, dur: 0.4, type: 'triangle', vol: 0.14, harmony: 261.63 },
      { freq: 493.88, dur: 0.35, type: 'triangle', vol: 0.12 },
      { freq: 392.0, dur: 0.45, type: 'sine', vol: 0.14, harmony: 196.0 },
      { freq: 329.63, dur: 0.45, type: 'sine', vol: 0.1 },
    ],
  },
  brightfall: {
    tempoMs: 360,
    steps: [
      { freq: 261.63, dur: 0.28, type: 'triangle', vol: 0.13, harmony: 130.81 },
      { freq: 329.63, dur: 0.25, type: 'triangle', vol: 0.11 },
      { freq: 392.0, dur: 0.28, type: 'sine', vol: 0.13, harmony: 196.0 },
      { freq: 523.25, dur: 0.3, type: 'sine', vol: 0.12 },
      { freq: 440.0, dur: 0.28, type: 'triangle', vol: 0.13, harmony: 174.61 },
      { freq: 392.0, dur: 0.25, type: 'triangle', vol: 0.11 },
      { freq: 329.63, dur: 0.28, type: 'sine', vol: 0.12, harmony: 164.81 },
      { freq: 293.66, dur: 0.35, type: 'sine', vol: 0.1 },
    ],
  },
  whispering_woods: {
    tempoMs: 460,
    steps: [
      { freq: 293.66, dur: 0.38, type: 'sine', vol: 0.12, harmony: 146.83 },
      { freq: 349.23, dur: 0.32, type: 'sine', vol: 0.1 },
      { freq: 440.0, dur: 0.4, type: 'triangle', vol: 0.11, harmony: 220.0 },
      { freq: 392.0, dur: 0.32, type: 'sine', vol: 0.1 },
      { freq: 329.63, dur: 0.38, type: 'sine', vol: 0.11, harmony: 164.81 },
      { freq: 261.63, dur: 0.34, type: 'triangle', vol: 0.1 },
      { freq: 293.66, dur: 0.45, type: 'sine', vol: 0.12, harmony: 146.83 },
      { freq: 0, dur: 0.2, type: 'sine', vol: 0 },
    ],
  },
  sunset_coast: {
    tempoMs: 340,
    steps: [
      { freq: 392.0, dur: 0.24, type: 'triangle', vol: 0.12, harmony: 196.0 },
      { freq: 493.88, dur: 0.24, type: 'sine', vol: 0.11 },
      { freq: 587.33, dur: 0.28, type: 'triangle', vol: 0.13, harmony: 293.66 },
      { freq: 523.25, dur: 0.24, type: 'sine', vol: 0.11 },
      { freq: 493.88, dur: 0.26, type: 'triangle', vol: 0.12, harmony: 246.94 },
      { freq: 440.0, dur: 0.24, type: 'sine', vol: 0.1 },
      { freq: 392.0, dur: 0.32, type: 'triangle', vol: 0.12, harmony: 196.0 },
      { freq: 329.63, dur: 0.26, type: 'sine', vol: 0.09 },
    ],
  },
  frostpeak: {
    tempoMs: 520,
    steps: [
      { freq: 523.25, dur: 0.45, type: 'sine', vol: 0.1, harmony: 261.63 },
      { freq: 659.25, dur: 0.4, type: 'sine', vol: 0.09 },
      { freq: 587.33, dur: 0.45, type: 'sine', vol: 0.1, harmony: 220.0 },
      { freq: 440.0, dur: 0.45, type: 'triangle', vol: 0.09 },
      { freq: 493.88, dur: 0.48, type: 'sine', vol: 0.1, harmony: 246.94 },
      { freq: 392.0, dur: 0.42, type: 'sine', vol: 0.08 },
      { freq: 0, dur: 0.25, type: 'sine', vol: 0 },
      { freq: 329.63, dur: 0.45, type: 'sine', vol: 0.08 },
    ],
  },
  forgotten_kingdom: {
    tempoMs: 540,
    steps: [
      { freq: 220.0, dur: 0.5, type: 'triangle', vol: 0.12, harmony: 110.0 },
      { freq: 261.63, dur: 0.45, type: 'sine', vol: 0.1 },
      { freq: 329.63, dur: 0.5, type: 'triangle', vol: 0.12, harmony: 164.81 },
      { freq: 311.13, dur: 0.45, type: 'sine', vol: 0.1 },
      { freq: 293.66, dur: 0.5, type: 'triangle', vol: 0.11, harmony: 146.83 },
      { freq: 246.94, dur: 0.45, type: 'sine', vol: 0.1 },
      { freq: 220.0, dur: 0.55, type: 'triangle', vol: 0.12, harmony: 110.0 },
      { freq: 0, dur: 0.3, type: 'sine', vol: 0 },
    ],
  },
  ocean: {
    tempoMs: 390,
    steps: [
      { freq: 261.63, dur: 0.34, type: 'sine', vol: 0.12, harmony: 130.81 },
      { freq: 392.0, dur: 0.3, type: 'triangle', vol: 0.11 },
      { freq: 440.0, dur: 0.34, type: 'sine', vol: 0.12, harmony: 196.0 },
      { freq: 523.25, dur: 0.34, type: 'triangle', vol: 0.11 },
      { freq: 392.0, dur: 0.32, type: 'sine', vol: 0.11 },
      { freq: 329.63, dur: 0.34, type: 'triangle', vol: 0.1, harmony: 164.81 },
    ],
  },
  frozen_kingdom: {
    tempoMs: 490,
    steps: [
      { freq: 587.33, dur: 0.42, type: 'sine', vol: 0.1, harmony: 293.66 },
      { freq: 698.46, dur: 0.38, type: 'sine', vol: 0.09 },
      { freq: 880.0, dur: 0.44, type: 'sine', vol: 0.1, harmony: 440.0 },
      { freq: 659.25, dur: 0.42, type: 'triangle', vol: 0.09 },
      { freq: 523.25, dur: 0.44, type: 'sine', vol: 0.1, harmony: 261.63 },
      { freq: 0, dur: 0.25, type: 'sine', vol: 0 },
    ],
  },
  wild_jungle: {
    tempoMs: 310,
    steps: [
      { freq: 293.66, dur: 0.22, type: 'triangle', vol: 0.12, harmony: 146.83 },
      { freq: 369.99, dur: 0.2, type: 'triangle', vol: 0.1 },
      { freq: 440.0, dur: 0.24, type: 'sine', vol: 0.12, harmony: 220.0 },
      { freq: 493.88, dur: 0.22, type: 'triangle', vol: 0.1 },
      { freq: 587.33, dur: 0.26, type: 'sine', vol: 0.11 },
      { freq: 440.0, dur: 0.22, type: 'triangle', vol: 0.1 },
    ],
  },
  volcanic_island: {
    tempoMs: 350,
    steps: [
      { freq: 196.0, dur: 0.28, type: 'sawtooth', vol: 0.07, harmony: 98.0 },
      { freq: 233.08, dur: 0.26, type: 'triangle', vol: 0.1 },
      { freq: 293.66, dur: 0.28, type: 'sawtooth', vol: 0.07, harmony: 146.83 },
      { freq: 261.63, dur: 0.26, type: 'triangle', vol: 0.1 },
      { freq: 220.0, dur: 0.3, type: 'triangle', vol: 0.1 },
      { freq: 174.61, dur: 0.3, type: 'sawtooth', vol: 0.07 },
    ],
  },
  sky_island: {
    tempoMs: 400,
    steps: [
      { freq: 523.25, dur: 0.34, type: 'sine', vol: 0.11, harmony: 261.63 },
      { freq: 587.33, dur: 0.32, type: 'triangle', vol: 0.1 },
      { freq: 783.99, dur: 0.36, type: 'sine', vol: 0.11, harmony: 392.0 },
      { freq: 659.25, dur: 0.34, type: 'sine', vol: 0.1 },
      { freq: 587.33, dur: 0.36, type: 'triangle', vol: 0.1, harmony: 293.66 },
    ],
  },
  haunted_island: {
    tempoMs: 530,
    steps: [
      { freq: 246.94, dur: 0.45, type: 'sine', vol: 0.11, harmony: 123.47 },
      { freq: 293.66, dur: 0.42, type: 'triangle', vol: 0.1 },
      { freq: 311.13, dur: 0.46, type: 'sine', vol: 0.11, harmony: 155.56 },
      { freq: 246.94, dur: 0.44, type: 'triangle', vol: 0.09 },
      { freq: 220.0, dur: 0.48, type: 'sine', vol: 0.1, harmony: 110.0 },
      { freq: 0, dur: 0.3, type: 'sine', vol: 0 },
    ],
  },
  lost_kingdom: {
    tempoMs: 470,
    steps: [
      { freq: 261.63, dur: 0.4, type: 'triangle', vol: 0.12, harmony: 130.81 },
      { freq: 329.63, dur: 0.38, type: 'sine', vol: 0.11 },
      { freq: 392.0, dur: 0.42, type: 'triangle', vol: 0.12, harmony: 196.0 },
      { freq: 493.88, dur: 0.42, type: 'sine', vol: 0.11, harmony: 246.94 },
      { freq: 440.0, dur: 0.42, type: 'triangle', vol: 0.11 },
      { freq: 392.0, dur: 0.45, type: 'sine', vol: 0.11 },
    ],
  },
  guardian: {
    tempoMs: 220,
    steps: [
      { freq: 146.83, dur: 0.18, type: 'sawtooth', vol: 0.11, harmony: 73.42 },
      { freq: 220.0, dur: 0.16, type: 'square', vol: 0.07 },
      { freq: 261.63, dur: 0.18, type: 'sawtooth', vol: 0.1, harmony: 87.31 },
      { freq: 293.66, dur: 0.16, type: 'square', vol: 0.08 },
      { freq: 174.61, dur: 0.18, type: 'sawtooth', vol: 0.11, harmony: 87.31 },
      { freq: 261.63, dur: 0.16, type: 'square', vol: 0.07 },
      { freq: 329.63, dur: 0.18, type: 'sawtooth', vol: 0.1, harmony: 98.0 },
      { freq: 293.66, dur: 0.18, type: 'square', vol: 0.08 },
    ],
  },
  minigame: {
    tempoMs: 230,
    steps: [
      { freq: 392.0, dur: 0.18, type: 'square', vol: 0.07, harmony: 196.0 },
      { freq: 440.0, dur: 0.16, type: 'triangle', vol: 0.09 },
      { freq: 493.88, dur: 0.18, type: 'square', vol: 0.07, harmony: 246.94 },
      { freq: 587.33, dur: 0.18, type: 'triangle', vol: 0.1 },
      { freq: 523.25, dur: 0.18, type: 'square', vol: 0.07, harmony: 261.63 },
      { freq: 493.88, dur: 0.16, type: 'triangle', vol: 0.09 },
      { freq: 440.0, dur: 0.18, type: 'square', vol: 0.07 },
      { freq: 392.0, dur: 0.2, type: 'triangle', vol: 0.1 },
    ],
  },
  ending: {
    tempoMs: 360,
    steps: [
      { freq: 392.0, dur: 0.34, type: 'triangle', vol: 0.14, harmony: 196.0 },
      { freq: 493.88, dur: 0.32, type: 'sine', vol: 0.13 },
      { freq: 587.33, dur: 0.38, type: 'triangle', vol: 0.14, harmony: 293.66 },
      { freq: 783.99, dur: 0.42, type: 'sine', vol: 0.14, harmony: 392.0 },
      { freq: 659.25, dur: 0.36, type: 'triangle', vol: 0.13, harmony: 329.63 },
      { freq: 587.33, dur: 0.34, type: 'sine', vol: 0.12 },
      { freq: 523.25, dur: 0.38, type: 'triangle', vol: 0.13, harmony: 261.63 },
      { freq: 587.33, dur: 0.45, type: 'sine', vol: 0.14 },
    ],
  },
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicVolume = 0.45;
  private sfxVolume = 0.65;
  private muted = false;
  private currentTrack: MusicTrackId = 'title';
  private restorationHarmonyBoost = 0;
  private timerId: number | null = null;
  private stepIdx = 0;
  private lastStepSoundAt = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
  }

  public setSettings(musicVolume: number, sfxVolume: number, muted: boolean) {
    this.musicVolume = musicVolume;
    this.sfxVolume = sfxVolume;
    this.muted = muted;
  }

  public setRestorationBoost(boost01: number) {
    this.restorationHarmonyBoost = Math.max(0, Math.min(1, boost01));
  }

  public playMusic(track: MusicTrackId) {
    if (this.currentTrack === track && this.timerId !== null) return;
    this.currentTrack = track;
    this.stepIdx = 0;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    const spec = TRACKS[track] ?? TRACKS.brightfall;
    this.timerId = window.setInterval(() => {
      if (this.muted || this.musicVolume <= 0.01) return;
      const ctx = this.ctx;
      if (!ctx || ctx.state !== 'running') return;
      const step = spec.steps[this.stepIdx % spec.steps.length];
      this.stepIdx++;
      if (step.freq > 0) {
        this.playMusicTone(step.freq, step.dur, step.type ?? 'triangle', (step.vol ?? 0.1) * this.musicVolume);
        if (step.harmony) {
          this.playMusicTone(step.harmony, step.dur * 1.1, 'sine', ((step.vol ?? 0.1) * 0.55) * this.musicVolume);
        }
        if (this.restorationHarmonyBoost > 0.2 && this.stepIdx % 2 === 0) {
          this.playMusicTone(
            step.freq * 1.5,
            step.dur * 0.7,
            'sine',
            0.04 * this.restorationHarmonyBoost * this.musicVolume
          );
        }
      }
    }, spec.tempoMs);
  }

  private playMusicTone(freq: number, dur: number, type: OscillatorType, gainVal: number) {
    const ctx = this.ctx;
    if (!ctx || gainVal <= 0.001) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  private playTone(freq: number, endFreq: number, dur: number, type: OscillatorType, vol = 0.2) {
    const ctx = this.ensureContext();
    if (!ctx || this.sfxVolume <= 0.01) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), now + dur);
    }
    const v = vol * this.sfxVolume;
    gain.gain.setValueAtTime(v, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  public playFootstep(surface: 'grass' | 'stone' | 'wood' | 'sand' | 'snow' | 'water') {
    const now = performance.now();
    if (now - this.lastStepSoundAt < 250) return;
    this.lastStepSoundAt = now;
    const base =
      surface === 'stone'
        ? 180
        : surface === 'wood'
          ? 145
          : surface === 'snow'
            ? 240
            : surface === 'sand'
              ? 120
              : surface === 'water'
                ? 210
                : 155;
    this.playTone(base + Math.random() * 25, base * 0.65, 0.055, 'triangle', 0.055);
  }

  public playVoiceBlip(pitch = 420) {
    this.playTone(pitch + (Math.random() - 0.5) * 40, pitch * 1.04, 0.045, 'square', 0.045);
  }

  public playCollect() {
    this.playTone(587.33, 880, 0.12, 'triangle', 0.18);
    window.setTimeout(() => this.playTone(880, 1174.66, 0.14, 'sine', 0.16), 70);
  }

  public playChest() {
    [440, 554.37, 659.25, 880].forEach((n, idx) => {
      window.setTimeout(() => this.playTone(n, n * 1.02, 0.22, 'triangle', 0.16), idx * 75);
    });
  }

  public playBolt() {
    this.playTone(620, 260, 0.11, 'triangle', 0.14);
  }

  public playDash() {
    this.playTone(320, 140, 0.14, 'sine', 0.15);
  }

  public playAbility() {
    this.playTone(340, 740, 0.22, 'sine', 0.18);
    window.setTimeout(() => this.playTone(510, 960, 0.2, 'triangle', 0.14), 60);
  }

  public playHit() {
    this.playTone(170, 55, 0.14, 'sawtooth', 0.18);
  }

  public playDoor() {
    this.playTone(220, 330, 0.12, 'triangle', 0.14);
  }

  public playRestoreFanfare() {
    const notes = [392, 493.88, 587.33, 783.99, 987.77];
    notes.forEach((n, i) => {
      window.setTimeout(() => this.playTone(n, n, 0.28, 'triangle', 0.18), i * 95);
    });
  }

  public playUiClick() {
    this.playTone(480, 540, 0.05, 'sine', 0.09);
  }

  public playNote(freq: number) {
    this.playTone(freq, freq, 0.22, 'triangle', 0.2);
  }

  public playThunder() {
    this.playTone(95, 42, 0.55, 'sawtooth', 0.12);
  }
}

export const soundEngine = new SoundEngine();
