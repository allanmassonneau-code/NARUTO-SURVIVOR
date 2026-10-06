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
// Bande de sable de Gaara : avance depuis les murs pendant sa formation, se retire à la fin
function dessinerMursSable(g, s, X, Y) {
  const m = s._mursSable; const k = m.retrait !== undefined ? Math.max(0, 1 - m.retrait) : Math.min(1, m.t / SABLE_ARENE.formation);
  const p = Math.max(1, Math.round(TUILE * k)); const forme = m.t >= SABLE_ARENE.formation && m.retrait === undefined;
  for (const i of m.tuiles) {
    const tx = i % s.W, ty = (i / s.W) | 0, x = X(tx * TUILE), y = Y(ty * TUILE);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (!PROP[tuileA(s, tx + dx, ty + dy)].mur) continue;
      const rx = dx > 0 ? x + TUILE - p : x, ry = dy > 0 ? y + TUILE - p : y, rw = dx ? p : TUILE, rh = dy ? p : TUILE;
      g.fillStyle = forme ? 'rgba(200,158,92,0.82)' : 'rgba(200,158,92,0.55)'; g.fillRect(rx, ry, rw, rh);
      g.fillStyle = 'rgba(120,84,40,0.8)'; if (dx) g.fillRect(dx > 0 ? rx : rx + rw - 1, ry, 1, rh); else g.fillRect(rx, dy > 0 ? ry : ry + rh - 1, rw, 1);
    }
    g.fillStyle = 'rgba(236,208,140,0.9)'; for (let n = 0; n < 4; n++) { const h = (i * 7919 + n * 104729) >>> 0; const gx = h % 29, gy = (h >> 5) % 29; if (k > 0.3) g.fillRect(x + 1 + gx, y + 1 + gy + Math.round(Math.sin(G.temps * 2 + n + i) * 1), 1, 1); }
  }
  // compte à rebours lisible : l'anneau se referme sous les pieds
  if (forme && m.dedans > 0) { const J = G.joueur; const r = Math.max(3, Math.round(16 * (1 - m.dedans / SABLE_ARENE.delai))); g.drawImage(anneau(r, 2, '#e8c060'), X(J.x) - r - 1, Y(J.y) - r - 1); }
}
function dessinerAnneauSerpent(g, x, y, r, i) {
  g.drawImage(disque(r + 1, '#1c1420'), x - r - 1, y - r - 1);
  g.drawImage(disque(r, '#3f6424'), x - r, y - r);
  g.drawImage(disque(Math.max(2, r - 2), '#5f8a34'), x - r + 2, y - r + 1);
  g.fillStyle = '#8cb454'; g.fillRect(x - 2, y - r + 2, 3, 1); g.fillRect(x - 3 + (i % 2) * 3, y - 1, 2, 1);
  g.fillStyle = '#d8cf98'; g.fillRect(x - Math.round(r * 0.5), y + r - 3, Math.round(r), 2);
}
function dessinerChaineFreres(g, a, b, X, Y) {
  const d = dist(a.x, a.y, b.x, b.y), tendue = d > 110, alerte = d > 90;
  const col = tendue ? (Math.floor(G.temps * 12) % 2 ? '#ff6a5a' : '#ffd0c0') : alerte ? '#e0a060' : '#8a8a94';
  const n = Math.max(2, Math.round(d / 5)), creux = tendue ? 0 : Math.max(0, (110 - d) * 0.25);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = lerp(a.x, b.x, t), y = lerp(a.y, b.y, t) - 10 + Math.sin(t * Math.PI) * creux;
    g.fillStyle = '#1c1420'; g.fillRect(X(x) - 2, Y(y) - 2, 4, 4); g.fillStyle = col; if (i % 2) g.fillRect(X(x) - 1, Y(y) - 1, 3, 2); else g.fillRect(X(x) - 1, Y(y) - 1, 2, 3);
  }
}
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
const OMBRE_HAUT = [0.36, 0.26, 0.17, 0.1, 0.05].map(a => 'rgba(0,0,0,' + a + ')'), OMBRE_GAUCHE = [0.24, 0.15, 0.08, 0.04].map(a => 'rgba(0,0,0,' + a + ')'), OMBRE_DROITE = [0.16, 0.09, 0.04].map(a => 'rgba(0,0,0,' + a + ')');
function fondSalle(s) {
  if (s._fond && !s.fondSale && !s.decalsNouveaux) return s._fond;
  const th = G.theme; const D = decorsTheme(th); const M = decorsMurs(th); const V = INDEX[th].visuel;
  const c = s._fond && !s.fondSale ? s._fond : toile(s.W * TUILE, s.H * TUILE); const g = ctxDe(c);
  if (!s._fond || s.fondSale) {
    _lumCollecte = s._lumieres = [];
    g.fillStyle = '#07060a'; g.fillRect(0, 0, c.width, c.height);
    const estSol = (tx, ty) => { const t = tuileA(s, tx, ty); return t !== T.VIDE && t !== T.MUR && t !== T.PORTE; };
    const SOL = solPeint(s, th);
    for (let ty = 0; ty < s.H; ty++) for (let tx = 0; tx < s.W; tx++) {
      const t = s.tuiles[ty * s.W + tx]; const x = tx * TUILE, y = ty * TUILE;
      if (t === T.VIDE) { g.drawImage(M.rebord, x, y); g.fillStyle = 'rgba(6,4,8,0.55)'; g.fillRect(x, y, 32, 32); continue; } // masse de roche hors de la salle
      if (t === T.MUR || t === T.PORTE) {
        if (estSol(tx, ty + 1)) g.drawImage(M.face, x, y);
        else if (estSol(tx - 1, ty) || estSol(tx + 1, ty)) { g.drawImage(M.cote, x, y); if (estSol(tx + 1, ty)) { g.fillStyle = nuancer(V.mur.haut, 0.7); g.fillRect(x + 29, y, 3, 32); } if (estSol(tx - 1, ty)) { g.fillStyle = nuancer(V.mur.haut, 0.7); g.fillRect(x, y, 3, 32); } }
        else if (estSol(tx, ty - 1)) { g.drawImage(M.rebord, x, y); g.fillStyle = nuancer(V.mur.haut, 0.7); g.fillRect(x, y, 32, 3); }
        else { g.drawImage(M.rebord, x, y); }
        continue;
      }
      // sol
      g.drawImage(SOL, x, y, 32, 32, x, y, 32, 32);
      if (t === T.FOSSE) dessinerFosse(g, s, tx, ty, V, th);
      if (t === T.PONT) { g.fillStyle = nuancer(V.rocher.ombre, 0.9); g.fillRect(x + 2, y + 2, 28, 28); g.fillStyle = V.rocher.base; for (let k = 0; k < 5; k++) g.fillRect(x + 4 + (k * 7) % 22, y + 5 + (k * 11) % 20, 6, 4); }
      if (t === T.TOILE) g.drawImage(D.toile, x, y);
      // ombre portée douce des murs sur le sol (dégradé en bandes de 2 px)
      if (!estSol(tx, ty - 1)) OMBRE_HAUT.forEach((o, k) => { g.fillStyle = o; g.fillRect(x, y + k * 2, 32, 2); });
      if (!estSol(tx - 1, ty)) OMBRE_GAUCHE.forEach((o, k) => { g.fillStyle = o; g.fillRect(x + k * 2, y, 2, 32); });
      if (!estSol(tx + 1, ty)) OMBRE_DROITE.forEach((o, k) => { g.fillStyle = o; g.fillRect(x + 30 - k * 2, y, 2, 32); });
    }
    // sol vivant : taches d'usure et de lumière, détails du thème (limités au sol nu)
    const al = new Alea(th + '|sol|' + s.id + '|' + s.W + 'x' + s.H + '|' + (G.etage ? G.etage.numero : 0));
    g.save(); g.beginPath(); for (let ty = 1; ty < s.H - 1; ty++) for (let tx = 1; tx < s.W - 1; tx++) if (s.tuiles[ty * s.W + tx] !== T.VIDE && estSol(tx, ty) && s.tuiles[ty * s.W + tx] !== T.FOSSE) g.rect(tx * TUILE, ty * TUILE, TUILE, TUILE); g.clip();
    g.imageSmoothingEnabled = true;
    for (let k = 0; k < 6 + s.cw * s.ch * 8; k++) { const x = TUILE + al.entier((s.W - 2) * TUILE), y = TUILE + al.entier((s.H - 2) * TUILE), rx = 22 + al.entier(50), ry = Math.round(rx * (0.45 + al.suivant() * 0.3)), sombre = al.chance(0.55); g.globalAlpha = sombre ? 0.16 : 0.1; g.drawImage(halo(sombre ? '#000000' : '#fff4dc'), x - rx, y - ry, rx * 2, ry * 2); }
    g.globalAlpha = 1; g.imageSmoothingEnabled = false;
    detailsSol(g, s, V, al);
    g.restore();
    decorMursTheme(g, s, V, al, estSol);
    decorSalle(g, s, V);
    // cadres de portes
    for (const p of s.portes) dessinerCadrePorte(g, s, p, V);
    // décorations cosmétiques (sans collision) près des murs
    const ad = new Alea(G.theme + '|deco|' + s.id + '|' + (G.etage ? G.etage.numero : 0));
    for (let k = 0; k < 3 + ad.entier(4); k++) {
      const tx = 1 + ad.entier(s.W - 2), ty = 1 + ad.entier(s.H - 2); if (tuileA(s, tx, ty) !== T.SOL) continue;
      dessinerDeco(g, ad.choix(V.deco || ['os']), tx * TUILE + ad.entier(20), ty * TUILE + ad.entier(20), ad);
    }
    _lumCollecte = null;
    s._feux = []; s.tuiles.forEach((t, i) => { if (t === T.FEU) s._feux.push(i); });
    s._appliques = placerAppliques(s, ambiance(th)); s._lumGen = (s._lumGen || 0) + 1;
    s.decalsDessines = 0;
  }
  // décalques persistants (encre des éliminations, brûlures)
  for (let i = s.decalsDessines || 0; i < s.decals.length; i++) dessinerDecal(g, s.decals[i]);
  s.decalsDessines = s.decals.length; s.decalsNouveaux = false; s.fondSale = false; s._fond = c;
  return c;
}
// Détails de sol propres au thème (posés sur le sol nu : le masque exclut obstacles et fosses)
function detailsSol(g, s, V, al) {
  const th = G.theme, Wp = (s.W - 2) * TUILE, Hp = (s.H - 2) * TUILE, sombre = nuancer(V.sol.base, 0.7), clair = nuancer(V.sol.base, 1.28);
  const R = (x, y, l, h, c) => { g.fillStyle = c; g.fillRect(x, y, l, h); };
  const fissure = (x, y, n, c) => { for (let i = 0; i < n; i++) { R(x, y, 1, 1, c); x += al.chance(0.7) ? 1 : 0; y += al.entier(3) - 1; } };
  const touffe = (x, y, c, cc) => { R(x, y - 3, 1, 3, c); R(x + 2, y - 5, 1, 5, c); R(x + 4, y - 2, 1, 2, c); R(x + 2, y - 5, 1, 1, cc); R(x, y - 3, 1, 1, cc); };
  const flaque = (x, y, rx, c, reflet) => { g.drawImage(ellipse(rx, Math.max(2, Math.round(rx * 0.4)), c), x - rx, y - Math.round(rx * 0.4)); R(x - rx + 3, y - 1, Math.round(rx * 0.8), 1, reflet); };
  for (let k = 0, n = Math.round(s.cw * s.ch * 16); k < n; k++) {
    const x = TUILE + 4 + al.entier(Wp - 12), y = TUILE + 6 + al.entier(Hp - 12), r = al.suivant();
    if (r < 0.28) { R(x, y + 1, 3, 2, sombre); R(x, y, 2, 1, clair); continue; } // cailloux
    switch (th) {
      case 'THM_ACA': if (r < 0.6) { R(x, y, 3, 2, sombre); R(x + 1, y, 1, 1, clair); } else if (r < 0.85) { R(x, y, 1, 1, '#a8a0a0'); R(x + 3, y, 1, 1, '#a8a0a0'); } else { R(x, y, 4, 3, '#d8ccb0'); R(x + 1, y + 1, 2, 1, '#8a7a60'); } break;
      case 'THM_FOR': if (r < 0.65) touffe(x, y, '#4a6a30', '#7a9a4a'); else if (r < 0.85) { R(x, y, 3, 1, '#8a6a2a'); R(x + 1, y + 1, 2, 1, '#a88a3a'); } else { R(x + 1, y - 1, 1, 2, '#e0d8c0'); R(x, y - 2, 3, 1, '#c84a3a'); } break;
      case 'THM_SUN': if (r < 0.75) { const l = 8 + al.entier(10); for (let i = 0; i < l; i++) { const o = Math.round(Math.sin(i * 0.5) * 1.2); R(x + i, y + o, 1, 1, clair); R(x + i, y + o + 1, 1, 1, sombre); } } else { R(x, y, 4, 1, '#e0d8c8'); R(x, y - 1, 1, 1, '#e0d8c8'); R(x + 3, y + 1, 1, 1, '#e0d8c8'); } break;
      case 'THM_MAR': if (r < 0.6) fissure(x, y, 5 + al.entier(8), sombre); else if (r < 0.8) { R(x, y, 2, 2, '#8a8088'); R(x, y, 1, 1, '#c8c0c8'); } else { R(x, y, 3, 1, '#b08a58'); R(x + 2, y + 1, 2, 1, '#b08a58'); } break;
      case 'THM_ORO': if (r < 0.5) { R(x, y, 8, 5, '#1c2024'); for (let i = 0; i < 3; i++) R(x + 1 + i * 2 + i, y + 1, 1, 3, '#3a4048'); } else if (r < 0.8) flaque(x, y, 4 + al.entier(4), 'rgba(90,200,120,0.3)', 'rgba(200,255,210,0.5)'); else R(x, y, 5, 2, 'rgba(140,80,40,0.35)'); break;
      case 'THM_KIR': if (r < 0.7) flaque(x, y, 5 + al.entier(7), 'rgba(70,120,170,0.35)', 'rgba(200,230,255,0.45)'); else { R(x, y, 3, 1, '#4a7a5a'); R(x + 1, y + 1, 3, 1, '#3a6a4a'); } break;
      case 'THM_AKA': if (r < 0.65) fissure(x, y, 6 + al.entier(10), sombre); else g.drawImage(ellipse(3 + al.entier(3), 2, 'rgba(110,20,30,0.35)'), x, y); break;
      case 'THM_GUE': if (r < 0.45) g.drawImage(ellipse(5 + al.entier(6), 3, 'rgba(20,14,12,0.3)'), x - 4, y - 2); else if (r < 0.7) { R(x, y, 1, 1, '#a8a8b0'); R(x + 1, y + 1, 1, 1, '#a8a8b0'); R(x + 2, y + 2, 1, 1, '#5a4a3a'); } else touffe(x, y, '#6a6040', '#8a8058'); break;
      case 'THM_MYO': if (r < 0.55) { const p = al.choix(['#f0a0c0', '#f8f0f8', '#f0d860', '#a8c8f8']); R(x - 1, y, 3, 1, p); R(x, y - 1, 1, 3, p); R(x, y, 1, 1, '#f0e040'); } else touffe(x, y, '#4a8a3a', '#8ac85a'); break;
      case 'THM_BIJ': if (r < 0.6) { let cx = x, cy = y; for (let i = 0; i < 6 + al.entier(8); i++) { R(cx, cy, 1, 1, i % 3 ? '#1c080c' : '#8a2020'); cx += 1; cy += al.entier(3) - 1; } } else { R(x, y, 3, 2, '#5a5058'); R(x + 3, y + 1, 3, 2, '#6a6068'); } break;
      default: if (r < 0.6) fissure(x, y, 5 + al.entier(6), sombre);
    }
  }
}
// Détails muraux du thème : lierre, suintements, tuyaux, dunes, chaînes, papiers, fissures
function decorMursTheme(g, s, V, al, estSol) {
  const th = G.theme, face = nuancer(V.mur.face, 0.6);
  const R = (x, y, l, h, c) => { g.fillStyle = c; g.fillRect(x, y, l, h); };
  for (let ty = 0; ty < s.H - 1; ty++) for (let tx = 0; tx < s.W; tx++) {
    const t = s.tuiles[ty * s.W + tx]; if (t !== T.MUR || !estSol(tx, ty + 1)) continue;
    const x = tx * TUILE, y = ty * TUILE, r = al.suivant();
    if (th === 'THM_ORO') { R(x, y + 11, 32, 5, '#2a2e34'); R(x, y + 12, 32, 3, '#5a6068'); R(x, y + 12, 32, 1, '#8a929c'); if (tx % 2 === 0) { R(x + 2, y + 10, 4, 7, '#2a2e34'); R(x + 3, y + 11, 2, 5, '#7a828c'); } }
    if ((th === 'THM_FOR' || th === 'THM_MYO') && r < 0.5) { const bx = x + 4 + al.entier(24), l = 8 + al.entier(14); for (let i = 0; i < l; i++) { R(bx + Math.round(Math.sin(i * 0.6) * 0.8), y + 6 + i, 1, 1, '#2e4a22'); if (i % 3 === 1) R(bx + (i % 2 ? 1 : -2), y + 6 + i, 2, 1, th === 'THM_MYO' ? '#6aa04a' : '#4a7a32'); } }
    else if (th === 'THM_KIR' && r < 0.45) { const bx = x + 3 + al.entier(26); R(bx, y + 8, 2, 20, 'rgba(0,0,0,0.16)'); R(bx, y + 27, 2, 1, 'rgba(160,210,255,0.6)'); R(x, y + 29, 32, 1, 'rgba(70,120,80,0.45)'); }
    else if (th === 'THM_SUN' && r < 0.5) voile(g, x + 10 + al.entier(12), y + 34, 14 + al.entier(8), 5, nuancer(V.sol.base, 1.2), 0.45);
    else if ((th === 'THM_AKA' || th === 'THM_BIJ') && r < 0.22) { const bx = x + 6 + al.entier(20); for (let i = 0; i < 6; i++) { R(bx - 1, y + 7 + i * 3, 3, 3, '#1c1420'); R(bx, y + 8 + i * 3, 1, 1, '#8a8a94'); } }
    else if (th === 'THM_ACA' && r < 0.2) { const bx = x + 8 + al.entier(14); R(bx - 1, y + 9, 8, 10, '#1c1420'); R(bx, y + 10, 6, 8, '#e0d4b8'); R(bx + 1, y + 12, 4, 1, '#6a5a4a'); R(bx + 1, y + 14, 3, 1, '#6a5a4a'); R(bx + 2, y + 8, 2, 2, '#b02a2a'); }
    else if (th === 'THM_MAR' && r < 0.3) { const bx = x + 6 + al.entier(20); R(bx, y + 8, 2, 2, '#8a8088'); R(bx, y + 10, 1, 14, 'rgba(220,220,240,0.35)'); }
    else if (th === 'THM_GUE' && r < 0.15) { const bx = x + 8 + al.entier(14), by = y + 12 + al.entier(8); lignePixel(g, bx, by, bx + 6, by - 4, '#6a5a3a'); R(bx - 1, by, 2, 2, '#c8c0b0'); }
    if (r > 0.72) { let fx = x + 4 + al.entier(22), fy = y + 9 + al.entier(8); for (let i = 0; i < 5 + al.entier(6); i++) { R(fx, fy, 1, 1, face); fy += 1; fx += al.entier(3) - 1; } }
  }
}
// ── Identité des salles spéciales (sol) : tapis d'échoppe, tapis d'héritage, cercle de sceau
// des arènes, étagères de la bibliothèque, emblèmes des épreuves et des autels ──
function tapis(g, x, y, l, h, fond, bord, motif) {
  x = Math.round(x); y = Math.round(y); l = Math.round(l); h = Math.round(h);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 2, y + 2, l, h);
  g.fillStyle = bord; g.fillRect(x, y, l, h); g.fillStyle = fond; g.fillRect(x + 3, y + 3, l - 6, h - 6);
  g.fillStyle = motif; g.fillRect(x + 5, y + 5, l - 10, 1); g.fillRect(x + 5, y + h - 6, l - 10, 1); g.fillRect(x + 5, y + 5, 1, h - 10); g.fillRect(x + l - 6, y + 5, 1, h - 10);
  for (let yy = y + 10; yy < y + h - 10; yy += 8) for (let xx = x + 10 + ((yy - y) / 8 % 2) * 4; xx < x + l - 10; xx += 8) { g.fillRect(xx, yy, 2, 2); }
  g.fillStyle = bord; for (let xx = x + 2; xx < x + l - 2; xx += 4) { g.fillRect(xx, y - 2, 1, 2); g.fillRect(xx, y + h, 1, 2); } // franges
}
function cercleSceau(g, cx, cy, r, coul) {
  g.globalAlpha = 0.28; g.drawImage(anneau(r, 2, coul), cx - r - 1, cy - r - 1); g.drawImage(anneau(Math.round(r * 0.72), 1, coul), cx - Math.round(r * 0.72) - 1, cy - Math.round(r * 0.72) - 1);
  g.fillStyle = coul; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; for (let k = 0; k < 3; k++) g.fillRect(Math.round(cx + Math.cos(a) * (r * 0.74 + k * 4)), Math.round(cy + Math.sin(a) * (r * 0.74 + k * 4)), 2, 2); }
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2; g.fillRect(Math.round(cx + Math.cos(a) * r * 0.36) - 2, Math.round(cy + Math.sin(a) * r * 0.36) - 1, 4, 2); }
  g.globalAlpha = 1;
}
function lanterne(g, x, y) {
  g.fillStyle = '#1c1420'; g.fillRect(x + 3, y - 2, 4, 2); g.fillStyle = '#c8303a'; g.fillRect(x, y, 10, 12); g.fillStyle = '#f07a4a'; g.fillRect(x + 2, y + 1, 6, 10);
  g.fillStyle = '#1c1420'; g.fillRect(x, y + 3, 10, 1); g.fillRect(x, y + 8, 10, 1); g.fillRect(x + 3, y + 12, 4, 2);
  g.globalAlpha = 0.18; g.drawImage(disque(16, '#ffb060'), x - 11, y - 10); g.globalAlpha = 1;
  lumiere(x + 5, y + 6, 76, '#ffb060', 0.62, true, 0.32);
}
function decorSalle(g, s, V) {
  const pts = c => (s.pointsSpeciaux || []).filter(p => p.c === c).map(p => centreTuile(p.tx, p.ty));
  const [cx, cy] = centreSalle(s); const larg = s.W * TUILE;
  switch (s.type) {
    case 'boutique': {
      const S = pts('S'); if (S.length) { const xs = S.map(p => p[0]), ys = S.map(p => p[1]); tapis(g, Math.min(...xs) - 28, Math.min(...ys) - 30, Math.max(...xs) - Math.min(...xs) + 56, Math.max(...ys) - Math.min(...ys) + 52, '#5a1a22', '#b08a3a', '#8a3a3a'); }
      // marché : auvents rayés et étagères de marchandises contre le mur du haut, lanternes de papier aux bouts
      for (const x0 of [40, larg - 104]) { etagereMarchandises(g, x0 + 6, 52); auvent(g, x0, 33, 64); }
      lanterne(g, 28, 46); lanterne(g, larg - 38, 46); break;
    }
    case 'heritage': { // sanctuaire de l'héritage : rai de lumière dorée, sceau d'or au sol, bougies, corde sacrée au mur
      const I = pts('I')[0] || [cx, cy]; lumiere(I[0], I[1] - 10, 210, '#ffe090', 0.55); voile(g, I[0], I[1] - 26, 44, 74, '#fff0b0', 0.24);
      cercleSceau(g, I[0], I[1] + 2, 46, '#e8c050');
      for (const [dx, dy] of [[-58, -26], [54, -26], [-58, 30], [54, 30]]) bougie(g, I[0] + dx, I[1] + dy);
      shimenawa(g, Math.round(larg / 2 - 80), 38, 160); break;
    }
    case 'boss': cercleSceau(g, cx, cy, 70, '#c83a3a'); lumiere(cx, cy, 230, '#ff4030', 0.2); break;
    case 'defi_boss': { // épreuve de jōnin : arène sombre, sceau pourpre, bannières au crâne
      const H = s.H * TUILE; voile(g, cx, cy, larg * 0.48, H * 0.42, '#1a0a1c', 0.45); cercleSceau(g, cx, cy, 70, '#b85a9a'); cercleSceau(g, cx, cy, 34, '#d07ab8'); lumiere(cx, cy, 230, '#d060b0', 0.22);
      for (const x of [56, larg - 76]) banniere(g, x, 34, '#5a1a4a', '#d8a0c8', 'crane');
      break;
    }
    case 'sacrifice': { // autel de tribut : estrade de pierre, rigole de sang, bougies rouges, lanternes de pierre
      const A = pts('A')[0] || [cx, cy]; voile(g, A[0], A[1], 120, 70, '#3a0808', 0.4); cercleSceau(g, A[0], A[1] + 4, 44, '#a02a2a');
      estrade(g, A[0] - 30, A[1] - 12, 60, 30); lumiere(A[0], A[1], 140, '#ff3030', 0.34);
      for (let k = 0; k < 6; k++) { const a = Math.PI * (0.15 + k * 0.14); bougie(g, Math.round(A[0] + Math.cos(a) * 62) - 2, Math.round(A[1] + 6 - Math.sin(a) * 40), '#c83030'); }
      for (const x of [A[0] - 92, A[0] + 82]) lanternePierre(g, x, A[1] - 34);
      const al = new Alea('sang' + s.id); for (let k = 0; k < 9; k++) { const x = A[0] - 40 + al.entier(80), y = A[1] + 18 + al.entier(26); g.drawImage(ellipse(1 + al.entier(3), 1, 'rgba(110,10,16,0.55)'), x, y); }
      break;
    }
    case 'defi': { // épreuve chūnin : arène tracée à la craie, emblème des kunai croisés, bannières
      g.globalAlpha = 0.22; g.fillStyle = '#e8e4d8'; const H = s.H * TUILE, m = 64;
      g.fillRect(m, m, larg - 2 * m, 2); g.fillRect(m, H - m, larg - 2 * m, 2); g.fillRect(m, m, 2, H - 2 * m); g.fillRect(larg - m, m, 2, H - 2 * m + 2);
      for (let k = -18; k <= 18; k++) { g.fillRect(cx + k - 1, cy + k - 1, 3, 3); g.fillRect(cx + k - 1, cy - k - 1, 3, 3); } g.globalAlpha = 1;
      cercleSceau(g, cx, cy, 34, '#9a9ab0'); for (const x of [56, larg - 76]) banniere(g, x, 34, '#2a3a5a', '#e8e4d8', 'kunais');
      break;
    }
    case 'bibliotheque': { lumiere(cx, cy, 200, '#ffd8a0', 0.25); // étagères le long du mur du haut, tapis, piles de rouleaux
      for (let x = 44; x < larg - 44; x += 40) { g.fillStyle = '#4a3222'; g.fillRect(x, 34, 34, 22); g.fillStyle = '#2a1c14'; g.fillRect(x, 44, 34, 2);
        for (let k = 0; k < 7; k++) { g.fillStyle = ['#c8b890', '#a88a5a', '#d8c8a0', '#8a3a2a', '#3a5a8a'][(x + k * 3) % 5]; g.fillRect(x + 2 + k * 4, 37, 3, 6); g.fillRect(x + 3 + k * 4, 47, 3, 6); } }
      const I = pts('I'); if (I.length) { const xs = I.map(p => p[0]); tapis(g, Math.min(...xs) - 30, I[0][1] - 22, Math.max(...xs) - Math.min(...xs) + 60, 44, '#1e3a32', '#b0985a', '#2e5a4a'); }
      const H = s.H * TUILE; for (const [x, y] of [[44, H - 64], [larg - 64, H - 64], [larg / 2 - 70, 62], [larg / 2 + 52, 62]]) pileRouleaux(g, x, y);
      break;
    }
    case 'coffres': { // salle aux coffres : voile doré, sceau de mosaïque, pièces, tas d'or aux angles, barreaux
      lumiere(cx, cy, 200, '#ffd870', 0.25); const H = s.H * TUILE; voile(g, cx, cy, larg * 0.36, H * 0.3, '#ffd870', 0.18); cercleSceau(g, cx, cy, 52, '#e8c050');
      const al = new Alea('pieces' + s.id); for (let k = 0; k < 28; k++) { const x = 44 + al.entier(larg - 88), y = 48 + al.entier(H - 96); g.fillStyle = '#7a5a18'; g.fillRect(x, y + 1, 4, 2); g.fillStyle = '#e8c050'; g.fillRect(x, y, 4, 2); g.fillStyle = '#fff4b0'; g.fillRect(x, y, 1, 1); }
      for (const [x, y] of [[40, 44], [larg - 64, 44], [40, H - 66], [larg - 64, H - 66]]) tasOr(g, x, y);
      for (let x = 70; x < larg - 70; x += 56) barreaux(g, x, 33);
      break;
    }
    case 'malediction': { // chambre maudite : pénombre cramoisie, double sceau, fissures rayonnantes, chaînes, crânes, bougies
      const H = s.H * TUILE; voile(g, cx, cy, larg * 0.5, H * 0.46, '#2a0612', 0.6); lumiere(cx, cy, 220, '#c02040', 0.3);
      g.fillStyle = 'rgba(110,16,34,0.55)'; const al = new Alea('fissures' + s.id);
      for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 + al.suivant() * 0.4; let x = cx + Math.cos(a) * 58, y = cy + Math.sin(a) * 36; for (let n = 0; n < 14; n++) { g.fillRect(Math.round(x), Math.round(y), 2, 1); x += Math.cos(a) * 3 + al.entier(3) - 1; y += Math.sin(a) * 2 + al.entier(3) - 1; } }
      cercleSceau(g, cx, cy, 60, '#a02a4a'); cercleSceau(g, cx, cy, 30, '#d04a6a');
      for (const x of [70, 150, larg - 160, larg - 80]) chaine(g, x, 33, 18 + (x % 3) * 6);
      for (const [x, y] of [[40, 46], [larg - 58, 46], [40, H - 62], [larg - 58, H - 62]]) amasCranes(g, x, y);
      for (const [dx, dy] of [[-72, 0], [72, 0], [0, -46], [0, 46]]) bougie(g, cx + dx - 2, cy + dy, '#8a2040');
      break;
    }
    case 'repos': { // source chaude : bassin cerclé de pierres, ponton, bambous, lanternes de pierre
      const A = pts('A')[0] || [cx, cy], S = { x: A[0], y: A[1] }, H = s.H * TUILE;
      ponton(g, S.x - 70, S.y + 18, 140); bassin(g, S.x, S.y, 46, 24); lumiere(S.x, S.y, 170, '#70e0ff', 0.36);
      for (const x of [40, 50, 60]) bambou(g, x, H - 40, 54 + (x % 20)); for (const x of [larg - 46, larg - 56, larg - 66]) bambou(g, x, H - 40, 50 + (x % 17));
      for (const x of [S.x - 96, S.x + 86]) lanternePierre(g, x, S.y - 36);
      break;
    }
    case 'dispositifs': { // comptoir des contrebandiers : tapis, lanternes rouges, caisses et tonneaux contre les murs
      const H = s.H * TUILE; tapis(g, cx - 120, cy - 40, 240, 92, '#3a1e14', '#9a7a3a', '#5a2e1e'); lumiere(cx, cy, 200, '#ffb060', 0.28);
      for (const x of [60, 140, larg - 150, larg - 70]) lanterneRouge(g, x, 36);
      for (const [x, y] of [[40, H - 66], [62, H - 60], [larg - 70, H - 66], [larg - 50, 50]]) tonneau(g, x, y);
      break;
    }
    case 'cache': { // cache secrète : pénombre, toiles d'araignée aux angles, tonneaux, poussière
      const H = s.H * TUILE; voile(g, cx, cy, larg * 0.55, H * 0.5, '#000000', 0.38);
      toileCoin(g, 32, 32, 1, 1); toileCoin(g, larg - 33, 32, -1, 1); toileCoin(g, 32, H - 33, 1, -1); toileCoin(g, larg - 33, H - 33, -1, -1);
      for (const [x, y] of [[44, 48], [larg - 66, H - 70]]) tonneau(g, x, y);
      break;
    }
    case 'isolee': { // chambre de scellement isolée : chaînes au sol vers le centre, sceau bleuté, papiers aux murs
      const H = s.H * TUILE, I = pts('I')[0] || [cx, cy]; voile(g, I[0], I[1], larg * 0.5, H * 0.45, '#08101c', 0.45);
      cercleSceau(g, I[0], I[1], 48, '#6a8ac8'); lumiere(I[0], I[1], 160, '#8ab0ff', 0.3);
      for (const [x, y] of [[40, 44], [larg - 40, 44], [40, H - 44], [larg - 40, H - 44]]) chaineSol(g, x, y, I[0], I[1] + 4);
      break;
    }
    case 'pacte': { // empreinte interdite : pénombre violette, sceau serpentin, statues de serpents, tentures, bougies noires
      const H = s.H * TUILE; voile(g, cx, cy, larg * 0.46, H * 0.4, '#2a0830', 0.6);
      const I = pts('I'); cercleSceau(g, cx, I.length ? I[0][1] : cy, 64, '#7a3a9a'); lumiere(cx, I.length ? I[0][1] : cy, 190, '#a040e0', 0.34);
      for (const [x, y] of [[48, 48], [larg - 56, 48], [48, H - 64], [larg - 56, H - 64]]) bougie(g, x, y, '#1c1420');
      for (const x of [100, larg - 124]) tenture(g, x, 33, '#3a1040', '#a050c0');
      statueSerpent(g, 76, 58, false); statueSerpent(g, larg - 100, 58, true);
      break;
    }
    case 'sanctuaire': { // sanctuaire des ermites : lumière blanc-vert, sceau de jade, statues de crapauds, étangs aux nénuphars, mousse
      const H = s.H * TUILE; voile(g, cx, cy, larg * 0.44, H * 0.38, '#e8fff0', 0.2);
      cercleSceau(g, cx, cy, 56, '#7ac8a0'); lumiere(cx, cy, 240, '#d8ffe8', 0.4);
      for (const x of [56, larg - 92]) etang(g, x, H - 74);
      statueCrapaud(g, cx - 84, cy - 34); statueCrapaud(g, cx + 64, cy - 34);
      const al = new Alea('mousse' + s.id); for (let k = 0; k < 22; k++) { g.fillStyle = k % 2 ? 'rgba(90,140,60,0.5)' : 'rgba(120,170,80,0.45)'; g.fillRect(40 + al.entier(larg - 80), 48 + al.entier(H - 96), 3 + al.entier(4), 2); }
      for (const x of [60, larg - 72]) lanternePierre(g, x, 40);
      break;
    }
  }
}
// Voile doux (dégradé radial) cuit dans le fond : pénombre ou halo sans bord net
function voile(g, x, y, rx, ry, c, a) { g.save(); g.imageSmoothingEnabled = true; g.globalAlpha = a; g.drawImage(halo(c, true), x - rx, y - ry, rx * 2, ry * 2); g.restore(); }
function bougie(g, x, y, cire = '#2a2230') {
  g.globalAlpha = 0.18; g.drawImage(disque(9, '#ffb040'), x - 7, y - 12); g.globalAlpha = 1;
  g.fillStyle = '#1c1420'; g.fillRect(x - 1, y - 1, 6, 11); g.fillStyle = cire; g.fillRect(x, y, 4, 9); g.fillStyle = nuancer(cire, 1.3); g.fillRect(x, y, 1, 9);
  g.fillStyle = '#ffb040'; g.fillRect(x + 1, y - 4, 2, 3); g.fillStyle = '#fff0a0'; g.fillRect(x + 1, y - 3, 2, 1);
  lumiere(x + 2, y - 3, 48, '#ffb040', 0.55, true, 0.35);
}
function auvent(g, x, y, l) { // auvent d'échoppe rayé vert et crème, bord festonné, ombre portée
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 1, y + 12, l, 3);
  for (let i = 0; i < l; i += 8) { g.fillStyle = (i / 8) % 2 ? '#e8e0c8' : '#3a9a6a'; g.fillRect(x + i, y, 8, 9); g.fillRect(x + i + 1, y + 9, 6, 2); g.fillRect(x + i + 2, y + 11, 4, 1); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x + i, y + 1, 8, 1); }
  g.fillStyle = '#2a1a10'; g.fillRect(x - 2, y - 1, l + 4, 2);
}
function etagereMarchandises(g, x, y) { // étagère : rouleaux, fioles et sacs alignés (décor)
  const al = new Alea('etal' + x);
  for (const [ry, n] of [[y, 6], [y + 13, 5]]) {
    for (let k = 0; k < n; k++) { const c = al.choix(['#c8b890', '#8a3a2a', '#3a5a8a', '#5a9a5a', '#d8a040', '#e8dcc0']); const h = 4 + al.entier(4), w = n === 6 ? 5 : 6, xx = x + 2 + k * (n === 6 ? 8 : 10); g.fillStyle = '#1c1420'; g.fillRect(xx - 1, ry - h - 1, w + 2, h + 1); g.fillStyle = c; g.fillRect(xx, ry - h, w, h); g.fillStyle = nuancer(c, 1.3); g.fillRect(xx, ry - h, 1, h); }
    g.fillStyle = '#5a3a22'; g.fillRect(x, ry, 52, 3); g.fillStyle = '#2a1c14'; g.fillRect(x, ry + 3, 52, 1);
  }
}
// ── Mobilier des salles spéciales (cuit dans le fond, sans collision) ──
const RECT = (g, x, y, l, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), l, h); };
function banniere(g, x, y, fond, motif, embleme) { // bannière de tissu suspendue, bas en pointe, emblème
  RECT(g, x - 2, y, 24, 2, '#3a2a1c'); RECT(g, x, y + 2, 20, 22, '#1c1420'); RECT(g, x + 1, y + 2, 18, 21, fond); RECT(g, x + 1, y + 2, 2, 21, nuancer(fond, 1.25));
  for (let k = 0; k < 9; k++) { RECT(g, x + 1 + k, y + 23 + Math.floor(k / 2), 1, 1, '#1c1420'); RECT(g, x + 18 - k, y + 23 + Math.floor(k / 2), 1, 1, '#1c1420'); RECT(g, x + 2 + k, y + 22 + Math.floor(k / 2), 16 - 2 * k > 0 ? 16 - 2 * k : 0, 1, fond); }
  const cx = x + 10, cy = y + 11;
  if (embleme === 'kunais') for (let k = -5; k <= 5; k++) { RECT(g, cx + k, cy + k, 1, 1, motif); RECT(g, cx + k, cy - k, 1, 1, motif); }
  else if (embleme === 'crane') { RECT(g, cx - 4, cy - 4, 8, 6, motif); RECT(g, cx - 3, cy + 2, 6, 2, motif); RECT(g, cx - 3, cy - 2, 2, 2, fond); RECT(g, cx + 1, cy - 2, 2, 2, fond); RECT(g, cx - 1, cy + 2, 1, 2, fond); RECT(g, cx + 1, cy + 2, 1, 2, fond); }
}
function chaine(g, x, y, l) { for (let k = 0; k < l; k += 3) { RECT(g, x, y + k, 3, 3, '#1c1420'); RECT(g, x + (k % 6 ? 1 : 0), y + k + 1, k % 6 ? 1 : 3, 1, '#8a8a94'); } RECT(g, x - 1, y + l, 5, 3, '#4a4a54'); }
function chaineSol(g, x0, y0, x1, y1) { const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 4); for (let k = 0; k < n; k++) { const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n; RECT(g, x - 1, y - 1, 3, 3, 'rgba(20,16,24,0.7)'); RECT(g, x, y, 1, 1, k % 2 ? '#8a8a9a' : '#5a5a68'); } }
function crane(g, x, y) { RECT(g, x - 1, y - 1, 8, 7, '#1c1420'); RECT(g, x, y, 6, 4, '#e0d8c8'); RECT(g, x + 1, y + 4, 4, 1, '#c8c0b0'); RECT(g, x + 1, y + 1, 1, 2, '#1c1420'); RECT(g, x + 4, y + 1, 1, 2, '#1c1420'); RECT(g, x + 2, y + 3, 1, 1, '#5a5048'); }
function amasCranes(g, x, y) { g.drawImage(ellipse(11, 3, 'rgba(0,0,0,0.3)'), x - 2, y + 10); crane(g, x, y + 5); crane(g, x + 7, y + 6); crane(g, x + 3, y); RECT(g, x + 12, y + 9, 5, 1, '#d8d0c0'); }
function estrade(g, x, y, l, h) { RECT(g, x - 2, y + h, l + 4, 3, 'rgba(0,0,0,0.3)'); RECT(g, x, y, l, h, '#4a3a3e'); RECT(g, x, y, l, 2, '#7a6a6e'); RECT(g, x, y + h - 3, l, 3, '#2a2024'); RECT(g, x + 4, y + h / 2, l - 8, 1, '#6a1a1a'); RECT(g, x + l / 2, y + h / 2, 1, h / 2 - 3, '#6a1a1a'); }
function lanternePierre(g, x, y) { // tōrō : chapeau, foyer lumineux, fût, socle
  g.drawImage(ellipse(8, 2, 'rgba(0,0,0,0.3)'), x - 2, y + 26); RECT(g, x - 1, y, 14, 4, '#1c1420'); RECT(g, x, y, 12, 3, '#9a948a'); RECT(g, x + 2, y + 4, 8, 7, '#1c1420'); RECT(g, x + 3, y + 5, 6, 5, '#ffd890'); RECT(g, x + 5, y + 5, 2, 5, '#fff4c0');
  RECT(g, x + 4, y + 11, 4, 11, '#1c1420'); RECT(g, x + 5, y + 11, 2, 11, '#8a847a'); RECT(g, x + 1, y + 22, 10, 4, '#1c1420'); RECT(g, x + 2, y + 22, 8, 3, '#7a746a');
  lumiere(x + 6, y + 8, 60, '#ffd890', 0.5, true, 0.3);
}
function lanterneRouge(g, x, y) { RECT(g, x + 4, y, 1, 4, '#1c1420'); RECT(g, x, y + 4, 9, 12, '#1c1420'); RECT(g, x + 1, y + 5, 7, 10, '#d8303a'); RECT(g, x + 3, y + 6, 3, 8, '#ff9a6a'); RECT(g, x + 1, y + 8, 7, 1, '#7a1a20'); RECT(g, x + 1, y + 12, 7, 1, '#7a1a20'); lumiere(x + 4, y + 10, 70, '#ff9a60', 0.55, true, 0.3); }
function tonneau(g, x, y) { g.drawImage(ellipse(9, 3, 'rgba(0,0,0,0.3)'), x - 1, y + 16); RECT(g, x - 1, y - 1, 18, 20, '#1c1420'); RECT(g, x, y, 16, 18, '#8a5a32'); RECT(g, x, y, 16, 3, '#a87444'); RECT(g, x + 2, y + 3, 1, 14, '#6a4226'); RECT(g, x + 8, y + 3, 1, 14, '#6a4226'); RECT(g, x + 13, y + 3, 1, 14, '#6a4226'); for (const yy of [5, 13]) { RECT(g, x, y + yy, 16, 2, '#3a3a44'); RECT(g, x, y + yy, 16, 1, '#7a7a88'); } }
function toileCoin(g, x, y, sx, sy) { for (let k = 0; k < 4; k++) { const r = 6 + k * 6; for (let a = 0; a <= 8; a++) { const t = a / 8 * Math.PI / 2; RECT(g, x + sx * Math.round(Math.cos(t) * r), y + sy * Math.round(Math.sin(t) * r), 1, 1, 'rgba(225,225,235,0.42)'); } } for (let a = 0; a <= 3; a++) { const t = a / 3 * Math.PI / 2; lignePixel(g, x, y, x + sx * Math.cos(t) * 26, y + sy * Math.sin(t) * 26, 'rgba(225,225,235,0.35)'); } }
function tasOr(g, x, y) { g.drawImage(ellipse(12, 4, 'rgba(0,0,0,0.25)'), x - 1, y + 10); for (let r = 0; r < 4; r++) for (let k = 0; k < 6 - r; k++) { const xx = x + k * 4 + r * 2, yy = y + 10 - r * 3; RECT(g, xx, yy + 1, 4, 2, '#7a5a18'); RECT(g, xx, yy, 4, 2, '#e8c050'); RECT(g, xx, yy, 1, 1, '#fff4b0'); } }
function barreaux(g, x, y) { RECT(g, x - 1, y + 2, 22, 20, '#0e0a10'); for (let k = 0; k < 5; k++) { RECT(g, x + k * 5, y + 2, 2, 20, '#4a4a54'); RECT(g, x + k * 5, y + 2, 1, 20, '#8a8a98'); } RECT(g, x - 1, y + 2, 22, 2, '#5a5a66'); RECT(g, x - 1, y + 20, 22, 2, '#3a3a44'); }
function pileRouleaux(g, x, y) { for (const [dx, dy, c] of [[0, 6, '#e8dcc0'], [7, 6, '#d8c8a0'], [3, 2, '#c8b890'], [11, 3, '#e0d0b0']]) { RECT(g, x + dx - 1, y + dy - 1, 10, 6, '#1c1420'); RECT(g, x + dx, y + dy, 8, 4, c); RECT(g, x + dx, y + dy, 2, 4, '#a8885a'); RECT(g, x + dx + 4, y + dy, 1, 4, '#b02a2a'); } }
function bassin(g, x, y, rx, ry) { // source chaude : margelle de pierres, eau claire, reflets
  g.drawImage(ellipse(rx + 6, ry + 5, '#3a3a3e'), x - rx - 6, y - ry - 5); g.drawImage(ellipse(rx + 4, ry + 3, '#8a8478'), x - rx - 4, y - ry - 3);
  const al = new Alea('margelle' + x); for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2, px = x + Math.cos(a) * (rx + 2), py = y + Math.sin(a) * (ry + 1.5); RECT(g, px - 2, py - 1, 4 + al.entier(2), 3, al.chance(0.5) ? '#a8a294' : '#6a665e'); RECT(g, px - 2, py - 1, 2, 1, '#c8c2b4'); }
  g.drawImage(ellipse(rx, ry, '#2a6a8a'), x - rx, y - ry); g.drawImage(ellipse(rx - 4, ry - 3, '#3a8ab0'), x - rx + 4, y - ry + 3);
  for (let k = 0; k < 6; k++) { const a = al.suivant() * Math.PI * 2, d = al.suivant() * 0.7; RECT(g, x + Math.cos(a) * rx * d, y + Math.sin(a) * ry * d, 4, 1, 'rgba(220,250,255,0.45)'); }
}
function ponton(g, x, y, l) { for (let k = 0; k < l; k += 8) { RECT(g, x + k, y, 7, 10, '#1c1420'); RECT(g, x + k, y, 6, 9, '#8a6a42'); RECT(g, x + k, y, 6, 1, '#a88a5a'); } RECT(g, x, y + 9, l, 2, '#3a2a1a'); }
function bambou(g, x, y, h) { for (let k = 0; k < h; k++) { RECT(g, x, y - k, 3, 1, k % 12 === 0 ? '#3a5a2a' : '#6aa04a'); RECT(g, x, y - k, 1, 1, '#9ac87a'); } RECT(g, x + 3, y - h + 4, 4, 2, '#5a9a3a'); RECT(g, x - 4, y - h + 14, 4, 2, '#5a9a3a'); }
function etang(g, x, y) { g.drawImage(ellipse(20, 9, '#2a4a3a'), x - 2, y - 2); g.drawImage(ellipse(18, 7, '#3a7a6a'), x, y); for (const [dx, dy] of [[8, 3], [22, 6], [14, 9]]) { g.drawImage(disque(3, '#4a9a4a'), x + dx, y + dy); RECT(g, x + dx + 2, y + dy + 1, 2, 1, '#f0a0c0'); } }
function statueCrapaud(g, x, y) { // crapaud de pierre assis sur un socle
  g.drawImage(ellipse(12, 3, 'rgba(0,0,0,0.3)'), x - 1, y + 24); RECT(g, x - 1, y + 17, 24, 8, '#1c1420'); RECT(g, x, y + 18, 22, 6, '#7a7468'); RECT(g, x, y + 18, 22, 1, '#9a9488');
  RECT(g, x + 1, y + 5, 20, 14, '#1c1420'); RECT(g, x + 2, y + 6, 18, 12, '#8a9a7a'); RECT(g, x + 2, y + 6, 18, 2, '#aabb98'); RECT(g, x + 3, y + 2, 5, 5, '#1c1420'); RECT(g, x + 14, y + 2, 5, 5, '#1c1420'); RECT(g, x + 4, y + 3, 3, 3, '#aabb98'); RECT(g, x + 15, y + 3, 3, 3, '#aabb98');
  RECT(g, x + 5, y + 4, 1, 1, '#1c1420'); RECT(g, x + 16, y + 4, 1, 1, '#1c1420'); RECT(g, x + 6, y + 12, 10, 1, '#5e6c52'); RECT(g, x + 2, y + 16, 5, 2, '#5e6c52'); RECT(g, x + 15, y + 16, 5, 2, '#5e6c52');
}
function statueSerpent(g, x, y, miroir) { // serpent dressé de pierre sombre, yeux violets
  const sx = miroir ? -1 : 1, X = dx => x + (miroir ? 22 - dx : dx);
  g.drawImage(ellipse(11, 3, 'rgba(0,0,0,0.35)'), x, y + 26); RECT(g, x, y + 20, 22, 7, '#1c1420'); RECT(g, x + 1, y + 21, 20, 5, '#3a3440');
  for (let k = 0; k < 16; k++) { const xx = X(8 + Math.round(Math.sin(k * 0.6) * 4)); RECT(g, xx - 1, y + 20 - k, 6, 1, '#1c1420'); RECT(g, xx, y + 20 - k, 4, 1, k % 4 ? '#4a4252' : '#5a5264'); }
  RECT(g, X(6) - (miroir ? 8 : 0), y, 10, 6, '#1c1420'); RECT(g, X(7) - (miroir ? 8 : 0), y + 1, 8, 4, '#5a5264'); RECT(g, X(8) - (miroir ? 1 : 0), y + 2, 1, 1, '#c070ff'); RECT(g, X(12) - (miroir ? 1 : 0), y + 4, 4 * sx > 0 ? 3 : 3, 1, '#c03040');
  lumiere(x + 11, y + 4, 36, '#c070ff', 0.4, true, 0.3);
}
function tenture(g, x, y, fond, liseré) { RECT(g, x - 2, y, 28, 2, '#2a1c14'); for (let k = 0; k < 24; k++) { const h = 26 + Math.round(Math.sin(k * 0.7) * 2); RECT(g, x + k, y + 2, 1, h, k % 6 === 0 ? nuancer(fond, 0.7) : fond); } RECT(g, x, y + 2, 24, 1, liseré); RECT(g, x, y + 27, 24, 1, liseré); }
// Épines autour d'une porte de chambre maudite (côté salle) : sortir coûte une demi-unité
function epinesPorte(g, p, x, y) {
  // une rangée de pointes d'os qui sortent du cadre vers la salle : longues, base sombre, pointe claire
  const V = { haut: [0, 1], bas: [0, -1], gauche: [1, 0], droite: [-1, 0] }[p.dir]; if (!V) return;
  const [dx, dy] = V, ox = p.dir === 'gauche' ? x + 30 : p.dir === 'droite' ? x + 1 : x, oy = p.dir === 'haut' ? y + 30 : p.dir === 'bas' ? y + 1 : y;
  for (let i = 0; i < 6; i++) {
    const o = 2 + i * 5 + (i > 2 ? 1 : 0), L = i % 2 ? 6 : 9, px = dx ? ox : ox + o, py = dy ? oy : oy + o;
    for (let k = 0; k < L; k++) { const l = k < 2 ? 3 : k < L - 2 ? 2 : 1, c = k < 2 ? '#5a1a24' : k < L - 2 ? '#c8bcb4' : '#fff8f0';
      if (dx) RECT(g, px + dx * k, py - (l >> 1), 1, l, c); else RECT(g, px - (l >> 1), py + dy * k, l, 1, c); }
  }
  lumiere(x + 16 + dx * 14, y + 16 + dy * 14, 40, '#ff3050', 0.35, true, 0.3);
}
function shimenawa(g, x, y, l) { // corde tressée en arc et papiers shide en zigzag
  const o = i => Math.round(Math.sin(i / l * Math.PI) * 6);
  for (let i = 0; i < l; i += 4) { g.fillStyle = '#8a6a3a'; g.fillRect(x + i, y + o(i), 4, 3); g.fillStyle = '#c8a870'; g.fillRect(x + i + ((i / 4) % 2 ? 2 : 0), y + o(i), 2, 1); }
  for (let i = Math.round(l * 0.12); i < l; i += Math.round(l * 0.19)) { const px = x + i, py = y + o(i) + 3; g.fillStyle = '#f4f0e0'; g.fillRect(px, py, 2, 3); g.fillRect(px + 2, py + 2, 2, 3); g.fillRect(px, py + 5, 2, 3); }
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
    case 'lanterne': P(['..kk..', '.krrk.', 'krorrk', 'krrork', 'krrrrk', '.krrk.', '..kk..'], { k: '#3a2a20', r: '#c83a2a', o: '#f0c050' }); lumiere(x + 3, y + 4, 56, '#ffa050', 0.5, true, 0.3); break;
    case 'os': P(['w....w', 'ww..ww', '.wwww.', 'ww..ww', 'w....w'], { w: '#d8d0c0' }); break;
    case 'champignon': P(['.rrrr.', 'rrwrrr', 'rrrrwr', '..ss..', '..ss..'], { r: '#b84a6a', w: '#f0e0e0', s: '#d8c8b0' }); break;
    case 'fougere': P(['g.g.g', '.ggg.', 'g.g.g', '.ggg.', '..g..'], { g: '#4a7a3a' }); break;
    case 'cristal': P(['..c..', '.ccw.', '.cc c', 'ccccc', '.ccc.'], { c: '#8ad0e8', w: '#f0ffff' }); lumiere(x + 2, y + 2, 34, '#9ae0ff', 0.35, false, 0.25); break;
    case 'jarre_sable': P(['.bb.', 'bllb', 'bllb', '.bb.'], { b: '#8a6a40', l: '#c8a070' }); break;
    case 'bras': P(['..ww', '.ww.', 'ww..', 'w...'], { w: '#c8b8a0' }); break;
    case 'fil': g.fillStyle = 'rgba(220,220,240,0.35)'; g.fillRect(x, y, 1, 18); break;
    case 'cuve': P(['kkkk', 'kggk', 'kgwk', 'kggk', 'kkkk'], { k: '#4a5058', g: '#5a9a7a', w: '#9ad8b0' }); lumiere(x + 2, y + 2, 34, '#80f0b0', 0.35, false, 0.2); break;
    case 'tuyau': P(['kkkkkk', 'kmmmmk', 'kkkkkk'], { k: '#3a3e44', m: '#6a7078' }); break;
    case 'mue': P(['..ww..', '.w..w.', 'w....w', '.w..w.', '..ww..'], { w: '#d8d4c0' }); break;
    case 'algue': P(['g..g', '.gg.', 'g..g', '.gg.'], { g: '#3a6a5a' }); break;
    case 'chaine': P(['kk.kk', 'k.k.k', 'kk.kk'], { k: '#6a6a70' }); break;
    case 'nuage': P(['.rr.rr.', 'rrrrrrr', '.rrrrr.'], { r: '#8a2a2a' }); break;
    case 'anneau': P(['.kk.', 'k..k', 'k..k', '.kk.'], { k: '#b0a060' }); break;
    case 'bougie': P(['.o.', '.y.', 'www', 'www', 'www'], { o: '#f08a2a', y: '#ffe060', w: '#e8e0d0' }); lumiere(x + 1, y, 40, '#ffb040', 0.5, true, 0.35); break;
    case 'arme': P(['....k', '...k.', '..k..', 'bk...', 'b....'], { k: '#a8a8b0', b: '#5a4a3a' }); break;
    case 'drapeau': P(['kwww', 'kwrw', 'kwww', 'k...', 'k...'], { k: '#5a4a3a', w: '#d8d0c0', r: '#a83a3a' }); break;
    case 'sceau': P(['..k..', '.k.k.', 'k.k.k', '.k.k.', '..k..'], { k: '#7a2a2a' }); break;
    default: break;
  }
}
function dessinerCadrePorte(g, s, p, V) {
  const x = p.tx * TUILE, y = p.ty * TUILE; const C = CADRES_PORTE[p.type] || CADRES_PORTE.normale;
  if (p.etat === 'secrete') return; // indistinguable du mur (sauf indices : fissure légère)
  if (p.revelee) { dessinerBreche(g, p, x, y, V); return; } // passage secret ouvert à l'explosif : trou aux bords cassés
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
  if (p.type === 'boutique' || p.type === 'heritage') ornementsPorte(g, p, x, y);
  if (s.type === 'malediction' && !p.revelee) epinesPorte(g, p, x, y);
}
// De part et d'autre de la porte : deux lanternes de papier rouges (échoppe) ou deux flammes d'or (héritage)
function ornementsPorte(g, p, x, y) {
  const pos = p.dir === 'haut' ? [[x - 8, y + 12], [x + 32, y + 12]] : p.dir === 'bas' ? [[x - 8, y + 4], [x + 32, y + 4]] : [[x + 12, y - 10], [x + 12, y + 32]];
  for (const [ox, oy] of pos) {
    if (p.type === 'boutique') {
      g.fillStyle = '#1c1420'; g.fillRect(ox + 2, oy - 2, 4, 2); g.fillRect(ox, oy, 8, 10); g.fillStyle = '#d8303a'; g.fillRect(ox + 1, oy + 1, 6, 8); g.fillStyle = '#ff8a5a'; g.fillRect(ox + 3, oy + 2, 2, 6);
      g.fillStyle = '#1c1420'; g.fillRect(ox + 1, oy + 4, 6, 1); g.fillRect(ox + 3, oy + 10, 2, 2);
      lumiere(ox + 4, oy + 5, 46, '#ff9a60', 0.5, true, 0.3);
    } else {
      g.fillStyle = '#1c1420'; g.fillRect(ox, oy + 5, 8, 5); g.fillStyle = '#b08a30'; g.fillRect(ox + 1, oy + 6, 6, 3); g.fillStyle = '#e8c050'; g.fillRect(ox + 1, oy + 6, 6, 1);
      g.fillStyle = '#ffb040'; g.fillRect(ox + 2, oy + 1, 4, 5); g.fillStyle = '#fff0a0'; g.fillRect(ox + 3, oy + 2, 2, 3);
      lumiere(ox + 4, oy + 3, 50, '#ffd060', 0.6, true, 0.4);
    }
  }
}
// Brèche d'un passage secret : ouverture aux bords irréguliers, briques cassées, gravats au pied
function dessinerBreche(g, p, x, y, V) {
  const al = new Alea('breche|' + p.tx + ',' + p.ty), M = (V && V.mur) || {}, face = M.face || '#5a4a40';
  const sombre = '#050407', bord = nuancer(face, 1.35), creux = nuancer(face, 0.55), gravats = [face, nuancer(face, 0.8), nuancer(face, 1.15), '#6a6060'];
  const vertical = p.dir === 'haut' || p.dir === 'bas';
  // profondeur : du bord du mur vers la salle ; largeur irrégulière (5 à 9 px de bord de chaque côté)
  const d0 = p.dir === 'haut' ? 5 : p.dir === 'gauche' ? 5 : 0, d1 = p.dir === 'haut' ? 32 : p.dir === 'gauche' ? 32 : p.dir === 'bas' ? 24 : 27;
  for (let d = d0; d < d1; d++) {
    const a = 5 + al.entier(4), b = 5 + al.entier(4), L = 32 - a - b;
    if (vertical) { g.fillStyle = creux; g.fillRect(x + a - 2, y + d, 2, 1); g.fillRect(x + 32 - b, y + d, 2, 1); g.fillStyle = sombre; g.fillRect(x + a, y + d, L, 1); g.fillStyle = bord; g.fillRect(x + a - 3, y + d, 1, 1); g.fillRect(x + 34 - b, y + d, 1, 1); }
    else { g.fillStyle = creux; g.fillRect(x + d, y + a - 2, 1, 2); g.fillRect(x + d, y + 32 - b, 1, 2); g.fillStyle = sombre; g.fillRect(x + d, y + a, 1, L); g.fillStyle = bord; g.fillRect(x + d, y + a - 3, 1, 1); g.fillRect(x + d, y + 34 - b, 1, 1); }
  }
  // gravats côté salle
  for (let i = 0; i < 9; i++) {
    const u = 3 + al.entier(26), w = 2 + al.entier(3), h = 2 + al.entier(2); g.fillStyle = al.choix(gravats);
    if (p.dir === 'haut') g.fillRect(x + u, y + 28 + al.entier(4), w, h); else if (p.dir === 'bas') g.fillRect(x + u, y + al.entier(4), w, h);
    else if (p.dir === 'gauche') g.fillRect(x + 28 + al.entier(4), y + u, h, w); else g.fillRect(x + al.entier(4), y + u, h, w);
  }
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
  // préchauffage : hors combat, le fond d'une salle voisine se construit en avance (pas d'à-coup à la porte)
  if (s && !s.combat && G.etage && (++_prechauffe % 6) === 0) for (const p of s.portes) { const v = G.etage.salles[p.vers]; if (v && !v._fond && p.etat !== 'secrete') { fondSalle(v); break; } }
}
let _prechauffe = 0;
const HAUTEUR_VOL = 5; // px : les volants flottent au-dessus de leur ombre (leur point d'impact est relevé d'autant)
function capturerVue() { const c = toile(ECRAN_L, ECRAN_H); const g = ctxDe(c); g.fillStyle = '#07060a'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); rendreSalle(g, 0, 0); return c; }

