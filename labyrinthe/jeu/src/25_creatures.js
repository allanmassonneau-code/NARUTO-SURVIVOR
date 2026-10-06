// ═══════════════════════════════════════════════════════════════════════════
// Créatures ennemies peintes (création originale) : même peintre de volumes que
// les shinobi (25_shinobi.js) — lumière en haut à gauche, rampes de cinq tons,
// traits intérieurs, contour commun — pour que tout le bestiaire parle la même
// langue. Chaque créature est dessinée à la taille de sa zone de contact ; les
// variantes d'une même forme (marionnettes, statues, crapauds, cuves, masques…)
// portent l'accessoire de leur attaque, et une image d'attaque s'affiche pendant
// le télégraphe (ramassé avant le bond, gueule ouverte, lames dépliées…).
// alias : anciennes clés de couleur des cartes (surcharges de 15_donnees_ennemis.js).
// Les boss et les familiers gardent leurs cartes.
// ═══════════════════════════════════════════════════════════════════════════

const CREATURES = {};
const C_BASE = { trait: '#1c1420', blanc: '#ffffff', metal: { c: '#b8c0cc', brille: true } };
const palC = o => Object.assign({}, C_BASE, o);

// Poupée d'entraînement (ENM_001) — sac de toile cousu sur un pieu, cible peinte, bras de bois ; elle sautille.
CREATURES.poupee = {
  alias: { p: 'toile', d: 'bois', r: 'cible', w: 'clair', k: 'trait' },
  pal: palC({ toile: '#c8a466', bois: '#8a5a32', cible: '#c8382a', clair: '#f0e6d0', paille: '#e0c060', corde: '#6a4a2a' }),
  f(P, i) {
    const h = i ? 2 : 0;
    P.membre(26, 44 - h, 26, 54 - h, 1.5, 'bois');
    P.membre(15, 37 - h, 37, 37 - h, 1.3, 'bois');
    for (const x of [15, 37]) { P.ligne(x - 1, 36 - h, x - 2, 33 - h, 'paille', 3); P.ligne(x + 1, 36 - h, x + 2, 33 - h, 'paille', 3); P.rect(x - 1, 36 - h, 3, 2, 'corde', 2); }
    P.tronc(32 - h, 46 - h, 20.5, 31.5, 21.5, 30.5, 'toile', { arrondi: 2 });
    P.rect(21, 44 - h, 10, 1, 'corde', 2); P.rect(21, 34 - h, 10, 1, 'corde', 1);
    P.piece().boule(26, 39.5 - h, 3.6, 3.6, 'cible', { niv: 2 }).boule(26, 39.5 - h, 2.5, 2.5, 'clair', { niv: 3, trait: false }).rect(25, 39 - h, 2, 1, 'cible', 2).traitPiece();
    P.boule(26, 26 - h, 5.5, 5.2, 'toile');
    for (const x of [23, 27]) { P.ligne(x, 24 - h, x + 2, 26 - h, 'trait', 2); P.ligne(x + 2, 24 - h, x, 26 - h, 'trait', 2); } // yeux cousus en croix
    P.ligne(23, 29 - h, 29, 29 - h, 'trait', 1); for (const x of [24, 26, 28]) P.px(x, 30 - h, 'trait', 1);
    for (const [x, d] of [[22, -1], [25, 0], [28, 1]]) P.ligne(x, 21 - h, x + d * 2, 18 - h, 'paille', 3);
  },
};

// Rat des sous-sols (ENM_004) — de profil, museau pointu, longue queue rose
CREATURES.rat = {
  miroir: true, alias: { g: 'poil', d: 'poil2', p: 'rose', k: 'trait', w: 'blanc' },
  pal: palC({ poil: '#7a7078', poil2: '#5a5258', rose: '#e8a0a8' }),
  f(P, i) {
    P.ligne(19, 53, 15, 51 + i, 'rose', 2); P.ligne(15, 51 + i, 11, 52 - i, 'rose', 1);
    for (const [x, d] of [[21, i ? 1 : -1], [28, i ? -1 : 1]]) P.membre(x, 52, x + d, 54.5, 0.8, 'rose', { trait: false });
    P.boule(24, 51, 6, 3.4, 'poil');
    P.boule(31, 51.5, 3.3, 2.6, 'poil'); P.boule(34, 52, 1.8, 1.4, 'poil'); P.px(35, 51.5, 'rose', 3);
    P.boule(29.5, 48.6, 1.6, 1.6, 'rose', { niv: 3 }); P.px(29.5, 48.6, 'poil2', 1);
    P.px(32, 50.5, 'trait', 2); P.px(32, 50, 'blanc', 4);
    P.ligne(34, 53, 37, 54, 'poil2', 3);
  },
};

// Chauve-souris (ENM_005, ENM_057) — ailes membraneuses qui battent, yeux rouges, crocs
CREATURES.chauve_souris = {
  alias: { b: 'peau', d: 'aile', r: 'oeilr', w: 'croc' },
  pal: palC({ peau: '#4a3458', aile: '#2e2040', membrane: '#5e4470', oeilr: '#ff4a5a', croc: '#ffffff' }),
  f(P, i) {
    const y = 47;
    for (const c of [-1, 1]) {
      const X = v => 26 + c * v;
      const pts = i ? [[X(2), y - 1], [X(7), y + 1], [X(12), y + 5], [X(10.5), y + 5], [X(9), y + 7], [X(6.5), y + 5], [X(4.5), y + 6], [X(2), y + 3]]
        : [[X(2), y], [X(6), y - 5], [X(12), y - 8], [X(11.5), y - 4], [X(10.5), y], [X(8), y - 1], [X(6), y + 2], [X(2), y + 3]];
      P.poly(pts, 'membrane', { niv: 2 });
      P.ligne(X(2), y, pts[2][0], pts[2][1], 'aile', 1); P.ligne(pts[1][0], pts[1][1], pts[4][0], pts[4][1], 'aile', 1);
    }
    P.boule(26, y + 1.5, 3.2, 3.8, 'peau'); P.boule(26, y - 3, 2.9, 2.5, 'peau');
    P.poly([[23.5, y - 4], [23.8, y - 8], [25.6, y - 5]], 'peau', { niv: 3 }); P.poly([[26.4, y - 5], [28.2, y - 8], [28.5, y - 4]], 'peau', { niv: 2 });
    P.px(25, y - 3, 'oeilr', 4); P.px(27, y - 3, 'oeilr', 4); P.px(25, y - 1, 'croc', 4); P.px(27, y - 1, 'croc', 4);
  },
};

// Crapauds (ENM_006 d'égout, ENM_090 gardien, ENM_091 cracheur d'huile, ENM_093 bondissant) — trapu, yeux saillants,
// ventre clair ; il s'aplatit avant de bondir. Le cracheur gonfle un goitre d'huile, le gardien porte bandeau et écharpe.
CREATURES.crapaud = {
  alias: { g: 'peau', l: 'clair', b: 'ventre', k: 'trait', w: 'blanc' },
  pal: palC({ peau: '#6a8a3a', clair: '#9ab860', ventre: '#d8c890', goitre: '#e8b040', huile: '#3a2a1a', bandeau: '#2a3a6a', echarpe: '#c8382a' }),
  f(P, i, att, d) {
    const s = (d.r || 9) / 9, co = d.comportement, P0 = d.params || {}, plat = att && co === 'sauteur' ? 0.8 : 1;
    const W = 9.5 * s, H = 5.8 * s * plat, cy = 55 - H - 0.5;
    for (const c of [-1, 1]) P.boule(26 + c * (W - 1.5), 55 - 2.4 * s, 3.4 * s, 2.5 * s, 'peau'); // cuisses
    P.boule(26, cy, W, H, 'peau');
    P.boule(26, cy + H * 0.4, W * 0.62, H * 0.52, 'ventre', { trait: false });
    for (const [x, y] of [[-5, -2], [3, -3], [6, 0], [-2, -4]]) P.px(26 + x * s, cy + y * s * plat, 'clair', 3); // pustules
    for (const c of [-1, 1]) { // pattes avant
      const fx = 26 + c * 4.6 * s; P.boule(fx, 54, 1.8 * s, 1.2, 'clair'); P.px(fx + c, 55, 'clair', 3); P.px(fx - c, 55, 'clair', 3);
    }
    for (const c of [-1, 1]) { // yeux saillants
      const ex = 26 + c * 4.4 * s, ey = cy - H + 1.2;
      P.boule(ex, ey, 2.7 * s, 2.4 * s, 'peau'); P.rect(ex - 1, ey - 1, 2, 2, 'blanc', 3); P.rect(c < 0 ? ex : ex - 1, ey - 1, 1, 2, 'trait', 2);
    }
    const yb = cy + 0.5; P.ligne(26 - W * 0.62, yb - 1, 26 - W * 0.45, yb, 'trait', 1); P.ligne(26 - W * 0.45, yb, 26 + W * 0.45, yb, 'trait', 1); P.ligne(26 + W * 0.45, yb, 26 + W * 0.62, yb - 1, 'trait', 1);
    if (co === 'lanceur_arc') { const g = att ? 1.4 : 1; P.boule(26, yb + 2.5 * g, 3.4 * s * g, 2.4 * s * g, 'goitre'); P.px(26 + W * 0.3, yb + 1, 'huile', 2); P.px(26 + W * 0.3, yb + 2, 'huile', 1); }
    if (P0.atterrissage === 'onde') { // crapaud gardien de Myōboku : plaque frontale, pans de bandeau qui flottent derrière
      const ey = cy - H + 1.5; P.ligne(26 + 6.5 * s, ey + 1, 26 + 11 * s, ey - 2 + i, 'echarpe', 2); P.ligne(26 + 6.5 * s, ey + 2, 26 + 10.5 * s, ey + 1 + i, 'echarpe', 1);
      P.piece().rect(24.5, ey - 0.5, 3, 2, 'metal', 3).px(24.5, ey - 0.5, 'metal', 4).traitPiece();
    }
  },
};

