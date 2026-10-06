// ═══════════════════════════════════════════════════════════════════════════
// Boss peints, chapitres III à V (étages 5 à 9) et géants. Voir 25_shinobi_boss.js.
// ═══════════════════════════════════════════════════════════════════════════

// ═══ Étage 5 ═══
// BOS_012 Kisame — colosse à la peau bleu-gris, branchies sous les yeux, sourire en dents de scie, cheveux dressés en
// aileron ; la grande épée bandée dans le dos ; à l'attaque, l'épée à écailles débandée balaie devant lui.
BOSS_PEINTS.kisame = {
  pal: pb({ peau: '#7ea0c4', cheveux: '#34486a', branchie: '#4a6a90', bandeau: '#2a2a3a', pantalon: '#2a2a36', sandale: '#2a2a36', bandes: '#d8d0c0', tsuka: '#5a6a8a', ecaille: '#5a7a9a', iris: '#2a2a34' }),
  f(P, i, att) {
    const b = i * 0.5;
    if (!att) { // épée bandée dans le dos
      P.poly([[30, 24.5 + b], [34.5, 27.5 + b], [13, 50.5], [7.5, 46.5]], 'bandes', { cyl: true });
      P.piece(); for (let k = 1; k < 11; k++) { const t = k / 11; P.ligneFine(lerp(30, 7.5, t), lerp(24.5, 46.5, t) + b, lerp(34.5, 13, t), lerp(27.5, 50.5, t) - 1 + b, 'bandes', 1); } P.traitPiece();
      P.membre(34, 19.5 + b, 32.2, 25.5 + b, 0.9, 'tsuka'); P.boule(34.3, 19 + b, 1.3, 1.3, 'tsuka');
    }
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 2.2 }, 0.5);
    shBras(P, 20, 33 + b, 17, 39 + b, 17.5, 44 + b, 'cape', 'peau', { r: 2.3, rm: 2 });
    bsManteauAka(P, b, { large: 1.5, epaules: 31.5, nuages: [[21.5, 40, 1.1], [31, 46.5, 1], [20.5, 49.5, 0.85]] });
    bsNuage(P, 17.2, 36.5 + b, 0.7);
    const hx = 26, hy = 23 + b;
    P.boule(hx, hy - 0.6, 5.2, 4.8, 'cheveux');
    shPointes(P, hx, hy - 1, 5.2, 'cheveux', [[-62, 2.5, 3], [-32, 4.5, 3.4], [-6, 5.6, 3.6], [20, 4.6, 3.4], [46, 3, 3], [75, 1.6, 2.6]]);
    bsVisage(P, hx + 0.2, hy + 1, 4.7, 4.5);
    bsBandeau(P, hx, hy - 3, 5.2, { plaque: 4.8, raye: true });
    bsYeux(P, hx + 0.2, hy + 1.1, 'petit', { ecart: 2.3, sourcil: 'colere', ksourcil: 'branchie' });
    for (const c of [-1, 1]) for (let k = 0; k < 3; k++) P.ligneFine(hx + 0.2 + c * 3.4 - 0.5, hy + 2.6 + k * 0.6, hx + 0.2 + c * 3.4 + 0.5, hy + 2.4 + k * 0.6, 'branchie', 1);
    bsBouche(P, hx + 0.3, hy + 3.7, 'crocs', 4);
    bsColAka(P, hx, 31.5 + b, 0, { h: 3.2 });
    if (att) { // l'épée à écailles débandée
      shBras(P, 31.5, 33 + b, 35, 37, 37.5, 36.5, 'cape', 'peau', { r: 2.3, rm: 2 }); P.membre(36.5, 36.6, 40, 36, 1, 'tsuka');
      P.poly([[40, 32], [50.5, 29.5], [51.5, 41], [40, 40.5]], 'ecaille', { cyl: true });
      P.piece(); for (let y = 31; y < 41; y += 1.5) for (let x = 41 + (y % 3 ? 0.75 : 0); x < 50.5; x += 1.5) { P.point(x, y, 'ecaille', 4); P.point(x + 0.5, y + 0.5, 'ecaille', 0); } P.traitPiece();
      for (let x = 41; x < 51; x += 1.5) { P.poly([[x, 31.8 - (x - 40) * 0.22], [x + 0.75, 30 - (x - 40) * 0.22], [x + 1.5, 31.8 - (x - 40) * 0.22]], 'ecaille', { niv: 3, trait: false }); P.poly([[x, 40.4], [x + 0.75, 42], [x + 1.5, 40.4]], 'ecaille', { niv: 1, trait: false }); }
    } else shBras(P, 31.5, 33 + b, 34, 38.5 + b, 33, 43 + b, 'cape', 'peau', { r: 2.3, rm: 2 });
  },
};

// ═══ Étage 7 ═══
// BOS_016 Itachi — manteau de l'organisation au col ouvert, longs cheveux noirs encadrant le visage, queue basse,
// bandeau rayé, yeux rouges, cernes marqués ; une main sortie du manteau ; à l'attaque, des corbeaux jaillissent.
BOSS_PEINTS.itachi = {
  pal: pb({ peau: '#f0d0b4', cheveux: '#1e1e28', iris: '#c8202a', bandeau: '#2a2a3a', pantalon: '#2a2a36', sandale: '#2a2a36', ongle: '#7a5a9a', cernes: '#b88a78', corbeau: '#1e1a28' }),
  f(P, i, att) {
    const b = i * 0.5;
    P.membre(28, 27 + b, 29.5, 36.5 + b, 1.1, 'cheveux', { trait: false });
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.8 });
    shBras(P, 21, 34 + b, 18.5, 39.5 + b, 18.5, 44 + b, 'cape', 'peau', { r: 2 });
    bsManteauAka(P, b, { nuages: [[22, 41, 1], [30.5, 47.5, 0.9], [20.5, 49.5, 0.75]] });
    bsNuage(P, 18.5, 37 + b, 0.7);
    const hx = 26, hy = 25 + b;
    P.boule(hx, hy - 0.4, 5.1, 4.9, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 0.8, 4.4, 4.3);
    bsBandeau(P, hx, hy - 3.2, 5.2, { plaque: 4.6, raye: true });
    P.poly([[hx - 5.2, hy - 1.6], [hx - 3.4, hy - 1.6], [hx - 3.7, hy + 5.6], [hx - 5.5, hy + 4.6]], 'cheveux', { cyl: true });
    P.poly([[hx + 3.6, hy - 1.6], [hx + 5.4, hy - 1.6], [hx + 5.6, hy + 4.6], [hx + 3.9, hy + 5.6]], 'cheveux', { cyl: true });
    P.poly([[hx - 1.2, hy - 1.6], [hx + 0.6, hy - 1.6], [hx - 0.1, hy + 0.4]], 'cheveux', { niv: 2, trait: false });
    bsYeux(P, hx + 0.2, hy + 1.2, 'sharingan', { ecart: 2.1 });
    P.ligneFine(hx - 1.1, hy + 2.4, hx - 1.1, hy + 3.4, 'cernes', 1); P.ligneFine(hx + 1.5, hy + 2.4, hx + 1.5, hy + 3.4, 'cernes', 1);
    bsBouche(P, hx + 0.3, hy + 4, 'trait', 1.5);
    bsColAka(P, hx, 33.5 + b, 0, { h: 4.2 });
    if (att) { // bras tendu : corbeaux
      shBras(P, 31, 34 + b, 35, 35.5, 39, 34, 'cape', 'peau', { r: 2 }); P.point(39.8, 33.6, 'ongle', 2);
      const corbeau = (x, y, s, h) => { P.poly([[x - 3 * s, y - (h ? 2 : -0.5) * s], [x - 0.6 * s, y - 0.3 * s], [x, y - 1.2 * s], [x + 0.8 * s, y - 0.2 * s], [x + 3.2 * s, y - (h ? 2.2 : -0.6) * s], [x + 1.2 * s, y + 0.8 * s], [x - 1, y + 0.9 * s]], 'corbeau', { relief: true, niv: 1 }); P.point(x + 0.7 * s, y - 0.6 * s, 'iris', 3); };
      corbeau(44, 31, 1.3, true); corbeau(48.5, 26.5, 1, false); corbeau(42.5, 24.5, 0.9, false);
      P.apres((g, E) => { g.fillStyle = '#ff4040'; g.fillRect(Math.round((hx - 2.3) * E), Math.round((hy + 1.2) * E), 1, 1); g.fillRect(Math.round((hx + 2.7) * E), Math.round((hy + 1.2) * E), 1, 1); });
    } else { shBras(P, 31, 34 + b, 32.5, 39 + b, 28.5, 39.5 + b, 'cape', 'peau', { r: 2 }); P.point(27.5, 39.5 + b, 'ongle', 2); }
  },
};

// ═══ Étage 8 ═══
// BOS_018 Pain — cheveux orange en pointes, yeux à cercles concentriques, piercings sur l'arête du nez, les oreilles et
// sous la lèvre ; tiges noires dans la manche ; à l'attaque, la paume levée repousse tout autour de lui.
BOSS_PEINTS.pain = {
  pal: pb({ peau: '#efc6a2', cheveux: '#e8782a', iris: '#b4a4d8', piercing: { c: '#c8ccd8', brille: true }, bandeau: '#2a2a3a', pantalon: '#2a2a36', sandale: '#2a2a36', tige: '#2e2a36' }),
  f(P, i, att) {
    const b = i * 0.5;
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.9 });
    shBras(P, 21, 34 + b, 18.5, 39.5 + b, 18.5, 44 + b, 'cape', 'peau', { r: 2 });
    P.membre(17.5, 41.5 + b, 15.5, 48 + b, 0.5, 'tige'); P.membre(18.8, 41.5 + b, 18, 49 + b, 0.5, 'tige');
    bsManteauAka(P, b, { nuages: [[30, 41, 1], [21.5, 47, 0.95], [31, 50, 0.75]] });
    bsNuage(P, 18.5, 37 + b, 0.7);
    const hx = 26, hy = 25 + b;
    P.boule(hx, hy - 0.5, 5.1, 4.8, 'cheveux');
    shPointes(P, hx, hy - 0.5, 5.2, 'cheveux', [[-115, 3.2, 3], [-88, 3.8, 3.2], [-60, 3.6, 3.4], [-30, 3.4, 3.2], [0, 3.2, 3.2], [30, 3.4, 3.2], [60, 3.6, 3.4], [88, 3.8, 3.2], [115, 3, 3]]);
    bsVisage(P, hx + 0.2, hy + 1, 4.4, 4.3);
    bsBandeau(P, hx, hy - 3, 5.2, { plaque: 4.6, raye: true });
    P.poly([[hx - 4.6, hy - 1.2], [hx - 3.2, hy + 0.6], [hx - 2.2, hy - 1.2], [hx + 3.8, hy - 1.2], [hx + 4.8, hy + 0.4], [hx + 4.8, hy - 1.6], [hx - 4.6, hy - 1.6]], 'cheveux', { niv: 2, trait: false });
    bsYeux(P, hx + 0.2, hy + 1.3, 'rinnegan', { ecart: 2.3 });
    for (let k = 0; k < 3; k++) { P.point(hx - 0.5, hy + 1.6 + k * 0.6, 'piercing', 3); P.point(hx + 0.9, hy + 1.6 + k * 0.6, 'piercing', 3); }
    for (const [x, y] of [[-4.6, 1], [-4.8, 2], [-4.6, 3], [5, 1], [5.2, 2], [5, 3]]) P.point(hx + 0.2 + x, hy + y, 'piercing', 4);
    P.point(hx - 0.3, hy + 4.4, 'piercing', 3); P.point(hx + 0.7, hy + 4.4, 'piercing', 3);
    bsBouche(P, hx + 0.2, hy + 3.7, 'trait', 1.5);
    bsColAka(P, hx, 33.5 + b, 0, { h: 4.6 });
    if (att) { // paume levée, onde de répulsion
      shBras(P, 31, 34 + b, 35, 33, 37, 28.5, 'cape', 'peau', { r: 2 });
      P.apres((g, E) => { g.globalAlpha = 0.55; g.strokeStyle = '#f0e0ff'; g.lineWidth = 1; for (const r of [6, 10, 14]) { g.beginPath(); g.arc(37 * E, 28.5 * E, r * E, -1.9, 1.2); g.stroke(); } g.globalAlpha = 1; });
    } else shBras(P, 31, 34 + b, 33.5, 39 + b, 33, 43.5 + b, 'cape', 'peau', { r: 2 });
  },
};

