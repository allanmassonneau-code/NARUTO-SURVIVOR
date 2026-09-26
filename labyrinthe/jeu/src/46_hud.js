// ═══════════════════════════════════════════════════════════════════════════
// HUD : santé (haut gauche), actif et charge, ressources, talisman (bas gauche),
// poche (bas droite), minicarte (haut droite), boss (bas centre). Aucun élément
// ne recouvre une porte. Descriptions à deux niveaux (phrase + valeurs).
// ═══════════════════════════════════════════════════════════════════════════

function dessinerHUD(g) {
  const J = G.joueur; if (!J) return;
  // santé
  const S = J.sante; let i = 0;
  const pos = k => [38 + (k % 6) * 9, 5 + Math.floor(k / 6) * 9];
  for (const c of S.cont) { const [x, y] = pos(i++); const set = c.t === 'os' ? ICONES.os : ICONES.vit; g.drawImage(set[c.p], x, y); }
  for (let k = 0; k < S.prot.length; k += 2) { const [x, y] = pos(i++); const t = S.prot[k] === 'n' ? ICONES.noir : ICONES.bleu; g.drawImage(t[k + 1 < S.prot.length ? 2 : 1], x, y); }
  for (let k = 0; k < S.cicatrices; k++) { const [x, y] = pos(i++); g.drawImage(ICONES.cicatrice, x, y); }
  if (S.partiel) { const [x, y] = pos(0); g.drawImage(ICONES.partiel, x + 1, y); }
  if (G.degatsEnnemis >= 2) Police.ecrire(g, '×2', 38 + 6 * 9 + 2, 6, '#ff8a6a'); // rappel : coups d'un cœur entier
  // actif
  g.fillStyle = '#14101c'; g.fillRect(3, 3, 28, 28); g.fillStyle = '#3a3048'; g.fillRect(4, 4, 26, 26);
  if (J.actif) {
    const d = INDEX[J.actif.id]; g.drawImage(iconeObjet(d.id), 7, 7);
    const pret = actifPret(J);
    // jauge : segments de charge (pas des cœurs), ou temps
    g.fillStyle = '#14101c'; g.fillRect(32, 3, 6, 28);
    if (d.recharge) { const k = (J.actif.temps || 0) / d.recharge; g.fillStyle = pret ? '#f0d060' : '#5aa0e0'; g.fillRect(33, 30 - Math.round(26 * k), 4, Math.round(26 * k)); }
    else if (d.unique) { g.fillStyle = '#f0d060'; g.fillRect(33, 4, 4, 26); }
    else { const max = chargesMax(d); const h = 26 / max; for (let k = 0; k < max; k++) { const plein = k < J.actif.charges; g.fillStyle = plein ? (pret ? '#f0d060' : '#5aa0e0') : '#2a2436'; g.fillRect(33, Math.round(30 - (k + 1) * h) + 1, 4, Math.max(1, Math.round(h) - 1)); } if (J.actif.charges > max) { g.fillStyle = '#ff9a4a'; g.fillRect(33, 4, 4, Math.round(26 * (J.actif.charges - max) / max)); } }
    if (pret && Math.floor(G.temps * 3) % 2 === 0) { g.strokeStyle = '#f0d060'; g.lineWidth = 1; g.strokeRect(3.5, 3.5, 27, 27); }
  }
  if (J.actif2) { g.fillStyle = '#14101c'; g.fillRect(40, 23, 14, 14); g.drawImage(iconeObjet(J.actif2.id), 37, 20, 20, 20); }
  // ressources
  const res = [[ICONES.ryo, J.ryo, 0], [ICONES.explosif, J.explosifsDores ? 99 : J.explosifs, 0], [ICONES.cle, J.clesDorees ? 99 : J.cles, 0]];
  res.forEach(([ic, n], k) => { g.drawImage(ic, 5, 40 + k * 12 - (ic.height > 10 ? 2 : 0)); Police.ecrire(g, String(n).padStart(2, '0'), 18, 41 + k * 12, '#f4ecd8'); });
  let yx = 78;
  if (J.def.regleCode === 'controle_chakra') { Police.ecrire(g, 'Force ' + J.force + '/6', 5, yx, '#ff9ac0'); yx += 11; }
  if (J.def.regleCode === 'sceau_centaine') { Police.ecrire(g, 'Sceau ' + J.sceau + '/12', 5, yx, '#ff9ac0'); yx += 11; }
  if (J.def.regleCode === 'clones_ressource') { Police.ecrire(g, 'Clones ' + J.clones + '/4', 5, yx, '#ffc060'); yx += 11; }
  if (J.coeursReserve > 0) { Police.ecrire(g, 'Cœurs ' + J.coeursReserve, 5, yx, '#6ad060'); yx += 11; }
  if (J.def.regleCode === 'trois_marionnettes') { Police.ecrire(g, { karasu: 'Karasu', kuroari: 'Kuroari', sanshouo: 'Sanshōuo' }[J.marionnette || 'karasu'], 5, yx, '#c0a0ff'); yx += 11; }
  if (G.reglages.afficherStats) dessinerStats(g, J, 5, yx + 4);
  // talisman / poche
  if (J.talisman) { g.drawImage(spriteRamassable('talisman', INDEX[J.talisman].couleur), 6, 336); if (J.talisman2) g.drawImage(spriteRamassable('talisman', INDEX[J.talisman2].couleur), 18, 336); }
  if (J.poches.length) {
    const c = J.poches[0]; const s = c.type === 'pilule' ? spriteRamassable('pilule', G.partie.pilules.indexOf(c.id)) : spriteRamassable(INDEX[c.id].famille === 'sceau' ? 'sceau_poche' : 'rouleau', INDEX[c.id].couleur);
    g.drawImage(s, 622 - s.width / 2, 338);
    const nom = c.type === 'pilule' ? nomPilule(c) : INDEX[c.id].nom; Police.ecrire(g, nom, 612, 340, '#d8d0e0', { a: 'd' });
    if (J.poches.length > 1) Police.ecrire(g, '+' + (J.poches.length - 1), 634, 328, '#a0a0b0', { a: 'd' });
  }
  dessinerMinicarte(g, 568, 4, false);
  if (G.etage && G.etage.cfg) Police.ecrire(g, 'Étage ' + G.etage.numero, 600, 60, '#8a8098', { a: 'c' });
  // boss
  const boss = G.ennemis.filter(e => e.boss && !e.mort);
  if (boss.length) {
    const tot = boss.reduce((a, e) => a + e.pv, 0), max = boss.reduce((a, e) => a + e.pvMax, 0); const w = 280, x0 = 320 - w / 2;
    g.fillStyle = '#14101c'; g.fillRect(x0 - 2, 340, w + 4, 8); g.fillStyle = '#5a1a2a'; g.fillRect(x0, 342, w, 4); g.fillStyle = '#e04a4a'; g.fillRect(x0, 342, Math.round(w * tot / max), 4);
    Police.ecrire(g, boss[0].def.nom, 320, 330, '#f0d0d0', { a: 'c' });
  }
  // bannières et panneaux
  if (G.banniere) dessinerBanniere(g);
  if (G.banniereEtage) dessinerBanniereEtage(g);
  if (G.achatPropose) dessinerPanneauAchat(g, G.achatPropose);
  else if (Entrees.enfonce('description') && G.piedestalProche && G.piedestalProche.id) dessinerDescription(g, G.piedestalProche.ramassable ? null : G.piedestalProche.id);
  if (Entrees.enfonce('carte') && !G.transition) dessinerCarteEtendue(g);
  for (const t of G.textes) if (t.ecran) { const k = t.age / t.duree; g.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1; Police.ecrire(g, t.t, 320, 300, t.couleur || '#fff', { a: 'c' }); g.globalAlpha = 1; }
  if (G.flashDegat > 0 && !G.reglages.sansFlash) { g.globalAlpha = G.flashDegat * 0.8; g.fillStyle = '#a0101c'; g.fillRect(0, 0, ECRAN_L, 3); g.fillRect(0, ECRAN_H - 3, ECRAN_L, 3); g.fillRect(0, 0, 3, ECRAN_H); g.fillRect(ECRAN_L - 3, 0, 3, ECRAN_H); g.globalAlpha = 1; }
  if (G.introBoss) dessinerIntroBoss(g);
  if (G.enAnimationObjet && G.reglages.confort) {}
  if (G.fondu) { g.globalAlpha = Math.min(1, G.fondu.t / (G.fondu.duree / 2)); g.fillStyle = '#000'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); g.globalAlpha = 1; }
  if (Entrees.maintien.deposer > 0.15 && (J.talisman || J.poches.length)) { const k = Math.min(1, Entrees.maintien.deposer / DUREE_DEPOT); Police.ecrire(g, 'Déposer…', 320, 250, '#f0e0c0', { a: 'c' }); g.fillStyle = '#14101c'; g.fillRect(290, 262, 60, 4); g.fillStyle = '#f0e0c0'; g.fillRect(290, 262, Math.round(60 * k), 4); }
}
function dessinerStats(g, J, x, y) {
  const S = J.stats; const L = [['Dég', formatNombre(arrondi(S.degats, 2))], ['Cad', formatNombre(arrondi(S.cadence * J.profil.coefCadence, 2))], ['Por', formatNombre(arrondi(S.portee, 1))], ['VTi', formatNombre(arrondi(S.vitesseTir, 1))], ['Vit', formatNombre(arrondi(S.vitesse, 2))], ['Cha', formatNombre(S.chance)]];
  L.forEach(([k, v], i) => { Police.ecrire(g, k, x, y + i * 10, '#8a8098'); Police.ecrire(g, v, x + 22, y + i * 10, '#e8e0f0'); });
}
function dessinerBanniere(g) {
  const B = G.banniere; B.t += 1 / 60; const d = B.mineur ? 1.6 : 2.6; if (B.t > d) { G.banniere = null; return; }
  const a = B.t < 0.15 ? B.t / 0.15 : B.t > d - 0.4 ? (d - B.t) / 0.4 : 1;
  g.globalAlpha = a;
  const y = B.transformation ? 130 : 84; const w = Math.max(Police.largeur(B.nom) * 2, Police.largeur(B.desc || '')) + 24;
  g.fillStyle = 'rgba(12,8,18,0.8)'; g.fillRect(320 - w / 2, y - 6, w, B.desc ? 36 : 24);
  g.fillStyle = B.transformation ? '#f0c040' : B.pilule ? '#a0e0a0' : '#e8dcc0'; g.fillRect(320 - w / 2, y - 6, w, 1); g.fillRect(320 - w / 2, y - 6 + (B.desc ? 35 : 23), w, 1);
  Police.ecrire(g, B.nom, 320, y, B.transformation ? '#ffe080' : '#fff4e0', { a: 'c', e: 2, contour: '#1c1420' });
  if (B.desc) Police.ecrire(g, B.desc, 320, y + 20, '#c8c0d8', { a: 'c' });
  g.globalAlpha = 1;
}
function dessinerBanniereEtage(g) {
  const B = G.banniereEtage; B.t += 1 / 60; const d = 3.2; if (B.t > d) { G.banniereEtage = null; return; }
  const a = B.t < 0.3 ? B.t / 0.3 : B.t > d - 0.6 ? (d - B.t) / 0.6 : 1; g.globalAlpha = a;
  g.fillStyle = 'rgba(8,6,12,0.75)'; g.fillRect(120, 146, 400, 58);
  Police.ecrire(g, B.titre, 320, 152, '#a898b8', { a: 'c' });
  Police.ecrire(g, B.nom, 320, 166, '#f4e8d0', { a: 'c', e: 2, contour: '#1c1420' });
  if (B.desc) Police.ecrire(g, B.desc, 320, 188, '#c0b8a8', { a: 'c' });
  g.globalAlpha = 1;
}
function dessinerIntroBoss(g) {
  const I = G.introBoss; const k = I.t / I.duree; const a = k < 0.15 ? k / 0.15 : k > 0.85 ? (1 - k) / 0.15 : 1;
  g.globalAlpha = a * 0.85; g.fillStyle = '#0a0610'; g.fillRect(0, 130, ECRAN_L, 80); g.globalAlpha = a;
  g.fillStyle = '#a02030'; g.fillRect(0, 130, ECRAN_L, 2); g.fillRect(0, 208, ECRAN_L, 2);
  const x = lerp(-200, 320, Math.min(1, k * 4));
  Police.ecrire(g, I.d.titre || '', x, 146, '#d8a0a0', { a: 'c' });
  Police.ecrire(g, I.d.nom, x, 162, '#fff0e0', { a: 'c', e: 3, contour: '#1c1420' });
  g.globalAlpha = 1;
}
function dessinerPanneauAchat(g, p) {
  const J = G.joueur; const v = peutPayer(p); const nom = p.ramassable ? ({ coeur: 'Cœur de vitalité', cle: 'Clé de sceau', explosif: 'Parchemin explosif', rouleau: 'Rouleau tactique', protection: 'Réserve de chakra', pilule: 'Pilule militaire', condensateur: 'Condensateur de chakra', coeur_double: 'Double cœur' }[p.ramassable]) : INDEX[p.id].nom;
  const L = [nom];
  if (p.prix.type === 'ryo') L.push('Prix : ' + p.prix.n + ' Ryō (vous : ' + J.ryo + ')');
  else { // pacte : résultat exact avant confirmation
    const S = J.sante; const apres = copieSante(S);
    if (v.ryo) L.push('Prix : ' + v.ryo + ' Ryō');
    else if (v.instable) L.push('Prix : ' + v.instable + ' demis de chakra instable');
    else if (v.detail) { if (v.detail.type === 'contenants') { retirerConteneur(apres, p.prix.n); L.push('Prix : ' + p.prix.n + ' contenant(s) de vitalité'); } else { apres.prot.splice(-v.detail.n); L.push('Prix : ' + v.detail.n / 2 + ' réserve(s) de chakra'); } L.push('Après : ' + nbVit(apres) + ' contenant(s), santé ' + santeTotale(apres) / 2 + ' cœur(s)'); if (santeTotale(apres) <= 0) L.push('CE PAIEMENT SERAIT MORTEL'); }
  }
  if (!p.ramassable) L.push(INDEX[p.id].desc);
  L.push(v.ok ? 'Confirmer : ' + Entrees.libelle('interagir') : v.manque);
  const w = Math.max(...L.map(l => Police.largeur(l))) + 16, h = L.length * 11 + 8; const x = borne(Math.round(320 - w / 2), 4, 636 - w), y = 250;
  g.fillStyle = 'rgba(12,8,18,0.88)'; g.fillRect(x, y, w, h); g.fillStyle = p.prix.type === 'pacte' ? '#8a2a4a' : '#8a7a4a'; g.fillRect(x, y, w, 1);
  L.forEach((l, i) => Police.ecrire(g, l, x + 8, y + 5 + i * 11, i === 0 ? '#fff0d0' : l.startsWith('CE PAIEMENT') ? '#ff5050' : i === L.length - 1 ? (v.ok ? '#a0e0a0' : '#ff9a8a') : '#c8c0d8'));
}
function dessinerDescription(g, id) {
  if (!id) return; const d = INDEX[id]; const L = [d.nom, d.desc]; for (const l of detailsObjet(d)) L.push('· ' + l);
  if (d.statut) L.push('[' + d.statut + ']');
  const w = Math.min(420, Math.max(...L.map(l => Police.largeur(l))) + 16); const lignes = []; for (const l of L) lignes.push(...Police.couper(l, w - 16));
  const h = lignes.length * 11 + 8, x = 320 - w / 2, y = 230;
  g.fillStyle = 'rgba(12,8,18,0.9)'; g.fillRect(x, y, w, h); g.fillStyle = '#6a5a8a'; g.fillRect(x, y, w, 1);
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
    if (e.impact) L.push('Impact : ' + ({ explosion: 'explosion', chaine: 'chaîne de foudre', eclat: 'éclatement', mine: 'mine', flamme: 'flammes au sol', flaque: 'flaque', onde: 'onde de choc' }[e.impact]) + (e.coef ? ' (×' + f(e.coef) + ')' : ''));
    if (e.statut) L.push(({ brulure: 'Brûlure', poison: 'Poison', ralenti: 'Ralentissement', immobilise: 'Immobilisation', charme: 'Charme', peur: 'Peur', confus: 'Confusion', gel: 'Gel' }[e.statut]) + ' : ' + Math.round((e.chance || 0) * 100) + ' %' + (e.chanceParChance ? ' + ' + Math.round(e.chanceParChance * 100) + ' % par chance' : '') + (e.max ? ' (max ' + Math.round(e.max * 100) + ' %)' : ''));
    if (e.sante) { const s = e.sante; if (s.cont) L.push('+' + s.cont + ' contenant(s) de vitalité'); if (s.prot) L.push('+' + s.prot / 2 + ' réserve(s) de chakra'); if (s.instable) L.push('+' + s.instable / 2 + ' réserve(s) instable(s)'); if (s.os) L.push('+' + s.os + ' enveloppe(s) osseuse(s)'); if (s.retraitCont) L.push('−' + s.retraitCont + ' contenant(s)'); if (s.cicatrice) L.push('+' + s.cicatrice + ' cicatrice(s) de sceau'); }
    if (e.res) for (const [k, v] of Object.entries(e.res)) L.push('+' + v + ' ' + ({ ryo: 'Ryō', cles: 'clé(s)', explosifs: 'explosif(s)' }[k]));
    if (e.vol) L.push('Lévitation : survole fosses et pièges au sol (pas les murs)');
    if (e.familier) L.push('Familier : ' + ((DON.familiers.find(x => x.id === e.familier) || {}).nom || e.familier));
    if (e.quand) L.push('Déclencheur : ' + e.quand.replace('_', ' ') + (e.chance !== undefined ? ' (' + Math.round(e.chance * 100) + ' %)' : '') + (e.tousLes ? ' tous les ' + e.tousLes : ''));
  }
  if (d.type === 'actif') L.push(d.recharge ? 'Recharge : ' + d.recharge + ' s en combat' : d.unique ? 'Usage unique' : 'Charges : ' + d.charges + ' salle(s)');
  if (d.contrepartie) L.push('Contrepartie : ' + d.contrepartie);
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
  const ox = etendue ? Math.round(320 - 6.5 * cw) : x0, oy = etendue ? Math.round(180 - 6.5 * ch) : y0;
  const dx0 = etendue ? 0 : cx - 3, dy0 = etendue ? 0 : cy - 3;
  if (!etendue) { g.fillStyle = 'rgba(10,8,14,0.55)'; g.fillRect(ox - 2, oy - 2, n * cw + 4, n * ch + 4); }
  if (perdu) { Police.ecrire(g, '?', ox + n * cw / 2, oy + n * ch / 2 - 4, '#8a8098', { a: 'c' }); return; }
  for (const s of Object.values(E.salles)) {
    if (s.id === 'opp' || !(s.visitee || s.apercue)) continue;
    const F = FORMES[s.forme];
    for (const [i, j] of F.cel) {
      const gx = s.cx + i - dx0, gy = s.cy + j - dy0; if (gx < 0 || gy < 0 || gx >= n || gy >= n) continue;
      const x = ox + gx * cw, y = oy + gy * ch;
      g.fillStyle = s === s0 ? '#f0e8f8' : s.visitee ? '#8a8098' : '#4a4258'; g.fillRect(x, y, cw - 1, ch - 1);
      // fusion visuelle des cellules d'une grande salle
      if (F.cel.some(([a, b]) => a === i + 1 && b === j)) g.fillRect(x + cw - 1, y, 1, ch - 1);
      if (F.cel.some(([a, b]) => a === i && b === j + 1)) g.fillRect(x, y + ch - 1, cw - 1, 1);
    }
    const ic = ICONE_SALLE[s.type];
    if (ic && (s.visitee || s.apercue)) { const gx = s.cx - dx0, gy = s.cy - dy0; if (gx >= 0 && gy >= 0 && gx < n && gy < n) { g.fillStyle = '#14101c'; g.fillRect(ox + gx * cw + Math.floor(cw / 2) - 2, oy + gy * ch + Math.floor(ch / 2) - 2, 5, 4); g.fillStyle = ic; g.fillRect(ox + gx * cw + Math.floor(cw / 2) - 1, oy + gy * ch + Math.floor(ch / 2) - 1, 3, 2); } }
  }
}
function dessinerCarteEtendue(g) {
  g.fillStyle = 'rgba(6,4,10,0.82)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
  dessinerMinicarte(g, 0, 0, true);
  Police.ecrire(g, G.etage.cfg.titre + ' — ' + G.etage.cfg.nom, 320, 16, '#e8dcc0', { a: 'c' });
  Police.ecrire(g, 'Code de mission : ' + codeAffiche(G.partie.code) + '   Temps : ' + formatTemps(G.partie.temps), 320, 340, '#8a8098', { a: 'c' });
  const leg = [['Boss', 'boss'], ['Héritage', 'heritage'], ['Échoppe', 'boutique'], ['Secret', 'cache'], ['Épreuve', 'defi'], ['Maudite', 'malediction']];
  leg.forEach(([t, k], i) => { g.fillStyle = ICONE_SALLE[k]; g.fillRect(30, 60 + i * 14, 6, 6); Police.ecrire(g, t, 40, 60 + i * 14, '#c8c0d8'); });
}
