// ═══════════════════════════════════════════════════════════════════════════
// Dessin des entités et des effets. Projectiles alliés : contour clair, forme
// propre à la famille (kunai, shuriken, sable, papier…). Projectiles ennemis :
// contour sombre épais + pulsation claire — distincts même à élément égal.
// ═══════════════════════════════════════════════════════════════════════════

const _proj = {};
function spriteProjectile(app, taille) {
  const k = app + '|' + Math.round(taille * 4); if (_proj[k]) return _proj[k];
  const P = (L, col, cont) => cont === false ? peindre(L, col) : contourner(peindre(L, col), cont || '#f8f0e0');
  let s;
  switch (app) {
    case 'kunai': case 'kunai_ombre': case 'lame_poison': {
      const col = app === 'kunai' ? { a: '#d8dce8', w: '#ffffff', d: '#7a8090', c: '#6a4a2a' } : app === 'kunai_ombre' ? { a: '#3a3448', w: '#8a80a8', d: '#1c1826', c: '#2a2030' } : { a: '#b070d0', w: '#f0c0ff', d: '#5a2a7a', c: '#3a2a3a' };
      s = rotations(contourner(peindre(['..........', 'cc.dddaww.', 'ccddaaaaww', 'cc.dddaww.', '..........'], col), '#241c28'), 16); break;
    }
    case 'senbon': s = rotations(peindre(['wwwwwwwwaa'], { w: '#e8ecf4', a: '#8a90a0' }), 16); break;
    case 'shuriken': s = [contourner(peindre(['...a...', '...a...', '..aba..', 'aabcbaa', '..aba..', '...a...', '...a...'], { a: '#c8ccd8', b: '#8a90a0', c: '#2a2a34' }), '#241c28'), contourner(peindre(['a.....a', '.a...a.', '..aba..', '..bcb..', '..aba..', '.a...a.', 'a.....a'], { a: '#c8ccd8', b: '#8a90a0', c: '#2a2a34' }), '#241c28')]; break;
    case 'fuma': s = [contourner(peindre(['.....aa.....', '.....aa.....', '....aaab....', '....abba....', 'aaaabccbaaaa', 'aaaabccbbaaa', '....abba....', '....baaa....', '.....aa.....', '.....aa.....'], { a: '#c8ccd8', b: '#6a7080', c: '#2a2a34' }), '#241c28')]; s.push(tourner(s[0], Math.PI / 4)); break;
    case 'orbe': case 'rasenshuriken': s = [P(['...wwww...', '.wwbbbbww.', '.wbbccbbw.', 'wbbcwwcbbw', 'wbcwwwwcbw', 'wbbcwwcbbw', '.wbbccbbw.', '.wwbbbbww.', '...wwww...'], { w: '#e0f4ff', b: '#6ab8f8', c: '#b0e0ff' }, false)]; break;
    case 'poing': s = [P(['..pppp..', '.pwwwwp.', 'pww..wwp', 'pw....wp', 'pw....wp', 'pww..wwp', '.pwwwwp.', '..pppp..'], { p: '#e05a90', w: '#ffc0d8' }, false)]; break;
    case 'paume': s = [P(['.wwww.', 'wbbbbw', 'wbwwbw', 'wbwwbw', 'wbbbbw', '.wwww.'], { w: '#e8f4ff', b: '#a8c8f8' }, false)]; break;
    case 'sable': s = [P(['..ss..', '.ssls.', 'ssslss', 'sssssd', '.ssdd.', '..dd..'], { s: '#d8b070', l: '#f8e0a8', d: '#a8804a' })]; break;
    case 'griffe': s = rotations(P(['w.....', '.ww...', '...www', '.ww...', 'w.....'], { w: '#f0e8e0' }, '#5a3020'), 16); break;
    case 'element': s = [P(['.rr.', 'rooy', 'rooy', '.yy.'], { r: '#e8603a', o: '#ffb050', y: '#ffe890' }), P(['.gg.', 'gwwg', 'gwwg', '.gg.'], { g: '#7ae0a0', w: '#e0fff0' }), P(['.bb.', 'bwwb', 'bwwb', '.bb.'], { b: '#8ac0ff', w: '#ffffff' })]; break;
    case 'argile': s = [P(['.ww.', 'wwwk', 'wwkk', '.kk.'], { w: '#f0e8d8', k: '#b8ac98' })]; break;
    case 'glace': s = rotations(P(['..w...', 'wwbbw.', 'wbbbbw', '.wbbw.', '..w...'], { w: '#e0f8ff', b: '#80c8f0' }), 16); break;
    case 'dragon_feu': s = [P(['..rr...', '.rooo..', 'rooyyo.', 'royyyor', 'rooyyo.', '.rooo..', '..rr...'], { r: '#c83018', o: '#f07820', y: '#ffe060' })]; break;
    case 'insecte': s = [P(['k.k', '.k.', 'kkk'], { k: '#2a2a2a' }, '#8a8a70')]; break;
    case 'papier': s = rotations(P(['ww..', 'wwww', 'wwww', '..ww'], { w: '#f4f0e8' }, '#8a8070'), 16); break;
    case 'os': s = rotations(P(['w....w', 'wwwwww', 'w....w'], { w: '#ece4d0' }, '#6a5a4a'), 16); break;
    case 'encre': s = [P(['.kk.', 'kkkk', 'kkkk', '.kk.'], { k: '#1a1a2a' }, '#8080a0')]; break;
    case 'lame': s = rotations(P(['.www......', 'wwwwwwwwww', '.www......'], { w: '#d0d8e8' }, '#3a3040'), 16); break;
    // ── projectiles ennemis : contour sombre épais, cœur pulsant ──
    case 'ennemi': default: {
      const r = Math.max(3, Math.round(4 * taille));
      const c = toile(r * 2 + 4, r * 2 + 4); const g = ctxDe(c);
      g.drawImage(disque(r + 2, '#1a0810'), 0, 0); g.drawImage(disque(r, app === 'eau' ? '#3a7ad8' : app === 'sable_ennemi' ? '#c8903a' : app === 'feu' ? '#e8482a' : app === 'son' ? '#b8a0e8' : app === 'glace_ennemie' ? '#8ad0f0' : '#d0306a'), 2, 2);
      g.drawImage(disque(Math.max(1, r - 2), app === 'eau' ? '#a8d8ff' : '#ffb0c8'), 2 + 1, 2 + 1);
      s = [c]; break;
    }
  }
  return (_proj[k] = s);
}
function dessinerProjectile(g, p, x, y) {
  if (p.proprio === 'ennemi') {
    const s = spriteProjectile(p.apparence && p.apparence !== 'ennemi' && ['eau', 'sable_ennemi', 'feu', 'son', 'glace_ennemie'].includes(p.apparence) ? p.apparence : 'ennemi', p.taille || 1)[0];
    const pul = 0.5 + 0.5 * Math.sin((G.temps + (p.x + p.y) * 0.01) * 18);
    g.drawImage(s, x - s.width / 2, y - s.height / 2);
    if (pul > 0.6) { g.globalAlpha = 0.55; g.drawImage(anneau(s.width / 2 + 1, 1, '#ffe0f0'), x - s.width / 2 - 2, y - s.height / 2 - 2); g.globalAlpha = 1; }
    return;
  }
  let app = p.apparence || 'kunai';
  if (p.foudre) app = 'orbe';
  const el = p.elements && p.elements.size ? [...p.elements][0] : null;
  const L = spriteProjectile(app, p.taille || 1);
  let img;
  if (L.length === 16) img = L[indexAngle(Math.atan2(p.vy || 0.001, p.vx || 1))];
  else img = L[Math.floor((G.temps * 14 + (p.cycleId || 0)) % L.length)];
  const t = p.taille || 1;
  if (t > 1.15 && (app === 'orbe' || app === 'sable' || app === 'poing' || app === 'paume' || app === 'rasenshuriken')) { const w = Math.round(img.width * Math.min(3, t)); g.drawImage(img, x - w / 2, y - w / 2, w, w); }
  else g.drawImage(img, x - img.width / 2, y - img.height / 2);
  // signature élémentaire (forme, pas seulement couleur)
  if (el === 'katon' && Math.random() < 0.5) G.particules.push({ x: p.x + (Math.random() - 0.5) * 4, y: p.y - p.z, vx: 0, vy: -20, age: 0, duree: 0.25, couleur: Math.random() < 0.5 ? '#ffb040' : '#f05a20', taille: 2 });
  if (el === 'raiton' && Math.random() < 0.4) { g.fillStyle = '#e0f0ff'; g.fillRect(x + (Math.random() * 8 - 4) | 0, y + (Math.random() * 8 - 4) | 0, 1, 3); }
  if (el === 'suiton' && Math.random() < 0.3) G.particules.push({ x: p.x, y: p.y - p.z, vx: (Math.random() - 0.5) * 20, vy: 10, age: 0, duree: 0.3, couleur: '#8ac8ff', taille: 1 });
  if (el === 'futon') { g.fillStyle = 'rgba(220,255,230,0.5)'; g.fillRect(x - (p.vx > 0 ? 8 : -2), y - 1, 6, 1); }
  if (p.statuts && p.statuts.some(s => s.statut === 'poison')) { g.fillStyle = '#8ae05a'; g.fillRect(x - 1, y - 4, 2, 2); }
  if (p.traj && p.traj.guidage) { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x - (p.vx > 0 ? 6 : -4), y, 2, 1); }
}
function dessinerFaisceau(g, f, X, Y) {
  const k = 1 - f.age / f.duree; const w = Math.max(1, Math.round(f.largeur * (f.type === 'laser' ? k : Math.min(1, f.age * 12)) ));
  g.save(); g.translate(X(f.x), Y(f.y)); g.rotate(f.a);
  const ennemi = f.proprio === 'ennemi';
  g.fillStyle = ennemi ? '#1a0810' : 'rgba(255,255,255,0.25)'; g.fillRect(0, -w / 2 - 2, f.l, w + 4);
  g.fillStyle = f.couleur; g.fillRect(0, -w / 2, f.l, w);
  g.fillStyle = ennemi ? '#ffd0f0' : '#ffffff'; g.fillRect(0, -Math.max(1, w / 4), f.l, Math.max(1, w / 2));
  if (f.type === 'rayon') { for (let i = 0; i < f.l; i += 12) { g.fillStyle = 'rgba(255,220,180,0.6)'; g.fillRect(i + ((G.temps * 200) % 12), -w / 2 - 1, 3, 1); } }
  g.restore();
}
function dessinerMelee(g, m, X, Y) {
  const k = m.age / (m.fin + m.anticipation); if (m.age < m.anticipation) return;
  const J = m.attache; const cx = X(J.x), cy = Y(J.y - 10);
  g.save(); g.globalAlpha = 1 - k; g.strokeStyle = '#fff4d0'; g.lineWidth = 3;
  g.beginPath(); g.arc(cx, cy, m.portee * 0.85, m.a - m.arc / 2, m.a - m.arc / 2 + m.arc * Math.min(1, k * 2.5)); g.stroke();
  g.strokeStyle = 'rgba(255,200,120,0.6)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, m.portee * 0.6, m.a - m.arc / 2, m.a + m.arc / 2); g.stroke();
  g.restore();
}
function dessinerOrbe(g, o, X, Y) {
  const r = Math.round(o.r); g.drawImage(disque(r + 2, 'rgba(20,40,80,0.5)'), X(o.x - r - 2), Y(o.y - r - 2));
  g.drawImage(disque(r, '#6ab8f8'), X(o.x - r), Y(o.y - r)); g.drawImage(disque(Math.max(1, r - 3), '#d8f0ff'), X(o.x - r + 3), Y(o.y - r + 3));
  const a = G.temps * 8; g.fillStyle = '#ffffff'; g.fillRect(X(o.x + Math.cos(a) * r * 0.6), Y(o.y + Math.sin(a) * r * 0.6), 2, 2);
}

