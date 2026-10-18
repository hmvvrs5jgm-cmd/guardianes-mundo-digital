import { save } from './SaveManager.js';

// Sonidos sintetizados con Web Audio: no se necesitan archivos externos.
// Para usar audio profesional, reemplaza sfx()/music() por reproducción de
// archivos en public/assets/audio manteniendo los mismos nombres.

const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);

const SFX = {
  jump: [{ type: 'square', f: [330, 620], d: 0.12, v: 0.12 }],
  land: [{ type: 'triangle', f: [160, 90], d: 0.08, v: 0.12 }],
  step: [{ type: 'triangle', f: [200, 150], d: 0.04, v: 0.04 }],
  orb: [{ type: 'sine', f: [NOTE(84), NOTE(91)], d: 0.14, v: 0.16 }, { type: 'sine', f: [NOTE(96)], d: 0.12, v: 0.08, t: 0.06 }],
  click: [{ type: 'triangle', f: [700, 520], d: 0.05, v: 0.12 }],
  focus: [{ type: 'sine', f: [880], d: 0.03, v: 0.04 }],
  blip: [{ type: 'square', f: [NOTE(79)], d: 0.025, v: 0.025 }],
  open: [{ type: 'sine', f: [NOTE(67), NOTE(79)], d: 0.25, v: 0.15 }],
  correct: [
    { type: 'sine', f: [NOTE(72)], d: 0.12, v: 0.16 },
    { type: 'sine', f: [NOTE(76)], d: 0.12, v: 0.16, t: 0.09 },
    { type: 'sine', f: [NOTE(79)], d: 0.22, v: 0.16, t: 0.18 }
  ],
  retry: [
    { type: 'triangle', f: [NOTE(67)], d: 0.14, v: 0.12 },
    { type: 'triangle', f: [NOTE(64)], d: 0.2, v: 0.1, t: 0.12 }
  ],
  hurt: [{ type: 'triangle', f: [260, 120], d: 0.22, v: 0.18 }],
  reveal: [{ type: 'sine', f: [NOTE(72), NOTE(96)], d: 0.6, v: 0.12 }, { type: 'triangle', f: [NOTE(84), NOTE(108)], d: 0.5, v: 0.05, t: 0.05 }],
  portal: [{ type: 'sine', f: [180, 900], d: 1.0, v: 0.14 }, { type: 'triangle', f: [NOTE(84)], d: 0.8, v: 0.05, t: 0.4 }],
  checkpoint: [{ type: 'sine', f: [NOTE(76)], d: 0.12, v: 0.12 }, { type: 'sine', f: [NOTE(83)], d: 0.25, v: 0.12, t: 0.1 }],
  reward: [
    { type: 'triangle', f: [NOTE(72)], d: 0.15, v: 0.16 },
    { type: 'triangle', f: [NOTE(76)], d: 0.15, v: 0.16, t: 0.12 },
    { type: 'triangle', f: [NOTE(79)], d: 0.15, v: 0.16, t: 0.24 },
    { type: 'sine', f: [NOTE(84)], d: 0.6, v: 0.18, t: 0.36 },
    { type: 'sine', f: [NOTE(88)], d: 0.6, v: 0.08, t: 0.36 }
  ],
  crystal: [
    { type: 'sine', f: [NOTE(84)], d: 0.5, v: 0.12 },
    { type: 'sine', f: [NOTE(88)], d: 0.5, v: 0.12, t: 0.15 },
    { type: 'sine', f: [NOTE(91)], d: 0.5, v: 0.12, t: 0.3 },
    { type: 'sine', f: [NOTE(96)], d: 1.2, v: 0.14, t: 0.45 }
  ],
  vines: [{ type: 'sawtooth', f: [300, 60], d: 0.6, v: 0.05 }]
};

// Pistas musicales: progresión de acordes + arpegio suave.
const TRACKS = {
  menu: { bpm: 84, chords: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], arp: [0, 1, 2, 1], wave: 'sine' },
  forest: { bpm: 96, chords: [[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]], arp: [0, 2, 1, 2, 0, 1], wave: 'triangle' },
  calm: { bpm: 72, chords: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], arp: [0, 1, 2], wave: 'sine' }
};

class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentTrack = null;
    this.timer = null;
    this.step = 0;
    this.nextTime = 0;
    save.on((type) => type === 'settings' && this.applySettings());
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
      } catch {
        return;
      }
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.master);
      this.applySettings();
      if (this.pendingTrack) this.music(this.pendingTrack);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  setSuspended(hidden) {
    if (!this.ctx) return;
    if (hidden) this.ctx.suspend().catch(() => {});
    else this.ctx.resume().catch(() => {});
  }

  applySettings() {
    if (!this.ctx) return;
    const s = save.settings;
    const now = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.muted ? 0 : 1, now, 0.05);
    this.musicGain.gain.setTargetAtTime(s.musicVolume * 0.35, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(s.sfxVolume, now, 0.05);
  }

  sfx(name) {
    const def = SFX[name];
    if (!def || !this.ctx || save.settings.muted) return;
    const t0 = this.ctx.currentTime + 0.005;
    for (const n of def) this.tone(n.type, n.f, n.d, n.v, t0 + (n.t || 0), this.sfxGain);
  }

  tone(type, freqs, dur, vol, start, dest) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqs[0], start);
    if (freqs.length > 1) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqs[1]), start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + Math.min(0.02, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  music(name) {
    this.pendingTrack = name;
    if (!this.ctx) return;
    if (this.currentTrack === name) return;
    this.stopMusic();
    const track = TRACKS[name];
    if (!track) return;
    this.currentTrack = name;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    const stepDur = 60 / track.bpm / 2;
    this.timer = setInterval(() => {
      if (!this.ctx) return;
      while (this.nextTime < this.ctx.currentTime + 0.3) {
        this.scheduleStep(track, this.step, this.nextTime, stepDur);
        this.nextTime += stepDur;
        this.step += 1;
      }
    }, 100);
  }

  scheduleStep(track, step, time, stepDur) {
    const stepsPerChord = 8;
    const chord = track.chords[Math.floor(step / stepsPerChord) % track.chords.length];
    if (step % stepsPerChord === 0) {
      // Pad suave del acorde
      for (const n of chord) this.tone('sine', [NOTE(n - 12)], stepDur * stepsPerChord * 0.95, 0.05, time, this.musicGain);
    }
    const idx = track.arp[step % track.arp.length];
    const note = chord[idx % chord.length] + 12;
    this.tone(track.wave, [NOTE(note)], stepDur * 0.9, step % 2 === 0 ? 0.06 : 0.035, time, this.musicGain);
  }

  stopMusic() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.currentTrack = null;
  }
}

export const audio = new AudioManager();
