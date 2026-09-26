// ═══════════════════════════════════════════════════════════════════════════
// Monde : partie, étages, entrée/sortie de salle (machine d'états), portes,
// transitions, ramassables, coffres, explosifs posés, décor interactif,
// secrets, récompenses de fin de salle, trappe de sortie.
// ═══════════════════════════════════════════════════════════════════════════

// ── Partie ──
function nouvellePartie(o) {
  const code = codeValide(o.code) ? o.code : codeAleatoire(Math.random);
  const P = {
    code, perso: o.perso, difficile: !!o.difficile, defi: o.defi || null, entrainement: !!o.entrainement, graineSaisie: !!o.graineSaisie,
    etage: 0, route: [], temps: 0, retires: [], vus: [], pilules: null, pilulesIdentifiees: [], pactesAchetes: 0, pactesRefuses: 0, sanctuaireVisite: false,
    opportunitePrecedente: false, marques: [], branche: null, fragments: 0, sacrifices: 0, bossVaincus: [], version: VERSION_DONNEES, histoire: [],
  };
  G.partie = P;
  G.stats = { degats: 0, eliminations: 0, degatsRecus: 0, sallesVisitees: 0, objets: 0, depenses: 0 };
  P.joueur = creerJoueur(o.perso); G.joueur = P.joueur;
  const al = new Alea(code + '|pilules|' + VERSION_DONNEES);
  P.pilules = al.melanger(DON.pilules.map(p => p.id)); // apparence i → effet
  if (o.defi) appliquerDefi(P, o.defi);
  entrerEtage(1);
  Progression.debutPartie(P);
}

// Composition de l'étage n : position, thème (graine), variante, boss
function configEtage(n) {
  const P = G.partie; const al = fluxEtage(P.code, n, 'theme');
  let pos = DON.positions[n];
  if (n === 9) pos = DON.branches[P.branche || 'ombre'];
  const themes = pos.themes.filter(t => Progression.estDebloque(t) || t === pos.themes[0]);
  const theme = al.choix(themes);
  const variantes = DON.etages.filter(f => f.theme === theme);
  const variante = al.choix(variantes);
  let boss = al.choix(pos.boss.filter(b => Progression.estDebloque(b)).length ? pos.boss.filter(b => Progression.estDebloque(b)) : pos.boss);
  const nomsChap = ['', 'I', 'II', 'III', 'IV', 'V'];
  const cfg = {
    numero: n, theme, variante: variante.id, mod: variante.mod || {}, nom: INDEX[theme].nom + ' — ' + variante.nom, chapitre: pos.chapitre,
    salles: pos.salles.slice(), speciales: Object.assign({}, pos.speciales), boss, degats: pos.degats, distBossMin: n <= 1 ? 3 : 4,
    grandes: n <= 1 ? 0.1 : 0.2, verrouDes: 2, titre: 'Chapitre ' + nomsChap[pos.chapitre] + ' · Étage ' + n,
  };
  if (P.difficile) { cfg.salles[0]++; cfg.salles[1]++; }
  if (P.defi && INDEX[P.defi].sansHeritage) delete cfg.speciales.heritage;
  return cfg;
}

function entrerEtage(n) {
  const P = G.partie, J = G.joueur;
  P.etage = n;
  const cfg = configEtage(n);
  G.etage = genererEtage(P, n, cfg);
  G.etage.cfg = cfg; G.variante = cfg.mod; G.theme = cfg.theme;
  G.degatsEnnemis = cfg.degats; G.degatsContact = cfg.degats;
  G.etage.degatsVitalite = false; G.etage.degatsSubis = false; G.etage.opportunite = null;
  G.alea = { butin: fluxEtage(P.code, n, 'butin'), recomp: fluxEtage(P.code, n, 'recompenses'), ennemis: fluxEtage(P.code, n, 'ennemis'), combat: fluxEtage(P.code, n, 'combat'), cosmo: new Alea(Math.random() + '') };
  // effets d'entrée d'étage
  if (J.sante.partiel) { J.sante.partiel = 0; ajouterConteneur(J.sante, 1, true); G.textes.push({ x: 0, y: 0, t: 'Le sceau partiel devient un contenant', age: 0, duree: 2, couleur: '#fff', ecran: true }); }
  J.clesDorees = false; J.explosifsDores = false;
  finEtageBonus(J);
  if (J.def.regleCode === 'cinq_coeurs' && n > 1) reconstruireInventaire(J);
  evenement('etage', { n });
  // révélations du plan (objets, Byakugan)
  const S = G.etage.salles;
  if (J.def.regleCode === 'byakugan') for (const s of Object.values(S)) if (s.type !== 'isolee') s.apercue = true;
  revelerPlan(J);
  entrerSalle(G.etage.depart, null);
  G.banniereEtage = { t: 0, titre: cfg.titre, nom: cfg.nom, desc: INDEX[cfg.variante].desc };
  const th = INDEX[cfg.theme]; Musique.jouerPiste(cfg.theme, th.musique);
  if (cfg.degats >= 2 && n === 5) G.textes.push({ t: 'Désormais, les coups infligent un cœur entier.', ecran: true, age: 0, duree: 4, couleur: '#ff8a6a' });
  sauvegarderPartie('etage');
}

