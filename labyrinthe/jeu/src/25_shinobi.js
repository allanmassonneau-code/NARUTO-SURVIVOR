// ═══════════════════════════════════════════════════════════════════════════
// Shinobi ennemis : chaque ennemi humain est un personnage à part entière
// (création originale) — gabarit, posture, tenue, tête et accessoire propres,
// et non plus un même petit corps coiffé autrement.
// Peints par primitives en volume (boules, membres, troncs) éclairées en haut à
// gauche, séparées par des traits intérieurs, puis contournées.
// La posture dit la mécanique : penché en pleine course = fonce au contact ;
// épaules en avant, arme pointée = charge en ligne ; bras armé = tire en ligne ;
// arme épaulée = anticipe et vise ; charge sur le dos = tire en cloche ;
// accroupi parmi ses parchemins = pose des pièges ; massif = frappe le sol ;
// mains levées et fils de chakra = invoque ; mains vertes = soigne ;
// tapi sous une cape = surgit en embuscade.
// Trois images : deux de marche et une d'attaque, montrée pendant le télégraphe.
// ═══════════════════════════════════════════════════════════════════════════

const SH = { L: 52, H: 60, X: 26, SOL: 56 }; // toile de travail ; axe du corps entre les colonnes 25 et 26 ; pieds sur la ligne 56
const LUM = (() => { const v = [-0.55, -0.7, 0.6], n = Math.hypot(...v); return v.map(x => x / n); })();
// Rampe de 5 tons (creux, ombre, base, clair, éclat) : ombres froides, lumières chaudes
function rampeShinobi(c) {
  if (Array.isArray(c)) return c.map(hexRgb);
  return [melange(nuancer(c, 0.52), '#22143a', 0.3), melange(nuancer(c, 0.75), '#3a2850', 0.16), c, melange(nuancer(c, 1.17), '#fff0c8', 0.12), melange(nuancer(c, 1.36), '#fffbe8', 0.22)].map(hexRgb);
}
// pal : { clé: '#rrggbb' | { c: '#rrggbb', brille: true } | [5 tons] }
function peintreShinobi(pal) {
  const W = SH.L, H = SH.H, N = W * H, mat = new Uint8Array(N), niv = new Uint8Array(N), piece = new Uint16Array(N);
  const id = {}, ramp = [null], brille = [false];
  for (const k of Object.keys(pal)) { const v = pal[k]; id[k] = ramp.length; ramp.push(rampeShinobi(v && v.c ? v.c : v)); brille.push(!!(v && v.brille)); }
  let pc = 0, bx0 = W, by0 = H, bx1 = -1, by1 = -1; const apres = [];
  const M = k => { const m = id[k]; if (!m) throw new Error('matière inconnue : ' + k); return m; };
  const niveau = (I, m) => I > 0.88 && brille[m] ? 4 : I > 0.6 ? 3 : I > 0.06 ? 2 : I > -0.42 ? 1 : 0;
  const poser = (x, y, m, v) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = y * W + x; mat[i] = m; niv[i] = v; piece[i] = pc; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; };
  const neuve = () => { pc++; bx0 = W; by0 = H; bx1 = -1; by1 = -1; };
  // trait intérieur : ce qui est derrière la pièce qu'on vient de poser s'assombrit à son bord
  const trait = () => {
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
      const i = y * W + x; if (piece[i] !== pc || !mat[i]) continue;
      for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) if (j >= 0 && j < N && mat[j] && piece[j] < pc) niv[j] = 0;
    }
  };
  const fin = o => { if (o.trait !== false) trait(); };
  const P = {
    // boule éclairée (tête, mains, épaulières, jarres)
    boule(cx, cy, rx, ry, k, o = {}) {
      const m = M(k); neuve();
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy; if (d > 1) continue;
        poser(x, y, m, o.niv ?? niveau(dx * LUM[0] + dy * LUM[1] + Math.sqrt(1 - d) * LUM[2] + (o.plus || 0), m));
      }
      fin(o); return P;
    },
    // segment épais arrondi, éclairé comme un cylindre (membres, manches, hampes, lames épaisses) ; r1 : rayon au bout
    membre(x0, y0, x1, y1, r, k, o = {}) {
      const m = M(k); neuve(); const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy || 1e-6, r1 = o.r1 ?? r, R = Math.max(r, r1) + 1;
      for (let y = Math.floor(Math.min(y0, y1) - R); y <= Math.ceil(Math.max(y0, y1) + R); y++) for (let x = Math.floor(Math.min(x0, x1) - R); x <= Math.ceil(Math.max(x0, x1) + R); x++) {
        const px = x + 0.5 - x0, py = y + 0.5 - y0, t = Math.max(0, Math.min(1, (px * dx + py * dy) / l2)), rr = r + (r1 - r) * t;
        const qx = px - dx * t, qy = py - dy * t, d2 = (qx * qx + qy * qy) / (rr * rr); if (d2 > 1) continue;
        poser(x, y, m, o.niv ?? niveau(qx / rr * LUM[0] + qy / rr * LUM[1] + Math.sqrt(1 - d2) * LUM[2] + (o.plus || 0), m));
      }
      fin(o); return P;
    },
    // tronc trapézoïdal (torse, robe, manteau) éclairé comme un cylindre vertical ; arrondi : épaules ; degrade : bas plus sombre
    tronc(yh, yb, xgh, xdh, xgb, xdb, k, o = {}) {
      const m = M(k); neuve();
      for (let y = Math.round(yh); y <= Math.round(yb); y++) {
        const t = yb > yh ? (y - yh) / (yb - yh) : 0, xg = xgh + (xgb - xgh) * t, xd = xdh + (xdb - xdh) * t, a = o.arrondi ? Math.max(0, o.arrondi - (y - Math.round(yh))) : 0;
        for (let x = Math.round(xg + a); x < Math.round(xd - a); x++) {
          const s = ((x + 0.5 - xg) / Math.max(1, xd - xg)) * 2 - 1, nz = Math.sqrt(Math.max(0, 1 - s * s * 0.92));
          poser(x, y, m, o.niv ?? niveau(s * LUM[0] + nz * LUM[2] - (o.degrade || 0) * t + (o.plus || 0), m));
        }
      }
      fin(o); return P;
    },
    // polygone plein (capes, chapeaux, lames, éventails) : niveau fixe, bord haut-gauche éclairé si « relief »
    poly(pts, k, o = {}) {
      const m = M(k); neuve(); const ys = pts.map(p => p[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
      for (let y = y0; y <= y1; y++) {
        const yc = y + 0.5, xs = [];
        for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax)); }
        xs.sort((a, b) => a - b);
        for (let j = 0; j + 1 < xs.length; j += 2) {
          const xa = Math.round(xs[j]), xb = Math.round(xs[j + 1]);
          for (let x = xa; x < xb; x++) {
            let v = o.niv ?? 2;
            if (o.cyl) { const s = ((x + 0.5 - xs[j]) / Math.max(1, xs[j + 1] - xs[j])) * 2 - 1; v = niveau(s * LUM[0] + Math.sqrt(Math.max(0, 1 - s * s * 0.92)) * LUM[2] + (o.plus || 0), m); }
            else if (o.relief && (x === xa || y === y0)) v = Math.min(4, v + 1);
            poser(x, y, m, v);
          }
        }
      }
      fin(o); return P;
    },
    rect(x, y, l, h, k, v = 2) { const m = M(k); for (let j = 0; j < h; j++) for (let i = 0; i < l; i++) poser(Math.round(x) + i, Math.round(y) + j, m, v); return P; },
    px(x, y, k, v = 2) { poser(Math.round(x), Math.round(y), M(k), v); return P; },
    ligne(x0, y0, x1, y1, k, v = 2) {
      const m = M(k); x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
      for (let n = 0; n < 200; n++) { poser(x0, y0, m, v); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
      return P;
    },
    // pièce séparée de la suivante par un trait intérieur (détails posés à la main)
    piece() { neuve(); return P; },
    traitPiece() { trait(); return P; },
    assombrir(x, y, l, h, d = 1) { for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + l); i++) { const q = j * W + i; if (mat[q]) niv[q] = Math.max(0, niv[q] - d); } return P; },
    eclaircir(x, y, l, h, d = 1) { for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + l); i++) { const q = j * W + i; if (mat[q]) niv[q] = Math.min(4, niv[q] + d); } return P; },
    // retire des pixels (fentes, trous)
    effacer(x, y, l = 1, h = 1) { for (let j = 0; j < h; j++) for (let i = 0; i < l; i++) { const xx = Math.round(x) + i, yy = Math.round(y) + j; if (xx >= 0 && yy >= 0 && xx < W && yy < H) mat[yy * W + xx] = 0; } return P; },
    // dessins posés après le contour (lueurs, fils de chakra, étincelles) : fn(g)
    apres(fn) { apres.push(fn); return P; },
    vide(x, y) { return !mat[y * W + x]; },
    toile() {
      const c = toile(W, H), g = ctxDe(c), img = g.createImageData(W, H), d = img.data;
      for (let i = 0; i < N; i++) { const m = mat[i]; if (!m) continue; const t = ramp[m][niv[i]]; d[i * 4] = t[0]; d[i * 4 + 1] = t[1]; d[i * 4 + 2] = t[2]; d[i * 4 + 3] = 255; }
      g.putImageData(img, 0, 0); const o = contourner(c); const go = ctxDe(o); for (const f of apres) f(go); return o;
    },
  };
  return P;
}

// ── Pièces communes ──────────────────────────────────────────────────────────
const XS = SH.X; // axe du corps
// Jambe : hanche → genou → cheville, pied posé sur la ligne fy. o : k pantalon, kp chaussure, pied (sandale, botte, nu), bandes (bandages du tibia)
function shJambe(P, hx, hy, gx, gy, fx, fy, o) {
  const r = o.r ?? 1.8, c = fx >= hx ? 1 : -1, kp = o.kp || 'sandale';
  P.membre(hx, hy, gx, gy, r + 0.25, o.k, { trait: false }).membre(gx, gy, fx, fy - 1.5, r, o.kb || o.k, { trait: false });
  if (o.bandes) for (let y = Math.round(fy - 6); y <= fy - 3; y += 2) P.rect(Math.round(fx - r + 0.2), y, Math.max(2, Math.round(2 * r - 0.4)), 1, o.bandes, 3);
  if (o.pied === 'botte') P.boule(fx + c * 0.5, fy - 1, r + 0.8, 2.1, kp);
  else if (o.pied === 'nu') P.boule(fx + c * 0.6, fy - 0.5, r + 0.5, 1.3, kp);
  else { P.boule(fx + c * 0.6, fy - 0.6, r + 0.6, 1.4, kp); P.px(fx + c * (r + 0.4), fy - 1, 'peau', 2); }
}
// Bras : épaule → coude → main ; k : manche ; kh : main (peau ou gant)
function shBras(P, sx, sy, cx, cy, hx, hy, k, kh = 'peau', o = {}) {
  const r = o.r ?? 1.6; P.membre(sx, sy, cx, cy, r + 0.2, k, { trait: o.trait }).membre(cx, cy, hx, hy, o.r1 ?? r, o.kav || k, { trait: o.trait });
  if (o.main !== false) P.boule(hx, hy, o.rm ?? 1.7, o.rm ?? 1.7, kh, { trait: o.trait });
}
// Yeux de face : « fente » (sourcils froncés), « rond » (blanc + pupille), « points », « lueur » (couleur unie), « vide » (orbites noires)
function shYeux(P, cx, cy, type = 'fente', o = {}) {
  const e = o.ecart ?? 3, k = o.k || 'oeil';
  for (const c of [-1, 1]) {
    const x = c < 0 ? Math.round(cx - e - 1) : Math.round(cx + e - 1), y = Math.round(cy);
    if (type === 'fente') { P.rect(x, y, 2, 1, k, 2); P.px(c < 0 ? x : x + 1, y - 1, o.sourcil || k, 2); }
    else if (type === 'rond') { P.rect(x, y - 1, 2, 2, 'blanc', 3); P.px(c < 0 ? x + 1 : x, y, k, 2); P.px(c < 0 ? x + 1 : x, y - 1, k, 2); }
    else if (type === 'points') P.rect(x + (c < 0 ? 1 : 0), y - 1, 1, 2, k, 2);
    else if (type === 'lueur') P.rect(x, y, 2, 1, k, 3).px(c < 0 ? x : x + 1, y, k, 4);
    else if (type === 'vide') P.rect(x, y - 1, 2, 3, k, 0);
  }
}
// Bandeau frontal : bande de tissu + plaque de métal (rayée chez les renégats)
function shBandeau(P, cx, y, rx, k = 'bandeau', o = {}) {
  P.piece(); P.rect(cx - rx, y, rx * 2, 2, k, 2); P.rect(cx - rx, y + 1, rx * 2, 1, k, 1);
  const l = o.plaque ?? 5; P.rect(cx - l / 2, y, l, 2, 'metal', 3); P.px(cx - l / 2, y, 'metal', 4); P.rect(cx - l / 2, y + 1, l, 1, 'metal', 2);
  if (o.raye) { P.px(cx - 1, y + 1, 'oeil', 1); P.px(cx, y, 'oeil', 1); P.px(cx + 1, y, 'oeil', 1); }
  P.traitPiece();
}
// Mèches en pointes autour d'une tête : [angle en degrés (0 = haut, + vers la droite), longueur, largeur]
function shPointes(P, hx, hy, R, k, L) {
  for (const [a, l, w = 3] of L) {
    const t = a * Math.PI / 180, ux = Math.sin(t), uy = -Math.cos(t), bx = hx + ux * (R - 2.2), by = hy + uy * (R - 2.2), qx = -uy * w / 2, qy = ux * w / 2;
    P.poly([[bx - qx, by - qy], [hx + ux * (R - 2.2 + l), hy + uy * (R - 2.2 + l)], [bx + qx, by + qy]], k, { niv: a < -20 ? 3 : a > 35 ? 1 : 2, trait: false });
  }
}
// Fils de chakra (dessinés après le contour : fins et lumineux)
function shFils(P, pts, couleur) { P.apres(g => { for (const [x0, y0, x1, y1] of pts) lignePixel(g, x0, y0, x1, y1, couleur); }); }
// Lueur douce (après le contour) : disque clair + cœur
function shLueur(P, x, y, r, c1, c2) { P.apres(g => { g.globalAlpha = 0.55; g.drawImage(disque(r + 1, c1), Math.round(x - r - 1), Math.round(y - r - 1)); g.globalAlpha = 1; g.drawImage(disque(Math.max(1, r - 1), c2), Math.round(x - r + 1), Math.round(y - r + 1)); }); }

