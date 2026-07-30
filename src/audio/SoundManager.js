import { GAME } from '../config.js';

/**
 * Lightweight WebAudio SFX (no external sound files required).
 * Toggle state persists in localStorage.
 */
export class SoundManager {
  constructor() {
    this.enabled = localStorage.getItem(GAME.STORAGE_SOUND) !== '0';
    this.ctx = null;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setEnabled(on) {
    this.enabled = on;
    localStorage.setItem(GAME.STORAGE_SOUND, on ? '1' : '0');
    if (on) this.ensure();
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  tone(freq, dur = 0.08, type = 'square', gain = 0.05, slide = 0) {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  jump() {
    this.tone(420, 0.1, 'square', 0.04, 220);
  }

  collect() {
    this.tone(740, 0.07, 'triangle', 0.05, 300);
  }

  power() {
    this.tone(520, 0.12, 'sawtooth', 0.035, 400);
  }

  hit() {
    this.tone(140, 0.18, 'sawtooth', 0.06, -80);
  }

  reward() {
    this.tone(523, 0.1, 'triangle', 0.05);
    setTimeout(() => this.tone(659, 0.1, 'triangle', 0.05), 90);
    setTimeout(() => this.tone(784, 0.16, 'triangle', 0.05), 180);
  }

  click() {
    this.tone(660, 0.05, 'square', 0.03);
  }

  gameOver() {
    this.tone(300, 0.15, 'triangle', 0.05, -120);
    setTimeout(() => this.tone(180, 0.25, 'triangle', 0.05, -60), 140);
  }
}

export const sound = new SoundManager();
