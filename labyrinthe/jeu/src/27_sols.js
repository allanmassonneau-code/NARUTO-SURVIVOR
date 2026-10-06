// ═══════════════════════════════════════════════════════════════════════════
// Sols peints à l'échelle de la salle : la matière du thème couvre tout le sol
// d'un seul tenant (planches de longueurs variées, terre et herbe, sable ridé
// par le vent, dalles biseautées, plaques rivetées, pavés irréguliers, mousse),
// sans le damier répétitif des tuiles. Calculé pixel par pixel (ImageData),
// tramé en Bayer 4×4, contraste bas (le décor reste sous les personnages),
// identique pour une salle donnée. Le fond de salle le met en cache.
// ═══════════════════════════════════════════════════════════════════════════
const TRAME_SOL = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
function hachage2(x, y, k) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function bruitValeur(x, y, k) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hachage2(xi, yi, k), b = hachage2(xi + 1, yi, k), c = hachage2(xi, yi + 1, k), d = hachage2(xi + 1, yi + 1, k);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
// champ de bruit basse résolution (un point tous les 4 px) lu en bilinéaire : les grandes ondulations
// coûtent ainsi 16 fois moins cher que si on les recalculait à chaque pixel
function champ(W, H, ech, k, oct = 2) {
  const gw = (W >> 2) + 2, gh = (H >> 2) + 2, F = new Float32Array(gw * gh);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) F[j * gw + i] = fbm(i * 4 / ech, j * 4 / ech, k, oct);
  return (x, y) => { const fx = x / 4, fy = y / 4, ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy, n = iy * gw + ix; const a = F[n] + (F[n + 1] - F[n]) * tx, b = F[n + gw] + (F[n + gw + 1] - F[n + gw]) * tx; return a + (b - a) * ty; };
}
function fbm(x, y, k, oct = 3) { let s = 0, amp = 0.5, f = 1, n = 0; for (let o = 0; o < oct; o++) { s += amp * bruitValeur(x * f, y * f, k + o * 17); n += amp; amp *= 0.5; f *= 2; } return s / n; }
// nuance d'une couleur [r, v, b] : k < 1 assombrit, k > 1 éclaircit vers le blanc (comme nuancer)
function nuancerRgb(c, k) { if (k <= 1) return [c[0] * k, c[1] * k, c[2] * k]; const t = k - 1; return [c[0] + (255 - c[0]) * t, c[1] + (255 - c[1]) * t, c[2] + (255 - c[2]) * t]; }
function melangeRgb(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

// le sol est gardé avec la salle : un fond redessiné (rocher détruit, passage ouvert) ne repeint pas la matière
function solPeint(s, th) {
  const cle = s.id + '|' + th + '|' + s.W + 'x' + s.H + '|' + (G.etage ? G.etage.numero : 0);
  if (s._sol && s._sol.cle === cle) return s._sol.c;
  const c = peindreSol(s, (INDEX[th] || DON.themes[0]).visuel, th, hacher(cle)[0] % 1000003);
  s._sol = { cle, c }; return c;
}
function peindreSol(s, V, th, k0) {
  const W = s.W * TUILE, H = s.H * TUILE, c = toile(W, H), g = ctxDe(c);
  const img = g.createImageData(W, H), buf = new Uint32Array(img.data.buffer);
  const S = V.sol, base = hexRgb(S.base), joint = hexRgb(S.joint), vars = (S.var || [S.base]).map(hexRgb);
  // k : luminosité relative, quantifiée par pas de 3 % et tramée (pas de dégradé lisse)
  const put = (x, y, col, k) => { // sans allocation : appelé pour chaque pixel du sol
    const kq = Math.floor(k * 33.333 + TRAME_SOL[((y & 3) << 2) | (x & 3)]) * 0.03; let r, v, b;
    if (kq <= 1) { r = col[0] * kq; v = col[1] * kq; b = col[2] * kq; } else { const t = kq - 1; r = col[0] + (255 - col[0]) * t; v = col[1] + (255 - col[1]) * t; b = col[2] + (255 - col[2]) * t; }
    buf[y * W + x] = 0xff000000 | ((b > 255 ? 255 : b) << 16) | ((v > 255 ? 255 : v) << 8) | (r > 255 ? 255 : r);
  };
  const putBrut = (x, y, col) => { buf[y * W + x] = (255 << 24) | ((col[2] | 0) << 16) | ((col[1] | 0) << 8) | (col[0] | 0); };
  const U = champ(W, H, 80, k0 + 31), usure = (x, y) => 1 + (U(x, y) - 0.5) * 0.09; // passages usés, zones plus sombres
  switch (S.motif) {
    case 'planches': { // longues planches décalées, veinage, nœuds, clous aux extrémités
      for (let y0 = 0, rang = 0; y0 < H; y0 += 8, rang++) {
        const P = []; let x = -Math.floor(hachage2(rang, 1, k0) * 80);
        while (x < W) { const l = 46 + Math.floor(hachage2(rang, x, k0 + 1) * 72); P.push({ x0: x, x1: x + l, col: vars[Math.floor(hachage2(rang, x, k0 + 2) * vars.length)], ph: hachage2(rang, x, k0 + 3) * 50, kn: hachage2(rang, x, k0 + 4) < 0.3 ? x + 10 + Math.floor(hachage2(rang, x, k0 + 5) * (l - 20)) : -99, t: 0.97 + hachage2(rang, x, k0 + 6) * 0.06 }); x += l; }
        for (let yy = 0; yy < 8 && y0 + yy < H; yy++) { let i = 0; for (let x = 0; x < W; x++) {
          while (P[i].x1 <= x) i++; const p = P[i], lx = x - p.x0, y = y0 + yy;
          if (yy === 7 || lx === 0) { putBrut(x, y, joint); continue; }
          let k = p.t * usure(x, y);
          if (yy === 0) k *= 1.08; else if (yy === 6) k *= 0.95;
          const v = bruitValeur(x * 0.07 + p.ph, yy * 0.6 + p.ph, k0 + 7); if (v > 0.68) k *= 0.94; else if (v < 0.2) k *= 1.03;
          if (p.kn > 0) { const dx = (x - p.kn) / 3, dy = (yy - 3.5) / 2; const d = dx * dx + dy * dy; if (d < 1) k *= d < 0.35 ? 0.78 : 0.9; }
          if ((lx === 2 || x === p.x1 - 3) && (yy === 2 || yy === 5)) k *= 0.7; // clous
          put(x, y, p.col, k);
        } }
      }
      break;
    }
    case 'dalles': { // dalles de 16 px biseautées, teintes variées, quelques dalles fendues
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const lx = x & 15, ly = y & 15, tx = x >> 4, ty = y >> 4;
        if (lx === 0 || ly === 0) { putBrut(x, y, joint); continue; }
        const h = hachage2(tx, ty, k0); let k = (0.96 + h * 0.08) * usure(x, y) * (1 + (bruitValeur(x / 5, y / 5, k0 + 2) - 0.5) * 0.05);
        if (lx === 1 || ly === 1) k *= 1.09; else if (lx === 15 || ly === 15) k *= 0.88;
        if (h > 0.9 && Math.abs(lx - ly - 2) < 1 && lx > 3) k *= 0.8; // fissure en diagonale
        put(x, y, vars[Math.floor(hachage2(tx, ty, k0 + 1) * vars.length)], k);
      }
      break;
    }
    case 'metal': { // plaques rivetées alignées sur les tuiles, tôle striée, coulures de rouille
      const RO = champ(W, H, 26, k0 + 5);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const lx = x & 31, ly = y & 31, px = x >> 5, py = y >> 5;
        if (lx === 0 || ly === 0) { putBrut(x, y, joint); continue; }
        const h = hachage2(px, py, k0); let col = vars[Math.floor(h * vars.length)], k = 0.98 + h * 0.05;
        if (lx === 1 || ly === 1) k *= 1.1; else if (lx === 31 || ly === 31) k *= 0.82;
        const rx = lx === 3 || lx === 4 || lx === 27 || lx === 28, ry = ly === 3 || ly === 4 || ly === 27 || ly === 28;
        if (rx && ry) k *= (lx === 3 || lx === 27) && (ly === 3 || ly === 27) ? 1.3 : 0.75; // rivets
        else if (h < 0.4 && lx > 5 && lx < 27 && ly > 5 && ly < 27) { const u = (lx + (ly >> 2) * 2) % 6; if ((ly & 3) === 0 && u < 3) k *= 1.08; else if ((ly & 3) === 1 && u < 3) k *= 0.9; }
        const rouille = RO(x, y); if (rouille > 0.66) col = melangeRgb(col, [96, 70, 50], Math.min(0.45, (rouille - 0.66) * 3));
        put(x, y, col, k * usure(x, y));
      }
      break;
    }
    case 'pierre': { // pavés irréguliers en rangs décalés, joints de mortier, arêtes éclairées
      const rangs = []; for (let y = 0, r = 0; y < H; r++) { const h = 10 + Math.floor(hachage2(r, 0, k0) * 6), P = []; let x = -Math.floor(hachage2(r, 2, k0) * 18); while (x < W) { const l = 13 + Math.floor(hachage2(r, x, k0 + 1) * 13); P.push({ x0: x, l, col: vars[Math.floor(hachage2(r, x, k0 + 2) * vars.length)], t: 0.94 + hachage2(r, x, k0 + 3) * 0.1 }); x += l; } rangs.push({ y0: y, h, P }); y += h; }
      for (const R of rangs) for (let ly = 0; ly < R.h && R.y0 + ly < H; ly++) { let i = 0; for (let x = 0; x < W; x++) {
        while (R.P[i].x0 + R.P[i].l <= x) i++; const p = R.P[i], lx = x - p.x0, y = R.y0 + ly;
        if (lx === 0 || ly === 0 || ((lx === 1 || lx === p.l - 1) && (ly === 1 || ly === R.h - 1))) { putBrut(x, y, joint); continue; } // joints et coins arrondis
        let k = p.t * usure(x, y) * (1 + (bruitValeur(x / 3, y / 3, k0 + 4) - 0.5) * 0.07);
        if (ly === 1) k *= 1.08; else if (lx === 1) k *= 1.04; else if (ly === R.h - 1) k *= 0.86; else if (lx === p.l - 1) k *= 0.9;
        put(x, y, p.col, k);
      } }
      break;
    }
    case 'sable': { // sable ridé par le vent, ondulations de dunes, grains
      const Wv = champ(W, H, 70, k0), Du = champ(W, H, 125, k0 + 2);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const w = Wv(x, y), r = Math.sin(x * 0.12 + y * 0.05 + w * 7);
        let k = 0.97 + (Du(x, y) - 0.5) * 0.12;
        if (r > 0.86) k += 0.055; else if (r < -0.88) k -= 0.045;
        const gr = hachage2(x, y, k0 + 3); if (gr < 0.01) k -= 0.1; else if (gr < 0.018) k += 0.07;
        put(x, y, base, k);
      }
      break;
    }
    case 'mousse': { // mousse en plaques, trèfles et brins clairs
      const N = champ(W, H, 22, k0, 3), C = champ(W, H, 40, k0 + 1);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const n = N(x, y); let k = 0.9 + n * 0.2, col = vars[Math.min(vars.length - 1, Math.floor(C(x, y) * vars.length))];
        const h = hachage2(x, y, k0 + 2); if (h < 0.05) k *= 1.14; else if (h < 0.08) k *= 0.9;
        put(x, y, col, k * usure(x, y));
      }
      break;
    }
    default: { // terre : plaques de teintes voisines ; forêt : herbe en plaques ; champs de guerre : brûlures
      const herbe = hexRgb('#4c6232'), brule = hexRgb('#2a221c'), N1 = champ(W, H, 28, k0, 3), HB = champ(W, H, 46, k0 + 3), BR = champ(W, H, 60, k0 + 4);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const n1 = N1(x, y), n2 = bruitValeur(x / 5, y / 5, k0 + 9); let k = 0.9 + n1 * 0.2 + (n2 - 0.5) * 0.06, col = base;
        if (th === 'THM_FOR') { const hb = HB(x, y); if (hb > 0.54) { col = melangeRgb(base, herbe, Math.min(1, (hb - 0.54) * 4)); if (hachage2(x, y, k0 + 5) < 0.035) k *= 1.16; } }
        else if (th === 'THM_GUE') { const br = BR(x, y); if (br > 0.62) col = melangeRgb(base, brule, Math.min(0.7, (br - 0.62) * 3)); }
        put(x, y, col, k);
      }
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

