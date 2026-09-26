// ═══════════════════════════════════════════════════════════════════════════
// Pipeline de tir : source → type de lancement → géométrie → trajectoire →
// collisions → impact → effets secondaires (origine, propriétaire, génération,
// budget de réactivation). Un objet modifie une étape sans réécrire les autres.
// ═══════════════════════════════════════════════════════════════════════════

const BUDGET_CYCLE = 14;   // déclenchements secondaires max par cycle d'attaque
const GEN_MAX = { explosion: 2, chaine: 2, eclat: 1, onde: 2, mine: 1, flamme: 2, flaque: 2 };
let _cycle = 0;

// Durée de charge convertie explicitement par la cadence (registre §R8c)
function tempsCharge(J, base) { return base * (2.5 / Math.max(0.4, J.stats.cadence * J.profil.coefCadence)); }
function delaiTir(J) { return 1 / Math.max(0.4, J.stats.cadence * J.profil.coefCadence); }

function majTirJoueur(J, dt) {
  const P = J.profil, TI = J.tir; TI.cooldown -= dt; TI.salveT -= dt;
  // salves en attente
  while (TI.salveFile.length && TI.salveT <= 0) { const s = TI.salveFile.shift(); emettre(J, s.dir, s.mult, s.cycleId, true); TI.salveT = 0.07; }
  if (J.bloqueTir > 0 || J.etat === 'objet' || J.etat === 'mort') { TI.charge = 0; return; }
  const dir = Entrees.visee.dir; const tenu = !!dir;
  if (tenu) TI.dir = dir;
  const forme = P.forme;
  const reglAuto = (G.reglages && G.reglages.chargeAuto);
  // Formes chargées : orbe (déclenchement à charge suffisante), charge libre, rayon
  if (forme === 'orbe' || forme === 'rayon' || forme === 'charge_libre' || (P.chargeable && ['projectile', 'boomerang', 'bombe', 'laser', 'lame', 'lame_longue'].includes(forme))) {
    const base = forme === 'rayon' ? (P.params.rayon.charge || 1.0) : forme === 'orbe' ? (P.params.orbe.charge || 0.6) : forme === 'charge_libre' ? 0.8 : 0.7;
    const tc = tempsCharge(J, base);
    if (tenu && TI.cooldown <= 0) {
      const av = TI.charge; TI.charge = Math.min(1, TI.charge + dt / tc);
      if (av < 1 && TI.charge >= 1) { Son.jouer('charge_pleine'); Entrees.vibrer('charge'); }
      if (TI.charge >= 1 && reglAuto && forme !== 'charge_libre') { declencherCharge(J, TI.dir, 1); }
    } else if (!tenu && TI.charge > 0) {
      if (forme === 'charge_libre') declencherCharge(J, TI.dir, TI.charge);
      else if (TI.charge >= 1) declencherCharge(J, TI.dir, 1);
      else if (P.chargeable && TI.charge > 0.2) declencherCharge(J, TI.dir, TI.charge); // secondaire : relâché tôt = tir normal
      TI.charge = 0;
    }
    return;
  }
  if (forme === 'faisceau') { majFaisceauContinu(J, tenu ? TI.dir : null, dt); return; }
  if (forme === 'frappe') { majFrappeDifferee(J, tenu, dt); return; }
  if (forme === 'controle') { majControle(J, dt); return; }
  if (forme === 'rotation') { majRotation(J, tenu, dt); return; }
  if (tenu && TI.cooldown <= 0) {
    TI.cooldown = delaiTir(J);
    cycleAttaque(J, TI.dir, 1);
  }
}
function declencherCharge(J, dir, charge) {
  const P = J.profil, TI = J.tir;
  let mult = 1;
  if (P.forme === 'charge_libre') { const c = P.params.charge_libre; mult = lerp(c.min, c.max, charge); }
  else if (P.forme === 'orbe' || P.forme === 'rayon') mult = 1;
  else mult = lerp(1, 2.5, charge); // tir principal rendu chargeable par une forme secondaire
  TI.charge = 0; TI.cooldown = delaiTir(J) * (P.forme === 'rayon' ? 0.4 : 0.35);
  cycleAttaque(J, dir, mult, { charge });
}

// ── Géométrie d'un cycle : directions et décalages ──
function geometrieCycle(J, dir) {
  const P = J.profil; const a = Math.atan2(DIRS[dir][1], DIRS[dir][0]); const n = P.multi;
  const E = [];
  if (n === 1) E.push({ a, lat: 0, coef: 1 });
  else if (n === 2) { E.push({ a: a - 0.035, lat: -5, coef: 1 }); E.push({ a: a + 0.035, lat: 5, coef: 1 }); }
  else { const pas = Math.min(10, 60 / (n - 1)) * Math.PI / 180; for (let i = 0; i < n; i++) E.push({ a: a + (i - (n - 1) / 2) * pas, lat: 0, coef: 1 }); }
  if (P.arriere) E.push({ a: a + Math.PI, lat: 0, coef: P.arriere / P.coefMulti * 0.7 });
  if (P.croix) { const ch = Math.min(0.6, P.croix + 0.05 * J.stats.chance); if (Math.random() < ch) for (const d of [Math.PI / 2, -Math.PI / 2, Math.PI]) E.push({ a: a + d, lat: 0, coef: 1 }); }
  return E;
}

