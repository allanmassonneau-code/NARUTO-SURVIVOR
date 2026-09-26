// ═══════════════════════════════════════════════════════════════════════════
// Décors procéduraux par thème : sols peu contrastés, murs en perspective
// (le mur du haut montre sa face), obstacles lisibles avant contact, portes
// typées par leur cadre (pas seulement la couleur), fosses, pics, flammes.
// Budget de visibilité : le décor reste sous le contraste des personnages.
// ═══════════════════════════════════════════════════════════════════════════

const _decors = {};
function hasardTuile(tx, ty, k = 0) { const h = hacher(tx + ':' + ty + ':' + k); return h[0] / 4294967296; }

function decorsTheme(themeId) {
  if (_decors[themeId]) return _decors[themeId];
  const th = INDEX[themeId] || DON.themes[0]; const V = th.visuel;
  const D = { sols: [], rochers: [], rocherSceau: null, bloc: null, jarre: null, caisse: null, feu: [], totem: null, blocCle: null, pics: null, picsRentres: null, toile: null, pont: null };
  // ── Sols (4 variantes, faible contraste) ──
  for (let v = 0; v < 4; v++) {
    const c = toile(32, 32), g = ctxDe(c); const S = V.sol;
    g.fillStyle = S.base; g.fillRect(0, 0, 32, 32);
    const r = new Alea(themeId + 'sol' + v);
    const pt = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    switch (S.motif) {
      case 'planches':
        for (let y = 0; y < 32; y += 8) { g.fillStyle = S.joint; g.fillRect(0, y, 32, 1); const dec = (y / 8 + v) % 2 ? 11 : 23; g.fillRect(dec, y, 1, 8); g.fillStyle = r.choix(S.var); g.fillRect(0, y + 1, dec, 7); g.fillStyle = r.choix(S.var); g.fillRect(dec + 1, y + 1, 31 - dec, 7); }
        for (let k = 0; k < 10; k++) pt(r.entier(32), r.entier(32), nuancer(S.base, 0.85));
        break;
      case 'dalles':
        g.fillStyle = S.joint; g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32); g.fillRect(0, 16, 32, 1); g.fillRect(16, 0, 1, 32);
        for (const [x, y] of [[1, 1], [17, 1], [1, 17], [17, 17]]) { g.fillStyle = r.choix(S.var); g.fillRect(x, y, 15, 15); g.fillStyle = nuancer(S.base, 1.08); g.fillRect(x, y, 15, 1); }
        break;
      case 'metal':
        g.fillStyle = S.joint; g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32);
        g.fillStyle = r.choix(S.var); g.fillRect(1, 1, 31, 31);
        for (const [x, y] of [[3, 3], [28, 3], [3, 28], [28, 28]]) { pt(x, y, nuancer(S.base, 1.3)); pt(x + 1, y + 1, S.joint); }
        if (v === 2) { g.fillStyle = nuancer(S.base, 0.8); for (let k = 4; k < 28; k += 4) g.fillRect(k, 14, 2, 4); }
        break;
      case 'pierre':
        for (let k = 0; k < 5; k++) { const x = r.entier(28), y = r.entier(28), l = 4 + r.entier(8), h = 3 + r.entier(6); g.fillStyle = r.choix(S.var); g.fillRect(x, y, l, h); g.fillStyle = S.joint; g.fillRect(x, y + h, l, 1); }
        for (let k = 0; k < 12; k++) pt(r.entier(32), r.entier(32), nuancer(S.base, r.chance(0.5) ? 0.88 : 1.08));
        break;
      case 'sable':
        for (let k = 0; k < 60; k++) pt(r.entier(32), r.entier(32), r.choix(S.var));
        for (let k = 0; k < 3; k++) { const y = r.entier(30); g.fillStyle = nuancer(S.base, 0.94); g.fillRect(r.entier(20), y, 6 + r.entier(8), 1); }
        break;
      case 'mousse':
        for (let k = 0; k < 40; k++) pt(r.entier(32), r.entier(32), r.choix(S.var));
        for (let k = 0; k < 4; k++) { g.fillStyle = nuancer(S.base, 1.12); const x = r.entier(28), y = r.entier(28); g.fillRect(x, y, 3, 2); }
        break;
      default: // terre
        for (let k = 0; k < 45; k++) pt(r.entier(32), r.entier(32), r.choix(S.var));
        for (let k = 0; k < 3; k++) { const x = r.entier(28), y = r.entier(29); g.fillStyle = nuancer(S.base, 0.82); g.fillRect(x, y, 2, 1); g.fillRect(x + 1, y + 1, 2, 1); }
    }
    D.sols.push(c);
  }
  // ── Rochers (3 variantes) selon la forme du thème ──
  const R = V.rocher;
  for (let v = 0; v < 3; v++) D.rochers.push(dessinerRocher(R, R.forme, v, themeId));
  D.rocherSceau = dessinerRocher(R, R.forme, 0, themeId, true);
  D.totem = dessinerTotem(V);
  D.bloc = contourner(peindre([
    '..............................',
    '.bbbbbbbbbbbbbbbbbbbbbbbbbbbb.',
    '.bllllllllllllllllllllllllllb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmrmmmmmmmmmmmmmmmmmmrmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.blmmrmmmmmmmmmmmmmmmmmmrmmdb.',
    '.blmmmmmmmmmmmmmmmmmmmmmmmmdb.',
    '.bddddddddddddddddddddddddddb.',
    '.bddddddddddddddddddddddddddb.',
    '.bddddddddddddddddddddddddddb.',
    '.bbbbbbbbbbbbbbbbbbbbbbbbbbbb.'], { b: '#3a3a44', l: '#9aa0b0', m: '#6c7282', d: '#4a4e5a', r: '#2a2c34' }, 30, 24));
  D.jarre = contourner(peindre([
    '.......nnnnnn.......',
    '......nNNNNNNn......',
    '.......nnnnnn.......',
    '......jjjjjjjj......',
    '....jjjlljjjjjjj....',
    '...jjjlljjjjjjjjj...',
    '..jjjlljjjjjjjjjjd..',
    '..jjjljjjbbbbjjjjd..',
    '..jjjjjjbjjjjbjjjd..',
    '..jjjjjjjbbbbjjjjd..',
    '..jjjjjjjjjjjjjjjd..',
    '...jjjjjjjjjjjjjd...',
    '....jjjjjjjjjjdd....',
    '.....ddjjjjjddd.....',
    '.......dddddd.......'], { n: '#6a4a36', N: '#3a281c', j: '#b86a44', l: '#e0a07a', d: '#8a4a30', b: '#6a3424' }, 20, 15));
  D.caisse = contourner(peindre([
    '........................',
    '.cccccccccccccccccccccc.',
    '.cllllllllllllllllllllc.',
    '.clbbbbbbbbbbbbbbbbbbdc.',
    '.clbwwwwwwwwwwwwwwwwbdc.',
    '.clbwbbwwwwwwwwwwbbwbdc.',
    '.clbwwbbwwwwwwwwbbwwbdc.',
    '.clbwwwwbbwwwwbbwwwwbdc.',
    '.clbwwwwwwbbbbwwwwwwbdc.',
    '.clbwwwwwwbbbbwwwwwwbdc.',
    '.clbwwwwbbwwwwbbwwwwbdc.',
    '.clbwwbbwwwwwwwwbbwwbdc.',
    '.clbwbbwwwwwwwwwwbbwbdc.',
    '.clbwwwwwwwwwwwwwwwwbdc.',
    '.clbbbbbbbbbbbbbbbbbbdc.',
    '.cddddddddddddddddddddc.',
    '.cddddddddddddddddddddc.',
    '.cccccccccccccccccccccc.'], { c: '#5a3a22', l: '#c89060', b: '#7a5030', w: '#a87448', d: '#6a4428' }, 24, 18));
  for (let f = 0; f < 3; f++) D.feu.push(dessinerFeu(f));
  D.brasero = contourner(peindre([
    '....................',
    '..bbbbbbbbbbbbbbbb..',
    '..blllllllllllllb..',
    '...bmmmmmmmmmmmb...',
    '....bmmmmmmmmmb....',
    '.....bbbbbbbbb.....',
    '......b.....b......'].map(r => r.padEnd(20, '.')), { b: '#2a2226', l: '#8a7a6a', m: '#5a4a40' }, 20, 7));
  D.feuEteint = contourner(peindre([
    '....................',
    '.......s...s........',
    '......sss.ss........',
    '..bbbbbbbbbbbbbbbb..',
    '..blllllllllllllb..',
    '...bmmmmmmmmmmmb...',
    '....bmmmmmmmmmb....',
    '.....bbbbbbbbb.....'].map(r => r.padEnd(20, '.')), { b: '#2a2226', l: '#8a7a6a', m: '#5a4a40', s: '#6a6a70' }, 20, 8));
  D.blocCle = contourner(peindre([
    '..........................',
    '.gggggggggggggggggggggggg.',
    '.gyyyyyyyyyyyyyyyyyyyyyyg.',
    '.gyooooooooooooooooooooyg.',
    '.gyo..................oyg.',
    '.gyo.......kkkk.......oyg.',
    '.gyo......k....k......oyg.',
    '.gyo......k....k......oyg.',
    '.gyo.......kkkk.......oyg.',
    '.gyo........kk........oyg.',
    '.gyo........kk........oyg.',
    '.gyo........kkk.......oyg.',
    '.gyo........kk........oyg.',
    '.gyo........kkk.......oyg.',
    '.gyo..................oyg.',
    '.gyooooooooooooooooooooyg.',
    '.gyyyyyyyyyyyyyyyyyyyyyyg.',
    '.gddddddddddddddddddddddg.',
    '.gddddddddddddddddddddddg.',
    '.gggggggggggggggggggggggg.'].map(r => r.replace(/\./g, 'm').replace(/^m/, '.').replace(/m$/, '.')), { g: '#5a4a1a', y: '#e8c050', o: '#a07a20', m: '#c89a30', k: '#3a2a10', d: '#8a6a20' }, 26, 20));
  D.pics = dessinerPics(true); D.picsRentres = dessinerPics(false);
  D.toile = dessinerToile();
  return (_decors[themeId] = D);
}

