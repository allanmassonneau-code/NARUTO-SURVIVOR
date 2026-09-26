// ═══════════════════════════════════════════════════════════════════════════
// Rendu : écran interne 640×360 affiché à l'échelle entière (×2, ×3, ×4…),
// caméra locale des grandes salles, fond de salle mis en cache, tri par
// profondeur, hiérarchie de lisibilité (joueur > danger > projectiles ennemis
// > boss > ennemis > collectes > tirs alliés > décoratif > décor).
// ═══════════════════════════════════════════════════════════════════════════

const Rendu = {
  ecran: null, g: null, interne: null, gi: null, echelle: 1,
  init() {
    this.ecran = document.getElementById('ecran'); this.g = this.ecran.getContext('2d');
    this.interne = toile(ECRAN_L, ECRAN_H); this.gi = ctxDe(this.interne);
    addEventListener('resize', () => this.ajuster()); this.ajuster();
  },
  ajuster() {
    const dpr = window.devicePixelRatio || 1; const L = innerWidth * dpr, H = innerHeight * dpr;
    let e = Math.min(L / ECRAN_L, H / ECRAN_H);
    if (!G.reglages || G.reglages.echelle !== 'ajustee') e = Math.max(1, Math.floor(e));
    this.echelle = e;
    this.ecran.width = Math.round(ECRAN_L * e); this.ecran.height = Math.round(ECRAN_H * e);
    this.ecran.style.width = (this.ecran.width / dpr) + 'px'; this.ecran.style.height = (this.ecran.height / dpr) + 'px';
    this.g.imageSmoothingEnabled = false;
  },
  presenter() { this.g.imageSmoothingEnabled = false; this.g.drawImage(this.interne, 0, 0, this.ecran.width, this.ecran.height); },
};

// ── Caméra ──
function camera(s, J) {
  const Wp = s.W * TUILE, Hp = s.H * TUILE;
  let cx = -ORIGINE_X, cy = -ORIGINE_Y;
  if (Wp > ECRAN_L - 2 * ORIGINE_X) cx = borne(J.x - ECRAN_L / 2, -ORIGINE_X, Wp - ECRAN_L + ORIGINE_X);
  if (Hp > ECRAN_H - ORIGINE_Y - 32) cy = borne(J.y - ECRAN_H / 2, -ORIGINE_Y, Hp - ECRAN_H + 32);
  return [Math.round(cx), Math.round(cy)];
}
let _secousse = { x: 0, y: 0, f: 0, a: null };
function secousse(force, angle) {
  const k = G.reglages ? G.reglages.secousses ?? 0.7 : 0.7; if (!k) return;
  _secousse.f = Math.min(10, Math.max(_secousse.f, force * k)); _secousse.a = angle;
}
function majSecousse(dt) {
  if (_secousse.f <= 0.05) { _secousse.x = 0; _secousse.y = 0; _secousse.f = 0; return; }
  const f = _secousse.f; const a = _secousse.a;
  if (a !== null && a !== undefined) { const r = (Math.random() - 0.3) * f; _secousse.x = Math.cos(a) * r; _secousse.y = Math.sin(a) * r; }
  else { _secousse.x = (Math.random() - 0.5) * f; _secousse.y = (Math.random() - 0.5) * f; }
  _secousse.f *= Math.pow(0.001, dt);
}