// BOS_011 Kabuto — cheveux gris en queue basse, lunettes rondes qui brillent, haut violet à col montant, ceinture de
// tissu blanc nouée ; mains de chakra médical ; à l'attaque, le scalpel de chakra s'allume.
BOSS_PEINTS.kabuto = {
  pal: pb({ peau: '#f0d0b4', cheveux: '#b4b4c0', tenue: '#5a4a7a', tenue2: '#46385e', ceinture: '#ece8e0', pantalon: '#3a3448', sandale: '#2e2a3a', verre: { c: '#d8f0ff', brille: true }, monture: '#3a3448', iris: '#3a3048' }),
  f(P, i, att) {
    const b = i * 0.5;
    P.membre(28, 27 + b, 29, 33.5 + b, 1, 'cheveux', { trait: false });
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.8 });
    shBras(P, 21, 34.5 + b, 18.5, 39.5 + b, 19, 43.5 + b, 'tenue', 'peau', { r: 1.7 });
    P.tronc(32.5 + b, 47, 20.5, 31.5, 20.5, 31.5, 'tenue', { arrondi: 2.5 });
    P.poly([[20.5, 44], [31.5, 44], [32, 49], [20, 49]], 'tenue', { cyl: true }); // pans de la tunique
    P.piece(); P.ligneFine(26, 44, 26, 49, 'tenue2', 0); P.traitPiece();
    P.membre(20.8, 42.5 + b * 0.5, 31.2, 42.5 + b * 0.5, 1, 'ceinture'); P.poly([[28, 42.5 + b * 0.5], [30, 46.5], [28.6, 46.8], [27.4, 43.4 + b * 0.5]], 'ceinture', { niv: 2 });
    P.tronc(30.6 + b, 34 + b, 23, 29, 22.5, 29.5, 'tenue2'); // col montant
    const hx = 26, hy = 25.5 + b;
    P.boule(hx, hy - 0.5, 5, 4.8, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    P.poly([[hx - 4.8, hy - 0.4], [hx - 2.6, hy + 1.2], [hx - 1.6, hy - 1], [hx + 1, hy - 1.4], [hx + 3, hy + 0.6], [hx + 4.8, hy - 0.4], [hx + 5, hy - 3.2], [hx - 5, hy - 3.2]], 'cheveux', { niv: 3, trait: false });
    P.poly([[hx - 5, hy - 1], [hx - 3.8, hy - 1], [hx - 4.2, hy + 4], [hx - 5.4, hy + 3]], 'cheveux', { cyl: true });
    for (const c of [-1, 1]) { P.boule(hx + 0.2 + c * 2.1, hy + 1.6, 1.5, 1.3, 'monture', { trait: false }); P.boule(hx + 0.2 + c * 2.1, hy + 1.6, 1.1, 0.9, 'verre', { niv: 3, trait: false }); P.point(hx + 0.2 + c * 2.1 - 0.5, hy + 1.2, 'verre', 4); P.point(hx + 0.2 + c * 2.1 + 0.3, hy + 1.8, 'iris', 1); }
    P.ligneFine(hx - 0.5, hy + 1.4, hx + 0.9, hy + 1.4, 'monture', 1);
    bsBouche(P, hx + 0.6, hy + 4, 'sourire', 2);
    if (att) { shBras(P, 31, 34.5 + b, 35, 34, 38, 31.5, 'tenue', 'peau', { r: 1.7 }); P.apres((g, E) => { g.globalAlpha = 0.85; g.fillStyle = '#60f0c0'; g.fillRect(38 * E, 25 * E, 2, 6 * E); g.fillStyle = '#e0fff4'; g.fillRect(38 * E + 1, 25.5 * E, 1, 5 * E); g.globalAlpha = 1; }); bsLueur(P, 38.2, 31.5, 2.4, '#40e0a0', '#e0fff4'); }
    else { shBras(P, 31, 34.5 + b, 33.5, 39.5 + b, 33, 43.5 + b, 'tenue', 'peau', { r: 1.7 }); bsLueur(P, 33, 43.5 + b, 1.8, '#40e0a0', '#e0fff4'); }
  },
};

// BOS_013 Hidan — cheveux argentés plaqués en arrière, yeux violets, manteau ouvert sur un torse nu et un pendentif
// (cercle et triangle) ; grande faux rouge à trois lames ; forme 1 : le rituel — corps noirci, ossements peints en blanc.
BOSS_PEINTS.hidan = {
  formes: 2,
  pal: pb({ peau: '#f0d4bc', noir: '#24202a', os: '#f0ece4', cheveux: '#d8dae4', iris: '#a050b8', faux: { c: '#c8303a', brille: true }, manche: '#5a4a42', pendentif: { c: '#c8ccd8', brille: true }, pantalon: '#2a2a36', sandale: '#2a2a36' }),
  f(P, i, att, forme) {
    const b = i * 0.5, rit = forme === 1, pk = rit ? 'noir' : 'peau';
    const faux = (x0, y0, x1, y1) => { // manche, puis trois lames courbes au bout
      P.membre(x0, y0, x1, y1, 0.7, 'manche'); const a = Math.atan2(y1 - y0, x1 - x0), pt = (an, r) => [x1 + Math.cos(an) * r, y1 + Math.sin(an) * r];
      for (const k of [-1, 0, 1]) { const d = a + Math.PI / 2 + k * 0.55; P.poly([pt(a + k * 0.5, 0.5), pt(d, 8.2 - Math.abs(k) * 1.2), pt(d - 0.55, 5.6 - Math.abs(k) * 0.8), pt(a + k * 0.5 - 0.6, 1.6)], 'faux', { relief: true, niv: 2 }); }
    };
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.9 });
    shBras(P, 21, 34 + b, 18.5, 39.5 + b, 18.5, 44 + b, 'cape', pk, { r: 2 });
    bsManteauAka(P, b, { ouvert: false, nuages: [[21, 42, 0.95], [31, 47.5, 0.9], [20.5, 49.5, 0.7]] });
    P.poly([[22.5, 33 + b], [29.5, 33 + b], [28, 42 + b], [24, 42 + b]], pk, { cyl: true }); // torse nu dans l'ouverture
    if (rit) { P.piece(); for (const y of [36, 38, 40]) { P.ligneFine(23.5, y + b, 25.5, y + b - 0.5, 'os', 3); P.ligneFine(26.5, y + b - 0.5, 28.5, y + b, 'os', 3); } P.ligneFine(26, 34 + b, 26, 41 + b, 'os', 3); P.traitPiece(); }
    else { P.piece(); P.ligneFine(26, 35 + b, 26, 41 + b, 'peau', 1); P.traitPiece(); }
    P.boule(26, 37.5 + b, 1.4, 1.4, 'pendentif', { trait: false }); P.boule(26, 37.5 + b, 0.7, 0.7, pk, { niv: 1, trait: false }); P.point(26, 37.9 + b, 'pendentif', 3);
    const hx = 26, hy = 25.5 + b;
    P.boule(hx, hy - 0.8, 5, 4.6, 'cheveux', { plus: 0.1 });
    P.piece(); for (const x of [-3, -1, 1, 3]) P.ligneFine(hx + x, hy - 4.6, hx + x * 1.15, hy - 1.2, 'cheveux', 1); P.traitPiece(); // plaqués en arrière
    bsVisage(P, hx + 0.2, hy + 1, 4.3, 4.2, pk);
    if (rit) { P.piece(); P.rect(hx - 3.4, hy + 0.2, 2.6, 2.4, 'os', 3); P.rect(hx + 1.2, hy + 0.2, 2.6, 2.4, 'os', 3); P.rect(hx - 1.8, hy + 3.2, 4.4, 1.6, 'os', 3); for (const x of [-1.2, 0, 1.2]) P.point(hx + 0.2 + x, hy + 4, 'noir', 1); P.traitPiece(); }
    bsYeux(P, hx + 0.2, hy + 1.4, rit ? 'lueur' : 'normal', { ecart: 2.1, sourcil: 'colere', ksourcil: 'cheveux' });
    if (!rit) bsBouche(P, hx + 0.6, hy + 3.9, 'dents', 2.5);
    bsColAka(P, hx, 33.5 + b, 0, { h: 2.6 });
    if (att) { shBras(P, 31, 34 + b, 35, 35, 38.5, 33, 'cape', pk, { r: 2 }); faux(36, 36, 47, 25); P.apres((g, E) => { g.globalAlpha = 0.45; g.strokeStyle = '#ffb0b0'; g.beginPath(); g.arc(40 * E, 34 * E, 12 * E, -1.6, -0.3); g.stroke(); g.globalAlpha = 1; }); }
    else { faux(37, 55, 37, 21.5 + b); shBras(P, 31, 34 + b, 34, 38.5 + b, 36.2, 40.5 + b, 'cape', pk, { r: 2 }); }
  },
};

// ═══ Étage 6 ═══
// BOS_014 Orochimaru — teint blafard, longs cheveux noirs raides, yeux jaunes fendus cernés de violet, robe claire
// fermée d'une grosse corde violette nouée dans le dos ; à l'attaque, des serpents jaillissent de sa manche.
BOSS_PEINTS.orochimaru = {
  pal: pb({ peau: '#e2dcc4', cheveux: '#1a1a22', robe: '#e0dac4', corde: '#7a3aa0', pantalon: '#3a3a44', sandale: '#2e2e38', iris: '#e8c030', fard: '#9a5ab0', serpent: '#8a9a5a', ventre: '#d8d4a0', langue: '#c83a5a' }),
  f(P, i, att) {
    const b = i * 0.5;
    P.poly([[20, 24 + b], [32, 24 + b], [33.5, 44 + b], [30, 45 + b], [26, 43 + b], [22, 45 + b], [18.5, 44 + b]], 'cheveux', { cyl: true }); // cheveux jusqu'au bas du dos
    for (const c of [-1, 1]) P.boule(26 + c * 6.5, 42.5 + b * 0.5, 2.6, 1.9, 'corde');
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.8 });
    shBras(P, 21, 34.5 + b, 18, 40 + b, 18.5, 44 + b, 'robe', 'peau', { r: 2.1, rm: 1.6 });
    P.tronc(32.5 + b, 48, 20.5, 31.5, 19.5, 32.5, 'robe', { arrondi: 2.5, degrade: 0.15 });
    P.poly([[23.5, 33 + b], [26, 33 + b], [30.5, 42 + b], [28, 42 + b]], 'robe', { niv: 1 }); // croisé du col
    P.membre(20.5, 42.5 + b * 0.5, 31.5, 42.5 + b * 0.5, 1.2, 'corde'); P.piece(); for (let x = 21; x < 31.5; x += 1.2) P.ligneFine(x, 41.7 + b * 0.5, x + 0.7, 43.3 + b * 0.5, 'corde', 1); P.traitPiece();
    const hx = 26, hy = 25.4 + b;
    P.boule(hx, hy - 0.4, 5.1, 4.9, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.3);
    P.poly([[hx - 5, hy - 0.8], [hx - 0.4, hy - 2.8], [hx + 0.4, hy - 0.4], [hx + 1.4, hy - 2.8], [hx + 5, hy - 0.8], [hx + 5.1, hy - 3.6], [hx - 5.1, hy - 3.6]], 'cheveux', { niv: 2, trait: false });
    P.poly([[hx - 5.1, hy - 1], [hx - 3.8, hy - 1], [hx - 4, hy + 6], [hx - 5.6, hy + 5]], 'cheveux', { cyl: true }); P.poly([[hx + 4, hy - 1], [hx + 5.3, hy - 1], [hx + 5.8, hy + 5], [hx + 4.2, hy + 6]], 'cheveux', { cyl: true });
    for (const c of [-1, 1]) P.ligneFine(hx + 0.2 + c * 3.2, hy + 0.6, hx + 0.2 + c * 3.4, hy + 2.8, 'fard', 2); // fard violet
    bsYeux(P, hx + 0.2, hy + 1.6, 'serpent', { ecart: 2 });
    bsBouche(P, hx + 0.8, hy + 4, 'rictus', 2.5);
    if (att) { // serpents hors de la manche
      shBras(P, 31, 34.5 + b, 35, 37, 37, 37.5, 'robe', 'peau', { r: 2.1, rm: 1.6 });
      for (const [dy, l] of [[-3.5, 11], [0, 13], [3.5, 10]]) { const y = 37.5 + dy; P.membre(37, 37.5, 37 + l * 0.5, y + 1, 1, 'serpent'); P.membre(37 + l * 0.5, y + 1, 37 + l, y, 0.9, 'serpent'); P.boule(37 + l + 0.6, y, 1.4, 1.1, 'serpent'); P.point(37 + l + 1, y - 0.4, 'iris', 3); P.ligneFine(37 + l + 1.8, y + 0.4, 37 + l + 3, y + 0.8, 'langue', 2); }
    } else shBras(P, 31, 34.5 + b, 34, 40 + b, 33.5, 44 + b, 'robe', 'peau', { r: 2.1, rm: 1.6 });
  },
};

