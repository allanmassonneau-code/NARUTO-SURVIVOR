// ═══════════════════════════════════════════════════════════════════════════
// Ennemis : comportements paramétrés (poursuivant, tireur, chargeur, sauteur,
// lanceur en arc, invocateur, embusqué, tourelle, protecteur, guérisseur,
// poseur de pièges, lourd, rampant, nuée, kamikaze), télégraphes lisibles,
// statuts, champions reconnaissables (forme + icône, pas seulement la couleur).
// ═══════════════════════════════════════════════════════════════════════════

let _idEnnemi = 0;
const DUREE_APPARITION = 0.55;

function creerEnnemi(defId, x, y, o = {}) {
  const d = INDEX[defId]; if (!d) throw new Error('Ennemi inconnu ' + defId);
  const diff = G.partie && G.partie.difficile ? 1.2 : 1;
  const e = {
    uid: ++_idEnnemi, def: d, id: d.id, x, y, vx: 0, vy: 0, r: d.r || 9, hauteur: d.hauteur || 8,
    pv: d.pv * diff * (o.pvMult || 1), pvMax: d.pv * diff * (o.pvMult || 1), vol: !!d.vol, etat: 'apparition', t: 0, tAtt: 0.8 + Math.random() * 0.8,
    dir: 'bas', frame: 0, tAnim: Math.random(), statuts: {}, flash: 0, mort: false, cache: false, intangible: false, ia: {},
    champion: null, apparition: o.sansApparition ? 0 : DUREE_APPARITION, boss: !!d.boss, parent: o.parent || null, charme: false, allie: false,
    contact: d.contact ?? 1, echelle: o.echelle || 1,
  };
  if (o.champion) appliquerChampion(e, o.champion);
  if (d.params && d.params.cache) { e.cache = true; e.ia.phase = 'cache'; }
  if (o.echelle && o.echelle !== 1) { e.r *= o.echelle; }
  G.ennemis.push(e);
  return e;
}

// ── Champions : variantes de comportement (registre §R26) ──
const CHAMPIONS = {
  rapide: { nom: 'Rapide', couleur: '#5ad0e8', icone: 'vent', vitesse: 1.5, cadence: 1.3, recompense: 'ryo' },
  robuste: { nom: 'Robuste', couleur: '#a8a8b8', icone: 'bouclier', pv: 2.2, taille: 1.2, vitesse: 0.85, recompense: 'ryo2' },
  explosif: { nom: 'Explosif', couleur: '#f08a2a', icone: 'etoile', recompense: 'explosif', mort: 'salve8' },
  regenerant: { nom: 'Régénérant', couleur: '#6ad05a', icone: 'feuille', recompense: 'coeur' },
  fantome: { nom: 'Fantôme', couleur: '#b0a0e8', icone: 'spirale', recompense: 'protection' },
  diviseur: { nom: 'Diviseur', couleur: '#e8d05a', icone: 'deux', recompense: 'cle', mort: 'division' },
  enrage: { nom: 'Enragé', couleur: '#e83a3a', icone: 'flamme', recompense: 'ryo' },
};
function appliquerChampion(e, type) {
  const C = CHAMPIONS[type]; if (!C) return;
  e.champion = type;
  if (C.pv) { e.pv *= C.pv; e.pvMax *= C.pv; }
  if (C.taille) { e.echelle = (e.echelle || 1) * C.taille; e.r *= C.taille; }
}
function multVitesse(e) {
  let m = 1; const C = e.champion && CHAMPIONS[e.champion];
  if (C && C.vitesse) m *= C.vitesse;
  if (e.champion === 'enrage' && e.pv < e.pvMax * 0.5) m *= 1.6;
  if (e.statuts.ralenti) m *= 0.5;
  if (e.statuts.gel) m *= 0.3;
  if (G.salle && G.variante && G.variante.pluie) m *= 1;
  return m;
}
function multCadence(e) { const C = e.champion && CHAMPIONS[e.champion]; return (C && C.cadence) || 1; }

// ── Statuts ──
function appliquerStatut(e, type, duree, degSource) {
  if (e.mort) return;
  const resist = e.boss ? 0.35 : 1;
  if (e.boss && (type === 'charme' || type === 'peur')) return;
  if (e.boss && e.immuniteControle > 0 && (type === 'immobilise' || type === 'confus' || type === 'gel')) return;
  const D = duree * resist; const cur = e.statuts[type];
  switch (type) {
    case 'brulure': e.statuts.brulure = { t: Math.max(cur ? cur.t : 0, 1.5 * (G.joueur.drapeaux.flammesNoires ? 3 : 1)), tick: 0.5, prochain: 0.5, deg: Math.max(cur ? cur.deg : 0, 0.5 * degSource * (G.joueur.drapeaux.flammesNoires ? 1.5 : 1)), noir: G.joueur.drapeaux.flammesNoires }; break;
    case 'poison': e.statuts.poison = { t: Math.max(cur ? cur.t : 0, 3 * (G.joueur.drapeaux.poisonLong ? 2 : 1)), tick: 0.5, prochain: 0.5, deg: Math.max(cur ? cur.deg : 0, 0.25 * degSource) }; break;
    default: e.statuts[type] = { t: Math.max(cur ? cur.t : 0, D) };
  }
  if (e.boss && (type === 'immobilise' || type === 'confus' || type === 'gel')) e.immuniteControle = D + 2;
}
function majStatuts(e, dt) {
  if (e.immuniteControle > 0) e.immuniteControle -= dt;
  for (const k of Object.keys(e.statuts)) {
    const s = e.statuts[k]; s.t -= dt;
    if (s.tick) { s.prochain -= dt; if (s.prochain <= 0) { s.prochain += s.tick; infligerDegats(e, s.deg, { proprio: 'joueur', type: k, sansRecul: true, sansFlash: true }); } }
    if (s.t <= 0) delete e.statuts[k];
  }
  if (e.champion === 'regenerant' && !e.mort && G.temps - (e.dernierCoup || 0) > 2) e.pv = Math.min(e.pvMax, e.pv + e.pvMax * 0.05 * dt);
}
const controleBloque = e => !!(e.statuts.immobilise || e.statuts.gel && e.statuts.gel.t > 0 && false);