// Serpents (ENM_007 de la forêt, ENM_051 blanc géant) — corps qui ondule au sol, cou dressé, langue fourchue ;
// le chargeur porte une crête et se ramasse, gueule ouverte, avant de charger.
CREATURES.serpent = {
  miroir: true, alias: { s: 'ecaille', d: 'sombre', b: 'ventre', k: 'trait', r: 'langue' },
  pal: palC({ ecaille: '#7a9a4a', sombre: '#5a7a3a', ventre: '#d8d8a0', langue: '#d83a3a', oeilj: '#f0d040', crete: '#c8a040' }),
  f(P, i, att, d) {
    const s = (d.r || 8) / 8, ph = i ? Math.PI : 0, charge = d.comportement === 'chargeur', rec = att ? -3 * s : 0;
    const n = 13; for (let k = 0; k < n; k++) { const t = k / (n - 1), x = 26 - 12 * s + t * 15 * s + rec * t, y = 54 - Math.sin(t * Math.PI * 2 + ph) * 1.5 * s - 0.8 * s, r = (0.7 + 1.5 * t) * s; P.boule(x, y, r + 0.3, r, 'ecaille', { trait: false }); if (k % 3 === 1) P.px(x, y - r * 0.6, 'sombre', 1); }
    const nx = 26 + 3 * s + rec, hx = 26 + 7 * s + rec, hy = 55 - 10 * s;
    P.membre(nx, 54 - s, hx - 1, hy + 2 * s, 1.9 * s, 'ecaille');
    P.ligne(nx + 1.5 * s, 53 - s, hx, hy + 2.5 * s, 'ventre', 3);
    P.boule(hx + 1, hy, 3.2 * s, 2.3 * s, 'ecaille');
    P.px(hx + 1.5, hy - 1, 'oeilj', 4); P.px(hx + 1.5, hy - 1.6, 'trait', 2);
    if (charge) for (let k = 0; k < 4; k++) P.poly([[hx - 2 - k * 2.2, hy - 1.5 + k * 1.6], [hx - 2.5 - k * 2.2, hy - 4 + k * 1.6], [hx - 1 - k * 2.2, hy - 1.5 + k * 1.6]], 'crete', { niv: 3 });
    if (att) { P.poly([[hx + 2, hy], [hx + 5.5, hy - 2], [hx + 5.5, hy + 2]], 'trait', { niv: 0 }); P.px(hx + 3, hy - 1, 'blanc', 4); P.px(hx + 3, hy + 1, 'blanc', 4); }
    else { P.ligne(hx + 4, hy + 0.5, hx + 6.5, hy + 0.5, 'langue', 2); P.px(hx + 7.5, hy - 0.5, 'langue', 2); P.px(hx + 7.5, hy + 1.5, 'langue', 2); }
  },
};

// Sangsue géante (ENM_008, lourde) — corps annelé et luisant, ventouse dentée ; elle se dresse pour écraser.
CREATURES.sangsue = {
  miroir: true, alias: { s: 'peau', d: 'sombre', l: 'clair', k: 'trait', r: 'bouche' },
  pal: palC({ peau: '#6a3a50', clair: '#b07a90', bouche: '#e05a6a', dent: '#f0e8d8', bave: '#b8d8c8' }),
  f(P, i, att) {
    const lev = att ? 1 : 0;
    for (const x of [10, 14, 18]) P.rect(x, 55, 2, 1, 'bave', 3);
    for (let k = 0; k < 7; k++) { const t = k / 6, x = 13 + t * 23, y = 51 - (lev ? t * t * 9 : 0) - (k % 2 === i ? 0.6 : 0), rx = 3.2 + Math.sin(t * Math.PI) * 2.6 + t * 1.2, ry = 3.4 + Math.sin(t * Math.PI) * 1.6; P.boule(x, y, rx, ry, 'peau', { trait: k > 0 }); P.px(x - 1, y - ry + 1, 'clair', 4); }
    const mx = 37.5, my = 49 - lev * 9;
    P.boule(mx, my, 2.6, 3.4, 'bouche', { niv: 1 });
    for (const [dx, dy] of [[-1, -3], [1, -2], [2, 0], [1, 2], [-1, 3]]) P.px(mx + dx, my + dy, 'dent', 4);
    P.rect(mx - 0.5, my - 1, 1, 2, 'trait', 0);
  },
};

// Mille-pattes fouisseur (ENM_009) — segments de carapace, pattes en vague, mandibules jaunes
CREATURES.mille_pattes = {
  miroir: true, alias: { m: 'carapace', d: 'sombre', l: 'clair', k: 'trait', y: 'mandibule' },
  pal: palC({ carapace: '#8a4a2a', clair: '#c07a4a', patte: '#4a2814', mandibule: '#f0d060' }),
  f(P, i, att) {
    const lev = att ? 4 : 0;
    for (let k = 0; k < 7; k++) {
      const x = 14 + k * 3.3, y = 51.5 - Math.sin(k * 0.9 + i * 1.5) * 0.7 - (k > 4 ? (k - 4) * lev / 2 : 0);
      P.ligne(x, y + 1, x - 1.5 + ((k + i) % 2) * 3, 55, 'patte', 2);
      P.boule(x, y, 2.3, 2.6, 'carapace', { trait: k > 0 }); P.px(x - 1, y - 2, 'clair', 3);
    }
    const hx = 38.5, hy = 50 - lev;
    P.boule(hx, hy, 2.8, 2.5, 'carapace'); P.px(hx + 0.5, hy - 1, 'mandibule', 4);
    P.ligne(hx + 2, hy + 1, hx + 4, hy + 2.5, 'mandibule', 3); P.ligne(hx + 1, hy + 2, hx + 3, hy + 3.5, 'mandibule', 2);
    P.ligne(hx + 1, hy - 2, hx + 4, hy - 6, 'patte', 2); P.ligne(hx, hy - 2, hx + 1, hy - 6, 'patte', 2);
  },
};