// ── Fond de salle (sol, murs, portes, fosses, décalques) en cache ──
function fondSalle(s) {
  if (s._fond && !s.fondSale && !s.decalsNouveaux) return s._fond;
  const th = G.theme; const D = decorsTheme(th); const M = decorsMurs(th); const V = INDEX[th].visuel;
  const c = s._fond && !s.fondSale ? s._fond : toile(s.W * TUILE, s.H * TUILE); const g = ctxDe(c);
  if (!s._fond || s.fondSale) {
    g.fillStyle = '#07060a'; g.fillRect(0, 0, c.width, c.height);
    const estSol = (tx, ty) => { const t = tuileA(s, tx, ty); return t !== T.VIDE && t !== T.MUR && t !== T.PORTE; };
    for (let ty = 0; ty < s.H; ty++) for (let tx = 0; tx < s.W; tx++) {
      const t = s.tuiles[ty * s.W + tx]; const x = tx * TUILE, y = ty * TUILE;
      if (t === T.VIDE) continue;
      if (t === T.MUR || t === T.PORTE) {
        if (estSol(tx, ty + 1)) g.drawImage(M.face, x, y);
        else if (estSol(tx - 1, ty) || estSol(tx + 1, ty)) { g.drawImage(M.cote, x, y); if (estSol(tx + 1, ty)) { g.fillStyle = nuancer(V.mur.haut, 0.7); g.fillRect(x + 29, y, 3, 32); } if (estSol(tx - 1, ty)) { g.fillStyle = nuancer(V.mur.haut, 0.7); g.fillRect(x, y, 3, 32); } }
        else if (estSol(tx, ty - 1)) { g.drawImage(M.rebord, x, y); g.fillStyle = nuancer(V.mur.haut, 0.7); g.fillRect(x, y, 32, 3); }
        else { g.drawImage(M.rebord, x, y); }
        continue;
      }
      // sol
      const v = Math.floor(hasardTuile(tx, ty) * 4); g.drawImage(D.sols[v], x, y);
      if (t === T.FOSSE) {
        g.fillStyle = V.fosse; g.fillRect(x, y, 32, 32);
        if (tuileA(s, tx, ty - 1) !== T.FOSSE) { g.fillStyle = nuancer(V.sol.base, 0.55); g.fillRect(x, y, 32, 7); g.fillStyle = nuancer(V.sol.base, 0.35); g.fillRect(x, y + 7, 32, 3); }
        if (tuileA(s, tx - 1, ty) !== T.FOSSE) { g.fillStyle = nuancer(V.sol.base, 0.4); g.fillRect(x, y, 2, 32); }
        if (tuileA(s, tx + 1, ty) !== T.FOSSE) { g.fillStyle = nuancer(V.sol.base, 0.4); g.fillRect(x + 30, y, 2, 32); }
      }
      if (t === T.PONT) { g.fillStyle = nuancer(V.rocher.ombre, 0.9); g.fillRect(x + 2, y + 2, 28, 28); g.fillStyle = V.rocher.base; for (let k = 0; k < 5; k++) g.fillRect(x + 4 + (k * 7) % 22, y + 5 + (k * 11) % 20, 6, 4); }
      if (t === T.TOILE) g.drawImage(D.toile, x, y);
      // ombre portée des murs sur le sol (haut et gauche)
      if (!estSol(tx, ty - 1)) { g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x, y, 32, 6); }
      if (!estSol(tx - 1, ty)) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x, y, 4, 32); }
    }
    // cadres de portes
    for (const p of s.portes) dessinerCadrePorte(g, s, p, V);
    // décorations cosmétiques (sans collision) près des murs
    const al = new Alea(G.theme + '|deco|' + s.id + '|' + (G.etage ? G.etage.numero : 0));
    for (let k = 0; k < 3 + al.entier(4); k++) {
      const tx = 1 + al.entier(s.W - 2), ty = 1 + al.entier(s.H - 2); if (tuileA(s, tx, ty) !== T.SOL) continue;
      dessinerDeco(g, al.choix(V.deco || ['os']), tx * TUILE + al.entier(20), ty * TUILE + al.entier(20), al);
    }
    s.decalsDessines = 0;
  }
  // décalques persistants (encre des éliminations, brûlures)
  for (let i = s.decalsDessines || 0; i < s.decals.length; i++) dessinerDecal(g, s.decals[i]);
  s.decalsDessines = s.decals.length; s.decalsNouveaux = false; s.fondSale = false; s._fond = c;
  return c;
}
function dessinerDecal(g, d) {
  const al = new Alea('decal' + d.g);
  if (d.type === 'brulure') { g.fillStyle = 'rgba(20,14,16,0.35)'; for (let k = 0; k < 7; k++) { const a = al.suivant() * 6.3, r = al.suivant() * d.r; g.drawImage(disque(3 + al.entier(5), 'rgba(20,14,16,0.3)'), d.x + Math.cos(a) * r - 5, d.y + Math.sin(a) * r * 0.6 - 3); } return; }
  const coul = { encre: 'rgba(30,24,50,0.5)', sang_chakra: 'rgba(110,40,70,0.45)', sable: 'rgba(190,160,100,0.45)', eau: 'rgba(60,110,150,0.35)', acide: 'rgba(90,160,70,0.4)', argile: 'rgba(200,180,150,0.4)', papier: 'rgba(230,225,215,0.5)', bois: 'rgba(90,70,40,0.45)' }[d.type] || 'rgba(30,24,50,0.5)';
  for (let k = 0; k < 6; k++) { const a = al.suivant() * 6.3, r = al.suivant() * d.r * 1.1; const t = 2 + al.entier(4); g.drawImage(disque(t, coul), Math.round(d.x + Math.cos(a) * r - t), Math.round(d.y + Math.sin(a) * r * 0.6 - t)); }
}
function dessinerDeco(g, type, x, y, al) {
  const P = (lignes, col) => g.drawImage(contourner(peindre(lignes, col)), x, y);
  switch (type) {
    case 'cible': P(['..rrrr..', '.rwwwwr.', 'rwrrrrwr', 'rwrwwrwr', 'rwrwwrwr', 'rwrrrrwr', '.rwwwwr.', '..rrrr..'], { r: '#a84a3a', w: '#d8c8a8' }); break;
    case 'parchemin': P(['bppppppb', 'pwwwwwwp', 'pwkwkkwp', 'pwwwwwwp', 'bppppppb'], { b: '#8a6a3a', p: '#c8a870', w: '#e8dcc0', k: '#5a4a3a' }); break;
    case 'lanterne': P(['..kk..', '.krrk.', 'krorrk', 'krrork', 'krrrrk', '.krrk.', '..kk..'], { k: '#3a2a20', r: '#c83a2a', o: '#f0c050' }); break;
    case 'os': P(['w....w', 'ww..ww', '.wwww.', 'ww..ww', 'w....w'], { w: '#d8d0c0' }); break;
    case 'champignon': P(['.rrrr.', 'rrwrrr', 'rrrrwr', '..ss..', '..ss..'], { r: '#b84a6a', w: '#f0e0e0', s: '#d8c8b0' }); break;
    case 'fougere': P(['g.g.g', '.ggg.', 'g.g.g', '.ggg.', '..g..'], { g: '#4a7a3a' }); break;
    case 'cristal': P(['..c..', '.ccw.', '.cc c', 'ccccc', '.ccc.'], { c: '#8ad0e8', w: '#f0ffff' }); break;
    case 'jarre_sable': P(['.bb.', 'bllb', 'bllb', '.bb.'], { b: '#8a6a40', l: '#c8a070' }); break;
    case 'bras': P(['..ww', '.ww.', 'ww..', 'w...'], { w: '#c8b8a0' }); break;
    case 'fil': g.fillStyle = 'rgba(220,220,240,0.35)'; g.fillRect(x, y, 1, 18); break;
    case 'cuve': P(['kkkk', 'kggk', 'kgwk', 'kggk', 'kkkk'], { k: '#4a5058', g: '#5a9a7a', w: '#9ad8b0' }); break;
    case 'tuyau': P(['kkkkkk', 'kmmmmk', 'kkkkkk'], { k: '#3a3e44', m: '#6a7078' }); break;
    case 'mue': P(['..ww..', '.w..w.', 'w....w', '.w..w.', '..ww..'], { w: '#d8d4c0' }); break;
    case 'algue': P(['g..g', '.gg.', 'g..g', '.gg.'], { g: '#3a6a5a' }); break;
    case 'chaine': P(['kk.kk', 'k.k.k', 'kk.kk'], { k: '#6a6a70' }); break;
    case 'nuage': P(['.rr.rr.', 'rrrrrrr', '.rrrrr.'], { r: '#8a2a2a' }); break;
    case 'anneau': P(['.kk.', 'k..k', 'k..k', '.kk.'], { k: '#b0a060' }); break;
    case 'bougie': P(['.o.', '.y.', 'www', 'www', 'www'], { o: '#f08a2a', y: '#ffe060', w: '#e8e0d0' }); break;
    case 'arme': P(['....k', '...k.', '..k..', 'bk...', 'b....'], { k: '#a8a8b0', b: '#5a4a3a' }); break;
    case 'drapeau': P(['kwww', 'kwrw', 'kwww', 'k...', 'k...'], { k: '#5a4a3a', w: '#d8d0c0', r: '#a83a3a' }); break;
    case 'sceau': P(['..k..', '.k.k.', 'k.k.k', '.k.k.', '..k..'], { k: '#7a2a2a' }); break;
    default: break;
  }
}
function dessinerCadrePorte(g, s, p, V) {
  const x = p.tx * TUILE, y = p.ty * TUILE; const C = CADRES_PORTE[p.type] || CADRES_PORTE.normale;
  if (p.etat === 'secrete') return; // indistinguable du mur (sauf indices : fissure légère)
  g.save();
  const vertical = p.dir === 'haut' || p.dir === 'bas';
  g.fillStyle = C.cadre;
  if (p.dir === 'haut') { g.fillRect(x + 2, y + 4, 28, 28); g.fillStyle = C.lum; g.fillRect(x + 2, y + 4, 28, 3); g.fillStyle = '#050407'; g.fillRect(x + 6, y + 9, 20, 23); }
  else if (p.dir === 'bas') { g.fillRect(x + 2, y, 28, 20); g.fillStyle = C.lum; g.fillRect(x + 2, y + 17, 28, 3); g.fillStyle = '#050407'; g.fillRect(x + 6, y, 20, 15); }
  else if (p.dir === 'gauche') { g.fillRect(x + 4, y + 2, 28, 28); g.fillStyle = C.lum; g.fillRect(x + 4, y + 2, 3, 28); g.fillStyle = '#050407'; g.fillRect(x + 9, y + 6, 23, 20); }
  else { g.fillRect(x, y + 2, 28, 28); g.fillStyle = C.lum; g.fillRect(x + 25, y + 2, 3, 28); g.fillStyle = '#050407'; g.fillRect(x, y + 6, 23, 20); }
  // symbole de type sur le linteau (forme, pas seulement couleur)
  const sx = x + 16, sy = p.dir === 'haut' ? y + 5 : p.dir === 'bas' ? y + 22 : y + 16;
  dessinerSymbolePorte(g, C.sym, p.dir === 'gauche' ? x + 5 : p.dir === 'droite' ? x + 27 : sx, sy, C.lum);
  g.restore();
}
function dessinerSymbolePorte(g, sym, x, y, c) {
  if (!sym) return; g.fillStyle = c;
  const pts = {
    crane: [[-2, -2], [-1, -2], [0, -2], [1, -2], [-2, -1], [0, -1], [2, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [1, 1]],
    etoile: [[0, -2], [-1, -1], [0, -1], [1, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [1, 1]],
    piece: [[-1, -2], [0, -2], [1, -2], [-2, -1], [2, -1], [-2, 0], [0, 0], [2, 0], [-2, 1], [2, 1], [-1, 2], [0, 2], [1, 2]],
    pics: [[-2, 1], [-1, 0], [0, -1], [1, 0], [2, 1], [-2, 0], [2, 0]],
    goutte: [[0, -2], [0, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]],
    kunais: [[-2, -2], [-1, -1], [0, 0], [1, 1], [2, 2], [2, -2], [1, -1], [-1, 1], [-2, 2]],
    de: [[-2, -2], [2, -2], [0, 0], [-2, 2], [2, 2]],
    rouleau: [[-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-2, 0], [2, 0], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1]],
    coffre: [[-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-2, 0], [0, 0], [2, 0], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1]],
    serpent: [[-2, -1], [-1, -2], [0, -1], [1, 0], [2, 1], [1, 2]],
    crapaud: [[-2, -1], [2, -1], [-1, 0], [0, 0], [1, 0], [-2, 1], [2, 1]],
  }[sym] || [];
  for (const [dx, dy] of pts) g.fillRect(x + dx, y + dy, 1, 1);
}