// ── Dégâts infligés aux ennemis ──
function infligerDegats(e, deg, src = {}) {
  if (e.mort || e.apparition > 0) return false;
  if (e.invulnerable) { if (!src.sansFlash) G.effets.push({ type: 'immunite', x: e.x, y: e.y - e.hauteur - 8, age: 0, duree: 0.3 }); return false; }
  if (e.champion === 'fantome' && e.ia.fantomeIntangible) return false;
  // bouclier frontal (protecteur) : bloque les projectiles venant de face
  if (e.def.params && e.def.params.bouclier === 'frontal' && src.type === 'projectile' && !e.statuts.immobilise) {
    const aFace = Math.atan2(DIRS[e.dir][1], DIRS[e.dir][0]); const aVenue = Math.atan2(-(src.vy || 0), -(src.vx || 0));
    if (Math.abs(diffAngle(aFace, aVenue)) < Math.PI / 3) { G.effets.push({ type: 'etincelle', x: e.x + DIRS[e.dir][0] * 10, y: e.y - 10, age: 0, duree: 0.2 }); Son.jouer('impact_mur'); return false; }
  }
  // aura d'un protecteur voisin : dégâts ×0,5
  for (const p of G.ennemis) if (p !== e && !p.mort && p.def.params && p.def.params.bouclier === 'aura' && dist(p.x, p.y, e.x, e.y) < 2.5 * TUILE) { deg *= 0.5; break; }
  if (G.joueur.drapeaux.bonusBoss && e.boss) deg *= 1.1;
  e.pv -= deg; e.dernierCoup = G.temps;
  if (!src.sansFlash) e.flash = 0.08;
  G.stats.degats += deg;
  if (!src.sansRecul && src.recul && !e.boss && !e.def.lourd && !e.def.fixe) {
    const [nx, ny] = normaliser(src.vx || 0, src.vy || 0); const k = src.recul * (e.champion === 'robuste' ? 0.5 : 1);
    e.vx += nx * k * 0.35; e.vy += ny * k * 0.35;
  }
  if (G.reglages.chiffresDegats && !src.sansFlash) G.textes.push({ x: e.x + (Math.random() - 0.5) * 8, y: e.y - e.hauteur - 14, t: formatNombre(arrondi(deg, 1)), age: 0, duree: 0.6, couleur: '#fff4c0' });
  if (e.pv <= 0) tuerEnnemi(e, src);
  else if (e.boss && e.def.phases) majPhaseBoss(e);
  return true;
}
function tuerEnnemi(e, src = {}) {
  if (e.mort) return; e.mort = true; e.pv = 0;
  if (e.boss) { mortBoss(e); return; }
  const C = e.champion && CHAMPIONS[e.champion];
  G.effets.push({ type: 'fumee', x: e.x, y: e.y - 8, age: 0, duree: 0.45, taille: e.r / 9 });
  ajouterDecal(G.salle, e.x, e.y, e.def.tache || 'encre', e.r);
  Son.jouer('ennemi_mort');
  if (e.statuts.gel && G.joueur.drapeaux.eclatsGlace) { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; const q = creerSousProjectile({ x: e.x, y: e.y - 8, vitesse: 7 * TUILE, degats: G.joueur.stats.degats, recul: 30, taille: 0.8, apparence: 'glace', elements: new Set(['hyoton']), gen: 0, budget: { n: 6 }, cycleId: 0 }, a, G.joueur.stats.degats * 0.5); q.dureeVie = 0.5; } }
  const mortDef = e.def.mort;
  if (mortDef === 'division' || (C && C.mort === 'division')) {
    if (!e.parentDivision) for (let i = 0; i < 2; i++) { const f = creerEnnemi(e.def.enfant || e.def.id, e.x + (i ? 8 : -8), e.y, { sansApparition: true, pvMult: 0.45, echelle: 0.75 }); f.parentDivision = true; f.vx = (i ? 1 : -1) * 60; }
  }
  if (mortDef === 'salve8' || (C && C.mort === 'salve8')) for (let i = 0; i < 8; i++) tirEnnemi(e.x, e.y - 8, i * Math.PI / 4, 4.5);
  if (mortDef === 'explose') explosion(e.x, e.y, 1.3 * TUILE, 10, { proprio: 'ennemi', blesseJoueur: true, degatsJoueur: 2 });
  if (mortDef === 'flaque') creerZone(e.x, e.y, 'acide', 6, { r: 16 });
  if (mortDef === 'glace') creerZone(e.x, e.y, 'glace', 5, { r: 18 });
  if (C) lacherRecompenseChampion(e, C.recompense);
  // les invocations disparaissent avec leur invocateur si la règle le demande
  if (e.def.params && e.def.params.liees) for (const f of G.ennemis) if (f.parent === e.uid && !f.mort) { f.mort = true; G.effets.push({ type: 'fumee', x: f.x, y: f.y - 8, age: 0, duree: 0.4 }); }
  G.stats.eliminations++;
  evenement('elimination', { e, src });
}

