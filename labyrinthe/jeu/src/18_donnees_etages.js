// ═══════════════════════════════════════════════════════════════════════════
// Thèmes (THM), variantes d'étage (FLR), positions d'étage et routes (RTE).
// Chaque thème : palette, murs, sol, obstacles, danger, silhouettes ennemies,
// boss, ambiance sonore. Chaque variante change aussi une règle de jeu.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const TH = o => DON.themes.push(o);
  TH({ id: 'THM_ACA', nom: 'Sous-sols de l’Académie', chapitre: 1,
    visuel: { sol: { base: '#5c4838', var: ['#56432f', '#624d3c', '#523f31'], motif: 'planches', joint: '#3c2e24' },
      mur: { face: '#7a6552', ombre: '#5a4a3c', haut: '#3e3128', motif: 'briques' }, rocher: { base: '#8c847a', ombre: '#5e5750', lum: '#b4ada2', forme: 'rond' },
      fosse: '#0d0a0c', deco: ['cible', 'parchemin', 'lanterne'], lumiere: 'chaude' },
    musique: { gamme: 'yo', racine: 50, tempo: 88, timbre: 'koto' },
    roles: { p: ['ENM_002', 'ENM_001'], t: ['ENM_003'], v: ['ENM_005'], c: ['ENM_018'], s: ['ENM_006'], i: ['ENM_015'], e: ['ENM_014'], f: ['ENM_016'], n: ['ENM_004'], q: ['ENM_003'], l: ['ENM_017'], m: ['ENM_013'], r: ['ENM_009'], g: ['ENM_001'], h: ['ENM_002'] } });
  TH({ id: 'THM_FOR', nom: 'Forêt de la Mort', chapitre: 1,
    visuel: { sol: { base: '#3e4a2c', var: ['#3a4428', '#445030', '#36402a'], motif: 'terre', joint: '#2a3220' },
      mur: { face: '#4c3a28', ombre: '#362a1e', haut: '#243018', motif: 'racines' }, rocher: { base: '#6a5a44', ombre: '#4a3e30', lum: '#8c7a5c', forme: 'souche' },
      fosse: '#0a0d08', deco: ['champignon', 'fougere', 'os'], lumiere: 'verte' },
    musique: { gamme: 'in', racine: 48, tempo: 80, timbre: 'flute' },
    roles: { p: ['ENM_007', 'ENM_002'], t: ['ENM_011'], v: ['ENM_005', 'ENM_012'], c: ['ENM_010'], s: ['ENM_006'], i: ['ENM_019'], e: ['ENM_020'], f: ['ENM_016'], n: ['ENM_012'], q: ['ENM_011'], l: ['ENM_008'], m: ['ENM_013'], r: ['ENM_009'], g: ['ENM_008'], h: ['ENM_002'] } });
  TH({ id: 'THM_SUN', nom: 'Cavernes de Suna', chapitre: 2,
    visuel: { sol: { base: '#b08a58', var: ['#a88252', '#b8925e', '#a47c4c'], motif: 'sable', joint: '#8a6a40' },
      mur: { face: '#9a7248', ombre: '#7a5836', haut: '#5a4028', motif: 'roche' }, rocher: { base: '#c8a070', ombre: '#8e6c44', lum: '#e2c290', forme: 'bloc' },
      fosse: '#1a120a', deco: ['os', 'jarre_sable', 'cristal'], lumiere: 'chaude' },
    musique: { gamme: 'ryukyu', racine: 52, tempo: 92, timbre: 'koto' },
    roles: { p: ['ENM_030', 'ENM_031'], t: ['ENM_033'], v: ['ENM_034'], c: ['ENM_035'], s: ['ENM_036'], i: ['ENM_038'], e: ['ENM_032'], f: ['ENM_037'], n: ['ENM_039'], q: ['ENM_040'], l: ['ENM_031'], m: ['ENM_041'], r: ['ENM_032'], g: ['ENM_042'], h: ['ENM_043'] } });
  TH({ id: 'THM_MAR', nom: 'Ateliers de marionnettes', chapitre: 2,
    visuel: { sol: { base: '#4a3a44', var: ['#44343e', '#50404a', '#40303a'], motif: 'dalles', joint: '#2e2430' },
      mur: { face: '#5e4a52', ombre: '#44343c', haut: '#2c2228', motif: 'planches' }, rocher: { base: '#7a6a5c', ombre: '#54463c', lum: '#9c8a78', forme: 'caisse' },
      fosse: '#0c080c', deco: ['bras', 'fil', 'lanterne'], lumiere: 'violette' },
    musique: { gamme: 'in', racine: 51, tempo: 96, timbre: 'koto' },
    roles: { p: ['ENM_044', 'ENM_030'], t: ['ENM_037'], v: ['ENM_045'], c: ['ENM_035'], s: ['ENM_036'], i: ['ENM_038'], e: ['ENM_046'], f: ['ENM_037'], n: ['ENM_039'], q: ['ENM_040'], l: ['ENM_047'], m: ['ENM_041'], r: ['ENM_032'], g: ['ENM_042'], h: ['ENM_043'] } });
  TH({ id: 'THM_ORO', nom: 'Laboratoires d’Orochimaru', chapitre: 3,
    visuel: { sol: { base: '#3c4046', var: ['#383c42', '#40444c', '#363a40'], motif: 'metal', joint: '#24282e' },
      mur: { face: '#4c5058', ombre: '#363a42', haut: '#22262c', motif: 'metal' }, rocher: { base: '#6a7078', ombre: '#484c54', lum: '#8c929c', forme: 'cuve' },
      fosse: '#060a08', deco: ['cuve', 'tuyau', 'mue'], lumiere: 'froide' },
    musique: { gamme: 'sombre', racine: 47, tempo: 76, timbre: 'flute' },
    roles: { p: ['ENM_050', 'ENM_055'], t: ['ENM_056'], v: ['ENM_057'], c: ['ENM_051'], s: ['ENM_054'], i: ['ENM_058'], e: ['ENM_053'], f: ['ENM_054'], n: ['ENM_059'], q: ['ENM_056'], l: ['ENM_052'], m: ['ENM_060'], r: ['ENM_051'], g: ['ENM_052'], h: ['ENM_061'] } });
  TH({ id: 'THM_KIR', nom: 'Canaux de Kiri', chapitre: 3,
    visuel: { sol: { base: '#3a4a52', var: ['#364650', '#3e4e58', '#34424a'], motif: 'pierre', joint: '#26343a' },
      mur: { face: '#4a5e66', ombre: '#34464e', haut: '#1e2c32', motif: 'roche' }, rocher: { base: '#6a7c84', ombre: '#48585e', lum: '#90a4ac', forme: 'rond' },
      fosse: '#0a1a24', deco: ['algue', 'chaine', 'lanterne'], lumiere: 'froide' },
    musique: { gamme: 'in', racine: 49, tempo: 72, timbre: 'flute' },
    roles: { p: ['ENM_062', 'ENM_050'], t: ['ENM_063'], v: ['ENM_064'], c: ['ENM_065'], s: ['ENM_054'], i: ['ENM_058'], e: ['ENM_066'], f: ['ENM_063'], n: ['ENM_059'], q: ['ENM_056'], l: ['ENM_052'], m: ['ENM_060'], r: ['ENM_067'], g: ['ENM_052'], h: ['ENM_061'] } });
  TH({ id: 'THM_AKA', nom: 'Repaires de l’Akatsuki', chapitre: 4,
    visuel: { sol: { base: '#302a34', var: ['#2c2630', '#342e38', '#2a242e'], motif: 'pierre', joint: '#1c1820' },
      mur: { face: '#3e3440', ombre: '#2c2430', haut: '#18141c', motif: 'roche' }, rocher: { base: '#5c5260', ombre: '#3e3644', lum: '#7c7082', forme: 'rond' },
      fosse: '#050306', deco: ['nuage', 'anneau', 'bougie'], lumiere: 'rouge' },
    musique: { gamme: 'sombre', racine: 45, tempo: 84, timbre: 'koto' },
    roles: { p: ['ENM_070', 'ENM_074'], t: ['ENM_075'], v: ['ENM_071'], c: ['ENM_078'], s: ['ENM_077'], i: ['ENM_076'], e: ['ENM_070'], f: ['ENM_077'], n: ['ENM_072'], q: ['ENM_075'], l: ['ENM_073'], m: ['ENM_079'], r: ['ENM_070'], g: ['ENM_080'], h: ['ENM_081'] } });
  TH({ id: 'THM_GUE', nom: 'Champs de guerre scellés', chapitre: 4,
    visuel: { sol: { base: '#4a4238', var: ['#443c32', '#50473c', '#403830'], motif: 'terre', joint: '#302a22' },
      mur: { face: '#5a5046', ombre: '#403830', haut: '#28221c', motif: 'roche' }, rocher: { base: '#7a7064', ombre: '#564e44', lum: '#9a9084', forme: 'bloc' },
      fosse: '#0a0806', deco: ['arme', 'drapeau', 'os'], lumiere: 'grise' },
    musique: { gamme: 'in', racine: 46, tempo: 100, timbre: 'koto' },
    roles: { p: ['ENM_074', 'ENM_070'], t: ['ENM_075'], v: ['ENM_071'], c: ['ENM_078'], s: ['ENM_077'], i: ['ENM_076'], e: ['ENM_070'], f: ['ENM_077'], n: ['ENM_072'], q: ['ENM_075'], l: ['ENM_073'], m: ['ENM_079'], r: ['ENM_070'], g: ['ENM_080'], h: ['ENM_081'] } });
  TH({ id: 'THM_MYO', nom: 'Mont Myōboku (empreinte)', chapitre: 5,
    visuel: { sol: { base: '#4a5a3a', var: ['#465636', '#4e5e3e', '#425234'], motif: 'mousse', joint: '#34422a' },
      mur: { face: '#6a7a5a', ombre: '#4e5c42', haut: '#303a26', motif: 'roche' }, rocher: { base: '#8a9a7a', ombre: '#5e6c52', lum: '#aabb98', forme: 'rond' },
      fosse: '#0a120c', deco: ['champignon', 'lanterne', 'fougere'], lumiere: 'claire' },
    musique: { gamme: 'yo', racine: 53, tempo: 76, timbre: 'flute' },
    roles: { p: ['ENM_090', 'ENM_074'], t: ['ENM_091'], v: ['ENM_092'], c: ['ENM_078'], s: ['ENM_093'], i: ['ENM_076'], e: ['ENM_070'], f: ['ENM_091'], n: ['ENM_072'], q: ['ENM_075'], l: ['ENM_073'], m: ['ENM_079'], r: ['ENM_067'], g: ['ENM_080'], h: ['ENM_081'] } });
  TH({ id: 'THM_BIJ', nom: 'Profondeurs du sceau des bijū', chapitre: 5,
    visuel: { sol: { base: '#3a1e22', var: ['#361c20', '#3e2226', '#321a1e'], motif: 'pierre', joint: '#240f14' },
      mur: { face: '#4c2a2e', ombre: '#361e22', haut: '#1c0c10', motif: 'metal' }, rocher: { base: '#6e3c40', ombre: '#4c282c', lum: '#90585c', forme: 'bloc' },
      fosse: '#050102', deco: ['chaine', 'sceau', 'bougie'], lumiere: 'rouge' },
    musique: { gamme: 'sombre', racine: 44, tempo: 88, timbre: 'koto' },
    roles: { p: ['ENM_094', 'ENM_070'], t: ['ENM_075'], v: ['ENM_071'], c: ['ENM_095'], s: ['ENM_077'], i: ['ENM_076'], e: ['ENM_070'], f: ['ENM_077'], n: ['ENM_072'], q: ['ENM_075'], l: ['ENM_073'], m: ['ENM_079'], r: ['ENM_067'], g: ['ENM_080'], h: ['ENM_081'] } });

  // Variantes d'étage : une règle de jeu propre à chacune (mod)
  const FL = o => DON.etages.push(o);
  FL({ id: 'FLR_ACA_1', theme: 'THM_ACA', nom: 'Salles d’entraînement', mod: { jarres: 0.5 }, desc: 'Jarres et caisses fréquentes : plus de ressources cachées, moins de couverture solide.' });
  FL({ id: 'FLR_ACA_2', theme: 'THM_ACA', nom: 'Archives inondées', mod: { flaques: 0.35 }, desc: 'Des flaques d’eau ralentissent la marche (pas le vol).' });
  FL({ id: 'FLR_FOR_1', theme: 'THM_FOR', nom: 'Sous-bois', mod: { toiles: 0.4 }, desc: 'Des toiles collantes ralentissent ; le feu les détruit.' });
  FL({ id: 'FLR_FOR_2', theme: 'THM_FOR', nom: 'Racines géantes', mod: { rochersPlus: 0.25 }, desc: 'Plus d’obstacles : couverture abondante, lignes de tir coupées.' });
  FL({ id: 'FLR_SUN_1', theme: 'THM_SUN', nom: 'Grottes de sable', mod: { sablesMouvants: 0.35 }, desc: 'Des sables mouvants ralentissent et attirent vers leur centre.' });
  FL({ id: 'FLR_SUN_2', theme: 'THM_SUN', nom: 'Galeries de verre', mod: { cristaux: 0.3 }, desc: 'Des cristaux font rebondir les projectiles (alliés et ennemis).' });
  FL({ id: 'FLR_MAR_1', theme: 'THM_MAR', nom: 'Atelier', mod: { picsActifs: 0.4 }, desc: 'Des pics mécaniques sortent et rentrent selon un cycle visible.' });
  FL({ id: 'FLR_MAR_2', theme: 'THM_MAR', nom: 'Entrepôt des cent marionnettes', mod: { marionnettesInertes: 0.3 }, desc: 'Des marionnettes inertes bloquent le passage ; certaines s’animent.' });
  FL({ id: 'FLR_ORO_1', theme: 'THM_ORO', nom: 'Salle des cuves', mod: { acide: 0.3 }, desc: 'Des flaques d’acide blessent au contact (pas en vol).' });
  FL({ id: 'FLR_ORO_2', theme: 'THM_ORO', nom: 'Serpentarium', mod: { nids: 0.3 }, desc: 'Des nids de serpenteaux libèrent des nuées quand on les frappe.' });
  FL({ id: 'FLR_KIR_1', theme: 'THM_KIR', nom: 'Canaux brumeux', mod: { brume: 1 }, desc: 'Brume : visibilité réduite autour du shinobi ; les ennemis restent contourés.' });
  FL({ id: 'FLR_KIR_2', theme: 'THM_KIR', nom: 'Écluses', mod: { courants: 0.35 }, desc: 'Des courants poussent dans une direction affichée.' });
  FL({ id: 'FLR_AKA_1', theme: 'THM_AKA', nom: 'Grotte du scellement', mod: { obscurite: 0.55 }, desc: 'Pénombre : les lanternes et le feu éclairent ; les dangers restent lisibles.' });
  FL({ id: 'FLR_AKA_2', theme: 'THM_AKA', nom: 'Tour d’Ame', mod: { pluie: 1 }, desc: 'Pluie : flaques conductrices (la foudre s’y propage), le feu y dure moitié moins.' });
  FL({ id: 'FLR_GUE_1', theme: 'THM_GUE', nom: 'Plaine de cratères', mod: { crateres: 0.3 }, desc: 'Cratères (fosses) : le vol devient précieux, les explosifs créent des ponts.' });
  FL({ id: 'FLR_GUE_2', theme: 'THM_GUE', nom: 'Forêt de Zetsu', mod: { zetsu: 0.35 }, desc: 'Des Zetsu blancs surgissent du sol en renfort pendant les combats.' });
  FL({ id: 'FLR_MYO_1', theme: 'THM_MYO', nom: 'Sentiers des crapauds', mod: { huile: 0.25 }, desc: 'Flaques d’huile des crapauds : le Katon les embrase.' });
  FL({ id: 'FLR_BIJ_1', theme: 'THM_BIJ', nom: 'Chambre des chaînes', mod: { chaines: 0.3 }, desc: 'Chaînes de sceau : murs temporaires qui s’ouvrent quand la salle est nettoyée.' });

  // Positions d'étage : fourchette de salles, spéciales, boss possibles
  DON.positions = [
    null,
    { pos: 1, chapitre: 1, themes: ['THM_ACA', 'THM_FOR'], salles: [8, 10], speciales: { heritage: 1, boutique: 1 }, boss: ['BOS_001', 'BOS_002', 'BOS_003'], objetsAttendus: '2 à 3', degats: 1 },
    { pos: 2, chapitre: 1, themes: ['THM_ACA', 'THM_FOR'], salles: [10, 12], speciales: { heritage: 1, boutique: 1, sacrifice: 0.12, malediction: 0.3, defi: 0.25, dispositifs: 0.4, bibliotheque: 0.1, coffres: 0.1 }, boss: ['BOS_004', 'BOS_005'], objetsAttendus: '2 à 4', degats: 1 },
    { pos: 3, chapitre: 2, themes: ['THM_SUN', 'THM_MAR'], salles: [11, 13], speciales: { heritage: 1, boutique: 1, sacrifice: 0.12, malediction: 0.35, defi: 0.25, dispositifs: 0.3, bibliotheque: 0.12, coffres: 0.1, repos: 0.15 }, boss: ['BOS_006', 'BOS_007', 'BOS_008'], objetsAttendus: '2 à 4', degats: 1 },
    { pos: 4, chapitre: 2, themes: ['THM_SUN', 'THM_MAR'], salles: [12, 14], speciales: { heritage: 1, boutique: 1, defi_boss: 0.2, sacrifice: 0.12, malediction: 0.35, defi: 0.25, dispositifs: 0.4, bibliotheque: 0.12, coffres: 0.12, repos: 0.15 }, boss: ['BOS_009', 'BOS_010'], objetsAttendus: '2 à 4', degats: 1 },
    { pos: 5, chapitre: 3, themes: ['THM_ORO', 'THM_KIR'], salles: [13, 15], speciales: { heritage: 1, boutique: 1, sacrifice: 0.12, malediction: 0.4, defi: 0.25, dispositifs: 0.3, bibliotheque: 0.12, coffres: 0.12, repos: 0.2 }, boss: ['BOS_011', 'BOS_012', 'BOS_013'], objetsAttendus: '2 à 4', degats: 2 },
    { pos: 6, chapitre: 3, themes: ['THM_ORO', 'THM_KIR'], salles: [14, 16], speciales: { heritage: 1, boutique: 1, defi_boss: 0.2, sacrifice: 0.12, malediction: 0.4, defi: 0.25, dispositifs: 0.4, bibliotheque: 0.12, coffres: 0.12, repos: 0.2 }, boss: ['BOS_014'], objetsAttendus: '2 à 4', degats: 2 },
    { pos: 7, chapitre: 4, themes: ['THM_AKA', 'THM_GUE'], salles: [15, 17], speciales: { heritage: 1, boutique: 1, sacrifice: 0.12, malediction: 0.45, defi: 0.25, dispositifs: 0.3, bibliotheque: 0.15, coffres: 0.12, repos: 0.2 }, boss: ['BOS_015', 'BOS_016', 'BOS_017'], objetsAttendus: '2 à 4', degats: 2 },
    { pos: 8, chapitre: 4, themes: ['THM_AKA', 'THM_GUE'], salles: [16, 18], speciales: { heritage: 1, boutique: 1, defi_boss: 0.25, sacrifice: 0.12, malediction: 0.45, defi: 0.25, dispositifs: 0.4, bibliotheque: 0.15, coffres: 0.15, repos: 0.2 }, boss: ['BOS_018', 'BOS_019'], objetsAttendus: '2 à 4', degats: 2 },
  ];
  DON.branches = {
    lumiere: { pos: 9, chapitre: 5, themes: ['THM_MYO'], salles: [16, 18], speciales: { heritage: 1, boutique: 0.6 }, boss: ['BOS_020'], degats: 2 },
    ombre: { pos: 9, chapitre: 5, themes: ['THM_BIJ'], salles: [16, 18], speciales: { heritage: 1, malediction: 1 }, boss: ['BOS_021'], degats: 2 },
  };

  // Routes et fins (RTE) — graphe des dépendances documenté dans le dossier
  const RT = o => DON.routes.push(o);
  RT({ id: 'RTE_01', nom: 'Première fin : le sceau fissuré', bifurcation: 'étage 6', prerequis: 'aucun', boss: 'BOS_014', etages: 6,
    recompense: 'Débloque les étages 7-8 (chapitre des Akatsuki)', marque: 'Serpent', indice: 'Toujours ouverte.' });
  RT({ id: 'RTE_02', nom: 'Deuxième fin : la pluie sans fin', bifurcation: 'étage 8', prerequis: 'RTE_01 accomplie', boss: 'BOS_018|BOS_019', etages: 8,
    recompense: 'Débloque les deux branches avancées', marque: 'Nuage rouge', indice: 'Après la première fin, le labyrinthe s’approfondit.' });
  RT({ id: 'RTE_03', nom: 'Branche de la Lumière : Mont Myōboku', bifurcation: 'après le boss de l’étage 8', prerequis: 'RTE_02 accomplie ; aucun pacte interdit acheté pendant la partie', boss: 'BOS_020', etages: 9,
    recompense: 'Personnage Jiraiya ; objet « Huile des crapauds » dans les pools', marque: 'Crapaud', indice: 'Un rayon de lumière ne s’ouvre qu’à ceux qui n’ont rien vendu d’eux-mêmes.' });
  RT({ id: 'RTE_04', nom: 'Branche de l’Ombre : Profondeurs du sceau', bifurcation: 'après le boss de l’étage 8', prerequis: 'RTE_02 accomplie', boss: 'BOS_021', etages: 9,
    recompense: 'Personnage Itachi ; objet « Œil de l’éveil » dans les pools', marque: 'Éventail', indice: 'La trappe mène plus bas, toujours plus bas.' });
  RT({ id: 'RTE_05', nom: 'Conseil des épreuves (Boss Rush)', bifurcation: 'étage 6', prerequis: 'boss de l’étage 6 vaincu en moins de 20:00 (chronomètre de partie)', boss: 'vagues de boss', etages: 6,
    recompense: 'Défis supplémentaires ; marque « Conseil »', marque: 'Parchemin d’or', indice: 'Les juges n’attendent pas les retardataires.' });
  RT({ id: 'RTE_06', nom: 'Brèche instable', bifurcation: 'étage 8', prerequis: 'salle du boss de l’étage 8 atteinte en moins de 30:00', boss: 'BOS_022', etages: 8,
    recompense: 'Personnage variante « altérée » supplémentaire ; marque « Brèche »', marque: 'Dix queues', indice: 'Une fissure respire derrière le dernier gardien… si l’on arrive tôt.' });
})();
