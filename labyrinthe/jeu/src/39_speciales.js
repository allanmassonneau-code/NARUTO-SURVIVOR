// ═══════════════════════════════════════════════════════════════════════════
// Salles spéciales : piédestaux (choix liés, prix, relances), échoppe,
// pactes interdits / sanctuaires (table de décision), autel de tribut,
// chambre maudite, épreuves, dispositifs et informateurs, bibliothèque,
// chambre forte, source chaude, sortie et routes.
// ═══════════════════════════════════════════════════════════════════════════

// ── Piédestaux ──
function poserPiedestal(s, x, y, id, o = {}) {
  const p = { x, y, id, prix: o.prix || null, groupe: o.groupe || null, pool: o.pool || null, uid: Math.random().toString(36).slice(2), cycle: 0, charges: o.charges, age: 0, apparu: 0 };
  if (INDEX[id] && INDEX[id].type === 'actif' && p.charges === undefined) p.charges = chargesMax(INDEX[id]);
  s.piedestaux.push(p); G.partie.vus.includes(id) || G.partie.vus.push(id); Progression.voir(id);
  return p;
}
function prixObjet(id, sorte) {
  const q = (INDEX[id] && INDEX[id].qualite) || 1;
  if (sorte === 'pacte') return { type: 'pacte', n: q >= 3 ? 2 : 1 };
  return { type: 'ryo', n: [10, 10, 15, 20, 25][q] || 15 };
}
// Prix effectif en Ryō : soldes (moitié, arrondi au-dessus) puis coupon (premier achat de l'étage gratuit)
function prixRyo(p) {
  const J = G.joueur; let n = p.prix.n;
  if (J.drapeaux.soldes) n = Math.max(1, Math.ceil(n / 2));
  if (J.drapeaux.coupon && G.etage && !G.etage.couponUtilise) n = 0;
  return n;
}
const PRIX_RAMASSABLES = { coeur: 3, cle: 5, explosif: 5, rouleau: 5, protection: 5, pilule: 4, condensateur: 6, coeur_double: 5 };

function preparerSalleSpeciale(s) {
  const P = G.partie, J = G.joueur, al = G.alea.butin; const speciaux = s.pointsSpeciaux || [];
  const pos = c => speciaux.filter(p => p.c === c).map(p => centreTuile(p.tx, p.ty));
  switch (s.type) {
    case 'heritage': {
      const L = pos('I'); const [x, y] = L[0] || centreSalle(s);
      const choix = (J.def.regleCode === 'stratege' || possede(J, 'PSV_126')) ? 2 : 1;
      if (choix === 1) poserPiedestal(s, x, y, tirerObjet(P, 'heritage', al), { pool: 'heritage' });
      else { const g = 'h' + s.id; poserPiedestal(s, x - 40, y, tirerObjet(P, 'heritage', al), { groupe: g, pool: 'heritage' }); poserPiedestal(s, x + 40, y, tirerObjet(P, 'heritage', al), { groupe: g, pool: 'heritage' }); }
      break;
    }
    case 'boutique': {
      const L = pos('S'); const niveau = Progression.niveauBoutique();
      const nbObjets = 2 + (possede(J, 'PSV_124') ? 1 : 0);
      L.forEach(([x, y], i) => {
        let pe;
        if (i < nbObjets) { const id = tirerObjet(P, 'boutique', al); pe = poserPiedestal(s, x, y, id, { prix: prixObjet(id), pool: 'boutique' }); }
        else { const t = al.choix(['coeur', 'cle', 'explosif', 'rouleau', 'protection', 'pilule', 'condensateur', 'coeur']); pe = poserPiedestal(s, x, y, 'RAM:' + t, { prix: { type: 'ryo', n: PRIX_RAMASSABLES[t] } }); pe.ramassable = t; }
        if (al.chance(0.1 + niveau * 0.04)) { pe.prix.n = Math.max(1, Math.ceil(pe.prix.n / 2)); pe.solde = true; }
      });
      if (niveau >= 2 && L.length) { const [x, y] = L[L.length - 1]; const id = tirerObjet(P, 'boutique', al); poserPiedestal(s, x, y + 40, id, { prix: prixObjet(id), pool: 'boutique' }); }
      const A = pos('A')[0]; if (A) s.statue = { x: A[0], y: A[1], type: 'marchand', pv: 1 };
      break;
    }
    case 'cache': { const L = pos('I'); if (L.length) poserPiedestal(s, L[0][0], L[0][1], tirerObjet(P, 'cache', al), { pool: 'cache' }); else for (const [x, y] of pos('1').concat(pos('2'), pos('3'), pos('4'))) creerRamassable(al.choix(['ryo5', 'protection', 'cle', 'explosif2', 'ryo', 'rouleau']), x, y, { immobile: true }); break; }
    case 'isolee': { const L = pos('I'); const [x, y] = L[0] || centreSalle(s); if (al.chance(0.75)) poserPiedestal(s, x, y, tirerObjet(P, 'isolee', al), { pool: 'isolee' }); else for (let i = 0; i < 3; i++) creerRamassable(al.choix(['coeur', 'protection', 'instable']), x - 30 + i * 30, y, { immobile: true }); break; }
    case 'bibliotheque': { const L = pos('I'); const g = 'b' + s.id; for (const [x, y] of L) poserPiedestal(s, x, y, tirerObjet(P, 'bibliotheque', al), { groupe: g, pool: 'bibliotheque' }); break; }
    case 'defi': { const L = pos('I'); const [x, y] = L[0] || centreSalle(s); poserPiedestal(s, x, y, tirerObjet(P, 'defi', al), { pool: 'defi' }).declencheDefi = true; break; }
    case 'defi_boss': { const L = pos('I'); const g = 'db' + s.id; for (const [x, y] of L) { const pe = poserPiedestal(s, x, y, tirerObjet(P, 'boss', al), { groupe: g, pool: 'boss' }); pe.declencheDefi = true; } break; }
    case 'sacrifice': { const A = pos('A')[0] || centreSalle(s); s.autel = { x: A[0], y: A[1], paiements: 0 }; break; }
    case 'dispositifs': {
      const M = pos('M'); const types = al.melanger(['loterie', 'don_vital', 'diseuse', 'soin', 'recharge', 'troc']);
      M.forEach(([x, y], i) => s.machines.push({ x, y, type: types[i % types.length], usages: 0, uid: i }));
      const N = pos('N'); N.forEach(([x, y], i) => s.pnj.push({ x, y, type: al.choix(['voyageur', 'marchand_cles', 'artificier']), paye: 0, uid: i }));
      break;
    }
    case 'repos': { const A = pos('A')[0] || centreSalle(s); s.source = { x: A[0], y: A[1], utilisee: false }; break; }
    case 'pacte': case 'sanctuaire': preparerOpportunite(s); break;
  }
  // informateur occasionnel dans une salle de combat vide (chance faible)
  if (s.type === 'combat' && !s.ennemisDef.length && al.chance(0.25)) { const [cx, cy] = centreSalle(s); s.pnj.push({ x: cx, y: cy - 20, type: al.choix(['voyageur', 'voyageur', 'marchand_cles', 'artificier']), paye: 0, uid: 0 }); }
  if (s.type === 'combat' && !s.ennemisDef.length && al.chance(0.12)) { const [cx, cy] = centreSalle(s); s.machines.push({ x: cx + 40, y: cy - 20, type: al.choix(['loterie', 'don_vital']), usages: 0, uid: 9 }); }
}