// ── Entrée dans une salle ──
function entrerSalle(id, depuisDir) {
  const E = G.etage, J = G.joueur; const s = E.salles[id];
  const ancienne = G.salle;
  if (ancienne) quitterSalle(ancienne);
  G.salle = s; E.courante = id; s.version = (s.version || 0) + 1;
  G.proj = []; G.faisceaux = []; G.melees = []; G.effets = []; G.particules = []; G.zones = (s.zonesPersistantes || []).slice(); G.arcs = []; G.orbes = []; G.minuteries = []; G.ennemis = []; G.textes = G.textes.filter(t => t.ecran);
  G.appat = null; G.pousse = null; G.gelGlobal = 0;
  const premiere = !s.visitee;
  s.visitee = true; s.apercue = true; if (premiere) G.stats.sallesVisitees++;
  // les voisines deviennent « aperçues » (pas les secrets non découverts)
  for (const p of s.portes) { const v = E.salles[p.vers]; if (v && p.etat !== 'secrete') v.apercue = true; }
  if (s.type === 'cache' || s.type === 'isolee') { for (const p of s.portes) { const v = E.salles[p.vers]; const retour = v && v.portes.find(q => q.vers === s.id); if (retour && retour.etat === 'secrete') { retour.etat = 'ouverte'; retour.secrete = false; retour.revelee = true; } } }
  // position d'entrée : devant la porte opposée à la direction de déplacement
  if (depuisDir) {
    const opp = DIR_OPPOSEE[depuisDir];
    let porte = s.portes.find(p => p.dir === opp && p.vers === (ancienne && ancienne.id));
    if (!porte) porte = s.portes.find(p => p.dir === opp);
    if (porte) { const [fx, fy] = tuileDevantPorte(porte); const [cx, cy] = centreTuile(fx, fy); J.x = cx; J.y = cy + (opp === 'haut' ? 4 : opp === 'bas' ? -2 : 4); }
    else { const [cx, cy] = centreSalle(s); J.x = cx; J.y = cy; }
  } else if (G.positionEntree) { J.x = G.positionEntree.x; J.y = G.positionEntree.y; G.positionEntree = null; }
  else { const [cx, cy] = centreSalle(s); J.x = cx; J.y = cy + 16; }
  J.vx = 0; J.vy = 0;
  // zone sûre : jamais sur une fosse ou un obstacle
  if (solidePour(s, Math.floor(J.x / TUILE), Math.floor(J.y / TUILE), J.vol ? 'vol' : 'marche')) { const [tx, ty] = tuileLibreProche(s, J.x, J.y); [J.x, J.y] = centreTuile(tx, ty); }
  for (const f of J.familiers) { f.x = J.x + (Math.random() - 0.5) * 12; f.y = J.y + 6; f.vx = 0; f.vy = 0; }
  if (premiere) { genererContenuSalle(s); }
  if (J.def.regleCode === 'bouclier_sable') J.bouclierSable = !s.nettoyee && (s.ennemisDef.length > 0 || s.type === 'boss');
  // ennemis : seulement si la salle n'est pas nettoyée
  s.combat = false;
  if (!s.nettoyee) {
    const L = s.ennemisDef; const J0 = { x: J.x, y: J.y };
    for (const d of L) {
      let x = d.x, y = d.y;
      if (dist(x, y, J0.x, J0.y) < 2.6 * TUILE) { // zone de sécurité à l'entrée : position symétrique ou tuile libre éloignée
        const [cx, cy] = centreSalle(s); let nx = 2 * cx - x, ny = 2 * cy - y;
        if (!tuileLibre(s, Math.floor(nx / TUILE), Math.floor(ny / TUILE)) || dist(nx, ny, J0.x, J0.y) < 2.6 * TUILE) { const [tx, ty] = tuileLibreLoin(s, J0.x, J0.y); [nx, ny] = centreTuile(tx, ty); }
        x = nx; y = ny;
      }
      const e = creerEnnemi(d.id, x, y, { champion: d.champion });
      e.apparition += 0.25; // aucun ennemi n'attaque pendant la transition d'entrée
    }
    if (s.type === 'boss' && s.bossDef && !s.bossVaincu) lancerBoss(s);
    if (G.ennemis.length) { s.combat = true; G.portesFermeesDans = 0.25; Musique.etatCombat(true); }
  }
  if (!s.combat) Musique.etatCombat(false);
  // états de salle
  s.etat = s.nettoyee ? 'revisitee' : (s.combat ? 'en_combat' : 'visitee');
  majPhasesSalle(s, premiere);
  if (s.type === 'malediction' && depuisDir && !J.vol) payerPassageMaudit('entrée');
  if (J.def.regleCode === 'ninja_copieur' || J.familiers.some(f => f.def.id === 'FAM_PAKKUN')) signalerSecrets(s);
  if (premiere && s.type === 'boss' && s.bossDef) Son.jouer('boss_intro');
  evenement('entree_salle', { s, premiere });
  G.instantaneSalle = instantaneEntree(); // point de reprise « Sauvegarder et quitter »
  G.dernierePorte = depuisDir;
}
function tuileLibreLoin(s, x, y) {
  let best = null, bd = -1;
  for (let ty = 1; ty < s.H - 1; ty++) for (let tx = 1; tx < s.W - 1; tx++) { if (!tuileLibre(s, tx, ty)) continue; const [cx, cy] = centreTuile(tx, ty); const d = dist(cx, cy, x, y); if (d > bd) { bd = d; best = [tx, ty]; } }
  return best || [2, 2];
}
function quitterSalle(s) {
  const J = G.joueur;
  s.etat = s.nettoyee ? 'quittee' : s.etat;
  s.zonesPersistantes = G.zones.filter(z => z.persistante);
  finSalleBonus(J);
  // les ennemis d'une salle quittée pendant un combat (téléportation) sont conservés
  if (!s.nettoyee && G.ennemis.length) s.ennemisDef = G.ennemis.filter(e => !e.boss && !e.parent).map(e => ({ id: e.id, x: e.x, y: e.y, champion: e.champion }));
  if (s.type === 'boss' && G.ennemis.some(e => e.boss)) s.bossPvRestant = G.ennemis.filter(e => e.boss).map(e => e.pv / e.pvMax);
  J.intangible = false;
}

