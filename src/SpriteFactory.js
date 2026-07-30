import { COLORS as G } from './config.js';

/**
 * Procedural 16-bit style sprite baker.
 * Player is a Chrome-dino-style runner (side silhouette), Vodafone red + summer shades.
 */
export class SpriteFactory {
  constructor(scene) {
    this.s = scene;
  }

  tex(key, w, h, fn) {
    if (this.s.textures.exists(key)) {
      this.s.textures.remove(key);
    }
    const g = this.s.make.graphics({ x: 0, y: 0, add: false });
    const rounded = typeof g.fillRoundedRect === 'function'
      ? g.fillRoundedRect.bind(g)
      : null;
    g.fillRoundedRect = (x, y, width, height, radius) => {
      const r = Math.max(0, Math.min(Number(radius) || 0, Math.floor(Math.min(width, height) / 2)));
      if (!rounded || !r) {
        g.fillRect(x, y, width, height);
        return;
      }
      try {
        rounded(x, y, width, height, r);
      } catch (_) {
        g.fillRect(x, y, width, height);
      }
    };
    try {
      fn(g);
      g.generateTexture(key, Math.ceil(w), Math.ceil(h));
    } finally {
      g.destroy();
    }
  }

  star(g, cx, cy, pts, r1, r2) {
    const step = Math.PI / pts;
    g.beginPath();
    for (let i = 0; i < 2 * pts; i++) {
      const r = i % 2 === 0 ? r1 : r2;
      const a = i * step - Math.PI / 2;
      if (i === 0) g.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      else g.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    g.closePath();
    g.fillPath();
  }

  pie(g, cx, cy, radius, start, end) {
    g.beginPath();
    g.moveTo(cx, cy);
    g.arc(cx, cy, radius, start, end, false);
    g.closePath();
    g.fillPath();
  }

  arcStroke(g, cx, cy, radius, start, end, anticlockwise = false) {
    g.beginPath();
    g.arc(cx, cy, radius, start, end, anticlockwise);
    g.strokePath();
  }

  /**
   * Classic Chrome offline-dino silhouette (side view, facing right).
   * Block pixels like the original — Vodafone red + summer shades.
   * legMode: 0=run A, 1=run B, 2=jump, 3=hit
   */
  dinoBody(g, legMode) {
    const C = G.RED;
    const D = G.DRED;
    // Canvas 88x70 — larger readable silhouette on phones

    // Tail (upturned like Chrome dino)
    g.fillStyle(C);
    g.fillRect(0, 30, 8, 6);
    g.fillRect(2, 26, 8, 8);
    g.fillRect(6, 24, 8, 10);
    g.fillRect(10, 26, 6, 12);

    // Body torso
    g.fillStyle(C);
    g.fillRect(14, 24, 34, 26);
    g.fillStyle(D);
    g.fillRect(16, 46, 30, 4);

    // Summer swimsuit stripe
    g.fillStyle(G.WHITE);
    g.fillRect(18, 32, 22, 4);
    g.fillStyle(G.YELLOW);
    g.fillRect(18, 36, 22, 3);

    // Neck
    g.fillStyle(C);
    g.fillRect(40, 14, 12, 22);

    // Head block (classic T-rex profile)
    g.fillRect(46, 4, 30, 22);
    // snout
    g.fillRect(70, 12, 14, 12);
    // jaw underbite notch
    g.fillStyle(D);
    g.fillRect(72, 20, 10, 3);
    // mouth line
    g.fillRect(68, 18, 14, 2);

    // Eye socket
    g.fillStyle(G.WHITE);
    g.fillRect(56, 8, 8, 8);
    g.fillStyle(G.BLACK);
    g.fillRect(58, 10, 4, 4);

    // Summer sunglasses
    g.fillStyle(0x111111);
    g.fillRect(50, 9, 22, 6);
    g.fillRect(48, 10, 4, 5);
    g.fillRect(70, 10, 4, 5);
    g.fillStyle(0x333333);
    g.fillRect(52, 10, 8, 4);
    g.fillRect(62, 10, 8, 4);
    g.fillStyle(G.YELLOW);
    g.fillRect(59, 11, 3, 2);

    // Tiny T-rex arms
    g.fillStyle(C);
    g.fillRect(42, 30, 10, 5);
    g.fillRect(50, 32, 7, 4);

    // Legs — Chrome-style alternating stride
    g.fillStyle(C);
    if (legMode === 0) {
      g.fillRect(20, 50, 10, 16);
      g.fillRect(18, 62, 14, 5);
      g.fillRect(38, 50, 10, 8);
      g.fillRect(40, 56, 12, 5);
    } else if (legMode === 1) {
      g.fillRect(20, 50, 10, 8);
      g.fillRect(18, 56, 12, 5);
      g.fillRect(38, 50, 10, 16);
      g.fillRect(36, 62, 14, 5);
    } else if (legMode === 2) {
      g.fillRect(22, 48, 10, 12);
      g.fillRect(20, 58, 12, 4);
      g.fillRect(38, 48, 10, 12);
      g.fillRect(40, 58, 12, 4);
    } else {
      g.fillRect(14, 50, 10, 14);
      g.fillRect(12, 62, 12, 5);
      g.fillRect(44, 50, 10, 14);
      g.fillRect(46, 62, 12, 5);
    }

    // White sneakers
    g.fillStyle(G.WHITE);
    if (legMode === 0) {
      g.fillRect(18, 64, 14, 4);
      g.fillRect(40, 58, 12, 3);
    } else if (legMode === 1) {
      g.fillRect(18, 58, 12, 3);
      g.fillRect(36, 64, 14, 4);
    } else if (legMode === 2) {
      g.fillRect(20, 60, 12, 3);
      g.fillRect(40, 60, 12, 3);
    } else {
      g.fillRect(12, 64, 12, 4);
      g.fillRect(46, 64, 12, 4);
    }
  }

  mascot() {
    this.tex('m_run1', 88, 70, (g) => this.dinoBody(g, 0));
    this.tex('m_run2', 88, 70, (g) => this.dinoBody(g, 1));
    this.mascotJump();
    this.mascotHit();
  }

  mascotJump() {
    this.tex('m_jump', 88, 70, (g) => this.dinoBody(g, 2));
  }

  mascotHit() {
    this.tex('m_hit', 88, 70, (g) => {
      this.dinoBody(g, 3);
      g.fillStyle(G.WHITE);
      g.fillRect(52, 7, 16, 10);
      g.lineStyle(2.5, G.BLACK);
      g.beginPath();
      g.moveTo(54, 8);
      g.lineTo(62, 16);
      g.strokePath();
      g.beginPath();
      g.moveTo(62, 8);
      g.lineTo(54, 16);
      g.strokePath();
    });
  }

  obstacles() {
    this.tex('o_palm', 72, 130, (g) => {
      g.fillStyle(G.BROWN);
      g.fillRoundedRect(28, 42, 16, 88, 5);
      for (let i = 0; i < 6; i++) {
        g.fillStyle(G.DBROWN);
        g.fillRect(28, 50 + i * 13, 16, 5);
      }
      g.fillStyle(G.DGREEN);
      g.fillTriangle(36, 0, 5, 46, 36, 46);
      g.fillStyle(G.GREEN);
      g.fillTriangle(36, 8, 0, 48, 36, 48);
      g.fillStyle(G.DGREEN);
      g.fillTriangle(36, 8, 80, 48, 36, 48);
      g.fillStyle(G.GREEN);
      g.fillTriangle(36, 14, 0, 60, 32, 54);
      g.fillStyle(G.DGREEN);
      g.fillTriangle(36, 14, 74, 60, 40, 54);
      g.fillStyle(G.YELLOW);
      g.fillCircle(28, 48, 5);
      g.fillCircle(44, 50, 5);
      g.fillStyle(G.DBROWN);
      g.fillCircle(30, 45, 5);
      g.fillCircle(43, 47, 5);
    });

    this.tex('o_umb', 90, 110, (g) => {
      g.fillStyle(G.YELLOW);
      g.fillRoundedRect(42, 32, 6, 78, 3);
      const cols = [G.RED, G.WHITE, G.RED, G.WHITE, G.RED, G.WHITE];
      for (let i = 0; i < 6; i++) {
        g.fillStyle(cols[i]);
        this.pie(
          g, 45, 36, 44,
          (Math.PI * i) / 3 - Math.PI / 2,
          (Math.PI * (i + 1)) / 3 - Math.PI / 2
        );
      }
      g.lineStyle(2, G.DYELLOW);
      g.strokeCircle(45, 36, 44);
      g.fillStyle(G.DSAND);
      g.fillRoundedRect(28, 104, 34, 6, 3);
    });

    this.tex('o_castle', 84, 96, (g) => {
      g.fillStyle(G.DSAND);
      g.fillRect(0, 35, 25, 61);
      g.fillRect(59, 35, 25, 61);
      g.fillRect(22, 45, 40, 51);
      g.fillStyle(G.SAND);
      for (let i = 0; i < 3; i++) {
        g.fillRect(2 + i * 8, 24, 6, 13);
        g.fillRect(61 + i * 8, 24, 6, 13);
      }
      for (let i = 0; i < 4; i++) g.fillRect(24 + i * 9, 34, 6, 13);
      g.fillStyle(G.DBROWN);
      g.fillRoundedRect(34, 70, 16, 26, 8);
      g.fillStyle(G.OCEAN);
      g.fillCircle(12, 55, 6);
      g.fillCircle(72, 55, 6);
      g.fillStyle(G.CORAL);
      g.fillCircle(42, 58, 4);
    });

    this.tex('o_surf', 32, 110, (g) => {
      g.fillStyle(G.RED);
      g.fillEllipse(16, 55, 30, 105);
      g.fillStyle(G.WHITE);
      g.fillRect(4, 38, 24, 35);
      g.fillStyle(G.RED);
      g.fillCircle(16, 55, 9);
      g.fillStyle(G.WHITE);
      g.fillCircle(16, 55, 5.5);
      g.fillStyle(G.DRED);
      g.fillTriangle(10, 90, 22, 90, 16, 110);
    });

    this.tex('o_barrel', 55, 70, (g) => {
      g.fillStyle(G.BROWN);
      g.fillRoundedRect(5, 5, 45, 60, 12);
      g.fillStyle(G.DBROWN);
      g.fillRoundedRect(3, 12, 49, 7, 3);
      g.fillRoundedRect(3, 33, 49, 7, 3);
      g.fillRoundedRect(3, 53, 49, 7, 3);
      g.fillEllipse(27, 8, 47, 16);
      g.fillStyle(G.YELLOW);
      g.fillRect(18, 24, 18, 10);
      g.fillStyle(G.RED);
      g.fillRect(20, 26, 14, 6);
    });

    this.tex('o_rock', 72, 55, (g) => {
      g.fillStyle(G.GRAY);
      g.fillEllipse(36, 36, 72, 50);
      g.fillStyle(0xaaaaaa);
      g.fillEllipse(24, 24, 38, 30);
      g.fillStyle(0x666666);
      g.fillEllipse(50, 38, 34, 24);
      // seaweed
      g.fillStyle(G.GREEN);
      g.fillRect(20, 18, 3, 12);
      g.fillRect(48, 22, 3, 10);
    });

    // Flip-flops obstacle
    this.tex('o_flip', 70, 40, (g) => {
      g.fillStyle(G.CORAL);
      g.fillEllipse(20, 22, 36, 18);
      g.fillStyle(G.ORANGE);
      g.fillEllipse(50, 26, 34, 16);
      g.fillStyle(G.YELLOW);
      g.fillRect(14, 10, 4, 14);
      g.fillRect(22, 10, 4, 14);
      g.fillRect(44, 14, 4, 12);
      g.fillRect(52, 14, 4, 12);
      g.fillStyle(G.WHITE);
      g.fillCircle(18, 20, 3);
      g.fillCircle(48, 24, 3);
    });
  }

  collectibles() {
    this.tex('c_ice', 42, 58, (g) => {
      g.fillStyle(G.DYELLOW);
      g.fillTriangle(21, 58, 5, 28, 37, 28);
      g.fillStyle(G.CORAL);
      g.fillCircle(21, 22, 19);
      g.fillStyle(G.ORANGE);
      g.fillCircle(15, 15, 10);
      g.fillStyle(G.YELLOW);
      g.fillCircle(28, 13, 12);
      g.fillStyle(G.WHITE);
      g.fillRoundedRect(24, 16, 6, 3, 1.5);
      g.fillStyle(G.RED);
      g.fillRoundedRect(17, 8, 7, 3, 1.5);
    });

    this.tex('c_mel', 48, 38, (g) => {
      g.fillStyle(G.GREEN);
      this.pie(g, 24, 38, 24, Math.PI, 0);
      g.fillStyle(G.WHITE);
      this.pie(g, 24, 38, 20, Math.PI, 0);
      g.fillStyle(G.RED);
      this.pie(g, 24, 38, 16, Math.PI, 0);
      g.fillStyle(G.BLACK);
      g.fillEllipse(12, 26, 4, 6);
      g.fillEllipse(24, 20, 4, 6);
      g.fillEllipse(36, 26, 4, 6);
    });

    this.tex('c_coin', 38, 38, (g) => {
      g.fillStyle(G.YELLOW);
      g.fillCircle(19, 19, 19);
      g.fillStyle(G.DYELLOW);
      g.fillCircle(19, 19, 15);
      g.fillStyle(G.YELLOW);
      g.fillCircle(19, 19, 11);
      g.lineStyle(2.5, G.DYELLOW);
      g.beginPath();
      g.moveTo(12, 12);
      g.lineTo(19, 26);
      g.lineTo(26, 12);
      g.strokePath();
      g.fillStyle(0xffffcc);
      g.fillEllipse(11, 13, 7, 4);
    });

    this.tex('c_drink', 32, 54, (g) => {
      g.fillStyle(G.TURQ);
      g.fillRoundedRect(5, 16, 22, 36, 7);
      g.fillRoundedRect(9, 6, 14, 12, 3);
      g.fillStyle(G.WHITE);
      g.fillRoundedRect(8, 2, 16, 9, 4);
      g.fillStyle(G.YELLOW);
      g.fillRoundedRect(7, 28, 18, 16, 3);
      g.fillStyle(G.RED);
      g.fillRect(9, 31, 14, 2.5);
      // straw + lemon
      g.fillStyle(G.ORANGE);
      g.fillRect(20, 0, 3, 18);
      g.fillStyle(G.YELLOW);
      g.fillCircle(10, 20, 6);
    });

    this.tex('c_ball', 40, 40, (g) => {
      g.fillStyle(G.WHITE);
      g.fillCircle(20, 20, 20);
      g.fillStyle(G.RED);
      this.pie(g, 20, 20, 20, -Math.PI / 2, Math.PI / 6);
      this.pie(g, 20, 20, 20, Math.PI / 6 + (2 * Math.PI) / 3, Math.PI / 6 + (4 * Math.PI) / 3);
      g.fillStyle(G.SKY);
      this.pie(g, 20, 20, 20, Math.PI / 6, Math.PI / 6 + (2 * Math.PI) / 3);
      this.pie(g, 20, 20, 20, Math.PI / 6 + (4 * Math.PI) / 3, -Math.PI / 2 + 2 * Math.PI);
      g.fillStyle(G.WHITE);
      g.fillCircle(14, 13, 5);
    });

    this.tex('c_gift', 42, 48, (g) => {
      g.fillStyle(G.RED);
      g.fillRoundedRect(2, 20, 38, 26, 4);
      g.fillStyle(G.DRED);
      g.fillRoundedRect(0, 14, 42, 10, 4);
      g.fillStyle(G.YELLOW);
      g.fillRect(18, 14, 6, 32);
      g.fillRect(0, 15, 42, 8);
      g.fillStyle(G.YELLOW);
      g.fillEllipse(14, 11, 18, 11);
      g.fillEllipse(28, 11, 18, 11);
      g.fillStyle(G.DYELLOW);
      g.fillCircle(21, 11, 5.5);
    });

    // Seashell
    this.tex('c_shell', 40, 36, (g) => {
      g.fillStyle(G.CORAL);
      g.fillTriangle(20, 4, 2, 30, 38, 30);
      g.fillStyle(0xffb4a8);
      g.fillTriangle(20, 10, 8, 28, 32, 28);
      g.fillStyle(G.WHITE);
      for (let i = 0; i < 5; i++) {
        g.fillRect(10 + i * 5, 18, 2, 10);
      }
      g.fillStyle(G.YELLOW);
      g.fillCircle(20, 26, 4);
    });

    // Coconut drink
    this.tex('c_coco', 40, 48, (g) => {
      g.fillStyle(G.DBROWN);
      g.fillCircle(20, 28, 18);
      g.fillStyle(G.BROWN);
      g.fillCircle(20, 26, 15);
      g.fillStyle(G.WHITE);
      g.fillCircle(20, 20, 10);
      g.fillStyle(G.TURQ);
      g.fillCircle(20, 20, 7);
      g.fillStyle(G.GREEN);
      g.fillRect(18, 2, 4, 14);
      g.fillStyle(G.ORANGE);
      g.fillRect(26, 4, 3, 16);
      g.fillStyle(G.YELLOW);
      g.fillCircle(12, 18, 4);
    });
  }

  powerups() {
    this.tex('pu_turbo', 40, 40, (g) => {
      g.fillStyle(G.YELLOW);
      g.fillCircle(20, 20, 20);
      g.fillStyle(G.DYELLOW);
      g.fillCircle(20, 20, 16);
      g.fillStyle(G.YELLOW);
      g.fillTriangle(23, 4, 14, 22, 21, 22);
      g.fillTriangle(19, 18, 10, 36, 26, 20);
      g.fillStyle(0xffffaa);
      g.fillCircle(14, 13, 4);
    });

    this.tex('pu_shield', 40, 40, (g) => {
      g.fillStyle(G.SKY);
      g.fillCircle(20, 20, 20);
      g.fillStyle(G.OCEAN);
      g.fillCircle(20, 20, 16);
      g.fillStyle(G.SKY);
      g.fillRoundedRect(10, 9, 20, 22, 3);
      g.fillTriangle(10, 26, 30, 26, 20, 35);
      g.fillStyle(G.WHITE);
      this.star(g, 20, 18, 5, 7, 3.5);
    });

    this.tex('pu_mag', 40, 40, (g) => {
      g.fillStyle(G.GREEN);
      g.fillCircle(20, 20, 20);
      g.fillStyle(G.DGREEN);
      g.fillCircle(20, 20, 16);
      g.fillStyle(G.RED);
      g.fillRoundedRect(9, 10, 8, 18, 2);
      g.fillRoundedRect(23, 10, 8, 18, 2);
      g.lineStyle(7, G.RED);
      this.arcStroke(g, 20, 28, 11, Math.PI, 0, true);
      g.fillStyle(G.WHITE);
      g.fillRect(9, 22, 8, 7);
      g.fillRect(23, 22, 8, 7);
    });

    this.tex('pu_x2', 40, 40, (g) => {
      g.fillStyle(G.PURPLE);
      g.fillCircle(20, 20, 20);
      g.fillStyle(G.DPURPLE);
      g.fillCircle(20, 20, 16);
      g.lineStyle(3.5, G.WHITE);
      g.beginPath();
      g.moveTo(7, 12);
      g.lineTo(16, 24);
      g.strokePath();
      g.beginPath();
      g.moveTo(16, 12);
      g.lineTo(7, 24);
      g.strokePath();
      g.fillStyle(G.WHITE);
      g.fillRect(20, 12, 14, 4);
      g.fillRect(30, 16, 4, 6);
      g.fillRect(20, 20, 14, 4);
      g.fillRect(20, 24, 4, 6);
      g.fillRect(20, 28, 14, 4);
    });
  }

  backgrounds() {
    this.tex('cloud', 110, 45, (g) => {
      g.fillStyle(G.WHITE);
      g.fillCircle(28, 28, 22);
      g.fillCircle(50, 20, 28);
      g.fillCircle(78, 24, 22);
      g.fillCircle(92, 30, 16);
      g.fillRect(28, 28, 65, 16);
      g.fillStyle(0xe8f8ff);
      g.fillCircle(50, 17, 20);
    });

    this.tex('ground', 256, 80, (g) => {
      g.fillStyle(G.SAND);
      g.fillRect(0, 0, 256, 80);
      g.fillStyle(G.DSAND);
      for (let x = 0; x < 256; x += 20) {
        for (let y = 10; y < 80; y += 14) g.fillCircle(x + (y % 20), y, 1.6);
      }
      g.fillStyle(0xf0c870);
      g.fillRect(0, 0, 256, 8);
      // shells & footprints accents
      g.fillStyle(G.CORAL);
      g.fillCircle(40, 28, 3);
      g.fillCircle(160, 48, 2.5);
      g.fillStyle(G.WHITE);
      g.fillCircle(90, 36, 2);
      g.fillCircle(210, 22, 2.5);
    });

    this.tex('wave', 256, 70, (g) => {
      g.fillStyle(G.OCEAN);
      g.fillRect(0, 0, 256, 70);
      g.fillStyle(0x2ab0c8);
      for (let x = 0; x < 256; x += 45) {
        g.fillEllipse(x + 22, 22, 40, 24);
        g.fillEllipse(x + 6, 42, 34, 20);
      }
      g.fillStyle(G.FOAM);
      for (let x = 0; x < 256; x += 45) {
        g.fillEllipse(x + 22, 14, 32, 12);
        g.fillEllipse(x + 6, 34, 28, 11);
      }
    });

    this.tex('island', 160, 70, (g) => {
      g.fillStyle(G.SAND);
      g.fillEllipse(80, 48, 150, 40);
      g.fillStyle(G.GREEN);
      g.fillTriangle(80, 8, 55, 42, 105, 42);
      g.fillStyle(G.BROWN);
      g.fillRect(76, 40, 8, 18);
      g.fillStyle(G.DGREEN);
      g.fillTriangle(80, 4, 48, 38, 80, 34);
      g.fillTriangle(80, 4, 112, 38, 80, 34);
    });

    // Seagull
    this.tex('seagull', 36, 18, (g) => {
      g.fillStyle(G.WHITE);
      g.fillEllipse(18, 12, 10, 6);
      g.fillStyle(G.BLACK);
      g.fillCircle(22, 11, 1.5);
      g.fillStyle(G.ORANGE);
      g.fillTriangle(24, 12, 30, 12, 24, 14);
      g.lineStyle(2.5, G.WHITE);
      g.beginPath();
      g.moveTo(4, 10);
      g.lineTo(14, 6);
      g.lineTo(18, 10);
      g.strokePath();
      g.beginPath();
      g.moveTo(18, 10);
      g.lineTo(24, 5);
      g.lineTo(34, 10);
      g.strokePath();
    });

    // Sun with rays
    this.tex('sun', 90, 90, (g) => {
      g.fillStyle(G.YELLOW, 0.35);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        g.fillTriangle(
          45 + Math.cos(a) * 20,
          45 + Math.sin(a) * 20,
          45 + Math.cos(a - 0.12) * 44,
          45 + Math.sin(a - 0.12) * 44,
          45 + Math.cos(a + 0.12) * 44,
          45 + Math.sin(a + 0.12) * 44
        );
      }
      g.fillStyle(G.YELLOW);
      g.fillCircle(45, 45, 22);
      g.fillStyle(0xffe566);
      g.fillCircle(45, 45, 16);
      g.fillStyle(0xffffaa);
      g.fillCircle(38, 40, 5);
    });

    // Floating beach towel (decor)
    this.tex('towel', 64, 28, (g) => {
      g.fillStyle(G.RED);
      g.fillRoundedRect(0, 4, 64, 20, 3);
      g.fillStyle(G.WHITE);
      for (let i = 0; i < 5; i++) g.fillRect(4 + i * 12, 4, 6, 20);
      g.fillStyle(G.YELLOW);
      g.fillRect(0, 4, 64, 3);
      g.fillRect(0, 21, 64, 3);
    });

    // Starfish decor
    this.tex('starfish', 28, 28, (g) => {
      g.fillStyle(G.ORANGE);
      this.star(g, 14, 14, 5, 13, 6);
      g.fillStyle(G.YELLOW);
      this.star(g, 14, 14, 5, 7, 3);
    });

    // Beach butterfly
    this.tex('butterfly', 20, 16, (g) => {
      g.fillStyle(G.CORAL);
      g.fillEllipse(6, 8, 10, 12);
      g.fillEllipse(14, 8, 10, 12);
      g.fillStyle(G.YELLOW);
      g.fillEllipse(6, 8, 5, 6);
      g.fillEllipse(14, 8, 5, 6);
      g.fillStyle(G.BLACK);
      g.fillRect(9, 4, 2, 10);
      g.fillCircle(10, 4, 1.5);
    });
  }

