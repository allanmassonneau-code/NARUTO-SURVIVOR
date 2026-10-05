// ═══════════════════════════════════════════════════════════════════════════
// HUD : santé (haut gauche), actif et charge, ressources, talisman (bas gauche),
// poche (bas droite), minicarte (haut droite), boss (bas centre). Aucun élément
// ne recouvre une porte. Descriptions à deux niveaux (phrase + valeurs).
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
function bannieresRetenues() { const E = G.banniereEtage; return !!(E && E.t < 3.2 || G.introBoss); }
function banniereVisible() { const B = G.banniere; return !!(B && B.t < dureeBanniere(B) || bannieresRetenues()); }
// Icône des synergies : deux anneaux enlacés (turquoise et or)
let _iconeSyn = null;
function iconeSynergie() {
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
function dessinerHUD(g) {
  const J = G.joueur; if (!J) return;
  const S = J.sante, calme = G.reglages.sansFlash;
  // santé et actif : plaque haute
  const nCases = S.cont.length + Math.ceil(S.prot.length / 2) + S.cicatrices, rangs = Math.max(1, Math.ceil(nCases / 6));
  plaqueHUD(g, 1, 1, 98, Math.max(34, 8 + rangs * 9));
  if (santeTotale(S) <= 2 && !calme && J.etat !== 'mort') { g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = 0.25 + 0.2 * Math.sin(G.temps * 5); g.drawImage(halo('#ff2030', false, 50), 26, -14, 50, 40); g.restore(); }
  let i = 0; const pos = k => [38 + (k % 6) * 9, 5 + Math.floor(k / 6) * 9];
  for (const c of S.cont) { const [x, y] = pos(i++); const set = c.t === 'os' ? ICONES.os : ICONES.vit; g.drawImage(set[c.p], x, y); }
  for (let k = 0; k < S.prot.length; k += 2) { const [x, y] = pos(i++); const t = S.prot[k] === 'n' ? ICONES.noir : ICONES.bleu; g.drawImage(t[k + 1 < S.prot.length ? 2 : 1], x, y); }
  for (let k = 0; k < S.cicatrices; k++) { const [x, y] = pos(i++); g.drawImage(ICONES.cicatrice, x, y); }
  if (S.partiel) { const [x, y] = pos(0); g.drawImage(ICONES.partiel, x + 1, y); }
  if (G.degatsEnnemis >= 2) Police.ecrire(g, '×2', 38 + 6 * 9 + 4, 24, '#ff8a6a'); // rappel : coups d'un cœur entier
  // actif : écrin biseauté, lueur quand il est prêt
  g.fillStyle = '#0a0710'; g.fillRect(3, 3, 28, 28); g.fillStyle = '#241c30'; g.fillRect(4, 4, 26, 26); g.fillStyle = '#3a3048'; g.fillRect(4, 4, 26, 1); g.fillRect(4, 4, 1, 26); g.fillStyle = '#16101e'; g.fillRect(4, 29, 26, 1); g.fillRect(29, 4, 1, 26);
  if (J.actif) {
    const d = INDEX[J.actif.id]; const pret = actifPret(J);
    if (pret && !calme) { g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = 0.3 + 0.12 * Math.sin(G.temps * 4); g.drawImage(halo('#ffc850', false, 40), -3, -3, 40, 40); g.restore(); }
    g.drawImage(iconeObjet(d.id), 7, 7);
    // jauge : segments de charge (pas des cœurs), ou temps
    g.fillStyle = '#0a0710'; g.fillRect(32, 3, 6, 28); g.fillStyle = '#1e1828'; g.fillRect(33, 4, 4, 26);
    if (d.recharge) { const k = (J.actif.temps || 0) / d.recharge; const h = Math.round(26 * k); g.fillStyle = pret ? '#f0d060' : '#5aa0e0'; g.fillRect(33, 30 - h, 4, h); g.fillStyle = pret ? '#fff4b0' : '#9ad0ff'; g.fillRect(33, 30 - h, 1, h); }
    else if (d.unique) { g.fillStyle = '#f0d060'; g.fillRect(33, 4, 4, 26); g.fillStyle = '#fff4b0'; g.fillRect(33, 4, 1, 26); }
    else { const max = chargesMax(d); const h = 26 / max; for (let k = 0; k < max; k++) { const plein = k < J.actif.charges; const y = Math.round(30 - (k + 1) * h) + 1, hh = Math.max(1, Math.round(h) - 1); g.fillStyle = plein ? (pret ? '#f0d060' : '#5aa0e0') : '#2a2436'; g.fillRect(33, y, 4, hh); if (plein) { g.fillStyle = pret ? '#fff4b0' : '#9ad0ff'; g.fillRect(33, y, 1, hh); } } if (J.actif.charges > max) { g.fillStyle = '#ff9a4a'; g.fillRect(33, 4, 4, Math.round(26 * (J.actif.charges - max) / max)); } }
    if (pret) { g.fillStyle = '#f0d060'; g.fillRect(3, 3, 28, 1); g.fillRect(3, 30, 28, 1); g.fillRect(3, 3, 1, 28); g.fillRect(30, 3, 1, 28); if (!calme && Math.floor(G.temps * 3) % 2 === 0) { g.fillStyle = '#fffbe0'; g.fillRect(3, 3, 2, 2); g.fillRect(29, 29, 2, 2); } }
  }
  if (J.actif2) { g.fillStyle = '#0a0710'; g.fillRect(40, 23, 14, 14); g.fillStyle = '#241c30'; g.fillRect(41, 24, 12, 12); g.drawImage(iconeObjet(J.actif2.id), 37, 20, 20, 20); }
  // ressources, compteurs de règle et statistiques : colonne gauche
  const lignes = [];
  if (J.def.regleCode === 'controle_chakra') lignes.push(['Force ' + J.force + '/6', '#ff9ac0']);
  if (J.def.regleCode === 'sceau_centaine') lignes.push(['Sceau ' + J.sceau + '/12', '#ff9ac0']);
  if (J.def.regleCode === 'clones_ressource') lignes.push(['Clones ' + J.clones + '/4', '#ffc060']);
  if (J.coeursReserve > 0) lignes.push(['Cœurs ' + J.coeursReserve, '#6ad060']);
  if (J.def.regleCode === 'trois_marionnettes') lignes.push([{ karasu: 'Karasu', kuroari: 'Kuroari', sanshouo: 'Sanshōuo' }[J.marionnette || 'karasu'], '#c0a0ff']);
  const stats = G.reglages.afficherStats; const hCol = 40 + lignes.length * 11 + (stats ? 70 : 0);
  plaqueHUD(g, 1, 37, 62, hCol);
  const res = [[ICONES.ryo, J.ryo], [ICONES.explosif, J.explosifsDores ? 99 : J.explosifs], [ICONES.cle, J.clesDorees ? 99 : J.cles]];
  res.forEach(([ic, n], k) => { g.drawImage(ic, 6, 42 + k * 12 - (ic.height > 10 ? 2 : 0)); Police.ecrire(g, String(n).padStart(2, '0'), 19, 43 + k * 12, n > 0 ? '#f4ecd8' : '#8a8098'); });
  let yx = 79;
  for (const [t, c] of lignes) { Police.ecrire(g, t, 6, yx, c); yx += 11; }
  if (stats) { g.fillStyle = '#3a3048'; g.fillRect(6, yx - 2, 52, 1); dessinerStats(g, J, 6, yx + 2); }
  // talisman / poche
  if (J.talisman) { plaqueHUD(g, 2, 330, J.talisman2 ? 30 : 18, 26, '#5a4a3a'); g.drawImage(spriteRamassable('talisman', INDEX[J.talisman].couleur), 6, 336); if (J.talisman2) g.drawImage(spriteRamassable('talisman', INDEX[J.talisman2].couleur), 18, 336); }
  if (J.poches.length) {
    const c = J.poches[0]; const s = c.type === 'pilule' ? spriteRamassable('pilule', G.partie.pilules.indexOf(c.id)) : spriteRamassable(INDEX[c.id].famille === 'sceau' ? 'sceau_poche' : 'rouleau', INDEX[c.id].couleur);
    const nom = c.type === 'pilule' ? nomPilule(c) : INDEX[c.id].nom; const w = Police.largeur(nom) + 34;
    plaqueHUD(g, 638 - w, 332, w, 24, '#5a4a3a');
    g.drawImage(s, 622 - s.width / 2, 338); Police.ecrire(g, nom, 612, 340, '#d8d0e0', { a: 'd' });
    if (J.poches.length > 1) Police.ecrire(g, '+' + (J.poches.length - 1), 634, 322, '#a0a0b0', { a: 'd' });
  }
  dessinerMinicarte(g, 568, 6, false);
  // boss : barre ornée, traîne claire des dégâts récents
  const boss = G.ennemis.filter(e => e.boss && !e.mort);
  if (boss.length) {
    const tot = boss.reduce((a, e) => a + e.pv, 0), max = boss.reduce((a, e) => a + e.pvMax, 0); const w = 280, x0 = 320 - w / 2, y0 = 342;
    if (!_traceBoss || _traceBoss.max !== max) _traceBoss = { max, v: tot };
    _traceBoss.v = tot < _traceBoss.v ? Math.max(tot, _traceBoss.v - max * 0.003 - (_traceBoss.v - tot) * 0.035) : tot;
    plaqueHUD(g, x0 - 6, y0 - 4, w + 12, 13, '#7a2a36');
    g.fillStyle = '#2a0c14'; g.fillRect(x0, y0, w, 5);
    g.fillStyle = '#f4dcc0'; g.fillRect(x0, y0, Math.round(w * _traceBoss.v / max), 5);
    const pw = Math.round(w * tot / max); g.fillStyle = '#c8283a'; g.fillRect(x0, y0, pw, 5); g.fillStyle = '#ff7a64'; g.fillRect(x0, y0, pw, 1); g.fillStyle = '#7a1024'; g.fillRect(x0, y0 + 4, pw, 1);
    for (let k = 1; k < 4; k++) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x0 + Math.round(w * k / 4), y0, 1, 5); }
    losange(g, x0 - 9, y0 + 2, '#e0b870'); losange(g, x0 + w + 8, y0 + 2, '#e0b870');
    Police.ecrire(g, boss[0].def.nom, 320, 329, '#f8e0d4', { a: 'c', contour: '#1c1420' });
  } else _traceBoss = null;
  // bannières et panneaux
  if (G.banniere && !bannieresRetenues()) dessinerBanniere(g);
  if (G.banniereEtage) dessinerBanniereEtage(g);
  if (G.achatPropose) dessinerPanneauAchat(g, G.achatPropose);
  else if (Entrees.enfonce('description') && G.piedestalProche && G.piedestalProche.id) dessinerDescription(g, G.piedestalProche.ramassable ? null : G.piedestalProche.id);
  if (Entrees.enfonce('carte') && !G.transition) dessinerCarteEtendue(g);
  // messages d'écran : le plus récent en bas, les précédents empilés au-dessus, coupés à 460 px
  { const M = G.textes.filter(t => t.ecran); let y = 300; for (let i = M.length - 1; i >= 0 && y > 200; i--) { const t = M[i], k = t.age / t.duree, lignes = Police.couper(t.t, 460); g.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : Math.min(1, t.age / 0.12); for (let j = lignes.length - 1; j >= 0; j--) { Police.ecrire(g, lignes[j], 320, y, t.couleur || '#fff', { a: 'c', contour: '#1c1420' }); y -= 12; } y -= 4; } g.globalAlpha = 1; }
  if (G.flashDegat > 0 && !G.reglages.sansFlash) { g.save(); g.globalAlpha = Math.min(1, G.flashDegat * 1.2); const v = g.createRadialGradient(320, 180, 150, 320, 180, 380); v.addColorStop(0, 'rgba(160,10,28,0)'); v.addColorStop(1, 'rgba(160,10,28,0.75)'); g.fillStyle = v; g.fillRect(0, 0, ECRAN_L, ECRAN_H); g.restore(); }
  if (G.introBoss) dessinerIntroBoss(g);
  if (G.fondu) { g.globalAlpha = Math.min(1, G.fondu.t / (G.fondu.duree / 2)); g.fillStyle = '#000'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); g.globalAlpha = 1; }
  if (Son.suspendu()) inviteSon(g, 320, 4);
  if (Entrees.maintien.deposer > 0.15 && (J.talisman || J.poches.length)) { const k = Math.min(1, Entrees.maintien.deposer / DUREE_DEPOT); plaqueHUD(g, 282, 244, 76, 28); Police.ecrire(g, 'Déposer…', 320, 250, '#f0e0c0', { a: 'c' }); g.fillStyle = '#14101c'; g.fillRect(290, 262, 60, 4); g.fillStyle = '#f0e0c0'; g.fillRect(290, 262, Math.round(60 * k), 4); }
}
function dessinerStats(g, J, x, y) {
  const S = J.stats; const L = [['Dég', formatNombre(arrondi(S.degats, 2))], ['Cad', formatNombre(arrondi(S.cadence * J.profil.coefCadence, 2))], ['Por', formatNombre(arrondi(S.portee, 1))], ['VTi', formatNombre(arrondi(S.vitesseTir, 1))], ['Vit', formatNombre(arrondi(S.vitesse, 2))], ['Cha', formatNombre(S.chance)]];
  L.forEach(([k, v], i) => { Police.ecrire(g, k, x, y + i * 10, '#8a8098'); Police.ecrire(g, v, x + 24, y + i * 10, '#e8e0f0'); });
}
function dessinerBanniere(g) {
  const B = G.banniere; const d = dureeBanniere(B); if (B.t > d) return;
  const a = B.t < 0.15 ? B.t / 0.15 : B.t > d - 0.4 ? (d - B.t) / 0.4 : 1;
  g.globalAlpha = a;
  const y = B.transformation ? 130 : 84; const w = Math.max(Police.largeur(B.nom) * 2, Police.largeur(B.desc || '')) + 24;
  bandeau(g, 320 - w / 2 - 30, y - 7, w + 60, B.desc ? 38 : 26, B.transformation ? '#f0c040' : B.synergie ? '#5ae0d0' : B.pilule ? '#a0e0a0' : '#d8c8a0');
  Police.ecrire(g, B.nom, 320, y, B.transformation ? '#ffe080' : B.synergie ? '#b8fff4' : '#fff4e0', { a: 'c', e: Police.largeur(B.nom) * 2 > 420 ? 1 : 2, contour: '#1c1420' });
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
  Police.ecrire(g, I.d.titre || '', x, 146, '#d8a0a0', { a: 'c' });
  Police.ecrire(g, I.d.nom, x, 162, '#fff0e0', { a: 'c', e: 3, contour: '#1c1420' });
  g.globalAlpha = 1;
}
function dessinerPanneauAchat(g, p) {
  const J = G.joueur; const v = peutPayer(p); const nom = p.ramassable ? ({ coeur: 'Cœur de vitalité', cle: 'Clé de sceau', explosif: 'Parchemin explosif', rouleau: 'Rouleau tactique', protection: 'Réserve de chakra', pilule: 'Pilule militaire', condensateur: 'Condensateur de chakra', coeur_double: 'Double cœur' }[p.ramassable]) : INDEX[p.id].nom;
  const L = [nom];
  if (p.prix.type === 'ryo') { const n = prixRyo(p); L.push('Prix : ' + (n === 0 ? 'gratuit (coupon)' : n + ' Ryō' + (n < p.prix.n ? ' (au lieu de ' + p.prix.n + ')' : '')) + ' (vous : ' + J.ryo + ')'); }
  else { // pacte : résultat exact avant confirmation
    const S = J.sante; const apres = copieSante(S);
    if (v.ryo) L.push('Prix : ' + v.ryo + ' Ryō');
    else if (v.instable) L.push('Prix : ' + v.instable + ' demis de chakra instable');
    else if (v.detail) { if (v.detail.type === 'contenants') { retirerConteneur(apres, p.prix.n); L.push('Prix : ' + p.prix.n + ' contenant(s) de vitalité'); } else { apres.prot.splice(-v.detail.n); L.push('Prix : ' + v.detail.n / 2 + ' réserve(s) de chakra'); } L.push('Après : ' + nbVit(apres) + ' contenant(s), santé ' + santeTotale(apres) / 2 + ' cœur(s)'); if (santeTotale(apres) <= 0) L.push('CE PAIEMENT SERAIT MORTEL'); }
  }
  if (!p.ramassable) L.push(INDEX[p.id].desc);
  L.push(v.ok ? 'Confirmer : ' + Entrees.libelle('interagir') : v.manque);
  const w = Math.max(...L.map(l => Police.largeur(l))) + 16, h = L.length * 11 + 8; const x = borne(Math.round(320 - w / 2), 4, 636 - w), y = 250;
  plaqueHUD(g, x, y, w, h, p.prix.type === 'pacte' ? '#8a2a5a' : '#8a7a4a');
  L.forEach((l, i) => Police.ecrire(g, l, x + 8, y + 5 + i * 11, i === 0 ? '#fff0d0' : l.startsWith('CE PAIEMENT') ? '#ff5050' : i === L.length - 1 ? (v.ok ? '#a0e0a0' : '#ff9a8a') : '#c8c0d8'));
}
function dessinerDescription(g, id) {
  if (!id) return; const d = INDEX[id]; const L = [d.nom, d.desc]; for (const l of detailsObjet(d)) L.push('· ' + l);
  if (d.statut) L.push('[' + d.statut + ']');
  const w = Math.min(420, Math.max(...L.map(l => Police.largeur(l))) + 16); const lignes = []; for (const l of L) lignes.push(...Police.couper(l, w - 16));
  const h = lignes.length * 11 + 8, x = 320 - w / 2, y = 230;
  plaqueHUD(g, x, y, w, h, '#6a5a8a');
  lignes.forEach((l, i) => Police.ecrire(g, l, x + 8, y + 5 + i * 11, i === 0 ? '#fff0d0' : '#c8c0d8'));
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
const ICONE_SALLE = { boss: '#e04a4a', heritage: '#f0c040', boutique: '#e0d070', cache: '#a090a0', isolee: '#a090a0', sacrifice: '#c07070', malediction: '#b04070', defi: '#9090c0', defi_boss: '#c060a0', dispositifs: '#50a0c0', bibliotheque: '#80c060', coffres: '#c0a050', repos: '#60c0c0', pacte: '#8a3aa8', sanctuaire: '#f0f0d0' };
function dessinerMinicarte(g, x0, y0, etendue) {
  const E = G.etage; if (!E) return; const s0 = G.salle;
  const perdu = G.etage.malediction === 'perdu' && !etendue;
  const cw = etendue ? 18 : 9, ch = etendue ? 14 : 7, n = etendue ? 13 : 7;
  const cx = s0.cx >= 0 ? s0.cx : 6, cy = s0.cy >= 0 ? s0.cy : 6;
  const ox = etendue ? Math.round((x0 || 320) - 6.5 * cw) : x0, oy = etendue ? Math.round((y0 || 180) - 6.5 * ch) : y0; // étendue : (x0, y0) = centre
  const dx0 = etendue ? 0 : cx - 3, dy0 = etendue ? 0 : cy - 3;
  if (!etendue) { plaqueHUD(g, ox - 5, oy - 5, n * cw + 10, n * ch + 22); if (G.etage.cfg) Police.ecrire(g, 'Étage ' + G.etage.numero, ox + n * cw / 2, oy + n * ch + 4, '#a898b8', { a: 'c' }); }
  if (perdu) { Police.ecrire(g, '?', ox + n * cw / 2, oy + n * ch / 2 - 4, '#8a8098', { a: 'c' }); return; }
  for (const s of Object.values(E.salles)) {
    if (s.id === 'opp' || !(s.visitee || s.apercue)) continue;
    const F = FORMES[s.forme];
    for (const [i, j] of F.cel) {
      const gx = s.cx + i - dx0, gy = s.cy + j - dy0; if (gx < 0 || gy < 0 || gx >= n || gy >= n) continue;
      const x = ox + gx * cw, y = oy + gy * ch;
      g.fillStyle = s === s0 ? '#f4ecfa' : s.visitee ? '#7a7090' : '#3a3448'; g.fillRect(x, y, cw - 1, ch - 1);
      if (s !== s0 && s.visitee) { g.fillStyle = '#9a90b0'; g.fillRect(x, y, cw - 1, 1); }
      // fusion visuelle des cellules d'une grande salle
      if (F.cel.some(([a, b]) => a === i + 1 && b === j)) g.fillRect(x + cw - 1, y, 1, ch - 1);
      if (F.cel.some(([a, b]) => a === i && b === j + 1)) g.fillRect(x, y + ch - 1, cw - 1, 1);
    }
    const ic = ICONE_SALLE[s.type];
    if (ic && (s.visitee || s.apercue)) { const gx = s.cx - dx0, gy = s.cy - dy0; if (gx >= 0 && gy >= 0 && gx < n && gy < n) { g.fillStyle = '#14101c'; g.fillRect(ox + gx * cw + Math.floor(cw / 2) - 2, oy + gy * ch + Math.floor(ch / 2) - 2, 5, 4); g.fillStyle = ic; g.fillRect(ox + gx * cw + Math.floor(cw / 2) - 1, oy + gy * ch + Math.floor(ch / 2) - 1, 3, 2); } }
  }
}
function dessinerCarteEtendue(g) {
  g.fillStyle = 'rgba(6,4,10,0.93)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
  dessinerMinicarte(g, 320, 180, true);
  Police.ecrire(g, G.etage.cfg.titre + ' — ' + G.etage.cfg.nom, 320, 16, '#e8dcc0', { a: 'c' });
  Police.ecrire(g, 'Code de mission : ' + codeAffiche(G.partie.code) + '   Temps : ' + formatTemps(G.partie.temps), 320, 340, '#8a8098', { a: 'c' });
  const leg = [['Boss', 'boss'], ['Héritage', 'heritage'], ['Échoppe', 'boutique'], ['Secret', 'cache'], ['Épreuve', 'defi'], ['Maudite', 'malediction']];
  leg.forEach(([t, k], i) => { g.fillStyle = ICONE_SALLE[k]; g.fillRect(30, 60 + i * 14, 6, 6); Police.ecrire(g, t, 40, 60 + i * 14, '#c8c0d8'); });
}
