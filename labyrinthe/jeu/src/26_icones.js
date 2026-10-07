// ═══════════════════════════════════════════════════════════════════════════
// Icônes peintes une à une : chaque objet, technique, talisman, consommable,
// transformation et éveil a sa propre recette (26_icones_recettes.js) qui
// montre ce qu'il fait. Peintre 16×16 : primitives à plat (disques, ellipses,
// polygones, traits épais, arcs), tournées si besoin ; ombrage automatique
// (lumière en haut à gauche : bord éclairé, bord ombré) ; contour sombre ;
// puis un badge facultatif dans le coin (chiffre, flèche, goutte…) qui
// distingue les variantes d'une même famille. Rendu : 18×18 dans une case de 20×20.
// ═══════════════════════════════════════════════════════════════════════════

const PAL = {
  acier: '#b8c4d2', acierF: '#6c7888', acierC: '#eef4fa', fer: '#8a929e',
  bois: '#a8743c', boisF: '#6a4424', boisC: '#d0a060',
  papier: '#f2e8cc', papierF: '#c8b48a', encre: '#2a2238', noir: '#2c2634', gris: '#7a7488',
  rouge: '#d8383a', rougeF: '#8a1a24', rougeC: '#ff7a6a', orange: '#f08a24', or: '#f2c440', orF: '#b08420', orC: '#fff0a0',
  vert: '#4cb04a', vertC: '#8ae070', vertF: '#2a6a32', bleu: '#3a7ae0', bleuC: '#8ac4ff', bleuF: '#22408a', cyan: '#5ad0e8',
  violet: '#8a4ad0', violetC: '#c49aff', violetF: '#4a2280', rose: '#f080b0', roseC: '#ffc0d8',
  blanc: '#f6f2ea', peau: '#f2c8a0', peauF: '#c8906a', sable: '#dcb46a', sableF: '#a8803c', os: '#ece4d0', sang: '#b81830',
  argile: '#ece4d4', glace: '#c8f0ff', feuille: '#5ab84a', brun: '#7a4a2a',
};
const DEG = Math.PI / 180;

class PeintreIcone {
  constructor() { this.n = 16; this.c = new Array(256).fill(null); this.plat = new Uint8Array(256); this.badges = []; }
  dans(x, y) { return x >= 0 && y >= 0 && x < 16 && y < 16; }
  px(x, y, c, plat) { x = Math.round(x); y = Math.round(y); if (!this.dans(x, y)) return; const i = y * 16 + x; this.c[i] = c; this.plat[i] = plat ? 1 : 0; }
  get(x, y) { return this.dans(x, y) ? this.c[y * 16 + x] : null; }
  effacer(x, y) { this.px(x, y, null); }
  // remplissage par test au centre de chaque pixel ; t = [ox, oy, angle°] : coordonnées locales tournées
  forme(test, c, plat, t) {
    const co = t ? Math.cos(-t[2] * DEG) : 1, si = t ? Math.sin(-t[2] * DEG) : 0;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      let u = x + 0.5, v = y + 0.5;
      if (t) { const dx = u - t[0], dy = v - t[1]; u = dx * co - dy * si; v = dx * si + dy * co; }
      if (test(u, v)) this.px(x, y, c, plat);
    }
    return this;
  }
  rect(x, y, w, h, c, plat) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c, plat); return this; }
  disque(cx, cy, r, c, plat, t) { return this.forme((x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r, c, plat, t); }
  ellipse(cx, cy, rx, ry, c, plat, t) { return this.forme((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, c, plat, t); }
  anneau(cx, cy, r, ep, c, plat, t) { return this.forme((x, y) => { const d = Math.hypot(x - cx, y - cy); return d <= r && d > r - ep; }, c, plat, t); }
  poly(pts, c, plat, t) {
    return this.forme((x, y) => { let d = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) d = !d; } return d; }, c, plat, t);
  }
  // trait épais (capsule) entre deux points, en coordonnées de pixel (centres)
  trait(x0, y0, x1, y1, ep, c, plat, t) {
    x0 += t ? 0 : 0.5; y0 += t ? 0 : 0.5; x1 += t ? 0 : 0.5; y1 += t ? 0 : 0.5;
    const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1, r = ep / 2;
    return this.forme((x, y) => { const k = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / L2)); return (x - x0 - k * dx) ** 2 + (y - y0 - k * dy) ** 2 <= r * r; }, c, plat, t);
  }
  // ligne d'un pixel (Bresenham), extrémités entières
  ligne(x0, y0, x1, y1, c, plat) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (let n = 0; n < 64; n++) { this.px(x0, y0, c, plat); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    return this;
  }
  // arc de cercle (angles en degrés, sens horaire à l'écran), épaisseur ep
  arc(cx, cy, r, a0, a1, ep, c, plat) {
    const norm = a => ((a % 360) + 360) % 360, A0 = norm(a0), span = (a1 - a0 + 3600) % 360 || 360;
    return this.forme((x, y) => { const d = Math.hypot(x - cx, y - cy); if (Math.abs(d - r) > ep / 2) return false; const a = norm(Math.atan2(y - cy, x - cx) / DEG); return (a - A0 + 360) % 360 <= span; }, c, plat);
  }
  etoile(cx, cy, R, r, n, rot, c, plat) { const p = []; for (let i = 0; i < n * 2; i++) { const a = (rot + i * 180 / n) * DEG, q = i % 2 ? r : R; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return this.poly(p, c, plat); }
  // ombrage : bord éclairé (haut / gauche à découvert) et bord ombré (bas / droite)
  ombrer() {
    const src = this.c.slice();
    const vide = (x, y) => !this.dans(x, y) || src[y * 16 + x] === null;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const i = y * 16 + x, c = src[i]; if (c === null || this.plat[i]) continue;
      const cl = vide(x, y - 1) || vide(x - 1, y), so = vide(x, y + 1) || vide(x + 1, y);
      if (cl && !so) this.c[i] = nuancer(c, 1.26); else if (so && !cl) this.c[i] = nuancer(c, 0.74);
    }
  }
  // motif dessiné pixel par pixel (carte de caractères) ; plat : déjà modelé à la main
  motif(L, col, x0 = 0, y0 = 0, plat = true, miroir = false) { L.forEach((r, y) => [...r].forEach((k, x) => { if (k !== '.' && k !== ' ' && col[k] !== undefined) this.px(x0 + (miroir ? r.length - 1 - x : x), y0 + y, col[k], plat); })); return this; }
  // pictogramme incrusté : dessiné à part puis posé à plat, cerné d'encre (lisible sur le papier)
  incruster(fn, contour = '#2a2030') {
    const Q = new PeintreIcone(); fn(Q);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (Q.get(x, y) === null && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => Q.get(x + dx, y + dy) !== null)) this.px(x, y, contour, true);
    for (let i = 0; i < 256; i++) if (Q.c[i] !== null) { this.c[i] = Q.c[i]; this.plat[i] = 1; }
    return this;
  }
  badge(type, couleur) { this.badges.push([type, couleur]); return this; }
  rendre() {
    this.ombrer();
    const c = toile(16, 16), g = ctxDe(c), img = g.createImageData(16, 16);
    for (let i = 0; i < 256; i++) { const k = this.c[i]; if (k === null) continue; const [R, V, B, A] = hexRgb(k); img.data[i * 4] = R; img.data[i * 4 + 1] = V; img.data[i * 4 + 2] = B; img.data[i * 4 + 3] = A; }
    g.putImageData(img, 0, 0);
    const out = toile(20, 20), go = ctxDe(out); go.drawImage(contourner(avecMarge(c, 1)), 1, 1);
    this.badges.forEach(([t, col], k) => { const b = badgeIcone(t, col); go.drawImage(b, 20 - b.width - (k ? 7 : 0), 20 - b.height); });
    return out;
  }
}

