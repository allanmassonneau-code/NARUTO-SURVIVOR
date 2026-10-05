// ═══════════════════════════════════════════════════════════════════════════
// Lumière et ambiance (décor pur, sans effet de jeu). Une carte de lumière est
// multipliée sur la salle : pénombre des bords teintée par thème, lumière
// d'ensemble de chaque cellule, flaques des feux, lanternes et appliques
// murales animées, halo du joueur. Viennent ensuite les éclats additifs (tirs,
// explosions, collectes) et les poussières d'air du thème. Tirs, effets et HUD
// sont dessinés après l'ombre, les télégraphes rouges émettent leur propre
// lumière : l'atmosphère ne coûte rien à la lisibilité.
// ═══════════════════════════════════════════════════════════════════════════

// amb : teinte loin de toute source ; centre : cœur d'une cellule éclairée ; lampe : appliques
// et lanternes ; applique : forme des sources murales ; air : particules d'ambiance
const AMBIANCES = {
  THM_ACA: { amb: '#7a6454', centre: '#fff4e4', lampe: '#ffae50', applique: 'torche', air: 'poussiere' },
  THM_FOR: { amb: '#566a5c', centre: '#f4ffe6', lampe: '#b4f070', applique: 'champignons', air: 'luciole' },
  THM_SUN: { amb: '#94745c', centre: '#fff6e2', lampe: '#ffb458', applique: 'torche', air: 'sable' },
  THM_MAR: { amb: '#5e5270', centre: '#f8f0ff', lampe: '#e0a0ff', applique: 'lanterne', air: 'poussiere' },
  THM_ORO: { amb: '#4a5e66', centre: '#eafbff', lampe: '#70f0d0', applique: 'tube', air: 'spore' },
  THM_KIR: { amb: '#4a5e78', centre: '#ecf6ff', lampe: '#88ccff', applique: 'lanterne', air: 'brume' },
  THM_AKA: { amb: '#54445c', centre: '#fff0f2', lampe: '#ff6a50', applique: 'bougies', air: 'braise' },
  THM_GUE: { amb: '#6a6058', centre: '#fff6ec', lampe: '#ffa458', applique: 'torche', air: 'cendre' },
  THM_MYO: { amb: '#76866a', centre: '#fffff2', lampe: '#fff0a0', applique: 'lanterne', air: 'luciole' },
  THM_BIJ: { amb: '#5e3c44', centre: '#ffeae6', lampe: '#ff5a3a', applique: 'sceau', air: 'braise' },
};
const _ambiances = {};
function ambiance(th) {
  if (_ambiances[th]) return _ambiances[th];
  const A = Object.assign({}, AMBIANCES[th] || AMBIANCES.THM_ACA); const a = hexRgb(A.amb), c = hexRgb(A.centre);
  A.ciel = rgbHex(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
  return (_ambiances[th] = A);
}
const eclairageActif = () => !G.reglages || G.reglages.eclairage !== false;

// Halo radial pré-rendu par paliers (16, 32, 64, 128 px) puis étiré à la taille voulue : réduire
// un grand halo avec lissage coûte cher en rendu logiciel. « Plateau » éclaire largement une
// cellule, le halo simple décroît vite autour d'une source.
const _halos = new Map();
function halo(couleur, plateau, d = 128) {
  const t = d <= 20 ? 16 : d <= 40 ? 32 : d <= 80 ? 64 : 128, m = t / 2;
  const k = couleur + (plateau ? '|p' : '') + '|' + t; let c = _halos.get(k); if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = t; const g = c.getContext('2d');
  const [r, v, b] = hexRgb(couleur); const gr = g.createRadialGradient(m, m, 0, m, m, m);
  for (const [o, a] of plateau ? [[0, 1], [0.3, 0.9], [0.62, 0.48], [0.85, 0.14], [1, 0]] : [[0, 1], [0.2, 0.66], [0.5, 0.24], [1, 0]]) gr.addColorStop(o, 'rgba(' + r + ',' + v + ',' + b + ',' + a + ')');
  g.fillStyle = gr; g.fillRect(0, 0, t, t); _halos.set(k, c); return c;
}

// Sources fixes relevées pendant la construction du fond (lanternes, bougies, cercles des salles)
let _lumCollecte = null;
function lumiere(x, y, r, c, a, vacille = false, eclat = 0) { if (_lumCollecte) _lumCollecte.push({ x, y, r, c, a, f: vacille, e: eclat }); }
const PORTES_LUMINEUSES = new Set(['boss', 'heritage', 'boutique', 'malediction', 'sacrifice', 'defi', 'defi_boss', 'dispositifs', 'bibliotheque', 'coffres', 'repos', 'pacte', 'sanctuaire', 'breche', 'lumiere']);
const COUL_COLLECTE = { coeur: '#ff5a6a', protection: '#70a8ff', instable: '#c080ff', condensateur: '#80e0ff', ryo: '#ffd860', cle: '#ffe488', explosif: '#ff9a50' };
const COUL_TIR = { orbe: '#7ac8ff', rasenshuriken: '#9ad8ff', poing: '#ff8ac0', paume: '#b8d8ff', sable: '#f0c070', element: '#ffb050', glace: '#9ae0ff', dragon_feu: '#ff8030', argile: '#fff0d0', papier: '#fff8e8', encre: '#8a8ad0', lame_poison: '#c080ff', kunai_ombre: '#9a88d0' };
const COUL_TIR_ENNEMI = { eau: '#4a9aff', sable_ennemi: '#e0a040', feu: '#ff6030', son: '#c0a0ff', glace_ennemie: '#8ad0ff' };
const COUL_ELEMENT = { katon: '#ff7a30', raiton: '#b0e0ff', suiton: '#60a8ff', futon: '#c8ffd8', doton: '#d8a868' };
const COUL_ZONE = { feu_allie: '#ff9040', feu_ennemi: '#c050ff', acide: '#8ae050', glace: '#bfe8ff', eau: '#5aa0e0', eau_alliee: '#5aa0e0' };
function couleurTir(p) {
  if (p.foudre) return ['#b8e4ff', 1];
  if (p.elements && p.elements.size) { const c = COUL_ELEMENT[p.elements.values().next().value]; if (c) return [c, 1]; }
  const c = COUL_TIR[p.apparence || 'kunai']; return c ? [c, 1] : ['#fff0d8', 0.4];
}

// Toutes les sources de la frame, en coordonnées de salle : { x, y, r, c, a, eclat }
const _lums = [];
function collecterLumieres(s, A) {
  const L = _lums; L.length = 0; const J = G.joueur, t = G.temps, calme = G.reglages.sansFlash || G.reglages.confort;
  const vac = i => calme ? 1 : 1 + 0.07 * Math.sin(t * 8.3 + i * 1.9) + 0.05 * Math.sin(t * 19.1 + i * 4.3);
  const aj = (x, y, r, c, a, eclat = 0, fixe = false) => { if (a > 0.01 && r > 1) L.push({ x, y, r, c, a, eclat, fixe }); };
  (s._lumieres || []).forEach((l, i) => { const v = l.f ? vac(i) : 1; aj(l.x, l.y, l.r * v, l.c, l.a * v, l.e, !l.f); });
  for (const i of s._feux || []) if (s.tuiles[i] === T.FEU) { const v = vac(i); aj((i % s.W) * TUILE + 16, ((i / s.W) | 0) * TUILE + 12, 104 * v, '#ff9a40', 0.8 * v, 0.34); }
  (s._appliques || []).forEach((p, i) => { const v = vac(i + 7); aj(p.x, p.y + 12, 120 * v, A.lampe, 0.85 * v, 0.34); });
  if (J && (J.etat !== 'mort' || G.animMort)) aj(J.x, J.y - 12, 150, '#ffe6c4', 0.5);
  for (const p of s.portes) if (p.etat !== 'secrete' && PORTES_LUMINEUSES.has(p.type)) aj(p.tx * TUILE + 16, p.ty * TUILE + 16, 64, (CADRES_PORTE[p.type] || CADRES_PORTE.normale).lum, 0.5, 0.2);
  for (const r of s.ramassables) aj(r.x, r.y - 4, 34, COUL_COLLECTE[(RAMASSABLES[r.type] || {}).cat] || '#fff0c8', 0.4, 0.24);
  for (const p of s.piedestaux) if (p.id) aj(p.x, p.y - 16, 56, '#fff0c0', 0.32 + 0.06 * Math.sin(t * 2.5 + p.x), 0.16);
  for (const x of s.sorties || []) aj(x.x, x.y, 84, '#c0e0ff', 0.5, 0.2);
  if (s.source) aj(s.source.x, s.source.y, 72, '#80f0ff', 0.45, 0.2);
  if (s.autel) aj(s.autel.x, s.autel.y - 6, 64, '#ff5040', 0.42, 0.15);
  for (const p of G.proj) {
    const k = p.taille || 1;
    if (p.proprio === 'ennemi') aj(p.x, p.y - p.z, 30 * k, COUL_TIR_ENNEMI[p.apparence] || '#ff4a8a', 0.6, 0.5);
    else { const [c, f] = couleurTir(p); aj(p.x, p.y - p.z, 26 * Math.min(2.5, k), c, 0.5 * f, 0.42 * f); }
  }
  for (const o of G.orbes) aj(o.x, o.y, o.r * 6, '#6ab8f8', 0.55, 0.4);
  // rôles lumineux : soigneurs verts, invocateurs violets, mèches des kamikazes, masques de feu, auras protectrices
  for (const e of G.ennemis) {
    if (e.mort || e.cache) continue; const d = e.def, P = d.params || {};
    if (d.comportement === 'guerisseur') aj(e.x, e.y - 10, 46, '#60f080', 0.36, 0.12);
    else if (d.comportement === 'invocateur' && !e.boss) aj(e.x, e.y - 4, 50, '#b070f0', 0.36, 0.12);
    else if (d.comportement === 'kamikaze') aj(e.x, e.y - 8, 28, '#ffb040', 0.45, 0.3);
    if (P.proj === 'feu' && d.comportement === 'tourelle') aj(e.x, e.y - 8, 56, '#ff8a30', 0.42, 0.2);
    if (P.bouclier === 'aura') aj(e.x, e.y - 8, 64, '#8ad0ff', 0.32, 0.1);
  }
  for (const f of G.faisceaux) for (const b of f.faisceaux || [f]) { const n = Math.max(1, Math.round(b.l / 40)); for (let i = 0; i <= n; i++) { const d = b.l * i / n; aj(f.x + Math.cos(b.a) * d, f.y + Math.sin(b.a) * d, 40, f.couleur && f.couleur[0] === '#' ? f.couleur : '#ffffff', 0.5, 0.3); } }
  for (const z of G.zones) { const c = COUL_ZONE[z.type]; if (c) aj(z.x, z.y, z.r * 2.2, c, 0.45, 0.12); }
  for (const e of G.effets) {
    const k = Math.min(1, e.age / e.duree);
    switch (e.type) {
      case 'explosion': aj(e.x, e.y, e.r * 3.2, '#ffa048', 1.1 * (1 - k), 0.5); break;
      case 'explosion_petite': aj(e.x, e.y, e.r * 2.6, '#ffb860', 0.8 * (1 - k), 0.4); break;
      case 'meteore': aj(e.x, e.y, e.r * 2.6, '#ff7a30', 0.8 * (1 - k), 0.4); break;
      case 'eclair': aj((e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2, 70 + dist(e.x0, e.y0, e.x1, e.y1) / 2, '#a8d8ff', 0.7 * (1 - k), 0.25); break;
      case 'mort_boss': aj(e.x, e.y, 220, '#fff0e0', 0.9 * (1 - k), 0.3); break;
      case 'transformation': case 'resurrection': aj(e.x, e.y, 150, '#ffe080', 0.8 * (1 - k), 0.3); break;
      case 'aura_sage': aj(e.x, e.y - 12, 72, '#ff9a30', 0.5 * (1 - k)); break;
      case 'etoile_impact': aj(e.x, e.y, 34, '#fff0c0', 0.6 * (1 - k), 0.5); break;
      case 'cercle_soin': aj(e.x, e.y, e.r * 1.6, '#60f080', 0.35); break;
      case 'cercle_sceau': aj(e.x, e.y, e.r * 1.6, '#f0e060', 0.35); break;
      case 'sceau_soin': case 'lotus': aj(e.x, e.y - 10, 52, '#90ffa0', 0.4 * (1 - k)); break;
      // les dangers éclairent en rouge : ils restent lisibles dans la pénombre
      case 'cercle_danger': aj(e.x, e.y, e.r * 1.5, '#ff3020', 0.3 + 0.35 * k); break;
      case 'frappe_sol': aj(e.x, e.y, e.r * 1.5, e.proprio === 'joueur' ? '#ffb060' : '#ff3020', 0.25 + 0.35 * k); break;
      case 'arc_danger': aj(e.x + Math.cos(e.a) * e.r * 0.5, e.y + Math.sin(e.a) * e.r * 0.5, e.r * 1.3, '#ff3020', 0.25 + 0.3 * k); break;
      case 'ligne_danger': { const n = Math.max(1, Math.round(e.l / 48)); for (let i = 0; i <= n; i++) aj(e.x + Math.cos(e.a) * e.l * i / n, e.y + Math.sin(e.a) * e.l * i / n, e.largeur * 2 + 28, '#ff3020', 0.2 + 0.3 * k); break; }
    }
  }
}

// Part fixe de la carte de lumière d'une salle (pénombre, cellules, sources immobiles), en cache
function carteLumFond(s, A) {
  const cle = G.theme + '|' + (s._lumGen || 0); if (s._carteLum && s._carteLumCle === cle) return s._carteLum;
  const c = toile(Math.ceil(s.W * TUILE / 2), Math.ceil(s.H * TUILE / 2)), o = c.getContext('2d'); o.imageSmoothingEnabled = true;
  o.fillStyle = A.amb; o.fillRect(0, 0, c.width, c.height); o.globalCompositeOperation = 'lighter';
  const ciel = halo(A.ciel, true), rx = CEL_L * TUILE * 0.66, ry = CEL_H * TUILE * 0.84;
  for (const [i, j] of FORMES[s.forme].cel) { const cx = (1 + CEL_L * (i + 0.5)) * TUILE / 2, cy = (1 + CEL_H * (j + 0.5)) * TUILE / 2; o.drawImage(ciel, cx - rx / 2, cy - ry / 2, rx, ry); }
  for (const l of s._lumieres || []) if (!l.f) { o.globalAlpha = Math.min(1, l.a); o.drawImage(halo(l.c, false, l.r), (l.x - l.r) / 2, (l.y - l.r) / 2, l.r, l.r); }
  s._carteLum = c; s._carteLumCle = cle; return c;
}
// Carte de lumière (demi-résolution, lissée) multipliée sur la vue, puis éclats additifs
let _carteLum = null;
function eclairerSalle(g, s, X, Y, ox, oy) {
  if (!eclairageActif()) return;
  const A = ambiance(G.theme); collecterLumieres(s, A);
  if (!(G.variante && (G.variante.obscurite || G.variante.brume))) {
    const c = _carteLum || (_carteLum = toile(ECRAN_L / 2, ECRAN_H / 2)); const o = c.getContext('2d'); o.imageSmoothingEnabled = true;
    o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; o.fillStyle = A.amb; o.fillRect(0, 0, c.width, c.height);
    o.drawImage(carteLumFond(s, A), Math.round((X(0) - ox) / 2), Math.round((Y(0) - oy) / 2));
    o.globalCompositeOperation = 'lighter';
    for (const l of _lums) {
      if (l.fixe) continue; const x = (X(l.x) - ox) / 2, y = (Y(l.y) - oy) / 2, r = l.r / 2;
      if (x + r < 0 || y + r < 0 || x - r > c.width || y - r > c.height) continue;
      o.globalAlpha = Math.min(1, l.a); o.drawImage(halo(l.c, false, r * 2), x - r, y - r, r * 2, r * 2);
    }
    o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';
    // multiplication limitée à la salle visible, agrandie au plus proche voisin (le dégradé est
    // assez doux pour que les pas de 2 px ne se voient pas ; le lissage coûte cher en rendu logiciel)
    const x0 = Math.max(0, X(0) - ox), y0 = Math.max(0, Y(0) - oy), x1 = Math.min(ECRAN_L, X(s.W * TUILE) - ox), y1 = Math.min(ECRAN_H, Y(s.H * TUILE) - oy);
    const sx = x0 >> 1, sy = y0 >> 1, sl = Math.ceil(x1 / 2) - sx, sh = Math.ceil(y1 / 2) - sy;
    if (sl > 0 && sh > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.imageSmoothingEnabled = false; g.drawImage(c, sx, sy, sl, sh, ox + sx * 2, oy + sy * 2, sl * 2, sh * 2); g.restore(); }
  }
  g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; const doux = G.reglages.sansFlash ? 0.5 : 1;
  for (const l of _lums) {
    if (!l.eclat) continue; const r = l.r * 0.42, x = X(l.x), y = Y(l.y);
    if (x + r < ox || y + r < oy || x - r > ox + ECRAN_L || y - r > oy + ECRAN_H) continue;
    g.globalAlpha = Math.min(1, l.a * l.eclat * doux); g.drawImage(halo(l.c, false, r * 2), x - r, y - r, r * 2, r * 2);
  }
  g.restore();
}

// ── Appliques murales : sources animées posées sur la face du mur du haut ──
function placerAppliques(s, A) {
  const L = []; if (s.type === 'cache' || s.type === 'isolee') return L;
  for (const [i, j] of FORMES[s.forme].cel) for (const dx of [2, CEL_L - 3]) {
    const tx = 1 + CEL_L * i + dx;
    for (let ty = CEL_H * j; ty < CEL_H * (j + 1); ty++) { // premier mur dont la face donne sur le sol (couloirs compris)
      const dessous = tuileA(s, tx, ty + 1); if (tuileA(s, tx, ty) !== T.MUR || dessous === T.MUR || dessous === T.VIDE || dessous === T.PORTE) continue;
      if (!s.portes.some(p => Math.abs(p.tx - tx) <= 1 && Math.abs(p.ty - ty) <= 1)) L.push({ x: tx * TUILE + 16, y: ty * TUILE + 6, type: A.applique, i: L.length });
      break;
    }
  }
  return L;
}
const FLAMMES = [
  ['..r..', '..rr.', '.rorr', '.roor', 'royor', 'roywo', 'ryywo', '.ooo.'],
  ['.r...', '.rr..', '.ror.', 'rooor', 'royyo', 'rywyo', 'rywyo', '.ooo.'],
  ['...r.', '..rr.', '.roo.', '.rooo', 'royyo', 'royww', 'oyywo', '.ooo.'],
];
const _flammes = {};
function flamme(f, rouge) {
  const k = f + (rouge ? 'r' : ''); return _flammes[k] || (_flammes[k] = peindre(FLAMMES[f], rouge ? { r: '#8a1424', o: '#e8402e', y: '#ff9a58', w: '#ffe6c0' } : { r: '#c83c18', o: '#f08024', y: '#ffd24a', w: '#fff6c8' }));
}
function dessinerAppliques(g, s, X, Y) {
  const L = s._appliques; if (!L || !L.length) return;
  const t = G.temps, A = ambiance(G.theme), K = '#1c1420';
  const corps = nuancer(A.lampe, 0.62), clair = nuancer(A.lampe, 1.4), sombre = nuancer(A.lampe, 0.38);
  for (const p of L) {
    const x = X(p.x), y = Y(p.y), i = p.i;
    switch (p.type) {
      case 'torche':
        g.fillStyle = K; g.fillRect(x - 3, y + 13, 7, 8); g.fillStyle = '#5a5058'; g.fillRect(x - 2, y + 14, 5, 6); g.fillStyle = '#8a8088'; g.fillRect(x - 2, y + 14, 5, 1);
        g.fillStyle = K; g.fillRect(x - 1, y + 6, 4, 9); g.fillStyle = '#7a4e2c'; g.fillRect(x, y + 7, 2, 8);
        g.fillStyle = K; g.fillRect(x - 3, y + 3, 8, 4); g.fillStyle = '#6a5a50'; g.fillRect(x - 2, y + 4, 6, 2);
        g.drawImage(flamme(Math.floor(t * 9 + i * 1.7) % 3), x - 2, y - 5); break;
      case 'lanterne': {
        const bx = x + (G.reglages.confort ? 0 : Math.round(Math.sin(t * 1.3 + i * 2) * 0.8));
        g.fillStyle = K; g.fillRect(x, y - 3, 1, 7); g.fillRect(bx - 5, y + 4, 11, 14);
        g.fillStyle = corps; g.fillRect(bx - 4, y + 5, 9, 12); g.fillStyle = clair; g.fillRect(bx - 2, y + 6, 5, 10);
        g.fillStyle = sombre; g.fillRect(bx - 4, y + 8, 9, 1); g.fillRect(bx - 4, y + 13, 9, 1);
        g.fillStyle = K; g.fillRect(bx - 3, y + 3, 7, 2); g.fillRect(bx - 3, y + 17, 7, 2); g.fillStyle = '#e8c050'; g.fillRect(bx, y + 19, 1, 3); break;
      }
      case 'tube':
        g.fillStyle = K; g.fillRect(x - 4, y, 9, 23); g.fillStyle = '#6a7078'; g.fillRect(x - 3, y + 1, 7, 3); g.fillRect(x - 3, y + 19, 7, 3);
        g.fillStyle = '#2a6a5a'; g.fillRect(x - 2, y + 4, 5, 15); g.fillStyle = A.lampe; g.fillRect(x - 1, y + 5, 3, 13); g.fillStyle = '#e0fff6'; g.fillRect(x - 2, y + 4, 1, 15);
        g.fillStyle = '#f0fffa'; for (let b = 0; b < 3; b++) g.fillRect(x + (b % 2), y + 17 - Math.floor((t * 7 + b * 4 + i * 3) % 12), 1, 1); break;
      case 'champignons':
        for (const [dx, h, r] of [[-5, 5, 2], [0, 8, 3], [5, 4, 2]]) {
          const bx = x + dx, by = y + 23; g.fillStyle = K; g.fillRect(bx - 1, by - h, 3, h + 1); g.fillStyle = '#d8e8c0'; g.fillRect(bx, by - h + 1, 1, h - 1);
          g.fillStyle = K; g.fillRect(bx - r - 1, by - h - 3, 2 * r + 3, 4); g.fillStyle = A.lampe; g.fillRect(bx - r, by - h - 2, 2 * r + 1, 2); g.fillStyle = '#f0ffd0'; g.fillRect(bx - r + 1, by - h - 2, r, 1);
        }
        g.fillStyle = '#3a5a2a'; for (let k = 0; k < 4; k++) g.fillRect(x - 6 + k * 4, y + 1 + (k % 2) * 2, 1, 7 + (k % 2) * 3); break;
      case 'bougies':
        g.fillStyle = K; g.fillRect(x - 8, y + 16, 17, 4); g.fillStyle = '#4a3a44'; g.fillRect(x - 7, y + 17, 15, 2);
        for (const [dx, h] of [[-5, 6], [0, 9], [5, 5]]) {
          const bx = x + dx, f = Math.floor(t * 10 + dx + i) % 3; g.fillStyle = K; g.fillRect(bx - 2, y + 16 - h, 4, h); g.fillStyle = '#d8ccc0'; g.fillRect(bx - 1, y + 17 - h, 2, h - 1);
          g.fillStyle = '#ff6a3a'; g.fillRect(bx - 1 + (f === 1 ? 1 : 0), y + 12 - h, 1, 4); g.fillStyle = '#ffe0a0'; g.fillRect(bx - 1 + (f === 2 ? 1 : 0), y + 14 - h, 2, 2);
        }
        break;
      case 'sceau': {
        g.fillStyle = K; g.fillRect(x - 4, y + 1, 9, 19); g.fillStyle = '#e8dcc0'; g.fillRect(x - 3, y + 2, 7, 17);
        g.fillStyle = '#b02828'; g.fillRect(x - 1, y + 4, 3, 1); g.fillRect(x, y + 5, 1, 4); g.fillRect(x - 2, y + 9, 5, 1); g.fillRect(x - 1, y + 12, 3, 3); g.fillRect(x, y + 16, 1, 2);
        g.globalAlpha = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2.2 + i)); g.fillStyle = '#ff5a3a'; g.fillRect(x - 3, y + 2, 7, 17); g.globalAlpha = 1; break;
      }
    }
  }
}