// ── Un cycle d'attaque complet ──
function cycleAttaque(J, dir, mult, o = {}) {
  const P = J.profil; const cycleId = ++_cycle; const budget = { n: BUDGET_CYCLE };
  J.tir.anim = 0.12; J.dirTete = dir;
  emettre(J, dir, mult, cycleId, false, budget, o);
  for (let i = 0; i < P.salve; i++) J.tir.salveFile.push({ dir, mult: mult * 0.6, cycleId });
  J.tir.salveT = 0.07;
  if (P.laserAppoint) tirerLaser(J, origineTir(J, dir), Math.atan2(DIRS[dir][1], DIRS[dir][0]), J.stats.degats * 0.5 * mult, cycleId, budget, true);
  if (P.frappeAppoint && P.forme !== 'lame' && P.forme !== 'lame_longue') frapperMelee(J, dir, J.stats.degats * mult, P.frappeAppoint === 'lame_longue' ? { portee: 2.4, arc: 130 } : { portee: 1.6, arc: 100 }, cycleId);
  if (P.frappeDifferee) { J.tir.compteFrappe = (J.tir.compteFrappe || 0) + 1; if (J.tir.compteFrappe % P.frappeDifferee === 0) { const c = cibleDevant(J, dir, 8); lancerFrappeSol(J, c ? c.x : J.x + DIRS[dir][0] * 96, c ? c.y : J.y + DIRS[dir][1] * 96, J.stats.degats * 3 * mult); } }
  evenement('emission_primaire', { dir, cycleId });
  Son.jouer(P.forme === 'lame' || P.forme === 'lame_longue' ? 'lame' : 'tir');
}
function origineTir(J, dir) {
  if (J.profil.source === 'marionnette') { const k = J.familiers.find(f => f.def.id === 'FAM_KARASU'); if (k) return { x: k.x, y: k.y - 10 }; }
  const alt = (J.tir.alterne = !J.tir.alterne) ? 1 : -1; const [dx, dy] = DIRS[dir];
  return { x: J.x + (-dy) * 4 * alt + dx * 4, y: J.y - 12 + dx * 0 + dy * 2 + (dy === 0 ? 0 : 0) };
}
function emettre(J, dir, mult, cycleId, estSalve, budget, o = {}) {
  budget = budget || { n: BUDGET_CYCLE };
  const P = J.profil, S = J.stats; const org = origineTir(J, dir);
  const geo = estSalve ? [{ a: Math.atan2(DIRS[dir][1], DIRS[dir][0]), lat: 0, coef: 1 }] : geometrieCycle(J, dir);
  const degBase = S.degats * P.coefDegats * mult * (P.multi > 1 ? P.coefMulti : 1);
  for (const g of geo) {
    const deg = degBase * g.coef;
    const ox = org.x + Math.cos(g.a + Math.PI / 2) * g.lat, oy = org.y + Math.sin(g.a + Math.PI / 2) * g.lat;
    switch (P.forme) {
      case 'laser': tirerLaser(J, { x: ox, y: oy }, g.a, deg, cycleId, budget); break;
      case 'rayon': tirerRayon(J, g.a, deg, cycleId, budget); break;
      case 'lame': case 'lame_longue': {
        const L = P.params[P.forme] || {}; const base = P.forme === 'lame_longue' ? { portee: 2.6, arc: 140, coef: 3 } : { portee: (J.def.tir.forme === 'lame' ? J.stats.portee : 1.6), arc: 100, coef: J.def.tir.forme === 'lame' ? 1 : 2.5 };
        const arc = (L.arc || base.arc) + 20 * (P.multi - 1), coef = (L.coef || base.coef) * (1 + 0.15 * (P.multi - 1)) / (P.multi > 1 ? P.coefMulti : 1) * P.coefMulti;
        if (g === geo[0] || Math.abs(diffAngle(g.a, geo[0].a)) > 1.2) frapperMelee(J, dirDepuisVecteur(Math.cos(g.a), Math.sin(g.a)), S.degats * P.coefDegats * mult * coef, { portee: (L.portee || base.portee) + (P.forme === 'lame' && J.def.tir.forme !== 'lame' ? (S.portee - 6) * 0.1 : 0), arc }, cycleId, budget);
        break;
      }
      default: {
        const p = creerProjectileJoueur(J, ox, oy, g.a, deg, cycleId, budget, o);
        if (P.forme === 'orbe') { const O = P.params.orbe; p.vitesse = (O.vitesse || 8) * TUILE; p.porteePx = (O.portee || 5.5) * TUILE + (S.portee - 6) * TUILE * 0.5; p.degats = deg * (O.mult || 3); p.perce = Math.max(p.perce, (O.perce || 2) - 1); p.taille *= 1.6; p.apparence = 'orbe'; p.dureeVie = p.porteePx / p.vitesse; }
        if (P.forme === 'charge_libre' && o.charge >= 1) { p.perce = Math.max(p.perce, 2); p.impacts = p.impacts.concat([{ impact: 'chaine', sauts: 2, r: 3, coef: 0.5 }]); p.taille *= 1.3; p.foudre = true; }
        if (P.forme === 'boomerang') { p.traj.retour = 1; p.perce = 99; p.apparence = 'fuma'; p.taille *= 1.4; p.dureeVie *= 1.6; }
        if (P.forme === 'bombe') { p.apparence = 'argile'; p.bombe = { r: 1.3 * TUILE, fixe: 5, coef: 3, blesseJoueur: !J.drapeaux.immuniteExplosion }; p.traj.arc = 1; p.perce = 0; }
      }
    }
  }
}
function creerProjectileJoueur(J, x, y, a, deg, cycleId, budget, o = {}) {
  const P = J.profil, S = J.stats;
  let vit = S.vitesseTir * TUILE; let portee = S.portee * TUILE; let taille = P.taille;
  if (P.traj.lent) { vit *= 0.55; taille *= 2; }
  // influence latérale du mouvement : 25 % de la vitesse perpendiculaire, 10 % de la parallèle
  const ca = Math.cos(a), sa = Math.sin(a); const par = J.vx * ca + J.vy * sa; const perp = -J.vx * sa + J.vy * ca;
  const vx = ca * (vit + par * 0.1) - sa * perp * 0.25, vy = sa * (vit + par * 0.1) + ca * perp * 0.25;
  const p = {
    x, y, z: 12, vx, vy, vitesse: Math.hypot(vx, vy), age: 0, porteePx: portee, dureeVie: portee / vit, proprio: 'joueur', source: J.def.id,
    degats: deg, recul: 2.2 * P.recul * TUILE, taille, rTouche: 4 + 2 * Math.sqrt(deg / 3.5) * taille, rObs: 2,
    perce: P.perce, touches: new Set(), rebonds: P.rebonds, spectral: P.spectral || (J.drapeaux.spectralParfois && Math.random() < 0.1), traj: Object.assign({}, P.traj),
    impacts: P.impacts.slice(), statuts: P.statuts.slice(), apparence: P.apparence, elements: P.elements, gen: 0, budget, cycleId, angle: a,
    orbiteA: Math.atan2(y - J.y, x - J.x), depart: { x, y },
  };
  if (p.traj.orbite) { p.dureeVie *= 2; p.orbR = 1.6 * TUILE; p.orbA = a; }
  if (P.differe && !J.tir.convergence) { p.differe = true; p.dureeVie = p.dureeVie * 0.5; }
  G.proj.push(p); return p;
}

