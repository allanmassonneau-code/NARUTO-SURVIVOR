// ═══════════════════════════════════════════════════════════════════════════
// Techniques scellées (actifs) : charges de salle (1 à 12), recharge unique par
// salle, condensateurs, surcharge, actifs temporels (seulement en combat),
// activation non consommée sans cible valable. Poche : rouleaux, sceaux,
// pilules non identifiées (correspondance propre à chaque partie).
// ═══════════════════════════════════════════════════════════════════════════

function chargesMax(d) { return d ? (d.charges || 0) : 0; }
// Talisman porté dans l'un des deux emplacements (le second existe avec « talismanDouble »)
function aTalisman(J, id) { return J.talisman === id || J.talisman2 === id; }
function chargerActif(J, n, source) {
  if (!J.actif) return; const d = INDEX[J.actif.id]; if (!d || d.unique || d.recharge) return;
  const max = chargesMax(d); const plafond = J.drapeaux.surcharge ? max * 2 : max; // la Pile de chakra réduit le coût (chargesRequises), pas le gain
  const av = J.actif.charges; J.actif.charges = Math.min(plafond, J.actif.charges + n);
  if (av < chargesRequises(J) && J.actif.charges >= chargesRequises(J)) { Son.jouer('charge_pleine'); Entrees.vibrer('charge'); }
}
function chargesRequises(J) { const d = INDEX[J.actif.id]; return Math.max(1, chargesMax(d) - (aTalisman(J, 'TAL_003') ? 1 : 0)); }
function majActifTemporel(J, dt) {
  if (!J.actif) return; const d = INDEX[J.actif.id]; if (!d || !d.recharge) return;
  if (!G.salle.combat) return; // pas de recharge par simple attente hors combat
  J.actif.temps = Math.min(d.recharge, (J.actif.temps || 0) + dt);
}
function actifPret(J) {
  if (!J.actif) return false; const d = INDEX[J.actif.id];
  if (d.recharge) return (J.actif.temps || 0) >= d.recharge;
  if (d.unique) return true;
  return J.actif.charges >= chargesRequises(J);
}
function utiliserActif() {
  const J = G.joueur; if (!J.actif || J.etat !== 'normal') return;
  const d = INDEX[J.actif.id];
  if (!actifPret(J)) { Son.jouer('refus'); return; }
  const f = EFFETS_ACTIFS[d.effet]; if (!f) return;
  const ok = f(J, d.params || {}, d);
  if (ok === false) { G.textes.push({ x: J.x, y: J.y - 34, t: 'Aucune cible : charge conservée', age: 0, duree: 1, couleur: '#c0c0d0' }); Son.jouer('refus'); return; }
  if (ok === 'gratuit') { Son.jouer('actif', 0.6); return; } // première étape d'un actif en deux temps : rien n'est dépensé
  if (d.unique) J.actif = null;
  else if (d.recharge) J.actif.temps = 0;
  else { const req = chargesRequises(J); J.actif.charges = Math.max(0, J.actif.charges - req); }
  Son.jouer('actif'); evenement('actif_utilise', { id: d.id });
  Progression.compteur('actifsUtilises', 1);
}
function echangerActifs() {
  const J = G.joueur;
  if (J.deuxActifs && J.actif2) { const t = J.actif; J.actif = J.actif2; J.actif2 = t; Son.jouer('menu'); return; }
  if (J.def.regleCode === 'trois_marionnettes') { changerMarionnette(J); return; }
  if (J.poches.length > 1) { J.poches.push(J.poches.shift()); Son.jouer('menu'); }
}