// ── Contenu d'une salle à la première visite ──
function genererContenuSalle(s) {
  const P = G.partie, J = G.joueur, E = G.etage, cfg = E.cfg;
  const alE = G.alea.ennemis, alB = G.alea.butin;
  const th = INDEX[cfg.theme];
  s.ennemisDef = [];
  if (s.type === 'combat' || s.type === 'defi' || s.type === 'malediction') {
    for (const pt of s.pointsApparition || []) {
      const liste = (th.roles[pt.role] || th.roles.p);
      let id = alE.choix(liste);
      if (!INDEX[id]) id = 'ENM_002';
      const n = pt.role === 'n' ? 3 : 1;
      for (let k = 0; k < n; k++) {
        const [cx, cy] = centreTuile(pt.tx, pt.ty);
        const chance = (P.difficile ? 0.1 : 0.05) + (E.numero >= 5 ? 0.02 : 0);
        const champion = !INDEX[id].boss && alE.chance(chance) ? alE.choix(Object.keys(CHAMPIONS)) : null;
        s.ennemisDef.push({ id, x: cx + (n > 1 ? (k - 1) * 10 : 0), y: cy + (n > 1 ? (k % 2) * 6 : 0), champion });
      }
    }
    if (s.type === 'defi') { s.defiEnnemis = s.ennemisDef; s.ennemisDef = []; }
    if (s.type === 'malediction' && !s.ennemisDef.length && alE.chance(0.4)) { const id = alE.choix(th.roles.p); const [cx, cy] = centreSalle(s); s.ennemisDef.push({ id, x: cx - 60, y: cy }, { id, x: cx + 60, y: cy }); }
    // variante d'étage : dangers de terrain
    appliquerVarianteSalle(s, cfg.mod, alE);
  }
  if (s.type === 'boss') { s.bossDef = cfg.boss; }
  // spéciaux du gabarit
  for (const pt of s.pointsSpeciaux || []) {
    const [cx, cy] = centreTuile(pt.tx, pt.ty);
    if (/[1-9]/.test(pt.c)) creerRamassable(tirerRamassable(G.alea.recomp, J.stats.chance), cx, cy, { immobile: true });
    else if (pt.c === 'Z') creerRamassable(s.type === 'coffres' ? alB.choix(['coffre', 'coffre', 'coffre_verrouille', 'coffre_pierre']) : s.type === 'malediction' ? 'coffre_piege' : 'coffre', cx, cy, { immobile: true });
  }
  preparerSalleSpeciale(s);
}

// Récompense de fin de salle (table §R10 ; la chance déplace la masse « rien »)
function tirerRamassable(al, chance) {
  const c = Math.max(0, Math.min(10, chance || 0));
  const table = [['rien', 36 - c * 3], ['ryo', 22], ['coeur', 11], ['cle', 8], ['explosif', 8], ['coffre', 5 + c * 0.6], ['consommable', 5 + c * 0.6], ['condensateur', 2], ['talisman', 1.5 + c * 0.3], ['protection', 3]];
  const r = al.pondere(table, x => x[1]); const t = r ? r[0] : 'rien';
  switch (t) {
    case 'ryo': return al.chance(0.12) ? 'ryo5' : al.chance(0.03) ? 'ryo10' : 'ryo';
    case 'coeur': return al.chance(0.25) ? 'coeur_demi' : al.chance(0.08) ? 'coeur_double' : 'coeur';
    case 'cle': return al.chance(0.1) ? 'cle2' : 'cle';
    case 'explosif': return al.chance(0.1) ? 'explosif2' : 'explosif';
    case 'coffre': return al.chance(0.25) ? 'coffre_verrouille' : al.chance(0.12) ? 'coffre_piege' : 'coffre';
    case 'consommable': return al.chance(0.45) ? 'pilule' : 'rouleau';
    case 'protection': return al.chance(0.2) ? 'instable' : 'protection';
    default: return t;
  }
}

