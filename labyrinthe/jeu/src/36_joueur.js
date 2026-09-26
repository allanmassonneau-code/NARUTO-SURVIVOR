// ═══════════════════════════════════════════════════════════════════════════
// Joueur : création depuis un personnage, déplacement analogique (accélération,
// frottement, aide d'alignement aux portes), dégâts reçus (dommage ≠ prix payé
// ≠ sacrifice), invulnérabilité bornée, résurrections, actions de poche.
// Collision de déplacement : cercle de 7 px aux pieds ; zone touchée : 5 px.
// ═══════════════════════════════════════════════════════════════════════════

function creerJoueur(defId) {
  const d = INDEX[defId];
  const J = {
    def: d, cle: d.cle, x: 0, y: 0, vx: 0, vy: 0, r: 7, rTouche: 5, z: 0,
    dirCorps: 'bas', dirTete: 'bas', frame: 0, tAnim: 0, tCligne: 2 + Math.random() * 3,
    sante: santeInit(d.sante), invuln: 0, intangible: false, etat: 'normal',
    ryo: d.ressources.ryo, cles: d.ressources.cles, explosifs: d.ressources.explosifs, clesDorees: false, explosifsDores: false,
    passifs: [], acquis: [], transformations: [], bonus: [], bonusPermanents: [], familiers: [], mutations: {}, mutationsToutes: [],
    actif: null, actif2: null, talisman: null, poches: [], maxPoches: 1, maxTalismans: 1, talisman2: null,
    tir: { cooldown: 0, charge: 0, dir: 'bas', salveFile: [], salveT: 0, alterne: false, anim: 0 },
    drapeaux: {}, compteurs: { sallesNettoyees: 0, elims: 0 }, bloqueTir: 0, force: 0, sceau: 0, clones: 0,
    stats: null, profil: null, vol: false,
  };
  const rc = d.regleCode; const B = J.drapeauxBase = {};
  if (rc === 'corps_marionnette') B.sansVitalite = true;
  if (rc === 'avarice') { B.plafondVit = 3; B.ryoSoigne = true; B.pacteRyo = 15; }
  if (rc === 'sceau_centaine') { B.plafondVit = 2; J.sceau = 4; }
  if (rc === 'ninja_copieur') J.deuxActifs = true;
  if (rc === 'clones_ressource') { J.clones = 2; }
  if (rc === 'cinq_coeurs') J.coeursReserve = 4;
  if (rc === 'serment') B.serment = true;
  J.drapeaux = Object.assign({}, B);
  if (d.actif) J.actif = { id: d.actif, charges: INDEX[d.actif] ? chargesMax(INDEX[d.actif]) : 0 };
  for (const p of d.passifs || []) { J.passifs.push(p); J.acquis.push(p); }
  recalculer(J);
  for (const f of d.familiersDepart || []) ajouterFamilier(J, f, d.id);
  if (rc === 'clones_ressource') majClonesRessource(J);
  return J;
}

