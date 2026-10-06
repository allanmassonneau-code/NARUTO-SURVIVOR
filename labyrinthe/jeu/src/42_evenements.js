// ═══════════════════════════════════════════════════════════════════════════
// Vocabulaire d'événements de gameplay (registre §R40) : entree_salle,
// salle_nettoyee, emission_primaire, impact, elimination, degat_recu,
// cout_paye, sacrifice, objet_acquis, objet_retire, transformation,
// ryo_ramasse, etage, explosion, actif_utilise, consommable_utilise, achat…
// Les événements cosmétiques ne déclenchent jamais d'effet de gameplay.
// ═══════════════════════════════════════════════════════════════════════════

function sourcesDeclencheurs(J) {
  const L = [];
  for (const id of J.passifs) { const d = INDEX[id]; if (d.effets) for (const e of d.effets) if (e.quand) L.push([e, d]); }
  for (const t of J.transformations) for (const e of INDEX[t].effets || []) if (e.quand) L.push([e, INDEX[t]]);
  for (const t of [J.talisman, J.talisman2]) if (t) for (const e of INDEX[t].effets || []) if (e.quand) L.push([e, INDEX[t]]);
  for (const s of synergiesActives(J)) for (const e of s.effets || []) if (e.quand) L.push([e, s]);
  return L;
}
function evenement(nom, data = {}) {
  const J = G.joueur; if (!J || !G.salle) return;
  Progression.surEvenement(nom, data);
  for (const [e, d] of sourcesDeclencheurs(J)) {
    if (e.quand !== nom) continue;
    if (e.si && !conditionDeclencheur(e.si, J, data)) continue;
    if (e.tousLes) { J.compteurs['tl_' + d.id] = (J.compteurs['tl_' + d.id] || 0) + 1; if (J.compteurs['tl_' + d.id] % e.tousLes !== 0) continue; }
    const cle = 'cd_' + d.id + '_' + nom;
    if (e.cooldown && G.temps - (J.compteurs[cle] || -99) < e.cooldown) continue;
    const ch = e.chance === undefined ? 1 : Math.min(e.max || 1, e.chance + (e.chanceParChance || 0) * J.stats.chance);
    if (Math.random() >= ch) continue;
    J.compteurs[cle] = G.temps;
    executerAction(e.faire, J, data, d);
  }
  // règles de personnage liées aux événements
  if (nom === 'soin_excedentaire' && J.def.regleCode === 'controle_chakra') J.force = Math.min(6, J.force + data.demis);
}
function conditionDeclencheur(si, J, data) {
  switch (si) {
    case 'santeBasse': return santeTotale(J.sante) <= 2;
    case 'combat': return !!G.salle.combat;
    case 'boss': return G.salle.type === 'boss';
    case 'vitaliteTouchee': return data.res && data.res.perduRouge > 0;
    case 'ennemiNonBoss': return data.e && !data.e.boss;
    case 'pleineVitalite': return rougeTotal(J.sante) >= rougeMax(J.sante) && rougeMax(J.sante) > 0;
    default: return true;
  }
}
function executerAction(A, J, data, src) {
  if (!A) return;
  const deg = J.stats.degats;
  switch (A.type) {
    case 'projectiles_cercle': { const x = data.e ? data.e.x : J.x, y = data.e ? data.e.y - 8 : J.y - 10; for (let i = 0; i < (A.n || 8); i++) { const a = i * Math.PI * 2 / (A.n || 8); const p = creerProjectileJoueur(J, x, y, a, deg * (A.coef || 1), ++_cycle, { n: 2 }); p.gen = 1; p.impacts = []; if (A.apparence) p.apparence = A.apparence; } break; }
    case 'soin': soignerJoueur(J, A.demis || 1); G.effets.push({ type: 'soin', x: J.x, y: J.y - 20, age: 0, duree: 0.6 }); Son.jouer('coeur', 0.6); break;
    case 'protection': ajouterProtection(J.sante, A.demis || 1, A.instable ? 'n' : 'b'); Son.jouer('protection', 0.6); break;
    case 'ressource': for (const [k, v] of Object.entries(A.res)) ajouterRessource(J, k, v); break;
    case 'bonus': ajouterBonus(J, Object.assign({ duree: A.duree || 'salle', source: src.id, cumulMax: A.cumulMax }, A.bonus)); if (A.cumulMax) { const L = J.bonus.filter(b => b.source === src.id); if (L.length > A.cumulMax) { J.bonus.splice(J.bonus.indexOf(L[0]), 1); recalculer(J); } } break;
    case 'bonus_permanent': J.bonusPermanents.push(Object.assign({}, A.bonus)); recalculer(J); break;
    case 'explosion': { const x = data.e ? data.e.x : J.x, y = data.e ? data.e.y : J.y; explosion(x, y, (A.r || 1.2) * TUILE, A.degats || deg * (A.coef || 2), { proprio: 'joueur', blesseJoueur: false, petite: !!A.petite }); break; }
    case 'degats_tous': for (const e of G.ennemis) if (!e.mort && !e.cache) infligerDegats(e, A.degats || deg * (A.coef || 1), { proprio: 'joueur', type: 'declencheur', sansRecul: true }); G.effets.push({ type: 'onde', x: J.x, y: J.y, r: 400, age: 0, duree: 0.3, couleur: A.couleur || '#c02040' }); break;
    case 'ramassable': { const x = data.e ? data.e.x : J.x + 12, y = data.e ? data.e.y : J.y; creerRamassable(A.ramassable, x, y, {}); break; }
    case 'charge_actif': chargerActif(J, A.n || 1, 'declencheur'); break;
    case 'zone': { const x = data.e ? data.e.x : J.x, y = data.e ? data.e.y : J.y; creerZone(x, y, A.zone || 'feu_allie', A.duree || 3, { r: A.r || 18, dps: deg * (A.coef || 0.6) }); break; }
    case 'familier': { const f = ajouterFamilier(J, A.familier, src.id); if (A.salle) f.dureeSalle = true; break; }
    case 'statut_proches': { const x = data.e ? data.e.x : J.x, y = data.e ? data.e.y : J.y; for (const e of G.ennemis) if (!e.mort && dist(e.x, e.y, x, y) < (A.r || 2) * TUILE) appliquerStatut(e, A.statut, A.duree || 2, deg); G.effets.push({ type: 'onde', x, y: y - 6, r: (A.r || 2) * TUILE, age: 0, duree: 0.4, couleur: COUL_STATUTS[A.statut] || '#e0e0ff' }); break; }
    case 'manteau': { // chakra de la bête : bonus minutés (dégâts, vitesse, brûlure au contact) et aura visible
      const cle = src.id + '_manteau', d = A.duree || 5; J.bonus = J.bonus.filter(b => b.source !== cle); G.effets = G.effets.filter(e => e.type !== 'manteau');
      J.bonus.push({ s: 'degats', a: 1, duree: d, t: d, source: cle }, { s: 'vitesse', a: 0.4, duree: d, t: d, source: cle, drapeau: 'auraContact' }); recalculer(J);
      G.effets.push({ type: 'manteau', x: J.x, y: J.y, age: 0, duree: d, attache: true }); Son.jouer('transformation', 0.5); secousse(3, null); break;
    }
    case 'foudre_ciel': { const c = G.ennemis.filter(e => !e.mort && !e.cache && !e.allie && !e.statuts.charme).sort((a, b) => dist(a.x, a.y, J.x, J.y) - dist(b.x, b.y, J.x, J.y))[0]; if (!c) break; G.effets.push({ type: 'foudre_ciel', x: c.x, y: c.y, age: 0, duree: 0.35 }); infligerDegats(c, deg * (A.coef || 4), { proprio: 'joueur', type: 'foudre' }); if (!c.mort) chaineFoudre(c, deg * 1.2, 2, 3 * TUILE, 1); secousse(4, null); Son.jouer('eclair'); break; }
    case 'jinton': { const d = data.dir || Entrees.visee.dir || J.tir.dir; rayonJinton(J, viseeAssistee(J, Math.atan2(DIRS[d][1], DIRS[d][0]), 13 * TUILE, 0.5), deg * (A.coef || 3)); break; }
    case 'invisibilite': G.appat = { x: J.x + 999, y: J.y + 999, fini: false }; setTimeoutJeu(() => { if (G.appat) G.appat.fini = true; }, A.duree || 3); break;
    case 'allie': if (data.e && !data.e.boss) { const f = creerEnnemi(data.e.id, data.e.x, data.e.y, { sansApparition: true }); f.allie = true; f.statuts.charme = { t: A.duree || 10 }; setTimeoutJeu(() => { if (!f.mort) { f.mort = true; G.effets.push({ type: 'fumee', x: f.x, y: f.y, age: 0, duree: 0.4 }); } }, A.duree || 10); } break;
    case 'revelation': if (G.salle.portes.some(p => p.etat === 'secrete')) signalerSecrets(G.salle); break;
    case 'interets': { const n = Math.min(10, Math.floor(J.ryo * 0.1)); if (n > 0) { ajouterRessource(J, 'ryo', n); G.textes.push({ x: J.x, y: J.y - 34, t: 'Intérêts : +' + n + ' Ryō', age: 0, duree: 1.2, couleur: '#f0c040' }); } break; }
    case 'ressource_sante': ajouterConteneur(J.sante, 1, true); Son.jouer('coeur'); break;
    case 'contenant_vide': ajouterConteneur(J.sante, 1, false); break;
    case 'mue': if (J.sante.prot.length === 0 && !G.etage.mueUtilisee) { G.etage.mueUtilisee = true; ajouterProtection(J.sante, 2); G.effets.push({ type: 'mue', x: J.x, y: J.y, age: 0, duree: 0.8 }); Son.jouer('fumee'); } break;
    case 'lame_vent': { // Danseur du vent : une lame d'air part vers l'ennemi le plus proche
      const c = G.ennemis.filter(e => !e.mort && !e.cache && !e.allie && !e.statuts.charme).sort((a, b) => dist(a.x, a.y, J.x, J.y) - dist(b.x, b.y, J.x, J.y))[0]; if (!c) break;
      const p = creerProjectileJoueur(J, J.x, J.y - 12, Math.atan2(c.y - (c.hauteur || 8) - (J.y - 12), c.x - J.x), deg * (A.coef || 2), ++_cycle, { n: 2 }, { appoint: true });
      p.apparence = 'vent'; p.perce = Math.max(p.perce, 1); p.gen = 1; Son.jouer('vent', 0.5); break;
    }
    case 'tir_bonus': { const d = Entrees.visee.dir || J.tir.dir; const a = Math.atan2(DIRS[d][1], DIRS[d][0]) + (Math.random() - 0.5) * 0.3; creerProjectileJoueur(J, J.x, J.y - 12, a, J.stats.degats, ++_cycle, { n: 2 }); break; }
    case 'pluie_armes': for (let i = 0; i < (A.n || 8); i++) setTimeoutJeu(() => { const c = G.ennemis.filter(e => !e.mort && !e.cache); const cible = c[Math.floor(Math.random() * c.length)]; const x = cible ? cible.x + (Math.random() - 0.5) * 20 : J.x + (Math.random() - 0.5) * 200, y = cible ? cible.y : J.y + (Math.random() - 0.5) * 120; G.effets.push({ type: 'frappe_sol', x, y, age: 0, duree: 0.45, deg: deg * (A.coef || 1.5), r: 14, proprio: 'joueur', petite: true, arme: true }); }, i * 0.08); break;
  }
}