// ── Nettoyage de salle ──
function verifierNettoyage() {
  const s = G.salle; if (!s.combat) return;
  if (G.ennemis.some(e => !e.mort && !e.statuts.charme && !e.allie && !e.def.ignoreNettoyage)) return;
  if (s.vagues && s.vagues.length) { lancerVagueSuivante(s); return; }
  s.combat = false; s.nettoyee = true; s.etat = 'nettoyee';
  Musique.etatCombat(false);
  Son.jouer('porte_ouvre');
  const J = G.joueur;
  // récompenses : une seule fois par salle (pas de nouvelle charge ni de loot à la revisite)
  if (!s.recompensee) {
    s.recompensee = true;
    if (s.type !== 'boss') {
      const al = new Alea(G.partie.code + '|' + G.etage.numero + '|' + s.id + '|nettoyage');
      const r = tirerRamassable(al, J.stats.chance);
      if (r !== 'rien') { const [cx, cy] = centreSalle(s); const [tx, ty] = tuileLibreProche(s, cx, cy, [], true); const [x, y] = centreTuile(tx, ty); creerRamassable(r, x, y, { depuisSol: true }); }
    }
    chargerActif(J, s.forme === '1x1' ? 1 : 2, 'salle');
    J.compteurs.sallesNettoyees++;
    evenement('salle_nettoyee', { s });
    if (J.def.regleCode === 'clones_ressource' && J.clones < 4) { J.clones++; majClonesRessource(J); }
    if (J.def.regleCode === 'flair' && Math.random() < 0.1) { creerRamassable(tirerRamassable(G.alea.recomp, 5), J.x + 16, J.y, {}); G.textes.push({ x: J.x, y: J.y - 30, t: 'Akamaru a trouvé quelque chose !', age: 0, duree: 1.2, couleur: '#fff' }); }
  }
  sauvegarderPartie('salle');
}

// ── Transitions par les portes ──
function verifierPortes(dt) {
  const s = G.salle, J = G.joueur; if (G.transition) return;
  if (G.portesFermeesDans > 0) { G.portesFermeesDans -= dt; if (G.portesFermeesDans <= 0 && s.combat) Son.jouer('porte_ferme'); }
  for (const p of s.portes) {
    if (!porteOuverte(s, p) || p.etat === 'secrete') continue;
    const [px, py] = centreTuile(p.tx, p.ty); const [dx, dy] = DIRS[p.dir];
    // la zone de passage : le joueur a franchi la ligne du mur
    const dansTuile = Math.abs(J.x - px) < TUILE * 0.5 && Math.abs(J.y - py) < TUILE * 0.5;
    const pousse = (J.vx * dx + J.vy * dy) > 5;
    if (dansTuile && pousse) {
      if (J.bloqueSortie > 0) return;
      if (s.type === 'malediction' && !J.vol) payerPassageMaudit('sortie');
      demarrerTransition(p.dir, p.vers);
      return;
    }
  }
}
function demarrerTransition(dir, vers, type = 'porte') {
  G.transition = { dir, vers, t: 0, duree: G.reglages.confort ? 0.18 : 0.26, image: capturerVue(), type };
  Entrees.consommer();
}
function majTransition(dt) {
  const T0 = G.transition; T0.t += dt;
  if (T0.t >= T0.duree * 0.5 && !T0.faite) { T0.faite = true; if (T0.type === 'porte') entrerSalle(T0.vers, T0.dir); else if (T0.type === 'teleport') entrerSalle(T0.vers, null); T0.imageNouvelle = null; }
  if (T0.t >= T0.duree) G.transition = null;
}