// ── Déplacement ──
function majDeplacementJoueur(J, dt) {
  const s = G.salle; const E = Entrees;
  let mx = E.deplacement.x, my = E.deplacement.y;
  if (J.bloqueDeplacement > 0) { J.bloqueDeplacement -= dt; mx = 0; my = 0; }
  if (J.etat === 'objet' || J.etat === 'mort' || J.dash) { mx = 0; my = 0; }
  let v = J.stats.vitesse * TUILE;
  if (J.tir.rotation) v *= 0.6;
  if (!J.vol) { const t = tuilePx(s, J.x, J.y); if (t === T.TOILE && !J.drapeaux.immuniteSol) v *= 0.55; }
  for (const z of G.zones) if (!J.vol && (z.type === 'eau' || z.type === 'sable_mouvant' || z.type === 'toile_zone') && dist(z.x, z.y, J.x, J.y) < z.r && !J.drapeaux.immuniteSol) v *= 0.65;
  const cx = mx * v, cy = my * v;
  // accélération 0,08 s ; freinage 0,07 s (sensation Isaac-like, précise)
  const acc = (Math.hypot(mx, my) > 0.05 ? 12.5 : 14.5) * dt;
  J.vx = lerp(J.vx, cx, Math.min(1, acc)); J.vy = lerp(J.vy, cy, Math.min(1, acc));
  if (Math.abs(J.vx) < 0.5) J.vx = 0; if (Math.abs(J.vy) < 0.5) J.vy = 0;
  // courant (variante Écluses) et aspiration (Pain)
  if (G.pousse) { J.vx += G.pousse.x * dt * 60; J.vy += G.pousse.y * dt * 60; }
  // aide d'alignement devant une porte ouverte
  aideAlignementPorte(J, mx, my, dt);
  const mode = J.vol ? 'vol' : 'marche';
  deplacerCercle(s, J, J.vx * dt, J.vy * dt, mode);
  // animation
  const m = Math.hypot(J.vx, J.vy);
  if (m > 12) { J.tAnim += dt * (m / TUILE) * 1.6; J.frame = Math.floor(J.tAnim * 2) % 4; J.dirCorps = dirDepuisVecteur(J.vx, J.vy); }
  else J.frame = 0;
  if (!Entrees.visee.dir && J.tir.anim <= 0 && m > 12) J.dirTete = J.dirCorps;
  J.tir.anim -= dt;
  J.tCligne -= dt; if (J.tCligne < -0.12) J.tCligne = 2 + Math.random() * 4;
}
function aideAlignementPorte(J, mx, my, dt) {
  const s = G.salle; if (!s || Math.hypot(mx, my) < 0.4) return;
  for (const p of s.portes) {
    if (!porteOuverte(s, p) || p.etat === 'secrete') continue;
    const [dx, dy] = DIRS[p.dir]; if (mx * dx + my * dy < 0.5) continue;
    const [px, py] = centreTuile(p.tx, p.ty);
    if (dx !== 0) { if (Math.abs(J.x - px) < 3 * TUILE && Math.abs(J.y - py) < 18) J.vy += (py - J.y) * 10 * dt * 6; }
    else { if (Math.abs(J.y - py) < 3 * TUILE && Math.abs(J.x - px) < 18) J.vx += (px - J.x) * 10 * dt * 6; }
  }
}

