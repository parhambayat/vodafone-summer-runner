import { COLORS, GAME } from '../config.js';

function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

/** Parallax summer beach with day→sunset + ambient summer FX. */
export class BeachWorld {
  constructor(scene) {
    this.scene = scene;
    this.W = GAME.WIDTH;
    this.H = GAME.HEIGHT;
    this.sunset = 0;

    this.skyBase = scene.add.rectangle(0, 0, this.W, this.H, COLORS.SKY).setOrigin(0).setDepth(0);
    this.skyTop = scene.add.rectangle(0, 0, this.W, 220, COLORS.SKY2, 0.55).setOrigin(0).setDepth(0);
    this.horizon = scene.add.rectangle(0, 280, this.W, 120, COLORS.ORANGE, 0.12).setOrigin(0).setDepth(0);
    this.sunsetWash = scene.add.rectangle(0, 0, this.W, 360, 0xFF6B4A, 0).setOrigin(0).setDepth(0);

    this.sunHome = { x: this.W - 70, y: 90 };
    this.sun = scene.add.image(this.sunHome.x, this.sunHome.y, 'sun').setDepth(1).setScale(1.05);
    this.sunGlow = scene.add.circle(this.sunHome.x, this.sunHome.y, 70, COLORS.YELLOW, 0.12).setDepth(1);

    this.heat = scene.add.graphics().setDepth(1).setAlpha(0.15);

    this.clouds = [];
    for (let i = 0; i < 4; i++) {
      const c = scene.add.image(40 + i * 110, 70 + (i % 3) * 36, 'cloud')
        .setDepth(2)
        .setAlpha(0.88)
        .setScale(0.55 + (i % 3) * 0.12);
      c.speed = 14 + i * 5;
      this.clouds.push(c);
    }

    this.birds = [];
    for (let i = 0; i < 3; i++) {
      const b = scene.add.image(60 + i * 130, 140 + i * 28, 'seagull')
        .setDepth(3)
        .setScale(0.9 + (i % 2) * 0.2)
        .setAlpha(0.95);
      b.speed = 30 + i * 12;
      b.phase = i * 1.7;
      this.birds.push(b);
    }

    // Beach butterflies
    this.butterflies = [];
    for (let i = 0; i < 4; i++) {
      const bf = scene.add.image(40 + i * 90, 220 + (i % 3) * 35, 'butterfly')
        .setDepth(7)
        .setScale(0.85 + (i % 2) * 0.25)
        .setAlpha(0.9);
      bf.phase = Math.random() * Math.PI * 2;
      bf.speed = 22 + i * 8;
      bf.flap = 0;
      this.butterflies.push(bf);
    }

    this.island = scene.add.image(this.W * 0.7, 340, 'island').setDepth(3).setScale(0.85).setAlpha(0.9);

    this.waveTiles = [];
    for (let i = 0; i < 3; i++) {
      const w = scene.add.tileSprite(i * 256, 380, 256, 70, 'wave').setOrigin(0, 0).setDepth(4);
      this.waveTiles.push(w);
    }
    this.foam = scene.add.rectangle(0, 448, this.W, 10, COLORS.FOAM, 0.55).setOrigin(0).setDepth(5);

    this.farPalms = [];
    for (let i = 0; i < 3; i++) {
      const p = scene.add.image(50 + i * 150, 400, 'o_palm').setDepth(5).setScale(0.42).setAlpha(0.5);
      this.farPalms.push(p);
    }
    this.farUmbs = [];
    for (let i = 0; i < 2; i++) {
      const u = scene.add.image(120 + i * 200, 415, 'o_umb').setDepth(5).setScale(0.38).setAlpha(0.55);
      this.farUmbs.push(u);
    }

    this.floatBalls = [];
    for (let i = 0; i < 2; i++) {
      const b = scene.add.image(150 + i * 180, 280 + i * 40, 'c_ball')
        .setDepth(6)
        .setScale(0.55)
        .setAlpha(0.7);
      b.phase = i * 2;
      this.floatBalls.push(b);
    }

    this.decor = [];
    for (let i = 0; i < 3; i++) {
      const t = scene.add.image(80 + i * 160, GAME.GROUND_Y + 28, 'towel')
        .setDepth(9)
        .setScale(0.7)
        .setAlpha(0.85)
        .setAngle(-8 + i * 6);
      this.decor.push(t);
    }
    for (let i = 0; i < 4; i++) {
      const s = scene.add.image(40 + i * 100, GAME.GROUND_Y + 48, 'starfish')
        .setDepth(9)
        .setScale(0.55 + (i % 2) * 0.15)
        .setAlpha(0.7)
        .setAngle(i * 40);
      this.decor.push(s);
    }

    this.ground = scene.add.tileSprite(0, GAME.GROUND_Y, this.W + 4, 80, 'ground')
      .setOrigin(0, 0)
      .setDepth(10);

    scene.add.rectangle(0, GAME.GROUND_Y + 78, this.W, this.H - GAME.GROUND_Y - 78, COLORS.DSAND)
      .setOrigin(0)
      .setDepth(10);

    this.floor = scene.add.rectangle(this.W / 2, GAME.GROUND_Y + 20, this.W * 2, 40, 0x000000, 0);
    scene.physics.add.existing(this.floor, true);

    this.tapHint = scene.add.text(this.W / 2, this.H - 36, 'TAP TO JUMP', {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '9px',
      color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(45).setAlpha(0.35);

    this.wavePhase = 0;
    this.fxTimer = 0;

    // Continuous ambient particle emitters
    this.bubbles = scene.add.particles(0, 0, 'p_bubble', {
      x: { min: 20, max: this.W - 20 },
      y: 430,
      speedY: { min: -35, max: -70 },
      speedX: { min: -12, max: 12 },
      lifespan: { min: 1200, max: 2200 },
      scale: { start: 0.5, end: 1.2 },
      alpha: { start: 0.55, end: 0 },
      frequency: 280,
      quantity: 1,
      gravityY: -8
    }).setDepth(8);

    this.sunSparks = scene.add.particles(this.sunHome.x, this.sunHome.y, 'p_glint', {
      speed: { min: 12, max: 48 },
      angle: { min: 0, max: 360 },
      lifespan: { min: 400, max: 900 },
      scale: { start: 0.95, end: 0 },
      alpha: { start: 0.95, end: 0 },
      frequency: 160,
      quantity: 1,
      gravityY: 0
    }).setDepth(2);
  }

  /** t: 0 = bright day, 1 = deep sunset (driven by run score/distance). */
  setSunset(t) {
    this.sunset = Phaser.Math.Clamp(t, 0, 1);
  }

  update(speed, dt) {
    const factor = speed / GAME.BASE_SPEED;
    const t = this.sunset;
    this.ground.tilePositionX += speed * dt;
    this.wavePhase += dt;
    this.fxTimer += dt;

    // --- Day → sunset palette ---
    const daySky = COLORS.SKY;
    const setSky = 0xF07A4A;
    const dayTop = COLORS.SKY2;
    const setTop = 0xFFB35C;
    this.skyBase.setFillStyle(lerpColor(daySky, setSky, t), 1);
    this.skyTop.setFillStyle(lerpColor(dayTop, setTop, t), 0.5 + t * 0.2);
    this.horizon.setFillStyle(lerpColor(COLORS.ORANGE, 0xFF3D6E, t), 0.12 + t * 0.35);
    this.sunsetWash.setAlpha(t * 0.28);

    // Sun sinks toward horizon
    const sunX = this.sunHome.x - t * 30;
    const sunY = this.sunHome.y + t * 160;
    const pulse = 1 + Math.sin(this.wavePhase) * 0.04 + t * 0.12;
    this.sun.setPosition(sunX, sunY).setScale(pulse);
    this.sun.setTint(t > 0.35 ? 0xFFAA66 : 0xffffff);
    this.sunGlow.setPosition(sunX, sunY).setScale(pulse * (1 + t * 0.4));
    this.sunGlow.setFillStyle(lerpColor(COLORS.YELLOW, 0xFF5522, t), 0.12 + t * 0.18);
    this.sun.angle = Math.sin(this.wavePhase * 0.3) * 4;
    this.sunSparks.setPosition(sunX, sunY);
    this.sunSparks.frequency = 160 - t * 70;

    // Ocean warms slightly at sunset
    const oceanTint = t > 0.2 ? 0xffc8a0 : 0xffffff;
    this.waveTiles.forEach((w, i) => {
      w.tilePositionX += speed * 0.35 * dt;
      w.y = 378 + Math.sin(this.wavePhase * 2 + i) * 4;
      w.setTint(oceanTint);
    });
    this.foam.y = 446 + Math.sin(this.wavePhase * 2.2) * 2;
    this.foam.setAlpha(0.45 + Math.sin(this.wavePhase * 3) * 0.1);

    this.clouds.forEach((c) => {
      c.x -= c.speed * factor * dt;
      c.setTint(t > 0.4 ? 0xffd0b0 : 0xffffff);
      c.setAlpha(0.88 - t * 0.15);
      if (c.x < -80) {
        c.x = this.W + 80;
        c.y = 50 + Math.random() * 90;
      }
    });

    this.birds.forEach((b, i) => {
      b.x -= b.speed * factor * dt;
      b.y = 130 + i * 30 + Math.sin(this.wavePhase * 2 + b.phase) * 10;
      if (b.x < -40) {
        b.x = this.W + 40;
        b.y = 120 + Math.random() * 80;
      }
    });

    // Butterflies flutter across beach midground
    this.butterflies.forEach((bf, i) => {
      bf.flap += dt * 14;
      bf.x -= bf.speed * factor * dt * 0.55;
      bf.y = 200 + (i % 3) * 40 + Math.sin(this.wavePhase * 3 + bf.phase) * 18;
      bf.scaleX = (0.85 + (i % 2) * 0.25) * (Math.sin(bf.flap) > 0 ? 1 : 0.55);
      bf.angle = Math.sin(this.wavePhase * 2 + bf.phase) * 12;
      if (bf.x < -30) {
        bf.x = this.W + 20 + Math.random() * 60;
        bf.y = 180 + Math.random() * 120;
        bf.phase = Math.random() * Math.PI * 2;
      }
    });

    this.farPalms.forEach((p, i) => {
      p.x -= speed * 0.2 * dt;
      p.angle = Math.sin(this.wavePhase * 1.4 + i) * 3;
      if (p.x < -40) p.x = this.W + 40;
    });

    this.farUmbs.forEach((u, i) => {
      u.x -= speed * 0.25 * dt;
      if (u.x < -50) u.x = this.W + 50;
      u.angle = Math.sin(this.wavePhase + i) * 2;
    });

    this.floatBalls.forEach((b, i) => {
      b.x -= speed * 0.15 * dt;
      b.y = 270 + i * 45 + Math.sin(this.wavePhase * 1.8 + b.phase) * 12;
      b.rotation += dt * 0.8;
      if (b.x < -40) b.x = this.W + 40;
    });

    this.decor.forEach((d) => {
      d.x -= speed * 0.95 * dt;
      if (d.x < -50) d.x = this.W + 40 + Math.random() * 80;
    });

    this.island.x -= speed * 0.07 * dt;
    if (this.island.x < -100) this.island.x = this.W + 100;

    // Heat shimmer fades as evening cools
    this.heat.clear();
    this.heat.setAlpha(0.15 * (1 - t * 0.7));
    this.heat.lineStyle(1, lerpColor(COLORS.YELLOW, 0xFF8844, t), 0.35);
    for (let i = 0; i < 5; i++) {
      const y = 200 + i * 28 + Math.sin(this.wavePhase * 3 + i) * 4;
      this.heat.beginPath();
      this.heat.moveTo(20, y);
      for (let x = 20; x < this.W - 20; x += 16) {
        this.heat.lineTo(x, y + Math.sin(x * 0.08 + this.wavePhase * 4 + i) * 3);
      }
      this.heat.strokePath();
    }

    // Extra bubble burst from foam occasionally
    if (this.fxTimer > 1.8) {
      this.fxTimer = 0;
      this.bubbles.emitParticleAt(
        40 + Math.random() * (this.W - 80),
        440,
        3 + Math.floor(Math.random() * 3)
      );
    }

    if (this.tapHint.alpha > 0) {
      this.tapHint.alpha = Math.max(0, this.tapHint.alpha - dt * 0.08);
    }
  }
}