// ── Ramassables ──
const RAMASSABLES = {
  ryo: { cat: 'ryo', n: 1 }, ryo5: { cat: 'ryo', n: 5 }, ryo10: { cat: 'ryo', n: 10 },
  cle: { cat: 'cle', n: 1 }, cle2: { cat: 'cle', n: 2 }, explosif: { cat: 'explosif', n: 1 }, explosif2: { cat: 'explosif', n: 2 },
  coeur: { cat: 'coeur', n: 2 }, coeur_demi: { cat: 'coeur', n: 1 }, coeur_double: { cat: 'coeur', n: 4 },
  protection: { cat: 'protection', n: 2 }, protection_demi: { cat: 'protection', n: 1 }, instable: { cat: 'instable', n: 2 }, partiel: { cat: 'partiel' }, os: { cat: 'os' },
  condensateur: { cat: 'condensateur', n: 2 }, condensateur_grand: { cat: 'condensateur', n: 99 },
  rouleau: { cat: 'consommable' }, pilule: { cat: 'pilule' }, talisman: { cat: 'talisman' },
  coffre: { cat: 'coffre' }, coffre_verrouille: { cat: 'coffre' }, coffre_piege: { cat: 'coffre' }, coffre_pierre: { cat: 'coffre' },
};
function creerRamassable(type, x, y, o = {}) {
  const s = G.salle; const al = G.alea.recomp;
  const r = { type, x, y, z: o.depuisSol ? 0 : 6, vx: o.immobile ? 0 : (Math.random() - 0.5) * 90, vy: o.immobile ? 0 : (Math.random() - 0.5) * 90, vz: o.immobile ? 0 : 80, age: 0, uid: Math.random().toString(36).slice(2) };
  if (type === 'rouleau') r.id = al.pondere(DON.consommables.filter(c => Progression.estDebloque(c.id)), c => c.poids || 1).id;
  if (type === 'pilule') { const i = al.entier(G.partie.pilules.length); r.id = G.partie.pilules[i]; r.apparence = i; }
  if (type === 'talisman') r.id = (al.pondere(DON.talismans.filter(t => Progression.estDebloque(t.id) && !G.partie.retires.includes(t.id)), t => t.poids || 1) || DON.talismans[0]).id;
  if (o.id) r.id = o.id; if (o.charges !== undefined) r.charges = o.charges;
  s.ramassables.push(r); return r;
}
function majRamassables(dt) {
  const s = G.salle, J = G.joueur;
  for (const r of s.ramassables) {
    r.age += dt;
    if (r.vz || r.z > 0) { r.vz -= 400 * dt; r.z = Math.max(0, r.z + r.vz * dt); if (r.z === 0) { r.vz = Math.abs(r.vz) > 60 ? -r.vz * 0.4 : 0; } }
    if (r.vx || r.vy) { const e = { x: r.x, y: r.y, r: 5 }; deplacerCercle(s, e, r.vx * dt, r.vy * dt, 'marche'); r.x = e.x; r.y = e.y; r.vx *= 0.9; r.vy *= 0.9; if (Math.abs(r.vx) + Math.abs(r.vy) < 2) { r.vx = 0; r.vy = 0; } }
    // aimant
    if (J.drapeaux.aimant && ['ryo', 'cle', 'explosif', 'coeur', 'protection'].includes(RAMASSABLES[r.type].cat)) { const d = dist(r.x, r.y, J.x, J.y); if (d < 90 && d > 4) { r.x += (J.x - r.x) / d * 110 * dt; r.y += (J.y - r.y) / d * 110 * dt; } }
    // familiers collecteurs
    for (const f of J.familiers) if (f.collecte && r.age > 0.3 && dist(r.x, r.y, f.x, f.y) < 10 && ['ryo', 'cle', 'explosif'].includes(RAMASSABLES[r.type].cat)) { collecter(r, J); }
    if (r.pris || r.age < 0.25 || J.etat !== 'normal') continue;
    if (dist(r.x, r.y, J.x, J.y) < 12 + (RAMASSABLES[r.type].cat === 'coffre' ? 4 : 0)) collecter(r, J);
  }
  s.ramassables = s.ramassables.filter(r => !r.pris);
}
// Règles de ramassage au contact : un soin inutilisable reste au sol
function collecter(r, J) {
  const R = RAMASSABLES[r.type]; const S = J.sante;
  switch (R.cat) {
    case 'ryo':
      if (J.drapeaux.ryoSoigne && rougeTotal(S) < rougeMax(S)) { soignerRouge(S, R.n); Son.jouer('coeur'); }
      else { let n = R.n; if (possede(J, 'PSV_107') && Math.random() < 0.2) n *= 2; ajouterRessource(J, 'ryo', n); Son.jouer('ryo'); }
      evenement('ryo_ramasse', { n: R.n }); break;
    case 'cle': ajouterRessource(J, 'cles', R.n); Son.jouer('cle'); break;
    case 'explosif': ajouterRessource(J, 'explosifs', R.n); Son.jouer('objet_mineur'); break;
    case 'coeur': {
      if (J.drapeaux.sansVitalite) return;
      const manque = rougeMax(S) - rougeTotal(S);
      if (manque <= 0 && J.def.regleCode !== 'controle_chakra' && J.def.regleCode !== 'sceau_centaine') return; // reste au sol
      let n = R.n * (J.drapeaux.soinsDoubles ? 2 : 1);
      const ex = soignerRouge(S, n);
      if (ex > 0 && J.def.regleCode === 'controle_chakra') { J.force = Math.min(6, J.force + ex); G.textes.push({ x: J.x, y: J.y - 32, t: 'Force +' + ex, age: 0, duree: 0.8, couleur: '#ff9ac0' }); }
      if (ex > 0 && J.def.regleCode === 'sceau_centaine') J.sceau = Math.min(12, J.sceau + ex);
      Son.jouer('coeur'); break;
    }
    case 'protection': case 'instable': {
      if (placeLibre(S) <= 0 && S.prot.length % 2 === 0) return;
      ajouterProtection(S, R.n, R.cat === 'instable' ? 'n' : 'b'); Son.jouer('protection'); break;
    }
    case 'partiel': ajouterPartiel(S); Son.jouer('protection'); break;
    case 'os': if (placeLibre(S) <= 0) return; ajouterOs(S, 1); Son.jouer('protection'); break;
    case 'condensateur': {
      if (!J.actif) return; const d = INDEX[J.actif.id]; const max = chargesMax(d);
      if (J.actif.charges >= max && !(J.drapeaux.surcharge && !J.actif.surcharge)) return;
      chargerActif(J, R.n, 'condensateur'); Son.jouer('charge_pleine'); break;
    }
    case 'consommable': case 'pilule': if (!donnerConsommable(J, { type: R.cat === 'pilule' ? 'pilule' : 'rouleau', id: r.id, apparence: r.apparence })) return; Son.jouer('objet_mineur'); break;
    case 'talisman': prendreTalisman(J, r.id); break;
    case 'coffre': ouvrirCoffre(r); return;
  }
  r.pris = true;
  G.effets.push({ type: 'etincelle_ramassage', x: r.x, y: r.y - 6, age: 0, duree: 0.25 });
}
function donnerConsommable(J, c) {
  if (typeof c === 'string') c = { type: INDEX[c] && INDEX[c].famille === 'pilule' ? 'pilule' : 'rouleau', id: c };
  if (J.poches.length >= J.maxPoches) { const ancien = J.poches.shift(); const r = creerRamassable(ancien.type === 'pilule' ? 'pilule' : 'rouleau', J.x + 14, J.y + 4, { id: ancien.id }); r.apparence = ancien.apparence; r.age = 0; }
  J.poches.push(c); return true;
}
function prendreTalisman(J, id) {
  if (J.talisman && J.maxTalismans > 1 && !J.talisman2) J.talisman2 = J.talisman;
  else if (J.talisman) { const r = creerRamassable('talisman', J.x + 16, J.y + 6, { id: J.talisman }); r.age = 0; }
  J.talisman = id; recalculer(J); Son.jouer('objet_mineur');
  G.banniere = { t: 0, nom: INDEX[id].nom, desc: INDEX[id].desc, mineur: true };
  Progression.decouvrir(id);
}

