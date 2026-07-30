import { GAME } from '../config.js';
import { sound } from '../audio/SoundManager.js';
import { BeachWorld } from '../objects/BeachWorld.js';
import { Player } from '../objects/Player.js';
import { Spawner } from '../objects/Spawner.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.speed = GAME.BASE_SPEED;
    this.score = 0;
    this.lives = GAME.LIVES;
    this.best = Number(localStorage.getItem(GAME.STORAGE_BEST) || 0);
    this.distanceAcc = 0;
    this.paused = false;
    this.alive = true;

    this.world = new BeachWorld(this);
    this.player = new Player(this);
    this.spawner = new Spawner(this);
    this.hud = new HUD(this);

    this.physics.add.collider(this.player.sprite, this.world.floor);
    this.player.reset();

    this.physics.add.overlap(this.player.sprite, this.spawner.obstacles, (_, obs) => this.onObstacle(obs));
    this.physics.add.overlap(this.player.sprite, this.spawner.collects, (_, item) => this.onCollect(item));
    this.physics.add.overlap(this.player.sprite, this.spawner.powers, (_, pu) => this.onPower(pu));

    this.hud.setScore(0, this.best);
    this.hud.setLives(this.lives);

    this.jumpKeys = this.input.keyboard
      ? this.input.keyboard.addKeys({
          space: Phaser.Input.Keyboard.KeyCodes.SPACE,
          up: Phaser.Input.Keyboard.KeyCodes.UP,
          w: Phaser.Input.Keyboard.KeyCodes.W
        })
      : null;
    this.input.on('pointerdown', () => {
      if (!this.paused && this.alive) this.player.jump();
    });

    sound.ensure();
  }

  update(_, delta) {
    if (this.paused || !this.alive) return;
    const dt = Math.min(delta, 40) / 1000;

    if (
      this.jumpKeys &&
      (Phaser.Input.Keyboard.JustDown(this.jumpKeys.space) ||
        Phaser.Input.Keyboard.JustDown(this.jumpKeys.up) ||
        Phaser.Input.Keyboard.JustDown(this.jumpKeys.w))
    ) {
      this.player.jump();
    }

    const turboMul = this.player.turbo ? 1.7 : 1;
    this.speed = Math.min(GAME.MAX_SPEED, this.speed + GAME.SPEED_RAMP * this.speed * dt);
    const scroll = this.speed * turboMul;

    // Day → sunset by score (~0 at start, ~1 around 600+)
    this.world.setSunset(Math.min(1, this.score / 600));
    this.world.update(scroll, dt);
    this.player.update();
    this.spawner.update(dt, scroll);

    if (this.player.magnet) {
      this.spawner.collects.getChildren().forEach((c) => {
        if (!c.active) return;
        const d = Phaser.Math.Distance.Between(c.x, c.y, this.player.sprite.x, this.player.sprite.y);
        if (d < 220) {
          this.physics.moveToObject(c, this.player.sprite, 520);
          c.speedMul = 0;
        }
      });
    }

    // Endless distance score — no point cap
    this.distanceAcc += scroll * dt * 0.02;
    if (this.distanceAcc >= 1) {
      const add = Math.floor(this.distanceAcc) * this.player.scoreMul;
      this.distanceAcc -= Math.floor(this.distanceAcc);
      this.addScore(add, false);
    }

    this.hud.setPowers(this.player);
  }

  addScore(n, pulse = true) {
    if (n <= 0) return;
    this.score += n;
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem(GAME.STORAGE_BEST, String(this.best));
    }
    this.hud.setScore(this.score, this.best);
    if (pulse) this.hud.pulseScore();
  }

  onObstacle(obs) {
    if (!obs.active || !this.alive) return;
    const hit = this.player.takeHit();
    if (!hit) {
      this.burst(obs.x, obs.y - 20, 'p_star', 8);
      obs.destroy();
      return;
    }
    obs.destroy();
    this.lives -= 1;
    this.hud.setLives(this.lives);
    if (this.lives <= 0) this.endGame();
  }

  onCollect(item) {
    if (!item.active) return;
    const pts = (item.points || 5) * this.player.scoreMul;
    this.addScore(pts);
    sound.collect();
    this.burst(item.x, item.y, 'p_coin', 10);
    this.burst(item.x, item.y, 'p_star', 6);
    item.destroy();
  }

  onPower(pu) {
    if (!pu.active) return;
    this.player.applyPower(pu.powerType);
    this.burst(pu.x, pu.y, 'p_star', 14);
    this.addScore(15 * this.player.scoreMul);
    pu.destroy();
  }

  burst(x, y, key, n) {
    const p = this.add.particles(x, y, key, {
      speed: { min: 40, max: 160 },
      lifespan: 420,
      scale: { start: 1.2, end: 0 },
      quantity: n,
      emitting: false
    });
    p.setDepth(40);
    p.explode(n);
    this.time.delayedCall(500, () => p.destroy());
  }

  endGame() {
    this.alive = false;
    this.physics.pause();
    sound.gameOver();
    this.time.delayedCall(550, () => {
      this.scene.start('GameOverScene', { score: this.score, best: this.best });
    });
  }
}