// ── Projectiles ennemis ──
function tirEnnemi(x, y, a, vitesseTuiles, o = {}) {
  const v = vitesseTuiles * TUILE * (G.partie && G.partie.difficile ? 1.12 : 1);
  const p = { x, y, z: o.z ?? 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vitesse: v, age: 0, dureeVie: o.duree || 3, porteePx: 9999, proprio: 'ennemi',
    degats: o.degats || G.degatsEnnemis, taille: o.taille || 1, rTouche: o.r || 5, rObs: 2, perce: 0, touches: new Set(), rebonds: o.rebonds || 0,
    spectral: !!o.spectral, traj: o.traj || {}, impacts: [], statuts: [], apparence: o.apparence || 'ennemi', gen: 0, budget: { n: 0 }, source: o.source || null,
    lourd: !!o.lourd, gravite: o.gravite, vz: o.vz || 0, arc: o.arc, cible: o.cible, accel: o.accel || 0, angle: a };
  G.proj.push(p); return p;
}

// ── Mise à jour des projectiles ──
function majProjectiles(dt) {
  const s = G.salle, J = G.joueur;
  for (const p of G.proj) {
    if (p.mort) continue;
    p.age += dt;
    const TR = p.traj;
    // Trajectoires
    if (p.differe) { // Gaara altéré : s'arrête à mi-course
      if (p.age >= p.dureeVie) { p.vx = 0; p.vy = 0; p.suspendu = true; p.age = p.dureeVie - 0.001; p.z = 10; }
      if (J.tir.convergence && p.suspendu) { const a = J.tir.angleConv; const v = J.stats.vitesseTir * TUILE * 1.3; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; p.suspendu = false; p.differe = false; p.age = 0; p.dureeVie = J.stats.portee * TUILE / v; }
      if (p.suspendu) { p.z = 10 + Math.sin(G.temps * 6 + p.x) * 2; }
    }
    if (TR.guidage && p.proprio === 'joueur') {
      const c = ennemiLePlusProche(p.x, p.y, 6 * TUILE, e => !e.intangible);
      if (c) { const ac = Math.atan2(p.vy, p.vx), at = angleVers(p.x, p.y, c.x, c.y - 8); const d = diffAngle(ac, at); const k = Math.min(Math.abs(d), 5 * TR.guidage * dt) * signe(d); const na = ac + k; const v = Math.hypot(p.vx, p.vy); p.vx = Math.cos(na) * v; p.vy = Math.sin(na) * v; }
    }
    if (TR.guidageEnnemi && p.proprio === 'ennemi') { const ac = Math.atan2(p.vy, p.vx), at = angleVers(p.x, p.y, J.x, J.y - 8); const d = diffAngle(ac, at); const k = Math.min(Math.abs(d), 2 * TR.guidageEnnemi * dt) * signe(d); const na = ac + k; const v = Math.hypot(p.vx, p.vy); p.vx = Math.cos(na) * v; p.vy = Math.sin(na) * v; }
    if (TR.onde) { const n = Math.hypot(p.vx, p.vy) || 1; const px = -p.vy / n, py = p.vx / n; const w = Math.cos(p.age * 16) * 16 * 16 * dt; p.x += px * w * 0.25; p.y += py * w * 0.25; }
    if (TR.acceleration) { const k = 1 + 1.2 * dt; p.vx *= k; p.vy *= k; }
    if (p.accel) { const k = 1 + p.accel * dt; p.vx *= k; p.vy *= k; }
    if (TR.orbite && p.proprio === 'joueur') { p.orbA += 5.5 * dt; p.orbR = Math.min(p.orbR + 20 * dt, 2.2 * TUILE); p.x = J.x + Math.cos(p.orbA) * p.orbR; p.y = J.y - 10 + Math.sin(p.orbA) * p.orbR; }
    else if (TR.retour && p.age > p.dureeVie * 0.45) {
      const a = angleVers(p.x, p.y, J.x, J.y - 10); const v = Math.max(Math.hypot(p.vx, p.vy), 6 * TUILE); p.vx = lerp(p.vx, Math.cos(a) * v, 0.18); p.vy = lerp(p.vy, Math.sin(a) * v, 0.18);
      if (!p.retourne) { p.retourne = true; p.touches.clear(); }
      if (dist(p.x, p.y, J.x, J.y - 10) < 10) { p.mort = true; continue; }
      p.age = Math.min(p.age, p.dureeVie * 0.9);
      if (p.proprio === 'ennemi') { p.x += p.vx * dt; p.y += p.vy * dt; }
    } else {
      const nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
      // Collision avec le décor
      const t = tuilePx(s, nx, ny);
      const P = PROP[t];
      let bloque = false;
      if (P.mur) bloque = true;
      else if (P.bloqueTir && !p.spectral && !(p.arc && p.z > 14)) bloque = true;
      if (bloque) {
        const tx = Math.floor(nx / TUILE), ty = Math.floor(ny / TUILE);
        if (!P.mur && PROP[t].pvTir && p.proprio === 'joueur') endommagerTuile(s, tx, ty, 1);
        if (PROP[t].pvTir && p.proprio === 'ennemi' && p.lourd) endommagerTuile(s, tx, ty, 1);
        if (p.rebonds > 0) {
          p.rebonds--;
          const tX = PROP[tuilePx(s, nx, p.y)], tY = PROP[tuilePx(s, p.x, ny)];
          if (tX.mur || (tX.bloqueTir && !p.spectral)) p.vx = -p.vx; if (tY.mur || (tY.bloqueTir && !p.spectral)) p.vy = -p.vy;
          if (!(tX.mur || tX.bloqueTir) && !(tY.mur || tY.bloqueTir)) { p.vx = -p.vx; p.vy = -p.vy; }
          p.touches.clear();
        } else { detruireProjectile(p, 'mur'); continue; }
      } else { p.x = nx; p.y = ny; }
      if (G.variante && G.variante.cristaux && p.rebonds === 0 && tuilePx(s, p.x, p.y) === T.SOL && estCristal(s, p.x, p.y)) { p.vx = -p.vx; p.vy = -p.vy; }
    }
    // Hauteur : chute en fin de portée
    if (p.arc) { p.z = 8 + Math.sin(Math.min(1, p.age / p.dureeVie) * Math.PI) * 26; }
    else if (!p.suspendu && p.age > p.dureeVie * 0.82 && !TR.orbite) p.z = Math.max(0, 12 * (1 - (p.age - p.dureeVie * 0.82) / (p.dureeVie * 0.18)));
    if (p.age >= p.dureeVie && !p.suspendu) { detruireProjectile(p, 'fin'); continue; }
    // Collisions avec les entités
    if (p.proprio === 'joueur' || p.proprio === 'familier' || p.proprio === 'allie') {
      if (p.arc && p.z > 14 && !p.bombe) continue;
      for (const e of G.ennemis) {
        if (e.mort || e.intangible || e.cache || p.touches.has(e)) continue;
        if (dist2(p.x, p.y, e.x, e.y - (e.hauteur || 8)) > Math.pow(p.rTouche + e.r, 2)) continue;
        if (p.bombe) { exploserBombeTiree(p); break; }
        toucherEnnemi(p, e);
        if (p.perce > 0) { p.perce--; p.touches.add(e); } else { detruireProjectile(p, 'ennemi', e); break; }
      }
      if (p.proprio === 'joueur' && (G.profilCassePierre)) { /* réservé */ }
    } else if (p.proprio === 'ennemi') {
      if (p.arc && p.z > 10) continue;
      // blocage par orbitaux / familiers bloqueurs / marionnette
      let bloquePar = null;
      for (const f of J.familiers) if (f.bloque && dist(p.x, p.y, f.x, f.y - 8) < p.rTouche + (f.rBloc || 7)) { bloquePar = f; break; }
      if (bloquePar) { if (bloquePar.def.reflet) { const q = creerSousProjectile({ x: p.x, y: p.y, vitesse: 7 * TUILE, degats: J.stats.degats, recul: 30, taille: 1, apparence: 'glace', elements: new Set(['hyoton']), gen: 0, budget: { n: 2 }, cycleId: 0, impacts: [] }, Math.atan2(-p.vy, -p.vx), J.stats.degats); q.dureeVie = 1; } detruireProjectile(p, 'bloque'); continue; }
      if (J.profil.deviation && Entrees.visee.dir && dist(p.x, p.y, J.x, J.y - 10) < 30) { detruireProjectile(p, 'devie'); continue; }
      if (!J.intangible && dist(p.x, p.y, J.x, J.y - 9) < p.rTouche + J.rTouche && p.z < 20) { if (blesserJoueur(p.degats, { type: 'projectile', source: p.source, x: p.x - p.vx * 0.05, y: p.y - p.vy * 0.05 }) && p.marqueJashin) { G.marqueJashin = G.temps + 8; G.textes.push({ x: J.x, y: J.y - 34, t: 'Marqué par le rituel !', age: 0, duree: 1.5, couleur: '#ff4a4a' }); } detruireProjectile(p, 'joueur'); }
    }
  }
  G.proj = G.proj.filter(p => !p.mort);
}
function estCristal(s, x, y) { return false; }

