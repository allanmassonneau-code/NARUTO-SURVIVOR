// ═══════════════════════════════════════════════════════════════════════════
// HUD : santé (haut gauche), actif et charge, ressources, talisman (bas gauche),
// poche (bas droite), minicarte (haut droite), boss (bas centre). Aucun élément
// ne recouvre une porte. Fiche de l'objet proche (phrase, valeurs, ensemble, synergies, prix).
// ═══════════════════════════════════════════════════════════════════════════

// Plaque de HUD : fond translucide, liseré, coins adoucis — lisible sur n'importe quel sol
function plaqueHUD(g, x, y, l, h, lisere = '#4a3c5c') {
  x = Math.round(x); y = Math.round(y); l = Math.round(l); h = Math.round(h);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x + 1, y + 2, l, h);
  g.fillStyle = 'rgba(14,10,20,0.8)'; g.fillRect(x + 1, y, l - 2, h); g.fillRect(x, y + 1, l, h - 2);
  g.fillStyle = lisere; g.fillRect(x + 2, y, l - 4, 1); g.fillRect(x + 2, y + h - 1, l - 4, 1); g.fillRect(x, y + 2, 1, h - 4); g.fillRect(x + l - 1, y + 2, 1, h - 4);
  g.fillRect(x + 1, y + 1, 1, 1); g.fillRect(x + l - 2, y + 1, 1, 1); g.fillRect(x + 1, y + h - 2, 1, 1); g.fillRect(x + l - 2, y + h - 2, 1, 1);
  g.fillStyle = 'rgba(255,240,220,0.08)'; g.fillRect(x + 2, y + 1, l - 4, 1);
}
// Invite tant que le navigateur retient le son (haut-parleur barré + consigne)
function inviteSon(g, cx, y) {
  const t = 'Son en attente : cliquez dans la fenêtre ou appuyez sur une touche', w = Police.largeur(t) + 30, x = Math.round(cx - w / 2);
  plaqueHUD(g, x, y, w, 17, '#a07a3a');
  g.fillStyle = '#f0d8b0'; g.fillRect(x + 7, y + 6, 3, 5); g.fillRect(x + 10, y + 5, 1, 7); g.fillRect(x + 11, y + 4, 1, 9); g.fillRect(x + 12, y + 3, 1, 11);
  g.fillStyle = '#ff7a5a'; for (let k = 0; k < 5; k++) { g.fillRect(x + 15 + k, y + 6 + k, 1, 1); g.fillRect(x + 19 - k, y + 6 + k, 1, 1); }
  Police.ecrire(g, t, x + 24, y + 5, '#f4e0c0');
}
// Un bandeau (objet, transformation, synergie, étage) occupe le haut de l'écran : les notifications attendent.
// Celui d'un objet s'affiche aussitôt (il remplace un autre bandeau d'objet) ; transformations et synergies
// passent ensuite, sans jamais être perdues. Le titre d'étage et l'intro de boss retiennent la file.
function dureeBanniere(B) { return B.mineur ? 1.6 : 2.6; }
function annoncer(b) {
  const F = G.banniereFile || (G.banniereFile = []), B = G.banniere;
  if (!B || B.t >= dureeBanniere(B)) { G.banniere = b; return; }
  if (b.synergie || b.transformation) { F.push(b); return; }
  if (B.synergie || B.transformation) { B.t = 0; F.unshift(B); }
  G.banniere = b;
}
// Message d'écran : un texte identique encore affiché est remplacé, jamais empilé
function texteEcran(o) { G.textes = G.textes.filter(x => !(x.ecran && x.t === o.t)); o.ecran = true; G.textes.push(o); }
function bannieresRetenues() { const E = G.banniereEtage; return !!(E && E.t < 3.2 || G.introBoss); }
function banniereVisible() { const B = G.banniere; return !!(B && B.t < dureeBanniere(B) || bannieresRetenues()); }
// Icône d'une synergie : ses deux premiers composants (ou ses deux natures), coupés en diagonale par une couture
// d'or — chaque synergie a la sienne ; un trio ajoute un point de couleur du troisième. Repli : deux anneaux enlacés.
const ICONE_NATURE = { katon: 'PSV_043', futon: 'PSV_046', suiton: 'PSV_044', raiton: 'PSV_045', doton: 'PSV_047', hyoton: 'PSV_050' };
const _iconesSyn = {};
function iconeSynergie(id) {
  const s = id && INDEX[id]; if (!s) return anneauxSynergie(); if (_iconesSyn[id]) return _iconesSyn[id];
  const src = (s.composants && s.composants.length ? s.composants : (s.elements || []).map(n => ICONE_NATURE[n])).filter(x => x && INDEX[x]);
  if (src.length < 2) return (_iconesSyn[id] = anneauxSynergie());
  const A = ctxDe(iconeObjet(src[0])).getImageData(0, 0, 20, 20).data, B = ctxDe(iconeObjet(src[1])).getImageData(0, 0, 20, 20).data;
  const c = toile(20, 20), g = ctxDe(c), img = g.createImageData(20, 20), d = img.data, or = s.type === 'fusion' ? [90, 224, 208] : [240, 200, 80];
  for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) {
    const i = (y * 20 + x) * 4, k = x + y;
    if (k === 19 || k === 20) { if (A[i + 3] > 40 || B[i + 3] > 40) { d[i] = or[0]; d[i + 1] = or[1]; d[i + 2] = or[2]; d[i + 3] = 255; } continue; }
    const S = k < 19 ? A : B; d[i] = S[i]; d[i + 1] = S[i + 1]; d[i + 2] = S[i + 2]; d[i + 3] = S[i + 3];
  }
  g.putImageData(img, 0, 0);
  if (src[2]) { const t = INDEX[src[2]]; g.fillStyle = CONTOUR; g.fillRect(15, 0, 5, 5); g.fillStyle = (t.icone && t.icone.a) || '#f0c040'; g.fillRect(16, 1, 3, 3); }
  return (_iconesSyn[id] = c);
}
let _iconeSyn = null;
function anneauxSynergie() {
  if (_iconeSyn) return _iconeSyn; const c = toile(20, 20), g = ctxDe(c);
  g.drawImage(anneau(6, 2, '#1c1420'), 1, 3); g.drawImage(anneau(6, 2, '#1c1420'), 7, 3); g.drawImage(anneau(5, 2, '#5ae0d0'), 3, 5); g.drawImage(anneau(5, 2, '#e8c050'), 8, 5);
  g.fillStyle = '#5ae0d0'; g.fillRect(9, 7, 2, 2); return (_iconeSyn = c);
}
function losange(g, x, y, c, n = 2) { x = Math.round(x); y = Math.round(y); g.fillStyle = c; for (let k = -n; k <= n; k++) { const w = n - Math.abs(k); g.fillRect(x - w, y + k, 2 * w + 1, 1); } }
// Bandeau cinématographique : bords estompés, filets dorés, losanges au centre
function bandeau(g, x, y, w, h, accent, fond = 'rgba(8,6,12,0.86)') {
  x = Math.round(x); y = Math.round(y); w = Math.round(w);
  const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, 'rgba(8,6,12,0)'); gr.addColorStop(0.1, fond); gr.addColorStop(0.9, fond); gr.addColorStop(1, 'rgba(8,6,12,0)');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  const gl = g.createLinearGradient(x, 0, x + w, 0); gl.addColorStop(0, 'rgba(0,0,0,0)'); gl.addColorStop(0.2, accent); gl.addColorStop(0.8, accent); gl.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gl; g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1);
  losange(g, x + w / 2, y, accent); losange(g, x + w / 2, y + h - 1, accent);
}
let _traceBoss = null;
let _crane = null;
function pictoCrane() { return _crane || (_crane = contourner(avecMarge(peindre(['.wwwww.', 'wwwwwww', 'wkkwkkw', 'wkkwkkw', 'wwwkwww', '.wwwww.', '.w.w.w.'], { w: '#efe6d2', k: '#3a1420' }), 1), '#140e18')); }
// Compteurs qui « sautent » quand ils changent : { b: 0 → 1 → 0 en 0,3 s, s: +1 gain, −1 perte }
let _hudPartie = null; const _hud = {};
function bosseHUD(cle, v) {
  if (_hudPartie !== G.partie) { _hudPartie = G.partie; for (const k in _hud) delete _hud[k]; }
  const h = _hud[cle] || (_hud[cle] = { v, t: -9, s: 0 });
  if (v !== h.v) { h.s = v > h.v ? 1 : -1; h.v = v; h.t = G.temps; }
  const k = (G.temps - h.t) / 0.3; return k >= 0 && k < 1 ? { b: Math.sin(k * Math.PI), s: h.s } : null;
}
// Portrait du personnage (pause, inventaire, mort) : dessiné de face dans une petite toile, affiché ×2
const _portraits = {};
function portraitPerso(cle) {
  if (_portraits[cle]) return _portraits[cle];
  const c = toile(36, 44), g = ctxDe(c); dessinerPerso(g, cle, 18, 41, { dirCorps: 'bas', dirTete: 'bas', frame: 0, etatTete: 'normal' });
  return (_portraits[cle] = c);
}
// ── Éléments du HUD ──
// Texte cerné de sombre : lisible sur n'importe quel sol, sans plaque
function texteHUD(g, t, x, y, c, o = {}) { Police.ecrire(g, t, x, y, c, Object.assign({ contour: '#140e18' }, o)); }
// Écrin laqué (technique, talisman, poche) : bord sombre, liseré d'or chaud, fond dégradé, coins sertis
function ecrinHUD(g, x, y, t, accent) {
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x + 1, y + 2, t, t);
  g.fillStyle = '#0c0810'; g.fillRect(x, y, t, t);
  const gr = g.createLinearGradient(0, y, 0, y + t); gr.addColorStop(0, '#3a2834'); gr.addColorStop(1, '#170f17'); g.fillStyle = gr; g.fillRect(x + 1, y + 1, t - 2, t - 2);
  g.fillStyle = accent || '#7a5a34'; g.fillRect(x + 1, y + 1, t - 2, 1); g.fillRect(x + 1, y + 1, 1, t - 2);
  g.fillStyle = accent ? nuancer(accent, 0.6) : '#2a1a22'; g.fillRect(x + 1, y + t - 2, t - 2, 1); g.fillRect(x + t - 2, y + 2, 1, t - 3);
  g.fillStyle = accent || '#e0b860'; for (const [cx, cy, dx, dy] of [[x, y, 1, 1], [x + t - 1, y, -1, 1], [x, y + t - 1, 1, -1], [x + t - 1, y + t - 1, -1, -1]]) { g.fillRect(cx, cy, 1, 1); g.fillRect(cx + dx, cy, 1, 1); g.fillRect(cx, cy + dy, 1, 1); }
}
// Jauge de la technique : segments de charge, ou temps de recharge ; or quand elle est prête, orange au-delà
function jaugeActif(g, x, y, l, h, J, pret) {
  const d = INDEX[J.actif.id];
  g.fillStyle = '#0c0810'; g.fillRect(x, y, l, h); g.fillStyle = '#1e1622'; g.fillRect(x + 1, y + 1, l - 2, h - 2);
  const H = h - 2, X = x + 1, L = l - 2, Y = y + 1, plein = pret ? '#f0c848' : '#4a9ae8', clair = pret ? '#fff4b0' : '#a8d8ff', sombre = pret ? '#a07818' : '#2a5aa8';
  const barre = (yb, hb, c1, c2, c3) => { g.fillStyle = c1; g.fillRect(X, yb, L, hb); g.fillStyle = c2; g.fillRect(X, yb, 1, hb); g.fillStyle = c3; g.fillRect(X + L - 1, yb, 1, hb); };
  if (d.recharge) { const k = Math.min(1, (J.actif.temps || 0) / d.recharge), hb = Math.round(H * k); if (hb > 0) barre(Y + H - hb, hb, plein, clair, sombre); }
  else if (d.unique) barre(Y, H, '#f0c848', '#fff4b0', '#a07818');
  else {
    const max = chargesMax(d), n = Math.min(max, J.actif.charges), hs = H / max;
    for (let k = 0; k < max; k++) { const yb = Math.round(Y + H - (k + 1) * hs), hb = Math.max(1, Math.round(hs) - 1); if (k < n) barre(yb + 1, hb, plein, clair, sombre); else { g.fillStyle = '#2c2434'; g.fillRect(X, yb + 1, L, hb); } }
    if (J.actif.charges > max) { const hb = Math.round(H * Math.min(1, (J.actif.charges - max) / max)); barre(Y + H - hb, hb, '#ff9a3a', '#ffd0a0', '#b0581a'); }
  }
}
// Pictogrammes 7 × 7 des statistiques et des chances d'opportunité
const PICTOS_HUD = {
  degats: [['.....ll', '....lal', '...lal.', '..lal..', '.bal...', 'bbb....', '.b.....'], { l: '#f4f8ff', a: '#a8b4c4', b: '#c8343a' }],
  cadence: [['yy..yy.', '.yy..yy', '..yy..y', '.yy..yy', 'yy..yy.'], { y: '#f8d040' }],
  portee: [['....c..', '....cc.', 'c.c.ccc', '....cc.', '....c..'], { c: '#6ad8f0' }],
  vitesseTir: [['...oo..', 'll.oooo', '...oooo', 'll.oooo', '...oo..'], { o: '#f8963a', l: '#ffd0a0' }],
  vitesse: [['...bb..', '...bb..', '...bbb.', '...bbbb', '.bbbbbb', 'bbbbbbb', 'l.l.l..'], { b: '#6ad86a', l: '#c8ffc0' }],
  chance: [['.gg.gg.', 'ggg.ggg', '.ggggg.', '...g...', '.ggggg.', 'ggg.ggg', '.gg.gg.'], { g: '#5ac85a' }],
  pacte: [['..rrr..', '.rrkrr.', 'rrrkrrr', 'rrrkrrr', 'rrrkrrr', '.rrkrr.', '..rrr..'], { r: '#e03a3a', k: '#1c0810' }],
  sanctuaire: [['.ooooo.', 'o.....o', '.ooooo.', '...w...', '..www..', '.wwwww.', '..www..'], { o: '#f8d050', w: '#f4f0ff' }],
};
const _pictos = {};
function pictoHUD(nom) { return _pictos[nom] || (_pictos[nom] = contourner(avecMarge(peindre(...PICTOS_HUD[nom]), 1), '#140e18')); }
// Statistiques (façon « Found HUD ») : pictogramme, valeur, variation récente en vert ou rouge
let _statsPartie = null; const _statsMem = {};
function valeursStats(J) { const S = J.stats; return [['degats', S.degats], ['cadence', S.cadence * J.profil.coefCadence], ['portee', S.portee], ['vitesseTir', S.vitesseTir], ['vitesse', S.vitesse], ['chance', S.chance]]; }
const NOMS_STATS = { degats: 'Dégâts', cadence: 'Cadence', portee: 'Portée', vitesseTir: 'Vitesse des tirs', vitesse: 'Vitesse', chance: 'Chance', pacte: 'Pacte', sanctuaire: 'Sanctuaire' };
function dessinerStats(g, J, x, y, o = {}) {
  if (_statsPartie !== G.partie) { _statsPartie = G.partie; for (const k in _statsMem) delete _statsMem[k]; }
  const pas = o.pas || 11, f = v => formatNombre(arrondi(v, 2)); let yy = y;
  for (const [k, v] of valeursStats(J)) {
    const M = _statsMem[k] || (_statsMem[k] = { v, t: -9, d: 0 }); if (Math.abs(v - M.v) > 1e-6) { M.d = v - M.v; M.v = v; M.t = G.temps; }
    g.drawImage(pictoHUD(k), x - 1, yy - 1);
    if (o.noms) texteHUD(g, NOMS_STATS[k], x + 11, yy, '#b8b0c8');
    const vx = o.noms ? x + (o.largeur || 120) : x + 11; texteHUD(g, f(v), vx, yy, '#f4ecd8', o.noms ? { a: 'd' } : {});
    const age = G.temps - M.t; if (age < 2.5 && !o.noms) { g.globalAlpha = Math.min(1, (2.5 - age) / 0.6); texteHUD(g, (M.d > 0 ? '+' : '−') + f(Math.abs(M.d)), vx + Police.largeur(f(v)) + 3, yy, M.d > 0 ? '#7af07a' : '#ff7a6a'); g.globalAlpha = 1; }
    yy += pas;
  }
  // chances d'opportunité après le boss de l'étage (E §6), recalculées à chaque image
  const O = chanceOpportunite(), pc = v => Math.round(v * 100) + ' %';
  yy += 2; g.fillStyle = 'rgba(255,240,220,0.14)'; g.fillRect(x, yy - 3, o.noms ? (o.largeur || 120) : 46, 1);
  for (const [k, v, c] of [['pacte', O.pacte, '#ff8a8a'], ['sanctuaire', O.sanctuaire, '#ffe08a']]) {
    g.drawImage(pictoHUD(k), x - 1, yy - 1);
    if (o.noms) texteHUD(g, NOMS_STATS[k], x + 11, yy, '#b8b0c8');
    texteHUD(g, pc(O.chance > 0 ? v : 0), o.noms ? x + (o.largeur || 120) : x + 11, yy, O.chance > 0 ? c : '#8a8098', o.noms ? { a: 'd' } : {});
    yy += pas;
  }
  return yy;
}
// Voile très doux derrière la colonne gauche et la minicarte (grandes salles : sol clair sous le HUD)
let _voileHUD = null;
function voileHUD(g) {
  if (!_voileHUD) { const c = toile(ECRAN_L, ECRAN_H), v = ctxDe(c); const gl = v.createLinearGradient(0, 0, 90, 0); gl.addColorStop(0, 'rgba(8,5,12,0.42)'); gl.addColorStop(1, 'rgba(8,5,12,0)'); v.fillStyle = gl; v.fillRect(0, 0, 90, ECRAN_H); const gh = v.createLinearGradient(0, 0, 0, 44); gh.addColorStop(0, 'rgba(8,5,12,0.4)'); gh.addColorStop(1, 'rgba(8,5,12,0)'); v.fillStyle = gh; v.fillRect(0, 0, ECRAN_L, 44); _voileHUD = c; }
  g.drawImage(_voileHUD, 0, 0);
}
// Pastille de touche (« RT », « Q »…) à côté d'une commande
function pastilleTouche(g, t, x, y) { const w = Police.largeur(t) + 6; g.fillStyle = '#0c0810'; g.fillRect(x, y, w, 11); g.fillStyle = '#3a2c44'; g.fillRect(x + 1, y + 1, w - 2, 9); g.fillStyle = '#5a4a68'; g.fillRect(x + 1, y + 1, w - 2, 1); Police.ecrire(g, t, x + 3, y + 2, '#f0d8a0'); return w; }
function dessinerHUD(g) {
  const J = G.joueur; if (!J) return;
  const S = J.sante, calme = G.reglages.sansFlash;
  voileHUD(g);
  // ── technique : écrin laqué, jauge à segments ; lueur et étincelles quand elle est prête ──
  const pret = actifPret(J);
  if (J.actif && pret && !calme) { g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = 0.3 + 0.12 * Math.sin(G.temps * 4); g.drawImage(halo('#ffc850', false, 40), -5, -5, 44, 44); g.restore(); }
  ecrinHUD(g, 3, 3, 30, pret ? '#e8c050' : null);
  if (J.actif) {
    g.drawImage(iconeObjet(J.actif.id), 8, 8); jaugeActif(g, 34, 3, 6, 30, J, pret);
    if (pret && !calme) { const k = Math.floor(G.temps * 6) % 4, P = [[3, 3], [32, 3], [32, 32], [3, 32]][k]; g.fillStyle = '#fffbe0'; g.fillRect(P[0] - 1, P[1], 3, 1); g.fillRect(P[0], P[1] - 1, 1, 3); }
  }
  let yRes = 42;
  if (J.actif2) { ecrinHUD(g, 3, 37, 22, null); g.drawImage(iconeObjet(J.actif2.id), 4, 38); yRes = 64; }
  // ── santé : cœurs de 9 × 8, six par rangée ; tremblent à la perte, s'illuminent au gain ──
  if (santeTotale(S) <= 2 && !calme && J.etat !== 'mort') { g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = 0.25 + 0.2 * Math.sin(G.temps * 5); g.drawImage(halo('#ff2030', false, 50), 34, -14, 54, 40); g.restore(); }
  const bs = bosseHUD('sante', santeTotale(S) + S.cont.length * 0.01), sx = bs && bs.s < 0 && !calme ? Math.round(Math.sin(G.temps * 70) * 2 * bs.b) : 0;
  let i = 0; const pos = k => [44 + sx + (k % 6) * 10, 4 + Math.floor(k / 6) * 10];
  for (const c of S.cont) { const [x, y] = pos(i++); const set = c.t === 'os' ? ICONES.os : ICONES.vit; g.drawImage(set[c.p], x, y); }
  for (let k = 0; k < S.prot.length; k += 2) { const [x, y] = pos(i++); const t = S.prot[k] === 'n' ? ICONES.noir : ICONES.bleu; g.drawImage(t[k + 1 < S.prot.length ? 2 : 1], x, y); }
  for (let k = 0; k < S.cicatrices; k++) { const [x, y] = pos(i++); g.drawImage(ICONES.cicatrice, x, y); }
  if (S.partiel) { const [x, y] = pos(0); g.drawImage(ICONES.partiel, x + 1, y); }
  if (bs && !calme) { g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = (bs.s > 0 ? 0.45 : 0.35) * bs.b; g.drawImage(halo(bs.s > 0 ? '#ffe8a0' : '#ff3040', false, 64), 34, -16, 80, 50); g.restore(); }
  if (G.degatsEnnemis >= 2) texteHUD(g, '×2', 44 + Math.min(6, i) * 10 + 2, 6, '#ff8a6a'); // rappel : coups d'un cœur entier
  // ── ressources : icône et compteur cernés, sans plaque ──
  const res = [[ICONES.ryo, J.ryo], [ICONES.explosif, J.explosifsDores ? 99 : J.explosifs], [ICONES.cle, J.clesDorees ? 99 : J.cles]];
  res.forEach(([ic, n], k) => {
    const b = bosseHUD('res' + k, n), dy = b ? -Math.round(3 * b.b) : 0, y = yRes + k * 13;
    g.drawImage(ic, 5 + Math.floor((11 - ic.width) / 2), y + Math.floor((9 - ic.height) / 2) + dy);
    texteHUD(g, String(n).padStart(2, '0'), 19, y + dy, b && b.b > 0.15 ? (b.s > 0 ? '#ffd040' : '#ff6a5a') : n > 0 ? '#f4ecd8' : '#9a90a8');
  });
  // ── compteurs de règle du personnage ──
  const lignes = [];
  if (J.def.regleCode === 'controle_chakra') lignes.push(['Force ' + J.force + '/' + plafondForce(J), '#ff9ac0']);
  if (J.def.regleCode === 'sceau_centaine') lignes.push(['Sceau ' + J.sceau + '/' + plafondSceau(J), '#ff9ac0']);
  if (J.def.regleCode === 'clones_ressource') lignes.push(['Clones ' + J.clones + '/' + plafondClones(J), '#ffc060']);
  if (J.coeursReserve > 0) lignes.push(['Cœurs ' + J.coeursReserve, '#6ad060']);
  if (J.def.regleCode === 'trois_marionnettes') lignes.push([{ karasu: 'Karasu', kuroari: 'Kuroari', sanshouo: 'Sanshōuo' }[J.marionnette || 'karasu'], '#c0a0ff']);
  let yx = yRes + 42;
  for (const [t, c] of lignes) { texteHUD(g, t, 5, yx, c); yx += 11; }
  // ── statistiques et chances de pacte / sanctuaire ──
  if (G.reglages.afficherStats) dessinerStats(g, J, 6, yx + 4);
  // ── talismans (bas gauche) et poche (bas droite) ──
  if (J.talisman) { ecrinHUD(g, 3, 332, 24, '#a07a4a'); g.drawImage(iconeObjet(J.talisman), 5, 334); if (J.talisman2) { ecrinHUD(g, 29, 332, 24, '#a07a4a'); g.drawImage(iconeObjet(J.talisman2), 31, 334); } }
  if (J.poches.length) {
    const c = J.poches[0]; const s = c.type === 'pilule' ? spriteRamassable('pilule', G.partie.pilules.indexOf(c.id)) : iconeObjet(c.id);
    const nom = c.type === 'pilule' ? nomPilule(c) : INDEX[c.id].nom;
    ecrinHUD(g, 613, 332, 24, '#6aa07a'); g.drawImage(s, 625 - Math.round(s.width / 2), 344 - Math.round(s.height / 2));
    texteHUD(g, nom, 608, 341, '#f0e8f8', { a: 'd' });
    const tch = Entrees.libelle('poche'); if (tch) pastilleTouche(g, tch, 608 - Police.largeur(nom) - Police.largeur(tch) - 12, 339);
    if (J.poches.length > 1) texteHUD(g, '+' + (J.poches.length - 1), 636, 322, '#c8c0d8', { a: 'd' });
  }
  dessinerMinicarte(g, 568, 6, false);
  // ── boss : cadre orné, crâne, crans aux seuils de phase, traîne claire des dégâts récents ──
  const boss = G.ennemis.filter(e => e.boss && !e.mort);
  if (boss.length) {
    const tot = boss.reduce((a, e) => a + e.pv, 0), max = boss.reduce((a, e) => a + e.pvMax, 0); const w = 272, x0 = 320 - w / 2 + 6, y0 = 343;
    if (!_traceBoss || _traceBoss.max !== max) _traceBoss = { max, v: tot };
    _traceBoss.v = tot < _traceBoss.v ? Math.max(tot, _traceBoss.v - max * 0.003 - (_traceBoss.v - tot) * 0.035) : tot;
    const C = boss[0].championBoss && CHAMPIONS_BOSS[boss[0].championBoss], acc = C ? C.couleur : '#c8a060';
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x0 - 17, y0 - 3, w + 22, 12);
    g.fillStyle = '#0c0810'; g.fillRect(x0 - 1, y0 - 1, w + 2, 8); g.fillStyle = '#2a0c14'; g.fillRect(x0, y0, w, 6);
    g.fillStyle = '#f4dcc0'; g.fillRect(x0, y0, Math.round(w * _traceBoss.v / max), 6);
    const pw = Math.round(w * tot / max), gb = g.createLinearGradient(0, y0, 0, y0 + 6); gb.addColorStop(0, '#ff6a5a'); gb.addColorStop(0.35, '#d8283a'); gb.addColorStop(1, '#7a1024'); g.fillStyle = gb; g.fillRect(x0, y0, pw, 6);
    g.fillStyle = 'rgba(255,220,200,0.5)'; g.fillRect(x0, y0, pw, 1);
    const ph = boss.length === 1 && boss[0].def.phases ? boss[0].def.phases.map(p => p.seuil).filter(v => v > 0 && v < 1) : [0.25, 0.5, 0.75];
    for (const v of ph) { const xx = x0 + Math.round(w * v); g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(xx, y0, 1, 6); g.fillStyle = acc; g.fillRect(xx, y0 - 2, 1, 2); }
    g.fillStyle = acc; g.fillRect(x0 - 1, y0 - 2, w + 2, 1); g.fillRect(x0 - 1, y0 + 7, w + 2, 1);
    // crâne à gauche, losange à droite
    g.drawImage(pictoCrane(), x0 - 16, y0 - 3); losange(g, x0 + w + 5, y0 + 3, acc);
    const nomB = boss[0].def.nom + (C ? ' · champion ' + C.nom : '');
    texteHUD(g, nomB, 320, y0 - 13, C ? nuancer(C.couleur, 1.3) : '#f8e0d4', { a: 'c' });
  } else _traceBoss = null;
  // bannières et panneaux
  if (G.banniere && !bannieresRetenues()) dessinerBanniere(g);
  if (G.banniereEtage) dessinerBanniereEtage(g);
  // fiche de l'objet proche (façon « External Item Descriptions ») : d'elle-même, ou au maintien de Description
  if (!G.transition && !banniereVisible() && !Entrees.enfonce('carte') && (G.reglages.descriptionsAuto !== false || Entrees.enfonce('description'))) dessinerFicheProche(g);
  if (G.achatPropose) dessinerPanneauAchat(g, G.achatPropose);
  if (Entrees.enfonce('carte') && !G.transition) dessinerCarteEtendue(g);
  // messages d'écran : le plus récent en bas, les précédents empilés au-dessus, coupés à 460 px
  { const M = G.textes.filter(t => t.ecran); let y = 300; for (let i = M.length - 1; i >= 0 && y > 200; i--) { const t = M[i], k = t.age / t.duree, lignes = Police.couper(t.t, 460); g.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : Math.min(1, t.age / 0.12); for (let j = lignes.length - 1; j >= 0; j--) { Police.ecrire(g, lignes[j], 320, y, t.couleur || '#fff', { a: 'c', contour: '#1c1420' }); y -= 12; } y -= 4; } g.globalAlpha = 1; }
  if (G.flashDegat > 0 && !G.reglages.sansFlash) { g.save(); g.globalAlpha = Math.min(1, G.flashDegat * 1.2); const v = g.createRadialGradient(320, 180, 150, 320, 180, 380); v.addColorStop(0, 'rgba(160,10,28,0)'); v.addColorStop(1, 'rgba(160,10,28,0.75)'); g.fillStyle = v; g.fillRect(0, 0, ECRAN_L, ECRAN_H); g.restore(); }
  if (G.introBoss) dessinerIntroBoss(g);
  if (G.fondu) { g.globalAlpha = Math.min(1, G.fondu.t / (G.fondu.duree / 2)); g.fillStyle = '#000'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); g.globalAlpha = 1; }
  if (Son.suspendu()) inviteSon(g, 320, 4);
  if (Entrees.maintien.deposer > 0.15 && (J.talisman || J.poches.length)) { const k = Math.min(1, Entrees.maintien.deposer / DUREE_DEPOT); plaqueHUD(g, 282, 244, 76, 28); Police.ecrire(g, 'Déposer…', 320, 250, '#f0e0c0', { a: 'c' }); g.fillStyle = '#14101c'; g.fillRect(290, 262, 60, 4); g.fillStyle = '#f0e0c0'; g.fillRect(290, 262, Math.round(60 * k), 4); }
}
// Notification (mission accomplie, secret découvert) : glisse depuis la droite sous la minicarte
function dessinerNotification(g, n) {
  const k = Math.min(1, n.t / 0.25), sortie = n.t > 2.7 ? (n.t - 2.7) / 0.3 : 0, w = Math.max(150, Police.largeur(n.nom) + 40, Police.largeur(n.titre) + 40), x = Math.round(636 - w + (1 - k) * (w + 10) + sortie * (w + 10)), y = 100;
  const secret = /secret/i.test(n.titre), acc = secret ? '#8ac8ff' : '#e8c050';
  g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x + 1, y + 2, w, 30); g.fillStyle = 'rgba(14,10,20,0.92)'; g.fillRect(x, y, w, 30);
  g.fillStyle = acc; g.fillRect(x, y, 2, 30); g.fillStyle = nuancer(acc, 0.5); g.fillRect(x + 2, y, w - 2, 1); g.fillRect(x + 2, y + 29, w - 2, 1);
  if (secret) { g.drawImage(pictoHUD('chance'), x + 8, y + 11); } else { g.fillStyle = acc; for (let i = 0; i < 5; i++) { const a = (i * 72 - 90) * Math.PI / 180; g.fillRect(Math.round(x + 13 + Math.cos(a) * 4), Math.round(y + 15 + Math.sin(a) * 4), 2, 2); } g.fillRect(x + 12, y + 14, 3, 3); }
  Police.ecrire(g, n.titre, x + 24, y + 5, acc); Police.ecrire(g, n.nom, x + 24, y + 17, '#fff0d8');
}
function dessinerBanniere(g) {
  const B = G.banniere; const d = dureeBanniere(B); if (B.t > d) return;
  const a = B.t < 0.15 ? B.t / 0.15 : B.t > d - 0.4 ? (d - B.t) / 0.4 : 1;
  g.globalAlpha = a;
  const y = B.transformation ? 130 : 84; const e = Police.largeur(B.nom) * 2 > 420 ? 1 : 2, ic = B.id ? (String(B.id).startsWith('SYN_') ? iconeSynergie(B.id) : B.pilule ? null : iconeObjet(B.id)) : null;
  const wNom = Police.largeur(B.nom) * e + (ic ? 26 : 0), w = Math.max(wNom, Police.largeur(B.desc || '')) + 24, cx = 320 + (ic ? 13 : 0);
  bandeau(g, 320 - w / 2 - 30, y - 7, w + 60, B.desc ? 38 : 26, B.transformation ? '#f0c040' : B.synergie ? '#5ae0d0' : B.pilule ? '#a0e0a0' : '#d8c8a0');
  if (ic) { const ix = Math.round(320 - wNom / 2) - 2, iy = y - 4 + (e === 2 ? 0 : -3); g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(ix, iy + 1, 21, 20); g.drawImage(ic, ix, iy); }
  Police.ecrire(g, B.nom, cx, y, B.transformation ? '#ffe080' : B.synergie ? '#b8fff4' : '#fff4e0', { a: 'c', e, contour: '#1c1420' });
  if (B.desc) Police.ecrire(g, B.desc, 320, y + 20, '#c8c0d8', { a: 'c' });
  g.globalAlpha = 1;
}
function dessinerBanniereEtage(g) {
  const B = G.banniereEtage; const d = 3.2; if (B.t > d) return;
  const a = B.t < 0.3 ? B.t / 0.3 : B.t > d - 0.6 ? (d - B.t) / 0.6 : 1; g.globalAlpha = a;
  // tiers supérieur de la salle (jamais sur les portes ni au centre) ; nom de zone en grand, lieu en dessous
  const [zone, lieu] = B.nom.split(/ [—-] /); const e = Police.largeur(zone) * 2 <= 420 ? 2 : 1;
  const h = 6 + 11 + (e === 2 ? 18 : 11) + (lieu ? 11 : 0) + (B.desc ? 12 : 0) + 3; const y0 = 84;
  const w = Math.min(440, Math.max(Police.largeur(zone) * e, Police.largeur(B.desc || ''), Police.largeur(lieu || '')) + 28);
  bandeau(g, 320 - w / 2 - 40, y0, w + 80, h, '#c8a870');
  let y = y0 + 5; Police.ecrire(g, B.titre, 320, y, '#a898b8', { a: 'c' }); y += 11;
  Police.ecrire(g, zone, 320, y, '#f4e8d0', { a: 'c', e, contour: '#1c1420' }); y += e === 2 ? 18 : 11;
  if (lieu) { Police.ecrire(g, lieu, 320, y, '#e0c890', { a: 'c' }); y += 11; }
  if (B.desc) Police.ecrire(g, B.desc, 320, y + 1, '#b8b0a0', { a: 'c' });
  g.globalAlpha = 1;
}
function dessinerIntroBoss(g) {
  const I = G.introBoss; const k = I.t / I.duree; const a = k < 0.15 ? k / 0.15 : k > 0.85 ? (1 - k) / 0.15 : 1;
  g.globalAlpha = a; bandeau(g, -40, 128, ECRAN_L + 80, 84, '#c02838', 'rgba(10,6,16,0.9)');
  g.fillStyle = '#6a1020'; g.fillRect(0, 131, ECRAN_L, 1); g.fillRect(0, 208, ECRAN_L, 1);
  const x = lerp(-200, 320, Math.min(1, k * 4));
  // portrait : le boss peint entre par la droite, arme levée, découpé par le bandeau
  const sp = spriteEnnemi({ def: I.d, frame: 0 }), im0 = sp.frames[sp.attaque ? 2 : 0], im = im0 && I.champion ? teinteMemo(im0, CHAMPIONS_BOSS[I.champion].couleur) : im0;
  if (im) { const px = Math.round(lerp(ECRAN_L + 40, ECRAN_L - 120, Math.min(1, k * 3.2))); g.save(); g.beginPath(); g.rect(0, 132, ECRAN_L, 76); g.clip(); g.drawImage(im, px - Math.round(im.width / 2), 207 - im.height + (sp.base || 0)); g.restore(); }
  Police.ecrire(g, I.d.titre || '', x, 146, '#d8a0a0', { a: 'c' });
  Police.ecrire(g, I.d.nom, x, 162, '#fff0e0', { a: 'c', e: 3, contour: '#1c1420' });
  const C = I.champion && CHAMPIONS_BOSS[I.champion];
  if (C) { const t = 'Champion ' + C.nom + ' : ' + C.desc, w = Police.largeur(t); losange(g, x - w / 2 - 8, 194, C.couleur); losange(g, x + w / 2 + 7, 194, C.couleur); Police.ecrire(g, t, x, 190, C.couleur, { a: 'c', contour: '#1c1420' }); }
  g.globalAlpha = 1;
}
function dessinerPanneauAchat(g, p) {
  const J = G.joueur; const v = peutPayer(p); const nom = p.voile ? 'Offre voilée' : p.ramassable ? ({ coeur: 'Cœur de vitalité', cle: 'Clé de sceau', explosif: 'Parchemin explosif', rouleau: 'Rouleau tactique', protection: 'Réserve de chakra', pilule: 'Pilule militaire', condensateur: 'Condensateur de chakra', coeur_double: 'Double cœur' }[p.ramassable]) : INDEX[p.id].nom;
  const L = [nom];
  if (p.prix.type === 'ryo') { const n = prixRyo(p); L.push('Prix : ' + (n === 0 ? 'gratuit (coupon)' : n + ' Ryō' + (n < p.prix.n ? ' (au lieu de ' + p.prix.n + ')' : '')) + ' (vous : ' + J.ryo + ')'); }
  else if (p.prix.type === 'troc') { const t = objetTroc(p); if (t) L.push('Prix : « ' + INDEX[t].nom + ' », cédé pour toujours'); }
  else { // pacte : résultat exact avant confirmation
    const S = J.sante; const apres = copieSante(S);
    if (v.ryo) L.push('Prix : ' + v.ryo + ' Ryō');
    else if (v.instable) L.push('Prix : ' + v.instable + ' demis de chakra instable');
    else if (v.detail) { if (v.detail.type === 'contenants') { retirerConteneur(apres, p.prix.n); L.push('Prix : ' + p.prix.n + ' contenant(s) de vitalité'); } else { apres.prot.splice(-v.detail.n); L.push('Prix : ' + v.detail.n / 2 + ' réserve(s) de chakra'); } L.push('Après : ' + nbVit(apres) + ' contenant(s), santé ' + santeTotale(apres) / 2 + ' cœur(s)'); if (santeTotale(apres) <= 0) L.push('CE PAIEMENT SERAIT MORTEL'); }
  }
  if (!p.ramassable && !p.voile && G.reglages.descriptionsAuto === false) L.push(INDEX[p.id].desc); // sinon : la fiche le décrit déjà
  L.push(v.ok ? 'Confirmer : ' + Entrees.libelle('interagir') : v.manque);
  const w = Math.max(...L.map(l => Police.largeur(l))) + 16, h = L.length * 11 + 8; const x = borne(Math.round(320 - w / 2), 4, 636 - w), y = 250;
  plaqueHUD(g, x, y, w, h, p.prix.type === 'pacte' || p.prix.type === 'troc' ? '#8a2a5a' : '#8a7a4a');
  L.forEach((l, i) => Police.ecrire(g, l, x + 8, y + 5 + i * 11, i === 0 ? '#fff0d0' : l.startsWith('CE PAIEMENT') ? '#ff5050' : i === L.length - 1 ? (v.ok ? '#a0e0a0' : '#ff9a8a') : '#c8c0d8'));
}
// ── Fiche de l'objet proche (façon « External Item Descriptions » d'Isaac) ──
// L'objet le plus proche — piédestal, article de l'échoppe, talisman, rouleau ou pilule au sol — se décrit
// de lui-même dans un cadre en haut à gauche : icône, nom, type et qualité, phrase, valeurs, ensemble en
// cours, synergies avec ce que vous portez, prix, ce qu'il remplacerait, et pourquoi il ne se prend pas encore.
const PORTEE_FICHE = 72; // px entre les pieds et l'objet
const NOMS_RAMASSABLES = { coeur: 'Cœur de vitalité', cle: 'Clé de sceau', explosif: 'Parchemin explosif', rouleau: 'Rouleau tactique', protection: 'Réserve de chakra', pilule: 'Pilule militaire', condensateur: 'Condensateur de chakra', coeur_double: 'Double cœur' };
const DESCS_RAMASSABLES = {
  coeur: 'Soigne un cœur de vitalité.', coeur_double: 'Soigne deux cœurs de vitalité.',
  cle: 'Ouvre l’héritage, l’échoppe, les coffres verrouillés et les blocs à clé.', explosif: 'Un parchemin explosif de plus : rochers, murs secrets, 30 dégâts.',
  rouleau: 'Un rouleau tactique tiré au hasard, pour la poche.', protection: 'Une réserve de chakra : un cœur de protection, sans contenant.',
  pilule: 'Une pilule militaire au hasard : effet inconnu tant qu’elle n’est pas identifiée.', condensateur: 'Recharge votre technique de deux charges.',
};
function cibleFiche() {
  const J = G.joueur, s = G.salle; if (!J || !s || J.etat !== 'normal') return null;
  let best = null, bd = PORTEE_FICHE;
  for (const p of s.piedestaux) { if (!p.id || p.apparu > 0.3) continue; const d = dist(p.x, p.y + 4, J.x, J.y); if (d < bd) { bd = d; best = { p, x: p.x, y: p.y - 14 }; } }
  for (const r of s.ramassables) { if (!r.id || r.pris || !['talisman', 'rouleau', 'pilule'].includes(r.type)) continue; const d = dist(r.x, r.y, J.x, J.y); if (d < bd) { bd = d; best = { r, x: r.x, y: r.y }; } }
  return best;
}
function ficheObjet(c) {
  const J = G.joueur, L = [], ligne = (t, coul, puce) => { if (t) L.push({ t, c: coul || '#b8b0c8', puce }); };
  const F = { icone: null, nom: '', type: '', lisere: '#6a5a8a', etoiles: 0, nouveau: false, lignes: L };
  let d = null;
  if (c.p && c.p.ramassable) { // ressource vendue à l'échoppe
    const t = c.p.ramassable; Object.assign(F, { nom: NOMS_RAMASSABLES[t] || t, icone: spriteRamassable(t), type: 'Ressource', lisere: '#58d08a' });
    ligne(DESCS_RAMASSABLES[t], '#e8e0f0');
  } else if (c.p && c.p.voile) { // pari du serpent
    Object.assign(F, { nom: 'Offre voilée', icone: iconeObjet('?voile'), type: 'Pari du serpent', lisere: '#8a4ab0' });
    ligne('Un objet de qualité 2 ou plus, dévoilé une fois le pacte conclu.', '#e8e0f0');
  } else if (c.p && G.etage && G.etage.malediction === 'aveugle') {
    Object.assign(F, { nom: 'Objet voilé', icone: iconeObjet('?'), type: 'Malédiction aveugle' });
    ligne('Impossible de savoir ce qu’il fait avant de le prendre.', '#e8e0f0');
  } else {
    const id = c.p ? c.p.id : c.r.id; d = INDEX[id]; if (!d) return null;
    const pilule = !!(c.r && c.r.type === 'pilule'), connue = !pilule || G.partie.pilulesIdentifiees.includes(id) || aTalisman(J, 'TAL_014');
    F.nom = pilule ? nomPilule({ id }) : d.nom;
    F.icone = pilule ? spriteRamassable('pilule', c.r.apparence) : iconeObjet(id);
    F.type = { passif: 'Objet passif', actif: 'Technique (actif)', talisman: 'Talisman', consommable: d.famille === 'sceau' ? 'Sceau de poche' : 'Rouleau de poche', pilule: 'Pilule de poche' }[d.type] || '';
    F.lisere = { passif: '#c8a870', actif: '#5aa0e0', talisman: '#c070a0', consommable: '#6ac080', pilule: '#6ac080' }[d.type] || F.lisere;
    F.etoiles = d.type === 'passif' || d.type === 'actif' ? (d.qualite || 0) : 0;
    F.nouveau = ['passif', 'actif', 'talisman'].includes(d.type) && !!Progression.profil && !Progression.profil.decouverts.includes(id); // objets suivis par le registre
    if (!connue) ligne('Effet inconnu : avalez-la pour l’identifier.', '#e8e0f0');
    else {
      ligne(d.desc, '#e8e0f0');
      for (const t of detailsObjet(d)) if (!t.startsWith('Ensemble')) ligne(t, '#b8b0c8', 'point');
      // ensemble en cours (résonance à 3 objets)
      const T = d.ensemble && DON.transformations.find(t => t.ensemble === d.ensemble);
      if (T) {
        const n = J.acquis.filter(x => INDEX[x] && INDEX[x].ensemble === d.ensemble).length, seuil = T.seuil || 3;
        if (J.transformations.includes(T.id)) ligne(T.nom + ' : déjà éveillé', '#c8a870', 'ens');
        else if (J.acquis.includes(id)) ligne(T.nom + ' : ' + n + '/' + seuil + ' (déjà compté)', '#e0c060', 'ens');
        else ligne(T.nom + ' : ' + n + '/' + seuil + (n + 1 >= seuil ? ', se déclenche !' : ' → ' + (n + 1) + '/' + seuil), '#ffd860', 'ens');
      }
      // synergies avec ce que vous portez (déjà réunies : ignorées)
      const tient = x => J.passifs.includes(x) || (J.actif && J.actif.id === x) || (J.actif2 && J.actif2.id === x);
      const vues = J.synergiesVues || [], S = [];
      for (const s of DON.synergies) {
        if (!s.composants.includes(id) || vues.includes(s.id)) continue;
        const autres = s.composants.filter(x => x !== id), ont = autres.filter(tient); if (!ont.length) continue;
        S.push({ s, manque: autres.filter(x => !tient(x)) });
      }
      const E = naturesJoueur(J), mien = (d.effets || []).filter(e => e.element).map(e => e.element);
      if (mien.length) for (const s of DON.synergies) if (s.elements && s.elements.length && !vues.includes(s.id) && s.elements.some(n => mien.includes(n)) && s.elements.every(n => E.has(n) || mien.includes(n)) && !s.elements.every(n => E.has(n))) S.push({ s, manque: [] });
      S.sort((a, b) => a.manque.length - b.manque.length);
      for (const o of S.slice(0, 3)) {
        if (o.manque.length) ligne(o.s.nom + ' : il manque ' + o.manque.map(x => INDEX[x] ? INDEX[x].nom : x).join(', '), '#5ab0a8', 'syn');
        else ligne('Synergie : ' + o.s.nom + ' — ' + o.s.desc, '#7af0e0', 'syn');
      }
    }
    // ce qu'il remplacerait
    if (d.type === 'actif' && J.actif && J.actif.id !== id && !(J.deuxActifs && !J.actif2)) ligne('Remplace ' + INDEX[J.actif.id].nom + ' (qui reste sur le piédestal)', '#ffb080');
    if (d.type === 'talisman' && J.talisman && !(J.maxTalismans > 1 && !J.talisman2)) ligne('Remplace ' + INDEX[J.talisman].nom + ' (qui tombe au sol)', '#ffb080');
    if ((d.type === 'consommable' || d.type === 'pilule') && J.poches.length >= J.maxPoches) { const q = J.poches[0]; ligne('Remplace ' + (q.type === 'pilule' ? nomPilule(q) : INDEX[q.id].nom) + ' (qui tombe au sol)', '#ffb080'); }
  }
  if (c.p) { // piédestal : prix, choix lié, délai
    const p = c.p;
    if (p.prix && p.prix.type === 'ryo') { const n = prixRyo(p); ligne('Prix : ' + (n === 0 ? 'gratuit' : n + ' Ryō') + (n < p.prix.n ? ' (au lieu de ' + p.prix.n + ')' : '') + ' — vous : ' + J.ryo, J.ryo >= n ? '#f8e8b0' : '#ff8a7a', 'ryo'); }
    else if (p.prix && p.prix.type === 'pacte') ligne('Prix du pacte : ' + prixPacteTexte(p), '#ff9ac0', 'pacte');
    else if (p.prix && p.prix.type === 'troc') { const t = objetTroc(p); ligne(t ? 'Échange : le serpent prend « ' + INDEX[t].nom + ' »' : 'Échange : vous n’avez aucun objet à céder', '#ff9ac0', 'pacte'); }
    if (p.groupe && G.salle.piedestaux.some(q => q !== p && q.groupe === p.groupe && q.id)) ligne('Choix lié : le prendre fait disparaître les autres', '#a898b8');
    if (d && d.type === 'actif') { if (J.delaiActif > 0) ligne('Pas d’autre technique avant ' + formatNombre(arrondi(J.delaiActif, 1)) + ' s', '#a898b8'); else if (p.attendSortie) ligne('Éloignez-vous du piédestal, puis revenez pour le prendre', '#a898b8'); }
  }
  return F;
}
function dessinerFicheProche(g) {
  const c = cibleFiche(); if (!c) return; const F = ficheObjet(c); if (!F) return;
  const LU = 236; // largeur utile du texte
  const rangs = [];
  for (const l of F.lignes) { const ind = l.puce ? 9 : 0; Police.couper(l.t, LU - ind).forEach((t, k) => rangs.push({ t, c: l.c, puce: k === 0 ? l.puce : null, ind })); }
  const noms = Police.couper(F.nom, LU - 24), queue = F.etoiles * 7 + (F.nouveau ? Police.largeur('nouveau') + 6 : 0);
  const w = Math.min(LU, Math.max(132, ...noms.map(t => Police.largeur(t) + 24), Police.largeur(F.type) + 30 + queue, ...rangs.map(r => Police.largeur(r.t) + r.ind))) + 12;
  const hTete = Math.max(24, noms.length * 10 + 14), h = hTete + rangs.length * 10 + (rangs.length ? 6 : 0);
  // en haut à gauche ; à droite si l'objet ou le joueur seraient dessous ; en bas à gauche en dernier recours
  const [cx, cy] = camera(G.salle, G.joueur), J = G.joueur;
  const couvre = (x, y) => [[c.x - cx, c.y - cy], [J.x - cx, J.y - 20 - cy]].some(([px, py]) => px > x - 12 && px < x + w + 12 && py > y - 16 && py < y + h + 24);
  let x = 67, y = 40;
  if (couvre(x, y)) { x = 560 - w; if (couvre(x, y)) { x = 67; y = 326 - h; } }
  plaqueHUD(g, x, y, w, h, F.lisere);
  ecrinHUD(g, x + 3, y + 3, 22, F.lisere);
  if (F.icone) g.drawImage(F.icone, x + 4 + Math.floor((20 - F.icone.width) / 2), y + 4 + Math.floor((20 - F.icone.height) / 2));
  noms.forEach((t, k) => Police.ecrire(g, t, x + 28, y + 4 + k * 10, '#fff0d0'));
  const ty = y + 4 + noms.length * 10; Police.ecrire(g, F.type, x + 28, ty, '#9a90b0');
  let ex = x + 28 + Police.largeur(F.type) + 5;
  for (let k = 0; k < F.etoiles; k++) { Police.ecrire(g, '★', ex, ty, '#f0c040'); ex += 7; }
  if (F.nouveau) Police.ecrire(g, 'nouveau', ex + 3, ty, '#8af07a');
  if (!rangs.length) return;
  let yy = y + hTete + 1; g.fillStyle = 'rgba(255,240,220,0.12)'; g.fillRect(x + 4, yy - 3, w - 8, 1);
  for (const r of rangs) {
    if (r.puce === 'point') { g.fillStyle = r.c; g.fillRect(x + 8, yy + 3, 2, 2); }
    else if (r.puce === 'ens') losange(g, x + 9, yy + 3, '#f0c040', 2);
    else if (r.puce === 'syn') losange(g, x + 9, yy + 3, '#5ae0d0', 2);
    else if (r.puce === 'ryo') g.drawImage(ICONES.ryo, x + 5, yy - 1);
    else if (r.puce === 'pacte') { g.fillStyle = '#ff6a8a'; g.fillRect(x + 7, yy + 1, 4, 4); }
    Police.ecrire(g, r.t, x + 6 + r.ind, yy, r.c); yy += 10;
  }
}
// Détails chiffrés générés depuis les valeurs réelles (jamais un texte figé)
function detailsObjet(d) {
  const L = []; const f = v => formatNombre(arrondi(v, 2));
  const noms = { degats: 'dégâts', cadence: 'cadence', portee: 'portée', vitesseTir: 'vitesse des tirs', vitesse: 'vitesse', chance: 'chance', plafondCadence: 'plafond de cadence' };
  for (const e of d.effets || []) {
    if (e.s) { if (e.a) L.push((e.a > 0 ? '+' : '') + f(e.a) + ' ' + noms[e.s]); if (e.p) L.push((e.p > 0 ? '+' : '') + f(e.p) + ' % ' + noms[e.s]); if (e.m) L.push('×' + f(e.m) + ' ' + noms[e.s]); }
    if (e.multi) L.push('+' + e.multi + ' émission(s)' + (e.coefCadence ? ', cadence ×' + f(e.coefCadence) : ''));
    if (e.forme) L.push('Forme de tir : ' + ({ orbe: 'orbe chargé', rayon: 'rayon chargé', laser: 'trait instantané', faisceau: 'faisceau continu', boomerang: 'arme revenante', lame: 'frappe courte', lame_longue: 'frappe étendue', bombe: 'bombe lancée', frappe: 'frappe différée au sol', controle: 'émission contrôlée', rotation: 'attaque circulaire' }[e.forme] || e.forme));
    if (e.traj) L.push('Trajectoire : ' + ({ guidage: 'guidée', rebond: 'ricochet', percant: 'perçante', spectral: 'traverse les obstacles', orbite: 'en orbite', onde: 'ondulante', lent: 'orbe lent (×2 taille)', acceleration: 'accélérée', retour: 'revient' }[e.traj] || e.traj));
    if (e.impact) L.push('Impact : ' + ({ lave: 'coulée de lave', vapeur: 'vapeur brûlante', flaque_electrique: 'flaque électrisée', attraction: 'attraction magnétique', racines: 'racines', explosion: 'explosion', chaine: 'chaîne de foudre', eclat: 'éclatement', mine: 'mine', flamme: 'flammes au sol', flaque: 'flaque', onde: 'onde de choc' }[e.impact]) + (e.coef ? ' (×' + f(e.coef) + ')' : ''));
    if (e.statut) L.push(({ brulure: 'Brûlure', poison: 'Poison', ralenti: 'Ralentissement', immobilise: 'Immobilisation', charme: 'Charme', peur: 'Peur', confus: 'Confusion', gel: 'Gel' }[e.statut]) + ' : ' + Math.round((e.chance || 0) * 100) + ' %' + (e.chanceParChance ? ' + ' + Math.round(e.chanceParChance * 100) + ' % par chance' : '') + (e.max ? ' (max ' + Math.round(e.max * 100) + ' %)' : ''));
    if (e.sante) { const s = e.sante; if (s.cont) L.push('+' + s.cont + ' contenant(s) de vitalité'); if (s.prot) L.push('+' + s.prot / 2 + ' réserve(s) de chakra'); if (s.instable) L.push('+' + s.instable / 2 + ' réserve(s) instable(s)'); if (s.os) L.push('+' + s.os + ' enveloppe(s) osseuse(s)'); if (s.retraitCont) L.push('−' + s.retraitCont + ' contenant(s)'); if (s.cicatrice) L.push('+' + s.cicatrice + ' cicatrice(s) de sceau'); }
    if (e.res) for (const [k, v] of Object.entries(e.res)) L.push('+' + v + ' ' + ({ ryo: 'Ryō', cles: 'clé(s)', explosifs: 'explosif(s)' }[k]));
    if (e.vol) L.push('Lévitation : survole fosses et pièges au sol (pas les murs)');
    if (e.familier) L.push('Familier : ' + ((DON.familiers.find(x => x.id === e.familier) || {}).nom || e.familier));
    if (e.quand) L.push('Déclencheur : ' + e.quand.replace('_', ' ') + (e.chance !== undefined ? ' (' + Math.round(e.chance * 100) + ' %)' : '') + (e.tousLes ? ' tous les ' + e.tousLes : ''));
  }
  if (d.type === 'actif') L.push(d.recharge ? 'Recharge : ' + d.recharge + ' s en combat' : d.unique ? 'Usage unique' : 'Charges : ' + d.charges + ' salle(s)');
  if (d.contrepartie) L.push('Contrepartie : ' + d.contrepartie);
  if (d.composants && d.composants.length) L.push('Composants : ' + d.composants.map(c => INDEX[c] ? INDEX[c].nom : c).join(' + '));
  if (d.elements) L.push('Natures : ' + d.elements.map(n => NOMS_NATURES[n] || n).join(' + '));
  if (d.ensemble) L.push('Ensemble : ' + ((DON.transformations.find(t => t.ensemble === d.ensemble) || {}).nom || d.ensemble));
  return L;
}