// Éventail ouvert : secteur de lames alternées autour du point (cx, cy)
function shEventail(P, cx, cy, R, a0, a1, n, k1, k2) {
  for (let j = 0; j < n; j++) { const u = a0 + (a1 - a0) * j / n, v = a0 + (a1 - a0) * (j + 1) / n; P.poly([[cx, cy], [cx + Math.cos(u) * R, cy + Math.sin(u) * R], [cx + Math.cos((u + v) / 2) * (R + 0.8), cy + Math.sin((u + v) / 2) * (R + 0.8)], [cx + Math.cos(v) * R, cy + Math.sin(v) * R]], j % 2 ? k2 : k1, { niv: j % 2 ? 2 : 3, trait: j === n - 1 }); }
}
// ── Les personnages ─────────────────────────────────────────────────────────
// Chaque fiche : pal (matières) et f(P, i, att) — i : image de marche (0/1), att : image d'attaque (télégraphe).
// Toile 52×60, axe du corps x = 26, pieds sur la ligne 55. Lumière en haut à gauche.
const PEAUX = { claire: '#f2c8a0', mate: '#d8a070', brune: '#a8704a', pale: '#ece4dc' };
const SHINOBI = {};
const P_BASE = { peau: PEAUX.claire, oeil: '#1c1420', blanc: '#ffffff', metal: { c: '#b8c0cc', brille: true }, lame: { c: '#d0d8e4', brille: true } };
const pal = o => Object.assign({}, P_BASE, o);

// ── Chapitre I : Académie, Forêt de la Mort ──
// ENM_002 Genin renégat (fonce au contact) — sec et nerveux, penché en pleine course, kunai en prise inversée,
// écharpe rouge qui claque derrière lui, bandeau rayé de renégat.
SHINOBI.genin_renegat = {
  pal: pal({ cheveux: '#4a3022', veste: '#8a6040', pantalon: '#383444', sandale: '#34466a', bandes: '#e8e0cc', echarpe: '#d03a2a', bandeau: '#2a2a34', manche: '#6a4630' }),
  f(P, i, att) {
    const b = i, fl = i ? 1 : 0;
    // pans d'écharpe qui flottent vers l'arrière (il court vers la droite)
    P.poly([[25, 35 + b], [18, 32 + fl], [11, 32 + 2 * fl], [13, 35 + fl], [19, 36 + fl], [25, 38 + b]], 'echarpe', { relief: true });
    P.poly([[24, 37 + b], [17, 37 + fl], [12, 40 - fl], [15, 40], [23, 40 + b]], 'echarpe', { niv: 1 });
    // foulée : une jambe tendue en arrière, l'autre pliée en avant
    const J = { k: 'pantalon', bandes: 'bandes', r: 1.7 };
    if (i) { shJambe(P, 24, 46, 22, 50, 22, 55, J); shJambe(P, 28, 46, 31, 48, 32, 53, J); }
    else { shJambe(P, 24, 46, 20, 49, 18, 53, J); shJambe(P, 28, 46, 30, 50, 30, 55, J); }
    shBras(P, 24, 37 + b, 20, 40 + b, 17, 42 + b, 'manche'); // bras arrière, lancé vers l'arrière
    P.poly([[22, 36 + b], [31, 35 + b], [30, 47], [22, 47]], 'veste', { cyl: true }); // buste penché vers l'avant
    P.rect(22, 44, 9, 2, 'pantalon', 1); P.px(26, 44, 'metal', 3);
    P.boule(27, 36 + b, 5, 2.2, 'echarpe');
    const hx = 29, hy = 29 + b; // tête en avant
    shPointes(P, hx, hy, 6, 'cheveux', [[-95, 6, 4], [-70, 7, 4], [-45, 6, 4], [-15, 5, 4], [15, 3, 3]]);
    P.boule(hx - 0.5, hy - 1, 6.2, 5.6, 'cheveux');
    P.boule(hx + 0.6, hy + 1, 5, 4.6, 'peau');
    shBandeau(P, hx + 0.5, hy - 3, 5.6, 'bandeau', { raye: true, plaque: 4 });
    P.poly([[hx - 4, hy], [hx - 2, hy - 1], [hx - 3, hy + 2]], 'cheveux', { niv: 1, trait: false });
    shYeux(P, hx + 1, hy + 1, 'fente', { ecart: 2.4 }); P.px(hx + 2, hy + 2, 'peau', 1); P.rect(hx, hy + 4, 2, 1, 'oeil', 1);
    if (att) { shBras(P, 30, 37 + b, 34, 37, 38, 36, 'manche'); P.ligne(39, 35, 44, 32, 'lame', 3).ligne(39, 36, 43, 34, 'lame', 1).px(38, 37, 'bois', 2); }
    else { shBras(P, 30, 37 + b, 33, 40 + b, 35, 41 + b, 'manche'); P.ligne(35, 42 + b, 38, 46 + b, 'lame', 3).px(36, 44 + b, 'lame', 1); }
  },
};
SHINOBI.genin_renegat.pal.bois = '#6a4428';

// ENM_003 Lanceur de kunai (tire quand on est aligné) — veste olive à capuche baissée, demi-masque de tissu,
// chignon haut, bandoulière garnie de kunai ; à l'attaque, le bras armé passe derrière la tête, trois kunai en éventail.
SHINOBI.lanceur_kunai = {
  pal: pal({ cheveux: '#24202a', veste: '#5e6e3a', capuche: '#4a5a2e', pantalon: '#3a3a40', sandale: '#3a4258', masque: '#3a3a44', cuir: '#8a6438', anneau: '#c8b070', bandes: '#ddd6c4' }),
  f(P, i, att) {
    const b = i;
    const J = { k: 'pantalon', bandes: 'bandes' };
    if (i) { shJambe(P, 23.5, 46, 22, 51, 21, 55, J); shJambe(P, 28.5, 46, 30, 50, 31, 54, J); }
    else { shJambe(P, 23.5, 46, 22, 50, 21, 54, J); shJambe(P, 28.5, 46, 30, 51, 31, 55, J); }
    P.rect(29, 47, 3, 4, 'cuir', 2).px(30, 48, 'anneau', 3); // étui de cuisse
    P.boule(26, 34.5 + b, 6.5, 3, 'capuche'); // capuche baissée sur les épaules
    shBras(P, 21, 37 + b, 20, 42 + b, 21, 45 + b, 'veste');
    P.tronc(35.5 + b, 47, 20.5, 31.5, 21, 31, 'veste', { arrondi: 2 });
    P.rect(21, 45, 10, 2, 'cuir', 1);
    // bandoulière en diagonale, poignées de kunai
    P.piece(); for (let k = 0; k < 9; k++) { P.rect(21 + k, 37 + b + k, 2, 1, 'cuir', 2); if (k % 2 === 0 && k > 0) P.px(21 + k, 36 + b + k, 'anneau', 3).px(21 + k, 35 + b + k, 'metal', 3); } P.traitPiece();
    const hx = 26, hy = 29 + b;
    P.boule(hx, hy - 1, 5.8, 5.4, 'cheveux'); P.boule(hx, hy - 7, 2.2, 2, 'cheveux'); P.rect(hx - 1, hy - 5.5, 2, 1, 'anneau', 3); // chignon
    P.boule(hx, hy + 1, 5, 4.6, 'peau');
    P.poly([[hx - 5, hy - 1], [hx - 1, hy - 3], [hx + 2, hy - 1], [hx + 5, hy - 2], [hx + 5, hy - 4], [hx - 5, hy - 4]], 'cheveux', { niv: 2, trait: false });
    P.tronc(hy + 2, hy + 5, hx - 5, hx + 5, hx - 4, hx + 4, 'masque'); // demi-masque
    shYeux(P, hx, hy + 1, 'fente', { ecart: 2.2 });
    if (att) { // bras armé derrière la tête : trois kunai en éventail
      shBras(P, 31, 37 + b, 35, 31, 33, 25, 'veste');
      for (const [dx, dy] of [[-3, -5], [0, -6], [3, -5]]) P.ligne(33, 25, 33 + dx, 25 + dy, 'lame', 3);
    } else {
      shBras(P, 31, 37 + b, 33, 42 + b, 32, 45 + b, 'veste');
      for (const [dx, dy] of [[1, 4], [3, 3], [4, 1]]) P.ligne(33, 46 + b, 33 + dx, 46 + b + dy, 'lame', 3);
    }
  },
};

// ENM_011 Ninja de la pluie (anticipe et vise) — long imperméable à haut col, respirateur à cartouche,
// tube à eau en bambou ; à l'attaque, il épaule le tube et vise.
SHINOBI.ninja_pluie = {
  pal: pal({ peau: '#e0c0a8', manteau: '#4a5e70', col: '#3a4a5a', capuche: '#2e3a46', pantalon: '#2e3440', sandale: '#2e3440', respi: { c: '#8a96a4', brille: true }, tuyau: '#3a3a44', bambou: '#7a9a4a', eau: '#8ac8f0' }),
  f(P, i, att) {
    const b = i;
    const J = { k: 'pantalon', pied: 'botte', kp: 'sandale' };
    if (i) { shJambe(P, 23.5, 47, 23, 51, 22.5, 55, J); shJambe(P, 28.5, 47, 29, 51, 29.5, 54, J); }
    else { shJambe(P, 23.5, 47, 23, 51, 22.5, 54, J); shJambe(P, 28.5, 47, 29, 51, 29.5, 55, J); }
    // imperméable long, pans évasés et fendus
    P.tronc(35 + b, 51, 20, 32, 17.5, 34.5, 'manteau', { arrondi: 2, degrade: 0.3 });
    P.effacer(25, 48, 2, 4); P.rect(25, 47, 2, 1, 'manteau', 0);
    for (const y of [39, 42, 45]) P.px(27, y + b, 'respi', 3);
    P.rect(20, 44 + b, 12, 1, 'col', 1);
    P.tronc(32.5 + b, 36 + b, 20.5, 31.5, 20, 32, 'col'); // haut col
    const hx = 26, hy = 28 + b;
    P.boule(hx, hy - 0.5, 5.8, 5.6, 'capuche');
    P.boule(hx, hy + 0.8, 4.6, 4.2, 'peau');
    P.rect(hx - 5, hy - 3, 10, 2, 'capuche', 1); P.rect(hx - 2, hy - 3, 4, 2, 'metal', 3); for (const x of [-1, 0, 1]) P.px(hx + x, hy - 3, 'oeil', 1);
    shYeux(P, hx, hy, 'fente', { ecart: 2.2 });
    P.rect(hx - 5, hy + 2, 10, 1, 'tuyau', 1); // sangle du respirateur
    P.boule(hx, hy + 3.6, 2.7, 2.2, 'respi'); P.rect(hx - 1, hy + 3, 2, 2, 'oeil', 1); P.px(hx - 2, hy + 3, 'respi', 4); // cartouche et grille
    P.membre(hx + 2.5, hy + 4.5, hx + 6, hy + 8, 0.9, 'tuyau', { trait: false });
    if (att) { // tube épaulé, pointé vers l'avant
      shBras(P, 21, 37 + b, 24, 41, 28, 39, 'manteau');
      P.membre(22, 37, 41, 36, 1.4, 'bambou'); P.rect(27, 36, 1, 2, 'col', 1); P.rect(34, 35, 1, 2, 'col', 1); P.px(42, 36, 'eau', 3);
      shBras(P, 31, 37 + b, 33, 40, 34, 37, 'manteau');
    } else {
      shBras(P, 21, 37 + b, 19, 42 + b, 20, 45 + b, 'manteau');
      P.membre(28, 49, 38, 41, 1.3, 'bambou'); P.rect(33, 44, 1, 2, 'col', 1); P.px(38, 40, 'eau', 3);
      shBras(P, 31, 37 + b, 33, 42 + b, 33, 45, 'manteau');
    }
  },
};