  ui() {
    this.tex('heart', 30, 28, (g) => {
      g.fillStyle(G.RED);
      g.fillCircle(9, 10, 10);
      g.fillCircle(21, 10, 10);
      g.fillTriangle(0, 13, 30, 13, 15, 28);
    });

    this.tex('qr', 130, 130, (g) => {
      g.fillStyle(G.WHITE);
      g.fillRect(0, 0, 130, 130);
      g.fillStyle(G.BLACK);
      g.fillRect(6, 6, 34, 34);
      g.fillRect(90, 6, 34, 34);
      g.fillRect(6, 90, 34, 34);
      g.fillStyle(G.WHITE);
      g.fillRect(11, 11, 24, 24);
      g.fillRect(95, 11, 24, 24);
      g.fillRect(11, 95, 24, 24);
      g.fillStyle(G.BLACK);
      g.fillRect(15, 15, 16, 16);
      g.fillRect(99, 15, 16, 16);
      g.fillRect(15, 99, 16, 16);
      const d = [1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1];
      let idx = 0;
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
          if (d[idx++ % d.length]) g.fillRect(44 + col * 6, 44 + row * 6, 5, 5);
        }
      }
    });

    // Real Vodafone logo is loaded from assets/vodafone-logo.png in PreloadScene

    this.tex('btn', 260, 64, (g) => {
      g.fillStyle(G.WHITE);
      g.fillRoundedRect(0, 0, 260, 64, 16);
      g.fillStyle(0xffeeee);
      g.fillRoundedRect(6, 6, 248, 22, 10);
    });

    this.tex('btn_dark', 260, 64, (g) => {
      g.fillStyle(G.DRED);
      g.fillRoundedRect(0, 0, 260, 64, 16);
      g.fillStyle(G.RED);
      g.fillRoundedRect(6, 6, 248, 32, 10);
    });

    this.tex('px', 2, 2, (g) => {
      g.fillStyle(G.WHITE);
      g.fillRect(0, 0, 2, 2);
    });
  }

  particles() {
    this.tex('p_dust', 8, 8, (g) => {
      g.fillStyle(G.DSAND);
      g.fillCircle(4, 4, 4);
    });
    this.tex('p_star', 10, 10, (g) => {
      g.fillStyle(G.YELLOW);
      this.star(g, 5, 5, 5, 5, 2);
    });
    this.tex('p_coin', 6, 6, (g) => {
      g.fillStyle(G.YELLOW);
      g.fillCircle(3, 3, 3);
    });
    this.tex('p_spark', 6, 6, (g) => {
      g.fillStyle(G.ORANGE);
      g.fillCircle(3, 3, 3);
    });
    this.tex('p_bubble', 10, 10, (g) => {
      g.fillStyle(0xffffff, 0.35);
      g.fillCircle(5, 5, 5);
      g.lineStyle(1.5, 0xffffff, 0.85);
      g.strokeCircle(5, 5, 4.5);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(3.5, 3.2, 1.6);
    });
    this.tex('p_glint', 8, 8, (g) => {
      g.fillStyle(0xffffaa);
      g.fillRect(3, 0, 2, 8);
      g.fillRect(0, 3, 8, 2);
      g.fillStyle(0xffffff);
      g.fillCircle(4, 4, 1.5);
    });
  }

  all() {
    this.mascot();
    this.obstacles();
    this.collectibles();
    this.powerups();
    this.backgrounds();
    this.ui();
    this.particles();
  }

  jobList() {
    return [
      () => this.tex('m_run1', 88, 70, (g) => this.dinoBody(g, 0)),
      () => this.tex('m_run2', 88, 70, (g) => this.dinoBody(g, 1)),
      () => this.mascotJump(),
      () => this.mascotHit(),
      () => this.obstacles(),
      () => this.collectibles(),
      () => this.powerups(),
      () => this.backgrounds(),
      () => this.ui(),
      () => this.particles()
    ];
  }
}