// ── Rendu d'une frame de jeu ──
function rendreJeu(g) {
  const s = G.salle, J = G.joueur;
  if (G.transition && G.transition.image) {
    const T0 = G.transition; const k = Math.min(1, T0.t / T0.duree); const ek = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const [dx, dy] = T0.dir ? DIRS[T0.dir] : [0, 0];
    if (!T0.dir) { rendreSalle(g, 0, 0); g.globalAlpha = 1 - ek; g.drawImage(T0.image, 0, 0); g.globalAlpha = 1; return; }
    const ox = Math.round(-dx * ek * ECRAN_L), oy = Math.round(-dy * ek * ECRAN_H);
    g.drawImage(T0.image, ox, oy);
    rendreSalle(g, ox + dx * ECRAN_L, oy + dy * ECRAN_H);
    return;
  }
  rendreSalle(g, Math.round(_secousse.x), Math.round(_secousse.y));
}
function capturerVue() { const c = toile(ECRAN_L, ECRAN_H); const g = ctxDe(c); g.fillStyle = '#07060a'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); rendreSalle(g, 0, 0); return c; }

function rendreSalle(g, ox, oy) {
  const s = G.salle, J = G.joueur;
  const [cx, cy] = camera(s, J); const X = x => Math.round(x - cx + ox), Y = y => Math.round(y - cy + oy);
  g.fillStyle = '#07060a'; g.fillRect(ox, oy, ECRAN_L, ECRAN_H);
  g.drawImage(fondSalle(s), X(0), Y(0));
  const D = decorsTheme(G.theme);
  // pics dynamiques (variante « Atelier ») et pics standards
  for (let ty = 1; ty < s.H - 1; ty++) for (let tx = 1; tx < s.W - 1; tx++) { const t = s.tuiles[ty * s.W + tx]; if (t === T.PICS) g.drawImage(G.variante && G.variante.picsActifs && !picsSortis() ? D.picsRentres : D.pics, X(tx * TUILE), Y(ty * TUILE)); }
  // zones au sol (sous les entités)
  for (const z of G.zones) dessinerZone(g, z, X, Y);
  // télégraphes au sol (au-dessus du décor, sous les entités)
  for (const e of G.effets) if (EFFETS_SOL.has(e.type)) dessinerEffet(g, e, X, Y);
  // portes : battants dynamiques
  for (const p of s.portes) dessinerBattants(g, s, p, X, Y);
  // ombres
  const ombre = (x, y, rx) => g.drawImage(ellipse(rx, Math.max(2, rx * 0.45), 'rgba(0,0,0,0.32)'), X(x - rx), Y(y - rx * 0.45));
  // liste triée par profondeur
  const L = [];
  for (let ty = 0; ty < s.H; ty++) for (let tx = 0; tx < s.W; tx++) { const t = s.tuiles[ty * s.W + tx]; if (PROP[t].obstacle || t === T.FEU_ETEINT) L.push({ y: ty * TUILE + TUILE - 1, f: () => dessinerObstacle(g, t, tx, ty, X, Y, D, s) }); }
  for (const r of s.ramassables) { L.push({ y: r.y, f: () => { ombre(r.x, r.y, 5); dessinerRamassable(g, r, X(r.x), Y(r.y - r.z)); } }); }
  for (const p of s.piedestaux) L.push({ y: p.y + 6, f: () => dessinerPiedestal(g, p, X, Y) });
  for (const m of s.machines) L.push({ y: m.y + 10, f: () => dessinerMachine(g, m, X(m.x), Y(m.y)) });
  for (const n of s.pnj) if (!n.parti) L.push({ y: n.y + 10, f: () => { ombre(n.x, n.y + 10, 8); dessinerPnj(g, n, X(n.x), Y(n.y)); } });
  if (s.statue && !s.statue.detruite) L.push({ y: s.statue.y + 12, f: () => dessinerStatue(g, s.statue, X(s.statue.x), Y(s.statue.y)) });
  if (s.autel) L.push({ y: s.autel.y + 8, f: () => dessinerAutel(g, s.autel, X(s.autel.x), Y(s.autel.y)) });
  if (s.source) L.push({ y: s.source.y + 8, f: () => dessinerSource(g, s.source, X(s.source.x), Y(s.source.y)) });
  for (const x of s.sorties || []) L.push({ y: x.y - 20, f: () => dessinerSortie(g, x, X(x.x), Y(x.y)) });
  for (const b of G.bombes) L.push({ y: b.y, f: () => { ombre(b.x, b.y, 5); dessinerBombe(g, b, X(b.x), Y(b.y)); } });
  for (const e of G.ennemis) L.push({ y: e.y, f: () => { if (!e.cache && !e.illusion && !(e.alpha < 0.5)) ombre(e.x, e.y, e.r * 0.9); dessinerEnnemi(g, e, X(e.x), Y(e.y - (e.z || 0))); } });
  for (const f of J.familiers) L.push({ y: f.y, f: () => { ombre(f.x, f.y, 5); dessinerFamilier(g, f, X(f.x), Y(f.y)); } });
  if (J.etat !== 'mort' || G.animMort) L.push({ y: J.y, f: () => { ombre(J.x, J.y, 8); dessinerJoueur(g, J, X(J.x), Y(J.y - (J.z || 0))); } });
  L.sort((a, b) => a.y - b.y); for (const o of L) o.f();
  // sphères contrôlées
  for (const o of G.orbes) dessinerOrbe(g, o, X, Y);
  // projectiles : ombres puis corps (les tirs ennemis au-dessus des tirs alliés)
  for (const p of G.proj) if (p.z > 1) g.drawImage(ellipse(Math.max(2, p.rTouche * 0.6), 2, 'rgba(0,0,0,0.3)'), X(p.x - p.rTouche * 0.6), Y(p.y - 2));
  for (const p of G.proj) if (p.proprio !== 'ennemi') dessinerProjectile(g, p, X(p.x), Y(p.y - p.z));
  for (const f of G.faisceaux) dessinerFaisceau(g, f, X, Y);
  for (const m of G.melees) dessinerMelee(g, m, X, Y);
  for (const e of G.effets) if (!EFFETS_SOL.has(e.type)) dessinerEffet(g, e, X, Y);
  for (const p of G.particules) { g.fillStyle = p.couleur; const t = p.taille || 2; g.fillRect(X(p.x - t / 2), Y(p.y - t / 2), t, t); }
  for (const p of G.proj) if (p.proprio === 'ennemi') dessinerProjectile(g, p, X(p.x), Y(p.y - p.z));
  for (const a of G.arcs) { const k = a.t / a.duree; const x = lerp(a.x0, a.x1, k), y = lerp(a.y0, a.y1, k) - Math.sin(k * Math.PI) * 40; dessinerProjectile(g, { proprio: 'ennemi', taille: 1.3, apparence: 'globe', age: a.t, rTouche: 6 }, X(x), Y(y)); }
  // obscurité / brume (les dangers et les ennemis restent contourés)
  if (G.variante && (G.variante.obscurite || G.variante.brume)) dessinerObscurite(g, s, X, Y);
  // textes flottants
  for (const t of G.textes) if (!t.ecran) { const k = t.age / t.duree; g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1; Police.ecrire(g, t.t, X(t.x), Y(t.y - k * 10), t.couleur || '#fff', { a: 'c' }); g.globalAlpha = 1; }
  // jauge de charge (compacte, au-dessus de la tête)
  if (J.tir.charge > 0) { const w = 18, k = Math.min(1, J.tir.charge); g.fillStyle = '#14101c'; g.fillRect(X(J.x - w / 2 - 1), Y(J.y - 40), w + 2, 4); g.fillStyle = k >= 1 ? (Math.floor(G.temps * 12) % 2 ? '#ffffff' : '#ffe060') : '#6ad0ff'; g.fillRect(X(J.x - w / 2), Y(J.y - 39), Math.round(w * k), 2); }
  if (J.tir.reticule && J.tir.reticule.actif) { const R = J.tir.reticule; g.drawImage(anneau(12, 1, '#ff5a3a'), X(R.x - 13), Y(R.y - 13)); g.fillStyle = '#ff5a3a'; g.fillRect(X(R.x) - 1, Y(R.y) - 1, 3, 3); }
}
const EFFETS_SOL = new Set(['cercle_danger', 'ligne_danger', 'arc_danger', 'marque_sol', 'cercle_sceau', 'cercle_soin', 'fissure', 'frappe_sol', 'indice_secret', 'anneau_expansif']);