// ── Coffres ──
function ouvrirCoffre(r) {
  const J = G.joueur; const al = G.alea.recomp;
  if (r.type === 'coffre_verrouille' && !J.drapeaux.crochetage) { if (J.cles <= 0 && !J.clesDorees) { if (!r.refus || G.temps - r.refus > 1) { r.refus = G.temps; Son.jouer('refus'); } return; } if (!J.clesDorees) J.cles--; }
  if (r.type === 'coffre_pierre') { if (!r.fissure) return; }
  r.pris = true; Son.jouer('coffre');
  G.effets.push({ type: 'coffre_ouvert', x: r.x, y: r.y, age: 0, duree: 0.6, sorte: r.type });
  const pos = () => [r.x + (Math.random() - 0.5) * 20, r.y + (Math.random() - 0.5) * 12];
  if (r.type === 'coffre_piege') {
    if (al.chance(0.45)) { // piège : pics ou ennemis — annoncé par le coffre rouge
      if (al.chance(0.5)) { blesserJoueur(G.degatsEnnemis, { type: 'piege' }); G.effets.push({ type: 'pics_coffre', x: r.x, y: r.y, age: 0, duree: 0.5 }); }
      else { const th = INDEX[G.theme]; for (let i = 0; i < 2; i++) { const [x, y] = pos(); creerEnnemi(al.choix(th.roles.p), x, y); } G.salle.combat = true; G.salle.nettoyee = false; }
      return;
    }
    if (al.chance(0.35)) { poserPiedestal(G.salle, r.x, r.y, tirerObjet(G.partie, 'pacte', G.alea.butin), {}); return; }
  }
  if (r.type === 'coffre_verrouille' && al.chance(0.12)) { poserPiedestal(G.salle, r.x, r.y, tirerObjet(G.partie, 'coffre', G.alea.butin), {}); return; }
  const n = r.type === 'coffre' ? al.entierEntre(1, 3) : al.entierEntre(2, 4);
  for (let i = 0; i < n; i++) { let t = tirerRamassable(al, J.stats.chance + 4); if (t === 'rien' || t.startsWith('coffre')) t = al.choix(['ryo', 'ryo', 'cle', 'explosif', 'coeur', 'protection']); const [x, y] = pos(); creerRamassable(t, x, y, {}); }
  if (al.chance(r.type === 'coffre' ? 0.06 : 0.12)) { const [x, y] = pos(); creerRamassable('talisman', x, y, {}); }
}

