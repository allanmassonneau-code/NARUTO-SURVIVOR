// ═══════════════════════════════════════════════════════════════════════════
// Recettes d'icônes, une par objet : l'image dit ce que fait l'objet.
// Grille 16×16 (centres de pixel en x + 0,5) ; voir 26_icones.js pour le peintre.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const R = (id, f) => { RECETTES_ICONES[id] = f; };
  const C = PAL;
  // petits motifs partagés
  const trainee = (P, pts, c = '#cfe8ff') => { for (const [x, y] of pts) P.px(x, y, c, true); };
  const etincelle = (P, x, y, c = C.orC) => { P.px(x, y, c, true); P.px(x - 1, y, c, true); P.px(x + 1, y, c, true); P.px(x, y - 1, c, true); P.px(x, y + 1, c, true); };
  const tete = (P, x, y, o = {}) => { // tête de ninja de face (12 × 12), x, y : coin haut gauche
    const h = o.cheveux || '#3a3448', s = o.peau || C.peau;
    P.motif(['...h.hh.h...', '..hhhhhhhh..', '.hhhhhhhhhh.', 'hhhhhhhhhhhh', 'hbbpppppbbbh', 'hbbpppppbbbh', 'hhssssssssh.', '.ssessssess.', '.ssssssssss.', '..sssmmsss..', '...ssssss...', '....ssss....'],
      { h, b: o.bandeau || '#2a4a8a', p: o.plaque || C.acier, s, e: C.noir, m: nuancer(s, 0.7) }, x, y, true, !!o.miroir);
  };
  const miniTete = (P, x, y, o = {}) => P.motif(['..hhhh..', '.hhhhhh.', 'hhhhhhhh', 'hbbppbbh', 'hssssssh', '.sesses.', '.ssssss.', '..ssss..'], { h: o.cheveux || '#3a3448', b: o.bandeau || '#2a4a8a', p: o.plaque || C.acier, s: o.peau || C.peau, e: C.noir }, x, y, false);
  const fumee = (P, cx, cy, c = '#d8d4e0') => { P.disque(cx - 2.5, cy + 0.5, 2.2, c); P.disque(cx + 2.4, cy + 0.6, 2.3, c); P.disque(cx, cy - 1, 2.6, c); P.disque(cx, cy + 1.6, 2.2, c); };

  // ── Projectiles ──
  R('PSV_001', P => P.orbe(8, 8, 6.6, { bras: 3, rot: 20 })); // sphère qui comprime
  R('PSV_002', P => { // l'encre se dédouble
    P.goutte(8, 4.6, 2.2, '#2c2c5a'); P.ligne(7, 7, 5, 9, '#2c2c5a'); P.ligne(9, 7, 11, 9, '#2c2c5a');
    P.goutte(4.5, 12, 2.8, '#2c2c5a'); P.goutte(11.5, 12, 2.8, '#2c2c5a');
  });
  R('PSV_003', P => { P.kunai(8, 14, -128, { k: 0.82 }); P.kunai(8, 14, -52, { k: 0.82 }); P.kunai(8, 14, -90, { k: 0.86 }); }); // trois en éventail
  R('PSV_004', P => { // quatre senbon jaillissent du parchemin
    P.rouleau(2, 11, 12, 3);
    for (const x of [3, 6, 9, 12]) P.senbon(x + 1, 1 + (x % 2), x, 9);
  });
  R('PSV_005', P => { // kunai marqué : tir guidé
    for (const [x, y] of [[2, 6], [3, 4], [5, 3], [7, 3]]) P.px(x, y, '#a0c8ff', true);
    P.kunai(3, 13, -45, { marque: C.encre }); P.badge('cible', C.rouge);
  });
  R('PSV_006', P => { P.insecte(8, 9, { c: '#4a5a2a', reflet: '#9ab060' }); trainee(P, [[1, 14], [2, 13], [3, 12]], '#8aa060'); P.badge('cible', C.rouge); });
  R('PSV_007', P => { // fil de chakra qui ricoche
    P.rect(13, 0, 3, 16, '#7a7488'); P.rect(0, 13, 13, 3, '#7a7488');
    P.trait(1, 3, 12, 7, 1.2, C.cyan); P.trait(12, 7, 5, 12, 1.2, C.cyan); P.trait(5, 12, 1, 9, 1.2, C.cyan);
    P.shuriken(2.5, 3.5, 2.6, { rot: 10 });
  });
  R('PSV_008', P => { // l'aiguille traverse la cible
    P.disque(8, 8, 4.6, '#c8484a'); P.disque(6.8, 6.8, 1.4, '#f08080', true);
    P.ligne(1, 14, 14, 1, C.acierC, true); P.px(14, 1, C.blanc, true); P.px(1, 14, C.acierF, true); P.px(0, 15, C.acierF, true);
  });
  R('PSV_009', P => { // parchemin fantôme au-dessus d'un rocher
    P.rocher(8, 13, 3.2, { fissure: false });
    P.forme((x, y) => x > 2 && x < 14 && y > 2 && y < 9 + Math.sin(x * 1.6) * 1.2, '#c8c0f0'); P.rect(2, 2, 2, 6, '#8a80c0'); P.rect(12, 2, 2, 6, '#8a80c0');
    P.px(6, 5, C.encre, true); P.px(9, 5, C.encre, true);
  });
  R('PSV_010', P => { // grains en orbite
    P.anneau(8, 8, 6.6, 0.9, '#c8a46a', true); P.disque(8, 8, 1.8, C.sableF);
    for (const a of [-60, 60, 180]) P.disque(8 + Math.cos(a * DEG) * 6, 8 + Math.sin(a * DEG) * 6, 2.1, C.sable);
  });
  R('PSV_011', P => { // tir ondulant
    P.forme((x, y) => x >= 1 && x <= 12.5 && Math.abs(y - 8 - Math.sin((x - 1) * 0.62) * 3.2) < 1.3, C.bleu);
    P.goutte(13.4, 8.6, 2.2, C.bleuC, { reflet: false });
  });
  R('PSV_012', P => { P.poing(8, 8, { c: C.peau }); P.badge('haut', C.orC); P.rect(2, 13, 4, 2, '#c8484a'); }); // tirs énormes
  R('PSV_013', P => P.fuma(8, 8, 7.6, { rot: 15 }));
  R('PSV_014', P => { // canon de chakra rougeoyant
    P.trait(3, 12, 15, 0, 5.4, C.rouge); P.trait(3, 12, 15, 0, 3.2, C.orange); P.trait(3, 12, 15, 0, 1.2, C.orC, true);
    P.disque(4, 12, 3.6, C.rougeF); P.disque(4, 12, 2.2, C.orange);
  });
  R('PSV_015', P => { // trait instantané
    P.trait(1, 10, 13, 5, 1.2, C.cyan); P.trait(1, 10, 13, 5, 0.6, C.blanc, true);
    P.etoile(12.5, 5.5, 3.6, 1.2, 4, 0, '#c8f8ff'); P.px(2, 10, C.blanc, true);
  });
  R('PSV_016', P => { // souffle continu
    P.forme((x, y) => x > 2 && Math.abs(y - 8) < 1 + (x - 2) * 0.55, '#bff0e0');
    for (const dy of [-2, 0, 2]) P.ligne(4, 8 + dy * 0.5, 14, 8 + dy * 1.9, '#7ad0b0', true);
    P.disque(2.5, 8, 2.6, '#7ad0b0');
  });
  R('PSV_017', P => { // grand couperet : trou rond, encoche au dos
    const t = [3.5, 12.5, -45];
    P.forme((u, v) => u >= -0.6 && u <= 3.8 && Math.abs(v + 0.6) <= 0.95, C.noir, false, t);
    P.forme((u, v) => u >= 3.4 && u <= 15.6 && v >= -3.8 && v <= 1.5 && Math.hypot(u - 12.8, v + 1.4) > 1.3 && Math.hypot(u - 7.6, v + 4) > 1.7, C.acier, false, t);
    P.forme((u, v) => u >= 3.8 && u <= 15.2 && v > 0.6 && v <= 1.5, C.acierC, true, t);
  });
  R('PSV_018', P => P.sabre(2.5, 13.5, -45, { long: 14, largeur: 1.5, tsuba: '#3a3448', lame: C.acierC, garde: 2 })); // tantō
  R('PSV_019', P => { // bombe d'argile en araignée, mèche allumée
    for (const s of [-1, 1]) for (const k of [0, 1, 2]) P.ligne(8 + s * 2, 9 + k, 8 + s * 6, 7 + k * 3, C.argile);
    P.ellipse(8, 9.5, 3.4, 3, C.argile); P.disque(8, 6, 2, C.argile); P.px(7, 6, C.noir, true); P.px(9, 6, C.noir, true);
    etincelle(P, 12, 2); P.ligne(9, 4, 11, 3, C.boisF);
  });
  R('PSV_020', P => { // météorite et sa traîne
    P.trait(15, 0, 7, 8, 5, C.orange); P.trait(15, 0, 7, 8, 2.6, C.or); P.rocher(5.5, 10.5, 4.6, { c: '#6a5a5a' });
  });
  R('PSV_021', P => { // sphère unique guidée par la visée
    for (const [x, y] of [[13, 2], [14, 4], [14, 6], [13, 8]]) P.px(x, y, '#c0a0ff', true);
    P.disque(8, 10, 4.6, '#3a2a5a'); P.disque(7, 9, 2.6, C.violet); P.px(6, 8, C.violetC, true); P.badge('cible', C.violetC);
  });
  R('PSV_022', P => { // rotation céleste : dôme qui tourne
    P.disque(8, 8, 7.2, '#bfe0ff'); P.disque(8, 8, 5.4, '#e6f4ff', true);
    for (let i = 0; i < 4; i++) P.arc(8, 8, 6.2 - i * 1.2, i * 90, i * 90 + 150, 1, '#6aa8e8', true);
    P.disque(8, 8, 1.6, C.blanc, true);
  });
  R('PSV_023', P => { // clone qui copie : deux têtes, deux tirs
    tete(P, 4, 3, { peau: '#e0d4ea', cheveux: '#8a80a0', bandeau: '#7a80a8', plaque: '#c8c8d8' }); tete(P, 0, 4);
    P.kunai(9, 15, -20, { k: 0.48 }); P.kunai(12, 15, -20, { k: 0.48, lame: '#c8c0d8' });
  });
  R('PSV_024', P => { // arsenal : trois armes en salve depuis le rouleau
    P.rect(1, 2, 4, 12, C.papier); P.rect(0, 1, 6, 2, C.rouge); P.rect(0, 13, 6, 2, C.rouge); P.px(2, 6, C.encre, true); P.px(2, 9, C.encre, true);
    for (const y of [3.5, 8, 12.5]) P.kunai(6, y, 0, { k: 0.6 });
  });
  R('PSV_025', P => { P.oeil(8, 8, 7.2, 4.2, { couleur: '#3a7a5a' }); P.badge('retour', C.cyanC || '#a0f0ff'); }); // œil arrière
  R('PSV_026', P => { // croix de sceaux : quatre directions
    P.sceau(8, 8, 4.4, { c: C.rouge });
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) P.poly([[8 + dx * 7.6, 8 + dy * 7.6], [8 + dx * 5 - dy * 2.2, 8 + dy * 5 + dx * 2.2], [8 + dx * 5 + dy * 2.2, 8 + dy * 5 - dx * 2.2]], C.acier);
  });
  R('PSV_027', P => { // étiquette posée en mine
    P.ellipse(8, 11.5, 7.2, 3.4, '#5a4a4a'); P.ellipse(8, 11.5, 5.6, 2.2, '#7a6a5a', true);
    P.etiquette(5, 6, 6, 7); etincelle(P, 12, 3, C.orC); P.ligne(10, 5, 11, 4, C.boisF);
  });

  // ── Natures et éléments ──
  R('PSV_028', P => { // la foudre saute sur deux ennemis
    P.disque(3, 13, 2.4, '#c8484a'); P.disque(13, 13, 2.4, '#c8484a');
    P.ligne(6, 8, 4, 10, C.bleuC, true); P.ligne(4, 10, 3, 11, C.bleuC, true); P.ligne(10, 8, 12, 10, C.bleuC, true); P.ligne(12, 10, 13, 11, C.bleuC, true);
    P.eclair([[6, 0], [11, 0], [9, 3.4], [12, 3.4], [7, 10], [7.8, 5.4], [5, 5.4]], '#bfe8ff', { coeur: [[7.4, 1], [9.4, 1], [8, 4.4], [7, 4.6]] });
  });
  R('PSV_029', P => { // poing de terre qui frappe le sol : onde de choc
    P.rect(0, 14, 16, 2, '#6a4a2a'); P.arc(8, 15, 7.4, 190, 350, 1, '#e0c090', true); P.arc(8, 15, 5.2, 200, 340, 1, '#e0c090', true);
    P.poing(8, 6, { c: '#a0805a' }); P.px(1, 12, '#c8a070', true); P.px(14, 11, '#c8a070', true);
  });
  R('PSV_030', P => { // shuriken qui éclate en quatre
    P.shuriken(8, 8, 5.6, { rot: 0 });
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) P.poly([[8 + dx * 8, 8 + dy * 8], [8 + dx * 5.2, 8 + dy * 6.6], [8 + dx * 6.6, 8 + dy * 5.2]], C.acierC);
  });
  R('PSV_031', P => { // kunai qui accélère dans le vent
    for (const [x, y, l] of [[0, 9, 4], [1, 12, 3], [0, 6, 2]]) P.rect(x, y, l, 1, '#9ae0c0', true);
    P.kunai(4.5, 11.5, -35, { k: 0.85 }); P.badge('droite', '#9ae0c0');
  });
  R('PSV_032', P => { // poids de plomb
    P.anneau(8, 3.6, 2.4, 1.2, C.fer); P.poly([[4.4, 6], [11.6, 6], [14, 14], [2, 14]], '#5a5a66'); P.rect(5, 9, 6, 1, '#7a7a88', true);
  });
  R('PSV_033', P => { // senbon au centre de la cible
    P.disque(9, 9, 6, C.rouge); P.disque(9, 9, 4.2, C.blanc, true); P.disque(9, 9, 2.4, C.rouge, true);
    P.ligne(1, 1, 8, 8, C.acierC, true); P.px(0, 0, C.acierF, true);
  });
  R('PSV_034', P => { P.kunai(5.5, 10.5, -45, { k: 0.9, lame: '#8a96a8' }); P.trait(5, 11, 3, 14, 1, C.boisF); P.disque(2.5, 14, 2, '#4a4a56'); }); // lesté
  R('PSV_035', P => { P.sandale(10, 8, { c: '#a06a3a' }); for (const [x, y, l] of [[0, 4, 4], [1, 8, 3], [0, 12, 4]]) P.rect(x, y, l, 1, '#c0d8f0', true); }); // sandales de course
  R('PSV_036', P => { P.disque(8, 8, 5.4, '#a87a4a'); P.disque(6.6, 6.6, 1.6, '#d8b080', true); P.rect(6, 7, 4, 2, C.rougeF, true); P.badge('haut', C.vertC); }); // pilule du soldat
  R('PSV_037', P => { // lunettes de visée
    P.rect(0, 7, 16, 2, '#e07a2a'); P.disque(4.5, 8, 3.6, C.noir); P.disque(11.5, 8, 3.6, C.noir); P.disque(4.5, 8, 2.6, '#5a8ad8', true); P.disque(11.5, 8, 2.6, '#5a8ad8', true);
    for (const x of [4, 11]) { P.rect(x, 6, 1, 4, '#d8ecff', true); P.rect(x - 2, 8, 5, 1, '#d8ecff', true); P.px(x, 8, C.rouge, true); }
  });
  R('PSV_038', P => P.bandeau(6, { tissu: '#2a4a9a' })); // bandeau
  R('PSV_039', P => P.masque(8, 8, { marques: C.rouge, oreilles: true })); // masque de l'ANBU
  R('PSV_040', P => { P.poing(8, 7, { c: C.peau, manche: C.rouge }); P.rect(2, 4, 12, 1, C.blanc, true); P.rect(2, 8, 11, 1, C.blanc, true); }); // gants bandés
  R('PSV_041', P => { // fleur de lotus : cadence
    P.ellipse(8, 14, 7, 1.8, C.vert);
    for (const [x, y] of [[1, 10], [15, 10], [3, 5], [13, 5], [8, 1]]) P.feuille(8, 13, x, y, { c: '#f4a0c8', large: 2.4, nervure: '#ffd8ea' });
    P.disque(8, 11, 1.6, C.or); P.badge('haut', C.vertC);
  });
  R('PSV_042', P => { // tirs plus gros
    P.disque(8, 8, 5.2, '#e8e0ff'); P.disque(6.8, 6.8, 1.8, C.blanc, true);
    for (const [x, y, dx, dy] of [[1, 1, 1, 1], [14, 1, -1, 1], [1, 14, 1, -1], [14, 14, -1, -1]]) { P.px(x, y, C.or); P.px(x + dx, y, C.or); P.px(x, y + dy, C.or); }
  });
  R('PSV_043', P => { P.disque(9, 9, 5.6, C.orange); P.disque(8, 8, 3.6, C.or); P.disque(7, 7, 1.6, C.orC); P.trait(1, 2, 4, 5, 2, C.rouge); P.trait(3, 1, 5, 4, 1.4, C.orange); }); // boule de feu
  R('PSV_044', P => { P.ellipse(8, 13, 7, 2.2, '#4a7ac8'); P.ellipse(8, 13, 4.6, 1.2, '#8ac0ff', true); P.goutte(8, 7, 3.6, C.bleu); }); // eau qui ralentit
  R('PSV_045', P => { P.eclair([[9, 0], [14, 0], [10, 6], [13, 6], [5, 16], [7.4, 8.4], [4, 8.4]], C.or, { coeur: [[10, 1], [12, 1], [8.6, 7.4], [6.6, 8]] }); P.px(2, 4, C.orC, true); P.px(14, 11, C.orC, true); }); // courant foudroyant
  R('PSV_046', P => { // lame de vent en croissant
    P.forme((x, y) => { const d = Math.hypot(x - 4, y - 8), d2 = Math.hypot(x - 2, y - 8); return d < 9.4 && d2 > 8.6 && x > 4; }, '#9ae8c8');
    for (const y of [5, 8, 11]) P.rect(1, y, 3, 1, '#d0fff0', true);
  });
  R('PSV_047', P => { P.rocher(7, 8, 6.4, { c: '#8a7a6a' }); P.rect(4, 6, 1, 3, '#5a4a3a', true); P.rect(7, 5, 1, 3, '#5a4a3a', true); P.rect(10, 6, 1, 3, '#5a4a3a', true); P.badge('droite', C.orC); }); // poing de pierre, recul
  R('PSV_048', P => { // queue de scorpion qui goutte
    const seg = [[3, 14.5, 2], [3.4, 11.4, 1.9], [4.4, 8.4, 1.8], [6.4, 5.8, 1.7], [9.2, 4.4, 1.6], [12, 4.8, 1.5]];
    for (const [x, y, r] of seg) P.disque(x, y, r, '#b8702a');
    P.poly([[12.6, 5.4], [15.6, 7.6], [12.8, 9.8]], '#4a2a2a'); P.goutte(13.4, 13.4, 1.7, '#9a4ad0', { reflet: false });
  });
  R('PSV_049', P => { P.oeil(8, 8, 7.2, 4.4, { couleur: '#c060c0' }); P.arc(8, 8, 2.6, 0, 300, 1, '#5a1a6a', true); P.px(8, 8, '#5a1a6a', true); P.px(2, 2, C.roseC, true); P.px(13, 3, C.roseC, true); }); // genjutsu
  R('PSV_050', P => { // flocon de glace
    for (let i = 0; i < 3; i++) { const a = i * 60 * DEG; P.trait(8 - Math.cos(a) * 7, 8 - Math.sin(a) * 7, 8 + Math.cos(a) * 7, 8 + Math.sin(a) * 7, 1.6, '#9ae0ff'); }
    for (let i = 0; i < 6; i++) { const a = i * 60 * DEG, x = 8 + Math.cos(a) * 4.6, y = 8 + Math.sin(a) * 4.6; P.disque(x, y, 1.2, C.glace); }
    P.disque(8, 8, 1.6, C.blanc);
  });
  R('PSV_051', P => { // ombre qui lie
    P.ellipse(5, 13.5, 5, 2, '#2a2234'); P.trait(5, 13, 9, 8, 1.4, '#2a2234'); P.trait(9, 8, 12, 4, 1.4, '#2a2234');
    for (const [x, y] of [[11, 2], [13, 2], [14, 4], [10, 3]]) P.trait(12, 4, x, y, 1, '#3a3048');
  });
  R('PSV_052', P => { // bête d'encre qui charme
    P.ellipse(7, 10, 5, 3.4, '#22223a'); P.disque(11.5, 6.6, 2.8, '#22223a'); P.poly([[10.5, 4.4], [11, 1.6], [12.4, 4]], '#22223a'); P.poly([[12.6, 4.6], [14.6, 2.4], [14, 5.4]], '#22223a');
    P.trait(2, 10, 0, 6, 1.2, '#22223a'); P.px(12, 6, C.blanc, true); P.badge('coeur', C.rose);
  });
  R('PSV_053', P => P.flamme(8, 15, 15, { couleurs: ['#1a1024', '#3a2050', '#6a3a8a', null], largeur: 6.4 })); // flammes noires
  R('PSV_054', P => { P.disque(8, 8, 7, '#e8dcd0'); P.anneau(8, 8, 6.4, 1.3, C.sang, true); P.poly([[3.4, 5.4], [12.6, 5.4], [8, 13.4]], C.sang, true); P.poly([[5.4, 6.6], [10.6, 6.6], [8, 11]], '#e8dcd0', true); }); // marque de Jashin
  R('PSV_055', P => { // une queue de chakra du renard
    const cl = t => [4 + Math.sin(t * Math.PI * 0.85) * 7, 15 - 13.5 * t];
    P.forme((x, y) => { for (let k = 0; k <= 40; k++) { const t = k / 40, [cx, cy] = cl(t), w = 1 + 3.2 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.7); if ((x - cx) ** 2 + (y - cy) ** 2 < w * w) return true; } return false; }, '#e8601a');
    P.forme((x, y) => { for (let k = 30; k <= 40; k++) { const t = k / 40, [cx, cy] = cl(t), w = 1 + 3 * Math.sin(Math.PI * t); if ((x - cx) ** 2 + (y - cy) ** 2 < w * w * 0.8) return true; } return false; }, '#ffb070', true);
    P.anneau(13, 12, 1.8, 0.9, '#ff9a5a', true); P.anneau(2.5, 4, 1.4, 0.9, '#ff9a5a', true);
  });
  R('PSV_056', P => { // bulle rouge qui libère huit tirs
    for (let i = 0; i < 8; i++) { const a = i * 45 * DEG; P.disque(8 + Math.cos(a) * 6.6, 8 + Math.sin(a) * 6.6, 1.2, '#ff7a6a'); }
    P.disque(8, 8, 4.6, '#c8283a'); P.disque(7, 7, 2.4, '#ff6a5a', true); P.px(6, 6, '#ffd0c8', true);
  });
  R('PSV_057', P => { P.crapaud(7, 9, { c: '#6a7a3a', ventre: '#c8c890' }); P.goutte(13.5, 13.5, 1.8, '#d8a020'); P.flamme(13.5, 9, 4, { couleurs: [C.rouge, C.orange, C.or] }); }); // crapaud d'huile
  R('PSV_058', P => { // armure de foudre
    P.disque(8, 5, 2.6, '#3a3a5a'); P.poly([[4, 8], [12, 8], [11, 15], [5, 15]], '#3a3a5a');
    for (const [x0, y0, x1, y1] of [[1, 3, 3, 7], [3, 7, 1, 10], [15, 4, 13, 8], [13, 8, 15, 11], [6, 0, 8, 2], [8, 2, 10, 0]]) P.ligne(x0, y0, x1, y1, '#a8e0ff', true);
    P.px(7, 5, C.cyan, true); P.px(9, 5, C.cyan, true);
  });
  R('PSV_059', P => { // racines du bois
    P.rect(0, 14, 16, 2, '#5a4030');
    P.trait(8, 15, 8, 6, 2.4, C.bois); P.trait(8, 10, 3, 4, 1.8, C.bois); P.trait(8, 9, 13, 3, 1.8, C.bois); P.trait(3, 4, 1, 1, 1.2, C.bois); P.trait(13, 3, 15, 1, 1.2, C.bois);
    P.feuille(8, 6, 10, 1, { large: 1.6 }); P.feuille(3, 4, 5, 1, { large: 1.2 });
  });
  R('PSV_060', P => { P.poly([[2, 14], [11, 3], [15, 0], [13, 5], [4, 15]], C.os); P.disque(3, 13.5, 2.4, C.os); P.px(12, 4, '#fffaf0', true); }); // os perçant
  // ── Familiers ──
  const limace = (P, cx, cy, c = '#d8e8ff', r = '#6a8ad8') => { // limace de profil, tête à droite
    P.ellipse(cx - 1, cy + 2, 6, 2.6, c); P.disque(cx + 3.6, cy, 2.5, c);
    P.ligne(cx + 2.6, cy - 2, cx + 1.6, cy - 5, c); P.ligne(cx + 4.6, cy - 2, cx + 5.6, cy - 5, c); P.px(cx + 1.6, cy - 5, C.noir, true); P.px(cx + 5.6, cy - 5, C.noir, true);
    P.rect(Math.round(cx - 5), Math.round(cy + 1), 7, 1, r, true);
  };
  const corbeau = (P, cx, cy, o = {}) => { // corbeau de profil, tourné à droite
    const c = o.c || '#2a2836';
    P.ellipse(cx, cy + 1, 4.6, 3.2, c); P.disque(cx + 4, cy - 2, 2.4, c); P.poly([[cx + 5.6, cy - 2.6], [cx + 8.4, cy - 1.6], [cx + 5.6, cy - 0.8]], '#8a8a96');
    P.poly([[cx - 4, cy], [cx - 8, cy - 1], [cx - 7.2, cy + 2.6]], c); P.poly([[cx - 2, cy - 1], [cx + 2, cy - 1], [cx - 1, cy - 6]], nuancer(c, 1.3));
    P.px(cx + 4.4, cy - 2.6, o.oeil || C.rouge, true); P.ligne(cx - 1, cy + 4, cx - 1, cy + 6, '#8a8a96'); P.ligne(cx + 1, cy + 4, cx + 1, cy + 6, '#8a8a96');
  };
  R('PSV_061', P => { fumee(P, 8, 11); fumee(P, 3, 6, '#c8c4d4'); tete(P, 4, 2); }); // clone de l'ombre
  R('PSV_062', P => { P.crapaud(7, 10, { c: '#f08a3a', ventre: '#fbe0b0' }); P.rect(3, 11, 8, 2, '#3a6ab0', true); P.anneau(13, 4, 2.4, 1, '#a0e8ff', true); P.px(12, 3, C.blanc, true); }); // Gamakichi et sa bulle
  R('PSV_063', P => { limace(P, 7, 9); P.coeur(5, 6, 2.6, C.rouge); }); // Katsuyu apporte un cœur
  R('PSV_064', P => { // serpent qui sort de la manche
    P.poly([[0, 9], [6, 9], [7, 16], [0, 16]], '#5a4a7a'); P.rect(0, 9, 7, 2, '#8a7aaa');
    P.serpent([[4, 10], [6, 6], [9, 5], [11, 7], [13, 4]], { c: '#7a5aa8', ep: 2.4, oeil: C.or });
  });
  R('PSV_065', P => { // grain de sable qui arrête un tir
    P.disque(7, 9, 5, C.sable); for (const [x, y] of [[5, 7], [8, 11], [9, 7], [5, 11]]) P.px(x, y, C.sableF, true); P.disque(6, 7.4, 1.4, '#f0d8a0', true);
    P.disque(14, 3, 1.6, C.rouge); P.ligne(10, 6, 12, 4, '#ff9a8a', true); P.px(15, 6, C.rouge, true); P.px(12, 1, C.rouge, true);
  });
  R('PSV_066', P => { // trois kunai qui tournent
    P.arc(8, 8, 7, 200, 330, 1, '#a0c8ff', true);
    for (const a of [-90, 30, 150]) { const x = 8 + Math.cos(a * DEG) * 4.4, y = 8 + Math.sin(a * DEG) * 4.4; P.kunai(x - Math.cos((a + 90) * DEG) * 4, y - Math.sin((a + 90) * DEG) * 4, a + 90, { k: 0.5 }); }
  });
  R('PSV_067', P => { corbeau(P, 7, 9); P.px(1, 2, C.rouge, true); P.px(3, 1, C.rouge, true); }); // corbeau aux yeux rouges
  R('PSV_068', P => { P.chien(8, 9, { c: '#c8a070', museau: '#7a5a3a', oreilles: '#7a5a3a' }); P.rect(4, 4, 8, 2, '#2a4a8a', true); P.rect(6, 4, 4, 2, C.acier, true); }); // Pakkun, bandeau au front
  R('PSV_069', P => { P.chien(9.5, 8, { c: '#f2eee6', museau: '#fffaf2', oreilles: '#d8ccc0' }); for (const y of [6, 9, 12]) P.rect(0, y, 3, 1, '#c0d8f0', true); }); // petit chien qui fonce
  R('PSV_070', P => { P.piece(8, 9.5, 3.8); for (const [x, y] of [[2, 3], [7, 2], [13, 4], [2, 12], [14, 12]]) { P.ellipse(x + 0.5, y + 0.5, 1.4, 1, '#3a4a2a'); P.px(x, y - 1, '#9ab0d0', true); } }); // essaim qui ramasse les pièces
  R('PSV_071', P => { P.oiseau(8, 7); etincelle(P, 13, 13, C.or); P.px(12, 12, C.orange, true); P.px(14, 14, C.orange, true); }); // oiseau d'argile qui plonge
  R('PSV_072', P => { P.marionnette(8, 8, { c: '#6a5a4a', yeux: 3, oeil: '#e8d040', capuche: '#3a2a3a' }); P.trait(1, 15, 4, 12, 1.4, C.acier); P.trait(15, 15, 12, 12, 1.4, C.acier); }); // Karasu
  R('PSV_073', P => { // Kuroari : corps creux qui se referme
    P.ellipse(8, 9, 6, 6.4, '#2a2630'); P.ellipse(8, 10, 3.2, 4, '#5a1a2a', true); P.rect(7, 6, 2, 8, '#2a2630', true);
    P.poly([[4, 4], [2, 0], [6, 3]], '#2a2630'); P.poly([[12, 4], [14, 0], [10, 3]], '#2a2630'); P.px(5, 5, '#e8d040', true); P.px(10, 5, '#e8d040', true);
  });
  R('PSV_074', P => { // Sanshōuo : carapace-bouclier
    P.ellipse(8, 9, 7.2, 5.6, '#6a7a5a'); for (const x of [4, 8, 12]) P.rect(x, 4, 1, 10, '#4a5a3a', true); P.rect(2, 8, 12, 1, '#4a5a3a', true);
    P.disque(8, 14, 2, '#8a9a7a'); P.px(7, 14, C.noir, true); P.px(9, 14, C.noir, true);
  });
  R('PSV_075', P => { // papillons de papier pliés
    const pap = (cx, cy, c) => { P.poly([[cx, cy], [cx - 5, cy - 4], [cx - 4, cy + 1]], c); P.poly([[cx, cy], [cx + 5, cy - 4], [cx + 4, cy + 1]], c); P.poly([[cx, cy], [cx - 3, cy + 3.6], [cx - 1, cy + 3]], nuancer(c, 0.85)); P.poly([[cx, cy], [cx + 3, cy + 3.6], [cx + 1, cy + 3]], nuancer(c, 0.85)); P.ligne(cx, cy - 2, cx, cy + 2, '#8a7a9a', true); };
    pap(5.5, 6, '#f4f0e4'); pap(11, 11, '#e4dcf4');
  });
  R('PSV_076', P => { // tigre d'encre
    const c = '#22222e'; P.ellipse(8, 9, 6, 5.4, c); P.poly([[3, 6], [3, 1], [7, 4.4]], c); P.poly([[13, 6], [13, 1], [9, 4.4]], c);
    P.px(5, 8, C.blanc, true); P.px(10, 8, C.blanc, true); P.rect(6, 11, 4, 2, '#5a5a6a', true); P.ligne(2, 11, 5, 11, '#5a5a6a', true); P.ligne(11, 11, 14, 11, '#5a5a6a', true);
    P.px(7, 4, '#5a5a6a', true); P.px(8, 5, '#5a5a6a', true);
  });
  R('PSV_077', P => { // clone de sable qui s'effrite
    P.disque(8, 4, 2.6, C.sable); P.poly([[4, 7], [12, 7], [11, 13], [5, 13]], C.sable); P.rect(5, 13, 2, 2, C.sable); P.rect(9, 13, 2, 2, C.sable);
    for (const [x, y] of [[13, 9], [14, 12], [2, 11], [12, 14]]) P.px(x, y, C.sableF, true); P.px(7, 4, C.sableF, true); P.px(9, 4, C.sableF, true);
  });
  R('PSV_078', P => P.serpent([[2, 14], [6, 12], [3, 9], [7, 6], [12, 5]], { c: '#f0ecf4', ep: 2.8, oeil: C.rouge })); // serpent blanc
  R('PSV_079', P => { // luciole
    P.disque(9, 10, 4.6, '#f0ff9a'); P.disque(9, 10, 3, '#d8f040', true);
    P.ellipse(6, 6, 2.6, 2, '#3a3a2a'); P.disque(4, 4.4, 1.5, '#3a3a2a'); P.ellipse(7, 3.6, 2, 1.1, '#c8d8ff', true);
    for (const [x, y] of [[14, 3], [2, 13], [15, 14]]) P.px(x, y, '#f0ff9a', true);
  });
  R('PSV_080', P => { // poupée d'entraînement
    P.rect(7, 2, 3, 13, C.bois); P.rect(2, 5, 12, 2, C.boisF); P.disque(8.5, 2.8, 2.4, C.boisC);
    P.disque(8.5, 10, 2.6, C.blanc, true); P.disque(8.5, 10, 1.4, C.rouge, true); P.rect(4, 14, 9, 2, '#5a4a3a');
  });
  R('PSV_081', P => { // miroir de glace qui renvoie un tir
    P.poly([[5, 1], [12, 3], [11, 15], [4, 13]], '#a8e0ff'); P.poly([[6, 3], [10.6, 4.4], [10, 13], [5.6, 11.6]], '#dff6ff', true);
    P.ligne(0, 8, 4, 8, C.rouge, true); P.ligne(4, 8, 1, 12, '#ff9a8a', true); P.px(0, 13, '#ff9a8a', true);
  });
  R('PSV_082', P => { P.crapaud(7, 10, { c: '#5a9a4a', ventre: '#d8e8a8' }); P.cle(11.5, 2.5, { c: C.or }); }); // crapaud messager et sa clé

  // ── Santé ──
  R('PSV_083', P => { // bol de ramen
    P.trait(11, 0, 6, 7, 1, C.boisC); P.trait(14, 1, 8, 7, 1, C.boisC);
    P.bol(8, 8, { c: '#c83a2a', bouillon: '#f0c060' }); P.rect(3, 8, 3, 1, '#ffe8a0', true); P.rect(9, 8, 4, 1, '#ffe8a0', true);
    P.disque(6, 7.6, 1.6, C.blanc, true); P.px(6, 7, C.rose, true); P.rect(2, 10, 12, 1, '#a02020', true);
  });
  R('PSV_084', P => { P.poly([[8, 1], [15, 13], [1, 13]], C.blanc); P.disque(8, 10.5, 4.2, C.blanc); P.rect(5, 10, 6, 5, '#1e2a22'); P.px(6, 4, '#ffffff', true); }); // onigiri
  R('PSV_085', P => { P.trait(2, 15, 13, 1, 1, C.boisC); P.disque(10.5, 4, 2.6, '#f4a0b8'); P.disque(7.8, 7.6, 2.6, C.blanc); P.disque(5, 11, 2.6, '#8ad07a'); }); // dango
  R('PSV_086', P => { P.pilule(8, 8, -40, { a: '#c8102a', b: '#4a0a18' }); P.px(5, 7, '#ff9a9a', true); P.badge('haut', C.rougeC); }); // pilule écarlate
  R('PSV_087', P => { P.sceau(8, 8, 7.4, { c: '#3a9a5a', croix: true }); P.coeur(8, 8, 3.6, C.rouge); P.arc(8, 8, 5.2, 300, 60, 1, '#6ae08a', true); P.arc(8, 8, 5.2, 120, 240, 1, '#6ae08a', true); }); // sceau de régénération
  R('PSV_088', P => { // cape de chakra protecteur
    P.poly([[4.6, 3], [11.4, 3], [15, 14], [12.6, 15.6], [10.4, 14], [8, 15.6], [5.6, 14], [3.4, 15.6], [1, 14]], '#3a6ad8');
    P.poly([[3.6, 1], [7.6, 3.6], [8, 6], [4.4, 4]], '#8ac4ff'); P.poly([[12.4, 1], [8.4, 3.6], [8, 6], [11.6, 4]], '#8ac4ff'); P.disque(8, 5, 1.2, C.or);
    for (const x of [5, 11]) P.ligne(x, 7, x + (x < 8 ? -1 : 1), 13, '#22408a', true);
  });
  R('PSV_089', P => { P.coeur(8, 8, 6, C.rouge); P.ligne(2, 15, 6, 10, C.noir); P.ligne(14, 15, 10, 10, C.noir); P.ligne(8, 15, 8, 12, C.noir); P.badge('retour', C.or); }); // cœur volé : on se relève
  R('PSV_090', P => { // cage d'os autour du cœur
    P.coeur(8, 8.5, 3.4, C.rouge);
    for (const y of [4, 8, 12]) { P.arc(8, y + 2, 6.4, 200, 340, 1.4, C.os); }
    P.rect(7, 1, 2, 14, C.os);
  });
  R('PSV_091', P => { // sceau maudit : trois virgules sur la peau
    P.disque(8, 8, 7.2, C.peau); P.disque(8, 8, 5.6, '#f8d8b8', true);
    for (const a of [-90, 30, 150]) { const x = 8 + Math.cos(a * DEG) * 3.4, y = 8 + Math.sin(a * DEG) * 3.4; P.disque(x, y, 1.9, C.noir, true); P.arc(8, 8, 3.8, a + 20, a + 75, 1.2, C.noir, true); }
  });
  R('PSV_092', P => { P.porte(8, 8, { c: '#3aa05a' }); P.coeur(8, 10.4, 2.4, C.rouge, { reflet: false }); P.ligne(8, 9, 8, 12, C.noir, true); P.badge('trois', C.vertC); }); // porte de la Vie : troisième porte, au prix du cœur
  R('PSV_093', P => { P.coeur(7, 7.5, 5.8, C.rouge); P.goutte(13, 12, 2, '#9ad0ff'); P.goutte(10.5, 14.4, 1.3, '#9ad0ff', { reflet: false }); P.badge('deux', C.bleuC); }); // chakra de la limace : soins doublés
  R('PSV_094', P => { P.bourse(8, 9, { c: C.blanc, lien: C.rouge }); P.rect(7, 8, 2, 6, C.rouge, true); P.rect(5, 10, 6, 2, C.rouge, true); }); // trousse de terrain
  R('PSV_095', P => { // sceau vital : un demi-cœur dans l'anneau
    P.anneau(8, 8, 7.4, 1.6, C.or); P.coeur(8, 8.6, 4.2, '#efe6d6', { reflet: false });
    P.forme((x, y) => x < 8 && ((x - 6) ** 2 + (y - 7.6) ** 2 < 5.4 || (y >= 7.6 && y - 8.6 < (x - 3.8) * 1.05 + 0.3)), C.rouge);
  });
  R('PSV_096', P => { fumee(P, 9, 6, '#d0ccd8'); P.buche(7, 11); }); // substitution : la bûche
  R('PSV_097', P => { // armure de sable
    P.poly([[2, 2], [14, 2], [14, 9], [8, 15], [2, 9]], C.sable); P.poly([[4, 4], [12, 4], [12, 8.6], [8, 13], [4, 8.6]], '#e8c888', true);
    for (const [x, y] of [[5, 5], [10, 6], [7, 9], [11, 9], [6, 11]]) P.px(x, y, C.sableF, true);
  });
  R('PSV_098', P => { P.coeur(8, 7.5, 6, '#5a2a7a'); P.anneau(8, 8, 4, 1, '#c890ff', true); P.rect(2, 7, 12, 1, '#c890ff', true); P.chaine([[1, 14], [3, 13], [5, 14]]); P.chaine([[11, 14], [13, 13], [15, 14]]); }); // démon scellé

  // ── Ressources ──
  const tagMeche = (P, x, y, o = {}) => { P.etiquette(x, y, 6, 8, { encre: o.encre }); if (o.meche !== false) { P.ligne(x + 3, y - 1, x + 3, y - 2, C.boisF); etincelle(P, x + 3, y - 3); } };
  R('PSV_099', P => { // sac de parchemins explosifs
    P.etiquette(3, 1, 4, 7); P.etiquette(7, 0, 4, 7); P.etiquette(10, 2, 4, 6);
    P.bourse(8, 10, { c: '#8a6a4a', lien: C.rouge }); P.badge('cinq', C.orC);
  });
  R('PSV_100', P => { // explosion qui projette quatre kunai
    P.etoile(8, 8, 5.4, 2.6, 8, 0, C.orange); P.disque(8, 8, 2.4, C.or);
    for (const a of [-45, 45, 135, 225]) P.kunai(8 + Math.cos(a * DEG) * 3.4, 8 + Math.sin(a * DEG) * 3.4, a, { k: 0.4 });
  });
  R('PSV_101', P => { // mèche longue enroulée
    P.etiquette(1, 7, 6, 8);
    P.arc(9, 6, 3, 180, 450, 1, C.boisF); P.arc(11, 6, 1.6, 0, 270, 1, C.boisF); P.ligne(4, 6, 6, 6, C.boisF); etincelle(P, 13, 3);
  });
  R('PSV_102', P => { P.etiquette(2, 6, 6, 9); P.flamme(11, 15, 12, { couleurs: [C.rouge, C.orange, C.or] }); }); // parchemins incendiaires
  R('PSV_103', P => { P.etiquette(1, 5, 6, 8); for (const x of [8, 10, 12]) P.px(x, 9, C.or, true); P.poly([[13, 6], [16, 9], [13, 12]], C.or); P.badge('cible', C.rouge); }); // parchemins chercheurs
  R('PSV_104', P => { // grand parchemin, explosion large
    for (let i = 0; i < 8; i++) { const a = (i * 45 + 22) * DEG; P.trait(8 + Math.cos(a) * 5, 8 + Math.sin(a) * 5, 8 + Math.cos(a) * 7.4, 8 + Math.sin(a) * 7.4, 1.4, C.orange); }
    P.etiquette(4, 2, 8, 12, { encre: C.rougeF });
  });
  R('PSV_105', P => { // trousseau : trois clés
    P.anneau(5, 5, 4, 1.2, C.acier);
    P.trait(6, 7, 14, 13, 1.6, C.or); P.trait(5, 8, 7, 15, 1.6, '#e0b040'); P.trait(7, 6, 15, 6, 1.6, '#f0d060');
    P.px(13, 14, C.or); P.px(6, 15, '#e0b040'); P.px(14, 7, '#f0d060');
  });
  R('PSV_106', P => { // épingle dans le cadenas
    P.anneau(7, 6, 4, 1.6, C.acier); P.rect(2, 7, 10, 8, C.or); P.rect(6, 10, 2, 3, C.noir, true);
    P.ligne(7, 11, 15, 3, C.acierC); P.px(15, 2, C.acierC);
  });
  R('PSV_107', P => { // bourse-grenouille
    P.ellipse(8, 10, 6.6, 5, '#5ab84a'); P.disque(4.5, 5, 2.2, '#5ab84a'); P.disque(11.5, 5, 2.2, '#5ab84a');
    P.px(4, 5, C.noir, true); P.px(11, 5, C.noir, true); P.rect(4, 9, 8, 1, '#2a6a2a', true); P.piece(13, 13, 2.4);
  });
  R('PSV_108', P => { // aimant qui attire pièces et cœurs
    P.arc(7, 8, 5.6, 90, 270, 3, C.rouge); P.rect(7, 2, 5, 3, C.rouge); P.rect(7, 11, 5, 3, C.rouge); P.rect(10, 2, 2, 3, C.acier); P.rect(10, 11, 2, 3, C.acier);
    P.piece(14, 6, 1.6); P.coeur(14.4, 12, 1.6, C.rouge, { reflet: false });
  });
  R('PSV_109', P => { P.rouleauFerme(2, 13, 13, 2, { ep: 6, papier: '#e8d8b0', embout: C.bois }); P.sceau(7.5, 7.5, 2.6, { c: C.encre, croix: false }); }); // parchemin d'invocation vide
  R('PSV_110', P => { // paume à bouche et boule d'argile
    P.gant(7, 9, { c: C.peau }); P.ellipse(7, 10.5, 2, 1.1, '#8a2a3a', true); P.rect(6, 10, 3, 1, C.blanc, true); P.disque(13, 4, 2.4, C.argile);
  });

  // ── Exploration ──
  R('PSV_111', P => { // carte du labyrinthe
    P.carte(1, 2, 14, 12); for (const [x, y, w, h] of [[3, 4, 3, 2], [7, 4, 3, 2], [7, 7, 3, 2], [11, 7, 2, 2], [3, 10, 3, 2], [7, 10, 3, 2]]) P.rect(x, y, w, h, '#8a7a5a', true);
    P.px(11, 11, C.rouge, true); P.px(12, 10, C.rouge, true); P.px(12, 12, C.rouge, true); P.px(13, 11, C.rouge, true);
  });
  R('PSV_112', P => P.boussole(8, 8, 7)); // boussole
  R('PSV_113', P => { P.oeil(8, 8, 7.4, 4.4, { type: 'byakugan' }); for (const [x0, y0, x1, y1] of [[0, 4, 2, 6], [15, 4, 13, 6], [1, 12, 3, 10], [14, 12, 12, 10]]) P.ligne(x0, y0, x1, y1, '#b8a8d8', true); }); // Byakugan
  R('PSV_114', P => { // mur fissuré et rouleau des voies secrètes
    for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) P.rect(x * 5 + (y % 2 ? 2 : 0) - 1, y * 3 + 1, 4, 2, '#8a8090');
    P.ligne(9, 1, 7, 5, C.noir, true); P.ligne(7, 5, 9, 8, C.noir, true); P.ligne(9, 8, 8, 11, C.noir, true);
    P.rouleauFerme(1, 15, 9, 11, { ep: 3.6 });
  });
  R('PSV_115', P => { P.ellipse(8, 13.5, 7, 2.4, '#14101c'); P.plume(3, 10, 13, 1, { c: C.blanc, large: 2.8 }); for (const [x, y] of [[2, 6], [13, 9], [5, 2], [11, 12]]) P.px(x, y, '#9ad0ff', true); }); // lévitation : une plume au-dessus de la fosse
  R('PSV_116', P => { P.aile(7, 6, -1, { c: '#f6f0e2' }); P.aile(9, 6, 1, { c: '#f6f0e2' }); P.rect(7, 5, 2, 7, '#c8b890'); }); // ailes de papier
  R('PSV_117', P => { // pièges neutralisés
    P.rect(0, 14, 16, 2, '#5a5a66'); for (const x of [2, 7, 12]) P.poly([[x, 14], [x + 1.5, 9], [x + 3, 14]], C.acier);
    P.arc(8, 13, 7, 190, 350, 1.4, '#6ae08a', true); P.px(8, 3, '#6ae08a', true);
  });
  R('PSV_118', P => { // grelot de l'examen
    P.disque(8, 9, 5.6, C.or); P.rect(3, 9, 10, 1, C.orF, true); P.rect(7, 10, 2, 3, C.noir, true); P.disque(6, 7, 1.4, C.orC, true);
    P.rect(7, 1, 2, 3, C.rouge); P.badge('etoile', C.orC);
  });
  R('PSV_119', P => { // sac à double fond : deux poches
    P.arc(8, 4, 3.4, 180, 360, 1.4, '#5a3a24'); P.rect(2, 4, 12, 11, '#8a5a32'); P.rect(3, 8, 4, 5, '#b07a4a'); P.rect(9, 8, 4, 5, '#b07a4a');
    P.rect(4, 8, 2, 1, C.or, true); P.rect(10, 8, 2, 1, C.or, true); P.rect(2, 6, 12, 1, '#5a3a24', true);
  });
  R('PSV_120', P => { // collier à deux charmes
    for (let i = 0; i < 9; i++) { const a = (10 + i * 20) * DEG; P.disque(8 + Math.cos(a) * 6.4, 3 + Math.sin(a) * 6.4, 0.9, '#e8d0a0'); }
    P.disque(5, 11.6, 2.2, C.rouge); P.trait(5, 11, 3.6, 14, 1, C.rouge); P.poly([[11, 9.4], [13.4, 11.6], [11, 15], [8.6, 11.6]], '#5ad0e8');
  });
  R('PSV_121', P => { P.rect(1, 3, 14, 10, '#3a9a6a'); P.rect(1, 5, 14, 2, '#1e5a3a', true); P.piece(11, 10, 2.2); P.rect(3, 9, 5, 1, '#c8f0d8', true); P.rect(3, 11, 3, 1, '#c8f0d8', true); P.badge('moins', '#9af0b0'); }); // carte de membre
  R('PSV_122', P => { // coupon dentelé
    P.rect(1, 4, 14, 8, '#f0d060'); for (let y = 4; y < 12; y += 2) { P.px(0, y, '#f0d060'); P.px(15, y + 1, '#f0d060'); }
    for (let y = 5; y < 12; y += 2) P.px(10, y, '#a08020', true); P.etoile(5.6, 8, 3, 1.3, 5, -90, C.rouge, true);
  });
  R('PSV_123', P => { P.livre(1, 2, 9, 12, { c: '#3a6ab0' }); P.rect(3, 5, 4, 1, '#c8d8f0', true); for (let k = 0; k < 4; k++) P.ellipse(12.5, 13.4 - k * 1.6, 2.6, 1, k % 2 ? C.orF : C.or); }); // livret d'épargne
  R('PSV_124', P => { // un étal de plus
    for (let i = 0; i < 4; i++) P.poly([[i * 4, 2], [i * 4 + 4, 2], [i * 4 + 4, 5], [i * 4 + 2, 6.4], [i * 4, 5]], i % 2 ? C.blanc : C.rouge);
    P.rect(2, 6, 1, 8, C.boisF); P.rect(13, 6, 1, 8, C.boisF); P.rect(1, 10, 14, 4, C.bois); P.piece(6, 9, 1.6); P.badge('plus', C.vertC);
  });
  R('PSV_125', P => { // deux dés
    P.poly([[1, 6], [8, 4], [9, 11], [2, 13]], C.blanc); for (const [x, y] of [[3, 7], [6, 9], [4, 11]]) P.px(x, y, C.rouge, true);
    P.poly([[8, 2], [14, 3], [14, 9], [8, 8]], '#f0ece4'); for (const [x, y] of [[9, 4], [12, 4], [9, 7], [12, 7]]) P.px(x, y, C.noir, true);
  });
  R('PSV_126', P => { P.livre(2, 1, 12, 14, { c: '#e07a2a' }); P.disque(7.5, 7, 3, '#5a9a4a'); P.px(6, 6, C.noir, true); P.px(9, 6, C.noir, true); P.rect(6, 8, 3, 1, '#2a5a2a', true); P.rect(3, 12, 9, 1, '#ffd0a0', true); }); // livre de l'ermite
  R('PSV_127', P => { P.etiquette(3, 1, 9, 13, { encre: C.encre }); P.arc(7.5, 8, 5.6, 200, 520, 1.2, '#5a9ae0'); P.poly([[11, 3], [14, 4], [12, 6]], '#5a9ae0'); P.badge('haut', C.or); }); // sceau de réécriture (passif)
  R('PSV_128', P => { // tampon et son empreinte
    P.disque(8, 2.6, 2.2, C.boisC); P.rect(7, 3, 2, 5, C.bois); P.rect(4, 8, 8, 3, '#8a2a2a');
    P.anneau(8, 13.4, 2.6, 1, C.rouge, true); P.px(8, 13, C.rouge, true);
  });
  R('PSV_129', P => { // contrat cousu, payé en Ryō
    P.rect(2, 1, 11, 14, C.papier); for (const y of [3, 5, 7]) P.rect(4, y, 7, 1, '#a89870', true);
    P.disque(10, 11, 2.6, C.rouge); P.piece(5, 11.5, 2.2); for (const y of [2, 6, 10, 14]) P.px(1, y, C.noir, true);
  });
  R('PSV_130', P => { P.bourse(8, 9, { c: '#2a2630', lien: C.or }); P.disque(6.4, 10.4, 1.4, '#c8283a', true); P.disque(8.4, 9.6, 1.7, '#c8283a', true); P.disque(10.2, 10.6, 1.3, '#c8283a', true); P.rect(6, 11, 5, 1, '#c8283a', true); P.piece(13.5, 3, 2); }); // bourse au nuage rouge

  // ── Contreparties ──
  R('PSV_131', P => { P.masque(8, 9, { c: '#9a8ab0', cornes: '#e8e0f0', yeux: C.rouge, bouche: C.noir }); P.trait(9, 14, 15, 10, 1.4, C.acierC); P.badge('deux', C.rougeC); }); // sceau de la mort : ×2
  R('PSV_132', P => { // rage : œil de renard fendu, flammes
    P.flamme(2.6, 16, 10, { couleurs: [C.rouge, C.orange, null] }); P.flamme(13.4, 16, 10, { couleurs: [C.rouge, C.orange, null] });
    P.oeil(8, 7, 7, 4.2, { type: 'renard' });
  });
  R('PSV_133', P => { P.feuille(3, 14, 12, 5, { c: C.feuille, large: 3.6 }); P.flamme(10.5, 9, 9, { couleurs: [C.rouge, C.orange, C.or] }); }); // volonté du feu
  R('PSV_134', P => { // colère de la Racine
    P.trait(8, 0, 8, 7, 2, '#3a2a2a'); P.trait(8, 4, 3, 9, 1.6, '#3a2a2a'); P.trait(8, 5, 13, 10, 1.6, '#3a2a2a'); P.trait(3, 9, 2, 14, 1.2, '#3a2a2a'); P.trait(13, 10, 14, 14, 1.2, '#3a2a2a');
    P.goutte(8, 12.6, 2.4, '#8a3ac0');
  });
  R('PSV_135', P => { // rituel : dague et sang
    P.ellipse(8, 14, 6.4, 1.8, C.sang); P.rect(7, 0, 2, 4, '#3a2a2a'); P.rect(5, 4, 6, 1, C.or); P.poly([[6.4, 5], [9.6, 5], [8, 11.6]], C.acier); P.goutte(8, 12.6, 1.1, C.sang, { reflet: false });
  });
  R('PSV_136', P => { // Samehada : épée d'écailles
    P.trait(2, 14, 4, 12, 1.8, '#2a2a3a'); P.forme((x, y) => { const u = (x - 4) * 0.707 - (y - 12) * 0.707, v = (x - 4) * 0.707 + (y - 12) * 0.707; return u > 0 && u < 13 && Math.abs(v) < 2.2 + Math.sin(u) * 0.6; }, '#5a7ab0');
    for (let k = 0; k < 5; k++) { const x = 6 + k * 1.8, y = 10 - k * 1.8; P.px(x, y, '#c8d8f0', true); P.px(x + 1.4, y + 1.4, '#2a3a6a', true); }
  });
  R('PSV_137', P => { for (let k = 0; k < 3; k++) P.kunai(1 + k * 2, 14 - k * 2.6, -42, { k: 0.62 }); for (const [x, y] of [[0, 9], [1, 6], [3, 4]]) P.px(x, y, '#ff8a6a', true); P.badge('haut', C.orC); }); // cadence frénétique
  R('PSV_138', P => { // silence de la brume : œil clos dans la brume
    for (const [y, x, w] of [[3, 1, 12], [7, 3, 12], [11, 0, 13]]) { P.rect(x, y, w, 2, '#b8c8d8'); P.rect(x + 2, y, w - 4, 1, '#dce8f0', true); }
    P.arc(8, 6, 3.4, 20, 160, 1.2, C.encre, true); for (const x of [5, 8, 11]) P.px(x, 9, C.encre, true);
  });
  R('PSV_139', P => { P.rouleau(1, 3, 14, 10, { papier: '#efe0c0' }); P.gant(8, 8.6, { c: '#c8283a' }); P.badge('plus', C.rougeC); }); // pacte : main de sang
  R('PSV_140', P => { // cercueil de la réincarnation
    P.poly([[5, 0], [11, 0], [14, 4], [12, 16], [4, 16], [2, 4]], '#5a3a2a'); P.poly([[6, 1.4], [10, 1.4], [12.4, 4.4], [10.8, 14.6], [5.2, 14.6], [3.6, 4.4]], '#7a5a3a', true);
    P.etiquette(6, 5, 4, 7, { encre: C.noir });
  });
  R('PSV_141', P => { P.coeur(8, 7.6, 6.4, C.rouge); P.arc(8, 8, 3.4, 0, 300, 1, C.noir, true); P.arc(8, 8, 1.6, 120, 420, 1, C.noir, true); for (let i = 0; i < 4; i++) { const a = (i * 90 + 45) * DEG; P.px(8 + Math.cos(a) * 5, 8 + Math.sin(a) * 5, C.noir, true); } }); // cœur du réceptacle
  R('PSV_142', P => { P.gant(7, 9, { c: '#b88a5a' }); for (const [x, y] of [[4, 4], [6, 3], [8, 3]]) P.px(x, y, '#4a3a2a', true); P.goutte(13, 12, 2.2, '#9a4ad0'); P.ligne(10, 2, 14, 6, C.acierC); }); // main du scorpion
  R('PSV_143', P => P.serpent([[2, 13], [6, 14], [9, 11], [6, 7], [9, 4], [13, 4]], { c: '#e8e0c8', ep: 3, oeil: '#a89a7a', langue: false })); // mue du serpent
  R('PSV_144', P => { // énergie naturelle
    P.disque(8, 8, 3.6, '#f0b040'); P.disque(7.4, 7.4, 1.8, '#ffe8a0', true);
    for (const a of [0, 120, 240]) { const x = 8 + Math.cos(a * DEG) * 5.6, y = 8 + Math.sin(a * DEG) * 5.6; P.feuille(x, y, x + Math.cos((a + 90) * DEG) * 4, y + Math.sin((a + 90) * DEG) * 4, { large: 1.4 }); }
  });
  R('PSV_145', P => { // pluie d'armes
    P.nuage(8, 2, { c: '#8a8098' });
    P.kunai(3.5, 5, 90, { k: 0.56 }); P.sabre(8.5, 5, 90, { k: 0.62, long: 11, largeur: 1 }); P.shuriken(13, 12, 2.6, { rot: 20 });
  });
  R('PSV_146', P => { P.rect(1, 1, 14, 14, C.papier); P.orbe(8, 8, 3.4, { bras: 2 }); for (const a of [20, 110, 200, 290]) P.poly([[8 + Math.cos(a * DEG) * 3, 8 + Math.sin(a * DEG) * 3], [8 + Math.cos((a + 25) * DEG) * 6.8, 8 + Math.sin((a + 25) * DEG) * 6.8], [8 + Math.cos((a + 55) * DEG) * 3.4, 8 + Math.sin((a + 55) * DEG) * 3.4]], '#a8d8ff', true); }); // empreinte du Rasenshuriken
  R('PSV_147', P => { P.trait(1, 14, 11, 4, 1.6, '#bfe8ff'); P.poly([[9, 3], [15, 1], [13, 7]], '#bfe8ff'); for (const [x, y] of [[4, 9], [7, 10], [8, 6], [11, 8]]) P.px(x, y, C.cyan, true); P.trait(1, 14, 11, 4, 0.5, C.blanc, true); }); // lance de foudre
  R('PSV_148', P => { // double dragon : deux dragons qui s'élèvent
    P.serpent([[4, 15], [2, 11], [5, 8], [3, 4], [5, 2]], { c: C.rouge, ep: 2.2, oeil: C.or, langue: false });
    P.serpent([[12, 15], [14, 11], [11, 8], [13, 4], [11, 2]], { c: '#3a6ad8', ep: 2.2, oeil: C.or, langue: false, oeilDx: -0.5 });
  });
  R('PSV_149', P => { P.etoile(8, 8, 7.6, 3.2, 8, 0, '#6ab8ff'); P.etoile(8, 8, 4.6, 2, 8, 22, '#c8ecff'); P.disque(8, 8, 1.6, C.blanc); }); // explosion de chakra
  R('PSV_150', P => P.tornade(8, 8, { c: C.sable })); // tempête de sable
  R('PSV_151', P => { // chakra partagé : main et patte
    P.gant(5, 9, { c: C.peau }); P.disque(12, 10, 2.6, '#c8a070'); for (const [x, y] of [[10, 6], [12, 5.6], [14, 6.4]]) P.disque(x, y, 1, '#c8a070');
    P.etoile(9, 3, 2.6, 1, 4, 0, C.cyan);
  });
  R('PSV_152', P => { P.trait(13, 1, 7, 7, 1.4, C.bois); P.poly([[7, 6], [8, 8], [5, 10], [4, 9]], C.noir); P.disque(5, 13, 2.2, C.noir); for (const [x, y] of [[2, 10], [4, 9.4], [7, 10], [8, 12]]) P.disque(x, y, 0.9, C.noir); }); // encre vivante : empreinte
  R('PSV_153', P => { // ruche
    P.ellipse(8, 9, 6, 6, '#c8903a'); for (const y of [5, 8, 11]) P.rect(2, y, 12, 1, '#8a5a2a', true); P.ellipse(8, 14, 2, 1, '#3a2a1a');
    P.insecte(13, 3, { c: '#3a4a2a', antennes: false }); P.px(1, 2, '#3a4a2a'); P.px(3, 1, '#3a4a2a');
  });
  R('PSV_154', P => { // voile d'insectes
    P.coeur(8, 9, 3, C.rouge);
    for (let i = 0; i < 30; i++) { const a = i * 2.4, r = 4.6 + (i % 3) * 1.1, x = 8 + Math.cos(a) * r, y = 8.6 + Math.sin(a) * r * 0.86; P.rect(Math.round(x), Math.round(y), 2, 1, i % 3 ? '#3a4a2a' : '#6a7a4a'); }
  });
  R('PSV_155', P => { P.etoile(8, 8, 7.4, 2.6, 4, 0, '#f2ead8'); for (const a of [0, 90, 180, 270]) P.ligne(8, 8, 8 + Math.cos((a + 20) * DEG) * 5, 8 + Math.sin((a + 20) * DEG) * 5, '#c8b890', true); P.disque(8, 8, 1, null); }); // shuriken de papier
  R('PSV_156', P => { P.etiquette(1, 3, 5, 8); P.etiquette(6, 1, 5, 8); P.etiquette(10, 5, 5, 8); P.badge('deux', C.orC); }); // mer de papiers explosifs
  R('PSV_157', P => { P.poing(6, 8, { c: C.peau }); P.etoile(13, 8, 3.4, 1.4, 6, 0, C.or); P.px(13, 8, C.blanc, true); }); // frappe à bout portant
  R('PSV_158', P => { for (const [x, y] of [[4, 11], [6, 9]]) P.px(x, y, '#a0a0c0', true); P.shuriken(2.6, 13.4, 2.4, { trou: 0 }); P.shuriken(7, 8.6, 3.4, { trou: 0.7 }); P.shuriken(11.6, 4.4, 4.6); }); // shuriken du long voyage : il grossit en chemin
  R('PSV_159', P => { P.oeil(8, 8, 7.4, 4.4, { couleur: '#3a9a4a' }); P.rect(8, 1, 1, 3, C.rouge, true); P.rect(8, 12, 1, 3, C.rouge, true); P.rect(0, 8, 2, 1, C.rouge, true); P.rect(14, 8, 2, 1, C.rouge, true); P.badge('haut', C.vertC); }); // œil du chasseur
  R('PSV_160', P => { for (const [x, y, a] of [[5, 6, -20], [10, 11, 15]]) { for (let k = 0; k < 4; k++) P.disque(x + Math.cos(a * DEG) * k * 1.6 - 2, y + Math.sin(a * DEG) * k * 1.6, 1.8 - k * 0.15, '#f0e8d0'); P.px(x + 2.6, y + Math.sin(a * DEG) * 4, C.noir, true); } }); // larves
  R('PSV_161', P => { // espace replié : le tir ressort du mur opposé
    P.ellipse(2.5, 8, 2, 5.4, '#4a2a7a'); P.ellipse(2.5, 8, 1, 4, '#c08aff', true); P.ellipse(13.5, 8, 2, 5.4, '#4a2a7a'); P.ellipse(13.5, 8, 1, 4, '#c08aff', true);
    P.trait(9, 8, 11, 8, 1, C.acierC); P.poly([[4.6, 6], [8, 8], [4.6, 10]], C.acier);
  });
  R('PSV_162', P => { // marque du chasseur : verrouillage
    for (const [x, y, dx, dy] of [[1, 1, 1, 1], [14, 1, -1, 1], [1, 14, 1, -1], [14, 14, -1, -1]]) { P.rect(Math.min(x, x + dx * 3), y, 4, 1, C.rouge); P.rect(x, Math.min(y, y + dy * 3), 1, 4, C.rouge); }
    P.disque(8, 8, 3, '#c8484a'); P.ligne(6, 6, 10, 10, C.blanc, true); P.ligne(10, 6, 6, 10, C.blanc, true);
  });
  R('PSV_163', P => { // lame dentelée qui fait saigner
    P.sabre(2, 14, -45, { long: 14, largeur: 1.6, tsuba: '#3a3448' });
    for (let k = 0; k < 4; k++) P.px(8 + k * 2, 9 - k * 2, null); P.goutte(13.5, 13.6, 1.8, C.sang);
  });
  R('PSV_164', P => { // intention meurtrière
    P.flamme(8, 16, 16, { couleurs: ['#3a1a4a', '#5a2a6a', '#7a3a8a', null], largeur: 7 });
    P.ellipse(5.6, 9, 1.6, 0.9, '#ffe0f0', true); P.ellipse(10.4, 9, 1.6, 0.9, '#ffe0f0', true); P.px(5, 9, C.rouge, true); P.px(10, 9, C.rouge, true);
  });
  R('PSV_165', P => { // shuriken scindé
    P.shuriken(5.6, 10.4, 5); P.ligne(1, 15, 10, 6, C.noir, true);
    for (const [x, y] of [[11, 3], [14, 6], [12, 9]]) P.poly([[x, y], [x + 2, y - 1], [x + 1, y + 1.4]], C.acierC);
  });
  R('PSV_166', P => { P.crane(8, 8); P.etiquette(6, 1, 4, 6); }); // étiquette posthume
  R('PSV_167', P => { P.arc(8, 8, 6, 30, 300, 1, '#a8e090', true); P.feuille(3, 6, 6, 1, { large: 1.8 }); P.feuille(12, 3, 15, 7, { large: 1.8 }); P.feuille(10, 14, 5, 13, { large: 1.8 }); P.feuille(8, 8, 9, 5, { large: 1.2 }); }); // tourbillon de feuilles
  R('PSV_168', P => { for (const [x, y, r] of [[4, 4, 1.8], [10, 3, 1.5], [7, 8, 2], [13, 9, 1.6], [3, 11, 1.6], [9, 13, 1.8]]) P.disque(x, y, r, C.sable); P.badge('pause', C.blanc); }); // sable en suspens
  R('PSV_169', P => { for (const [x, y] of [[1, 13], [3, 13], [5, 13], [7, 13], [9, 13], [11, 12], [11, 10]]) P.px(x, y, '#a0c8ff', true); P.kunai(11.5, 9.5, -90, { k: 0.6 }); P.disque(4, 4, 2.4, '#c8484a'); }); // kunai pivotant
  R('PSV_170', P => { P.flamme(4, 15, 7, { couleurs: [C.rouge, C.orange, C.or], phase: 1 }); P.flamme(8, 14, 9, { couleurs: [C.rouge, C.orange, C.or] }); P.kunai(9, 8, -45, { k: 0.58 }); }); // sillage ardent
  R('PSV_171', P => { P.etoile(9, 7, 6.6, 2.4, 8, 0, C.or); P.etoile(9, 7, 3.8, 1.6, 8, 22, '#fff4c0'); P.ligne(0, 15, 6, 9, C.acierC); P.px(0, 15, C.acierF); }); // points vitaux : critique
  R('PSV_172', P => { P.rect(6, 7, 4, 8, '#f0e8d8'); P.rect(5, 14, 6, 2, C.bois); P.flamme(8, 7, 6, { couleurs: [C.orange, C.or, C.orC] }); P.px(8, 6, C.noir, true); }); // concentration : bougie
  R('PSV_173', P => { P.sabre(2, 14, -45, { long: 15, largeur: 2.6, tsuba: C.or, lame: '#c8d0dc' }); P.badge('sept', C.orC); }); // septième lame
  R('PSV_174', P => { P.anneau(8, 8, 7.4, 1.4, '#6ab8ff', true); P.disque(8, 8, 2.2, '#3a6ad8'); for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) P.poly([[8 + dx * 3.6, 8 + dy * 3.6], [8 + dx * 6 - dy * 1.8, 8 + dy * 6 + dx * 1.8], [8 + dx * 6 + dy * 1.8, 8 + dy * 6 - dx * 1.8]], '#a8d8ff'); }); // pression du chakra
  R('PSV_175', P => { P.disque(5, 6, 2.4, C.peau); P.poly([[3, 9], [7, 9], [8, 15], [2, 15]], '#3a4a6a'); P.disque(13, 4, 1.8, C.rouge); for (const x of [8, 10]) P.px(x, 4, '#ff9a8a', true); P.badge('eclair', C.or); }); // instinct : frôler un tir
  R('PSV_176', P => { P.crapaud(8, 9, { c: '#8a9a7a', ventre: '#d8d8c0' }); P.rect(3, 5, 3, 1, C.blanc, true); P.rect(10, 5, 3, 1, C.blanc, true); P.badge('plus', C.bleuC); }); // vieil ermite
  R('PSV_177', P => P.oeil(8, 8, 7.4, 4.6, { type: 'rinnegan' })); // Rinnegan
  R('PSV_178', P => { P.etiquette(4, 2, 7, 11); P.badge('horloge', C.orC); }); // étiquette à retardement
  R('PSV_179', P => { P.rouleauFerme(5, 11, 11, 5, { ep: 4 }); for (let i = 0; i < 8; i++) { const a = i * 45 * DEG; P.px(8 + Math.cos(a) * 7, 8 + Math.sin(a) * 7, C.or, true); P.px(8 + Math.cos(a) * 6, 8 + Math.sin(a) * 6, C.or, true); } }); // double technique : huit directions
  R('PSV_180', P => { P.coeur(4.6, 5, 3.6, '#4a2a34'); P.coeur(11.4, 5, 3.6, '#4a2a34'); P.coeur(4.6, 5, 2, null); P.coeur(11.4, 5, 2, null); P.goutte(8, 12.4, 2.6, C.sang); }); // sang du clan : contenants vides

  // ── Marques de sang (pacte) : une tache de sang, un symbole ──
  const tache = P => { P.disque(8, 8, 6, C.sang); for (const [x, y, r] of [[2, 3, 1.4], [14, 4, 1.2], [3, 14, 1.1], [13, 13, 1.5]]) P.disque(x, y, r, C.sang); P.rect(7, 13, 2, 3, C.sang); };
  R('PSV_181', P => { tache(P); P.incruster(Q => { Q.trait(5, 11, 11, 5, 1.4, '#f4f0ea', true); Q.trait(5, 8, 8, 11, 1, '#f4f0ea', true); }); }); // force : lame
  R('PSV_182', P => { tache(P); P.incruster(Q => { Q.eclair([[8, 3], [11, 3], [9, 7], [11, 7], [6, 13], [7.4, 8.6], [5.6, 8.6]], '#ffe070'); }); }); // vivacité : éclair
  R('PSV_183', P => { tache(P); P.incruster(Q => { Q.trait(3, 8, 10, 8, 1.4, '#9ad8ff', true); Q.poly([[10, 5], [14, 8.5], [10, 12]], '#9ad8ff', true); }); }); // allonge : flèche
  R('PSV_184', P => { tache(P); P.incruster(Q => { Q.anneau(8, 8, 3.6, 1.2, '#ffd040', true); Q.px(8, 8, '#ffd040', true); }); }); // fortune : pièce
  R('PSV_185', P => { tache(P); P.incruster(Q => { Q.aile(5, 7, 1, { c: '#9af0d8' }); }); }); // célérité : aile
  R('PSV_186', P => { tache(P); P.incruster(Q => { Q.poly([[5, 5], [7.6, 5], [6.3, 11]], '#ffc0d8', true); Q.poly([[8.4, 5], [11, 5], [9.7, 11]], '#ffc0d8', true); }); }); // soif : crocs

  // ── Bénédictions (sanctuaire) : halo d'or et la créature ──
  const halo = P => P.forme((x, y) => { const q = ((x - 8) / 4.8) ** 2 + ((y - 2.2) / 1.8) ** 2; return q <= 1 && q > 0.36; }, C.or);
  R('PSV_187', P => { P.crapaud(8, 10, { c: '#e0743a' }); halo(P); }); // crapaud
  R('PSV_188', P => { limace(P, 7, 10); halo(P); }); // limace
  R('PSV_189', P => { P.serpent([[2, 14], [6, 12], [4, 9], [8, 7], [12, 8]], { c: '#f0ecf4', ep: 2.6, oeil: C.rouge }); halo(P); }); // serpent blanc
  R('PSV_190', P => { P.livre(3, 6, 10, 9, { c: '#e07a2a' }); P.rect(5, 9, 5, 1, '#ffd0a0', true); halo(P); }); // ermite
  R('PSV_191', P => { // phénix
    P.flamme(8, 15, 9, { couleurs: [C.rouge, C.orange, C.or] }); P.poly([[7, 9], [1, 5], [3, 11]], C.orange); P.poly([[9, 9], [15, 5], [13, 11]], C.orange); P.disque(8, 7.6, 1.8, C.or); P.px(8, 7, C.rouge, true); halo(P);
  });
  R('PSV_192', P => { P.oeil(8, 10, 6.4, 3.8, { type: 'sage' }); P.rect(1, 13, 3, 1, C.orange, true); P.rect(12, 13, 3, 1, C.orange, true); halo(P); }); // sage

  // ── Objets-clés ──
  R('PSV_900', P => { // clé des ermites
    P.anneau(4.4, 4.4, 3.8, 1.8, C.or); P.disque(4.4, 4.4, 1.4, '#3ab86a'); P.trait(6.4, 6.4, 14, 14, 2, C.or);
    P.trait(11.6, 13.4, 10, 15, 1.6, C.or); P.trait(13.4, 11.6, 15, 10, 1.6, C.or); P.trait(9.4, 10.4, 8, 12, 1.4, C.or); P.px(1, 1, C.orC, true);
  });
  R('PSV_901', P => { // fragment de la clé : cassure
    P.anneau(4.4, 4.4, 3.8, 1.8, C.or); P.disque(4.4, 4.4, 1.4, '#3ab86a'); P.trait(6.4, 6.4, 9.6, 9.6, 2, C.or); P.px(10, 9, C.or); P.px(9, 10, C.or);
    for (const [x, y] of [[12, 13], [14, 11], [13, 14]]) P.px(x, y, '#8a7a4a', true);
  });
  // ── Techniques (actifs) ──
  const fleches = (P, cx, cy, r, c) => { P.arc(cx, cy, r, 200, 340, 1.4, c); P.arc(cx, cy, r, 20, 160, 1.4, c); P.poly([[cx + r - 2.4, cy - 2.6], [cx + r + 2, cy - 2.2], [cx + r - 0.2, cy + 0.6]], c); P.poly([[cx - r + 2.4, cy + 2.6], [cx - r - 2, cy + 2.2], [cx - r + 0.2, cy - 0.6]], c); };
  const miniChien = (P, x, y, a, b) => P.motif(['a.....a', 'aa...aa', 'aaaaaaa', 'aeaaaea', 'aabbbaa', '.abkba.', '..bbb..'], { a, e: C.noir, b, k: C.noir }, x, y, false);
  const kunaiTrident = (P, x, y, a, o = {}) => { P.kunai(x, y, a, o); const t = [x, y, a], k = o.k || 1; P.poly([[6.6 * k, -1.6 * k], [10.4 * k, -4.4 * k], [8.8 * k, -1.4 * k]], C.acier, false, t); P.poly([[6.6 * k, 1.6 * k], [10.4 * k, 4.4 * k], [8.8 * k, 1.4 * k]], C.acier, false, t); };
  R('ACT_001', P => { P.rect(5, 12, 6, 4, '#7a7488'); P.etoile(8, 7, 3.6, 1.6, 5, -90, C.or); fleches(P, 8, 7, 6.2, '#8ac4ff'); }); // réécriture : relance du piédestal
  R('ACT_002', P => { const pale = { peau: '#e0d4ea', cheveux: '#8a80a0', plaque: '#c8c8d8', bandeau: '#6a78a8' }; miniTete(P, 0, 8, pale); miniTete(P, 8, 8, pale); miniTete(P, 4, 2); }); // multi-clonage : deux copies
  R('ACT_003', P => { // Chidori : la foudre dans la main
    P.gant(8, 11.6, { c: C.peau }); P.disque(8, 6, 4.4, '#8ad0ff'); P.disque(8, 6, 2.6, '#e0f6ff', true);
    for (const [x0, y0, x1, y1] of [[4, 4, 0, 2], [12, 4, 15, 1], [3, 8, 0, 10], [13, 8, 16, 9], [8, 1, 7, 0]]) P.ligne(x0, y0, x1, y1, '#bfe8ff', true);
  });
  R('ACT_004', P => { P.rect(0, 13, 16, 3, '#7a6a5a'); P.ligne(8, 13, 4, 16, C.noir, true); P.ligne(8, 13, 12, 16, C.noir, true); P.poing(8, 6, { c: C.peau, manche: '#f0a0c0' }); P.px(2, 2, '#f0a0c0', true); P.px(14, 3, '#f0a0c0', true); }); // Ōkashō
  R('ACT_006', P => { miniChien(P, 0, 1, '#c8a070', '#7a5a3a'); miniChien(P, 9, 1, '#f0ece4', '#fffaf2'); miniChien(P, 4, 8, '#7a7488', '#c8c0d0'); }); // les chiens ninja
  R('ACT_007', P => { P.porte(8, 8, { c: '#5ac04a' }); P.badge('un', C.vertC); }); // porte de l'Ouverture (première porte)
  R('ACT_008', P => { // huit trigrammes
    P.disque(8, 8, 3.4, '#e8f2ff'); P.arc(8, 8, 2, 0, 270, 1, '#6aa8e8', true);
    for (let i = 0; i < 8; i++) { const a = i * 45 * DEG, x = 8 + Math.cos(a) * 6, y = 8 + Math.sin(a) * 6; for (let k = -1; k <= 1; k++) P.px(x - 0.5 + Math.cos(a) * k, y - 0.5 + Math.sin(a) * k, i % 2 ? '#8ab8e8' : '#c8e0ff'); }
  });
  R('ACT_009', P => { // trois ombres qui saisissent
    P.ellipse(8, 13.5, 4.6, 2, '#2a2234');
    for (const [x, y] of [[2, 3], [8, 1], [14, 3]]) { P.trait(8, 13, x, y + 2, 1.4, '#2a2234'); P.disque(x + 0.5, y + 1.5, 1.6, '#3a3048'); }
  });
  R('ACT_010', P => { P.poing(8, 7, { c: C.sable }); for (const [x, y] of [[4, 4], [9, 6], [6, 9], [11, 3]]) P.px(x, y, C.sableF, true); for (const [x, y] of [[1, 13], [14, 12], [3, 15], [12, 15], [8, 14]]) P.px(x, y, C.rouge); }); // cercueil de sable : le sable écrase
  R('ACT_011', P => { // Kuroari : la cage se referme, les lames transpercent
    P.ellipse(8, 8, 7, 7.2, '#2a2630'); P.ellipse(8, 8, 4.4, 5, '#4a1a28', true); P.disque(8, 8.6, 2, '#c8484a');
    for (const [x0, y0, x1, y1] of [[3, 4, 6, 7], [13, 4, 10, 7], [3, 13, 6, 10], [13, 13, 10, 10]]) P.ligne(x0, y0, x1, y1, C.acierC, true);
  });
  R('ACT_012', P => { // deux vrilles qui se croisent
    const vrille = (x0, y0, x1, y1) => { for (let k = 0; k <= 6; k++) { const t = k / 6, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; P.disque(x, y, 2.6 * (1 - t * 0.7), k % 2 ? '#c8c4d4' : '#8a8498'); } };
    vrille(2, 2, 14, 14); vrille(14, 2, 2, 14);
  });
  R('ACT_013', P => { for (let i = 0; i < 16; i++) { const a = i * 22.5 * DEG; P.ligne(8 + Math.cos(a) * 2.6, 8 + Math.sin(a) * 2.6, 8 + Math.cos(a) * 7.4, 8 + Math.sin(a) * 7.4, i % 2 ? C.acierC : '#c890ff', true); } P.disque(8, 8, 1.8, '#9a4ad0'); }); // pluie de senbon empoisonnés
  R('ACT_014', P => { // fils de Jiongu
    for (const [x, y] of [[1, 2], [14, 1], [0, 12], [15, 13], [8, 0]]) P.trait(8, 8, x, y, 1, '#2a2a34');
    P.disque(8, 8, 3, '#3a3040'); P.ligne(6, 7, 10, 9, '#8a7a6a', true); P.piece(14, 2, 1.6); P.coeur(1.5, 12.5, 1.6, C.rouge, { reflet: false });
  });
  R('ACT_015', P => { P.rouleau(1, 10, 14, 4); fumee(P, 9, 4.4, '#d0ccd8'); P.buche(6, 5, { c: '#c09060' }); }); // parchemin de substitution
  R('ACT_016', P => { fumee(P, 3, 13, '#d8d0c0'); fumee(P, 13, 13, '#d8d0c0'); P.crapaud(8, 7, { c: '#b04a2a', ventre: '#f0c890' }); P.rect(4, 8, 8, 2, '#3a5a9a', true); }); // grand crapaud
  R('ACT_017', P => { P.flamme(3, 16, 9, { couleurs: ['#1a1024', '#4a2a5a', null] }); P.flamme(13, 16, 9, { couleurs: ['#1a1024', '#4a2a5a', null] }); P.oeil(8, 6, 7, 4.2, { type: 'mangekyo' }); P.px(4, 10, C.sang, true); P.px(4, 11, C.sang, true); }); // Amaterasu
  R('ACT_018', P => { P.disque(8, 8, 7, '#c81a2a'); P.disque(6, 6, 2.6, '#e84a4a', true); for (const a of [-90, 30, 150]) { const x = 8 + Math.cos(a * DEG) * 3.4, y = 8 + Math.sin(a * DEG) * 3.4; P.disque(x, y, 1.4, C.noir, true); P.arc(8, 8, 3.6, a + 15, a + 60, 1, C.noir, true); } P.disque(8, 8, 1.4, C.noir, true); }); // Tsukuyomi : lune rouge
  R('ACT_019', P => { P.disque(8, 8, 2.4, '#f0e0ff'); P.anneau(8, 8, 5, 1, '#c8b0ff', true); for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) P.poly([[8 + dx * 7.6, 8 + dy * 7.6], [8 + dx * 4.6, 8 + dy * 6.6], [8 + dx * 6.6, 8 + dy * 4.6]], '#e8dcff'); }); // répulsion divine
  R('ACT_020', P => { P.disque(8, 8, 3.4, '#1a1424'); P.anneau(8, 8, 3.4, 1, '#8a6ac8', true); for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) P.poly([[8 + dx * 4.4, 8 + dy * 4.4], [8 + dx * 7.6, 8 + dy * 5.4], [8 + dx * 5.4, 8 + dy * 7.6]], '#c8b0ff'); }); // attraction céleste
  R('ACT_021', P => { P.disque(8, 8, 7.2, '#3a2a5a'); for (let i = 0; i < 3; i++) P.arc(8, 8, 6.2 - i * 2, i * 70, i * 70 + 240, 1.2, '#b090ff', true); P.disque(8, 8, 1.2, C.noir, true); }); // espace-temps : tourbillon
  R('ACT_022', P => { // flacon de pilules du soldat
    P.rect(4, 4, 8, 10, '#c8e0e8'); P.rect(5, 2, 6, 2, C.boisF); P.rect(5, 6, 6, 1, '#e8f6fa', true);
    for (const [x, y] of [[6, 9], [9, 10], [7, 12], [10, 12.6]]) P.disque(x, y, 1.3, '#a87a4a', true); P.disque(13.4, 14, 1.4, '#a87a4a');
  });
  R('ACT_023', P => { P.rouleau(1, 4, 14, 8); P.anneau(8, 8, 3, 1.2, '#3a7ae0', true); P.poly([[10, 5], [12, 7], [9.6, 7.6]], '#3a7ae0', true); }); // parchemin de téléportation
  R('ACT_024', P => { P.orbe(8, 8, 4.2, { bras: 2 }); for (const a of [10, 100, 190, 280]) P.poly([[8 + Math.cos(a * DEG) * 3.6, 8 + Math.sin(a * DEG) * 3.6], [8 + Math.cos((a + 22) * DEG) * 7.8, 8 + Math.sin((a + 22) * DEG) * 7.8], [8 + Math.cos((a + 55) * DEG) * 4, 8 + Math.sin((a + 55) * DEG) * 4]], '#eaf6ff'); }); // Rasenshuriken
  R('ACT_025', P => { // dragon de feu
    P.flamme(4, 16, 9, { couleurs: [C.rouge, C.orange, C.or] });
    P.ellipse(9, 7, 5, 3.6, C.orange); P.poly([[12, 5], [16, 7], [12, 10]], C.orange); P.poly([[6, 4], [5, 0], [8, 3.6]], C.rouge); P.poly([[10, 4], [11, 0], [12, 4.4]], C.rouge);
    P.px(9, 6, C.or, true); P.rect(12, 8, 3, 1, C.rougeF, true);
  });
  R('ACT_026', P => { // forêt naissante
    P.rect(0, 14, 16, 2, '#5a4030');
    for (const [x, h, r] of [[3, 7, 2.6], [8, 10, 3.4], [13, 6, 2.4]]) { P.rect(x - 0.5, 14 - h * 0.6, 2, h * 0.6, C.bois); P.disque(x + 0.5, 14 - h * 0.7, r, C.feuille); }
  });
  R('ACT_027', P => { P.disque(8, 9, 5.6, '#c8484a'); P.px(6, 8, C.noir, true); P.px(10, 8, C.noir, true); P.etiquette(6, 3, 4, 8, { encre: C.encre }); P.chaine([[1, 14], [3, 13], [5, 14]]); P.chaine([[11, 14], [13, 13], [15, 14]]); }); // sceau de scellement
  R('ACT_028', P => { P.sceau(8, 9, 6.6, { c: '#3a2a5a', spirale: false }); fumee(P, 8, 5, '#d8d0e8'); P.disque(8, 10, 1.6, '#7a5a3a'); for (const [x, y] of [[6, 8], [8, 7.4], [10, 8]]) P.disque(x, y, 0.8, '#7a5a3a'); }); // invocation inversée
  R('ACT_029', P => { // transfert d'esprit
    P.disque(12, 5, 3, C.peau); P.rect(9, 2, 6, 2, '#e8c040');
    P.forme((x, y) => Math.abs(y - 10 - Math.sin(x * 0.9) * 1.6) < 1.2 && x < 10, '#f0a0d0'); P.disque(2.5, 11, 2.2, '#f0a0d0'); P.px(2, 10, C.blanc, true);
  });
  R('ACT_030', P => { // lotus primaire : l'ennemi enserré de bandages, projeté au sol
    P.ellipse(8, 7, 3.4, 6.4, '#4a3a5a'); for (let k = 0; k < 4; k++) P.trait(4, 3 + k * 3, 12, 1 + k * 3, 1.2, C.blanc);
    P.poly([[5, 13], [11, 13], [8, 16]], '#5ac04a'); P.rect(0, 15, 16, 1, '#7a6a5a');
  });
  R('ACT_031', P => { P.sceau(8, 8, 7.2, { c: '#6a3aa8', spirale: false }); fleches(P, 8, 8, 4, '#c49aff'); }); // rituel de permutation
  R('ACT_032', P => { P.disque(8, 8, 7, '#e8e0f0'); P.arc(8, 8, 4.6, 0, 280, 1, '#8a5ac8', true); P.arc(8, 8, 2.4, 90, 400, 1, '#8a5ac8', true); P.rect(8, 3, 1, 5, C.noir, true); P.rect(8, 8, 4, 1, C.noir, true); P.badge('pause', '#c49aff'); }); // temps suspendu
  R('ACT_033', P => { P.sablier(9, 8, { sable: '#8ae0ff' }); for (const [x, y, l] of [[0, 4, 3], [0, 8, 4], [0, 12, 3]]) P.rect(x, y, l, 1, '#c0f0e0', true); }); // sablier du courant
  R('ACT_034', P => { fumee(P, 4, 10, '#d8d4e0'); P.feuille(3, 5, 6, 1, { large: 1.4 }); for (const [x, y, l] of [[8, 5, 7], [9, 8, 6], [8, 11, 7]]) P.rect(x, y, l, 1, '#c0e0ff', true); P.poly([[13, 6], [16, 8.5], [13, 11]], '#c0e0ff'); }); // Shunshin
  R('ACT_035', P => { P.gant(8, 10, { c: '#c8b8d8' }); P.disque(8, 10.6, 1.6, '#9a7ad8', true); for (const [x, y] of [[2, 2], [8, 1], [14, 3]]) { P.disque(x + 0.5, y + 0.5, 1.4, '#a07ae8'); P.ligne(x, y + 2, (x + 8) / 2, y + 4, '#c8b0ff', true); } }); // chemin Preta
  R('ACT_036', P => { P.etoile(8, 9, 7.6, 3.4, 10, 0, C.orange); P.etoile(8, 9, 5, 2.6, 10, 18, C.or); miniTete(P, 4, 1); }); // clones explosifs
  R('ACT_037', P => { kunaiTrident(P, 3, 13, -45, { marque: C.encre }); P.eclair([[13, 0], [16, 0], [14, 3], [16, 3], [11, 8], [12.4, 4], [11, 4]], C.or); }); // marque du dieu du tonnerre
  R('ACT_038', P => { for (const x of [3, 8, 13]) { P.ellipse(x + 0.5, 14, 2.2, 1, '#c8484a'); P.ellipse(x + 0.5, 14, 1.2, 0.5, null); } P.kunai(3.5, 1, 90, { k: 0.66 }); P.kunai(8.5, 0, 90, { k: 0.66 }); P.kunai(13.5, 1.6, 90, { k: 0.6 }); }); // pluie de kunai
  R('ACT_039', P => { // rempart de Susanoo : côtes spectrales
    P.rect(7, 1, 2, 14, '#a07ae8');
    for (let k = 0; k < 4; k++) { P.arc(8, 4 + k * 3.2, 6.4 - k * 0.6, 200, 340, 1.6, '#c49aff'); }
    P.forme((x, y) => y > 0 && y < 16 && Math.abs(x - 8) < 7, null, true); P.rect(7, 1, 2, 14, '#a07ae8'); for (let k = 0; k < 4; k++) { P.arc(8, 6 + k * 3, 6.4 - k * 0.5, 190, 350, 1.6, '#c49aff'); P.arc(8, 6 + k * 3, 6.4 - k * 0.5, 190, 350, 0.6, '#ecdcff', true); }
  });
  R('ACT_050', P => { P.anneau(8, 8, 7.4, 1.6, '#6ab8ff'); P.anneau(8, 8, 4.6, 1, '#c8ecff', true); fumee(P, 8, 8.6, '#d8d4e0'); }); // relais : le clone éclate
  // ── Talismans : l'objet lui-même ──
  R('TAL_001', P => { P.piece(7, 9, 5.4); P.ligne(1, 2, 13, 14, C.acierC); P.px(0, 1, C.acierF); P.trait(9, 6, 12, 3, 1, C.rouge, true); P.trait(4, 12, 2, 15, 1, C.rouge, true); }); // Ryō cousu
  R('TAL_002', P => { P.ligne(3, 14, 13, 4, C.or); P.ligne(4, 14, 14, 4, C.orF); for (const a of [0, 72, 144, 216, 288]) P.disque(12.5 + Math.cos(a * DEG) * 2, 3.5 + Math.sin(a * DEG) * 2, 1.4, '#f4a0c8'); P.disque(12.5, 3.5, 1, C.or); P.px(2, 15, '#3a2a5a'); }); // épingle à cheveux
  R('TAL_003', P => { P.rect(4, 2, 8, 13, '#3a6ad8'); P.rect(6, 0, 4, 2, C.acier); P.rect(5, 4, 6, 9, '#8ac4ff', true); P.eclair([[8, 4], [10, 4], [8.6, 7.6], [10, 7.6], [7, 12], [7.6, 8.6], [6.4, 8.6]], C.or); }); // pile de chakra
  R('TAL_004', P => { for (let i = 0; i < 12; i++) { const a = i * 30 * DEG; P.disque(8 + Math.cos(a) * 5.4, 7 + Math.sin(a) * 5.4, 1.3, i % 4 ? '#8a5a3a' : '#e8e0c0'); } P.trait(8, 12, 8, 15, 1.6, C.rouge); }); // perles du moine
  R('TAL_005', P => { P.trait(2, 14, 12, 1, 1.4, C.boisC); P.trait(5, 15, 14, 3, 1.4, C.bois); P.arc(9, 9, 3, 0, 180, 1, '#ffe8a0', true); P.arc(10, 8, 2.4, 0, 180, 1, '#ffe8a0', true); }); // baguettes d'Ichiraku
  R('TAL_006', P => P.masque(8, 9, { c: '#c8302a', cornes: '#f0e8d0', yeux: C.or, bouche: C.blanc })); // masque d'oni
  R('TAL_007', P => { P.etiquette(4, 1, 8, 14, { encre: C.rouge }); P.anneau(8, 8, 7.6, 1, '#8ac4ff', true); }); // talisman de protection
  R('TAL_008', P => { P.trait(1, 11, 12, 4, 3.4, '#5a5a68'); P.trait(12, 4, 15, 9, 1.4, '#5a5a68'); P.trait(12, 4, 14, 12, 1.4, '#5a5a68'); P.poly([[3, 7], [9, 3], [11, 7], [5, 11]], C.acier); P.trait(3, 10, 10, 4, 1.2, C.noir, true); P.px(4, 8, C.acierC, true); }); // bandeau rayé : le bandeau des déserteurs
  R('TAL_009', P => { P.cloche(6, 9, { c: '#c8ccd8' }); P.arc(9, 8, 4, 300, 60, 1, C.blanc, true); P.arc(9, 8, 6.4, 305, 55, 1, C.blanc, true); }); // grelot du flair
  R('TAL_010', P => { P.gant(8, 11, { c: C.peau }); P.ellipse(8, 7, 4.6, 2.6, C.sable); for (const [x, y] of [[6, 6], [9, 7], [10, 5]]) P.px(x, y, C.sableF, true); }); // poignée de sable
  R('TAL_011', P => { P.trait(3, 12, 8, 8, 2, C.boisF); etincelle(P, 9, 7, C.orC); P.etoile(9.5, 6.5, 3.4, 1.2, 6, 0, C.orange); P.badge('haut', C.orC); }); // mèche courte
  R('TAL_012', P => { P.disque(7, 9, 5.4, C.bois); for (let r = 4.4; r > 0.8; r -= 1.6) P.anneau(7, 9, r, 0.7, C.boisF, true); P.trait(12, 9, 14, 4, 1.2, C.boisF); etincelle(P, 14, 3); }); // mèche longue (bobine)
  R('TAL_013', P => { P.anneau(8, 2.6, 1.8, 1, C.or); P.coeur(8, 9, 6, C.or); P.coeur(8, 9, 4.4, C.rouge); }); // charme du plein
  R('TAL_014', P => P.gourde(8, 8, { c: '#c89a5a', lien: C.rouge })); // gourde de saké
  R('TAL_015', P => { P.anneau(8, 10, 5, 1.8, '#c8c8d8'); P.ellipse(8, 4.6, 3.4, 2.6, '#c8283a'); P.px(7, 4, '#ff9a9a', true); }); // bague de l'organisation
  R('TAL_016', P => { P.plume(3, 14, 13, 2, { c: '#a8b8c8' }); for (const [x, y] of [[2, 3], [5, 1], [13, 9], [10, 13]]) P.goutte(x, y + 1, 0.9, '#6aa8e8', { reflet: false }); }); // plume de la pluie
  R('TAL_017', P => { P.poly([[8, 1], [15, 6], [12, 15], [4, 15], [1, 6]], '#4a7ab0'); for (const y of [6, 9, 12]) P.arc(8, y + 6, 6, 230, 310, 1, '#8ab8e8', true); }); // écaille de requin
  R('TAL_018', P => { P.gant(6, 9, { c: '#8a5a3a', manchette: '#5a3a24' }); P.kunai(9, 12, -60, { k: 0.5 }); }); // gant d'armurière
  R('TAL_019', P => { P.disque(5, 8, 4.4, C.blanc); P.anneau(5, 8, 2.6, 0.8, '#d8d0c0', true); P.disque(5, 8, 1, '#c8c0b0', true); P.poly([[7, 11], [15, 9], [15, 12], [7, 12.6]], '#f0ece4'); }); // bandage de lutteur
  R('TAL_020', P => { P.rect(0, 6, 16, 2, C.noir); P.disque(4.4, 8.4, 3.6, '#1a1a24'); P.disque(11.6, 8.4, 3.6, '#1a1a24'); P.px(3, 7, '#6a6a8a', true); P.px(10, 7, '#6a6a8a', true); }); // lunettes noires
  R('TAL_021', P => { P.trait(8, 9, 8, 15, 1.4, C.vert); P.feuille(8, 13, 3, 11, { large: 1.4 }); for (let i = 0; i < 5; i++) { const a = (i * 72 - 90) * DEG; P.disque(8 + Math.cos(a) * 3, 6 + Math.sin(a) * 3, 2.2, '#f080b0'); } P.disque(8, 6, 1.6, C.or); }); // fleur de la boutique
  R('TAL_022', P => { P.disque(8, 8, 7, '#c8283a'); for (let i = 0; i < 8; i++) { const a = i * 45 * DEG; P.disque(8 + Math.cos(a) * 6, 8 + Math.sin(a) * 6, 1, C.blanc, true); } P.disque(8, 8, 3.6, C.or, true); P.etoile(8, 8, 2.4, 1, 5, -90, '#fff0a0', true); }); // jeton de tripot
  R('TAL_023', P => { P.poly([[3, 2], [13, 2], [8, 15]], C.os); P.poly([[5, 3], [8, 3], [7, 10]], '#fffaf0', true); P.rect(3, 1, 10, 2, '#e8c8b8'); }); // dent de requin
  R('TAL_024', P => { P.kunai(3, 13, -45, { lame: '#a8603a' }); for (const [x, y] of [[9, 7], [11, 5], [10, 7]]) P.px(x, y, '#6a3a1a', true); }); // kunai rouillé
  R('TAL_025', P => { P.arc(8, 1, 7, 30, 150, 2, '#f080b0'); P.cloche(8, 10, { c: C.or }); P.rect(5, 9, 6, 1, C.orF, true); }); // clochette du chat
  R('TAL_026', P => { P.ellipse(8, 12, 4, 3, '#8a5a32'); P.trait(8, 9, 8, 4, 1.2, C.vert); P.feuille(8, 5, 3, 2, { large: 1.6 }); P.feuille(8, 5, 13, 2, { large: 1.6 }); }); // graine de bois
  R('TAL_027', P => { P.sceau(8, 8, 7.2, { c: '#3a7ae0', croix: false }); P.goutte(8, 9, 3, C.bleu); }); // sceau d'eau
  R('TAL_028', P => { P.rect(1, 5, 14, 7, '#5a5a66'); for (const x of [3, 7, 11]) P.rect(x, 5, 2, 7, '#7a7a88', true); P.rect(0, 7, 16, 3, '#3a3a44', true); P.rect(13, 7, 2, 3, C.acier, true); }); // poids d'entraînement
  R('TAL_029', P => { P.forme((x, y) => { const d = Math.hypot(x - 2, y - 14); return d < 13 && d > 5.6 && x > 2 && y < 14 && Math.hypot(x - 14, y - 2) > 3; }, '#f6f0e4'); P.arc(2, 14, 9.4, 290, 350, 1, '#d8ccb4', true); }); // pétale de papier tranchant
  R('TAL_030', P => { for (const dx of [-2, 0, 2]) P.forme((x, y) => y > 1 && y < 15 && Math.abs(x - 8 - dx - Math.sin(y * 0.6 + dx) * 1.6) < 0.9, '#f0f0f4'); P.rect(5, 7, 6, 2, C.rouge); }); // mèche de cheveux blancs
  R('TAL_031', P => { P.rect(2, 10, 12, 5, '#5a5a66'); P.ellipse(8, 12, 4, 1.4, '#1a1a2a', true); P.poly([[9, 1], [13, 3], [9, 11], [5, 9]], '#1a1a2a'); P.ligne(9, 3, 7, 8, C.or, true); }); // encre sèche
  R('TAL_032', P => { P.poly([[4, 0], [7, 0], [8, 6], [6, 6]], '#3a6ad8'); P.poly([[12, 0], [9, 0], [8, 6], [10, 6]], C.rouge); P.disque(8, 10.4, 4.6, C.or); P.disque(8, 10.4, 3, '#f8e070', true); P.etoile(8, 10.4, 2.2, 1, 5, -90, C.orF, true); }); // médaille de l'examen
  R('TAL_033', P => { P.rect(4, 4, 8, 11, '#c8283a'); P.rect(5, 6, 6, 1, C.or, true); P.rect(7, 8, 2, 5, C.or, true); P.disque(8, 3, 1.8, C.or); P.trait(7, 1, 5, 0, 1, C.or); P.trait(9, 1, 11, 0, 1, C.or); }); // omamori
  R('TAL_034', P => { P.ellipse(8, 9, 7, 6.4, C.peau); P.arc(8, 9, 3.6, 0, 300, 1.2, C.rouge, true); P.arc(8, 9, 1.6, 120, 420, 1, C.rouge, true); P.rect(1, 2, 14, 2, '#3a3a44'); }); // tatouage de l'ANBU
  R('TAL_035', P => P.masque(8, 9, { c: C.blanc, oreilles: true, marques: '#3a6ad8', yeux: C.noir })); // masque de chat

  // ── Consommables : rouleau (ou sceau) et son pictogramme ──
  const rp = (P, coul) => { P.rect(2, 3, 12, 10, C.papier); P.rect(0, 2, 3, 12, coul); P.rect(13, 2, 3, 12, coul); P.rect(1, 1, 1, 14, nuancer(coul, 0.7)); P.rect(14, 1, 1, 14, nuancer(coul, 0.7)); };
  const sp = (P, coul) => { P.disque(8, 8, 7.6, '#4a4458'); P.anneau(8, 8, 7.6, 1.4, coul); P.disque(8, 8, 5.6, '#5a5468', true); };
  R('CON_001', P => { rp(P, '#8a7ab0'); P.incruster(Q => { Q.arc(8, 8, 3, 180, 450, 1.4, '#3a6ad8', true); Q.poly([[3.4, 7], [6.6, 7], [5, 10]], '#3a6ad8', true); }); }); // retour
  R('CON_002', P => { rp(P, '#6a5a4a'); P.incruster(Q => { Q.rect(4, 4, 8, 1, C.bois, true); for (const x of [5, 8, 11]) Q.rect(x, 5, 1, 4, '#8a7a9a', true); Q.disque(8, 10.6, 1.6, '#c8484a', true); }); }); // marionnettiste : guidage
  R('CON_003', P => { rp(P, '#2a2238'); P.incruster(Q => { Q.ellipse(8, 10.6, 4, 1.2, '#2a2234', true); Q.trait(8, 10, 8, 5, 1.2, '#2a2234', true); Q.disque(8, 4.6, 1.2, '#2a2234', true); }); }); // ombre
  R('CON_004', P => { rp(P, '#c83a2a'); P.incruster(Q => { Q.poly([[2.6, 10], [13.4, 10], [8, 4]], '#d8c090', true); Q.poly([[5.6, 7.4], [10.4, 7.4], [8, 4]], C.rouge, true); Q.rect(3, 9, 10, 1, '#8a6a3a', true); }); }); // chef de village : le chapeau
  R('CON_005', P => { rp(P, '#5a1a1a'); P.incruster(Q => { Q.rect(5, 4, 6, 8, '#8a1a24', true); Q.rect(6, 5, 4, 7, '#2a1018', true); Q.px(7, 7, C.os, true); Q.px(8, 7, C.os, true); Q.px(7, 8, C.os, true); Q.px(8, 8, C.os, true); }); }); // escorte : porte du boss
  R('CON_006', P => { rp(P, '#4a8ae8'); P.incruster(Q => { Q.coeur(8, 8, 3.6, '#4a8ae8'); }); }); // soin : protection
  R('CON_007', P => { rp(P, '#c8a060'); P.incruster(Q => { Q.forme((x, y) => y >= 7 && y <= 11 && Math.abs(x - 8) <= 4.5 - (y - 7) * 0.7, '#c83a2a', true); Q.rect(4, 6, 8, 1, '#f0c060', true); Q.ligne(9, 2, 11, 6, C.bois, true); }); }); // ramen
  R('CON_008', P => { rp(P, '#3c9a3c'); P.incruster(Q => { Q.flamme(8, 12, 8, { couleurs: ['#2a8a2a', '#5ad04a', '#c8ff9a'] }); }); }); // jeunesse
  R('CON_009', P => { rp(P, '#c8c0a0'); P.incruster(Q => { Q.rect(7, 4, 2, 8, C.bois, true); Q.rect(3, 5, 10, 1, C.bois, true); Q.ellipse(4, 9, 2, 1, C.or, true); Q.ellipse(12, 9, 2, 1, C.or, true); Q.ligne(3, 6, 3, 8, C.boisF, true); Q.ligne(13, 6, 13, 8, C.boisF, true); }); }); // équilibre : balance
  R('CON_010', P => { rp(P, '#e0d070'); P.incruster(Q => { for (let k = 0; k < 3; k++) Q.ellipse(8, 10.4 - k * 1.8, 3, 1.1, k % 2 ? C.orF : C.or, true); Q.ellipse(8, 5, 3, 1.1, C.orC, true); }); }); // colporteur : pile de pièces
  R('CON_011', P => { rp(P, '#c83a2a'); P.incruster(Q => { Q.rect(4, 5, 5, 5, C.blanc, true); Q.rect(9, 7, 4, 4, '#f0ece4', true); Q.px(5, 6, C.rouge, true); Q.px(7, 8, C.rouge, true); Q.px(10, 8, C.noir, true); Q.px(11, 9, C.noir, true); }); }); // tripot : dés
  R('CON_012', P => { rp(P, '#e05a2a'); P.incruster(Q => { Q.rect(4, 5, 8, 5, '#e05a2a', true); for (const x of [5, 7, 9]) Q.px(x, 5, '#8a2a1a', true); Q.rect(5, 10, 5, 2, '#e05a2a', true); }); }); // force : poing
  R('CON_013', P => { rp(P, '#e0e8ff'); P.incruster(Q => { Q.poly([[4, 10], [12, 4], [11, 8], [8, 10]], '#9ab0e0', true); Q.ligne(5, 10, 11, 6, '#6a80c0', true); }); }); // lévitation : aile
  R('CON_014', P => { rp(P, '#1c1420'); P.incruster(Q => { Q.rect(3, 4, 10, 8, '#3a3444', true); Q.disque(8, 7, 3, C.os, true); Q.rect(6, 9, 4, 2, C.os, true); Q.px(7, 7, C.noir, true); Q.px(9, 7, C.noir, true); }); }); // funeste : crâne
  R('CON_015', P => { rp(P, '#8a1a2a'); P.incruster(Q => { Q.rect(4, 10, 8, 2, '#6a5a5a', true); Q.goutte(8, 7.6, 2.2, C.sang); }); }); // autel : sang
  R('CON_016', P => { rp(P, '#6a2a8a'); P.incruster(Q => { Q.ligne(4, 4, 11, 11, '#8a3ac0', true); Q.ligne(11, 4, 4, 11, '#8a3ac0', true); Q.anneau(8, 8, 4.4, 1, '#8a3ac0', true); }); }); // interdit
  R('CON_017', P => { rp(P, '#c82a2a'); P.incruster(Q => { Q.etoile(8, 8, 4.6, 2, 8, 0, C.orange, true); Q.disque(8, 8, 1.6, C.or, true); }); }); // explosif
  R('CON_018', P => { rp(P, '#f0c040'); P.incruster(Q => { Q.etoile(8, 8, 4.4, 1.8, 5, -90, C.or, true); }); }); // héritage : étoile d'or
  R('CON_019', P => { rp(P, '#a090a0'); P.incruster(Q => { Q.rect(3, 4, 10, 8, '#2a2a4a', true); Q.disque(8, 8, 3.4, '#f0e6b0', true); Q.disque(10, 6.6, 2.8, '#2a2a4a', true); Q.px(4, 5, C.blanc, true); Q.px(11, 10, C.blanc, true); }); }); // lune
  R('CON_020', P => { rp(P, '#f0d060'); P.incruster(Q => { Q.disque(8, 8, 2.4, C.or, true); for (let i = 0; i < 8; i++) { const a = i * 45 * DEG; Q.px(8 + Math.cos(a) * 4, 8 + Math.sin(a) * 4, C.orange, true); } }); }); // soleil
  R('CON_021', P => { rp(P, '#8a7a6a'); P.incruster(Q => { Q.poly([[3, 8], [13, 8], [8, 4]], '#c8a060', true); Q.rect(5, 9, 6, 2, '#8a6a4a', true); }); }); // mendiant : chapeau de paille
  R('CON_022', P => { rp(P, '#6a9a3a'); P.incruster(Q => { for (const [x, y] of [[4, 5], [7, 5], [7, 8], [10, 8], [4, 8]]) Q.rect(x, y, 2, 2, '#6a9a3a', true); }); }); // monde : le plan
  R('CON_023', P => { sp(P, '#8a7a9a'); P.incruster(Q => { Q.rocher(8, 8, 3.6, { c: '#a89a8a' }); }); }); // sceau de destruction
  R('CON_024', P => { sp(P, '#e8dcc0'); P.incruster(Q => { Q.arc(8, 8, 3, 200, 340, 1.2, '#e8dcc0', true); Q.arc(8, 8, 3, 20, 160, 1.2, '#e8dcc0', true); Q.px(11, 7, '#e8dcc0', true); Q.px(4, 9, '#e8dcc0', true); }); }); // sceau de réécriture
  R('CON_025', P => { sp(P, '#6ac8e8'); P.incruster(Q => { Q.rect(4, 4, 5, 5, '#6ac8e8', true); Q.rect(7, 7, 5, 5, '#b8ecff', true); }); }); // duplication
  R('CON_026', P => { sp(P, '#c9c2e6'); P.incruster(Q => { Q.oeil(8, 8, 4.6, 2.6, { couleur: '#7a5ac8' }); }); }); // clairvoyance
  R('CON_027', P => { sp(P, '#f6cf3e'); P.incruster(Q => { for (const x of [4.6, 8, 11.4]) { Q.disque(x, 6.4, 1.4, '#f6cf3e', true); Q.rect(Math.round(x - 1), 8, 2, 3, '#f6cf3e', true); } }); }); // multiplication
  R('CON_028', P => { sp(P, '#6a2a8a'); P.incruster(Q => { Q.trait(4, 6, 11, 6, 1, '#c49aff', true); Q.poly([[10, 4], [13, 6], [10, 8]], '#c49aff', true); Q.trait(5, 10, 12, 10, 1, '#c49aff', true); Q.poly([[6, 8], [3, 10], [6, 12]], '#c49aff', true); }); }); // permutation
  R('CON_029', P => { sp(P, '#f0f0f0'); P.incruster(Q => Q.forme((x, y) => y > 3.4 && y < 13 && Math.abs(x - 8) < 3.8 - Math.max(0, y - 8) * 0.7, '#e8eef8', true)); }); // protecteur : bouclier
  R('CON_030', P => { sp(P, '#5a4a3a'); P.incruster(Q => { for (let k = 0; k < 4; k++) Q.rect(4 + k * 2, 5 + k * 2, 8 - k * 2, 1, '#c8b090', true); Q.rect(4, 12, 8, 1, '#1a1420', true); }); }); // passage : escalier
  // ── Transformations (ensembles de trois) ──
  R('TRF_001', P => { // manteau du renard : tête de renard dans la flamme
    P.flamme(8, 16, 16, { couleurs: ['#c83a1a', '#f08a24', null], largeur: 7.4 });
    P.poly([[3, 5], [4, 1], [7, 4.6]], '#f0a040'); P.poly([[13, 5], [12, 1], [9, 4.6]], '#f0a040'); P.ellipse(8, 8.6, 5, 4, '#f0a040'); P.poly([[5, 10], [11, 10], [8, 14]], '#fff0d8');
    P.px(5, 8, C.rougeF, true); P.px(10, 8, C.rougeF, true); P.px(8, 13, C.noir, true);
  });
  R('TRF_002', P => { P.crapaud(8, 9, { c: '#7a9a4a', ventre: '#d8e0a8' }); P.rect(3, 6, 2, 2, C.orange, true); P.rect(11, 6, 2, 2, C.orange, true); P.rect(4, 6, 1, 1, C.or, true); P.rect(11, 6, 1, 1, C.or, true); }); // sage imparfait
  R('TRF_003', P => { P.lunettes(9, { verres: '#1a1a24', monture: '#6a6a7a' }); for (const [x, y] of [[2, 2], [7, 1], [12, 3], [3, 14], [9, 14], [14, 13]]) { P.ellipse(x + 0.5, y + 0.5, 1.3, 1, '#6a8a3a'); P.px(x, y - 1, '#c8e0ff', true); } }); // essaim Aburame
  R('TRF_004', P => { P.marionnette(8, 7, { c: '#7a6a5a', yeux: 2, oeil: '#e8d040' }); for (const [x0, y0, x1, y1] of [[3, 10, 0, 15], [13, 10, 16, 15], [4, 12, 3, 16], [12, 12, 13, 16]]) P.ligne(x0, y0, x1, y1, C.acierC); }); // arsenal du marionnettiste
  R('TRF_005', P => { P.oeil(4.4, 8, 4, 3, { type: 'sharingan', tomoe: 2 }); P.oeil(11.6, 8, 4, 3, { type: 'byakugan' }); P.etoile(8, 2, 2, 0.8, 4, 0, C.or); }); // résonance des yeux
  R('TRF_006', P => { for (let i = 0; i < 2; i++) P.arc(8, 9, 7.2 - i * 0.6, i * 180 + 200, i * 180 + 320, 1, C.sable, true); P.gourde(8, 8.4, { c: '#d8b880', lien: '#7a2a2a', bouchon: '#d8b880' }); P.trait(3, 4, 13, 14, 1.4, '#7a2a2a', true); }); // armure de sable : la gourde de Gaara
  R('TRF_007', P => { P.crane(8, 9, { c: '#c8b8d8', yeux: '#5a1a6a' }); P.poly([[4, 6], [1, 0], [6, 4]], '#5a2a6a'); P.poly([[12, 6], [15, 0], [10, 4]], '#5a2a6a'); }); // reliques interdites
  R('TRF_008', P => { // outils du tonnerre : lame de foudre
    P.trait(2, 14, 5, 11, 1.8, C.noir); P.rect(4, 11, 3, 1, C.or);
    P.eclair([[5, 10], [10, 3], [9, 6], [13, 1], [11, 7], [12, 6], [7, 12]], '#bfe8ff'); P.px(13, 1, C.blanc, true);
  });
  R('TRF_009', P => { P.rect(5, 1, 6, 2, C.acier); P.rect(6, 3, 4, 12, '#b8e0d0'); P.ellipse(8, 14, 2.6, 1.4, '#b8e0d0'); P.rect(6, 7, 4, 7, '#7ad0a0', true); P.serpent([[7, 13], [9, 11], [7, 9], [8, 7]], { c: '#e8e0f0', ep: 1.4, langue: false, oeil: C.rouge }); }); // corps expérimental
  R('TRF_010', P => { P.aile(7, 7, -1, { c: '#f6f0e2' }); P.aile(9, 7, 1, { c: '#f6f0e2' }); for (let i = 0; i < 5; i++) { const a = i * 72 * DEG; P.disque(8 + Math.cos(a) * 1.6, 5 + Math.sin(a) * 1.6, 1.2, '#7a5ab0'); } P.disque(8, 5, 0.8, C.or); }); // messager de papier : ailes et fleur
  R('TRF_011', P => { P.chien(8, 7, { c: '#f0ece4', museau: '#fffaf2', oreilles: '#c8b8a8' }); P.rect(0, 13, 16, 1, '#5a4a3a'); for (const x of [2, 7, 12]) { P.disque(x + 0.5, 14.5, 1, '#3a2a2a'); } }); // meute d'invocation
  R('TRF_012', P => { P.porte(8, 8, { c: '#5ac04a' }); P.anneau(8, 8, 7.6, 1, '#8af07a', true); P.badge('huit', C.vertC); }); // huit portes
  R('TRF_013', P => { P.etoile(10, 9, 6.4, 2.8, 8, 0, C.orange); P.etoile(10, 9, 3.6, 1.6, 8, 22, C.or); P.oiseau(6, 6, { c: C.argile }); }); // artiste explosif
  R('TRF_014', P => { P.masque(8, 7, { c: '#2a2834', yeux: C.rouge, marques: '#8a1a2a' }); P.trait(5, 13, 2, 16, 1.4, '#5a3a2a'); P.trait(8, 13, 8, 16, 1.4, '#5a3a2a'); P.trait(11, 13, 14, 16, 1.4, '#5a3a2a'); }); // racine de l'ANBU
  R('TRF_015', P => { // danseur du vent : le grand éventail ouvert
    P.forme((x, y) => { const d = Math.hypot(x - 8, y - 14.5), a = Math.atan2(y - 14.5, x - 8) / DEG; return d < 11.6 && d > 2.4 && a > -168 && a < -12; }, '#f0e8d8');
    for (let a = -160; a <= -20; a += 20) P.trait(8, 14.5, 8 + Math.cos(a * DEG) * 11, 14.5 + Math.sin(a * DEG) * 11, 0.7, '#8a6a4a', true);
    for (const a of [-130, -90, -50]) P.disque(8 + Math.cos(a * DEG) * 7.6, 14.5 + Math.sin(a * DEG) * 7.6, 1.6, '#7a4ab0', true);
    P.disque(8, 14.6, 1.6, C.boisF);
  });
  R('TRF_016', P => { kunaiTrident(P, 3, 13, -45); P.etoile(12.4, 3.6, 3.6, 1.2, 4, 45, '#fff27a'); P.eclair([[2, 1], [5, 1], [3.6, 3.4], [5.4, 3.4], [1.6, 7.6], [2.6, 4.4], [1, 4.4]], '#fff27a'); }); // éclair jaune
  R('TRF_017', P => { P.nuage(8, 8, { c: '#f2ecec' }); P.disque(4.8, 8.6, 1.9, '#c8283a', true); P.disque(8, 7, 2.4, '#c8283a', true); P.disque(11.4, 8.4, 2, '#c8283a', true); P.rect(4, 9, 8, 2, '#c8283a', true); }); // nuage écarlate
  R('TRF_018', P => { P.anneau(8, 8, 7.4, 1.2, '#5ae080', true); P.gant(8, 9, { c: '#9af0b0' }); P.coeur(8, 10, 2, '#2a9a4a', { reflet: false }); }); // ninja médical

  // ── Éveils : deux par personnage ──
  R('EVE_001', P => { P.flamme(8, 10, 10, { couleurs: [C.rouge, C.orange, C.or] }); P.coeur(8, 11, 4.6, C.rouge); P.px(6, 10, '#ff9a9a', true); }); // volonté du feu : le cœur qui brûle
  R('EVE_002', P => { P.oeil(8, 8, 7.4, 4.6, { type: 'sage' }); P.poly([[0, 3], [5, 4.6], [1, 6]], C.orange); P.poly([[16, 3], [11, 4.6], [15, 6]], C.orange); }); // mode ermite
  R('EVE_003', P => P.oeil(8, 8, 7.4, 4.6, { type: 'sharingan' })); // Sharingan
  R('EVE_004', P => { P.oeil(8, 8, 7.4, 4.6, { type: 'mangekyo' }); P.rect(3, 13, 1, 2, C.sang); }); // Mangekyō
  R('EVE_005', P => { P.anneau(8, 8, 7.6, 1.2, '#f080b0', true); P.poing(8, 7, { c: C.peau, manche: '#c8283a' }); P.ligne(1, 12, 3, 10, '#f080b0', true); P.ligne(13, 1, 15, 3, '#f080b0', true); }); // force centuplée
  R('EVE_006', P => { P.disque(8, 8, 7.4, C.peau); P.poly([[8, 3.6], [12, 8], [8, 12.4], [4, 8]], '#8a3ac8', true); P.poly([[8, 5.4], [10.4, 8], [8, 10.6], [5.6, 8]], '#c49aff', true); }); // sceau Byakugō
  R('EVE_007', P => { P.oeil(10, 10, 5.6, 3.6, { type: 'sharingan' }); P.forme((x, y) => y < 9 - (x - 1) * 0.5 && y > 2 - (x - 1) * 0.5, '#2a4a8a'); P.forme((x, y) => y < 8 - (x - 3) * 0.5 && y > 4 - (x - 3) * 0.5 && x > 3 && x < 11, C.acier, true); P.rect(0, 0, 2, 2, '#c8c8d0'); }); // copie parfaite : bandeau sur l'œil
  R('EVE_008', P => { P.gant(4, 11, { c: C.peau }); P.eclair([[5, 6], [11, 1], [10, 4], [15, 1], [10, 7], [11, 6], [6, 9]], '#e0f4ff'); P.ligne(6, 7, 14, 2, C.blanc, true); }); // Raikiri : lame de foudre
  R('EVE_009', P => { P.arc(8, 8, 7, 0, 300, 1.2, '#8af07a', true); for (const [x, y] of [[3, 7], [13, 7], [8, 2]]) P.feuille(8, 12, x, y, { c: '#5ac04a', large: 2, nervure: '#c8ffb0' }); P.disque(8, 11, 1.4, C.or); }); // lotus primaire (Lee)
  R('EVE_010', P => { for (const [x, y] of [[2, 12], [13, 11], [1, 6], [14, 5]]) P.disque(x + 0.5, y + 0.5, 1.6, '#b8f0a8'); P.porte(8, 9, { c: '#5ac04a' }); P.badge('six', C.vertC); }); // sixième porte : vapeur verte
  R('EVE_011', P => { P.gant(8, 9, { c: '#e8d8f0' }); for (const [x, y] of [[6, 6], [9, 5], [7, 10], [10, 9], [8, 12]]) P.px(x, y, '#3a7ae0', true); P.anneau(8, 8, 7.6, 1, '#8ac4ff', true); }); // points de chakra
  R('EVE_012', P => { P.gant(8, 9, { c: '#d8c8f0' }); for (let y = 1; y < 16; y += 3) for (let x = 1; x < 16; x += 3) if ((x - 8) ** 2 + (y - 9) ** 2 > 26) P.px(x, y, '#5a9ae8', true); P.badge('huit', '#8ac4ff'); }); // soixante-quatre paumes : la grêle de coups
  R('EVE_013', P => { P.poly([[8, 1], [13, 4], [14, 15], [2, 15], [3, 4]], '#e8c888'); P.poly([[8, 2.6], [11.6, 5], [12.4, 13.6], [3.6, 13.6], [4.4, 5]], '#f4dca8', true); P.rect(7, 6, 2, 6, C.encre, true); P.rect(5, 8, 6, 1, C.encre, true); }); // plan à long terme : pièce de shōgi
  R('EVE_014', P => { P.ellipse(8, 14, 6, 1.8, '#2a2234'); P.trait(5, 13, 6, 6, 1.6, '#2a2234'); P.gant(7, 5, { c: '#3a3048' }); }); // ombre étrangleuse : la main d'ombre
  R('EVE_015', P => { P.forme((x, y) => Math.hypot(x - 8, y - 11) < 7.4 && y < 14, C.sable); P.forme((x, y) => Math.hypot(x - 8, y - 11) < 5 && y < 14, '#2a2234', true); P.rect(0, 14, 16, 2, '#7a5a3a'); P.badge('retour', C.sable); }); // armure de sable qui se reforme
  R('EVE_016', P => { P.forme((x, y) => y > 12.4 + Math.sin(x * 0.55) * 1.4, C.sable); for (let i = 0; i < 3; i++) P.arc(8, 7, 6.4 - i * 2, i * 60 + 180, i * 60 + 360, 1.1, i % 2 ? '#e8c888' : C.sableF, true); P.disque(2.6, 9, 2, C.sable); P.disque(13.4, 4.6, 2, C.sable); }); // tempête du désert
  R('EVE_017', P => { P.sabre(2, 14, -45, { long: 12, largeur: 1.3, lame: '#c0b8d8' }); P.goutte(12, 12, 2, '#9a4ad0'); P.goutte(14.4, 7, 1.3, '#9a4ad0', { reflet: false }); }); // lames empoisonnées
  R('EVE_018', P => { P.ellipse(5, 7, 4.4, 5, '#2a2630'); P.ellipse(5, 8, 2, 2.6, '#5a1a28', true); P.ellipse(11.6, 10.6, 4.2, 3.6, '#6a7a5a'); for (const x of [10, 13]) P.rect(x, 8, 1, 6, '#4a5a3a', true); }); // Kuroari et Sanshōuo
  R('EVE_019', P => { for (let k = 0; k <= 6; k++) { const t = k / 6; P.disque(3 + t * 10, 13 - t * 10, 3.4 * (1 - t * 0.6), k % 2 ? '#c8c4d4' : '#8a8498'); } P.poly([[1, 9], [3, 15], [4, 10]], C.blanc); }); // Gatsūga : la vrille
  R('EVE_020', P => { P.poly([[3, 2], [7, 2], [5, 13]], C.os); P.poly([[9, 2], [13, 2], [11, 13]], C.os); P.goutte(11, 14, 1.3, C.sang, { reflet: false }); P.rect(2, 1, 12, 2, '#c87a7a'); }); // crocs sur crocs : les crocs qui saignent
  R('EVE_021', P => { P.rect(4, 3, 8, 11, '#7a6a5a'); P.ellipse(8, 3, 4, 1.4, '#9a8a7a'); P.coeur(8, 9, 3, C.rouge); P.etiquette(10, 1, 3, 4, { motif: false }); }); // cœur de marionnette
  R('EVE_022', P => { P.rect(2, 1, 12, 2, C.bois); for (const x of [3, 8, 13]) P.ligne(x, 3, x, 6, '#a0c8ff', true); P.disque(8, 8, 2.2, '#d8c8b8'); P.rect(6, 10, 4, 4, '#4a3a5a'); P.ligne(3, 6, 6, 11, '#d8c8b8'); P.ligne(13, 6, 10, 11, '#d8c8b8'); }); // marionnettes humaines
  R('EVE_023', P => { P.coeur(8, 8, 6, C.rouge); for (const x of [5, 8, 11]) { P.ligne(x - 1, 5, x + 1, 9, C.noir, true); } P.ligne(3, 7, 13, 7, C.noir, true); P.badge('plus', C.rougeC); }); // cœur volé (Kakuzu)
  R('EVE_024', P => { P.masque(8, 8, { c: '#e8e0d0', yeux: C.noir }); P.forme((x, y) => x < 8 && y < 8 && (x - 8) ** 2 / 29 + (y - 8) ** 2 / 41 <= 1, C.rouge, true); P.forme((x, y) => x >= 8 && y < 8 && (x - 8) ** 2 / 29 + (y - 8) ** 2 / 41 <= 1, '#5ac0e8', true); P.forme((x, y) => x < 8 && y >= 8 && (x - 8) ** 2 / 29 + (y - 8) ** 2 / 41 <= 1, C.or, true); P.forme((x, y) => x >= 8 && y >= 8 && (x - 8) ** 2 / 29 + (y - 8) ** 2 / 41 <= 1, '#9ae0a0', true); P.ellipse(5.8, 7.4, 1.3, 0.9, C.noir, true); P.ellipse(10.2, 7.4, 1.3, 0.9, C.noir, true); }); // masques élémentaires
  R('EVE_025', P => { const pale = { peau: '#e0d4ea', cheveux: '#e8b030' }; miniTete(P, 0, 0, pale); miniTete(P, 8, 0, pale); miniTete(P, 0, 8, pale); miniTete(P, 8, 8, { cheveux: '#e8b030' }); }); // clones de relais (éveil)
  R('EVE_026', P => { P.orbe(9, 9, 6.4, { bras: 3 }); miniTete(P, 0, 0, { cheveux: '#e8b030' }); }); // Rasengan des clones
  R('EVE_027', P => { P.flamme(8, 16, 15, { couleurs: ['#3a1a5a', '#6a3aa8', '#a07ae8', null], largeur: 6.6 }); P.oeil(8, 9, 4, 2.4, { type: 'sharingan', tomoe: 3 }); }); // haine canalisée
  R('EVE_028', P => { // Susanoo : le guerrier spectral
    P.ellipse(8, 9, 6.6, 6.4, '#8a5ad8'); P.poly([[3, 5], [1, 0], [6, 3]], '#8a5ad8'); P.poly([[13, 5], [15, 0], [10, 3]], '#8a5ad8');
    P.ellipse(5.4, 8, 1.6, 1, '#f0e0ff', true); P.ellipse(10.6, 8, 1.6, 1, '#f0e0ff', true); P.rect(5, 12, 6, 1, '#4a2a8a', true); P.rect(4, 14, 8, 1, '#c49aff', true);
  });
  R('EVE_029', P => { P.disque(8, 8, 7.4, C.peau); P.poly([[8, 2.6], [13.4, 8], [8, 13.4], [2.6, 8]], '#8a3ac8', true); P.poly([[8, 5], [11, 8], [8, 11], [5, 8]], '#c49aff', true); P.badge('plus', '#c49aff'); }); // sceau élargi
  R('EVE_030', P => { P.anneau(8, 8, 7.6, 1.2, '#3ac86a', true); P.anneau(8, 8, 5, 1, '#8af0a8', true); P.poly([[8, 3.6], [12, 8], [8, 12.4], [4, 8]], '#8a3ac8'); P.poly([[8, 6], [10, 8], [8, 10], [6, 8]], '#c49aff', true); }); // création renaissance : onde de soin
  R('EVE_031', P => { P.poly([[2, 5], [9, 2], [14, 5], [7, 8]], '#ecc88a'); P.poly([[2, 5], [7, 8], [7, 15], [2, 12]], C.sable); P.poly([[7, 8], [14, 5], [14, 12], [7, 15]], C.sableF); for (const [x, y] of [[4, 9], [10, 10], [8, 4]]) P.px(x, y, '#8a6a3a', true); }); // sable compact
  R('EVE_032', P => { // Shukaku : tête de tanuki de sable
    P.ellipse(8, 9, 6.6, 5.6, C.sable); P.disque(3.4, 3.6, 2.2, C.sable); P.disque(12.6, 3.6, 2.2, C.sable);
    P.ellipse(5, 8.6, 1.8, 1.8, '#f0e8c8', true); P.ellipse(11, 8.6, 1.8, 1.8, '#f0e8c8', true); P.px(5, 8, C.noir, true); P.px(11, 8, C.noir, true);
    for (const [x0, y0, x1, y1] of [[2, 11, 5, 12], [14, 11, 11, 12], [7, 4, 9, 4]]) P.ligne(x0, y0, x1, y1, '#3a5aa8', true); P.rect(6, 12, 4, 1, '#7a5a2a', true);
  });
  R('EVE_033', P => { P.marionnette(4.6, 7, { c: '#6a5a4a', yeux: 3, oeil: '#e8d040' }); P.trait(10, 8, 14, 8, 1, C.or); P.poly([[13, 6], [16, 8], [13, 10]], C.or); P.badge('eclair', C.or); }); // changement éclair
  R('EVE_034', P => { P.marionnette(4.6, 5, { c: '#6a5a4a', yeux: 3, oeil: '#e8d040' }); P.ellipse(12, 5, 3.6, 4, '#2a2630'); P.ellipse(12, 5.6, 1.6, 2, '#5a1a28', true); P.ellipse(8, 12.6, 5.4, 3, '#6a7a5a'); for (const x of [6, 10]) P.rect(x, 10, 1, 5, '#4a5a3a', true); }); // arsenal complet : trois marionnettes
  R('EVE_035', P => { for (const [x, y] of [[4, 4], [12, 4], [4, 12], [12, 12]]) P.coeur(x, y, 3, '#8a1a24', { reflet: false }); P.coeur(8, 8.4, 4, C.rouge); P.badge('plus', C.rougeC); }); // sixième cœur
  R('EVE_036', P => { P.etoile(7, 8, 6, 2.6, 5, -90, C.or); P.ligne(9, 3, 15, 15, C.acierC); P.arc(9, 9, 4, 200, 330, 1, C.noir, true); P.ligne(5, 11, 9, 9, C.noir, true); }); // reconstruction choisie : l'aiguille et le fil
  // ── Objets cachés : malédiction aveugle, pari du serpent ──
  R('?', P => { fumee(P, 8, 9, '#8a8498'); P.rect(6, 3, 4, 2, C.blanc); P.rect(9, 5, 2, 2, C.blanc); P.rect(7, 7, 2, 2, C.blanc); P.rect(7, 11, 2, 2, C.blanc); });
  R('?voile', P => { P.bourse(8, 9, { c: '#5a3a7a', lien: C.rouge }); P.rect(7, 5, 3, 1, '#f0e8ff', true); P.rect(9, 6, 1, 2, '#f0e8ff', true); P.px(8, 8, '#f0e8ff', true); P.px(8, 10, '#f0e8ff', true); P.serpent([[1, 15], [3, 13], [2, 11]], { c: '#6ab04a', ep: 1.6, langue: false }); });
})();