// Tigre de la forêt (ENM_010, chargeur) — rayé, museau blanc ; il se ramasse, gueule ouverte, avant de charger.
CREATURES.tigre = {
  miroir: true, alias: { o: 'pelage', k: 'rayure', w: 'blanc', d: 'sombre' },
  pal: palC({ pelage: '#e08a2a', rayure: '#2a1a14', blanc: '#f8f0e0', nez: '#c85a5a', oeilj: '#f0d040' }),
  f(P, i, att) {
    const a = att ? 1 : 0, cy = 46 + a * 2;
    P.membre(15, cy - 2, 10, cy - 7 + (i ? 1 : 0), 1.3, 'pelage', { r1: 1 }); P.px(9, cy - 8 + (i ? 1 : 0), 'rayure', 2);
    const pattes = a ? [[18, 17], [21, 21], [31, 35], [34, 38]] : i ? [[18, 16], [21, 22], [31, 33], [34, 32]] : [[18, 20], [21, 19], [31, 29], [34, 36]];
    for (const [hx, fx] of pattes) { P.membre(hx, cy + 2, fx, 54, 1.6, 'pelage', { trait: false }); P.boule(fx + 0.5, 54.2, 1.9, 1.2, 'blanc', { trait: false }); }
    P.boule(25, cy, 10.5, 5.6, 'pelage');
    P.boule(25, cy + 3, 7, 2.4, 'blanc', { trait: false });
    for (const x of [17, 20, 23, 26, 29]) { P.ligne(x, cy - 5, x + 1, cy - 2, 'rayure', 2); P.px(x + 1, cy - 1, 'rayure', 2); }
    const hx = 35.5, hy = 41.5 + a * 3;
    P.boule(hx - 2.5, hy - 4.2, 1.6, 1.6, 'pelage'); P.boule(hx + 2, hy - 4.4, 1.6, 1.6, 'pelage');
    P.boule(hx, hy, 5.2, 4.6, 'pelage');
    P.boule(hx + 3, hy + 2, 2.8, 2.1, 'blanc');
    P.px(hx + 5, hy + 1, 'nez', 3); P.px(hx + 1.5, hy - 1, 'oeilj', 4); P.px(hx + 2, hy - 1, 'trait', 2);
    P.ligne(hx - 3, hy - 3, hx - 1, hy - 1, 'rayure', 2); P.ligne(hx - 4, hy, hx - 2, hy + 1, 'rayure', 2);
    if (att) { P.rect(hx + 3, hy + 3, 3, 2, 'trait', 0); P.px(hx + 3, hy + 3, 'blanc', 4); P.px(hx + 5, hy + 3, 'blanc', 4); }
  },
};

// Nuée de moustiques (ENM_012) — minuscules, ailes translucides qui vibrent, trompe rouge
CREATURES.moustique = {
  alias: { b: 'corps', w: 'aile', r: 'dard' },
  pal: palC({ corps: '#4a4a3a', rayure: '#c8b060', aile: '#d8e8f0', dard: '#c83a3a', oeilr: '#ff5a4a' }),
  f(P, i) {
    const y = 50;
    for (const c of [-1, 1]) P.poly(i ? [[26, y - 1], [26 + c * 4, y - 6], [26 + c * 6, y - 4]] : [[26, y - 1], [26 + c * 6, y - 2], [26 + c * 5, y + 1]], 'aile', { niv: 3, trait: false });
    for (const [x0, x1] of [[23, 21], [25, 25], [27, 29]]) P.ligne(x0, y + 2, x1, 55, 'corps', 1);
    P.boule(24, y + 1, 3, 1.7, 'corps'); P.px(23, y + 1, 'rayure', 3); P.px(25, y + 1, 'rayure', 3);
    P.boule(28, y, 1.7, 1.6, 'corps'); P.px(28.5, y - 0.5, 'oeilr', 4);
    P.ligne(29.5, y + 0.5, 32, y + 2, 'dard', 2);
  },
};

// Araignée tisseuse (ENM_013) — huit pattes articulées, sablier rouge, quatre yeux rouges
CREATURES.araignee = {
  alias: { a: 'corps', l: 'clair', r: 'oeilr', w: 'blanc' },
  pal: palC({ corps: '#3a2a3a', clair: '#6a4a6a', motif: '#d83a3a', oeilr: '#ff6a6a', patte: '#2a1e2a', soie: '#e8e8f0' }),
  f(P, i, att) {
    for (const c of [-1, 1]) for (let k = 0; k < 4; k++) {
      const sx = 26 + c * 2.5, sy = 48 + k * 1.3, kx = 26 + c * (7.5 + k * 1.4), ky = 43 + k * 2 + ((k + i) % 2 ? -1 : 0), fx = 26 + c * (11 + k * 0.4 - (k === 3 ? 2.5 : 0)), fy = 55 - ((k + i) % 2 ? 1 : 0);
      P.ligne(sx, sy, kx, ky, 'patte', 2); P.ligne(kx, ky, fx, fy, 'patte', 1);
    }
    P.boule(26, 45.5, 5.6, 4.6, 'corps');
    P.poly([[26, 42.5], [27.6, 45.5], [26, 48.5], [24.4, 45.5]], 'motif', { niv: 3 });
    P.boule(26, 51, 3.8, 3, 'corps');
    for (const [x, y] of [[-1.5, -1], [0.5, -1], [-2.5, 0], [1.5, 0]]) P.px(26 + x, 51 + y, 'oeilr', 4);
    P.px(25, 53, 'clair', 3); P.px(27, 53, 'clair', 3);
    if (att) P.ligne(26, 54, 26, 57, 'soie', 4);
  },
};

// Jarre hantée (ENM_014) — une jarre… aux yeux mi-clos qui luisent ; éveillée, elle tremble, couvercle soulevé.
CREATURES.jarre_hantee = {
  alias: { j: 'terre', l: 'clair', d: 'sombre', k: 'trait', y: 'lueur' },
  pal: palC({ terre: '#b86a44', bouchon: '#6a4a36', lueur: '#f0e060', motif: '#e8c890' }),
  f(P, i, att) {
    const t = att ? (i ? 1 : -1) : 0, cou = att ? 3 : 0;
    P.boule(26 + t, 47, 7, 7.8, 'terre');
    P.tronc(37.5, 40.5, 22.5 + t, 29.5 + t, 23 + t, 29 + t, 'terre');
    P.boule(26 + t, 38, 4.4, 1.6, 'terre'); P.boule(26 + t, 37.6, 3, 0.9, 'trait', { niv: 0, trait: false });
    P.boule(26 + t * 2, 36.5 - cou, 3.2, 1.4, 'bouchon');
    P.piece(); for (let x = 20; x < 32; x += 2) { P.px(x + t, 44, 'motif', 3); P.px(x + 1 + t, 43, 'motif', 3); } P.traitPiece();
    const o = att ? 2 : 1; // yeux mi-clos, grands ouverts à l'éveil
    for (const c of [-1, 1]) { const x = 26 + t + c * 2.8 - 1; P.rect(x, 47 - o, 2, o, 'lueur', 4); }
    P.ligne(23 + t, 51, 29 + t, 51, 'trait', 0); if (att) { P.px(24 + t, 50, 'trait', 0); P.px(28 + t, 50, 'trait', 0); }
  },
};

// Racine griffue (ENM_020, surgit et crache des épines) — tronc noueux au visage creux, racines-griffes, mousse
CREATURES.racine = {
  alias: { r: 'bois', d: 'sombre', y: 'lueur', k: 'trait' },
  pal: palC({ bois: '#6a4a2a', sombre: '#4a3018', mousse: '#5a8a3a', lueur: '#f0d060', terre: '#4a3a24', epine: '#e8dcb0' }),
  f(P, i, att) {
    P.boule(26, 55, 10, 1.6, 'terre');
    for (const [x0, x1, y1] of [[22, 14, 54], [24, 18, 55.5], [29, 35, 55.5], [30, 38, 53.5]]) P.membre(x0, 50, x1, y1, 1.4, 'bois', { r1: 0.5 });
    const hb = att ? -3 : 0;
    for (const c of [-1, 1]) { const ex = 26 + c * 9, ey = 38 + hb - (att ? 4 : i); P.membre(26 + c * 4, 44, ex, ey, 1.5, 'bois', { r1: 0.8 }); for (const k of [-1, 0, 1]) P.ligne(ex, ey, ex + c * (1 + Math.abs(k)), ey - 2 + k * 2, 'bois', 2); }
    P.poly([[20, 55], [21, 44], [23, 37 + hb], [26, 35 + hb], [30, 37 + hb], [32, 44], [33, 55]], 'bois', { cyl: true });
    for (const [x, y0, y1] of [[23, 42, 52], [29, 41, 53], [26, 47, 54]]) P.ligne(x, y0, x - 1, y1, 'sombre', 1);
    for (const x of [-2.5, 2.5]) { P.boule(26 + x, 41 + hb, 1.5, 1.8, 'trait', { niv: 0, trait: false }); P.px(26 + x, 41 + hb, 'lueur', 4); }
    P.boule(26, 45.5 + hb, 1.8, 1.2, 'trait', { niv: 0, trait: false });
    for (const [x, y] of [[23, 37], [24, 36], [29, 37], [27, 35]]) P.px(x, y + hb, 'mousse', 3);
    if (att) for (const [x, y] of [[20, 34], [33, 33], [26, 30]]) P.ligne(x, y, x + (x < 26 ? -2 : x > 26 ? 2 : 0), y - 2, 'epine', 4);
  },
};

