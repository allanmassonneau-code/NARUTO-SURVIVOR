// ═══════════════════════════════════════════════════════════════════════════
// Boss : cadre commun (intro, choix d'attaque sans répétition, télégraphe,
// phase active, récupération vulnérable, phases à seuils de PV) et mécaniques
// signatures. Chaque attaque : zone, préparation, durée active, récupération,
// dégâts, déplacement, réponse attendue. Les phases invulnérables sont courtes
// et visibles ; aucune réduction de dégâts adaptative cachée.
// ═══════════════════════════════════════════════════════════════════════════

function creerBoss(id, x, y, o = {}) {
  const d = INDEX[id];
  const e = creerEnnemi(id, x, y, Object.assign({ pvMult: o.pvMult || 1 }, o));
  e.boss = true; e.apparition = o.sansIntro ? 0.3 : 1.2; e.phase = 0; e.etatB = 'choix'; e.tB = 1.0; e.derniere = null; e.lies = []; e.contact = d.contact ?? G.degatsContact;
  if (d.init && INIT_BOSS[d.init]) INIT_BOSS[d.init](e);
  G.bossActifs = G.ennemis.filter(x => x.boss);
  return e;
}
function lancerBoss(s) {
  const [cx, cy] = centreSalle(s); const id = s.bossDef; const d = INDEX[id];
  const e = creerBoss(id, cx, cy - 40);
  if (s.bossPvRestant) { e.pv = e.pvMax * s.bossPvRestant[0]; } // pas d'effacement gratuit d'une phase
  G.introBoss = { t: 0, duree: G.reglages.confort ? 1.0 : 1.6, d };
  const th = INDEX[G.theme]; Musique.jouerPiste('boss_' + id, Object.assign({}, th.musique, { tempo: (th.musique.tempo || 90) + 22, boss: true, intensite: 1.3, gamme: 'sombre' }));
  Musique.etatCombat(true);
  if (G.etage.numero === 8) G.partie.tempsEntreeBoss = G.partie.temps;
}
function majBoss(e, dt) {
  const d = e.def; const J = G.joueur;
  if (G.introBoss) { e.vx = 0; e.vy = 0; return; }
  if (e.statuts.immobilise || G.gelGlobal > 0) { e.vx *= 0.5; e.vy *= 0.5; return; }
  e.tB -= dt;
  const IAB = IA_BOSS[d.ia] || IA_BOSS.generique;
  IAB(e, dt, d);
}
function majPhaseBoss(e) {
  const d = e.def; if (!d.phases) return;
  const k = e.pv / e.pvMax;
  while (e.phase < d.phases.length && k <= d.phases[e.phase].seuil) {
    const ph = d.phases[e.phase]; e.phase++;
    if (ph.message) G.textes.push({ x: e.x, y: e.y - 50, t: ph.message, age: 0, duree: 1.6, couleur: '#ffd0a0' });
    if (ph.invulnerable) { e.invulnerable = true; setTimeoutJeu(() => { e.invulnerable = false; }, ph.invulnerable); } // courte et visible
    if (ph.action && ACTIONS_PHASE[ph.action]) ACTIONS_PHASE[ph.action](e, ph);
    Son.jouer('gong', 0.6); secousse(5, null);
  }
}
function mortBoss(e) {
  G.effets.push({ type: 'mort_boss', x: e.x, y: e.y - 12, age: 0, duree: 1.2 });
  Son.jouer('boss_mort'); secousse(10, null); Entrees.vibrer('boss');
  for (const f of G.ennemis) if (f.parent === e.uid || e.lies.includes(f)) { if (!f.mort) { f.mort = true; G.effets.push({ type: 'fumee', x: f.x, y: f.y, age: 0, duree: 0.5 }); } }
  // boss liés (duo, trio) : la salle se termine quand tous sont vaincus
  if (G.ennemis.some(x => x.boss && !x.mort && x !== e)) { evenement('elimination', { e }); return; }
  const s = G.salle; G.partie.bossVaincus.push(e.id); Progression.bossVaincu(e.id);
  evenement('elimination', { e }); evenement('boss_vaincu', { id: e.id });
  if (s.type === 'boss') {
    s.bossVaincu = true; const [cx, cy] = centreSalle(s);
    // récompense : transmission de chakra (pool boss) + soin mesuré
    if (!s.recompenseBoss) {
      s.recompenseBoss = true;
      const tx = centreTuile(...tuileLibreProche(s, cx, cy - 40))[0];
      poserPiedestal(s, tx, cy - 40, tirerObjet(G.partie, 'boss', G.alea.butin), { pool: 'boss' });
      creerRamassable(G.alea.recomp.chance(0.5) ? 'coeur' : 'protection', cx - 30, cy + 20, {});
      if (G.joueur.def.regleCode === 'avarice') creerRamassable('ryo5', cx + 30, cy + 20, {});
      poserSortiesBoss(s);
      const opp = tirerOpportunite(); if (opp) ouvrirOpportunite(opp);
      G.partie.opportunitePrecedente = !!opp;
      Musique.jouerPiste(G.theme, INDEX[G.theme].musique);
    }
  } else if (s.type === 'pacte' || s.type === 'sanctuaire') { // gardien de statue
    const [cx, cy] = [e.x, e.y];
    if (s.type === 'sanctuaire') { poserPiedestal(s, cx, cy, G.partie.fragments >= 1 ? 'PSV_900' : 'PSV_901', {}); G.partie.fragments++; }
    else poserPiedestal(s, cx, cy, tirerObjet(G.partie, 'pacte', G.alea.butin), { pool: 'pacte' });
  }
  if (G.conseil) conseilSuivant();
}