// ── Joueur (mutations cumulatives par couches) ──
function dessinerJoueur(g, J, x, y) {
  if (J.invuln > 0 && J.etat !== 'objet' && !G.reglages.sansFlash && Math.floor(J.invuln * 12) % 2 === 0) { g.globalAlpha = 0.35; }
  if (J.intangible) g.globalAlpha = 0.45;
  const M = J.mutations;
  if (M.aura) dessinerAura(g, M.aura, x, y);
  let etatTete = J.tCligne < 0 ? 'cligne' : 'normal';
  if (J.tir.anim > 0.05 || J.tir.charge > 0) etatTete = 'tir';
  const frame = J.dash ? 1 : J.frame;
  if (J.etat === 'objet' && G.enAnimationObjet) { dessinerPerso(g, J.cle, x, y, { dirCorps: 'bas', dirTete: 'bas', frame: 0, etatTete: 'normal' }); const ic = iconeObjet(G.enAnimationObjet.d.id); g.drawImage(ic, x - 10, y - 56); g.fillStyle = PEAU.s; g.fillRect(x - 9, y - 38, 3, 4); g.fillRect(x + 6, y - 38, 3, 4); g.globalAlpha = 1; return; }
  if (J.def.teinte) { // variante altérée : liseré de teinte
    const S = spritesPerso(J.cle); const vue = { haut: 'dos', bas: 'face', gauche: 'gauche', droite: 'cote' };
    const t = silhouette(S.tetes[vue[J.dirTete] || 'face'].normal, J.def.teinte); g.globalAlpha *= 0.5; g.drawImage(t, x - 13 - 1, y - 32); g.drawImage(t, x - 13 + 1, y - 32); g.globalAlpha = J.invuln > 0 && Math.floor(J.invuln * 12) % 2 === 0 ? 0.35 : 1;
  }
  if (M.dos) dessinerCouche(g, M.dos, x, y, J, 'dos');
  dessinerPerso(g, J.cle, x, y, { dirCorps: J.dirCorps, dirTete: J.dirTete, frame, etatTete });
  for (const c of ['peau', 'yeux', 'tete', 'bras', 'corps']) if (M[c]) dessinerCouche(g, M[c], x, y, J, c);
  if (J.kaiten) g.drawImage(anneau(26, 2, 'rgba(200,230,255,0.8)'), x - 27, y - 37);
  if (J.def.regleCode === 'bouclier_sable' && J.bouclierSable) { const a = G.temps * 3; for (let i = 0; i < 6; i++) { g.fillStyle = '#d8b070'; g.fillRect(Math.round(x + Math.cos(a + i) * 14), Math.round(y - 12 + Math.sin(a + i) * 10), 2, 2); } }
  g.globalAlpha = 1;
}
function dessinerAura(g, A, x, y) {
  const t = G.temps; const c = A.couleur || '#f0a030';
  g.globalAlpha = 0.35 + 0.1 * Math.sin(t * 6);
  g.drawImage(ellipse(15, 19, c), x - 15, y - 36);
  if (A.motif === 'queues') for (let i = 0; i < (A.n || 1); i++) { const a = Math.PI / 2 + (i - (A.n - 1) / 2) * 0.5 + Math.sin(t * 3 + i) * 0.2; g.drawImage(disque(3, c), Math.round(x + Math.cos(a) * 14 - 3), Math.round(y - 6 + Math.sin(a) * 8)); g.drawImage(disque(2, c), Math.round(x + Math.cos(a) * 20 - 2), Math.round(y - 4 + Math.sin(a) * 12)); }
  g.globalAlpha = 1;
}
function dessinerCouche(g, v, x, y, J, couche) {
  const col = v.couleur || '#ffffff';
  switch (v.motif) {
    case 'yeux_rouges': if (J.dirTete !== 'haut') { g.fillStyle = col; const dx = J.dirTete === 'gauche' ? -6 : J.dirTete === 'droite' ? 6 : 0; if (J.dirTete === 'bas') { g.fillRect(x - 5, y - 18, 2, 2); g.fillRect(x + 4, y - 18, 2, 2); } else g.fillRect(x + dx - 1 + (dx > 0 ? 3 : -2), y - 18, 2, 2); } break;
    case 'marque': g.fillStyle = col; g.fillRect(x - 8, y - 24, 1, 5); g.fillRect(x + 8, y - 24, 1, 5); g.fillRect(x - 3, y - 27, 7, 1); break;
    case 'bandeau_bras': g.fillStyle = col; g.fillRect(x - 8, y - 7, 2, 2); break;
    case 'cape': g.fillStyle = col; g.fillRect(x - 7, y - 11, 14, 9); g.fillStyle = nuancer(col, 0.7); g.fillRect(x - 7, y - 3, 14, 2); break;
    case 'cornes': g.fillStyle = col; g.fillRect(x - 9, y - 33, 2, 4); g.fillRect(x + 8, y - 33, 2, 4); g.fillRect(x - 10, y - 35, 1, 2); g.fillRect(x + 10, y - 35, 1, 2); break;
    case 'masque': if (J.dirTete === 'bas') { g.fillStyle = col; g.fillRect(x - 7, y - 16, 14, 5); g.fillStyle = '#1c1420'; g.fillRect(x - 5, y - 15, 3, 1); g.fillRect(x + 3, y - 15, 3, 1); } break;
    case 'sable_flottant': { const a = G.temps * 2; for (let i = 0; i < 5; i++) { g.fillStyle = '#d8b070'; g.fillRect(Math.round(x + Math.cos(a * 1.3 + i * 1.2) * 16), Math.round(y - 20 + Math.sin(a + i) * 6), 2, 2); } break; }
    case 'insectes': { const a = G.temps * 5; for (let i = 0; i < 6; i++) { g.fillStyle = '#1a1a1a'; g.fillRect(Math.round(x + Math.cos(a + i * 1.05) * (12 + i % 3 * 3)), Math.round(y - 16 + Math.sin(a * 1.3 + i) * 8), 1, 1); } break; }
    case 'queue': g.fillStyle = col; g.fillRect(x + 5, y - 6, 3, 2); g.fillRect(x + 7, y - 8, 3, 2); g.fillRect(x + 9, y - 10, 2, 2); break;
    case 'plumes': g.fillStyle = col; g.fillRect(x - 12, y - 16, 4, 2); g.fillRect(x - 14, y - 18, 3, 2); g.fillRect(x + 8, y - 16, 4, 2); g.fillRect(x + 11, y - 18, 3, 2); break;
    case 'oeil_front': if (J.dirTete === 'bas') { g.fillStyle = '#f0f0f0'; g.fillRect(x - 1, y - 26, 3, 2); g.fillStyle = col; g.fillRect(x, y - 26, 1, 2); } break;
    case 'point_front': if (J.dirTete !== 'haut') { g.fillStyle = col; g.fillRect(x - 1, y - 24, 2, 2); } break;
    case 'bras_marionnette': g.fillStyle = '#c8b090'; g.fillRect(x - 11, y - 10, 3, 2); g.fillRect(x + 8, y - 10, 3, 2); g.fillStyle = '#6a5a4a'; g.fillRect(x - 12, y - 11, 1, 1); break;
    case 'lueur_poings': g.fillStyle = col; g.fillRect(x - 8, y - 6, 2, 2); g.fillRect(x + 6, y - 6, 2, 2); break;
    case 'papier': { const a = G.temps * 3; for (let i = 0; i < 3; i++) { g.fillStyle = '#f0ece0'; g.fillRect(Math.round(x + Math.cos(a + i * 2.1) * 15), Math.round(y - 14 + Math.sin(a + i * 2.1) * 9), 3, 2); } break; }
    case 'maquillage': if (J.dirTete === 'bas') { g.fillStyle = col; g.fillRect(x - 9, y - 18, 3, 1); g.fillRect(x + 7, y - 18, 3, 1); } break;
    default: if (couche === 'tete') { g.fillStyle = col; g.fillRect(x - 2, y - 34, 4, 2); }
  }
}