// Scorpion des sables (ENM_030) — pinces en avant, queue arquée par-dessus le dos, dard rouge qui se dresse
CREATURES.scorpion = {
  miroir: true, alias: { s: 'carapace', d: 'sombre', l: 'clair', k: 'trait', r: 'dard' },
  pal: palC({ carapace: '#a86a2a', sombre: '#6a3a14', clair: '#d8984a', dard: '#d83a2a' }),
  f(P, i, att) {
    for (let k = 0; k < 4; k++) { const x = 20 + k * 3; P.ligne(x, 51, x - 2 + ((k + i) % 2) * 2, 55, 'sombre', 1); P.ligne(x + 1, 51, x + 3 - ((k + i) % 2) * 2, 55, 'sombre', 1); }
    const q = att ? [[18, 49], [15, 44], [16, 38], [20, 34], [25, 33]] : [[18, 49], [15, 45], [15, 40], [18, 37], [22, 36]];
    q.forEach(([x, y], k) => P.boule(x, y, 2.2 - k * 0.2, 2.2 - k * 0.2, 'carapace', { trait: k > 0 }));
    const [dx, dy] = q[4]; P.poly([[dx + 1, dy - 1], [dx + 4, dy + 1], [dx + 1, dy + 2]], 'dard', { niv: 3 });
    P.boule(24, 50, 7, 3.3, 'carapace');
    for (const x of [20, 23, 26]) P.ligne(x, 47.5, x, 52, 'sombre', 1);
    P.membre(30, 50, 34, 47 - (att ? 1 : 0), 1.2, 'carapace');
    P.boule(36, 46 - (att ? 1 : 0), 2.4, 1.7, 'carapace'); P.boule(36.5, 49 - (att ? 0 : 1), 1.8, 1.2, 'carapace');
    P.boule(31, 50.5, 2.6, 2.4, 'carapace'); P.px(32, 49.5, 'trait', 2); P.px(30.5, 49.5, 'clair', 4);
  },
};

// Momies (ENM_031 de sable, lourde ; ENM_050 sujet expérimental) — bandelettes, un œil rouge ; la lourde a des poings
// de pierre et lève les bras pour écraser ; le sujet qui se divise porte une couture du crâne au ventre.
CREATURES.momie = {
  alias: { w: 'bandes', d: 'bandes2', k: 'trait', r: 'oeilr' },
  pal: palC({ bandes: '#d8c8a0', bandes2: '#a8987a', oeilr: '#e04a3a', pierre: '#8a8070', couture: '#8a2a2a', peau: '#9a8a7a' }),
  f(P, i, att, d) {
    const lourd = d.comportement === 'lourd', b = i, e = lourd ? 3.4 : 2.6, J = { k: 'bandes', kp: 'bandes2', pied: 'nu', r: lourd ? 2.2 : 1.8 };
    if (i) { shJambe(P, 26 - e, 46, 26 - e, 50, 26 - e - 0.5, 55, J); shJambe(P, 26 + e, 46, 26 + e, 50, 26 + e + 0.5, 54, J); }
    else { shJambe(P, 26 - e, 46, 26 - e, 50, 26 - e - 0.5, 54, J); shJambe(P, 26 + e, 46, 26 + e, 50, 26 + e + 0.5, 55, J); }
    const L = lourd ? 8 : 6;
    P.tronc(34 + b, 47, 26 - L, 26 + L, 26 - L + 1, 26 + L - 1, 'bandes', { arrondi: 2 });
    for (let y = 36; y < 47; y += 3) P.ligne(26 - L + 1, y + b + 1, 26 + L - 1, y + b - 1, 'bandes', 1);
    const hx = 26, hy = 28 + b;
    P.boule(hx, hy, 4.8, 5, 'bandes');
    for (let y = -3; y <= 3; y += 2) P.ligne(hx - 4.5, hy + y + 1, hx + 4.5, hy + y - 1, 'bandes', 1);
    P.rect(hx - 3, hy, 2, 2, 'trait', 0); P.px(hx - 2, hy, 'oeilr', 4); P.ligne(hx + 1, hy + 1, hx + 3, hy + 1, 'trait', 1);
    P.ligne(hx + 4, hy + 2, hx + 7, hy + 7 + i, 'bandes', 2); // bandelette qui pend
    if (d.mort === 'division') { P.piece(); for (let y = hy - 4; y < 46; y++) { P.px(26, y, 'couture', 2); if (y % 2) { P.px(25, y, 'couture', 3); P.px(27, y, 'couture', 3); } } P.traitPiece(); }
    const B = { r: lourd ? 2 : 1.6, rm: lourd ? 2.8 : 1.7 }, kh = lourd ? 'pierre' : 'bandes2';
    if (att) { shBras(P, 26 - L + 1, 36 + b, 26 - L - 2, 30, 26 - L + 1, 24, 'bandes', kh, B); shBras(P, 26 + L - 1, 36 + b, 26 + L + 2, 30, 26 + L - 1, 24, 'bandes', kh, B); }
    else { shBras(P, 26 - L + 1, 36 + b, 26 - L - 2, 39 + b, 26 - L - 1, 42 + b, 'bandes', kh, B); shBras(P, 26 + L - 1, 36 + b, 26 + L + 2, 39 + b, 26 + L + 1, 42 + b, 'bandes', kh, B); }
    if (lourd) P.apres(g => { g.fillStyle = '#e0c080'; for (const [x, y] of [[26 - L - 1, 46], [26 + L + 1, 47], [26 - L - 2, 50]]) g.fillRect(x, y + b, 1, 2); });
  },
};

// Ver des sables (ENM_032) — sort du sable, corps annelé, gueule ronde cerclée de dents
CREATURES.ver = {
  alias: { v: 'peau', d: 'sombre', k: 'trait', r: 'gueule' },
  pal: palC({ peau: '#c89a5a', sombre: '#8a6a3a', gueule: '#a82a2a', dent: '#f4ecd8', sable: '#d8b878' }),
  f(P, i, att) {
    const lev = att ? 4 : i;
    P.tronc(39 - lev, 55, 21, 31, 19.5, 32.5, 'peau');
    for (let y = 42 - lev; y < 55; y += 3) P.ligne(20.5, y, 31.5, y, 'peau', 1);
    P.boule(26, 38 - lev, 6.2, 3.6, 'peau');
    P.boule(26, 38 - lev, 4.2, 2.3, 'gueule', { niv: 0 });
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; P.px(26 + Math.cos(a) * 3.6 - 0.5, 38 - lev + Math.sin(a) * 1.9 - 0.5, 'dent', 4); }
    P.boule(26, 55.5, 10, 2, 'sable'); for (const x of [17, 20, 32, 35]) P.px(x, 53, 'sable', 3);
  },
};

// Esprit de sable (ENM_034, volant) — fantôme de sable en tourbillon, yeux fendus, grains qui l'escortent
CREATURES.esprit_sable = {
  alias: { s: 'sable', d: 'sombre', k: 'trait', w: 'clair' },
  pal: palC({ sable: '#e0b870', sombre: '#b08a4a', clair: '#fff0c0' }),
  f(P, i) {
    P.poly([[21, 44], [31, 44], [31, 49], [28, 53], [23, 55.5], [25, 52], [22, 49]], 'sable', { cyl: true });
    P.ligne(23, 47, 27, 51, 'sombre', 1); P.ligne(29, 46, 27, 49, 'sombre', 1);
    for (const c of [-1, 1]) P.poly([[26 + c * 4, 43], [26 + c * 9, 40 + i * 2], [26 + c * 8, 44 + i], [26 + c * 5, 46]], 'sable', { niv: c < 0 ? 3 : 1 });
    P.boule(26, 40, 5.4, 4.8, 'sable');
    P.ligne(23, 39, 25, 40, 'trait', 0); P.ligne(27, 40, 29, 39, 'trait', 0); P.boule(26, 43, 1.2, 1, 'trait', { niv: 0, trait: false });
    P.apres(g => { g.fillStyle = '#fff0c0'; for (const [x, y] of i ? [[16, 38], [36, 44], [19, 50], [34, 36]] : [[17, 44], [35, 39], [20, 36], [33, 50]]) g.fillRect(x, y, 1, 1); });
  },
};

