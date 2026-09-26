// ═══════════════════════════════════════════════════════════════════════════
// Familiers : suiveur tireur, copieur (tir depuis familier), orbital, contact,
// chasseur, collecteur, soutien, bloqueur, kamikaze, piégeur, marionnette.
// Ils ne bloquent pas les portes, ne poussent pas le joueur, se replacent à
// l'entrée de salle ; une copie n'hérite jamais d'une autre copie.
// ═══════════════════════════════════════════════════════════════════════════

function ajouterFamilier(J, id, source) {
  const d = DON.familiers.find(f => f.id === id); if (!d) return null;
  const f = { def: d, x: J.x, y: J.y, vx: 0, vy: 0, t: Math.random(), cd: 0, source, uid: Math.random().toString(36).slice(2), angle: Math.random() * Math.PI * 2 };
  f.bloque = !!d.bloque; f.rBloc = d.rBloc || 7; f.collecte = d.comportement === 'collecteur';
  if (d.comportement === 'clone_temp') { f.dureeSalle = true; }
  J.familiers.push(f);
  return f;
}
function retirerFamiliersSalle(J) { J.familiers = J.familiers.filter(f => !f.dureeSalle && !(f.etage && G.etage && f.etage !== G.etage.numero)); }

function majFamiliers(J, dt) {
  const suiveurs = J.familiers.filter(f => ['suiveur_tireur', 'copieur', 'soutien', 'collecteur_suiveur', 'pakkun', 'luciole', 'clone_temp', 'clone_res'].includes(f.def.comportement));
  const orbitaux = J.familiers.filter(f => f.def.comportement === 'orbital');
  const dir = Entrees.visee.dir;
  const bonusFam = (J.talisman === 'TAL_020' ? 1.2 : 1) * (J.transformations.includes('TRF_011') ? 1.25 : 1) * (J.transformations.includes('TRF_004') && ['marionnette'].includes(J.familiers[0] && 'x') ? 1 : 1);
  // chaîne de suiveurs
  let prec = { x: J.x, y: J.y };
  for (const f of suiveurs) {
    const d = dist(f.x, f.y, prec.x, prec.y);
    if (d > 16) { const k = Math.min(1, (d - 16) / d * 10 * dt); f.x += (prec.x - f.x) * k; f.y += (prec.y - f.y) * k; }
    prec = f;
  }
  let io = 0;
  for (const f of J.familiers) {
    const D = f.def; f.t += dt; f.cd -= dt;
    switch (D.comportement) {
      case 'suiveur_tireur': case 'clone_res':
        if (dir && f.cd <= 0) { f.cd = 1 / (D.cadence || 1.8); const a = Math.atan2(DIRS[dir][1], DIRS[dir][0]);
          const deg = D.coefJoueur ? J.stats.degats * D.coefJoueur : (D.degats || 3.5) * bonusFam;
          const p = tirFamilier(f, a, deg, D); if (D.statut) p.statuts = [{ statut: D.statut, chance: D.chanceStatut || 0.3 }]; }
        break;
      case 'copieur': case 'clone_temp':
        if (dir && f.cd <= 0) { f.cd = delaiTir(J); const a = Math.atan2(DIRS[dir][1], DIRS[dir][0]);
          const p = tirFamilier(f, a, J.stats.degats * (D.coef || 0.75) * bonusFam, D); p.impacts = J.profil.impacts.slice(); p.statuts = J.profil.statuts.slice(); p.traj = Object.assign({}, J.profil.traj); p.perce = J.profil.perce; p.spectral = J.profil.spectral; p.apparence = J.profil.apparence; p.gen = 1; }
        if (D.comportement === 'clone_temp') { // disparaît au premier coup reçu
          for (const p of G.proj) if (p.proprio === 'ennemi' && dist(p.x, p.y, f.x, f.y - 8) < 9) { detruireProjectile(p, 'bloque'); f.fini = true; }
          for (const e of G.ennemis) if (!e.mort && !e.cache && dist(e.x, e.y, f.x, f.y) < e.r + 6) f.fini = true;
          if (f.fini) { G.effets.push({ type: 'fumee', x: f.x, y: f.y - 8, age: 0, duree: 0.4 }); Son.jouer('fumee', 0.5); }
        }
        break;
      case 'orbital': {
        const n = orbitaux.length; const k = orbitaux.indexOf(f);
        f.angle = G.temps * (D.vitesseRot || 3) * (D.sens || 1) + k * Math.PI * 2 / n;
        const r = (D.rayon || 1.3) * TUILE; f.x = J.x + Math.cos(f.angle) * r; f.y = J.y - 8 + Math.sin(f.angle) * r * 0.8;
        if (D.degats) for (const e of G.ennemis) if (!e.mort && !e.cache && dist(e.x, e.y - 8, f.x, f.y) < e.r + 6) { if (!f.touches) f.touches = new Map(); const t = f.touches.get(e.uid) || 0; if (G.temps - t > 0.3) { f.touches.set(e.uid, G.temps); infligerDegats(e, D.degats * bonusFam, { proprio: 'familier', type: 'orbital', x: e.x, y: e.y, vx: e.x - J.x, vy: e.y - J.y, recul: 20 }); } }
        break;
      }
      case 'contact': { // charge dans la direction de tir, revient
        if (f.charge) {
          f.charge.t += dt; f.x += f.charge.dx * 260 * dt; f.y += f.charge.dy * 260 * dt;
          for (const e of G.ennemis) if (!e.mort && !e.cache && !f.charge.touches.has(e) && dist(e.x, e.y, f.x, f.y) < e.r + 8) { f.charge.touches.add(e); infligerDegats(e, (D.degats || 6) + J.stats.degats * (D.coefJoueur || 0) * bonusFam, { proprio: 'familier', type: 'contact', x: e.x, y: e.y, vx: f.charge.dx, vy: f.charge.dy, recul: 50 }); }
          const t = tuilePx(G.salle, f.x, f.y); if (f.charge.t > 0.5 || PROP[t].mur) f.charge = null;
        } else {
          const d = dist(f.x, f.y, J.x + 12, J.y + 6); if (d > 4) { f.x += (J.x + 12 - f.x) * 6 * dt; f.y += (J.y + 6 - f.y) * 6 * dt; }
          if (dir && f.cd <= 0) { f.cd = D.recharge || 1.2; f.charge = { dx: DIRS[dir][0], dy: DIRS[dir][1], t: 0, touches: new Set() }; Son.jouer('vent', 0.4); }
        }
        break;
      }
      case 'chasseur': {
        const c = ennemiLePlusProche(f.x, f.y, 9999);
        const cx = c ? c.x : J.x + 14, cy = c ? c.y : J.y; const [dx, dy] = normaliser(cx - f.x, cy - f.y);
        f.vx = lerp(f.vx, dx * (D.vitesse || 3) * TUILE, 4 * dt); f.vy = lerp(f.vy, dy * (D.vitesse || 3) * TUILE, 4 * dt); f.x += f.vx * dt; f.y += f.vy * dt;
        if (c && dist(c.x, c.y, f.x, f.y) < c.r + 8 && f.cd <= 0) { f.cd = D.cadence ? 1 / D.cadence : 0.6; infligerDegats(c, (D.degats || 4) * bonusFam, { proprio: 'familier', type: 'morsure', x: c.x, y: c.y, vx: dx, vy: dy, recul: 30 }); if (D.statut) appliquerStatut(c, D.statut, 1.5, D.degats); }
        break;
      }
      case 'collecteur': {
        const r = G.salle.ramassables.filter(x => ['ryo', 'cle', 'explosif'].includes(RAMASSABLES[x.type].cat) && x.age > 0.3).sort((a, b) => dist(a.x, a.y, f.x, f.y) - dist(b.x, b.y, f.x, f.y))[0];
        const cx = r ? r.x : J.x - 14, cy = r ? r.y : J.y; const [dx, dy] = normaliser(cx - f.x, cy - f.y);
        f.x += dx * 100 * dt; f.y += dy * 100 * dt;
        if (D.degats) for (const e of G.ennemis) if (!e.mort && !e.cache && dist(e.x, e.y, f.x, f.y) < e.r + 6 && f.cd <= 0) { f.cd = 0.25; infligerDegats(e, D.degats * bonusFam, { proprio: 'familier', type: 'essaim', sansRecul: true }); }
        break;
      }
      case 'bloqueur': { // se place entre le joueur et l'ennemi le plus menaçant
        const c = ennemiLePlusProche(J.x, J.y, 9999); const a = c ? angleVers(J.x, J.y, c.x, c.y) : Math.atan2(-DIRS[J.dirTete][1], -DIRS[J.dirTete][0]);
        const tx = J.x + Math.cos(a) * 22, ty = J.y - 6 + Math.sin(a) * 18; f.x = lerp(f.x, tx, 10 * dt); f.y = lerp(f.y, ty, 10 * dt); break;
      }
      case 'kamikaze': {
        if (f.plonge) { const c = f.plonge; if (c.mort) { f.plonge = null; break; } const [dx, dy] = normaliser(c.x - f.x, c.y - 8 - f.y); f.x += dx * 300 * dt; f.y += dy * 300 * dt; if (dist(f.x, f.y, c.x, c.y - 8) < 10) { explosion(f.x, f.y, 1.2 * TUILE, J.stats.degats * 3 * bonusFam, { proprio: 'joueur', petite: false, blesseJoueur: false, decor: false }); f.plonge = null; f.cd = D.recharge || 4; f.x = J.x; f.y = J.y - 20; } }
        else { f.x = lerp(f.x, J.x - 10, 5 * dt); f.y = lerp(f.y, J.y - 26, 5 * dt); if (f.cd <= 0) { const c = ennemiLePlusProche(f.x, f.y, 9999); if (c) f.plonge = c; } }
        break;
      }
      case 'pieges': {
        f.x = lerp(f.x, J.x + 14, 5 * dt); f.y = lerp(f.y, J.y + 4, 5 * dt);
        if (f.cd <= 0) { const c = ennemiLePlusProche(f.x, f.y, 9999, e => !e.boss); if (c) { f.cd = D.recharge || 8; appliquerStatut(c, 'immobilise', 3, 0); G.effets.push({ type: 'kuroari', cible: c, x: c.x, y: c.y, age: 0, duree: 3 }); setTimeoutJeu(() => !c.mort && infligerDegats(c, J.stats.degats * 4, { proprio: 'familier', type: 'piege' }), 2.9); } else f.cd = 1; }
        break;
      }
      case 'aveugleur': {
        if (f.vise) { const c = f.vise; if (c.mort) { f.vise = null; break; } const [dx, dy] = normaliser(c.x - f.x, c.y - 16 - f.y); f.x += dx * 220 * dt; f.y += dy * 220 * dt; if (dist(f.x, f.y, c.x, c.y - 16) < 10) { appliquerStatut(c, D.statut || 'confus', 1.8, 0); infligerDegats(c, D.degats || 2, { proprio: 'familier', type: 'bec', sansRecul: true }); f.vise = null; f.cd = D.recharge || 3; } }
        else { f.x = lerp(f.x, J.x + 12, 4 * dt); f.y = lerp(f.y, J.y - 30, 4 * dt); if (f.cd <= 0) f.vise = ennemiLePlusProche(f.x, f.y, 9999); }
        break;
      }
      case 'marionnette': { // Karasu : entre le joueur et la direction visée
        const d0 = Entrees.visee.dir || J.tir.dir || 'bas'; const [dx, dy] = DIRS[d0];
        const tx = J.x + dx * 1.3 * TUILE + (dy ? 10 : 0), ty = J.y - 4 + dy * 1.0 * TUILE; f.x = lerp(f.x, tx, 9 * dt); f.y = lerp(f.y, ty, 9 * dt);
        break;
      }
    }
    // soutien : récompense périodique basée sur les salles nettoyées
    if (D.comportement === 'soutien' && D.tousLes && J.compteurs.sallesNettoyees > 0 && J.compteurs.sallesNettoyees % D.tousLes === 0 && f.dernierPalier !== J.compteurs.sallesNettoyees && !G.salle.combat) {
      f.dernierPalier = J.compteurs.sallesNettoyees; creerRamassable(D.donne || 'coeur', f.x, f.y + 8, {});
    }
  }
  J.familiers = J.familiers.filter(f => !f.fini);
}
function tirFamilier(f, a, deg, D) {
  const v = (D.vitesseTir || 8) * TUILE;
  const p = { x: f.x, y: f.y - 8, z: 8, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vitesse: v, age: 0, dureeVie: (D.portee || 5.5) * TUILE / v, porteePx: (D.portee || 5.5) * TUILE,
    proprio: 'familier', degats: deg, recul: 40, taille: D.taille || 0.8, rTouche: 4, rObs: 2, perce: 0, touches: new Set(), rebonds: 0, spectral: false, traj: {}, impacts: [], statuts: [],
    apparence: D.apparence || 'kunai', elements: new Set(), gen: 1, budget: { n: 2 }, cycleId: 0, angle: a };
  G.proj.push(p); return p;
}
// Kankurō altéré : trois marionnettes échangeables
function changerMarionnette(J) {
  const L = ['karasu', 'kuroari', 'sanshouo']; const i = (L.indexOf(J.marionnette || 'karasu') + 1) % 3; J.marionnette = L[i];
  J.bloqueTir = 0.5; const k = J.familiers.find(f => f.def.id === 'FAM_KARASU'); if (k) k.variante = J.marionnette;
  J.bonus = J.bonus.filter(b => b.source !== 'marionnette');
  if (J.marionnette === 'karasu') J.bonus.push({ source: 'marionnette', tir: { multi: 2, coefCadence: 0.9 }, duree: 'permanent' });
  if (J.marionnette === 'kuroari') J.bonus.push({ source: 'marionnette', tir: { traj: 'lent', statut: 'immobilise', chance: 0.4, duree: 1.2 }, duree: 'permanent' });
  if (J.marionnette === 'sanshouo') J.bonus.push({ source: 'marionnette', s: 'degats', m: 0.6, duree: 'permanent' });
  if (k) k.bloque = J.marionnette === 'sanshouo' || true, k.rBloc = J.marionnette === 'sanshouo' ? 14 : 7;
  recalculer(J); Son.jouer('menu'); G.textes.push({ x: J.x, y: J.y - 34, t: { karasu: 'Karasu', kuroari: 'Kuroari', sanshouo: 'Sanshōuo' }[J.marionnette], age: 0, duree: 0.8, couleur: '#c0a0ff' });
}