// ── Effets des actifs ──
const EFFETS_ACTIFS = {
  shunshin(J, P) { // téléportation éclair : glisse le long des murs, nuage qui désoriente au départ
    const dir = Entrees.visee.dir || J.dirTete || J.dirCorps; const [dx, dy] = DIRS[dir]; const x0 = J.x, y0 = J.y, L = (P.portee || 4.5) * TUILE;
    for (let d = 0; d < L; d += 6) deplacerCercle(G.salle, J, dx * 6, dy * 6, J.vol ? 'vol' : 'marche');
    G.effets.push({ type: 'fumee', x: x0, y: y0 - 10, age: 0, duree: 0.6, taille: 2.5 }); G.effets.push({ type: 'fumee', x: J.x, y: J.y - 10, age: 0, duree: 0.3, taille: 1.5 });
    for (const e of G.ennemis) if (!e.mort && dist(e.x, e.y, x0, y0) < 2.2 * TUILE) appliquerStatut(e, 'confus', 2, J.stats.degats);
    J.invuln = Math.max(J.invuln, 0.4); Son.jouer('fumee'); return true;
  },
  preta(J) { // absorbe les projectiles ennemis en vol
    let n = 0; for (const p of G.proj) if (p.proprio === 'ennemi' && !p.mort) { p.mort = true; n++; G.particules.push({ x: p.x, y: p.y - (p.z || 0), vx: (J.x - p.x) * 3, vy: (J.y - 12 - p.y) * 3, age: 0, duree: 0.3, couleur: '#c8b8f0', taille: 2 }); }
    if (!n) return false;
    G.effets.push({ type: 'onde', x: J.x, y: J.y, r: 70, age: 0, duree: 0.35, couleur: '#c8b8f0' }); G.textes.push({ x: J.x, y: J.y - 36, t: 'Absorbé : ' + n, age: 0, duree: 1, couleur: '#c8b8f0' });
    if (n >= 8) { ajouterProtection(J.sante, 2, 'b'); Son.jouer('protection'); } else Son.jouer('vent'); return true;
  },
  clones_explosifs(J, P) { // des clones foncent sur les ennemis et explosent
    const L = G.ennemis.filter(e => !e.mort && !e.cache && !e.allie && !e.statuts.charme && !e.def.ignoreNettoyage).sort((a, b) => dist(a.x, a.y, J.x, J.y) - dist(b.x, b.y, J.x, J.y)); if (!L.length) return false;
    for (let i = 0; i < (P.n || 3); i++) { const c = L[i % L.length], x1 = c.x + (i - 1) * 6, y1 = c.y; G.effets.push({ type: 'clone_course', x: J.x, y: J.y, x0: J.x, y0: J.y, x1, y1, age: 0, duree: 0.32 + i * 0.06 });
      setTimeoutJeu(() => { explosion(x1, y1, 1.3 * TUILE, J.stats.degats * (P.coef || 3.5), { proprio: 'joueur', blesseJoueur: false }); }, 0.32 + i * 0.06); }
    G.effets.push({ type: 'fumee', x: J.x, y: J.y - 10, age: 0, duree: 0.4, taille: 2 }); Son.jouer('fumee'); return true;
  },
  hiraishin(J, P) { // en deux temps : poser la marque, puis s'y téléporter en tranchant la ligne
    const s = G.salle, M = s.marqueHiraishin;
    if (!M) { s.marqueHiraishin = { x: J.x, y: J.y, eff: { type: 'marque_hiraishin', x: J.x, y: J.y, age: 0, duree: 9999 } }; G.effets.push(s.marqueHiraishin.eff); G.textes.push({ x: J.x, y: J.y - 34, t: 'Marque posée', age: 0, duree: 0.8, couleur: '#ffe070' }); return 'gratuit'; }
    const x0 = J.x, y0 = J.y, deg = J.stats.degats * (P.coef || 4);
    for (const e of G.ennemis) { if (e.mort || e.cache) continue; const L2 = dist2(x0, y0, M.x, M.y) || 1, t = borne(((e.x - x0) * (M.x - x0) + (e.y - y0) * (M.y - y0)) / L2, 0, 1); if (dist(e.x, e.y, lerp(x0, M.x, t), lerp(y0, M.y, t)) < e.r + 14) infligerDegats(e, deg, { proprio: 'joueur', type: 'actif', x: e.x, y: e.y }); }
    G.effets.push({ type: 'eclair', x0, y0: y0 - 12, x1: M.x, y1: M.y - 12, age: 0, duree: 0.25 }); J.x = M.x; J.y = M.y; J.invuln = Math.max(J.invuln, 0.4);
    M.eff.age = M.eff.duree; s.marqueHiraishin = null; Son.jouer('eclair'); secousse(4, null); return true;
  },
  pluie_kunai(J, P) { // kunai qui tombent sur les ennemis, cercles annoncés
    const L = G.ennemis.filter(e => !e.mort && !e.cache && !e.allie && !e.statuts.charme); if (!L.length) return false;
    for (let i = 0; i < (P.n || 14); i++) { const c = L[i % L.length], x = c.x + (Math.random() - 0.5) * 26, y = c.y + (Math.random() - 0.5) * 18, r = 16, deg = J.stats.degats * (P.coef || 1.6);
      setTimeoutJeu(() => { G.effets.push({ type: 'marque_sol', x, y, r, age: 0, duree: 0.35 }); setTimeoutJeu(() => { for (const e of G.ennemis) if (!e.mort && !e.cache && dist(e.x, e.y, x, y) < r + e.r) infligerDegats(e, deg, { proprio: 'joueur', type: 'actif', x, y }); G.effets.push({ type: 'impact_sol', x, y, r: 10, age: 0, duree: 0.25 }); }, 0.35); }, i * 0.07); }
    Son.jouer('lame'); return true;
  },
  susanoo(J, P) { J.susanoo = { t: P.duree || 5, a: Math.atan2(DIRS[J.dirTete || 'bas'][1], DIRS[J.dirTete || 'bas'][0]), coef: P.coef || 6 }; Son.jouer('gong', 0.5); return true; },
  reecriture(J) { return relancerPiedestaux(G.salle) > 0 ? true : false; },
  clones(J, P) { for (let i = 0; i < (P.n || 2); i++) ajouterFamilier(J, 'FAM_CLONE_TEMP', 'ACT_002'); G.effets.push({ type: 'fumee', x: J.x, y: J.y - 10, age: 0, duree: 0.5, taille: 2 }); Son.jouer('fumee'); return true; },
  dash(J, P) {
    const dir = Entrees.visee.dir || J.dirTete || J.dirCorps; const [dx, dy] = DIRS[dir];
    J.dash = { dx, dy, t: 0, duree: P.duree || 0.22, dist: (P.portee || 4) * TUILE, deg: J.stats.degats * (P.coef || 6), touches: new Set(), type: P.visuel || 'foudre' };
    J.invuln = Math.max(J.invuln, (P.duree || 0.22) + 0.15); Son.jouer(P.visuel === 'vrille' ? 'vent' : 'eclair'); return true;
  },
  okasho(J, P) {
    const r = 2.5 * TUILE; const deg = (P.base || 12) + 4 * J.force; J.force = 0;
    G.effets.push({ type: 'onde', x: J.x, y: J.y, r, age: 0, duree: 0.35, couleur: '#ff9ac0' }); secousse(8, null);
    for (const e of G.ennemis) if (!e.mort && !e.cache && dist(e.x, e.y, J.x, J.y) < r + e.r) infligerDegats(e, deg, { proprio: 'joueur', x: e.x, y: e.y, vx: e.x - J.x, vy: e.y - J.y, recul: 4 * TUILE, type: 'okasho' });
    exploserDecor(J.x, J.y, r * 0.8); Son.jouer('explosion'); return true;
  },
  immobiliser_tous(J, P) {
    const cibles = G.ennemis.filter(e => !e.mort && !e.cache); if (!cibles.length) return false;
    for (const e of cibles) { appliquerStatut(e, 'immobilise', P.duree || 3, 0); infligerDegats(e, J.stats.degats * (P.coef || 2), { proprio: 'joueur', type: 'actif', sansRecul: true }); G.effets.push({ type: P.visuel || 'chiens', x: e.x, y: e.y, age: 0, duree: P.duree || 3 }); }
    Son.jouer('invocation'); return true;
  },
  bonus(J, P) { for (const b of [].concat(P.bonus)) ajouterBonus(J, Object.assign({}, b, { duree: P.duree || 8, source: P.nom })); G.effets.push({ type: P.visuel || 'aura_verte', x: J.x, y: J.y, age: 0, duree: P.duree || 8, attache: true }); return true; },
  kaiten(J, P) { J.kaiten = { t: 0, duree: P.duree || 1.2, deg: J.stats.degats * (P.coef || 6), prochain: 0 }; J.invuln = Math.max(J.invuln, (P.duree || 1.2)); Son.jouer('vent'); return true; },
  ombres(J, P) {
    const c = G.ennemis.filter(e => !e.mort && !e.cache).sort((a, b) => dist(a.x, a.y, J.x, J.y) - dist(b.x, b.y, J.x, J.y)).slice(0, P.n || 3);
    if (!c.length) return false;
    for (const e of c) { appliquerStatut(e, 'immobilise', P.duree || 4, 0); G.effets.push({ type: 'lien_ombre', x0: J.x, y0: J.y, cible: e, age: 0, duree: Math.min(4, P.duree || 4) }); }
    Son.jouer('sceau'); return true;
  },
  frappe_cible(J, P) {
    const c = ennemiLePlusProche(J.x, J.y, 9999, e => !(P.nonBoss && e.boss)); if (!c) return false;
    G.effets.push({ type: P.visuel || 'cercueil', cible: c, x: c.x, y: c.y, age: 0, duree: P.delai || 0.5 });
    setTimeoutJeu(() => { if (!c.mort) { if (P.capture && !c.boss) appliquerStatut(c, 'immobilise', P.capture, 0); infligerDegats(c, J.stats.degats * (c.boss ? (P.coefBoss || P.coef * 0.6) : P.coef), { proprio: 'joueur', type: 'actif', sansRecul: true }); Son.jouer(P.son || 'sable'); } }, P.delai || 0.5);
    return true;
  },
  anneau_projectiles(J, P) {
    for (let i = 0; i < (P.n || 16); i++) { const a = i * Math.PI * 2 / (P.n || 16); const p = creerProjectileJoueur(J, J.x, J.y - 10, a, J.stats.degats * (P.coef || 2), ++_cycle, { n: 4 }); p.statuts = p.statuts.concat(P.statut ? [{ statut: P.statut, chance: 1 }] : []); p.apparence = P.apparence || p.apparence; }
    Son.jouer('tir'); return true;
  },
  attirer(J, P) {
    for (const r of G.salle.ramassables) if (RAMASSABLES[r.type].cat !== 'coffre') { r.vx = (J.x - r.x) * 3; r.vy = (J.y - r.y) * 3; }
    for (const e of G.ennemis) if (!e.mort && !e.cache && dist(e.x, e.y, J.x, J.y) < 3 * TUILE) infligerDegats(e, J.stats.degats * 3, { proprio: 'joueur', type: 'actif' });
    G.effets.push({ type: 'fils', x: J.x, y: J.y, age: 0, duree: 0.5 }); Son.jouer('vent'); return true;
  },
  substitution(J, P) { J.intangible = true; J.invuln = P.duree || 3; G.appat = { x: J.x, y: J.y, fini: false }; G.effets.push({ type: 'buche', x: J.x, y: J.y, age: 0, duree: P.duree || 3 }); setTimeoutJeu(() => { J.intangible = false; if (G.appat) G.appat.fini = true; }, P.duree || 3); Son.jouer('fumee'); return true; },
  gamabunta(J, P) {
    G.effets.push({ type: 'ombre_geante', x: J.x, y: J.y - 60, age: 0, duree: 0.7 });
    setTimeoutJeu(() => { G.effets.push({ type: 'crapaud_geant', x: J.x, y: J.y - 60, age: 0, duree: 0.9 }); secousse(12, null); Son.jouer('explosion'); Son.jouer('pas_lourd');
      for (const e of G.ennemis) if (!e.mort && !e.cache) infligerDegats(e, e.boss ? 25 : 40, { proprio: 'joueur', type: 'actif' });
      for (let ty = 1; ty < G.salle.H - 1; ty++) for (let tx = 1; tx < G.salle.W - 1; tx++) if (PROP[tuileA(G.salle, tx, ty)].explosable && tuileA(G.salle, tx, ty) !== T.ROCHER_SCEAU) detruireTuile(G.salle, tx, ty, 'actif'); }, 0.7);
    return true;
  },
  statut_tous(J, P) { const c = G.ennemis.filter(e => !e.mort && !e.cache); if (!c.length) return false; for (const e of c) { appliquerStatut(e, P.statut, P.duree || 3, J.stats.degats * (P.coef || 2)); } G.effets.push({ type: P.visuel || 'flammes_noires', x: J.x, y: J.y, age: 0, duree: 0.6 }); Son.jouer(P.son || 'feu'); return true; },
  tsukuyomi(J, P) { G.gelGlobal = P.duree || 4; for (const e of G.ennemis) if (e.boss) appliquerStatut(e, 'immobilise', 1.5, 0); for (const p of G.proj) if (p.proprio === 'ennemi') p.gele = P.duree || 4; G.effets.push({ type: 'tsukuyomi', age: 0, duree: 0.8 }); Son.jouer('gong'); return true; },
  repousser(J, P) {
    for (const p of G.proj) if (p.proprio === 'ennemi') detruireProjectile(p, 'devie');
    for (const e of G.ennemis) if (!e.mort && !e.cache) { const [nx, ny] = normaliser(e.x - J.x, e.y - J.y); e.vx += nx * 700; e.vy += ny * 700; infligerDegats(e, J.stats.degats * (P.coef || 3), { proprio: 'joueur', type: 'actif', sansRecul: true }); }
    G.effets.push({ type: 'onde', x: J.x, y: J.y, r: 400, age: 0, duree: 0.4, couleur: '#e0e0ff' }); secousse(8, null); Son.jouer('explosion'); return true;
  },
  attraction(J, P) {
    const [cx, cy] = centreSalle(G.salle); const c = G.ennemis.filter(e => !e.mort && !e.cache); if (!c.length) return false;
    G.attraction = { x: cx, y: cy, t: 0, duree: 0.8, deg: J.stats.degats * (P.coef || 5) }; G.effets.push({ type: 'sphere_noire', x: cx, y: cy, age: 0, duree: 1.1 }); Son.jouer('vent'); return true;
  },
  kamui(J, P) { J.intangible = true; J.bloqueTir = P.duree || 3; J.kamui = P.duree || 3; setTimeoutJeu(() => { J.intangible = false; J.kamui = 0; }, P.duree || 3); G.effets.push({ type: 'spirale', x: J.x, y: J.y - 12, age: 0, duree: 0.6 }); Son.jouer('vent'); return true; },
  teleport(J, P) {
    const E = G.etage; const cand = Object.values(E.salles).filter(s => s.id !== G.salle.id && (P.cible ? s.type === P.cible : s.visitee) && s.id !== 'opp');
    if (!cand.length) return false; const s = cand[Math.floor(Math.random() * cand.length)];
    demarrerTransition(null, s.id, 'teleport'); return true;
  },
  rasenshuriken(J, P) {
    const dir = Entrees.visee.dir || J.dirTete; const a = Math.atan2(DIRS[dir][1], DIRS[dir][0]);
    const p = creerProjectileJoueur(J, J.x, J.y - 12, a, J.stats.degats * 2, ++_cycle, { n: 10 }); p.perce = 99; p.taille = 3; p.apparence = 'rasenshuriken'; p.spectral = true; p.vitesse *= 0.6; p.vx *= 0.6; p.vy *= 0.6; p.dureeVie = 1.2; p.rTouche = 14;
    p.impacts = [{ impact: 'explosion', r: 2, coef: 7.5 }]; Son.jouer('vent'); return true;
  },
  dragons(J, P) { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const p = creerProjectileJoueur(J, J.x, J.y - 12, a, J.stats.degats * 4, ++_cycle, { n: 4 }); p.traj.guidage = 2; p.apparence = 'dragon_feu'; p.statuts = [{ statut: 'brulure', chance: 1 }]; p.dureeVie = 2; p.taille = 1.6; } Son.jouer('feu'); return true; },
  racines(J, P) { const c = G.ennemis.filter(e => !e.mort && !e.cache); if (!c.length) return false; for (const e of c) { appliquerStatut(e, 'immobilise', 2.5, 0); for (let k = 0; k < 3; k++) setTimeoutJeu(() => !e.mort && infligerDegats(e, J.stats.degats * 2, { proprio: 'joueur', type: 'actif', sansRecul: true }), k * 0.5 + 0.3); G.effets.push({ type: 'racines', x: e.x, y: e.y, age: 0, duree: 2.5 }); } Son.jouer('rocher'); return true; },
  scellement(J, P) { const c = ennemiLePlusProche(J.x, J.y, 9999); if (!c) return false; G.effets.push({ type: 'sceau_scellement', x: c.x, y: c.y, age: 0, duree: 0.6 }); if (c.boss) infligerDegats(c, c.pvMax * 0.15, { proprio: 'joueur', type: 'actif', sansRecul: true }); else tuerEnnemi(c, { type: 'scellement' }); Son.jouer('sceau'); return true; },
  familier_temporaire(J, P) { const ids = ['FAM_GAMAKICHI', 'FAM_CORBEAU', 'FAM_SERPENT', 'FAM_OISEAU_ARGILE', 'FAM_INSECTES', 'FAM_TIGRE_ENCRE']; const f = ajouterFamilier(J, ids[Math.floor(Math.random() * ids.length)], 'ACT_028'); f.etage = G.etage.numero; return true; },
  charme(J, P) { const c = ennemiLePlusProche(J.x, J.y, 9999, e => !e.boss); if (!c) return false; c.allie = true; c.statuts.charme = { t: 9999 }; G.effets.push({ type: 'coeur_charme', x: c.x, y: c.y - 20, age: 0, duree: 0.8 }); Son.jouer('sceau'); return true; },
  lotus(J, P) { const c = ennemiLePlusProche(J.x, J.y, 3.5 * TUILE); if (!c) return false; infligerDegats(c, J.stats.degats * 12, { proprio: 'joueur', type: 'lotus', vx: 0, vy: -1, recul: 0 }); G.effets.push({ type: 'lotus', x: c.x, y: c.y, age: 0, duree: 0.6 }); if (santeTotale(J.sante) > 1) payerSante(1, 'lotus'); secousse(6, null); Son.jouer('explosion'); return true; },
  permutation(J) { if (!J.passifs.length) return false; permuterPassifs(J); G.effets.push({ type: 'reecriture', x: J.x, y: J.y - 16, age: 0, duree: 0.6 }); Son.jouer('transformation'); return true; },
  ralentir_tous(J, P) { const c = G.ennemis.filter(e => !e.mort); if (!c.length) return false; for (const e of c) appliquerStatut(e, 'ralenti', P.duree || 6, 0); G.effets.push({ type: 'horloge', age: 0, duree: 0.6 }); Son.jouer('gong', 0.4); return true; },
  relais(J, P) { if (J.clones <= 0) return false; J.clones--; majClonesRessource(J); explosion(J.x, J.y, 2 * TUILE, J.stats.degats * 5, { proprio: 'joueur', blesseJoueur: false }); return true; },
};

