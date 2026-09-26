// ═══════════════════════════════════════════════════════════════════════════
// Salle : grille de tuiles (anneau de murs compris), formes 1×1, 2×1, 1×2, 2×2,
// L (quatre orientations) et salles étroites ; portes ; collisions ; états.
// Coordonnées locales : (0,0) = coin haut-gauche de l'anneau de murs.
// ═══════════════════════════════════════════════════════════════════════════

const T = { VIDE: 0, MUR: 1, PORTE: 2, SOL: 3, ROCHER: 4, BLOC: 5, FOSSE: 6, PICS: 7, JARRE: 8, CAISSE: 9, FEU: 10, BLOC_CLE: 11, TOTEM: 12, ROCHER_SCEAU: 13, PONT: 14, TOILE: 15, FEU_ETEINT: 16, PICS_RENTRES: 17 };
// Propriétés : solide (marche), bloqueTir, explosable, pvTir (destructible par projectiles), fosse, blessant
const PROP = [];
PROP[T.VIDE] = { solide: 1, bloqueTir: 1, mur: 1 };
PROP[T.MUR] = { solide: 1, bloqueTir: 1, mur: 1 };
PROP[T.PORTE] = { solide: 1, bloqueTir: 1, mur: 1 };
PROP[T.SOL] = {};
PROP[T.ROCHER] = { solide: 1, bloqueTir: 1, explosable: 1, obstacle: 1 };
PROP[T.ROCHER_SCEAU] = { solide: 1, bloqueTir: 1, explosable: 1, obstacle: 1 };
PROP[T.TOTEM] = { solide: 1, bloqueTir: 1, explosable: 1, obstacle: 1 };
PROP[T.BLOC] = { solide: 1, bloqueTir: 1, obstacle: 1 };
PROP[T.FOSSE] = { fosse: 1 };
PROP[T.PICS] = { blessant: 1 };
PROP[T.PICS_RENTRES] = {};
PROP[T.JARRE] = { solide: 1, bloqueTir: 1, explosable: 1, pvTir: 3, obstacle: 1 };
PROP[T.CAISSE] = { solide: 1, bloqueTir: 1, explosable: 1, pvTir: 5, obstacle: 1 };
PROP[T.FEU] = { solide: 1, bloqueTir: 1, explosable: 1, pvTir: 4, obstacle: 1, contact: 1 };
PROP[T.FEU_ETEINT] = {};
PROP[T.BLOC_CLE] = { solide: 1, bloqueTir: 1, obstacle: 1, cle: 1 };
PROP[T.PONT] = {};
PROP[T.TOILE] = { ralentit: 1 };
const CAR_TUILE = { '.': T.SOL, '#': T.ROCHER, 'X': T.BLOC, 'O': T.FOSSE, '^': T.PICS, 'J': T.JARRE, 'C': T.CAISSE, 'F': T.FEU, 'K': T.BLOC_CLE, 'T': T.TOTEM, '$': T.ROCHER_SCEAU, '~': T.VIDE, 'W': T.TOILE };

// Formes : cellules occupées dans la boîte (cw × ch)
const FORMES = {
  '1x1': { cw: 1, ch: 1, cel: [[0, 0]] },
  '2x1': { cw: 2, ch: 1, cel: [[0, 0], [1, 0]] },
  '1x2': { cw: 1, ch: 2, cel: [[0, 0], [0, 1]] },
  '2x2': { cw: 2, ch: 2, cel: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  'L1': { cw: 2, ch: 2, cel: [[1, 0], [0, 1], [1, 1]] },   // coin haut-gauche absent
  'L2': { cw: 2, ch: 2, cel: [[0, 0], [0, 1], [1, 1]] },   // coin haut-droit absent
  'L3': { cw: 2, ch: 2, cel: [[0, 0], [1, 0], [1, 1]] },   // coin bas-gauche absent
  'L4': { cw: 2, ch: 2, cel: [[0, 0], [1, 0], [0, 1]] },   // coin bas-droit absent
};

function creerSalle(o) {
  const F = FORMES[o.forme || '1x1'];
  const W = CEL_L * F.cw + 2, H = CEL_H * F.ch + 2;
  const s = {
    id: o.id, type: o.type || 'combat', forme: o.forme || '1x1', cx: o.cx, cy: o.cy, cw: F.cw, ch: F.ch,
    W, H, tuiles: new Array(W * H).fill(T.VIDE), pvTuiles: {}, portes: [],
    gabarit: null, visitee: false, apercue: false, nettoyee: false, recompensee: false, decouverte: true,
    ramassables: [], piedestaux: [], machines: [], pnj: [], decals: [], ennemisDef: [], ennemisVivants: null,
    butinGenere: false, graine: o.graine || 0, donnees: {},
  };
  // Intérieur des cellules présentes = SOL ; le reste reste VIDE ; les tuiles VIDE voisines du sol deviennent MUR.
  for (const [i, j] of F.cel) for (let ty = 1 + CEL_H * j; ty < 1 + CEL_H * (j + 1); ty++) for (let tx = 1 + CEL_L * i; tx < 1 + CEL_L * (i + 1); tx++) s.tuiles[ty * W + tx] = T.SOL;
  // Cellules adjacentes d'une même salle : la frontière intérieure est déjà du sol (pas de mur entre elles).
  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
    if (s.tuiles[ty * W + tx] !== T.VIDE) continue;
    let voisinSol = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = tx + dx, y = ty + dy; if (x >= 0 && y >= 0 && x < W && y < H && s.tuiles[y * W + x] === T.SOL) voisinSol = true; }
    if (voisinSol) s.tuiles[ty * W + tx] = T.MUR;
  }
  return s;
}
function celluleExiste(s, i, j) { return FORMES[s.forme].cel.some(([a, b]) => a === i && b === j); }
// Position de la tuile de porte pour la cellule (i,j) et la direction d
function tuilePorte(i, j, d) {
  if (d === 'haut') return [1 + CEL_L * i + 6, CEL_H * j];
  if (d === 'bas') return [1 + CEL_L * i + 6, CEL_H * (j + 1) + 1];
  if (d === 'gauche') return [CEL_L * i, 1 + CEL_H * j + 3];
  return [CEL_L * (i + 1) + 1, 1 + CEL_H * j + 3];
}
// Tuile de sol juste devant une porte (côté intérieur)
function tuileDevantPorte(p) { const [dx, dy] = DIRS[p.dir]; return [p.tx - dx, p.ty - dy]; }
function ajouterPorte(s, i, j, d, vers, type, etat) {
  const [tx, ty] = tuilePorte(i, j, d);
  const p = { dir: d, i, j, tx, ty, vers, type: type || 'normale', etat: etat || 'ouverte', secrete: etat === 'secrete' };
  s.portes.push(p); s.tuiles[ty * s.W + tx] = T.PORTE; return p;
}