// ── Interaction avec les piédestaux ──
function majPiedestaux(dt) {
  const s = G.salle, J = G.joueur; G.piedestalProche = null;
  for (const p of s.piedestaux) {
    p.age += dt;
    if (!p.id || J.etat !== 'normal') continue;
    const d = dist(p.x, p.y + 4, J.x, J.y);
    if (d < 34) G.piedestalProche = p;
    if (d > 14 || p.apparu > 0) continue;
    if (p.prix) { G.achatPropose = p; continue; }       // un achat se confirme (bouton d'interaction)
    if (G.transition || G.enAnimationObjet) continue;
    prendrePiedestal(p);
  }
  if (G.achatPropose && (!s.piedestaux.includes(G.achatPropose) || dist(G.achatPropose.x, G.achatPropose.y + 4, J.x, J.y) > 22)) G.achatPropose = null;
  if (G.achatPropose && Entrees.vientEnfonce('interagir')) acheter(G.achatPropose);
}
function peutPayer(p) {
  const J = G.joueur, pr = p.prix; if (!pr) return { ok: true };
  if (pr.type === 'ryo') return { ok: J.ryo >= prixRyo(p), manque: 'Ryō insuffisants' };
  if (pr.type === 'pacte') {
    if (J.drapeaux.pacteRyoOption && J.ryo >= 20 * pr.n) return { ok: true, ryo: 20 * pr.n };
    if (J.drapeaux.pacteRyo) return { ok: J.ryo >= pr.n * J.drapeaux.pacteRyo, manque: 'Ryō insuffisants', ryo: pr.n * J.drapeaux.pacteRyo };
    if (J.drapeaux.serment) return { ok: J.sante.prot.filter(x => x === 'n').length >= 3 * pr.n, manque: 'Chakra instable insuffisant', instable: 3 * pr.n };
    const d = prixPacteDetail(J.sante, pr.n);
    return { ok: !d.impossible, mortel: d.mortel, detail: d, manque: 'Santé insuffisante' };
  }
  return { ok: false };
}
function acheter(p) {
  const J = G.joueur, P = G.partie; const v = peutPayer(p);
  if (!v.ok) { Son.jouer('refus'); G.textes.push({ x: p.x, y: p.y - 30, t: v.manque, age: 0, duree: 1, couleur: '#ff8a6a' }); return; }
  if (v.mortel && !p.confirmeMortel) { p.confirmeMortel = true; Son.jouer('telegraphe'); G.textes.push({ x: p.x, y: p.y - 34, t: 'Ce paiement vous tuera. Confirmer à nouveau ?', age: 0, duree: 2, couleur: '#ff4a4a' }); return; }
  if (p.prix.type === 'ryo') { const n = prixRyo(p); J.ryo -= n; G.stats.depenses += n; if (J.drapeaux.coupon && !G.etage.couponUtilise) G.etage.couponUtilise = true; evenement('achat', { p }); Son.jouer('achat'); }
  else if (p.prix.type === 'pacte') {
    if (v.ryo) J.ryo -= v.ryo;
    else if (v.instable) { for (let i = 0; i < v.instable; i++) { const k = J.sante.prot.lastIndexOf('n'); if (k >= 0) J.sante.prot.splice(k, 1); } }
    else { if (v.detail.type === 'contenants') retirerConteneur(J.sante, p.prix.n); else J.sante.prot.splice(-v.detail.n); }
    evenement('cout_paye', { raison: 'pacte', n: p.prix.n });
    P.pactesAchetes++; if (J.drapeaux.serment) { J.bonusPermanents.push({ s: 'degats', a: 0.5 }); }
    Son.jouer('sceau'); Progression.compteur('pactes', 1);
    if (santeTotale(J.sante) <= 0) { verifierMort(J, { type: 'prix', raison: 'pacte' }); return; }
    // les autres offres du pacte restent achetables (pas de groupe lié)
  }
  G.achatPropose = null;
  if (p.ramassable) { const r = creerRamassable(p.ramassable, J.x, J.y, { immobile: true }); r.age = 1; collecter(r, J); if (!r.pris) { r.x = p.x; r.y = p.y + 14; } p.id = null; retirerPiedestalVide(); return; }
  p.prix = null; prendrePiedestal(p);
}
function prendrePiedestal(p) {
  const J = G.joueur, s = G.salle; const d = INDEX[p.id]; if (!d) return;
  // choix liés : prendre l'un fait disparaître les autres
  if (p.groupe) for (const q of s.piedestaux) if (q !== p && q.groupe === p.groupe) { q.id = null; G.effets.push({ type: 'fumee', x: q.x, y: q.y - 16, age: 0, duree: 0.4 }); }
  if (d.type === 'actif') {
    // l'actif remplacé reste sur le piédestal avec ses charges (anti-duplication)
    const ancien = J.deuxActifs && !J.actif2 ? null : J.actif;
    if (J.deuxActifs && !J.actif2 && J.actif) { J.actif2 = J.actif; }
    J.actif = { id: p.id, charges: p.charges ?? chargesMax(d) };
    if (ancien) { p.id = ancien.id; p.charges = ancien.charges; p.apparu = 0.6; } else p.id = null;
    if (!J.acquis.includes(d.id)) { J.acquis.push(d.id); if (d.ensemble) verifierTransformations(J); }
    Progression.decouvrir(d.id); evenement('objet_acquis', { id: d.id, actif: true });
  } else {
    p.id = null;
    acquerirPassif(J, d.id, 'piedestal');
  }
  G.stats.objets++;
  if (p.declencheDefi) demarrerDefi(s);
  animationObjet(d);
  retirerPiedestalVide();
}
function retirerPiedestalVide() { /* les piédestaux vides restent visibles (lecture de la salle) */ }