function toucherEnnemi(p, e) {
  const J = G.joueur;
  let deg = p.degats;
  infligerDegats(e, deg, { proprio: p.proprio, x: p.x, y: p.y, vx: p.vx, vy: p.vy, recul: p.recul, elements: p.elements, type: 'projectile' });
  for (const st of p.statuts) {
    const ch = Math.min(st.max || 1, (st.chance || 0) + (st.chanceParChance || 0) * J.stats.chance);
    if (Math.random() < ch) appliquerStatut(e, st.statut, st.duree || 2, deg);
  }
  if (J.def.regleCode === 'stratege' && Math.random() < Math.min(0.5, 0.15 + 0.03 * J.stats.chance)) appliquerStatut(e, 'immobilise', 1.2, deg);
  if (J.def.regleCode === 'corps_marionnette' && Math.random() < 0.35) appliquerStatut(e, 'poison', 3, deg);
  if (J.def.regleCode === 'marionnettiste' && Math.random() < 0.2) appliquerStatut(e, 'poison', 3, deg);
  evenement('impact', { p, e });
  declencherImpacts(p, e);
}
function declencherImpacts(p, cible) {
  for (const im of p.impacts) {
    if (p.gen >= (GEN_MAX[im.impact] ?? 1)) continue;
    if (p.budget.n <= 0) break;
    p.budget.n--;
    const deg = p.degats * (im.coef || 0.5);
    switch (im.impact) {
      case 'explosion': explosion(p.x, p.y, (im.r || 1) * TUILE, deg + (im.fixe || 0), { proprio: 'joueur', gen: p.gen + 1, blesseJoueur: false, petite: true, elements: p.elements }); break;
      case 'chaine': if (cible) chaineFoudre(cible, deg, im.sauts || 2, (im.r || 3) * TUILE, p.gen + 1); break;
      case 'eclat': for (let i = 0; i < (im.n || 4); i++) { const a = p.angle + Math.PI / 4 + i * Math.PI * 2 / (im.n || 4); const q = creerSousProjectile(p, a, deg); q.touches.add(cible); } break;
      case 'onde': onde(p.x, p.y, (im.r || 1) * TUILE, deg, p.gen + 1); break;
      case 'flamme': creerZone(p.x, p.y, 'feu_allie', 1.6, { r: 14, dps: p.degats * 0.6 }); break;
      case 'flaque': creerZone(p.x, p.y, 'eau_alliee', 2.5, { r: 16 }); break;
    }
  }
}
function creerSousProjectile(p, a, deg) {
  const v = Math.max(5 * TUILE, p.vitesse * 0.8);
  const q = { x: p.x, y: p.y, z: 8, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vitesse: v, age: 0, dureeVie: 0.35, porteePx: 3 * TUILE, proprio: 'joueur', degats: deg, recul: p.recul * 0.4,
    taille: p.taille * 0.6, rTouche: 3.5, rObs: 1, perce: 0, touches: new Set(), rebonds: 0, spectral: false, traj: {}, impacts: [], statuts: [], apparence: p.apparence, elements: p.elements,
    gen: p.gen + 1, budget: p.budget, cycleId: p.cycleId, angle: a };
  G.proj.push(q); return q;
}
function detruireProjectile(p, raison, cible) {
  if (p.mort) return; p.mort = true;
  if (p.bombe) { exploserBombeTiree(p); return; }
  if (p.proprio === 'joueur') {
    if (raison === 'fin' || raison === 'mur') {
      for (const im of p.impacts) if (im.impact === 'explosion' || im.impact === 'eclat' || im.impact === 'onde') { declencherImpacts(p, null); break; }
      if (p.impacts.some(i => i.impact === 'mine') && p.gen < 1 && raison === 'fin') creerMine(p.x, p.y, p.degats * 2);
    }
    effetImpact(p.x, p.y - p.z, p.apparence, raison === 'ennemi' ? 1 : 0.6, p.elements);
    if (raison === 'mur') Son.jouer('impact_mur', 0.5);
  } else effetImpact(p.x, p.y - p.z, 'ennemi', 0.7);
}