function dessinerObstacle(g, t, tx, ty, X, Y, D, s) {
  const x = X(tx * TUILE), y = Y(ty * TUILE);
  switch (t) {
    case T.ROCHER: g.drawImage(D.rochers[Math.floor(hasardTuile(tx, ty, 1) * 3)], x + 1, y + 3); break;
    case T.ROCHER_SCEAU: g.drawImage(D.rocherSceau, x + 1, y + 3); break;
    case T.TOTEM: g.drawImage(D.totem, x + 4, y - 2); break;
    case T.BLOC: g.drawImage(D.bloc, x + 1, y + 4); break;
    case T.JARRE: g.drawImage(D.jarre, x + 6, y + 12); break;
    case T.CAISSE: g.drawImage(D.caisse, x + 4, y + 10); break;
    case T.FEU: g.drawImage(D.feu[Math.floor(G.temps * 8 + tx) % 3], x + 6, y + 4); break;
    case T.FEU_ETEINT: g.drawImage(D.feuEteint, x + 6, y + 18); break;
    case T.BLOC_CLE: g.drawImage(D.blocCle, x + 3, y + 6); break;
  }
  if (s.pvTuiles[ty * s.W + tx] !== undefined && PROP[t].pvTir && s.pvTuiles[ty * s.W + tx] < PROP[t].pvTir) { g.fillStyle = 'rgba(20,10,10,0.5)'; g.fillRect(x + 12, y + 14, 1, 6); g.fillRect(x + 13, y + 19, 4, 1); }
}
function dessinerBattants(g, s, p, X, Y) {
  const x = X(p.tx * TUILE), y = Y(p.ty * TUILE);
  if (p.etat === 'secrete') { if (p.indice || G.joueur.drapeaux.indicesSecrets) { g.fillStyle = 'rgba(255,240,200,0.5)'; g.fillRect(x + 12, y + 10, 1, 8); g.fillRect(x + 13, y + 17, 5, 1); g.fillRect(x + 17, y + 12, 1, 5); } return; }
  const ferme = s.combat && G.portesFermeesDans <= 0 || p.etat === 'verrouillee' || (p.etat === 'conditionnelle' && !conditionPorte(s, p));
  if (!ferme) return;
  const C = CADRES_PORTE[p.type] || CADRES_PORTE.normale;
  g.fillStyle = nuancer(C.cadre, 1.15);
  if (p.dir === 'haut') { g.fillRect(x + 6, y + 9, 20, 23); g.fillStyle = C.lum; for (let k = 0; k < 3; k++) g.fillRect(x + 9 + k * 6, y + 10, 2, 21); }
  else if (p.dir === 'bas') { g.fillRect(x + 6, y, 20, 15); g.fillStyle = C.lum; for (let k = 0; k < 3; k++) g.fillRect(x + 9 + k * 6, y + 1, 2, 13); }
  else if (p.dir === 'gauche') { g.fillRect(x + 9, y + 6, 23, 20); g.fillStyle = C.lum; for (let k = 0; k < 3; k++) g.fillRect(x + 10, y + 9 + k * 6, 21, 2); }
  else { g.fillRect(x, y + 6, 23, 20); g.fillStyle = C.lum; for (let k = 0; k < 3; k++) g.fillRect(x + 1, y + 9 + k * 6, 21, 2); }
  if (p.etat === 'verrouillee') { const cx = x + 16 + (p.dir === 'gauche' ? 4 : p.dir === 'droite' ? -4 : 0), cy = y + 16 + (p.dir === 'haut' ? 4 : p.dir === 'bas' ? -6 : 0); g.drawImage(ICONES.cadenas, cx - 5, cy - 6); }
  if (p.etat === 'conditionnelle' && !conditionPorte(s, p)) { const cx = x + 16, cy = y + 16; g.drawImage(ICONES.coeurBarre, cx - 5, cy - 5); }
}
function conditionPorte(s, p) {
  const J = G.joueur; const v = G.etage.salles[p.vers];
  if (!v) return true;
  if (v.type === 'defi' || v.type === 'defi_boss' || s.type === 'defi' || s.type === 'defi_boss') {
    if (s.type === 'defi' || s.type === 'defi_boss') return true; // sortir est toujours possible hors combat
    if (J.talisman === 'TAL_032') return true;
    if (J.drapeaux.sansVitalite || nbVit(J.sante) === 0) return J.sante.prot.length >= 4;
    return rougeTotal(J.sante) >= rougeMax(J.sante);
  }
  return true;
}
function dessinerObscurite(g, s, X, Y) {
  const J = G.joueur; const k = G.variante.obscurite || 0.55;
  const c = _obscurite || (_obscurite = toile(ECRAN_L, ECRAN_H)); const o = ctxDe(c);
  o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, ECRAN_L, ECRAN_H); o.fillStyle = G.variante.brume ? 'rgba(170,190,205,' + (0.62) + ')' : 'rgba(4,3,8,' + k + ')'; o.fillRect(0, 0, ECRAN_L, ECRAN_H);
  o.globalCompositeOperation = 'destination-out';
  const trou = (x, y, r) => { const gr = o.createRadialGradient(x, y, r * 0.4, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); o.fillStyle = gr; o.beginPath(); o.arc(x, y, r, 0, Math.PI * 2); o.fill(); };
  trou(X(J.x), Y(J.y - 10), G.variante.brume ? 95 : 110);
  for (let ty = 0; ty < s.H; ty++) for (let tx = 0; tx < s.W; tx++) if (s.tuiles[ty * s.W + tx] === T.FEU) trou(X(tx * TUILE + 16), Y(ty * TUILE + 16), 70);
  for (const e of G.effets) if (e.type === 'explosion') trou(X(e.x), Y(e.y), 90);
  g.drawImage(c, 0, 0);
  // contours des ennemis et des dangers conservés au-dessus
  for (const e of G.ennemis) if (!e.cache && dist(e.x, e.y, J.x, J.y) > 90) { g.drawImage(anneau(e.r + 2, 1, 'rgba(255,90,90,0.7)'), X(e.x - e.r - 3), Y(e.y - e.hauteur - e.r - 3)); }
}
let _obscurite = null;