// ── Air du thème : poussières, lucioles, sable, spores, braises, cendres, bancs de brume ──
const _air = [];
function dessinerAir(g, s, X, Y) {
  if (!eclairageActif()) return;
  const type = ambiance(G.theme).air; if (!type) return;
  const t = G.temps, Wp = (s.W - 2) * TUILE, Hp = (s.H - 2) * TUILE;
  const h = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233 + s.W * 3.7 + s.H) * 43758.5453; return v - Math.floor(v); };
  const mod = (v, m) => ((v % m) + m) % m;
  g.save(); g.imageSmoothingEnabled = true; g.beginPath(); g.rect(X(TUILE), Y(TUILE), Wp, Hp); g.clip();
  if (type === 'brume') {
    g.globalCompositeOperation = 'screen';
    for (let i = 0; i < 6; i++) { const x = mod(h(i, 1) * (Wp + 260) + t * (5 + h(i, 2) * 7), Wp + 260) - 130, y = h(i, 3) * Hp; g.globalAlpha = 0.16; g.drawImage(halo('#b8d0e8'), X(TUILE + x) - 130, Y(TUILE + y) - 26, 260, 52); }
    g.restore(); return;
  }
  const n = G.reglages.confort ? 10 : 26;
  for (let i = 0; i < n; i++) {
    const a = h(i, 1), b = h(i, 2), c = h(i, 3); let x, y, col, tl = 1, al, lueur = 0;
    switch (type) {
      case 'poussiere': x = mod(a * Wp + t * (3 + b * 5), Wp); y = mod(c * Hp + Math.sin(t * 0.5 + i) * 8, Hp); col = '#fff0d8'; al = 0.16 + 0.22 * (0.5 + 0.5 * Math.sin(t * 1.1 + i * 2.3)); break;
      case 'luciole': x = mod(a * Wp + Math.sin(t * 0.37 + i) * 46 + t * 2, Wp); y = mod(c * Hp + Math.cos(t * 0.29 + i * 1.3) * 30, Hp); col = '#eaff96'; tl = 2; al = Math.max(0, Math.sin(t * 1.7 + i * 2.1)); lueur = 12; break;
      case 'sable': x = mod(a * Wp + t * (50 + b * 50), Wp); y = mod(c * Hp + Math.sin(t * 2 + i) * 3, Hp); col = '#f4dcac'; tl = b > 0.6 ? 2 : 1; al = 0.4; break;
      case 'spore': x = mod(a * Wp + Math.sin(t * 0.8 + i) * 8, Wp); y = mod(c * Hp - t * (6 + b * 8), Hp); col = '#a8ffe0'; tl = 2; al = 0.35 + 0.3 * Math.sin(t * 2 + i); lueur = 9; break;
      case 'braise': x = mod(a * Wp + Math.sin(t * 1.6 + i) * 10, Wp); y = mod(c * Hp - t * (14 + b * 16), Hp); col = b > 0.5 ? '#ffa048' : '#ff6030'; tl = b > 0.7 ? 2 : 1; al = 0.55 + 0.45 * Math.sin(t * 6 + i * 3); lueur = 8; break;
      default: x = mod(a * Wp + Math.sin(t * 0.9 + i) * 12, Wp); y = mod(c * Hp + t * (9 + b * 7), Hp); col = '#bcb4b0'; tl = 2; al = 0.32; // cendre
    }
    const tu = tuileA(s, Math.floor((TUILE + x) / TUILE), Math.floor((TUILE + y) / TUILE)); if (tu === T.VIDE || tu === T.MUR || tu === T.PORTE) continue; // pas de poussière dans le vide
    if (al > 0.02) _air.push(X(TUILE + x), Y(TUILE + y), al, col, tl, lueur);
  }
  // lueurs d'abord (un seul changement de mode de fusion), puis les grains nets
  g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < _air.length; k += 6) { const l = _air[k + 5]; if (!l) continue; g.globalAlpha = _air[k + 2] * 0.45; g.drawImage(halo(_air[k + 3], false, l * 2), _air[k] - l, _air[k + 1] - l, l * 2, l * 2); }
  g.globalCompositeOperation = 'source-over';
  for (let k = 0; k < _air.length; k += 6) { g.globalAlpha = Math.min(1, _air[k + 2]); g.fillStyle = _air[k + 3]; g.fillRect(Math.round(_air[k]), Math.round(_air[k + 1]), _air[k + 4], _air[k + 4]); }
  _air.length = 0; g.restore();
}

// Fond de l'écran autour de la salle : pénombre teintée plutôt qu'un noir plat
const _fondsEcran = {};
function fondEcran(th) {
  if (_fondsEcran[th]) return _fondsEcran[th];
  const c = toile(ECRAN_L, ECRAN_H), g = ctxDe(c); const V = (INDEX[th] || DON.themes[0]).visuel;
  g.fillStyle = '#07060a'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
  const [r, v, b] = hexRgb(nuancer(V.mur.ombre, 0.6)); const gr = g.createRadialGradient(320, 184, 60, 320, 184, 400);
  gr.addColorStop(0, 'rgba(' + r + ',' + v + ',' + b + ',0.55)'); gr.addColorStop(1, 'rgba(' + r + ',' + v + ',' + b + ',0)');
  g.fillStyle = gr; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
  return (_fondsEcran[th] = c);
}