// ═══ Étage 7 ═══
// BOS_015 Deidara — perché sur un grand oiseau d'argile aux ailes déployées ; cheveux blonds en queue haute, mèche
// sur l'œil et viseur ; à l'attaque, il brandit une poignée d'argile façonnée.
BOSS_PEINTS.deidara = {
  pal: pb({ peau: '#f2d2b0', cheveux: '#f0d060', argile: '#efe8da', argile2: '#c8bca8', viseur: { c: '#9aa4b0', brille: true }, lentille: { c: '#7ad0f0', brille: true }, pantalon: '#2a2a36', sandale: '#2a2a36', iris: '#4a7ab0' }),
  f(P, i, att) {
    const b = i * 0.5, w = i ? -1.5 : 0; // battement d'ailes
    // oiseau d'argile : ailes, corps, tête à l'avant, queue
    for (const c of [-1, 1]) { // ailes : bord d'attaque arrondi, rémiges en dents de scie
      P.poly([[26 + c * 4, 46.5], [26 + c * 10, 42 + w], [26 + c * 17, 40.5 + w * 1.4], [26 + c * 23, 42 + w * 1.6], [26 + c * 20.5, 44.5 + w], [26 + c * 21, 46.5 + w], [26 + c * 17, 46 + w * 0.6], [26 + c * 16.5, 48.5], [26 + c * 12.5, 47.5], [26 + c * 11.5, 50], [26 + c * 5, 50.5]], 'argile', { relief: true, niv: c < 0 ? 3 : 2 });
      P.piece(); P.ligneFine(26 + c * 6, 47.5, 26 + c * 17, 42.5 + w * 1.2, 'argile2', 2); P.traitPiece();
    }
    P.poly([[20.5, 50], [13.5, 51.5], [14.5, 53], [13.5, 54.5], [21, 53]], 'argile2', { niv: 2 }); // queue
    P.boule(26, 50, 7.5, 3.6, 'argile', { plus: 0.1 });
    P.membre(31, 49.5, 37, 47, 2, 'argile'); P.boule(38.5, 46.5, 2.5, 2.2, 'argile', { plus: 0.1 }); P.poly([[40.5, 45.5], [44, 46.8], [40.5, 47.8]], 'argile2', { niv: 2 }); P.point(39, 45.8, 'oeil', 1); // tête et bec
    const yb = -9; // le personnage est debout sur le dos de l'oiseau
    const hx = 26, hy = 25.5 + yb + b;
    P.membre(hx - 0.5, hy - 5, hx - 4, hy + 6, 1.4, 'cheveux', { trait: false }); // queue haute qui retombe
    P.boule(hx - 1, hy - 5, 1.8, 1.6, 'cheveux');
    P.membre(24, 45 + yb, 23.5, 54 + yb, 1.7, 'pantalon'); P.membre(28, 45 + yb, 28.5, 54 + yb, 1.7, 'pantalon'); P.boule(23.5, 54.5 + yb, 2.1, 1.3, 'sandale'); P.boule(28.8, 54.5 + yb, 2.1, 1.3, 'sandale');
    shBras(P, 21, 34 + yb + b, 18.5, 39.5 + yb + b, 18.5, 43.5 + yb + b, 'cape', 'peau', { r: 1.9 });
    P.tronc(32.5 + yb + b, 47 + yb, 20, 32, 18.5, 33.5, 'cape', { arrondi: 2.5, degrade: 0.2 });
    bsNuage(P, 22, 40 + yb + b, 0.9); bsNuage(P, 30.5, 44 + yb + b, 0.8);
    P.boule(hx, hy - 0.5, 5, 4.8, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    P.poly([[hx - 4.8, hy - 1], [hx - 2.4, hy + 0.8], [hx - 1, hy - 0.8], [hx + 0.6, hy - 2.2], [hx + 5, hy - 0.4], [hx + 5.2, hy - 3.4], [hx - 5, hy - 3.4]], 'cheveux', { niv: 3, trait: false });
    P.poly([[hx - 5, hy - 1], [hx - 3.6, hy - 0.6], [hx - 3.6, hy + 4.6], [hx - 5.4, hy + 3.6]], 'cheveux', { cyl: true }); // longue mèche sur l'œil gauche
    bsYeux(P, hx + 0.2, hy + 1.5, 'normal', { ecart: 2.1, seul: false });
    P.rect(hx - 4.6, hy + 0.6, 2.8, 2, 'cheveux', 2);
    P.boule(hx - 3.6, hy + 1.4, 1.3, 1.3, 'viseur', { trait: false }); P.boule(hx - 3.6, hy + 1.4, 0.7, 0.7, 'lentille', { niv: 3, trait: false }); P.ligneFine(hx - 4.8, hy + 1.4, hx - 4.8, hy - 1.6, 'viseur', 2);
    bsBouche(P, hx + 0.6, hy + 3.9, 'sourire', 2.5);
    bsColAka(P, hx, 33 + yb + b, 0, { h: 3 });
    if (att) { shBras(P, 31, 34 + yb + b, 35, 30 + yb, 36.5, 25.5 + yb, 'cape', 'peau', { r: 1.9 }); P.boule(37, 23.5 + yb, 2.2, 1.8, 'argile'); P.poly([[35.5, 23 + yb], [33, 20.5 + yb], [36.5, 22 + yb]], 'argile', { niv: 3 }); P.poly([[38.5, 23 + yb], [41, 20.5 + yb], [37.5, 22 + yb]], 'argile2', { niv: 2 }); bsLueur(P, 37, 23.5 + yb, 3.2, '#ffe080', '#fff8e0'); }
    else shBras(P, 31, 34 + yb + b, 33.5, 39 + yb + b, 33, 43.5 + yb + b, 'cape', 'peau', { r: 1.9 });
  },
};

// BOS_017 Kakuzu — grande carrure, capuche sombre et masque de tissu blanc, yeux verts sur fond rouge, coutures aux
// bras ; des fils noirs s'échappent des manches ; à l'attaque, le bras tendu se déroule en fils.
BOSS_PEINTS.kakuzu = {
  pal: pb({ peau: '#a8805a', capuche: '#3a4250', masque: '#e8e4dc', iris: '#5ac85a', rouge: '#c8282a', fil: '#1c1820', couture: '#3a2a20', pantalon: '#2a2a36', sandale: '#2a2a36', bandeau: '#3a4250' }),
  f(P, i, att) {
    const b = i * 0.5;
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 2.2 }, 0.5);
    shBras(P, 20, 33 + b, 17, 39 + b, 17.5, 44 + b, 'cape', 'peau', { r: 2.3, rm: 2 });
    shFils(P, [[17, 45 + b, 14, 50], [18, 45 + b, 17, 52], [17.5, 45.5 + b, 20, 51]], '#2a2430');
    bsManteauAka(P, b, { large: 1.5, epaules: 31.5, nuages: [[21.5, 40, 1.1], [31, 46.5, 1], [20.5, 49.5, 0.85]] });
    const hx = 26, hy = 23.8 + b;
    P.boule(hx, hy - 0.2, 5.6, 5.4, 'capuche'); P.piece(); P.ligneFine(hx, hy - 5.4, hx, hy - 1.8, 'capuche', 1); P.traitPiece();
    bsVisage(P, hx + 0.2, hy + 1.2, 4, 3.9);
    bsBandeau(P, hx, hy - 2.4, 4.4, { plaque: 4.2, raye: true });
    P.tronc(hy + 2.2, hy + 5.6, hx - 4.4, hx + 4.6, hx - 3.8, hx + 4, 'masque');
    P.piece(); P.ligneFine(hx - 3.6, hy + 3.6, hx + 3.8, hy + 3.6, 'masque', 1); P.traitPiece();
    bsYeux(P, hx + 0.2, hy + 1, ['.kkk', 'rrir', '.rri'], { ecart: 2.1 });
    bsColAka(P, hx, 31.5 + b, 0, { h: 3.4 });
    if (att) {
      shBras(P, 31.5, 33 + b, 35.5, 36, 38.5, 35, 'cape', 'peau', { r: 2.3, rm: 2 });
      P.piece(); for (const [x, y] of [[33, 34.5], [36.5, 35.5]]) P.ligneFine(x, y - 1, x + 0.5, y + 1, 'couture', 1); P.traitPiece();
      shFils(P, [[39, 35, 46, 30], [39.5, 35.5, 48, 34], [39, 36, 47, 39], [38.5, 35, 44, 27], [39, 36.5, 44.5, 42]], '#2a2430');
    } else { shBras(P, 31.5, 33 + b, 34, 38.5 + b, 33.5, 43.5 + b, 'cape', 'peau', { r: 2.3, rm: 2 }); shFils(P, [[33.5, 44.5 + b, 35, 50], [34, 44.5 + b, 37, 49]], '#2a2430'); }
  },
};