// ── Fosses : paroi lointaine visible, lèvres de sol, coins arrondis, fond propre au thème ──
function dessinerFosse(g, s, tx, ty, V, th) {
  const x = tx * TUILE, y = ty * TUILE, F = (dx, dy) => tuileA(s, tx + dx, ty + dy) === T.FOSSE;
  const haut = !F(0, -1), gauche = !F(-1, 0), droite = !F(1, 0), bas = !F(0, 1);
  const R = (xx, yy, l, h, c) => { g.fillStyle = c; g.fillRect(x + xx, y + yy, l, h); };
  const sol = V.sol.base, lev = nuancer(sol, 1.18), fond = V.fosse;
  const PAROIS = { THM_FOR: '#2c2418', THM_SUN: nuancer(sol, 0.55), THM_ORO: '#2a3036', THM_KIR: '#24343c', THM_BIJ: '#3a1418', THM_MYO: '#2e3a24', THM_MAR: '#3a2a26', THM_AKA: '#241e28', THM_GUE: '#2e261e' };
  const paroi = PAROIS[th] || nuancer(V.mur.face, 0.5), paroiS = nuancer(paroi, 0.7), paroiC = nuancer(paroi, 1.25);
  // coins ouverts : le sol garde ses coins (fosses aux angles adoucis)
  const cHG = haut && gauche, cHD = haut && droite, cBG = bas && gauche, cBD = bas && droite;
  const remplir = (c) => { R(0, 0, 32, 32, c); };
  if (th === 'THM_KIR') { // eau profonde : surface sombre et vaguelettes
    remplir('#0e2a38'); for (let k = 0; k < 5; k++) { const h = hasardTuile(tx, ty, 20 + k); R(2 + Math.floor(h * 22), 8 + Math.floor(h * 97) % 20, 4 + Math.floor(h * 31) % 5, 1, 'rgba(150,210,240,0.28)'); }
  } else {
    remplir(fond);
    // le fond s'éloigne : centre plus sombre, lueur propre au thème
    // lueur lointaine continue d'une tuile à l'autre, et quelques points au fond (braises, spores, poussière)
    const lueur = { THM_BIJ: ['rgba(200,40,20,0.12)', '#ff6a3a'], THM_ORO: ['rgba(80,200,120,0.08)', '#7af0a8'], THM_MYO: ['rgba(200,230,200,0.05)', '#c8f0c0'], THM_AKA: ['rgba(120,60,140,0.08)', '#b07ad0'] }[th];
    if (lueur) R(0, 0, 32, 32, lueur[0]);
    for (let k = 0; k < 3; k++) { const h = hasardTuile(tx, ty, 5 + k); R(4 + Math.floor(h * 24), 16 + Math.floor(h * 97) % 13, 1, 1, lueur && k === 0 ? lueur[1] : 'rgba(255,255,255,0.05)'); }
  }
  if (haut) { // paroi lointaine vue de face, matière du thème, qui s'enfonce dans le noir
    const hp = th === 'THM_KIR' ? 6 : 13;
    R(0, 0, 32, hp, paroi);
    if (th === 'THM_KIR') { R(0, hp, 32, 1, 'rgba(200,240,255,0.35)'); R(0, hp + 1, 32, 1, 'rgba(0,0,0,0.3)'); }
    else {
      for (let k = 0; k < 3; k++) R(0, 3 + k * 4, 32, 1, paroiS); // strates
      for (let k = 0; k < 4; k++) { const h = hasardTuile(tx, ty, 30 + k), px = 2 + Math.floor(h * 27); R(px, 2 + Math.floor(h * 7) % 6, 2, 1, paroiC); }
      if (th === 'THM_FOR' || th === 'THM_MYO') for (let k = 0; k < 3; k++) { const h = hasardTuile(tx, ty, 40 + k), px = 3 + Math.floor(h * 26), l = 6 + Math.floor(h * 53) % 10; R(px, 1, 1, l, th === 'THM_MYO' ? '#4a6a3a' : '#4a3a24'); R(px + (k % 2 ? 1 : -1), l - 2, 1, 2, th === 'THM_MYO' ? '#6a9a4a' : '#5a4a2e'); } // racines et lianes
      if (th === 'THM_SUN') for (let k = 0; k < 2; k++) { const h = hasardTuile(tx, ty, 50 + k), px = 4 + Math.floor(h * 24); for (let i = 0; i < 9; i += 2) R(px + (i % 4 ? 1 : 0), 1 + i, 1, 1, nuancer(sol, 1.05)); } // filets de sable
      if (th === 'THM_ORO') for (const px of [6, 22]) { R(px, 2, 2, 2, '#8a929c'); R(px + 1, 3, 1, 1, '#1c2024'); } // rivets du puits
      [0.12, 0.25, 0.4, 0.55].forEach((a, k) => R(0, hp - 4 + k, 32, 1, 'rgba(0,0,0,' + a + ')'));
    }
    R(0, 0, 32, 1, lev); // arête du sol éclairée
  }
  // côtés : parois vues par la tranche, lèvre de sol claire
  if (gauche) { R(0, 0, 2, 32, paroiS); R(0, 0, 1, 32, nuancer(sol, 0.85)); }
  if (droite) { R(30, 0, 2, 32, paroiS); R(31, 0, 1, 32, nuancer(sol, 0.85)); }
  if (bas) { R(0, 29, 32, 3, nuancer(sol, 0.5)); R(0, 30, 32, 1, nuancer(sol, 0.75)); R(0, 31, 32, 1, lev); } // bord proche : le sol surplombe
  // coins arrondis : quelques pixels de sol
  const solC = nuancer(sol, 0.92);
  if (cHG) { R(0, 0, 3, 1, solC); R(0, 1, 1, 2, solC); }
  if (cHD) { R(29, 0, 3, 1, solC); R(31, 1, 1, 2, solC); }
  if (cBG) { R(0, 31, 3, 1, solC); R(0, 29, 1, 2, solC); }
  if (cBD) { R(29, 31, 3, 1, solC); R(31, 29, 1, 2, solC); }
}