// Animation de prise d'un objet majeur (650–900 ms, accélérable, gameplay suspendu de façon cohérente)
function animationObjet(d) {
  G.enAnimationObjet = { d, t: 0, duree: G.reglages.confort ? 0.55 : 0.8 };
  G.joueur.etat = 'objet';
  G.banniere = { t: 0, nom: d.nom, desc: d.desc, mineur: false };
  Son.jouer('objet'); Entrees.vibrer('objet');
}
function majAnimationObjet(dt) {
  const A = G.enAnimationObjet; A.t += dt * (Entrees.enfonce('interagir') ? 2.5 : 1);
  if (A.t >= A.duree) { G.enAnimationObjet = null; G.joueur.etat = 'normal'; Entrees.consommer(); }
}

// ── Relances (réécriture d'empreinte) : chaque piédestal depuis son pool, choix liés conservés ──
function relancerPiedestaux(s, o = {}) {
  const P = G.partie; let n = 0;
  for (const p of s.piedestaux) {
    if (!p.id || p.ramassable || (INDEX[p.id] && INDEX[p.id].cle)) continue;   // ni ressources, ni objets-clés
    const pool = p.pool || 'heritage';
    let id = tirerObjet(P, pool, G.alea.butin, o.qualiteMin !== undefined ? { qualiteMin: o.qualiteMin } : {});
    if (possede(G.joueur, 'PSV_127') && (INDEX[id].qualite || 0) < (INDEX[p.id].qualite || 0)) id = tirerObjet(P, pool, G.alea.butin, { qualiteMin: INDEX[p.id].qualite || 0 });
    p.id = id; p.cycle++; p.apparu = 0.35; if (INDEX[id].type === 'actif') p.charges = chargesMax(INDEX[id]);
    if (p.prix && p.prix.type === 'ryo' && !p.solde) p.prix = prixObjet(id); // règle système : prix recalculé selon la qualité
    if (p.prix && p.prix.type === 'pacte') p.prix = prixObjet(id, 'pacte');
    G.effets.push({ type: 'reecriture', x: p.x, y: p.y - 16, age: 0, duree: 0.45 });
    n++;
  }
  return n;
}
// Rituel de permutation : reconstruit les passifs (même nombre, qualité libre), objets-clés exclus
function permuterPassifs(J) {
  const P = G.partie; const L = J.passifs.filter(id => !INDEX[id].cle);
  J.passifs = J.passifs.filter(id => INDEX[id].cle);
  for (let i = 0; i < L.length; i++) { const id = tirerObjet(P, 'heritage', G.alea.butin, { passifSeulement: true }); J.passifs.push(id); if (!J.acquis.includes(id)) J.acquis.push(id); }
  recalculer(J); verifierTransformations(J);
}
function reconstruireInventaire(J) { // Kakuzu altéré : un passif remplacé par un autre de même qualité
  const L = J.passifs.filter(id => !INDEX[id].cle); if (!L.length) return;
  const vieux = L[Math.floor(Math.random() * L.length)]; const q = INDEX[vieux].qualite || 0;
  const nouv = tirerObjet(G.partie, 'heritage', G.alea.butin, { qualiteMin: q, qualiteMax: q, passifSeulement: true });
  J.passifs[J.passifs.indexOf(vieux)] = nouv; if (!J.acquis.includes(nouv)) J.acquis.push(nouv);
  recalculer(J); verifierTransformations(J);
  G.textes.push({ t: INDEX[vieux].nom + ' → ' + INDEX[nouv].nom, ecran: true, age: 0, duree: 3, couleur: '#8ae0a0' });
}

