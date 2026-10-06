// ═══════════════════════════════════════════════════════════════════════════
// Boss peints, chapitres I et II (étages 1 à 4). Voir 25_shinobi_boss.js.
// Toile 52 × 60 unités peinte à l'échelle 2 ; axe du corps x = 26 ; pieds sur la ligne 55.
// ═══════════════════════════════════════════════════════════════════════════

// Grand shuriken à quatre lames incurvées, anneau central
function bsFuma(P, cx, cy, R, rot, k = 'shuriken') {
  const pt = (an, r) => [cx + Math.cos(an) * r, cy + Math.sin(an) * r];
  for (let q = 0; q < 4; q++) { const a = rot + q * Math.PI / 2; P.poly([pt(a - 0.55, 1.9), pt(a, R), pt(a + 0.22, R * 0.62), pt(a + 0.95, 2.1)], k, { relief: true, niv: q % 2 ? 2 : 3 }); }
  P.boule(cx, cy, 2, 2, k, { plus: 0.2 }); P.boule(cx, cy, 0.9, 0.9, 'oeil', { niv: 1, trait: false });
}
// Trou rond (pixels retirés en croix arrondie), en unités
function bsTrou(P, x, y, r = 1) { P.effacer(x - r, y - r / 2, 2 * r, r); P.effacer(x - r / 2, y - r, r, 2 * r); }
// Rayures fines en diagonale sur une zone (camouflage, bandages)
function bsRayures(P, x0, y0, l, h, pas, k, v) { P.piece(); for (let y = y0; y < y0 + h; y += pas) P.ligneFine(x0, y + 0.6, x0 + l, y - 0.6, k, v); P.traitPiece(); }

// ═══ Étage 1 ═══
// BOS_001 Mizuki — instructeur traître : gilet de chūnin garni de rouleaux, cheveux argentés mi-longs sous un bandana
// à plaque, deux grands shuriken croisés dans le dos ; à l'attaque, il en brandit un au-dessus de sa tête.
BOSS_PEINTS.mizuki = {
  pal: pb({ peau: '#efc29a', cheveux: '#c4cad8', gilet: '#5e7a3e', poche: '#4e6634', haut: '#2e3a5a', pantalon: '#2a3452', sandale: '#2c3a5c', bandeau: '#2a3452', bandes: '#e8e0cc', shuriken: { c: '#9aa2b0', brille: true }, rouleau: '#d8c8a0', iris: '#5a4a6a' }),
  f(P, i, att) {
    const b = i * 0.5;
    if (!att) { bsFuma(P, 18.5, 31 + b, 8, 0.35); bsFuma(P, 33.5, 32 + b, 7.5, 1.05); } else bsFuma(P, 19, 33 + b, 7.5, 0.35);
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', bandes: 'bandes', r: 1.9 });
    shBras(P, 21, 34.5 + b, 18.5, 39.5 + b, 19, 43.5 + b, 'haut', 'peau', { r: 1.7 });
    P.tronc(32.5 + b, 46, 20.5, 31.5, 21.5, 30.5, 'haut', { arrondi: 2 });
    P.tronc(33 + b, 45.5, 20.5, 31.5, 21, 31, 'gilet', { arrondi: 2.5 });
    for (const x of [21.5, 27]) { P.piece().rect(x, 37.5 + b, 3.5, 3.5, 'poche', 2).rect(x, 37.5 + b, 3.5, 0.5, 'gilet', 3).traitPiece(); for (const dx of [0.5, 1.5, 2.5]) P.membre(x + dx + 0.25, 36.3 + b, x + dx + 0.25, 37.6 + b, 0.45, 'rouleau', { trait: false }); }
    P.ligneFine(26, 34 + b, 26, 45, 'poche', 1); P.rect(20.5, 44 + b * 0.5, 11, 1.5, 'poche', 1);
    P.boule(26, 33 + b, 5.6, 1.9, 'gilet'); // col épais
    const hx = 26.5, hy = 25.5 + b;
    P.poly([[hx - 5.8, hy - 1], [hx + 5.8, hy - 1], [hx + 6.3, hy + 6.5], [hx + 4.5, hy + 8], [hx + 3.4, hy + 3.5], [hx - 3.4, hy + 3.5], [hx - 4.5, hy + 8], [hx - 6.5, hy + 6.5]], 'cheveux', { cyl: true });
    bsVisage(P, hx, hy + 0.8, 4.5, 4.4);
    P.membre(hx - 5, hy - 1.5, hx - 8, hy + 1.5 + b, 0.8, 'bandeau', { trait: false }); P.membre(hx - 5, hy - 1.2, hx - 7.6, hy + 3 + b, 0.6, 'bandeau', { trait: false });
    P.boule(hx, hy - 0.8, 5.4, 4.8, 'bandeau', { coupe: hy - 0.4 });
    P.piece().rect(hx - 2.2, hy - 2.9, 4.4, 1.8, 'metal', 3).ligneFine(hx - 2.2, hy - 1.2, hx + 2.2, hy - 1.2, 'metal', 1).point(hx - 1.8, hy - 2.7, 'metal', 4).traitPiece();
    P.poly([[hx - 5.3, hy - 0.6], [hx - 3.4, hy - 0.6], [hx - 3.9, hy + 3.5], [hx - 5.5, hy + 2.8]], 'cheveux', { cyl: true });
    P.poly([[hx + 3.4, hy - 0.6], [hx + 5.3, hy - 0.6], [hx + 5.5, hy + 2.8], [hx + 3.9, hy + 3.5]], 'cheveux', { cyl: true });
    P.assombrir(hx - 3.4, hy - 0.4, 6.8, 0.5, 1);
    bsYeux(P, hx + 0.2, hy + 1.4, 'fente', { ecart: 2.1, sourcil: 'colere', ksourcil: 'cheveux' });
    bsBouche(P, hx + 0.6, hy + 3.9, 'rictus', 2.5);
    if (att) {
      shBras(P, 31, 34.5 + b, 34, 29, 32.5, 22, 'haut', 'peau', { r: 1.7 }); bsFuma(P, 32.5, 14.5, 8.5, 0.2);
      P.apres((g, E) => { g.globalAlpha = 0.5; g.strokeStyle = '#e8f0ff'; g.lineWidth = 1; g.beginPath(); g.arc(32.5 * E, 14.5 * E, 10 * E, -2.6, -0.5); g.stroke(); g.globalAlpha = 1; });
    } else shBras(P, 31, 34.5 + b, 33.5, 39.5 + b, 33, 43.5 + b, 'haut', 'peau', { r: 1.7 });
  },
};

// ═══ Étage 2 ═══
// BOS_004 Zabuza — torse nu sanglé, bas du visage bandé, bandeau porté de travers, manchettes et jambières de camouflage ;
// le grand couperet (lame percée, encoche en demi-lune) repose sur l'épaule ; à l'attaque, il fauche à l'horizontale.
BOSS_PEINTS.zabuza = {
  pal: pb({ peau: '#e6b48e', cheveux: '#24242c', bandes: '#ece6d6', pantalon: '#4a5266', camo: '#8a94a0', sangle: '#5a4a3a', sandale: '#3a404e', bandeau: '#4a5266', lame: { c: '#c8d0dc', brille: true }, tsuka: '#3a2a2a', iris: '#2a2a30' }),
  f(P, i, att) {
    const b = i * 0.5;
    const couperet = (pts, trou, encoche) => { P.poly(pts, 'lame', { relief: true, niv: 2 }); P.ligneFine(pts[0][0], pts[0][1], pts[1][0], pts[1][1], 'lame', 4); P.ligneFine(pts[2][0], pts[2][1], pts[3][0], pts[3][1], 'lame', 1); bsTrou(P, trou[0], trou[1], 1); P.boule(encoche[0], encoche[1], 1.7, 1.7, 'lame', { niv: 1, trait: false }); P.effacer(encoche[0] - 1, encoche[1] - 1, 2, 2); };
    if (!att) couperet([[29.5, 32 + b], [11.5, 14.5 + b], [8, 19 + b], [26, 35.5 + b]], [12.3, 18.2 + b], [8.6, 17.6 + b]);
    bsJambes(P, i, { k: 'pantalon', kb: 'camo', kp: 'sandale', r: 2.1 });
    for (const x of [21.8, 30]) bsRayures(P, x - 1.8, 49, 3.6, 4.5, 1.4, 'camo', 0);
    shBras(P, 21, 34 + b, 18, 39 + b, 18.5, 43.5 + b, 'peau', 'peau', { r: 1.9, kav: 'camo' });
    bsRayures(P, 16.8, 39.5 + b, 3.4, 3.4, 1.3, 'camo', 0);
    P.tronc(32 + b, 45.5, 19.5, 32.5, 21.5, 30.5, 'peau', { arrondi: 3 }); // torse nu
    P.piece(); P.ligneFine(26, 34.5 + b, 26, 42 + b, 'peau', 1); P.ligneFine(22, 37 + b, 25, 37.5 + b, 'peau', 1); P.ligneFine(27, 37.5 + b, 30, 37 + b, 'peau', 1);
    for (const y of [39.5, 41.5]) { P.ligneFine(23.5, y + b, 25.5, y + b, 'peau', 1); P.ligneFine(26.5, y + b, 28.5, y + b, 'peau', 1); } P.traitPiece();
    P.piece(); P.poly([[20.5, 33 + b], [22.5, 32.5 + b], [31, 43 + b], [29, 44 + b]], 'sangle', { niv: 2 }); P.ligneFine(21, 33.5 + b, 29.5, 43.5 + b, 'sangle', 3); P.traitPiece();
    P.tronc(43.5 + b * 0.5, 46.5, 21, 31, 21, 31, 'pantalon'); P.rect(21, 43.5 + b * 0.5, 10, 1, 'sangle', 1);
    const hx = 26, hy = 25.5 + b;
    P.boule(hx, hy - 0.5, 5.2, 5, 'cheveux');
    shPointes(P, hx, hy, 5.4, 'cheveux', [[-70, 2.5, 3], [-35, 3, 3.4], [0, 3, 3.4], [35, 2.6, 3], [75, 2, 2.6]]);
    bsVisage(P, hx + 0.3, hy + 0.8, 4.5, 4.4);
    bsBandeau(P, hx, hy - 3.2, 5.3, { incline: 0.9, dx: -1.2, plaque: 4.4, raye: true });
    bsYeux(P, hx + 0.4, hy + 0.8, 'dur', { ecart: 2.2 });
    P.tronc(hy + 2.3, hy + 5.8, hx - 4.6, hx + 4.8, hx - 3.6, hx + 3.8, 'bandes');
    P.piece(); P.ligneFine(hx - 4, hy + 3.5, hx + 4, hy + 4.2, 'bandes', 2); P.ligneFine(hx - 3.5, hy + 5, hx + 3.5, hy + 4.4, 'bandes', 2); P.traitPiece();
    P.membre(hx - 4.5, hy + 3, hx - 7.5, hy + 5.5 + b, 0.5, 'bandes', { trait: false });
    if (att) {
      shBras(P, 30.5, 34 + b, 33, 38, 35, 39, 'peau', 'peau', { r: 1.9, kav: 'camo' }); P.membre(34, 39, 38, 39, 0.8, 'tsuka');
      couperet([[37.5, 37], [51, 33], [51.5, 41], [37.5, 41.5]], [48.5, 37.5], [51.2, 35.4]);
      P.apres((g, E) => { g.globalAlpha = 0.45; g.fillStyle = '#e8f4ff'; for (let k = 0; k < 4; k++) g.fillRect((14 + k * 6) * E, (31 - k) * E, 5 * E, 1); g.globalAlpha = 1; });
    } else { P.membre(29.5, 31.5 + b, 33.5, 35 + b, 0.8, 'tsuka'); shBras(P, 31, 34 + b, 34.5, 38.5 + b, 32.3, 34.2 + b, 'peau', 'peau', { r: 1.9, kav: 'camo' }); }
  },
};