// Applique un gabarit (grille de caractères couvrant l'intérieur de la boîte)
function appliquerGabarit(s, gab, alea) {
  s.gabarit = gab.id;
  const lignes = gab.grille; s.pointsApparition = []; s.pointsSpeciaux = [];
  for (let y = 0; y < lignes.length; y++) for (let x = 0; x < lignes[y].length; x++) {
    const ch = lignes[y][x], tx = x + 1, ty = y + 1; if (tx >= s.W - 1 || ty >= s.H - 1) continue;
    const i = ty * s.W + tx; if (s.tuiles[i] !== T.SOL) continue;
    if (CAR_TUILE[ch] !== undefined) { s.tuiles[i] = CAR_TUILE[ch]; if (s.tuiles[i] === T.VIDE) s.tuiles[i] = T.MUR; }
    else if (/[a-z]/.test(ch)) s.pointsApparition.push({ role: ch, tx, ty });
    else if (/[1-9A-Z@&*]/.test(ch)) s.pointsSpeciaux.push({ c: ch, tx, ty });
  }
  // murs internes des gabarits à vide (~) : recalcul des VIDE entourés
  for (let ty = 1; ty < s.H - 1; ty++) for (let tx = 1; tx < s.W - 1; tx++) {
    const i = ty * s.W + tx; if (s.tuiles[i] !== T.MUR) continue;
    let voisinSol = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const t = s.tuiles[(ty + dy) * s.W + tx + dx]; if (t !== T.MUR && t !== T.VIDE && t !== T.PORTE) voisinSol = true; }
    if (!voisinSol) s.tuiles[i] = T.VIDE;
  }
  for (const p of s.portes) s.tuiles[p.ty * s.W + p.tx] = T.PORTE;
  // Rocher à sceau aléatoire (au plus un par salle)
  if (alea && !gab.sansSceau) {
    const rochers = []; for (let k = 0; k < s.tuiles.length; k++) if (s.tuiles[k] === T.ROCHER) rochers.push(k);
    if (rochers.length && alea.chance(Math.min(0.35, rochers.length * 0.03))) s.tuiles[alea.choix(rochers)] = T.ROCHER_SCEAU;
  }
  for (let k = 0; k < s.tuiles.length; k++) { const pv = PROP[s.tuiles[k]].pvTir; if (pv) s.pvTuiles[k] = pv; }
}

