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
  D.bloc = dessinerBloc(V, themeId);
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
  const c = toile(30, 26), g = ctxDe(c); const r = new Alea(graine + 'roc' + v + forme), k0 = hacher(graine + '|' + forme + '|' + v)[0] % 99991;
  const th = graine, base = hexRgb(R.base), px = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
  const ton = k => rgbHex(...nuancerRgb(base, k)), T5 = [ton(0.58), ton(0.76), ton(1), ton(1.14), ton(1.3)];
  const L = [-0.52, -0.68, 0.52]; // lumière : haut gauche, un peu de face
  if (forme === 'caisse') { // bloc de chêne cerclé de fer (ateliers) : lourd, indestructible aux tirs
    const bois = R.base, fer = '#4a4a54', ferC = '#8a8a98';
    g.fillStyle = nuancer(bois, 0.7); g.fillRect(3, 6, 24, 18); g.fillStyle = bois; g.fillRect(3, 4, 24, 15); g.fillStyle = nuancer(bois, 1.15); g.fillRect(3, 4, 24, 3);
    for (let x = 5; x < 26; x += 5) { g.fillStyle = nuancer(bois, 0.82); g.fillRect(x, 7, 1, 12); }
    for (const y of [8, 15]) { g.fillStyle = fer; g.fillRect(3, y, 24, 2); g.fillStyle = ferC; g.fillRect(3, y, 24, 1); for (const x of [5, 15, 24]) px(x, y + 1, '#d8d8e0'); }
    g.fillStyle = nuancer(bois, 0.55); g.fillRect(3, 19, 24, 5); g.fillStyle = fer; g.fillRect(3, 21, 24, 1);
  } else if (forme === 'cuve') { // cuve de verre : liquide vert, spécimen en ombre, cerclages
    const verre = '#5a9a7a';
    g.fillStyle = '#3a4048'; g.fillRect(4, 2, 22, 3); g.fillStyle = '#8a929c'; g.fillRect(4, 2, 22, 1);
    g.fillStyle = '#2a4a3a'; g.fillRect(5, 5, 20, 15); g.fillStyle = verre; g.fillRect(6, 6, 18, 13);
    g.fillStyle = '#3a6a52'; g.fillRect(12, 9, 6, 8); g.fillRect(13, 7, 4, 3); g.fillStyle = '#2a5040'; g.fillRect(14, 8, 2, 1); // spécimen
    g.fillStyle = '#9ae0b8'; g.fillRect(7, 7, 1, 10); g.fillRect(8, 7, 1, 3); px(20, 9, '#c8ffd8'); px(18, 13, '#c8ffd8'); px(9, 15, '#c8ffd8');
    g.fillStyle = '#3a4048'; g.fillRect(4, 19, 22, 5); g.fillStyle = '#6a7078'; g.fillRect(4, 19, 22, 1); g.fillStyle = '#1c2024'; g.fillRect(6, 21, 18, 1);
  } else if (forme === 'souche') { // souche : cernes sur le dessus, écorce striée, racines, mousse
    const ec = R.base, ecS = nuancer(ec, 0.7), ecC = nuancer(ec, 1.2);
    g.fillStyle = ecS; g.fillRect(5, 9, 20, 13); g.fillStyle = ec; g.fillRect(5, 9, 19, 11);
    for (let x = 6; x < 24; x += 3) { g.fillStyle = r.chance(0.5) ? ecS : ecC; g.fillRect(x, 10 + r.entier(3), 1, 6 + r.entier(4)); }
    g.fillStyle = ecS; g.fillRect(2, 19, 5, 3); g.fillRect(23, 18, 5, 3); g.fillRect(12, 21, 6, 3); g.fillStyle = ec; g.fillRect(3, 19, 3, 1); g.fillRect(24, 18, 3, 1);
    for (let y = 0; y < 9; y++) for (let x = 0; x < 22; x++) { const dx = (x - 10.5) / 10.5, dy = (y - 4) / 4.2, d = dx * dx + dy * dy; if (d > 1) continue; const anneau = Math.floor(Math.sqrt(d) * 4); px(x + 4, y + 3, ['#d8bc88', '#c8a870', '#b8985e', '#8a6a42'][Math.min(3, anneau)]); if (anneau === 1 && (x + y) % 5 === 0) px(x + 4, y + 3, '#a8884e'); }
    px(14, 7, '#7a5a34'); px(15, 7, '#7a5a34'); g.fillStyle = '#5a7a3a'; g.fillRect(5, 9, 4, 2); g.fillRect(19, 10, 4, 2); px(6, 8, '#7aa04a');
  } else if (forme === 'bloc') { // pierre taillée : dessus éclairé, face sombre, arêtes biseautées, éclats
    const top = ton(1.12), face = ton(0.86), faceS = ton(0.68);
    g.fillStyle = faceS; g.fillRect(3, 9, 24, 15); g.fillStyle = face; g.fillRect(3, 9, 24, 12);
    g.fillStyle = top; g.fillRect(3, 3, 24, 7); g.fillStyle = ton(1.3); g.fillRect(3, 3, 24, 1); g.fillRect(3, 3, 1, 7); g.fillStyle = ton(0.95); g.fillRect(3, 9, 24, 1);
    if (th === 'THM_SUN') for (const y of [13, 17]) { g.fillStyle = ton(0.78); g.fillRect(3, y, 24, 1); } // strates de grès
    g.fillStyle = faceS; const fx = 9 + v * 4; for (let y = 10; y < 19; y++) px(fx + ((y * 3) % 2), y, faceS);
    px(23, 4, ton(0.9)); px(24, 5, ton(0.9)); g.fillStyle = ton(0.7); g.fillRect(4, 20, 3, 1);
    if (th === 'THM_BIJ' || th === 'THM_AKA') { g.fillStyle = '#c83a2a'; for (const [x, y] of [[13, 12], [14, 13], [14, 14], [15, 15], [16, 15]]) px(x, y, '#e05a3a'); }
  } else { // rocher rond : volume éclairé en cinq tons, contour irrégulier, base posée au sol, fissures
    const cx = 15, cy = 13.5, rx = 12.5 - v * 0.6, ry = 10.6 - v * 0.3;
    for (let y = 0; y < 26; y++) for (let x = 0; x < 30; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, a = Math.atan2(dy, dx);
      const lim = 1 + (bruitValeur(a * 1.6 + 10, v * 3, k0) - 0.5) * 0.22; const d = Math.sqrt(dx * dx + dy * dy);
      if (d > lim || y > 23) continue;
      const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, d * d))); let e = dx * L[0] + dy * L[1] + nz * L[2];
      e += (bruitValeur(x / 2.6, y / 2.6, k0 + 3) - 0.5) * 0.35;
      px(x, y, T5[e < -0.25 ? 0 : e < 0.15 ? 1 : e < 0.48 ? 2 : e < 0.72 ? 3 : 4]);
    }
    // fissures et éclats
    let fxs = 8 + r.entier(12), fy = 5 + r.entier(4); for (let i = 0; i < 6 + r.entier(4); i++) { px(fxs, fy, T5[0]); if (r.chance(0.4)) px(fxs + 1, fy, T5[3]); fxs += r.entier(3) - 1; fy += 1; }
    for (let k = 0; k < 2; k++) { const x = 6 + r.entier(16), y = 7 + r.entier(9); px(x, y, T5[4]); px(x + 1, y, T5[3]); }
    // matière du thème
    if (th === 'THM_FOR' || th === 'THM_MYO') for (let y = 0; y < 12; y++) for (let x = 0; x < 30; x++) { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy > 0.92 || dy > -0.25) continue; const m = bruitValeur(x / 3, y / 2, k0 + 9); if (m > 0.5) px(x, y, m > 0.72 ? '#8ab85a' : '#5a8a3a'); }
    if (th === 'THM_KIR') { px(9, 6, '#e8f8ff'); px(10, 6, '#e8f8ff'); px(9, 7, '#c0e0f0'); }
    if (th === 'THM_GUE') for (let k = 0; k < 4; k++) px(6 + r.entier(18), 5 + r.entier(12), '#b8b878');
  }
  if (sceau) { // sceau de papier collé : rectangle crème, inscription rouge, coins sombres
    g.fillStyle = '#1c1420'; g.fillRect(11, 5, 9, 12); g.fillStyle = '#efe4c4'; g.fillRect(12, 6, 7, 10); g.fillStyle = '#b02a2a'; g.fillRect(15, 7, 1, 8); g.fillRect(13, 9, 5, 1); g.fillRect(13, 12, 5, 1); px(13, 14, '#b02a2a'); px(17, 14, '#b02a2a');
  }
  return contourner(c);
}
// Bloc indestructible : pierre (ou métal) du thème, renforcée de cornières de fer — se distingue d'un rocher, qu'un explosif brise
function dessinerBloc(V, th) {
  const c = toile(30, 24), g = ctxDe(c), R = (x, y, l, h, col) => { g.fillStyle = col; g.fillRect(x, y, l, h); };
  const pierre = th === 'THM_ORO' || th === 'THM_MAR' ? '#6c7282' : nuancer(V.rocher.ombre, 0.95), fer = '#3a3a44', ferC = '#9a9aa8';
  R(1, 7, 28, 16, nuancer(pierre, 0.62)); R(1, 7, 28, 13, nuancer(pierre, 0.8)); // face avant
  R(1, 1, 28, 7, nuancer(pierre, 1.1)); R(1, 1, 28, 1, nuancer(pierre, 1.3)); R(1, 7, 28, 1, nuancer(pierre, 0.95)); // dessus éclairé
  for (let x = 8; x < 28; x += 7) R(x, 8, 1, 12, nuancer(pierre, 0.68)); R(1, 13, 28, 1, nuancer(pierre, 0.68)); // appareillage
  for (const [x, y] of [[1, 1], [24, 1], [1, 17], [24, 17]]) { R(x, y, 5, 5, fer); R(x + 1, y + 1, 3, 3, nuancer(fer, 1.5)); R(x + 2, y + 2, 1, 1, ferC); } // cornières rivetées
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
    // volume : la face s'assombrit vers le sol, arête haute éclairée
    [0.03, 0.07, 0.12, 0.18].forEach((o, k) => { g.fillStyle = 'rgba(0,0,0,' + o + ')'; g.fillRect(0, 11 + k * 5, 32, 5); });
    g.fillStyle = 'rgba(255,245,225,0.12)'; g.fillRect(0, 7, 32, 1);
    g.fillStyle = nuancer(M.ombre, 0.8); g.fillRect(0, 30, 32, 2);
  } else dessinerDessusMur(g, M, type === 'cote' ? 'v' : 'h');
  return c;
}
// Dessus des murs (latéraux : motif le long de y ; bas : le long de x), vu d'en haut,
// dans la matière du thème : haie et racines, briques décalées, blocs de roche, planches, plaques rivetées.
function dessinerDessusMur(g, M, o) {
  const base = M.haut, clair = nuancer(M.haut, 1.22), tresClair = nuancer(M.haut, 1.45), sombre = nuancer(M.haut, 0.72), joint = nuancer(M.haut, 0.5);
  const R = (u, v, lu, lv, col) => { g.fillStyle = col; if (o === 'v') g.fillRect(v, u, lv, lu); else g.fillRect(u, v, lu, lv); };
  const al = new Alea('dessus|' + M.haut + '|' + M.motif + '|' + o);
  R(0, 0, 32, 32, base);
  switch (M.motif) {
    case 'racines': { // haie de sous-bois : touffes de feuillage et racines
      for (let k = 0; k < 20; k++) { const u = al.entier(30), v = 3 + al.entier(24), l = 3 + al.entier(4); R(u, v, l, 2, k % 3 ? sombre : clair); R(u + 1, v - 1, l - 2, 1, k % 3 ? base : tresClair); }
      for (let k = 0; k < 3; k++) { const v = 6 + al.entier(20); for (let u = 0; u < 32; u += 2) R(u, v + (Math.sin(u * 0.4 + k) > 0 ? 1 : 0), 2, 1, joint); }
      break;
    }
    case 'briques': { // assises de briques décalées
      for (let u = 0, r = 0; u < 32; u += 8, r++) { R(u + 7, 2, 1, 28, joint); for (let v = r % 2 ? 2 : 10; v < 30; v += 16) R(u, v, 7, 1, joint); R(u, 2, 7, 1, clair); }
      R(0, 0, 32, 2, sombre); R(0, 30, 32, 2, sombre);
      break;
    }
    case 'planches': { // planches posées le long du mur, clous
      for (let v = 2; v < 30; v += 7) { R(0, v + 6, 32, 1, joint); R(0, v, 32, 1, clair); const cut = 4 + al.entier(22); R(cut, v, 1, 6, joint); R(cut + 2, v + 3, 1, 1, tresClair); R(cut - 3, v + 3, 1, 1, tresClair); }
      break;
    }
    case 'metal': { // plaques rivetées
      for (let u = 0; u < 32; u += 16) { R(u + 15, 2, 1, 28, joint); R(u, 2, 15, 1, clair); for (const dv of [5, 26]) for (const du of [3, 11]) { R(u + du, dv, 2, 2, tresClair); R(u + du + 1, dv + 1, 1, 1, joint); } }
      R(0, 0, 32, 2, sombre); R(0, 30, 32, 2, sombre); R(0, 15, 32, 1, sombre);
      break;
    }
    default: { // roche : gros blocs irréguliers
      let u = 0;
      while (u < 32) { const l = 7 + al.entier(8); let v = 2; while (v < 30) { const h = 6 + al.entier(9); const hh = Math.min(h, 30 - v); R(u, v, l - 1, hh - 1, al.chance(0.3) ? sombre : base); R(u, v, l - 1, 1, clair); R(u, v, 1, hh - 1, clair); R(u + l - 1, v, 1, hh, joint); R(u, v + hh - 1, l, 1, joint); v += hh; } u += l; }
      R(0, 0, 32, 2, sombre); R(0, 30, 32, 2, sombre);
    }
  }
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
  heritage: { cadre: '#a07a20', lum: '#ffe070', sym: 'etoile' },
  boutique: { cadre: '#4a3020', lum: '#58d08a', sym: 'piece' },
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
