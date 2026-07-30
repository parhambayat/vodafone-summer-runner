import { COLORS, FONT, GAME } from '../config.js';
import { sound } from '../audio/SoundManager.js';
import { makeButton } from '../ui/Button.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.helpOpen = false;

    // Summer sky menu bg
    this.add.rectangle(0, 0, W, H, COLORS.SKY).setOrigin(0);
    this.add.rectangle(0, 0, W, 200, COLORS.SKY2, 0.5).setOrigin(0);
    this.add.image(W - 60, 70, 'sun').setScale(0.85);
    this.add.image(50, 100, 'cloud').setScale(0.55).setAlpha(0.9);
    this.add.image(W - 40, 140, 'cloud').setScale(0.4).setAlpha(0.75);
    this.add.image(80, 160, 'seagull').setScale(0.9);

    this.add.rectangle(0, H - 120, W, 120, COLORS.SAND).setOrigin(0);
    this.add.rectangle(0, H - 130, W, 12, COLORS.FOAM, 0.7).setOrigin(0);
    this.add.rectangle(0, H - 148, W, 24, COLORS.OCEAN).setOrigin(0);

    this.waveGfx = this.add.graphics();
    this.waveT = 0;

    // Vodafone brand bar — official speechmark (white) on red
    this.add.rectangle(0, 0, W, 56, COLORS.RED).setOrigin(0);
    const logoKey = this.textures.exists('voda_mark') ? 'voda_mark' : 'voda';
    const logo = this.add.image(30, 28, logoKey).setDisplaySize(34, 34);
    this.add.text(56, 28, 'Vodafone', {
      fontFamily: FONT, fontSize: '12px', color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    this.add.text(W / 2, 100, 'SUMMER', {
      fontFamily: FONT, fontSize: '26px', color: '#FFFFFF',
      stroke: '#E60000', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(W / 2, 136, 'RUNNER', {
      fontFamily: FONT, fontSize: '26px', color: '#F5C800',
      stroke: '#996600', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(W / 2, 168, 'Endless beach dash', {
      fontFamily: FONT, fontSize: '8px', color: '#FFFFFF'
    }).setOrigin(0.5).setAlpha(0.9);

    const mascot = this.add.image(W / 2, 250, 'm_run1').setScale(2.35);
    this.tweens.add({
      targets: mascot,
      y: 258,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
    this.time.addEvent({
      delay: 140,
      loop: true,
      callback: () => {
        mascot.setTexture(mascot.texture.key === 'm_run1' ? 'm_run2' : 'm_run1');
      }
    });

    // Decor starfish
    this.add.image(48, H - 70, 'starfish').setScale(0.9).setAngle(-20);
    this.add.image(W - 48, H - 80, 'starfish').setScale(0.75).setAngle(30);
    this.add.image(W / 2 + 100, 270, 'c_ball').setScale(0.75);
    this.add.image(W / 2 - 110, 280, 'c_ice').setScale(0.8);

    const best = Number(localStorage.getItem(GAME.STORAGE_BEST) || 0);
    this.add.text(W / 2, 355, `HIGH SCORE  ${best}`, {
      fontFamily: FONT, fontSize: '11px', color: '#E60000'
    }).setOrigin(0.5);

    makeButton(this, W / 2, 420, 'PLAY', () => {
      sound.ensure();
      this.scene.start('GameScene');
    }, { scale: 1.05, fontSize: '16px' });

    makeButton(this, W / 2 - 90, 500, 'HOW TO', () => this.toggleHelp(), {
      scale: 0.62,
      fontSize: '10px',
      dark: true
    });

    this.soundBtn = makeButton(this, W / 2 + 90, 500, sound.enabled ? 'SOUND' : 'MUTE', () => {
      const on = sound.toggle();
      this.soundBtn.text.setText(on ? 'SOUND' : 'MUTE');
    }, { scale: 0.62, fontSize: '10px', dark: true });

    this.helpPanel = this.buildHelp(W, H);
    this.helpPanel.setVisible(false);

    this.add.text(W / 2, H - 28, 'Vodafone Oman · Summer', {
      fontFamily: FONT, fontSize: '7px', color: '#BB0000'
    }).setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('GameScene'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('GameScene'));

    void logo;
  }

  buildHelp(W, H) {
    const c = this.add.container(W / 2, H / 2).setDepth(60);
    const dim = this.add.rectangle(0, 0, W, H, 0x000000, 0.6);
    const panel = this.add.rectangle(0, 0, Math.min(340, W - 30), 340, COLORS.RED)
      .setStrokeStyle(3, COLORS.WHITE);
    const title = this.add.text(0, -140, 'HOW TO PLAY', {
      fontFamily: FONT, fontSize: '12px', color: '#FFFFFF'
    }).setOrigin(0.5);
    const body = this.add.text(0, -10,
      'TAP anywhere to JUMP\n\nDodge beach obstacles\nGrab summer treats\nCollect power-ups\n\nScore has no limit\nHow far can you run?',
      {
        fontFamily: FONT, fontSize: '9px', color: '#FFFFFF', align: 'center', lineSpacing: 6
      }
    ).setOrigin(0.5);
    const close = this.add.text(0, 140, 'CLOSE', {
      fontFamily: FONT, fontSize: '12px', color: '#F5C800'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    close.on('pointerup', () => this.toggleHelp());
    c.add([dim, panel, title, body, close]);
    return c;
  }

  toggleHelp() {
    this.helpOpen = !this.helpOpen;
    this.helpPanel.setVisible(this.helpOpen);
    sound.click();
  }

  update(_, dt) {
    this.waveT += dt;
    const g = this.waveGfx;
    g.clear();
    g.fillStyle(0x1a9bb8, 1);
    g.beginPath();
    const y0 = this.scale.height - 148;
    g.moveTo(0, this.scale.height - 120);
    g.lineTo(0, y0);
    for (let x = 0; x <= this.scale.width; x += 8) {
      const y = y0 + Math.sin(x * 0.05 + this.waveT * 0.004) * 6;
      g.lineTo(x, y);
    }
    g.lineTo(this.scale.width, this.scale.height - 120);
    g.closePath();
    g.fillPath();
  }
}
