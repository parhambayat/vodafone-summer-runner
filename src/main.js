import { GAME } from './config.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#4EC8E8',
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME.WIDTH,
    height: GAME.HEIGHT
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true
  },
  scene: [PreloadScene, MenuScene, GameScene, GameOverScene],
  input: {
    activePointers: 3
  }
};

window.addEventListener('error', (e) => {
  console.error('[Game error]', e.error || e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Game promise]', e.reason);
});

const game = new Phaser.Game(config);
window.__VF_GAME__ = game;
