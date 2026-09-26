// ═══════════════════════════════════════════════════════════════════════════
// Ennemis (ENM). pv = points de vie ; vitesse en tuiles/s ; r = rayon de
// collision (px) ; contact = dégâts de contact (1 = valeur d'étage).
// Les silhouettes annoncent la fonction (voir 25_sprites_ennemis.js).
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const E = (id, nom, role, comportement, pv, vitesse, sprite, params = {}, x = {}) => DON.ennemis.push(Object.assign({ id, nom, role, comportement, pv, vitesse, r: 9, sprite, params, statut: 'création originale', contact: 1 }, x));
  const N = (masque, corps, o = {}) => Object.assign({ type: 'ninja', masque, corps }, o);
  const K = (cle, couleurs) => ({ type: 'carte', cle, couleurs });
  // ── Chapitre I : Académie, Forêt de la Mort ──
  E('ENM_001', 'Poupée d’entraînement animée', 'p', 'poursuivant', 8, 1.1, K('poupee'), {}, { desc: 'Un mannequin réveillé par un sceau égaré. Lent, avance droit sur vous.' });
  E('ENM_002', 'Genin renégat', 'p', 'poursuivant', 10, 1.7, N('bandana', { t: '#5a4a3a', T: '#3e3228', a: '#5a4a3a', A: '#3e3228', p: '#3a3a44', P: '#26262e' }, { arme: true }), {}, { desc: 'Bandeau rayé, fonce au contact.' });
  E('ENM_003', 'Lanceur de kunai', 't', 'tireur', 9, 1.0, N('bandana', { t: '#4a5a4a', T: '#34403a', a: '#4a5a4a', A: '#34403a' }), { motif: 'aligne', cadence: 1.7, vProj: 5.2, tele: 0.35, proj: 'kunai_ennemi' }, { desc: 'Tire quand vous êtes aligné sur sa ligne ou sa colonne.' });
  E('ENM_004', 'Rat des sous-sols', 'n', 'errant', 4, 3.0, K('rat'), {}, { r: 6, desc: 'Rapide et erratique, fragile.' });
  E('ENM_005', 'Chauve-souris', 'v', 'volant', 5, 2.3, K('chauve_souris'), { erratique: 0.8 }, { vol: true, r: 7, desc: 'Vole au-dessus des fosses et obstacles.' });
  E('ENM_006', 'Crapaud d’égout', 's', 'sauteur', 12, 1.0, K('crapaud', { g: '#5a7a4a', l: '#8aa870' }), { intervalle: 2.2, portee: 3.5, duree: 0.6, atterrissage: 'anneau' }, { desc: 'Bondit vers vous ; ses atterrissages éclaboussent en quatre directions.' });
  E('ENM_007', 'Serpent de la forêt', 'p', 'poursuivant', 9, 2.0, K('serpent'), { ondulant: true }, { r: 8, desc: 'Ondule en approchant.' });
  E('ENM_008', 'Sangsue géante', 'l', 'lourd', 22, 0.8, K('sangsue'), { cadence: 3, rOnde: 1.6, tele: 0.7 }, { r: 12, mort: 'flaque', desc: 'Lente ; écrase le sol quand vous approchez.' });
  E('ENM_009', 'Mille-pattes fouisseur', 'r', 'rampant', 14, 2.2, K('mille_pattes'), { tele: 0.6, dureeDehors: 1.6, jet: true }, { desc: 'Circule sous terre (sol qui remue) et surgit près de vous.' });
  E('ENM_010', 'Tigre de la forêt', 'c', 'chargeur', 14, 1.4, K('tigre'), { vCharge: 8, tele: 0.4, recup: 0.8 }, { r: 11, desc: 'Charge en ligne droite quand vous êtes aligné ; étourdi contre un mur.' });
  E('ENM_011', 'Ninja de la pluie', 'q', 'tireur_predictif', 10, 1.4, N('ame', { t: '#4a5a6a', T: '#34404e', a: '#4a5a6a', A: '#34404e' }), { cadence: 2.2, vProj: 6, tele: 0.45 }, { desc: 'Anticipe vos déplacements.' });
  E('ENM_012', 'Nuée de moustiques', 'n', 'nuee', 3, 2.6, K('moustique'), {}, { vol: true, r: 5, desc: 'Trois par nuée ; très fragiles.' });
  E('ENM_013', 'Araignée tisseuse', 'm', 'poseur', 10, 1.3, K('araignee'), { piege: 'toile_zone', intervalle: 4, max: 2 }, { desc: 'Tend des toiles qui ralentissent.' });
  E('ENM_014', 'Jarre hantée', 'e', 'inerte', 8, 2.2, K('jarre_hantee'), { detection: 2 }, { r: 8, desc: 'Ressemble à une jarre… jusqu’à ce que vous approchiez.' });
  E('ENM_015', 'Instructeur déchu', 'i', 'invocateur', 18, 0.9, N('anbu', { t: '#6a5a4a', T: '#4a3e34', a: '#6a5a4a', A: '#4a3e34' }), { intervalle: 3.2, max: 3, invocation: 'ENM_001', liees: true }, { desc: 'Anime des poupées ; les tuer d’abord libère la salle.' });
  E('ENM_016', 'Tourelle à parchemins', 'f', 'tourelle', 12, 0, K('masque', { m: '#c8b890', f: '#8a2a2a' }), { motif: 'rotation', cadence: 2, vProj: 4.2, tele: 0.3 }, { fixe: true, r: 10, contact: 0, desc: 'Fixe ; tire en croix, puis en diagonale.' });
  E('ENM_017', 'Gardien des archives', 'l', 'lourd', 26, 0.9, N('kiri', { t: '#5a4a3a', T: '#3e3228' }), { cadence: 2.6, rOnde: 2, tele: 0.6, anneau: true }, { r: 11, desc: 'Massif ; frappe le sol en onde et en anneau.' });
  E('ENM_018', 'Genin fonceur', 'c', 'chargeur', 11, 1.5, N('bandana', { t: '#6a3a3a', T: '#4a2828' }), { vCharge: 7.5, tele: 0.4, recup: 0.7 }, { desc: 'Charge dès que vous êtes aligné.' });
  E('ENM_019', 'Invocateur d’herbes hautes', 'i', 'invocateur', 16, 1.0, N('suna', { t: '#4a6a3a', T: '#34502a' }), { intervalle: 3.5, max: 3, invocation: 'ENM_007' }, { desc: 'Invoque des serpents.' });
  E('ENM_020', 'Racine griffue', 'e', 'embusque', 12, 1.6, K('racine'), { detection: 4, surgitPres: true, attaque: 'eventail', cadence: 0.9, dureeActive: 2.2, cacheDuree: 1.4, cache: true }, { desc: 'Surgit du sol à distance (le sol se fissure avant).' });
  // ── Chapitre II : Suna, ateliers de marionnettes ──
  E('ENM_030', 'Scorpion des sables', 'p', 'poursuivant', 14, 1.9, K('scorpion'), {}, { desc: 'Rapide ; son dard empoisonne au contact.' });
  E('ENM_031', 'Momie de sable', 'l', 'lourd', 30, 0.8, K('momie'), { cadence: 2.8, rOnde: 1.8, tele: 0.7 }, { r: 11, tache: 'sable', desc: 'Lente, écrase le sol.' });
  E('ENM_032', 'Ver des sables', 'r', 'rampant', 18, 2.4, K('ver'), { tele: 0.65, dureeDehors: 1.8, jet: true }, { tache: 'sable', desc: 'Traverse le sable et jaillit sous vos pieds.' });
  E('ENM_033', 'Ninja de Suna à l’éventail', 't', 'tireur', 14, 1.1, N('suna', { t: '#8a6a4a', T: '#6a4e34' }), { motif: 'eventail', cadence: 2.2, vProj: 5, tele: 0.4 }, { desc: 'Lames de vent en éventail.' });
  E('ENM_034', 'Esprit de sable', 'v', 'volant', 8, 2.1, K('esprit_sable'), { erratique: 0.9 }, { vol: true, r: 8, tache: 'sable', desc: 'Volant, imprévisible.' });
  E('ENM_035', 'Marionnette à lames', 'c', 'chargeur', 16, 1.3, K('marionnette'), { vCharge: 9, tele: 0.35, recup: 0.6 }, { desc: 'Charge avec des lames dépliées.' });
  E('ENM_036', 'Lanceur de jarres', 's', 'lanceur_arc', 14, 0.8, N('suna', { t: '#9a7a5a', T: '#7a5a3a' }), { cadence: 2.4, duree: 0.9, eclabousse: 'anneau' }, { desc: 'Lance des jarres en cloche : leur point de chute est marqué.' });
  E('ENM_037', 'Marionnette lanceuse', 'f', 'tourelle', 16, 0, K('marionnette', { m: '#5a4a6a', d: '#3a3048' }), { motif: '8', cadence: 2.6, vProj: 4.2, tele: 0.4 }, { fixe: true, contact: 0, desc: 'Fixe ; senbon dans huit directions.' });
  E('ENM_038', 'Marionnettiste caché', 'i', 'invocateur', 20, 1.0, N('suna', { t: '#3a2a3a', T: '#2a1e2a' }), { intervalle: 3.4, max: 2, invocation: 'ENM_035', liees: true }, { desc: 'Ses marionnettes tombent quand il meurt.' });
  E('ENM_039', 'Araignée mécanique', 'n', 'nuee', 5, 2.4, K('araignee_meca'), {}, { r: 6, desc: 'Trois par groupe.' });
  E('ENM_040', 'Ninja du Son', 'q', 'tireur_predictif', 14, 1.3, N('oto', { t: '#6a6a70', T: '#4a4a50' }), { cadence: 2.2, vProj: 5.5, tele: 0.45, proj: 'son' }, { desc: 'Ondes sonores visées.' });
  E('ENM_041', 'Poseur de sceaux de sable', 'm', 'poseur', 14, 1.2, N('suna', { t: '#c8a870', T: '#a08050' }), { piege: 'parchemin', intervalle: 3.4, max: 3 }, { desc: 'Pose des parchemins qui explosent quand vous passez.' });
  E('ENM_042', 'Marionnette bouclier', 'g', 'protecteur', 22, 0.9, K('statue', { s: '#8a6a4a', l: '#aa8a6a', d: '#5a4630' }), { bouclier: 'frontal' }, { r: 11, desc: 'Bloque les tirs de face : contournez-la.' });
  E('ENM_043', 'Médecin de Suna', 'h', 'guerisseur', 12, 1.4, N('suna', { t: '#e8e0d0', T: '#c8c0b0' }), { intervalle: 3, soin: 0.25 }, { desc: 'Soigne ses alliés (cercle vert) ; fuit.' });
  E('ENM_044', 'Marionnette errante', 'p', 'poursuivant', 14, 1.6, K('marionnette', { m: '#7a6a5a' }), {}, { desc: 'Avance par saccades.' });
  E('ENM_045', 'Marionnette volante', 'v', 'volant', 10, 2.0, K('oiseau_argile', { a: '#8a6a4a', d: '#5a4630' }), {}, { vol: true, desc: 'Plane au-dessus des fosses.' });
  E('ENM_046', 'Marionnette inerte', 'e', 'inerte', 16, 1.8, K('marionnette', { m: '#6a5a4a', w: '#b8a888' }), { detection: 2.2 }, { desc: 'Immobile… jusqu’à ce qu’on s’approche ou qu’on la frappe.' });
  E('ENM_047', 'Marionnette géante', 'l', 'lourd', 34, 0.8, K('statue', { s: '#7a5a4a', l: '#9a7a6a' }), { cadence: 2.5, rOnde: 2, tele: 0.6, anneau: true }, { r: 12, desc: 'Écrase le sol.' });
  // ── Chapitre III : laboratoires, canaux de Kiri ──
  E('ENM_050', 'Sujet expérimental', 'p', 'poursuivant', 18, 1.7, K('momie', { w: '#c8d8c0', d: '#98a890' }), {}, { mort: 'division', enfant: 'ENM_050', desc: 'Se divise en deux à sa mort.' });
  E('ENM_051', 'Serpent blanc géant', 'c', 'chargeur', 18, 1.5, K('serpent', { s: '#e8e4d0', d: '#b8b4a0' }), { vCharge: 9.5, tele: 0.4, recup: 0.7 }, { r: 10, desc: 'Charge en ligne.' });
  E('ENM_052', 'Porteur du sceau maudit', 'l', 'lourd', 36, 1.0, N('oto', { t: '#4a3a5a', T: '#34283e' }, { cheveux: { h: '#3a2a4a' } }), { cadence: 2.4, rOnde: 2, tele: 0.6 }, { r: 11, desc: 'S’enrage sous la moitié de ses PV.', champion: 'enrage' });
  E('ENM_053', 'Zetsu blanc', 'e', 'embusque', 20, 1.6, N('zetsu', { t: '#e8e8e0', T: '#c8c8c0', a: '#e8e8e0', A: '#c8c8c0', p: '#e8e8e0', P: '#c8c8c0' }), { detection: 5, surgitPres: true, attaque: 'poursuite', dureeActive: 3, cacheDuree: 1.2, cache: true }, { desc: 'Émerge du sol près de vous et poursuit.' });
  E('ENM_054', 'Cuve vivante', 's', 'lanceur_arc', 20, 0, K('cuve'), { cadence: 2.6, duree: 1, eclabousse: 'croix', zone: 'acide', fixe: true }, { fixe: true, r: 12, contact: 0, tache: 'acide', desc: 'Crache de l’acide en cloche (flaque au point de chute).' });
  E('ENM_055', 'Garde du Son', 'p', 'poursuivant', 16, 1.8, N('oto', { t: '#5a5a60', T: '#3a3a40' }, { arme: true }), {}, { desc: 'Rapide au contact.' });
  E('ENM_056', 'Tireur du Son', 'q', 'tireur_predictif', 16, 1.3, N('oto', { t: '#7a6a8a', T: '#5a4a6a' }), { cadence: 2, vProj: 6, tele: 0.4, proj: 'son' }, { desc: 'Tirs visés.' });
  E('ENM_057', 'Chauve-souris d’expérience', 'v', 'volant', 10, 2.5, K('chauve_souris', { b: '#4a5a3a', r: '#c0f060' }), {}, { vol: true, r: 7 });
  E('ENM_058', 'Assistant de laboratoire', 'i', 'invocateur', 24, 1.0, N('kabuto', { t: '#6a5a8a', T: '#4a3e6a' }), { intervalle: 3.2, max: 3, invocation: 'ENM_050' }, { desc: 'Réanime des sujets.' });
  E('ENM_059', 'Nuée de serpenteaux', 'n', 'nuee', 5, 2.4, K('serpenteau'), {}, { r: 5 });
  E('ENM_060', 'Poseur de parchemins explosifs', 'm', 'poseur', 16, 1.3, N('anbu', { t: '#3a3a44', T: '#26262e' }), { piege: 'parchemin', intervalle: 3, max: 3 }, { desc: 'Pièges explosifs (cercle d’alerte).' });
  E('ENM_061', 'Ninja médical', 'h', 'guerisseur', 16, 1.4, N('kabuto', { t: '#e8e0d0', T: '#c8c0b0' }), { intervalle: 3, soin: 0.25 });
  E('ENM_062', 'Ninja de la brume', 'p', 'poursuivant', 16, 1.8, N('kiri', { t: '#4a5a6a', T: '#34404e' }, { arme: true }), {}, { desc: 'Silhouette contourée dans la brume.' });
  E('ENM_063', 'Clone de glace', 't', 'tireur', 16, 1.1, N('kiri', { t: '#8ab0d0', T: '#6a90b0' }), { motif: 'aligne', cadence: 1.6, vProj: 6, tele: 0.35, rafale: 3, ecart: 0.12, proj: 'glace_ennemie' }, { mort: 'glace', desc: 'Salves de senbon de glace ; laisse du verglas.' });
  E('ENM_064', 'Méduse de chakra', 'v', 'volant', 12, 1.5, K('meduse'), { erratique: 0.5 }, { vol: true, r: 9, desc: 'Flotte lentement.' });
  E('ENM_065', 'Déserteur au sabre', 'c', 'chargeur', 18, 1.5, N('kiri', { t: '#3a4a5a', T: '#26323e' }, { arme: true }), { vCharge: 9, tele: 0.35, recup: 0.7 }, { desc: 'Charge sabre en avant.' });
  E('ENM_066', 'Assassin de la brume', 'e', 'embusque', 16, 1.8, N('kiri', { t: '#2a3440', T: '#1a222c' }), { detection: 4, surgitPres: true, attaque: 'eventail', cadence: 0.8, dureeActive: 2, cacheDuree: 1.5, cache: true });
  E('ENM_067', 'Requin des canaux', 'r', 'rampant', 22, 2.6, K('requin'), { tele: 0.55, dureeDehors: 1.5, jet: true }, { desc: 'Son aileron trahit sa position.' });
  E('ENM_068', 'Nid de serpenteaux', 'i', 'invocateur', 20, 0, K('cuve', { m: '#5a4a3a', g: '#8a7a5a', l: '#c8b890' }), { intervalle: 3.5, max: 3, invocation: 'ENM_059', liees: true }, { fixe: true, r: 11, contact: 0, desc: 'Libère des serpenteaux ; les détruit en mourant.' });
  // ── Chapitre IV : repaires de l'organisation, champs de guerre ──
  E('ENM_070', 'Zetsu blanc (armée)', 'p', 'poursuivant', 24, 1.7, N('zetsu', { t: '#e8e8e0', T: '#c8c8c0', a: '#e8e8e0', A: '#c8c8c0', p: '#e8e8e0', P: '#c8c8c0' }), {}, { desc: 'En nombre, sans relâche.' });
  E('ENM_071', 'Oiseau d’argile', 'v', 'kamikaze', 12, 2.4, K('oiseau_argile'), { declenche: 1.4, meche: 0.6 }, { vol: true, r: 8, tache: 'argile', desc: 'Plonge et explose (il clignote avant).' });
  E('ENM_072', 'Araignée d’argile', 'n', 'kamikaze', 6, 2.6, K('araignee_argile'), { declenche: 1.1, meche: 0.5 }, { r: 6, tache: 'argile', desc: 'Explose au contact (mèche visible).' });
  E('ENM_073', 'Marionnette humaine', 'l', 'lourd', 44, 1.0, N('anbu', { t: '#1e1e28', T: '#121218' }, { nuages: true }), { cadence: 2.2, rOnde: 2.2, tele: 0.6, anneau: true }, { r: 12, desc: 'Écrase le sol et projette du sable de fer.' });
  E('ENM_074', 'Bête invoquée', 'p', 'poursuivant', 20, 2.1, K('bete'), {}, { r: 11, desc: 'Rapide et massive.' });
  E('ENM_075', 'Sentinelle de la pluie', 'q', 'tireur_predictif', 22, 1.4, N('ame', { t: '#3a4a5a', T: '#26323e' }), { cadence: 1.8, vProj: 6.5, tele: 0.4 });
  E('ENM_076', 'Invocateur aux tiges', 'i', 'invocateur', 30, 1.0, N('anbu', { t: '#1e1e28', T: '#121218' }, { nuages: true, cheveux: { h: '#e87a2a' } }), { intervalle: 5.0, max: 2, invocation: 'ENM_074', liees: true }, { desc: 'Invoque des bêtes.' });
  E('ENM_077', 'Masque élémentaire', 'f', 'tourelle', 26, 0, K('masque'), { motif: 'anneau', cadence: 2.8, vProj: 3.8, tele: 0.45, proj: 'feu' }, { fixe: true, vol: true, r: 10, contact: 0, desc: 'Flotte, émet des anneaux de feu (un espace toujours libre).' });
  E('ENM_078', 'Shinobi de l’Alliance égaré', 'c', 'chargeur', 24, 1.6, N('alliance', { t: '#5e7e3e', T: '#46612c' }, { arme: true }), { vCharge: 10, tele: 0.35, recup: 0.6 });
  E('ENM_079', 'Poseur d’argile', 'm', 'poseur', 20, 1.3, N('anbu', { t: '#1e1e28', T: '#121218' }, { nuages: true, cheveux: { h: '#f0d060' } }), { piege: 'parchemin', intervalle: 2.8, max: 3 });
  E('ENM_080', 'Statue de pierre', 'g', 'protecteur', 40, 0.7, K('statue'), { bouclier: 'aura' }, { r: 12, desc: 'Ses alliés proches subissent moitié moins de dégâts (anneau bleu).' });
  E('ENM_081', 'Zetsu soigneur', 'h', 'guerisseur', 20, 1.4, N('zetsu', { t: '#e8e8e0', T: '#c8c8c0', a: '#e8e8e0', A: '#c8c8c0' }), { intervalle: 2.8, soin: 0.3 });
  // ── Branches ──
  E('ENM_090', 'Crapaud gardien', 'p', 'sauteur', 30, 1.2, K('crapaud', { g: '#c86a2a', l: '#f0a060' }), { intervalle: 1.8, portee: 4, duree: 0.6, atterrissage: 'onde' }, { r: 11 });
  E('ENM_091', 'Crapaud cracheur d’huile', 't', 'lanceur_arc', 26, 0.9, K('crapaud', { g: '#8a6a3a', l: '#b8984a' }), { cadence: 2.4, duree: 0.9, zone: 'huile', eclabousse: 'anneau' }, { r: 10 });
  E('ENM_092', 'Hirondelle des ermites', 'v', 'volant', 16, 2.6, K('corbeau', { k: '#2a3a5a', b: '#3a4a6a', r: '#f0f0f0' }), {}, { vol: true, r: 8 });
  E('ENM_093', 'Crapaud bondissant', 's', 'sauteur', 28, 1.1, K('crapaud'), { intervalle: 2, portee: 4, duree: 0.6, atterrissage: 'anneau' }, { r: 10 });
  E('ENM_094', 'Ombre de chakra', 'p', 'poursuivant', 30, 1.9, K('ombre'), {}, { r: 10, champion: 'fantome' });
  E('ENM_095', 'Queue de chakra', 'c', 'chargeur', 30, 1.6, K('queue'), { vCharge: 10, tele: 0.35, recup: 0.6 }, { r: 10 });
  for (const e of DON.ennemis) if (e.champion) { e.championDefaut = e.champion; delete e.champion; }
})();