// ── Rayons, lasers, faisceaux ──
function longueurJusquAuMur(s, x, y, a, spectral, max = 2000) {
  const pas = 4; let l = 0;
  while (l < max) { const t = tuilePx(s, x + Math.cos(a) * l, y + Math.sin(a) * l); if (PROP[t].mur || (!spectral && PROP[t].bloqueTir)) break; l += pas; }
  return l;
}
function tirerLaser(J, org, a, deg, cycleId, budget, appoint) {
  const s = G.salle; const max = J.stats.portee * TUILE * 1.5; const l = longueurJusquAuMur(s, org.x, org.y, a, J.profil.spectral, max);
  const f = { x: org.x, y: org.y, a, l, largeur: 5, duree: 0.12, age: 0, type: 'laser', couleur: '#ff5a4a', proprio: 'joueur' };
  G.faisceaux.push(f);
  const touches = ennemisSurSegment(org.x, org.y, a, l, 6);
  for (const e of touches) { infligerDegats(e, deg, { proprio: 'joueur', x: e.x, y: e.y, vx: Math.cos(a), vy: Math.sin(a), recul: 30, type: 'laser' }); for (const st of J.profil.statuts) if (Math.random() < Math.min(st.max || 1, st.chance + (st.chanceParChance || 0) * J.stats.chance)) appliquerStatut(e, st.statut, st.duree || 2, deg); }
  if (!appoint) Son.jouer('laser', 0.6);
}
function tirerRayon(J, a, deg, cycleId, budget) {
  const R = J.profil.params.rayon || {};
  const f = { attache: J, a, l: 0, largeur: 14 * J.profil.taille, duree: R.duree || 0.33, age: 0, type: 'rayon', couleur: '#e83a2a', proprio: 'joueur', degTick: deg * (R.coefTick || 0.9), tick: 0.066, prochain: 0, cycleId, budget };
  G.faisceaux.push(f); Son.jouer('laser'); secousse(3, a);
}
function majFaisceauContinu(J, dir, dt) {
  let f = G.faisceaux.find(x => x.type === 'faisceau' && x.attache === J);
  if (!dir) { if (f) f.age = f.duree; return; }
  if (!f) { f = { attache: J, a: 0, l: 0, largeur: 6, duree: 9999, age: 0, type: 'faisceau', couleur: '#6ad0ff', proprio: 'joueur', tick: 0.1, prochain: 0 }; G.faisceaux.push(f); Son.jouer('laser', 0.5); }
  f.a = Math.atan2(DIRS[dir][1], DIRS[dir][0]); f.age = 0; J.dirTete = dir;
  f.degTick = J.stats.degats * J.profil.coefDegats * (J.stats.cadence * J.profil.coefCadence) * f.tick * 0.95 * (J.profil.multi > 1 ? J.profil.coefMulti * J.profil.multi / J.profil.multi : 1);
}
function majFaisceaux(dt) {
  const s = G.salle;
  for (const f of G.faisceaux) {
    f.age += dt;
    if (f.attache) { const J = f.attache; f.x = J.x; f.y = J.y - 12; f.l = longueurJusquAuMur(s, f.x, f.y, f.a, true, f.type === 'faisceau' ? (J.stats.portee * TUILE * 1.4) : 2000); }
    if (f.degTick && f.age >= f.prochain) {
      f.prochain = f.age + f.tick;
      const n = f.type === 'rayon' ? Math.max(1, G.joueur.profil.multi) : 1;
      for (let i = 0; i < n; i++) {
        const a = f.a + (n > 1 ? (i - (n - 1) / 2) * 0.16 : 0);
        for (const e of ennemisSurSegment(f.x, f.y, a, f.l, f.largeur / 2 + 2)) infligerDegats(e, f.degTick * (n > 1 ? coefMulti(n) : 1), { proprio: 'joueur', x: e.x, y: e.y, vx: Math.cos(a), vy: Math.sin(a), recul: 8, type: f.type, sansFlash: f.type === 'faisceau' });
      }
    }
  }
  G.faisceaux = G.faisceaux.filter(f => f.age < f.duree);
}
function ennemisSurSegment(x, y, a, l, larg) {
  const r = []; const ca = Math.cos(a), sa = Math.sin(a);
  for (const e of G.ennemis) {
    if (e.mort || e.intangible || e.cache) continue;
    const dx = e.x - x, dy = (e.y - (e.hauteur || 8)) - y; const t = dx * ca + dy * sa; if (t < -e.r || t > l + e.r) continue;
    const d = Math.abs(-dx * sa + dy * ca); if (d <= larg + e.r) r.push(e);
  }
  return r;
}