// ── Épreuves (chūnin : vagues après la prise ; jōnin : boss en vagues) ──
function demarrerDefi(s) {
  if (s.defiLance) return; s.defiLance = true;
  const th = INDEX[G.theme]; const al = G.alea.ennemis;
  if (s.type === 'defi') {
    s.vagues = [];
    for (let v = 0; v < 3; v++) { const L = []; const n = 3 + v; for (let i = 0; i < n; i++) { const [tx, ty] = tuileLibreLoin(s, G.joueur.x + (Math.random() - 0.5) * 200, G.joueur.y + (Math.random() - 0.5) * 100); const [x, y] = centreTuile(tx + (i % 3) - 1 >= 1 ? tx : tx, ty); L.push({ id: al.choix(th.roles[al.choix(['p', 't', 'v', 'c'])] || th.roles.p), x: x + (i % 3) * 12 - 12, y }); } s.vagues.push(L); }
  } else {
    const pool = DON.boss.filter(b => !b.mini && b.etage && b.etage < G.etage.numero && !b.terminal);
    s.vagues = [[{ boss: al.choix(pool).id }], [{ boss: al.choix(pool).id }]];
  }
  s.combat = true; s.nettoyee = false; s.recompensee = true; G.portesFermeesDans = 0.2; Musique.etatCombat(true);
  lancerVagueSuivante(s);
}
function lancerVagueSuivante(s) {
  const v = s.vagues.shift(); if (!v) return;
  for (const d of v) {
    if (d.boss) { const [cx, cy] = centreSalle(s); creerBoss(d.boss, cx, cy - 30, { pvMult: 0.6 }); }
    else { let x = d.x, y = d.y; if (dist(x, y, G.joueur.x, G.joueur.y) < 2.5 * TUILE) { const [tx, ty] = tuileLibreLoin(s, G.joueur.x, G.joueur.y); [x, y] = centreTuile(tx, ty); } creerEnnemi(d.id, x, y); }
  }
  Son.jouer('gong', 0.5);
}

