// ═══════════════════════════════════════════════════════════════════════════
// Jeu : état global, boucle à pas fixe (60 Hz, indépendante de l'affichage),
// ordre de mise à jour, scènes de jeu / pause / inventaire / défaite / victoire,
// démarrage. Horloges de gameplay suspendues pendant pause et menus.
// ═══════════════════════════════════════════════════════════════════════════

// Noms lisibles des mutations visibles (inventaire de pause)
const NOMS_MOTIFS = { queues: 'queues de chakra', maquillage: 'pigments de l’ermite', insectes: 'nuée d’insectes', bras_marionnette: 'bras articulés', yeux_rouges: 'yeux rougeoyants',
  sable_flottant: 'sable en suspension', cornes: 'cornes', marque: 'marques sur la peau', plumes: 'ailes de papier', bandeau_bras: 'bandeau au bras', lueur_poings: 'poings lumineux',
  masque_anbu: 'masque d’animal', feuilles: 'tourbillon de feuilles', eclair: 'aura crépitante', manteau_nuages: 'manteau à nuages rouges', paumes: 'paumes de soin', cape: 'cape',
  masque: 'masque', oeil_front: 'œil frontal', point_front: 'losange frontal', queue: 'queue', papier: 'papillons de papier' };
function nomMutation(v) { return v.nom || NOMS_MOTIFS[v.motif] || (v.couche === 'aura' ? 'aura de chakra' : v.motif || v.couche); }

const G = {
  partie: null, joueur: null, etage: null, salle: null, reglages: null, temps: 0,
  proj: [], faisceaux: [], melees: [], effets: [], particules: [], zones: [], bombes: [], arcs: [], orbes: [], minuteries: [], ennemis: [], textes: [],
  stats: { degats: 0, eliminations: 0, degatsRecus: 0, sallesVisitees: 0, objets: 0, depenses: 0 }, degatsEnnemis: 1, degatsContact: 1,
  transition: null, banniere: null, banniereEtage: null, notifications: [], modeTest: null, alea: null,
};