// Marionnettes de bois (ENM_035 à lames, ENM_037 lanceuse, ENM_044 errante, ENM_046 inerte) — corps articulé à
// rotules, masque blanc à bouche rouge, cheveux de crin. La chargeuse déplie des lames de ses avant-bras ; la lanceuse
// est fixée sur un socle, tubes à senbon dans le dos ; l'errante avance par saccades ; l'inerte pend à ses fils.
CREATURES.marionnette = {
  alias: { m: 'bois', d: 'bois2', w: 'masque', k: 'trait', r: 'bouche', b: 'fer' },
  pal: palC({ bois: '#8a6a4a', bois2: '#5a4630', masque: '#e8dcc8', bouche: '#c83a4a', crin: '#2a2028', fer: { c: '#8a8a98', brille: true }, lame: { c: '#e0e8f4', brille: true }, fil: '#e8e8f8', socle: '#4a3e36' }),
  f(P, i, att, d) {
    const co = d.comportement, inerte = co === 'inerte', fixe = co === 'tourelle', sac = co === 'poursuivant' ? (i ? 2 : -1) : 0, b = inerte ? 0 : i;
    if (fixe) { P.tronc(48, 55, 17, 35, 16, 36, 'socle', { arrondi: 1 }); for (let x = 19; x < 34; x += 4) P.px(x, 51, 'fer', 3); for (const x of [20, 32]) { P.membre(x, 30, x, 40, 1.6, 'fer'); P.boule(x, 29.5, 1.8, 1.2, 'trait', { niv: 0, trait: false }); } }
    const jx = (x, y) => P.boule(x, y, 1.3, 1.3, 'bois2', { trait: false });
    if (!fixe) { const J = { k: 'bois', kp: 'bois2', pied: 'nu', r: 1.3 };
      if (inerte) { shJambe(P, 24, 46, 23, 50, 22, 55, J); shJambe(P, 28, 46, 30, 50, 30, 55, J); }
      else if (i) { shJambe(P, 24, 46, 23.5, 50, 23, 55, J); shJambe(P, 28, 46, 29, 50, 29.5, 53, J); }
      else { shJambe(P, 24, 46, 23, 50, 22.5, 53, J); shJambe(P, 28, 46, 28.5, 50, 29, 55, J); }
      jx(23.5, 50); jx(28.5, 50); }
    const ty = fixe ? 38 : 35 + b + (inerte ? 2 : 0);
    P.tronc(ty, fixe ? 48 : 46, 21, 31, 22.5, 29.5, 'bois', { arrondi: 2 });
    P.rect(25.5, ty + 1, 1, (fixe ? 48 : 46) - ty - 1, 'bois2', 1); jx(26, ty + 6);
    const hx = 26 + (inerte ? 2 : sac * 0.5), hy = ty - 7 + (inerte ? 2 : 0);
    P.boule(hx, hy - 1, 4.6, 4.4, 'crin'); P.boule(hx, hy + 0.5, 3.8, 4, 'masque');
    P.rect(hx - 2.5, hy - 0.5, 2, 1, 'trait', 2); P.rect(hx + 0.5, hy - 0.5, 2, 1, 'trait', 2); P.rect(hx - 1, hy + 2, 2, 1, 'bouche', 3);
    P.rect(hx - 3.5, hy + 1, 1, 3, 'bois2', 1); P.rect(hx + 2.5, hy + 1, 1, 3, 'bois2', 1); // mâchoire articulée
    const bras2 = (sx, ex, ey, hx2, hy2) => { P.membre(sx, ty + 1, ex, ey, 1.3, 'bois'); jx(ex, ey); P.membre(ex, ey, hx2, hy2, 1.2, 'bois'); P.boule(hx2, hy2, 1.4, 1.4, 'bois2'); };
    if (inerte) { bras2(21, 18, ty + 6, 18, ty + 11); bras2(31, 34, ty + 6, 34, ty + 11);
      P.piece().membre(16, 18, 36, 18, 1, 'bois2').membre(26, 15, 26, 21, 1, 'bois2').traitPiece(); // croix de manipulation
      P.apres(g => { g.fillStyle = 'rgba(232,232,248,0.85)'; for (const [x0, x1, y1] of [[16, 18, ty + 6], [36, 34, ty + 6], [26, hx, hy - 4]]) { const n = Math.max(1, y1 - 19); for (let k = 0; k <= n; k++) g.fillRect(Math.round(x0 + (x1 - x0) * k / n), 19 + k, 1, 1); } });
    } else if (co === 'chargeur') {
      const ey = att ? ty + 3 : ty + 6 + b, hy2 = att ? ty + 2 : ty + 9;
      bras2(21, 17, ey, 15, hy2); bras2(31, 35, ey, 37, hy2);
      for (const c of [-1, 1]) { const x = 26 + c * 11, y = hy2; P.poly(att ? [[x, y - 1], [x + c * 8, y - 3], [x + c * 8, y - 1], [x, y + 1]] : [[x - c, y], [x + c, y + 7], [x + c * 2, y + 6], [x + c, y]], 'lame', { niv: 3 }); }
    } else if (fixe) {
      bras2(21, 17, ty + 4, 16, ty + 9 - (att ? 4 : 0)); bras2(31, 35, ty + 4, 36, ty + 9 - (att ? 4 : 0));
      if (att) for (const x of [20, 32]) P.apres(g => { g.fillStyle = '#ffe0f0'; g.fillRect(x - 1, 27, 3, 1); g.fillRect(x, 26, 1, 3); });
    } else { const a = sac; bras2(21, 18, ty + 5 + a, 17, ty + 10 - a * 2); bras2(31, 34, ty + 5 - a, 36, ty + 9 + a); }
  },
};

// Araignée mécanique (ENM_039) — boîtier de fer riveté, œil orange, pattes fines
CREATURES.araignee_meca = {
  alias: { a: 'fer', d: 'fer2', r: 'oeil', k: 'trait' },
  pal: palC({ fer: { c: '#7a7a88', brille: true }, fer2: '#4a4a56', oeil: '#f0a040' }),
  f(P, i) {
    for (const c of [-1, 1]) for (let k = 0; k < 3; k++) { const kx = 26 + c * (5 + k), ky = 48 + k + ((k + i) % 2 ? -1 : 0); P.ligne(26 + c * 2, 50 + k, kx, ky, 'fer2', 1); P.ligne(kx, ky, kx + c * 1.5, 55 - ((k + i) % 2), 'fer2', 1); }
    P.boule(26, 50.5, 4.2, 3, 'fer'); P.px(24, 49, 'fer2', 1); P.px(28, 49, 'fer2', 1);
    P.rect(25, 51, 2, 1, 'oeil', 4); P.px(25, 50, 'oeil', 3);
  },
};

