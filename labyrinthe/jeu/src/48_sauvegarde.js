// ═══════════════════════════════════════════════════════════════════════════
// Sauvegardes : réglages, profil de progression et partie suspendue sont trois
// enregistrements séparés. Écriture atomique (copie temporaire puis bascule),
// sauvegarde de secours, versions et migrations. Une partie n'est jamais
// enregistrée au milieu d'un combat : point de reprise = entrée de salle
// ou salle nettoyée (transactions : achats, pactes, étages).
// ═══════════════════════════════════════════════════════════════════════════

const CLES = { reglages: 'lds_reglages', profil: 'lds_profil', partie: 'lds_partie' };
const REGLAGES_DEFAUT = {
  volMusique: 0.6, volEffets: 0.8, vibrations: 0.7, secousses: 0.7, sansFlash: false, confort: false,
  zoneMorteG: 0.18, zoneMorteD: 0.12, courbeG: 1.0, seuilVisee: 0.5, seuilRepos: 0.35, hysteresisAngle: 12,
  profilTir: 'stick+croix', chargeAuto: false, afficherStats: true, chiffresDegats: false, echelle: 'entiere',
  liaisons: { manette: {}, clavier: {} }, viseeLibreControle: false, version: 1,
};
const Stockage = {
  lire(cle) {
    let brut = null; try { brut = localStorage.getItem(cle); } catch (e) { return null; }
    const essayer = s => { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } };
    let v = essayer(brut);
    if (!v) { try { v = essayer(localStorage.getItem(cle + '_tmp')) || essayer(localStorage.getItem(cle + '_bak')); } catch (e) { v = null; } }
    return v;
  },
  ecrire(cle, obj) {
    try {
      const s = JSON.stringify(obj);
      localStorage.setItem(cle + '_tmp', s);
      const ancien = localStorage.getItem(cle); if (ancien) localStorage.setItem(cle + '_bak', ancien);
      localStorage.setItem(cle, s); localStorage.removeItem(cle + '_tmp');
      return true;
    } catch (e) { return false; }
  },
  effacer(cle) { try { localStorage.removeItem(cle); localStorage.removeItem(cle + '_tmp'); } catch (e) { /* stockage indisponible */ } },
};
function chargerReglages() {
  const r = Stockage.lire(CLES.reglages) || {};
  const R = Object.assign({}, REGLAGES_DEFAUT, r); R.liaisons = Object.assign({ manette: {}, clavier: {} }, r.liaisons || {});
  return R;
}
function sauverReglages() { Stockage.ecrire(CLES.reglages, G.reglages); }