// ENM_015 Instructeur déchu (invoque des poupées) — grand, vieux, cheveux gris en catogan, cicatrice, gilet
// d'instructeur déchiré ; ses doigts tiennent des fils de chakra. À l'attaque, mains levées, fils tendus vers le haut.
SHINOBI.instructeur_dechu = {
  pal: pal({ peau: '#e2b896', cheveux: '#a8a4ac', gilet: '#5e6a44', poche: '#4e5838', haut: '#2e3448', pantalon: '#2a2e3e', sandale: '#2e3a50', bandes: '#d8d0bc', cicatrice: '#b0685a' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', bandes: 'bandes', r: 1.6 };
    if (i) { shJambe(P, 24, 45, 23.5, 50, 23, 55, J); shJambe(P, 28, 45, 29, 50, 29.5, 54, J); }
    else { shJambe(P, 24, 45, 23.5, 50, 23, 54, J); shJambe(P, 28, 45, 29, 50, 29.5, 55, J); }
    P.membre(27, 26 + b, 30, 38, 1.8, 'cheveux', { trait: false }); // catogan dans le dos
    P.tronc(32.5 + b, 46, 20.5, 31.5, 21.5, 30.5, 'haut', { arrondi: 2 });
    P.tronc(33 + b, 45, 21, 31, 21, 31, 'gilet', { arrondi: 2 });
    P.effacer(25, 33 + b, 2, 9); P.rect(25, 33 + b, 2, 9, 'haut', 1); // gilet ouvert
    for (const x of [21.5, 27.5]) { P.rect(x, 37 + b, 3, 3, 'poche', 2); P.rect(x, 37 + b, 3, 1, 'gilet', 3); }
    for (const x of [21, 23, 26, 29]) P.effacer(x, 45, 1, 1); // bas déchiré
    const hx = 26, hy = 26 + b;
    P.boule(hx, hy - 0.5, 5.4, 5.2, 'cheveux');
    P.boule(hx + 0.3, hy + 1, 4.4, 4.3, 'peau');
    P.poly([[hx - 5, hy - 1], [hx - 1, hy - 4], [hx + 3, hy - 3], [hx + 5, hy], [hx + 5, hy - 5], [hx - 5, hy - 5]], 'cheveux', { niv: 3, trait: false });
    P.poly([[hx + 1, hy - 3], [hx + 4, hy + 2], [hx + 5, hy - 3]], 'cheveux', { niv: 2, trait: false }); // mèche sur l'œil
    shYeux(P, hx - 0.5, hy + 1, 'fente', { ecart: 2.2 });
    P.ligne(hx - 4, hy - 1, hx - 2, hy + 3, 'cicatrice', 2);
    P.rect(hx - 2, hy + 4, 4, 1, 'cheveux', 1); P.px(hx - 1, hy + 3, 'cheveux', 1); // barbe de trois jours
    const fils = '#c890ff';
    if (att) {
      shBras(P, 21, 35 + b, 18, 31, 19, 26, 'haut'); shBras(P, 31, 35 + b, 34, 31, 33, 26, 'haut');
      shFils(P, [[18, 25, 15, 13], [20, 25, 21, 12], [32, 25, 31, 12], [34, 25, 37, 13]], fils); shLueur(P, 19, 25, 2, '#a060f0', '#f0d8ff'); shLueur(P, 33, 25, 2, '#a060f0', '#f0d8ff');
    } else {
      shBras(P, 21, 35 + b, 18, 39 + b, 21, 41 + b, 'haut'); shBras(P, 31, 35 + b, 34, 39 + b, 31, 41 + b, 'haut');
      shFils(P, [[20, 42 + b, 18, 57], [22, 42 + b, 22, 57], [30, 42 + b, 30, 57], [32, 42 + b, 34, 57]], fils);
    }
  },
};

// ENM_017 Gardien des archives (lourd : frappe le sol, anneau de papier) — colosse au crâne rasé, robe brune
// constellée de talismans, chapelet de grosses perles, pile de rouleaux sanglée dans le dos ; poings levés pour frapper.
SHINOBI.gardien_archives = {
  pal: pal({ peau: '#c89070', robe: '#6a4a34', ceinture: '#d8c8a0', papier: '#f0e8d0', sceau: '#c8382a', perle: { c: '#7a3a2a', brille: true }, rouleau: '#e8dcb8', bout: '#a83a2a', sangle: '#4a3222', pantalon: '#4a3628', sandale: '#3a2a20' }),
  f(P, i, att) {
    const b = i;
    // pile de rouleaux sanglée dans le dos, plus haute que la tête
    for (const [y, l] of [[13, 15], [17, 17], [21, 19]]) { P.membre(26 - l / 2, y + b, 26 + l / 2, y + b, 2.2, 'rouleau'); P.boule(26 - l / 2, y + b, 1.5, 2.2, 'bout'); P.boule(26 + l / 2, y + b, 1.5, 2.2, 'bout'); }
    P.rect(25, 11 + b, 2, 14, 'sangle', 1);
    const J = { k: 'pantalon', r: 2.6, kp: 'sandale' };
    if (i) { shJambe(P, 21, 46, 18.5, 50, 18, 55, J); shJambe(P, 31, 46, 33.5, 50, 34, 54, J); }
    else { shJambe(P, 21, 46, 18.5, 50, 18, 54, J); shJambe(P, 31, 46, 33.5, 50, 34, 55, J); }
    P.tronc(29 + b, 49, 14, 38, 15, 37, 'robe', { arrondi: 4, degrade: 0.2 });
    P.rect(15, 42 + b, 22, 3, 'ceinture', 2); P.rect(15, 44 + b, 22, 1, 'ceinture', 1);
    for (const [x, y] of [[17, 33], [31, 35], [21, 47], [33, 46]]) { P.piece().rect(x, y + b, 3, 4, 'papier', 3).px(x + 1, y + 1 + b, 'sceau', 2).px(x + 1, y + 2 + b, 'sceau', 2).traitPiece(); }
    for (let k = 0; k < 9; k++) { const a = Math.PI * (0.1 + 0.8 * k / 8); P.boule(26 + Math.cos(a) * 6.5, 30.5 + b + Math.sin(a) * 4.5, 1, 1, 'perle', { trait: false }); } // chapelet
    const hx = 26, hy = 25 + b;
    P.boule(hx, hy, 4.8, 4.6, 'peau'); P.px(hx, hy - 3, 'sceau', 2);
    shYeux(P, hx, hy + 0.5, 'fente', { ecart: 2 }); P.rect(hx - 1, hy + 3, 3, 1, 'robe', 0);
    if (att) { shBras(P, 15, 32 + b, 11, 24, 15, 16, 'robe', 'peau', { r: 2.4, rm: 2.8 }); shBras(P, 37, 32 + b, 41, 24, 37, 16, 'robe', 'peau', { r: 2.4, rm: 2.8 }); }
    else { shBras(P, 15, 32 + b, 11, 39 + b, 12, 46 + b, 'robe', 'peau', { r: 2.4, rm: 2.8 }); shBras(P, 37, 32 + b, 41, 39 + b, 40, 46 + b, 'robe', 'peau', { r: 2.4, rm: 2.8 }); }
  },
};

// ENM_018 Genin fonceur (charge en ligne) — trapu, épaules énormes, tête rentrée dans un casque rembourré,
// gantelets de fer en avant ; à l'attaque il se ramasse, tête baissée, vapeur au casque.
SHINOBI.genin_fonceur = {
  pal: pal({ peau: '#e0b08a', casque: '#a8482e', gilet: '#b8563a', pantalon: '#3e3238', sandale: '#2e2a34', fer: { c: '#8a90a0', brille: true }, sangle: '#5a3a2a' }),
  f(P, i, att) {
    const b = i, d = att ? 2 : 0;
    const J = { k: 'pantalon', r: 2.2, pied: 'botte', kp: 'sandale' };
    if (i) { shJambe(P, 22, 48, 20, 51, 19.5, 55, J); shJambe(P, 30, 48, 32, 51, 33, 54, J); }
    else { shJambe(P, 22, 48, 20, 51, 19.5, 54, J); shJambe(P, 30, 48, 32, 51, 33, 55, J); }
    P.tronc(36 + b + d, 49, 17, 35, 19, 33, 'gilet', { arrondi: 3 });
    P.rect(19, 46, 14, 2, 'sangle', 1);
    for (let y = 39; y < 46; y += 3) P.rect(20, y + b + d, 12, 1, 'gilet', 1); // rembourrage
    P.boule(17.5, 37 + b + d, 3.6, 3.2, 'fer'); P.boule(34.5, 37 + b + d, 3.6, 3.2, 'fer'); // épaulières
    const hx = 26, hy = 34 + b + d;
    P.boule(hx, hy, 5, 4.6, 'peau');
    P.boule(hx, hy - 2.2, 5.6, 4, 'casque'); P.rect(hx - 6, hy - 1, 2, 4, 'casque', 1); P.rect(hx + 4, hy - 1, 2, 4, 'casque', 2);
    P.rect(hx - 3, hy - 2, 6, 2, 'fer', 3); P.px(hx - 3, hy - 2, 'fer', 4);
    shYeux(P, hx, hy + 1, 'fente', { ecart: 2 }); P.rect(hx - 2, hy + 3, 4, 1, 'oeil', 1);
    P.rect(hx - 4, hy + 3, 1, 2, 'sangle', 1); P.rect(hx + 3, hy + 3, 1, 2, 'sangle', 1);
    if (att) { shBras(P, 18, 39 + b + d, 21, 45, 24, 46, 'gilet', 'fer', { r: 2, rm: 2.8 }); shBras(P, 34, 39 + b + d, 31, 45, 29, 46, 'gilet', 'fer', { r: 2, rm: 2.8 });
      P.apres(g => { g.fillStyle = 'rgba(240,240,250,0.85)'; for (const [x, y] of [[17, 28], [19, 26], [33, 27], [35, 25], [16, 25]]) g.fillRect(x - SH.X + 26, y, 2, 1); }); }
    else { shBras(P, 18, 39 + b, 16, 44 + b, 19, 47 + b, 'gilet', 'fer', { r: 2, rm: 2.8 }); shBras(P, 34, 39 + b, 36, 44 + b, 33, 47 + b, 'gilet', 'fer', { r: 2, rm: 2.8 }); }
  },
};

// ENM_019 Invocateur d'herbes hautes (invoque des serpents) — drapé d'un manteau d'herbes, large chapeau de paille
// hérissé, visage dans l'ombre aux yeux jaunes, serpent violet sur les épaules, bâton noueux.
SHINOBI.invocateur_herbes = {
  pal: pal({ herbe: '#6a8a3a', herbe2: '#4a6a2a', paille: '#c8a860', ombre: '#2a2420', serpent: '#7a4a9a', ventre: '#d8c8a0', langue: '#e03a3a', baton: '#6a4a2a', oeilj: '#f0e040', pantalon: '#3a3a2a', sandale: '#3a3424' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.6 };
    if (i) { shJambe(P, 24, 47, 23.5, 51, 23, 55, J); shJambe(P, 28, 47, 28.5, 51, 29, 54, J); }
    else { shJambe(P, 24, 47, 23.5, 51, 23, 54, J); shJambe(P, 28, 47, 28.5, 51, 29, 55, J); }
    if (att) P.membre(16, 49, 14, 18, 1.2, 'baton'); else P.membre(16, 55, 15, 26 + b, 1.2, 'baton'); // bâton
    P.boule(att ? 14 : 15, att ? 17 : 25 + b, 1.8, 1.8, 'baton');
    // manteau d'herbes : franges verticales
    P.tronc(32 + b, 50, 19, 33, 16, 36, 'herbe', { arrondi: 3 });
    P.piece(); for (let x = 17; x < 36; x += 2) P.ligne(x, 40 + b + (x % 4 ? 0 : 2), x + (x < 26 ? -1 : 1), 50, 'herbe2', 1); for (let x = 17; x < 36; x += 3) P.px(x, 51 - (x % 2), 'herbe', 3);
    P.traitPiece();
    // serpent autour des épaules
    P.membre(18, 35 + b, 26, 38 + b, 1.4, 'serpent'); P.membre(26, 38 + b, 34, 35 + b, 1.4, 'serpent');
    const sx = att ? 36 : 35, sy = att ? 27 : 31 + b; P.membre(34, 35 + b, sx, sy, 1.3, 'serpent'); P.boule(sx + 0.5, sy - 1, 2, 1.6, 'serpent'); P.px(sx + 1, sy - 1.5, 'oeilj', 3); P.ligne(sx + 2, sy, sx + 4, sy + (att ? -1 : 0), 'langue', 2);
    // chapeau de paille large et hérissé, visage dans l'ombre
    const hx = 26, hy = 28 + b;
    P.boule(hx, hy + 1, 4.6, 4.4, 'ombre');
    P.poly([[hx - 11, hy - 1], [hx, hy - 7], [hx + 11, hy - 1], [hx + 10, hy + 1], [hx - 10, hy + 1]], 'paille', { relief: true });
    P.piece(); for (let x = hx - 9; x <= hx + 9; x += 3) P.ligne(x, hy, x + (x < hx ? 1 : -1), hy - 4 + Math.abs(x - hx) * 0.4, 'paille', 1); P.traitPiece();
    for (const [x, h] of [[-3, 4], [0, 5], [3, 3]]) P.ligne(hx + x, hy - 7, hx + x + (x > 0 ? 1 : x < 0 ? -1 : 0), hy - 7 - h, 'herbe', 3);
    shYeux(P, hx, hy + 2, 'lueur', { ecart: 2, k: 'oeilj' });
    if (att) shLueur(P, 14, 17, 2, '#a060f0', '#f0d8ff');
  },
};


// ── Chapitre II : Suna, ateliers de marionnettes ──
// ENM_033 Ninja de Suna à l'éventail (lames de vent en éventail) — grande, tunique de sable à ceinture turquoise,
// foulard et voile ; l'éventail géant, fermé en marchant, s'ouvre en demi-roue pour frapper.
SHINOBI.suna_eventail = {
  pal: pal({ peau: '#e8b890', tunique: '#d8c49a', foulard: '#c8b088', voile: '#ece0c4', ceinture: '#2a9a8a', pantalon: '#6a5a44', sandale: '#5a4630', eventail: '#f0ece0', eventail2: '#2a9a8a', manche: '#6a4a2a', cheveux: '#3a2a22' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.5 };
    if (i) { shJambe(P, 24, 46, 23.5, 51, 23, 55, J); shJambe(P, 28, 46, 28.5, 51, 29, 54, J); }
    else { shJambe(P, 24, 46, 23.5, 51, 23, 54, J); shJambe(P, 28, 46, 28.5, 51, 29, 55, J); }
    if (!att) { P.membre(18, 52, 20, 27 + b, 1.6, 'manche'); for (let y = 30; y < 50; y += 3) P.rect(18.5 + (y - 30) * -0.05, y + b * (y < 40 ? 1 : 0), 3, 1, 'eventail2', 2); P.boule(20, 26 + b, 1.6, 1.6, 'eventail2'); } // éventail fermé, porté comme un bâton
    P.tronc(34.5 + b, 49, 21, 31, 19.5, 32.5, 'tunique', { arrondi: 2, degrade: 0.15 });
    P.effacer(28, 46, 1, 4); // fente de la tunique
    P.rect(21, 41 + b, 10, 2, 'ceinture', 2); P.rect(29, 43 + b, 2, 4, 'ceinture', 1);
    const hx = 26, hy = 28 + b;
    P.boule(hx, hy - 0.5, 5.4, 5.4, 'foulard'); P.poly([[hx - 5, hy], [hx - 7, hy + 7], [hx - 3, hy + 4]], 'foulard', { niv: 1 });
    P.boule(hx, hy + 1, 4.3, 4, 'peau');
    shBandeau(P, hx, hy - 3, 5, 'foulard', { plaque: 4 });
    P.tronc(hy + 2, hy + 5, hx - 4.5, hx + 4.5, hx - 3.5, hx + 3.5, 'voile');
    shYeux(P, hx, hy + 0.5, 'fente', { ecart: 2.1 }); P.px(hx - 4, hy + 0.5, 'oeil', 1); P.px(hx + 3, hy + 0.5, 'oeil', 1); // khôl
    shBras(P, 21, 36 + b, 19, 41 + b, 20, 44 + b, 'tunique');
    if (att) { shEventail(P, 33, 40, 15, -2.4, 0.15, 7, 'eventail', 'eventail2'); shBras(P, 31, 36 + b, 33, 39, 33, 40, 'tunique'); }
    else shBras(P, 31, 36 + b, 33, 41 + b, 32, 44 + b, 'tunique');
  },
};

// ENM_036 Lanceur de jarres (tire en cloche) — petit porteur voûté sous une énorme jarre sanglée, turban blanc,
// grosse moustache ; à l'attaque, il brandit une jarrette au-dessus de sa tête.
SHINOBI.lanceur_jarres = {
  pal: pal({ peau: '#c88a5a', turban: '#ece4d4', jarre: '#b86a44', bouchon: '#6a4a36', moustache: '#2a1e18', gilet: '#6a4a2e', pantalon: '#a08050', sandale: '#4a3424', sangle: '#4a3020' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 2, kp: 'sandale' };
    // la grande jarre dans le dos, par-dessus l'épaule
    P.boule(22, 33 + b, 8.5, 9, 'jarre'); P.boule(22, 23.5 + b, 3.6, 1.6, 'bouchon'); P.rect(15, 31 + b, 14, 1, 'jarre', 1); P.rect(16, 36 + b, 12, 1, 'jarre', 3);
    if (i) { shJambe(P, 24, 47, 22, 51, 21.5, 55, J); shJambe(P, 30, 47, 31.5, 51, 32, 54, J); }
    else { shJambe(P, 24, 47, 22, 51, 21.5, 54, J); shJambe(P, 30, 47, 31.5, 51, 32, 55, J); }
    P.poly([[23, 38 + b], [33, 36 + b], [34, 48], [23, 48]], 'gilet', { cyl: true }); // buste voûté vers l'avant
    P.ligne(24, 37 + b, 30, 47, 'sangle', 1); P.ligne(23, 41 + b, 33, 40 + b, 'sangle', 1);
    const hx = 31, hy = 33 + b; // tête basse, en avant
    P.boule(hx, hy, 4.4, 4.2, 'peau');
    P.boule(hx - 0.3, hy - 2.6, 5, 3, 'turban'); P.rect(hx - 4, hy - 3, 8, 1, 'turban', 1); P.px(hx + 4, hy - 1, 'turban', 2);
    shYeux(P, hx + 0.5, hy, 'points', { ecart: 1.8 });
    P.poly([[hx - 3, hy + 2], [hx + 4, hy + 2], [hx + 5, hy + 4], [hx + 1, hy + 3], [hx - 4, hy + 4]], 'moustache', { niv: 2 });
    if (att) { shBras(P, 33, 38 + b, 36, 32, 35, 26, 'peau', 'peau', { r: 1.7 }); P.boule(35, 22, 3, 3.2, 'jarre'); P.rect(34, 18.5, 3, 1.5, 'bouchon', 2); }
    else shBras(P, 33, 38 + b, 36, 42 + b, 34, 45 + b, 'peau', 'peau', { r: 1.7 });
    shBras(P, 24, 39 + b, 25, 43 + b, 27, 44 + b, 'peau', 'peau', { r: 1.7 });
  },
};

// ENM_038 Marionnettiste caché (ses marionnettes tombent à sa mort) — maigre, voûté sous une capuche violette,
// visage peint, coffre à marionnette sanglé dans le dos ; dix fils de chakra partent de ses doigts levés.
SHINOBI.marionnettiste = {
  pal: pal({ peau: '#e8dcd0', cape: '#4a2e58', cape2: '#3a2246', peinture: '#7a3a9a', coffre: '#9a7a54', bandes: '#ddd4c0', pantalon: '#2e2434', sandale: '#2e2434' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.4 };
    P.tronc(24 + b, 40 + b, 16, 30, 16, 30, 'coffre', { arrondi: 1 }); for (const y of [28, 34]) P.rect(16, y + b, 14, 2, 'bandes', 2); // coffre dans le dos
    if (i) { shJambe(P, 24.5, 47, 24, 51, 23.5, 55, J); shJambe(P, 28.5, 47, 29, 51, 29.5, 54, J); }
    else { shJambe(P, 24.5, 47, 24, 51, 23.5, 54, J); shJambe(P, 28.5, 47, 29, 51, 29.5, 55, J); }
    P.poly([[21, 34 + b], [32, 33 + b], [35, 50], [19, 50]], 'cape', { cyl: true }); // cape voûtée
    for (const x of [20, 24, 29, 33]) P.px(x, 50, 'cape2', 1);
    const hx = 28, hy = 31 + b;
    P.poly([[hx - 6, hy + 4], [hx - 5, hy - 5], [hx, hy - 8], [hx + 5, hy - 4], [hx + 7, hy + 3]], 'cape2', { cyl: true }); // capuche tombante
    P.boule(hx + 0.6, hy + 0.8, 3.8, 3.8, 'peau');
    P.rect(hx - 3, hy - 2, 8, 2, 'cape2', 0);
    shYeux(P, hx + 0.6, hy + 0.5, 'fente', { ecart: 1.8 }); P.ligne(hx - 2, hy + 1, hx - 1, hy + 4, 'peinture', 2); P.ligne(hx + 3, hy + 1, hx + 2, hy + 4, 'peinture', 2); P.rect(hx, hy + 3, 2, 1, 'peinture', 2);
    const f = 'rgba(130,230,255,0.8)';
    if (att) { shBras(P, 23, 37 + b, 19, 32, 18, 27, 'cape'); shBras(P, 33, 37 + b, 37, 32, 37, 27, 'cape'); shFils(P, [[17, 26, 13, 12], [18, 26, 17, 12], [19, 26, 21, 13], [36, 26, 34, 13], [37, 26, 38, 12], [38, 26, 42, 12]], f); }
    else { shBras(P, 23, 37 + b, 20, 39 + b, 21, 36 + b, 'cape'); shBras(P, 33, 37 + b, 37, 38 + b, 37, 35 + b, 'cape'); shFils(P, [[20, 35 + b, 17, 22], [21, 35 + b, 21, 21], [36, 34 + b, 35, 21], [38, 34 + b, 40, 22]], f); }
  },
};

// ENM_040 Ninja du Son (ondes sonores visées) — dos rond, manteau à col de fourrure, visage bandé sauf un œil,
// corde violette nouée à la taille, gantelet d'acier percé d'évents ; à l'attaque, il braque le gantelet.
SHINOBI.ninja_son = {
  pal: pal({ peau: '#d8b090', bandes: '#e0d8c4', fourrure: '#8a7a68', manteau: '#5a5458', corde: '#7a4aa0', pantalon: '#3a3640', sandale: '#2e2a34', gantelet: { c: '#9aa0ac', brille: true }, onde: '#e0c8ff' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.7, bandes: 'bandes' };
    if (i) { shJambe(P, 23.5, 47, 22.5, 51, 22, 55, J); shJambe(P, 28.5, 47, 29.5, 51, 30, 54, J); }
    else { shJambe(P, 23.5, 47, 22.5, 51, 22, 54, J); shJambe(P, 28.5, 47, 29.5, 51, 30, 55, J); }
    P.poly([[19, 36 + b], [32, 35 + b], [33, 49], [19, 49]], 'manteau', { cyl: true });
    P.piece(); P.rect(19, 44 + b, 14, 2, 'corde', 2); for (let x = 19; x < 33; x += 2) P.px(x, 44 + b, 'corde', 3); P.rect(18, 45 + b, 2, 4, 'corde', 1); P.traitPiece(); // corde nouée
    P.boule(25.5, 35 + b, 8, 3.2, 'fourrure'); for (let x = 19; x < 33; x += 2) P.px(x, 37 + b + (x % 4 ? 1 : 0), 'fourrure', 1); // col de fourrure
    const hx = 26.5, hy = 30 + b;
    P.boule(hx, hy, 5, 4.8, 'bandes');
    P.piece(); for (let y = -3; y <= 3; y += 2) P.ligne(hx - 4.5, hy + y, hx + 4.5, hy + y - 1, 'bandes', 1); P.traitPiece();
    P.rect(hx - 3.5, hy - 1, 3, 2, 'peau', 2); P.rect(hx - 3, hy, 2, 1, 'oeil', 2); P.px(hx - 3, hy - 1, 'oeil', 2); // un seul œil
    P.rect(hx + 3, hy - 6, 1, 3, 'pantalon', 2); P.rect(hx - 1, hy - 7, 2, 3, 'pantalon', 2); // mèches
    shBras(P, 20, 38 + b, 18, 43 + b, 19, 46 + b, 'manteau');
    if (att) { shBras(P, 32, 38 + b, 35, 37, 38, 36, 'manteau', 'gantelet', { rm: 0.1, main: false }); P.membre(36, 36, 42, 35, 2.6, 'gantelet'); for (const x of [38, 40]) P.px(x, 34, 'oeil', 1).px(x, 36, 'oeil', 1);
      P.apres(g => { g.globalAlpha = 0.9; for (const r of [3, 6]) { g.drawImage(anneau(r, 1, '#e0c8ff'), 44 - r - 1 + SH.X - 26, 35 - r - 1); } g.globalAlpha = 1; g.fillStyle = 'rgba(0,0,0,0)'; }); }
    else { shBras(P, 32, 38 + b, 34, 42 + b, 34, 45 + b, 'manteau', 'gantelet', { main: false }); P.membre(34, 43 + b, 34, 48 + b, 2.5, 'gantelet'); for (const y of [45, 47]) P.px(33, y + b, 'oeil', 1).px(35, y + b, 'oeil', 1); }
  },
};

// ENM_041 Poseur de sceaux de sable (pose des parchemins piégés) — petit, accroupi, foulard de sable et grosses
// lunettes orange, besace qui déborde d'étiquettes ; une étiquette à la main, prête à être posée.
SHINOBI.poseur_sable = {
  pal: pal({ peau: '#c88a60', foulard: '#d0b484', lunettes: { c: '#f08a30', brille: true }, monture: '#4a3a2a', tunique: '#a88a5a', pantalon: '#7a6444', sandale: '#4a3828', besace: '#7a5432', papier: '#f4ecd8', sceau: '#c8382a', bandes: '#e0d6c0' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.8 };
    // accroupi : genoux hauts
    if (i) { shJambe(P, 23, 48, 19.5, 47, 20, 55, J); shJambe(P, 29, 48, 33, 48, 32, 54, J); }
    else { shJambe(P, 23, 48, 19.5, 48, 20, 54, J); shJambe(P, 29, 48, 33, 47, 32, 55, J); }
    P.boule(18, 47 + b, 4, 3.6, 'besace'); for (const [x, y] of [[16, 43], [18, 42], [20, 43]]) P.rect(x, y + b, 2, 3, 'papier', 3); P.px(18, 43 + b, 'sceau', 2);
    P.tronc(39 + b, 49, 21, 31, 20.5, 31.5, 'tunique', { arrondi: 2 });
    P.boule(26, 39 + b, 5.6, 2.4, 'foulard');
    const hx = 26, hy = 33 + b;
    P.boule(hx, hy, 5.2, 5, 'foulard');
    P.boule(hx, hy + 1.3, 3.8, 3.2, 'peau');
    P.tronc(hy + 2.5, hy + 5, hx - 5, hx + 5, hx - 4, hx + 4, 'foulard');
    for (const x of [-2.6, 2.6]) { P.boule(hx + x, hy + 0.5, 2.1, 1.9, 'monture'); P.boule(hx + x, hy + 0.5, 1.4, 1.2, 'lunettes'); }
    shBras(P, 21, 41 + b, 22, 45 + b, 24, 47 + b, 'peau', 'peau', { r: 1.5 });
    shBras(P, 31, 41 + b, 35, 45 + b, 37, 50 + b, 'peau', 'peau', { r: 1.5 }); P.rect(36, 51 + b, 3, 4, 'papier', 3); P.px(37, 52 + b, 'sceau', 2).px(37, 53 + b, 'sceau', 2);
  },
};

// ENM_043 Médecin de Suna (soigne ses alliés, fuit) — vieil homme en longue robe à capuche, barbiche blanche,
// gourde de remèdes à la hanche, bâton à clochettes ; les mains s'illuminent de vert pour soigner.
SHINOBI.medecin_suna = {
  pal: pal({ peau: '#d8a880', robe: '#e6dcc4', liseré: '#7a8a4a', barbe: '#f4f0e8', gourde: '#b8743a', baton: '#7a5634', clochette: { c: '#e0c050', brille: true }, sandale: '#5a4430', pantalon: '#8a7a60' }),
  f(P, i, att) {
    const b = i;
    P.membre(16, 55, 16, 26, 1.1, 'baton'); P.boule(16, 25, 1.6, 1.6, 'baton'); for (const y of [28, 31]) P.boule(15, y + b, 1.1, 1.1, 'clochette');
    P.tronc(34 + b, 54, 20.5, 31.5, 18, 34, 'robe', { arrondi: 2, degrade: 0.2 });
    P.rect(18, 53, 16, 1, 'liseré', 2); P.rect(25.5, 35 + b, 1, 19, 'liseré', 1);
    P.boule(19 + (i ? 1 : 0), 55, 2.2, 1.2, 'sandale'); P.boule(32 - (i ? 0 : 1), 55, 2.2, 1.2, 'sandale');
    P.boule(31.5, 46 + b, 2.2, 2.6, 'gourde'); P.rect(31, 43 + b, 1, 1, 'baton', 2);
    const hx = 26, hy = 28 + b;
    P.boule(hx, hy - 0.5, 5.6, 5.6, 'robe'); P.rect(hx - 5, hy - 2, 10, 1, 'liseré', 2);
    P.boule(hx, hy + 1, 4.2, 4, 'peau');
    shYeux(P, hx, hy + 0.5, 'points', { ecart: 2 }); P.rect(hx - 3, hy - 1, 2, 1, 'barbe', 3); P.rect(hx + 1, hy - 1, 2, 1, 'barbe', 3);
    P.poly([[hx - 2.5, hy + 3], [hx + 2.5, hy + 3], [hx, hy + 8]], 'barbe', { niv: 3 });
    if (att) { shBras(P, 21, 36 + b, 18, 33, 19, 29, 'robe'); shBras(P, 31, 36 + b, 34, 33, 33, 29, 'robe'); shLueur(P, 19, 29, 3, '#5ae080', '#e8ffe8'); shLueur(P, 33, 29, 3, '#5ae080', '#e8ffe8'); }
    else { shBras(P, 21, 36 + b, 18, 40 + b, 17, 38 + b, 'robe'); shBras(P, 31, 36 + b, 33, 40 + b, 31, 43 + b, 'robe'); shLueur(P, 31, 43 + b, 2, '#5ae080', '#e8ffe8'); }
  },
};


// ── Chapitre III : laboratoires, canaux de Kiri ──
// ENM_052 Porteur du sceau maudit (lourd, s'enrage) — brute torse nu, crête violette, marques noires en flammes
// qui gagnent la peau, corde violette ; à l'attaque, poings joints au-dessus de la tête, marques rougeoyantes.
SHINOBI.porteur_sceau = {
  pal: pal({ peau: '#d49a70', marque: '#2a1430', marque2: '#a03ad0', cheveux: '#5a2a7a', corde: '#7a4aa0', pantalon: '#3a2e44', sandale: '#2a2430', bandes: '#e0d6c4' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 2.4, bandes: 'bandes' };
    if (i) { shJambe(P, 21.5, 46, 19, 50, 18.5, 55, J); shJambe(P, 30.5, 46, 33, 50, 33.5, 54, J); }
    else { shJambe(P, 21.5, 46, 19, 50, 18.5, 54, J); shJambe(P, 30.5, 46, 33, 50, 33.5, 55, J); }
    P.tronc(32 + b, 47, 14.5, 37.5, 19, 33, 'peau', { arrondi: 4 }); // torse en V
    P.rect(19, 44 + b, 14, 3, 'corde', 2); for (let x = 19; x < 33; x += 2) P.px(x, 44 + b, 'corde', 3);
    const mk = att ? 'marque2' : 'marque'; // marques en flammes depuis le cou
    P.piece(); for (const [x0, y0, x1, y1] of [[23, 33, 19, 37], [19, 37, 20, 40], [29, 33, 33, 36], [33, 36, 31, 41], [24, 35, 23, 40], [16, 34, 15, 38]]) P.ligne(x0, y0 + b, x1, y1 + b, mk, 1);
    P.poly([[21, 33 + b], [26, 37 + b], [31, 33 + b]], mk, { niv: 2, trait: false });
    const hx = 26, hy = 27 + b;
    P.boule(hx, hy, 4.4, 4.6, 'peau');
    shPointes(P, hx, hy, 4.6, 'cheveux', [[-12, 4, 3], [0, 5, 3], [14, 4, 3]]);
    shYeux(P, hx, hy + 0.5, att ? 'lueur' : 'fente', { ecart: 2, k: att ? 'marque2' : 'oeil' }); P.rect(hx - 2, hy + 3, 4, 1, 'marque', 1); P.px(hx - 2, hy + 2, 'blanc', 3); P.px(hx + 1, hy + 2, 'blanc', 3);
    P.ligne(hx - 3, hy - 2, hx - 4, hy + 3, mk, 1);
    const B = { r: 2.6, rm: 3, kav: 'peau' };
    if (att) { shBras(P, 16, 34 + b, 14, 26, 21, 19, 'peau', 'peau', B); shBras(P, 36, 34 + b, 38, 26, 31, 19, 'peau', 'peau', B); P.boule(26, 18, 3.6, 3, 'peau'); }
    else { shBras(P, 16, 34 + b, 12, 40 + b, 13, 46 + b, 'peau', 'peau', B); shBras(P, 36, 34 + b, 40, 40 + b, 39, 46 + b, 'peau', 'peau', B); for (const x of [13, 39]) P.rect(x - 2, 42 + b, 4, 1, 'bandes', 3); }
  },
};

// ENM_053 Zetsu blanc (surgit du sol et poursuit) — créature végétale blanche et lisse, longiligne, petits yeux noirs
// brillants, sourire trop large, deux pousses sur le crâne ; des racines grimpent encore à ses jambes.
// Le Zetsu de l'armée (ENM_070) et le Zetsu soigneur (ENM_081) partagent la tête, pas le reste.
function teteZetsu(P, hx, hy, o = {}) {
  P.boule(hx, hy, 5.4, 6, 'peau');
  P.assombrir(Math.round(hx + 3), Math.round(hy - 2), 3, 7, 1);
  for (const c of [-1, 1]) { P.rect(hx + c * 2.4 - 1, hy - 0.5, 2, 2, 'oeil', 2); P.px(hx + c * 2.4 - 1, hy - 0.5, 'blanc', 4); }
  P.ligne(hx - 3.5, hy + 2.5, hx - 1.5, hy + 3.5, 'oeil', 2); P.ligne(hx - 1.5, hy + 3.5, hx + 1.5, hy + 3.5, 'oeil', 2); P.ligne(hx + 1.5, hy + 3.5, hx + 3.5, hy + 2.5, 'oeil', 2);
  if (o.pousses !== false) { P.ligne(hx - 1, hy - 6, hx - 2, hy - 8, 'tige', 2); P.boule(hx - 3, hy - 8.5, 1.6, 1, 'feuille'); P.ligne(hx + 1, hy - 6, hx + 2, hy - 9, 'tige', 2); P.boule(hx + 3.2, hy - 9.5, 1.8, 1.1, 'feuille'); }
}
const PAL_ZETSU = { peau: '#eeeee4', ombre: '#c8c8c0', racine: '#7a6a44', terre: '#5a4a34', tige: '#5a8a3a', feuille: '#7ac04a' };
SHINOBI.zetsu_blanc = {
  pal: pal(PAL_ZETSU),
  f(P, i, att) {
    const b = i;
    P.boule(26, 55, 7, 1.8, 'terre');
    const J = { k: 'peau', kp: 'racine', pied: 'nu', r: 1.4 };
    if (i) { shJambe(P, 24, 45, 23, 50, 22.5, 55, J); shJambe(P, 28, 45, 29, 50, 29.5, 54, J); }
    else { shJambe(P, 24, 45, 23, 50, 22.5, 54, J); shJambe(P, 28, 45, 29, 50, 29.5, 55, J); }
    P.piece(); for (const [x0, y0, x1, y1] of [[21, 55, 23, 49], [23, 49, 22, 46], [31, 55, 29, 50], [29, 50, 30, 47], [19, 55, 18, 53], [33, 55, 35, 53]]) P.ligne(x0, y0, x1, y1, 'racine', 2); P.traitPiece();
    P.tronc(35 + b, 46, 21, 31, 22.5, 29.5, 'peau', { arrondi: 2 });
    teteZetsu(P, 27, 29 + b);
    if (att) { shBras(P, 22, 37 + b, 18, 31, 17, 25, 'peau', 'peau', { r: 1.3 }); shBras(P, 30, 37 + b, 35, 31, 37, 25, 'peau', 'peau', { r: 1.3 }); }
    else { shBras(P, 22, 37 + b, 19, 43 + b, 19, 49 + b, 'peau', 'peau', { r: 1.3 }); shBras(P, 30, 37 + b, 33, 43 + b, 34, 48 + b, 'peau', 'peau', { r: 1.3 }); }
  },
};

// ENM_055 Garde du Son (rapide au contact) — griffes d'acier aux deux mains, cheveux hirsutes sur un œil,
// gilet à fourrure et corde violette ; penché, griffes en avant.
SHINOBI.garde_son = {
  pal: pal({ peau: '#dcae88', cheveux: '#2a2430', gilet: '#4e4a52', fourrure: '#9a8a74', corde: '#7a4aa0', pantalon: '#34303a', sandale: '#2a2630', bandes: '#ddd4c0', griffe: { c: '#c8d0dc', brille: true } }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.7, bandes: 'bandes' };
    if (i) { shJambe(P, 24, 46, 21.5, 50, 21, 55, J); shJambe(P, 28, 46, 31, 49, 32, 53, J); }
    else { shJambe(P, 24, 46, 21, 49, 19, 53, J); shJambe(P, 28, 46, 30, 50, 30.5, 55, J); }
    const griffes = (x, y, d) => { for (const k of [-1, 0, 1]) P.ligne(x, y + k, x + d * 5, y + k * 2 - 2, 'griffe', 3); };
    shBras(P, 23, 37 + b, 20, 41 + b, 22, 44 + b, 'peau'); griffes(22, 45 + b, 1);
    P.poly([[21, 36 + b], [31, 35 + b], [31, 47], [22, 47]], 'gilet', { cyl: true });
    P.rect(22, 44, 9, 2, 'corde', 2); P.px(22, 46, 'corde', 1);
    P.boule(26.5, 36 + b, 5.5, 2.2, 'fourrure');
    const hx = 29, hy = 29 + b;
    shPointes(P, hx, hy, 5.6, 'cheveux', [[-80, 5], [-50, 6], [-20, 5], [10, 4], [40, 3]]);
    P.boule(hx, hy, 5.2, 5, 'peau');
    P.poly([[hx - 5.5, hy - 1], [hx - 3, hy - 6], [hx + 4, hy - 6], [hx + 6, hy - 2], [hx + 3, hy + 2], [hx + 1, hy - 2], [hx - 2, hy - 1]], 'cheveux', { niv: 2, trait: false }); // mèche sur un œil
    P.rect(hx - 3, hy + 1, 2, 1, 'oeil', 2); P.px(hx - 3, hy, 'oeil', 2);
    P.ligne(hx - 2, hy + 3, hx + 2, hy + 4, 'oeil', 1); P.px(hx, hy + 4, 'blanc', 3);
    if (att) { shBras(P, 31, 37 + b, 35, 37, 38, 36, 'peau'); griffes(39, 37, 1); }
    else { shBras(P, 31, 37 + b, 34, 41 + b, 36, 41 + b, 'peau'); griffes(37, 42 + b, 1); }
  },
};