// Tiret (Chidori, Crocs sur crocs) — mis à jour chaque pas
function majDash(J, dt) {
  const D = J.dash; if (!D) return;
  D.t += dt; const v = D.dist / D.duree; const s = G.salle;
  const r = deplacerCercle(s, J, D.dx * v * dt, D.dy * v * dt, J.vol ? 'vol' : 'marche');
  G.particules.push({ x: J.x, y: J.y - 10, vx: 0, vy: 0, age: 0, duree: 0.2, couleur: D.type === 'foudre' ? '#a8d8ff' : '#c8c0b0', taille: 3 });
  for (const e of G.ennemis) if (!e.mort && !e.cache && !D.touches.has(e) && dist(e.x, e.y, J.x, J.y) < e.r + 14) { D.touches.add(e); infligerDegats(e, D.deg, { proprio: 'joueur', x: e.x, y: e.y, vx: D.dx, vy: D.dy, recul: 60, type: 'dash' }); }
  if (D.t >= D.duree || r.bloqueX || r.bloqueY) {
    if (D.type === 'vrille' && !D.retour) { D.retour = true; D.t = 0; D.dx = -D.dx; D.dy = -D.dy; D.touches.clear(); return; }
    J.dash = null; J.vx = 0; J.vy = 0;
  }
}
function majKaiten(J, dt) {
  const K = J.kaiten; if (!K) return; K.t += dt; K.prochain -= dt;
  for (const p of G.proj) if (p.proprio === 'ennemi' && dist(p.x, p.y, J.x, J.y - 10) < 1.8 * TUILE) detruireProjectile(p, 'devie');
  if (K.prochain <= 0) { K.prochain = 0.2; for (const e of G.ennemis) if (!e.mort && !e.cache && dist(e.x, e.y, J.x, J.y) < 1.8 * TUILE + e.r) infligerDegats(e, K.deg / 6, { proprio: 'joueur', x: e.x, y: e.y, vx: e.x - J.x, vy: e.y - J.y, recul: 3 * TUILE, type: 'kaiten' }); }
  J.dirTete = ['bas', 'gauche', 'haut', 'droite'][Math.floor(K.t * 16) % 4];
  if (K.t >= K.duree) J.kaiten = null;
}
function majAttraction(dt) {
  const A = G.attraction; if (!A) return; A.t += dt;
  for (const e of G.ennemis) if (!e.mort && !e.boss) { e.x = lerp(e.x, A.x, 4 * dt); e.y = lerp(e.y, A.y, 4 * dt); }
  if (A.t >= A.duree) { for (const e of G.ennemis) if (!e.mort && dist(e.x, e.y, A.x, A.y) < 3 * TUILE) infligerDegats(e, A.deg, { proprio: 'joueur', type: 'actif' }); secousse(6, null); Son.jouer('explosion'); G.attraction = null; }
}

