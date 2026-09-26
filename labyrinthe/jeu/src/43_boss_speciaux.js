// ═══════════════════════════════════════════════════════════════════════════
// Mécaniques signatures des boss (créations de gameplay) : brume, miroirs,
// enfermement de sable, carapace, rituel, mues, argile C3, illusions,
// durcissement, attraction, présence intangible, arène évolutive, météore.
// ═══════════════════════════════════════════════════════════════════════════

const INIT_BOSS = {
  serpent(e) { e.segments = []; for (let i = 0; i < 6; i++) e.segments.push({ x: e.x, y: e.y + i * 10 }); },
  freres(e) {
    const f = creerEnnemi('BOS_003', e.x + 70, e.y, { sansApparition: false }); f.boss = true; f.phase = 0; f.etatB = 'choix'; f.tB = 1.6; f.lies = [e]; e.lies = [f]; f.derniere = null; f.contact = G.degatsContact;
    e.chaine = f; f.chaineAvec = e;
  },
  brume(e) { e.brume = 0; },
  miroirs(e) {
    const s = G.salle; const [cx, cy] = centreSalle(s); e.miroirs = [];
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; const m = creerEnnemi('ENM_016', cx + Math.cos(a) * 150, cy + Math.sin(a) * 80, { sansApparition: true }); m.miroir = true; m.def = Object.assign({}, m.def, { nom: 'Miroir de glace', comportement: 'miroir', sprite: { type: 'carte', cle: 'statue', couleurs: { s: '#b0e0f8', l: '#e8f8ff', d: '#80b8d8' } } }); m.id = 'MIROIR'; m.pv = m.pvMax = 22; m.contact = 0; m.def.ignoreNettoyage = true; e.miroirs.push(m); }
  },
  kankuro(e) { // le marionnettiste se cache ; Karasu attaque
    const s = G.salle; const [tx, ty] = tuileLibreLoin(s, G.joueur.x, G.joueur.y); [e.x, e.y] = centreTuile(tx, ty);
    const k = creerEnnemi('ENM_035', e.x - 60, e.y, { sansApparition: false, pvMult: 5 }); k.def = Object.assign({}, k.def, { nom: 'Karasu' }); k.parent = e.uid; k.boss = false; e.lies = [k]; e.karasu = k;
  },
  trio(e) {
    e.role = 'dosu'; const s = G.salle;
    for (const [role, dx] of [['zaku', -90], ['kin', 90]]) { const f = creerEnnemi('BOS_007', e.x + dx, e.y + 20); f.boss = true; f.role = role; f.phase = 0; f.etatB = 'choix'; f.tB = 1.2 + Math.random(); f.lies = [e]; e.lies.push(f); f.contact = G.degatsContact;
      if (role === 'zaku') f.def = Object.assign({}, f.def, { attaques: [{ id: 'souffle', type: 'spirale', duree: 1.6, bras: 1, v: 5, intervalle: 0.08, pas: 0.12, tele: 0.6, recup: 0.8 }, { id: 'salve', type: 'salve', n: 5, v: 5, ecart: 0.15, tele: 0.5, recup: 0.6 }] });
      if (role === 'kin') f.def = Object.assign({}, f.def, { attaques: [{ id: 'clochettes', type: 'zone', zone: 'acide', n: 2, r: 1, dureeZone: 4, tele: 0.6, recup: 0.8 }, { id: 'senbon', type: 'salve', n: 3, v: 6.5, ecart: 0.12, rafales: 2, tele: 0.45, recup: 0.6, proj: 'kunai_ennemi' }] }); }
  },
  gaara(e) { e.bouclierSable = true; },
  hiruko(e) { e.hiruko = true; e.armure = 0.5; },
  hidan(e) { const [cx, cy] = centreSalle(G.salle); e.cercle = { x: cx, y: cy, r: 22 }; },
  itachi(e) { e.ombreVraie = true; },
  kakuzu(e) { e.masques = []; [['feu', 'anneau', 'feu'], ['vent', 'eventail', 'son'], ['foudre', 'vise', 'eau']].forEach((c, i) => { const m = creerEnnemi('ENM_077', e.x - 80 + i * 80, e.y - 50, { parent: e.uid }); m.def = Object.assign({}, m.def, { nom: 'Masque (' + c[0] + ')', params: Object.assign({}, m.def.params, { motif: c[1], proj: c[2] }) }); m.parent = e.uid; e.masques.push(m); }); },
  obito(e) { e.intangibleBase = true; e.intangible = true; },
};
// Déplacement particulier : fuir le joueur (marionnettiste)
IA_BOSS.generique_orig = IA_BOSS.generique;
IA_BOSS.generique = function (e, dt, d) {
  const J = G.joueur;
  if (e.segments) { let prec = { x: e.x, y: e.y }; for (const s of e.segments) { const dd = dist(s.x, s.y, prec.x, prec.y); if (dd > 10) { s.x += (prec.x - s.x) * (dd - 10) / dd; s.y += (prec.y - s.y) * (dd - 10) / dd; } prec = s; } for (const s of e.segments) if (!e.cache && !J.intangible && dist(s.x, s.y, J.x, J.y) < 10) blesserJoueur(G.degatsContact, { type: 'contact', x: s.x, y: s.y, source: e.id }); }
  if (e.chaine && !e.chaine.mort && !e.mort) { // chaîne des frères : dangereuse quand elle se tend
    const f = e.chaine; const d0 = dist(e.x, e.y, f.x, f.y); e.chaineTendue = d0 > 110;
    if (e.chaineTendue && !J.intangible) { const t = borne(((J.x - e.x) * (f.x - e.x) + (J.y - e.y) * (f.y - e.y)) / (d0 * d0), 0, 1); const px = lerp(e.x, f.x, t), py = lerp(e.y, f.y, t); if (dist(px, py, J.x, J.y) < 6) blesserJoueur(G.degatsEnnemis, { type: 'chaine', x: px, y: py }); }
  }
  if (e.intangibleBase) e.intangible = !(e.etatB === 'actif' || e.etatB === 'recup' || e.materialise > 0); if (e.materialise > 0) e.materialise -= dt;
  if (e.durci > 0) { e.durci -= dt; }
  if (d.deplacement === 'fuite' && e.etatB === 'choix') { const [dx, dy] = normaliser(e.x - J.x, e.y - J.y); if (dist(e.x, e.y, J.x, J.y) < 5 * TUILE) deplacerEnnemi(e, dx, dy, 1.6 * TUILE, dt); else { e.vx *= 0.9; e.vy *= 0.9; } }
  if (e.role === 'dosu' || e.role === 'zaku' || e.role === 'kin') { /* chacun son jeu d'attaques via def */ }
  IA_BOSS.generique_orig(e, dt, e.def);
  if (e.brumeT > 0) { e.brumeT -= dt; }
};
// Réduction visible (Kakuzu durci, carapace d'Hiruko) appliquée par infligerDegats
const _infligerOrig = infligerDegats;
infligerDegats = function (e, deg, src = {}) {
  if (e.durci > 0) deg *= 0.3;
  if (e.hiruko && e.armure) deg *= e.armure;
  if (e.def && e.def.id === 'BOS_006' && e.karasu && !e.karasu.mort) deg *= 1; // le marionnettiste reste vulnérable
  if (e.rituel && e.rituel.actif) { e.rituel.subis += deg; if (e.rituel.subis >= 40) { e.rituel.actif = false; e.rituel.interrompu = true; G.textes.push({ x: e.x, y: e.y - 40, t: 'Rituel interrompu !', age: 0, duree: 1.2, couleur: '#a0e0a0' }); } }
  const r = _infligerOrig(e, deg, src);
  if (e.karasuDe && e.mort) { /* rien */ }
  return r;
};
const _tuerOrig = tuerEnnemi;
tuerEnnemi = function (e, src) {
  if (e.def && e.def.id === 'BOS_006' && e.karasu && !e.karasu.mort) { e.karasu.mort = true; G.effets.push({ type: 'debris', x: e.karasu.x, y: e.karasu.y, age: 0, duree: 0.6, n: 12, couleur: '#6a5a4a' }); }
  if (e.miroir) { const b = G.ennemis.find(x => x.boss && x.miroirs); if (b) b.miroirs = b.miroirs.filter(m => m !== e); }
  return _tuerOrig(e, src);
};

