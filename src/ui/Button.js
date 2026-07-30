import { FONT } from '../config.js';
import { sound } from '../audio/SoundManager.js';

export function makeButton(scene, x, y, label, onClick, opts = {}) {
  const key = opts.dark ? 'btn_dark' : 'btn';
  const img = scene.add.image(x, y, key).setInteractive({ useHandCursor: true }).setDepth(opts.depth || 30);
  if (opts.scale) img.setScale(opts.scale);
  const color = opts.dark ? '#FFFFFF' : '#E60000';
  const text = scene.add.text(x, y, label, {
    fontFamily: FONT,
    fontSize: opts.fontSize || '12px',
    color
  }).setOrigin(0.5).setDepth((opts.depth || 30) + 1);

  img.on('pointerover', () => {
    img.setScale((opts.scale || 1) * 1.05);
    text.setScale(1.05);
  });
  img.on('pointerout', () => {
    img.setScale(opts.scale || 1);
    text.setScale(1);
  });
  img.on('pointerdown', () => {
    img.setScale((opts.scale || 1) * 0.97);
  });
  img.on('pointerup', () => {
    img.setScale((opts.scale || 1) * 1.05);
    sound.click();
    onClick();
  });

  return { img, text, setVisible(v) { img.setVisible(v); text.setVisible(v); } };
}
