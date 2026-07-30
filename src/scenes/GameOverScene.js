import { COLORS, FONT, GAME } from '../config.js';
import { sound } from '../audio/SoundManager.js';
import { makeButton } from '../ui/Button.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.best = data.best || Number(localStorage.getItem(GAME.STORAGE_BEST) || 0);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(0, 0, W, H, COLORS.SKY).setOrigin(0);
    this.add.rectangle(0, 0, W, 56, COLORS.RED).setOrigin(0);
    this.add.image(W - 55, 90, 'sun').setScale(0.7).setAlpha(0.9);
    this.add.rectangle(0, H - 140, W, 140, COLORS.SAND).setOrigin(0);
    this.add.rectangle(0, H - 160, W, 24, COLORS.OCEAN).setOrigin(0);

    this.add.rectangle(W / 2, H / 2 - 20, Math.min(340, W - 28), 380, COLORS.RED)
      .setStrokeStyle(4, COLORS.WHITE);

    this.add.image(W / 2, H / 2 - 170, 'voda').setDisplaySize(72, 72);
    this.add.text(W / 2, H / 2 - 110, 'GAME OVER', {
      fontFamily: FONT, fontSize: '18px', color: '#FFFFFF',
      stroke: '#770000', strokeThickness: 4
    }).setOrigin(0.5);

    const sad = this.add.image(W / 2, H / 2 - 40, 'm_hit').setScale(1.8);
    this.tweens.add({
      targets: sad,
      y: H / 2 - 32,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    this.add.text(W / 2, H / 2 + 40, `SCORE  ${this.finalScore}`, {
      fontFamily: FONT, fontSize: '14px', color: '#FFFFFF'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 70, `BEST  ${this.best}`, {
      fontFamily: FONT, fontSize: '11px', color: '#F5C800'
    }).setOrigin(0.5);

    makeButton(this, W / 2, H / 2 + 130, 'PLAY AGAIN', () => {
      this.scene.start('GameScene');
    }, { scale: 0.95, fontSize: '13px' });

    makeButton(this, W / 2, H / 2 + 200, 'SHARE', () => this.shareScore(), {
      dark: true,
      fontSize: '12px',
      scale: 0.85
    });

    const menuLabel = this.add.text(W / 2, H / 2 + 255, 'BACK TO MENU', {
      fontFamily: FONT, fontSize: '9px', color: '#FFE0E0'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuLabel.on('pointerup', () => {
      sound.click();
      this.scene.start('MenuScene');
    });

    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  async shareScore() {
    sound.click();
    const text = `I scored ${this.finalScore} in Vodafone Summer Runner! Can you beat me?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Vodafone Summer Runner', text });
        return;
      }
    } catch (_) {
      /* cancelled */
    }

    try {
      await navigator.clipboard.writeText(text);
      this.toast('Score copied!');
    } catch (_) {
      this.toast(text);
    }
  }

  toast(msg) {
    const t = this.add.text(this.scale.width / 2, this.scale.height - 80, msg, {
      fontFamily: FONT, fontSize: '9px', color: '#111111',
      backgroundColor: '#FFFFFF', padding: { x: 12, y: 10 }
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({
      targets: t,
      alpha: 0,
      delay: 1600,
      duration: 300,
      onComplete: () => t.destroy()
    });
  }
}