function dessinerRocher(R, forme, v, graine, sceau) {
  const c = toile(30, 26), g = ctxDe(c); const r = new Alea(graine + 'roc' + v + forme);
  const base = R.base, om = R.ombre, lu = R.lum;
  if (forme === 'caisse') { // tonneau / caisse de marionnettiste
    g.fillStyle = om; g.fillRect(3, 4, 24, 20); g.fillStyle = base; g.fillRect(4, 4, 22, 17); g.fillStyle = lu; g.fillRect(4, 4, 22, 2);
    g.fillStyle = nuancer(om, 0.8); g.fillRect(4, 11, 22, 1); g.fillRect(14, 4, 1, 17);
  } else if (forme === 'cuve') {
    g.fillStyle = om; g.fillRect(4, 3, 22, 21); g.fillStyle = base; g.fillRect(5, 3, 20, 18); g.fillStyle = '#5a9a7a'; g.fillRect(8, 6, 14, 10); g.fillStyle = '#8ad0a8'; g.fillRect(9, 7, 4, 2); g.fillStyle = lu; g.fillRect(5, 3, 20, 2);
  } else if (forme === 'souche') {
    g.fillStyle = om; g.fillRect(4, 8, 22, 16); g.fillStyle = base; g.fillRect(5, 8, 20, 13); g.fillStyle = '#9c8458'; g.fillRect(6, 5, 18, 7); g.fillStyle = '#b89c6a'; g.fillRect(8, 6, 14, 5); g.fillStyle = '#8a7048'; g.fillRect(11, 7, 8, 3); g.fillStyle = om; g.fillRect(9, 12, 1, 8); g.fillRect(19, 13, 1, 7);
  } else if (forme === 'bloc') {
    g.fillStyle = om; g.fillRect(3, 5, 24, 19); g.fillStyle = base; g.fillRect(3, 4, 24, 15); g.fillStyle = lu; g.fillRect(3, 4, 24, 2); g.fillRect(3, 4, 2, 13);
    g.fillStyle = nuancer(om, 0.9); g.fillRect(14 + (v % 2) * 3, 6, 1, 8); g.fillRect(6, 12 - v, 6, 1);
  } else { // rond
    const cx = 15, cy = 13;
    for (let y = 0; y < 26; y++) for (let x = 0; x < 30; x++) {
      const dx = (x - cx) / (12 - v * 0.5), dy = (y - cy) / (10.5 - v * 0.3); const d = dx * dx + dy * dy;
      if (d > 1) continue;
      g.fillStyle = (y > cy + 5 || (dx > 0.45 && dy > -0.1)) ? om : (dx < -0.2 && dy < -0.25) ? lu : base; g.fillRect(x, y, 1, 1);
    }
    g.fillStyle = om; for (let k = 0; k < 3; k++) { const x = 7 + r.entier(14), y = 8 + r.entier(8); g.fillRect(x, y, 2 + r.entier(3), 1); }
  }
  if (sceau) { // marque discrète mais fiable : sceau clair en spirale
    g.fillStyle = '#e8d8a0'; for (const [x, y] of [[13, 9], [14, 9], [15, 9], [16, 10], [16, 11], [15, 12], [14, 12], [13, 11], [14, 10]]) g.fillRect(x, y, 1, 1);
  }
  return contourner(c);
}
function dessinerTotem(V) {
  const c = toile(24, 30), g = ctxDe(c); const R = V.rocher;
  g.fillStyle = R.ombre; g.fillRect(7, 4, 10, 25); g.fillStyle = R.base; g.fillRect(7, 3, 9, 24); g.fillStyle = R.lum; g.fillRect(7, 3, 2, 22);
  g.fillStyle = '#c8a050'; g.fillRect(6, 9, 12, 2); g.fillRect(6, 19, 12, 2); g.fillStyle = '#2a2020'; g.fillRect(10, 13, 1, 3); g.fillRect(13, 13, 1, 3);
  return contourner(c);
}
function dessinerFeu(f) {
  const c = toile(20, 26), g = ctxDe(c);
  const flam = [
    ['.........r..........', '........rr..........', '.......rro...r......', '......rroo..rr......', '.....rrooor.rro.....', '....rroooyorroor....', '....roooyyyooor.....', '...rrooyyywyyoor....', '...rooyyywwyyyor....', '...roooyywwwyyor....', '....rooyywwyyoor....', '.....rroyyyyoor.....', '......rroooorr......'],
    ['..........r.........', '.....r....rr........', '.....rr..rro........', '....rro..rroo.......', '....rroorooor.......', '...rroooooyorr......', '...rooyyooyyoor.....', '..rrooyyyyywyor.....', '..rooyyywwyyyor.....', '..roooyywwwyyor.....', '...rooyywwyyoor.....', '....rroyyyyoor......', '.....rroooorr.......'],
    ['........r...........', '........rr...r......', '.......rro..rr......', '......rroo.rro......', '......rooorrooo.....', '.....rroooyooor.....', '....rrooyyyyoor.....', '....rooyyyyyyoor....', '...rrooyywwyyyor....', '...roooyywwwyyor....', '....rooyywwyyoor....', '.....rroyyyyoor.....', '......rroooorr......'],
  ][f];
  const img = peindre(flam, { r: '#c83018', o: '#f07820', y: '#ffd040', w: '#fff8d0' }, 20, 13);
  g.drawImage(img, 0, 2);
  g.fillStyle = '#2a2226'; g.fillRect(2, 15, 16, 1); g.fillStyle = '#8a7a6a'; g.fillRect(3, 16, 14, 2); g.fillStyle = '#5a4a40'; g.fillRect(4, 18, 12, 3); g.fillRect(5, 21, 10, 1); g.fillStyle = '#2a2226'; g.fillRect(6, 22, 1, 3); g.fillRect(13, 22, 1, 3);
  return contourner(c);
}
function dessinerPics(sortis) {
  const c = toile(32, 32), g = ctxDe(c);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(3, 3, 26, 26);
  for (const [x, y] of [[6, 8], [16, 6], [24, 10], [9, 19], [19, 18], [26, 24], [5, 27], [14, 27]]) {
    if (sortis) { g.fillStyle = '#d8dce4'; g.fillRect(x, y - 5, 2, 5); g.fillRect(x - 1, y - 2, 4, 2); g.fillStyle = '#7a8090'; g.fillRect(x + 1, y - 4, 1, 4); g.fillStyle = '#2a2a30'; g.fillRect(x - 1, y, 4, 1); }
    else { g.fillStyle = '#2a2a30'; g.fillRect(x - 1, y - 1, 3, 2); g.fillStyle = '#5a5e68'; g.fillRect(x, y - 1, 1, 1); }
  }
  return c;
}
function dessinerToile() {
  const c = toile(32, 32), g = ctxDe(c); g.fillStyle = 'rgba(230,230,240,0.55)';
  for (let a = 0; a < 8; a++) lignePixel(g, 16, 16, 16 + Math.cos(a * Math.PI / 4) * 15, 16 + Math.sin(a * Math.PI / 4) * 15, 'rgba(230,230,240,0.55)');
  for (const r of [5, 10, 14]) for (let a = 0; a < 8; a++) { const a0 = a * Math.PI / 4, a1 = (a + 1) * Math.PI / 4; lignePixel(g, 16 + Math.cos(a0) * r, 16 + Math.sin(a0) * r, 16 + Math.cos(a1) * r, 16 + Math.sin(a1) * r, 'rgba(230,230,240,0.45)'); }
  return c;
}