// ENM_056 Tireur du Son (tirs visés) — grand et maigre, long manteau violet à haut col, cheveux longs sur les yeux,
// grande corne de chasse en bandoulière ; à l'attaque, il porte la corne à la bouche et vise.
SHINOBI.tireur_son = {
  pal: pal({ peau: '#e0c0a8', cheveux: '#c8b8d8', manteau: '#5a3a6e', col: '#3e2850', corde: '#8a5ab0', corne: { c: '#e8d8b0', brille: true }, pavillon: { c: '#c8a050', brille: true }, pantalon: '#2e2836', sandale: '#2e2836' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.4, pied: 'botte', kp: 'sandale' };
    if (i) { shJambe(P, 24, 46, 24, 51, 23.5, 55, J); shJambe(P, 28, 46, 28.5, 51, 29, 54, J); }
    else { shJambe(P, 24, 46, 24, 51, 23.5, 54, J); shJambe(P, 28, 46, 28.5, 51, 29, 55, J); }
    P.tronc(33 + b, 51, 21, 31, 19.5, 32.5, 'manteau', { arrondi: 2, degrade: 0.2 }); P.effacer(25, 48, 2, 4);
    P.rect(21, 43 + b, 10, 2, 'corde', 2);
    P.tronc(30 + b, 34 + b, 21, 31, 20.5, 31.5, 'col');
    const hx = 26, hy = 25 + b;
    P.boule(hx, hy, 5, 5.2, 'cheveux'); P.tronc(hy, hy + 10, hx - 5.5, hx + 5.5, hx - 6, hx + 6, 'cheveux'); // cheveux longs
    P.boule(hx, hy + 1.5, 3.6, 3.8, 'peau');
    P.poly([[hx - 4, hy - 2], [hx + 4, hy - 2], [hx + 3, hy + 2], [hx + 1, hy], [hx - 1, hy + 2], [hx - 3, hy]], 'cheveux', { niv: 3, trait: false });
    P.px(hx - 2, hy + 2, 'oeil', 2); P.rect(hx - 1, hy + 4, 2, 1, 'col', 1);
    if (att) { P.membre(hx + 1, hy + 4, 38, 30, 1.2, 'corne'); P.boule(39.5, 29, 2.6, 3.2, 'pavillon'); P.px(40, 29, 'oeil', 1);
      shBras(P, 21, 35 + b, 24, 38, 28, 33, 'manteau'); shBras(P, 31, 35 + b, 34, 36, 35, 31, 'manteau');
      P.apres(g => { g.globalAlpha = 0.85; for (const r of [2, 5]) g.drawImage(anneau(r, 1, '#e8d0ff'), 44 - r - 1, 29 - r - 1); g.globalAlpha = 1; }); }
    else { P.ligne(21, 34 + b, 32, 45 + b, 'corde', 1); P.membre(30, 47 + b, 34, 40 + b, 1.2, 'corne'); P.boule(34.5, 38.5 + b, 2.4, 2.8, 'pavillon');
      shBras(P, 21, 35 + b, 19, 41 + b, 20, 45 + b, 'manteau'); shBras(P, 31, 35 + b, 33, 41 + b, 32, 45 + b, 'manteau'); }
  },
};

