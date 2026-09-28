// ═══════════════════════════════════════════════════════════════════════════
// Progression durable : personnages, variantes, objets ajoutés aux pools,
// routes, défis, secrets, améliorations de services (caisse des marchands)
// et marques de victoire. Pas d'arbre de +1 % de dégâts acheté après la mort.
// Résultats séparés : Standard, Difficile, Défi, Entraînement.
// ═══════════════════════════════════════════════════════════════════════════

const Progression = {
  profil: null,
  charger() {
    const p = Stockage.lire(CLES.profil);
    this.profil = Object.assign({ version: 1, toutDebloque: false, objectifs: {}, marques: {}, decouverts: [], vus: [], compteurs: {}, dons: 0, parties: 0, victoires: 0, morts: 0, defis: {}, meilleurs: {}, routes: {} }, p || {});
    this.indexObjectifs();
  },
  sauver() { if (G.modeTest) return; Stockage.ecrire(CLES.profil, this.profil); },
  indexObjectifs() {
    // quels identifiants sont verrouillés, et par quels objectifs ? (un seul suffit à débloquer)
    this.verrous = {};
    const ajouter = (id, o) => { (this.verrous[id] || (this.verrous[id] = [])).includes(o) || this.verrous[id].push(o); };
    for (const o of DON.objectifs) for (const id of (o.recompense && o.recompense.debloque) || []) ajouter(id, o.id);
    for (const d of DON.personnages) if (d.deblocage && d.deblocage.objectif) ajouter(d.id, d.deblocage.objectif);
  },
  estDebloque(id) {
    if (!this.profil || this.profil.toutDebloque) return true;
    const L = this.verrous && this.verrous[id]; if (!L) return true;
    return L.some(o => !!this.profil.objectifs[o]);
  },
  decouvrir(id) { if (!this.profil) return; if (!this.profil.decouverts.includes(id)) { this.profil.decouverts.push(id); } },
  // Secret trouvé : inscrit au profil (onglet « Secrets » du Registre) et annoncé la première fois
  secret(id) { if (!this.profil || this.profil.decouverts.includes(id)) return; this.profil.decouverts.push(id); this.sauver(); G.notifications = G.notifications || []; G.notifications.push({ t: 0, titre: 'Secret découvert', nom: (INDEX[id] || {}).nom || id, detail: '' }); },
  voir(id) { if (!this.profil) return; if (!this.profil.vus.includes(id)) this.profil.vus.push(id); },
  compteur(nom, n) { if (!this.profil) return; this.profil.compteurs[nom] = (this.profil.compteurs[nom] || 0) + n; this.verifier({ type: 'compteur', nom }); },
  niveauBoutique() { const d = this.profil ? this.profil.dons : 0; return d >= 300 ? 3 : d >= 150 ? 2 : d >= 50 ? 1 : 0; },
  etageMaximum() { if (this.profil && (this.profil.toutDebloque || this.profil.routes.RTE_01)) return this.profil.routes.RTE_02 || this.profil.toutDebloque ? 9 : 8; return 6; },
  brancheOuverte() { return !!(this.profil && (this.profil.toutDebloque || this.profil.routes.RTE_02)); },
  debutPartie(P) { this.profil.parties++; this.partie = { degatsAucun: true, objetsPris: 0, boutique: 0 }; this.sauver(); },
  bossVaincu(id) { this.profil.compteurs['boss_' + id] = (this.profil.compteurs['boss_' + id] || 0) + 1; this.verifier({ type: 'boss', id }); this.compteur('bossVaincus', 1); },
  surEvenement(nom, d) {
    if (!this.profil || !G.partie) return;
    if (nom === 'degat_recu') this.partie && (this.partie.degatsAucun = false);
    if (nom === 'objet_acquis') this.compteur('objetsPris', 1);
    if (nom === 'elimination') this.compteur('eliminations', 1);
    if (nom === 'achat') this.compteur('achats', 1);
    if (nom === 'transformation') this.compteur('transformations', 1);
    if (nom === 'salle_nettoyee' && G.salle.type === 'defi') this.compteur('epreuvesChunin', 1);
    if (nom === 'salle_nettoyee' && G.joueur && G.joueur.familiers.some(f => !f.dureeSalle)) this.compteur('sallesFamiliers', 1);
    // états instantanés vérifiés à chaque événement
    const J = G.joueur;
    if (J) {
      if (J.sante.prot.length >= 6) this.verifier({ type: 'etat', nom: 'protections3' });
      if (J.familiers.filter(f => !f.dureeSalle).length >= 3) this.verifier({ type: 'etat', nom: 'familiers3' });
      if (J.ryo >= 50) this.verifier({ type: 'etat', nom: 'ryo50' });
      if (J.passifs.length >= 12) this.verifier({ type: 'etat', nom: 'objets12' });
    }
  },
  // Fin de partie : marques par personnage et routes
  // Conditions d'un contrat à la victoire : chronomètre, cible d'étage (déjà validée à l'arrivée)
  conditionsDefi(P, route) { const D = INDEX[P.defi]; if (!D) return false; if (D.chrono && P.temps > D.chrono) return false; if (D.etageCible && !P.defiValide) return false; return true; },
  defiReussi(id) { if (!this.profil || this.profil.defis[id]) return; this.profil.defis[id] = true; this.sauver(); G.notifications = G.notifications || []; G.notifications.push({ t: 0, titre: 'Contrat rempli', nom: (INDEX[id] || {}).nom || id, detail: '' }); },
  finPartie(resultat, route) {
    const P = G.partie; const persoId = P.perso; this.profil.morts += resultat === 'mort' ? 1 : 0;
    if (resultat === 'victoire') {
      this.profil.victoires++;
      const cle = P.defi ? 'defi' : P.entrainement || P.graineSaisie ? 'entrainement' : P.difficile ? 'difficile' : 'standard';
      if (cle !== 'entrainement') { this.profil.routes[route] = true; const m = this.profil.marques[persoId] || (this.profil.marques[persoId] = {}); m[route] = m[route] === 'difficile' ? 'difficile' : cle; }
      const ok = P.defi && this.conditionsDefi(P, route);
      if (ok) this.profil.defis[P.defi] = true; else if (P.defi) P.defiEchoue = true;
      this.verifier({ type: 'fin', route, perso: persoId, difficile: P.difficile, defi: ok ? P.defi : null });
    }
    const b = this.profil.meilleurs[persoId] || { etage: 0, temps: null };
    if (P.etage > b.etage) b.etage = P.etage; if (resultat === 'victoire' && (!b.temps || P.temps < b.temps)) b.temps = P.temps; this.profil.meilleurs[persoId] = b;
    this.sauver();
  },
  // Vérifie les objectifs concernés par un fait
  verifier(fait) {
    const P = G.partie; if (!P || !this.profil) return;
    if (P.graineSaisie && !P.defi) return; // les codes saisis n'ouvrent pas de déblocages (annoncé à l'écran)
    for (const o of DON.objectifs) {
      if (this.profil.objectifs[o.id]) continue;
      const c = o.condition; if (!c || c.type !== fait.type) continue;
      let ok = false;
      switch (c.type) {
        case 'boss': ok = c.id === fait.id && (!c.sansDegats || !G.etage.degatsBoss) && (!c.perso || c.perso === P.perso); break;
        case 'compteur': ok = c.nom === fait.nom && (this.profil.compteurs[c.nom] || 0) >= c.min; break;
        case 'etat': ok = c.nom === fait.nom; break;
        case 'fin': ok = (!c.route || c.route === fait.route) && (!c.perso || c.perso === fait.perso) && (!c.difficile || fait.difficile) && (!c.defi || c.defi === fait.defi); break;
      }
      if (ok) this.accomplir(o);
    }
  },
  accomplir(o) {
    this.profil.objectifs[o.id] = Date.now(); this.sauver();
    G.notifications = G.notifications || []; G.notifications.push({ t: 0, titre: 'Mission accomplie', nom: o.nom, detail: o.recompense && o.recompense.texte || '' });
    Son.jouer('secret');
  },
  donner(n) { this.profil.dons += n; this.compteur('dons', n); this.sauver(); },
};