// ── Murs : texture de face (haut), de côté et rebord (bas), selon le motif ──
function textureMur(V, type) { // type : 'face' | 'cote' | 'rebord' | 'coin'
  const M = V.mur; const c = toile(32, 32), g = ctxDe(c);
  if (type === 'face') {
    g.fillStyle = M.face; g.fillRect(0, 0, 32, 32);
    g.fillStyle = M.haut; g.fillRect(0, 0, 32, 6);
    g.fillStyle = nuancer(M.haut, 1.2); g.fillRect(0, 6, 32, 1);
    if (M.motif === 'briques') { g.fillStyle = M.ombre; for (let y = 7; y < 32; y += 6) { g.fillRect(0, y + 5, 32, 1); const d = ((y - 7) / 6) % 2 ? 8 : 0; for (let x = d; x < 32; x += 16) g.fillRect(x, y, 1, 5); } }
    else if (M.motif === 'planches') { g.fillStyle = M.ombre; for (let x = 0; x < 32; x += 8) g.fillRect(x, 7, 1, 25); g.fillStyle = nuancer(M.face, 1.1); for (let x = 2; x < 32; x += 8) g.fillRect(x, 9, 1, 20); }
    else if (M.motif === 'metal') { g.fillStyle = M.ombre; g.fillRect(0, 18, 32, 2); g.fillStyle = nuancer(M.face, 1.25); for (const x of [4, 14, 24]) { g.fillRect(x, 10, 2, 2); g.fillRect(x, 24, 2, 2); } }
    else if (M.motif === 'racines') { g.fillStyle = M.ombre; for (let k = 0; k < 4; k++) { const x = 3 + k * 8; g.fillRect(x, 7, 3, 25); g.fillStyle = nuancer(M.face, 1.15); g.fillRect(x, 7, 1, 25); g.fillStyle = M.ombre; } }
    else { g.fillStyle = M.ombre; g.fillRect(4, 12, 10, 1); g.fillRect(18, 20, 11, 1); g.fillRect(8, 26, 8, 1); g.fillRect(22, 10, 1, 6); g.fillStyle = nuancer(M.face, 1.12); g.fillRect(5, 11, 8, 1); g.fillRect(19, 19, 9, 1); }
    g.fillStyle = nuancer(M.ombre, 0.8); g.fillRect(0, 30, 32, 2);
  } else if (type === 'cote') {
    g.fillStyle = M.haut; g.fillRect(0, 0, 32, 32);
    g.fillStyle = nuancer(M.haut, 1.18); for (let y = 2; y < 32; y += 8) g.fillRect(4, y, 24, 1);
  } else { // rebord / coin
    g.fillStyle = M.haut; g.fillRect(0, 0, 32, 32); g.fillStyle = nuancer(M.haut, 1.18); g.fillRect(0, 0, 32, 2);
  }
  return c;
}
function decorsMurs(themeId) {
  const D = decorsTheme(themeId); if (D.murs) return D.murs;
  const V = (INDEX[themeId] || DON.themes[0]).visuel;
  D.murs = { face: textureMur(V, 'face'), cote: textureMur(V, 'cote'), rebord: textureMur(V, 'rebord') };
  return D.murs;
}