// ── Parchemins explosifs posés ──
function poserExplosif() {
  const J = G.joueur;
  if (J.explosifs <= 0 && !J.explosifsDores) { Son.jouer('refus'); return; }
  if (!J.explosifsDores) J.explosifs--;
  G.bombes.push({ x: J.x, y: J.y + 2, age: 0, meche: J.drapeaux.mecheLongue ? 1.9 : 1.4, r: 1.6 * TUILE * (J.drapeaux.grandeExplosion ? 1.5 : 1), deg: 30 + (J.drapeaux.grandeExplosion ? 10 : 0), vx: J.vx * 0.3, vy: J.vy * 0.3, poseParJoueur: true });
  Son.jouer('meche'); evenement('explosif_pose', {});
}
function majBombes(dt) {
  const s = G.salle, J = G.joueur;
  for (const b of G.bombes) {
    b.age += dt;
    if (J.drapeaux.explosifsGuides) { const c = ennemiLePlusProche(b.x, b.y, 200); if (c) { const [dx, dy] = normaliser(c.x - b.x, c.y - b.y); b.vx += dx * 200 * dt; b.vy += dy * 200 * dt; } }
    if (b.vx || b.vy) { const e = { x: b.x, y: b.y, r: 6 }; deplacerCercle(s, e, b.vx * dt, b.vy * dt, 'marche'); b.x = e.x; b.y = e.y; b.vx *= 0.9; b.vy *= 0.9; }
    if (b.age >= b.meche) {
      b.fini = true;
      explosion(b.x, b.y, b.r, b.deg, { proprio: 'joueur', blesseJoueur: !J.drapeaux.immuniteExplosion, degatsJoueur: 2 });
      if (J.drapeaux.explosifsFeu) for (let i = 0; i < 5; i++) creerZone(b.x + (Math.random() - 0.5) * 40, b.y + (Math.random() - 0.5) * 30, 'feu_allie', 3, { r: 12, dps: 6 });
      if (J.drapeaux.explosifsCroix) for (let i = 0; i < 4; i++) { const p = creerSousProjectile({ x: b.x, y: b.y - 6, vitesse: 8 * TUILE, degats: J.stats.degats, recul: 40, taille: 1, apparence: 'kunai', elements: new Set(), gen: 0, budget: { n: 4 }, cycleId: 0 }, i * Math.PI / 2, J.stats.degats * 1.5); p.dureeVie = 1; }
    }
  }
  G.bombes = G.bombes.filter(b => !b.fini);
}
// Interaction explosion ↔ décor : rochers, jarres, feux, portes secrètes, coffres de pierre, machines
function exploserDecor(x, y, r) {
  const s = G.salle;
  const tx0 = Math.floor((x - r) / TUILE), tx1 = Math.floor((x + r) / TUILE), ty0 = Math.floor((y - r) / TUILE), ty1 = Math.floor((y + r) / TUILE);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    const [cx, cy] = centreTuile(tx, ty); if (dist(cx, cy, x, y) > r + 14) continue;
    const t = tuileA(s, tx, ty);
    if (PROP[t].explosable) detruireTuile(s, tx, ty, 'explosion', x, y);
    if (t === T.PORTE) { const p = porteEn(s, tx, ty); if (p && p.etat === 'secrete') revelerPorteSecrete(s, p); }
  }
  for (const r2 of s.ramassables) if (r2.type === 'coffre_pierre' && dist(r2.x, r2.y, x, y) < r + 10) { r2.fissure = true; ouvrirCoffre(r2); }
  for (const m of s.machines) if (!m.detruite && dist(m.x, m.y, x, y) < r + 12) detruireMachine(m);
  if (s.statue && !s.statue.detruite && dist(s.statue.x, s.statue.y, x, y) < r + 14) frapperStatue(s);
}
function revelerPorteSecrete(s, p) {
  p.etat = 'ouverte'; p.secrete = false; p.revelee = true;
  const v = G.etage.salles[p.vers]; if (v) { v.apercue = true; const q = v.portes.find(k => k.vers === s.id); if (q) { q.etat = 'ouverte'; q.secrete = false; } }
  Son.jouer('secret'); G.effets.push({ type: 'debris', x: (p.tx + 0.5) * TUILE, y: (p.ty + 0.5) * TUILE, age: 0, duree: 0.5, n: 10 });
  Progression.compteur('secretsTrouves', 1);
  evenement('secret_trouve', { s, p });
}
function detruireTuile(s, tx, ty, cause, ex, ey) {
  const i = ty * s.W + tx; const t = s.tuiles[i]; const [cx, cy] = centreTuile(tx, ty);
  const al = G.alea.recomp;
  if (t === T.FEU) { s.tuiles[i] = T.FEU_ETEINT; Son.jouer('fumee', 0.6); G.effets.push({ type: 'fumee', x: cx, y: cy - 4, age: 0, duree: 0.5, taille: 1 }); if (al.chance(0.2)) creerRamassable(tirerRamassable(al, 3), cx, cy, {}); }
  else {
    s.tuiles[i] = T.SOL;
    G.effets.push({ type: 'debris', x: cx, y: cy, age: 0, duree: 0.5, n: 8, couleur: t === T.JARRE ? '#b86a44' : t === T.CAISSE ? '#a87448' : null });
    Son.jouer(t === T.JARRE ? 'jarre' : 'rocher');
    if (t === T.ROCHER_SCEAU) { const r = al.choix(['protection', 'protection', 'cle', 'explosif2', 'ryo5', 'rouleau']); creerRamassable(r, cx, cy, {}); Son.jouer('secret', 0.5); Progression.compteur('rochersSceau', 1); }
    else if (t === T.JARRE && al.chance(0.35)) creerRamassable(al.choix(['ryo', 'ryo', 'coeur_demi', 'explosif', 'cle', 'pilule']), cx, cy, {});
    else if (t === T.CAISSE && al.chance(0.3)) creerRamassable(al.choix(['ryo', 'ryo5', 'explosif', 'rouleau']), cx, cy, {});
    else if (t === T.ROCHER && al.chance(0.02)) creerRamassable('ryo', cx, cy, {});
    // une explosion peut combler une fosse voisine avec les débris du rocher (pont)
    if (cause === 'explosion' && (t === T.ROCHER || t === T.TOTEM)) {
      let best = null, bd = 1e9;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (tuileA(s, tx + dx, ty + dy) === T.FOSSE) { const d = dist(cx + dx * TUILE, cy + dy * TUILE, ex, ey); const score = -d; if (score < bd) { bd = score; best = [tx + dx, ty + dy]; } }
      if (best) { s.tuiles[best[1] * s.W + best[0]] = T.PONT; }
    }
  }
  delete s.pvTuiles[i]; s.version = (s.version || 0) + 1; s.fondSale = true;
}
function endommagerTuile(s, tx, ty, n) {
  const i = ty * s.W + tx; if (s.pvTuiles[i] === undefined) return;
  s.pvTuiles[i] -= n; G.effets.push({ type: 'etincelle', x: (tx + 0.5) * TUILE, y: (ty + 0.5) * TUILE - 6, age: 0, duree: 0.15 });
  if (s.pvTuiles[i] <= 0) detruireTuile(s, tx, ty, 'tir');
}
// Bloc à clé : s'ouvre au contact avec une clé
function verifierBlocsCle() {
  const s = G.salle, J = G.joueur;
  const tx = Math.floor(J.x / TUILE), ty = Math.floor(J.y / TUILE);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const x = tx + dx, y = ty + dy; if (tuileA(s, x, y) !== T.BLOC_CLE) continue;
    const [cx, cy] = centreTuile(x, y); if (dist(cx, cy, J.x, J.y) > TUILE * 0.75) continue;
    if (J.cles > 0 || J.clesDorees) { if (!J.clesDorees) J.cles--; s.tuiles[y * s.W + x] = T.SOL; s.fondSale = true; s.version++; Son.jouer('cle'); G.effets.push({ type: 'debris', x: cx, y: cy, age: 0, duree: 0.4, n: 6, couleur: '#e8c050' }); }
  }
  // portes verrouillées : une clé ouvre définitivement (des deux côtés)
  for (const p of s.portes) {
    if (p.etat !== 'verrouillee') continue; const [px, py] = centreTuile(p.tx, p.ty);
    if (dist(px, py, J.x, J.y) > TUILE * 0.95) continue;
    if (J.cles > 0 || J.clesDorees || J.drapeaux.crochetage) {
      if (!J.clesDorees && !J.drapeaux.crochetage) J.cles--;
      p.etat = 'ouverte'; const v = G.etage.salles[p.vers]; const q = v && v.portes.find(k => k.vers === s.id); if (q && q.etat === 'verrouillee') q.etat = 'ouverte';
      Son.jouer('cle'); Son.jouer('porte_ouvre');
    } else if (!p.refus || G.temps - p.refus > 1.2) { p.refus = G.temps; Son.jouer('refus'); G.textes.push({ x: px, y: py - 20, t: 'Il faut une clé de sceau', age: 0, duree: 1, couleur: '#e8c050' }); }
  }
}