// ── Minicarte et carte étendue ──
const ICONE_SALLE = { boss: '#e04a4a', heritage: '#f0c040', boutique: '#58d08a', cache: '#a090a0', isolee: '#a090a0', sacrifice: '#c07070', malediction: '#b04070', defi: '#9090c0', defi_boss: '#c060a0', dispositifs: '#50a0c0', bibliotheque: '#80c060', coffres: '#c0a050', repos: '#60c0c0', pacte: '#8a3aa8', sanctuaire: '#f0f0d0' };
function dessinerMinicarte(g, x0, y0, etendue) {
  const E = G.etage; if (!E) return; const s0 = G.salle;
  const perdu = G.etage.malediction === 'perdu' && !etendue;
  const cw = etendue ? 18 : 9, ch = etendue ? 14 : 7, n = etendue ? 13 : 7;
  const cx = s0.cx >= 0 ? s0.cx : 6, cy = s0.cy >= 0 ? s0.cy : 6;
  const ox = etendue ? Math.round((x0 || 320) - 6.5 * cw) : x0, oy = etendue ? Math.round((y0 || 180) - 6.5 * ch) : y0; // étendue : (x0, y0) = centre
  const dx0 = etendue ? 0 : cx - 3, dy0 = etendue ? 0 : cy - 3;
  if (!etendue) {
    const X = ox - 5, Y = oy - 5, W = n * cw + 10, H = n * ch + 10;
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(X + 1, Y + 2, W, H); g.fillStyle = 'rgba(12,8,18,0.72)'; g.fillRect(X, Y, W, H);
    g.fillStyle = '#5a4630'; g.fillRect(X + 2, Y, W - 4, 1); g.fillRect(X + 2, Y + H - 1, W - 4, 1); g.fillRect(X, Y + 2, 1, H - 4); g.fillRect(X + W - 1, Y + 2, 1, H - 4);
    for (const [cx, cy] of [[X + 1, Y + 1], [X + W - 2, Y + 1], [X + 1, Y + H - 2], [X + W - 2, Y + H - 2]]) { g.fillStyle = '#c8a060'; g.fillRect(cx, cy, 1, 1); }
    if (G.etage.cfg) texteHUD(g, 'Étage ' + G.etage.numero, ox + n * cw / 2, oy + n * ch + 8, '#c8bcd8', { a: 'c' });
  }
  if (perdu) { Police.ecrire(g, '?', ox + n * cw / 2, oy + n * ch / 2 - 4, '#8a8098', { a: 'c' }); return; }
  for (const s of Object.values(E.salles)) {
    if (s.id === 'opp' || !(s.visitee || s.apercue)) continue;
    const F = FORMES[s.forme];
    for (const [i, j] of F.cel) {
      const gx = s.cx + i - dx0, gy = s.cy + j - dy0; if (gx < 0 || gy < 0 || gx >= n || gy >= n) continue;
      const x = ox + gx * cw, y = oy + gy * ch;
      g.fillStyle = s === s0 ? '#f6f0fc' : s.visitee ? '#7a7092' : '#3a3448'; g.fillRect(x, y, cw - 1, ch - 1);
      if (s !== s0 && s.visitee) { g.fillStyle = '#a49ac0'; g.fillRect(x, y, cw - 1, 1); g.fillStyle = '#5a5272'; g.fillRect(x, y + ch - 2, cw - 1, 1); }
      if (s !== s0 && !s.visitee) { g.fillStyle = '#4a4460'; g.fillRect(x, y, cw - 1, 1); }
      // fusion visuelle des cellules d'une grande salle
      if (F.cel.some(([a, b]) => a === i + 1 && b === j)) g.fillRect(x + cw - 1, y, 1, ch - 1);
      if (F.cel.some(([a, b]) => a === i && b === j + 1)) g.fillRect(x, y + ch - 1, cw - 1, 1);
    }
    if (s === s0 && !etendue && !G.reglages.sansFlash) { const gx = s.cx - dx0, gy = s.cy - dy0; if (gx >= 0 && gy >= 0 && gx < n && gy < n) { g.globalAlpha = 0.35 + 0.25 * Math.sin(G.temps * 4); g.strokeStyle = '#fff8e0'; g.lineWidth = 1; g.strokeRect(ox + gx * cw - 1.5, oy + gy * ch - 1.5, cw + 2, ch + 2); g.globalAlpha = 1; } }
    const ic = ICONE_SALLE[s.type];
    if (ic && (s.visitee || s.apercue)) { const gx = s.cx - dx0, gy = s.cy - dy0; if (gx >= 0 && gy >= 0 && gx < n && gy < n) pictoSalle(g, s.type, ox + gx * cw + Math.floor(cw / 2), oy + gy * ch + Math.floor(ch / 2), ic, etendue); }
  }
}
// Pictogramme d'une salle spéciale : la forme compte autant que la couleur (étoile d'or pour l'héritage,
// pièce verte pour l'échoppe, bloc rouge pour le boss) ; sur la carte étendue, le symbole de sa porte
function pictoSalle(g, type, x, y, c, grand) {
  const C = CADRES_PORTE[type];
  if (grand && C && C.sym) { g.fillStyle = '#14101c'; g.fillRect(x - 3, y - 3, 7, 7); dessinerSymbolePorte(g, C.sym, x, y, c); return; }
  g.fillStyle = '#14101c'; g.fillRect(x - 2, y - 2, 5, 5); g.fillStyle = c;
  if (type === 'heritage') { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); g.fillRect(x - 2, y, 1, 1); g.fillRect(x + 2, y, 1, 1); }
  else if (type === 'boutique') { g.fillRect(x - 1, y - 1, 3, 1); g.fillRect(x - 1, y + 1, 3, 1); g.fillRect(x - 1, y, 1, 1); g.fillRect(x + 1, y, 1, 1); }
  else if (type === 'boss') g.fillRect(x - 1, y - 1, 3, 3);
  else g.fillRect(x - 1, y - 1, 3, 2);
}
function dessinerCarteEtendue(g) {
  g.fillStyle = 'rgba(6,4,10,0.93)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
  dessinerMinicarte(g, 320, 180, true);
  Police.ecrire(g, G.etage.cfg.titre + ' — ' + G.etage.cfg.nom, 320, 16, '#e8dcc0', { a: 'c' });
  Police.ecrire(g, 'Code de mission : ' + codeAffiche(G.partie.code) + '   Temps : ' + formatTemps(G.partie.temps), 320, 340, '#8a8098', { a: 'c' });
  const leg = [['Boss', 'boss'], ['Héritage', 'heritage'], ['Échoppe', 'boutique'], ['Secret', 'cache'], ['Épreuve', 'defi'], ['Maudite', 'malediction']];
  leg.forEach(([t, k], i) => { pictoSalle(g, k, 33, 63 + i * 14, ICONE_SALLE[k], true); Police.ecrire(g, t, 42, 60 + i * 14, '#c8c0d8'); });
}
