// ═══════════════════════════════════════════════════════════════════════════
// Boss peints : les mêmes primitives en volume que les shinobi ennemis
// (25_shinobi.js), mais peintes deux fois plus finement (E = 2) — visages
// détaillés (iris, reflets, marques), plis, motifs de tenue, armes signatures.
// Les personnages canoniques sont des interprétations originales ; les
// créatures et gardiens sont des créations originales.
// Trois images par forme : deux de marche, une d'attaque (montrée pendant
// l'annonce et l'exécution d'une attaque). Certaines fiches ont plusieurs
// formes (frères, trio, carapace de Sasori, rituel de Hidan…).
// ═══════════════════════════════════════════════════════════════════════════

const BOSS_PEINTS = {};
const EB = 2; // échelle de peinture des boss
// Palette de base des boss : celle des shinobi + iris, cheveux et tenue de l'organisation
const pb = o => Object.assign({}, P_BASE, { iris: '#4a3a2a', rouge: '#d8202a', nuage: '#c8283a', nuageb: '#f4f0ec', cape: '#24222e', capeint: '#a8283a' }, o);

// ── Visages ─────────────────────────────────────────────────────────────────
// Gabarits d'yeux (œil gauche à l'écran ; le droit est son miroir), un caractère = un pixel réel :
// k trait sombre, w blanc, h reflet, p pupille, i iris, I iris sombre, r rouge, R rouge sombre, b blanc bleuté
const YEUX_BOSS = {
  normal: ['.kkk', 'kwhp', '.wii'],
  ouvert: ['.kkk', 'kwhi', 'kwip', '.wii'],
  fente: ['kkk.', '.whp', '..ii'],
  dur: ['kkkk', '.hip', '..ii'],
  ferme: ['....', 'kkkk', '....'],
  rond: ['.kk.', 'kwwk', 'kwpk', '.kk.'],
  petit: ['.kk.', 'kwpk', '.ww.'],
  sharingan: ['.kkk', 'wrpr', '.rRr'],
  rinnegan: ['.kkk', 'kiIi', 'kIhI', '.iIi'],
  byakugan: ['.kkk', 'kbbb', '.bbb'],
  serpent: ['kkkk', 'kiip', '.iip'],
  cerne: ['.kkk.', 'kwhik', 'kwwik', '.kkk.'],
  lueur: ['.hhh', 'hiii', '.ii.'],
};
const CODES_YEUX = { k: ['oeil', 0], w: ['blanc', 3], h: ['blanc', 4], p: ['oeil', 1], i: ['iris', 2], I: ['iris', 1], r: ['rouge', 3], R: ['rouge', 1], b: ['blanc', 2] };
// Deux yeux autour de (cx, cy) (unités), écart e (unités) ; o.sourcil : 'colere' | 'doux' | 'leve' ; o.k : matière des sourcils
function bsYeux(P, cx, cy, style = 'normal', o = {}) {
  const G = Array.isArray(style) ? style : YEUX_BOSS[style] || YEUX_BOSS.normal, e = o.ecart ?? 2.4, L = G[0].length;
  const XL = Math.round((cx - e) * EB - L / 2), XR = Math.round(2 * cx * EB) - XL - L, Y0 = Math.round(cy * EB) - 1;
  G.forEach((ligne, j) => { for (let q = 0; q < L; q++) {
    const Cg = CODES_YEUX[ligne[q]], Cd = CODES_YEUX[ligne[L - 1 - q]];
    if (Cg) P.point((XL + q) / EB, (Y0 + j) / EB, o[Cg[0]] || Cg[0], Cg[1]);
    if (Cd && !o.seul) P.point((XR + q) / EB, (Y0 + j) / EB, o[Cd[0]] || Cd[0], Cd[1]);
  } });
  if (o.sourcil) for (const c of o.seul ? [-1] : [-1, 1]) for (let q = 0; q <= L; q++) { // q = 0 : bout extérieur
    const t = q / L, dy = o.sourcil === 'colere' ? Math.round(t * 2) : o.sourcil === 'doux' ? -Math.round(t) : o.sourcil === 'leve' ? -Math.round(Math.sin(t * Math.PI) * 1.4) : 0;
    P.point((c < 0 ? XL - 1 + q : XR + L - q) / EB, (Y0 - 2 + dy) / EB, o.ksourcil || 'oeil', 1);
  }
}
// Pose un gabarit de pixels réels en (X0, Y0) (pixels) ; codes : { car: [matière, niveau] }
function bsGabarit(P, X0, Y0, lignes, codes, miroir = false) {
  lignes.forEach((l, j) => { for (let q = 0; q < l.length; q++) { const C = codes[miroir ? l[l.length - 1 - q] : l[q]]; if (C) P.point((X0 + q) / EB, (Y0 + j) / EB, C[0], C[1]); } });
}
// Bouche : 'trait', 'sourire', 'rictus', 'dents' (rangée blanche), 'crocs' (dents pointues de requin)
function bsBouche(P, cx, cy, type = 'trait', l = 2) {
  const X = Math.round(cx * EB), Y = Math.round(cy * EB), n = Math.round(l * EB);
  if (type === 'trait') for (let q = 0; q < n; q++) P.point((X - n / 2 + q) / EB, Y / EB, 'oeil', 1);
  else if (type === 'sourire') { for (let q = 0; q < n; q++) P.point((X - n / 2 + q) / EB, (Y + (q === 0 || q === n - 1 ? 0 : 1)) / EB, 'oeil', 1); }
  else if (type === 'rictus') { for (let q = 0; q < n; q++) P.point((X - n / 2 + q) / EB, (Y + (q < n / 2 ? 0 : -Math.round((q - n / 2) / 2))) / EB, 'oeil', 1); }
  else if (type === 'dents' || type === 'crocs') {
    for (let q = -1; q <= n; q++) { P.point((X - n / 2 + q) / EB, (Y - 1) / EB, 'oeil', 0); P.point((X - n / 2 + q) / EB, (Y + 2) / EB, 'oeil', 0); }
    for (let q = 0; q < n; q++) { P.point((X - n / 2 + q) / EB, Y / EB, 'blanc', type === 'crocs' && q % 2 ? 1 : 3); P.point((X - n / 2 + q) / EB, (Y + 1) / EB, type === 'crocs' && q % 2 === 0 ? 'oeil' : 'blanc', type === 'crocs' ? (q % 2 ? 3 : 0) : 2); }
  }
}
// Nuage rouge cerné de blanc (manteau de l'organisation), peint au pixel près : union de lobes, liseré blanc,
// bas des lobes plus sombre ; (x, y) : centre en unités, s : taille (1 ≈ 13 × 8 pixels)
function bsNuage(P, x, y, s = 1) {
  const L = [[-3.6, 0.6, 2.6], [0, -1, 3.4], [3.8, 0.8, 2.4], [-1.6, 2.2, 2], [2, 2.4, 1.8]].map(([a, c, r]) => [a * s, c * s, r * s]);
  const X = Math.round(x * EB), Y = Math.round(y * EB), R = Math.ceil(6.5 * s) + 2, dans = (u, v) => L.some(([a, c, r]) => (u + 0.5 - a) ** 2 + (v + 0.5 - c) ** 2 <= r * r);
  for (let v = -R; v <= R; v++) for (let u = -R; u <= R; u++) {
    if (dans(u, v)) { const bas = !dans(u, v + 1), haut = !dans(u, v - 1); P.point((X + u) / EB, (Y + v) / EB, 'nuage', bas ? 1 : haut && u < 0 ? 3 : 2); }
    else if (dans(u - 1, v) || dans(u + 1, v) || dans(u, v - 1) || dans(u, v + 1)) P.point((X + u) / EB, (Y + v) / EB, 'nuageb', 3);
  }
}
// Visage : boule de peau à l'ombrage adouci (l'ombre ne mord que le bord opposé à la lumière)
function bsVisage(P, hx, hy, rx = 4.4, ry = 4.3, k = 'peau') { return P.boule(hx, hy, rx, ry, k, { plus: 0.32 }); }
// Manteau de l'organisation : long manteau noir à haut col doublé de rouge, nuages ; b : rebond de marche.
// o : { bas (ourlet), col (hauteur du col, 0 = ouvert), nuages: [[x, y, s]], ouvert (torse visible), large }
function bsManteauAka(P, b, o = {}) {
  const yb = o.bas ?? 51, l = o.large || 0, yh = (o.epaules ?? 33) + b;
  P.tronc(yh, yb, 20 - l, 32 + l, 17.5 - l, 34.5 + l, 'cape', { arrondi: 2.5, degrade: 0.25 });
  P.piece(); P.ligneFine(26, yh + 3, 26, yb, 'cape', 0); P.ligneFine(22, yh + 9, 20.5, yb, 'cape', 1); P.ligneFine(30.5, yh + 9, 32, yb, 'cape', 1); P.traitPiece(); // pli central et plis
  if (o.ouvert) { P.poly([[23.5, yh + 1], [28.5, yh + 1], [27, yh + 9], [25, yh + 9]], 'peau', { cyl: true }); }
  for (const [x, y, s] of o.nuages || [[22, 41, 1], [30, 47.5, 0.9], [21, 49.5, 0.8]]) bsNuage(P, x, y + b, s);
  P.rect(17.5 - l, yb, 17 + 2 * l, 0.5, 'capeint', 1); // doublure rouge à l'ourlet
}
function bsColAka(P, hx, yh, b, o = {}) { // haut col doublé de rouge, ouvert en V
  const h = o.h ?? 4;
  P.poly([[hx - 6, yh + b], [hx - 5.5, yh - h + b], [hx - 1, yh - h + 1.5 + b], [hx - 0.5, yh + 1.5 + b]], 'cape', { cyl: true });
  P.poly([[hx + 6, yh + b], [hx + 5.5, yh - h + b], [hx + 1, yh - h + 1.5 + b], [hx + 0.5, yh + 1.5 + b]], 'cape', { cyl: true });
  P.ligneFine(hx - 5.5, yh - h + b, hx - 1, yh - h + 1.5 + b, 'capeint', 2); P.ligneFine(hx + 5.5, yh - h + b, hx + 1, yh - h + 1.5 + b, 'capeint', 2);
}
// Jambes de boss : pantalon, chaussure ; écart de marche ; o comme shJambe
function bsJambes(P, i, o = {}, ecart = 0) {
  const J = Object.assign({ r: 2 }, o), g = 23.5 - ecart, d = 28.5 + ecart, hy = o.hy ?? 45;
  if (i) { shJambe(P, g, hy, g - 1, hy + 5, g - 1.5, 55, J); shJambe(P, d, hy, d + 1, hy + 5, d + 1.5, 54, J); }
  else { shJambe(P, g, hy, g - 1, hy + 5, g - 1.5, 54, J); shJambe(P, d, hy, d + 1, hy + 5, d + 1.5, 55, J); }
}
// Bandeau frontal fin (plaque gravée, rayée chez les déserteurs) ; incline : décalage vertical gauche-droite
function bsBandeau(P, hx, y, rx, o = {}) {
  const k = o.k || 'bandeau', inc = o.incline || 0;
  P.piece(); P.poly([[hx - rx, y + inc], [hx + rx, y - inc], [hx + rx, y - inc + 1.6], [hx - rx, y + inc + 1.6]], k, { niv: 2 });
  P.ligneFine(hx - rx, y + inc + 1.5, hx + rx, y - inc + 1.5, k, 1);
  const l = o.plaque ?? 5, px0 = hx - l / 2 + (o.dx || 0);
  P.poly([[px0, y + inc * 0.3 - 0.2], [px0 + l, y - inc * 0.3 - 0.2], [px0 + l, y - inc * 0.3 + 1.7], [px0, y + inc * 0.3 + 1.7]], 'metal', { niv: 3 });
  P.ligneFine(px0, y + inc * 0.3 + 1.6, px0 + l, y - inc * 0.3 + 1.6, 'metal', 1); P.point(px0 + 0.5, y + 0.3, 'metal', 4);
  if (o.symbole) o.symbole(px0 + l / 2, y + 0.7);
  if (o.raye) P.ligneFine(px0 + 0.5, y + 1.3, px0 + l - 0.5, y + 0.1, 'oeil', 1);
  P.traitPiece();
}
// Lueur ronde après contour (chakra, yeux) — en unités
function bsLueur(P, x, y, r, c1, c2) { shLueur(P, x, y, r, c1, c2); }
function bsEtincelles(P, pts, couleur) { P.apres((g, E) => { g.fillStyle = couleur; for (const [x, y, t = 1] of pts) g.fillRect(Math.round(x * E), Math.round(y * E), t, t); }); }

// Les fiches (BOSS_PEINTS.nom = { pal, f(P, i, att, forme), formes? }) sont dans 25_shinobi_boss_1.js et _2.js.

// ── Assemblage : 3 images par forme, recadrées ensemble (même ancrage pour toutes les formes) ──
const _bossPeints = {};
function spriteBossPeint(nom, contours) {
  const cle = nom + '|' + (contours ?? ''); if (_bossPeints[cle]) return _bossPeints[cle];
  const F = BOSS_PEINTS[nom]; if (!F) return null; const n = F.formes || 1;
  return (_bossPeints[cle] = { frames: peindreTrois(F.pal, (P, i, att, forme) => F.f(P, i, att, forme), EB, 3 * n, contours ?? F.contours ?? 1), miroir: F.miroir !== false, base: 2, attaque: true, formes: n });
}
// Forme affichée : rituel de Hidan (corps marqué), sinon e.forme (frères, trio, carapace…)
function formeBoss(e) { return e.rituel && e.rituel.actif ? 1 : e.forme || 0; }