const SPECIAUX_BOSS = {
  fuma_boss(e, a, m) { if (m === 'debut') { const p = tirEnnemi(e.x, e.y - 12, ciblerJoueur(e), 6, { taille: 2.2, duree: 1.6, source: e.id, apparence: 'kunai_ennemi' }); p.traj = { retour: 1 }; p.proprio = 'ennemi'; p.retourVers = e; } },
  terrier(e, a, m, dt) {
    const J = G.joueur;
    if (m === 'debut') { e.cache = true; e.intangible = true; }
    if (m === 'maj') { const [dx, dy] = normaliser(J.x - e.x, J.y - e.y); e.x += dx * 90 * dt; e.y += dy * 90 * dt; }
    if (m === 'fin') { G.effets.push({ type: 'fissure', x: e.x, y: e.y, r: 20, age: 0, duree: 0.5 }); setTimeoutJeu(() => { e.cache = false; e.intangible = false; anneauBoss(e, 8, 4.2); secousse(5, null); Son.jouer('rocher'); }, 0.5); }
  },
  disparition_brume(e, a, m, dt) { // Zabuza : invisible sauf ses yeux ; réapparaît derrière le joueur, sabre levé
    const J = G.joueur;
    if (m === 'debut') { e.alpha = 0.12; e.intangible = true; G.effets.push({ type: 'fumee', x: e.x, y: e.y - 10, age: 0, duree: 0.6, taille: 3 }); }
    if (m === 'maj') { const [dx, dy] = normaliser(J.x - e.x, J.y - e.y); e.x += dx * 70 * dt; e.y += dy * 70 * dt; if (Math.random() < 0.3) G.particules.push({ x: e.x + (Math.random() - 0.5) * 8, y: e.y - 22, vx: 0, vy: 0, age: 0, duree: 0.15, couleur: '#ff4040', taille: 2 }); }
    if (m === 'fin') { const a2 = Math.atan2(DIRS[J.dirCorps][1], DIRS[J.dirCorps][0]) + Math.PI; const [tx, ty] = tuileLibreProche(G.salle, J.x + Math.cos(a2) * 64, J.y + Math.sin(a2) * 48); [e.x, e.y] = centreTuile(tx, ty); e.alpha = 1; e.intangible = false; e.attaque = e.def.attaques[0]; e.etatB = 'tele'; e.tB = 0.6; lancerTelegraphe(e, e.def.attaques[0]); }
  },
  saut_miroir(e, a, m) { // Haku : va d'un miroir à un autre (vulnérable entre deux)
    if (m === 'debut') { const L = (e.miroirs || []).filter(x => !x.mort); if (!L.length) { e.intangible = false; return; } const c = L[Math.floor(Math.random() * L.length)]; e.x = c.x; e.y = c.y + 18; G.effets.push({ type: 'etincelle', x: c.x, y: c.y - 10, age: 0, duree: 0.3 }); Son.jouer('vent', 0.5); }
  },
  senbon_miroirs(e, a, m) { if (m === 'debut') { const L = (e.miroirs || []).filter(x => !x.mort); const J = G.joueur; L.forEach((mi, i) => setTimeoutJeu(() => { if (!mi.mort) { G.effets.push({ type: 'etincelle', x: mi.x, y: mi.y - 14, age: 0, duree: 0.3 }); tirEnnemi(mi.x, mi.y - 10, angleVers(mi.x, mi.y, J.x, J.y), 5.5, { apparence: 'glace_ennemie', source: e.id }); } }, 0.15 * i + 0.3)); } },
  lances_os(e, a, m) { if (m === 'debut') { const J = G.joueur; const ang = ciblerJoueur(e); for (let k = 1; k <= 7; k++) { const x = e.x + Math.cos(ang) * k * 30, y = e.y + Math.sin(ang) * k * 30; setTimeoutJeu(() => frappeSolEnnemie(x, y, 14, 0.55, { visuel: 'impact_sol', son: 'rocher' }), k * 0.08); } for (let k = 1; k <= 5; k++) { const x = e.x + Math.cos(ang + 0.6) * k * 30, y = e.y + Math.sin(ang + 0.6) * k * 30; setTimeoutJeu(() => frappeSolEnnemie(x, y, 14, 0.55, { son: false }), 0.4 + k * 0.08); } } },
  cercueil_sable(e, a, m) { // Gaara : cercle au sol sous le joueur ; sortir avant la fermeture
    if (m === 'debut') { const J = G.joueur; frappeSolEnnemie(J.x, J.y, 26, 0.9, { visuel: 'bouclier_sable', son: 'sable', degats: G.degatsEnnemis * 2 }); }
  },
  vague_sable(e, a, m) { if (m === 'debut') { for (let k = 0; k < 3; k++) setTimeoutJeu(() => { if (!e.mort) G.effets.push({ type: 'anneau_expansif', x: e.x, y: e.y, r: 12, v: 3.2 * TUILE, age: 0, duree: 2.4, trou: ciblerJoueur(e) + (Math.random() - 0.5) * 1.5, largeurTrou: 0.9, proprio: 'ennemi' }); Son.jouer('sable'); }, k * 0.7); } },
  soin_kabuto(e, a, m, dt) { // canalisation visible, interrompue par 40 dégâts
    if (m === 'debut') { e.canal = { subis: 0, pv: e.pv }; G.effets.push({ type: 'cercle_soin', x: e.x, y: e.y, r: 30, age: 0, duree: 2 }); }
    if (m === 'maj' && e.canal) { if (e.pvAvant !== undefined && e.pv < e.pvAvant) e.canal.subis += e.pvAvant - e.pv; e.pvAvant = e.pv; if (e.canal.subis >= 40) { e.canal = null; e.tB = 0; G.textes.push({ x: e.x, y: e.y - 40, t: 'Soin interrompu !', age: 0, duree: 1, couleur: '#a0e0a0' }); } }
    if (m === 'fin' && e.canal) { e.pv = Math.min(e.pvMax, e.pv + e.pvMax * 0.12); e.canal = null; Son.jouer('coeur'); }
  },
  requins(e, a, m) { if (m === 'debut') { for (let i = 0; i < 4; i++) setTimeoutJeu(() => { if (e.mort) return; const p = tirEnnemi(e.x, e.y - 10, ciblerJoueur(e) + (i - 1.5) * 0.4, 3.8, { taille: 1.8, duree: 3, source: e.id, apparence: 'eau' }); p.traj = { guidageEnnemi: 1.4 }; }, i * 0.25); Son.jouer('eau'); } },
  prison_eau(e, a, m) { if (m === 'debut') { const J = G.joueur; frappeSolEnnemie(J.x, J.y, 22, 0.8, { visuel: 'eclaboussure', son: 'eau', apres: () => creerZone(J.x, J.y, 'eau', 5, { r: 26, proprio: 'ennemi' }) }); } },
  faux_hidan(e, a, m) { if (m === 'debut') { const p = tirEnnemi(e.x, e.y - 12, ciblerJoueur(e), 6.5, { taille: 2, duree: 1.4, source: 'BOS_013', apparence: 'kunai_ennemi' }); p.traj = { retour: 1 }; p.retourVers = e; p.marqueJashin = true; } },
  rituel(e, a, m, dt) { // n'a d'effet que si le joueur est marqué ; interrompu par 40 dégâts pendant la canalisation
    const J = G.joueur;
    if (m === 'debut') { if (!(G.marqueJashin > G.temps)) { e.tB = 0; return; } e.x = e.cercle.x; e.y = e.cercle.y; e.rituel = { actif: true, subis: 0 }; G.textes.push({ x: e.x, y: e.y - 44, t: 'Rituel ! Frappez-le (40 dégâts) pour l’interrompre', age: 0, duree: 2, couleur: '#ff6a6a' }); Son.jouer('rire'); }
    if (m === 'fin' && e.rituel && e.rituel.actif) { e.rituel.actif = false; blesserJoueur(2, { type: 'rituel', source: 'BOS_013' }); G.marqueJashin = 0; }
  },
  epee_extensible(e, a, m) { if (m === 'debut') { const ang = ciblerJoueur(e); ligneDanger(e.x, e.y - 10, ang, 400, 10, 0.5); setTimeoutJeu(() => { if (e.mort) return; G.faisceaux.push({ x: e.x, y: e.y - 10, a: ang, l: longueurJusquAuMur(G.salle, e.x, e.y - 10, ang, true), largeur: 6, duree: 0.25, age: 0, type: 'rayon_ennemi', couleur: '#c8ccd8', proprio: 'ennemi' }); Son.jouer('lame'); }, 0.5); } },
  huit_tetes(e, a, m) { if (m === 'debut') { for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4 + Math.random() * 0.3; setTimeoutJeu(() => { if (e.mort) return; ligneDanger(e.x, e.y, ang, 300, 18, 0.55); setTimeoutJeu(() => { const J = G.joueur; const [nx, ny] = [Math.cos(ang), Math.sin(ang)]; const t = (J.x - e.x) * nx + (J.y - e.y) * ny; const d = Math.abs(-(J.x - e.x) * ny + (J.y - e.y) * nx); if (t > 0 && t < 300 && d < 11 && !J.intangible) blesserJoueur(G.degatsEnnemis, { type: 'serpent', x: e.x, y: e.y }); G.effets.push({ type: 'balayage', x: e.x, y: e.y, a: ang, arc: 0.12, r: 300, age: 0, duree: 0.25 }); Son.jouer('vent', 0.5); }, 0.55); }, i * 0.22); } } },
  c3(e, a, m) { // grande œuvre : immense cercle ; les blocs (piliers) protègent
    if (m === 'debut') { const s = G.salle; const [cx, cy] = centreSalle(s); G.effets.push({ type: 'cercle_danger', x: cx, y: cy, r: 520, age: 0, duree: 2.8 }); G.textes.push({ x: cx, y: cy - 60, t: 'Mettez-vous à l’abri derrière un bloc !', age: 0, duree: 2.6, couleur: '#ffd060' });
      if (!s.c3Blocs) { s.c3Blocs = true; poserTuilesValidees(s, [[3, 3], [s.W - 4, s.H - 4], [3, s.H - 4], [s.W - 4, 3]], T.BLOC); s.fondSale = true; s.version++; } }
    if (m === 'fin') { const s = G.salle, J = G.joueur; const [cx, cy] = centreSalle(s); G.effets.push({ type: 'explosion', x: cx, y: cy, r: 300, age: 0, duree: 0.8 }); secousse(14, null); Son.jouer('explosion');
      if (!J.intangible && ligneLibre(s, e.x, e.y, J.x, J.y, 'tir')) blesserJoueur(4, { type: 'c3', x: e.x, y: e.y }); }
  },
  clones_corbeaux(e, a, m) { // seul le vrai projette une ombre ; les faux éclatent en corbeaux
    if (m === 'debut') { for (let i = 0; i < 3; i++) { const [x, y] = pointAleatoire(G.salle, 2); const c = creerEnnemi('ENM_063', x, y, { parent: e.uid, sansApparition: true }); c.def = Object.assign({}, c.def, { nom: 'Illusion', sprite: e.def.sprite, mort: null, comportement: 'tireur', params: { motif: 'vise', cadence: 1.6, vProj: 5, tele: 0.5 } }); c.id = 'ILLUSION_' + e.id; c.pv = c.pvMax = 1; c.illusion = true; c.contact = 0; c.def.ignoreNettoyage = true; c.parent = e.uid; }
      const [x, y] = pointAleatoire(G.salle, 2); e.x = x; e.y = y; Son.jouer('fumee'); }
  },
  lune_rouge(e, a, m) { if (m === 'debut') { G.effets.push({ type: 'tsukuyomi', age: 0, duree: 3 }); for (let k = 0; k < 5; k++) setTimeoutJeu(() => !e.mort && anneauBoss(e, 12, 3.2, { trou: Math.floor(Math.random() * 12), largeurTrou: 1.6 }), k * 0.55); Son.jouer('gong'); } },
  durcissement(e, a, m) { if (m === 'debut') { e.durci = 1.8; Son.jouer('rocher'); } },
  chibaku(e, a, m, dt) {
    const s = G.salle, J = G.joueur; const [cx, cy] = centreSalle(s);
    if (m === 'debut') { e.noyau = creerEnnemi('ENM_080', cx, cy - 20, { sansApparition: true, parent: e.uid }); e.noyau.def = Object.assign({}, e.noyau.def, { nom: 'Sphère d’attraction', comportement: 'tourelle', params: { motif: 'anneau', cadence: 1.4, vProj: 3, tele: 0.3, bouclier: null }, sprite: { type: 'carte', cle: 'ombre', couleurs: { o: '#2a2030', l: '#6a5a80', r: '#c0b0e0' } }, ignoreNettoyage: true }); e.noyau.pv = e.noyau.pvMax = 60; e.noyau.contact = 0; }
    if (m === 'maj' && e.noyau && !e.noyau.mort) { const [dx, dy] = normaliser(cx - J.x, cy - 20 - J.y); G.pousse = { x: dx * 1.6, y: dy * 1.6, boss: true }; }
    if (m === 'fin') { G.pousse = null; if (e.noyau && !e.noyau.mort) { e.noyau.mort = true; explosion(cx, cy - 20, 2 * TUILE, 0, { proprio: 'ennemi', blesseJoueur: true, degatsJoueur: 2 }); } e.noyau = null; }
  },
  saisie_obito(e, a, m) { if (m === 'debut') { const J = G.joueur; const an = Math.random() * Math.PI * 2; const [tx, ty] = tuileLibreProche(G.salle, J.x + Math.cos(an) * 56, J.y + Math.sin(an) * 40); [e.x, e.y] = centreTuile(tx, ty); e.materialise = 1.4; G.effets.push({ type: 'spirale', x: e.x, y: e.y - 12, age: 0, duree: 0.5 }); setTimeoutJeu(() => { if (e.mort) return; cercleDanger(e.x, e.y, 34, 0.45); setTimeoutJeu(() => { if (!e.mort && dist(e.x, e.y, G.joueur.x, G.joueur.y) < 34) blesserJoueur(G.degatsEnnemis, { type: 'saisie', x: e.x, y: e.y }); }, 0.45); }, 0.35); } },
  vortex(e, a, m, dt) { // absorbe vos tirs proches puis les renvoie depuis un autre point
    if (m === 'debut') { e.materialise = 2; e.absorbes = 0; }
    if (m === 'maj') { for (const p of G.proj) if (p.proprio !== 'ennemi' && !p.mort && dist(p.x, p.y, e.x, e.y - 12) < 40) { p.mort = true; e.absorbes++; } }
    if (m === 'fin') { const n = Math.min(12, 3 + e.absorbes); for (let i = 0; i < n; i++) tirEnnemi(e.x, e.y - 12, i * Math.PI * 2 / n, 4.2, { source: e.id }); }
  },
  arene_change(e, a, m) { if (m === 'debut') basculerArene(e); },
  dragons_bois(e, a, m) { if (m === 'debut') { for (let i = 0; i < 3; i++) setTimeoutJeu(() => { if (e.mort) return; const p = tirEnnemi(e.x, e.y - 12, ciblerJoueur(e) + (i - 1) * 0.5, 3.4, { taille: 2.4, duree: 3.2, source: e.id, apparence: 'kunai_ennemi' }); p.traj = { guidageEnnemi: 1.0 }; p.lourd = true; }, i * 0.35); } },
  balayage_queues(e, a, m) { if (m === 'debut') { const base = ciblerJoueur(e); for (let k = -1; k <= 1; k++) { const ang = base + k * 0.9; setTimeoutJeu(() => { if (e.mort) return; G.effets.push({ type: 'arc_danger', x: e.x, y: e.y, a: ang, arc: 0.7, r: 200, age: 0, duree: 0.5 }); setTimeoutJeu(() => { const J = G.joueur; if (!J.intangible && dist(e.x, e.y, J.x, J.y) < 200 && Math.abs(diffAngle(ang, angleVers(e.x, e.y, J.x, J.y))) < 0.35) blesserJoueur(2, { type: 'queue', x: e.x, y: e.y }); G.effets.push({ type: 'balayage', x: e.x, y: e.y, a: ang, arc: 0.7, r: 200, age: 0, duree: 0.25 }); Son.jouer('vent'); }, 0.5); }, (k + 1) * 0.35); } } },
};