// ── Ordre de mise à jour d'un pas ──
function majJeu(dt) {
  const J = G.joueur; const P = G.partie;
  // bannières : minutées par la simulation (pas par l'affichage)
  if (!bannieresRetenues()) {
    if (!G.banniere && G.banniereFile && G.banniereFile.length) G.banniere = G.banniereFile.shift();
    if (G.banniere) { G.banniere.t += dt; if (G.banniere.t > dureeBanniere(G.banniere)) G.banniere = (G.banniereFile && G.banniereFile.shift()) || null; }
  }
  if (G.banniereEtage) { G.banniereEtage.t += dt; if (G.banniereEtage.t > 3.2) G.banniereEtage = null; }
  if (G.fondu) { G.fondu.t += dt; if (G.fondu.t >= G.fondu.duree / 2 && !G.fondu.fait) { G.fondu.fait = true; G.fondu.action(); } if (G.fondu.t >= G.fondu.duree) G.fondu = null; return; }
  if (G.transition) { majTransition(dt); return; }
  if (J.etat === 'mort') { G.animMort = (G.animMort || 0) + dt; majEffets(dt); if (G.animMort > 1.4) { G.animMort = 0; Scenes.empiler(SceneMort); } return; }
  // actions (événements consommés au changement de contexte)
  if (Entrees.vientEnfonce('pause')) { Scenes.empiler(ScenePause); return; }
  if (G.introBoss) { G.introBoss.t += dt * (Entrees.enfonce('interagir') ? 3 : 1); if (G.introBoss.t >= G.introBoss.duree) { G.introBoss = null; Entrees.consommer({ garderTir: true }); } majEffets(dt); return; }
  if (G.enAnimationObjet) { majAnimationObjet(dt); majEffets(dt); return; }
  // ralenti (mort du dernier boss) : la simulation seule, jamais l'interface
  if (G.ralenti) { G.ralenti.t += dt; if (G.ralenti.t >= G.ralenti.duree) G.ralenti = null; else dt *= G.ralenti.k + (1 - G.ralenti.k) * Math.pow(G.ralenti.t / G.ralenti.duree, 2); }
  P.temps += dt; G.temps += dt;
  // pouls à santé basse (un cœur ou moins quand on en a eu davantage), seulement en combat
  if (santeTotale(J.sante) <= 2 && J.sante.cont.length * 2 + J.sante.prot.length > 3 && G.salle.combat && J.etat !== 'mort') { G.pouls = (G.pouls || 0) - dt; if (G.pouls <= 0) { G.pouls = 1.15; Son.jouer('battement', 0.9); } } else G.pouls = 0;
  if (J.invuln > 0) J.invuln -= dt; if (J.bloqueTir > 0) J.bloqueTir -= dt; if (J.delaiActif > 0) J.delaiActif -= dt; if (J.tEclair > 0) J.tEclair -= dt; // délai d'actif : hors animation de prise if (G.flashDegat > 0) G.flashDegat -= dt; if (G.gelGlobal > 0) G.gelGlobal -= dt;
  if (Entrees.vientEnfonce('explosif')) poserExplosif();
  if (Entrees.vientEnfonce('actif')) utiliserActif();
  if (Entrees.vientEnfonce('poche')) utiliserPoche();
  if (Entrees.vientEnfonce('echanger')) echangerActifs();
  if ((Entrees.maintien.deposer || 0) >= DUREE_DEPOT) { deposer(J); Entrees.maintien.deposer = -99; }
  // Gaara altéré : relâcher la visée fait converger les grains suspendus
  if (J.profil.differe) { if (!Entrees.visee.dir && J.tir.avaitVisee) { J.tir.convergence = true; J.tir.angleConv = Math.atan2(DIRS[J.tir.dir][1], DIRS[J.tir.dir][0]); } else J.tir.convergence = false; J.tir.avaitVisee = !!Entrees.visee.dir; }
  majBonus(J, dt); majActifTemporel(J, dt); majSusanooJoueur(J, dt);
  if (J.dash) majDash(J, dt); else majDeplacementJoueur(J, dt);
  if (J.kaiten) majKaiten(J, dt);
  if (J.drapeaux.rotationAuto && G.salle.combat && J.etat === 'normal') { J.tRotation = (J.tRotation || 0) + dt; if (J.tRotation >= 10 && !J.kaiten) { J.tRotation = 0; EFFETS_ACTIFS.kaiten(J, { duree: 1, coef: 4 }); } } // Soixante-quatre paumes
  majTirJoueur(J, dt);
  majFamiliers(J, dt);
  if (G.gelGlobal <= 0) majEnnemis(dt); else for (const e of G.ennemis) { e.flash = Math.max(0, e.flash - dt); if (e.apparition > 0) e.apparition -= dt; }
  for (const p of G.proj) if (p.gele > 0) { p.gele -= dt; p.age -= dt; p.x -= p.vx * dt; p.y -= p.vy * dt; }
  majProjectiles(dt); majFaisceaux(dt); majMelees(dt); majBombes(dt); majArcs(dt); majAttraction(dt); majMinuteries(dt);
  majEffets(dt); majRamassables(dt); majPiedestaux(dt); G.machineProche = null; majDispositifs(); majAutel(dt); majSource(); majSorties(dt);
  majDangersTerrain(dt); verifierBlocsCle(); verifierPortes(dt); secoursEnnemisInaccessibles(dt); verifierNettoyage(); majSecousse(dt);
  majVarianteContinu(dt); majMursSable(dt);
  if (G.notifications.length && !banniereVisible()) { G.notifications[0].t += dt; if (G.notifications[0].t > 3) G.notifications.shift(); }
}
function deposer(J) {
  if (J.talisman) { const r = creerRamassable('talisman', J.x + 16, J.y + 6, { id: J.talisman }); r.age = 0; r.attendSortie = true; J.talisman = J.talisman2 || null; J.talisman2 = null; recalculer(J); Son.jouer('objet_mineur'); return; }
  if (J.poches.length) { const c = J.poches.shift(); const r = creerRamassable(c.type === 'pilule' ? 'pilule' : 'rouleau', J.x + 16, J.y + 6, { id: c.id }); r.apparence = c.apparence; r.age = 0; r.attendSortie = true; Son.jouer('objet_mineur'); }
}
function declencherMort() { Son.jouer('boss_mort'); Musique.etatCombat(false); G.animMort = 0.001; G.partie.fini = true; effacerPartieSuspendue(); Progression.finPartie('mort'); }
function victoire(route) {
  const P = G.partie; P.fini = true; effacerPartieSuspendue(); Progression.finPartie('victoire', route); Scenes.empiler(SceneVictoire, { route });
}
function entrerBreche() { G.fondu = { t: 0, duree: 0.8, action: () => { const s = creerSalle({ id: 'breche', type: 'boss', forme: '2x2', cx: -2, cy: -2 }); appliquerGabarit(s, DON.salles.find(g => g.forme === '2x2' && g.type === 'combat'), null); s.pointsApparition = []; s.bossDef = 'BOS_022'; s.visitee = false; G.etage.salles.breche = s; entrerSalle('breche', null); G.partie.brecheOuverte = true; } }; }
function entrerConseil() { Progression.secret('SEC_009'); G.conseil = { liste: new Alea(G.partie.code + 'conseil').melanger(DON.boss.filter(b => !b.mini && !b.terminal && b.etage <= 6).map(b => b.id)).slice(0, 6), i: 0 }; G.fondu = { t: 0, duree: 0.8, action: () => { const s = creerSalle({ id: 'conseil', type: 'boss', forme: '1x1', cx: -3, cy: -3 }); appliquerGabarit(s, DON.salles.find(g => g.id === 'ROM_121'), null); s.visitee = true; s.nettoyee = false; s.recompenseBoss = true; G.etage.salles.conseil = s; entrerSalle('conseil', null); conseilSuivant(); } }; }
function conseilSuivant() { const C = G.conseil; if (!C) return; if (C.i >= C.liste.length) { G.conseil = null; const s = G.salle; const [cx, cy] = centreSalle(s); s.sorties = [{ type: 'fin', x: cx, y: cy + 10, route: 'RTE_05' }]; s.combat = false; s.nettoyee = true; return; } const id = C.liste[C.i++]; const [cx, cy] = centreSalle(G.salle); creerBoss(id, cx, cy - 40, { pvMult: 0.7, sansIntro: true }); G.salle.combat = true; Son.jouer('gong'); }