// ── Autel de tribut (sacrifice volontaire, paliers stockés) ──
const PALIERS_TRIBUT = [
  null,
  { p: 0.5, r: 'ryo' }, { p: 0.5, r: 'ryo' }, { p: 0.67, r: 'coffre' }, { p: 0.5, r: 'protection' }, { p: 0.33, r: 'objet_sanctuaire' },
  { p: 1, r: 'faveur' }, { p: 0.33, r: 'objet_sanctuaire' }, { p: 1, r: 'ryo5' }, { p: 0.5, r: 'protection2' }, { p: 1, r: 'coffre_verrouille' },
  { p: 1, r: 'objet_pacte_cicatrice' }, { p: 0, r: 'rassasie' },
];
function majAutel(dt) {
  const s = G.salle, J = G.joueur; const A = s.autel; if (!A) return;
  if (dist(A.x, A.y, J.x, J.y) > 12 || J.vol || J.invuln > 0) return;
  const n = Math.min(A.paiements + 1, PALIERS_TRIBUT.length - 1); const pal = PALIERS_TRIBUT[n];
  if (pal.r === 'rassasie') { if (!A.msg || G.temps - A.msg > 2) { A.msg = G.temps; G.textes.push({ x: A.x, y: A.y - 30, t: 'L’autel est rassasié.', age: 0, duree: 1.4, couleur: '#c8a0a0' }); } return; }
  A.paiements = n; G.partie.sacrifices++;
  const res = sacrifier(1);
  if (!res || res.mort) return;
  const al = new Alea(G.partie.code + '|autel|' + G.etage.numero + '|' + n);
  if (!al.chance(pal.p)) { G.textes.push({ x: A.x, y: A.y - 30, t: 'Tribut ' + n + ' : rien', age: 0, duree: 1, couleur: '#a08080' }); return; }
  const [x, y] = [A.x + (al.suivant() - 0.5) * 40, A.y + 24];
  switch (pal.r) {
    case 'ryo': creerRamassable('ryo', x, y, {}); break;
    case 'ryo5': creerRamassable('ryo5', x, y, {}); break;
    case 'coffre': creerRamassable('coffre', x, y, {}); break;
    case 'coffre_verrouille': creerRamassable('coffre_verrouille', x, y, {}); break;
    case 'protection': creerRamassable('protection', x, y, {}); break;
    case 'protection2': creerRamassable('protection', x - 8, y, {}); creerRamassable('protection', x + 8, y, {}); break;
    case 'objet_sanctuaire': poserPiedestal(s, A.x, A.y + 40, tirerObjet(G.partie, 'sanctuaire', G.alea.butin), { pool: 'sanctuaire' }); break;
    case 'faveur': G.etage.faveurSanctuaire = 0.3; G.textes.push({ x: A.x, y: A.y - 30, t: 'Les ermites vous ont remarqué', age: 0, duree: 1.6, couleur: '#fff8d0' }); break;
    case 'objet_pacte_cicatrice': poserPiedestal(s, A.x, A.y + 40, tirerObjet(G.partie, 'pacte', G.alea.butin), { pool: 'pacte' }); ajouterCicatrice(J.sante, 1); break;
  }
  Son.jouer('sceau');
}

// ── Chambre maudite : coût de passage (demi-unité) sauf vol, règle affichée ──
function payerPassageMaudit(moment) {
  const J = G.joueur; if (J.vol) return;
  payerSante(1, 'malediction');
  G.textes.push({ x: J.x, y: J.y - 30, t: 'Sceau blessant (' + moment + ')', age: 0, duree: 1, couleur: '#e05a7a' });
  Son.jouer('pics'); J.invuln = Math.max(J.invuln, 0.6);
}