// ═══ Étage 4 ═══
// BOS_009 Gaara — long manteau brun-rouge, large sangle claire, grande gourde de sable dans le dos ; cheveux rouges
// en mèches, yeux cernés de noir, marque rouge au front ; bras croisés, il lève la main pour lancer le sable.
BOSS_PEINTS.gaara = {
  pal: pb({ peau: '#f0d4b4', cheveux: '#c8382a', manteau: '#7a3428', gourde: '#d8b884', bouchon: '#8a5a3a', sangle: '#e8dcc0', pantalon: '#5a2a22', sandale: '#4a2a22', cerne: '#2a1a24', iris: '#4aa890', sable: '#d8b070', tatouage: '#e03a3a' }),
  f(P, i, att) {
    const b = i * 0.5;
    P.boule(19.5, 31.5 + b, 3.8, 3.6, 'gourde'); P.rect(18.6, 27 + b, 2, 2, 'gourde', 2); P.boule(19.6, 26.6 + b, 1.5, 1.1, 'bouchon');
    P.boule(21, 41 + b, 6.8, 6.4, 'gourde');
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.9 });
    P.tronc(33 + b, 51, 20.5, 31.5, 19, 33, 'manteau', { arrondi: 2.5, degrade: 0.2 });
    P.piece(); P.ligneFine(26, 37 + b, 26, 51, 'manteau', 1); P.ligneFine(22, 44, 20.5, 51, 'manteau', 1); P.traitPiece();
    P.poly([[20.5, 33.5 + b], [23.5, 32.5 + b], [32, 45], [29, 46]], 'sangle', { cyl: true });
    const hx = 26, hy = 25.5 + b;
    P.boule(hx, hy - 0.6, 5.3, 5, 'cheveux');
    shPointes(P, hx, hy - 0.5, 5.3, 'cheveux', [[-110, 2.4, 3], [-80, 3.2, 3.2], [-50, 3.4, 3.2], [-20, 3, 3], [10, 3.2, 3], [40, 3.2, 3.2], [70, 3, 3], [100, 2.4, 2.8]]);
    bsVisage(P, hx + 0.2, hy + 1, 4.4, 4.3);
    P.poly([[hx - 4.6, hy - 1.3], [hx - 3.2, hy + 0.9], [hx - 2, hy - 0.8], [hx - 0.6, hy + 0.7], [hx + 0.7, hy - 1], [hx + 1.6, hy - 0.2], [hx + 3.3, hy - 1.4], [hx + 4.7, hy + 0.6], [hx + 4.9, hy - 2.6], [hx - 4.7, hy - 2.6]], 'cheveux', { niv: 2, trait: false });
    bsGabarit(P, Math.round((hx + 1.7) * EB), Math.round((hy - 0.9) * EB), ['t.t', '.tt', 'tt.'], { t: ['tatouage', 3] });
    bsYeux(P, hx + 0.2, hy + 1.7, 'cerne', { ecart: 2.3, oeil: 'cerne' });
    bsBouche(P, hx + 0.4, hy + 4.1, 'trait', 1.5);
    if (att) { // main tendue : le sable jaillit
      shBras(P, 21, 34.5 + b, 20, 40 + b, 22.5, 43.5 + b, 'manteau', 'peau', { r: 1.8 });
      shBras(P, 31, 34.5 + b, 35, 36.5, 39, 35.5, 'manteau', 'peau', { r: 1.8 });
      for (const [x, y, r] of [[42.5, 34.5, 2.4], [45.5, 31, 1.9], [44.5, 38, 1.7], [48, 34.5, 1.5], [41, 29.5, 1.2], [48.5, 29, 1]]) P.boule(x, y, r, r * 0.85, 'sable');
      bsEtincelles(P, [[40, 33], [50, 32], [47, 39.5], [43, 27], [51, 36]], '#f0d8a0');
    } else { // bras croisés
      shBras(P, 21, 34.5 + b, 20, 40 + b, 27.5, 40.5 + b, 'manteau', 'peau', { r: 1.8 });
      shBras(P, 31, 34.5 + b, 32, 40 + b, 24.5, 39.5 + b, 'manteau', 'peau', { r: 1.8 });
    }
  },
};

// BOS_003 Les frères démons — tunique sombre, cape en lambeaux, masque respirateur à deux filtres, bandeau à cornes
// (une corne pour l'aîné, deux pour le cadet), gantelet griffu ; à l'attaque, ils bondissent griffes en avant.
BOSS_PEINTS.freres = {
  formes: 2,
  pal: pb({ peau: '#e2c2a2', cheveux: '#2a2a30', tunique: '#4a5048', cape: '#33372f', pantalon: '#3a3c38', sandale: '#2e302c', respi: { c: '#8a929c', brille: true }, filtre: '#4a5058', corne: '#e0dccc', bandeau: '#3a3c44', griffe: { c: '#c8d0dc', brille: true }, gant: '#5a5a62', iris: '#6a2a2a' }),
  f(P, i, att, forme) {
    const b = i * 0.5, cadet = forme === 1, s = cadet ? -1 : 1; // le cadet porte le gantelet à gauche
    // cape en lambeaux derrière
    P.poly([[19, 33 + b], [33, 33 + b], [35.5, 49], [33, 47.5], [31.5, 50.5], [28.5, 48], [26, 51], [23.5, 48], [21, 50.5], [18.5, 47.5], [16.5, 49]], 'cape', { cyl: true });
    if (cadet) { P.poly([[hxF(cadet) - 4.6, 25 + b], [hxF(cadet) + 4.6, 25 + b], [hxF(cadet) + 5.6, 36 + b], [hxF(cadet) - 5.6, 36 + b]], 'cheveux', { cyl: true }); } // longs cheveux du cadet
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.9, bandes: 'filtre' }, att ? 1 : 0);
    const gant = (sx, sy, cx, cy, hx, hy, dir) => { shBras(P, sx, sy, cx, cy, hx, hy, 'tunique', 'gant', { r: 1.9, kav: 'gant', rm: 2.3 }); for (const k of [-1, 0, 1]) P.poly([[hx + dir * 1.2, hy + k * 1.1 - 0.4], [hx + dir * 5.2, hy + k * 1.6 + 0.3], [hx + dir * 1.4, hy + k * 1.1 + 0.6]], 'griffe', { niv: 3 }); };
    const L = [21, 34.5 + b], R = [31, 34.5 + b];
    if (s < 0) { if (att) gant(L[0], L[1], 16, 37, 12, 35.5, -1); else gant(L[0], L[1], 18.5, 40 + b, 17.5, 44.5 + b, -1); }
    else shBras(P, L[0], L[1], 18.5, 39.5 + b, 19, 44 + b, 'tunique', 'peau', { r: 1.8 });
    P.tronc(32.5 + b, 46, 20, 32, 21, 31, 'tunique', { arrondi: 2.5 });
    P.piece(); for (const y of [37, 40, 43]) P.ligneFine(21, y + b, 31, y + b, 'tunique', 1); P.traitPiece(); // tunique matelassée
    P.boule(26, 33 + b, 6, 2.2, 'cape'); // col de la cape
    const hx = hxF(cadet), hy = 25.5 + b;
    P.boule(hx, hy - 0.5, 5.1, 4.9, 'cheveux');
    if (!cadet) shPointes(P, hx, hy - 0.5, 5.1, 'cheveux', [[-75, 2.4, 3], [-40, 2.8, 3], [40, 2.8, 3], [75, 2.4, 3]]);
    bsVisage(P, hx + 0.2, hy + 0.9, 4.4, 4.3);
    bsBandeau(P, hx, hy - 3.2, 5.2, { plaque: 4.4 });
    const corne = (x, y, d) => P.poly([[x - 0.8, y + 0.6], [x + d * 1.8, y - 4.6], [x + 0.9, y + 0.6]], 'corne', { relief: true, niv: 2 });
    if (cadet) { corne(hx - 1.6, hy - 3.2, -1); corne(hx + 1.8, hy - 3.2, 1); } else corne(hx + 0.2, hy - 3.2, 0.4);
    bsYeux(P, hx + 0.2, hy + 0.9, 'dur', { ecart: 2.2, sourcil: 'colere', ksourcil: 'cheveux' });
    P.tronc(hy + 2.2, hy + 5.4, hx - 4.4, hx + 4.6, hx - 3.4, hx + 3.6, 'respi'); // masque respirateur
    for (const c of [-1, 1]) { P.boule(hx + 0.2 + c * 2.6, hy + 4.2, 1.3, 1.3, 'filtre'); P.point(hx + 0.2 + c * 2.6, hy + 4.2, 'oeil', 1); }
    P.ligneFine(hx - 0.6, hy + 3.4, hx + 1, hy + 3.4, 'filtre', 1);
    if (s > 0) { if (att) gant(R[0], R[1], 36, 37, 40, 35.5, 1); else gant(R[0], R[1], 33.5, 40 + b, 34.5, 44.5 + b, 1); }
    else shBras(P, R[0], R[1], 33.5, 39.5 + b, 33, 44 + b, 'tunique', 'peau', { r: 1.8 });
  },
};
function hxF(cadet) { return cadet ? 25.5 : 26.5; }