// ── Utilitaires d'attaque ──
function ciblerJoueur(e) { const J = G.joueur; return angleVers(e.x, e.y - e.hauteur, J.x, J.y - 8); }
function anneauBoss(e, n, v, o = {}) { const off = o.decalage ?? Math.random() * Math.PI; const trou = o.trou; for (let i = 0; i < n; i++) { if (trou !== undefined && Math.abs(i - trou) < (o.largeurTrou || 1)) continue; tirEnnemi(e.x, e.y - e.hauteur, off + i * Math.PI * 2 / n, v, Object.assign({ source: e.id }, o.proj || {})); } Son.jouer('tir_ennemi'); }
function salveBoss(e, n, v, ecart, o = {}) { const a = ciblerJoueur(e); for (let i = 0; i < n; i++) tirEnnemi(e.x, e.y - e.hauteur, a + (i - (n - 1) / 2) * ecart, v, Object.assign({ source: e.id }, o)); Son.jouer('tir_ennemi'); }
function allerVersPoint(e, x, y, v, dt) { const d = dist(e.x, e.y, x, y); if (d < 4) { e.vx *= 0.7; e.vy *= 0.7; return true; } const [dx, dy] = normaliser(x - e.x, y - e.y); deplacerEnnemi(e, dx, dy, v * TUILE, dt, 6); return false; }
function pointAleatoire(s, marge = 2) { const [cx, cy] = centreSalle(s); for (let k = 0; k < 20; k++) { const x = cx + (Math.random() - 0.5) * (CEL_L - marge * 2) * TUILE, y = cy + (Math.random() - 0.5) * (CEL_H - marge) * TUILE; if (tuileLibre(s, Math.floor(x / TUILE), Math.floor(y / TUILE))) return [x, y]; } return [cx, cy]; }
function choisirAttaque(e, liste) {
  const L = liste.filter(a => (!a.phase || e.phase >= a.phase) && (!a.maxPhase || e.phase < a.maxPhase) && a.id !== e.derniere);
  const a = (G.alea.combat || new Alea(1)).pondere(L.length ? L : liste, x => x.poids || 1); e.derniere = a.id; return a;
}
function ligneDanger(x0, y0, a, l, largeur, duree) { G.effets.push({ type: 'ligne_danger', x: x0, y: y0, a, l, largeur, age: 0, duree }); }
function cercleDanger(x, y, r, duree) { G.effets.push({ type: 'cercle_danger', x, y, r, age: 0, duree }); }
function frappeSolEnnemie(x, y, r, delai, o = {}) { cercleDanger(x, y, r, delai); setTimeoutJeu(() => { G.effets.push({ type: o.visuel || 'impact_sol', x, y, r, age: 0, duree: 0.3 }); const J = G.joueur; if (!J.intangible && dist(x, y, J.x, J.y) < r + 3) blesserJoueur(o.degats || G.degatsEnnemis, { type: 'sol', x, y }); if (o.son !== false) Son.jouer(o.son || 'rocher', 0.6); if (o.apres) o.apres(); }, delai); }

