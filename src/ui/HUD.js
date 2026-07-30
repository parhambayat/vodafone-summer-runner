import { FONT, GAME } from '../config.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;

    // Top safe bar for mobile notches
    scene.add.rectangle(0, 0, GAME.WIDTH, 72, 0x000000, 0.18).setOrigin(0).setDepth(49);

    this.scoreText = scene.add.text(14, 18, 'SCORE 0', {
      fontFamily: FONT, fontSize: '13px', color: '#FFFFFF',
      stroke: '#AA0000', strokeThickness: 5
    }).setDepth(50).setScrollFactor(0);

    this.bestText = scene.add.text(14, 42, 'BEST 0', {
      fontFamily: FONT, fontSize: '9px', color: '#FFE08A'
    }).setDepth(50).setScrollFactor(0);

    this.hearts = [];
    for (let i = 0; i < GAME.LIVES; i++) {
      const h = scene.add.image(GAME.WIDTH - 24 - i * 36, 34, 'heart').setDepth(50).setScale(1);
      this.hearts.push(h);
    }

    this.powerText = scene.add.text(GAME.WIDTH / 2, 64, '', {
      fontFamily: FONT, fontSize: '8px', color: '#FFFFFF', align: 'center'
    }).setOrigin(0.5, 0).setDepth(50);
  }

  setScore(score, best) {
    this.scoreText.setText(`SCORE ${score}`);
    this.bestText.setText(`BEST ${best}`);
  }

  setLives(n) {
    this.hearts.forEach((h, i) => h.setAlpha(i < n ? 1 : 0.2));
  }

  setPowers(player) {
    const bits = [];
    if (player.turbo) bits.push('TURBO');
    if (player.shield) bits.push('SHIELD');
    if (player.magnet) bits.push('MAGNET');
    if (player.scoreMul > 1) bits.push('x2');
    this.powerText.setText(bits.join(' · '));
    this.powerText.setColor(bits.length ? '#F5C800' : '#FFFFFF');
  }

  pulseScore() {
    this.scene.tweens.add({
      targets: this.scoreText,
      scale: 1.12,
      duration: 80,
      yoyo: true
    });
  }
}
