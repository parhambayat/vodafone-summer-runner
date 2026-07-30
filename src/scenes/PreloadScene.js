import { COLORS, FONT } from '../config.js';
import { SpriteFactory } from '../SpriteFactory.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.image('voda', 'assets/vodafone-logo.png');
    this.load.image('voda_mark', 'assets/vodafone-mark-white.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(0, 0, W, H, COLORS.SKY).setOrigin(0);
    this.add.rectangle(0, 0, W, 56, COLORS.RED).setOrigin(0);

    if (this.textures.exists('voda_mark')) {
      this.add.image(28, 28, 'voda_mark').setDisplaySize(32, 32);
    } else if (this.textures.exists('voda')) {
      this.add.image(28, 28, 'voda').setDisplaySize(36, 36);
    }

    this.add.text(W / 2, H / 2 - 40, 'LOADING...', {
      fontFamily: FONT, fontSize: '14px', color: '#E60000'
    }).setOrigin(0.5);

    this.add.rectangle(W / 2 - 112, H / 2 + 4, 224, 22, COLORS.DRED).setOrigin(0);
    const bar = this.add.rectangle(W / 2 - 110, H / 2 + 6, 4, 18, COLORS.YELLOW).setOrigin(0).setDepth(1);

    this.add.text(W / 2, H / 2 + 52, 'Vodafone Oman · Summer', {
      fontFamily: FONT, fontSize: '7px', color: '#BB0000'
    }).setOrigin(0.5);

    const factory = new SpriteFactory(this);
    const jobs = factory.jobList();

    let i = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      bar.width = 220;
      if (!this.textures.exists('voda')) this.ensureFallback('voda', 70, 70, COLORS.RED);
      this.ensureFallback('m_run1', 88, 70, COLORS.RED);
      this.ensureFallback('m_run2', 88, 70, COLORS.RED);
      this.ensureFallback('m_jump', 88, 70, COLORS.RED);
      this.ensureFallback('m_hit', 88, 70, COLORS.RED);
      this.ensureFallback('btn', 260, 64, 0xffffff);
      this.ensureFallback('btn_dark', 260, 64, COLORS.DRED);
      this.ensureFallback('cloud', 110, 45, 0xffffff);
      this.ensureFallback('ground', 256, 80, COLORS.SAND);
      this.ensureFallback('wave', 256, 70, COLORS.OCEAN);
      this.ensureFallback('island', 160, 70, COLORS.SAND);
      this.ensureFallback('heart', 30, 28, COLORS.RED);
      this.ensureFallback('qr', 130, 130, 0xffffff);
      this.ensureFallback('px', 2, 2, 0xffffff);
      this.ensureFallback('sun', 90, 90, COLORS.YELLOW);
      this.ensureFallback('seagull', 36, 18, 0xffffff);
      this.ensureFallback('towel', 64, 28, COLORS.RED);
      this.ensureFallback('starfish', 28, 28, COLORS.ORANGE);
      this.ensureFallback('butterfly', 20, 16, COLORS.CORAL);
      this.ensureFallback('p_bubble', 10, 10, 0xffffff);
      this.ensureFallback('p_glint', 8, 8, COLORS.YELLOW);
      window.setTimeout(() => {
        if (this.sys.isActive()) this.scene.start('MenuScene');
      }, 120);
    };

    window.setTimeout(finish, 3500);

    const tick = () => {
      if (finished || !this.sys.isActive()) return;

      if (i >= jobs.length) {
        finish();
        return;
      }

      try {
        jobs[i]();
      } catch (err) {
        console.error(`[Preload] job ${i} failed`, err);
      }

      i += 1;
      bar.width = Math.max(4, Math.floor(220 * (i / jobs.length)));
      window.requestAnimationFrame(() => window.setTimeout(tick, 0));
    };

    window.requestAnimationFrame(() => window.setTimeout(tick, 0));
  }

  ensureFallback(key, w, h, color) {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ add: false });
    g.fillStyle(color, 1);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