// Actions de changement de phase
const ACTIONS_PHASE = {
  invoquer(e, ph) { for (let i = 0; i < (ph.n || 2); i++) { const [x, y] = pointAleatoire(G.salle); const f = creerEnnemi(ph.id, x, y, { parent: e.uid }); f.parent = e.uid; } },
  mue(e) { // Orochimaru : la peau abandonnée devient une mue hostile ; il réapparaît ailleurs
    const m = creerEnnemi('ENM_055', e.x, e.y, { sansApparition: true, parent: e.uid }); m.mue = true; m.pv = m.pvMax = 30;
    G.effets.push({ type: 'mue', x: e.x, y: e.y, age: 0, duree: 0.8 }); const [x, y] = pointAleatoire(G.salle, 3); e.x = x; e.y = y; e.invulnerable = true; setTimeoutJeu(() => { e.invulnerable = false; }, 0.8); Son.jouer('fumee');
  },
  murs_sable(e) { G.salle.mursSable = true; },
  accelerer(e) { e.acceleration = (e.acceleration || 1) * 1.25; },
  fin_hiruko(e) { e.def = Object.assign({}, e.def, { ia: 'sasori2' }); e.hiruko = false; G.effets.push({ type: 'debris', x: e.x, y: e.y, age: 0, duree: 0.6, n: 20, couleur: '#6a5a4a' }); },
  susanoo(e) { e.susanoo = true; },
  c3(e) { e.c3Pret = true; },
  arene(e) { basculerArene(e); },
};