// ── Dégâts reçus (dommage ordinaire) ──
function blesserJoueur(demis, src = {}) {
  const J = G.joueur;
  if (J.invuln > 0 || J.intangible || J.etat === 'mort' || G.transition || J.etat === 'objet') return false;
  if (G.modeTest && G.modeTest.dieu) return false;
  // protections acquises (dans l'ordre) : bouclier de sable, substitution, talisman, clones
  if (J.def.regleCode === 'bouclier_sable' && J.bouclierSable) { J.bouclierSable = false; J.invuln = 0.6; G.effets.push({ type: 'bouclier_sable', x: J.x, y: J.y - 12, age: 0, duree: 0.5 }); Son.jouer('sable'); return false; }
  if (J.drapeaux.substitution && Math.random() < Math.min(0.5, 0.15 + 0.03 * J.stats.chance)) { J.invuln = 1; G.effets.push({ type: 'buche', x: J.x, y: J.y, age: 0, duree: 0.8 }); Son.jouer('fumee'); evenement('substitution', {}); return false; }
  if (J.talisman === 'TAL_033' && !G.etage.charmeUtilise) { G.etage.charmeUtilise = true; J.invuln = 1; G.effets.push({ type: 'immunite', x: J.x, y: J.y - 20, age: 0, duree: 0.6 }); return false; }
  if (J.def.regleCode === 'clones_ressource' && J.clones > 0) { J.clones--; majClonesRessource(J); J.invuln = 1.0; G.effets.push({ type: 'fumee', x: J.x + 10, y: J.y - 8, age: 0, duree: 0.4 }); Son.jouer('fumee'); return false; }
  if (J.drapeaux.armureSable && demis >= 2) demis = Math.max(1, demis - 1);
  const avant = rougeTotal(J.sante);
  const res = subirDemis(J.sante, demis);
  J.invuln = J.dureeInvuln || 1.0; J.clignote = 0;
  G.stats.degatsRecus += demis;
  if (res.perduRouge > 0) G.etage.degatsVitalite = true;
  G.etage.degatsSubis = true; if (G.salle.type === 'boss') G.etage.degatsBoss = true;
  // réserve instable rompue : impulsion offensive (40 dégâts à tous les ennemis de la salle)
  for (let i = 0; i < res.rompusInstables; i++) { for (const e of G.ennemis) if (!e.mort && !e.cache) infligerDegats(e, 40, { proprio: 'joueur', type: 'instable' }); G.effets.push({ type: 'onde_noire', x: J.x, y: J.y - 10, r: 400, age: 0, duree: 0.5 }); Son.jouer('explosion'); }
  Son.jouer('degat_joueur'); Entrees.vibrer('degats'); secousse(4, src.x !== undefined ? angleVers(src.x, src.y, J.x, J.y) : null);
  if (src.x !== undefined) { const [nx, ny] = normaliser(J.x - src.x, J.y - src.y); J.vx += nx * 160; J.vy += ny * 160; }
  G.flashDegat = 0.25;
  evenement('degat_recu', { demis, src, res });
  if (res.mort) verifierMort(J, src);
  else if (santeTotale(J.sante) <= 1 && J.def.regleCode === 'obstination' && !J.drapeaux.obstination) { J.drapeaux.obstination = true; recalculer(J); G.textes.push({ x: J.x, y: J.y - 34, t: 'Obstination !', age: 0, duree: 1, couleur: '#ffb040' }); }
  if (J.def.regleCode === 'sceau_centaine' && santeTotale(J.sante) <= 1 && J.sceau > 0) { const k = Math.min(J.sceau, rougeMax(J.sante) - rougeTotal(J.sante)); soignerRouge(J.sante, k); J.sceau -= k; G.effets.push({ type: 'sceau_soin', x: J.x, y: J.y - 16, age: 0, duree: 0.8 }); Son.jouer('coeur'); }
  return true;
}
// Prix payé en santé (pactes, machines) : ne déclenche pas les passifs de dommage
function payerSante(demis, raison) {
  const J = G.joueur; const res = subirDemis(J.sante, demis);
  evenement('cout_paye', { demis, raison });
  if (res.mort) verifierMort(J, { type: 'prix', raison });
  return res;
}
// Sacrifice volontaire (autel de tribut) : distinct du dommage et du prix
function sacrifier(demis) {
  const J = G.joueur; if (J.invuln > 0) return null;
  const res = subirDemis(J.sante, demis); J.invuln = 0.8;
  Son.jouer('pics'); evenement('sacrifice', { demis });
  if (res.mort) verifierMort(J, { type: 'sacrifice' });
  return res;
}
function verifierMort(J, src) {
  // résurrections, dans l'ordre : cœur de réserve (Kakuzu), cœur volé (objet), puis mort
  if (J.coeursReserve > 0) { J.coeursReserve--; J.sante = santeInit({ vitalite: 1 }); J.invuln = 2; G.effets.push({ type: 'resurrection', x: J.x, y: J.y, age: 0, duree: 1 }); Son.jouer('transformation'); G.textes.push({ x: J.x, y: J.y - 34, t: 'Cœur de réserve !', age: 0, duree: 1.4, couleur: '#6ad060' }); return; }
  const k = J.passifs.indexOf('PSV_089');
  if (k >= 0) { J.passifs.splice(k, 1); J.sante = santeInit({ vitalite: 1 }); if (J.drapeaux.sansVitalite) J.sante = santeInit({ protection: 1 }); recalculer(J); J.invuln = 2; G.effets.push({ type: 'resurrection', x: J.x, y: J.y, age: 0, duree: 1 }); Son.jouer('transformation'); return; }
  J.etat = 'mort'; G.causeMort = src; declencherMort();
}

// ── Clones (Naruto altéré) ──
function majClonesRessource(J) {
  J.familiers = J.familiers.filter(f => f.def.id !== 'FAM_CLONE_RES');
  for (let i = 0; i < J.clones; i++) ajouterFamilier(J, 'FAM_CLONE_RES', 'ALT_001');
}

// ── Bonus temporaires (salle / durée / étage) ──
function ajouterBonus(J, b) { J.bonus.push(Object.assign({ t: b.duree || 0 }, b)); recalculer(J); }
function majBonus(J, dt) {
  let chg = false;
  for (const b of J.bonus) if (typeof b.duree === 'number' && b.duree > 0) { b.t -= dt; if (b.t <= 0) { b.fini = true; chg = true; } }
  if (chg) { J.bonus = J.bonus.filter(b => !b.fini); recalculer(J); }
}
function finSalleBonus(J) { const n = J.bonus.length; J.bonus = J.bonus.filter(b => b.duree !== 'salle'); if (J.drapeaux.obstination) { J.drapeaux.obstination = false; } if (n !== J.bonus.length || true) recalculer(J); }
function finEtageBonus(J) { J.bonus = J.bonus.filter(b => b.duree !== 'etage' && b.duree !== 'salle'); recalculer(J); }
