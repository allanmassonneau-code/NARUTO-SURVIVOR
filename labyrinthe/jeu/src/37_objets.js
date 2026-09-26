// ═══════════════════════════════════════════════════════════════════════════
// Objets : statistiques (ordre de ramassage sans effet), profil d'attaque,
// inventaire (passifs illimités, 1 actif, 1 talisman, 1 poche par défaut),
// pools pondérés avec déplétion à l'apparition, relances, transformations.
// ═══════════════════════════════════════════════════════════════════════════

// ── Formule des statistiques (registre §R8) ──
// valeur = (base + Σ ajouts) × (1 + Σ pourcentages/100) × Π multiplicateurs, puis bornes.
const BORNES_STATS = {
  degats: [0.5, 999], cadence: [0.4, 5.0], portee: [2, 16], vitesseTir: [4, 18], vitesse: [2.5, 7.0], chance: [-10, 20],
};
function modificateursStats(J) {
  const M = {}; const add = (s, k, v) => { M[s] = M[s] || { a: 0, p: 0, m: 1 }; if (k === 'm') M[s].m *= v; else M[s][k] += v; };
  const appliquer = e => { if (e.s) { if (e.a) add(e.s, 'a', e.a); if (e.p) add(e.s, 'p', e.p); if (e.m) add(e.s, 'm', e.m); } };
  for (const id of J.passifs) { const d = INDEX[id]; if (d && d.effets) d.effets.forEach(appliquer); }
  if (J.talisman && INDEX[J.talisman]) (INDEX[J.talisman].effets || []).forEach(appliquer);
  for (const t of J.transformations) (INDEX[t].effets || []).forEach(appliquer);
  for (const sy of synergiesActives(J)) (sy.effets || []).forEach(appliquer);
  for (const b of J.bonus) appliquer(b);                // bonus temporaires (salle, secondes, étage)
  for (const b of J.bonusPermanents) appliquer(b);      // pilules, sacrifices, pactes spéciaux
  return M;
}
function calculerStats(J) {
  const base = J.def.stats; const M = modificateursStats(J);
  const S = {};
  for (const k of Object.keys(BORNES_STATS)) {
    const m = M[k] || { a: 0, p: 0, m: 1 };
    let v = (base[k] + m.a) * (1 + m.p / 100) * m.m;
    let [mi, ma] = BORNES_STATS[k];
    if (k === 'cadence') ma += ((M.plafondCadence || {}).a || 0);
    S[k] = borne(v, mi, ma);
  }
  if (J.drapeaux.obstination) S.degats += 1;
  if (J._plein && J.drapeaux.pleineVitalite) S.degats += 0.5;
  if (J.sage && J.drapeaux.energieNaturelle) S.degats *= J.drapeaux.sageFort ? 1.6 : 1.5;
  S.degats = Math.round(S.degats * 100) / 100;
  return S;
}

// ── Profil d'attaque : forme principale par priorité + contributions secondaires ──
// Priorité (la plus haute devient le tir principal) — registre §R17.
const PRIORITE_FORMES = ['frappe', 'controle', 'rayon', 'faisceau', 'orbe', 'charge_libre', 'lame_longue', 'lame', 'bombe', 'boomerang', 'laser', 'rotation', 'projectile'];
// Coefficient par émission selon le nombre total d'émissions (multitir)
const COEF_MULTI = [1, 1, 0.7, 0.58, 0.5, 0.45, 0.42, 0.4, 0.38];
function coefMulti(n) { return COEF_MULTI[Math.min(8, n)] || 0.38; }

