// ═══════════════════════════════════════════════════════════════════════════
// Jeu : état global, boucle à pas fixe (60 Hz, indépendante de l'affichage),
// ordre de mise à jour, scènes de jeu / pause / inventaire / défaite / victoire,
// démarrage. Horloges de gameplay suspendues pendant pause et menus.
// ═══════════════════════════════════════════════════════════════════════════

const G = {
  partie: null, joueur: null, etage: null, salle: null, reglages: null, temps: 0,
  proj: [], faisceaux: [], melees: [], effets: [], particules: [], zones: [], bombes: [], arcs: [], orbes: [], minuteries: [], ennemis: [], textes: [],
  stats: { degats: 0, eliminations: 0, degatsRecus: 0, sallesVisitees: 0, objets: 0, depenses: 0 }, degatsEnnemis: 1, degatsContact: 1,
  transition: null, banniere: null, banniereEtage: null, notifications: [], modeTest: null, alea: null,
};

// ── Ordre de mise à jour d'un pas ──
function majJeu(dt) {
  const J = G.joueur; const P = G.partie;
  if (G.fondu) { G.fondu.t += dt; if (G.fondu.t >= G.fondu.duree / 2 && !G.fondu.fait) { G.fondu.fait = true; G.fondu.action(); } if (G.fondu.t >= G.fondu.duree) G.fondu = null; return; }
  if (G.transition) { majTransition(dt); return; }
  if (J.etat === 'mort') { G.animMort = (G.animMort || 0) + dt; majEffets(dt); if (G.animMort > 1.4) { G.animMort = 0; Scenes.empiler(SceneMort); } return; }
  // actions (événements consommés au changement de contexte)
  if (Entrees.vientEnfonce('pause')) { Scenes.empiler(ScenePause); return; }
  if (G.introBoss) { G.introBoss.t += dt * (Entrees.enfonce('interagir') ? 3 : 1); if (G.introBoss.t >= G.introBoss.duree) { G.introBoss = null; Entrees.consommer(); } majEffets(dt); return; }
  if (G.enAnimationObjet) { majAnimationObjet(dt); majEffets(dt); return; }
  P.temps += dt; G.temps += dt;
  if (J.invuln > 0) J.invuln -= dt; if (J.bloqueTir > 0) J.bloqueTir -= dt; if (G.flashDegat > 0) G.flashDegat -= dt; if (G.gelGlobal > 0) G.gelGlobal -= dt;
  if (Entrees.vientEnfonce('explosif')) poserExplosif();
  if (Entrees.vientEnfonce('actif')) utiliserActif();
  if (Entrees.vientEnfonce('poche')) utiliserPoche();
  if (Entrees.vientEnfonce('echanger')) echangerActifs();
  if ((Entrees.maintien.deposer || 0) >= DUREE_DEPOT) { deposer(J); Entrees.maintien.deposer = -99; }
  // Gaara altéré : relâcher la visée fait converger les grains suspendus
  if (J.profil.differe) { if (!Entrees.visee.dir && J.tir.avaitVisee) { J.tir.convergence = true; J.tir.angleConv = Math.atan2(DIRS[J.tir.dir][1], DIRS[J.tir.dir][0]); } else J.tir.convergence = false; J.tir.avaitVisee = !!Entrees.visee.dir; }
  majBonus(J, dt); majActifTemporel(J, dt);
  if (J.dash) majDash(J, dt); else majDeplacementJoueur(J, dt);
  if (J.kaiten) majKaiten(J, dt);
  majTirJoueur(J, dt);
  majFamiliers(J, dt);
  if (G.gelGlobal <= 0) majEnnemis(dt); else for (const e of G.ennemis) { e.flash = Math.max(0, e.flash - dt); if (e.apparition > 0) e.apparition -= dt; }
  for (const p of G.proj) if (p.gele > 0) { p.gele -= dt; p.age -= dt; p.x -= p.vx * dt; p.y -= p.vy * dt; }
  majProjectiles(dt); majFaisceaux(dt); majMelees(dt); majBombes(dt); majArcs(dt); majAttraction(dt); majMinuteries(dt);
  majEffets(dt); majRamassables(dt); majPiedestaux(dt); G.machineProche = null; majDispositifs(); majAutel(dt); majSource(); majSorties(dt);
  majDangersTerrain(dt); verifierBlocsCle(); verifierPortes(dt); verifierNettoyage(); majSecousse(dt);
  majVarianteContinu(dt);
  if (G.notifications.length) { G.notifications[0].t += dt; if (G.notifications[0].t > 3) G.notifications.shift(); }
}
function deposer(J) {
  if (J.talisman) { const r = creerRamassable('talisman', J.x + 16, J.y + 6, { id: J.talisman }); r.age = 0; J.talisman = J.talisman2 || null; J.talisman2 = null; recalculer(J); Son.jouer('objet_mineur'); return; }
  if (J.poches.length) { const c = J.poches.shift(); const r = creerRamassable(c.type === 'pilule' ? 'pilule' : 'rouleau', J.x + 16, J.y + 6, { id: c.id }); r.apparence = c.apparence; r.age = 0; Son.jouer('objet_mineur'); }
}
function declencherMort() { Son.jouer('boss_mort'); Musique.etatCombat(false); G.animMort = 0.001; G.partie.fini = true; effacerPartieSuspendue(); Progression.finPartie('mort'); }
function victoire(route) {
  const P = G.partie; P.fini = true; effacerPartieSuspendue(); Progression.finPartie('victoire', route); Scenes.empiler(SceneVictoire, { route });
}
function entrerBreche() { G.fondu = { t: 0, duree: 0.8, action: () => { const s = creerSalle({ id: 'breche', type: 'boss', forme: '2x2', cx: -2, cy: -2 }); appliquerGabarit(s, DON.salles.find(g => g.forme === '2x2' && g.type === 'combat'), null); s.pointsApparition = []; s.bossDef = 'BOS_022'; s.visitee = false; G.etage.salles.breche = s; entrerSalle('breche', null); G.partie.brecheOuverte = true; } }; }
function entrerConseil() { G.conseil = { liste: new Alea(G.partie.code + 'conseil').melanger(DON.boss.filter(b => !b.mini && !b.terminal && b.etage <= 6).map(b => b.id)).slice(0, 6), i: 0 }; G.fondu = { t: 0, duree: 0.8, action: () => { const s = creerSalle({ id: 'conseil', type: 'boss', forme: '1x1', cx: -3, cy: -3 }); appliquerGabarit(s, DON.salles.find(g => g.id === 'ROM_121'), null); s.visitee = true; s.nettoyee = false; s.recompenseBoss = true; G.etage.salles.conseil = s; entrerSalle('conseil', null); conseilSuivant(); } }; }
function conseilSuivant() { const C = G.conseil; if (!C) return; if (C.i >= C.liste.length) { G.conseil = null; const s = G.salle; const [cx, cy] = centreSalle(s); s.sorties = [{ type: 'fin', x: cx, y: cy + 10, route: 'RTE_05' }]; s.combat = false; s.nettoyee = true; return; } const id = C.liste[C.i++]; const [cx, cy] = centreSalle(G.salle); creerBoss(id, cx, cy - 40, { pvMult: 0.7, sansIntro: true }); G.salle.combat = true; Son.jouer('gong'); }