// ── Poche : rouleaux, sceaux, pilules ──
function utiliserPoche() {
  const J = G.joueur; if (!J.poches.length || J.etat !== 'normal') return;
  const c = J.poches[0]; const d = INDEX[c.id]; if (!d) { J.poches.shift(); return; }
  let garder = false;
  if (c.type === 'pilule') { garder = !!prendrePilule(J, c); }
  else { const f = EFFETS_CONSOMMABLES[d.effet]; if (f) { const r = f(J, d.params || {}); if (r === false) { Son.jouer('refus'); return; } } Son.jouer('sceau'); annoncer({ t: 0, nom: d.nom, desc: d.desc, mineur: true }); }
  if (aTalisman(J, 'TAL_031') && Math.random() < 0.15) garder = true;
  if (!garder) J.poches.shift();
  evenement('consommable_utilise', { id: c.id });
}
const EFFETS_CONSOMMABLES = {
  teleport(J, P) { return EFFETS_ACTIFS.teleport(J, P); },
  bonus_salle(J, P) { ajouterBonus(J, Object.assign({ duree: 'salle' }, P.bonus)); return true; },
  bonus_temps(J, P) { ajouterBonus(J, Object.assign({ duree: P.duree || 6 }, P.bonus)); if (P.invuln) J.invuln = Math.max(J.invuln, P.duree || 6); return true; },
  ressources(J, P) { for (const [k, v] of Object.entries(P.res || {})) ajouterRessource(J, k, v); if (P.soin) soignerJoueur(J, P.soin); if (P.prot) ajouterProtection(J.sante, P.prot); Son.jouer('ryo'); return true; },
  poser(J, P) { for (const t of P.types) creerRamassable(t, J.x + (Math.random() - 0.5) * 30, J.y + 20, {}); return true; },
  degats_tous(J, P) { for (const e of G.ennemis) if (!e.mort && !e.cache) infligerDegats(e, P.degats || 40, { proprio: 'joueur', type: 'rouleau' }); G.effets.push({ type: 'onde', x: J.x, y: J.y, r: 400, age: 0, duree: 0.4, couleur: '#ffffff' }); return true; },
  explosions(J, P) { const s = G.salle; for (let i = 0; i < (P.n || 6); i++) setTimeoutJeu(() => { const [tx, ty] = [1 + Math.floor(Math.random() * (s.W - 2)), 1 + Math.floor(Math.random() * (s.H - 2))]; const [x, y] = centreTuile(tx, ty); explosion(x, y, 1.4 * TUILE, 20, { proprio: 'joueur', blesseJoueur: false }); }, i * 0.2); return true; },
  reveler(J, P) { for (const s of Object.values(G.etage.salles)) { if (s.id === 'opp') continue; if (P.secrets || (s.type !== 'cache' && s.type !== 'isolee')) s.apercue = true; if (P.secrets) for (const p of s.portes) if (p.etat === 'secrete') p.indice = true; } if (P.soin) soignerJoueur(J, 24); if (P.degats) for (const e of G.ennemis) infligerDegats(e, P.degats, { proprio: 'joueur', type: 'rouleau' }); Son.jouer('secret'); return true; },
  machine(J, P) { G.salle.machines.push({ x: J.x, y: J.y - 40, type: P.type, usages: 0, uid: Math.random() }); G.effets.push({ type: 'fumee', x: J.x, y: J.y - 40, age: 0, duree: 0.5 }); return true; },
  pnj(J, P) { G.salle.pnj.push({ x: J.x, y: J.y - 40, type: P.type || 'voyageur', paye: 0, uid: Math.random() }); return true; },
  detruire_obstacles(J) { const s = G.salle; for (let ty = 1; ty < s.H - 1; ty++) for (let tx = 1; tx < s.W - 1; tx++) if (PROP[tuileA(s, tx, ty)].explosable) detruireTuile(s, tx, ty, 'sceau'); for (const p of s.portes) if (p.etat === 'secrete') revelerPorteSecrete(s, p); secousse(6, null); return true; },
  relancer(J) { return relancerPiedestaux(G.salle) > 0 ? true : false; },
  dupliquer(J) { const L = G.salle.ramassables.filter(r => !RAMASSABLES[r.type].cat.startsWith('coffre') && RAMASSABLES[r.type].cat !== 'coffre'); if (!L.length) return false; for (const r of L) creerRamassable(r.type, r.x + 8, r.y + 4, { id: r.id }); return true; },
  clones(J, P) { for (let i = 0; i < (P.n || 3); i++) ajouterFamilier(J, 'FAM_CLONE_TEMP', 'CON'); return true; },
  permutation(J) { return EFFETS_ACTIFS.permutation(J); },
  passage(J) { const s = G.salle; s.sorties = s.sorties || []; s.sorties.push({ type: 'etage', x: J.x, y: J.y + 30 }); Son.jouer('porte_ouvre'); return true; },
  immobiliser(J, P) { return EFFETS_ACTIFS.immobiliser_tous(J, { duree: P.duree || 4, coef: 0, visuel: 'lien_ombre_zone' }); },
};