// ── Mêlée (frappe courte / étendue) : angle, portée, fenêtre active ──
function frapperMelee(J, dir, deg, o, cycleId, budget) {
  const a = Math.atan2(DIRS[dir][1], DIRS[dir][0]);
  const m = { attache: J, a, arc: (o.arc || 100) * Math.PI / 180, portee: (o.portee || 1.6) * TUILE, age: 0, anticipation: 0.03, active: 0.1, fin: 0.16, deg, touches: new Set(), cycleId, budget };
  G.melees.push(m); J.dirTete = dir;
}
function majMelees(dt) {
  const J = G.joueur;
  for (const m of G.melees) {
    m.age += dt;
    if (m.age < m.anticipation || m.age > m.anticipation + m.active) continue;
    const ox = m.attache.x, oy = m.attache.y - 10;
    for (const e of G.ennemis) {
      if (e.mort || e.intangible || e.cache || m.touches.has(e)) continue;
      const d = dist(ox, oy, e.x, e.y - (e.hauteur || 8)); if (d > m.portee + e.r) continue;
      if (Math.abs(diffAngle(m.a, angleVers(ox, oy, e.x, e.y - 8))) > m.arc / 2 + 0.25 && d > e.r + 6) continue;
      m.touches.add(e);
      infligerDegats(e, m.deg, { proprio: 'joueur', x: e.x, y: e.y, vx: Math.cos(m.a), vy: Math.sin(m.a), recul: 3.5 * TUILE * J.profil.recul, type: 'melee' });
      for (const st of J.profil.statuts) if (Math.random() < Math.min(st.max || 1, st.chance + (st.chanceParChance || 0) * J.stats.chance)) appliquerStatut(e, st.statut, st.duree || 2, m.deg);
      const faux = { x: e.x, y: e.y, degats: m.deg, impacts: J.profil.impacts, gen: 0, budget: m.budget || { n: 6 }, angle: m.a, vitesse: 200, apparence: 'coup', elements: J.profil.elements, recul: 20 };
      declencherImpacts(faux, e);
      Son.jouer('impact');
    }
    // les coups détruisent les projectiles ennemis ordinaires dans l'arc
    for (const p of G.proj) if (p.proprio === 'ennemi' && !p.lourd && dist(ox, oy, p.x, p.y) < m.portee + 4 && Math.abs(diffAngle(m.a, angleVers(ox, oy, p.x, p.y))) < m.arc / 2 + 0.2) detruireProjectile(p, 'devie');
  }
  G.melees = G.melees.filter(m => m.age < m.fin + m.anticipation);
}

