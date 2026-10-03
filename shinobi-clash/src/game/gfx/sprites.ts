import type { ShinobiLook } from '../../core/types';
import { getShinobi } from '../../data/shinobi';

/**
 * Sprites de shinobis générés procéduralement à partir de `look` (données) : aucun asset externe.
 * Grille 40×48, vue de face (`front`) ou de dos (`back`). Pour remplacer un sprite par un dessin
 * fait main, renseigner SPRITE_OVERRIDES.
 */

export type SpriteView = 'front' | 'back';

const OUTLINE = '#1a1420';
const WHITE = '#f4f0e8';
const DARK = '#1e1e2a';
/** Lignes au-dessus de cette ordonnée descendent d'un pixel dans la frame de respiration. */
const BREATH_SPLIT_Y = 37;

/** Tampon de pixels indexés par couleur hexadécimale (null = transparent). */
export class PixelCanvas {
  readonly px: (string | null)[];

  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.px = Array<string | null>(w * h).fill(null);
  }

  set(x: number, y: number, color: string): void {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.px[y * this.w + x] = color;
  }

  erase(x: number, y: number): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.px[Math.round(y) * this.w + Math.round(x)] = null;
  }

  get(x: number, y: number): string | null {
    return x < 0 || y < 0 || x >= this.w || y >= this.h ? null : (this.px[y * this.w + x] ?? null);
  }

  rect(x: number, y: number, w: number, h: number, color: string): void {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) this.set(x + dx, y + dy, color);
  }

  ellipse(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    color: string,
    clip?: (x: number, y: number) => boolean,
  ): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        if (nx * nx + ny * ny <= 1 && (!clip || clip(x, y))) this.set(x, y, color);
      }
    }
  }

  tri(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, color: string): void {
    const minX = Math.floor(Math.min(x1, x2, x3));
    const maxX = Math.ceil(Math.max(x1, x2, x3));
    const minY = Math.floor(Math.min(y1, y2, y3));
    const maxY = Math.ceil(Math.max(y1, y2, y3));
    const area = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const a = ((x2 - x) * (y3 - y) - (x3 - x) * (y2 - y)) / area;
        const b = ((x3 - x) * (y1 - y) - (x1 - x) * (y3 - y)) / area;
        const c = 1 - a - b;
        if (a >= -0.01 && b >= -0.01 && c >= -0.01) this.set(x, y, color);
      }
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, color: string): void {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
    for (let i = 0; i <= steps; i++) this.set(x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps, color);
  }
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Éclaircit (amount > 0) ou assombrit (amount < 0) une couleur hexadécimale. */
export function shade(hex: string, amount: number): string {
  const [n, r, i] = hexToRgb(hex);
  const channel = (c: number) =>
    Math.max(0, Math.min(255, Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount)));
  return `#${[channel(n), channel(r), channel(i)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
const hasFeature = (look: ShinobiLook, feature: string) => !!look.features?.includes(feature);
function drawLegs(cv: PixelCanvas, look: ShinobiLook, back: boolean, color: string): void {
  cv.rect(14, 38, 5, 8, color);
  cv.rect(21, 38, 5, 8, color);
  if (hasFeature(look, 'legwarmers')) {
    cv.rect(14, 41, 5, 4, look.outfitAlt);
    cv.rect(21, 41, 5, 4, look.outfitAlt);
  }
  cv.rect(14, 45, 5, 2, '#3a3040');
  cv.rect(21, 45, 5, 2, '#3a3040');
  if (!back) {
    cv.rect(15, 45, 2, 1, look.skin);
    cv.rect(22, 45, 2, 1, look.skin);
  }
}
function drawArms(
  cv: PixelCanvas,
  look: ShinobiLook,
  color: string,
  opts: { wide?: boolean; short?: boolean } = {},
): void {
  const width = opts.wide ? 5 : 4;
  const x = opts.wide ? 7 : 8;
  if (opts.short) {
    cv.rect(x, 27, width, 4, color);
    cv.rect(28, 27, width, 4, color);
    cv.rect(8, 31, 4, 4, look.skin);
    cv.rect(28, 31, 4, 4, look.skin);
  } else {
    cv.rect(x, 27, width, 8, color);
    cv.rect(28, 27, width, 8, color);
  }
  if (hasFeature(look, 'fishnet')) {
    for (let n = 29; n < 35; n += 2) {
      for (let r = 8; r < 12; r += 2) {
        cv.set(r, n, shade(look.skin, -0.35));
        cv.set(r + 20, n, shade(look.skin, -0.35));
      }
    }
  }
  cv.rect(8, 35, 4, 2, look.skin);
  cv.rect(28, 35, 4, 2, look.skin);
  cv.set(8, 36, shade(look.skin, -0.2));
  cv.set(31, 36, shade(look.skin, -0.2));
}
function drawCloak(cv: PixelCanvas, look: ShinobiLook, back: boolean): void {
  for (let y = 24; y < 46; y++) {
    const flare = Math.floor((y - 24) / 4);
    cv.rect(11 - flare, y, 18 + flare * 2, 1, look.outfit);
  }
  const cloud = (x: number, y: number) => {
    cv.ellipse(x, y, 2.2, 1.4, look.outfitAlt);
    cv.set(x, y - 1, '#f0f0f0');
  };
  cloud(13, 31);
  cloud(26, 37);
  cloud(16, 42);
  if (back) {
    cloud(22, 29);
  }
  cv.rect(8, 27, 4, 9, look.outfit);
  cv.rect(28, 27, 4, 9, look.outfit);
  cv.rect(8, 35, 3, 2, look.skin);
  cv.rect(29, 35, 3, 2, look.skin);
  if (back) {
    cv.rect(14, 21, 12, 4, look.outfit);
  } else {
    cv.rect(15, 21, 10, 4, look.outfit);
  }
}
function drawBody(cv: PixelCanvas, look: ShinobiLook, back: boolean): void {
  if (look.cloak) {
    drawLegs(cv, look, back, look.outfitAlt === '#c83a3a' ? DARK : look.outfitAlt);
    return drawCloak(cv, look, back);
  }
  const main = look.outfit;
  const alt = look.outfitAlt;
  const dark = shade(main, -0.25);
  switch (look.outfitStyle ?? 'default') {
    case 'jacket':
      drawLegs(cv, look, back, main);
      cv.rect(12, 26, 16, 13, main);
      cv.rect(12, 26, 16, 3, alt);
      drawArms(cv, look, main);
      cv.rect(8, 27, 4, 2, alt);
      cv.rect(28, 27, 4, 2, alt);
      cv.rect(8, 33, 4, 2, alt);
      cv.rect(28, 33, 4, 2, alt);
      if (back) {
        cv.ellipse(20, 32, 3, 3, look.accent);
      } else {
        cv.rect(16, 25, 8, 2, WHITE);
        cv.rect(19, 28, 2, 9, dark);
        cv.set(18, 30, WHITE);
      }
      break;
    case 'shirt':
      drawLegs(cv, look, back, '#c8c8d0');
      cv.rect(14, 38, 12, 3, alt);
      cv.rect(12, 26, 16, 12, main);
      cv.rect(15, 22, 10, 4, main);
      drawArms(cv, look, main, {
        short: true,
      });
      cv.rect(12, 36, 16, 2, '#6a5aa0');
      if (back) {
        cv.ellipse(20, 30, 3, 2.5, '#d0283a');
        cv.ellipse(20, 32, 3, 2, WHITE, (_x, y) => y >= 32);
      } else {
        cv.rect(17, 26, 6, 3, shade(look.skin, -0.05));
      }
      break;
    case 'jumpsuit':
      drawLegs(cv, look, back, main);
      cv.rect(12, 26, 16, 13, main);
      drawArms(cv, look, main);
      cv.rect(12, 35, 16, 2, look.accent);
      cv.rect(8, 34, 4, 1, WHITE);
      cv.rect(28, 34, 4, 1, WHITE);
      if (!back) {
        cv.rect(18, 26, 4, 2, shade(main, 0.2));
      }
      break;
    case 'vest':
      drawLegs(cv, look, back, alt);
      cv.rect(12, 26, 16, 13, alt);
      drawArms(cv, look, alt);
      cv.rect(12, 26, 16, 11, main);
      if (back) {
        cv.ellipse(20, 31, 3, 3, '#c83a3a');
        cv.set(20, 31, WHITE);
      } else {
        cv.rect(13, 30, 4, 3, dark);
        cv.rect(23, 30, 4, 3, dark);
        cv.rect(13, 34, 4, 2, dark);
        cv.rect(23, 34, 4, 2, dark);
        cv.rect(16, 25, 8, 2, main);
      }
      break;
    case 'dress':
      drawLegs(cv, look, back, alt);
      cv.rect(12, 26, 16, 14, main);
      cv.rect(13, 39, 14, 1, shade(main, -0.15));
      drawArms(cv, look, main, {
        short: true,
      });
      if (back) {
        cv.ellipse(20, 31, 3, 3, WHITE);
        cv.ellipse(20, 31, 1.5, 1.5, main);
      } else {
        cv.rect(17, 25, 6, 1, WHITE);
        cv.line(20, 26, 20, 38, WHITE);
      }
      break;
    case 'hoodie':
      drawLegs(cv, look, back, alt);
      cv.rect(11, 26, 18, 13, main);
      cv.rect(14, 23, 12, 4, shade(main, 0.1));
      drawArms(cv, look, main, {
        wide: true,
      });
      if (back) {
        cv.ellipse(20, 32, 3, 3, shade(main, -0.15));
      } else {
        cv.line(20, 27, 20, 38, dark);
      }
      break;
    case 'robe':
      drawLegs(cv, look, back, hasFeature(look, 'strap') ? shade(main, -0.45) : alt);
      cv.rect(12, 26, 16, 16, main);
      cv.rect(11, 39, 18, 3, main);
      drawArms(cv, look, main, {
        wide: true,
      });
      cv.rect(12, 34, 16, 2, alt === WHITE ? '#4a4a5a' : shade(main, -0.3));
      if (!back) {
        cv.tri(16, 26, 24, 26, 20, 31, shade(main, -0.12));
      }
      break;
    case 'kimono':
      drawLegs(cv, look, back, alt);
      cv.rect(12, 26, 16, 15, main);
      cv.rect(12, 33, 16, 3, look.accent);
      drawArms(cv, look, main, {
        short: true,
      });
      if (back) {
        cv.rect(17, 32, 6, 5, look.accent);
      } else {
        cv.tri(16, 26, 24, 26, 20, 32, shade(main, 0.2));
      }
      break;
    case 'armor':
      drawLegs(cv, look, back, alt);
      cv.rect(13, 38, 6, 1, alt);
      cv.rect(21, 38, 6, 1, alt);
      cv.rect(10, 25, 20, 14, main);
      for (const n of [6, 30]) {
        cv.rect(n, 27, 4, 8, main);
        cv.rect(n, 27, 4, 2, dark);
        cv.rect(n, 35, 4, 2, look.skin);
      }
      cv.rect(10, 29, 20, 1, dark);
      cv.rect(10, 33, 20, 1, dark);
      cv.rect(10, 36, 20, 2, look.accent);
      if (back) {
        cv.rect(13, 26, 14, 2, alt);
      } else {
        cv.rect(15, 24, 10, 2, alt);
        cv.ellipse(20, 31, 2.5, 2, look.accent);
      }
      break;
    case 'bare': {
      drawLegs(cv, look, back, alt);
      for (let y = 0; y < 6; y++) {
        cv.set(15 + ((y * 7) % 9), 39 + ((y * 5) % 6), shade(alt, -0.25));
      }
      cv.rect(12, 26, 16, 12, look.skin);
      const a = shade(look.skin, -0.14);
      if (back) {
        cv.rect(19, 27, 2, 9, a);
      } else {
        cv.rect(19, 30, 2, 6, a);
        cv.rect(14, 29, 5, 1, a);
        cv.rect(21, 29, 5, 1, a);
      }
      for (const n of [8, 28]) {
        cv.rect(n, 27, 4, 4, look.skin);
        cv.rect(n, 31, 4, 4, main);
        cv.rect(n, 35, 4, 2, look.skin);
      }
      cv.rect(12, 36, 16, 2, look.accent);
      break;
    }
    case 'haori':
      drawLegs(cv, look, back, alt);
      cv.rect(12, 26, 16, 15, main);
      cv.rect(11, 38, 18, 3, main);
      drawArms(cv, look, main, {
        wide: true,
      });
      if (back) {
        cv.rect(12, 26, 16, 15, look.accent);
        cv.ellipse(20, 32, 3.5, 3.5, '#f0e8d0');
        cv.rect(19, 30, 2, 5, DARK);
        cv.rect(18, 32, 4, 1, DARK);
      } else {
        cv.rect(12, 26, 4, 15, look.accent);
        cv.rect(24, 26, 4, 15, look.accent);
        cv.rect(16, 34, 8, 2, shade(main, -0.35));
      }
      break;
    default:
      drawLegs(cv, look, back, alt);
      cv.rect(12, 26, 16, 13, main);
      drawArms(cv, look, main);
      cv.rect(12, 36, 16, 1, look.accent);
      if (back) {
        cv.ellipse(20, 31, 3, 3, shade(main, -0.2));
      } else {
        cv.rect(19, 27, 2, 9, dark);
        cv.rect(15, 26, 10, 1, shade(main, 0.25));
      }
  }
  if (hasFeature(look, 'furCollar')) {
    const r = '#a8845a';
    cv.rect(12, 22, 16, 4, r);
    for (let y = 12; y < 28; y += 2) {
      cv.set(y, 26, r);
    }
    if (!back) {
      cv.rect(17, 23, 6, 2, shade(look.skin, -0.05));
    }
  }
  if (hasFeature(look, 'strap')) {
    for (let y = 0; y < 14; y++) {
      cv.set(13 + y, 27 + y * 0.8, alt);
      cv.set(14 + y, 27 + y * 0.8, alt);
    }
  }
}
function drawHair(cv: PixelCanvas, look: ShinobiLook, back: boolean): void {
  const hair = look.hair;
  /** Calotte de cheveux coupée sous l'ordonnée `maxY`. */
  const cap = (maxY: number) => cv.ellipse(20, 12, 10, 8, hair, (_x, y) => y <= maxY);
  switch (look.hairStyle) {
    case 'spiky':
      cap(back ? 24 : 10);
      for (let t = 0; t < 6; t++) {
        cv.tri(10 + t * 4, 8, 13 + t * 4, 8, 11 + t * 4 + (t % 2 ? 2 : -1), 0 + (t % 2) * 2, hair);
      }
      cv.tri(9, 8, 12, 12, 6, 14, hair);
      cv.tri(31, 8, 28, 12, 34, 14, hair);
      if (!back) {
        cv.tri(14, 9, 17, 9, 15, 13, hair);
        cv.tri(23, 9, 26, 9, 25, 13, hair);
      }
      break;
    case 'messy':
      cap(back ? 24 : 10);
      cv.tri(26, 4, 30, 10, 36, 2, hair);
      cv.tri(28, 8, 30, 14, 36, 8, hair);
      cv.tri(12, 6, 16, 4, 10, 16, hair);
      cv.rect(11, 10, 3, 9, hair);
      cv.rect(26, 10, 3, 9, hair);
      if (!back) {
        cv.tri(17, 9, 21, 9, 19, 13, hair);
      }
      break;
    case 'long':
      cap(back ? 30 : 10);
      cv.rect(10, 10, 4, 22, hair);
      cv.rect(26, 10, 4, 22, hair);
      if (back) {
        cv.rect(12, 12, 16, 20, hair);
      } else {
        cv.rect(14, 9, 12, 2, hair);
      }
      break;
    case 'bun':
      cap(back ? 22 : 9);
      cv.ellipse(10, 6, 3, 3, hair);
      cv.ellipse(30, 6, 3, 3, hair);
      cv.ellipse(9, 13, 2.5, 2.5, hair);
      cv.ellipse(31, 13, 2.5, 2.5, hair);
      break;
    case 'bowl':
      cap(back ? 22 : 11);
      cv.rect(11, 9, 18, 3, hair);
      cv.rect(10, 11, 3, 6, hair);
      cv.rect(27, 11, 3, 6, hair);
      cv.rect(14, 5, 5, 1, shade(hair, 0.5));
      break;
    case 'ponytail':
      cap(back ? 22 : 9);
      if (back) {
        cv.rect(18, 20, 4, 12, hair);
      } else {
        cv.tri(27, 4, 33, 2, 31, 10, hair);
        cv.rect(11, 10, 2, 8, hair);
        cv.rect(27, 10, 2, 8, hair);
      }
      break;
    case 'slick':
      cap(back ? 22 : 8);
      cv.rect(11, 8, 3, 13, hair);
      cv.rect(26, 8, 3, 13, hair);
      if (back) {
        cv.rect(18, 20, 4, 8, hair);
      }
      break;
    case 'short':
      cap(back ? 22 : 9);
      cv.rect(11, 9, 2, 5, hair);
      cv.rect(27, 9, 2, 5, hair);
      if (!back) {
        cv.set(16, 10, hair);
        cv.set(23, 10, hair);
      }
      break;
    case 'mane':
      cap(back ? 24 : 10);
      for (let t = 0; t < 6; t++) {
        cv.tri(9 + t * 4, 8, 13 + t * 4, 8, 10 + t * 4 + (t % 2 ? 3 : 0), 0 + (t % 2) * 3, hair);
      }
      cv.tri(9, 8, 12, 13, 5, 15, hair);
      cv.tri(31, 8, 28, 13, 35, 15, hair);
      if (back) {
        cv.rect(12, 12, 16, 20, hair);
        for (let t = 12; t < 28; t += 4) {
          cv.tri(t, 32, t + 4, 32, t + 2, 36, hair);
        }
      } else {
        cv.rect(10, 10, 3, 14, hair);
        cv.rect(27, 10, 3, 14, hair);
        cv.tri(10, 22, 13, 22, 9, 27, hair);
        cv.tri(27, 22, 30, 22, 31, 27, hair);
        cv.tri(13, 9, 17, 9, 14, 13, hair);
        cv.tri(23, 9, 27, 9, 26, 13, hair);
      }
      break;
    case 'gravity':
      cap(back ? 22 : 9);
      cv.tri(12, 8, 30, 8, 34, -2, hair);
      cv.tri(16, 6, 30, 6, 24, -2, hair);
      cv.tri(28, 6, 34, 10, 38, 2, hair);
  }
  if (hasFeature(look, 'catHood')) {
    cv.tri(10, 9, 16, 6, 11, 0, hair);
    cv.tri(30, 9, 24, 6, 29, 0, hair);
    cv.rect(9, 10, 3, 14, hair);
    cv.rect(28, 10, 3, 14, hair);
  }
  if (hasFeature(look, 'sideBang') && !back) {
    cv.tri(11, 8, 20, 8, 12, 20, hair);
    cv.rect(11, 9, 4, 11, hair);
  }
  const shadow = shade(hair, -0.25);
  for (let t = 0; t < cv.w; t++) {
    for (let n = 1; n < 24; n++) {
      if (cv.get(t, n) === hair && cv.get(t, n - 1) === hair && cv.get(t, n + 1) !== hair) {
        cv.set(t, n, shadow);
      }
    }
  }
  if (look.hairStyle !== 'bowl') {
    cv.rect(15, 5, 4, 1, shade(hair, 0.35));
  }
}
function drawHeadgear(cv: PixelCanvas, look: ShinobiLook, back: boolean): void {
  const kind = look.headband ?? 'none';
  const cloth = '#2a3350';
  const plate = '#b8c0d0';
  if (hasFeature(look, 'horns')) {
    cv.rect(11, 9, 18, 2, '#4a4a5a');
    if (!back) {
      cv.rect(16, 8, 8, 4, plate);
      cv.tri(15, 9, 17, 8, 14, 3, plate);
      cv.tri(25, 9, 23, 8, 26, 3, plate);
      cv.rect(18, 9, 1, 2, '#8a2020');
      cv.rect(20, 9, 2, 1, '#8a2020');
      cv.rect(20, 10, 2, 1, '#8a2020');
    }
    return;
  }
  if (kind === 'forehead') {
    cv.rect(11, 9, 18, 2, cloth);
    if (back) {
      cv.rect(18, 9, 4, 2, cloth);
      cv.rect(19, 11, 2, 5, cloth);
    } else {
      cv.rect(16, 8, 8, 4, plate);
      cv.line(18, 9, 21, 10, shade(plate, -0.35));
    }
  } else if (kind === 'tilted') {
    for (let t = 0; t < 18; t++) {
      cv.set(11 + t, 8 + Math.floor(t / 3), cloth);
      cv.set(11 + t, 9 + Math.floor(t / 3), cloth);
    }
    if (!back) {
      cv.rect(15, 9, 7, 5, plate);
    }
  } else if (kind === 'neck') {
    cv.rect(16, 23, 8, 2, cloth);
    if (!back) {
      cv.rect(18, 23, 4, 2, plate);
    }
  }
}
function drawFace(cv: PixelCanvas, look: ShinobiLook): void {
  const eyeColor = look.eyes ?? '#2a2a2a';
  const oneEye = look.headband === 'tilted' || hasFeature(look, 'sideBang');
  const line = shade(look.skin, -0.35);
  const brow = hasFeature(look, 'thickBrows') ? DARK : shade(look.hair, -0.35);
  if (hasFeature(look, 'thickBrows')) {
    cv.rect(13, 12, 5, 2, brow);
    cv.rect(22, 12, 5, 2, brow);
  } else if (!hasFeature(look, 'noBrows')) {
    if (!oneEye) {
      cv.rect(14, 13, 3, 1, brow);
    }
    cv.rect(23, 13, 3, 1, brow);
  }
  const eye = (x: number) => {
    cv.rect(x, 15, 2, 2, eyeColor);
    cv.set(x, 15, '#ffffff');
    if (hasFeature(look, 'sharingan')) {
      cv.set(x + 1, 16, DARK);
    }
  };
  if (!oneEye) {
    eye(15);
  }
  eye(23);
  if (hasFeature(look, 'tearLines')) {
    cv.line(16, 17, 16, 19, line);
    cv.line(24, 17, 24, 19, line);
  }
  if (hasFeature(look, 'redLines')) {
    cv.line(15, 17, 15, 21, '#c0303a');
    cv.line(24, 17, 24, 21, '#c0303a');
  }
  if (hasFeature(look, 'cheekSwirls')) {
    for (const [t, n] of [
      [13, 1],
      [26, -1],
    ]) {
      cv.set(t, 17, '#c0392b');
      cv.set(t + n, 17, '#c0392b');
      cv.set(t, 18, '#c0392b');
      cv.set(t + n, 19, '#c0392b');
    }
  }
  if (hasFeature(look, 'fangMarks')) {
    cv.tri(12, 16, 15, 16, 13, 20, '#c0303a');
    cv.tri(25, 16, 28, 16, 27, 20, '#c0303a');
  }
  if (hasFeature(look, 'facePaint')) {
    const t = '#7a3ab8';
    cv.line(13, 11, 13, 20, t);
    cv.line(26, 11, 26, 20, t);
    cv.rect(16, 11, 8, 1, t);
    cv.line(20, 12, 20, 17, t);
    cv.rect(17, 20, 6, 1, t);
  }
  if (hasFeature(look, 'whiskers')) {
    for (const t of [17, 18, 19]) {
      cv.rect(12, t, 2, 1, line);
      cv.rect(26, t, 2, 1, line);
    }
  }
  if (hasFeature(look, 'gills')) {
    for (const t of [17, 19]) {
      cv.rect(12, t, 3, 1, line);
      cv.rect(25, t, 3, 1, line);
    }
  }
  if (hasFeature(look, 'foreheadMark')) {
    for (const [t, n] of [
      [12, 8],
      [14, 8],
      [13, 9],
      [12, 10],
      [14, 10],
    ]) {
      cv.set(t, n, '#c0203a');
    }
  }
  if (hasFeature(look, 'bandageMask')) {
    cv.rect(11, 18, 18, 8, '#e8e2d6');
    for (const t of [19, 21, 23, 25]) {
      cv.rect(11, t, 18, 1, '#c4bcac');
    }
  } else if (look.mask) {
    cv.rect(12, 18, 16, 6, '#2a3350');
  } else if (hasFeature(look, 'grin')) {
    cv.rect(18, 20, 4, 1, line);
    cv.set(17, 19, line);
    cv.set(22, 19, line);
  } else {
    cv.rect(19, 20, 2, 1, line);
  }
}
function drawHead(cv: PixelCanvas, look: ShinobiLook, back: boolean): void {
  cv.rect(17, 22, 6, 4, look.skin);
  cv.ellipse(20, 14, 9, 9, look.skin);
  if (look.outfitStyle === 'armor') {
    cv.ellipse(20, 16, 10, 8, look.skin);
  }
  cv.rect(10, 14, 1, 3, shade(look.skin, -0.1));
  cv.rect(29, 14, 1, 3, shade(look.skin, -0.1));
  drawHair(cv, look, back);
  if (!back) {
    drawFace(cv, look);
  }
  drawHeadgear(cv, look, back);
}
function drawHeldWeapon(cv: PixelCanvas, look: ShinobiLook, back: boolean): void {
  if (hasFeature(look, 'cleaver')) {
    const t = '#c0c8d4';
    if (back) {
      cv.rect(21, 1, 12, 30, t);
      cv.rect(21, 1, 12, 2, shade(t, 0.25));
      cv.ellipse(27, 6, 2, 2, '#4a5060');
      cv.rect(23, 31, 4, 8, '#5a4030');
    } else {
      cv.rect(25, 0, 12, 17, t);
      cv.rect(25, 0, 12, 2, shade(t, 0.25));
      cv.ellipse(31, 4, 2, 2, '#4a5060');
      for (let t = 13; t < 17; t++) {
        for (let n = 35; n < 38; n++) {
          if ((n - 37) ** 2 + (t - 16) ** 2 < 6) {
            cv.erase(n, t);
          }
        }
      }
    }
  }
  if (hasFeature(look, 'bundle')) {
    const [t, r, i, a] = back ? [12, 8, 16, 28] : [26, 1, 9, 24];
    cv.rect(t, r, i, a, '#d8cfc0');
    for (let n = r + 2; n < r + a; n += 4) {
      cv.rect(t, n, i, 1, '#b4a690');
    }
    cv.line(t, r + a - 4, t + i - 1, r + 3, '#8a7a64');
  }
}
function drawCompanion(cv: PixelCanvas, look: ShinobiLook): void {
  if (!hasFeature(look, 'dog')) {
    return;
  }
  const fur = '#f4f0e8';
  const ear = '#c8a888';
  cv.ellipse(7, 43, 4.5, 3, fur);
  cv.ellipse(4, 38.5, 3, 2.6, fur);
  cv.tri(2, 37, 5, 36, 3, 33, ear);
  cv.tri(5, 36, 7, 37, 7, 34, ear);
  cv.set(3, 38, DARK);
  cv.set(1, 39, DARK);
  cv.rect(4, 46, 2, 1, fur);
  cv.rect(9, 46, 2, 1, fur);
  cv.tri(11, 42, 12, 41, 14, 37, fur);
}
function drawBackGear(cv: PixelCanvas, look: ShinobiLook): void {
  if (look.gourd) {
    cv.ellipse(31, 24, 5, 5, '#b07a4a');
    cv.ellipse(31, 16, 3.5, 3.5, '#b07a4a');
    cv.rect(29, 20, 5, 1, '#8a5a30');
    cv.rect(30, 11, 3, 2, '#6b4a2a');
  }
  if (look.bigWeapon) {
    const n = look.accent === '#d0364a';
    cv.tri(4, 44, 8, 44, 30, 4, n ? '#e8e0c8' : '#6a7ab0');
    if (n) {
      cv.ellipse(12, 33, 1.5, 1.5, '#7a4a8a');
      cv.ellipse(17, 25, 1.5, 1.5, '#7a4a8a');
      cv.ellipse(22, 17, 1.5, 1.5, '#7a4a8a');
    } else {
      for (let t = 0; t < 6; t++) {
        cv.line(8 + t * 4, 40 - t * 6, 10 + t * 4, 40 - t * 6, '#4a5a90');
      }
    }
    cv.rect(28, 2, 5, 5, n ? look.accent : '#8a8aa0');
  }
}
/** Contour sombre, ombre en bas à droite et reflet en haut à gauche : le rendu « GBA ». */
function outlineAndShade(src: PixelCanvas): PixelCanvas {
  const out = new PixelCanvas(src.w, src.h);
  for (let n = 0; n < src.h; n++) {
    for (let r = 0; r < src.w; r++) {
      const i = src.get(r, n);
      if (i) {
        const a = !src.get(r + 1, n) || !src.get(r, n + 1);
        const o = !src.get(r - 1, n - 1) && src.get(r + 1, n) && src.get(r, n + 1);
        out.set(r, n, a ? shade(i, -0.22) : o ? shade(i, 0.18) : i);
      } else if (src.get(r - 1, n) || src.get(r + 1, n) || src.get(r, n - 1) || src.get(r, n + 1)) {
        out.set(r, n, OUTLINE);
      }
    }
  }
  return out;
}
/** Seconde frame d'idle : le haut du corps descend d'un pixel. */
function breathFrame(src: PixelCanvas): PixelCanvas {
  const out = new PixelCanvas(src.w, src.h);
  for (let n = 0; n < src.h; n++) {
    for (let r = 0; r < src.w; r++) {
      const i = n <= BREATH_SPLIT_Y ? src.get(r, n - 1) : src.get(r, n);
      if (i) {
        out.set(r, n, i);
      }
    }
  }
  return out;
}
function composeSprite(look: ShinobiLook, back: boolean): PixelCanvas {
  const cv = new PixelCanvas(40, 48);
  if (!back) {
    drawBackGear(cv, look);
    drawHeldWeapon(cv, look, false);
  }
  drawBody(cv, look, back);
  drawHead(cv, look, back);
  if (back) {
    drawBackGear(cv, look);
    drawHeldWeapon(cv, look, true);
  }
  drawCompanion(cv, look);
  return cv;
}
export function renderSprite(look: ShinobiLook, back: boolean, frame = 0): PixelCanvas {
  const cv = composeSprite(look, back);
  return outlineAndShade(frame === 1 ? breathFrame(cv) : cv);
}
/**
 * Sprites dessinés à la main qui remplacent le rendu procédural (data URL ou chemin d'asset).
 * Exemple : SPRITE_OVERRIDES.naruto = { front: '/assets/sprites/naruto.png' }.
 */
export const SPRITE_OVERRIDES: Record<string, Partial<Record<SpriteView, string>>> = {};
function toCanvas(pc: PixelCanvas): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = pc.w;
  canvas.height = pc.h;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(pc.w, pc.h);
  for (let t = 0; t < pc.px.length; t++) {
    const n = pc.px[t];
    if (!n) {
      continue;
    }
    const [i, a, o] = hexToRgb(n);
    image.data[t * 4] = i;
    image.data[t * 4 + 1] = a;
    image.data[t * 4 + 2] = o;
    image.data[t * 4 + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}
const canvasCache = new Map<string, HTMLCanvasElement>();
const urlCache = new Map<string, string>();
/** Sprite 40×48 d'un shinobi ; `frame` 1 = respiration. */
export function spriteCanvas(defId: string, view: SpriteView, frame = 0): HTMLCanvasElement {
  const key = `${defId}:${view}:${frame}`;
  let canvas = canvasCache.get(key);
  if (!canvas) {
    canvas = toCanvas(renderSprite(getShinobi(defId).look, view === 'back', frame));
    canvasCache.set(key, canvas);
  }
  return canvas;
}
export function spriteUrl(defId: string, view: SpriteView = 'front'): string {
  const override = SPRITE_OVERRIDES[defId]?.[view];
  if (override) {
    return override;
  }
  const key = `${defId}:${view}`;
  let url = urlCache.get(key);
  if (!url) {
    url = spriteCanvas(defId, view).toDataURL();
    urlCache.set(key, url);
  }
  return url;
}
/** Buste 32×30 recadré dans le sprite de face. */
export function portraitUrl(defId: string): string {
  const key = `${defId}:portrait`;
  let url = urlCache.get(key);
  if (!url) {
    const r = spriteCanvas(defId, 'front');
    const i = document.createElement('canvas');
    i.width = 32;
    i.height = 30;
    i.getContext('2d')!.drawImage(r, 4, -2, 32, 30, 0, 0, 32, 30);
    url = i.toDataURL();
    urlCache.set(key, url);
  }
  return url;
}