// ── Synergies : paires et trios d'objets, ou fusions de natures (kekkei genkai) ──
const NOMS_NATURES = { katon: 'Katon', futon: 'Fūton', suiton: 'Suiton', raiton: 'Raiton', doton: 'Doton', hyoton: 'Hyōton' };
// natures portées par vos objets, transformations et talismans (les synergies n'en ajoutent pas)
function naturesJoueur(J) {
  const E = new Set(), voir = d => { for (const e of (d && d.effets) || []) if (e.element) E.add(e.element); };
  J.passifs.forEach(id => voir(INDEX[id])); J.transformations.forEach(t => voir(INDEX[t])); for (const t of [J.talisman, J.talisman2]) if (t) voir(INDEX[t]);
  return E;
}
function synergieReunie(J, s, E) {
  if (!s.composants.length && !(s.elements && s.elements.length)) return false;
  return s.composants.every(c => J.passifs.includes(c) || J.acquis.includes(c) && INDEX[c] && INDEX[c].type === 'actif' && J.actif && J.actif.id === c) && (!s.elements || s.elements.every(n => E.has(n)));
}
// la clé change avec les passifs (permutation comprise), les transformations, l'actif tenu et les talismans
function cleSynergies(J) { return J.passifs.join(',') + '|' + J.transformations.length + '|' + (J.actif ? J.actif.id : '') + '|' + (J.talisman || '') + '|' + (J.talisman2 || ''); }
function synergiesReunies(J) {
  const k = cleSynergies(J); if (J._synToutes && J._synToutesCle === k) return J._synToutes;
  const E = naturesJoueur(J); J._synToutes = DON.synergies.filter(s => synergieReunie(J, s, E)); J._synToutesCle = k; return J._synToutes;
}
function synergiesActives(J) {
  const k = cleSynergies(J); if (J._synCache && J._synCle === k) return J._synCache;
  J._synCache = synergiesReunies(J).filter(s => s.effets && s.effets.length); J._synCle = k; return J._synCache;
}
// Une synergie nouvellement réunie s'annonce (bandeau turquoise, son) et s'inscrit au registre
function annoncerSynergies(J) {
  if (!J.synergiesVues) J.synergiesVues = [];
  for (const s of synergiesReunies(J)) {
    if (J.synergiesVues.includes(s.id)) continue;
    J.synergiesVues.push(s.id);
    if (Progression.profil && !Progression.profil.decouverts.includes(s.id)) { Progression.decouvrir(s.id); Progression.compteur('synergies', 1); }
    if (s.type === 'fusion') Progression.verifier({ type: 'etat', nom: 'fusion' });
    if (G.partie && G.joueur === J) { annoncer({ t: 0, nom: 'Synergie : ' + s.nom, desc: s.desc, synergie: true, mineur: !(s.effets && s.effets.length) }); Son.jouer('sceau'); }
  }
}
// Attraction magnétique (Jiton) : tire les ennemis proches vers un point
function attirer(x, y, r, force) {
  for (const e of G.ennemis) { if (e.mort || e.cache || e.boss || e.def.fixe || e.def.lourd) continue; const d = dist(e.x, e.y, x, y); if (d < r && d > 6) { e.vx += (x - e.x) / d * force; e.vy += (y - e.y) / d * force; } }
  G.effets.push({ type: 'attraction', x, y, r, age: 0, duree: 0.35 });
}
// Visée assistée : l'ennemi le mieux aligné dans un cône autour de la direction de tir
function viseeAssistee(J, a, portee, cone) {
  let best = null, score = Infinity;
  for (const e of G.ennemis) {
    if (e.mort || e.cache || e.intangible || e.allie || e.apparition > 0) continue;
    const dx = e.x - J.x, dy = (e.y - (e.hauteur || 8)) - (J.y - 10), d = Math.hypot(dx, dy); if (d > portee) continue;
    const ec = Math.abs(Math.atan2(Math.sin(Math.atan2(dy, dx) - a), Math.cos(Math.atan2(dy, dx) - a))); if (ec > cone) continue;
    const sc = ec * 3 + d / portee; if (sc < score) { score = sc; best = Math.atan2(dy, dx); }
  }
  return best === null ? a : best;
}
// Rayon de particules (Jinton) : tout ce qu'il traverse est frappé, obstacles compris ; les murs l'arrêtent
function rayonJinton(J, a, deg) {
  const x = J.x, y = J.y - 10, ca = Math.cos(a), sa = Math.sin(a); let l = 8;
  while (l < 13 * TUILE) { const t = tuilePx(G.salle, x + ca * (l + 4), J.y + sa * (l + 4)); if (t === T.VIDE || t === T.PORTE || PROP[t].mur) break; l += 4; }
  for (const e of ennemisSurSegment(x, y, a, l, 12)) infligerDegats(e, deg, { proprio: 'joueur', type: 'jinton', vx: Math.cos(a), vy: Math.sin(a), recul: 30 });
  G.effets.push({ type: 'jinton', x, y, a, l, age: 0, duree: 0.4 }); secousse(3, a); Son.jouer('laser');
}
const COUL_STATUTS = { confus: '#c8a0ff', immobilise: '#ffe080', ralenti: '#80c8ff', poison: '#8ae05a', brulure: '#ff8a3a', gel: '#bfe8ff', charme: '#ff8ac8', peur: '#b0b0b8' };
function annoncerTransformation(t) {
  annoncer({ t: 0, nom: t.nom, desc: t.desc, transformation: true });
  G.effets.push({ type: 'transformation', x: G.joueur.x, y: G.joueur.y - 12, age: 0, duree: 1.0 });
  Son.jouer('transformation'); secousse(5, null);
}