// ── Badges de coin : glyphes 5×5 cernés de sombre ──
const GLYPHES_BADGE = {
  plus: ['..x..', '..x..', 'xxxxx', '..x..', '..x..'], moins: ['.....', '.....', 'xxxxx', '.....', '.....'],
  haut: ['..x..', '.xxx.', 'x.x.x', '..x..', '..x..'], bas: ['..x..', '..x..', 'x.x.x', '.xxx.', '..x..'],
  droite: ['..x..', '...x.', 'xxxxx', '...x.', '..x..'], gauche: ['..x..', '.x...', 'xxxxx', '.x...', '..x..'],
  retour: ['.xxx.', 'x...x', 'x.x.x', '..xx.', '.xxx.'], croix: ['x...x', '.x.x.', '..x..', '.x.x.', 'x...x'],
  coeur: ['.x.x.', 'xxxxx', 'xxxxx', '.xxx.', '..x..'], goutte: ['..x..', '.xxx.', 'xxxxx', 'xxxxx', '.xxx.'],
  eclair: ['...xx', '..xx.', '.xxxx', '..xx.', '.xx..'], flamme: ['..x..', '.xx..', '.xxx.', 'xxxxx', '.xxx.'],
  etoile: ['..x..', '.xxx.', 'xxxxx', '.xxx.', 'x...x'], oeil: ['.....', '.xxx.', 'xx.xx', '.xxx.', '.....'],
  piece: ['.xxx.', 'xx.xx', 'x.x.x', 'xx.xx', '.xxx.'], cible: ['.xxx.', 'x...x', 'x.x.x', 'x...x', '.xxx.'],
  crane: ['.xxx.', 'xxxxx', 'x.x.x', 'xxxxx', '.x.x.'], vague: ['.....', '.x...', 'x.x.x', '...x.', '.....'],
  cle: ['xx...', 'xxxxx', 'xx.x.', '.....', '.....'], horloge: ['.xxx.', 'x.x.x', 'x.xxx', 'x...x', '.xxx.'],
  aile: ['x....', 'xx...', 'xxxx.', '.xxxx', '..xx.'], double: ['xx...', 'xx...', '.....', '...xx', '...xx'],
  deux: ['xxx.', '...x', '.xx.', 'x...', 'xxxx'], trois: ['xxx.', '...x', '.xx.', '...x', 'xxx.'], quatre: ['x..x', 'x..x', 'xxxx', '...x', '...x'],
  cinq: ['xxxx', 'x...', 'xxx.', '...x', 'xxx.'], six: ['.xx.', 'x...', 'xxx.', 'x..x', '.xx.'], sept: ['xxxx', '...x', '..x.', '.x..', '.x..'],
  huit: ['.xx.', 'x..x', '.xx.', 'x..x', '.xx.'], un: ['.x.', 'xx.', '.x.', '.x.', 'xxx'], zero: ['.xx.', 'x..x', 'x..x', 'x..x', '.xx.'],
  spirale: ['xxxx.', '...x.', '.x.x.', '.xxx.', '.....'], pause: ['xx.xx', 'xx.xx', 'xx.xx', 'xx.xx', 'xx.xx'],
};
const _badges = {};
function badgeIcone(type, couleur) {
  const k = type + couleur; if (_badges[k]) return _badges[k];
  const G = GLYPHES_BADGE[type] || GLYPHES_BADGE.plus;
  return (_badges[k] = contourner(avecMarge(peindre(G, { x: couleur }), 1)));
}