// ENM_058 Assistant de laboratoire (réanime des sujets) — blouse blanche ouverte sur une chemise violette, lunettes
// rondes qui brillent, queue de cheval argentée, seringue géante ; à l'attaque, il brandit seringue et fiole.
SHINOBI.assistant_labo = {
  pal: pal({ peau: '#ecd0b8', cheveux: '#c8ccd8', blouse: '#eef0f0', chemise: '#5a3a8a', pantalon: '#3a3448', sandale: '#2e2a3a', verre: { c: '#e8f4ff', brille: true }, seringue: { c: '#d8e8f0', brille: true }, liquide: '#7af07a', fiole: '#9ae0a0' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.5 };
    if (i) { shJambe(P, 24, 46, 23.5, 51, 23, 55, J); shJambe(P, 28, 46, 28.5, 51, 29, 54, J); }
    else { shJambe(P, 24, 46, 23.5, 51, 23, 54, J); shJambe(P, 28, 46, 28.5, 51, 29, 55, J); }
    P.membre(28, 26 + b, 31, 36 + b, 1.3, 'cheveux', { trait: false }); // queue de cheval
    P.tronc(33.5 + b, 50, 20.5, 31.5, 19, 33, 'blouse', { arrondi: 2 });
    P.tronc(34 + b, 46, 24, 28, 24.5, 27.5, 'chemise'); P.rect(25, 45, 2, 5, 'pantalon', 1);
    P.rect(21, 41 + b, 3, 2, 'blouse', 1); P.px(29, 38 + b, 'liquide', 3);
    const hx = 26, hy = 28 + b;
    P.boule(hx, hy - 0.5, 5.2, 5.2, 'cheveux');
    P.boule(hx, hy + 1, 4.3, 4.2, 'peau');
    P.poly([[hx - 5, hy], [hx - 2, hy - 4], [hx + 5, hy - 3], [hx + 5, hy - 5], [hx - 5, hy - 5]], 'cheveux', { niv: 3, trait: false });
    for (const c of [-1, 1]) { P.rect(hx + c * 2.3 - 1.5, hy, 3, 3, 'oeil', 1); P.rect(hx + c * 2.3 - 0.5, hy + 1, 1, 1, 'verre', 3); P.px(hx + c * 2.3 - 0.5, hy, 'verre', 4); }
    P.rect(hx - 1, hy + 1, 2, 1, 'oeil', 1); P.rect(hx - 1, hy + 4, 3, 1, 'peau', 0);
    if (att) { shBras(P, 21, 35 + b, 18, 31, 17, 27, 'blouse'); P.membre(17, 26, 17, 18, 1.5, 'seringue'); P.rect(16, 21, 2, 4, 'liquide', 3); P.ligne(17, 17, 17, 14, 'lame', 3);
      shBras(P, 31, 35 + b, 34, 31, 35, 27, 'blouse'); P.boule(35, 24, 2.2, 2.6, 'fiole'); P.rect(34, 20, 2, 2, 'blouse', 1); shLueur(P, 35, 24, 2, '#5ae080', '#e8ffe8'); }
    else { shBras(P, 21, 35 + b, 19, 40 + b, 20, 43 + b, 'blouse'); shBras(P, 31, 35 + b, 33, 40 + b, 34, 43 + b, 'blouse'); P.membre(34, 44 + b, 37, 37 + b, 1.4, 'seringue'); P.ligne(36, 39 + b, 37, 38 + b, 'liquide', 3); P.ligne(37, 36 + b, 39, 33 + b, 'lame', 3); }
  },
};