function calculerProfil(J) {
  const P = {
    forme: J.def.tir.forme || 'projectile', formes: new Set(), params: {}, multi: J.def.tir.multi || 1, coefCadence: 1,
    arriere: 0, croix: 0, salve: 0, traj: {}, impacts: [], statuts: [], taille: 1, recul: 1, coefDegats: 1,
    apparence: J.def.tir.apparence || 'kunai', elements: new Set(), source: J.def.tir.source || null, differe: !!J.def.tir.differe,
    chargeable: false, spectral: false, perce: 0, rebonds: 0,
  };
  P.formes.add(P.forme);
  if (P.forme === 'charge_libre') P.params.charge_libre = { charge: 0.8, min: 0.5, max: 3 };
  if (P.forme === 'lame') P.params.lame = { portee: J.def.stats.portee, arc: 100, coef: 1, duree: 0.1 };
  const tous = [];
  for (const id of J.passifs) { const d = INDEX[id]; if (d && d.effets) for (const e of d.effets) tous.push([e, d]); }
  for (const t of J.transformations) for (const e of (INDEX[t].effets || [])) tous.push([e, INDEX[t]]);
  if (J.talisman && INDEX[J.talisman]) for (const e of (INDEX[J.talisman].effets || [])) tous.push([e, INDEX[J.talisman]]);
  for (const sy of synergiesActives(J)) for (const e of (sy.effets || [])) tous.push([e, sy]);
  for (const b of J.bonus) if (b.tir) tous.push([b.tir, { id: 'bonus' }]);
  for (const [e, d] of tous) {
    if (e.forme) { P.formes.add(e.forme); P.params[e.forme] = Object.assign({}, P.params[e.forme] || {}, e); }
    if (e.multi) { P.multi += e.multi; if (e.coefCadence) P.coefCadence *= e.coefCadence; }
    if (e.arriere) P.arriere = Math.max(P.arriere, e.arriere);
    if (e.croix) P.croix += e.croix;
    if (e.salve) { P.salve += e.salve; if (e.coefCadence) P.coefCadence *= e.coefCadence; }
    if (e.traj) { P.traj[e.traj] = (P.traj[e.traj] || 0) + (e.force || 1); }
    if (e.impact) P.impacts.push(e);
    if (e.statut) P.statuts.push(e);
    if (e.taille) P.taille *= e.taille;
    if (e.recul) P.recul *= e.recul;
    if (e.coefDegats) P.coefDegats *= e.coefDegats;
    if (e.cadenceTir) P.coefCadence *= e.cadenceTir;
    if (e.element) P.elements.add(e.element);
    if (e.apparence) P.apparence = e.apparence;
  }
  // Forme principale : la plus prioritaire présente
  for (const f of PRIORITE_FORMES) if (P.formes.has(f)) { P.forme = f; break; }
  P.secondaires = [...P.formes].filter(f => f !== P.forme && f !== 'projectile');
  // Contributions secondaires (table §R17b) : chaque forme non principale se convertit
  for (const f of P.secondaires) {
    if (f === 'orbe' || f === 'charge_libre') P.chargeable = true;                // le tir principal se charge
    else if (f === 'rayon') { P.spectral = true; P.perce = 99; P.coefDegats *= 1.3; }
    else if (f === 'laser') P.laserAppoint = true;                                  // un trait d'appoint par cycle (×0,5)
    else if (f === 'faisceau') P.traj.continu = 1;                                 // les impacts laissent un court faisceau
    else if (f === 'boomerang') P.traj.retour = 1;
    else if (f === 'lame' || f === 'lame_longue') P.frappeAppoint = f;              // coup d'appoint devant soi
    else if (f === 'bombe') P.impacts.push({ impact: 'explosion', r: 1.0, coef: 0.5, source: 'bombe' });
    else if (f === 'frappe') P.frappeDifferee = 3;                                 // un cycle sur 3 : frappe au sol
    else if (f === 'controle') P.orbeAppoint = true;                                // une sphère contrôlée d'appoint (×0,5)
    else if (f === 'rotation') P.deviation = true;                                  // dévie les projectiles proches en tirant
  }
  if (P.traj.percant) P.perce = 99;
  if (P.traj.spectral) P.spectral = true;
  if (P.traj.rebond) P.rebonds = 3 * P.traj.rebond;
  // Multitir : coefficient global selon le nombre d'émissions
  P.multi = Math.min(8, P.multi); P.coefMulti = coefMulti(P.multi);
  return P;
}

