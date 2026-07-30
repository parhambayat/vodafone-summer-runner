import { GAME } from '../config.js';
import { sound } from '../audio/SoundManager.js';
import { vibe, HAPTIC } from '../utils/haptics.js';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(GAME.PLAYER_X, GAME.GROUND_Y - 36, 'm_run1');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(20);
    this.sprite.setScale(1.55);
    this.sprite.body.setSize(40, 48);
    this.sprite.body.setOffset(22, 16);
    this.sprite.body.setGravityY(GAME.GRAVITY);

    this.grounded = true;
    this.invincible = false;
    this.shield = false;
    this.magnet = false;
    this.turbo = false;
    this.scoreMul = 1;
    this.hitFlash = false;

    this.shieldRing = scene.add.circle(0, 0, 38, 0x1db8d1, 0.18).setDepth(19).setVisible(false);
    this.shieldRing.setStrokeStyle(3, 0xffffff, 0.7);

    if (!scene.anims.exists('run')) {
      scene.anims.create({
        key: 'run',
        frames: [{ key: 'm_run1' }, { key: 'm_run2' }],
        frameRate: 10,
        repeat: -1
      });
    }
  }

  reset() {
    this.sprite.setPosition(GAME.PLAYER_X, GAME.GROUND_Y - 36);
    this.sprite.setVelocity(0, 0);
    this.sprite.setTexture('m_run1');
    this.sprite.play('run');
    this.invincible = false;
    this.shield = false;
    this.magnet = false;
    this.turbo = false;
    this.scoreMul = 1;
    this.hitFlash = false;
    this.sprite.setAlpha(1);
    this.shieldRing.setVisible(false);
  }

  jump() {
    if (!this.grounded || this.hitFlash) return false;
    this.sprite.setVelocityY(GAME.JUMP_VELOCITY);
    this.grounded = false;
    this.sprite.anims.stop();
    this.sprite.setTexture('m_jump');
    sound.jump();

    const dust = this.scene.add.particles(this.sprite.x, GAME.GROUND_Y - 4, 'p_dust', {
      speed: { min: 20, max: 70 },
      angle: { min: 200, max: 340 },
      lifespan: 280,
      scale: { start: 1.2, end: 0 },
      quantity: 6,
      emitting: false
    });
    dust.explode(8);
    this.scene.time.delayedCall(400, () => dust.destroy());
    return true;
  }

  update() {
    const body = this.sprite.body;
    const onFloor = body.blocked.down || body.touching.down || this.sprite.y >= GAME.GROUND_Y - 38;

    if (onFloor && body.velocity.y >= 0) {
      if (!this.grounded) {
        const land = this.scene.add.particles(this.sprite.x, GAME.GROUND_Y - 2, 'p_dust', {
          speed: { min: 10, max: 50 },
          angle: { min: 180, max: 360 },
          lifespan: 220,
          scale: { start: 1, end: 0 },
          quantity: 4,
          emitting: false
        });
        land.explode(6);
        this.scene.time.delayedCall(350, () => land.destroy());
      }
      this.grounded = true;
      this.sprite.y = GAME.GROUND_Y - 36;
      body.setVelocityY(0);
      if (!this.hitFlash && this.sprite.anims.currentAnim?.key !== 'run') this.sprite.play('run');
    } else {
      this.grounded = false;
      if (!this.hitFlash) this.sprite.setTexture('m_jump');
    }

    this.shieldRing.setPosition(this.sprite.x, this.sprite.y + 2);
    this.shieldRing.setVisible(this.shield);
    if (this.shield) this.shieldRing.setScale(1 + Math.sin(this.scene.time.now / 180) * 0.06);
  }

  applyPower(type) {
    sound.power();
    vibe(HAPTIC.power);
    const dur = 7000;
    if (type === 'turbo') {
      this.turbo = true;
      this.scene.time.delayedCall(dur, () => { this.turbo = false; });
    } else if (type === 'shield') {
      this.shield = true;
      this.invincible = true;
      this.scene.time.delayedCall(dur, () => {
        this.shield = false;
        if (!this.hitFlash) this.invincible = false;
      });
    } else if (type === 'magnet') {
      this.magnet = true;
      this.scene.time.delayedCall(dur, () => { this.magnet = false; });
    } else if (type === 'x2') {
      this.scoreMul = 2;
      this.scene.time.delayedCall(dur, () => { this.scoreMul = 1; });
    }
  }

  takeHit() {
    if (this.invincible || this.shield) {
      if (this.shield) {
        this.shield = false;
        this.invincible = true;
        vibe(HAPTIC.shieldBreak);
        this.scene.time.delayedCall(900, () => { this.invincible = false; });
      }
      return false;
    }
    sound.hit();
    vibe(HAPTIC.hit);
    this.hitFlash = true;
    this.invincible = true;
    this.sprite.anims.stop();
    this.sprite.setTexture('m_hit');
    this.scene.cameras.main.shake(180, 0.01);
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.25,
      duration: 80,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.sprite.setAlpha(1);
        this.hitFlash = false;
        if (this.grounded) this.sprite.play('run');
      }
    });
    this.scene.time.delayedCall(1200, () => {
      if (!this.shield) this.invincible = false;
    });
    return true;
  }
}