// ── Navigation : champ de flux depuis la tuile du joueur (recalculé quand elle change) ──
function champFlux(s, cibleTx, cibleTy) {
  const cle = cibleTx + ',' + cibleTy; if (s._flux && s._fluxCle === cle && s._fluxVersion === s.version) return s._flux;
  const D = new Int16Array(s.W * s.H).fill(-1); const q = [[cibleTx, cibleTy]]; D[cibleTy * s.W + cibleTx] = 0; let qi = 0;
  while (qi < q.length) {
    const [x, y] = q[qi++]; const d = D[y * s.W + x];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= s.W || ny >= s.H) continue;
      const i = ny * s.W + nx; if (D[i] >= 0) continue;
      if (solidePour(s, nx, ny, 'ennemi')) continue;
      if (dx && dy && (solidePour(s, x + dx, y, 'ennemi') || solidePour(s, x, y + dy, 'ennemi'))) continue; // pas de coupe de coin
      D[i] = d + 1; q.push([nx, ny]);
    }
  }
  s._flux = D; s._fluxCle = cle; s._fluxVersion = s.version; return D;
}
function directionFlux(e) {
  const s = G.salle, J = cibleEnnemi(e);
  const tx = Math.floor(e.x / TUILE), ty = Math.floor(e.y / TUILE);
  if (ligneLibre(s, e.x, e.y, J.x, J.y, 'marche') && ligneLibreLarge(s, e, J)) return normaliser(J.x - e.x, J.y - e.y);
  const D = champFlux(s, Math.floor(J.x / TUILE), Math.floor(J.y / TUILE));
  let best = null, bd = D[ty * s.W + tx] >= 0 ? D[ty * s.W + tx] : 9999;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const nx = tx + dx, ny = ty + dy; const v = D[ny * s.W + nx]; if (v >= 0 && v < bd) { bd = v; best = [nx, ny]; }
  }
  if (!best) return normaliser(J.x - e.x, J.y - e.y);
  const [cx, cy] = centreTuile(best[0], best[1]); return normaliser(cx - e.x, cy - e.y);
}
function ligneLibreLarge(s, e, J) {
  const [nx, ny] = normaliser(J.x - e.x, J.y - e.y); const px = -ny * (e.r - 2), py = nx * (e.r - 2);
  return ligneLibre(s, e.x + px, e.y + py, J.x + px, J.y + py, 'marche') && ligneLibre(s, e.x - px, e.y - py, J.x - px, J.y - py, 'marche');
}
// Cible : le joueur, sauf ennemi charmé (cible un autre ennemi) ou appât
function cibleEnnemi(e) {
  if (e.statuts.charme || e.allie) { const c = ennemiLePlusProche(e.x, e.y, 9999, x => x !== e && !x.statuts.charme && !x.allie); if (c) return c; }
  if (G.appat && !G.appat.fini) return G.appat;
  return G.joueur;
}
function ennemiLePlusProche(x, y, rmax, filtre) {
  let best = null, bd = rmax;
  for (const e of G.ennemis) { if (e.mort || e.cache || (filtre && !filtre(e))) continue; const d = dist(x, y, e.x, e.y); if (d < bd) { bd = d; best = e; } }
  return best;
}
function deplacerEnnemi(e, dx, dy, v, dt, acc = 10) {
  const tvx = dx * v, tvy = dy * v;
  e.vx = lerp(e.vx, tvx, Math.min(1, acc * dt)); e.vy = lerp(e.vy, tvy, Math.min(1, acc * dt));
}
function orienter(e, x, y) { e.dir = dirDepuisVecteur(x - e.x, y - e.y); }
function aligne(e, J, tol = 12) { return Math.abs(e.x - J.x) < tol || Math.abs(e.y - J.y) < tol; }
function telegraphe(e, type, duree, o = {}) { e.ia.tele = { type, t: duree, duree, ...o }; }