// BOS_005 Haku — masque blanc de chasseur aux marques rouges, longs cheveux noirs noués en chignon, haori sarcelle
// sur robe gris-bleu ; aiguilles entre les doigts ; à l'attaque, mains jointes, un éclat de glace se forme.
BOSS_PEINTS.haku = {
  pal: pb({ peau: '#f2dcc8', cheveux: '#22222c', masque: '#f4f2ec', marque: '#c8303a', haori: '#2e5a5e', robe: '#8a9ab0', ceinture: '#e8e0d0', pantalon: '#4a5a6a', sandale: '#3a4a5a', aiguille: { c: '#e0f0ff', brille: true }, glace: { c: '#a8dcf4', brille: true } }),
  f(P, i, att) {
    const b = i * 0.5;
    P.boule(26, 20.5 + b, 2.6, 2.2, 'cheveux'); P.rect(25, 22 + b, 2, 1, 'ceinture', 3); // chignon
    P.poly([[21.5, 25 + b], [30.5, 25 + b], [32, 40 + b], [29.5, 42 + b], [22.5, 42 + b], [20, 40 + b]], 'cheveux', { cyl: true }); // cheveux longs dans le dos
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.7 });
    P.tronc(33 + b, 50, 21, 31, 19.5, 32.5, 'robe', { arrondi: 2.5, degrade: 0.2 });
    P.poly([[20.5, 33.5 + b], [31.5, 33.5 + b], [33.5, 46], [29, 47], [26, 45.5], [23, 47], [18.5, 46]], 'haori', { cyl: true });
    P.poly([[24.5, 33.5 + b], [27.5, 33.5 + b], [26, 39 + b]], 'robe', { niv: 3 });
    P.rect(21, 40.5 + b * 0.5, 10, 1.6, 'ceinture', 2); P.ligneFine(21, 42 + b * 0.5, 31, 42 + b * 0.5, 'ceinture', 1);
    shBras(P, 21, 34.5 + b, 18.5, 39.5 + b, 19.5, 43.5 + b, 'haori', 'peau', { r: 1.7 });
    const hx = 26, hy = 25.8 + b;
    P.boule(hx, hy - 0.5, 4.9, 4.7, 'cheveux');
    P.boule(hx + 0.2, hy + 1, 4.2, 4.3, 'masque', { plus: 0.3 }); // masque de chasseur
    P.poly([[hx - 4.6, hy - 1], [hx - 2.4, hy + 0.2], [hx - 1, hy - 1.4], [hx + 1.2, hy - 0.2], [hx + 2.8, hy - 1.6], [hx + 4.8, hy + 0.2], [hx + 4.8, hy - 3], [hx - 4.6, hy - 3]], 'cheveux', { niv: 2, trait: false });
    for (const c of [-1, 1]) { P.rect(hx + 0.2 + c * 1.9 - 0.75, hy + 1.2, 1.5, 0.5, 'oeil', 0); P.ligneFine(hx + 0.2 + c * 1.9 - 0.9, hy + 0.6, hx + 0.2 + c * 1.9 + 0.9, hy + 0.6, 'marque', 2); P.ligneFine(hx + 0.2 + c * 3, hy + 1.2, hx + 0.2 + c * 3, hy + 2.2, 'marque', 2); }
    P.ligneFine(hx + 0.2, hy + 2.6, hx - 0.3, hy + 3.4, 'marque', 1); P.ligneFine(hx - 0.3, hy + 3.4, hx + 0.7, hy + 4.2, 'marque', 1);
    P.poly([[hx - 4.9, hy - 0.8], [hx - 3.8, hy - 0.8], [hx - 4, hy + 5.4], [hx - 5.2, hy + 4.6]], 'cheveux', { cyl: true });
    P.poly([[hx + 4, hy - 0.8], [hx + 5.1, hy - 0.8], [hx + 5.4, hy + 4.6], [hx + 4.2, hy + 5.4]], 'cheveux', { cyl: true });
    if (att) { // mains jointes : éclat de glace
      shBras(P, 31, 34.5 + b, 31.5, 39, 27.5, 37.5, 'haori', 'peau', { r: 1.7 });
      P.poly([[27.5, 30], [29.5, 26.5], [31, 30.5], [29.5, 34]], 'glace', { relief: true, niv: 2 }); bsLueur(P, 29.4, 30, 3.4, '#a8e0ff', '#f0fcff');
      for (const [dx, dy] of [[5, -2], [6.5, 0], [5.5, 2]]) P.ligneFine(31, 37.5, 31 + dx, 37.5 + dy, 'aiguille', 3);
    } else { shBras(P, 31, 34.5 + b, 33.5, 39.5 + b, 33, 43.5 + b, 'haori', 'peau', { r: 1.7 }); for (const d of [-1, 0, 1]) P.ligneFine(33 + d * 0.5, 44.5 + b, 34.5 + d * 1.2, 47.5 + b, 'aiguille', 3); }
  },
};