// ═══ Étage 8 ═══
// BOS_023 Konan — cheveux bleu-violet en chignon orné d'une fleur de papier, piercing sous la lèvre, ailes de papier
// déployées ; à l'attaque, les ailes s'ouvrent en grand et des feuilles volent.
BOSS_PEINTS.konan = {
  pal: pb({ peau: '#f2dcc8', cheveux: '#5a5ac8', fleur: '#f4f0e8', fleur2: '#e8b040', papier: '#f4f0e6', papier2: '#d8d0c0', iris: '#d8a040', fard: '#8a7ac8', piercing: { c: '#c8ccd8', brille: true }, pantalon: '#2a2a36', sandale: '#2a2a36' }),
  f(P, i, att) {
    const b = i * 0.5, o = att ? 1.4 : 1, w = i ? 1 : 0;
    for (const c of [-1, 1]) for (let k = 0; k < 5; k++) { // ailes de papier : feuilles rectangulaires en éventail
      const a = -0.35 - k * 0.32, x0 = 26 + c * 4, y0 = 34 + b, L = (7 + k * 1.6) * o, x1 = x0 + c * Math.cos(a) * L, y1 = y0 + Math.sin(a) * L * 0.9 + w;
      P.poly([[x0, y0], [x1, y1], [x1 + c * 2.2, y1 + 2.4], [x0 + c * 1.5, y0 + 3]], k % 2 ? 'papier2' : 'papier', { relief: true, niv: c < 0 ? 3 : 2 });
    }
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.7 });
    shBras(P, 21, 34 + b, 18.5, 39.5 + b, 18.5, 44 + b, 'cape', 'peau', { r: 1.8 });
    bsManteauAka(P, b, { nuages: [[22, 41, 0.95], [30.5, 47.5, 0.9], [20.5, 49.5, 0.7]] });
    const hx = 26, hy = 25.5 + b;
    P.boule(hx + 3.5, hy - 4, 2.2, 2, 'cheveux'); // chignon
    P.boule(hx, hy - 0.5, 4.9, 4.7, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    P.poly([[hx - 4.8, hy - 1], [hx - 4, hy + 2.6], [hx - 3.2, hy - 0.4], [hx - 1, hy - 1.6], [hx + 4.8, hy - 0.6], [hx + 5, hy - 3.2], [hx - 4.9, hy - 3.2]], 'cheveux', { niv: 3, trait: false });
    for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; P.boule(hx + 4 + Math.cos(a) * 1.1, hy - 4.6 + Math.sin(a) * 1.1, 0.9, 0.9, 'fleur', { trait: false }); } P.point(hx + 4, hy - 4.6, 'fleur2', 3); // fleur de papier
    bsYeux(P, hx + 0.2, hy + 1.6, 'fente', { ecart: 2.1 }); for (const c of [-1, 1]) P.ligneFine(hx + 0.2 + c * 2.1 - 1, hy + 0.6, hx + 0.2 + c * 2.1 + 1, hy + 0.6, 'fard', 2);
    bsBouche(P, hx + 0.4, hy + 3.9, 'trait', 1.5); P.point(hx + 0.4, hy + 4.6, 'piercing', 4);
    bsColAka(P, hx, 33.5 + b, 0, { h: 3.6 });
    if (att) { shBras(P, 31, 34 + b, 35, 33, 38.5, 31, 'cape', 'peau', { r: 1.8 }); for (const [x, y, a] of [[42, 28, 0.3], [45.5, 32, -0.2], [43, 35.5, 0.6], [47, 26, 0.1]]) P.poly([[x, y], [x + 2 * Math.cos(a), y + 2 * Math.sin(a)], [x + 2 * Math.cos(a) - 1.5 * Math.sin(a), y + 2 * Math.sin(a) + 1.5 * Math.cos(a)], [x - 1.5 * Math.sin(a), y + 1.5 * Math.cos(a)]], 'papier', { relief: true, niv: 2 }); }
    else shBras(P, 31, 34 + b, 33.5, 39.5 + b, 33, 44 + b, 'cape', 'peau', { r: 1.8 });
  },
};

// BOS_019 Obito — masque orange à spirale, un seul trou d'œil, cheveux noirs courts ; manteau de l'organisation ;
// à l'attaque, l'air se tord en spirale devant sa main tendue.
BOSS_PEINTS.obito = {
  pal: pb({ masque: '#ec8a24', masque2: '#a8480c', cheveux: '#24242c', pantalon: '#2a2a36', sandale: '#2a2a36', gant: '#2e2c38', iris: '#c8202a' }),
  f(P, i, att) {
    const b = i * 0.5;
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.9 });
    shBras(P, 21, 34 + b, 18.5, 39.5 + b, 18.5, 44 + b, 'cape', 'gant', { r: 2 });
    bsManteauAka(P, b, { nuages: [[30, 41.5, 1], [21.5, 47, 0.95], [31, 50, 0.7]] });
    const hx = 26, hy = 25.5 + b;
    P.boule(hx, hy - 0.8, 5.1, 4.8, 'cheveux'); shPointes(P, hx, hy - 1, 5, 'cheveux', [[-75, 2.4, 3], [-40, 2.8, 3.2], [-8, 3, 3.2], [25, 2.8, 3.2], [60, 2.4, 3]]);
    P.boule(hx + 0.2, hy + 1, 4.4, 4.4, 'masque', { plus: 0.15 }); // masque à spirale
    P.piece(); const cx = hx + 1.8, cy = hy + 0.6; for (let t = 0.6; t < 13; t += 0.12) { const r = t * 0.36, x = cx + Math.cos(t) * r, y = cy + Math.sin(t) * r * 0.9; if ((x - hx - 0.2) ** 2 / 19 + (y - hy - 1) ** 2 / 19 < 1) P.point(x, y, 'masque2', 1); } P.traitPiece();
    P.boule(cx, cy, 0.9, 0.9, 'oeil', { niv: 0, trait: false }); P.point(cx, cy, 'iris', 3);
    bsColAka(P, hx, 33.5 + b, 0, { h: 4.4 });
    if (att) { shBras(P, 31, 34 + b, 35, 35.5, 38.5, 34.5, 'cape', 'gant', { r: 2 }); P.apres((g, E) => { const X = 43 * E, Y = 33 * E; g.globalAlpha = 0.75; for (let t = 0; t < 14; t += 0.1) { const r = t * 0.55 * E; g.fillStyle = t > 9 ? '#5a4a7a' : '#c8b8f0'; g.fillRect(Math.round(X + Math.cos(t) * r), Math.round(Y + Math.sin(t) * r * 0.8), 1, 1); } g.globalAlpha = 1; }); }
    else shBras(P, 31, 34 + b, 33.5, 39.5 + b, 33, 44 + b, 'cape', 'gant', { r: 2 });
  },
};

// ═══ Branches (étage 9) ═══
// BOS_021 Madara (empreinte) — immense crinière noire jusqu'à la taille, armure de plaques rouges (épaulières, plastron,
// tassettes), grand éventail de guerre rond dans le dos ; à l'attaque, l'éventail balaie devant lui.
BOSS_PEINTS.madara = {
  pal: pb({ peau: '#f0d2b6', cheveux: '#1c1c26', armure: '#a8282a', armure2: '#7a1a1e', lacet: '#e0c890', dessous: '#2a2a3e', pantalon: '#2a2a3e', sandale: '#2a2a36', eventail: '#d8c8a0', eventail2: '#a8282a', manche: '#5a3a2a', iris: '#b4a4d8' }),
  f(P, i, att) {
    const b = i * 0.5;
    const eventail = (cx, cy, r) => { P.boule(cx, cy, r, r, 'eventail', { plus: 0.1 }); P.piece(); P.boule(cx, cy - r * 0.45, r * 0.52, r * 0.5, 'eventail2', { niv: 2, trait: false }); P.boule(cx - r * 0.25, cy + r * 0.3, r * 0.42, r * 0.4, 'eventail2', { niv: 1, trait: false }); P.boule(cx + r * 0.3, cy + r * 0.28, r * 0.38, r * 0.36, 'oeil', { niv: 1, trait: false }); P.traitPiece(); };
    if (!att) { P.membre(17, 50, 24, 33 + b, 0.8, 'manche'); eventail(16.5, 49, 5.2); }
    P.poly([[19, 25 + b], [33, 25 + b], [35.5, 44 + b], [31, 46 + b], [27, 43 + b], [23, 46.5 + b], [17, 44.5 + b]], 'cheveux', { cyl: true }); // crinière
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.9 });
    shBras(P, 21, 34.5 + b, 18.5, 40 + b, 18.5, 44 + b, 'dessous', 'peau', { r: 1.9 });
    P.boule(19.5, 34.5 + b, 3.4, 2.8, 'armure'); P.piece(); for (const y of [34, 35.5]) P.ligneFine(16.5, y + b, 22.5, y + b, 'armure2', 0); P.traitPiece(); // épaulière
    P.tronc(32.5 + b, 46, 20.5, 31.5, 21, 31, 'dessous', { arrondi: 2 });
    P.tronc(33.5 + b, 42 + b, 21, 31, 21.5, 30.5, 'armure', { arrondi: 1.5 }); // plastron à plaques
    P.piece(); for (const y of [36, 38.2, 40.4]) { P.ligneFine(21.5, y + b, 30.5, y + b, 'armure2', 0); for (const x of [23, 26, 29]) P.point(x, y + b + 0.5, 'lacet', 3); } P.traitPiece();
    for (const [x0, x1] of [[20.5, 25.5], [26.5, 31.5]]) { P.poly([[x0, 42 + b * 0.5], [x1, 42 + b * 0.5], [x1 + 0.5, 48], [x0 - 0.5, 48]], 'armure', { cyl: true }); P.piece(); for (const y of [44, 46]) P.ligneFine(x0, y, x1, y, 'armure2', 0); P.traitPiece(); } // tassettes
    const hx = 26, hy = 25.5 + b;
    P.boule(hx, hy - 0.6, 5.4, 5, 'cheveux');
    shPointes(P, hx, hy - 0.6, 5.4, 'cheveux', [[-110, 3, 3.4], [-80, 3.6, 3.4], [-50, 3.2, 3.2], [-20, 2.8, 3.2], [15, 3, 3.2], [45, 3.4, 3.4], [80, 3.6, 3.4], [110, 3, 3.4]]);
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    P.poly([[hx - 5, hy - 1.4], [hx - 3.8, hy + 2.4], [hx - 3, hy - 0.4], [hx + 0.4, hy - 1.6], [hx + 3.4, hy + 3.6], [hx + 5, hy - 0.6], [hx + 5.2, hy - 3.6], [hx - 5.2, hy - 3.6]], 'cheveux', { niv: 2, trait: false }); // mèche sur l'œil droit
    bsYeux(P, hx + 0.2, hy + 1.6, 'rinnegan', { ecart: 2.2, seul: true });
    bsBouche(P, hx + 0.6, hy + 4, 'rictus', 2);
    if (att) { shBras(P, 31, 34.5 + b, 35, 34, 38, 31, 'dessous', 'peau', { r: 1.9 }); P.membre(37.5, 31.5, 43, 27, 0.8, 'manche'); eventail(46, 24.5, 6); P.apres((g, E) => { g.globalAlpha = 0.45; g.strokeStyle = '#ffd0c0'; for (const r of [9, 12]) { g.beginPath(); g.arc(40 * E, 30 * E, r * E, -1.9, -0.1); g.stroke(); } g.globalAlpha = 1; }); }
    else shBras(P, 31, 34.5 + b, 33.5, 40 + b, 33, 44 + b, 'dessous', 'peau', { r: 1.9 });
    P.boule(32.5, 34.5 + b, 3.4, 2.8, 'armure'); P.piece(); for (const y of [34, 35.5]) P.ligneFine(29.5, y + b, 35.5, y + b, 'armure2', 0); P.traitPiece();
  },
};