// ── Portes : cadre selon le type (forme + symbole), battants selon l'état ──
const CADRES_PORTE = {
  normale: { cadre: '#6a5444', lum: '#9a8068', sym: null },
  boss: { cadre: '#5a1c1c', lum: '#b83a2a', sym: 'crane' },
  heritage: { cadre: '#a07a20', lum: '#f0c850', sym: 'etoile' },
  boutique: { cadre: '#6a5a2a', lum: '#c8b060', sym: 'piece' },
  cache: { cadre: '#3a3036', lum: '#6a5a60', sym: null },
  isolee: { cadre: '#3a3036', lum: '#6a5a60', sym: null },
  malediction: { cadre: '#4a1a2a', lum: '#a02a4a', sym: 'pics' },
  sacrifice: { cadre: '#5a3a3a', lum: '#9a6a6a', sym: 'goutte' },
  defi: { cadre: '#4a4a5a', lum: '#9a9ab0', sym: 'kunais' },
  defi_boss: { cadre: '#5a2a4a', lum: '#b85a9a', sym: 'kunais' },
  dispositifs: { cadre: '#2a4a5a', lum: '#5a9ab0', sym: 'de' },
  bibliotheque: { cadre: '#3a4a2a', lum: '#8ab060', sym: 'rouleau' },
  coffres: { cadre: '#5a4a2a', lum: '#b09a5a', sym: 'coffre' },
  repos: { cadre: '#2a5a5a', lum: '#6ac8c0', sym: 'goutte' },
  pacte: { cadre: '#1a1020', lum: '#6a2a8a', sym: 'serpent' },
  sanctuaire: { cadre: '#c8c0a0', lum: '#fff8e0', sym: 'crapaud' },
  depart: { cadre: '#6a5444', lum: '#9a8068', sym: null },
  combat: { cadre: '#6a5444', lum: '#9a8068', sym: null },
  breche: { cadre: '#3a0a0a', lum: '#ff4a2a', sym: 'crane' },
  lumiere: { cadre: '#e8e0c0', lum: '#ffffff', sym: 'etoile' },
};
