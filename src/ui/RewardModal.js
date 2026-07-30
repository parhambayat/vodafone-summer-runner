import { COLORS, FONT, GAME } from '../config.js';
import { sound } from '../audio/SoundManager.js';

/** Congrats + QR placeholder every REWARD_EVERY points */
export class RewardModal {
  constructor(scene) {
    this.scene = scene;
    this.root = scene.add.container(GAME.WIDTH / 2, GAME.HEIGHT / 2).setDepth(80).setVisible(false);

    const dim = scene.add.rectangle(0, 0, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.55);
    const panel = scene.add.rectangle(0, 0, 340, 360, COLORS.RED).setStrokeStyle(4, COLORS.WHITE);
    const title = scene.add.text(0, -150, 'CONGRATULATIONS!', {
      fontFamily: FONT, fontSize: '11px', color: '#FFFFFF', align: 'center'
    }).setOrigin(0.5);
    const sub = scene.add.text(0, -118, 'You unlocked a\nVodafone Summer Reward!', {
      fontFamily: FONT, fontSize: '8px', color: '#FFE08A', align: 'center', lineSpacing: 8
    }).setOrigin(0.5);
    const qr = scene.add.image(0, 10, 'qr').setScale(1.05);
    const hint = scene.add.text(0, 105, 'Scan QR for reward\n(placeholder)', {
      fontFamily: FONT, fontSize: '7px', color: '#FFFFFF', align: 'center', lineSpacing: 6
    }).setOrigin(0.5);
    const btn = scene.add.image(0, 148, 'btn').setInteractive({ useHandCursor: true });
    const btnLabel = scene.add.text(0, 148, 'CONTINUE', {
      fontFamily: FONT, fontSize: '12px', color: '#E60000'
    }).setOrigin(0.5);

    this.root.add([dim, panel, title, sub, qr, hint, btn, btnLabel]);

    btn.on('pointerover', () => btn.setScale(1.04));
    btn.on('pointerout', () => btn.setScale(1));
    btn.on('pointerup', () => this.hide());
  }

  show(onDone) {
    this.onDone = onDone;
    sound.reward();
    this.root.setVisible(true).setAlpha(0).setScale(0.9);
    this.scene.tweens.add({
      targets: this.root,
      alpha: 1,
      scale: 1,
      duration: 220,
      ease: 'Back.out'
    });
  }

  hide() {
    sound.click();
    this.scene.tweens.add({
      targets: this.root,
      alpha: 0,
      scale: 0.92,
      duration: 160,
      onComplete: () => {
        this.root.setVisible(false);
        if (this.onDone) this.onDone();
      }
    });
  }
}
