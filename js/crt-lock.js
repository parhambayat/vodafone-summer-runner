/**
 * CRT lock sticker — blocks all interaction with the game underneath.
 * Does not modify any game systems; only disables input from the outside
 * and keeps a demo loop running inside the TV screen.
 */
(function crtLockOverlay() {
  'use strict';

  const lock = document.getElementById('crt-lock');
  if (!lock) return;

  const blockEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  };

  const events = [
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'mousemove',
    'pointerdown',
    'pointerup',
    'pointermove',
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
    'wheel',
    'contextmenu',
    'keydown',
    'keyup',
    'keypress'
  ];

  events.forEach((type) => {
    lock.addEventListener(type, blockEvent, true);
    window.addEventListener(type, blockEvent, true);
    document.addEventListener(type, blockEvent, true);
  });

  document.body.style.overflow = 'hidden';

  function disableGameInput(game) {
    if (!game || !game.input) return;
    game.input.enabled = false;
    if (game.input.keyboard) game.input.keyboard.enabled = false;
    if (game.input.mouse) game.input.mouse.enabled = false;
    if (game.input.touch) game.input.touch.enabled = false;
  }

  function keepDemoPlaying(game) {
    const menu = game.scene && game.scene.getScene('MenuScene');
    const play = game.scene && game.scene.getScene('GameScene');
    const over = game.scene && game.scene.getScene('GameOverScene');

    if (over && over.scene && over.scene.isActive()) {
      try {
        over.scene.start('GameScene');
      } catch (_) {
        /* ignore */
      }
      return;
    }

    if (menu && menu.scene && menu.scene.isActive()) {
      try {
        menu.scene.start('GameScene');
      } catch (_) {
        /* ignore */
      }
      return;
    }

    if (play && play.scene && play.scene.isActive() && play.player && play.alive) {
      // Occasional demo jumps so the runner stays alive longer on the CRT
      if (Math.random() < 0.18) {
        try {
          play.player.jump();
        } catch (_) {
          /* ignore */
        }
      }
    }
  }

  let tries = 0;
  const boot = setInterval(() => {
    tries += 1;
    const game = window.__VF_GAME__;
    if (!game) {
      if (tries > 80) clearInterval(boot);
      return;
    }

    disableGameInput(game);
    keepDemoPlaying(game);

    if (!boot._demo) {
      boot._demo = setInterval(() => {
        disableGameInput(game);
        keepDemoPlaying(game);
      }, 700);
    }

    if (tries > 120) clearInterval(boot);
  }, 250);
})();