// ═══ Étage 3 ═══
// BOS_006 Kankurō — combinaison noire à capuche à deux pointes, visage peint de violet, bandeau sur la capuche ;
// fils de chakra aux doigts (sa marionnette combat à sa place) ; à l'attaque, mains levées, fils tendus.
BOSS_PEINTS.kankuro = {
  pal: pb({ peau: '#efcaa6', tenue: '#2a2830', capuche: '#24222a', peinture: '#8a3ab0', pantalon: '#26242c', sandale: '#2e2c36', bandeau: '#3a3842', sac: '#8a6a4a', sangle: '#5a4632' }),
  f(P, i, att) {
    const b = i * 0.5;
    P.boule(31.5, 40 + b, 3, 3.6, 'sac'); P.rect(30, 37 + b, 3, 1, 'sangle', 1); // sacoche à outils
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.9 });
    shBras(P, 21, 34.5 + b, 18.5, 39.5 + b, 18, 43.5 + b, 'tenue', 'peau', { r: 1.8 });
    P.tronc(32.5 + b, 46, 20.5, 31.5, 21.5, 30.5, 'tenue', { arrondi: 2.5 });
    P.piece(); P.ligneFine(26, 34 + b, 26, 45, 'tenue', 1); P.traitPiece();
    P.rect(21.5, 43.5 + b * 0.5, 9, 1.4, 'sangle', 2);
    P.poly([[21.5, 34 + b], [23, 33.5 + b], [32, 43.5 + b * 0.5], [30.5, 44.5 + b * 0.5]], 'sangle', { niv: 2 });
    const hx = 26, hy = 25.6 + b;
    P.boule(hx, hy - 0.2, 5.6, 5.4, 'capuche'); // capuche à deux pointes
    P.poly([[hx - 5.4, hy - 2], [hx - 4.6, hy - 8.2], [hx - 2, hy - 4.6]], 'capuche', { relief: true, niv: 2 }); P.poly([[hx + 2, hy - 4.6], [hx + 4.6, hy - 8.2], [hx + 5.4, hy - 2]], 'capuche', { niv: 1 });
    bsVisage(P, hx + 0.2, hy + 1.2, 4.1, 4);
    bsBandeau(P, hx, hy - 3.6, 4.2, { plaque: 4.4 });
    bsYeux(P, hx + 0.2, hy + 1.3, 'normal', { ecart: 2, sourcil: 'colere' });
    P.piece(); // peinture de guerre violette : arête du nez, pommettes
    P.ligneFine(hx + 0.2, hy + 0.4, hx + 0.2, hy + 2.4, 'peinture', 2);
    for (const c of [-1, 1]) P.ligneFine(hx + 0.2 + c * 3.4, hy + 2.2, hx + 0.2 + c * 2.4, hy + 3.4, 'peinture', 2);
    P.traitPiece();
    bsBouche(P, hx + 0.4, hy + 3.9, 'rictus', 2);
    const fils = '#7ad0ff';
    if (att) { shBras(P, 31, 34.5 + b, 34, 30, 33, 25, 'tenue', 'peau', { r: 1.8 }); shFils(P, [[32.5, 24, 36, 12], [33.5, 24, 40, 14], [34, 25, 44, 18]], fils); bsLueur(P, 33, 25, 1.6, '#4ab0f0', '#e0f6ff'); }
    else { shBras(P, 31, 34.5 + b, 33.5, 39 + b, 34.5, 42 + b, 'tenue', 'peau', { r: 1.8 }); shFils(P, [[34.5, 42 + b, 44, 36], [35, 43 + b, 45, 41], [34.5, 43.5 + b, 44, 46]], fils); }
    shFils(P, [[18, 44 + b, 9, 40], [18.5, 44.5 + b, 9, 46]], fils);
  },
};
// Karasu — la marionnette de combat : silhouette de bois maigre sous une cape à capuche en lambeaux, trois yeux,
// mâchoire articulée, cheveux hérissés ; quatre longs bras articulés armés de lames, qui se déplient à l'attaque.
BOSS_PEINTS.karasu = {
  pal: pb({ bois: '#c8a888', bois2: '#9a7c62', joint: '#5a4636', cape: '#3e3848', cheveux: '#3a2a24', oeilr: '#e8d060', lame: { c: '#c8d0dc', brille: true }, dent: '#e8dcc0' }),
  f(P, i, att) {
    const b = i * 0.5;
    const bras = (c, y0, l, a) => { const x1 = 26 + c * l * Math.cos(a), y1 = y0 - l * Math.sin(a), x2 = x1 + c * 5 * Math.cos(a - 0.9), y2 = y1 - 5 * Math.sin(a - 0.9);
      P.membre(26 + c * 4.5, y0, x1, y1, 1, 'bois2'); P.boule(x1, y1, 1.2, 1.2, 'joint'); P.membre(x1, y1, x2, y2, 0.9, 'bois'); P.poly([[x2, y2 - 0.7], [x2 + c * 4 * Math.cos(a - 1.3), y2 - 4 * Math.sin(a - 1.3)], [x2 + c * 0.6, y2 + 0.7]], 'lame', { niv: 3 }); };
    if (att) for (const c of [-1, 1]) { bras(c, 36 + b, 8, 0.9); bras(c, 39 + b, 9, 0.2); }
    P.membre(24, 46, 23.2, 54.5 + (i ? 0 : -0.5), 1.1, 'bois2'); P.membre(28, 46, 28.8, 54.5 + (i ? -0.5 : 0), 1.1, 'bois2');
    for (const x of [23.6, 28.4]) P.boule(x, 50, 1.2, 1.2, 'joint');
    P.poly([[22, 32 + b], [30, 32 + b], [33.5, 47], [31, 45.5], [29.5, 48.5], [27, 46], [25, 48.5], [22.5, 46], [20.5, 48], [18.5, 47]], 'cape', { cyl: true }); // cape en lambeaux
    if (!att) for (const c of [-1, 1]) { bras(c, 35 + b, 7.5, -1.1 + i * 0.12 * c); bras(c, 37.5 + b, 9, -0.7 - i * 0.12 * c); } // bras pendants, lames vers le bas
    const hx = 26, hy = 26.5 + b;
    P.boule(hx, hy - 0.4, 6, 5.6, 'cape', { coupe: hy + 2 }); // capuche
    shPointes(P, hx, hy - 1.2, 4.4, 'cheveux', [[-60, 2.2, 2.6], [-25, 2.6, 2.8], [10, 2.6, 2.8], [45, 2.2, 2.6]]);
    P.boule(hx, hy + 0.6, 4.1, 4.2, 'bois', { plus: 0.25 });
    for (const [x, y] of [[-1.8, 0.8], [1.8, 0.8], [0, -1.6]]) { P.boule(hx + x, hy + y, 1, 1, 'oeil', { niv: 1, trait: false }); P.point(hx + x, hy + y, 'oeilr', 3); }
    P.rect(hx - 2.2, hy + 2.6, 4.4, att ? 2.6 : 1.6, 'oeil', 0); for (const x of [-1.6, -0.6, 0.4, 1.4]) P.point(hx + x, hy + 2.6, 'dent', 3);
    P.rect(hx - 3.4, hy + 1.8, 0.6, 3.2, 'joint', 1); P.rect(hx + 2.8, hy + 1.8, 0.6, 3.2, 'joint', 1);
  },
};