// ── Partie suspendue ──
function serialiserSalle(s) {
  const o = {};
  for (const k of Object.keys(s)) {
    if (k.startsWith('_') || typeof s[k] === 'function') continue;
    if (k === 'sorties') { o.sorties = (s.sorties || []).map(x => ({ type: x.type, x: x.x, y: x.y, branche: x.branche, lumiere: x.lumiere, route: x.route, refus: x.refus })); continue; }
    o[k] = s[k];
  }
  return o;
}
function serialiserJoueur(J) {
  const o = {};
  for (const k of ['cle', 'x', 'y', 'dirCorps', 'dirTete', 'sante', 'ryo', 'cles', 'explosifs', 'clesDorees', 'explosifsDores', 'passifs', 'acquis', 'transformations', 'bonusPermanents', 'actif', 'actif2', 'talisman', 'talisman2', 'poches', 'maxPoches', 'maxTalismans', 'drapeaux', 'compteurs', 'force', 'sceau', 'clones', 'coeursReserve', 'marionnette', 'deuxActifs']) o[k] = J[k];
  o.def = J.def.id; o.bonus = J.bonus.filter(b => b.duree === 'etage' || b.duree === 'permanent');
  o.familiers = J.familiers.filter(f => !f.dureeSalle && f.def.comportement !== 'clone_res').map(f => ({ id: f.def.id, source: f.source, etage: f.etage, variante: f.variante }));
  return o;
}
function serialiserPartie() {
  const P = G.partie, E = G.etage;
  const p = Object.assign({}, P); delete p.joueur;
  const e = { numero: E.numero, cfg: E.cfg, grille: E.grille, depart: E.depart, boss: E.boss, secret: E.secret, isolee: E.isolee, courante: E.courante, degatsVitalite: E.degatsVitalite, degatsSubis: E.degatsSubis, degatsBoss: E.degatsBoss, opportunite: E.opportunite, faveurSanctuaire: E.faveurSanctuaire, malediction: E.malediction, charmeUtilise: E.charmeUtilise, salles: {} };
  for (const [id, s] of Object.entries(E.salles)) e.salles[id] = serialiserSalle(s);
  return { v: VERSION_SAUVEGARDE, donnees: VERSION_DONNEES, jeu: VERSION_JEU, date: Date.now(), partie: p, etage: e, joueur: serialiserJoueur(G.joueur),
    aleas: { butin: G.alea.butin.etat(), recomp: G.alea.recomp.etat(), ennemis: G.alea.ennemis.etat(), combat: G.alea.combat.etat() }, stats: G.stats };
}
function instantaneEntree() { if (!G.partie || G.modeTest) return null; try { return serialiserPartie(); } catch (e) { return null; } }
function sauvegarderPartie(raison) {
  if (!G.partie || G.modeTest || G.partie.fini) return;
  if (G.salle && G.salle.combat) return; // jamais au milieu d'un combat
  const snap = serialiserPartie(); G.instantaneSalle = snap; Stockage.ecrire(CLES.partie, snap);
}
function sauvegarderEtQuitter() { const snap = G.instantaneSalle || serialiserPartie(); Stockage.ecrire(CLES.partie, snap); }
function partieSuspendue() { const s = Stockage.lire(CLES.partie); return s && s.v ? s : null; }
function effacerPartieSuspendue() { Stockage.effacer(CLES.partie); }
function migrerPartie(s) {
  // v1 → v2 : santé en tableau ; v2 → v3 : poches multiples
  if (s.v < 2 && s.joueur && typeof s.joueur.sante.cont === 'number') s.joueur.sante = santeInit({ vitalite: s.joueur.sante.cont });
  if (s.v < 3 && s.joueur && !Array.isArray(s.joueur.poches)) s.joueur.poches = s.joueur.poche ? [s.joueur.poche] : [];
  s.v = VERSION_SAUVEGARDE; return s;
}
function reprendrePartie(s) {
  s = migrerPartie(s);
  G.partie = Object.assign({}, s.partie); G.stats = s.stats || G.stats;
  const Jd = s.joueur; const J = creerJoueur(Jd.def);
  for (const k of Object.keys(Jd)) if (k !== 'def' && k !== 'familiers') J[k] = Jd[k];
  J.familiers = []; for (const f of Jd.familiers || []) { const x = ajouterFamilier(J, f.id, f.source); if (x) { x.etage = f.etage; x.variante = f.variante; } }
  if (J.def.regleCode === 'clones_ressource') majClonesRessource(J);
  J.bonus = J.bonus || []; J.tir = { cooldown: 0, charge: 0, dir: 'bas', salveFile: [], salveT: 0, alterne: false, anim: 0 }; J.etat = 'normal'; J.invuln = 1;
  recalculer(J); G.partie.joueur = J; G.joueur = J;
  const e = s.etage; const E = Object.assign({}, e, { salles: {} });
  for (const [id, x] of Object.entries(e.salles)) E.salles[id] = Object.assign(x, { fondSale: true });
  for (const x of Object.values(E.salles)) for (const so of x.sorties || []) if (so.lumiere) so.condition = () => G.partie.pactesAchetes === 0 || possede(G.joueur, 'PSV_900');
  G.etage = E; G.variante = E.cfg.mod; G.theme = E.cfg.theme; G.degatsEnnemis = E.cfg.degats; G.degatsContact = E.cfg.degats;
  const n = E.numero;
  G.alea = { butin: new Alea(s.aleas.butin), recomp: new Alea(s.aleas.recomp), ennemis: new Alea(s.aleas.ennemis), combat: new Alea(s.aleas.combat), cosmo: new Alea(Math.random() + '') };
  G.salle = null; G.textes = []; G.positionEntree = { x: Jd.x, y: Jd.y };
  E.salles[E.courante].visitee = true;
  entrerSalle(E.courante, null);
  const th = INDEX[E.cfg.theme]; Musique.jouerPiste(E.cfg.theme, th.musique);
}