// ENM_060 Poseur de parchemins explosifs (pièges explosifs) — masque animal blanc aux marques rouges, tenue noire,
// plastron couvert de parchemins explosifs, sabre court dans le dos ; accroupi, une étiquette à la main.
SHINOBI.poseur_explosifs = {
  pal: pal({ peau: '#e0c0a0', masque: '#f0ece4', marque: '#c8302a', cheveux: '#2a2a34', tenue: '#24242e', plastron: '#6a6e7a', papier: '#f0e6c8', pantalon: '#22222a', sandale: '#2a2a34', sabre: '#4a3a2a' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.8 };
    P.membre(18, 47 + b, 31, 31 + b, 1.1, 'sabre'); P.px(31, 30 + b, 'metal', 3);
    if (i) { shJambe(P, 23, 48, 19.5, 47, 20, 55, J); shJambe(P, 29, 48, 33, 48, 32, 54, J); }
    else { shJambe(P, 23, 48, 19.5, 48, 20, 54, J); shJambe(P, 29, 48, 33, 47, 32, 55, J); }
    P.tronc(38 + b, 49, 20.5, 31.5, 21, 31, 'tenue', { arrondi: 2 });
    P.tronc(39 + b, 46, 21.5, 30.5, 22, 30, 'plastron', { arrondi: 1 });
    for (const [x, y] of [[22, 40], [25, 41], [28, 40], [23, 44], [27, 44]]) { P.piece().rect(x, y + b, 2, 3, 'papier', 3).px(x, y + 1 + b, 'marque', 2).traitPiece(); }
    const hx = 26, hy = 32 + b;
    P.boule(hx, hy - 0.5, 5.2, 5.2, 'cheveux');
    P.boule(hx, hy + 0.8, 4.4, 4.4, 'masque'); P.poly([[hx - 4.5, hy - 2], [hx - 3.5, hy - 6], [hx - 1.5, hy - 3]], 'masque', { niv: 3 }); P.poly([[hx + 1.5, hy - 3], [hx + 3.5, hy - 6], [hx + 4.5, hy - 2]], 'masque', { niv: 2 }); // oreilles du masque
    P.rect(hx - 3, hy + 0.5, 2, 1, 'oeil', 2); P.rect(hx + 1, hy + 0.5, 2, 1, 'oeil', 2);
    P.ligne(hx - 3, hy - 1, hx - 1, hy - 2, 'marque', 2); P.ligne(hx + 1, hy - 2, hx + 3, hy - 1, 'marque', 2); P.rect(hx - 0.5, hy + 3, 1, 2, 'marque', 2);
    shBras(P, 21, 40 + b, 20, 45 + b, 22, 47 + b, 'tenue');
    shBras(P, 31, 40 + b, 35, 45 + b, 37, 50 + b, 'tenue'); P.rect(36, 51 + b, 3, 4, 'papier', 3); P.px(37, 52 + b, 'marque', 2).px(37, 53 + b, 'marque', 2);
  },
};

// ENM_061 Ninja médical (soigne) — chignon piqué d'aiguilles, masque chirurgical, blouse claire à brassard vert,
// trousse à la ceinture ; mains lumineuses, levées pour soigner.
SHINOBI.ninja_medical = {
  pal: pal({ peau: '#f0d0b4', cheveux: '#6a3a2a', aiguille: { c: '#e0e4ec', brille: true }, masque: '#d8ecf4', blouse: '#cfe0e8', brassard: '#2ab050', pantalon: '#9ab0c0', sandale: '#4a5a6a', trousse: '#a8483a' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.5 };
    if (i) { shJambe(P, 24, 46, 23.5, 51, 23, 55, J); shJambe(P, 28, 46, 28.5, 51, 29, 54, J); }
    else { shJambe(P, 24, 46, 23.5, 51, 23, 54, J); shJambe(P, 28, 46, 28.5, 51, 29, 55, J); }
    P.tronc(34 + b, 47, 21, 31, 20.5, 31.5, 'blouse', { arrondi: 2 });
    P.boule(31, 45 + b, 2.2, 2, 'trousse'); P.rect(30.5, 44 + b, 1, 2, 'blanc', 3);
    const hx = 26, hy = 28 + b;
    P.boule(hx, hy - 6, 2.8, 2.4, 'cheveux'); P.ligne(hx - 4, hy - 8, hx + 1, hy - 5, 'aiguille', 3); P.ligne(hx + 4, hy - 9, hx + 1, hy - 6, 'aiguille', 3); // chignon et aiguilles
    P.boule(hx, hy - 0.5, 5.2, 5, 'cheveux');
    P.boule(hx, hy + 1, 4.3, 4.1, 'peau');
    P.poly([[hx - 5, hy + 1], [hx - 3, hy - 3], [hx + 3, hy - 3], [hx + 5, hy + 1], [hx + 5, hy - 5], [hx - 5, hy - 5]], 'cheveux', { niv: 2, trait: false });
    shYeux(P, hx, hy + 0.5, 'rond', { ecart: 2.2 });
    P.tronc(hy + 2, hy + 5, hx - 4.5, hx + 4.5, hx - 3.5, hx + 3.5, 'masque'); P.rect(hx - 5, hy + 2, 1, 1, 'blanc', 2); P.rect(hx + 4, hy + 2, 1, 1, 'blanc', 2);
    if (att) { shBras(P, 21, 36 + b, 18, 32, 19, 28, 'blouse'); shBras(P, 31, 36 + b, 34, 32, 33, 28, 'blouse'); P.rect(17, 31, 3, 2, 'brassard', 2); shLueur(P, 19, 28, 3, '#5ae080', '#e8ffe8'); shLueur(P, 33, 28, 3, '#5ae080', '#e8ffe8'); }
    else { shBras(P, 21, 36 + b, 19, 41 + b, 20, 44 + b, 'blouse'); shBras(P, 31, 36 + b, 34, 40 + b, 31, 42 + b, 'blouse'); P.rect(18.5, 38 + b, 3, 2, 'brassard', 2); shLueur(P, 31, 42 + b, 2, '#5ae080', '#e8ffe8'); }
  },
};

// ENM_062 Ninja de la brume (rapide au contact) — poncho gris-vert effiloché, masque à gaz à deux filtres,
// tantō court ; il court plié en deux, la brume colle à ses pieds.
SHINOBI.ninja_brume = {
  pal: pal({ peau: '#d8c0a8', poncho: '#5a6a68', poncho2: '#465452', masque: { c: '#5a5e66', brille: true }, filtre: '#3a3e46', verre: { c: '#9ae0e0', brille: true }, pantalon: '#2e3438', sandale: '#2a3034', cheveux: '#2e3438' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.6 };
    if (i) { shJambe(P, 24, 47, 21.5, 51, 21, 55, J); shJambe(P, 28, 47, 31, 50, 32, 53, J); }
    else { shJambe(P, 24, 47, 21, 50, 19, 53, J); shJambe(P, 28, 47, 30, 51, 30.5, 55, J); }
    P.poly([[20, 37 + b], [33, 36 + b], [36, 47], [18, 48]], 'poncho', { cyl: true }); // poncho
    P.piece(); for (let x = 18; x < 36; x += 2) P.rect(x, 47 + ((x / 2) % 2), 1, 2, 'poncho2', 1); P.traitPiece();
    const hx = 29, hy = 31 + b;
    P.boule(hx, hy - 0.5, 5, 5, 'poncho2'); // capuche
    P.boule(hx + 0.5, hy + 1, 4.2, 3.8, 'masque');
    for (const c of [-1, 1]) { P.boule(hx + 0.5 + c * 2, hy, 1.4, 1.3, 'verre'); P.boule(hx + 0.5 + c * 2.2, hy + 4, 1.6, 1.6, 'filtre'); }
    P.apres(g => { g.fillStyle = 'rgba(220,232,236,0.55)'; for (const [x, y] of [[15, 54], [18, 55], [35, 54], [38, 55], [13, 52]]) g.fillRect(x, y, 3, 1); });
    if (att) { shBras(P, 32, 38 + b, 36, 38, 39, 37, 'poncho'); P.ligne(40, 36, 45, 34, 'lame', 3); P.ligne(40, 37, 44, 35, 'lame', 1); }
    else { shBras(P, 32, 38 + b, 34, 42 + b, 36, 43 + b, 'poncho'); P.ligne(37, 43 + b, 41, 41 + b, 'lame', 3); }
    shBras(P, 21, 38 + b, 18, 42 + b, 16, 44 + b, 'poncho');
  },
};

// ENM_063 Clone de glace (salves de senbon, laisse du verglas) — silhouette de cristal facetté, translucide,
// yeux pâles ; à l'attaque, un éventail d'aiguilles de glace se forme dans sa main levée.
SHINOBI.clone_glace = {
  pal: pal({ glace: '#9cd0ec', glace2: '#6aa8d0', facette: '#e8f8ff', oeilg: '#ffffff', aiguille: { c: '#e0f8ff', brille: true } }),
  f(P, i, att) {
    const b = i, J = { k: 'glace2', kp: 'glace2', pied: 'nu', r: 1.7 };
    if (i) { shJambe(P, 24, 46, 23.5, 51, 23, 55, J); shJambe(P, 28, 46, 28.5, 51, 29, 54, J); }
    else { shJambe(P, 24, 46, 23.5, 51, 23, 54, J); shJambe(P, 28, 46, 28.5, 51, 29, 55, J); }
    P.poly([[20, 35 + b], [26, 33 + b], [32, 35 + b], [31, 41 + b], [29, 47], [23, 47], [21, 41 + b]], 'glace', { cyl: true });
    P.piece(); P.ligne(21, 36 + b, 26, 41 + b, 'facette', 3); P.ligne(26, 41 + b, 30, 36 + b, 'glace2', 1); P.ligne(26, 41 + b, 26, 46, 'glace2', 1); P.traitPiece();
    const hx = 26, hy = 27 + b; // tête en diamant
    P.poly([[hx - 5, hy], [hx - 3, hy - 5], [hx + 2, hy - 6], [hx + 5, hy - 1], [hx + 4, hy + 4], [hx, hy + 6], [hx - 4, hy + 4]], 'glace', { cyl: true });
    P.ligne(hx - 3, hy - 4, hx, hy + 5, 'facette', 3); P.ligne(hx + 2, hy - 5, hx + 4, hy + 3, 'glace2', 1);
    P.rect(hx - 3, hy + 1, 2, 1, 'oeilg', 4); P.rect(hx + 1, hy + 1, 2, 1, 'oeilg', 4);
    const Bg = { r: 1.4, rm: 1.6 };
    shBras(P, 21, 36 + b, 19, 41 + b, 20, 45 + b, 'glace2', 'glace', Bg);
    if (att) { shBras(P, 31, 36 + b, 34, 32, 34, 27, 'glace2', 'glace', Bg); for (const [dx, dy] of [[-4, -5], [-1, -7], [2, -7], [5, -5]]) P.ligne(34, 26, 34 + dx, 26 + dy, 'aiguille', 3); }
    else { shBras(P, 31, 36 + b, 33, 41 + b, 33, 45 + b, 'glace2', 'glace', Bg); for (const d of [1, 2, 3]) P.ligne(33, 46 + b, 33 + d, 49 + b, 'aiguille', 3); }
    P.apres(g => { g.fillStyle = 'rgba(255,255,255,0.9)'; for (const [x, y] of [[19, 34], [33, 30], [24, 22]]) { g.fillRect(x, y + b, 1, 1); } });
  },
};