// ── Décalques persistants (encre, brûlures) — bornés par salle ──
function ajouterDecal(s, x, y, type, r) { if (!s) return; s.decals.push({ x, y, type, r: r || 8, g: Math.random() * 1000 | 0 }); if (s.decals.length > 60) s.decals.shift(); s.decalsNouveaux = true; }

// ── Dangers de terrain (pics, zones) ──
function majDangersTerrain(dt) {
  const s = G.salle, J = G.joueur;
  if (!J.vol && !J.drapeaux.immuniteSol) {
    const t = tuilePx(s, J.x, J.y);
    if (PROP[t].blessant && !(G.variante && G.variante.picsActifs && !picsSortis())) blesserJoueur(G.degatsEnnemis, { type: 'pics' });
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const tt = tuilePx(s, J.x + dx * (J.r + 1), J.y + dy * (J.r + 1)); if (PROP[tt].contact) blesserJoueur(1, { type: 'feu' }); }
  }
  for (const z of G.zones) {
    z.age += dt;
    if (z.armee !== undefined) z.armee -= dt;
    switch (z.type) {
      case 'feu_allie': for (const e of G.ennemis) if (!e.mort && !e.cache && dist(e.x, e.y, z.x, z.y) < z.r + e.r) { if (!e.ia.feuT || G.temps - e.ia.feuT > 0.5) { e.ia.feuT = G.temps; infligerDegats(e, z.dps * 0.5 || 3, { proprio: 'joueur', type: 'feu', sansRecul: true }); appliquerStatut(e, 'brulure', 1.5, G.joueur.stats.degats); } } break;
      case 'eau_alliee': for (const e of G.ennemis) if (!e.mort && dist(e.x, e.y, z.x, z.y) < z.r + e.r) appliquerStatut(e, 'ralenti', 0.5, 0); break;
      case 'mine': if (z.armee <= 0) for (const e of G.ennemis) if (!e.mort && !e.cache && dist(e.x, e.y, z.x, z.y) < z.r + e.r) { z.fini = true; explosion(z.x, z.y, 0.9 * TUILE, z.deg, { proprio: 'joueur', petite: true, gen: 1 }); break; } break;
      case 'parchemin': if (z.armee <= 0 && (dist(J.x, J.y, z.x, z.y) < 24 || z.age > z.duree - 0.05)) { z.fini = true; explosion(z.x, z.y, 1.2 * TUILE, 8, { proprio: 'ennemi', blesseJoueur: true, degatsJoueur: G.degatsEnnemis }); } break;
      case 'acide': case 'feu_ennemi': if (!J.vol && dist(J.x, J.y, z.x, z.y) < z.r) blesserJoueur(G.degatsEnnemis, { type: z.type }); break;
      case 'glace': break;
    }
    if (z.age >= z.duree && !z.persistante) z.fini = true;
  }
  G.zones = G.zones.filter(z => !z.fini);
}
function picsSortis() { return (G.temps % 3) < 1.4; }

// ── Pakkun / Kakashi : signalement des murs secrets de la salle ──
function signalerSecrets(s) {
  const p = s.portes.find(q => q.etat === 'secrete'); if (!p) return;
  const [cx, cy] = centreTuile(...tuileDevantPorte(p));
  G.effets.push({ type: 'indice_secret', x: cx, y: cy, age: 0, duree: 2.2 });
  setTimeoutJeu(() => Son.jouer('rire', 0.4), 0.3);
}