// BOS_007 Le trio du Son — trois genin du Son, une forme chacun : Dosu (bossu, tête bandée, poncho hirsute, gantelet
// à résonance), Zaku (cheveux dressés, tubes à air dans les paumes), Kin (longue tresse à ruban, aiguilles à clochettes).
function bsNoteSon(P) { return (x, y) => { P.point(x, y - 0.4, 'oeil', 1); P.point(x, y + 0.1, 'oeil', 1); P.point(x - 0.5, y + 0.6, 'oeil', 1); }; }
BOSS_PEINTS.trio = {
  formes: 3,
  pal: pb({ peau: '#ecc8a4', cheveux: '#24222a', tenue: '#c8b48a', tenue2: '#a8946c', camo: '#5a6a4a', tache: '#3e4a34', sandale: '#3a3a36', bandeau: '#3a3a44', fourrure: '#8a7a5a', bandes: '#e2dac6', gantelet: { c: '#9aa2ae', brille: true }, ruban: '#d84a6a', clochette: { c: '#e8c050', brille: true }, aiguille: { c: '#e0e8f0', brille: true }, air: '#c8f0ff' }),
  f(P, i, att, forme) {
    const b = i * 0.5, note = bsNoteSon(P);
    const camo = () => { P.piece(); for (const [x, y] of [[21.5, 47], [23, 50.5], [29.5, 48], [30.5, 52], [22, 53]]) P.rect(x, y, 1.5, 1, 'tache', 1); P.traitPiece(); };
    if (forme === 0) { // Dosu
      bsJambes(P, i, { k: 'camo', kp: 'sandale', r: 2 }, 0.5); camo();
      P.poly([[18, 33 + b], [34, 32 + b], [36.5, 48], [34, 46.5], [32.5, 49.5], [30, 47], [27.5, 50], [25, 47], [22.5, 49.5], [20, 47], [16, 48.5]], 'fourrure', { cyl: true }); // poncho hirsute
      P.piece(); for (let k = 0; k < 12; k++) P.ligneFine(18 + k * 1.4, 36 + (k % 3) + b, 17.6 + k * 1.45, 39.5 + (k % 3) + b, 'fourrure', k % 2 ? 1 : 3); P.traitPiece();
      const hx = 27.5, hy = 28 + b; // tête basse, en avant
      P.boule(hx, hy, 4.8, 4.8, 'bandes', { plus: 0.15 }); // tête entièrement bandée
      P.piece(); for (let y = -3; y <= 3; y += 1.5) P.ligneFine(hx - 4.4, hy + y + 0.6, hx + 4.4, hy + y - 0.4, 'bandes', 1); P.traitPiece();
      P.boule(hx - 1.6, hy + 0.4, 1.4, 1.1, 'peau'); bsYeux(P, hx + 0.8, hy + 0.5, 'petit', { ecart: 2.4, seul: true });
      P.poly([[hx - 4, hy - 4.6], [hx + 3, hy - 5.4], [hx + 4.6, hy - 2.6], [hx - 4.6, hy - 2]], 'cheveux', { niv: 2, trait: false }); bsBandeau(P, hx, hy - 3.6, 4.6, { plaque: 4, symbole: note });
      if (att) { shBras(P, 31.5, 34 + b, 35.5, 30, 35, 24, 'fourrure', 'gantelet', { r: 2.4, kav: 'gantelet', rm: 2.4 }); for (const y of [26, 28, 30]) P.point(35.8, y, 'oeil', 0); P.apres((g, E) => { g.globalAlpha = 0.6; g.strokeStyle = '#f0e0b0'; for (const r of [4, 7, 10]) { g.beginPath(); g.arc(35 * E, 24 * E, r * E, -2.4, -0.2); g.stroke(); } g.globalAlpha = 1; }); }
      else { shBras(P, 31.5, 34 + b, 34.5, 39 + b, 34, 44 + b, 'fourrure', 'gantelet', { r: 2.4, kav: 'gantelet', rm: 2.4 }); for (const y of [40.5, 42.5]) P.point(34.8, y + b, 'oeil', 0); }
      return;
    }
    if (forme === 1) { // Zaku
      bsJambes(P, i, { k: 'camo', kp: 'sandale', r: 1.9 }); camo();
      shBras(P, 21, 34.5 + b, 18, 39 + b, att ? 16 : 18.5, att ? 37 : 43.5 + b, 'tenue', 'peau', { r: 1.8, kav: 'peau' });
      P.tronc(32.5 + b, 46, 20.5, 31.5, 21.5, 30.5, 'tenue', { arrondi: 2.5 }); P.rect(21.5, 43.5 + b * 0.5, 9, 1.5, 'tenue2', 1);
      P.piece(); P.ligneFine(26, 34 + b, 26, 43 + b, 'tenue2', 1); P.rect(21.5, 37.5 + b, 3, 2.5, 'tenue2', 1); P.rect(27.5, 37.5 + b, 3, 2.5, 'tenue2', 1); P.traitPiece();
      const hx = 26, hy = 25.6 + b;
      shPointes(P, hx, hy - 0.5, 5, 'cheveux', [[-50, 3.6, 3.2], [-25, 5, 3.4], [0, 5.6, 3.4], [25, 5, 3.4], [50, 3.6, 3.2]]);
      P.boule(hx, hy - 0.6, 5, 4.7, 'cheveux');
      bsVisage(P, hx + 0.2, hy + 1, 4.3, 4.2);
      bsBandeau(P, hx, hy - 3, 5, { plaque: 4.2, symbole: note });
      bsYeux(P, hx + 0.2, hy + 1.2, 'fente', { ecart: 2.1, sourcil: 'colere' }); bsBouche(P, hx + 0.6, hy + 3.8, 'rictus', 2.5);
      if (att) { shBras(P, 31, 34.5 + b, 35, 36.5, 39.5, 36, 'tenue', 'peau', { r: 1.8, kav: 'peau' }); for (const [x, y] of [[40.5, 36], [15, 37]]) { bsLueur(P, x, y, 2.2, '#a0e0ff', '#f0fcff'); } P.apres((g, E) => { g.globalAlpha = 0.5; g.fillStyle = '#e0f8ff'; for (let k = 0; k < 3; k++) g.fillRect((43 + k * 2.5) * E, (34.5 + k) * E, 2 * E, 1); g.globalAlpha = 1; }); }
      else { shBras(P, 31, 34.5 + b, 34, 39 + b, 33.5, 43.5 + b, 'tenue', 'peau', { r: 1.8, kav: 'peau' }); P.point(33.5, 43.5 + b, 'oeil', 1); }
      return;
    }
    // Kin
    P.poly([[21.5, 24 + b], [30.5, 24 + b], [31.5, 41 + b], [29.5, 45 + b], [27, 46.5 + b], [25.5, 43 + b], [21, 38 + b]], 'cheveux', { cyl: true }); // longue chevelure
    P.boule(27, 44.8 + b, 1.4, 1, 'ruban'); P.poly([[26, 44.8 + b], [24, 43.5 + b], [24.2, 46.4 + b]], 'ruban', { niv: 2 }); P.poly([[28, 44.8 + b], [30, 43.5 + b], [29.8, 46.4 + b]], 'ruban', { niv: 1 });
    bsJambes(P, i, { k: 'camo', kp: 'sandale', r: 1.7 }); camo();
    shBras(P, 21.5, 34.5 + b, 19, 39 + b, 19.5, 43 + b, 'tenue', 'peau', { r: 1.6 });
    P.tronc(33 + b, 46, 21, 31, 22, 30, 'tenue', { arrondi: 2.5 }); P.rect(22, 43.5 + b * 0.5, 8, 1.4, 'tenue2', 1);
    const hx = 26, hy = 25.8 + b;
    P.boule(hx, hy - 0.4, 4.9, 4.7, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    P.poly([[hx - 4.6, hy - 1], [hx - 3, hy + 1.4], [hx - 2, hy - 0.6], [hx - 0.5, hy + 1], [hx + 1, hy - 0.8], [hx + 2.6, hy + 0.8], [hx + 4, hy - 0.8], [hx + 4.8, hy + 1], [hx + 4.8, hy - 2.6], [hx - 4.7, hy - 2.6]], 'cheveux', { niv: 2, trait: false });
    bsBandeau(P, hx, hy - 3.3, 4.9, { plaque: 4, symbole: note });
    bsYeux(P, hx + 0.2, hy + 1.5, 'normal', { ecart: 2.1, sourcil: 'leve' }); bsBouche(P, hx + 0.5, hy + 4, 'sourire', 2);
    const sb = (x, y, dx, dy) => { P.ligneFine(x, y, x + dx, y + dy, 'aiguille', 3); P.boule(x + dx * 0.3, y + dy * 0.3 + 0.8, 0.7, 0.7, 'clochette', { trait: false }); };
    if (att) { shBras(P, 30.5, 34.5 + b, 34.5, 32, 38, 30, 'tenue', 'peau', { r: 1.6 }); sb(38.5, 30, 6, -3); sb(38.5, 30.5, 6.5, 0); sb(38.5, 31, 5.5, 2.5); }
    else { shBras(P, 30.5, 34.5 + b, 33, 39 + b, 32.5, 43 + b, 'tenue', 'peau', { r: 1.6 }); sb(33, 43.5 + b, 1.5, 3.5); sb(33.5, 43.5 + b, 3, 2.5); }
  },
};

// BOS_008 Kimimaro — teint pâle, longs cheveux blancs, deux points rouges au front, robe crème à haut col, grosse
// corde violette nouée en nœud dans le dos ; une épée d'os à la main ; à l'attaque, des os jaillissent de ses épaules.
BOSS_PEINTS.kimimaro = {
  pal: pb({ peau: '#f6e6dc', cheveux: '#eceef4', robe: '#ece4d4', corde: '#8a4ab0', pantalon: '#3a3a46', sandale: '#34343e', os: { c: '#faf6ea', brille: true }, marque: '#d83a3a', iris: '#4a9a6a' }),
  f(P, i, att) {
    const b = i * 0.5;
    for (const c of [-1, 1]) P.boule(26 + c * 6.2, 43 + b * 0.5, 2.4, 1.7, 'corde'); // boucles du nœud, dans le dos
    P.poly([[21, 24 + b], [31, 24 + b], [32.5, 38 + b], [19.5, 38 + b]], 'cheveux', { cyl: true });
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.8 });
    if (att) for (const [x0, y0, x1, y1] of [[21, 33], [31, 33]].flatMap(([x, y]) => [[x, y, x + (x < 26 ? -5 : 5), y - 6], [x, y + 1.5, x + (x < 26 ? -6.5 : 6.5), y - 2]])) P.poly([[x0 - 0.8, y0 + b], [x1, y1 + b], [x0 + 0.8, y0 + b]], 'os', { relief: true, niv: 2 });
    shBras(P, 21, 34.5 + b, 18.5, 39.5 + b, 19, 43.5 + b, 'robe', 'peau', { r: 1.8 });
    P.tronc(32.5 + b, 48, 20.5, 31.5, 20, 32, 'robe', { arrondi: 2.5, degrade: 0.15 });
    P.piece(); P.ligneFine(26.5, 34 + b, 25, 41 + b, 'robe', 1); P.ligneFine(21.5, 44.5, 20.5, 48, 'robe', 1); P.traitPiece();
    P.membre(20.5, 42 + b * 0.5, 31.5, 42 + b * 0.5, 1.1, 'corde'); P.piece(); for (let x = 21; x < 31.5; x += 1.2) P.ligneFine(x, 41.3 + b * 0.5, x + 0.6, 42.7 + b * 0.5, 'corde', 1); P.traitPiece();
    P.tronc(30.5 + b, 34 + b, 23, 29, 22, 30, 'robe'); // haut col
    const hx = 26, hy = 25.4 + b;
    P.boule(hx, hy - 0.5, 5, 4.8, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    P.poly([[hx - 4.8, hy - 0.6], [hx - 1, hy - 2.6], [hx + 0.2, hy - 0.4], [hx + 1, hy - 2.6], [hx + 4.8, hy - 0.4], [hx + 5, hy - 3.6], [hx - 5, hy - 3.6]], 'cheveux', { niv: 3, trait: false }); // raie au milieu
    P.poly([[hx - 5, hy - 1], [hx - 3.6, hy - 1], [hx - 3.8, hy + 5], [hx - 5.4, hy + 4]], 'cheveux', { cyl: true }); P.poly([[hx + 3.8, hy - 1], [hx + 5.2, hy - 1], [hx + 5.6, hy + 4], [hx + 4, hy + 5]], 'cheveux', { cyl: true });
    for (const c of [-1, 1]) P.rect(hx + 0.2 + c * 1.6 - 0.5, hy - 0.4, 1, 1, 'marque', 3);
    bsYeux(P, hx + 0.2, hy + 1.6, 'fente', { ecart: 2 }); bsBouche(P, hx + 0.4, hy + 4, 'trait', 1.5);
    if (att) { shBras(P, 31, 34.5 + b, 35, 37, 38.5, 36.5, 'robe', 'peau', { r: 1.8 }); P.poly([[38.5, 35.6], [50.5, 34.5], [38.5, 37.6]], 'os', { relief: true, niv: 2 }); P.ligneFine(39, 36, 49, 35, 'os', 4); }
    else { shBras(P, 31, 34.5 + b, 33.5, 39.5 + b, 33, 43.5 + b, 'robe', 'peau', { r: 1.8 }); P.poly([[32.2, 44 + b], [36.5, 55.5], [33.8, 44 + b]], 'os', { relief: true, niv: 2 }); }
  },
};