// ═══ Créatures et gardiens (créations originales) ═══
// BOS_002 Serpent géant — la tête dressée sur un cou épais qui sort d'un anneau ; ventre clair, œil fendu, langue ;
// à l'attaque, la gueule s'ouvre en grand sur les crochets. Le reste du corps suit en anneaux peints (anneauSerpentPeint).
const PAL_SERPENT = { ecaille: '#5f8a34', ventre: '#d8cf98', oeil: '#1c1420', iris: '#f0d040', langue: '#c8303a', croc: '#f4f0e0', blanc: '#ffffff', gueule: '#7a1a2a', motif: '#3f6424' };
function peindreSerpent(P, i, att) {
  const b = i * 0.5, o = att ? 1.5 : 0;
  P.boule(21, 51.5, 10, 4.2, 'ecaille'); P.boule(21, 52.5, 7, 2.2, 'ventre', { plus: 0.1 }); // anneau au sol
  P.membre(19, 50, 23, 41, 4.4, 'ecaille', { r1: 3.9 }); P.membre(23, 41, 27.5 + o, 34 + b - o, 3.9, 'ecaille', { r1: 3.4 }); // cou
  P.membre(21.8, 50, 25.2, 41.5, 1.6, 'ventre', { trait: false }); P.membre(25.2, 41.5, 29.4 + o, 35 + b - o, 1.4, 'ventre', { trait: false }); // ventre
  P.piece(); for (let t = 0.12; t < 1; t += 0.16) { const x = lerp(21.8, 29.4 + o, t), y = lerp(50, 35 + b - o, t); P.ligneFine(x - 1, y + 0.3, x + 1.4, y - 0.4, 'ventre', 1); } P.traitPiece();
  P.piece(); for (const [x, y] of [[18, 46], [20.5, 41], [23.5, 37.5]]) { P.ligneFine(x - 1, y, x + 1, y - 1, 'motif', 1); P.ligneFine(x + 1, y - 1, x + 2, y + 0.5, 'motif', 1); } P.traitPiece(); // motif du dos
  const hx = 30 + o, hy = 30 + b - o;
  if (att) { // gueule ouverte : mâchoire haute relevée, basse abaissée
    P.poly([[hx - 1, hy + 1.5], [hx + 9, hy + 0.5], [hx + 9.5, hy + 4.5], [hx, hy + 5]], 'gueule', { niv: 1 });
    P.poly([[hx - 1, hy + 2.5], [hx + 8.5, hy + 4], [hx + 8, hy + 6], [hx - 1, hy + 5.5]], 'ecaille', { cyl: true });
    P.boule(hx, hy - 0.5, 5.4, 4, 'ecaille'); P.poly([[hx + 2, hy - 3.5], [hx + 10, hy - 2.8], [hx + 10.5, hy - 0.4], [hx + 3, hy + 1.6]], 'ecaille', { cyl: true });
    for (const [x, y, d] of [[hx + 8.6, hy - 0.4, 1], [hx + 5.5, hy + 0.2, 1], [hx + 8, hy + 4, -1]]) P.poly([[x - 0.5, y], [x, y + d * 2], [x + 0.5, y]], 'croc', { niv: 3, trait: false });
    P.ligneFine(hx + 2, hy + 3.2, hx + 6, hy + 2.6, 'langue', 2);
  } else {
    P.boule(hx, hy, 5.4, 4.1, 'ecaille'); P.poly([[hx + 2, hy - 3], [hx + 9.5, hy - 1.6], [hx + 10, hy + 1.4], [hx + 3, hy + 3.6]], 'ecaille', { cyl: true }); // museau
    P.ligneFine(hx + 2.5, hy + 1.6, hx + 9.5, hy + 0.8, 'oeil', 1); P.point(hx + 8.8, hy - 1, 'oeil', 1);
    if (i) { P.ligneFine(hx + 10, hy + 0.9, hx + 12.5, hy + 1.4, 'langue', 2); P.point(hx + 13, hy + 0.9, 'langue', 2); P.point(hx + 13, hy + 1.9, 'langue', 2); }
  }
  P.boule(hx + 2.6, hy - 1.6, 1.5, 1.2, 'iris', { niv: 3, trait: false }); P.ligneFine(hx + 2.8, hy - 2.6, hx + 2.8, hy - 0.8, 'oeil', 0); P.point(hx + 2.2, hy - 2.2, 'blanc', 4);
  P.ligneFine(hx - 0.6, hy - 3.2, hx + 4.4, hy - 3.4, 'motif', 1); // arcade
}
BOSS_PEINTS.serpent = { pal: Object.assign({}, P_BASE, PAL_SERPENT), f: peindreSerpent };
// BOS_M01 Mue gardienne — la même silhouette en peau abandonnée, pâle et violacée
BOSS_PEINTS.mue = { pal: Object.assign({}, P_BASE, PAL_SERPENT, { ecaille: '#9a8aae', ventre: '#e6dcec', motif: '#6a5a80', iris: '#c8a0f0' }), f: peindreSerpent };
// Anneaux du corps du serpent (et autres corps segmentés) : boule écaillée, ventre clair, peinte à l'échelle des boss
const _anneauxPeints = new Map();
function anneauSerpentPeint(r, i, palette = PAL_SERPENT, pattes = false) {
  const cle = r + '|' + (i % 2) + '|' + palette.ecaille + '|' + pattes; if (_anneauxPeints.has(cle)) return _anneauxPeints.get(cle);
  const P = peintreShinobi(Object.assign({}, P_BASE, palette), EB), u = r / EB, cx = 26, cy = 30;
  if (pattes) for (const c of [-1, 1]) for (const d of [-0.5, 0.5]) P.membre(cx + c * u * 0.6, cy + d * u * 0.8, cx + c * (u + 2.2), cy + d * u * 1.4 + (i % 2 ? 1 : -1) * c * 0.6, 0.6, 'motif');
  P.boule(cx, cy, u, u * 0.9, 'ecaille');
  P.boule(cx, cy + u * 0.55, u * 0.62, u * 0.32, 'ventre', { trait: false });
  P.piece(); for (const dx of [-0.45, 0, 0.45]) P.ligneFine(cx + dx * u - 0.5, cy - u * 0.5 + (i % 2) * 0.5, cx + dx * u + 0.5, cy - u * 0.2 + (i % 2) * 0.5, 'motif', 1); P.traitPiece();
  const brut = P.toile(1), d = ctxDe(brut).getImageData(0, 0, brut.width, brut.height).data; let x0 = brut.width, y0 = brut.height, x1 = 0, y1 = 0;
  for (let y = 0; y < brut.height; y++) for (let x = 0; x < brut.width; x++) if (d[(y * brut.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const c = toile(x1 - x0 + 1, y1 - y0 + 1); ctxDe(c).drawImage(brut, -x0, -y0); c.cx = cx * EB - x0; c.cy = cy * EB - y0; // centre de l'anneau dans l'image rognée
  _anneauxPeints.set(cle, c); return c;
}

// BOS_022 Empreinte des Dix Queues — masse voûtée gigantesque, œil unique cerclé, gueule large, dix queues dressées
// en éventail ; à l'attaque, une sphère d'énergie se forme dans sa gueule.
BOSS_PEINTS.dix_queues = {
  contours: 2,
  pal: pb({ peau: '#4a3a5a', peau2: '#2e2438', bout: '#8a7aa0', iris: '#d83a3a', anneau: '#5a0a14', corne: '#c8bca8', dent: '#efe6d0', gueule: '#3a0a18', energie: { c: '#c890ff', brille: true } }),
  f(P, i, att) {
    const b = i * 0.5, w = i ? 1 : -1;
    for (let k = 0; k < 10; k++) { // queues épaisses en éventail derrière le corps, ondulantes
      const a = -Math.PI * (0.13 + 0.74 * k / 9), L = 17 + (k % 3) * 2.2, q = (k % 2 ? 1 : -1) * w * 0.14, pt = (t, r) => [26 + Math.cos(a + q * t * 2) * r, 30 + Math.sin(a + q * t * 2) * r * 0.92];
      const [x1, y1] = pt(0.45, L * 0.5), [x2, y2] = pt(0.8, L * 0.82), [x3, y3] = pt(1.2, L), k2 = k % 2 ? 'peau' : 'peau2';
      P.membre(26 + Math.cos(a) * 4, 31, x1, y1, 3.2, k2, { r1: 2.5 }); P.membre(x1, y1, x2, y2, 2.5, k2, { r1: 1.8, trait: false }); P.membre(x2, y2, x3, y3, 1.8, k2, { r1: 0.9, trait: false }); P.boule(x3, y3, 0.9, 0.9, 'bout', { trait: false });
    }
    for (const c of [-1, 1]) { P.membre(26 + c * 12, 38 + b, 26 + c * 17, 46, 3.6, 'peau'); P.membre(26 + c * 17, 46, 26 + c * 17.5, 53.5, 3.2, 'peau2'); for (const d of [-1.6, 0, 1.6]) P.poly([[26 + c * 17.5 + d - 0.6, 54], [26 + c * 17.5 + d * 1.4, 56], [26 + c * 17.5 + d + 0.6, 54]], 'corne', { niv: 3, trait: false }); } // bras d'appui griffus
    P.boule(26, 43 + b, 16, 11.5, 'peau'); P.boule(26, 49 + b, 11, 5.5, 'peau2', { trait: false }); // corps
    P.piece(); for (const [x, y] of [[18, 40], [33, 41], [22, 46], [30, 47]]) P.ligneFine(x - 1.5, y + b, x + 1.5, y + b + 0.6, 'peau2', 0); P.traitPiece();
    const hx = 26, hy = 31 + b;
    for (const c of [-1, 1]) P.poly([[hx + c * 4, hy - 5], [hx + c * 7.5, hy - 12], [hx + c * 6.8, hy - 4.5]], 'corne', { relief: true, niv: 2 });
    P.boule(hx, hy, 9.5, 7.8, 'peau', { plus: 0.1 }); // tête
    P.boule(hx, hy - 1.6, 4.4, 3.8, 'oeil', { niv: 0, trait: false }); P.boule(hx, hy - 1.6, 3.8, 3.2, 'iris', { niv: 2, trait: false }); // œil unique cerclé
    P.piece(); for (const r of [1.4, 2.6]) for (let t = 0; t < Math.PI * 2; t += 0.18) P.point(hx + Math.cos(t) * r, hy - 1.6 + Math.sin(t) * r * 0.85, 'anneau', 1); for (let k = 0; k < 6; k++) { const t = k * Math.PI / 3; P.point(hx + Math.cos(t) * 2, hy - 1.6 + Math.sin(t) * 1.7, 'oeil', 0); } P.point(hx, hy - 1.6, 'oeil', 0); P.point(hx - 1.6, hy - 2.8, 'blanc', 4); P.traitPiece();
    if (att) { P.boule(hx, hy + 5, 6, 3.4, 'gueule', { niv: 1 }); for (let x = -4.5; x <= 4.5; x += 1.5) { P.poly([[hx + x - 0.5, hy + 2.6], [hx + x, hy + 4.2], [hx + x + 0.5, hy + 2.6]], 'dent', { niv: 3, trait: false }); P.poly([[hx + x - 0.5, hy + 7.6], [hx + x, hy + 6], [hx + x + 0.5, hy + 7.6]], 'dent', { niv: 2, trait: false }); } P.boule(hx, hy + 5, 2.6, 1.6, 'energie', { niv: 3, trait: false }); bsLueur(P, hx, hy + 5, 4.2, '#a060f0', '#f4e8ff'); }
    else { P.ligneFine(hx - 6, hy + 4.6, hx + 6, hy + 4.6, 'gueule', 0); for (let x = -5; x <= 5; x += 2) P.poly([[hx + x - 0.5, hy + 4.6], [hx + x, hy + 6], [hx + x + 0.5, hy + 4.6]], 'dent', { niv: 3, trait: false }); }
  },
};

// BOS_020 Le Gardien du Sceau — esprit gardien flottant : grand masque cérémoniel blanc et or, coiffe haute, halo de
// talismans, longue robe sans jambes, mains jointes en signe ; à l'attaque, bras écartés, chaînes lancées.
BOSS_PEINTS.gardien = {
  pal: pb({ masque: '#f2ecdc', or: { c: '#e8c050', brille: true }, rouge: '#c8303a', robe: '#e8e2d4', robe2: '#c8bca8', manche: '#b8a8d0', talisman: '#f4ecd0', encre: '#a82a2a', chaine: { c: '#d8c070', brille: true }, lueur: '#fff0a0', peau: '#e8dccc' }),
  f(P, i, att) {
    const b = i ? -0.8 : 0; // flottement
    P.piece(); for (let t = 0; t < Math.PI * 2; t += 0.035) for (const r of [12.6, 13.1]) P.point(26 + Math.cos(t) * r, 24 + b + Math.sin(t) * r, 'or', r > 13 ? 1 : 3); P.traitPiece(); // halo derrière
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + 0.2, x = 26 + Math.cos(a) * 12.8, y = 24 + b + Math.sin(a) * 12.8; P.piece(); P.rect(x - 0.9, y - 1.2, 1.8, 3.2, 'talisman', 3); P.ligneFine(x, y - 0.6, x, y + 1.4, 'encre', 2); P.traitPiece(); } // talismans
    P.poly([[19, 32.5 + b], [33, 32.5 + b], [36.5, 42 + b], [35, 50 + b], [32, 48 + b], [30, 54 + b], [27, 50.5 + b], [25, 56 + b], [22.5, 50 + b], [20, 53 + b], [18, 47.5 + b], [15.5, 50 + b], [16, 42 + b]], 'robe', { cyl: true }); // robe aux pans flottants
    P.piece(); P.poly([[24.8, 33 + b], [27.2, 33 + b], [27, 50 + b], [25.4, 52 + b]], 'or', { niv: 2 }); P.ligneFine(20, 41 + b, 32, 41 + b, 'robe2', 1); P.ligneFine(18.5, 46 + b, 22, 49 + b, 'robe2', 1); P.ligneFine(33.5, 45 + b, 31, 48 + b, 'robe2', 1); P.traitPiece();
    const chaine = (x0, y0, x1, y1) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 1.2)); for (let k = 0; k <= n; k++) P.point(lerp(x0, x1, k / n), lerp(y0, y1, k / n) + (k % 2) * 0.5, 'chaine', k % 2 ? 2 : 4); };
    if (att) { for (const c of [-1, 1]) { P.membre(26 + c * 6, 34.5 + b, 26 + c * 12, 31 + b, 2.6, 'manche', { r1: 3.4 }); P.boule(26 + c * 14, 30.5 + b, 1.6, 1.6, 'peau'); chaine(26 + c * 15, 30.5 + b, 26 + c * 25, 22 + b); chaine(26 + c * 15, 31 + b, 26 + c * 24, 38 + b); } }
    else { for (const c of [-1, 1]) P.membre(26 + c * 6, 34.5 + b, 26 + c * 2, 40 + b, 2.6, 'manche', { r1: 3.6 }); P.boule(26, 40 + b, 2, 1.8, 'peau'); chaine(23, 42 + b, 21, 52 + b); chaine(29, 42 + b, 31, 52 + b); }
    const hx = 26, hy = 24 + b;
    P.poly([[hx - 4.5, hy - 4], [hx - 3, hy - 12], [hx, hy - 9.5], [hx + 3, hy - 12], [hx + 4.5, hy - 4]], 'or', { relief: true, niv: 2 }); // coiffe
    P.boule(hx, hy - 9.6, 1.3, 1.3, 'rouge', { niv: 3, trait: false });
    P.boule(hx, hy, 6, 6.6, 'or'); P.boule(hx, hy, 5.2, 5.9, 'masque', { plus: 0.25 }); // masque cerclé d'or
    for (const c of [-1, 1]) { P.poly([[hx + c * 1, hy - 0.4], [hx + c * 4, hy - 1.2], [hx + c * 3.6, hy + 0.4]], 'oeil', { niv: 0, trait: false }); P.point(hx + c * 2.8, hy - 0.5, 'lueur', 3); }
    P.piece(); for (const x of [-1.4, 0, 1.4]) P.ligneFine(hx + x, hy - 4.6, hx + x, hy - 2.4, 'rouge', 3); P.ligneFine(hx - 1.6, hy + 3.6, hx + 1.6, hy + 3.6, 'rouge', 2); P.traitPiece();
    if (att) bsEtincelles(P, [[hx - 2.8, hy - 0.8, 2], [hx + 2.6, hy - 0.8, 2]], '#fff8c0');
  },
};

