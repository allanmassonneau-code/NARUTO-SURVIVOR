// ═══════════════════════════════════════════════════════════════════════════
// Variantes d'étage (règles de terrain), phases de salle, récompenses de
// champion, règles de défi. Toute modification du terrain est validée : les
// portes restent reliées à pied, sans vol ni explosif.
// ═══════════════════════════════════════════════════════════════════════════

function portesReliees(s) {
  const fronts = s.portes.map(p => tuileDevantPorte(p)).filter(([x, y]) => tuileLibre(s, x, y, true));
  if (fronts.length < 2) return true;
  const vu = accessibles(s, fronts[0][0], fronts[0][1], 'marche');
  return fronts.every(([x, y]) => vu[y * s.W + x]);
}
function tuilesLibresLoinDesPortes(s, al, n, marge = 2) {
  const L = [];
  for (let ty = 2; ty < s.H - 2; ty++) for (let tx = 2; tx < s.W - 2; tx++) {
    if (s.tuiles[ty * s.W + tx] !== T.SOL) continue;
    if (s.portes.some(p => Math.abs(p.tx - tx) + Math.abs(p.ty - ty) <= marge + 1)) continue;
    if ((s.pointsApparition || []).some(q => q.tx === tx && q.ty === ty) || (s.pointsSpeciaux || []).some(q => q.tx === tx && q.ty === ty)) continue;
    L.push([tx, ty]);
  }
  return al.melanger(L).slice(0, n);
}
function poserTuilesValidees(s, L, type) {
  for (const [tx, ty] of L) { const i = ty * s.W + tx; const av = s.tuiles[i]; s.tuiles[i] = type; if (!portesReliees(s)) s.tuiles[i] = av; else if (PROP[type].pvTir) s.pvTuiles[i] = PROP[type].pvTir; }
}
function appliquerVarianteSalle(s, mod, al) {
  if (!mod || s.type !== 'combat') return;
  const zone = (type, o = {}) => { for (const [tx, ty] of tuilesLibresLoinDesPortes(s, al, o.n || 1)) { const [x, y] = centreTuile(tx, ty); (s.zonesPersistantes = s.zonesPersistantes || []).push(Object.assign({ type, x, y, age: 0, duree: 1e9, r: o.r || 20, persistante: true }, o.extra || {})); } };
  if (mod.jarres && al.chance(mod.jarres)) poserTuilesValidees(s, tuilesLibresLoinDesPortes(s, al, al.entierEntre(2, 4)), T.JARRE);
  if (mod.toiles && al.chance(mod.toiles)) poserTuilesValidees(s, tuilesLibresLoinDesPortes(s, al, al.entierEntre(3, 6), 0), T.TOILE);
  if (mod.rochersPlus && al.chance(mod.rochersPlus)) poserTuilesValidees(s, tuilesLibresLoinDesPortes(s, al, al.entierEntre(2, 4)), T.ROCHER);
  if (mod.picsActifs && al.chance(mod.picsActifs)) poserTuilesValidees(s, tuilesLibresLoinDesPortes(s, al, al.entierEntre(3, 6)), T.PICS);
  if (mod.crateres && al.chance(mod.crateres)) poserTuilesValidees(s, tuilesLibresLoinDesPortes(s, al, al.entierEntre(2, 5)), T.FOSSE);
  if (mod.cristaux && al.chance(mod.cristaux)) poserTuilesValidees(s, tuilesLibresLoinDesPortes(s, al, al.entierEntre(1, 3)), T.BLOC), s.cristaux = true;
  if (mod.flaques && al.chance(mod.flaques)) zone('eau', { n: al.entierEntre(1, 3), r: 22 });
  if (mod.sablesMouvants && al.chance(mod.sablesMouvants)) zone('sable_mouvant', { n: al.entierEntre(1, 2), r: 26 });
  if (mod.acide && al.chance(mod.acide)) zone('acide', { n: al.entierEntre(1, 2), r: 16 });
  if (mod.huile && al.chance(mod.huile)) zone('huile', { n: al.entierEntre(1, 3), r: 20 });
  if (mod.courants && al.chance(mod.courants)) { const d = al.choix(DIR_LISTE); zone('courant', { n: 2, r: 30, extra: { dx: DIRS[d][0], dy: DIRS[d][1] } }); }
  if (mod.marionnettesInertes && al.chance(mod.marionnettesInertes)) for (const [tx, ty] of tuilesLibresLoinDesPortes(s, al, al.entierEntre(1, 2))) { const [x, y] = centreTuile(tx, ty); s.ennemisDef.push({ id: 'ENM_046', x, y }); }
  if (mod.nids && al.chance(mod.nids)) for (const [tx, ty] of tuilesLibresLoinDesPortes(s, al, 1)) { const [x, y] = centreTuile(tx, ty); s.ennemisDef.push({ id: 'ENM_068', x, y }); }
  if (mod.zetsu) s.renforts = mod.zetsu;
  if (mod.chaines && al.chance(mod.chaines)) { const L = tuilesLibresLoinDesPortes(s, al, 4); poserTuilesValidees(s, L, T.BLOC); s.chainesTemporaires = L; }
  if (mod.pluie) s.pluie = true;
}
// Effets continus des variantes (sables mouvants, courants, renforts, pluie)
function majVarianteContinu(dt) {
  const s = G.salle, J = G.joueur; G.pousse = G.pousse && G.pousse.boss ? G.pousse : null;
  for (const z of G.zones) {
    if (J.vol) break;
    const d = dist(z.x, z.y, J.x, J.y); if (d > z.r) continue;
    if (z.type === 'sable_mouvant') { const [nx, ny] = normaliser(z.x - J.x, z.y - J.y); J.vx += nx * 60 * dt * 6; J.vy += ny * 60 * dt * 6; }
    if (z.type === 'courant') G.pousse = { x: z.dx * 1.4, y: z.dy * 1.4 };
  }
  if (s.renforts && s.combat && G.ennemis.length >= 1) { s.tRenfort = (s.tRenfort || 0) + dt; if (s.tRenfort > 8 && (s.nbRenforts || 0) < 2) { s.tRenfort = 0; s.nbRenforts = (s.nbRenforts || 0) + 1; const [tx, ty] = tuileLibreLoin(s, J.x, J.y); const [x, y] = centreTuile(tx, ty); G.effets.push({ type: 'fissure', x, y, r: 14, age: 0, duree: 0.7 }); setTimeoutJeu(() => { if (G.salle === s && s.combat) creerEnnemi('ENM_070', x, y); }, 0.7); } }
  if (s.chainesTemporaires && s.nettoyee) { for (const [tx, ty] of s.chainesTemporaires) s.tuiles[ty * s.W + tx] = T.SOL; s.chainesTemporaires = null; s.fondSale = true; s.version++; Son.jouer('porte_ouvre'); }
  if (s.pluie && Math.random() < 0.5) G.particules.push({ x: J.x + (Math.random() - 0.5) * 640, y: J.y - 200 + Math.random() * 40, vx: -20, vy: 420, age: 0, duree: 0.6, couleur: 'rgba(170,190,230,0.5)', taille: 1 });
  // huile embrasée par le Katon
  for (const z of G.zones) if (z.type === 'huile' && !z.enflamme) for (const p of G.proj) if (p.proprio === 'joueur' && p.elements && p.elements.has('katon') && dist(p.x, p.y, z.x, z.y) < z.r) { z.enflamme = true; z.type = 'feu_allie'; z.dps = 8; z.duree = z.age + 5; z.persistante = false; Son.jouer('feu'); }
  // toiles brûlées par le Katon
  for (const p of G.proj) if (p.proprio === 'joueur' && p.elements && p.elements.has('katon')) { const tx = Math.floor(p.x / TUILE), ty = Math.floor(p.y / TUILE); if (tuileA(s, tx, ty) === T.TOILE) { s.tuiles[ty * s.W + tx] = T.SOL; s.fondSale = true; } }
}
function majPhasesSalle(s, premiere) {
  if (premiere && s.type === 'malediction') G.textes.push({ x: G.joueur.x, y: G.joueur.y - 40, t: 'Chambre au sceau blessant : sortir coûte une demi-unité (sauf lévitation).', age: 0, duree: 2.5, couleur: '#e05a7a' });
  if (premiere && s.type === 'sacrifice') G.textes.push({ x: G.joueur.x, y: G.joueur.y - 40, t: 'Autel de tribut : chaque passage sur l’autel coûte une demi-unité.', age: 0, duree: 2.5, couleur: '#d0a0a0' });
  if (premiere && s.type === 'defi') G.textes.push({ x: G.joueur.x, y: G.joueur.y - 40, t: 'Prendre la récompense lance trois vagues.', age: 0, duree: 2.5, couleur: '#b0b0e0' });
}
function lacherRecompenseChampion(e, r) {
  const t = { ryo: 'ryo', ryo2: 'ryo5', explosif: 'explosif', coeur: 'coeur_demi', protection: 'protection_demi', cle: 'cle' }[r] || 'ryo';
  creerRamassable(t, e.x, e.y, {});
}
function appliquerDefi(P, id) {
  const d = INDEX[id]; if (!d) return; const J = P.joueur;
  for (const it of d.depart || []) { if (INDEX[it].type === 'actif') J.actif = { id: it, charges: chargesMax(INDEX[it]) }; else acquerirPassif(J, it, 'defi'); }
  if (d.ressources) for (const [k, v] of Object.entries(d.ressources)) J[k] = v;
  if (d.sante) J.sante = santeInit(d.sante);
  if (d.drapeaux) Object.assign(J.drapeauxBase, d.drapeaux);
  recalculer(J);
}
function basculerArene(e) {
  const s = G.salle; const al = new Alea('arene' + e.phase);
  for (let ty = 1; ty < s.H - 1; ty++) for (let tx = 1; tx < s.W - 1; tx++) { const i = ty * s.W + tx; if (s.tuiles[i] === T.BLOC) s.tuiles[i] = T.SOL; }
  const L = tuilesLibresLoinDesPortes(s, al, 6, 1).filter(([tx, ty]) => dist(tx, ty, Math.floor(G.joueur.x / TUILE), Math.floor(G.joueur.y / TUILE)) > 2);
  poserTuilesValidees(s, L, T.BLOC); s.fondSale = true; s.version++;
}