// ── Comportements ──
const IA = {
  poursuivant(e, dt, P) {
    const [dx, dy] = e.vol ? normaliser(cibleEnnemi(e).x - e.x, cibleEnnemi(e).y - e.y) : directionFlux(e);
    let lx = 0, ly = 0;
    if (P.ondulant) { const w = Math.sin(G.temps * 6 + e.uid) * 0.6; lx = -dy * w; ly = dx * w; }
    deplacerEnnemi(e, dx + lx, dy + ly, P.vitesse, dt);
  },
  errant(e, dt, P) {
    e.ia.t = (e.ia.t || 0) - dt; const J = cibleEnnemi(e);
    if (e.ia.t <= 0) { e.ia.t = 0.5 + Math.random() * 0.9; const vers = dist(e.x, e.y, J.x, J.y) < 4 * TUILE && Math.random() < 0.55; const a = vers ? angleVers(e.x, e.y, J.x, J.y) + (Math.random() - 0.5) * 0.8 : Math.random() * Math.PI * 2; e.ia.a = a; }
    deplacerEnnemi(e, Math.cos(e.ia.a), Math.sin(e.ia.a), P.vitesse, dt, 6);
  },
  volant(e, dt, P) {
    const J = cibleEnnemi(e); const [dx, dy] = normaliser(J.x - e.x, J.y - 10 - e.y);
    const n = Math.sin(G.temps * 3.1 + e.uid * 1.7), m = Math.cos(G.temps * 2.3 + e.uid);
    deplacerEnnemi(e, dx + n * (P.erratique || 0.6), dy + m * (P.erratique || 0.6), P.vitesse, dt, 4);
  },
  tireur(e, dt, P) {
    const J = cibleEnnemi(e);
    if (!e.ia.tele) IA.errant(e, dt, { vitesse: P.vitesse * 0.6 }); else { e.vx *= 0.8; e.vy *= 0.8; }
    e.tAtt -= dt * multCadence(e);
    if (e.tAtt <= 0 && !e.ia.tele) {
      const motif = P.motif || 'aligne';
      if (motif === 'aligne' && !aligne(e, J, 14)) { e.tAtt = 0.2; return; }
      telegraphe(e, 'gonfle', P.tele || 0.3, { motif }); orienter(e, J.x, J.y);
    }
    if (e.ia.tele && e.ia.tele.t <= 0) {
      const motif = e.ia.tele.motif; e.ia.tele = null; e.tAtt = P.cadence;
      const v = P.vProj || 5; const o = { degats: G.degatsEnnemis, source: e.id, apparence: P.proj };
      if (motif === 'aligne' || motif === 'vise') { const a = motif === 'vise' ? angleVers(e.x, e.y - 8, J.x, J.y - 8) : Math.atan2(DIRS[dirDepuisVecteur(J.x - e.x, J.y - e.y)][1], DIRS[dirDepuisVecteur(J.x - e.x, J.y - e.y)][0]); for (let i = 0; i < (P.rafale || 1); i++) setTimeoutJeu(() => !e.mort && tirEnnemi(e.x, e.y - 8, a + (i - ((P.rafale || 1) - 1) / 2) * (P.ecart || 0), v, o), i * 0.12); }
      else if (motif === '4') for (let i = 0; i < 4; i++) tirEnnemi(e.x, e.y - 8, i * Math.PI / 2 + (e.ia.rot || 0), v, o);
      else if (motif === '8') for (let i = 0; i < 8; i++) tirEnnemi(e.x, e.y - 8, i * Math.PI / 4, v, o);
      else if (motif === 'rotation') { e.ia.rot = (e.ia.rot || 0) + Math.PI / 4; for (let i = 0; i < 4; i++) tirEnnemi(e.x, e.y - 8, i * Math.PI / 2 + e.ia.rot, v, o); }
      else if (motif === 'eventail') { const a = angleVers(e.x, e.y, J.x, J.y); for (let i = -1; i <= 1; i++) tirEnnemi(e.x, e.y - 8, a + i * 0.3, v, o); }
      else if (motif === 'anneau') for (let i = 0; i < 12; i++) tirEnnemi(e.x, e.y - 8, i * Math.PI / 6, v * 0.8, o);
      Son.jouer('tir_ennemi');
    }
  },
  tireur_predictif(e, dt, P) {
    const J = cibleEnnemi(e);
    if (!e.ia.tele) { // garde ses distances
      const d = dist(e.x, e.y, J.x, J.y); const [dx, dy] = normaliser(J.x - e.x, J.y - e.y);
      if (d < 3 * TUILE) deplacerEnnemi(e, -dx, -dy, P.vitesse, dt); else if (d > 6 * TUILE) deplacerEnnemi(e, dx, dy, P.vitesse, dt); else IA.errant(e, dt, { vitesse: P.vitesse * 0.5 });
    } else { e.vx *= 0.8; e.vy *= 0.8; }
    e.tAtt -= dt * multCadence(e);
    if (e.tAtt <= 0 && !e.ia.tele) { telegraphe(e, 'vise', P.tele || 0.4); orienter(e, J.x, J.y); }
    if (e.ia.tele && e.ia.tele.t <= 0) {
      e.ia.tele = null; e.tAtt = P.cadence; const v = (P.vProj || 6) * TUILE;
      const d = dist(e.x, e.y, J.x, J.y); const t = d / v; const px = J.x + (J.vx || 0) * t * 0.8, py = J.y + (J.vy || 0) * t * 0.8;
      tirEnnemi(e.x, e.y - 8, angleVers(e.x, e.y - 8, px, py - 8), P.vProj || 6, { source: e.id, apparence: P.proj });
      Son.jouer('tir_ennemi');
    }
  },
  chargeur(e, dt, P) {
    const J = cibleEnnemi(e); const I = e.ia;
    if (I.phase === 'charge') {
      const [dx, dy] = DIRS[I.dirCharge]; e.vx = dx * P.vCharge * TUILE * multVitesse(e); e.vy = dy * P.vCharge * TUILE * multVitesse(e);
      if (I.bloque) { I.phase = 'etourdi'; I.t = P.recup || 0.7; e.vx = 0; e.vy = 0; secousse(2, null); Son.jouer('pas_lourd', 0.5); }
      return;
    }
    if (I.phase === 'etourdi') { I.t -= dt; e.vx *= 0.7; e.vy *= 0.7; if (I.t <= 0) I.phase = null; return; }
    if (e.ia.tele) { e.vx *= 0.7; e.vy *= 0.7; if (e.ia.tele.t <= 0) { e.ia.tele = null; I.phase = 'charge'; I.bloque = false; Son.jouer('vent', 0.5); } return; }
    IA.errant(e, dt, { vitesse: P.vitesse });
    e.tAtt -= dt;
    if (e.tAtt <= 0 && aligne(e, J, 12) && ligneLibre(G.salle, e.x, e.y, J.x, J.y, 'marche')) {
      I.dirCharge = dirDepuisVecteur(J.x - e.x, J.y - e.y); e.dir = I.dirCharge; telegraphe(e, 'tremble', P.tele || 0.35); e.tAtt = P.cadence || 1.2;
    }
  },
  sauteur(e, dt, P) {
    const J = cibleEnnemi(e); const I = e.ia;
    if (I.phase === 'saut') {
      I.t += dt; const k = Math.min(1, I.t / I.duree); e.x = lerp(I.x0, I.x1, k); e.y = lerp(I.y0, I.y1, k); e.z = Math.sin(k * Math.PI) * 30; e.intangible = e.z > 10;
      if (k >= 1) { I.phase = null; e.z = 0; e.intangible = false; e.tAtt = P.intervalle; if (P.atterrissage === 'anneau') for (let i = 0; i < 6; i++) tirEnnemi(e.x, e.y - 6, i * Math.PI / 3, 4); if (P.atterrissage === 'onde') ondeEnnemie(e.x, e.y, 1.6 * TUILE); Son.jouer('pas_lourd', 0.6); }
      return;
    }
    e.vx *= 0.8; e.vy *= 0.8; e.tAtt -= dt;
    if (e.ia.tele) { if (e.ia.tele.t <= 0) { e.ia.tele = null; const d = Math.min(dist(e.x, e.y, J.x, J.y), (P.portee || 3.5) * TUILE); const a = angleVers(e.x, e.y, J.x, J.y); const [tx, ty] = tuileLibreProche(G.salle, e.x + Math.cos(a) * d, e.y + Math.sin(a) * d); const [cx, cy] = centreTuile(tx, ty); Object.assign(I, { phase: 'saut', t: 0, duree: P.duree || 0.6, x0: e.x, y0: e.y, x1: cx, y1: cy }); G.effets.push({ type: 'marque_sol', x: cx, y: cy, r: 14, age: 0, duree: P.duree || 0.6 }); } return; }
    if (e.tAtt <= 0) telegraphe(e, 'accroupi', 0.35);
  },
  lanceur_arc(e, dt, P) {
    const J = cibleEnnemi(e);
    if (!e.ia.tele && !P.fixe) IA.errant(e, dt, { vitesse: P.vitesse * 0.5 }); else { e.vx *= 0.8; e.vy *= 0.8; }
    e.tAtt -= dt * multCadence(e);
    if (e.tAtt <= 0 && !e.ia.tele) { telegraphe(e, 'gonfle', 0.35); orienter(e, J.x, J.y); }
    if (e.ia.tele && e.ia.tele.t <= 0) {
      e.ia.tele = null; e.tAtt = P.cadence;
      const n = P.nombre || 1;
      for (let i = 0; i < n; i++) {
        const cx = J.x + (n > 1 ? (Math.random() - 0.5) * 60 : 0), cy = J.y + (n > 1 ? (Math.random() - 0.5) * 40 : 0);
        lancerArc(e.x, e.y - 10, cx, cy, P.duree || 0.9, { eclabousse: P.eclabousse || 'anneau', zone: P.zone, source: e.id });
      }
    }
  },
  invocateur(e, dt, P) {
    const J = cibleEnnemi(e);
    if (!e.ia.tele) { const d = dist(e.x, e.y, J.x, J.y); const [dx, dy] = normaliser(J.x - e.x, J.y - e.y); if (d < 3.5 * TUILE) deplacerEnnemi(e, -dx, -dy, P.vitesse, dt); else IA.errant(e, dt, { vitesse: P.vitesse * 0.5 }); } else { e.vx *= 0.7; e.vy *= 0.7; }
    e.tAtt -= dt;
    const n = G.ennemis.filter(f => f.parent === e.uid && !f.mort).length;
    if (e.tAtt <= 0 && !e.ia.tele && n < (P.max || 3)) { const [tx, ty] = tuileLibreProche(G.salle, e.x + (Math.random() - 0.5) * 70, e.y + (Math.random() - 0.5) * 50); const [cx, cy] = centreTuile(tx, ty); telegraphe(e, 'sceau', 0.6, { x: cx, y: cy }); G.effets.push({ type: 'cercle_sceau', x: cx, y: cy, r: 14, age: 0, duree: 0.6 }); }
    if (e.ia.tele && e.ia.tele.t <= 0) { const T0 = e.ia.tele; e.ia.tele = null; e.tAtt = P.intervalle; const f = creerEnnemi(P.invocation, T0.x, T0.y, { parent: e.uid }); f.parent = e.uid; Son.jouer('invocation', 0.6); }
  },
  embusque(e, dt, P) {
    const J = cibleEnnemi(e); const I = e.ia;
    if (I.phase === 'cache') {
      e.cache = true; e.vx = 0; e.vy = 0; I.t = (I.t || 0) - dt;
      if (P.suit) { const [dx, dy] = normaliser(J.x - e.x, J.y - e.y); const v = P.vitesse * TUILE * 0.8; const nx = e.x + dx * v * dt, ny = e.y + dy * v * dt; if (!solidePour(G.salle, Math.floor(nx / TUILE), Math.floor(ny / TUILE), 'marche')) { e.x = nx; e.y = ny; } }
      if (I.t <= 0 && dist(e.x, e.y, J.x, J.y) < (P.detection || 4) * TUILE) {
        // sortie à distance raisonnable du joueur (jamais sur lui)
        let px = e.x, py = e.y;
        if (P.surgitPres) { const a = Math.random() * Math.PI * 2; const [tx, ty] = tuileLibreProche(G.salle, J.x + Math.cos(a) * 2 * TUILE, J.y + Math.sin(a) * 2 * TUILE); [px, py] = centreTuile(tx, ty); }
        if (dist(px, py, J.x, J.y) < 1.5 * TUILE) { const a = angleVers(J.x, J.y, px, py); px = J.x + Math.cos(a) * 1.6 * TUILE; py = J.y + Math.sin(a) * 1.6 * TUILE; const [tx, ty] = tuileLibreProche(G.salle, px, py); [px, py] = centreTuile(tx, ty); }
        e.x = px; e.y = py; I.phase = 'sortie'; I.t = P.tele || 0.55; G.effets.push({ type: 'fissure', x: px, y: py, r: e.r + 4, age: 0, duree: I.t });
      }
      return;
    }
    if (I.phase === 'sortie') { I.t -= dt; e.cache = true; if (I.t <= 0) { I.phase = 'actif'; I.t = P.dureeActive || 2.4; e.cache = false; e.tAtt = 0.25; Son.jouer('rocher', 0.5); } return; }
    if (I.phase === 'actif') {
      I.t -= dt;
      if (P.attaque === 'poursuite') IA.poursuivant(e, dt, P); else { e.vx *= 0.8; e.vy *= 0.8; }
      e.tAtt -= dt;
      if (e.tAtt <= 0 && P.attaque !== 'poursuite') { e.tAtt = P.cadence || 1; const a = angleVers(e.x, e.y, J.x, J.y); if (P.attaque === 'eventail') for (let i = -1; i <= 1; i++) tirEnnemi(e.x, e.y - 8, a + i * 0.28, P.vProj || 5, { source: e.id }); else tirEnnemi(e.x, e.y - 8, a, P.vProj || 5, { source: e.id }); Son.jouer('tir_ennemi'); }
      if (I.t <= 0) { I.phase = 'retour'; I.t = 0.4; }
      return;
    }
    if (I.phase === 'retour') { I.t -= dt; e.vx = 0; e.vy = 0; if (I.t <= 0) { I.phase = 'cache'; I.t = P.cacheDuree || 1.2; e.cache = true; } return; }
    I.phase = 'cache'; I.t = 0.5;
  },
  tourelle(e, dt, P) { e.vx = 0; e.vy = 0; IA.tireur(e, dt, Object.assign({}, P, { vitesse: 0 })); },
  protecteur(e, dt, P) {
    const J = cibleEnnemi(e);
    if (P.bouclier === 'frontal') { orienter(e, J.x, J.y); const [dx, dy] = directionFlux(e); deplacerEnnemi(e, dx, dy, P.vitesse, dt); }
    else { // reste près de ses alliés
      const alli = ennemiLePlusProche(e.x, e.y, 9999, x => x !== e && x.def.params && x.def.params.bouclier !== 'aura');
      const cx = alli ? alli.x : J.x, cy = alli ? alli.y : J.y; const [dx, dy] = normaliser(cx - e.x, cy - e.y); if (dist(e.x, e.y, cx, cy) > 1.5 * TUILE) deplacerEnnemi(e, dx, dy, P.vitesse, dt); else { e.vx *= 0.8; e.vy *= 0.8; }
    }
  },
  guerisseur(e, dt, P) {
    const J = cibleEnnemi(e); const d = dist(e.x, e.y, J.x, J.y); const [dx, dy] = normaliser(J.x - e.x, J.y - e.y);
    if (!e.ia.tele) { if (d < 3.5 * TUILE) deplacerEnnemi(e, -dx, -dy, P.vitesse, dt); else IA.errant(e, dt, { vitesse: P.vitesse * 0.5 }); } else { e.vx *= 0.7; e.vy *= 0.7; }
    e.tAtt -= dt;
    if (e.tAtt <= 0 && !e.ia.tele && G.ennemis.some(f => f !== e && !f.mort && f.pv < f.pvMax && dist(f.x, f.y, e.x, e.y) < 3 * TUILE)) { telegraphe(e, 'soin', 0.5); G.effets.push({ type: 'cercle_soin', x: e.x, y: e.y, r: 3 * TUILE, age: 0, duree: 0.5 }); }
    if (e.ia.tele && e.ia.tele.t <= 0) { e.ia.tele = null; e.tAtt = P.intervalle || 3; for (const f of G.ennemis) if (f !== e && !f.mort && !f.boss && dist(f.x, f.y, e.x, e.y) < 3 * TUILE) { f.pv = Math.min(f.pvMax, f.pv + f.pvMax * (P.soin || 0.25)); G.effets.push({ type: 'soin_ennemi', x: f.x, y: f.y - 12, age: 0, duree: 0.5 }); } }
  },
  poseur(e, dt, P) {
    IA.errant(e, dt, { vitesse: P.vitesse });
    e.tAtt -= dt;
    if (e.tAtt <= 0) { e.tAtt = P.intervalle || 3.5; const n = G.zones.filter(z => z.pose === e.uid).length; if (n < (P.max || 3)) { G.zones.push({ type: P.piege || 'parchemin', x: e.x, y: e.y, r: P.piege === 'toile' ? 20 : 10, age: 0, duree: P.piege === 'toile' ? 8 : 7, armee: 0.8, pose: e.uid, proprio: 'ennemi' }); Son.jouer('sceau', 0.4); } }
  },
  lourd(e, dt, P) {
    const J = cibleEnnemi(e);
    if (e.ia.tele) { e.vx *= 0.6; e.vy *= 0.6; if (e.ia.tele.t <= 0) { e.ia.tele = null; ondeEnnemie(e.x, e.y, (P.rOnde || 2) * TUILE); if (P.anneau) for (let i = 0; i < 8; i++) tirEnnemi(e.x, e.y - 6, i * Math.PI / 4 + Math.PI / 8, 4); secousse(4, null); Son.jouer('pas_lourd'); } return; }
    IA.poursuivant(e, dt, P);
    e.tAtt -= dt;
    if (e.tAtt <= 0 && dist(e.x, e.y, J.x, J.y) < 2.6 * TUILE) { telegraphe(e, 'frappe', P.tele || 0.6); e.tAtt = P.cadence || 2.5; G.effets.push({ type: 'cercle_danger', x: e.x, y: e.y, r: (P.rOnde || 2) * TUILE, age: 0, duree: P.tele || 0.6 }); }
  },
  rampant(e, dt, P) {
    const J = cibleEnnemi(e); const I = e.ia;
    if (!I.phase) { I.phase = 'sous'; I.t = 1.2; }
    if (I.phase === 'sous') {
      e.cache = true; I.t -= dt; const [dx, dy] = normaliser(J.x - e.x, J.y - e.y); const v = P.vitesse * TUILE;
      const nx = e.x + dx * v * dt, ny = e.y + dy * v * dt; if (!solidePour(G.salle, Math.floor(nx / TUILE), Math.floor(ny / TUILE), 'marche')) { e.x = nx; e.y = ny; }
      if (I.t <= 0 && dist(e.x, e.y, J.x, J.y) < 2.2 * TUILE) { I.phase = 'monte'; I.t = P.tele || 0.6; G.effets.push({ type: 'fissure', x: e.x, y: e.y, r: e.r + 4, age: 0, duree: I.t }); }
      return;
    }
    if (I.phase === 'monte') { I.t -= dt; if (I.t <= 0) { I.phase = 'dehors'; I.t = P.dureeDehors || 1.6; e.cache = false; if (P.jet) for (let i = 0; i < 4; i++) tirEnnemi(e.x, e.y - 6, i * Math.PI / 2 + Math.PI / 4, 4.2, { source: e.id }); Son.jouer('rocher', 0.6); } return; }
    if (I.phase === 'dehors') { I.t -= dt; e.vx *= 0.8; e.vy *= 0.8; if (I.t <= 0) { I.phase = 'sous'; I.t = P.sous || 1.4; e.cache = true; } }
  },
  nuee(e, dt, P) { IA.volant(e, dt, Object.assign({ erratique: 1.2 }, P)); },
  kamikaze(e, dt, P) {
    const J = cibleEnnemi(e);
    if (e.ia.meche !== undefined) { e.ia.meche -= dt; e.vx *= 0.9; e.vy *= 0.9; e.flash = (Math.floor(e.ia.meche * 12) % 2) ? 0.05 : 0; if (e.ia.meche <= 0) { e.mort = true; explosion(e.x, e.y, 1.3 * TUILE, 12, { proprio: 'ennemi', blesseJoueur: true, degatsJoueur: 2 }); evenement('elimination', { e }); G.stats.eliminations++; } return; }
    if (e.vol) IA.volant(e, dt, P); else IA.poursuivant(e, dt, P);
    if (dist(e.x, e.y, J.x, J.y) < (P.declenche || 1.3) * TUILE) { e.ia.meche = P.meche || 0.7; Son.jouer('meche'); }
  },
  inerte(e, dt, P) { // marionnette inerte : s'anime si le joueur approche
    const J = cibleEnnemi(e);
    if (!e.ia.eveil) { e.vx = 0; e.vy = 0; if (dist(e.x, e.y, J.x, J.y) < (P.detection || 2.2) * TUILE || e.pv < e.pvMax) { e.ia.eveil = true; telegraphe(e, 'tremble', 0.4); } return; }
    if (e.ia.tele) { e.vx = 0; e.vy = 0; if (e.ia.tele.t <= 0) e.ia.tele = null; return; }
    IA.poursuivant(e, dt, P);
  },
};