// ── Scènes de jeu ──
const SceneJeu = {
  entrer() { },
  maj(dt) { majJeu(dt); },
  rendre(g) {
    rendreJeu(g); dessinerHUD(g);
    if (G.notifications.length && !banniereVisible() && !Entrees.enfonce('carte')) { const n = G.notifications[0]; plaqueHUD(g, 420, 76, 210, 34, '#c8a040'); Police.ecrire(g, n.titre, 428, 81, '#f0c040'); Police.ecrire(g, n.nom, 428, 93, '#fff0d0'); }
  },
};
Entrees.contexteJeu = () => Scenes.courante() === SceneJeu; // liaisons « en jeu » (tir aux boutons de face)
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
    cadreMenu(g, 280, 40, 320, 280); cadreMenu(g, 40, 198, 220, 122); dessinerMinicarte(g, 440, 186, true);
    const J = G.joueur, P = G.partie; Police.ecrire(g, G.etage.cfg.nom, 440, 46, '#e8dcc0', { a: 'c' });
    dessinerStats(g, J, 50, 206); Police.ecrire(g, 'Temps ' + formatTemps(P.temps), 130, 206, '#a8a0b8'); Police.ecrire(g, 'Code ' + codeAffiche(P.code), 130, 218, '#a8a0b8'); Police.ecrire(g, (P.difficile ? 'Difficile' : 'Standard') + (P.defi ? ' — ' + INDEX[P.defi].nom : ''), 130, 230, '#a8a0b8');
    Police.ecrire(g, 'Objets : ' + J.passifs.length, 130, 242, '#a8a0b8');
    // opportunité après le boss (E §6) : recalculée à chaque affichage, donc à jour après chaque événement
    const O = chanceOpportunite(), pc = v => Math.round(v * 100) + ' %';
    if (O.chance <= 0) Police.ecrire(g, 'Pas d’opportunité à cet étage', 50, 274, '#8a8098');
    else {
      Police.ecrire(g, 'Après le boss : ' + pc(O.chance), 50, 274, '#e8dcc0');
      Police.ecrire(g, 'pacte ' + pc(O.pacte) + ' · sanctuaire ' + pc(O.sanctuaire), 50, 286, '#c8a0b0');
      Police.paragraphe(g, O.detail.map(([n, v]) => n + ' ' + (v >= 1 ? '' : '+' + pc(v))).join(' · ') + (P.pactesAchetes ? ' · pacte conclu : plus de sanctuaire' : P.pactesRefuses ? ' · pactes refusés : ' + P.pactesRefuses : ''), 50, 298, 222, '#8a8098');
    }
    if (actif) aideBoutons(g, [['interagir', 'Choisir'], ['retour', 'Reprendre']]); // sous un autre menu : ses propres consignes
  },
};
const SceneInventaire = {
  entrer() { this.i = 0; },
  liste() { const J = G.joueur; const L = []; if (J.actif) L.push(J.actif.id); if (J.actif2) L.push(J.actif2.id); if (J.talisman) L.push(J.talisman); for (const id of J.passifs) L.push(id); for (const t of J.transformations) L.push(t); for (const s of synergiesReunies(J)) L.push(s.id); return L; },
  maj() { const L = this.liste(); const c = 12; if (Entrees.nav.dx) this.i = borne(this.i + Entrees.nav.dx, 0, Math.max(0, L.length - 1)); if (Entrees.nav.dy) this.i = borne(this.i + Entrees.nav.dy * c, 0, Math.max(0, L.length - 1)); if (Entrees.nav.dx || Entrees.nav.dy) Son.jouer('menu'); if (Entrees.menuRetour()) Scenes.depiler(); },
  rendre(g) {
    fondMenu(g); cadreMenu(g, 26, 32, 376, 304); cadreMenu(g, 408, 32, 226, 304);
    Police.ecrire(g, 'Objets, transformations et mutations', 320, 10, '#f0d8a0', { a: 'c', e: 2, contour: '#1c1420' });
    const L = this.liste(); const c = 12;
    L.forEach((id, k) => { const x = 40 + (k % c) * 30, y = 40 + Math.floor(k / c) * 26; g.fillStyle = k === this.i ? '#f0c870' : 'rgba(255,240,220,0.06)'; g.fillRect(x - 2, y - 2, 24, 24); if (k === this.i) { g.fillStyle = '#2a2034'; g.fillRect(x - 1, y - 1, 22, 22); } const d = INDEX[id]; g.drawImage(d.type === 'talisman' ? spriteRamassable('talisman', d.couleur) : d.type === 'transformation' ? iconeObjet(d.icone ? id : 'PSV_055') : id.startsWith('SYN_') ? iconeSynergie() : iconeObjet(id), x, y); });
    const id = L[this.i]; if (id) { const d = INDEX[id]; Police.ecrire(g, d.nom, 420, 44, '#fff0d0'); let y = 58; y += Police.paragraphe(g, d.desc || '', 420, y, 200, '#c8c0d8') + 6; for (const l of detailsObjet(d)) y += Police.paragraphe(g, '· ' + l, 420, y, 200, '#a8a0b8'); if (d.statut) Police.paragraphe(g, '[' + d.statut + ']', 420, y + 6, 200, '#7a7088'); if (d.visuel) Police.paragraphe(g, 'Mutation : ' + nomMutation(d.visuel), 420, y + 30, 200, '#8a9aa8'); }
    if (!L.length) Police.ecrire(g, 'Aucun objet pour l’instant.', 320, 160, '#8a8098', { a: 'c' });
    aideBoutons(g, [['retour', 'Retour']]);
  },
};
const SceneMort = {
  entrer() { this.menu = menuListe([{ label: 'Rejouer avec ce shinobi', action: () => { const P = G.partie; nouvellePartie({ perso: P.perso, difficile: P.difficile, defi: P.defi }); Scenes.aller(SceneJeu); } }, { label: 'Menu principal', action: () => Scenes.aller(SceneTitre) }]); this.t = 0; },
  maj(dt) { this.t += dt; if (this.t > 0.6) this.menu.maj(); },
  rendre(g) {
    g.fillStyle = 'rgba(20,4,8,0.82)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
    const v = g.createRadialGradient(320, 150, 80, 320, 170, 420); v.addColorStop(0, 'rgba(60,0,10,0)'); v.addColorStop(1, 'rgba(60,0,10,0.7)'); g.fillStyle = v; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
    bandeau(g, 60, 28, 520, 70, '#a02838', 'rgba(14,4,8,0.7)');
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
// La première phrase de la fin dépend du gardien vaincu (plusieurs boss possibles par étage)
const DEBUTS_FINS = {
  BOS_030: 'La marque reflue de la peau de Jūgo ; apaisé, il s’écarte, et le sceau se fissure.',
  BOS_031: 'Les deux frères ne forment plus qu’une ombre immobile, et le sceau se fissure.',
  BOS_033: 'La chimère se dissout dans le liquide de sa propre cuve, et le sceau se fissure.',
  BOS_019: 'Le masque se fend ; au-dehors, la pluie cesse pour la première fois depuis votre entrée.',
  BOS_023: 'Les papiers retombent comme une neige silencieuse ; la pluie cesse pour la première fois depuis votre entrée.',
  BOS_035: 'L’or et l’argent se ternissent ; au-dehors, la pluie cesse pour la première fois depuis votre entrée.',
};
function textesFin(route, boss) { const L = (TEXTES_FINS[route] || []).slice(); if ((route === 'RTE_01' || route === 'RTE_02') && DEBUTS_FINS[boss]) L[0] = DEBUTS_FINS[boss]; return L; }
const SceneVictoire = {
  entrer(o) { this.route = o.route; this.t = 0; this.boss = G.partie && G.partie.bossVaincus ? G.partie.bossVaincus[G.partie.bossVaincus.length - 1] : null; },
  maj(dt) { this.t += dt; if (this.t > 1.5 && Entrees.menuConfirmer()) { Scenes.aller(SceneTitre); } },
  rendre(g) {
    g.drawImage(fondTitre(), 0, 0); animerFond(g, this.t); g.fillStyle = 'rgba(8,6,14,0.5)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
    cadreMenu(g, 90, 26, 460, 290);
    const R = INDEX[this.route] || { nom: 'Victoire' };
    titreOrne(g, R.nom, 320, 40, '#f8e0a8');
    let y = 90; for (const l of textesFin(this.route, this.boss)) y += Police.paragraphe(g, l, 120, y, 400, '#e0d8e8') + 10;
    Police.ecrire(g, 'Marque obtenue pour ' + G.joueur.def.nom + ' : ' + (R.marque || ''), 320, y + 20, '#c0e0a0', { a: 'c' });
    if (R.recompense) Police.couper(R.recompense, 540).forEach((l, i) => Police.ecrire(g, l, 320, y + 36 + i * 12, '#a8a0b8', { a: 'c' }));
    if (G.partie.defi) Police.ecrire(g, 'Contrat « ' + INDEX[G.partie.defi].nom + ' » : ' + (G.partie.defiEchoue ? 'non rempli (conditions non tenues)' : 'rempli'), 320, 284, G.partie.defiEchoue ? '#e0a080' : '#a0e0a0', { a: 'c' });
    Police.ecrire(g, 'Temps ' + formatTemps(G.partie.temps) + '   Code ' + codeAffiche(G.partie.code), 320, 300, '#8a8098', { a: 'c' });
    if (this.t > 1.5) aideBoutons(g, [['interagir', 'Continuer']]);
  },
};
const SceneDeconnexion = {
  maj() { if (Entrees.pad || Entrees.touches.size) { if (Entrees.menuConfirmer() || Entrees.pad && Entrees.boutons.some(Boolean)) { Scenes.depiler(); } } },
  rendre(g) { g.fillStyle = 'rgba(6,4,10,0.85)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); Police.ecrire(g, 'Manette déconnectée', 320, 150, '#ffd0a0', { a: 'c', e: 2 }); Police.ecrire(g, 'Reconnectez-la puis appuyez sur un bouton (ou Entrée) pour reprendre.', 320, 180, '#c8c0d8', { a: 'c' }); },
};

// ── Démarrage et boucle ──
let _dernier = 0, _accu = 0, _appuiSon = false;
function boucle(t) {
  const dt = Math.min(0.1, (t - _dernier) / 1000 || 0); _dernier = t; _accu += dt; let n = 0;
  // la manette ne suffit pas à autoriser le son : on retente à chaque nouvel appui (utile si la page a déjà été cliquée)
  const appui = Entrees.pad && Entrees.boutons.some(Boolean); if (appui && !_appuiSon && Son.suspendu()) Son.demarrer(); _appuiSon = appui;
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
  const activer = () => Son.demarrer(); for (const ev of ['keydown', 'pointerdown', 'touchend', 'click']) addEventListener(ev, activer);
  Scenes.aller(SceneTitre);
  requestAnimationFrame(boucle);
  // Interface de test (Playwright) : pas de dépendance du jeu envers elle
  window.LDS = { G, DON, INDEX, Scenes, Entrees, Son, Musique, dessinerPerso, dessinerJoueur, verifierTransformations, chargerActif, prixObjet, esquiveEclair, ouvrirOpportunite, VARIANTES_OPP, objetTroc, tirerVariante, verifierEveils, eveilsDe, spriteFamilier, spriteBossPeint, BOSS_PEINTS, lancerTelegraphe, executerAttaqueBoss, cibleFiche, ficheObjet, synergiesActives, synergiesReunies, naturesJoueur, evenement, infligerDegats, dansSableArene, dessinerEnnemi, tirEnnemi, creerZone, tirerOpportunite, SceneRegistre, SceneSelection, SceneVictoire, nouvellePartie, entrerSalle, entrerEtage, genererEtage, configEtage, acquerirPassif, creerEnnemi, creerBoss, majJeu, SceneJeu, SceneTitre, Progression, recalculer, calculerStats, calculerProfil, relancerPiedestaux, planEtage, serialiserPartie, reprendrePartie, chanceOpportunite, tirerObjet, Stockage, CLES, utiliserActif, donnerConsommable, utiliserPoche, verifierNettoyage, demarrerTransition, PROP, T, tuileA, TUILE, appliquerGabarit, Rendu, spriteEnnemi, prixRyo, peutPayer, acheter, poserPiedestal, creerRamassable, collecter, explosion, blesserJoueur, payerSante, sacrifier, soignerJoueur, santeInit, subirDemis, rougeTotal, santeTotale, utiliserMachine };
}