// ── Opportunité après le boss : table de décision (registre §R23) ──
function chanceOpportunite() {
  const E = G.etage, P = G.partie, J = G.joueur;
  if (E.numero < 2 || E.numero > 8) return { chance: 0, pacte: 0, sanctuaire: 0, detail: [] };
  const det = []; let c = 0.20; det.push(['Base', 0.20]);
  if (!E.degatsVitalite) { c += 0.15; det.push(['Aucun dégât à la vitalité sur l’étage', 0.15]); }
  if (!E.degatsBoss) { c += 0.10; det.push(['Boss vaincu sans être touché', 0.10]); }
  if (J.talisman === 'TAL_015') { c += 0.05; det.push(['Bague de l’Akatsuki', 0.05]); }
  if (possede(J, 'PSV_091')) { c += 0.20; det.push(['Sceau maudit', 0.20]); }
  if (E.faveurSanctuaire) { c += E.faveurSanctuaire; det.push(['Faveur de l’autel', E.faveurSanctuaire]); }
  c = borne(c, 0, 0.95);
  if (J.drapeaux.serment) return { chance: 1, pacte: 1, sanctuaire: 0, detail: [['Serment de vengeance', 1]] };
  let wP = 0.6, wS = 0.4 + 0.25 * P.pactesRefuses + (J.talisman === 'TAL_004' ? 0.15 : 0);
  if (P.pactesAchetes > 0) wS = 0;  // exclusion puis renormalisation : toute l'opportunité devient un pacte
  const tot = wP + wS;
  return { chance: c, pacte: c * wP / tot, sanctuaire: c * wS / tot, detail: det };
}
function tirerOpportunite() {
  const T0 = chanceOpportunite(); const al = new Alea(G.partie.code + '|opportunite|' + G.etage.numero);
  const r = al.suivant();
  if (r < T0.pacte) return 'pacte'; if (r < T0.pacte + T0.sanctuaire) return 'sanctuaire'; return null;
}
// Les salles d'opportunité sont virtuelles : hors de la grille, reliées à la salle du boss
function ouvrirOpportunite(type) {
  const E = G.etage, sb = G.salle;
  const s = creerSalle({ id: 'opp', type, forme: '1x1', cx: -1, cy: -1 });
  const gab = DON.salles.find(g => g.type === type); appliquerGabarit(s, gab, null);
  E.salles.opp = s; E.opportunite = type;
  // porte : mur du haut de la salle du boss si libre, sinon un autre côté
  const libre = ['haut', 'gauche', 'droite', 'bas'].find(d => !sb.portes.some(p => p.dir === d && p.i === 0 && p.j === 0));
  ajouterPorte(sb, 0, 0, libre || 'haut', 'opp', type, 'ouverte'); sb.fondSale = true;
  ajouterPorte(s, 0, 0, DIR_OPPOSEE[libre || 'haut'], sb.id, type, 'ouverte');
  s.visitee = false; s.apercue = true;
  Son.jouer(type === 'pacte' ? 'rire' : 'gong');
}
function preparerOpportunite(s) {
  const P = G.partie, al = G.alea.butin; const L = (s.pointsSpeciaux || []).filter(p => p.c === 'I').map(p => centreTuile(p.tx, p.ty));
  if (s.type === 'pacte') {
    const n = al.entierEntre(1, L.length);
    for (let i = 0; i < n; i++) { const id = tirerObjet(P, 'pacte', al); poserPiedestal(s, L[i][0], L[i][1], id, { prix: prixObjet(id, 'pacte'), pool: 'pacte' }); }
    s.statue = { x: centreSalle(s)[0], y: centreTuile(6, 2)[1], type: 'serpent', pv: 1 };
  } else {
    const g = 'sa' + s.id; const n = al.chance(0.4) ? 2 : 1;
    for (let i = 0; i < n; i++) poserPiedestal(s, n === 1 ? centreSalle(s)[0] : L[i][0], L[i][1], tirerObjet(P, 'sanctuaire', al), { groupe: n > 1 ? g : null, pool: 'sanctuaire' });
    s.statue = { x: centreSalle(s)[0], y: centreTuile(6, 2)[1], type: 'crapaud', pv: 1 };
    P.sanctuaireVisite = true;
  }
}
function frapperStatue(s) {
  const st = s.statue; if (st.detruite) return; st.detruite = true;
  const [cx, cy] = [st.x, st.y + 40];
  if (st.type === 'marchand') { for (let i = 0; i < G.alea.recomp.entierEntre(3, 6); i++) creerRamassable('ryo', st.x + (Math.random() - 0.5) * 30, st.y + 20, {}); Son.jouer('rocher'); return; }
  const id = st.type === 'serpent' ? 'BOS_M01' : 'BOS_M02';
  creerBoss(id, cx, cy, {}); s.combat = true; s.nettoyee = false; G.portesFermeesDans = 0.2; Son.jouer('boss_intro');
}