function majEnnemis(dt) {
  const s = G.salle, J = G.joueur;
  for (const e of G.ennemis) {
    if (e.mort) continue;
    e.tAnim += dt; e.flash = Math.max(0, e.flash - dt);
    if (e.apparition > 0) { e.apparition -= dt; continue; }
    majStatuts(e, dt); if (e.mort) continue;
    if (e.ia.tele) e.ia.tele.t -= dt;
    const P = Object.assign({}, e.def.params || {}); P.vitesse = (e.def.vitesse || 1.5) * TUILE * multVitesse(e);
    if (e.champion === 'fantome') { e.ia.fantomeT = (e.ia.fantomeT || 0) + dt; e.ia.fantomeIntangible = (e.ia.fantomeT % 4) > 2.8; }
    if (e.boss) { majBoss(e, dt); }
    else if (e.statuts.immobilise || G.gelGlobal > 0) { e.vx *= 0.5; e.vy *= 0.5; }
    else if (e.statuts.peur) { const [dx, dy] = normaliser(e.x - J.x, e.y - J.y); deplacerEnnemi(e, dx, dy, P.vitesse, dt); }
    else if (e.statuts.confus) { e.ia.confA = (e.ia.confA || 0) + (Math.random() - 0.5) * 6 * dt; deplacerEnnemi(e, Math.cos(e.ia.confA), Math.sin(e.ia.confA), P.vitesse * 0.7, dt); }
    else { const f = IA[e.def.comportement] || IA.poursuivant; f(e, dt, P); }
    // Intégration du mouvement + collisions décor (les volants ignorent obstacles et fosses)
    if (!e.def.fixe && !(e.ia.phase === 'saut')) {
      const r = deplacerCercle(s, e, e.vx * dt, e.vy * dt, e.vol ? 'vol' : 'marche');
      if (e.ia.phase === 'charge' && (r.bloqueX || r.bloqueY)) e.ia.bloque = true;
      if (!e.vol) { const t = tuilePx(s, e.x, e.y); if (PROP[t].blessant && e.def.comportement !== 'rampant') {} }
    }
    // séparation douce entre ennemis
    for (const f of G.ennemis) { if (f === e || f.mort || f.cache || e.cache) continue; const d = dist(e.x, e.y, f.x, f.y); const m = e.r + f.r - 4; if (d < m && d > 0.01) { const k = (m - d) / d * 0.25; e.x += (e.x - f.x) * k; e.y += (e.y - f.y) * k; } }
    if (Math.abs(e.vx) + Math.abs(e.vy) > 5 && !e.ia.tele && e.def.comportement !== 'tourelle') { e.dir = dirDepuisVecteur(e.vx, e.vy); e.frame = Math.floor(e.tAnim * 8) % 2; }
    // Dégâts de contact (pas pendant l'apparition, caché, charmé)
    if (!e.cache && !e.statuts.charme && !e.allie && !J.intangible && (e.contact || 0) > 0 && !(e.z > 10)) {
      if (dist(e.x, e.y, J.x, J.y) < e.r + J.r - 1) blesserJoueur(e.contact === 1 ? G.degatsContact : e.contact, { type: 'contact', source: e.id, x: e.x, y: e.y });
    }
    // ennemi charmé : blesse ses anciens alliés au contact
    if (e.statuts.charme || e.allie) for (const f of G.ennemis) if (f !== e && !f.mort && !f.statuts.charme && !f.allie && dist(e.x, e.y, f.x, f.y) < e.r + f.r) { if (G.temps - (e.ia.dernierCharme || 0) > 0.5) { e.ia.dernierCharme = G.temps; infligerDegats(f, 3.5, { proprio: 'allie', type: 'contact' }); } }
  }
  G.ennemis = G.ennemis.filter(e => !e.mort);
}

