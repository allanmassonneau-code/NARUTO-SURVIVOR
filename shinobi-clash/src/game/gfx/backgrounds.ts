import Phaser from 'phaser';

type Graphics = Phaser.GameObjects.Graphics;

export interface BackgroundPalette {
  sky: [string, string, string, string];
  far: string;
  farDetail: string;
  ground: [string, string];
  pad: [string, string, string, string];
  padStyle: 'grass' | 'stone' | 'sand' | 'wood';
}

/** Palettes des décors : ciel (2 bandes × 2 tons), lointain, sol et estrades. */
export const BACKGROUNDS: Record<string, BackgroundPalette> = {
  academy: {
    sky: ['#d8f0f8', '#c8e8f4', '#e8f8f0', '#d8f0e8'],
    far: '#b0d8c0',
    farDetail: '#98c8b0',
    ground: ['#c0e8a8', '#b0e098'],
    pad: ['#78b860', '#a8e080', '#90d070', '#5a9a48'],
    padStyle: 'grass',
  },
  forest: {
    sky: ['#a8d0a0', '#98c490', '#c0e0b0', '#b0d4a0'],
    far: '#6a9a60',
    farDetail: '#5a8a50',
    ground: ['#98c878', '#88bc68'],
    pad: ['#4a8a40', '#78b860', '#68a850', '#3a6a30'],
    padStyle: 'grass',
  },
  exam: {
    sky: ['#e8eef8', '#dce4f0', '#f4f6f8', '#e8ecf0'],
    far: '#c8ccd8',
    farDetail: '#b0b4c4',
    ground: ['#e0dcd0', '#d4d0c4'],
    pad: ['#a8a090', '#e8e0d0', '#d0c8b8', '#8a8274'],
    padStyle: 'stone',
  },
  desert: {
    sky: ['#f8e8c0', '#f0dcb0', '#f8f0d8', '#f0e4c4'],
    far: '#e8c890',
    farDetail: '#d8b47a',
    ground: ['#f0d8a0', '#e8cc90'],
    pad: ['#c8a048', '#e8d090', '#d8b868', '#a88038'],
    padStyle: 'sand',
  },
  valley: {
    sky: ['#d8d0e8', '#c8c0e0', '#e8e0f0', '#d8d0e4'],
    far: '#a8a0c0',
    farDetail: '#9890b0',
    ground: ['#c8c8d0', '#bcbcc8'],
    pad: ['#8a8a98', '#c8c8d4', '#b0b0be', '#707080'],
    padStyle: 'stone',
  },
  mist: {
    sky: ['#e0e8ec', '#d4dee4', '#eef2f4', '#e2e8ec'],
    far: '#c4d0d8',
    farDetail: '#b0bec8',
    ground: ['#a8c4d8', '#9cbad0'],
    pad: ['#8a7058', '#c8a880', '#b09068', '#6a5440'],
    padStyle: 'wood',
  },
  hideout: {
    sky: ['#d0c0c8', '#c4b4bc', '#dccdd2', '#d0c2c8'],
    far: '#a89098',
    farDetail: '#988088',
    ground: ['#c0aca8', '#b4a09c'],
    pad: ['#806868', '#c0a8a4', '#a89090', '#685050'],
    padStyle: 'stone',
  },
};
/** Résolution logique du terrain, celle de la GBA. */
export const FIELD_W = 240;
export const FIELD_H = 160;
/** Estrades des combattants (centre et rayons). */
export const PADS = {
  enemy: {
    x: 176,
    y: 62,
    rx: 46,
    ry: 11,
  },
  player: {
    x: 64,
    y: 118,
    rx: 62,
    ry: 14,
  },
};
export function hexColor(hex: string): number {
  return parseInt(hex.slice(1), 16);
}
/** Ellipse pleine tracée ligne par ligne (bords en escalier, sans anticrénelage). */
function fillPixelEllipse(g: Graphics, cx: number, cy: number, rx: number, ry: number, color: string): void {
  g.fillStyle(hexColor(color));
  for (let dy = -ry; dy <= ry; dy++) {
    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (half > 0) {
      g.fillRect(Math.round(cx - half), Math.round(cy + dy), half * 2, 1);
    }
  }
}
/** Bandes d'une ligne alternées : le tramage typique des ciels GBA. */
function stripes(g: Graphics, from: number, to: number, colorA: string, colorB: string): void {
  for (let y = from; y < to; y++) {
    g.fillStyle(hexColor(y % 2 ? colorB : colorA));
    g.fillRect(0, y, FIELD_W, 1);
  }
}
function drawScenery(g: Graphics, bg: string, palette: BackgroundPalette): void {
  const base = hexColor(palette.far);
  const detail = hexColor(palette.farDetail);
  g.fillStyle(base);
  switch (bg) {
    case 'academy':
      g.fillRect(10, 30, 120, 56);
      g.fillTriangle(10, 30, 40, 14, 130, 30);
      g.fillStyle(detail);
      for (let t = 0; t < 4; t++) {
        g.fillRect(20 + t * 27, 40, 16, 18);
        g.fillStyle(base);
        g.fillRect(24 + t * 27, 46, 3, 2);
        g.fillRect(31 + t * 27, 46, 3, 2);
        g.fillStyle(detail);
      }
      g.fillStyle(hexColor('#e8b0a0'));
      g.fillTriangle(140, 66, 186, 48, 232, 66);
      g.fillStyle(hexColor('#f0e4d8'));
      g.fillRect(148, 66, 76, 20);
      g.fillStyle(detail);
      for (let t = 154; t < 220; t += 12) {
        g.fillRect(t, 70, 6, 6);
      }
      break;
    case 'forest':
      for (const [t, n] of [
        [6, 16],
        [44, 10],
        [96, 22],
        [150, 12],
        [206, 20],
      ]) {
        g.fillRect(t, 20, n, 66);
      }
      g.fillStyle(detail);
      for (let t = -10; t < FIELD_W; t += 26) {
        g.fillEllipse(t + 13, 16, 46, 26);
      }
      break;
    case 'exam':
      g.fillRect(0, 50, FIELD_W, 36);
      g.fillStyle(detail);
      for (let t = 8; t < FIELD_W; t += 20) {
        g.fillRect(t, 58, 10, 14);
        g.fillEllipse(t + 5, 58, 10, 8);
      }
      g.fillStyle(base);
      g.fillRect(100, 12, 14, 40);
      g.fillRect(126, 12, 14, 40);
      g.fillRect(106, 6, 28, 10);
      break;
    case 'desert':
      for (let t = -40; t < FIELD_W; t += 80) {
        g.fillEllipse(t + 40, 86, 120, 40);
      }
      g.fillStyle(detail);
      for (const t of [150, 178, 204]) {
        g.fillRect(t, 58, 20, 22);
        g.fillEllipse(t + 10, 58, 20, 16);
        g.fillStyle(base);
        g.fillRect(t + 7, 66, 6, 6);
        g.fillStyle(detail);
      }
      break;
    case 'valley':
      g.fillRect(6, 20, 28, 66);
      g.fillRect(10, 8, 20, 14);
      g.fillRect(206, 20, 28, 66);
      g.fillRect(210, 8, 20, 14);
      g.fillStyle(hexColor('#e8f4fc'));
      g.fillRect(104, 30, 32, 56);
      g.fillStyle(hexColor('#c8e0f0'));
      for (let t = 32; t < 86; t += 6) {
        g.fillRect(108 + ((t / 6) % 3) * 8, t, 2, 4);
      }
      break;
    case 'mist':
      g.fillRect(0, 62, FIELD_W, 6);
      g.fillStyle(detail);
      for (let t = 4; t < FIELD_W; t += 18) {
        g.fillRect(t, 50, 3, 14);
      }
      g.fillRect(0, 50, FIELD_W, 2);
      g.fillStyle(hexColor('#f4f8fa'));
      for (let t = -20; t < FIELD_W; t += 50) {
        g.fillEllipse(t + 25, 40 + ((t / 50) % 2) * 8, 70, 12);
      }
      break;
    case 'hideout':
      g.fillRect(0, 20, FIELD_W, 66);
      g.fillStyle(detail);
      for (let t = -20; t < FIELD_W; t += 60) {
        g.fillEllipse(t + 30, 24, 50, 30);
      }
      g.fillStyle(hexColor('#b8a0a8'));
      g.fillRect(96, 26, 48, 60);
      g.fillRect(104, 14, 32, 14);
      g.fillStyle(hexColor('#c84050'));
      g.fillRect(112, 18, 4, 3);
      g.fillRect(124, 18, 4, 3);
  }
}
function makePadTexture(scene: Phaser.Scene, key: string, palette: BackgroundPalette, rx: number, ry: number): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const g = scene.add.graphics();
  const w = rx * 2 + 4;
  const h = ry * 2 + 6;
  const cx = w / 2;
  const cy = ry + 2;
  const [edge, top, inner, speck] = palette.pad;
  fillPixelEllipse(g, cx, cy + 2, rx, ry, edge);
  fillPixelEllipse(g, cx, cy, rx, ry, edge);
  fillPixelEllipse(g, cx, cy, rx - 2, ry - 2, top);
  fillPixelEllipse(g, cx, cy + 1, Math.round(rx * 0.72), Math.round(ry * 0.6), inner);
  fillPixelEllipse(g, cx, cy + 1, Math.round(rx * 0.72) - 2, Math.round(ry * 0.6) - 1, top);
  g.fillStyle(hexColor(speck));
  const count = Math.round(rx / 5);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.round(cx + Math.cos(angle) * rx * 0.86);
    const y = Math.round(cy + Math.sin(angle) * ry * 0.7);
    switch (palette.padStyle) {
      case 'grass':
        g.fillRect(x, y - 2, 1, 2);
        g.fillRect(x + 2, y - 3, 1, 3);
        break;
      case 'sand':
        g.fillRect(x, y, 2, 1);
        break;
      case 'wood':
        if (i % 2 == 0) {
          g.fillRect(x - 6, Math.round(cy), 1, Math.round(ry * 0.8));
        }
        break;
      default:
        g.fillRect(x, y, 2, 2);
    }
  }
  g.generateTexture(key, w, h);
  g.destroy();
}
/** Pose le décor et les deux estrades ; les textures sont générées une fois puis mises en cache. */
export function buildArena(scene: Phaser.Scene, bg: string): { pads: Phaser.GameObjects.Image[] } {
  const palette = BACKGROUNDS[bg] ?? BACKGROUNDS.academy;
  const key = `bg2-${bg}`;
  if (!scene.textures.exists(key)) {
    const g = scene.add.graphics();
    stripes(g, 0, 29, palette.sky[0], palette.sky[1]);
    stripes(g, 29, 58, palette.sky[2], palette.sky[3]);
    g.save();
    g.scaleCanvas(1, 58 / 86);
    drawScenery(g, bg, palette);
    g.restore();
    stripes(g, 58, FIELD_H, palette.ground[0], palette.ground[1]);
    g.fillStyle(hexColor(palette.pad[3]));
    g.fillRect(0, 58, FIELD_W, 1);
    g.generateTexture(key, FIELD_W, FIELD_H);
    g.destroy();
  }
  scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(0);
  const addPad = (who: 'player' | 'enemy') => {
    const pad = PADS[who];
    const padKey = `pad-${bg}-${who}`;
    makePadTexture(scene, padKey, palette, pad.rx, pad.ry);
    return scene.add
      .image(pad.x, pad.y, padKey)
      .setOrigin(0.5, (pad.ry + 2) / (pad.ry * 2 + 6))
      .setDepth(1);
  };
  return {
    pads: [addPad('player'), addPad('enemy')],
  };
}