// ENM_065 Déserteur au sabre (charge sabre en avant) — grand rōnin au manteau en lambeaux, chignon, bas du visage
// bandé, long sabre tenu à deux mains ; à l'attaque, il se ramasse, lame pointée vers sa cible.
SHINOBI.deserteur_sabre = {
  pal: pal({ peau: '#d8b090', cheveux: '#1e1e26', manteau: '#2e3a4e', manteau2: '#24304a', bandes: '#e0d8c4', hakama: '#3a3a46', sandale: '#2a2a34', sabre: { c: '#dce4f0', brille: true }, tsuka: '#6a2a2a' }),
  f(P, i, att) {
    const b = i, d = att ? 2 : 0, J = { k: 'hakama', r: 2 };
    if (i) { shJambe(P, 23.5, 46, 21.5, 51, 20.5, 55, J); shJambe(P, 28.5, 46, 30.5, 51, 31.5, 54, J); }
    else { shJambe(P, 23.5, 46, 21.5, 51, 20.5, 54, J); shJambe(P, 28.5, 46, 30.5, 51, 31.5, 55, J); }
    P.poly([[19, 33 + b + d], [33, 33 + b + d], [36, 50], [32, 52], [28, 49], [24, 52], [20, 49], [16, 51]], 'manteau', { cyl: true }); // manteau en lambeaux
    P.tronc(34 + b + d, 46, 24, 28, 24.5, 27.5, 'manteau2'); P.rect(21, 43, 10, 2, 'tsuka', 1);
    const hx = 26, hy = 27 + b + d;
    P.boule(hx, hy - 6, 2, 1.6, 'cheveux'); P.boule(hx, hy - 0.5, 5, 5, 'cheveux');
    P.boule(hx, hy + 1, 4.2, 4, 'peau');
    P.rect(hx - 4.5, hy - 4, 9, 2, 'cheveux', 2);
    shYeux(P, hx, hy, 'fente', { ecart: 2.1 });
    P.tronc(hy + 2, hy + 5, hx - 4.5, hx + 4.5, hx - 4, hx + 4, 'bandes'); P.ligne(hx - 4, hy + 3, hx + 4, hy + 4, 'bandes', 1);
    if (att) { // lame pointée vers l'avant, tenue basse à deux mains
      shBras(P, 21, 36 + b + d, 25, 42, 30, 43, 'manteau'); shBras(P, 31, 36 + b + d, 33, 41, 32, 43, 'manteau');
      P.rect(29, 42, 6, 2, 'tsuka', 2); P.poly([[35, 41.5], [48, 39], [49, 40], [35, 44]], 'sabre', { niv: 3 }); P.ligne(36, 43, 48, 40, 'sabre', 1);
    } else { // sabre au repos, lame vers le sol derrière lui
      shBras(P, 21, 36 + b, 19, 41 + b, 20, 44 + b, 'manteau'); shBras(P, 31, 36 + b, 33, 40 + b, 33, 43 + b, 'manteau');
      P.rect(32, 42 + b, 2, 4, 'tsuka', 2); P.poly([[32, 46 + b], [34, 46 + b], [39, 56], [37, 56]], 'sabre', { niv: 3 });
    }
  },
};

// ENM_066 Assassin de la brume (surgit, salve de senbon) — masque blanc ovale à fentes, longue cape à capuche
// sarcelle ; tapi au sol, des senbon entre les doigts.
SHINOBI.assassin_brume = {
  pal: pal({ masque: '#f0eee6', motif: '#4a8a9a', cape: '#2a4a52', cape2: '#1e383e', pantalon: '#1e262c', sandale: '#1e262c', aiguille: { c: '#e0e8f0', brille: true }, peau: '#e8d0b8' }),
  f(P, i, att) {
    const b = i;
    P.poly([[19, 37 + b], [33, 37 + b], [37, 54], [33, 55], [26, 53], [19, 55], [15, 54]], 'cape', { cyl: true }); // cape tombante, accroupi dessous
    P.boule(22, 55, 2.4, 1.3, 'sandale'); P.boule(30.5, 55, 2.4, 1.3, 'sandale');
    for (const x of [18, 23, 29, 34]) P.px(x, 54, 'cape2', 1);
    const hx = 26, hy = 32 + b;
    P.poly([[hx - 7, hy + 5], [hx - 6, hy - 4], [hx, hy - 8], [hx + 6, hy - 4], [hx + 7, hy + 5]], 'cape2', { cyl: true }); // capuche
    P.boule(hx, hy + 0.5, 4, 4.6, 'masque');
    P.rect(hx - 3, hy, 2, 1, 'oeil', 2); P.rect(hx + 1, hy, 2, 1, 'oeil', 2);
    P.ligne(hx - 1, hy + 2, hx + 1, hy + 4, 'motif', 2); P.ligne(hx - 2, hy - 3, hx + 2, hy - 3, 'motif', 2);
    if (att) { shBras(P, 31, 40 + b, 35, 39, 38, 37, 'cape'); for (const [dx, dy] of [[5, -4], [6, -1], [5, 2]]) P.ligne(39, 37, 39 + dx, 37 + dy, 'aiguille', 3); }
    else { shBras(P, 30, 41 + b, 32, 45 + b, 31, 47 + b, 'cape', 'peau', { r: 1.4 }); for (const d of [-1, 0, 1]) P.ligne(31 + d, 48 + b, 31 + d * 2, 51 + b, 'aiguille', 3); }
  },
};


// ── Chapitre IV : repaires de l'organisation, champs de guerre ──
// ENM_070 Zetsu blanc de l'armée (en nombre, sans relâche) — même tête végétale, mais gilet de soldat volé,
// et il court, bras en arrière.
SHINOBI.zetsu_armee = {
  pal: pal(Object.assign({ gilet: '#56703a', poche: '#46602e', pantalon: '#e2e2d8' }, PAL_ZETSU)),
  f(P, i, att) {
    const b = i, J = { k: 'peau', kp: 'ombre', pied: 'nu', r: 1.5 };
    if (i) { shJambe(P, 24, 46, 22, 50, 22, 55, J); shJambe(P, 28, 46, 31, 48, 32, 53, J); }
    else { shJambe(P, 24, 46, 20, 49, 18, 53, J); shJambe(P, 28, 46, 30, 50, 30, 55, J); }
    shBras(P, 23, 37 + b, 19, 40 + b, 15, 41 + b, 'peau', 'peau', { r: 1.3 });
    P.poly([[21, 36 + b], [31, 35 + b], [31, 47], [22, 47]], 'gilet', { cyl: true });
    P.tronc(36 + b, 38 + b, 22, 31, 22, 31, 'poche'); for (const x of [22.5, 27]) P.rect(x, 40 + b, 3, 3, 'poche', 2);
    teteZetsu(P, 29, 29 + b, { pousses: false });
    if (att) shBras(P, 30, 37 + b, 35, 35, 38, 33, 'peau', 'peau', { r: 1.3 });
    else shBras(P, 30, 37 + b, 33, 39 + b, 37, 37 + b, 'peau', 'peau', { r: 1.3 });
  },
};

// ENM_073 Marionnette humaine (écrase le sol, projette du sable de fer) — grand corps de bois articulé, mâchoire
// à charnière, six bras, cape noire en lambeaux ; du sable de fer coule de ses mains.
SHINOBI.marionnette_humaine = {
  pal: pal({ bois: '#c8b090', bois2: '#9a8466', joint: '#5a4a3a', cape: '#24202c', cape2: '#3a3444', fer: '#3a3a44', oeilr: '#e04a3a', cheveux: '#a02a2a' }),
  f(P, i, att) {
    const b = i, J = { k: 'bois2', kp: 'bois2', pied: 'nu', r: 2 };
    for (const c of [-1, 1]) { const y = att ? 26 : 34 + b; P.membre(26 + c * 7, 37 + b, 26 + c * 15, y, 1.5, 'bois2'); P.boule(26 + c * 15, y - 1, 1.8, 1.8, 'joint'); P.membre(26 + c * 6, 41 + b, 26 + c * 14, y + 9, 1.4, 'bois2'); P.boule(26 + c * 14, y + 9, 1.6, 1.6, 'joint'); } // bras supplémentaires
    if (i) { shJambe(P, 22, 46, 20, 50, 19.5, 55, J); shJambe(P, 30, 46, 32, 50, 32.5, 54, J); }
    else { shJambe(P, 22, 46, 20, 50, 19.5, 54, J); shJambe(P, 30, 46, 32, 50, 32.5, 55, J); }
    for (const x of [20, 32]) P.boule(x, 50, 1.5, 1.5, 'joint');
    P.tronc(33 + b, 47, 17, 35, 20, 32, 'bois', { arrondi: 3 });
    P.piece(); for (let y = 37; y < 46; y += 3) P.ligne(21, y + b, 31, y + b, 'joint', 1); P.rect(25.5, 34 + b, 1, 12, 'joint', 1); P.traitPiece();
    P.poly([[15, 33 + b], [37, 33 + b], [39, 44], [35, 42], [31, 45], [26, 42], [21, 45], [17, 42], [13, 44]], 'cape', { cyl: true });
    const hx = 26, hy = 26 + b;
    P.boule(hx, hy - 1, 5, 4.6, 'cheveux'); P.boule(hx, hy, 4.3, 4.4, 'bois');
    P.rect(hx - 3, hy - 1, 2, 2, 'oeil', 1); P.rect(hx + 1, hy - 1, 2, 2, 'oeil', 1); P.px(hx - 2, hy, 'oeilr', 3); P.px(hx + 2, hy, 'oeilr', 3);
    P.rect(hx - 3, hy + 2, 6, att ? 3 : 2, 'oeil', 0); P.rect(hx - 4, hy + 1, 1, 4, 'joint', 1); P.rect(hx + 3, hy + 1, 1, 4, 'joint', 1); // mâchoire à charnière
    const B = { r: 2, rm: 2.4, kav: 'bois2' };
    if (att) { shBras(P, 18, 35 + b, 13, 27, 16, 20, 'bois', 'bois', B); shBras(P, 34, 35 + b, 39, 27, 36, 20, 'bois', 'bois', B); P.apres(g => { g.fillStyle = '#2a2a34'; for (let k = 0; k < 14; k++) g.fillRect(14 + (k * 7) % 24, 13 + (k * 5) % 6, 2, 2); }); }
    else { shBras(P, 18, 35 + b, 14, 41 + b, 15, 47 + b, 'bois', 'bois', B); shBras(P, 34, 35 + b, 38, 41 + b, 37, 47 + b, 'bois', 'bois', B); P.apres(g => { g.fillStyle = '#2a2a34'; for (const [x, y] of [[15, 50], [14, 53], [37, 50], [38, 53]]) g.fillRect(x, y + b, 1, 2); }); }
  },
};

// ENM_075 Sentinelle de la pluie (tirs visés) — haute silhouette sous une grande ombrelle de papier indigo,
// long manteau, respirateur ; à l'attaque, l'ombrelle se referme et se pointe comme un canon.
SHINOBI.sentinelle_pluie = {
  pal: pal({ peau: '#dcc0aa', manteau: '#34445a', col: '#26324a', ombrelle: '#3a3a7a', ombrelle2: '#c8383a', baleine: '#d8c8a0', manche: '#6a4a2a', respi: { c: '#8a96a4', brille: true }, pantalon: '#26303e', sandale: '#26303e', eau: '#8ac8f0' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.5, pied: 'botte', kp: 'sandale' };
    if (i) { shJambe(P, 24, 46, 24, 51, 23.5, 55, J); shJambe(P, 28, 46, 28.5, 51, 29, 54, J); }
    else { shJambe(P, 24, 46, 24, 51, 23.5, 54, J); shJambe(P, 28, 46, 28.5, 51, 29, 55, J); }
    P.tronc(33 + b, 52, 20.5, 31.5, 18.5, 33.5, 'manteau', { arrondi: 2, degrade: 0.25 }); P.effacer(25, 49, 2, 4);
    P.tronc(30 + b, 34 + b, 21, 31, 20.5, 31.5, 'col');
    const hx = 26, hy = 26 + b;
    P.boule(hx, hy - 0.5, 4.8, 4.8, 'col'); P.boule(hx, hy + 0.8, 3.8, 3.6, 'peau');
    shYeux(P, hx, hy, 'fente', { ecart: 1.9 });
    P.rect(hx - 4, hy + 2, 8, 1, 'col', 1); P.boule(hx, hy + 3.4, 2.3, 1.9, 'respi'); P.rect(hx - 1, hy + 3, 2, 1, 'oeil', 1);
    shBras(P, 21, 35 + b, 19, 40 + b, 20, 44 + b, 'manteau');
    if (att) { // ombrelle refermée, pointée vers l'avant
      shBras(P, 31, 35 + b, 34, 38, 36, 37, 'manteau');
      P.poly([[33, 35], [47, 36], [33, 39]], 'ombrelle', { niv: 2 }); P.ligne(33, 37, 47, 36, 'ombrelle2', 2); P.ligne(29, 38, 33, 37, 'manche', 2); P.px(48, 36, 'eau', 3).px(50, 35, 'eau', 3);
    } else { // ombrelle ouverte au-dessus de la tête
      shBras(P, 31, 35 + b, 34, 33 + b, 32, 28 + b, 'manteau'); P.ligne(32, 29 + b, 27, 15 + b, 'manche', 2);
      P.poly([[12, 20 + b], [17, 13 + b], [27, 10 + b], [37, 13 + b], [42, 20 + b], [38, 19 + b], [33, 21 + b], [27, 19 + b], [21, 21 + b], [16, 19 + b]], 'ombrelle', { cyl: true });
      P.piece(); for (const x of [16, 21, 27, 33, 38]) P.ligne(27, 11 + b, x, 19 + b + (x % 2), 'baleine', 1); P.ligne(13, 19 + b, 41, 19 + b, 'ombrelle2', 2); P.traitPiece(); P.px(27, 9 + b, 'manche', 2);
    }
  },
};