// BOS_M02 Crapaud gardien — gros crapaud assis, verrues claires, yeux lourds aux pupilles horizontales, corde sacrée
// à papiers pliés autour du cou ; à l'attaque, gueule ouverte, langue dardée.
BOSS_PEINTS.crapaud = {
  pal: pb({ peau: '#7a8a3a', peau2: '#5a6a2a', ventre: '#e0d098', verrue: '#a8b860', iris: '#e8c040', corde: '#d8c080', papier: '#f4f0e6', gueule: '#a82a3a', langue: '#e05a6a' }),
  f(P, i, att) {
    const b = i * 0.4;
    for (const c of [-1, 1]) { P.boule(26 + c * 11.5, 51, 5, 3.6, 'peau'); P.boule(26 + c * 12.5, 54.2, 3.4, 1.4, 'peau2', { trait: false }); } // pattes arrière
    P.boule(26, 45 + b, 14, 10, 'peau'); P.boule(26, 49 + b, 9.5, 5.6, 'ventre', { trait: false });
    for (const [x, y, r] of [[16, 41, 1], [19, 46, 0.8], [34, 42, 1], [35.5, 47, 0.8], [21, 38.5, 0.7], [31, 38.5, 0.7]]) P.boule(x, y + b, r, r, 'verrue', { trait: false });
    for (const c of [-1, 1]) { P.membre(26 + c * 7.5, 48 + b, 26 + c * 8.5, 54, 2.2, 'peau'); P.boule(26 + c * 9, 54.6, 2.6, 1.2, 'peau2'); } // pattes avant
    for (const c of [-1, 1]) { P.boule(26 + c * 6, 36 + b - (att ? 1 : 0), 3.6, 3.4, 'peau'); P.boule(26 + c * 6, 36.2 + b - (att ? 1 : 0), 2.4, 2.2, 'iris', { niv: 3, trait: false }); P.rect(26 + c * 6 - 1.6, 36 + b - (att ? 1 : 0), 3.2, 0.6, 'oeil', 0); P.boule(26 + c * 6, 34.2 + b - (att ? 1 : 0), 3.4, 1.4, 'peau2', { trait: false }); } // yeux lourds
    if (att) { P.boule(26, 41 + b, 9, 2.8, 'gueule', { niv: 1 }); P.membre(26, 41.5 + b, 34, 44, 1.2, 'langue'); P.boule(35, 44.2, 1.6, 1.4, 'langue'); }
    else P.ligneFine(15.5, 40.5 + b, 36.5, 40.5 + b, 'peau2', 0);
    P.membre(14, 45 + b, 38, 45 + b, 0.9, 'corde'); P.piece(); for (let x = 14.5; x < 37.5; x += 1.2) P.ligneFine(x, 44.4 + b, x + 0.6, 45.6 + b, 'corde', 1); P.traitPiece(); // corde sacrée au cou
    for (const x of [19, 26, 33]) P.poly([[x - 0.8, 45.8 + b], [x + 0.8, 45.8 + b], [x + 0.2, 47.2 + b], [x + 0.9, 47.2 + b], [x - 0.2, 49 + b], [x - 0.9, 49 + b], [x - 0.2, 47.4 + b], [x - 0.9, 47.4 + b]], 'papier', { niv: 3 });
  },
};

// ═══ Nouveaux boss, étages 5 à 8 ═══
// BOS_029 Suigetsu — cheveux blanc-bleu, dents pointues, haut violet sans manches, gourdes d'eau à la ceinture,
// le grand couperet dans le dos ; à l'attaque, il fauche, son bras gonflé d'eau.
BOSS_PEINTS.suigetsu = {
  pal: pb({ peau: '#f2e0d4', cheveux: '#d8e6f2', iris: '#8a5ab0', tenue: '#7a4a9a', pantalon: '#5a5a6a', ceinture: '#3a3a46', gourde: { c: '#9ad0ec', brille: true }, sandale: '#3a3a46', lame: { c: '#c8d0dc', brille: true }, tsuka: '#3a2a2a', eau: { c: '#8ac8f0', brille: true } }),
  f(P, i, att) {
    const b = i * 0.5;
    const couperet = pts => { P.poly(pts, 'lame', { relief: true, niv: 2 }); P.ligneFine(pts[0][0], pts[0][1], pts[1][0], pts[1][1], 'lame', 4); };
    if (!att) { couperet([[27, 29 + b], [13.5, 50], [9.5, 47.5], [23, 26.5 + b]]); bsTrou(P, 12.4, 46.6, 1); P.membre(27.5, 27 + b, 30.5, 23.5 + b, 0.8, 'tsuka'); }
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.9 });
    shBras(P, 21, 34.5 + b, 18.5, 39.5 + b, 19, 43.5 + b, 'peau', 'peau', { r: 1.8 });
    P.tronc(32.5 + b, 46, 21, 31, 21.5, 30.5, 'tenue', { arrondi: 2.5 });
    P.rect(21.5, 43.5 + b * 0.5, 9, 1.6, 'ceinture', 2); for (const x of [22.5, 29.5]) P.boule(x, 46 + b * 0.5, 1.3, 1.7, 'gourde');
    const hx = 26, hy = 25.6 + b;
    P.boule(hx, hy - 0.5, 5, 4.7, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 1, 4.2, 4.2);
    P.poly([[hx - 5, hy - 1], [hx - 3.6, hy + 1.8], [hx - 2.4, hy - 0.6], [hx - 0.8, hy + 0.8], [hx + 0.6, hy - 1], [hx + 2.2, hy + 0.8], [hx + 3.6, hy - 0.8], [hx + 5, hy + 1.8], [hx + 5.1, hy - 3.2], [hx - 5.1, hy - 3.2]], 'cheveux', { niv: 3, trait: false });
    P.poly([[hx - 5.1, hy - 1], [hx - 3.8, hy - 1], [hx - 4, hy + 4.4], [hx - 5.5, hy + 3.4]], 'cheveux', { cyl: true });
    bsYeux(P, hx + 0.2, hy + 1.6, 'normal', { ecart: 2.1 }); bsBouche(P, hx + 0.5, hy + 3.8, 'crocs', 3);
    if (att) { shBras(P, 31, 34.5 + b, 34.5, 38, 36.5, 39, 'peau', 'eau', { r: 2.4, kav: 'eau', rm: 2.4 }); P.membre(36, 39, 39.5, 38.5, 0.8, 'tsuka'); couperet([[39.5, 35], [51, 31.5], [51.5, 40.5], [39.5, 41.5]]); bsTrou(P, 48.6, 36, 1);
      P.apres((g, E) => { g.globalAlpha = 0.5; g.fillStyle = '#c8ecff'; for (let k = 0; k < 4; k++) g.fillRect((15 + k * 6) * E, (30 - k) * E, 5 * E, 1); g.globalAlpha = 1; }); }
    else shBras(P, 31, 34.5 + b, 33.5, 39.5 + b, 33, 43.5 + b, 'peau', 'peau', { r: 1.8 });
  },
};

// BOS_030 Jūgo — forme 0 : grand gaillard paisible, cheveux orange hérissés, oiseau perché sur la main ;
// forme 1 : la marque grise couvre la moitié du corps, œil noir et or, bras droit changé en massue de chair.
BOSS_PEINTS.jugo = {
  formes: 2,
  pal: pb({ peau: '#ecc8a6', cheveux: '#ec8a2a', iris: '#d8a040', tenue: '#e6e0d0', tenue2: '#6a6a5a', pantalon: '#3a3a46', sandale: '#2e2e38', marque: '#4e4650', chair: '#8a7a80', oiseau: '#6a5a4a', bec: '#e8b040', noir: '#1a1418' }),
  f(P, i, att, forme) {
    const b = i * 0.5, rage = forme === 1;
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 2.3 }, 0.6);
    shBras(P, 19.5, 33 + b, 16, 39 + b, 16.5, 44.5 + b, 'tenue', rage ? 'marque' : 'peau', { r: 2.4, rm: 2.1 });
    P.tronc(31.5 + b, 46.5, 18.5, 33.5, 20.5, 31.5, 'tenue', { arrondi: 3 }); P.tronc(31 + b, 34.5 + b, 22, 30, 21.5, 30.5, 'tenue2'); // col montant
    if (rage) { P.piece(); P.poly([[18.5, 33 + b], [26, 33 + b], [25, 46], [20.5, 46]], 'marque', { cyl: true }); P.traitPiece(); }
    const hx = 26, hy = 24 + b;
    shPointes(P, hx, hy - 0.6, 5.2, 'cheveux', [[-100, 2.6, 3], [-70, 3.2, 3.2], [-40, 3.6, 3.2], [-10, 3.6, 3.2], [20, 3.6, 3.2], [50, 3.2, 3.2], [80, 2.8, 3], [110, 2.2, 2.8]]);
    P.boule(hx, hy - 0.6, 5.2, 4.8, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 1, 4.5, 4.4);
    if (rage) { P.piece(); P.poly([[hx - 4.6, hy - 1], [hx + 0.4, hy - 1.4], [hx + 0.8, hy + 5.4], [hx - 4, hy + 4]], 'marque', { niv: 2 }); P.traitPiece(); }
    P.poly([[hx - 4.8, hy - 1.2], [hx - 2.8, hy + 0.4], [hx - 1, hy - 1], [hx + 1, hy + 0.2], [hx + 2.8, hy - 1.2], [hx + 4.8, hy + 0.4], [hx + 5, hy - 3.2], [hx - 5, hy - 3.2]], 'cheveux', { niv: 3, trait: false });
    if (rage) { bsYeux(P, hx + 0.2, hy + 1.4, ['kkkk', 'kkik', '.kkk'], { ecart: 2.2, sourcil: 'colere' }); bsYeux(P, hx + 0.2, hy + 1.4, 'fente', { ecart: 2.2, seul: true }); bsBouche(P, hx + 0.6, hy + 4, 'dents', 3); }
    else { bsYeux(P, hx + 0.2, hy + 1.6, 'normal', { ecart: 2.2, sourcil: 'doux', ksourcil: 'cheveux' }); bsBouche(P, hx + 0.4, hy + 4, 'trait', 1.5); }
    if (rage) { // massue de chair hérissée
      const [ex, ey, mx, my] = att ? [36, 30, 38, 21] : [35, 39 + b, 37, 47 + b];
      P.membre(32.5, 33 + b, ex, ey, 2.6, 'chair'); P.membre(ex, ey, mx, my, 3.2, 'chair', { r1: 4.4 }); for (const k of [0.3, 0.6, 0.9]) { const x = lerp(ex, mx, k), y = lerp(ey, my, k); P.poly([[x + 2.6, y - 0.8], [x + 5.4, y - 1.6], [x + 3, y + 0.8]], 'marque', { niv: 2, trait: false }); }
      if (att) P.apres((g, E) => { g.globalAlpha = 0.45; g.strokeStyle = '#ffb090'; g.beginPath(); g.arc(30 * E, 34 * E, 13 * E, -2.2, -0.2); g.stroke(); g.globalAlpha = 1; });
    } else if (att) { shBras(P, 32.5, 33 + b, 36, 37.5, 38.5, 35, 'tenue', 'peau', { r: 2.4, rm: 2.1 }); P.apres((g, E) => { g.globalAlpha = 0.5; g.strokeStyle = '#f0e0c0'; for (const r of [4, 7]) { g.beginPath(); g.arc(40 * E, 35 * E, r * E, -1, 1); g.stroke(); } g.globalAlpha = 1; }); }
    else { shBras(P, 32.5, 33 + b, 35.5, 38.5 + b, 34, 42 + b, 'tenue', 'peau', { r: 2.4, rm: 2.1 }); P.boule(34.4, 39.6 + b, 1.6, 1.3, 'oiseau'); P.point(35.6, 39.4 + b, 'bec', 3); P.poly([[33, 39.5 + b], [31.5, 38 + b + (i ? 0.6 : 0)], [33.5, 40.4 + b]], 'oiseau', { niv: 1 }); }
  },
};