// ── Frappe différée au sol (réticule) ──
function majFrappeDifferee(J, tenu, dt) {
  const TI = J.tir; const F = J.profil.params.frappe || {};
  if (!TI.reticule) TI.reticule = { x: J.x, y: J.y - 60, actif: false };
  const R = TI.reticule;
  if (tenu) {
    if (!R.actif) { R.actif = true; R.x = J.x + DIRS[TI.dir][0] * 48; R.y = J.y + DIRS[TI.dir][1] * 48; }
    const v = 8 * TUILE; R.x += DIRS[TI.dir][0] * v * dt; R.y += DIRS[TI.dir][1] * v * dt;
    const s = G.salle; R.x = borne(R.x, TUILE, (s.W - 1) * TUILE); R.y = borne(R.y, TUILE, (s.H - 1) * TUILE);
  } else if (R.actif) {
    R.actif = false;
    if (TI.cooldown <= 0) { lancerFrappeSol(J, R.x, R.y, J.stats.degats * J.profil.coefDegats * (F.coef || 8)); TI.cooldown = delaiTir(J) / 0.35; }
  }
}
function lancerFrappeSol(J, x, y, deg) {
  G.effets.push({ type: 'frappe_sol', x, y, age: 0, duree: 0.75, deg, r: 1.6 * TUILE, proprio: 'joueur' });
  Son.jouer('telegraphe', 0.4);
}

// ── Émission contrôlée à distance (sphère guidée par le stick de visée) ──
function majControle(J, dt) {
  let o = G.orbes.find(x => x.attache === J && !x.appoint);
  if (!o) { o = { attache: J, x: J.x, y: J.y - 30, r: 10, touches: new Map() }; G.orbes.push(o); }
  const dir = Entrees.visee.dir; const libre = Entrees.viseeLibre; const v = 6.5 * TUILE;
  if (dir) { const [dx, dy] = Math.hypot(libre.x, libre.y) > 0.5 && G.reglages.viseeLibreControle ? normaliser(libre.x, libre.y) : DIRS[dir]; o.x += dx * v * dt; o.y += dy * v * dt; J.dirTete = dir; }
  else { const d = dist(o.x, o.y, J.x, J.y - 12); if (d > 60) { o.x = lerp(o.x, J.x, 0.02); o.y = lerp(o.y, J.y - 12, 0.02); } }
  const s = G.salle; o.x = borne(o.x, TUILE + 6, (s.W - 1) * TUILE - 6); o.y = borne(o.y, TUILE + 6, (s.H - 1) * TUILE - 6);
  o.r = 8 + 3 * Math.sqrt(J.stats.degats / 3.5) * J.profil.taille;
  const intervalle = 0.22 / Math.max(0.5, J.stats.cadence * J.profil.coefCadence / 2.5);
  for (const e of G.ennemis) {
    if (e.mort || e.intangible || e.cache) continue;
    if (dist(o.x, o.y, e.x, e.y - 8) > o.r + e.r) continue;
    const t = o.touches.get(e) || 0; if (G.temps - t < intervalle) continue;
    o.touches.set(e, G.temps);
    infligerDegats(e, J.stats.degats * J.profil.coefDegats * (J.profil.multi > 1 ? J.profil.coefMulti * J.profil.multi : 1), { proprio: 'joueur', x: e.x, y: e.y, vx: 0, vy: 0, recul: 10, type: 'controle' });
    for (const st of J.profil.statuts) if (Math.random() < Math.min(st.max || 1, st.chance + (st.chanceParChance || 0) * J.stats.chance)) appliquerStatut(e, st.statut, st.duree || 2, J.stats.degats);
  }
}
// ── Rotation (attaque circulaire) ──
function majRotation(J, tenu, dt) {
  const TI = J.tir; TI.rotation = tenu;
  if (!tenu) return;
  J.dirTete = ['bas', 'gauche', 'haut', 'droite'][Math.floor(G.temps * 16) % 4];
  const r = 1.5 * TUILE;
  for (const p of G.proj) if (p.proprio === 'ennemi' && !p.lourd && dist(p.x, p.y, J.x, J.y - 10) < r) detruireProjectile(p, 'devie');
  if (TI.cooldown > 0) return;
  TI.cooldown = 0.25 / Math.max(0.5, J.stats.cadence * J.profil.coefCadence / 2.5);
  for (const e of G.ennemis) { if (e.mort || e.intangible || e.cache) continue; if (dist(J.x, J.y - 10, e.x, e.y - 8) < r + e.r) infligerDegats(e, J.stats.degats * J.profil.coefDegats * 1.2, { proprio: 'joueur', x: e.x, y: e.y, vx: e.x - J.x, vy: e.y - J.y, recul: 40, type: 'rotation' }); }
  Son.jouer('vent', 0.4);
}
function cibleDevant(J, dir, portee) {
  const [dx, dy] = DIRS[dir]; let best = null, bd = 1e9;
  for (const e of G.ennemis) { if (e.mort || e.cache) continue; const vx = e.x - J.x, vy = e.y - J.y; const t = vx * dx + vy * dy; if (t < 0 || t > portee * TUILE) continue; const lat = Math.abs(vx * dy - vy * dx); const sc = t + lat * 2; if (sc < bd) { bd = sc; best = e; } }
  return best;
}