// ENM_076 Invocateur aux tiges (invoque des bêtes) — cheveux orange hérissés, visage pâle percé de clous,
// manteau sombre à haut col ; des tiges de métal noir sortent de ses épaules. À l'attaque, paume au sol : sceau violet.
SHINOBI.invocateur_tiges = {
  pal: pal({ peau: '#ecd8c8', cheveux: '#e87a2a', manteau: '#1e1e28', col: '#2e2a3a', tige: { c: '#4a4a56', brille: true }, clou: { c: '#c8ccd8', brille: true }, pantalon: '#1a1a22', sandale: '#1a1a22', liseré: '#8a3aa0' }),
  f(P, i, att) {
    const b = i, d = att ? 3 : 0, J = { k: 'pantalon', r: 1.6 };
    for (const [x0, x1, y1] of [[22, 15, 22], [24, 19, 18], [28, 33, 18], [30, 37, 22]]) { P.membre(x0, 37 + b + d, x1, y1 + b + d, 0.9, 'tige'); P.px(x1, y1 + b + d, 'clou', 4); } // tiges dans le dos
    if (att) { shJambe(P, 23, 47, 20, 49, 20, 55, J); shJambe(P, 29, 47, 33, 47, 32, 55, J); }
    else if (i) { shJambe(P, 24, 46, 23.5, 51, 23, 55, J); shJambe(P, 28, 46, 28.5, 51, 29, 54, J); }
    else { shJambe(P, 24, 46, 23.5, 51, 23, 54, J); shJambe(P, 28, 46, 28.5, 51, 29, 55, J); }
    P.tronc(34 + b + d, 50, 20.5, 31.5, 19, 33, 'manteau', { arrondi: 2, degrade: 0.2 }); P.rect(25.5, 36 + b + d, 1, 14, 'liseré', 2);
    P.tronc(31 + b + d, 35 + b + d, 20.5, 31.5, 20, 32, 'col');
    const hx = 26, hy = 26 + b + d;
    shPointes(P, hx, hy, 5.2, 'cheveux', [[-70, 4], [-40, 5], [-10, 5], [20, 5], [50, 4], [75, 3]]);
    P.boule(hx, hy - 0.5, 5.2, 5, 'cheveux'); P.boule(hx, hy + 1.2, 4.2, 3.8, 'peau');
    P.rect(hx - 4, hy - 2.5, 8, 2, 'cheveux', 2);
    shYeux(P, hx, hy + 0.8, 'rond', { ecart: 2, k: 'liseré' });
    for (const [x, y] of [[-3, 3], [3, 3], [0, 2], [-4, 0], [4, 0]]) P.px(hx + x, hy + y, 'clou', 4);
    if (att) { shBras(P, 21, 37 + b + d, 18, 43, 17, 50, 'manteau'); shBras(P, 31, 37 + b + d, 34, 42, 36, 50, 'manteau'); shLueur(P, 36, 51, 3, '#a060f0', '#f0d8ff'); P.apres(g => { g.globalAlpha = 0.8; g.drawImage(ellipse(8, 2, 'rgba(176,112,240,0.6)'), 28, 51); g.globalAlpha = 1; }); }
    else { shBras(P, 21, 37 + b, 22, 41 + b, 25, 40 + b, 'manteau'); shBras(P, 31, 37 + b, 30, 41 + b, 27, 40 + b, 'manteau'); P.rect(25, 38 + b, 2, 3, 'peau', 3); } // mains jointes : signe
  },
};

// ENM_078 Shinobi de l'Alliance égaré (charge) — gilet de l'Alliance, tête bandée, lance tenue en diagonale ;
// à l'attaque, il se fend, lance couchée vers sa cible.
SHINOBI.alliance_egare = {
  pal: pal({ peau: '#dcae88', cheveux: '#5a3a28', gilet: '#5e7a3e', col: '#4e6a32', tenue: '#2e3448', pantalon: '#2e3448', sandale: '#2e3a50', bandes: '#ece4d4', sang: '#b03a3a', hampe: '#7a5634', bandeau: '#26283a' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.7, bandes: 'bandes' };
    if (att) { shJambe(P, 23.5, 46, 20, 50, 18, 55, J); shJambe(P, 28.5, 46, 32, 48, 33, 55, J); }
    else if (i) { shJambe(P, 24, 46, 23.5, 51, 23, 55, J); shJambe(P, 28, 46, 28.5, 51, 29, 54, J); }
    else { shJambe(P, 24, 46, 23.5, 51, 23, 54, J); shJambe(P, 28, 46, 28.5, 51, 29, 55, J); }
    if (!att) { P.membre(15, 54, 37, 22 + b, 1, 'hampe'); P.poly([[36, 23 + b], [40, 16 + b], [39, 23 + b]], 'lame', { niv: 3 }); }
    P.tronc(34 + b, 47, 20.5, 31.5, 21, 31, 'tenue', { arrondi: 2 });
    P.tronc(34.5 + b, 45, 21, 31, 21, 31, 'gilet', { arrondi: 2 }); P.boule(26, 34.5 + b, 5.5, 2.2, 'col');
    for (const x of [21.5, 27.5]) P.rect(x, 38 + b, 3, 3, 'col', 2);
    const hx = 26, hy = 28 + b;
    P.boule(hx, hy - 0.5, 5.2, 5, 'cheveux'); P.boule(hx, hy + 1, 4.3, 4.1, 'peau');
    P.tronc(hy - 4, hy - 1, hx - 5, hx + 5, hx - 5, hx + 5, 'bandes'); P.rect(hx + 1, hy - 3, 2, 2, 'sang', 2); // tête bandée
    shYeux(P, hx, hy + 1, 'fente', { ecart: 2.2 }); P.rect(hx - 1, hy + 4, 3, 1, 'oeil', 1);
    if (att) { shBras(P, 21, 36 + b, 24, 41, 28, 41, 'tenue'); shBras(P, 31, 36 + b, 33, 40, 34, 40, 'tenue'); P.membre(14, 42, 44, 39, 1, 'hampe'); P.poly([[44, 37.5], [51, 39], [44, 40.5]], 'lame', { niv: 3 }); }
    else { shBras(P, 21, 36 + b, 21, 41 + b, 24, 44 + b, 'tenue'); shBras(P, 31, 36 + b, 33, 33 + b, 33, 30 + b, 'tenue'); }
  },
};

// ENM_079 Poseur d'argile (pièges explosifs) — artisan trapu au tablier maculé d'argile, lunettes relevées sur le
// front, oiseau d'argile perché sur l'épaule, une boule d'argile à la main ; accroupi pour piéger le sol.
SHINOBI.poseur_argile = {
  pal: pal({ peau: '#e0b088', cheveux: '#e8c050', tablier: '#8a6a4a', argile: '#efe6d4', tenue: '#3a4a5a', pantalon: '#2e3644', sandale: '#2e3644', lunettes: { c: '#8ad0e8', brille: true }, monture: '#4a3a2a', papier: '#f4ecd8', sceau: '#c8382a' }),
  f(P, i, att) {
    const b = i, J = { k: 'pantalon', r: 1.9 };
    if (i) { shJambe(P, 23, 48, 19.5, 47, 20, 55, J); shJambe(P, 29, 48, 33, 48, 32, 54, J); }
    else { shJambe(P, 23, 48, 19.5, 48, 20, 54, J); shJambe(P, 29, 48, 33, 47, 32, 55, J); }
    P.tronc(37 + b, 49, 19.5, 32.5, 20, 32, 'tenue', { arrondi: 3 });
    P.tronc(39 + b, 50, 22, 30, 21.5, 30.5, 'tablier'); for (const [x, y] of [[23, 42], [27, 45], [24, 47]]) P.rect(x, y + b, 2, 1, 'argile', 3); // tablier taché
    // oiseau d'argile sur l'épaule
    P.boule(19, 34 + b, 2.6, 2, 'argile'); P.poly([[17, 34 + b], [13, 31 + b + (i ? 1 : 0)], [16, 35 + b]], 'argile', { niv: 3 }); P.px(20, 33 + b, 'oeil', 2); P.px(21, 34 + b, 'cheveux', 3);
    const hx = 27, hy = 32 + b;
    P.membre(hx + 2, hy - 3, hx + 6, hy + 4, 1.4, 'cheveux', { trait: false }); // queue de cheval
    P.boule(hx, hy - 0.5, 5.2, 5, 'cheveux'); P.boule(hx, hy + 1, 4.3, 4.1, 'peau');
    for (const x of [-2.3, 2.3]) { P.boule(hx + x, hy - 3.5, 1.7, 1.4, 'monture'); P.boule(hx + x, hy - 3.5, 1, 0.8, 'lunettes'); } // lunettes relevées
    shYeux(P, hx, hy + 1, 'fente', { ecart: 2 }); P.rect(hx - 1, hy + 4, 3, 1, 'oeil', 1); P.px(hx + 2, hy + 3, 'argile', 3);
    shBras(P, 21, 39 + b, 21, 44 + b, 23, 46 + b, 'tenue'); P.boule(23.5, 47 + b, 2, 1.8, 'argile');
    shBras(P, 32, 39 + b, 35, 45 + b, 37, 50 + b, 'tenue'); P.rect(36, 51 + b, 3, 4, 'papier', 3); P.px(37, 52 + b, 'sceau', 2).px(37, 53 + b, 'sceau', 2);
  },
};

// ENM_081 Zetsu soigneur (soigne) — tête végétale coiffée d'un grand bourgeon, gourde de sève ; mains vertes.
SHINOBI.zetsu_soigneur = {
  pal: pal(Object.assign({ bourgeon: '#e07aa0', gourde: '#9a7a3a', seve: '#9ae070' }, PAL_ZETSU)),
  f(P, i, att) {
    const b = i, J = { k: 'peau', kp: 'ombre', pied: 'nu', r: 1.5 };
    if (i) { shJambe(P, 24, 46, 23.5, 51, 23, 55, J); shJambe(P, 28, 46, 28.5, 51, 29, 54, J); }
    else { shJambe(P, 24, 46, 23.5, 51, 23, 54, J); shJambe(P, 28, 46, 28.5, 51, 29, 55, J); }
    P.tronc(35 + b, 47, 21, 31, 21.5, 30.5, 'peau', { arrondi: 2 });
    P.boule(31.5, 45 + b, 2.4, 2.8, 'gourde'); P.px(31, 42 + b, 'seve', 3);
    const hx = 26, hy = 29 + b;
    for (const [a, c] of [[-2.4, 'feuille'], [-0.7, 'tige'], [0.7, 'feuille'], [2.4, 'tige']]) P.poly([[hx, hy - 5], [hx + Math.sin(a) * 9, hy - 5 - Math.cos(a) * 5], [hx + Math.sin(a) * 4, hy - 4 - Math.cos(a) * 2]], c, { niv: a < 0 ? 3 : 2 }); // collerette de feuilles
    P.boule(hx, hy - 9, 2.6, 3.2, 'bourgeon');
    teteZetsu(P, hx, hy, { pousses: false });
    if (att) { shBras(P, 21, 37 + b, 18, 33, 19, 29, 'peau', 'peau', { r: 1.3 }); shBras(P, 31, 37 + b, 34, 33, 33, 29, 'peau', 'peau', { r: 1.3 }); shLueur(P, 19, 29, 3, '#5ae080', '#e8ffe8'); shLueur(P, 33, 29, 3, '#5ae080', '#e8ffe8'); }
    else { shBras(P, 21, 37 + b, 19, 42 + b, 20, 45 + b, 'peau', 'peau', { r: 1.3 }); shBras(P, 31, 37 + b, 33, 41 + b, 31, 43 + b, 'peau', 'peau', { r: 1.3 }); shLueur(P, 31, 43 + b, 2, '#5ae080', '#e8ffe8'); }
  },
};

// ── Assemblage : trois images recadrées ensemble, axe du corps au centre (miroir quand l'ennemi va à gauche) ──
const _shinobi = {};
function spriteShinobi(nom) {
  if (_shinobi[nom]) return _shinobi[nom];
  const F = SHINOBI[nom] || SHINOBI.genin_renegat;
  const brutes = [0, 1, 2].map(n => { const P = peintreShinobi(F.pal); F.f(P, n === 1 ? 1 : 0, n === 2); return P.toile(); });
  let haut = SH.H, dmax = 4;
  for (const c of brutes) {
    const d = ctxDe(c).getImageData(0, 0, c.width, c.height).data;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 0) { if (y < haut) haut = y; dmax = Math.max(dmax, x < SH.X ? SH.X - x : x + 1 - SH.X); }
  }
  const bas = SH.SOL + 1, l = 2 * dmax, h = bas - haut + 1;
  const frames = brutes.map(c => { const o = toile(l, h); ctxDe(o).drawImage(c, SH.X - dmax, haut, l, h, 0, 0, l, h); return o; });
  return (_shinobi[nom] = { frames, miroir: true, base: 1, attaque: true });
}
// Préchauffage : hors combat, un shinobi se construit en avance à chaque appel (pas d'à-coup à leur apparition)
let _shAPrechauffer = null;
function prechaufferShinobi() { if (!_shAPrechauffer) _shAPrechauffer = Object.keys(SHINOBI); const n = _shAPrechauffer.pop(); if (n && !_shinobi[n]) spriteShinobi(n); }