// ── Objets de base, réutilisés par les recettes ──
// (x, y : centre ; a : angle en degrés, 0 = vers la droite, −90 = vers le haut)
const OBJ = {
  kunai(P, x, y, a, o = {}) { // x, y : anneau ; la lame part dans la direction a
    const k = o.k || 1, t = [x, y, a], L = o.lame || PAL.acier, M = o.manche || PAL.noir;
    P.anneau(0, 0, 1.9 * k, 1.1, o.anneau || PAL.fer, false, t);
    P.poly([[1.4 * k, -0.9 * k], [6.4 * k, -0.9 * k], [6.4 * k, 0.9 * k], [1.4 * k, 0.9 * k]], M, false, t);
    P.poly([[2.6 * k, -0.95 * k], [3.4 * k, -0.95 * k], [3.4 * k, 0.95 * k], [2.6 * k, 0.95 * k]], o.bande || '#6a5a78', false, t);
    P.poly([[4.6 * k, -0.95 * k], [5.4 * k, -0.95 * k], [5.4 * k, 0.95 * k], [4.6 * k, 0.95 * k]], o.bande || '#6a5a78', false, t);
    P.poly([[6.2 * k, -2 * k], [12.4 * k, -1.05 * k], [(o.pointe || 15.4) * k, 0], [12.4 * k, 1.05 * k], [6.2 * k, 2 * k]], L, false, t);
    if (o.marque) P.poly([[7 * k, -0.6 * k], [10 * k, -0.4 * k], [10 * k, 0.4 * k], [7 * k, 0.6 * k]], o.marque, true, t);
    return P;
  },
  shuriken(P, x, y, R, o = {}) {
    const n = o.branches || 4, rot = o.rot ?? -12, c = o.c || PAL.acier;
    P.etoile(x, y, R, R * (o.creux || 0.36), n, rot, c);
    if (o.lisere) P.etoile(x, y, R - 1.6, R * 0.25, n, rot, o.lisere);
    P.disque(x, y, o.trou || 1.05, null);
    return P;
  },
  fuma(P, x, y, R, o = {}) {
    const c = o.c || PAL.acier, rot = o.rot ?? 0;
    for (let i = 0; i < 4; i++) { const a = (rot + i * 90) * DEG, pol = (r, d) => [x + Math.cos(a + d * DEG) * r, y + Math.sin(a + d * DEG) * r]; P.poly([pol(1.8, -50), pol(R * 0.62, -24), pol(R, 0), pol(R * 0.55, 34), pol(2.2, 40)], c); }
    P.disque(x, y, 2.6, o.centre || PAL.fer); P.disque(x, y, 1.1, null);
    return P;
  },
  senbon(P, x0, y0, x1, y1, o = {}) { P.ligne(x0, y0, x1, y1, o.c || PAL.acierC); P.px(x1, y1, o.queue || PAL.acierF); return P; },
  sabre(P, x, y, a, o = {}) { // x, y : pommeau ; lame dans la direction a
    const k = o.k || 1, t = [x, y, a], l = o.largeur || 1.2, L = o.long || 15;
    P.poly([[0, -0.9], [4.2 * k, -0.9], [4.2 * k, 0.9], [0, 0.9]], o.manche || PAL.noir, false, t);
    P.poly([[1.2 * k, -0.95], [1.8 * k, -0.95], [1.8 * k, 0.95], [1.2 * k, 0.95]], o.bande || '#6a5a78', false, t);
    P.poly([[2.8 * k, -0.95], [3.4 * k, -0.95], [3.4 * k, 0.95], [2.8 * k, 0.95]], o.bande || '#6a5a78', false, t);
    P.poly([[4.2 * k, -(o.garde || 2.2)], [5.2 * k, -(o.garde || 2.2)], [5.2 * k, (o.garde || 2.2)], [4.2 * k, (o.garde || 2.2)]], o.tsuba || PAL.or, false, t);
    P.poly([[5.2 * k, -l], [(L - 2) * k, -l], [L * k, o.courbe ? -l : 0], [(L - 2) * k, l], [5.2 * k, l]], o.lame || PAL.acier, false, t);
    return P;
  },
  rouleau(P, x, y, w, h, o = {}) { // rouleau ouvert horizontal : papier et deux bâtons
    const pap = o.papier || PAL.papier, b = o.baton || PAL.boisF, bc = o.embout || PAL.rouge;
    P.rect(x + 1, y, w - 2, h, pap);
    P.rect(x, y - 1, 2, h + 2, b); P.rect(x + w - 2, y - 1, 2, h + 2, b);
    P.rect(x, y - 2, 2, 1, bc, true); P.rect(x, y + h + 1, 2, 1, bc, true); P.rect(x + w - 2, y - 2, 2, 1, bc, true); P.rect(x + w - 2, y + h + 1, 2, 1, bc, true);
    return P;
  },
  rouleauFerme(P, x0, y0, x1, y1, o = {}) { // rouleau fermé en diagonale (cylindre)
    P.trait(x0, y0, x1, y1, o.ep || 4.6, o.papier || PAL.papier);
    P.trait(x0, y0, x0 + (x1 - x0) * 0.08, y0 + (y1 - y0) * 0.08, (o.ep || 4.6) + 1.2, o.embout || PAL.rouge);
    P.trait(x1, y1, x1 - (x1 - x0) * 0.08, y1 - (y1 - y0) * 0.08, (o.ep || 4.6) + 1.2, o.embout || PAL.rouge);
    if (o.lien) { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2; P.trait(mx, my, mx + 0.1, my + 0.1, (o.ep || 4.6) + 0.6, o.lien); }
    return P;
  },
  etiquette(P, x, y, w, h, o = {}) { // papier explosif / ofuda
    P.rect(x, y, w, h, o.papier || PAL.papier);
    const s = o.encre || PAL.rouge; const cx = x + Math.floor(w / 2);
    if (o.motif !== false) { P.rect(cx, y + 1, 1, h - 2, s, true); P.rect(cx - 1, y + 2, 3, 1, s, true); P.rect(cx - 1, y + Math.floor(h / 2), 3, 1, s, true); P.px(cx - 1, y + h - 3, s, true); P.px(cx + 1, y + h - 2, s, true); }
    return P;
  },
  flamme(P, cx, base, h, o = {}) { // flamme en goutte inversée, trois couches
    const C = o.couleurs || [PAL.rouge, PAL.orange, PAL.or, PAL.orC], W = o.largeur || h * 0.42;
    const couche = (k, c) => P.forme((x, y) => { const t = (base - y) / (h * k); if (t < 0 || t > 1) return false; const w = W * k * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.1)), 0.7) * (1 - t * 0.55); const s = Math.sin(t * 5.5 + (o.phase || 0)) * t * 1.2; return Math.abs(x - cx - s) < w; }, c);
    couche(1, C[0]); couche(0.72, C[1]); couche(0.45, C[2]); if (C[3]) couche(0.22, C[3]);
    return P;
  },
  goutte(P, cx, cy, r, c, o = {}) { // cy : centre du rond
    P.disque(cx, cy, r, c); P.poly([[cx - r * 0.82, cy - r * 0.45], [cx, cy - r * 2.3], [cx + r * 0.82, cy - r * 0.45]], c);
    if (o.reflet !== false) { P.px(cx - r * 0.45, cy - r * 0.35, nuancer(c, 1.7), true); P.px(cx - r * 0.45, cy + r * 0.1, nuancer(c, 1.45), true); }
    return P;
  },
  eclair(P, pts, c, o = {}) { P.poly(pts, c || PAL.or); if (o.coeur) P.poly(o.coeur, PAL.orC, true); return P; },
  coeur(P, cx, cy, s, c, o = {}) { // s : demi-largeur
    const r = s * 0.52; P.disque(cx - r * 0.95, cy - r * 0.2, r, c); P.disque(cx + r * 0.95, cy - r * 0.2, r, c);
    P.poly([[cx - s, cy + r * 0.1 - 0.4], [cx + s, cy + r * 0.1 - 0.4], [cx, cy + s * 1.05]], c);
    if (o.reflet !== false) { P.px(cx - r * 1.3, cy - r * 0.5, nuancer(c, 1.6), true); }
    return P;
  },
  oeil(P, cx, cy, rx, ry, o = {}) { // amande, iris selon le type
    const blanc = o.blanc || PAL.blanc;
    P.forme((x, y) => { const t = (x - cx) / rx; if (Math.abs(t) > 1) return false; return Math.abs(y - cy) <= ry * (1 - t * t) * 1.05; }, o.peau || null);
    P.forme((x, y) => { const t = (x - cx) / rx; if (Math.abs(t) > 1) return false; return Math.abs(y - cy) <= ry * (1 - t * t); }, blanc, true);
    const ri = o.iris || ry * 0.95, type = o.type || 'normal';
    const dansOeil = (x, y) => { const t = (x - cx) / rx; return Math.abs(t) <= 1 && Math.abs(y - cy) <= ry * (1 - t * t); };
    const iris = (r, c) => P.forme((x, y) => dansOeil(x, y) && Math.hypot(x - cx, y - cy) <= r, c, true);
    if (type === 'sharingan') { iris(ri, PAL.rouge); P.forme((x, y) => dansOeil(x, y) && Math.abs(Math.hypot(x - cx, y - cy) - ri * 0.62) < 0.45, PAL.rougeF, true); P.disque(cx, cy, 0.8, PAL.noir, true); for (let i = 0; i < (o.tomoe ?? 3); i++) { const a = (i * 120 - 90 + (o.rot || 0)) * DEG; P.px(cx - 0.5 + Math.cos(a) * ri * 0.62, cy - 0.5 + Math.sin(a) * ri * 0.62, PAL.noir, true); } }
    else if (type === 'mangekyo') { iris(ri, '#e0202a'); P.forme((x, y) => { if (!dansOeil(x, y)) return false; const d = Math.hypot(x - cx, y - cy), a = Math.atan2(y - cy, x - cx) / DEG + (o.rot || 0); return d < ri && ((a % 120 + 120) % 120) < 30 + d * 9; }, PAL.noir, true); P.disque(cx, cy, 1.1, PAL.noir, true); }
    else if (type === 'byakugan') { iris(ri, '#e8e0f8'); P.forme((x, y) => dansOeil(x, y) && Math.abs(Math.hypot(x - cx, y - cy) - ri) < 0.5, '#b8a8d8', true); }
    else if (type === 'rinnegan') { iris(ri, '#b89ae8'); for (let r = ri * 0.66; r > 0.5; r -= 1.6) P.forme((x, y) => dansOeil(x, y) && Math.abs(Math.hypot(x - cx, y - cy) - r) < 0.42, '#5a3a8a', true); P.px(cx - 0.5, cy - 0.5, '#2a1a4a', true); }
    else if (type === 'renard') { iris(ri, PAL.rouge); P.forme((x, y) => dansOeil(x, y) && Math.abs(x - cx) < 0.9 && Math.abs(y - cy) < ri * 0.95, PAL.noir, true); }
    else if (type === 'sage') { iris(ri, PAL.or); P.rect(Math.round(cx - ri * 0.8), Math.round(cy - 0.5), Math.round(ri * 1.6), 1, PAL.noir, true); }
    else { iris(ri, o.couleur || '#7a4a2a'); P.disque(cx, cy, Math.max(0.7, ri * 0.45), PAL.noir, true); P.px(cx - ri * 0.45, cy - ri * 0.5, PAL.blanc, true); }
    return P;
  },
  crane(P, cx, cy, o = {}) {
    const c = o.c || PAL.os;
    P.disque(cx, cy - 1, 4.6, c); P.rect(cx - 3, cy + 2, 6, 3, c);
    P.disque(cx - 1.9, cy - 0.2, 1.35, o.yeux || PAL.noir, true); P.disque(cx + 1.9, cy - 0.2, 1.35, o.yeux || PAL.noir, true);
    P.px(cx - 0.5, cy + 1.5, PAL.noir, true); P.px(cx - 2, cy + 4, PAL.noir, true); P.px(cx, cy + 4, PAL.noir, true); P.px(cx + 2, cy + 4, PAL.noir, true);
    return P;
  },
  os(P, x0, y0, x1, y1, o = {}) {
    const c = o.c || PAL.os, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, e = o.ep || 2.2;
    P.trait(x0, y0, x1, y1, e, c);
    for (const [x, y] of [[x0, y0], [x1, y1]]) { P.disque(x + 0.5 + nx * 1.1, y + 0.5 + ny * 1.1, 1.5, c); P.disque(x + 0.5 - nx * 1.1, y + 0.5 - ny * 1.1, 1.5, c); }
    return P;
  },
  orbe(P, cx, cy, r, o = {}) { // sphère de chakra tourbillonnante
    const c = o.c || PAL.bleuC, f = o.f || PAL.bleu;
    P.disque(cx, cy, r, f); P.disque(cx - r * 0.12, cy - r * 0.12, r * 0.74, c);
    for (let i = 0; i < (o.bras || 3); i++) P.arc(cx, cy, r * 0.55, i * 120 + (o.rot || 0), i * 120 + 70 + (o.rot || 0), 1, o.trait || PAL.blanc, true);
    P.disque(cx - r * 0.35, cy - r * 0.4, Math.max(0.6, r * 0.18), PAL.blanc, true);
    return P;
  },
  crapaud(P, cx, cy, o = {}) {
    const c = o.c || '#e0743a', v = o.ventre || '#f6d8a0';
    P.ellipse(cx, cy + 1.5, 6.4, 4.2, c); P.disque(cx - 3.4, cy - 2.2, 2.1, c); P.disque(cx + 3.4, cy - 2.2, 2.1, c);
    P.ellipse(cx, cy + 2.8, 4, 2.2, v);
    P.px(cx - 3.5, cy - 2.6, PAL.noir, true); P.px(cx + 3.5, cy - 2.6, PAL.noir, true); P.px(cx - 4, cy - 3, PAL.blanc, true); P.px(cx + 3, cy - 3, PAL.blanc, true);
    P.rect(Math.round(cx - 3), Math.round(cy + 0.5), 6, 1, nuancer(c, 0.55), true);
    if (o.pattes !== false) { P.ellipse(cx - 5.6, cy + 5, 1.8, 1.1, c); P.ellipse(cx + 5.6, cy + 5, 1.8, 1.1, c); }
    return P;
  },
  serpent(P, pts, o = {}) { // corps en traits épais le long de pts ; tête au dernier point
    const c = o.c || '#6ab04a', e = o.ep || 2.6;
    for (let i = 1; i < pts.length; i++) P.trait(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], e, c);
    const [hx, hy] = pts[pts.length - 1]; P.ellipse(hx + 0.5, hy + 0.5, 2.3, 1.8, c);
    P.px(hx + (o.oeilDx ?? 0.5), hy - 0.5, o.oeil || PAL.or, true);
    if (o.langue !== false) { const [px, py] = pts[pts.length - 2], d = Math.sign(hx - px) || 1; P.px(hx + d * 3, hy + 0.5, PAL.rouge, true); P.px(hx + d * 4, hy + (o.langueDy ?? 1), PAL.rouge, true); }
    return P;
  },
  insecte(P, cx, cy, o = {}) {
    const c = o.c || '#3a4a2a', a = o.a || 0;
    for (const s of [-1, 1]) for (const k of [-1, 0, 1]) P.ligne(cx + s * 2, cy + k * 1.6, cx + s * 4.2, cy + k * 2.4 + 0.5, PAL.noir);
    P.ellipse(cx, cy + 1, 2.8, 3.6, c, false, a ? [cx, cy, a] : null); P.disque(cx, cy - 3.2, 1.7, nuancer(c, 0.7));
    P.rect(Math.round(cx), Math.round(cy - 1.5), 1, 5, nuancer(c, 0.6), true);
    if (o.antennes !== false) { P.px(cx - 1.5, cy - 5.2, PAL.noir); P.px(cx + 1.5, cy - 5.2, PAL.noir); }
    if (o.reflet) P.px(cx - 1.4, cy - 0.5, o.reflet, true);
    return P;
  },
  chien(P, cx, cy, o = {}) { // tête de chien de face
    const c = o.c || '#c8a070', m = o.museau || '#f2dcb4';
    P.ellipse(cx, cy, 5, 4.6, c); P.poly([[cx - 5.6, cy - 4.4], [cx - 2.2, cy - 2.6], [cx - 5, cy + 1.4]], o.oreilles || nuancer(c, 0.7)); P.poly([[cx + 5.6, cy - 4.4], [cx + 2.2, cy - 2.6], [cx + 5, cy + 1.4]], o.oreilles || nuancer(c, 0.7));
    P.ellipse(cx, cy + 2.2, 2.9, 2.1, m); P.rect(Math.round(cx - 1), Math.round(cy + 0.6), 2, 1, PAL.noir, true);
    P.px(cx - 2.2, cy - 1, PAL.noir, true); P.px(cx + 1.6, cy - 1, PAL.noir, true);
    return P;
  },
  oiseau(P, cx, cy, o = {}) { // oiseau ailes déployées, vu de face
    const c = o.c || PAL.argile;
    P.ellipse(cx, cy + 1, 2.2, 3.2, c); P.disque(cx, cy - 2.6, 1.9, c);
    P.poly([[cx - 1.5, cy - 0.5], [cx - 7.6, cy - 4], [cx - 6.8, cy + 0.6], [cx - 1.5, cy + 2.6]], c); P.poly([[cx + 1.5, cy - 0.5], [cx + 7.6, cy - 4], [cx + 6.8, cy + 0.6], [cx + 1.5, cy + 2.6]], c);
    P.poly([[cx - 1.4, cy + 3.6], [cx + 1.4, cy + 3.6], [cx, cy + 6.2]], c);
    P.px(cx - 0.8, cy - 3, o.oeil || PAL.noir, true); P.px(cx, cy - 1.6, o.bec || PAL.orange, true);
    return P;
  },
  marionnette(P, cx, cy, o = {}) { // tête de marionnette, mâchoire articulée
    const c = o.c || '#5a4a5a';
    P.ellipse(cx, cy - 1, 4.6, 4.4, c); P.rect(Math.round(cx - 3), Math.round(cy + 2.5), 6, 3, nuancer(c, 0.85));
    P.rect(Math.round(cx - 3), Math.round(cy + 2), 6, 1, PAL.noir, true);
    for (let i = 0; i < (o.yeux || 2); i++) { const dx = (o.yeux === 3 ? (i - 1) * 2.4 : (i ? 1.9 : -1.9)); P.px(cx + dx - 0.5, cy - 1.5 + (o.yeux === 3 && i === 1 ? -1.2 : 0), o.oeil || PAL.blanc, true); }
    if (o.capuche) P.arc(cx, cy - 1, 4.8, 180, 360, 1.6, o.capuche);
    return P;
  },
  cle(P, x, y, o = {}) { // anneau en (x, y), tige vers le bas à droite
    const c = o.c || PAL.or;
    P.anneau(x, y, 2.8, 1.6, c); P.trait(x + 1.6, y + 1.6, x + 7.4, y + 7.4, 2, c);
    P.trait(x + 5.6, y + 7.4, x + 4.4, y + 8.6, 1.6, c); P.trait(x + 7.4, y + 5.6, x + 8.6, y + 4.4, 1.6, c);
    return P;
  },
  bourse(P, cx, cy, o = {}) { // bourse ventrue, nouée en haut
    const c = o.c || '#5aa04a';
    P.ellipse(cx, cy + 1.6, 5.4, 4.4, c); P.poly([[cx - 2.4, cy - 2], [cx + 2.4, cy - 2], [cx + 1.4, cy - 4], [cx - 1.4, cy - 4]], c);
    P.poly([[cx - 2.6, cy - 5.6], [cx - 0.5, cy - 4], [cx - 2, cy - 3.6]], nuancer(c, 0.8)); P.poly([[cx + 2.6, cy - 5.6], [cx + 0.5, cy - 4], [cx + 2, cy - 3.6]], nuancer(c, 0.8));
    P.rect(Math.round(cx - 2), Math.round(cy - 3), 4, 1, o.lien || PAL.or, true);
    return P;
  },
  piece(P, cx, cy, r, o = {}) { P.disque(cx, cy, r, o.c || PAL.or); P.rect(Math.round(cx - 0.5), Math.round(cy - 0.5), 1, 1, null); P.anneau(cx, cy, r - 0.6, 0.8, nuancer(o.c || PAL.or, 0.8), true); return P; },
  feuille(P, x0, y0, x1, y1, o = {}) { // feuille en amande du pétiole (x0, y0) à la pointe
    const c = o.c || PAL.feuille, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx) / DEG, l = o.large || L * 0.3;
    P.forme((u, v) => u >= 0 && u <= L && Math.abs(v) <= l * Math.sin(Math.PI * u / L), c, false, [x0 + 0.5, y0 + 0.5, a]);
    P.trait(x0, y0, x0 + dx * 0.8, y0 + dy * 0.8, 1, o.nervure || nuancer(c, 0.62), true);
    return P;
  },
  rocher(P, cx, cy, r, o = {}) {
    const c = o.c || '#8a8278'; P.poly([[cx - r, cy + r * 0.5], [cx - r * 0.8, cy - r * 0.35], [cx - r * 0.2, cy - r * 0.9], [cx + r * 0.65, cy - r * 0.6], [cx + r, cy + r * 0.15], [cx + r * 0.7, cy + r * 0.8], [cx - r * 0.5, cy + r * 0.85]], c);
    if (o.fissure !== false) { P.ligne(cx - r * 0.1, cy - r * 0.5, cx + r * 0.1, cy, nuancer(c, 0.55), true); P.ligne(cx + r * 0.1, cy, cx - r * 0.3, cy + r * 0.4, nuancer(c, 0.55), true); }
    return P;
  },
  tornade(P, cx, cy, o = {}) { // entonnoir de vent
    const c = o.c || '#a8e0d0';
    for (let i = 0; i < 5; i++) { const w = 6.6 - i * 1.25, y = cy - 5 + i * 2.4; P.ellipse(cx + Math.sin(i * 1.3) * 1.2, y, w, 1.15, i % 2 ? nuancer(c, 0.85) : c); }
    return P;
  },
  vague(P, x, y, w, o = {}) { const c = o.c || PAL.bleu; for (let i = 0; i < w; i++) { const h = Math.round(Math.sin(i * 0.9) * 1.2); P.rect(x + i, y + h, 1, 2, c); } return P; },
  soleil(P, cx, cy, r, o = {}) { const c = o.c || PAL.or; for (let i = 0; i < 8; i++) { const a = (i * 45 + (o.rot || 0)) * DEG; P.trait(cx - 0.5 + Math.cos(a) * (r + 1), cy - 0.5 + Math.sin(a) * (r + 1), cx - 0.5 + Math.cos(a) * (r + 3), cy - 0.5 + Math.sin(a) * (r + 3), 1.4, o.rayons || c); } P.disque(cx, cy, r, c); return P; },
  lune(P, cx, cy, r, o = {}) { P.disque(cx, cy, r, o.c || '#f0e6b0'); P.disque(cx + r * 0.55, cy - r * 0.35, r * 0.85, null); return P; },
  nuage(P, cx, cy, o = {}) { const c = o.c || PAL.blanc; P.disque(cx - 3.2, cy + 0.6, 2.6, c); P.disque(cx, cy - 1, 3.3, c); P.disque(cx + 3.4, cy + 0.4, 2.7, c); P.rect(Math.round(cx - 4.5), Math.round(cy + 0.5), 9, 3, c); return P; },
  sceau(P, cx, cy, r, o = {}) { // cercle de sceau tracé à l'encre
    const c = o.c || PAL.encre; P.anneau(cx, cy, r, 1.2, c, true);
    if (o.croix !== false) for (let i = 0; i < 4; i++) { const a = (i * 90 + 45) * DEG; P.px(cx - 0.5 + Math.cos(a) * (r - 2.2), cy - 0.5 + Math.sin(a) * (r - 2.2), c, true); }
    if (o.spirale) P.arc(cx, cy, r * 0.45, 0, 270, 1, c, true);
    return P;
  },
  cloche(P, cx, cy, o = {}) {
    const c = o.c || PAL.or;
    P.forme((x, y) => { const t = (y - (cy - 4.5)) / 9; if (t < 0 || t > 1) return false; return Math.abs(x - cx) <= 2 + t * t * 4.2; }, c);
    P.rect(Math.round(cx - 1), Math.round(cy - 6), 2, 2, o.anse || nuancer(c, 0.75)); P.disque(cx, cy + 5.2, 1.2, o.battant || nuancer(c, 0.6));
    return P;
  },
  bouclier(P, cx, cy, o = {}) {
    const c = o.c || PAL.acier; P.forme((x, y) => { const t = (y - (cy - 6)) / 13; if (t < 0 || t > 1) return false; return Math.abs(x - cx) <= 5.6 * (t < 0.45 ? 1 : Math.cos((t - 0.45) / 0.55 * Math.PI / 2)); }, c);
    if (o.bordure) P.forme((x, y) => { const t = (y - (cy - 6)) / 13; if (t < 0 || t > 1) return false; const w = 5.6 * (t < 0.45 ? 1 : Math.cos((t - 0.45) / 0.55 * Math.PI / 2)); return Math.abs(x - cx) <= w && Math.abs(x - cx) > w - 1.1; }, o.bordure, true);
    return P;
  },
  masque(P, cx, cy, o = {}) { // masque ovale (ANBU, oni, chat…)
    const c = o.c || PAL.blanc; P.ellipse(cx, cy, 5.4, 6.4, c);
    if (o.oreilles) { P.poly([[cx - 5, cy - 3], [cx - 4.6, cy - 7.6], [cx - 1.6, cy - 5.6]], c); P.poly([[cx + 5, cy - 3], [cx + 4.6, cy - 7.6], [cx + 1.6, cy - 5.6]], c); }
    if (o.cornes) { P.poly([[cx - 3.6, cy - 4.4], [cx - 5.4, cy - 8.4], [cx - 1.8, cy - 5.6]], o.cornes); P.poly([[cx + 3.6, cy - 4.4], [cx + 5.4, cy - 8.4], [cx + 1.8, cy - 5.6]], o.cornes); }
    P.ellipse(cx - 2.2, cy - 0.6, 1.3, 0.9, o.yeux || PAL.noir, true); P.ellipse(cx + 2.2, cy - 0.6, 1.3, 0.9, o.yeux || PAL.noir, true);
    if (o.marques) { P.trait(cx - 4.2, cy + 1, cx - 2.6, cy + 3.4, 1, o.marques, true); P.trait(cx + 4.2, cy + 1, cx + 2.6, cy + 3.4, 1, o.marques, true); P.trait(cx - 0.5, cy - 5.6, cx - 0.5, cy - 3.4, 1, o.marques, true); }
    if (o.bouche) P.rect(Math.round(cx - 2), Math.round(cy + 3), 4, 1, o.bouche, true);
    return P;
  },
  poing(P, cx, cy, o = {}) { // poing fermé vu de face (13 × 11), pouce replié devant
    const c = o.c || PAL.peau, b = o.manche || o.bande || null;
    P.motif(['.lll.lll.lll.', 'laaadaaadaaad', 'laaadaaadaaad', 'aaaadaaadaaad', 'aaaaaaaaaaaad', 'tttttttaaaaad', 'ttttttttaaad.', '.ttttttdaaad.', '..aaaaaaaad..', '..bbbbbbbb...', '..bbbbbbbb...'],
      { l: nuancer(c, 1.25), a: c, d: nuancer(c, 0.72), t: nuancer(c, 1.1), b: b || undefined }, Math.round(cx - 6.5), Math.round(cy - 5.5));
    return P;
  },
  pilule(P, cx, cy, a, o = {}) { // gélule bicolore
    const t = [cx, cy, a]; P.forme((u, v) => Math.abs(v) <= 2.3 && Math.abs(u) <= 5 - Math.max(0, 2.3 - Math.sqrt(Math.max(0, 5.3 - v * v))) && (u ** 2 / 30 + v * v / 5.3 <= 1 || Math.abs(u) < 3), o.a || PAL.rouge, false, t);
    P.forme((u, v) => u > 0 && u ** 2 / 30 + v * v / 5.3 <= 1, o.b || PAL.blanc, false, t);
    return P;
  },
  bol(P, cx, cy, o = {}) {
    P.forme((x, y) => y >= cy && y <= cy + 5 && Math.abs(x - cx) <= 6.5 - (y - cy) * 0.7, o.c || '#c83a2a');
    P.ellipse(cx, cy, 6.5, 1.6, o.bouillon || '#f0c060', true);
    return P;
  },
  boussole(P, cx, cy, r, o = {}) {
    P.disque(cx, cy, r, o.boitier || PAL.or); P.disque(cx, cy, r - 1.4, '#f4ecd8', true);
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) P.px(cx - 0.5 + dx * (r - 2.2), cy - 0.5 + dy * (r - 2.2), PAL.acierF, true);
    P.poly([[cx - 1.6, cy], [cx, cy - r + 1.8], [cx + 1.6, cy]], PAL.rouge, true); P.poly([[cx - 1.6, cy], [cx, cy + r - 1.8], [cx + 1.6, cy]], '#3a4a6a', true);
    P.disque(cx, cy, 0.9, PAL.or, true);
    return P;
  },
  plume(P, x0, y0, x1, y1, o = {}) { const c = o.c || PAL.blanc; P.feuille(x0, y0, x1, y1, { c, large: o.large || 2.6, nervure: o.tige || nuancer(c, 0.6) }); return P; },
  aile(P, cx, cy, s, o = {}) { // aile de papier / plume, s = 1 droite, −1 gauche
    const c = o.c || PAL.blanc;
    for (let i = 0; i < 4; i++) P.poly([[cx, cy + i * 1.4], [cx + s * (7 - i * 0.9), cy - 3 + i * 2.2], [cx + s * (6.2 - i * 0.9), cy + i * 2.4 + 0.6]], i % 2 ? nuancer(c, 0.88) : c);
    return P;
  },
  sablier(P, cx, cy, o = {}) {
    const c = o.c || PAL.bois; P.rect(cx - 4, cy - 6, 8, 1, c); P.rect(cx - 4, cy + 5, 8, 1, c);
    P.poly([[cx - 3, cy - 5], [cx + 3, cy - 5], [cx + 0.5, cy], [cx + 3, cy + 5], [cx - 3, cy + 5], [cx - 0.5, cy]], PAL.glace, true);
    P.poly([[cx - 2, cy - 4], [cx + 2, cy - 4], [cx, cy - 1]], o.sable || PAL.sable, true); P.poly([[cx - 2.6, cy + 5], [cx + 2.6, cy + 5], [cx, cy + 2]], o.sable || PAL.sable, true);
    return P;
  },
  miroir(P, cx, cy, o = {}) { P.ellipse(cx, cy, 4.2, 5.4, o.cadre || PAL.acierF); P.ellipse(cx, cy, 3.1, 4.3, o.c || PAL.glace, true); P.trait(cx - 1.6, cy - 2.5, cx - 0.2, cy - 3.6, 1, PAL.blanc, true); return P; },
  chaine(P, pts, o = {}) { const c = o.c || PAL.acier; for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i]; if (i % 2) P.ellipse(x, y, 1.1, 1.9, c); else P.ellipse(x, y, 1.9, 1.1, c); P.px(x - 0.5, y - 0.5, null); } return P; },
  gourde(P, cx, cy, o = {}) { const c = o.c || '#c89a5a'; P.disque(cx, cy + 2.4, 4.2, c); P.disque(cx, cy - 2.6, 2.6, c); P.rect(Math.round(cx - 1), Math.round(cy - 6.5), 2, 2, o.bouchon || PAL.boisF); P.rect(Math.round(cx - 2), Math.round(cy - 0.6), 4, 1, o.lien || PAL.rouge, true); return P; },
  buche(P, cx, cy, o = {}) { P.trait(cx - 5, cy + 1, cx + 5, cy - 1, 5, o.c || PAL.bois); P.ellipse(cx + 5.4, cy - 0.6, 1.6, 2.5, o.coupe || PAL.boisC); P.px(cx + 5, cy - 1, PAL.boisF, true); return P; },
  livre(P, x, y, w, h, o = {}) { P.rect(x, y, w, h, o.c || '#8a3a3a'); P.rect(x + w - 2, y + 1, 2, h - 2, PAL.papier, true); P.rect(x + 1, y, 1, h, nuancer(o.c || '#8a3a3a', 0.7), true); return P; },
  carte(P, x, y, w, h, o = {}) { P.rect(x, y, w, h, o.papier || PAL.papier); for (let i = 2; i < w; i += 3) P.rect(x + i, y, 1, h, nuancer(o.papier || PAL.papier, 0.88), true); return P; },
  gant(P, cx, cy, o = {}) { // main ouverte, paume vers nous
    const c = o.c || PAL.peau;
    P.ellipse(cx, cy + 1.5, 3.8, 3.6, c);
    for (let i = 0; i < 4; i++) P.trait(cx - 2.6 + i * 1.75, cy - 1, cx - 2.9 + i * 1.95, cy - 5.4 + Math.abs(i - 1.5) * 0.8, 1.5, c);
    P.trait(cx - 3.4, cy + 1.2, cx - 6, cy - 1.6, 1.6, c);
    if (o.manchette) P.rect(cx - 3, cy + 4, 6, 3, o.manchette);
    return P;
  },
  sandale(P, cx, cy, o = {}) { // sandale vue de dessus, inclinée, lanière en V
    const c = o.c || PAL.bois, t = [cx, cy, o.a ?? -24], L = o.laniere || '#2a3a7a';
    P.forme((u, v) => (u / 3.6) ** 2 + ((v + 0.6) / 7.2) ** 2 <= 1 && !(v > 3 && Math.abs(u) > 2.9 - (v - 3) * 0.2), nuancer(c, 0.78), false, t);
    P.forme((u, v) => (u / 2.6) ** 2 + ((v + 0.6) / 6.2) ** 2 <= 1, o.semelle || nuancer(c, 1.32), true, t);
    P.trait(0, -3.8, -2.8, -0.4, 1.5, L, true, t); P.trait(0, -3.8, 2.8, -0.4, 1.5, L, true, t);
    return P;
  },
  bandeau(P, y, o = {}) { // bandeau frontal : tissu + plaque frappée
    P.rect(0, y, 16, 4, o.tissu || '#2a4a8a'); P.rect(3, y - 1, 10, 6, o.plaque || PAL.acier);
    P.rect(4, y, 8, 4, nuancer(o.plaque || PAL.acier, 1.12), true);
    if (o.symbole !== false) { P.arc(8, y + 2, 1.6, 200, 520, 1, o.symbole || PAL.acierF, true); }
    if (o.raye) P.trait(4, y + 4, 12, y, 1, PAL.rouge, true);
    return P;
  },
  lunettes(P, cy, o = {}) { const c = o.verres || '#3a5a8a'; P.rect(1, cy - 1, 14, 2, o.monture || PAL.noir); P.ellipse(4.5, cy, 3.2, 2.6, c); P.ellipse(11.5, cy, 3.2, 2.6, c); P.px(3.5, cy - 1, PAL.blanc, true); P.px(10.5, cy - 1, PAL.blanc, true); return P; },
  porte(P, cx, cy, o = {}) { // portique (torii) : piliers et linteau
    const c = o.c || PAL.rouge; P.rect(cx - 6, cy - 6, 12, 2, c); P.rect(cx - 5, cy - 3, 10, 1, c); P.rect(cx - 4, cy - 4, 2, 10, c); P.rect(cx + 2, cy - 4, 2, 10, c);
    return P;
  },
  papillon(P, cx, cy, o = {}) { const c = o.c || PAL.blanc; P.ellipse(cx - 2.8, cy - 1.6, 2.6, 2.8, c); P.ellipse(cx + 2.8, cy - 1.6, 2.6, 2.8, c); P.ellipse(cx - 2.2, cy + 2.2, 2, 2, nuancer(c, 0.9)); P.ellipse(cx + 2.2, cy + 2.2, 2, 2, nuancer(c, 0.9)); P.rect(Math.round(cx - 0.5), Math.round(cy - 3), 1, 7, o.corps || PAL.encre, true); return P; },
};
// Raccourcis : P.kunai(…) ⇔ OBJ.kunai(P, …)
for (const [k, f] of Object.entries(OBJ)) PeintreIcone.prototype[k] = function (...a) { return f(this, ...a); };

const RECETTES_ICONES = {};
const _iconesPeintes = {};
function iconeItem(id) {
  if (_iconesPeintes[id]) return _iconesPeintes[id];
  const R = RECETTES_ICONES[id]; if (!R) return null;
  const P = new PeintreIcone(); R(P); return (_iconesPeintes[id] = P.rendre());
}