// Cuves (ENM_054 cuve vivante, ENM_068 nid de serpenteaux) — cylindre de verre cerclé de métal, liquide où flotte une
// créature aux yeux luisants ; la cuve d'acide a une buse qui bouillonne avant de cracher ; le nid laisse dépasser des têtes.
CREATURES.cuve = {
  alias: { m: 'metal2', d: 'sombre', g: 'liquide', l: 'reflet', k: 'trait' },
  pal: palC({ metal2: { c: '#5a6068', brille: true }, liquide: '#5ab07a', reflet: '#c8f0d0', ombre: '#2a4a34', oeilj: '#f0f060', serpent: '#e8e4d0', langue: '#d83a3a' }),
  f(P, i, att, d) {
    const nid = d.comportement === 'invocateur', s = (d.r || 12) / 12;
    for (const x of [-8, 8]) P.membre(26 + x * s, 50, 26 + x * s * 1.1, 55, 1.2, 'metal2');
    P.tronc(34, 52, 26 - 10 * s, 26 + 10 * s, 26 - 10 * s, 26 + 10 * s, 'liquide', { degrade: 0.3 });
    if (!nid) { P.boule(26, 44, 4, 3.5, 'ombre', { niv: 1, trait: false }); P.px(24.5, 43, 'oeilj', 4); P.px(27.5, 43, 'oeilj', 4); P.membre(24, 46, 21, 49, 1, 'ombre', { niv: 1, trait: false }); }
    P.ligne(26 - 7 * s, 36, 26 - 7 * s, 50, 'reflet', 4); P.ligne(26 - 5 * s, 37, 26 - 5 * s, 41, 'reflet', 3);
    for (const [x, y] of [[3, 47 - i * 2], [-2, 40 + i], [6, 38]]) P.px(26 + x * s, y, 'reflet', 3); // bulles
    P.tronc(31, 34, 26 - 11 * s, 26 + 11 * s, 26 - 11 * s, 26 + 11 * s, 'metal2'); P.tronc(51, 53, 26 - 11 * s, 26 + 11 * s, 26 - 11 * s, 26 + 11 * s, 'metal2');
    for (const x of [-9, -3, 3, 9]) { P.px(26 + x * s, 32, 'blanc', 3); P.px(26 + x * s, 52, 'blanc', 3); }
    if (nid) { // têtes de serpenteaux qui dépassent
      for (const [x, h] of [[-5, 4 + i], [1, 6 - i], [6, 3 + i]]) { P.membre(26 + x, 31, 26 + x + 1, 31 - h, 1.1, 'serpent'); P.boule(26 + x + 1.5, 30.5 - h, 1.6, 1.2, 'serpent'); P.px(26 + x + 2, 30 - h, 'trait', 2); P.px(26 + x + 3, 31 - h, 'langue', 3); }
    } else { // buse d'acide
      P.membre(26, 31, 26, 26, 1.6, 'metal2'); P.boule(26, 25, 2.4, 1.4, 'metal2'); P.boule(26, 24.6, 1.4, 0.8, 'liquide', { niv: att ? 4 : 2, trait: false });
      if (att) P.apres(g => { g.fillStyle = '#9af0b0'; for (const [x, y] of [[25, 20], [27, 18], [24, 16]]) g.fillRect(x, y, 2, 2); });
    }
  },
};

// Méduse de chakra (ENM_064, volante) — cloche translucide constellée de points lumineux, tentacules qui ondulent
CREATURES.meduse = {
  alias: { m: 'cloche', l: 'clair', y: 'point', k: 'trait' },
  pal: palC({ cloche: '#a88ae0', clair: '#e0d0ff', point: '#f0f060', tentacule: '#c8b0f0' }),
  f(P, i) {
    for (let k = 0; k < 5; k++) { const x0 = 20 + k * 3, ph = (k + i) % 2 ? 1 : -1; P.ligne(x0, 47, x0 + ph, 50, 'tentacule', 3); P.ligne(x0 + ph, 50, x0, 53, 'tentacule', 2); P.ligne(x0, 53, x0 + ph, 55, 'tentacule', 1); }
    P.boule(26, 43, 8, 5.6, 'cloche');
    P.rect(18, 46, 17, 2, 'clair', 3); for (let x = 19; x < 34; x += 3) P.px(x, 48, 'cloche', 2);
    for (const [x, y] of [[-4, -3], [0, -4], [4, -2], [-2, 0], [3, 1]]) P.px(26 + x, 43 + y, 'point', 4);
    P.px(23, 44, 'trait', 2); P.px(29, 44, 'trait', 2);
  },
};

// Requin des canaux (ENM_067) — corps fuselé, aileron haut, ventre blanc, rangée de dents
CREATURES.requin = {
  miroir: true, alias: { b: 'peau', d: 'sombre', w: 'ventre', k: 'trait' },
  pal: palC({ peau: '#4a6a8a', sombre: '#34506a', ventre: '#e8f0f8', eau: '#8ac8f0' }),
  f(P, i, att) {
    const y = 49 - (att ? 2 : 0);
    P.poly([[12, y - 3 + i], [16, y - 1], [16, y + 2], [11, y + 4 - i]], 'peau', { niv: 2 }); // queue
    P.poly([[14, y], [24, y - 6], [36, y - 4], [41, y + 1], [36, y + 5], [22, y + 5]], 'peau', { cyl: true });
    P.poly([[18, y + 3], [36, y + 3], [39, y + 2], [36, y + 5], [22, y + 5]], 'ventre', { niv: 3 });
    P.poly([[23, y - 5], [27, y - 13], [30, y - 5]], 'peau', { niv: 3 }); // aileron
    P.poly([[27, y + 4], [30, y + 8], [32, y + 4]], 'sombre', { niv: 2 });
    P.px(35, y - 2, 'trait', 2); P.px(35, y - 3, 'blanc', 4);
    for (let x = 35; x < 40; x += 1.5) P.px(x, y + 2, 'blanc', 4);
    P.apres(g => { g.fillStyle = 'rgba(160,210,240,0.8)'; for (const [x, yy] of [[10, 55], [14, 54], [38, 55], [42, 54]]) g.fillRect(x, yy, 3, 1); });
  },
};

// Papillon de papier (ENM_096, kamikaze) — ailes de papier plié marquées de rouge
CREATURES.papillon_papier = {
  alias: { w: 'papier', d: 'pli', k: 'trait', r: 'marque' },
  pal: palC({ papier: '#f4f0e8', pli: '#c8c0b0', marque: '#c83a5a' }),
  f(P, i) {
    const y = 48;
    for (const c of [-1, 1]) { const o = i ? 0.55 : 1; P.poly([[26, y - 1], [26 + c * 7 * o, y - 6], [26 + c * 8 * o, y - 1], [26 + c * 2, y + 1]], 'papier', { niv: c < 0 ? 3 : 2 }); P.poly([[26, y + 1], [26 + c * 6 * o, y + 2], [26 + c * 5 * o, y + 6], [26 + c * 1, y + 3]], 'papier', { niv: 2 }); P.px(26 + c * 4 * o, y - 3, 'marque', 3); P.ligne(26 + c, y, 26 + c * 6 * o, y - 4, 'pli', 2); }
    P.membre(26, y - 3, 26, y + 4, 0.9, 'pli'); P.ligne(26, y - 3, 24, y - 6, 'trait', 1); P.ligne(26, y - 3, 28, y - 6, 'trait', 1);
  },
};

// Oiseaux (ENM_071 d'argile, kamikaze : mèche allumée ; ENM_045 marionnette volante : bois et fils)
CREATURES.oiseau_argile = {
  alias: { a: 'argile', d: 'sombre', k: 'trait', b: 'gris' },
  pal: palC({ argile: '#f0e8d8', sombre: '#b8ac98', gris: '#8a8aa0', meche: '#3a3040', feu: '#ffb040', fil: '#e8e8f8' }),
  f(P, i, att, d) {
    const y = 46, kam = d.comportement === 'kamikaze';
    for (const c of [-1, 1]) P.poly(i ? [[26 + c * 2, y], [26 + c * 8, y + 3], [26 + c * 12, y + 6], [26 + c * 5, y + 4]] : [[26 + c * 2, y], [26 + c * 7, y - 5], [26 + c * 12, y - 6], [26 + c * 9, y - 2], [26 + c * 4, y + 2]], 'argile', { niv: c < 0 ? 3 : 2 });
    P.poly([[24, y + 3], [26, y + 9], [28, y + 3]], 'sombre', { niv: 2 }); // queue
    P.boule(26, y + 1, 3.4, 3.6, 'argile');
    P.boule(26, y - 3.5, 2.6, 2.3, 'argile'); P.poly([[25, y - 2.5], [26, y], [27, y - 2.5]], 'sombre', { niv: 1 }); P.px(25, y - 4, 'trait', 2); P.px(27, y - 4, 'trait', 2);
    if (kam) { P.ligne(26, y - 6, 27, y - 9, 'meche', 2); P.apres(g => { g.fillStyle = i ? '#ff7a2a' : '#ffe060'; g.fillRect(26, y - 11, 2, 2); }); P.rect(25, y + 2, 2, 2, 'feu', 0); }
    else P.apres(g => { g.fillStyle = 'rgba(232,232,248,0.8)'; for (const x of [18, 34]) for (let yy = 30; yy < y - 4; yy++) g.fillRect(x, yy, 1, 1); });
  },
};