// ── Attaques utilitaires partagées (ennemis et boss) ──
function ondeEnnemie(x, y, r, degats) {
  G.effets.push({ type: 'onde_ennemie', x, y, r, age: 0, duree: 0.3 });
  const J = G.joueur; if (!J.intangible && dist(x, y, J.x, J.y) < r + 4 && !(J.z > 4)) blesserJoueur(degats || G.degatsEnnemis, { type: 'onde' });
}
function lancerArc(x0, y0, x1, y1, duree, o = {}) {
  G.effets.push({ type: 'marque_sol', x: x1, y: y1, r: o.r || 14, age: 0, duree, danger: true });
  G.arcs.push({ x0, y0, x1, y1, t: 0, duree, o });
}
function majArcs(dt) {
  for (const a of G.arcs) {
    a.t += dt; if (a.t < a.duree) continue; a.fini = true;
    const o = a.o; Son.jouer('eau', 0.5);
    const J = G.joueur; if (!J.intangible && dist(a.x1, a.y1, J.x, J.y) < (o.r || 14) + 4) blesserJoueur(G.degatsEnnemis, { type: 'arc' });
    if (o.eclabousse === 'anneau') for (let i = 0; i < 4; i++) tirEnnemi(a.x1, a.y1 - 4, i * Math.PI / 2 + Math.PI / 4, 3.5, { source: o.source });
    if (o.eclabousse === 'croix') for (let i = 0; i < 4; i++) tirEnnemi(a.x1, a.y1 - 4, i * Math.PI / 2, 3.5, { source: o.source });
    if (o.zone) creerZone(a.x1, a.y1, o.zone, 5, { r: 18, proprio: 'ennemi' });
    G.effets.push({ type: 'eclaboussure', x: a.x1, y: a.y1, age: 0, duree: 0.3 });
  }
  G.arcs = G.arcs.filter(a => !a.fini);
}
// Minuteries de jeu (suspendues avec la simulation)
function setTimeoutJeu(f, d) { G.minuteries.push({ t: d, f }); }
function majMinuteries(dt) { const L = G.minuteries; G.minuteries = []; for (const m of L) { m.t -= dt; if (m.t <= 0) m.f(); else G.minuteries.push(m); } }