// Pilules : apparence → effet (graine de partie) ; identification à l'usage
function nomPilule(c) { const P = G.partie; const k = P.pilules.indexOf(c.id); const id = P.pilulesIdentifiees.includes(c.id) || aTalisman(G.joueur, 'TAL_014'); return id ? INDEX[c.id].nom : 'Pilule inconnue (' + (APPARENCES_PILULES[k] || {}).nom + ')'; }
const APPARENCES_PILULES = [
  { nom: 'blanche', a: '#f0f0f0', b: '#f0f0f0' }, { nom: 'rouge', a: '#d83a3a', b: '#d83a3a' }, { nom: 'verte', a: '#4ab04a', b: '#4ab04a' }, { nom: 'jaune', a: '#e8c83a', b: '#e8c83a' },
  { nom: 'bleue', a: '#3a6ad8', b: '#3a6ad8' }, { nom: 'noire', a: '#2a2a30', b: '#2a2a30' }, { nom: 'rouge et blanche', a: '#d83a3a', b: '#f0f0f0' }, { nom: 'verte et jaune', a: '#4ab04a', b: '#e8c83a' },
  { nom: 'bleue et blanche', a: '#3a6ad8', b: '#f0f0f0' }, { nom: 'noire et rouge', a: '#2a2a30', b: '#d83a3a' }, { nom: 'violette', a: '#8a4ac8', b: '#8a4ac8' }, { nom: 'orange', a: '#e8883a', b: '#e8883a' },
  { nom: 'rose et verte', a: '#e89ac0', b: '#4ab04a' }, { nom: 'grise tachetée', a: '#8a8a90', b: '#5a5a60' }, { nom: 'dorée', a: '#f0c850', b: '#c89a30' },
];
function prendrePilule(J, c) {
  const P = G.partie; let d = INDEX[c.id];
  if (aTalisman(J, 'TAL_014') && d.negatif && d.contraire) d = INDEX[d.contraire]; // neutralisation par objet
  if (!P.pilulesIdentifiees.includes(c.id)) P.pilulesIdentifiees.push(c.id);
  const E = d.effet;
  if (E.s) { J.bonusPermanents.push({ s: E.s, a: E.a }); recalculer(J); }
  if (E.soinTotal) soignerJoueur(J, 24);
  if (E.recharge && J.actif) chargerActif(J, 99, 'pilule');
  if (E.prix) { if (santeTotale(J.sante) > 1) payerSante(1, 'pilule'); }
  if (E.reveler) EFFETS_CONSOMMABLES.reveler(J, {});
  if (E.oubli) for (const s of Object.values(G.etage.salles)) if (!s.visitee) s.apercue = false;
  if (E.volcan) for (let i = 0; i < 3; i++) setTimeoutJeu(() => { const a = Math.random() * Math.PI * 2; explosion(J.x + Math.cos(a) * 40, J.y + Math.sin(a) * 30, 1.3 * TUILE, 25, { proprio: 'joueur', blesseJoueur: false }); }, 0.2 + i * 0.25);
  annoncer({ t: 0, nom: d.nom, desc: d.desc, mineur: true, pilule: true });
  Son.jouer('pilule'); Progression.decouvrir(d.id);
  return false;
}