// Araignée d'argile (ENM_072, kamikaze) — petite, blanche, mèche allumée sur le dos
CREATURES.araignee_argile = {
  alias: { a: 'argile', d: 'sombre', k: 'trait' },
  pal: palC({ argile: '#f0e8d8', sombre: '#b8ac98', meche: '#3a3040' }),
  f(P, i) {
    for (const c of [-1, 1]) for (let k = 0; k < 3; k++) { const kx = 26 + c * (5 + k), ky = 49 + k + ((k + i) % 2 ? -1 : 0); P.ligne(26 + c * 2, 51 + k * 0.5, kx, ky, 'sombre', 1); P.ligne(kx, ky, kx + c, 55 - ((k + i) % 2), 'sombre', 1); }
    P.boule(26, 51, 4.4, 3.3, 'argile'); P.px(24.5, 52, 'trait', 2); P.px(27.5, 52, 'trait', 2);
    P.ligne(26, 48, 27, 45, 'meche', 2); P.apres(g => { g.fillStyle = i ? '#ff7a2a' : '#ffe060'; g.fillRect(27, 43, 2, 2); });
  },
};

// Hirondelle des ermites (ENM_092, volante) — queue fourchue, ventre blanc, ailes effilées
CREATURES.corbeau = {
  alias: { k: 'sombre', b: 'plume', r: 'ventre', y: 'bec' },
  pal: palC({ plume: '#2a2a3a', sombre: '#1c1c28', ventre: '#e02a2a', bec: '#d0a040' }),
  f(P, i) {
    const y = 46;
    for (const c of [-1, 1]) P.poly(i ? [[26 + c * 2, y], [26 + c * 9, y + 3], [26 + c * 13, y + 7], [26 + c * 6, y + 3]] : [[26 + c * 2, y], [26 + c * 8, y - 6], [26 + c * 13, y - 8], [26 + c * 8, y - 2], [26 + c * 3, y + 2]], 'plume', { niv: c < 0 ? 3 : 2 });
    P.poly([[24.5, y + 3], [23, y + 9], [26, y + 5], [29, y + 9], [27.5, y + 3]], 'plume', { niv: 1 });
    P.boule(26, y + 1, 3, 3.4, 'plume'); P.boule(26, y + 2, 1.8, 2, 'ventre', { trait: false });
    P.boule(26, y - 3, 2.4, 2.2, 'plume'); P.poly([[25, y - 2], [26, y + 0.5], [27, y - 2]], 'bec', { niv: 3 }); P.px(25, y - 3.5, 'blanc', 4); P.px(27, y - 3.5, 'blanc', 4);
  },
};

// Bête invoquée (ENM_074) — taureau hirsute aux cornes recourbées, tiges noires plantées dans l'échine, yeux rouges
CREATURES.bete = {
  miroir: true, alias: { b: 'poil', d: 'poil2', w: 'corne', k: 'trait', r: 'oeilr' },
  pal: palC({ poil: '#7a5a4a', poil2: '#5a4034', corne: '#e8e0d0', oeilr: '#ff4a3a', tige: { c: '#3a3a46', brille: true }, museau: '#c89a8a' }),
  f(P, i) {
    const cy = 45;
    const pattes = i ? [[16, 14], [20, 22], [31, 33], [35, 34]] : [[16, 17], [20, 19], [31, 30], [35, 37]];
    for (const [hx, fx] of pattes) { P.membre(hx, cy + 3, fx, 53.5, 2, 'poil2', { trait: false }); P.boule(fx + 0.4, 54.2, 2, 1.2, 'trait', { niv: 0, trait: false }); }
    P.membre(13, cy - 1, 9, cy + 4 + i, 1, 'poil2'); P.boule(8.6, cy + 5 + i, 1.4, 1.6, 'poil2');
    P.boule(24, cy, 11.5, 6.6, 'poil');
    for (const x of [16, 20, 24, 28]) P.ligne(x, cy - 6, x - 1, cy - 3, 'poil2', 1);
    for (const [x0, x1, y1] of [[19, 16, cy - 13], [24, 24, cy - 14], [28, 31, cy - 12]]) { P.membre(x0, cy - 5, x1, y1, 0.8, 'tige'); P.px(x1, y1 - 1, 'tige', 4); }
    const hx = 36, hy = cy + 1;
    P.boule(hx, hy, 5, 4.8, 'poil'); P.boule(hx + 3.5, hy + 2, 2.4, 2, 'museau');
    P.px(hx + 5, hy + 1.5, 'trait', 1); P.px(hx + 1.5, hy - 1, 'oeilr', 4);
    P.membre(hx - 1, hy - 3, hx - 3, hy - 7, 1.1, 'corne', { r1: 0.6 }); P.membre(hx + 2, hy - 3, hx + 5, hy - 7, 1.1, 'corne', { r1: 0.6 });
  },
};

// Masques flottants (ENM_016 tourelle à parchemins, ENM_077 masque élémentaire) — grand masque ovale aux orbites
// sombres ; celui des archives est frangé de talismans et flanqué de rouleaux qui tournent ; l'élémentaire porte une
// couronne de flammes. À l'attaque, les orbites et la bouche s'illuminent.
CREATURES.masque = {
  alias: { m: 'masque', d: 'sombre', k: 'trait', r: 'motif', f: 'flamme' },
  pal: palC({ masque: '#d8d0c0', motif: '#c83a2a', flamme: '#f07a2a', flamme2: '#ffd040', papier: '#f0e8d0', lueur: '#ffe0f0', rouleau: '#e8dcb8' }),
  f(P, i, att, d) {
    const p = d.params || {}, feu = p.proj === 'feu', y = 42 + (i ? -1 : 0);
    if (feu) for (let k = 0; k < 5; k++) { const x = 18 + k * 4, h = 5 + ((k + i) % 2) * 3 + (k === 2 ? 3 : 0); P.poly([[x - 2, y - 5], [x + (k % 2 ? 1 : -1), y - 5 - h], [x + 2, y - 5]], k % 2 ? 'flamme2' : 'flamme', { niv: 3 }); }
    if (p.motif === 'rotation') for (const c of [-1, 1]) { const x = 26 + c * 10, yy = y + (c * (i ? 2 : -2)); P.membre(x, yy - 5, x, yy + 5, 2, 'rouleau'); P.boule(x, yy - 5.5, 2.2, 1, 'motif'); P.boule(x, yy + 5.5, 2.2, 1, 'motif'); }
    if (!feu) for (const [x, l] of [[-5, 7], [-1, 9], [3, 8], [6, 6]]) { P.rect(26 + x, y + 5, 3, l, 'papier', 3); P.px(26 + x + 1, y + 7 + (x % 2 ? 1 : 0), 'motif', 2); } // talismans
    P.boule(26, y, 7, 7.6, 'masque');
    P.ligne(26, y - 7, 26, y - 3, 'motif', 2);
    const yo = att ? 'lueur' : 'trait', no = att ? 4 : 0;
    for (const c of [-1, 1]) { P.boule(26 + c * 3, y - 0.5, 1.8, 1.4, yo, { niv: no, trait: false }); P.ligne(26 + c * 1.5, y - 3, 26 + c * 5, y - 2.5, 'motif', 2); }
    P.boule(26, y + 4, att ? 2.2 : 1.6, att ? 1.6 : 0.9, yo, { niv: no, trait: false });
    P.px(22, y + 2, 'motif', 3); P.px(30, y + 2, 'motif', 3);
  },
};