// BOS_010 Sasori — forme 0 : la carapace (marionnette bossue sous le manteau, masque de tissu, queue mécanique de
// scorpion dressée au-dessus du dos) ; forme 1 : le marionnettiste révélé (jeune, cheveux roux, fils de chakra, câble
// à lame enroulé dans le dos). À l'attaque : la queue frappe / les mains lèvent les fils.
BOSS_PEINTS.sasori = {
  formes: 2,
  pal: pb({ peau: '#f2d6bc', cheveux: '#b8382a', cheveux2: '#2a2228', masque: '#4a4e5a', queue: { c: '#8a8a96', brille: true }, joint: '#4a4a56', dard: { c: '#c8d0dc', brille: true }, poison: '#a8e050', pantalon: '#2a2a36', sandale: '#2a2a36', bois: '#c8a888', cable: '#5a5a66', iris: '#7a5a4a' }),
  f(P, i, att, forme) {
    const b = i * 0.5;
    if (forme === 0) { // la carapace : bossu sous le manteau, tête basse à l'avant, queue dressée au-dessus du dos
      const seg = att ? [[23, 31], [23.5, 24], [28, 18.5], [34, 16.5], [40, 17], [45.5, 19.5]] : [[23, 31], [21, 24.5], [22.5, 18.5], [27.5, 15], [33, 15.5], [36.5, 18.5]];
      for (let k = 0; k < seg.length - 1; k++) { P.membre(seg[k][0], seg[k][1] + b, seg[k + 1][0], seg[k + 1][1] + b, 1.8 - k * 0.16, 'queue'); P.boule(seg[k + 1][0], seg[k + 1][1] + b, 1.6 - k * 0.13, 1.6 - k * 0.13, 'joint', { trait: false }); }
      const [tx, ty] = seg[seg.length - 1], [px, py] = seg[seg.length - 2], a = Math.atan2(ty - py, tx - px);
      P.poly([[tx + Math.cos(a + 1.6) * 1.4, ty + b + Math.sin(a + 1.6) * 1.4], [tx + Math.cos(a) * 5, ty + b + Math.sin(a) * 5], [tx + Math.cos(a - 1.6) * 1.4, ty + b + Math.sin(a - 1.6) * 1.4]], 'dard', { relief: true, niv: 2 });
      P.point(tx + Math.cos(a) * 4, ty + b + Math.sin(a) * 4, 'poison', 3);
      P.boule(19.5, 54.6, 2.2, 1.3, 'sandale'); P.boule(27, 54.8, 2.2, 1.3, 'sandale');
      P.poly([[12.5, 54], [14, 42], [20, 32 + b], [28, 30 + b], [34.5, 36 + b], [37, 46], [36, 54]], 'cape', { cyl: true }); // manteau tombant
      P.boule(22.5, 38 + b, 9.5, 8.5, 'cape', { plus: 0.1 }); // bosse
      P.piece(); P.ligneFine(30, 40 + b, 31.5, 54, 'cape', 0); P.ligneFine(16, 44, 15, 54, 'cape', 1); P.traitPiece();
      bsNuage(P, 19, 37 + b, 1); bsNuage(P, 25.5, 46 + b, 1); bsNuage(P, 16.5, 50, 0.75);
      P.rect(12.5, 53.5, 24, 0.5, 'capeint', 1);
      shBras(P, 33, 40 + b, 36, 45 + b, 37.5, 52, 'cape', 'peau', { r: 1.9, rm: 1.8 }); // bras d'appui
      const hx = 33.5, hy = 35 + b;
      P.boule(hx, hy - 0.4, 4.6, 4.2, 'cheveux2'); shPointes(P, hx, hy - 0.6, 4.4, 'cheveux2', [[-70, 2, 2.6], [-30, 2.6, 2.8], [10, 2.6, 2.8], [50, 2, 2.6]]);
      bsVisage(P, hx + 0.4, hy + 0.8, 3.8, 3.6);
      P.tronc(hy + 1.6, hy + 4.4, hx - 3.6, hx + 4.4, hx - 2.8, hx + 3.6, 'masque');
      bsYeux(P, hx + 0.6, hy + 0.6, 'dur', { ecart: 1.8, sourcil: 'colere' });
      return;
    }
    // le marionnettiste révélé
    const cab = att ? [[22, 38], [16, 33], [13, 26], [16, 20], [22, 18]] : [[22, 38], [17, 40], [14, 36], [16, 31], [20, 31]];
    for (let k = 0; k < cab.length - 1; k++) P.membre(cab[k][0], cab[k][1] + b, cab[k + 1][0], cab[k + 1][1] + b, 0.9, 'cable');
    { const [tx, ty] = cab[cab.length - 1], [px, py] = cab[cab.length - 2], a = Math.atan2(ty - py, tx - px); P.poly([[tx + Math.cos(a + 1.6), ty + b + Math.sin(a + 1.6)], [tx + Math.cos(a) * 4, ty + b + Math.sin(a) * 4], [tx + Math.cos(a - 1.6), ty + b + Math.sin(a - 1.6)]], 'dard', { niv: 3 }); }
    P.boule(22, 38.5 + b, 3, 3, 'bois'); P.boule(22, 38.5 + b, 1.4, 1.4, 'joint'); // bobine dans le dos
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.7 });
    shBras(P, 21, 34 + b, 18.5, 39.5 + b, 18.5, 44 + b, 'cape', 'bois', { r: 1.9 });
    bsManteauAka(P, b, { nuages: [[22, 41, 1], [30.5, 47.5, 0.9], [20.5, 49.5, 0.75]] });
    const hx = 26, hy = 25.6 + b;
    P.boule(hx, hy - 0.6, 5, 4.7, 'cheveux');
    shPointes(P, hx, hy - 0.6, 5, 'cheveux', [[-100, 2.2, 2.8], [-70, 2.8, 3], [-40, 3, 3], [-10, 2.8, 3], [20, 3, 3], [50, 2.8, 3], [85, 2.2, 2.8]]);
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    P.poly([[hx - 4.6, hy - 1.2], [hx - 3, hy + 1], [hx - 1.6, hy - 0.8], [hx, hy + 0.8], [hx + 1.4, hy - 1], [hx + 3, hy + 0.8], [hx + 4.8, hy - 0.8], [hx + 4.8, hy - 2.6], [hx - 4.7, hy - 2.6]], 'cheveux', { niv: 2, trait: false });
    bsYeux(P, hx + 0.2, hy + 1.6, 'fente', { ecart: 2.1 }); bsBouche(P, hx + 0.4, hy + 4, 'trait', 1.5);
    bsColAka(P, hx, 33.5 + b, 0, { h: 3.4 });
    const fils = '#7ad0ff';
    if (att) { shBras(P, 31, 34 + b, 34.5, 30.5, 33.5, 25.5, 'cape', 'bois', { r: 1.9 }); shFils(P, [[33, 24.5, 38, 12], [34, 25, 43, 15], [34.5, 25.5, 47, 20]], fils); bsLueur(P, 33.5, 25.5, 1.5, '#4ab0f0', '#e0f6ff'); }
    else { shBras(P, 31, 34 + b, 33.5, 39 + b, 34.5, 42.5 + b, 'cape', 'bois', { r: 1.9 }); shFils(P, [[34.5, 42.5 + b, 44, 37], [35, 43.5 + b, 45, 44]], fils); }
  },
};

