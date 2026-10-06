// ═══════════════════════════════════════════════════════════════════════════
// Effets visuels et télégraphes (anticipation → émission → contact → réaction →
// disparition). Les particules décoratives n'ont aucun effet de jeu ; leur
// quantité baisse avec la densité et le mode confort (jamais les dangers).
// ═══════════════════════════════════════════════════════════════════════════

function majEffets(dt) {
  const J = G.joueur;
  for (const e of G.effets) {
    e.age += dt;
    if (e.type === 'frappe_sol' && !e.fait && e.age >= e.duree * 0.95) {
      e.fait = true;
      if (e.proprio === 'joueur') { for (const x of G.ennemis) if (!x.mort && !x.cache && dist(x.x, x.y, e.x, e.y) < e.r + x.r) infligerDegats(x, e.deg, { proprio: 'joueur', type: 'frappe', x: x.x, y: x.y, vx: x.x - e.x, vy: x.y - e.y, recul: 40 }); if (!e.petite) { secousse(5, null); Son.jouer('explosion'); exploserDecor(e.x, e.y, e.r * 0.8); } else Son.jouer('impact'); G.effets.push({ type: e.arme ? 'impact_sol' : 'explosion', x: e.x, y: e.y, r: e.r, age: 0, duree: 0.35 }); }
    }
    if (e.type === 'anneau_expansif') {
      e.r += e.v * dt;
      if (!e.touche && !J.intangible) { const d = dist(e.x, e.y, J.x, J.y); if (Math.abs(d - e.r) < 7) { const a = angleVers(e.x, e.y, J.x, J.y); if (Math.abs(diffAngle(a, e.trou)) > e.largeurTrou / 2) { e.touche = true; blesserJoueur(G.degatsEnnemis, { type: 'onde', x: e.x, y: e.y }); } } }
    }
    if (e.attache) { e.x = J.x; e.y = J.y; }
    if (e.type === 'cadavre_boss') {
      if (Math.random() < dt * (G.reglages.confort ? 6 : 14)) { const a = Math.random() * Math.PI * 2, d = Math.random() * e.r; G.effets.push({ type: 'explosion_petite', x: e.x + Math.cos(a) * d, y: e.y - e.h * 0.45 + Math.sin(a) * d * 0.8, r: 8 + Math.random() * 8, age: 0, duree: 0.28 }); Son.jouer('explosion', 0.3); }
      if (!e.fini && e.age >= e.duree * 0.9) { e.fini = true; G.effets.push({ type: 'mort_boss', x: e.x, y: e.y - 12, age: 0, duree: 1.2 }); debrisSprite(e.x, e.y, Math.round(e.h * 0.5), e.img, G.reglages.confort ? 10 : 24, 1.6); secousse(10, null); Son.jouer('explosion'); }
    }
  }
  G.effets = G.effets.filter(e => e.age < e.duree);
  const maxP = G.reglages.confort ? 120 : 260;
  if (G.particules.length > maxP) G.particules.splice(0, G.particules.length - maxP);
  for (const p of G.particules) {
    p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt;
    if (p.sol !== undefined && p.y > p.sol && p.vy > 0) { p.y = p.sol; p.vy *= -0.35; p.vx *= 0.55; if (p.vy > -25) { p.vy = 0; p.g = 0; p.vx *= 0.5; } } // éclats qui rebondissent au sol
  }
  G.particules = G.particules.filter(p => p.age < p.duree);
  for (const t of G.textes) t.age += dt;
  G.textes = G.textes.filter(t => t.age < t.duree);
}
// Mort : silhouette blanche qui s'évase, éclats aux couleurs du sprite qui retombent et rebondissent
const _couleursSprite = new WeakMap();
function couleursSprite(c) {
  let L = _couleursSprite.get(c); if (L) return L;
  const n = new Map();
  try { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 200 || d[i] + d[i + 1] + d[i + 2] < 90) continue; const k = (d[i] >> 5) << 6 | (d[i + 1] >> 5) << 3 | d[i + 2] >> 5; n.set(k, (n.get(k) || 0) + 1); } } catch (err) { /* toile illisible : couleurs neutres */ }
  L = [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => 'rgb(' + ((k >> 6 & 7) * 32 + 16) + ',' + ((k >> 3 & 7) * 32 + 16) + ',' + ((k & 7) * 32 + 16) + ')');
  if (!L.length) L = ['#c8c0d0', '#8a8098'];
  _couleursSprite.set(c, L); return L;
}
function imageMort(e) {
  const sp = spriteEnnemi(e), img = sp.attaque ? sp.frames[(sp.formes > 1 ? 3 * Math.min(sp.formes - 1, formeBoss(e)) : 0) + e.frame % 2] : sp.frames[e.frame % sp.frames.length], ech = e.echelle || 1, f = ech > 1.05 ? Math.round(ech * 4) / 4 : 1;
  return { img, w: Math.round(img.width * f), h: Math.round(img.height * f), base: sp.base || 0, miroir: !!(sp.miroir && (e.boss ? G.joueur.x < e.x - 2 : e.dir === 'gauche')) };
}
function debrisSprite(x, y, hauteur, img, n, v = 1) {
  const C = couleursSprite(img);
  for (let i = 0; i < n; i++) { const a = -Math.PI * (0.08 + 0.84 * Math.random()), s = (40 + Math.random() * 70) * v; G.particules.push({ x: x + (Math.random() - 0.5) * 10 * v, y: y - hauteur, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 420, sol: y + (Math.random() - 0.5) * 6, age: 0, duree: 0.55 + Math.random() * 0.4, couleur: C[i % C.length], taille: Math.random() < 0.35 ? 3 : 2 }); }
}
function eclatMort(e) {
  const M = imageMort(e), y = e.y - (e.z || 0);
  G.effets.push(Object.assign({ type: 'eclat_mort', x: e.x, y, age: 0, duree: 0.16 }, M));
  debrisSprite(e.x, y, Math.round(M.h * 0.5), M.img, (G.reglages.confort ? 4 : 8) + Math.min(6, Math.round(e.r / 3)));
}
function effetImpact(x, y, app, force, elements) {
  const n = G.reglages.confort ? 2 : 4; const col = app === 'ennemi' ? '#ff9ac0' : app === 'sable' ? '#e0c080' : app === 'poing' ? '#ffb0d0' : app === 'orbe' ? '#c0e8ff' : '#fff4d0';
  for (let i = 0; i < n * force; i++) { const a = Math.random() * Math.PI * 2, v = 30 + Math.random() * 50; G.particules.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, duree: 0.18 + Math.random() * 0.1, couleur: col, taille: 1 + (Math.random() < 0.3 ? 1 : 0) }); }
  if (app === 'orbe') G.effets.push({ type: 'anneau_impact', x, y, age: 0, duree: 0.2, r: 10 });
  if (app !== 'ennemi' && !G.reglages.sansFlash) G.effets.push({ type: 'etoile_impact', x, y, age: 0, duree: 0.1, r: Math.min(9, 4 + force * 2) });
  // éclat de nature à l'impact : la forme dit l'élément (gerbe, arcs, éclaboussure, tourbillon, mottes, cristaux)
  const nat = elements && elements.size ? [...elements].find(n => NATURES_FX[n]) : null;
  if (nat) G.effets.push({ type: 'impact_nature', nature: nat, x, y, age: 0, duree: nat === 'raiton' ? 0.16 : 0.26, r: 5 + Math.round(force * 4), graine: Math.random() * 6.28 });
}
function dessinerEffet(g, e, X, Y) {
  const k = Math.min(1, e.age / e.duree); const x = X(e.x || 0), y = Y(e.y || 0);
  switch (e.type) {
    case 'explosion': {
      // papier et argile : silhouette en éclats ; feu : volume rond ; cœur clair
      const r = Math.round(e.r * (0.5 + k * 0.6));
      if (k < 0.18 && !G.reglages.sansFlash) { g.drawImage(disque(r, '#fff8e0'), x - r, y - r); break; }
      const ro = Math.round(e.r * (0.75 + k * 0.75)); g.globalAlpha = (1 - k) * 0.75; g.drawImage(anneau(ro, 2, '#ffe8c0'), x - ro - 1, y - ro - 1); // onde de choc
      if (k > 0.35) for (let i = 0; i < 5; i++) { const a = i * 1.257 + e.x * 0.1, d = r * 0.7, rf = Math.max(2, Math.round(r * 0.32 * (1.2 - k))); g.globalAlpha = 0.55 * (1 - k); g.drawImage(disque(rf, i % 2 ? '#5a4a4a' : '#3a3036'), Math.round(x + Math.cos(a) * d - rf), Math.round(y + Math.sin(a) * d * 0.6 - rf - k * 10)); } // fumée qui monte
      g.globalAlpha = 1 - k; g.drawImage(disque(r, '#f07a2a'), x - r, y - r); g.drawImage(disque(Math.round(r * 0.65), '#ffd060'), x - Math.round(r * 0.65), y - Math.round(r * 0.65)); if (k < 0.5) g.drawImage(disque(Math.max(1, Math.round(r * 0.3)), '#fff4d0'), x - Math.max(1, Math.round(r * 0.3)), y - Math.max(1, Math.round(r * 0.3)));
      g.globalAlpha = (1 - k) * 0.8; for (let i = 0; i < 8; i++) { const a = i * 0.785 + e.x; const d = r * (0.8 + k * 0.6); g.fillStyle = '#3a3036'; g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d * 0.8), 3, 3); g.fillStyle = '#e8dcc0'; g.fillRect(Math.round(x + Math.cos(a + 0.4) * d * 0.9), Math.round(y + Math.sin(a + 0.4) * d * 0.7), 2, 3); }
      g.globalAlpha = 1; break;
    }
    case 'impact_nature': { // gerbe propre à chaque nature (dessinée nette, quelques pixels)
      const F = NATURES_FX[e.nature], r = e.r * (0.5 + k * 0.9), a0 = e.graine; g.globalAlpha = 1 - k * k;
      switch (e.nature) {
        case 'katon': for (let i = 0; i < 6; i++) { const a = a0 + i * 1.047, d = r * (0.6 + (i % 2) * 0.4); g.fillStyle = i % 2 ? F[1] : F[0]; g.fillRect(Math.round(x + Math.cos(a) * d) - 1, Math.round(y + Math.sin(a) * d * 0.8 - k * 5) - 1, 2, 3); } if (k < 0.4) g.drawImage(disque(3, '#fff0b0'), x - 3, y - 3); break;
        case 'raiton': for (let i = 0; i < 3; i++) { let px = x, py = y; const a = a0 + i * 2.09; for (let s = 1; s <= 3; s++) { const nx = Math.round(x + Math.cos(a + (s % 2 ? 0.5 : -0.5)) * r * s / 3), ny = Math.round(y + Math.sin(a + (s % 2 ? 0.5 : -0.5)) * r * s / 3); lignePixel(g, px, py, nx, ny, s === 3 ? F[0] : F[1]); px = nx; py = ny; } } break;
        case 'suiton': { const rr = Math.round(r); g.drawImage(anneau(rr, 1, F[1]), x - rr - 1, y - rr - 1); for (let i = 0; i < 5; i++) { const a = -Math.PI * (0.15 + 0.7 * i / 4), d = r * 0.9; g.fillStyle = F[0]; g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d + k * k * 8), 2, 2); } break; }
        case 'futon': for (let i = 0; i < 2; i++) { const b = a0 + i * Math.PI + k * 5; for (let s = 0; s < 5; s++) { const a = b + s * 0.35, d = r * (0.4 + s * 0.15); g.fillStyle = s > 2 ? F[1] : F[0]; g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d * 0.7), 2, 1); } } break;
        case 'doton': for (let i = 0; i < 5; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 4), d = r * 0.8; g.fillStyle = i % 2 ? F[0] : '#7a5a34'; g.fillRect(Math.round(x + Math.cos(a) * d) - 1, Math.round(y + Math.sin(a) * d * 0.6 + k * k * 10), 3, 2); } break;
        case 'hyoton': for (let i = 0; i < 4; i++) { const a = a0 + i * 1.571, d = r * 0.8, cx = Math.round(x + Math.cos(a) * d), cy = Math.round(y + Math.sin(a) * d * 0.8); g.fillStyle = F[1]; g.fillRect(cx - 1, cy, 3, 1); g.fillRect(cx, cy - 1, 1, 3); g.fillStyle = F[0]; g.fillRect(cx, cy, 1, 1); } break;
      }
      g.globalAlpha = 1; break;
    }
    case 'explosion_petite': { const r = Math.round(e.r * (0.4 + k * 0.6)); g.globalAlpha = 1 - k; g.drawImage(disque(r, '#ffb050'), x - r, y - r); g.drawImage(disque(Math.max(1, Math.round(r * 0.5)), '#fff0c0'), x - Math.round(r * 0.5), y - Math.round(r * 0.5)); g.globalAlpha = 1; break; }
    case 'onde': case 'onde_ennemie': case 'onde_noire': { const r = Math.round(e.r * (0.3 + k * 0.7)); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 2, e.type === 'onde_ennemie' ? '#ff5a7a' : e.type === 'onde_noire' ? '#b060ff' : (e.couleur || '#f0e0c0')), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'anneau_impact': { const r = Math.round(4 + e.r * k); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 1, '#e0f4ff'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'eclair': { g.strokeStyle = '#e0f0ff'; const x0 = X(e.x0), y0 = Y(e.y0), x1 = X(e.x1), y1 = Y(e.y1); let px = x0, py = y0; for (let i = 1; i <= 5; i++) { const nx = lerp(x0, x1, i / 5) + (i < 5 ? (Math.random() - 0.5) * 10 : 0), ny = lerp(y0, y1, i / 5) + (i < 5 ? (Math.random() - 0.5) * 10 : 0); lignePixel(g, px, py, nx, ny, i % 2 ? '#ffffff' : '#9ad0ff', 1); px = nx; py = ny; } break; }
    case 'fumee': { const n = 5; for (let i = 0; i < n; i++) { const a = i * 1.26 + (e.x % 3); const d = 3 + k * 10 * (e.taille || 1); const r = Math.max(1, Math.round((4 + i % 2 * 2) * (e.taille || 1) * (1 - k * 0.6))); g.globalAlpha = 0.8 * (1 - k); g.drawImage(disque(r, i % 2 ? '#e8e4f0' : '#b8b4c8'), Math.round(x + Math.cos(a) * d - r), Math.round(y + Math.sin(a) * d * 0.7 - r - k * 6)); } g.globalAlpha = 1; break; }
    case 'debris': { const n = e.n || 8; for (let i = 0; i < n; i++) { const a = i * 6.28 / n + 0.3; const d = k * 18; g.fillStyle = e.couleur || '#8a8078'; g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d * 0.6 + k * k * 10 - 4), 2, 2); } break; }
    case 'etincelle': g.fillStyle = '#fff4c0'; g.fillRect(x - 1, y - 1, 3, 3); break;
    case 'etoile_impact': { const r = Math.max(1, Math.round(e.r * (1 - k))); g.fillStyle = '#fff2c8'; g.fillRect(x - r, y, 2 * r + 1, 1); g.fillRect(x, y - r, 1, 2 * r + 1); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 1, 3, 3); if (r > 3) { g.fillStyle = '#ffe8a8'; const q = Math.round(r * 0.5); g.fillRect(x - q, y - q, 1, 1); g.fillRect(x + q, y - q, 1, 1); g.fillRect(x - q, y + q, 1, 1); g.fillRect(x + q, y + q, 1, 1); } break; }
    case 'etincelle_ramassage': { const r = Math.round(3 + 8 * k); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 1, '#fff8d0'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'immunite': Police.ecrire(g, 'immunisé', x, y - k * 6, '#c0c0ff', { a: 'c' }); break;
    case 'frappe_sol': { const r = Math.round(e.r); g.globalAlpha = 0.5 + 0.4 * k; g.drawImage(anneau(r, 1, e.proprio === 'joueur' ? '#ffb060' : '#ff4a4a'), x - r - 1, y - r - 1); g.drawImage(anneau(Math.max(1, Math.round(r * k)), 1, '#ffe0a0'), x - Math.round(r * k) - 1, y - Math.round(r * k) - 1); g.globalAlpha = 1; if (!e.petite) { const h = Math.round((1 - k) * 120); g.fillStyle = '#6a3a2a'; g.fillRect(x - 5, y - h - 10, 10, 10); g.fillStyle = '#ffb040'; g.fillRect(x - 3, y - h - 16, 6, 6); } break; }
    case 'marque_sol': { const r = Math.round(e.r); g.globalAlpha = 0.35 + 0.4 * k; g.drawImage(ellipse(r, Math.round(r * 0.55), e.danger ? 'rgba(255,60,60,0.5)' : 'rgba(0,0,0,0.4)'), x - r, y - Math.round(r * 0.55)); g.globalAlpha = 1; break; }
    case 'marque_hiraishin': { // kunai à trois branches planté au sol, inscription qui luit
      const t = G.temps; g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 5); g.drawImage(anneau(9, 1, '#ffe070'), x - 10, y - 10); g.globalAlpha = 1;
      g.fillStyle = '#1c1420'; g.fillRect(x - 1, y - 11, 3, 10); g.fillStyle = '#c8ccd8'; g.fillRect(x, y - 10, 1, 8); g.fillStyle = '#e8d060'; g.fillRect(x - 3, y - 10, 2, 1); g.fillRect(x + 2, y - 10, 2, 1); break;
    }
    case 'clone_course': { const k2 = Math.min(1, e.age / e.duree), cx = X(lerp(e.x0, e.x1, k2)), cy = Y(lerp(e.y0, e.y1, k2)); g.globalAlpha = 0.75; dessinerPerso(g, G.joueur.cle, cx, cy, { dirCorps: e.x1 < e.x0 ? 'gauche' : 'droite', dirTete: e.x1 < e.x0 ? 'gauche' : 'droite', frame: Math.floor(e.age * 12) % 4, etatTete: 'normal' }); g.globalAlpha = 1; break; }
    case 'etiquette_collee': { // étiquette explosive plantée dans la cible : clignote de plus en plus vite
      const S = e.suit, cx = S ? X(S.x) : x, cy = (S ? Y(S.y) : y) - 14; if (Math.floor(e.age * (6 + 18 * k)) % 2) break;
      g.fillStyle = '#1c1420'; g.fillRect(cx - 2, cy - 3, 5, 7); g.fillStyle = '#f4ecd8'; g.fillRect(cx - 1, cy - 2, 3, 5); g.fillStyle = '#d0302a'; g.fillRect(cx, cy - 1, 1, 3); break;
    }
    case 'kaiten': { // tourbillon de Neji : arcs clairs qui tournent vite autour de lui, voile bleuté
      const S = e.suit, cx = S ? X(S.x) : x, cy = (S ? Y(S.y) : y) - 12, R = Math.round(e.r);
      g.globalAlpha = 0.22 * (1 - k * 0.5); g.drawImage(ellipse(R, Math.round(R * 0.8), '#c8e8ff'), cx - R, cy - Math.round(R * 0.8)); g.globalAlpha = 0.9 * (1 - k * 0.4);
      for (let i = 0; i < 6; i++) { const a0 = e.age * 16 + i * Math.PI / 3; for (let t = 0; t < 0.8; t += 0.07) { const a = a0 + t; g.fillStyle = t > 0.6 ? '#ffffff' : '#a8d8ff'; g.fillRect(Math.round(cx + Math.cos(a) * R), Math.round(cy + Math.sin(a) * R * 0.8), 2, 2); } }
      g.globalAlpha = 1; break;
    }
    case 'trigramme': { // cercle des soixante-quatre paumes : anneau et traits des huit trigrammes
      const R = Math.round(e.r); g.globalAlpha = 0.45 + 0.45 * k; g.drawImage(anneau(R, 1, '#f0e0a8'), x - R - 1, y - R - 1);
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; for (let j = 0; j < 3; j++) { const rr = R - 7 - j * 4, l = (i + j) % 3 === 0 ? 2 : 5; g.fillStyle = '#f8ecc0'; g.fillRect(Math.round(x + Math.cos(a) * rr - l / 2), Math.round(y + Math.sin(a) * rr * 0.7), l, 1); } }
      g.globalAlpha = 1; break;
    }
    case 'cercle_danger': { const r = Math.round(e.r); const cl = Math.floor(e.age * 10) % 2; g.globalAlpha = 0.25 + 0.35 * k; g.drawImage(disque(r, 'rgba(255,40,40,0.35)'), x - r, y - r); g.globalAlpha = 0.8; g.drawImage(anneau(r, cl ? 2 : 1, '#ff5040'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'ligne_danger': { g.save(); g.translate(x, y); g.rotate(e.a); g.globalAlpha = 0.2 + 0.4 * k; g.fillStyle = '#ff3a3a'; g.fillRect(0, -e.largeur / 2, e.l, e.largeur); g.globalAlpha = 0.9; g.fillStyle = '#ffb0a0'; for (let i = 0; i < e.l; i += 16) g.fillRect(i + ((e.age * 120) % 16), -1, 6, 2); g.restore(); g.globalAlpha = 1; break; }
    case 'arc_danger': case 'balayage': { g.save(); g.globalAlpha = e.type === 'balayage' ? 1 - k : 0.3 + 0.4 * k; g.fillStyle = e.type === 'balayage' ? '#f0f0ff' : 'rgba(255,50,50,0.5)'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, e.r, e.a - e.arc / 2, e.a + e.arc / 2); g.closePath(); g.fill(); g.restore(); g.globalAlpha = 1; break; }
    case 'aura_sage': { const r = Math.round(8 + 18 * k); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 2, '#f08a24'), x - r - 1, y - 12 - r - 1); g.globalAlpha = 1; break; }
    case 'aura_tele': { const r = Math.round(e.r + 4 * Math.sin(e.age * 20)); g.globalAlpha = 0.6; g.drawImage(anneau(r, 2, '#ffd040'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'impact_sol': { const r = Math.round(e.r * (0.6 + 0.4 * k)); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 3, '#c8b8a0'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'meteore': { const r = Math.round(e.r * (0.5 + 0.5 * k)); g.globalAlpha = 1 - k; g.drawImage(disque(r, '#ff7a2a'), x - r, y - r); g.drawImage(anneau(r + 4, 3, '#3a2a2a'), x - r - 5, y - r - 5); g.globalAlpha = 1; break; }
    case 'anneau_expansif': { const r = Math.round(e.r); if (r < 2) break; g.save(); g.strokeStyle = '#ff4a6a'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r, e.trou + e.largeurTrou / 2, e.trou - e.largeurTrou / 2 + Math.PI * 2); g.stroke(); g.strokeStyle = '#ffd0e0'; g.lineWidth = 1; g.stroke(); g.restore(); break; }
    case 'cercle_sceau': case 'cercle_soin': { const r = Math.round(e.r * (e.type === 'cercle_soin' ? 1 : 0.6 + 0.4 * k)); g.globalAlpha = 0.7; g.drawImage(anneau(r, 1, e.type === 'cercle_soin' ? '#6ae07a' : '#e0d060'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'soin_ennemi': case 'soin': Police.ecrire(g, '+', x, y - k * 8, '#6ae07a', { a: 'c' }); break;
    case 'fissure': { g.fillStyle = 'rgba(30,20,15,0.7)'; const n = Math.round(3 + k * 6); for (let i = 0; i < n; i++) { const a = i * 2.4; g.fillRect(Math.round(x + Math.cos(a) * i * 1.6), Math.round(y + Math.sin(a) * i * 0.8), 2, 1); } break; }
    case 'mort_boss': { const r = Math.round(10 + k * 70); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 3, '#ffffff'), x - r - 1, y - r - 1); g.globalAlpha = 1; if (Math.random() < 0.6) G.particules.push({ x: e.x + (Math.random() - 0.5) * 40, y: e.y + (Math.random() - 0.5) * 30, vx: 0, vy: -30, age: 0, duree: 0.5, couleur: '#f0e8ff', taille: 3 }); break; }
    case 'mue': { g.globalAlpha = 1 - k; g.drawImage(contourner(peindre(['..ww..', '.w..w.', 'w....w', 'w....w', '.w..w.', '..ww..'], { w: '#e8e4d0' })), x - 3, y - 20); g.globalAlpha = 1; break; }
    case 'transformation': case 'resurrection': { for (let i = 0; i < 3; i++) { const r = Math.round((k * 60 + i * 12) % 60) + 4; g.globalAlpha = 1 - k; g.drawImage(anneau(r, 2, i % 2 ? '#ffe080' : '#ffffff'), x - r - 1, y - r - 1); } g.globalAlpha = 1; break; }
    case 'buche': { g.drawImage(contourner(peindre(['.bbbbbb.', 'bwbbbbbb', 'bbbbbbbb', '.bbbbbb.'], { b: '#8a5a30', w: '#c89a60' })), x - 4, y - 10); break; }
    case 'bouclier_sable': { const r = Math.round(12 + k * 10); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 3, '#d8b070'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'sceau_soin': { g.globalAlpha = 1 - k; g.drawImage(anneau(10, 1, '#ff9ac0'), x - 11, y - 11); g.fillStyle = '#ff9ac0'; g.fillRect(x - 1, y - 6, 2, 12); g.fillRect(x - 6, y - 1, 12, 2); g.globalAlpha = 1; break; }
    case 'indice_secret': { g.globalAlpha = 0.5 + 0.5 * Math.sin(e.age * 10); dessinerPerso; g.drawImage(contourner(peindre(['.w.w.', 'wwwww', 'wkwkw', 'wwwww', '.www.'], { w: '#d8c8a8', k: '#1c1420' })), x - 3, y - 14); Police.ecrire(g, '!', x, y - 26, '#ffe080', { a: 'c' }); g.globalAlpha = 1; break; }
    case 'reecriture': { g.globalAlpha = 1 - k; for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#e8dcc0' : '#3a3040'; g.fillRect(x - 10 + i * 4, y - 4 + Math.round(Math.sin(e.age * 20 + i) * 4), 3, 3); } g.globalAlpha = 1; break; }
    case 'coffre_ouvert': { g.globalAlpha = 1 - k; g.drawImage(anneau(Math.round(6 + k * 14), 1, '#fff0c0'), x - Math.round(7 + k * 14), y - Math.round(13 + k * 14)); g.globalAlpha = 1; break; }
    case 'pics_coffre': { g.fillStyle = '#e0e0e8'; for (let i = 0; i < 5; i++) g.fillRect(x - 10 + i * 5, y - 8 - Math.round((1 - k) * 6), 2, 6); break; }
    case 'vapeur': case 'eclaboussure': { g.globalAlpha = 1 - k; g.drawImage(anneau(Math.round(4 + k * 14), 1, '#d0e8ff'), x - Math.round(5 + k * 14), y - Math.round(5 + k * 14)); g.globalAlpha = 1; break; }
    case 'chiens': { const n = 2; for (let i = 0; i < n; i++) { g.fillStyle = '#8a7a60'; g.fillRect(x - 8 + i * 12, y - 2, 6, 4); g.fillStyle = '#1c1420'; g.fillRect(x - 7 + i * 12, y - 3, 1, 1); } break; }
    case 'lien_ombre': { const c = e.cible; if (!c || c.mort) break; lignePixel(g, X(G.joueur.x), Y(G.joueur.y), X(c.x), Y(c.y), '#1c1428', 2); break; }
    case 'cercueil': { const r = Math.round(10 + (1 - k) * 8); g.drawImage(disque(r, 'rgba(210,170,100,0.8)'), X(e.cible.x) - r, Y(e.cible.y - 10) - r); break; }
    case 'kuroari': { if (e.cible.mort) break; g.fillStyle = '#2a2a30'; g.fillRect(X(e.cible.x) - 9, Y(e.cible.y) - 24, 18, 24); g.fillStyle = '#5a5a64'; g.fillRect(X(e.cible.x) - 7, Y(e.cible.y) - 22, 14, 2); break; }
    case 'fils': { for (let i = 0; i < 6; i++) { const a = i * 1.05; lignePixel(g, x, y - 10, Math.round(x + Math.cos(a) * 60 * k), Math.round(y - 10 + Math.sin(a) * 40 * k), '#2a2a2a', 1); } break; }
    case 'ombre_geante': { const r = Math.round(20 + k * 30); g.drawImage(ellipse(r, Math.round(r * 0.5), 'rgba(0,0,0,0.45)'), x - r, y + 60 - Math.round(r * 0.5)); break; }
    case 'crapaud_geant': { const img = contourner(peindre(['..aa......aa..', '.awka....akwa.', '.aaaaaaaaaaaa.', 'aaaaaaaaaaaaaa', 'aabbbbbbbbbbaa', 'aabkkkkkkkkbaa', '.aabbbbbbbbaa.', 'aa.aaaaaaaa.aa', 'aa..aa..aa..aa'], { a: '#d86a2a', b: '#f0b070', w: '#ffffff', k: '#3a1a10' })); const s = 5; g.globalAlpha = 1 - Math.max(0, k - 0.7) / 0.3; g.drawImage(img, x - img.width * s / 2, y + 60 - img.height * s, img.width * s, img.height * s); g.globalAlpha = 1; break; }
    case 'flammes_noires': case 'tsukuyomi': { g.globalAlpha = 0.4 * (1 - k); g.fillStyle = e.type === 'tsukuyomi' ? '#a00020' : '#1a0a1a'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); g.globalAlpha = 1; break; }
    case 'sphere_noire': { const r = Math.round(6 + 10 * Math.sin(k * Math.PI)); g.drawImage(disque(r, '#141018'), x - r, y - r - 20); break; }
    case 'spirale': { for (let i = 0; i < 12; i++) { const a = i * 0.5 + e.age * 10; const d = i * 1.5 * (1 - k); g.fillStyle = '#8a7ab0'; g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), 2, 2); } break; }
    case 'manteau': { // chakra de la bête : flammes orangées autour du joueur
      const t = G.temps; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * 2.2, rr = 12 + Math.sin(t * 7 + i) * 2, fx = Math.round(x + Math.cos(a) * rr), fy = Math.round(y - 12 + Math.sin(a) * rr * 0.8), h = 3 + Math.round(3 * (0.5 + 0.5 * Math.sin(t * 11 + i * 2))); g.fillStyle = '#5a1408'; g.fillRect(fx - 1, fy - h, 4, h + 1); g.fillStyle = i % 2 ? '#ff6a2a' : '#ffb84a'; g.fillRect(fx, fy - h + 1, 2, h); }
      if (Math.random() < 0.3 && !G.reglages.confort) G.particules.push({ x: e.x + (Math.random() - 0.5) * 18, y: e.y - 6 - Math.random() * 18, vx: 0, vy: -30, age: 0, duree: 0.35, couleur: Math.random() < 0.5 ? '#ff7a3a' : '#ffd070', taille: 2 });
      break;
    }
    case 'foudre_ciel': { // éclair qui tombe du ciel, éclair blanc à cœur bleu
      let px = x + 6, py = y - 190; g.globalAlpha = 1 - k * 0.8; for (let i = 1; i <= 9; i++) { const nx = x + (i < 9 ? (Math.random() - 0.5) * 18 : 0), ny = y - 190 + 190 * i / 9; lignePixel(g, px, py, nx, ny, '#ffffff', 3); lignePixel(g, px, py, nx, ny, '#6ab8ff', 1); px = nx; py = ny; }
      const r = Math.round(8 + 18 * k); g.drawImage(anneau(r, 2, '#c8ecff'), x - r - 1, y - r - 1); if (k < 0.3 && !G.reglages.sansFlash) g.drawImage(disque(10, '#ffffff'), x - 10, y - 10); g.globalAlpha = 1; break;
    }
    case 'jinton': { // rayon de particules : faisceau blanc, cube au point d'origine
      g.save(); g.translate(x, y); g.rotate(e.a); g.globalAlpha = 1 - k; const w = Math.round(12 * (1 - k)) + 2; g.fillStyle = '#d8f0ff'; g.fillRect(0, -w / 2 - 2, e.l, w + 4); g.fillStyle = '#ffffff'; g.fillRect(0, -w / 2, e.l, w);
      g.rotate(G.temps * 6); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.strokeRect(-6, -6, 12, 12); g.restore(); g.globalAlpha = 1; break;
    }
    case 'attraction': { // grains de sable de fer qui convergent
      for (let i = 0; i < 14; i++) { const a = i * 0.45 + e.x * 0.01, d = (e.r || 60) * (1 - k) * (0.5 + (i % 3) * 0.25); g.fillStyle = i % 2 ? '#3a3440' : '#8a8494'; g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d * 0.6), 2, 2); }
      break;
    }
    case 'nuage_venin': { for (let i = 0; i < 5; i++) { const a = i * 1.26, d = 4 + k * 16, r = Math.max(1, Math.round(6 * (1 - k * 0.5))); g.globalAlpha = 0.6 * (1 - k); g.drawImage(disque(r, i % 2 ? '#8ae05a' : '#5aa040'), Math.round(x + Math.cos(a) * d - r), Math.round(y + Math.sin(a) * d * 0.6 - r)); } g.globalAlpha = 1; break; }
    case 'cadavre_boss': { // la dépouille vacille, clignote, rougeoie et s'affaisse
      const tr = G.reglages.confort ? 0 : Math.round((Math.random() - 0.5) * 4 * (0.4 + k)), blanc = !G.reglages.sansFlash && Math.floor(e.age * 16) % 3 === 0;
      const w = e.w, h = Math.max(2, Math.round(e.h * (1 - 0.3 * k * k))), a0 = k > 0.88 ? Math.max(0, (1 - k) / 0.12) : 1;
      const poser = im => { if (e.miroir) { g.save(); g.translate(x + tr, 0); g.scale(-1, 1); g.drawImage(im, -Math.round(w / 2), y - h + e.base, w, h); g.restore(); } else g.drawImage(im, x + tr - Math.round(w / 2), y - h + e.base, w, h); };
      g.globalAlpha = a0; poser(blanc ? silhouetteMemo(e.img, '#ffffff') : e.img);
      if (!blanc && k > 0.25) { g.globalAlpha = a0 * Math.min(0.8, (k - 0.25) * 1.4); poser(silhouetteMemo(e.img, '#ff9a48')); }
      g.globalAlpha = 1; break;
    }
    case 'salle_nettoyee': { // onde dorée qui balaie la salle : le calme revient
      const r = 10 + 420 * (1 - (1 - k) * (1 - k)), S = G.salle; g.save(); g.beginPath(); g.rect(X(TUILE), Y(TUILE), (S.W - 2) * TUILE, (S.H - 2) * TUILE); g.clip();
      g.globalAlpha = 0.5 * (1 - k); g.strokeStyle = '#ffe8a8'; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y - 6, r, 0, Math.PI * 2); g.stroke(); if (r > 24) { g.globalAlpha = 0.25 * (1 - k); g.beginPath(); g.arc(x, y - 6, r - 10, 0, Math.PI * 2); g.stroke(); }
      g.restore(); break;
    }
    case 'eclat_mort': { // silhouette blanche qui s'évase et s'efface
      const w = Math.round(e.w * (1 + 0.35 * k)), h = Math.round(e.h * (1 + 0.15 * k)), im = silhouetteMemo(e.img, G.reglages.sansFlash ? '#c8c0d8' : '#ffffff');
      g.globalAlpha = (1 - k) * (G.reglages.sansFlash ? 0.45 : 0.9);
      if (e.miroir) { g.save(); g.translate(x, 0); g.scale(-1, 1); g.drawImage(im, -Math.round(w / 2), y - h + e.base, w, h); g.restore(); } else g.drawImage(im, x - Math.round(w / 2), y - h + e.base, w, h);
      g.globalAlpha = 1; break;
    }
    case 'racines': { // racines qui jaillissent en couronne autour de l'impact, puis rentrent sous terre
      const R = e.r || 18, cr = Math.min(1, e.age * 6), dec = k > 0.7 ? (k - 0.7) / 0.3 : 0, h = Math.round(14 * cr * (1 - dec));
      for (let i = 0; i < 7; i++) {
        const a = i * 0.9 + (e.x % 7), px = Math.round(x + Math.cos(a) * R * 0.7), py = Math.round(y + Math.sin(a) * R * 0.4), pl = h - (i % 3) * 2;
        g.fillStyle = 'rgba(28,18,10,0.45)'; g.fillRect(px - 3, py - 1, 7, 3);
        for (let s = 0; s < pl; s += 2) { const ox = Math.round(Math.sin(s * 0.3 + i) * s / 6); g.fillStyle = '#5a3c20'; g.fillRect(px + ox - 1, py - s - 2, s < pl / 2 ? 3 : 2, 2); g.fillStyle = '#9a7040'; g.fillRect(px + ox - 1, py - s - 2, 1, 2); }
        if (pl > 8) { const tx = px + Math.round(Math.sin(pl * 0.3 + i) * pl / 6); g.fillStyle = '#7ac050'; g.fillRect(tx + 1, py - pl + 1, 2, 2); g.fillStyle = '#4a8a30'; g.fillRect(tx - 2, py - pl + 4, 2, 1); }
      }
      break;
    }
    case 'sceau_scellement': { const r = Math.round(16 * (1 - k)) + 2; g.drawImage(anneau(r, 2, '#e8d060'), x - r - 1, y - r - 11); break; }
    case 'coeur_charme': Police.ecrire(g, '♥', x, y - k * 10, '#ff7ab0', { a: 'c' }); break;
    case 'lotus': { g.globalAlpha = 1 - k; g.drawImage(anneau(Math.round(8 + k * 20), 2, '#6ae07a'), x - Math.round(9 + k * 20), y - Math.round(9 + k * 20) - 10); g.globalAlpha = 1; break; }
    case 'horloge': { g.globalAlpha = 0.25 * (1 - k); g.fillStyle = '#6080c0'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); g.globalAlpha = 1; break; }
    case 'aura_verte': { if (Math.random() < 0.4) G.particules.push({ x: G.joueur.x + (Math.random() - 0.5) * 16, y: G.joueur.y - Math.random() * 20, vx: 0, vy: -30, age: 0, duree: 0.4, couleur: '#8af07a', taille: 2 }); break; }
    case 'lien_ombre_zone': break;
  }
}