function rendreSalle(g, ox, oy) {
  const s = G.salle, J = G.joueur;
  const [cx, cy] = camera(s, J); const X = x => Math.round(x - cx + ox), Y = y => Math.round(y - cy + oy);
  g.drawImage(fondEcran(G.theme), ox, oy);
  // tout ce qui appartient à la salle (télégraphes, effets, brume, pénombre) reste dans son cadre, jamais sur le HUD
  g.save(); g.beginPath(); g.rect(X(0), Y(0), s.W * TUILE, s.H * TUILE); g.clip();
  g.drawImage(fondSalle(s), X(0), Y(0));
  dessinerAppliques(g, s, X, Y);
  if (s.type === 'depart' && G.etage && G.etage.numero === 1) dessinerConsignes(g, s, X, Y);
  const D = decorsTheme(G.theme);
  // pics dynamiques (variante « Atelier ») et pics standards
  for (let ty = 1; ty < s.H - 1; ty++) for (let tx = 1; tx < s.W - 1; tx++) { const t = s.tuiles[ty * s.W + tx]; if (t === T.PICS) g.drawImage(G.variante && G.variante.picsActifs && !picsSortis() ? D.picsRentres : D.pics, X(tx * TUILE), Y(ty * TUILE)); }
  // zones au sol (sous les entités)
  for (const z of G.zones) dessinerZone(g, z, X, Y);
  if (s._mursSable) dessinerMursSable(g, s, X, Y);
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
  for (const e of G.ennemis) L.push({ y: e.y, f: () => { const v = e.def.vol && !e.boss && !e.def.fixe, hv = v ? HAUTEUR_VOL + Math.round(Math.sin(G.temps * 5 + e.uid) * 1.5) : 0; if (!e.cache && !e.illusion && !(e.alpha < 0.5)) ombre(e.x, e.y, e.r * (v ? 0.6 : 0.9)); dessinerEnnemi(g, e, X(e.x), Y(e.y - (e.z || 0) - hv)); } });
  // corps du serpent (chaque anneau blesse au contact : il doit se voir) et chaîne des frères
  for (const e of G.ennemis) if (e.segments && !e.mort && !e.cache) e.segments.forEach((q, i) => L.push({ y: q.y - 0.5, f: () => { const r = Math.round(9 - i * 0.6); ombre(q.x, q.y, r); dessinerAnneauSerpent(g, X(q.x), Y(q.y) - 5, r, i); } }));
  for (const e of G.ennemis) if (e.chaine && !e.mort && !e.chaine.mort) L.push({ y: Math.max(e.y, e.chaine.y), f: () => dessinerChaineFreres(g, e, e.chaine, X, Y) });
  for (const f of J.familiers) L.push({ y: f.y, f: () => { ombre(f.x, f.y, 5); dessinerFamilier(g, f, X(f.x), Y(f.y)); } });
  if (J.etat !== 'mort' || G.animMort) L.push({ y: J.y, f: () => { ombre(J.x, J.y, 8); dessinerJoueur(g, J, X(J.x), Y(J.y - (J.z || 0))); } });
  L.sort((a, b) => a.y - b.y); for (const o of L) o.f();
  // lumière : ombre multipliée sur le décor et les personnages, éclats additifs sous les tirs
  eclairerSalle(g, s, X, Y, ox, oy);
  // télégraphes des ennemis ordinaires (au-dessus de l'ombre, comme tous les dangers)
  for (const e of G.ennemis) if (e.ia.tele || e.ia.phase === 'saut') dessinerTelegraphe(g, e, X(e.x), Y(e.y - (e.z || 0)));
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
  dessinerAir(g, s, X, Y);
  // obscurité / brume (les dangers et les ennemis restent contourés)
  if (G.variante && (G.variante.obscurite || G.variante.brume)) dessinerObscurite(g, s, X, Y);
  // textes flottants
  g.restore(); // fin de la découpe à la salle : textes, jauge et réticule restent entiers
  for (const t of G.textes) if (!t.ecran) { const k = t.age / t.duree, w = Police.largeur(t.t); g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1; Police.ecrire(g, t.t, borne(X(t.x), ox + w / 2 + 4, ox + ECRAN_L - w / 2 - 4), Y(t.y - k * 10), t.couleur || '#fff', { a: 'c' }); g.globalAlpha = 1; }
  // jauge de charge (compacte, au-dessus de la tête)
  if (J.tir.charge > 0) { const w = 18, k = Math.min(1, J.tir.charge); g.fillStyle = '#14101c'; g.fillRect(X(J.x - w / 2 - 1), Y(J.y - 40), w + 2, 4); g.fillStyle = k >= 1 ? (Math.floor(G.temps * 12) % 2 ? '#ffffff' : '#ffe060') : '#6ad0ff'; g.fillRect(X(J.x - w / 2), Y(J.y - 39), Math.round(w * k), 2); }
  if (J.tir.reticule && J.tir.reticule.actif) { const R = J.tir.reticule; g.drawImage(anneau(12, 1, '#ff5a3a'), X(R.x - 13), Y(R.y - 13)); g.fillStyle = '#ff5a3a'; g.fillRect(X(R.x) - 1, Y(R.y) - 1, 3, 3); }
}
const EFFETS_SOL = new Set(['cercle_danger', 'ligne_danger', 'arc_danger', 'marque_sol', 'cercle_sceau', 'cercle_soin', 'fissure', 'frappe_sol', 'indice_secret', 'anneau_expansif']);