// ── Explosions, ondes, chaînes, mines ──
function explosion(x, y, r, deg, o = {}) {
  const J = G.joueur;
  if ((o.proprio || 'joueur') === 'joueur' && J && J.drapeaux.explosionPlus) deg += 5;
  G.effets.push({ type: o.petite ? 'explosion_petite' : 'explosion', x, y, r, age: 0, duree: o.petite ? 0.3 : 0.5, elements: o.elements });
  if (!o.petite) { Son.jouer('explosion'); secousse(6, null); Entrees.vibrer('explosion'); } else Son.jouer('impact', 0.8, 0.7);
  for (const e of G.ennemis) {
    if (e.mort || e.cache || e.intangible) continue;
    if (dist(x, y, e.x, e.y - 6) < r + e.r) infligerDegats(e, deg, { proprio: o.proprio || 'joueur', x: e.x, y: e.y, vx: e.x - x, vy: e.y - y, recul: 3 * TUILE, type: 'explosion' });
  }
  if (o.blesseJoueur && !J.intangible && !J.drapeaux.immuniteExplosion && dist(x, y, J.x, J.y - 6) < r + 4) blesserJoueur(o.degatsJoueur || 2, { type: 'explosion', auto: o.proprio === 'joueur' });
  if (o.decor !== false && !o.petite) exploserDecor(x, y, r);
  if (o.proprio === 'joueur' && !o.petite) evenement('explosion', { x, y, r });
  // décalque persistant (brûlure au sol)
  if (!o.petite) ajouterDecal(G.salle, x, y, 'brulure', r * 0.8);
}
function exploserBombeTiree(p) {
  if (p.explose) return; p.explose = true; p.mort = true;
  const B = p.bombe; explosion(p.x, p.y, B.r, p.degats * B.coef / 3 + B.fixe, { proprio: 'joueur', blesseJoueur: B.blesseJoueur, degatsJoueur: 1, gen: 1 });
}
function onde(x, y, r, deg, gen) {
  G.effets.push({ type: 'onde', x, y, r, age: 0, duree: 0.25 });
  for (const e of G.ennemis) if (!e.mort && !e.cache && !e.intangible && dist(x, y, e.x, e.y) < r + e.r) infligerDegats(e, deg, { proprio: 'joueur', x: e.x, y: e.y, vx: e.x - x, vy: e.y - y, recul: 20, type: 'onde' });
}
function chaineFoudre(depart, deg, sauts, r, gen) {
  const chaine = [depart]; let cur = depart;
  for (let i = 0; i < sauts; i++) {
    let best = null, bd = r;
    for (const e of G.ennemis) { if (e.mort || e.cache || chaine.includes(e)) continue; const d = dist(cur.x, cur.y, e.x, e.y); if (d < bd) { bd = d; best = e; } }
    if (!best) break;
    G.effets.push({ type: 'eclair', x0: cur.x, y0: cur.y - 8, x1: best.x, y1: best.y - 8, age: 0, duree: 0.18 });
    infligerDegats(best, deg, { proprio: 'joueur', x: best.x, y: best.y, vx: 0, vy: 0, recul: 0, type: 'chaine' });
    chaine.push(best); cur = best;
  }
  if (chaine.length > 1) Son.jouer('eclair', 0.6);
}
function creerMine(x, y, deg) { G.zones.push({ type: 'mine', x, y, r: 10, age: 0, duree: 4, deg, proprio: 'joueur', armee: 0.3 }); }
function creerZone(x, y, type, duree, o = {}) { const z = Object.assign({ type, x, y, age: 0, duree, r: 14 }, o); G.zones.push(z); return z; }