// ── Ennemis ──
function dessinerEnnemi(g, e, x, y) {
  if (e.cache) {
    if (e.ia.phase === 'sortie' || e.def.comportement === 'rampant' || e.ia.phase === 'cache') { // indice fiable : sol qui remue
      const t = G.temps * 6 + e.uid; g.fillStyle = 'rgba(40,30,20,0.5)'; for (let i = 0; i < 4; i++) g.fillRect(Math.round(x + Math.cos(t + i * 1.6) * 6), Math.round(y - 2 + Math.sin(t + i) * 2), 2, 1);
    }
    return;
  }
  const sp = spriteEnnemi(e);
  let alpha = e.alpha ?? 1; if (e.apparition > 0) { alpha = 1 - e.apparition / DUREE_APPARITION; }
  if (e.champion === 'fantome' && e.ia.fantomeIntangible) alpha = 0.4;
  g.globalAlpha = Math.max(0.15, alpha);
  const tele = e.ia.tele; let dx = 0, dy = 0, sc = 1;
  if (tele) { if (tele.type === 'tremble') dx = Math.round((Math.random() - 0.5) * 3); if (tele.type === 'gonfle' || tele.type === 'vise' || tele.type === 'frappe') sc = 1 + 0.12 * (1 - tele.t / tele.duree); if (tele.type === 'accroupi') dy = 2; }
  const img = e.flash > 0 ? silhouette(sp.frames[e.frame % sp.frames.length], '#ffffff') : sp.frames[e.frame % sp.frames.length];
  const ech = (e.echelle || 1) * sc;
  const w = Math.round(img.width * (ech > 1.05 ? Math.round(ech * 4) / 4 : 1)), h = Math.round(img.height * (ech > 1.05 ? Math.round(ech * 4) / 4 : 1));
  const miroirG = sp.miroir && e.dir === 'gauche';
  if (miroirG) { g.save(); g.translate(x + dx, 0); g.scale(-1, 1); g.drawImage(img, -Math.round(w / 2), y + dy - h + (sp.base || 0), w, h); g.restore(); }
  else g.drawImage(img, x + dx - Math.round(w / 2), y + dy - h + (sp.base || 0), w, h);
  g.globalAlpha = 1;
  // champion : forme d'aura + icône (pas seulement la couleur)
  if (e.champion) { const C = CHAMPIONS[e.champion]; const t = G.temps * 3; for (let i = 0; i < 4; i++) { const a = t + i * Math.PI / 2; g.fillStyle = C.couleur; g.fillRect(Math.round(x + Math.cos(a) * (e.r + 5)) - 1, Math.round(y - h / 2 + Math.sin(a) * (e.r * 0.7 + 4)) - 1, 3, 3); } dessinerIconeChampion(g, C.icone, x, y - h - 6 + (sp.base || 0), C.couleur); }
  // statuts : symboles redondants
  let sx = x - 8; const sy = y - h - (e.champion ? 14 : 4) + (sp.base || 0);
  for (const k of Object.keys(e.statuts)) { dessinerSymboleStatut(g, k, sx, sy); sx += 6; }
  if (e.ia.tele && e.ia.tele.type === 'sceau') { g.fillStyle = '#e0d060'; g.fillRect(x - 1, y - h - 8, 3, 3); }
  if (e.def.params && e.def.params.bouclier === 'frontal') { const [fx, fy] = DIRS[e.dir]; g.fillStyle = '#c8c8d8'; if (fx) g.fillRect(x + fx * (e.r + 2) - 1, y - 18, 3, 14); else g.fillRect(x - 8, y - 8 + fy * (e.r - 2), 16, 3); }
  if (e.def.params && e.def.params.bouclier === 'aura') { g.globalAlpha = 0.25; g.drawImage(anneau(2.5 * TUILE, 1, '#a0c0ff'), x - 2.5 * TUILE - 1, y - 2.5 * TUILE - 1); g.globalAlpha = 1; }
  if (e.invulnerable) { g.globalAlpha = 0.6; g.drawImage(anneau(e.r + 6, 2, '#e0e0ff'), x - e.r - 7, y - h / 2 - e.r - 7); g.globalAlpha = 1; }
  if (G.joueur.transformations.includes('TRF_005') && !e.boss && e.pv < e.pvMax) { g.fillStyle = '#1c1420'; g.fillRect(x - 8, y + 2, 16, 2); g.fillStyle = '#e04a4a'; g.fillRect(x - 8, y + 2, Math.round(16 * e.pv / e.pvMax), 2); }
}
function dessinerIconeChampion(g, ic, x, y, c) {
  g.fillStyle = '#1c1420'; g.fillRect(x - 3, y - 3, 7, 7); g.fillStyle = c;
  const p = { vent: [[-2, -1], [-1, -1], [0, -1], [-1, 1], [0, 1], [1, 1]], bouclier: [[-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [-2, -1], [2, -1], [-1, 0], [1, 0], [0, 1]], etoile: [[0, -2], [-1, 0], [0, 0], [1, 0], [0, 2], [-2, 0], [2, 0]], feuille: [[0, -2], [-1, -1], [0, -1], [-1, 0], [0, 0], [1, 0], [0, 1], [1, 1]], spirale: [[-1, -2], [0, -2], [1, -1], [1, 0], [0, 1], [-1, 0], [0, -1]], deux: [[-2, 0], [-1, 0], [1, 0], [2, 0], [-2, -1], [2, -1]], flamme: [[0, -2], [-1, -1], [0, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] }[ic] || [[0, 0]];
  for (const [dx, dy] of p) g.fillRect(x + dx, y + dy, 1, 1);
}
function dessinerSymboleStatut(g, k, x, y) {
  const c = { brulure: '#ff7a2a', poison: '#7ae04a', ralenti: '#5ab0f0', immobilise: '#3a3050', charme: '#ff7ab0', peur: '#e0e0e0', confus: '#d0a0ff', gel: '#c0f0ff' }[k] || '#fff';
  g.fillStyle = '#1c1420'; g.fillRect(x - 1, y - 1, 6, 6); g.fillStyle = c;
  if (k === 'brulure') { g.fillRect(x + 2, y, 1, 1); g.fillRect(x + 1, y + 1, 3, 2); g.fillRect(x, y + 3, 5, 1); }
  else if (k === 'poison') { g.fillRect(x + 1, y, 3, 1); g.fillRect(x, y + 1, 5, 3); }
  else if (k === 'immobilise') { g.fillStyle = '#9080c0'; g.fillRect(x, y + 2, 5, 1); g.fillRect(x + 2, y, 1, 5); }
  else if (k === 'charme') { g.fillRect(x, y, 2, 2); g.fillRect(x + 3, y, 2, 2); g.fillRect(x + 1, y + 2, 3, 2); }
  else if (k === 'confus') { g.fillRect(x + 1, y, 3, 1); g.fillRect(x + 3, y + 1, 1, 1); g.fillRect(x + 2, y + 2, 1, 1); g.fillRect(x + 2, y + 4, 1, 1); }
  else g.fillRect(x, y, 5, 5);
}
function dessinerFamilier(g, f, x, y) {
  const s = spriteFamilier(f); const img = s.frames[Math.floor(f.t * 6) % s.frames.length];
  if (f.def.comportement === 'clone_temp' || f.def.comportement === 'clone_res') { g.globalAlpha = 0.72; dessinerPerso(g, G.joueur.cle, x, y, { dirCorps: G.joueur.dirCorps, dirTete: G.joueur.dirTete, frame: G.joueur.frame }); g.globalAlpha = 1; g.drawImage(anneau(4, 1, '#c0e0ff'), x - 5, y - 38); return; }
  g.drawImage(img, x - Math.round(img.width / 2), y - img.height + (s.base || 0));
}
// ── Ramassables, piédestaux, machines ──
function dessinerRamassable(g, r, x, y) {
  let s;
  if (r.type === 'pilule') s = spriteRamassable('pilule', r.apparence);
  else if (r.type === 'rouleau') s = spriteRamassable(INDEX[r.id] && INDEX[r.id].famille === 'sceau' ? 'sceau_poche' : 'rouleau', INDEX[r.id] && INDEX[r.id].couleur);
  else if (r.type === 'talisman') s = spriteRamassable('talisman', INDEX[r.id] && INDEX[r.id].couleur);
  else s = spriteRamassable(r.type);
  const flotte = ['coeur', 'protection', 'instable', 'condensateur'].includes(RAMASSABLES[r.type].cat) ? Math.round(Math.sin(G.temps * 3 + r.x) * 1) : 0;
  g.drawImage(s, x - Math.round(s.width / 2), y - s.height + 2 + flotte);
  if (r.type === 'ryo' && Math.floor(G.temps * 2 + r.x) % 5 === 0) { g.fillStyle = '#ffffff'; g.fillRect(x + 1, y - 7, 1, 1); }
}
function dessinerPiedestal(g, p, X, Y) {
  const x = X(p.x), y = Y(p.y);
  g.fillStyle = '#2a2230'; g.fillRect(x - 11, y - 2, 22, 10); g.fillStyle = '#6a5a70'; g.fillRect(x - 10, y - 3, 20, 3); g.fillStyle = '#4a3e52'; g.fillRect(x - 9, y, 18, 7);
  g.fillStyle = '#8a7a90'; g.fillRect(x - 10, y - 3, 20, 1);
  if (!p.id) return;
  if (p.apparu > 0) { p.apparu -= 1 / 60; }
  const flotte = Math.round(Math.sin(G.temps * 2.5 + p.x) * 2);
  if (p.ramassable) { const s = spriteRamassable(p.ramassable); g.drawImage(s, x - Math.round(s.width / 2), y - s.height - 4 + flotte); }
  else {
    const ic = G.etage && G.etage.malediction === 'aveugle' ? iconeObjet('?') : iconeObjet(p.id);
    g.drawImage(ellipse(8, 3, 'rgba(0,0,0,0.3)'), x - 8, y - 5);
    g.drawImage(ic, x - 10, y - 26 + flotte);
  }
  if (p.prix) {
    const t = p.prix.type === 'ryo' ? String(p.prix.n) : p.prix.type === 'pacte' ? prixPacteTexte(p) : '';
    g.fillStyle = p.solde ? '#c83a2a' : '#1c1420'; const l = Police.largeur(t) + (p.prix.type === 'ryo' ? 10 : 2);
    g.fillRect(x - l / 2 - 2, y + 9, l + 4, 10);
    if (p.prix.type === 'ryo') { g.drawImage(ICONES.ryo, x - l / 2, y + 10); Police.ecrire(g, t, x - l / 2 + 10, y + 11, '#f8e8b0', { ombre: null }); }
    else Police.ecrire(g, t, x, y + 11, '#ff9a9a', { a: 'c', ombre: null });
  }
}
function prixPacteTexte(p) {
  const J = G.joueur; if (J.drapeaux.pacteRyo) return p.prix.n * J.drapeaux.pacteRyo + ' Ryō';
  if (J.drapeaux.serment) return 3 * p.prix.n + ' instable';
  if (nbVit(J.sante) === 0) return 4 * p.prix.n / 2 + ' ♥ chakra';
  return p.prix.n + ' ♥ vitalité';
}
function dessinerMachine(g, m, x, y) {
  const col = { loterie: '#c83a2a', don_vital: '#8a1a2a', diseuse: '#5a3a8a', soin: '#d86a8a', recharge: '#3a7ad8', troc: '#6a8a3a' }[m.type] || '#888';
  if (m.detruite) { g.fillStyle = '#3a3036'; g.fillRect(x - 10, y + 2, 20, 6); return; }
  g.drawImage(contourner(peindre(['.kkkkkkkkkkkk.', 'kccccccccccccck'.slice(0, 14), 'kcwwwwwwwwwwck', 'kcwbbbbbbbbwck', 'kcwbyybyybbwck', 'kcwbbbbbbbbwck', 'kcwwwwwwwwwwck', 'kccccccccccccck'.slice(0, 14), 'kccyyyyyyyyyck'.slice(0, 14), 'kcccccccccccck', 'kkkkkkkkkkkkkk', '.kk........kk.'], { k: '#1c1420', c: col, w: '#e8e0d0', b: '#2a2a34', y: '#f0c040' })), x - 7, y - 10);
  const lbl = { loterie: 'Loterie', don_vital: 'Don vital', diseuse: 'Diseuse', soin: 'Soins', recharge: 'Recharge', troc: 'Troc' }[m.type];
  if (G.machineProche === m) Police.ecrire(g, lbl + ' (' + Entrees.libelle('interagir') + ')', x, y - 22, '#f0e8d0', { a: 'c' });
}
function dessinerPnj(g, n, x, y) {
  dessinerPerso(g, n.type === 'voyageur' ? 'kakuzu' : n.type === 'marchand_cles' ? 'kankuro' : 'kiba', x, y + 10, { dirCorps: 'bas', frame: 0 });
  if (G.machineProche === n) { const I = INFORMATEURS[n.type]; Police.ecrire(g, I.coutAff + ' (' + Entrees.libelle('interagir') + ')', x, y - 30, '#f0e8d0', { a: 'c' }); }
}
function dessinerStatue(g, st, x, y) {
  const col = st.type === 'serpent' ? { a: '#5a4a6a', b: '#8a7a9a' } : st.type === 'crapaud' ? { a: '#b0b098', b: '#e0e0c8' } : { a: '#6a5a4a', b: '#9a8a7a' };
  const L = st.type === 'serpent' ? ['....aaaa....', '...abbbba...', '..abkbbkba..', '..abbbbbba..', '...abbbba...', '....abba....', '...aabbaa...', '..aabbbbaa..', '.aabbbbbbaa.', 'aaaaaaaaaaaa'] : st.type === 'crapaud' ? ['..aa....aa..', '.abka..akba.', '.aabbbbbbaa.', 'aabbbbbbbbaa', 'abbbkkkkbbba', 'aabbbbbbbbaa', '.aabbbbbbaa.', 'aa.aaaaaa.aa', 'aaaaaaaaaaaa'] : ['...aaaaaa...', '..abbbbbba..', '..abkbbkba..', '..abbbbbba..', '...abbbba...', '..aabbbbaa..', '.aabbbbbbaa.', 'aaaaaaaaaaaa'];
  const img = contourner(peindre(L, Object.assign({ k: '#1c1420' }, col))); g.drawImage(img, x - img.width / 2, y - img.height + 12);
}
function dessinerAutel(g, A, x, y) {
  g.fillStyle = '#3a2226'; g.fillRect(x - 14, y - 4, 28, 14); g.fillStyle = '#6a3a3a'; g.fillRect(x - 13, y - 5, 26, 3);
  for (let i = 0; i < 5; i++) { g.fillStyle = '#d8d0c8'; g.fillRect(x - 10 + i * 5, y - 9, 2, 5); g.fillStyle = '#8a3030'; g.fillRect(x - 10 + i * 5, y - 10, 2, 1); }
  Police.ecrire(g, String(A.paiements), x, y + 12, '#d8a0a0', { a: 'c' });
}
function dessinerSource(g, S, x, y) {
  g.drawImage(ellipse(26, 12, S.utilisee ? '#2a3a40' : '#3a8ab0'), x - 26, y - 12); g.drawImage(ellipse(20, 8, S.utilisee ? '#34464e' : '#6ac8e8'), x - 20, y - 8);
  if (!S.utilisee && Math.random() < 0.2) G.particules.push({ x: S.x + (Math.random() - 0.5) * 30, y: S.y - 4, vx: 0, vy: -18, age: 0, duree: 0.8, couleur: 'rgba(230,240,255,0.5)', taille: 2 });
  if (G.machineProche === S) Police.ecrire(g, 'Se baigner : 5 Ryō ou 1 clé (' + Entrees.libelle('interagir') + ')', x, y - 26, '#e0f4ff', { a: 'c' });
}
function dessinerSortie(g, s, x, y) {
  const t = G.temps; const k = s.t ? Math.min(1, s.t / 0.35) : 0;
  if (s.type === 'etage' && !s.lumiere) { g.drawImage(ellipse(15, 9, '#050306'), x - 15, y - 9); g.drawImage(anneau(15, 1, '#8a6a4a'), x - 16, y - 16); if (k > 0) g.drawImage(anneau(Math.round(15 * k), 2, '#ffe080'), x - Math.round(15 * k) - 1, y - Math.round(15 * k) - 1); }
  else if (s.lumiere) { g.globalAlpha = 0.5 + 0.2 * Math.sin(t * 3); g.fillStyle = '#fff8d0'; g.fillRect(x - 10, y - 200, 20, 200); g.globalAlpha = 1; g.drawImage(ellipse(14, 7, '#fff8e0'), x - 14, y - 7); }
  else if (s.type === 'fin') { g.drawImage(ellipse(16, 10, '#2a1030'), x - 16, y - 10); for (let i = 0; i < 6; i++) { const a = t * 2 + i; g.fillStyle = '#e0a0ff'; g.fillRect(Math.round(x + Math.cos(a) * 14), Math.round(y + Math.sin(a) * 8), 2, 2); } if (k > 0) g.drawImage(anneau(Math.round(15 * k), 2, '#ffffff'), x - Math.round(15 * k) - 1, y - Math.round(15 * k) - 1); }
  else if (s.type === 'breche') { g.fillStyle = '#ff3a1a'; for (let i = 0; i < 8; i++) g.fillRect(x + Math.round(Math.sin(t * 5 + i) * 3), y - 20 + i * 5, 2, 5); }
  else if (s.type === 'conseil') { g.drawImage(ellipse(14, 8, '#c8a030'), x - 14, y - 8); Police.ecrire(g, 'Conseil', x, y - 20, '#f0d060', { a: 'c' }); }
}
function dessinerBombe(g, b, x, y) {
  const k = b.age / b.meche; const cl = Math.floor(b.age * (k > 0.7 ? 16 : 6)) % 2;
  g.fillStyle = '#6a6a70'; g.fillRect(x - 1, y - 14, 2, 10);
  const s = spriteRamassable('explosif'); g.drawImage(cl ? silhouette(s, '#ff6a4a') : s, x - 4, y - 16);
  g.fillStyle = '#ffd060'; g.fillRect(x - 1 + Math.round(Math.random() * 2), y - 17 - Math.round(Math.random() * 2), 1, 1);
}
function dessinerZone(g, z, X, Y) {
  const x = X(z.x), y = Y(z.y); const k = z.naissance && z.age < z.naissance ? z.age / z.naissance : 1; const fin = z.age > z.duree - 0.6 ? Math.max(0, (z.duree - z.age) / 0.6) : 1;
  g.globalAlpha = fin * (k < 1 ? 0.4 : 1);
  switch (z.type) {
    case 'feu_allie': g.drawImage(ellipse(z.r, z.r * 0.55, 'rgba(255,140,40,0.45)'), x - z.r, y - z.r * 0.55); if (Math.random() < 0.3) G.particules.push({ x: z.x + (Math.random() - 0.5) * z.r, y: z.y, vx: 0, vy: -24, age: 0, duree: 0.3, couleur: '#ffb040', taille: 2 }); break;
    case 'feu_ennemi': g.drawImage(ellipse(z.r, z.r * 0.55, 'rgba(40,10,30,0.7)'), x - z.r, y - z.r * 0.55); g.drawImage(ellipse(z.r - 2, z.r * 0.5 - 1, 'rgba(160,40,200,0.6)'), x - z.r + 2, y - z.r * 0.5 + 1); break;
    case 'eau_alliee': case 'eau': g.drawImage(ellipse(z.r, z.r * 0.55, 'rgba(80,150,220,0.4)'), x - z.r, y - z.r * 0.55); break;
    case 'acide': g.drawImage(ellipse(z.r, z.r * 0.55, 'rgba(20,40,10,0.6)'), x - z.r - 1, y - z.r * 0.55 - 1); g.drawImage(ellipse(z.r - 1, z.r * 0.5, 'rgba(130,220,60,0.7)'), x - z.r + 1, y - z.r * 0.5); if (Math.random() < 0.05) G.particules.push({ x: z.x, y: z.y - 2, vx: 0, vy: -10, age: 0, duree: 0.4, couleur: '#c0ff80', taille: 2 }); break;
    case 'glace': g.drawImage(ellipse(z.r, z.r * 0.55, 'rgba(190,230,255,0.5)'), x - z.r, y - z.r * 0.55); break;
    case 'sable_mouvant': { const a = G.temps; g.drawImage(ellipse(z.r, z.r * 0.55, 'rgba(150,110,60,0.45)'), x - z.r, y - z.r * 0.55); g.fillStyle = 'rgba(90,60,30,0.6)'; g.fillRect(Math.round(x + Math.cos(a * 2) * z.r * 0.5), Math.round(y + Math.sin(a * 2) * z.r * 0.25), 2, 1); break; }
    case 'huile': g.drawImage(ellipse(z.r, z.r * 0.55, 'rgba(40,30,20,0.55)'), x - z.r, y - z.r * 0.55); g.fillStyle = 'rgba(200,180,120,0.5)'; g.fillRect(x - 3, y - 2, 4, 1); break;
    case 'toile_zone': g.drawImage(decorsTheme(G.theme).toile, x - 16, y - 16); break;
    case 'mine': { const cl = z.armee > 0 ? 0 : Math.floor(G.temps * 6) % 2; g.drawImage(disque(4, '#3a3040'), x - 4, y - 4); g.fillStyle = cl ? '#ff6a4a' : '#8a6a6a'; g.fillRect(x - 1, y - 1, 2, 2); break; }
    case 'parchemin': { const cl = z.armee > 0 ? 0 : Math.floor(G.temps * 8) % 2; const s = spriteRamassable('explosif'); g.drawImage(cl ? silhouette(s, '#ff4a2a') : s, x - 4, y - 12); g.drawImage(anneau(24, 1, cl ? 'rgba(255,80,40,0.7)' : 'rgba(255,80,40,0.25)'), x - 25, y - 25); break; }
    case 'courant': { g.fillStyle = 'rgba(120,180,220,0.35)'; for (let i = 0; i < 4; i++) { const o = ((G.temps * 40 + i * 12) % 48) - 24; g.fillRect(x + (z.dx ? o : -z.r / 2 + i * 6), y + (z.dy ? o : -z.r / 4 + i * 3), z.dx ? 6 : 1, z.dy ? 6 : 1); } break; }
  }
  g.globalAlpha = 1;
}