// Rempart de Susanoo (actif) : arrête les tirs venus de face, puis un sabre géant balaie devant vous
function majSusanooJoueur(J, dt) {
  const S = J.susanoo; if (!S) return;
  const vis = Entrees.visee.dir; if (vis) S.a += borne(diffAngle(S.a, Math.atan2(DIRS[vis][1], DIRS[vis][0])), -4 * dt, 4 * dt);
  for (const p of G.proj) if (p.proprio === 'ennemi' && !p.mort && dist(p.x, p.y, J.x, J.y - 10) < 34 && Math.abs(diffAngle(S.a, angleVers(J.x, J.y - 10, p.x, p.y))) < Math.PI / 3) { p.mort = true; G.effets.push({ type: 'etincelle', x: p.x, y: p.y, age: 0, duree: 0.15 }); }
  S.t -= dt;
  if (S.t <= 0) { J.susanoo = null; const r = 3.2 * TUILE, deg = J.stats.degats * S.coef;
    for (const e of G.ennemis) if (!e.mort && !e.cache && dist(e.x, e.y, J.x, J.y) < r + e.r && Math.abs(diffAngle(S.a, angleVers(J.x, J.y, e.x, e.y))) < 1.3) infligerDegats(e, deg, { proprio: 'joueur', type: 'actif', x: J.x, y: J.y });
    G.effets.push({ type: 'balayage', x: J.x, y: J.y - 8, a: S.a, arc: 2.6, r, age: 0, duree: 0.3 }); Son.jouer('lame'); secousse(6, S.a); }
}