// BOS_031 Sakon et Ukon — cheveux gris lavande sur un œil, lèvres sombres, tenue du Son et corde violette.
// Forme 0 : la tête d'Ukon dépasse de l'épaule de Sakon ; forme 1 : Ukon seul (miroir) ; forme 2 : Sakon seul.
BOSS_PEINTS.sakon = {
  formes: 3,
  pal: pb({ peau: '#ecd8d0', cheveux: '#a8a8c4', levres: '#5a3a6a', tenue: '#d8ccb0', corde: '#7a3aa0', pantalon: '#3a3a44', sandale: '#2e2e38', iris: '#4a3a5a' }),
  f(P, i, att, forme) {
    const b = i * 0.5, s = forme === 1 ? -1 : 1; // Ukon a la mèche de l'autre côté
    const tete = (hx, hy, r, sens) => {
      P.boule(hx, hy - 0.4, 4.9 * r, 4.7 * r, 'cheveux');
      bsVisage(P, hx + 0.2 * sens, hy + 0.9 * r, 4.2 * r, 4.2 * r);
      P.poly([[hx - 4.9 * r, hy - 1.2], [hx + 4.9 * r, hy - 1.2], [hx + 4.9 * r, hy - 3.4 * r], [hx - 4.9 * r, hy - 3.4 * r]], 'cheveux', { niv: 3, trait: false });
      P.poly([[hx + sens * 0.2, hy - 1.4], [hx + sens * 4.9 * r, hy - 1.4], [hx + sens * 4.6 * r, hy + 4 * r], [hx + sens * 1.2, hy + 2.4 * r]], 'cheveux', { cyl: true }); // mèche sur un œil
      bsYeux(P, hx + 0.2 - sens * 2.2 * r, hy + 1.4 * r, 'fente', { ecart: 0, seul: true, sourcil: 'colere', ksourcil: 'cheveux' });
      P.ligneFine(hx - 1.2 * r, hy + 3.8 * r, hx + 1.4 * r, hy + 3.8 * r, 'levres', 1);
    };
    if (forme === 0) tete(20, 29 + b, 0.8, -1); // la tête d'Ukon, derrière l'épaule
    for (const c of [-1, 1]) P.boule(26 + c * 6.2, 43 + b * 0.5, 2.2, 1.6, 'corde');
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.8 });
    shBras(P, 21, 34.5 + b, 18.5, 39.5 + b, 19, 43.5 + b, 'tenue', 'peau', { r: 1.8 });
    P.tronc(32.5 + b, 46, 20.5, 31.5, 21.5, 30.5, 'tenue', { arrondi: 2.5 }); P.membre(20.5, 42.5 + b * 0.5, 31.5, 42.5 + b * 0.5, 1, 'corde');
    tete(26, 25.6 + b, 1, s);
    if (att) { shBras(P, 31, 34.5 + b, 35, 35, 39.5, 34.5, 'tenue', 'peau', { r: 1.8, rm: 2.1 }); P.apres((g, E) => { g.globalAlpha = 0.55; g.fillStyle = '#f0e0ff'; for (let k = 0; k < 3; k++) g.fillRect((42 + k * 2) * E, (32 + k * 2) * E, 3 * E, 1); g.globalAlpha = 1; }); }
    else shBras(P, 31, 34.5 + b, 33.5, 39.5 + b, 33, 43.5 + b, 'tenue', 'peau', { r: 1.8 });
  },
};

// BOS_033 Chimère des cuves (création originale) — amas de chair pâle à quatre pattes, yeux dépareillés, tubes arrachés
// encore plantés dans le dos, bave verte ; forme 1 : une pince lui pousse ; forme 2 : des tentacules jaillissent.
BOSS_PEINTS.chimere = {
  formes: 3, contours: 1,
  pal: pb({ chair: '#b0a0a8', chair2: '#8a7a84', ecaille: '#5a8a5a', pince: '#d0703a', tube: { c: '#8a929c', brille: true }, liquide: { c: '#8ae0a0', brille: true }, iris: '#e8d040', iris2: '#e04a4a', dent: '#efe6d0', gueule: '#5a1a2a', tentacule: '#9a6a8a' }),
  f(P, i, att, forme) {
    const b = i * 0.5;
    if (forme >= 2) for (let k = 0; k < 4; k++) { const a = -2.4 + k * 0.55, w = (i ? 0.25 : -0.25) * (k % 2 ? 1 : -1), x0 = 22 + k * 2, y0 = 35 + b; P.membre(x0, y0, x0 + Math.cos(a) * 8, y0 + Math.sin(a) * 8, 1.6, 'tentacule', { r1: 1.1 }); P.membre(x0 + Math.cos(a) * 8, y0 + Math.sin(a) * 8, x0 + Math.cos(a + w) * 14, y0 + Math.sin(a + w) * 13, 1.1, 'tentacule', { r1: 0.5 }); }
    P.membre(15, 46, 8, 42 + b, 2.2, 'ecaille', { r1: 0.8 }); // queue de serpent
    for (const [x, d] of [[18, 0], [23, 0.5], [30, 0.5], [35, 0]]) P.membre(x, 46, x + (x < 26 ? -1.5 : 1.5), 54.5 - (i && d ? 0.5 : 0), 2, 'chair2');
    P.boule(25, 41 + b, 12, 8.5, 'chair'); P.piece(); for (const [x, y] of [[19, 38], [25, 36], [30, 40], [22, 44]]) P.ligneFine(x - 1.5, y + b, x + 1.5, y + 1 + b, 'chair2', 0); P.traitPiece(); // corps
    for (const [x, l] of [[20, 7], [25.5, 9], [29, 6]]) { P.membre(x, 34 + b, x - 1.5, 34 - l + b, 0.7, 'tube'); P.point(x - 1.5, 34 - l + b, 'liquide', 3); } // tubes arrachés
    if (forme >= 1) { P.membre(32, 42 + b, 38, 46, 2, 'pince'); P.poly([[37, 44], [44, 40 - (att ? 3 : 0)], [43, 44.5], [39.5, 46]], 'pince', { relief: true, niv: 2 }); P.poly([[37.5, 47], [44, 48.5 + (att ? 2 : 0)], [40, 49.5]], 'pince', { relief: true, niv: 1 }); }
    const hx = 33, hy = 38 + b + (att ? -2 : 0);
    P.boule(hx, hy, 5.6, 4.8, 'chair');
    if (att) { P.boule(hx + 1.8, hy + 2.6, 3.8, 2.6, 'gueule', { niv: 1 }); for (let x = -2; x <= 3; x += 1.2) { P.point(hx + 1.8 + x, hy + 1, 'dent', 3); P.point(hx + 1.8 + x, hy + 4.2, 'dent', 2); } }
    else { P.ligneFine(hx - 1.5, hy + 2.6, hx + 5, hy + 2.2, 'gueule', 0); P.point(hx + 4, hy + 3, 'liquide', 3); P.point(hx + 4, hy + 3.6, 'liquide', 2); }
    P.boule(hx - 1, hy - 1.2, 1.9, 1.9, 'blanc', { trait: false }); P.boule(hx - 0.8, hy - 1.1, 1.1, 1.1, 'iris', { niv: 3, trait: false }); P.point(hx - 0.6, hy - 1, 'oeil', 0); // gros œil jaune
    P.boule(hx + 2.8, hy - 1.8, 1, 1, 'blanc', { trait: false }); P.point(hx + 2.9, hy - 1.8, 'iris2', 3); // petit œil rouge
    if (forme >= 2) { P.boule(hx + 1, hy - 3.6, 0.8, 0.8, 'blanc', { trait: false }); P.point(hx + 1, hy - 3.6, 'iris2', 3); }
  },
};