// ── Dispositifs : machines et informateurs (ressources de la partie uniquement) ──
function majDispositifs() {
  const s = G.salle, J = G.joueur;
  for (const m of s.machines) {
    if (m.detruite || dist(m.x, m.y + 8, J.x, J.y) > 16) continue;
    if (!Entrees.vientEnfonce('interagir') && !(m.contact && G.temps - (m.dernier || 0) > 0.6)) { G.machineProche = m; continue; }
    m.dernier = G.temps; utiliserMachine(m);
  }
  for (const n of s.pnj) {
    if (n.parti || dist(n.x, n.y + 8, J.x, J.y) > 16) continue;
    G.machineProche = n;
    if (Entrees.vientEnfonce('interagir')) payerInformateur(n);
  }
}
function utiliserMachine(m) {
  const J = G.joueur; const al = G.alea.recomp; const sortie = t => creerRamassable(t, m.x + (Math.random() - 0.5) * 16, m.y + 22, {});
  switch (m.type) {
    case 'loterie': // 1 Ryō ; issues publiques (registre §R24) ; Dés de la grande perdante : gains doublés
      if (J.ryo < 1) { Son.jouer('refus'); return; } J.ryo--; m.usages++;
      { const r = al.suivant(); const k = J.talisman === 'TAL_022' ? 1.1 : 1; const sortie1 = sortie; const sortie = t => { sortie1(t); if (J.drapeaux.loterieDouble) sortie1(t); };
        if (r < 0.62 / k) { G.textes.push({ x: m.x, y: m.y - 24, t: 'Perdu', age: 0, duree: 0.7, couleur: '#a0a0a0' }); }
        else if (r < 0.80) sortie('ryo'), sortie('ryo');
        else if (r < 0.88) sortie(al.choix(['cle', 'explosif', 'coeur']));
        else if (r < 0.95) sortie('pilule');
        else if (r < 0.985) sortie('ryo5');
        else { poserPiedestal(G.salle, m.x, m.y + 36, tirerObjet(G.partie, 'machine', G.alea.butin), { pool: 'machine' }); m.detruite = true; } }
      Son.jouer('ryo'); break;
    case 'don_vital': // prix payé en santé (pas un dommage) → 1 à 3 Ryō ; se bloque après 6 dons
      if (m.usages >= 6) { Son.jouer('refus'); return; }
      if (santeTotale(J.sante) <= 1 && !confirmerMortel(m)) return;
      payerSante(1, 'don'); m.usages++; for (let i = 0; i < al.entierEntre(1, 3); i++) sortie('ryo');
      if (m.usages >= 6) { m.bloquee = true; G.textes.push({ x: m.x, y: m.y - 24, t: 'Autel épuisé', age: 0, duree: 1, couleur: '#c08080' }); }
      Son.jouer('sceau'); break;
    case 'diseuse': // informatrice : 1 Ryō → indice, talisman ou réserve
      if (J.ryo < 1) { Son.jouer('refus'); return; } J.ryo--;
      { const r = al.suivant(); if (r < 0.5) { const msg = al.choix(['La cache est derrière un mur que deux salles partagent.', 'Un rocher marqué d’un sceau cache toujours quelque chose.', 'Refuser un pacte adoucit le regard des ermites.', 'L’autel de tribut récompense la patience… et le sang.', 'Les Ryō dorment dans les jarres.']); G.textes.push({ x: m.x, y: m.y - 30, t: msg, age: 0, duree: 3, couleur: '#e0d0ff' }); }
        else if (r < 0.8) sortie('protection'); else if (r < 0.95) sortie('talisman'); else { sortie('rouleau'); sortie('rouleau'); } }
      Son.jouer('objet_mineur'); break;
    case 'soin': if (J.ryo < 3 || rougeTotal(J.sante) >= rougeMax(J.sante)) { Son.jouer('refus'); return; } J.ryo -= 3; soignerJoueur(J, 1); Son.jouer('coeur'); break;
    case 'recharge': if (J.ryo < 5 || !J.actif) { Son.jouer('refus'); return; } J.ryo -= 5; chargerActif(J, 2, 'machine'); Son.jouer('charge_pleine'); break;
    case 'troc': // échange la poche contre un talisman ou l'inverse
      if (J.poches.length) { J.poches.shift(); sortie('talisman'); Son.jouer('objet_mineur'); }
      else if (J.talisman) { J.talisman = null; recalculer(J); sortie('rouleau'); sortie('pilule'); Son.jouer('objet_mineur'); }
      else Son.jouer('refus');
      break;
  }
}
function confirmerMortel(m) { if (m.confirme) return true; m.confirme = true; G.textes.push({ x: m.x, y: m.y - 30, t: 'Mortel ! Confirmer à nouveau.', age: 0, duree: 1.6, couleur: '#ff4a4a' }); return false; }
function detruireMachine(m) {
  m.detruite = true; Son.jouer('explosion'); const al = G.alea.recomp;
  for (let i = 0; i < al.entierEntre(2, 4); i++) creerRamassable(al.choix(['ryo', 'ryo', 'ryo', 'coeur_demi']), m.x + (Math.random() - 0.5) * 20, m.y + 16, {});
}
// Informateurs : paiements répétés, issue incertaine mais probabilité fixe et publique
const INFORMATEURS = {
  voyageur: { monnaie: 'ryo', coutAff: '1 Ryō', proba: 0.12, recompense: 'objet', desc: 'Voyageur : paie-le en Ryō. Chaque paiement a 12 % de chances de lui arracher un objet ; sinon 20 % d’un petit présent.' },
  marchand_cles: { monnaie: 'cles', coutAff: '1 clé', proba: 0.3, recompense: 'coffre', desc: 'Receleur de clés : chaque clé donnée a 30 % de chances de révéler un coffre doré ou un talisman.' },
  artificier: { monnaie: 'explosifs', coutAff: '1 explosif', proba: 0.3, recompense: 'explosif', desc: 'Artificier : chaque explosif donné a 30 % de chances d’être rendu au double, ou d’un objet (5 %).' },
};
function payerInformateur(n) {
  const J = G.joueur, I = INFORMATEURS[n.type]; const al = G.alea.recomp;
  if ((J[I.monnaie] || 0) < 1) { Son.jouer('refus'); return; }
  J[I.monnaie]--; n.paye++; Son.jouer(I.monnaie === 'ryo' ? 'ryo' : 'cle');
  const r = al.suivant(); const sortie = t => creerRamassable(t, n.x + (Math.random() - 0.5) * 16, n.y + 22, {});
  if (n.type === 'voyageur') { if (r < 0.12) { poserPiedestal(G.salle, n.x, n.y + 36, tirerObjet(G.partie, 'machine', G.alea.butin), { pool: 'machine' }); n.parti = true; } else if (r < 0.32) sortie(al.choix(['coeur_demi', 'explosif', 'cle', 'pilule'])); }
  if (n.type === 'marchand_cles') { if (r < 0.2) sortie('coffre_verrouille'); else if (r < 0.3) sortie('talisman'); }
  if (n.type === 'artificier') { if (r < 0.25) { sortie('explosif2'); } else if (r < 0.30) { poserPiedestal(G.salle, n.x, n.y + 36, tirerObjet(G.partie, 'machine', G.alea.butin), { pool: 'machine' }); n.parti = true; } }
  if (n.parti) { G.effets.push({ type: 'fumee', x: n.x, y: n.y - 10, age: 0, duree: 0.5 }); Son.jouer('fumee'); }
}