// ── Inventaire ──
function possede(J, id) { return J.passifs.includes(id); }
function nbCopies(J, id) { return J.passifs.filter(x => x === id).length; }
function recalculer(J) {
  // drapeaux : ceux du personnage, puis ceux des objets, talismans et transformations
  const obst = J.drapeaux && J.drapeaux.obstination;
  J.drapeaux = Object.assign({}, J.drapeauxBase || {}); if (obst) J.drapeaux.obstination = true;
  const sources = J.passifs.map(id => INDEX[id]).concat(J.transformations.map(t => INDEX[t]), J.talisman ? [INDEX[J.talisman]] : [], J.talisman2 ? [INDEX[J.talisman2]] : [], synergiesActives(J));
  for (const d of sources) for (const e of (d && d.effets) || []) if (e.drapeau) J.drapeaux[e.drapeau] = e.valeur === undefined ? true : e.valeur;
  J.maxPoches = 1 + (J.drapeaux.pocheDouble ? 1 : 0); J.maxTalismans = 1 + (J.drapeaux.talismanDouble ? 1 : 0);
  J.stats = calculerStats(J); J.profil = calculerProfil(J);
  J.vol = J.passifs.some(id => (INDEX[id].effets || []).some(e => e.vol)) || J.transformations.some(t => (INDEX[t].effets || []).some(e => e.vol)) || J.bonus.some(b => b.vol);
  majMutations(J);
}
// Acquisition d'un passif (règles de doublons : cumul / conversion / unique)
function acquerirPassif(J, id, source = 'piedestal') {
  const d = INDEX[id]; if (!d) return;
  if (d.cumul === 'conversion' && possede(J, id)) { appliquerConversion(J, d); evenement('objet_acquis', { id, doublon: true }); return; }
  J.passifs.push(id);
  const premiere = !J.acquis.includes(id);
  if (premiere) J.acquis.push(id);
  for (const e of d.effets || []) appliquerEffetImmediat(J, e, d);
  if (premiere && d.ensemble) verifierTransformations(J);
  recalculer(J);
  if (G.etage && (d.effets || []).some(e => e.drapeau === 'plan' || e.drapeau === 'boussole' || e.drapeau === 'byakugan')) revelerPlan(J);
  evenement('objet_acquis', { id, source });
  Progression.decouvrir(id);
}
function appliquerConversion(J, d) { // doublon converti : effet documenté dans d.conversion
  const c = d.conversion || { res: { ryo: 5 } };
  appliquerEffetImmediat(J, c, d);
}
function retirerPassif(J, id) {
  const k = J.passifs.lastIndexOf(id); if (k < 0) return false;
  J.passifs.splice(k, 1); recalculer(J); evenement('objet_retire', { id }); return true;
}
// Effets à l'acquisition : santé, ressources, familiers
function appliquerEffetImmediat(J, e, d) {
  const S = J.sante;
  if (e.sante) {
    const s = e.sante;
    if (s.cont) { if (J.drapeaux.sansVitalite) ajouterProtection(S, 2 * s.cont); else if (J.drapeaux.plafondVit && nbVit(S) >= J.drapeaux.plafondVit) soignerRouge(S, 2 * s.cont); else ajouterConteneur(S, s.cont, s.plein !== false); }
    if (s.soin) soignerJoueur(J, s.soin);
    if (s.soinTotal) soignerJoueur(J, 24);
    if (s.prot) ajouterProtection(S, s.prot, 'b');
    if (s.instable) ajouterProtection(S, s.instable, 'n');
    if (s.os) ajouterOs(S, s.os);
    if (s.partiel) ajouterPartiel(S);
    if (s.cicatrice) ajouterCicatrice(S, s.cicatrice);
    if (s.retraitCont) retirerConteneur(S, s.retraitCont);
  }
  if (e.res) { for (const [k, v] of Object.entries(e.res)) ajouterRessource(J, k, v); }
  if (e.familier) ajouterFamilier(J, e.familier, d.id);
  if (e.consommable) donnerConsommable(J, e.consommable);
}
function soignerJoueur(J, demis) {
  if (J.drapeaux.sansVitalite) return 0;
  const exces = soignerRouge(J.sante, demis);
  if (exces > 0) evenement('soin_excedentaire', { demis: exces });
  return demis - exces;
}
const PLAFONDS_RESSOURCES = { ryo: 99, cles: 99, explosifs: 99 };
function ajouterRessource(J, k, v) {
  J[k] = borne((J[k] || 0) + v, 0, PLAFONDS_RESSOURCES[k] || 99);
}

