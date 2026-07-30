import { GAME, SCORE } from '../config.js';

const OBSTACLES = [
  { key: 'o_palm', body: { w: 28, h: 70, ox: 22, oy: 55 }, scale: 0.72 },
  { key: 'o_umb', body: { w: 36, h: 55, ox: 27, oy: 50 }, scale: 0.62 },
  { key: 'o_castle', body: { w: 50, h: 55, ox: 17, oy: 38 }, scale: 0.68 },
  { key: 'o_surf', body: { w: 18, h: 70, ox: 7, oy: 35 }, scale: 0.72 },
  { key: 'o_barrel', body: { w: 36, h: 48, ox: 10, oy: 16 }, scale: 0.78 },
  { key: 'o_rock', body: { w: 48, h: 30, ox: 12, oy: 18 }, scale: 0.82 },
  { key: 'o_flip', body: { w: 50, h: 22, ox: 10, oy: 12 }, scale: 0.95 }
];

const COLLECTS = [
  { key: 'c_ice', type: 'ice' },
  { key: 'c_mel', type: 'melon' },
  { key: 'c_coin', type: 'coin' },
  { key: 'c_drink', type: 'drink' },
  { key: 'c_ball', type: 'ball' },
  { key: 'c_gift', type: 'gift' },
  { key: 'c_shell', type: 'shell' },
  { key: 'c_coco', type: 'coconut' }
];

const POWERS = [
  { key: 'pu_turbo', type: 'turbo' },
  { key: 'pu_shield', type: 'shield' },
  { key: 'pu_mag', type: 'magnet' },
  { key: 'pu_x2', type: 'x2' }
];

export class Spawner {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = scene.physics.add.group();
    this.collects = scene.physics.add.group();
    this.powers = scene.physics.add.group();
    this.timer = 0;
    this.nextGap = 1.4;
  }

  reset() {
    this.obstacles.clear(true, true);
    this.collects.clear(true, true);
    this.powers.clear(true, true);
    this.timer = 0;
    this.nextGap = 1.4;
  }

  update(dt, speed) {
    this.timer += dt;
    const difficulty = Phaser.Math.Clamp((speed - GAME.BASE_SPEED) / (GAME.MAX_SPEED - GAME.BASE_SPEED), 0, 1);
    this.nextGap = Phaser.Math.Linear(1.6, 0.78, difficulty);

    if (this.timer >= this.nextGap) {
      this.timer = 0;
      this.spawnWave(difficulty);
    }

    const vx = -speed;
    [...this.obstacles.getChildren(), ...this.collects.getChildren(), ...this.powers.getChildren()].forEach((s) => {
      if (!s.active) return;
      s.setVelocityX(vx * (s.speedMul || 1));
      if (s.x < -120) s.destroy();
    });

    this.collects.getChildren().forEach((c) => {
      c.y = c.baseY + Math.sin(this.scene.time.now / 200 + c.phase) * 6;
    });
    this.powers.getChildren().forEach((p) => {
      p.rotation += dt * 1.5;
      p.y = p.baseY + Math.sin(this.scene.time.now / 160 + p.phase) * 8;
    });
  }

  spawnWave(difficulty) {
    const roll = Math.random();
    if (roll < 0.55) this.spawnObstacle();
    else if (roll < 0.88) this.spawnCollect();
    else this.spawnPower();

    if (difficulty > 0.45 && Math.random() < 0.35) {
      this.scene.time.delayedCall(220, () => {
        if (Math.random() < 0.5) this.spawnCollect(true);
        else this.spawnObstacle(true);
      });
    }
  }

  spawnObstacle(extra = false) {
    const def = Phaser.Utils.Array.GetRandom(OBSTACLES);
    const x = GAME.WIDTH + 40 + (extra ? 70 : 0);
    const s = this.obstacles.create(x, GAME.GROUND_Y - 4, def.key);
    s.setOrigin(0.5, 1);
    s.setScale(def.scale);
    s.setDepth(15);
    s.body.setAllowGravity(false);
    s.body.setImmovable(true);
    s.body.setSize(def.body.w, def.body.h);
    s.body.setOffset(def.body.ox, def.body.oy);
    s.speedMul = 1;
  }

  spawnCollect(high = false) {
    const def = Phaser.Utils.Array.GetRandom(COLLECTS);
    const x = GAME.WIDTH + 40;
    const y = high ? GAME.GROUND_Y - 150 : GAME.GROUND_Y - 80 - Math.random() * 55;
    const s = this.collects.create(x, y, def.key);
    s.setDepth(16);
    s.setScale(1.05);
    s.body.setAllowGravity(false);
    s.body.setCircle(Math.min(s.width, s.height) * 0.35);
    s.collectType = def.type;
    s.points = SCORE[def.type] || 5;
    s.baseY = y;
    s.phase = Math.random() * Math.PI * 2;
    s.speedMul = 1;
  }

  spawnPower() {
    const def = Phaser.Utils.Array.GetRandom(POWERS);
    const y = GAME.GROUND_Y - 120 - Math.random() * 50;
    const s = this.powers.create(GAME.WIDTH + 40, y, def.key);
    s.setDepth(17);
    s.setScale(1.1);
    s.body.setAllowGravity(false);
    s.body.setCircle(16);
    s.powerType = def.type;
    s.baseY = y;
    s.phase = Math.random() * Math.PI * 2;
    s.speedMul = 1;
  }
}
