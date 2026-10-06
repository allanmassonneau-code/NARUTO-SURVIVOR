// ═══════════════════════════════════════════════════════════════════════════
// Boss (BOS) : attaques = données (type, zone, préparation, durée, récupération).
// Les motifs précis sont des créations de gameplay inspirées des rencontres
// célèbres ; aucune attaque n'exige un objet non garanti.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const B = (id, nom, titre, etage, pv, o) => DON.boss.push(Object.assign({ id, nom, titre, etage, pv, boss: true, r: 18, hauteur: 22, vitesse: 1.4, ia: 'generique', deplacement: 'errance', statut: 'personnage canonique — motifs de combat originaux', contact: 1 }, o));
  const BP = perso => ({ type: 'boss', perso }); // boss peint (25_shinobi_boss*.js)
  // ── Étage 1 ──
  B('BOS_001', 'Mizuki', 'Le traître de l’Académie', 1, 170, { sprite: BP('mizuki'),
    deplacement: 'errance', vitesse: 1.8, attaques: [
      { id: 'salve', type: 'salve', n: 3, v: 5.5, ecart: 0.25, rafales: 2, tele: 0.45, recup: 0.5 },
      { id: 'fuma', type: 'special', nom: 'fuma_boss', tele: 0.6, duree: 1.6, recup: 0.6 },
      { id: 'charge', type: 'charge', vCharge: 8.5, tele: 0.55, duree: 1.2, recup: 0.9 },
    ], phases: [{ seuil: 0.5, message: 'Mizuki perd son sang-froid !', action: 'accelerer' }], desc: 'Kunai en éventail, grand shuriken revenant, charges.' });
  B('BOS_002', 'Serpent géant', 'Gardien de la Forêt de la Mort', 1, 200, { sprite: BP('serpent'), r: 16, init: 'serpent', statut: 'création originale',
    attaques: [
      { id: 'charge', type: 'charge', vCharge: 9, tele: 0.6, duree: 1.3, recup: 1.0, impact: 'anneau' },
      { id: 'terrier', type: 'special', nom: 'terrier', tele: 0.3, duree: 1.6, recup: 0.8 },
      { id: 'crachat', type: 'salve', n: 5, v: 4.5, ecart: 0.3, tele: 0.5, recup: 0.6, proj: 'acide' },
    ], desc: 'Charges, plongée sous terre et crachats en éventail.' });
  B('BOS_003', 'Les frères démons', 'Duo aux griffes enchaînées', 1, 110, { sprite: BP('freres'), init: 'freres', vitesse: 1.9, deplacement: 'poursuite',
    attaques: [
      { id: 'charge', type: 'charge', vCharge: 8, tele: 0.55, duree: 1.1, recup: 0.8 },
      { id: 'griffe', type: 'lame', portee: 1.8, arc: 120, tele: 0.45, recup: 0.5 },
    ], desc: 'Deux adversaires reliés par une chaîne dangereuse quand elle se tend.' });
  // ── Étage 2 ──
  B('BOS_004', 'Zabuza', 'Le démon du brouillard', 2, 300, { sprite: BP('zabuza'), init: 'brume', vitesse: 1.6,
    attaques: [
      { id: 'sabre', type: 'lame', portee: 2.8, arc: 150, tele: 0.55, recup: 0.7, vague: true },
      { id: 'brume', type: 'special', nom: 'disparition_brume', tele: 0.4, duree: 1.8, recup: 0.3 },
      { id: 'dragon', type: 'salve', n: 3, v: 4.2, ecart: 0.18, rafales: 3, intervalle: 0.35, tele: 0.6, recup: 0.6, proj: 'eau' },
      { id: 'clones', type: 'invocation', ennemi: 'ENM_062', n: 2, max: 2, tele: 0.6, recup: 0.4 },
    ], phases: [{ seuil: 0.45, message: 'Le brouillard s’épaissit…', action: 'accelerer' }], desc: 'Disparaît dans la brume (yeux visibles) et réapparaît sabre levé.' });
  B('BOS_005', 'Haku', 'Les miroirs de glace', 2, 260, { sprite: BP('haku'), init: 'miroirs', vitesse: 2.2, deplacement: 'aucun',
    attaques: [
      { id: 'saut', type: 'special', nom: 'saut_miroir', tele: 0.3, duree: 0.4, recup: 0.3 },
      { id: 'senbon', type: 'special', nom: 'senbon_miroirs', tele: 0.5, duree: 1.2, recup: 0.6 },
      { id: 'salve', type: 'salve', n: 5, v: 6, ecart: 0.12, tele: 0.5, recup: 0.5, proj: 'glace_ennemie' },
    ], phases: [{ seuil: 0.5, message: 'Le cercle de miroirs se resserre !', action: 'accelerer' }], desc: 'Passe de miroir en miroir ; les miroirs se brisent sous les coups.' });
  // ── Étage 3 ──
  B('BOS_006', 'Kankurō et Karasu', 'Le marionnettiste', 3, 140, { sprite: BP('kankuro'), init: 'kankuro', deplacement: 'fuite',
    attaques: [{ id: 'gaz', type: 'zone', zone: 'acide', n: 2, r: 1.2, dureeZone: 5, tele: 0.6, recup: 1.2, son: 'vent' }, { id: 'salve', type: 'salve', n: 3, v: 5, ecart: 0.25, tele: 0.5, recup: 0.8 }], desc: 'Frappez le marionnettiste caché : sa marionnette tombera.' });
  B('BOS_007', 'Le trio du Son', 'Trois épreuves en une', 3, 95, { sprite: BP('trio'), init: 'trio', vitesse: 1.6,
    attaques: [{ id: 'onde', type: 'onde', n: 1, vOnde: 3.4, tele: 0.6, recup: 0.8 }, { id: 'salve', type: 'salve', n: 3, v: 5.5, ecart: 0.2, tele: 0.4, recup: 0.6, proj: 'son' }], desc: 'Trois adversaires aux rôles distincts : ondes, souffle, clochettes.' });
  B('BOS_008', 'Kimimaro', 'La danse des os', 3, 340, { sprite: BP('kimimaro'), vitesse: 1.8, deplacement: 'poursuite',
    attaques: [
      { id: 'balles', type: 'salve', n: 1, v: 8, rafales: 5, intervalle: 0.15, tele: 0.45, recup: 0.6, proj: 'os' },
      { id: 'lances', type: 'special', nom: 'lances_os', tele: 0.4, duree: 1.4, recup: 0.6 },
      { id: 'danse', type: 'lame', portee: 2, arc: 360, tele: 0.6, recup: 0.8 },
    ], phases: [{ seuil: 0.4, message: 'Une forêt d’os jaillit !', action: 'accelerer' }], desc: 'Balles d’os, lances qui percent le sol en lignes, danse circulaire.' });
  // ── Étage 4 ──
  B('BOS_009', 'Gaara', 'L’enfermement de sable', 4, 380, { sprite: BP('gaara'), vitesse: 1.0, deplacement: 'aucun', init: 'gaara',
    attaques: [
      { id: 'cercueil', type: 'special', nom: 'cercueil_sable', tele: 0.2, duree: 1.2, recup: 0.6 },
      { id: 'shuriken', type: 'salve', n: 5, v: 4.8, ecart: 0.22, tele: 0.45, recup: 0.5, proj: 'sable_ennemi' },
      { id: 'vague', type: 'special', nom: 'vague_sable', tele: 0.7, duree: 2.2, recup: 0.6 },
      { id: 'pluie', type: 'pluie', n: 10, delai: 0.8, r: 0.8, intervalle: 0.1, tele: 0.5, recup: 0.6 },
    ], phases: [{ seuil: 0.5, message: 'Le sable se referme sur l’arène !', action: 'murs_sable' }], desc: 'Le sable enferme l’arène : cercueils au sol, vagues avec une brèche, pluie de sable.' });
  B('BOS_010', 'Sasori', 'Le maître des marionnettes', 4, 360, { sprite: BP('sasori'), init: 'hiruko', vitesse: 1.0, ia: 'generique',
    attaques: [
      { id: 'queue', type: 'charge', vCharge: 7, tele: 0.6, duree: 1, recup: 0.8 },
      { id: 'aiguilles', type: 'salve', n: 7, v: 5, ecart: 0.14, tele: 0.55, recup: 0.6, proj: 'kunai_ennemi' },
      { id: 'sable_fer', type: 'zone', zone: 'acide', n: 3, r: 1, dureeZone: 4, tele: 0.6, recup: 0.6, phase: 1 },
      { id: 'anneau', type: 'anneau', n: 14, v: 3.8, trou: true, largeurTrou: 2, vagues: 2, tele: 0.5, recup: 0.7, phase: 1 },
    ], phases: [{ seuil: 0.55, message: 'L’armure d’Hiruko se brise !', action: 'fin_hiruko', invulnerable: 0.6 }], desc: 'Carapace blindée puis sable de fer.' });
  // ── Étage 5 ──
  B('BOS_011', 'Kabuto', 'Le médecin des ombres', 5, 380, { sprite: BP('kabuto'), vitesse: 1.7, deplacement: 'poursuite',
    attaques: [
      { id: 'scalpel', type: 'charge', vCharge: 10, tele: 0.45, duree: 0.8, recup: 0.6 },
      { id: 'cadavres', type: 'invocation', ennemi: 'ENM_050', n: 2, max: 3, tele: 0.7, recup: 0.4, recharge: 8 },
      { id: 'soin', type: 'special', nom: 'soin_kabuto', tele: 0.2, duree: 2, recup: 0.5, seuil: 20, soin: 0.1, recharge: 10, maxUsages: 3 },
      { id: 'salve', type: 'salve', n: 3, v: 6, ecart: 0.2, rafales: 2, tele: 0.4, recup: 0.5 },
    ], desc: 'Se soigne de 10 % en canalisant 2 s (20 dégâts l’interrompent ; trois fois au plus, espacées de 10 s) ; réanime des sujets.' });
  B('BOS_012', 'Kisame', 'Le requin de la brume', 5, 440, { sprite: BP('kisame'), vitesse: 1.7, deplacement: 'poursuite',
    attaques: [
      { id: 'requins', type: 'special', nom: 'requins', tele: 0.5, duree: 1.5, recup: 0.6 },
      { id: 'inondation', type: 'zone', zone: 'eau', n: 3, r: 1.6, dureeZone: 8, tele: 0.6, recup: 0.4, son: 'eau' },
      { id: 'samehada', type: 'lame', portee: 2.6, arc: 160, tele: 0.55, recup: 0.7 },
      { id: 'prison', type: 'special', nom: 'prison_eau', tele: 0.2, duree: 1.4, recup: 0.6 },
    ], desc: 'Inonde l’arène (l’eau vous ralentit, pas lui) ; requins d’eau chercheurs.' });
  B('BOS_013', 'Hidan', 'Le rituel immortel', 5, 400, { sprite: BP('hidan'), vitesse: 1.7, deplacement: 'poursuite', init: 'hidan',
    attaques: [
      { id: 'faux', type: 'special', nom: 'faux_hidan', tele: 0.6, duree: 1.4, recup: 0.6 },
      { id: 'rituel', type: 'special', nom: 'rituel', tele: 0.3, duree: 2.2, recup: 0.6, seuil: 25 },
      { id: 'charge', type: 'charge', vCharge: 8.5, tele: 0.5, duree: 1, recup: 0.8 },
    ], desc: 'Si sa faux vous touche, il vous marque ; dans son cercle, il se blesse… et vous aussi. Interrompez le rituel (25 dégâts pendant sa canalisation).' });
  // ── Étage 6 (première fin) ──
  B('BOS_014', 'Orochimaru', 'Les mues du serpent', 6, 520, { sprite: BP('orochimaru'), vitesse: 1.7, deplacement: 'errance',
    attaques: [
      { id: 'serpents', type: 'salve', n: 5, v: 5, ecart: 0.18, rafales: 2, tele: 0.5, recup: 0.6, proj: 'acide' },
      { id: 'epee', type: 'special', nom: 'epee_extensible', tele: 0.7, duree: 0.5, recup: 0.7 },
      { id: 'invocation', type: 'invocation', ennemi: 'ENM_051', n: 2, max: 2, tele: 0.6, recup: 0.4 },
      { id: 'huit', type: 'special', nom: 'huit_tetes', tele: 0.8, duree: 2.4, recup: 0.8, phase: 2 },
    ], phases: [{ seuil: 0.66, message: 'Orochimaru mue !', action: 'mue' }, { seuil: 0.33, message: 'Il mue encore… huit têtes se dressent !', action: 'mue' }], desc: 'À chaque mue, la peau abandonnée devient hostile et il réapparaît ailleurs.' });
  // ── Étage 7 ──
  B('BOS_015', 'Deidara', 'L’art est une explosion', 7, 460, { sprite: BP('deidara'), vol: true, vitesse: 2.0, deplacement: 'errance',
    attaques: [
      { id: 'araignees', type: 'invocation', ennemi: 'ENM_072', n: 3, max: 5, tele: 0.5, recup: 0.4 },
      { id: 'oiseaux', type: 'invocation', ennemi: 'ENM_071', n: 2, max: 4, tele: 0.5, recup: 0.4 },
      { id: 'bombes', type: 'pluie', n: 8, delai: 1, r: 1.1, intervalle: 0.15, tele: 0.5, recup: 0.6, son: 'explosion' },
      { id: 'c3', type: 'special', nom: 'c3', tele: 0.4, duree: 3.0, recup: 1.0, phase: 1 },
    ], phases: [{ seuil: 0.35, message: 'Deidara prépare sa grande œuvre (C3) !', action: 'c3' }], desc: 'Argile explosive sous toutes ses formes ; C3 : mettez-vous à l’abri derrière un bloc.' });
  B('BOS_016', 'Itachi', 'Les illusions du corbeau', 7, 480, { sprite: BP('itachi'), vitesse: 1.6, init: 'itachi',
    attaques: [
      { id: 'clones', type: 'special', nom: 'clones_corbeaux', tele: 0.5, duree: 2.0, recup: 0.5 },
      { id: 'boule', type: 'salve', n: 1, v: 3.5, taille: 3, tele: 0.6, recup: 0.6, proj: 'feu' },
      { id: 'flammes', type: 'zone', zone: 'feu_ennemi', n: 3, r: 1, dureeZone: 6, surJoueur: true, tele: 0.7, recup: 0.6, son: 'feu' },
      { id: 'tsukuyomi', type: 'special', nom: 'lune_rouge', tele: 0.8, duree: 3.0, recup: 0.8, phase: 1 },
    ], phases: [{ seuil: 0.4, message: 'Un guerrier spectral se dresse (miroir frontal).', action: 'susanoo' }], desc: 'Seul le vrai Itachi projette une ombre ; ses clones éclatent en corbeaux.' });
  B('BOS_017', 'Kakuzu', 'Les cinq cœurs', 7, 300, { sprite: BP('kakuzu'), vitesse: 1.4, init: 'kakuzu',
    attaques: [
      { id: 'poing', type: 'charge', vCharge: 9, tele: 0.5, duree: 1, recup: 0.8 },
      { id: 'durcir', type: 'special', nom: 'durcissement', tele: 0.2, duree: 1.8, recup: 0.3 },
      { id: 'fils', type: 'salve', n: 6, v: 4.6, ecart: 0.25, tele: 0.5, recup: 0.6 },
    ], desc: 'Trois masques élémentaires l’accompagnent ; sa peau durcie (grise) réduit les dégâts de 70 % pendant 1,8 s, visiblement.' });
  // ── Étage 8 ──
  B('BOS_018', 'Pain', 'Les forces d’attraction', 8, 560, { sprite: BP('pain'), vitesse: 1.2,
    attaques: [
      { id: 'repulsion', type: 'repulsion', tele: 0.8, duree: 0.3, recup: 0.8 },
      { id: 'attraction', type: 'attraction', force: 2.3, tele: 0.6, duree: 2.0, recup: 0.6 },
      { id: 'tiges', type: 'salve', n: 3, v: 7, ecart: 0.15, rafales: 3, intervalle: 0.25, tele: 0.45, recup: 0.5, proj: 'kunai_ennemi' },
      { id: 'betes', type: 'invocation', ennemi: 'ENM_074', n: 1, max: 2, tele: 0.6, recup: 0.4, phase: 1 },
      { id: 'sphere', type: 'special', nom: 'chibaku', tele: 0.8, duree: 3.2, recup: 1, phase: 1 },
    ], phases: [{ seuil: 0.5, message: 'Une sphère attire les rochers vers le ciel !', action: 'accelerer' }], desc: 'Repousse (et détruit vos tirs), attire en tirant en anneau, puis crée une sphère d’attraction.' });
  B('BOS_023', 'Konan', 'L’ange de papier', 8, 520, { sprite: BP('konan'), vol: true, vitesse: 1.7, deplacement: 'errance',
    attaques: [
      { id: 'shuriken', type: 'salve', n: 5, v: 5.5, ecart: 0.2, rafales: 2, intervalle: 0.3, tele: 0.45, recup: 0.5, proj: 'papier_ennemi' },
      { id: 'papillons', type: 'invocation', ennemi: 'ENM_096', n: 3, max: 6, tele: 0.5, recup: 0.4 },
      { id: 'etiquettes', type: 'pluie', n: 9, delai: 1, r: 1, intervalle: 0.13, tele: 0.5, recup: 0.6, son: 'explosion', visuel: 'explosion_petite' },
      { id: 'ailes', type: 'anneau', n: 14, v: 4.2, vagues: 2, intervalle: 0.4, trou: true, largeurTrou: 2, tele: 0.6, recup: 0.6, proj: 'papier_ennemi' },
      { id: 'lance', type: 'charge', vCharge: 9.5, tele: 0.55, duree: 1.0, recup: 0.8, phase: 1 },
      { id: 'mer', type: 'pluie', n: 20, delai: 1.1, r: 1.1, intervalle: 0.07, tele: 0.7, recup: 1.0, son: 'explosion', visuel: 'explosion_petite', phase: 1 },
    ], phases: [{ seuil: 0.4, message: 'Une mer de papiers explosifs recouvre la salle !', action: 'accelerer' }],
    desc: 'Éventails de shuriken de papier, papillons qui explosent au contact, pluie d’étiquettes explosives ; à 40 % la mer de papiers et des charges ailées.' });
  B('BOS_019', 'Obito', 'Les changements de présence', 8, 460, { sprite: BP('obito'), init: 'obito', vitesse: 1.6,
    attaques: [
      { id: 'saisie', type: 'special', nom: 'saisie_obito', tele: 0.2, duree: 1.3, recup: 0.9 },
      { id: 'boule', type: 'salve', n: 3, v: 4, ecart: 0.3, taille: 2, tele: 0.6, recup: 0.6, proj: 'feu' },
      { id: 'vortex', type: 'special', nom: 'vortex', tele: 0.6, duree: 1.8, recup: 0.6 },
      { id: 'chaines', type: 'rayon', couleur: '#8a8a98', duree: 0.6, balaye: 1.2, tele: 0.8, recup: 0.6, phase: 1 },
    ], phases: [{ seuil: 0.5, message: 'Le masque se fissure.', action: 'accelerer' }], desc: 'Intangible sauf quand il se matérialise pour attaquer (annonce, attaque, récupération).' });
  // ── Branches et fins avancées ──
  B('BOS_020', 'Le Gardien du Sceau', 'Celui qui tient le labyrinthe', 9, 800, { sprite: BP('gardien'), r: 20, vol: true, statut: 'création originale', deplacement: 'errance', vitesse: 1.0, terminal: true,
    attaques: [
      { id: 'chaines', type: 'rayon', couleur: '#e8c050', duree: 0.8, balaye: 0.9, tele: 0.9, recup: 0.6 },
      { id: 'anneaux', type: 'onde', n: 3, vOnde: 3.2, tele: 0.6, recup: 0.6 },
      { id: 'spirale', type: 'spirale', duree: 2.5, bras: 3, v: 3.6, intervalle: 0.12, tele: 0.6, recup: 0.6 },
      { id: 'arene', type: 'special', nom: 'arene_change', tele: 0.6, duree: 0.6, recup: 0.4 },
    ], phases: [{ seuil: 0.66, message: 'Le labyrinthe se réarrange !', action: 'arene' }, { seuil: 0.33, message: 'Le sceau vacille !', action: 'arene' }], desc: 'Arène évolutive : des blocs apparaissent entre les phases ; chaînes balayantes.' });
  B('BOS_021', 'Madara (empreinte)', 'L’ancien rival', 9, 900, { sprite: BP('madara'), vitesse: 1.6, terminal: true,
    attaques: [
      { id: 'meteore', type: 'meteore', r: 3, tele: 1.6, duree: 0.2, recup: 0.8 },
      { id: 'feu', type: 'spirale', duree: 2, bras: 4, v: 4, intervalle: 0.1, pas: 0.25, tele: 0.6, recup: 0.6, proj: 'feu' },
      { id: 'bois', type: 'special', nom: 'dragons_bois', tele: 0.6, duree: 1.6, recup: 0.6 },
      { id: 'sabre', type: 'lame', portee: 3.2, arc: 180, tele: 0.7, recup: 0.8, vague: true },
    ], phases: [{ seuil: 0.5, message: 'Un guerrier géant l’entoure.', action: 'accelerer' }], desc: 'Attaques massives : météore (abri : loin du centre marqué), dragons de bois, grands balayages.' });
  B('BOS_022', 'Empreinte des Dix Queues', 'La brèche instable', 8, 1000, { sprite: BP('dix_queues'), r: 26, statut: 'création originale d’après une créature célèbre', deplacement: 'aucun', terminal: true, contact: 2,
    attaques: [
      { id: 'queues', type: 'special', nom: 'balayage_queues', tele: 0.8, duree: 1.2, recup: 0.6 },
      { id: 'bombe', type: 'rayon', couleur: '#b050e0', duree: 0.8, tele: 1.2, recup: 1 },
      { id: 'pluie', type: 'pluie', n: 14, delai: 0.9, r: 1, intervalle: 0.1, tele: 0.5, recup: 0.6 },
      { id: 'anneau', type: 'anneau', n: 18, v: 3.4, trou: true, largeurTrou: 2, vagues: 3, intervalle: 0.5, tele: 0.6, recup: 0.6 },
    ], desc: 'Immobile et gigantesque : queues balayantes, rayon, anneaux à brèche.' });
  // ── Nouveaux adversaires : trois à cinq boss possibles par étage ──
  B('BOS_025', 'Neji', 'Le tourbillon céleste', 2, 290, { sprite: BP('neji'), vitesse: 1.9, deplacement: 'poursuite',
    attaques: [
      { id: 'kaiten', type: 'special', nom: 'kaiten', tele: 0.45, duree: 0.9, recup: 0.7 },
      { id: 'paumes', type: 'special', nom: 'soixante_quatre', tele: 0.3, duree: 1.0, recup: 0.8 },
      { id: 'paume', type: 'salve', n: 1, v: 8.5, taille: 1.6, rafales: 3, intervalle: 0.3, tele: 0.4, recup: 0.5, proj: 'vent' },
      { id: 'elan', type: 'charge', vCharge: 10, tele: 0.45, duree: 0.6, recup: 0.6 },
    ], phases: [{ seuil: 0.5, message: 'Les soixante-quatre points s’enchaînent plus vite !', action: 'accelerer' }],
    desc: 'Tourbillon défensif annoncé : il efface vos tirs proches et repousse au contact ; les soixante-quatre paumes frappent tout son cercle (sortez-en) ; paumes d’air à distance.' });
  B('BOS_026', 'Mille-pattes géant', 'La chose sous la forêt', 2, 280, { sprite: BP('mille_pattes'), r: 14, init: 'mille_pattes', anneaux: { cle: 'mille_pattes', pattes: true }, vitesse: 1.6, deplacement: 'poursuite', statut: 'création originale',
    attaques: [
      { id: 'terrier', type: 'special', nom: 'terrier', tele: 0.3, duree: 1.4, recup: 0.7 },
      { id: 'ruee', type: 'charge', vCharge: 10, tele: 0.55, duree: 1.2, recup: 0.9, impact: 'anneau', trainee: 'acide' },
      { id: 'venin', type: 'salve', n: 3, v: 5, ecart: 0.3, rafales: 2, intervalle: 0.35, tele: 0.5, recup: 0.6, proj: 'acide' },
    ], phases: [{ seuil: 0.5, message: 'Ses anneaux suintent de venin !', action: 'accelerer' }],
    desc: 'Plonge sous terre et ressurgit sous vos pieds ; ses ruées laissent une traînée de venin ; son long corps blesse au contact.' });
  B('BOS_024', 'Temari', 'La tempête de l’éventail', 3, 320, { sprite: BP('temari'), vitesse: 1.8, deplacement: 'errance',
    attaques: [
      { id: 'lames', type: 'salve', n: 5, v: 6, ecart: 0.2, tele: 0.45, recup: 0.5, proj: 'vent' },
      { id: 'bourrasque', type: 'special', nom: 'bourrasque', cone: { arc: 70, portee: 6.5 }, force: 2.6, tele: 0.6, duree: 1.1, recup: 0.6 },
      { id: 'tornade', type: 'spirale', duree: 2.2, bras: 3, v: 3.4, intervalle: 0.14, pas: 0.3, tele: 0.6, recup: 0.6, proj: 'vent' },
      { id: 'kamatari', type: 'special', nom: 'kamatari', tele: 0.2, duree: 1.0, recup: 0.6 },
    ], phases: [{ seuil: 0.5, message: 'Temari déploie l’éventail en entier !', action: 'accelerer' }],
    desc: 'Lames de vent en éventail, bourrasque en cône (annoncée) qui repousse et efface vos tirs, tornade, et la belette à la faux qui traverse la salle sur une ligne annoncée.' });
  B('BOS_027', 'Kidōmaru', 'La toile dorée', 4, 370, { sprite: BP('kidomaru'), vitesse: 1.7, deplacement: 'errance',
    attaques: [
      { id: 'toile', type: 'special', nom: 'toile_kidomaru', tele: 0.5, duree: 0.6, recup: 0.5 },
      { id: 'kunai', type: 'salve', n: 6, v: 5.5, ecart: 0.17, rafales: 2, intervalle: 0.3, tele: 0.45, recup: 0.6, proj: 'kunai_ennemi' },
      { id: 'araignees', type: 'invocation', ennemi: 'ENM_013', n: 2, max: 3, tele: 0.5, recup: 0.4, recharge: 7 },
      { id: 'fleche', type: 'special', nom: 'fleche_doree', tele: 0.2, duree: 1.5, recup: 0.8, phase: 1 },
    ], phases: [{ seuil: 0.5, message: 'Kidōmaru bande son arc d’or…', action: 'accelerer' }],
    desc: 'Tisse des toiles collantes au sol, lance six kunai à la fois, appelle des araignées tisseuses ; à mi-vie, la flèche d’or : la ligne de visée vous suit, se fige, puis la flèche traverse tout.' });
  B('BOS_028', 'Tayuya', 'La flûte des démons', 4, 330, { sprite: BP('tayuya'), vitesse: 1.6, deplacement: 'fuite',
    attaques: [
      { id: 'demons', type: 'invocation', ennemi: 'ENM_097', n: 1, max: 2, tele: 0.7, recup: 0.4, recharge: 9 },
      { id: 'melodie', type: 'onde', n: 2, vOnde: 3, tele: 0.6, recup: 0.6 },
      { id: 'notes', type: 'spirale', duree: 2, bras: 2, v: 3.6, intervalle: 0.12, pas: 0.32, tele: 0.6, recup: 0.6, proj: 'son' },
      { id: 'esprits', type: 'special', nom: 'esprits_flute', tele: 0.5, duree: 1.2, recup: 0.6 },
    ], phases: [{ seuil: 0.5, message: 'La mélodie s’accélère !', action: 'accelerer' }],
    desc: 'Garde ses distances en jouant de la flûte : démons géants aux yeux bandés (ils tombent avec elle), ondes sonores à brèche, spirales de notes, esprits chercheurs.' });
  B('BOS_029', 'Suigetsu', 'L’homme-eau', 5, 410, { sprite: BP('suigetsu'), vitesse: 1.9, deplacement: 'poursuite', faibleRaiton: true,
    attaques: [
      { id: 'liquefaction', type: 'special', nom: 'liquefaction', tele: 0.3, duree: 1.4, recup: 0.3 },
      { id: 'couperet', type: 'lame', portee: 2.8, arc: 150, tele: 0.55, recup: 0.65, vague: true },
      { id: 'pistolet', type: 'salve', n: 1, v: 9, taille: 1.3, rafales: 4, intervalle: 0.18, tele: 0.4, recup: 0.5, proj: 'eau' },
      { id: 'flot', type: 'zone', zone: 'eau', n: 3, r: 1.5, dureeZone: 7, tele: 0.6, recup: 0.4, son: 'eau' },
    ], phases: [{ seuil: 0.45, message: 'Suigetsu gonfle son bras d’eau !', action: 'accelerer' }],
    desc: 'Se liquéfie en flaque intangible pour surgir près de vous, couperet levé ; pistolet à eau, flots ralentissants. La foudre lui inflige 50 % de plus et l’empêche de se liquéfier pendant 4 s.' });
  B('BOS_030', 'Jūgo', 'La marque de la rage', 6, 500, { sprite: BP('jugo'), vitesse: 1.5, deplacement: 'poursuite',
    attaques: [
      { id: 'poing', type: 'charge', vCharge: 9, tele: 0.55, duree: 0.9, recup: 0.8, maxPhase: 1 },
      { id: 'oiseaux', type: 'invocation', ennemi: 'ENM_092', n: 2, max: 3, tele: 0.6, recup: 0.4, recharge: 8, maxPhase: 1 },
      { id: 'secousse', type: 'onde', n: 1, vOnde: 3.6, tele: 0.6, recup: 0.7, maxPhase: 1 },
      { id: 'massue', type: 'lame', portee: 2.8, arc: 200, tele: 0.6, recup: 0.6, phase: 1 },
      { id: 'propulsion', type: 'charge', vCharge: 12, tele: 0.5, duree: 1.0, recup: 0.7, impact: 'anneau', phase: 1 },
      { id: 'canon', type: 'rayon', couleur: '#ff9a3a', duree: 0.5, tele: 0.8, recup: 0.8, phase: 1 },
      { id: 'pluie', type: 'pluie', n: 8, delai: 0.9, r: 1, intervalle: 0.12, tele: 0.5, recup: 0.6, phase: 1 },
    ], phases: [{ seuil: 0.6, message: 'Jūgo perd le contrôle : la marque le recouvre !', action: 'rage', invulnerable: 0.8 }],
    desc: 'Calme, il appelle les oiseaux, frappe le sol et cogne. À 60 %, la marque le recouvre (forme enragée, plus rapide) : massue de chair, ruées explosives, canon de chakra, pluie de rochers.' });
  B('BOS_031', 'Sakon et Ukon', 'Deux en un seul corps', 6, 420, { sprite: BP('sakon'), vitesse: 1.8, deplacement: 'poursuite',
    attaques: [
      { id: 'enchainement', type: 'special', nom: 'enchainement', cone: { arc: 130, portee: 2.4 }, tele: 0.45, duree: 0.8, recup: 0.6 },
      { id: 'charge', type: 'charge', vCharge: 9.5, tele: 0.5, duree: 0.9, recup: 0.7 },
      { id: 'salve', type: 'salve', n: 4, v: 5.5, ecart: 0.2, rafales: 2, intervalle: 0.3, tele: 0.45, recup: 0.6, proj: 'kunai_ennemi' },
    ], phases: [{ seuil: 0.55, message: 'Ukon se détache du corps de Sakon !', action: 'separer' }],
    desc: 'Enchaînements à deux têtes (deux arcs successifs). À 55 %, Ukon se détache : deux adversaires liés ; Ukon plonge dans le sol et surgit à côté de vous.' });
  B('BOS_033', 'Chimère des cuves', 'L’expérience évadée', 6, 540, { sprite: BP('chimere'), r: 18, vitesse: 1.2, deplacement: 'poursuite', statut: 'création originale',
    attaques: [
      { id: 'ruee', type: 'charge', vCharge: 8.5, tele: 0.6, duree: 1.1, recup: 0.9, trainee: 'acide' },
      { id: 'crachat', type: 'salve', n: 5, v: 4.5, ecart: 0.28, tele: 0.5, recup: 0.6, proj: 'acide' },
      { id: 'pince', type: 'lame', portee: 2.6, arc: 120, tele: 0.55, recup: 0.6, phase: 1 },
      { id: 'mares', type: 'zone', zone: 'acide', n: 3, r: 1.1, dureeZone: 5, tele: 0.6, recup: 0.6, son: 'eau', phase: 1 },
      { id: 'tentacules', type: 'spirale', duree: 2, bras: 4, v: 3.4, intervalle: 0.15, pas: 0.25, tele: 0.6, recup: 0.6, proj: 'acide', phase: 2 },
      { id: 'sujets', type: 'invocation', ennemi: 'ENM_050', n: 2, max: 3, tele: 0.6, recup: 0.4, recharge: 9, phase: 2 },
    ], phases: [{ seuil: 0.66, message: 'La chimère mute : une pince lui pousse !', action: 'muter' }, { seuil: 0.33, message: 'Nouvelle mutation : des tentacules jaillissent !', action: 'muter' }],
    desc: 'Une expérience évadée des cuves. À chaque tiers de vitalité perdu, elle mute (nouvelle silhouette, nouvelles attaques) : ruées acides, pince, mares, tentacules et sujets réanimés.' });
  B('BOS_034', 'Zetsu', 'Celui qui pousse sous le champ de bataille', 7, 440, { sprite: BP('zetsu'), vitesse: 1.2, deplacement: 'aucun',
    attaques: [
      { id: 'surgir', type: 'special', nom: 'terrier', tele: 0.3, duree: 1.4, recup: 0.7 },
      { id: 'spores', type: 'special', nom: 'spores', tele: 0.5, duree: 1.2, recup: 0.6 },
      { id: 'clones', type: 'invocation', ennemi: 'ENM_070', n: 2, max: 3, tele: 0.6, recup: 0.4, recharge: 8 },
      { id: 'racines', type: 'special', nom: 'racines', tele: 0.4, duree: 1.4, recup: 0.6 },
    ], phases: [{ seuil: 0.5, message: 'Les deux moitiés de Zetsu se séparent !', action: 'separer' }],
    desc: 'Plonge dans le sol et ressurgit sous vous, spores chercheuses, clones blancs, racines qui percent le sol en lignes. À 50 %, la moitié blanche se détache et combat à part.' });
  B('BOS_032', 'Danzō', 'La racine', 7, 430, { sprite: BP('danzo'), vitesse: 1.3, deplacement: 'errance',
    attaques: [
      { id: 'vent', type: 'salve', n: 3, v: 7, ecart: 0.12, rafales: 3, intervalle: 0.25, tele: 0.45, recup: 0.5, proj: 'vent' },
      { id: 'baku', type: 'attraction', force: 2.4, tele: 0.6, duree: 1.8, recup: 0.6 },
      { id: 'balles', type: 'anneau', n: 16, v: 4, trou: true, largeurTrou: 2, vagues: 2, intervalle: 0.4, tele: 0.5, recup: 0.6, proj: 'vent' },
      { id: 'racines', type: 'special', nom: 'racines', tele: 0.4, duree: 1.4, recup: 0.6 },
    ], phases: [{ seuil: 0.3, message: 'Izanagi : celui qui est tombé n’était qu’une illusion !', action: 'izanagi' }],
    desc: 'Rafales de lames de vent, aspiration du tapir qui vous attire, anneaux de vent à brèche, racines qui percent le sol. Une seule fois, à 30 %, l’Izanagi : une illusion tombe à sa place et il reprend 25 % de vitalité ailleurs.' });
  B('BOS_035', 'Kinkaku et Ginkaku', 'Les frères d’or et d’argent', 8, 330, { sprite: BP('kinkaku'), vitesse: 1.6, deplacement: 'poursuite', init: 'kinkaku', rageDuo: 'Le frère survivant s’embrase de colère !',
    attaques: [
      { id: 'eventail', type: 'special', nom: 'bashosen', cone: { arc: 60, portee: 5 }, tele: 0.6, duree: 0.8, recup: 0.6 },
      { id: 'flammes', type: 'onde', n: 2, vOnde: 3.4, tele: 0.6, recup: 0.6 },
      { id: 'charge', type: 'charge', vCharge: 9.5, tele: 0.5, duree: 1, recup: 0.8 },
    ],
    desc: 'Deux frères liés : l’aîné (or) souffle des vagues de feu à l’éventail, le cadet (argent) aspire avec sa gourde et fouette de sa corde dorée. Quand l’un tombe, l’autre entre en rage.' });
  // ── Mini-boss de statues ──
  B('BOS_M01', 'Mue gardienne', 'Gardienne du pacte', 0, 150, { sprite: BP('mue'), mini: true, statut: 'création originale',
    attaques: [{ id: 'charge', type: 'charge', vCharge: 9, tele: 0.55, duree: 1, recup: 0.8 }, { id: 'anneau', type: 'anneau', n: 10, v: 4, tele: 0.5, recup: 0.6 }] });
  B('BOS_M02', 'Crapaud gardien', 'Gardien du sanctuaire', 0, 150, { sprite: BP('crapaud'), mini: true, statut: 'création originale',
    attaques: [{ id: 'saut', type: 'saut', r: 1.6, tele: 0.5, duree: 0.7, recup: 0.7, anneau: 8 }, { id: 'langue', type: 'salve', n: 1, v: 9, tele: 0.4, recup: 0.5 }] });
  for (const b of DON.boss) { b.comportement = 'boss'; b.vol = !!b.vol; }
})();