// ═══ Nouveaux boss, étages 2 à 4 ═══
// BOS_025 Neji — longs cheveux bruns noués bas, yeux blancs sans pupille, haut crème à manches amples, short sombre,
// bandages au bras et à la cuisse ; à l'attaque, paume en avant, les veines du regard se gonflent.
BOSS_PEINTS.neji = {
  pal: pb({ peau: '#f2d8c0', cheveux: '#3e2c24', tenue: '#e8e0cc', short: '#46464e', bandes: '#ece6d6', sandale: '#3a3a44', bandeau: '#2e2e3a', iris: '#e4e0f4', veine: '#b8a8cc', chakra: { c: '#8ad0ff', brille: true } }),
  f(P, i, att) {
    const b = i * 0.5;
    P.poly([[21.5, 24.5 + b], [30.5, 24.5 + b], [31, 40 + b], [29, 43 + b], [27, 41 + b], [21, 39 + b]], 'cheveux', { cyl: true }); P.rect(27.2, 39.5 + b, 2.6, 1, 'bandes', 3); // queue basse nouée
    bsJambes(P, i, { k: 'peau', kp: 'sandale', r: 1.7 });
    P.tronc(44, 47.5, 21, 31, 20.5, 31.5, 'short'); bsRayures(P, 28.5, 47.5, 3.2, 3, 0.9, 'bandes', 3); // bandages à la cuisse
    shBras(P, 21, 34.5 + b, 18, 39.5 + b, 18.5, 43.5 + b, 'tenue', 'peau', { r: 2.1, rm: 1.6 });
    P.tronc(32.5 + b, 45, 20, 32, 20.5, 31.5, 'tenue', { arrondi: 2.5, degrade: 0.1 });
    P.piece(); P.ligneFine(24, 33 + b, 28.5, 40 + b, 'tenue', 1); P.ligneFine(20.5, 43.5, 31.5, 43.5, 'tenue', 1); P.traitPiece();
    const hx = 26, hy = 25.4 + b;
    P.boule(hx, hy - 0.5, 5, 4.8, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    bsBandeau(P, hx, hy - 3.3, 5, { plaque: 4.4 });
    P.poly([[hx - 5, hy - 1.2], [hx - 3.6, hy - 1.2], [hx - 3.8, hy + 5.4], [hx - 5.4, hy + 4.4]], 'cheveux', { cyl: true }); P.poly([[hx + 3.8, hy - 1.2], [hx + 5.2, hy - 1.2], [hx + 5.6, hy + 4.4], [hx + 4, hy + 5.4]], 'cheveux', { cyl: true });
    bsYeux(P, hx + 0.2, hy + 1.4, 'byakugan', { ecart: 2.1, sourcil: att ? 'colere' : undefined });
    if (att) for (const c of [-1, 1]) { P.ligneFine(hx + 0.2 + c * 3.1, hy + 0.4, hx + 0.2 + c * 3.8, hy - 0.4, 'veine', 1); P.ligneFine(hx + 0.2 + c * 3.1, hy + 2.4, hx + 0.2 + c * 3.8, hy + 3, 'veine', 1); }
    bsBouche(P, hx + 0.4, hy + 4, 'trait', 1.5);
    if (att) { shBras(P, 31, 34.5 + b, 35.5, 35.5, 40, 35, 'tenue', 'peau', { r: 2.1, rm: 1.7 }); bsRayures(P, 36, 34, 3, 2, 0.9, 'bandes', 3); bsLueur(P, 41, 35, 3, '#60b8ff', '#e8f8ff'); P.apres((g, E) => { g.globalAlpha = 0.6; g.strokeStyle = '#a8e0ff'; for (const r of [5, 8]) { g.beginPath(); g.arc(41 * E, 35 * E, r * E, -0.9, 0.9); g.stroke(); } g.globalAlpha = 1; }); }
    else { shBras(P, 31, 34.5 + b, 33.5, 39.5 + b, 33, 43.5 + b, 'tenue', 'peau', { r: 2.1, rm: 1.6 }); bsRayures(P, 31.6, 41.5 + b, 2.8, 2, 0.9, 'bandes', 3); }
  },
};

// BOS_026 Mille-pattes géant — tête cuirassée dressée, grandes mandibules crochues, antennes, grappe d'yeux jaunes ;
// les premiers anneaux et leurs pattes ; à l'attaque, les mandibules s'écartent. Le corps suit en anneaux à pattes.
const PAL_MILLE_PATTES = { ecaille: '#8a3a26', ventre: '#d8a860', motif: '#e8c040', oeil: '#1c1420', iris: '#f0e060', croc: '#2e1c16', blanc: '#ffffff' };
const PALETTES_ANNEAUX = { serpent: null, mille_pattes: PAL_MILLE_PATTES };
BOSS_PEINTS.mille_pattes = {
  pal: Object.assign({}, P_BASE, PAL_MILLE_PATTES),
  f(P, i, att) {
    const b = i * 0.5, o = att ? 1.2 : 0;
    const anneau = (x, y, r, k) => { for (const c of [-1, 1]) P.membre(x + c * r * 0.6, y + 0.5, x + c * (r + 3.2), y + 3 + ((k + i) % 2 ? 0.8 : -0.4) * c, 0.55, 'motif', { trait: false }); P.boule(x, y, r, r * 0.85, 'ecaille'); P.boule(x, y + r * 0.45, r * 0.6, r * 0.3, 'ventre', { trait: false }); P.ligneFine(x - r * 0.5, y - r * 0.4, x + r * 0.5, y - r * 0.4, 'motif', 2); };
    anneau(21, 51, 4.2, 0); anneau(23.5, 45.5, 4, 1); anneau(26.5, 40 + b * 0.5, 3.8, 2); // cou qui se dresse
    const hx = 29 + o * 0.5, hy = 32.5 + b - o;
    for (const c of [-1, 1]) { const ax = hx + c * 1.8, ay = hy - 3.6; P.ligneFine(ax, ay, ax + c * 2.5 - 2, ay - 4.5, 'ecaille', 1); P.ligneFine(ax + c * 2.5 - 2, ay - 4.5, ax + c * 4 - 5, ay - 8, 'ecaille', 1); P.point(ax + c * 4 - 5, ay - 8, 'motif', 3); } // antennes fines
    for (const c of [-1, 1]) { const ec = att ? 1.6 : 0; P.poly([[hx + 3.4, hy + 1.6 + c * 1.2], [hx + 7.8 + ec, hy + 1.8 + c * (3 + ec)], [hx + 10 + ec * 0.6, hy + 0.8 + c * (1 + ec * 0.8)], [hx + 7.2 + ec, hy + 1.4 + c * (1.6 + ec * 0.6)], [hx + 4.4, hy + 1.2 + c * 0.4]], 'ventre', { relief: true, niv: 2 }); P.point(hx + 9.4 + ec * 0.6, hy + 0.9 + c * (1 + ec * 0.8), 'croc', 0); } // mandibules crochues
    P.boule(hx, hy, 5.6, 4.6, 'ecaille'); P.boule(hx + 0.6, hy - 1.4, 4.2, 2.4, 'ecaille', { niv: 3, trait: false });
    P.piece(); P.ligneFine(hx - 4.6, hy + 0.6, hx + 5.4, hy - 0.2, 'ecaille', 0); P.traitPiece();
    for (const [x, y] of [[2.4, -1.4], [3.8, -0.6], [2.8, 0.6], [4.2, 1.2]]) { P.rect(hx + x - 0.5, hy + y - 0.5, 1, 1, 'iris', 3); P.point(hx + x - 0.5, hy + y - 0.5, 'blanc', 4); } // grappe d'yeux
    if (att) bsEtincelles(P, [[hx + 9, hy + 1], [hx + 10, hy + 2.5]], '#c0f070');
  },
};

// BOS_024 Temari — quatre couettes blondes, robe lavande à ceinture rouge, résille aux bras et aux tibias ; le grand
// éventail fermé dans le dos ; à l'attaque, l'éventail s'ouvre en demi-lune, trois lunes violettes.
BOSS_PEINTS.temari = {
  pal: pb({ peau: '#f2d0ac', cheveux: '#ecca5a', robe: '#c2aade', ceinture: '#c8384a', filet: '#3a3442', sandale: '#3a3442', bandeau: '#4a3a5a', eventail: '#efe8da', lune: '#6a4a8a', tige: '#3a3442', iris: '#3a6a5a' }),
  f(P, i, att) {
    const b = i * 0.5;
    if (!att) { P.membre(33.5, 22 + b, 16.5, 50, 2.3, 'tige'); P.piece(); for (const t of [0.25, 0.5, 0.75]) P.boule(lerp(33.5, 16.5, t), lerp(22, 50, t) + b * (1 - t), 1.2, 1.2, 'lune', { trait: false }); P.traitPiece(); } // éventail fermé
    bsJambes(P, i, { k: 'peau', kb: 'filet', kp: 'sandale', r: 1.7 });
    shBras(P, 21, 34.5 + b, 18.5, 39.5 + b, 19, 43 + b, 'filet', 'peau', { r: 1.6 });
    P.tronc(33 + b, 48, 21, 31, 19.5, 32.5, 'robe', { arrondi: 2.5, degrade: 0.15 });
    P.poly([[24, 33.5 + b], [26.5, 33.5 + b], [29.5, 41 + b], [27, 41 + b]], 'robe', { niv: 1 });
    P.rect(21, 41 + b * 0.5, 10, 1.8, 'ceinture', 2); P.boule(23, 42 + b * 0.5, 1.2, 1, 'ceinture');
    const hx = 26, hy = 25.6 + b;
    for (const c of [-1, 1]) for (const dy of [-2.6, 1.4]) shPointes(P, hx + c * 4.2, hy + dy, 1.2, 'cheveux', [[c * 70, 2.6, 2.4], [c * 100, 2.4, 2.2], [c * 130, 1.8, 2]]); // quatre couettes
    P.boule(hx, hy - 0.6, 4.9, 4.6, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    P.poly([[hx - 4.6, hy - 1.4], [hx - 3.4, hy + 0.6], [hx - 2.2, hy - 0.8], [hx - 0.8, hy + 0.4], [hx + 0.6, hy - 1], [hx + 2, hy + 0.4], [hx + 3.4, hy - 0.8], [hx + 4.8, hy + 0.6], [hx + 4.9, hy - 3], [hx - 4.8, hy - 3]], 'cheveux', { niv: 3, trait: false });
    bsBandeau(P, hx, hy - 3.2, 4.8, { plaque: 4.2 });
    bsYeux(P, hx + 0.2, hy + 1.6, 'normal', { ecart: 2.1, sourcil: 'colere', ksourcil: 'cheveux' }); bsBouche(P, hx + 0.6, hy + 4, 'rictus', 2);
    if (att) { // éventail ouvert en demi-lune
      shBras(P, 31, 34.5 + b, 34.5, 33.5, 37.5, 31.5, 'filet', 'peau', { r: 1.6 });
      for (let k = 0; k < 9; k++) { const u = -1.9 + k * 0.42, v = u + 0.42; P.poly([[37.5, 31.5], [37.5 + Math.cos(u) * 13, 31.5 + Math.sin(u) * 13], [37.5 + Math.cos(v) * 13, 31.5 + Math.sin(v) * 13]], 'eventail', { niv: k % 2 ? 2 : 3, trait: k === 8 }); }
      for (const [r, u] of [[9.5, -1.4], [9.5, -0.4], [9.5, 0.6]]) P.boule(37.5 + Math.cos(u) * r, 31.5 + Math.sin(u) * r, 1.6, 1.6, 'lune', { trait: false });
      P.membre(37.5, 31.5, 36, 36, 0.7, 'tige');
    } else shBras(P, 31, 34.5 + b, 33.5, 39.5 + b, 33, 43 + b, 'filet', 'peau', { r: 1.6 });
  },
};

// BOS_027 Kidōmaru — six bras, peau mate, cheveux hérissés en queue, tenue du Son nouée d'une corde violette ;
// à l'attaque, l'arc d'or bandé par ses bras du haut, la flèche pointée.
BOSS_PEINTS.kidomaru = {
  pal: pb({ peau: '#b07a54', cheveux: '#2a2028', tenue: '#d8ccb0', corde: '#7a3aa0', pantalon: '#3a3a44', sandale: '#2e2e38', or: { c: '#f0c040', brille: true }, marque: '#c83a3a', iris: '#2a1a1a', toile: '#f0f0f0' }),
  f(P, i, att) {
    const b = i * 0.5;
    P.membre(26, 21 + b, 30, 31 + b, 1.6, 'cheveux', { trait: false }); P.boule(26.5, 21.5 + b, 2.6, 2.2, 'cheveux'); // queue hérissée
    for (const c of [-1, 1]) P.boule(26 + c * 6.2, 43 + b * 0.5, 2.2, 1.6, 'corde');
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.8 });
    // bras arrière (gauche) : trois
    shBras(P, 21, 34 + b, 17, 31 + b, 15.5, 26.5 + b, 'peau', 'peau', { r: 1.1, rm: 1.4 }); shBras(P, 21, 37 + b, 16, 37.5 + b, 12.5, 36 + b, 'peau', 'peau', { r: 1.1, rm: 1.4 }); shBras(P, 21.5, 40 + b, 17.5, 43 + b, 16.5, 47.5 + b, 'peau', 'peau', { r: 1.1, rm: 1.4 });
    P.tronc(32.5 + b, 46, 20.5, 31.5, 21.5, 30.5, 'tenue', { arrondi: 2.5 });
    P.membre(20.5, 42.5 + b * 0.5, 31.5, 42.5 + b * 0.5, 1, 'corde');
    const hx = 26, hy = 25.6 + b;
    P.boule(hx, hy - 0.6, 5, 4.7, 'cheveux'); shPointes(P, hx, hy - 0.6, 5, 'cheveux', [[-60, 2.6, 3], [-25, 3.2, 3], [10, 3.4, 3.2], [45, 3, 3], [80, 2.2, 2.6]]);
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    P.poly([[hx - 4.6, hy - 1], [hx - 2.6, hy + 0.6], [hx - 1, hy - 1], [hx + 1, hy + 0.4], [hx + 2.6, hy - 1.2], [hx + 4.8, hy + 0.2], [hx + 4.9, hy - 3], [hx - 4.8, hy - 3]], 'cheveux', { niv: 2, trait: false });
    P.point(hx + 0.2, hy - 0.4, 'marque', 3); P.point(hx + 0.2, hy + 0.1, 'marque', 3);
    bsYeux(P, hx + 0.2, hy + 1.6, 'fente', { ecart: 2.1, sourcil: 'colere' }); bsBouche(P, hx + 0.6, hy + 4, 'sourire', 2.5);
    if (att) { // arc d'or bandé
      P.apres((g, E) => { g.strokeStyle = '#f8f0d8'; g.lineWidth = 1; g.beginPath(); g.moveTo(41 * E, 22 * E); g.lineTo(33 * E, 33 * E); g.lineTo(41 * E, 44 * E); g.stroke(); });
      P.poly([[40.5, 21.5], [43.5, 27], [44, 33], [43.5, 39], [40.5, 44.5], [42, 39], [42.5, 33], [42, 27]], 'or', { relief: true, niv: 2 });
      P.membre(33, 33, 50, 33, 0.5, 'or'); P.poly([[50, 31.8], [52, 33], [50, 34.2]], 'or', { niv: 3 });
      shBras(P, 31, 34 + b, 36, 34, 41.5, 33, 'peau', 'peau', { r: 1.1, rm: 1.4 }); shBras(P, 31, 37 + b, 33, 35, 33, 33, 'peau', 'peau', { r: 1.1, rm: 1.4 }); shBras(P, 30.5, 40 + b, 34.5, 43, 35.5, 47.5, 'peau', 'peau', { r: 1.1, rm: 1.4 });
    } else { shBras(P, 31, 34 + b, 35, 31 + b, 36.5, 26.5 + b, 'peau', 'peau', { r: 1.1, rm: 1.4 }); shBras(P, 31, 37 + b, 36, 37.5 + b, 39.5, 36 + b, 'peau', 'peau', { r: 1.1, rm: 1.4 }); shBras(P, 30.5, 40 + b, 34.5, 43 + b, 35.5, 47.5 + b, 'peau', 'peau', { r: 1.1, rm: 1.4 }); shFils(P, [[39.5, 36 + b, 45, 33], [39.5, 36.5 + b, 45.5, 39]], '#f4f4f4'); }
  },
};