// ── Requêtes de tuiles ──
function tuileA(s, tx, ty) { if (tx < 0 || ty < 0 || tx >= s.W || ty >= s.H) return T.VIDE; return s.tuiles[ty * s.W + tx]; }
function tuilePx(s, x, y) { return tuileA(s, Math.floor(x / TUILE), Math.floor(y / TUILE)); }
function porteEn(s, tx, ty) { return s.portes.find(p => p.tx === tx && p.ty === ty); }
function porteOuverte(s, p) { return p.etat === 'ouverte' && !s.combat; }
function solidePour(s, tx, ty, mode) { // mode : 'marche' | 'vol' | 'spectral'
  const t = tuileA(s, tx, ty);
  if (t === T.PORTE) { const p = porteEn(s, tx, ty); return !(p && porteOuverte(s, p) && mode !== 'ennemi'); }
  const P = PROP[t];
  if (P.mur) return true;
  if (mode === 'vol') return false;
  if (P.solide) return true;
  if (P.fosse && mode !== 'vol') return true;
  return false;
}
// Déplacement d'un cercle avec glissement le long des murs (passes séparées x puis y)
function deplacerCercle(s, e, dx, dy, mode) {
  const r = e.r || 6; const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 6));
  let bloqueX = false, bloqueY = false;
  for (let k = 0; k < n; k++) {
    e.x += dx / n; if (resoudre(s, e, r, mode, 'x')) bloqueX = true;
    e.y += dy / n; if (resoudre(s, e, r, mode, 'y')) bloqueY = true;
  }
  return { bloqueX, bloqueY };
}
function resoudre(s, e, r, mode, axe) {
  let touche = false;
  const tx0 = Math.floor((e.x - r) / TUILE), tx1 = Math.floor((e.x + r) / TUILE), ty0 = Math.floor((e.y - r) / TUILE), ty1 = Math.floor((e.y + r) / TUILE);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    if (!solidePour(s, tx, ty, mode)) continue;
    const rx = tx * TUILE, ry = ty * TUILE;
    const px = borne(e.x, rx, rx + TUILE), py = borne(e.y, ry, ry + TUILE);
    let ddx = e.x - px, ddy = e.y - py; const d = Math.hypot(ddx, ddy);
    if (d >= r) continue;
    touche = true;
    if (d > 0.0001) { const k = (r - d) / d; e.x += ddx * k; e.y += ddy * k; }
    else { // centre dans la tuile : on ressort selon l'axe traité
      if (axe === 'x') e.x = (e.x < rx + TUILE / 2) ? rx - r : rx + TUILE + r;
      else e.y = (e.y < ry + TUILE / 2) ? ry - r : ry + TUILE + r;
    }
  }
  return touche;
}
// Ligne de vue / trajectoire libre (pas de 4 px) pour l'IA et les tirs
function ligneLibre(s, x0, y0, x1, y1, mode = 'tir') {
  const d = dist(x0, y0, x1, y1), n = Math.ceil(d / 6);
  for (let k = 1; k < n; k++) {
    const x = lerp(x0, x1, k / n), y = lerp(y0, y1, k / n); const t = tuilePx(s, x, y);
    if (mode === 'tir' ? PROP[t].bloqueTir : (PROP[t].solide || PROP[t].fosse)) return false;
  }
  return true;
}
// Centre de la salle et tuiles libres
function tuileLibre(s, tx, ty, marge) { const t = tuileA(s, tx, ty); return t === T.SOL || t === T.PONT || t === T.PICS_RENTRES || t === T.FEU_ETEINT || (marge && t === T.TOILE); }
function centreTuile(tx, ty) { return [tx * TUILE + TUILE / 2, ty * TUILE + TUILE / 2]; }
function centreSalle(s) {
  // centre de la première cellule présente la plus proche du centre de la boîte
  const F = FORMES[s.forme]; let best = null, bd = 1e9; const bx = s.W / 2, by = s.H / 2;
  for (const [i, j] of F.cel) { const cx = 1 + CEL_L * i + 6.5, cy = 1 + CEL_H * j + 3.5; const d = dist(cx, cy, bx, by); if (d < bd) { bd = d; best = [cx * TUILE, cy * TUILE]; } }
  return best;
}
// Tuile libre la plus proche d'un point (recherche en anneaux), en évitant une liste
function tuileLibreProche(s, x, y, eviter = [], exigeant = true) {
  const tx0 = Math.floor(x / TUILE), ty0 = Math.floor(y / TUILE);
  for (let r = 0; r < 20; r++) {
    let best = null, bd = 1e9;
    for (let ty = ty0 - r; ty <= ty0 + r; ty++) for (let tx = tx0 - r; tx <= tx0 + r; tx++) {
      if (Math.max(Math.abs(tx - tx0), Math.abs(ty - ty0)) !== r) continue;
      if (!tuileLibre(s, tx, ty)) continue;
      if (exigeant && eviter.some(([ex, ey]) => ex === tx && ey === ty)) continue;
      const d = dist(tx, ty, tx0, ty0); if (d < bd) { bd = d; best = [tx, ty]; }
    }
    if (best) return best;
  }
  return [tx0, ty0];
}
// Accessibilité à pied depuis une tuile (inondation) : vérifie portes et apparitions
function accessibles(s, tx, ty, mode = 'marche') {
  const vu = new Uint8Array(s.W * s.H), pile = [[tx, ty]]; vu[ty * s.W + tx] = 1;
  while (pile.length) {
    const [x, y] = pile.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= s.W || ny >= s.H) continue;
      const i = ny * s.W + nx; if (vu[i]) continue;
      const t = s.tuiles[i]; const P = PROP[t];
      if (t === T.PORTE) { vu[i] = 2; continue; }
      if (P.mur || P.solide && !(mode === 'explosifs' && P.explosable) || (P.fosse && mode !== 'vol')) continue;
      vu[i] = 1; pile.push([nx, ny]);
    }
  }
  return vu;
}