// ── Transformations (résonances de chakra) ──
// Compte : identifiants distincts acquis au moins une fois pendant la partie (historique),
// actifs compris ; un même identifiant ne compte qu'une fois, même repris sur un piédestal.
function verifierTransformations(J) {
  for (const t of DON.transformations) {
    if (J.transformations.includes(t.id)) continue;
    const n = J.acquis.filter(id => INDEX[id] && INDEX[id].ensemble === t.ensemble).length;
    if (n >= (t.seuil || 3)) {
      J.transformations.push(t.id);
      for (const e of t.effets || []) appliquerEffetImmediat(J, e, t);
      recalculer(J);
      annoncerTransformation(t);
      evenement('transformation', { id: t.id });
      Progression.decouvrir(t.id);
    }
  }
}

// ── Mutations visuelles cumulatives (couches, priorités, fusion) ──
const COUCHES = ['aura', 'dos', 'corps', 'bras', 'peau', 'yeux', 'tete', 'orbitaux'];
function majMutations(J) {
  const m = [];
  const ajouter = (src, v) => { if (v) m.push(Object.assign({ src, prio: v.prio || 1 }, v)); };
  for (const id of J.passifs) ajouter(id, INDEX[id].visuel);
  for (const t of J.transformations) ajouter(t, Object.assign({ prio: 10 }, INDEX[t].visuel));
  // une couche = une mutation visible (priorité la plus haute) ; les autres restent consultables
  const parCouche = {};
  for (const v of m) { if (!v.couche) continue; const c = parCouche[v.couche]; if (!c || v.prio > c.prio) parCouche[v.couche] = v; }
  J.mutations = parCouche; J.mutationsToutes = m;
}

// ── Pools : sélection pondérée, filtres, déplétion à l'apparition ──
// Un objet « généré » (posé sur un piédestal) est retiré de tous les pools de la partie.
function objetsDuPool(pool) { return DON.objets.filter(o => o.pools && o.pools[pool] > 0); }
function tirerObjet(partie, pool, alea, options = {}) {
  const J = partie.joueur;
  const filtre = o => {
    if (partie.retires.includes(o.id)) return false;
    if (!Progression.estDebloque(o.id)) return false;
    if (o.persoExclusif && o.persoExclusif !== J.def.id && o.persoExclusif !== J.def.parent) return false;
    if (o.exclusion && o.exclusion.some(x => J.drapeaux[x])) return false;           // objet réellement sans fonction
    if (o.type === 'actif' && options.passifSeulement) return false;
    if (options.qualiteMin !== undefined && (o.qualite || 0) < options.qualiteMin) return false;
    if (options.qualiteMax !== undefined && (o.qualite || 0) > options.qualiteMax) return false;
    return true;
  };
  let cands = objetsDuPool(pool).filter(filtre);
  if (!cands.length && pool !== 'heritage') cands = objetsDuPool('heritage').filter(filtre); // épuisement : repli sur l'héritage
  if (!cands.length) return 'PSV_083';                                                     // repli final : Bol de ramen
  const o = alea.pondere(cands, x => x.pools[pool] || x.pools.heritage || 1);
  if (!o) return 'PSV_083';
  partie.retires.push(o.id);
  return o.id;
}

// Exploration : plan (salles), boussole (icônes spéciales), Byakugan (tout, secrets compris)
function revelerPlan(J) {
  for (const s of Object.values(G.etage.salles)) {
    if (s.id === 'opp') continue;
    const secret = s.type === 'cache' || s.type === 'isolee';
    if (J.drapeaux.byakugan) s.apercue = true;
    else if (J.drapeaux.plan && !secret) s.apercue = true;
    else if (J.drapeaux.boussole && !secret && s.type !== 'combat') s.apercue = true;
  }
}