// Statues (ENM_042 marionnette bouclier, ENM_047 marionnette géante, ENM_080 statue de pierre) — corps massif taillé ;
// la gardienne frontale tient un grand pavois ; la géante une massue ; la statue d'aura porte des runes et une couronne
// bleues. Les matières suivent leurs couleurs (bois pour les marionnettes, pierre pour la statue).
CREATURES.statue = {
  alias: { s: 'pierre', d: 'sombre', l: 'clair', k: 'trait', y: 'oeil' },
  pal: palC({ pierre: '#8a8a90', oeil: '#f0d060', rune: '#8ae0ff', pavois: '#6a5a4a', embleme: '#e8c050', massue: '#5a4e56', manche: '#7a5a3a' }),
  f(P, i, att, d) {
    const p = d.params || {}, b = i, frontal = p.bouclier === 'frontal', aura = p.bouclier === 'aura', lourd = d.comportement === 'lourd';
    const J = { k: 'pierre', kp: 'pierre', pied: 'botte', r: 2.4 };
    if (i) { shJambe(P, 22, 46, 21, 50, 20.5, 55, J); shJambe(P, 30, 46, 31, 50, 31.5, 54, J); }
    else { shJambe(P, 22, 46, 21, 50, 20.5, 54, J); shJambe(P, 30, 46, 31, 50, 31.5, 55, J); }
    if (lourd && !att) { P.membre(38, 47, 41, 30, 1.2, 'manche'); P.boule(41.5, 27, 3.6, 4.4, 'massue'); for (const [x, y] of [[39, 25], [43, 27], [41, 30]]) P.px(x, y, 'clair', 4); }
    P.tronc(31 + b, 47, 15.5, 36.5, 18, 34, 'pierre', { arrondi: 3 });
    P.rect(18, 44, 16, 2, 'pierre', 1); P.ligne(26, 33 + b, 26, 43, 'pierre', 1);
    for (const x of [16.5, 35.5]) P.boule(x, 33 + b, 3.6, 3, 'pierre');
    const hx = 26, hy = 25 + b;
    P.tronc(hy - 5, hy + 4, hx - 5, hx + 5, hx - 4.5, hx + 4.5, 'pierre', { arrondi: 2 }); // tête taillée
    P.rect(hx - 3, hy - 0.5, 2, 1, 'oeil', 4); P.rect(hx + 1, hy - 0.5, 2, 1, 'oeil', 4); P.rect(hx - 2, hy + 2, 4, 1, 'pierre', 0);
    if (aura) { for (const [x, y] of [[-6, 3], [5, 4], [0, 8], [-3, 12], [4, 11]]) P.px(hx + x, 33 + b + y, 'rune', 4); for (const k of [-1, 0, 1]) P.poly([[hx + k * 3 - 1, hy - 5], [hx + k * 3, hy - 8 - (k ? 0 : 2)], [hx + k * 3 + 1, hy - 5]], 'rune', { niv: 3 }); }
    if (frontal) { // grand pavois tenu devant
      P.tronc(36 + b, 52, 19, 33, 19.5, 32.5, 'pavois', { arrondi: 1 }); P.rect(19, 36 + b, 14, 1, 'clair', 3);
      P.piece().boule(26, 43 + b, 4, 4, 'embleme', { niv: 3 }).boule(26, 43 + b, 2.6, 2.6, 'pavois', { niv: 1, trait: false }).boule(26, 43 + b, 1.1, 1.1, 'embleme', { niv: 4, trait: false }).traitPiece(); // sceau
    } else {
      const ya = att ? 24 : 42 + b, B = { r: 2.2, rm: 2.8 };
      shBras(P, 17, 34 + b, 13, att ? 28 : 39 + b, 14, ya, 'pierre', 'pierre', B);
      if (lourd && att) { shBras(P, 35, 34 + b, 39, 28, 36, 22, 'pierre', 'pierre', B); P.membre(36, 22, 38, 13, 1.2, 'manche'); P.boule(38.5, 12, 4.4, 3.6, 'massue'); }
      else shBras(P, 35, 34 + b, 39, att ? 28 : 39 + b, 38, ya, 'pierre', 'pierre', B);
    }
  },
};

// Ombre de chakra (ENM_094) — masse sombre aux yeux rouges, volutes qui s'effilochent
CREATURES.ombre = {
  alias: { o: 'ombre', l: 'clair', r: 'oeilr', k: 'trait' },
  pal: palC({ ombre: '#2a1a3a', clair: '#5a3a7a', oeilr: '#ff4a4a' }),
  f(P, i) {
    for (let k = 0; k < 5; k++) { const x = 17 + k * 4.5, h = 3 + ((k + i) % 2) * 2; P.poly([[x - 2, 52], [x + ((k + i) % 2 ? 1 : -1), 52 + h], [x + 2, 52]], 'ombre', { niv: 1 }); }
    P.boule(26, 46, 10, 7, 'ombre');
    for (const [x, y] of [[-6, -4], [-2, -6], [4, -5]]) P.boule(26 + x, 46 + y, 2.5, 2, 'clair', { niv: 2, trait: false });
    P.rect(21, 45, 3, 1, 'oeilr', 4); P.rect(28, 45, 3, 1, 'oeilr', 4); P.px(22, 44, 'oeilr', 3); P.px(29, 44, 'oeilr', 3);
    P.apres(g => { g.fillStyle = 'rgba(90,58,122,0.7)'; for (const [x, y] of i ? [[13, 40], [38, 37], [27, 33]] : [[14, 36], [37, 41], [24, 34]]) g.fillRect(x, y, 2, 2); });
  },
};

// Queue de chakra (ENM_095, chargeur) — queue de flamme rouge qui jaillit d'une flaque de chakra, touffes qui brûlent ;
// elle s'enroule avant de fouetter.
CREATURES.queue = {
  alias: { q: 'chakra', l: 'clair', d: 'sombre' },
  pal: palC({ chakra: '#c83a2a', clair: '#f07a4a', coeur: '#ffd070' }),
  f(P, i, att) {
    const pts = att ? [[24, 55], [19, 50], [18, 43], [22, 38], [27, 38], [29, 42]] : [[24, 55], [25, 49], [24, 43], [26, 38], [30, 34], [34, 31 + i]];
    P.boule(24, 54.5, 7, 1.6, 'clair', { niv: 2 });
    for (let k = 0; k + 1 < pts.length; k++) { const [x0, y0] = pts[k], [x1, y1] = pts[k + 1]; P.membre(x0, y0, x1, y1, 4.4 - k * 0.7, 'chakra', { r1: 3.7 - k * 0.7, trait: false }); }
    for (let k = 1; k < pts.length; k++) { const [x, y] = pts[k], c = k % 2 ? -1 : 1; P.poly([[x - 1, y], [x + c * (4.5 - k * 0.5), y - 2 - (i + k) % 2], [x + 1, y - 1]], 'clair', { niv: 3, trait: false }); } // touffes
    for (let k = 0; k + 1 < pts.length; k++) P.ligne(pts[k][0] - 1, pts[k][1] - 1, pts[k + 1][0] - 1, pts[k + 1][1] - 1, 'coeur', 4);
    const [tx, ty] = pts[pts.length - 1]; P.poly([[tx - 1.5, ty], [tx + 3, ty - 4 - i], [tx + 1.5, ty + 1]], 'coeur', { niv: 4 });
    P.apres(g => { g.fillStyle = '#ffb060'; for (const [x, y] of i ? [[16, 46], [33, 42], [28, 29]] : [[31, 47], [16, 40], [37, 33]]) g.fillRect(x, y, 1, 2); });
  },
};

// Serpenteaux (ENM_059, nuée) — minuscules serpents blancs
CREATURES.serpenteau = {
  miroir: true, alias: { s: 'ecaille', d: 'sombre', k: 'trait' },
  pal: palC({ ecaille: '#e8e4d0', sombre: '#b8b4a0', langue: '#d83a3a' }),
  f(P, i) {
    for (let k = 0; k < 7; k++) { const t = k / 6; P.boule(20 + t * 9, 54 - Math.sin(t * 6 + i * 3) * 0.8, 0.8 + t * 0.8, 0.8 + t * 0.6, 'ecaille', { trait: false }); }
    P.boule(30.5, 51.5, 1.8, 1.4, 'ecaille'); P.px(31, 51, 'trait', 2); P.px(32.5, 52, 'langue', 3);
  },
};

// ── Assemblage ──
const _creatures = new WeakMap();
function spriteCreature(d, S) {
  let r = _creatures.get(S); if (r) return r;
  const F = CREATURES[S.cle], pal = Object.assign({}, F.pal);
  for (const [k, v] of Object.entries(S.couleurs || {})) pal[(F.alias || {})[k] || k] = v;
  r = { frames: peindreTrois(pal, (P, i, att) => F.f(P, i, att, d)), miroir: !!F.miroir, base: 1, attaque: true };
  _creatures.set(S, r); return r;
}