// BOS_028 Tayuya — longue chevelure rouge, bonnet sombre portant la plaque du Son, tenue nouée d'une corde violette ;
// sa flûte à la main ; à l'attaque, la flûte aux lèvres, des notes s'envolent.
BOSS_PEINTS.tayuya = {
  pal: pb({ peau: '#f2d4b6', cheveux: '#c83a4a', bonnet: '#2e2a36', tenue: '#d8ccb0', corde: '#7a3aa0', pantalon: '#3a3a44', sandale: '#2e2e38', flute: '#ece4d4', iris: '#6a4a3a', note: '#d8b8ff' }),
  f(P, i, att) {
    const b = i * 0.5, note = bsNoteSon(P);
    P.poly([[20.5, 25 + b], [31.5, 25 + b], [33, 45 + b], [30.5, 47 + b], [28, 44.5 + b], [26, 47.5 + b], [23.5, 44.5 + b], [21, 47 + b], [19, 44 + b]], 'cheveux', { cyl: true }); // longue chevelure
    for (const c of [-1, 1]) P.boule(26 + c * 6.2, 43 + b * 0.5, 2.2, 1.6, 'corde');
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.7 });
    shBras(P, 21, 34.5 + b, 18.5, 39.5 + b, 19, 43 + b, 'tenue', 'peau', { r: 1.7 });
    P.tronc(33 + b, 46, 21, 31, 21.5, 30.5, 'tenue', { arrondi: 2.5 }); P.membre(21, 42.5 + b * 0.5, 31, 42.5 + b * 0.5, 1, 'corde');
    const hx = 26, hy = 25.8 + b;
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    P.boule(hx, hy - 1.2, 5.4, 4.6, 'bonnet', { coupe: hy - 0.2 }); // bonnet
    P.piece().rect(hx - 2.2, hy - 2.6, 4.4, 1.7, 'metal', 3).traitPiece(); note(hx, hy - 1.8);
    P.poly([[hx - 5, hy - 0.4], [hx - 3.6, hy - 0.4], [hx - 3.8, hy + 5.4], [hx - 5.4, hy + 4.4]], 'cheveux', { cyl: true }); P.poly([[hx + 3.8, hy - 0.4], [hx + 5.2, hy - 0.4], [hx + 5.6, hy + 4.4], [hx + 4, hy + 5.4]], 'cheveux', { cyl: true });
    P.poly([[hx - 3.6, hy - 0.4], [hx + 3.8, hy - 0.4], [hx + 2, hy + 0.8], [hx - 1, hy + 0.2]], 'cheveux', { niv: 3, trait: false });
    bsYeux(P, hx + 0.2, hy + 1.7, att ? 'ferme' : 'fente', { ecart: 2.1, sourcil: 'colere', ksourcil: 'cheveux' });
    if (att) { // flûte aux lèvres
      shBras(P, 31, 34.5 + b, 32.5, 38, 30, 33.5, 'tenue', 'peau', { r: 1.7 }); P.membre(hx + 1, hy + 3.8, hx + 9, hy + 6.5, 0.6, 'flute'); for (const t of [0.4, 0.6, 0.8]) P.point(lerp(hx + 1, hx + 9, t), lerp(hy + 3.8, hy + 6.5, t) - 0.3, 'oeil', 1);
      P.apres((g, E) => { g.fillStyle = '#e8d0ff'; for (const [x, y] of [[38, 22], [42, 26], [36, 18], [45, 21]]) { g.fillRect(x * E, y * E, 2, 2); g.fillRect(x * E + 1, (y - 3) * E, 1, 3 * E); } });
    } else { bsBouche(P, hx + 0.6, hy + 4, 'rictus', 2); shBras(P, 31, 34.5 + b, 33.5, 39.5 + b, 33, 43 + b, 'tenue', 'peau', { r: 1.7 }); P.membre(32, 42 + b, 37, 47 + b, 0.6, 'flute'); }
  },
};