// BOS_034 Zetsu — deux grandes feuilles de dionée autour de la tête, visage mi-noir mi-blanc, yeux jaunes, manteau
// de l'organisation ; forme 1 : la moitié blanche seule ; forme 2 : la moitié noire seule.
BOSS_PEINTS.zetsu = {
  formes: 3,
  pal: pb({ blanc2: '#eeeee4', noir: '#2c2a32', feuille: '#4a7a34', feuille2: '#7ab04a', iris: '#e8d040', pantalon: '#2a2a36', sandale: '#2a2a36' }),
  f(P, i, att, forme) {
    const b = i * 0.5, o = att ? 1.6 : 0;
    const feuille = (c) => { const x = 26 + c * 3.5, pts = [[x, 33 + b], [x + c * (6.5 + o), 27 + b], [x + c * (6 + o), 19 + b - o], [x + c * 2, 15.5 + b - o * 0.6], [x - c * 0.5, 21 + b]]; P.poly(pts, 'feuille', { cyl: true }); P.piece(); P.ligneFine(x + c * 0.5, 31 + b, x + c * 3.5, 18 + b - o, 'feuille2', 3); for (let k = 0; k < 5; k++) { const t = 0.15 + k * 0.17; P.point(lerp(pts[1][0], pts[3][0], t) + c * 0.8, lerp(pts[1][1], pts[3][1], t), 'feuille2', 3); } P.traitPiece(); }; // feuille dentelée
    if (forme !== 2) feuille(1); if (forme !== 1) feuille(-1);
    bsJambes(P, i, { k: forme === 1 ? 'blanc2' : 'pantalon', kp: forme === 1 ? 'blanc2' : 'sandale', pied: forme === 1 ? 'nu' : undefined, r: 1.8 });
    if (forme === 1) { shBras(P, 21, 34.5 + b, 18.5, 39.5 + b, 19, 43.5 + b, 'blanc2', 'blanc2', { r: 1.6 }); P.tronc(33 + b, 46, 21, 31, 21.5, 30.5, 'blanc2', { arrondi: 2.5 }); }
    else { shBras(P, 21, 34 + b, 18.5, 39.5 + b, 18.5, 44 + b, 'cape', forme === 2 ? 'noir' : 'blanc2', { r: 2 }); bsManteauAka(P, b, { nuages: [[22, 42, 0.95], [30.5, 48, 0.85]] }); }
    const hx = 26, hy = 25.5 + b;
    if (forme === 0) { P.boule(hx, hy + 0.6, 4.4, 4.5, 'noir', { plus: 0.25 }); P.piece(); P.boule(hx + 2.1, hy + 0.6, 2.4, 4.5, 'blanc2', { plus: 0.25, trait: false }); P.rect(hx + 0.2, hy - 3.4, 2, 8, 'blanc2', 3); P.traitPiece(); } // visage mi-noir mi-blanc
    else bsVisage(P, hx + 0.2, hy + 0.6, 4.4, 4.5, forme === 1 ? 'blanc2' : 'noir');
    bsYeux(P, hx + 0.2, hy + 0.8, 'lueur', { ecart: 2.1 });
    bsBouche(P, hx + 0.4, hy + 3.6, att ? 'dents' : 'sourire', 2.5);
    if (forme !== 1) bsColAka(P, hx, 33.5 + b, 0, { h: 3 });
    if (att) { shBras(P, 31, 34.5 + b, 35, 34, 38, 31.5, forme === 1 ? 'blanc2' : 'cape', forme === 2 ? 'noir' : 'blanc2', { r: 1.9 }); for (const [x, y] of [[41, 29], [43.5, 32], [40.5, 33.5]]) P.boule(x, y, 0.9, 0.9, 'blanc2', { trait: false }); }
    else shBras(P, 31, 34.5 + b, 33.5, 39.5 + b, 33, 44 + b, forme === 1 ? 'blanc2' : 'cape', forme === 2 ? 'noir' : 'blanc2', { r: 1.9 });
  },
};

// BOS_032 Danzō — bandages sur l'œil droit et le front, cicatrice en croix au menton, haori sombre qui cache son bras
// droit, canne ; forme 1 (après l'Izanagi) : le bras se dévoile, constellé d'yeux rouges dont un s'est fermé.
BOSS_PEINTS.danzo = {
  formes: 2,
  pal: pb({ peau: '#e8d0b6', cheveux: '#3a3a40', bandes: '#ece6d6', haori: '#2e3a4a', dessous: '#dcd8ce', pantalon: '#2a2e38', sandale: '#2a2e38', canne: '#6a4a2a', cicatrice: '#a8706a', iris: '#2a2a2a', fer: { c: '#9aa2ae', brille: true }, rouge: '#d8202a' }),
  f(P, i, att, forme) {
    const b = i * 0.5, bras = forme === 1;
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 1.9 });
    P.membre(17, 38 + b, 15.5, 55, 0.7, 'canne'); P.boule(17, 37.5 + b, 1.2, 1, 'canne');
    shBras(P, 21, 34.5 + b, 19, 39 + b, 17.4, 38.6 + b, 'dessous', 'peau', { r: 1.8 });
    P.tronc(32.5 + b, 50, 20.5, 31.5, 19.5, 32.5, 'dessous', { arrondi: 2.5, degrade: 0.1 });
    if (!bras) P.poly([[25, 32.5 + b], [32, 32.5 + b], [34, 50], [24, 50]], 'haori', { cyl: true }); // le haori couvre le côté droit et le bras
    else P.poly([[26.5, 33 + b], [31, 34 + b], [33.5, 50], [25, 50]], 'haori', { cyl: true });
    P.piece(); P.ligneFine(23, 42, 31, 42, 'haori', 0); P.traitPiece();
    const hx = 26, hy = 25.4 + b;
    P.boule(hx, hy - 0.8, 4.8, 4.4, 'cheveux');
    bsVisage(P, hx + 0.2, hy + 1, 4.3, 4.3);
    P.poly([[hx - 4.6, hy - 2.4], [hx + 4.8, hy - 3.2], [hx + 4.8, hy - 1.4], [hx + 0.2, hy - 0.4], [hx - 0.4, hy + 3.6], [hx - 4.6, hy + 3]], 'bandes', { cyl: true }); // bandages : front et œil droit
    P.piece(); P.ligneFine(hx - 4.4, hy - 0.6, hx + 4.6, hy - 2.2, 'bandes', 1); P.ligneFine(hx - 4.4, hy + 1.6, hx - 0.6, hy + 1.2, 'bandes', 1); P.traitPiece();
    bsYeux(P, hx + 0.2, hy + 1.4, 'dur', { ecart: 2.1, seul: true, sourcil: 'colere' }); // seul l'œil gauche (à l'écran : celui de droite est bandé)
    P.ligneFine(hx - 0.4, hy + 4.4, hx + 1.4, hy + 5.4, 'cicatrice', 2); P.ligneFine(hx + 1.4, hy + 4.4, hx - 0.4, hy + 5.4, 'cicatrice', 2); bsBouche(P, hx + 0.4, hy + 3.8, 'trait', 1.5);
    if (bras) { // le bras droit dévoilé, constellé d'yeux, brassards de fer
      const [ex, ey, mx, my] = att ? [35, 31, 37, 25] : [33.5, 39.5 + b, 33, 44 + b];
      shBras(P, 31.5, 34 + b, ex, ey, mx, my, 'peau', 'peau', { r: 2 });
      for (const t of [0.2, 0.5, 0.8]) { P.point(lerp(31.5, ex, t) - 0.5, lerp(34 + b, ey, t), 'rouge', 3); P.point(lerp(ex, mx, t) + 0.5, lerp(ey, my, t), t === 0.5 ? 'oeil' : 'rouge', t === 0.5 ? 1 : 3); }
      P.rect(31, 33.5 + b, 2, 1, 'fer', 3);
      if (att) bsEtincelles(P, [[mx + 2, my - 3], [mx + 4, my - 1], [mx + 3, my + 2]], '#e8fff4');
    } else if (att) { P.membre(29, 37 + b, 37, 35, 1.7, 'haori'); P.boule(37.5, 34.8, 1.6, 1.6, 'peau'); P.apres((g, E) => { g.globalAlpha = 0.6; g.fillStyle = '#e8fff4'; for (let k = 0; k < 3; k++) g.fillRect((40 + k * 3) * E, (33 + k) * E, 4 * E, 1); g.globalAlpha = 1; }); }
  },
};

// BOS_035 Kinkaku et Ginkaku — deux colosses à longue crinière (or pour l'aîné, argent pour le cadet), petites
// cornes, robe sombre ; Kinkaku tient le grand éventail-feuille, Ginkaku la gourde rouge et la corde dorée.
BOSS_PEINTS.kinkaku = {
  formes: 2,
  pal: pb({ peau: '#c89068', cheveux: '#e8c050', cheveux2: '#dcdfe8', robe: '#34345a', robe2: '#4a2a3a', ceinture: '#c8a040', corne: '#ece4d4', eventail: '#d8a848', nervure: '#8a5a20', gourde: '#c83a2a', corde: '#e8c050', pantalon: '#2a2a3a', sandale: '#2a2a3a', iris: '#c8a030', lame: { c: '#c8d0dc', brille: true } }),
  f(P, i, att, forme) {
    const b = i * 0.5, gin = forme === 1, ch = gin ? 'cheveux2' : 'cheveux';
    P.poly([[19, 24 + b], [33, 24 + b], [35.5, 43 + b], [32, 41 + b], [29.5, 45 + b], [26, 42 + b], [22.5, 45 + b], [20, 41 + b], [16.5, 43 + b]], ch, { cyl: true }); // longue crinière
    if (!gin && !att) { P.membre(33, 44, 39, 22 + b, 0.8, 'nervure'); P.poly([[39, 22 + b], [44, 13 + b], [42, 6 + b], [37, 9 + b], [35.5, 16 + b]], 'eventail', { relief: true, niv: 2 }); P.ligneFine(39, 21 + b, 40.5, 9 + b, 'nervure', 1); }
    bsJambes(P, i, { k: 'pantalon', kp: 'sandale', r: 2.3 }, 0.6);
    shBras(P, 19.5, 33 + b, 16, 39 + b, 16.5, 44.5 + b, 'robe', 'peau', { r: 2.4, rm: 2.1 });
    P.tronc(31.5 + b, 48, 18.5, 33.5, 19.5, 32.5, gin ? 'robe2' : 'robe', { arrondi: 3, degrade: 0.15 });
    P.poly([[23.5, 31.5 + b], [28.5, 31.5 + b], [26, 38 + b]], 'peau', { cyl: true }); P.rect(19, 41.5 + b * 0.5, 14, 2, 'ceinture', 2);
    if (gin) { P.boule(31.5, 45.5 + b * 0.5, 2.2, 2.6, 'gourde'); P.boule(31.5, 42.4 + b * 0.5, 1.4, 1.2, 'gourde'); P.membre(18, 33 + b, 33, 44 + b, 0.7, 'corde'); P.membre(20.5, 44 + b, 22, 55, 0.7, 'lame'); }
    const hx = 26, hy = 24 + b;
    P.boule(hx, hy - 0.6, 5.4, 5, ch); shPointes(P, hx, hy - 0.6, 5.4, ch, [[-100, 3, 3.4], [-65, 3.6, 3.4], [-30, 3.4, 3.2], [5, 3.2, 3.2], [40, 3.4, 3.2], [75, 3.6, 3.4], [105, 3, 3.4]]);
    bsVisage(P, hx + 0.2, hy + 1.2, 4.5, 4.4);
    for (const c of [-1, 1]) P.poly([[hx + c * 1.6 - 0.7, hy - 2.4], [hx + c * 2.4, hy - 5.6], [hx + c * 1.6 + 0.7, hy - 2.4]], 'corne', { relief: true, niv: 2 });
    P.poly([[hx - 4.8, hy - 1.2], [hx - 3, hy + 0.4], [hx - 1, hy - 1.4], [hx + 1.4, hy - 1.4], [hx + 3.2, hy + 0.4], [hx + 5, hy - 1.2], [hx + 5.1, hy - 3], [hx - 5.1, hy - 3]], ch, { niv: 3, trait: false });
    bsYeux(P, hx + 0.2, hy + 1.6, 'dur', { ecart: 2.3, sourcil: 'colere', ksourcil: ch }); bsBouche(P, hx + 0.6, hy + 4.2, 'dents', 3);
    if (att && !gin) { // l'éventail-feuille balayé devant lui
      shBras(P, 32.5, 33 + b, 36.5, 35, 39, 33, 'robe', 'peau', { r: 2.4, rm: 2.1 }); P.membre(39, 33, 43, 31, 0.8, 'nervure');
      P.poly([[43, 31], [50, 24], [52, 30], [50.5, 37], [44.5, 35]], 'eventail', { relief: true, niv: 2 }); P.ligneFine(43.5, 31.5, 51, 30, 'nervure', 1);
      bsEtincelles(P, [[48, 22, 2], [51.5, 39, 2], [46, 40]], '#ffb040');
    } else if (att && gin) { // la gourde débouchée aspire
      shBras(P, 32.5, 33 + b, 36.5, 35, 38.5, 32.5, 'robe2', 'peau', { r: 2.4, rm: 2.1 }); P.boule(41, 31, 2.6, 3, 'gourde'); P.boule(41, 27.6, 1.5, 1.2, 'gourde');
      P.apres((g, E) => { g.globalAlpha = 0.55; g.strokeStyle = '#f8e8c0'; for (const r of [4, 7, 10]) { g.beginPath(); g.arc(41 * E, 26 * E, r * E, -2.6, -0.5); g.stroke(); } g.globalAlpha = 1; });
    } else shBras(P, 32.5, 33 + b, 35.5, 38.5 + b, 33.5, 43.5 + b, gin ? 'robe2' : 'robe', 'peau', { r: 2.4, rm: 2.1 });
  },
};
