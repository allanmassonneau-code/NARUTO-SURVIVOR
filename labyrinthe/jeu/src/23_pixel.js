// ═══════════════════════════════════════════════════════════════════════════
// Outils pixel art : cartes de caractères → toiles, contour automatique,
// miroirs, silhouettes, rotations au plus proche voisin, formes nettes.
// Tout est pré-rendu au chargement ; le jeu dessine des toiles, jamais des
// images agrandies par filtrage.
// ═══════════════════════════════════════════════════════════════════════════

const CONTOUR = '#1c1420';   // contour sombre commun à tous les sprites
function toile(l, h) { const c = document.createElement('canvas'); c.width = Math.max(1, l | 0); c.height = Math.max(1, h | 0); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return c; }
function ctxDe(c) { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return g; }

// lignes : tableau de chaînes ; couleurs : { caractère: '#rrggbb' } ; '.' et ' ' = transparent
function peindre(lignes, couleurs, l, h) {
  l = l || Math.max(...lignes.map(r => r.length)); h = h || lignes.length;
  const c = toile(l, h), g = ctxDe(c); const img = g.createImageData(l, h);
  const cache = {};
  const rgb = k => cache[k] || (cache[k] = hexRgb(couleurs[k]));
  for (let y = 0; y < lignes.length && y < h; y++) {
    const r = lignes[y];
    for (let x = 0; x < r.length && x < l; x++) {
      const k = r[x]; if (k === '.' || k === ' ' || !couleurs[k]) continue;
      const [R, G, B, A] = rgb(k), i = (y * l + x) * 4;
      img.data[i] = R; img.data[i + 1] = G; img.data[i + 2] = B; img.data[i + 3] = A;
    }
  }
  g.putImageData(img, 0, 0); return c;
}
function hexRgb(h) {
  if (!h) return [255, 0, 255, 255];
  if (h.startsWith('rgba')) { const m = h.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2], Math.round((m[3] ?? 1) * 255)]; }
  h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const n = parseInt(h.slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255, h.length === 8 ? parseInt(h.slice(6), 16) : 255];
}
function rgbHex(r, g, b) { return '#' + [r, g, b].map(v => borne(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function nuancer(hex, k) { // k<1 assombrit, k>1 éclaircit (vers le blanc)
  const [r, g, b] = hexRgb(hex);
  if (k <= 1) return rgbHex(r * k, g * k, b * k);
  const t = k - 1; return rgbHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}
function melange(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return rgbHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }

// Contour automatique : tout pixel transparent voisin (4-connexité) d'un pixel opaque.
function contourner(c, couleur = CONTOUR, diagonales = false) {
  const l = c.width, h = c.height, src = ctxDe(c).getImageData(0, 0, l, h), d = src.data;
  const out = toile(l, h), g = ctxDe(out); g.drawImage(c, 0, 0);
  const o = g.getImageData(0, 0, l, h), od = o.data; const [R, G, B] = hexRgb(couleur);
  const opaque = (x, y) => x >= 0 && y >= 0 && x < l && y < h && d[(y * l + x) * 4 + 3] > 40;
  for (let y = 0; y < h; y++) for (let x = 0; x < l; x++) {
    if (opaque(x, y)) continue;
    let n = opaque(x - 1, y) || opaque(x + 1, y) || opaque(x, y - 1) || opaque(x, y + 1);
    if (!n && diagonales) n = opaque(x - 1, y - 1) || opaque(x + 1, y - 1) || opaque(x - 1, y + 1) || opaque(x + 1, y + 1);
    if (n) { const i = (y * l + x) * 4; od[i] = R; od[i + 1] = G; od[i + 2] = B; od[i + 3] = 255; }
  }
  g.putImageData(o, 0, 0); return out;
}
function miroir(c) { const m = toile(c.width, c.height), g = ctxDe(m); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return m; }
function silhouette(c, couleur) {
  const s = toile(c.width, c.height), g = ctxDe(s); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = couleur; g.fillRect(0, 0, s.width, s.height); return s;
}
// Rotation au plus proche voisin (pas de flou) dans une toile carrée.
function tourner(c, angle) {
  const n = Math.ceil(Math.hypot(c.width, c.height)) | 1; const out = toile(n, n), g = ctxDe(out);
  const sd = ctxDe(c).getImageData(0, 0, c.width, c.height).data, o = g.createImageData(n, n);
  const cx = (n - 1) / 2, cy = (n - 1) / 2, sx0 = (c.width - 1) / 2, sy0 = (c.height - 1) / 2, co = Math.cos(-angle), si = Math.sin(-angle);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = x - cx, dy = y - cy; const sx = Math.round(sx0 + dx * co - dy * si), sy = Math.round(sy0 + dx * si + dy * co);
    if (sx < 0 || sy < 0 || sx >= c.width || sy >= c.height) continue;
    const i = (sy * c.width + sx) * 4, j = (y * n + x) * 4;
    o.data[j] = sd[i]; o.data[j + 1] = sd[i + 1]; o.data[j + 2] = sd[i + 2]; o.data[j + 3] = sd[i + 3];
  }
  g.putImageData(o, 0, 0); return out;
}
// Jeu de rotations pré-calculées (n angles) pour les projectiles orientés.
function rotations(c, n = 16) { const t = []; for (let i = 0; i < n; i++) t.push(tourner(c, i * 2 * Math.PI / n)); return t; }
function indexAngle(a, n = 16) { return ((Math.round(a / (2 * Math.PI / n)) % n) + n) % n; }

// Disques et ellipses nets (pré-rendus par rayon)
const _disques = new Map();
function disque(r, couleur) {
  const k = r + '|' + couleur; let c = _disques.get(k); if (c) return c;
  const d = Math.max(1, Math.round(r * 2)); c = toile(d, d); const g = ctxDe(c); g.fillStyle = couleur;
  const rr = d / 2;
  for (let y = 0; y < d; y++) { const dy = y + 0.5 - rr; const w = Math.sqrt(Math.max(0, rr * rr - dy * dy)); const x0 = Math.round(rr - w), x1 = Math.round(rr + w); if (x1 > x0) g.fillRect(x0, y, x1 - x0, 1); }
  _disques.set(k, c); return c;
}
const _ellipses = new Map();
function ellipse(rx, ry, couleur) {
  rx = Math.max(1, Math.round(rx)); ry = Math.max(1, Math.round(ry));
  const k = rx + '|' + ry + '|' + couleur; let c = _ellipses.get(k); if (c) return c;
  c = toile(rx * 2, ry * 2); const g = ctxDe(c); g.fillStyle = couleur;
  for (let y = 0; y < ry * 2; y++) { const dy = (y + 0.5 - ry) / ry; const w = rx * Math.sqrt(Math.max(0, 1 - dy * dy)); const x0 = Math.round(rx - w), x1 = Math.round(rx + w); if (x1 > x0) g.fillRect(x0, y, x1 - x0, 1); }
  _ellipses.set(k, c); return c;
}
const _anneaux = new Map();
function anneau(r, ep, couleur) {
  r = Math.max(1, Math.round(r)); const k = r + '|' + ep + '|' + couleur; let c = _anneaux.get(k); if (c) return c;
  const d = r * 2 + 2; c = toile(d, d); const g = ctxDe(c); g.fillStyle = couleur;
  for (let y = 0; y < d; y++) for (let x = 0; x < d; x++) { const q = Math.hypot(x + 0.5 - d / 2, y + 0.5 - d / 2); if (q <= r && q > r - ep) g.fillRect(x, y, 1, 1); }
  _anneaux.set(k, c); return c;
}
// Ligne de Bresenham (tracés anguleux de foudre, fils, rayons fins)
function lignePixel(g, x0, y0, x1, y1, couleur, ep = 1) {
  x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0; g.fillStyle = couleur;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy, n = 0;
  for (;;) { g.fillRect(x0 - (ep >> 1), y0 - (ep >> 1), ep, ep); if ((x0 === x1 && y0 === y1) || n++ > 2000) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
// Dessin centré sur un point entier (évite le tremblement de sous-pixels)
function poser(g, c, x, y, ax = 0.5, ay = 0.5) { g.drawImage(c, Math.round(x - c.width * ax), Math.round(y - c.height * ay)); }