let _cristal = null; // amas de cristaux (variante « Galeries de verre ») : font rebondir les projectiles
function spriteCristal() {
  return _cristal || (_cristal = contourner(peindre([
    '.....l........', '....lwl....l..', '....lwb...lwl.', '...lwbb...lwb.', '...lwbbd.lwbb.', '..lwbbbdlwbbbd', '..lwbbbdlwbbbd', '.lwbbbbdwbbbbd',
    '.lwbbbbdbbbbdd', 'lwbbbbbdbbbbd.', 'lbbbbbbdbbbdd.', 'dbbbbbbbbbddd.', '.dddbbbbbdddd.', '...dddddddd...'], { l: '#e8f8ff', w: '#c8f0ff', b: '#78c8e8', d: '#3a7898' })));
}
function dessinerObstacle(g, t, tx, ty, X, Y, D, s) {
  const x = X(tx * TUILE), y = Y(ty * TUILE);
  if (t !== T.FEU_ETEINT) g.drawImage(ellipse(t === T.JARRE ? 9 : 14, t === T.JARRE ? 3 : 5, 'rgba(0,0,0,0.3)'), x + (t === T.JARRE ? 7 : 2), y + 24);
  switch (t) {
    case T.ROCHER: g.drawImage(D.rochers[Math.floor(hasardTuile(tx, ty, 1) * 3)], x + 1, y + 3); break;
    case T.ROCHER_SCEAU: g.drawImage(D.rocherSceau, x + 1, y + 3); break;
    case T.TOTEM: g.drawImage(D.totem, x + 4, y - 2); break;
    case T.BLOC: g.drawImage(s.cristaux && s.cristaux.includes(ty * s.W + tx) ? spriteCristal() : D.bloc, x + 1, y + 4); break;
    case T.JARRE: g.drawImage(D.jarre, x + 6, y + 12); break;
    case T.CAISSE: g.drawImage(D.caisse, x + 4, y + 10); break;
    case T.FEU: g.drawImage(D.feu[Math.floor(G.temps * 8 + tx) % 3], x + 6, y + 4); break;
    case T.FEU_ETEINT: g.drawImage(D.feuEteint, x + 6, y + 18); break;
    case T.BLOC_CLE: g.drawImage(D.blocCle, x + 3, y + 6); break;
  }
  if (s.pvTuiles[ty * s.W + tx] !== undefined && PROP[t].pvTir && s.pvTuiles[ty * s.W + tx] < PROP[t].pvTir) { g.fillStyle = 'rgba(20,10,10,0.5)'; g.fillRect(x + 12, y + 14, 1, 6); g.fillRect(x + 13, y + 19, 4, 1); }
}
// Consignes peintes au sol de la première salle, selon le dernier périphérique utilisé
function dessinerConsignes(g, s, X, Y) {
  const E = Entrees, pad = E.dernierPeripherique === 'manette', [cx, cy] = centreSalle(s);
  const dep = pad ? 'Stick gauche' : ['haut', 'gauche', 'bas', 'droite'].map(a => E.libelle(a)).join(' ');
  const tir = pad ? E.libelleTirManette() : ['tirHaut', 'tirGauche', 'tirBas', 'tirDroite'].map(a => E.libelle(a)).join(' ');
  const L = [[cx - 120, cy - 30, 'Se déplacer', dep], [cx + 120, cy - 30, 'Lancer', tir], [cx - 120, cy + 34, 'Technique', E.libelle('actif')], [cx + 120, cy + 34, 'Parchemin explosif', E.libelle('explosif')]];
  g.globalAlpha = 0.4;
  for (const [x, y, t, k] of L) { Police.ecrire(g, t, X(x), Y(y), '#e8dcc0', { a: 'c' }); Police.ecrire(g, k, X(x), Y(y + 11), '#fff4d8', { a: 'c' }); }
  g.globalAlpha = 1;
}
function dessinerBattants(g, s, p, X, Y) {
  const x = X(p.tx * TUILE), y = Y(p.ty * TUILE);
  if (p.etat === 'secrete') { if (p.indice || G.joueur.drapeaux.indicesSecrets) { g.fillStyle = 'rgba(255,240,200,0.5)'; g.fillRect(x + 12, y + 10, 1, 8); g.fillRect(x + 13, y + 17, 5, 1); g.fillRect(x + 17, y + 12, 1, 5); } return; }
  const ferme = s.combat && G.portesFermeesDans <= 0 || p.etat === 'verrouillee' || (p.etat === 'conditionnelle' && !conditionPorte(s, p));
  // battants animés : ils glissent dans le mur à l'ouverture et retombent d'un coup à la fermeture
  if (p._ferme === undefined) { p._ferme = ferme; p._tBasc = -9; }
  if (p._ferme !== ferme) {
    p._ferme = ferme; p._tBasc = G.temps;
    if (ferme && !G.reglages.confort) for (let i = 0; i < 5; i++) G.particules.push({ x: p.tx * TUILE + 16 + (Math.random() - 0.5) * 20, y: p.ty * TUILE + (p.dir === 'haut' ? 30 : p.dir === 'bas' ? 4 : 24), vx: (Math.random() - 0.5) * 40, vy: -10 - Math.random() * 20, age: 0, duree: 0.35, couleur: 'rgba(200,190,170,0.7)', taille: 2 });
  }
  const kb = Math.min(1, Math.max(0, (G.temps - p._tBasc) / (ferme ? 0.12 : 0.34))), v = ferme ? 1 - (1 - kb) * (1 - kb) : 1 - kb * kb;
  if (v <= 0.03) return;
  const C = CADRES_PORTE[p.type] || CADRES_PORTE.normale, L = n => Math.max(1, Math.round(n * v));
  g.fillStyle = nuancer(C.cadre, 1.15);
  if (p.dir === 'haut') { g.fillRect(x + 6, y + 9, 20, L(23)); g.fillStyle = C.lum; for (let k = 0; k < 3; k++) g.fillRect(x + 9 + k * 6, y + 10, 2, L(21)); }
  else if (p.dir === 'bas') { g.fillRect(x + 6, y + 15 - L(15), 20, L(15)); g.fillStyle = C.lum; for (let k = 0; k < 3; k++) g.fillRect(x + 9 + k * 6, y + 14 - L(13), 2, L(13)); }
  else if (p.dir === 'gauche') { g.fillRect(x + 9, y + 6, L(23), 20); g.fillStyle = C.lum; for (let k = 0; k < 3; k++) g.fillRect(x + 10, y + 9 + k * 6, L(21), 2); }
  else { g.fillRect(x + 23 - L(23), y + 6, L(23), 20); g.fillStyle = C.lum; for (let k = 0; k < 3; k++) g.fillRect(x + 22 - L(21), y + 9 + k * 6, L(21), 2); }
  if (v < 0.6) return;
  if (p.etat === 'verrouillee') { const cx = x + 16 + (p.dir === 'gauche' ? 4 : p.dir === 'droite' ? -4 : 0), cy = y + 16 + (p.dir === 'haut' ? 4 : p.dir === 'bas' ? -6 : 0); g.drawImage(ICONES.cadenas, cx - 5, cy - 6); }
  if (p.etat === 'conditionnelle' && !conditionPorte(s, p)) { const cx = x + 16, cy = y + 16; g.drawImage(ICONES.coeurBarre, cx - 5, cy - 5); }
}
function conditionPorte(s, p) {
  const J = G.joueur; const v = G.etage.salles[p.vers];
  if (!v) return true;
  if (v.type === 'defi' || v.type === 'defi_boss' || s.type === 'defi' || s.type === 'defi_boss') {
    if (s.type === 'defi' || s.type === 'defi_boss') return true; // sortir est toujours possible hors combat
    if (aTalisman(J, 'TAL_032')) return true;
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
  const brume = G.variante.brume, feux = []; for (let ty = 0; ty < s.H; ty++) for (let tx = 0; tx < s.W; tx++) if (s.tuiles[ty * s.W + tx] === T.FEU) feux.push([X(tx * TUILE + 16), Y(ty * TUILE + 16)]);
  if (!brume) for (const [x, y] of feux) trou(x, y, 70); // le feu perce la pénombre ; dans la brume, il rougeoie à travers (plus bas)
  for (const e of G.effets) if (e.type === 'explosion') trou(X(e.x), Y(e.y), 90);
  if (!G.variante.brume) { for (const p of s._appliques || []) trou(X(p.x), Y(p.y + 10), 56); for (const l of s._lumieres || []) if (l.f) trou(X(l.x), Y(l.y), l.r * 0.6); } // la brume ne s'ouvre pas autour des lampes
  g.drawImage(c, 0, 0);
  if (brume && eclairageActif()) { g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = 0.5; for (const [x, y] of feux) g.drawImage(halo('#ffa050', false, 110), x - 55, y - 60, 110, 110); g.globalAlpha = 0.3; for (const p of s._appliques || []) g.drawImage(halo(ambiance(G.theme).lampe, false, 90), X(p.x) - 45, Y(p.y + 10) - 45, 90, 90); g.restore(); }
  // contours des ennemis et des dangers conservés au-dessus
  for (const e of G.ennemis) if (!e.cache && dist(e.x, e.y, J.x, J.y) > 90) { g.drawImage(anneau(e.r + 2, 1, 'rgba(255,90,90,0.7)'), X(e.x - e.r - 3), Y(e.y - e.hauteur - e.r - 3)); }
}
let _obscurite = null;