// ── Source chaude (repos conditionnel : 5 Ryō ou 1 clé, une fois) ──
function majSource() {
  const s = G.salle, J = G.joueur; const S0 = s.source; if (!S0 || S0.utilisee) return;
  if (dist(S0.x, S0.y, J.x, J.y) > 20) return; G.machineProche = S0;
  if (!Entrees.vientEnfonce('interagir')) return;
  if (J.ryo >= 5) J.ryo -= 5; else if (J.cles >= 1) J.cles--; else { Son.jouer('refus'); return; }
  S0.utilisee = true; soignerJoueur(J, 4); if (J.drapeaux.sansVitalite) ajouterProtection(J.sante, 2); Son.jouer('eau'); Son.jouer('coeur');
  G.effets.push({ type: 'vapeur', x: S0.x, y: S0.y, age: 0, duree: 1.2 });
}

// ── Sortie : trappe (tenir 0,35 s au centre, signal net), branches après l'étage 8 ──
function majSorties(dt) {
  const s = G.salle, J = G.joueur;
  for (const x of s.sorties || []) {
    const d = dist(x.x, x.y, J.x, J.y);
    if (d < 14 && J.etat === 'normal' && !G.transition) {
      if (x.condition && !x.condition()) { if (!x.msg || G.temps - x.msg > 2) { x.msg = G.temps; G.textes.push({ x: x.x, y: x.y - 30, t: x.refus || 'Fermé', age: 0, duree: 1.8, couleur: '#e8c080' }); } continue; }
      x.t = (x.t || 0) + dt;
      if (x.t >= 0.35) { x.t = 0; emprunterSortie(x); return; }
    } else x.t = Math.max(0, (x.t || 0) - dt * 2);
  }
}
function emprunterSortie(x) {
  const P = G.partie; Son.jouer('porte_ouvre'); Entrees.consommer();
  if (x.type === 'fin') { victoire(x.route); return; }
  if (x.type === 'breche') { entrerBreche(); return; }
  if (x.type === 'conseil') { entrerConseil(); return; }
  if (x.branche) P.branche = x.branche;
  G.fondu = { t: 0, duree: 0.6, action: () => entrerEtage(P.etage + 1) };
}
function poserSortiesBoss(s) {
  const P = G.partie, E = G.etage, n = E.numero; const [cx, cy] = centreSalle(s);
  s.sorties = [];
  const derniere = Progression.etageMaximum();
  if (n === 9 || (n === 6 && derniere === 6) || (n === 8 && !Progression.brancheOuverte())) {
    s.sorties.push({ type: 'fin', x: cx, y: cy + 10, route: n === 6 ? 'RTE_01' : n === 8 ? 'RTE_02' : (P.branche === 'lumiere' ? 'RTE_03' : 'RTE_04') });
  } else if (n === 8) {
    s.sorties.push({ type: 'etage', branche: 'ombre', x: cx + 44, y: cy + 10 });
    s.sorties.push({ type: 'etage', branche: 'lumiere', x: cx - 44, y: cy + 10, lumiere: true, condition: () => G.partie.pactesAchetes === 0 || possede(G.joueur, 'PSV_900'), refus: 'Le rayon refuse ceux qui ont conclu un pacte (sauf porteur de la Clé des ermites).' });
  } else s.sorties.push({ type: 'etage', x: cx, y: cy + 10 });
  // routes chronométrées (chronomètre hors pause et hors écrans de décision)
  if (n === 6 && P.temps <= 20 * 60 && Progression.estDebloque('RTE_05')) s.sorties.push({ type: 'conseil', x: cx, y: cy - 50 });
  if (n === 8 && P.tempsEntreeBoss !== undefined && P.tempsEntreeBoss <= 30 * 60 && Progression.estDebloque('RTE_06')) s.sorties.push({ type: 'breche', x: cx + 90, y: cy - 40 });
}