// ── Scènes de jeu ──
const SceneJeu = {
  entrer() { },
  maj(dt) { majJeu(dt); },
  rendre(g) {
    rendreJeu(g); dessinerHUD(g);
    if (G.notifications.length) { const n = G.notifications[0]; g.fillStyle = 'rgba(12,8,18,0.85)'; g.fillRect(420, 70, 210, 34); g.fillStyle = '#f0c040'; g.fillRect(420, 70, 210, 1); Police.ecrire(g, n.titre, 426, 74, '#f0c040'); Police.ecrire(g, n.nom, 426, 86, '#fff0d0'); }
  },
};
const ScenePause = {
  entrer() { this.menu = menuListe([
    { label: 'Reprendre', action: () => Scenes.depiler() },
    { label: 'Objets et mutations', action: () => Scenes.empiler(SceneInventaire) },
    { label: 'Options', action: () => Scenes.empiler(SceneOptions) },
    { label: 'Sauvegarder et quitter', action: () => { sauvegarderEtQuitter(); G.partie = null; Scenes.aller(SceneTitre); } },
    { label: 'Abandonner la partie', action: () => { if (this.conf) { G.partie.fini = true; effacerPartieSuspendue(); Progression.finPartie('abandon'); Scenes.aller(SceneTitre); } else { this.conf = true; Son.jouer('telegraphe'); } }, valeur: () => this.conf ? 'Confirmer ?' : '' },
  ]); this.conf = false; Musique.etatCombat(false); },
  sortir() { if (G.salle && G.salle.combat) Musique.etatCombat(true); },
  maj() { this.menu.maj(); if (Entrees.menuRetour() || Entrees.vientEnfonce('pause')) { Son.jouer('annuler'); Scenes.depiler(); } },
  rendre(g, actif) {
    g.fillStyle = 'rgba(6,4,10,0.72)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
    cadreMenu(g, 40, 40, 220, 150, 'Pause'); this.menu.rendre(g, 56, 74, 188, actif);
    // carte et statistiques consultables en pause
    g.fillStyle = 'rgba(10,6,16,0.9)'; g.fillRect(280, 40, 320, 280); dessinerMinicarte(g, 0, 0, true);
    const J = G.joueur, P = G.partie; Police.ecrire(g, G.etage.cfg.nom, 440, 46, '#e8dcc0', { a: 'c' });
    dessinerStats(g, J, 50, 206); Police.ecrire(g, 'Temps ' + formatTemps(P.temps), 130, 206, '#a8a0b8'); Police.ecrire(g, 'Code ' + codeAffiche(P.code), 130, 218, '#a8a0b8'); Police.ecrire(g, (P.difficile ? 'Difficile' : 'Standard') + (P.defi ? ' — ' + INDEX[P.defi].nom : ''), 130, 230, '#a8a0b8');
    Police.ecrire(g, 'Objets : ' + J.passifs.length, 130, 242, '#a8a0b8');
    aideBoutons(g, [['interagir', 'Choisir'], ['retour', 'Reprendre']]);
  },
};
const SceneInventaire = {
  entrer() { this.i = 0; },
  liste() { const J = G.joueur; const L = []; if (J.actif) L.push(J.actif.id); if (J.actif2) L.push(J.actif2.id); if (J.talisman) L.push(J.talisman); for (const id of J.passifs) L.push(id); for (const t of J.transformations) L.push(t); return L; },
  maj() { const L = this.liste(); const c = 12; if (Entrees.nav.dx) this.i = borne(this.i + Entrees.nav.dx, 0, Math.max(0, L.length - 1)); if (Entrees.nav.dy) this.i = borne(this.i + Entrees.nav.dy * c, 0, Math.max(0, L.length - 1)); if (Entrees.nav.dx || Entrees.nav.dy) Son.jouer('menu'); if (Entrees.menuRetour()) Scenes.depiler(); },
  rendre(g) {
    g.fillStyle = 'rgba(6,4,10,0.92)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
    Police.ecrire(g, 'Objets, transformations et mutations', 320, 10, '#f0d8a0', { a: 'c', e: 2, contour: '#1c1420' });
    const L = this.liste(); const c = 12;
    L.forEach((id, k) => { const x = 40 + (k % c) * 30, y = 40 + Math.floor(k / c) * 26; if (k === this.i) { g.fillStyle = '#f0c870'; g.fillRect(x - 2, y - 2, 24, 24); } const d = INDEX[id]; g.drawImage(d.type === 'talisman' ? spriteRamassable('talisman', d.couleur) : d.type === 'transformation' ? iconeObjet(d.icone ? id : 'PSV_055') : iconeObjet(id), x, y); });
    const id = L[this.i]; if (id) { const d = INDEX[id]; g.fillStyle = 'rgba(20,14,28,0.95)'; g.fillRect(410, 36, 220, 300); Police.ecrire(g, d.nom, 420, 44, '#fff0d0'); let y = 58; y += Police.paragraphe(g, d.desc || '', 420, y, 200, '#c8c0d8') + 6; for (const l of detailsObjet(d)) y += Police.paragraphe(g, '· ' + l, 420, y, 200, '#a8a0b8'); if (d.statut) Police.paragraphe(g, '[' + d.statut + ']', 420, y + 6, 200, '#7a7088'); if (d.visuel) Police.paragraphe(g, 'Mutation : ' + (d.visuel.nom || d.visuel.motif || d.visuel.couche), 420, y + 30, 200, '#8a9aa8'); }
    if (!L.length) Police.ecrire(g, 'Aucun objet pour l’instant.', 320, 160, '#8a8098', { a: 'c' });
    aideBoutons(g, [['retour', 'Retour']]);
  },
};
const SceneMort = {
  entrer() { this.menu = menuListe([{ label: 'Rejouer avec ce shinobi', action: () => { const P = G.partie; nouvellePartie({ perso: P.perso, difficile: P.difficile, defi: P.defi }); Scenes.aller(SceneJeu); } }, { label: 'Menu principal', action: () => Scenes.aller(SceneTitre) }]); this.t = 0; },
  maj(dt) { this.t += dt; if (this.t > 0.6) this.menu.maj(); },
  rendre(g) {
    g.fillStyle = 'rgba(20,4,8,0.88)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
    const P = G.partie, J = G.joueur; const c = G.causeMort || {};
    Police.ecrire(g, 'Vous êtes tombé', 320, 40, '#e05a5a', { a: 'c', e: 3, contour: '#1c1420' });
    const cause = c.type === 'prix' ? 'Un prix payé de trop' : c.type === 'sacrifice' ? 'Un tribut de trop' : c.source && INDEX[c.source] ? INDEX[c.source].nom : c.type === 'explosion' ? 'Une explosion' : 'Le labyrinthe';
    Police.ecrire(g, 'Cause : ' + cause + '   ·   Étage ' + P.etage + '   ·   ' + formatTemps(P.temps), 320, 80, '#e8d0d0', { a: 'c' });
    J.passifs.slice(0, 36).forEach((id, k) => g.drawImage(iconeObjet(id), 140 + (k % 18) * 20, 100 + Math.floor(k / 18) * 22));
    Police.ecrire(g, 'Code de mission : ' + codeAffiche(P.code) + '   Éliminations : ' + G.stats.eliminations + '   Objets : ' + J.passifs.length, 320, 152, '#a8a0b8', { a: 'c' });
    cadreMenu(g, 220, 180, 200, 50); this.menu.rendre(g, 236, 192, 170);
    aideBoutons(g, [['interagir', 'Choisir']]);
  },
};
const TEXTES_FINS = {
  RTE_01: ['Le serpent se défait de sa dernière peau et le sceau se fissure.', 'Au-delà, un escalier descend vers des cavernes que personne n’a cartographiées. Le labyrinthe n’a pas fini de vous éprouver.'],
  RTE_02: ['La pluie cesse pour la première fois depuis votre entrée.', 'Deux chemins s’ouvrent : un rayon clair qui refuse ce qui a été vendu, et une trappe qui mène toujours plus bas.'],
  RTE_03: ['Sur le mont des crapauds, le gardien du sceau s’incline.', 'Il murmure que chaque empreinte volée par le labyrinthe peut rentrer chez elle — à condition que quelqu’un s’en souvienne.'],
  RTE_04: ['Au fond du sceau, l’écho du plus ancien des rivaux se tait.', 'Les chaînes restent tendues. Quelque chose respire encore, derrière elles.'],
  RTE_05: ['Le conseil des épreuves se lève et vous tourne le dos, satisfait.', 'Votre nom est ajouté au registre des candidats trop rapides pour être oubliés.'],
  RTE_06: ['La brèche se referme sur les dix queues.', 'Pendant un instant, toutes les empreintes du labyrinthe se sont souvenues de leur nom.'],
};
const SceneVictoire = {
  entrer(o) { this.route = o.route; this.t = 0; },
  maj(dt) { this.t += dt; if (this.t > 1.5 && Entrees.menuConfirmer()) { Scenes.aller(SceneTitre); } },
  rendre(g) {
    g.fillStyle = '#0a0812'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
    const R = INDEX[this.route] || { nom: 'Victoire' };
    Police.ecrire(g, R.nom, 320, 40, '#f0d8a0', { a: 'c', e: 2, contour: '#1c1420' });
    let y = 90; for (const l of TEXTES_FINS[this.route] || []) y += Police.paragraphe(g, l, 120, y, 400, '#e0d8e8') + 10;
    Police.ecrire(g, 'Marque obtenue pour ' + G.joueur.def.nom + ' : ' + (R.marque || ''), 320, y + 20, '#c0e0a0', { a: 'c' });
    if (R.recompense) Police.ecrire(g, R.recompense, 320, y + 36, '#a8a0b8', { a: 'c' });
    Police.ecrire(g, 'Temps ' + formatTemps(G.partie.temps) + '   Code ' + codeAffiche(G.partie.code), 320, 300, '#8a8098', { a: 'c' });
    if (this.t > 1.5) aideBoutons(g, [['interagir', 'Continuer']]);
  },
};
const SceneDeconnexion = {
  maj() { if (Entrees.pad || Entrees.touches.size) { if (Entrees.menuConfirmer() || Entrees.pad && Entrees.boutons.some(Boolean)) { Scenes.depiler(); } } },
  rendre(g) { g.fillStyle = 'rgba(6,4,10,0.85)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); Police.ecrire(g, 'Manette déconnectée', 320, 150, '#ffd0a0', { a: 'c', e: 2 }); Police.ecrire(g, 'Reconnectez-la puis appuyez sur un bouton (ou Entrée) pour reprendre.', 320, 180, '#c8c0d8', { a: 'c' }); },
};

// ── Démarrage et boucle ──
let _dernier = 0, _accu = 0;
function boucle(t) {
  const dt = Math.min(0.1, (t - _dernier) / 1000 || 0); _dernier = t; _accu += dt; let n = 0;
  while (_accu >= DT && n < 5) { Entrees.maj(DT); try { Scenes.maj(DT); } catch (e) { G.derniereErreur = String(e.stack || e); console.error(e); } Entrees.finPas(); _accu -= DT; n++; }
  if (n >= 5) _accu = 0;
  try { Scenes.rendre(Rendu.gi); } catch (e) { G.derniereErreur = String(e.stack || e); console.error(e); }
  Rendu.presenter();
  requestAnimationFrame(boucle);
}
function demarrer() {
  indexerDonnees(); DON.familiers.forEach(f => { f.type = 'familier'; });
  G.reglages = chargerReglages();
  Entrees.init(G.reglages); Son.init(G.reglages); Rendu.init(); Police.preparer(); preparerIcones();
  Progression.charger();
  Entrees.surDeconnexion = () => { if (Scenes.courante() === SceneJeu) Scenes.empiler(SceneDeconnexion); };
  Entrees.surPerteFocus = () => { if (Scenes.courante() === SceneJeu && G.partie && !G.modeTest) Scenes.empiler(ScenePause); };
  const activer = () => Son.demarrer(); addEventListener('keydown', activer); addEventListener('pointerdown', activer);
  Scenes.aller(SceneTitre);
  requestAnimationFrame(boucle);
  // Interface de test (Playwright) : pas de dépendance du jeu envers elle
  window.LDS = { G, DON, INDEX, Scenes, Entrees, nouvellePartie, entrerSalle, entrerEtage, genererEtage, configEtage, acquerirPassif, creerEnnemi, creerBoss, majJeu, SceneJeu, SceneTitre, Progression, recalculer, calculerStats, calculerProfil, relancerPiedestaux, planEtage, serialiserPartie, reprendrePartie, chanceOpportunite, tirerObjet, Stockage, CLES, utiliserActif, donnerConsommable, utiliserPoche, verifierNettoyage, demarrerTransition, PROP, T, tuileA, TUILE, appliquerGabarit, Rendu, prixRyo, peutPayer, acheter, poserPiedestal, creerRamassable, collecter, explosion, blesserJoueur, payerSante, sacrifier, soignerJoueur, santeInit, subirDemis, rougeTotal, santeTotale, utiliserMachine };
}