// ── Intelligences des boss ──
const IA_BOSS = {
  // Cadre générique piloté par les données : liste d'attaques paramétrées
  generique(e, dt, d) {
    const J = G.joueur;
    if (e.etatB === 'choix') {
      // déplacement de maintien entre deux attaques
      if (d.deplacement === 'poursuite') { const [dx, dy] = directionFlux(e); deplacerEnnemi(e, dx, dy, (d.vitesse || 1.5) * TUILE * (e.acceleration || 1), dt); }
      else if (d.deplacement === 'errance') { if (!e.cible || allerVersPoint(e, e.cible[0], e.cible[1], (d.vitesse || 1.5) * (e.acceleration || 1), dt)) e.cible = pointAleatoire(G.salle); }
      else { e.vx *= 0.9; e.vy *= 0.9; }
      if (e.tB <= 0) { const a = choisirAttaque(e, d.attaques); e.attaque = a; e.etatB = 'tele'; e.tB = (a.tele || 0.5) / (e.acceleration || 1); lancerTelegraphe(e, a); }
      return;
    }
    if (e.etatB === 'tele') { e.vx *= 0.8; e.vy *= 0.8; if (e.tB <= 0) { e.etatB = 'actif'; e.tB = a_duree(e.attaque); e.sousT = 0; executerAttaqueBoss(e, e.attaque, 'debut'); } return; }
    if (e.etatB === 'actif') { e.sousT += dt; executerAttaqueBoss(e, e.attaque, 'maj', dt); if (e.tB <= 0) { executerAttaqueBoss(e, e.attaque, 'fin'); e.etatB = 'recup'; e.tB = (e.attaque.recup || 0.6) / (e.acceleration || 1); } return; }
    if (e.etatB === 'recup') { e.vx *= 0.85; e.vy *= 0.85; if (e.tB <= 0) { e.etatB = 'choix'; e.tB = (d.pause || 0.6) / (e.acceleration || 1); } }
  },
};
function a_duree(a) { return a.duree || 0.5; }
function lancerTelegraphe(e, a) {
  const J = G.joueur;
  switch (a.type) {
    case 'charge': e.dirCharge = ciblerJoueur(e); ligneDanger(e.x, e.y - 6, e.dirCharge, 600, e.r * 2, a.tele || 0.5); break;
    case 'saut': e.cibleSaut = [J.x, J.y]; cercleDanger(J.x, J.y, (a.r || 1.6) * TUILE, (a.tele || 0.5) + (a.duree || 0.6)); break;
    case 'lame': e.aLame = ciblerJoueur(e); G.effets.push({ type: 'arc_danger', x: e.x, y: e.y - 6, a: e.aLame, arc: (a.arc || 150) * Math.PI / 180, r: (a.portee || 2.6) * TUILE, age: 0, duree: a.tele || 0.5 }); break;
    case 'rayon': e.aRayon = ciblerJoueur(e); ligneDanger(e.x, e.y - e.hauteur, e.aRayon, 700, 16, a.tele || 0.7); break;
    case 'meteore': e.cibleMet = [J.x, J.y]; cercleDanger(J.x, J.y, (a.r || 3) * TUILE, (a.tele || 1.5) + 0.1); break;
    default: G.effets.push({ type: 'aura_tele', x: e.x, y: e.y - e.hauteur, age: 0, duree: a.tele || 0.5, r: e.r + 6 });
  }
  if ((a.tele || 0.5) >= 0.45) Son.jouer('telegraphe', 0.6);
}
// Bibliothèque d'attaques (données → comportement)
function executerAttaqueBoss(e, a, moment, dt) {
  const J = G.joueur, s = G.salle; const v = (a.v || 5) * (e.acceleration || 1);
  switch (a.type) {
    case 'salve': if (moment === 'debut') { for (let k = 0; k < (a.rafales || 1); k++) setTimeoutJeu(() => !e.mort && salveBoss(e, a.n || 3, v, a.ecart || 0.22, { apparence: a.proj, taille: a.taille, degats: a.degats }), k * (a.intervalle || 0.3)); } break;
    case 'anneau': if (moment === 'debut') { for (let k = 0; k < (a.vagues || 1); k++) setTimeoutJeu(() => !e.mort && anneauBoss(e, a.n || 12, v, { trou: a.trou ? Math.floor(Math.random() * (a.n || 12)) : undefined, largeurTrou: a.largeurTrou || 1.5, proj: { apparence: a.proj } }), k * (a.intervalle || 0.35)); } break;
    case 'spirale': { e.tSp = (e.tSp || 0) + (dt || 0); if (moment === 'maj' && e.tSp > (a.intervalle || 0.09)) { e.tSp = 0; e.angSp = (e.angSp || 0) + (a.pas || 0.35); for (let b = 0; b < (a.bras || 2); b++) tirEnnemi(e.x, e.y - e.hauteur, e.angSp + b * Math.PI * 2 / (a.bras || 2), v, { source: e.id, apparence: a.proj }); } break; }
    case 'charge': if (moment === 'maj') { const V = (a.vCharge || 9) * TUILE; e.vx = Math.cos(e.dirCharge) * V; e.vy = Math.sin(e.dirCharge) * V; const r = deplacerCercle(s, e, 0, 0, e.vol ? 'vol' : 'marche'); const tx = Math.floor((e.x + Math.cos(e.dirCharge) * (e.r + 6)) / TUILE), ty = Math.floor((e.y + Math.sin(e.dirCharge) * (e.r + 6)) / TUILE); if (solidePour(s, tx, ty, 'marche')) { e.tB = 0; if (a.impact === 'anneau') anneauBoss(e, 10, 4.5); secousse(6, e.dirCharge); Son.jouer('pas_lourd'); } } if (moment === 'fin') { e.vx = 0; e.vy = 0; } break;
    case 'saut': if (moment === 'debut') { e.sautDe = [e.x, e.y]; e.intangible = true; } if (moment === 'maj') { const k = Math.min(1, e.sousT / (a.duree || 0.6)); e.x = lerp(e.sautDe[0], e.cibleSaut[0], k); e.y = lerp(e.sautDe[1], e.cibleSaut[1], k); e.z = Math.sin(k * Math.PI) * 50; } if (moment === 'fin') { e.z = 0; e.intangible = false; ondeEnnemie(e.x, e.y, (a.r || 1.6) * TUILE); if (a.anneau) anneauBoss(e, a.anneau, 4.2); secousse(8, null); Son.jouer('pas_lourd'); const [tx, ty] = [Math.floor(e.x / TUILE), Math.floor(e.y / TUILE)]; if (solidePour(s, tx, ty, 'marche')) { const [a2, b2] = tuileLibreProche(s, e.x, e.y); [e.x, e.y] = centreTuile(a2, b2); } } break;
    case 'lame': if (moment === 'debut') { const r = (a.portee || 2.6) * TUILE; if (!J.intangible && dist(e.x, e.y, J.x, J.y) < r + 4 && Math.abs(diffAngle(e.aLame, angleVers(e.x, e.y, J.x, J.y))) < (a.arc || 150) * Math.PI / 360) blesserJoueur(a.degats || G.degatsEnnemis, { type: 'lame', x: e.x, y: e.y }); G.effets.push({ type: 'balayage', x: e.x, y: e.y - 6, a: e.aLame, arc: (a.arc || 150) * Math.PI / 180, r, age: 0, duree: 0.25 }); Son.jouer('lame'); if (a.vague) for (let i = -1; i <= 1; i++) tirEnnemi(e.x, e.y - 8, e.aLame + i * 0.25, 5, { source: e.id, taille: 1.4, apparence: 'lame' }); } break;
    case 'invocation': if (moment === 'debut') { const n = G.ennemis.filter(f => f.parent === e.uid && !f.mort).length; for (let i = 0; i < Math.min(a.n || 2, (a.max || 4) - n); i++) { const [x, y] = pointAleatoire(s); G.effets.push({ type: 'cercle_sceau', x, y, r: 14, age: 0, duree: 0.6 }); setTimeoutJeu(() => { if (e.mort) return; const f = creerEnnemi(a.id, x, y, { parent: e.uid }); f.parent = e.uid; }, 0.6); } Son.jouer('invocation'); } break;
    case 'pluie': if (moment === 'debut') { for (let i = 0; i < (a.n || 8); i++) { const cible = i % 3 === 0; const [x, y] = cible ? [J.x + (Math.random() - 0.5) * 30, J.y + (Math.random() - 0.5) * 20] : pointAleatoire(s, 1); setTimeoutJeu(() => !e.mort && frappeSolEnnemie(x, y, (a.r || 0.8) * TUILE, a.delai || 0.8, { visuel: a.visuel, son: a.son }), i * (a.intervalle || 0.12)); } } break;
    case 'rayon': if (moment === 'debut') { const f = { x: e.x, y: e.y - e.hauteur, a: e.aRayon, l: longueurJusquAuMur(s, e.x, e.y - e.hauteur, e.aRayon, true), largeur: 14, duree: a.duree || 0.6, age: 0, type: 'rayon_ennemi', couleur: a.couleur || '#b050e0', proprio: 'ennemi' }; G.faisceaux.push(f); Son.jouer('laser'); secousse(3, e.aRayon); } if (moment === 'maj' && a.balaye) { const f = G.faisceaux.find(x => x.type === 'rayon_ennemi'); if (f) f.a += a.balaye * dt; } break;
    case 'teleport': if (moment === 'debut') { e.intangible = true; e.alpha = 0.2; G.effets.push({ type: 'fumee', x: e.x, y: e.y - 10, age: 0, duree: 0.4, taille: 2 }); } if (moment === 'fin') { const [x, y] = a.pres ? (() => { const an = Math.random() * Math.PI * 2; const [tx, ty] = tuileLibreProche(s, J.x + Math.cos(an) * 3 * TUILE, J.y + Math.sin(an) * 2 * TUILE); return centreTuile(tx, ty); })() : pointAleatoire(s, 2); e.x = x; e.y = y; e.intangible = false; e.alpha = 1; G.effets.push({ type: 'fumee', x, y: y - 10, age: 0, duree: 0.4, taille: 2 }); Son.jouer('fumee'); if (a.puis === 'anneau') anneauBoss(e, 8, 4.5); } break;
    case 'zone': if (moment === 'debut') { for (let i = 0; i < (a.n || 3); i++) { const [x, y] = i === 0 && a.surJoueur ? [J.x, J.y] : pointAleatoire(s, 1); const z = creerZone(x, y, a.zone || 'acide', a.dureeZone || 6, { r: (a.r || 0.9) * TUILE, proprio: 'ennemi', naissance: 0.6 }); } Son.jouer(a.son || 'eau'); } break;
    case 'meteore': if (moment === 'fin') { const [x, y] = e.cibleMet; const r = (a.r || 3) * TUILE; G.effets.push({ type: 'meteore', x, y, r, age: 0, duree: 0.6 }); if (!J.intangible && dist(x, y, J.x, J.y) < r) blesserJoueur(4, { type: 'meteore', x, y }); exploserDecor(x, y, r * 0.7); secousse(14, null); Son.jouer('explosion'); for (let i = 0; i < 10; i++) tirEnnemi(x, y - 6, i * Math.PI / 5, 3.8, { source: e.id }); } break;
    case 'onde': if (moment === 'debut') { for (let k = 0; k < (a.n || 1); k++) setTimeoutJeu(() => { if (e.mort) return; G.effets.push({ type: 'anneau_expansif', x: e.x, y: e.y, r: 10, v: (a.vOnde || 3.5) * TUILE, age: 0, duree: 2.2, trou: Math.random() * Math.PI * 2, largeurTrou: 0.7, proprio: 'ennemi', touche: false }); Son.jouer('vent'); }, k * 0.7); } break;
    case 'attraction': if (moment === 'maj') { const [dx, dy] = normaliser(e.x - J.x, e.y - J.y); G.pousse = { x: dx * (a.force || 2.2), y: dy * (a.force || 2.2) }; e.tSp = (e.tSp || 0) + dt; if (e.tSp > 0.45) { e.tSp = 0; anneauBoss(e, 10, 3.5); } } if (moment === 'fin') G.pousse = null; break;
    case 'repulsion': if (moment === 'debut') { const [dx, dy] = normaliser(J.x - e.x, J.y - e.y); J.vx += dx * 700; J.vy += dy * 700; for (const p of G.proj) if (p.proprio !== 'ennemi') p.mort = true; G.effets.push({ type: 'onde', x: e.x, y: e.y, r: 300, age: 0, duree: 0.45, couleur: '#f0e0ff' }); Son.jouer('explosion'); secousse(8, null); if (dist(e.x, e.y, J.x, J.y) < 2 * TUILE) blesserJoueur(G.degatsEnnemis, { type: 'repulsion', x: e.x, y: e.y }); } break;
    case 'special': { const f = SPECIAUX_BOSS[a.nom]; if (f) f(e, a, moment, dt); break; }
  }
}
