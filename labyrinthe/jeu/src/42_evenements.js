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
  if (J.talisman) for (const e of INDEX[J.talisman].effets || []) if (e.quand) L.push([e, INDEX[J.talisman]]);
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
    case 'familier': { const f = ajouterFamilier(J, A.familier, src.id); if (A.salle) f.dureeSalle = true; break; }
    case 'statut_proches': for (const e of G.ennemis) if (!e.mort && dist(e.x, e.y, J.x, J.y) < (A.r || 2) * TUILE) appliquerStatut(e, A.statut, A.duree || 2, deg); break;
    case 'invisibilite': G.appat = { x: J.x + 999, y: J.y + 999, fini: false }; setTimeoutJeu(() => { if (G.appat) G.appat.fini = true; }, A.duree || 3); break;
    case 'allie': if (data.e && !data.e.boss) { const f = creerEnnemi(data.e.id, data.e.x, data.e.y, { sansApparition: true }); f.allie = true; f.statuts.charme = { t: A.duree || 10 }; setTimeoutJeu(() => { if (!f.mort) { f.mort = true; G.effets.push({ type: 'fumee', x: f.x, y: f.y, age: 0, duree: 0.4 }); } }, A.duree || 10); } break;
    case 'revelation': if (G.salle.portes.some(p => p.etat === 'secrete')) signalerSecrets(G.salle); break;
    case 'interets': { const n = Math.min(10, Math.floor(J.ryo * 0.1)); if (n > 0) { ajouterRessource(J, 'ryo', n); G.textes.push({ x: J.x, y: J.y - 34, t: 'Intérêts : +' + n + ' Ryō', age: 0, duree: 1.2, couleur: '#f0c040' }); } break; }
    case 'ressource_sante': ajouterConteneur(J.sante, 1, true); Son.jouer('coeur'); break;
    case 'contenant_vide': ajouterConteneur(J.sante, 1, false); break;
    case 'mue': if (J.sante.prot.length === 0 && !G.etage.mueUtilisee) { G.etage.mueUtilisee = true; ajouterProtection(J.sante, 2); G.effets.push({ type: 'mue', x: J.x, y: J.y, age: 0, duree: 0.8 }); Son.jouer('fumee'); } break;
    case 'tir_bonus': { const d = Entrees.visee.dir || J.tir.dir; const a = Math.atan2(DIRS[d][1], DIRS[d][0]) + (Math.random() - 0.5) * 0.3; creerProjectileJoueur(J, J.x, J.y - 12, a, J.stats.degats, ++_cycle, { n: 2 }); break; }
    case 'pluie_armes': for (let i = 0; i < (A.n || 8); i++) setTimeoutJeu(() => { const c = G.ennemis.filter(e => !e.mort && !e.cache); const cible = c[Math.floor(Math.random() * c.length)]; const x = cible ? cible.x + (Math.random() - 0.5) * 20 : J.x + (Math.random() - 0.5) * 200, y = cible ? cible.y : J.y + (Math.random() - 0.5) * 120; G.effets.push({ type: 'frappe_sol', x, y, age: 0, duree: 0.45, deg: deg * (A.coef || 1.5), r: 14, proprio: 'joueur', petite: true, arme: true }); }, i * 0.08); break;
  }
}

// ── Synergies documentées : actives quand tous les composants sont possédés ──
function synergiesActives(J) {
  if (J._synCache && J._synCle === J.passifs.length + ':' + J.transformations.length) return J._synCache;
  const L = DON.synergies.filter(s => s.effets && s.effets.length && s.composants.every(c => J.passifs.includes(c) || J.acquis.includes(c) && INDEX[c] && INDEX[c].type === 'actif' && J.actif && J.actif.id === c));
  J._synCache = L; J._synCle = J.passifs.length + ':' + J.transformations.length; return L;
}
function annoncerTransformation(t) {
  G.banniere = { t: 0, nom: t.nom, desc: t.desc, transformation: true };
  G.effets.push({ type: 'transformation', x: G.joueur.x, y: G.joueur.y - 12, age: 0, duree: 1.0 });
  Son.jouer('transformation'); secousse(5, null);
}
