// ═══════════════════════════════════════════════════════════════════════════
// Boss (BOS) : attaques = données (type, zone, préparation, durée, récupération).
// Les motifs précis sont des créations de gameplay inspirées des rencontres
// célèbres ; aucune attaque n'exige un objet non garanti.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const B = (id, nom, titre, etage, pv, o) => DON.boss.push(Object.assign({ id, nom, titre, etage, pv, boss: true, r: 14, hauteur: 12, vitesse: 1.4, ia: 'generique', deplacement: 'errance', statut: 'personnage canonique — motifs de combat originaux', contact: 1 }, o));
  const N = (masque, corps, o = {}) => Object.assign({ type: 'ninja', masque, corps }, o);
  // ── Étage 1 ──
  B('BOS_001', 'Mizuki', 'Le traître de l’Académie', 1, 170, { sprite: N('bandana', { t: '#5e7e3e', T: '#46612c', a: '#5e7e3e', A: '#46612c', mode: 'veste', v: '#5e7e3e', V: '#46612c' }, { cheveux: { h: '#c8c8d0', g: '#e8e8f0', H: '#9a9aa8' }, arme: true }),
    deplacement: 'errance', vitesse: 1.8, attaques: [
      { id: 'salve', type: 'salve', n: 3, v: 5.5, ecart: 0.25, rafales: 2, tele: 0.45, recup: 0.5 },
      { id: 'fuma', type: 'special', nom: 'fuma_boss', tele: 0.6, duree: 1.6, recup: 0.6 },
      { id: 'charge', type: 'charge', vCharge: 8.5, tele: 0.55, duree: 1.2, recup: 0.9 },
    ], phases: [{ seuil: 0.5, message: 'Mizuki perd son sang-froid !', action: 'accelerer' }], desc: 'Kunai en éventail, grand shuriken revenant, charges.' });
  B('BOS_002', 'Serpent géant', 'Gardien de la Forêt de la Mort', 1, 200, { sprite: { type: 'carte', cle: 'serpent', couleurs: { s: '#6a8a3a', d: '#4a6a2a' } }, echelleSprite: 2, r: 16, init: 'serpent', statut: 'création originale',
    attaques: [
      { id: 'charge', type: 'charge', vCharge: 9, tele: 0.6, duree: 1.3, recup: 1.0, impact: 'anneau' },
      { id: 'terrier', type: 'special', nom: 'terrier', tele: 0.3, duree: 1.6, recup: 0.8 },
      { id: 'crachat', type: 'salve', n: 5, v: 4.5, ecart: 0.3, tele: 0.5, recup: 0.6, proj: 'acide' },
    ], desc: 'Charges, plongée sous terre et crachats en éventail.' });
  B('BOS_003', 'Les frères démons', 'Duo aux griffes enchaînées', 1, 110, { sprite: N('kiri', { t: '#3a4a5a', T: '#26323e' }, { arme: true }), init: 'freres', vitesse: 1.9, deplacement: 'poursuite',
    attaques: [
      { id: 'charge', type: 'charge', vCharge: 8, tele: 0.55, duree: 1.1, recup: 0.8 },
      { id: 'griffe', type: 'lame', portee: 1.8, arc: 120, tele: 0.45, recup: 0.5 },
    ], desc: 'Deux adversaires reliés par une chaîne dangereuse quand elle se tend.' });
  // ── Étage 2 ──
  B('BOS_004', 'Zabuza', 'Le démon du brouillard', 2, 300, { sprite: N('kiri', { t: '#4a5a6a', T: '#34404e', a: '#e8d8c8', A: '#c8b8a8' }, { cheveux: { h: '#3a3a44' }, arme: true }), init: 'brume', vitesse: 1.6,
    attaques: [
      { id: 'sabre', type: 'lame', portee: 2.8, arc: 150, tele: 0.55, recup: 0.7, vague: true },
      { id: 'brume', type: 'special', nom: 'disparition_brume', tele: 0.4, duree: 1.8, recup: 0.3 },
      { id: 'dragon', type: 'salve', n: 3, v: 4.2, ecart: 0.18, rafales: 3, intervalle: 0.35, tele: 0.6, recup: 0.6, proj: 'eau' },
      { id: 'clones', type: 'invocation', id: 'ENM_062', n: 2, max: 2, tele: 0.6, recup: 0.4 },
    ], phases: [{ seuil: 0.45, message: 'Le brouillard s’épaissit…', action: 'accelerer' }], desc: 'Disparaît dans la brume (yeux visibles) et réapparaît sabre levé.' });
  B('BOS_005', 'Haku', 'Les miroirs de glace', 2, 260, { sprite: N('kiri', { t: '#5a6a8a', T: '#3a4a6a', a: '#e8e4dc', A: '#c8c4bc' }, { cheveux: { h: '#2a2a34' } }), init: 'miroirs', vitesse: 2.2, deplacement: 'aucun',
    attaques: [
      { id: 'saut', type: 'special', nom: 'saut_miroir', tele: 0.3, duree: 0.4, recup: 0.3 },
      { id: 'senbon', type: 'special', nom: 'senbon_miroirs', tele: 0.5, duree: 1.2, recup: 0.6 },
      { id: 'salve', type: 'salve', n: 5, v: 6, ecart: 0.12, tele: 0.5, recup: 0.5, proj: 'glace_ennemie' },
    ], phases: [{ seuil: 0.5, message: 'Le cercle de miroirs se resserre !', action: 'accelerer' }], desc: 'Passe de miroir en miroir ; les miroirs se brisent sous les coups.' });
  // ── Étage 3 ──
  B('BOS_006', 'Kankurō et Karasu', 'Le marionnettiste', 3, 140, { sprite: N('suna', { t: '#27272f', T: '#18181e' }, { cheveux: { h: '#27272f', v: '#9a3ab8' } }), init: 'kankuro', deplacement: 'fuite',
    attaques: [{ id: 'gaz', type: 'zone', zone: 'acide', n: 2, r: 1.2, dureeZone: 5, tele: 0.6, recup: 1.2, son: 'vent' }, { id: 'salve', type: 'salve', n: 3, v: 5, ecart: 0.25, tele: 0.5, recup: 0.8 }], desc: 'Frappez le marionnettiste caché : sa marionnette tombera.' });
  B('BOS_007', 'Le trio du Son', 'Trois épreuves en une', 3, 95, { sprite: N('oto', { t: '#6a6a70', T: '#4a4a50' }, { cheveux: { h: '#e0e0e0' } }), init: 'trio', vitesse: 1.6,
    attaques: [{ id: 'onde', type: 'onde', n: 1, vOnde: 3.4, tele: 0.6, recup: 0.8 }, { id: 'salve', type: 'salve', n: 3, v: 5.5, ecart: 0.2, tele: 0.4, recup: 0.6, proj: 'son' }], desc: 'Trois adversaires aux rôles distincts : ondes, souffle, clochettes.' });
  B('BOS_008', 'Kimimaro', 'La danse des os', 3, 340, { sprite: N('oto', { t: '#e8e0d0', T: '#c8c0b0' }, { cheveux: { h: '#e8e8f0', g: '#ffffff' } }), vitesse: 1.8, deplacement: 'poursuite',
    attaques: [
      { id: 'balles', type: 'salve', n: 1, v: 8, rafales: 5, intervalle: 0.15, tele: 0.45, recup: 0.6, proj: 'os' },
      { id: 'lances', type: 'special', nom: 'lances_os', tele: 0.4, duree: 1.4, recup: 0.6 },
      { id: 'danse', type: 'lame', portee: 2, arc: 360, tele: 0.6, recup: 0.8 },
    ], phases: [{ seuil: 0.4, message: 'Une forêt d’os jaillit !', action: 'accelerer' }], desc: 'Balles d’os, lances qui percent le sol en lignes, danse circulaire.' });
  // ── Étage 4 ──
  B('BOS_009', 'Gaara', 'L’enfermement de sable', 4, 380, { sprite: N('suna', { t: '#7c3a2c', T: '#5a2a20' }, { cheveux: { h: '#c63a2a', g: '#ea6a4c', H: '#8a2418' }, yeux: 'cerne' }), vitesse: 1.0, deplacement: 'aucun', init: 'gaara',
    attaques: [
      { id: 'cercueil', type: 'special', nom: 'cercueil_sable', tele: 0.2, duree: 1.2, recup: 0.6 },
      { id: 'shuriken', type: 'salve', n: 5, v: 4.8, ecart: 0.22, tele: 0.45, recup: 0.5, proj: 'sable_ennemi' },
      { id: 'vague', type: 'special', nom: 'vague_sable', tele: 0.7, duree: 2.2, recup: 0.6 },
      { id: 'pluie', type: 'pluie', n: 10, delai: 0.8, r: 0.8, intervalle: 0.1, tele: 0.5, recup: 0.6 },
    ], phases: [{ seuil: 0.5, message: 'Le sable se referme sur l’arène !', action: 'murs_sable' }], desc: 'Le sable enferme l’arène : cercueils au sol, vagues avec une brèche, pluie de sable.' });
  B('BOS_010', 'Sasori', 'Le maître des marionnettes', 4, 360, { sprite: N('anbu', { t: '#1e1e28', T: '#121218' }, { nuages: true, cheveux: { h: '#c63a2a' } }), init: 'hiruko', vitesse: 1.0, ia: 'generique',
    attaques: [
      { id: 'queue', type: 'charge', vCharge: 7, tele: 0.6, duree: 1, recup: 0.8 },
      { id: 'aiguilles', type: 'salve', n: 7, v: 5, ecart: 0.14, tele: 0.55, recup: 0.6, proj: 'kunai_ennemi' },
      { id: 'sable_fer', type: 'zone', zone: 'acide', n: 3, r: 1, dureeZone: 4, tele: 0.6, recup: 0.6, phase: 1 },
      { id: 'anneau', type: 'anneau', n: 14, v: 3.8, trou: true, largeurTrou: 2, vagues: 2, tele: 0.5, recup: 0.7, phase: 1 },
    ], phases: [{ seuil: 0.55, message: 'L’armure d’Hiruko se brise !', action: 'fin_hiruko', invulnerable: 0.6 }], desc: 'Carapace blindée puis sable de fer.' });
  // ── Étage 5 ──
  B('BOS_011', 'Kabuto', 'Le médecin des ombres', 5, 380, { sprite: N('kabuto', { t: '#6a5a8a', T: '#4a3e6a' }), vitesse: 2.0, deplacement: 'poursuite',
    attaques: [
      { id: 'scalpel', type: 'charge', vCharge: 10, tele: 0.45, duree: 0.8, recup: 0.6 },
      { id: 'cadavres', type: 'invocation', id: 'ENM_050', n: 2, max: 3, tele: 0.7, recup: 0.4 },
      { id: 'soin', type: 'special', nom: 'soin_kabuto', tele: 0.2, duree: 2, recup: 0.5 },
      { id: 'salve', type: 'salve', n: 3, v: 6, ecart: 0.2, rafales: 2, tele: 0.4, recup: 0.5 },
    ], desc: 'Se soigne en canalisant (interrompu par 40 dégâts) ; réanime des sujets.' });
  B('BOS_012', 'Kisame', 'Le requin de la brume', 5, 440, { sprite: N('kiri', { t: '#1e1e28', T: '#121218' }, { nuages: true, cheveux: { h: '#3a4a6a' } }), vitesse: 1.7, deplacement: 'poursuite', peau: '#6a8ab0',
    attaques: [
      { id: 'requins', type: 'special', nom: 'requins', tele: 0.5, duree: 1.5, recup: 0.6 },
      { id: 'inondation', type: 'zone', zone: 'eau', n: 3, r: 1.6, dureeZone: 8, tele: 0.6, recup: 0.4, son: 'eau' },
      { id: 'samehada', type: 'lame', portee: 2.6, arc: 160, tele: 0.55, recup: 0.7 },
      { id: 'prison', type: 'special', nom: 'prison_eau', tele: 0.2, duree: 1.4, recup: 0.6 },
    ], desc: 'Inonde l’arène (l’eau vous ralentit, pas lui) ; requins d’eau chercheurs.' });
  B('BOS_013', 'Hidan', 'Le rituel immortel', 5, 400, { sprite: N('anbu', { t: '#1e1e28', T: '#121218' }, { nuages: true, cheveux: { h: '#d8d8e0' } }), vitesse: 1.7, deplacement: 'poursuite', init: 'hidan',
    attaques: [
      { id: 'faux', type: 'special', nom: 'faux_hidan', tele: 0.6, duree: 1.4, recup: 0.6 },
      { id: 'rituel', type: 'special', nom: 'rituel', tele: 0.3, duree: 2.2, recup: 0.6 },
      { id: 'charge', type: 'charge', vCharge: 8.5, tele: 0.5, duree: 1, recup: 0.8 },
    ], desc: 'Si sa faux vous touche, il vous marque ; dans son cercle, il se blesse… et vous aussi. Interrompez le rituel.' });
  // ── Étage 6 (première fin) ──
  B('BOS_014', 'Orochimaru', 'Les mues du serpent', 6, 520, { sprite: N('kabuto', { t: '#e0dcc8', T: '#b8b4a0' }, { cheveux: { h: '#1a1a1e', g: '#3a3a44', H: '#0a0a0e' } }), vitesse: 1.7, deplacement: 'errance',
    attaques: [
      { id: 'serpents', type: 'salve', n: 5, v: 5, ecart: 0.18, rafales: 2, tele: 0.5, recup: 0.6, proj: 'acide' },
      { id: 'epee', type: 'special', nom: 'epee_extensible', tele: 0.7, duree: 0.5, recup: 0.7 },
      { id: 'invocation', type: 'invocation', id: 'ENM_051', n: 2, max: 2, tele: 0.6, recup: 0.4 },
      { id: 'huit', type: 'special', nom: 'huit_tetes', tele: 0.8, duree: 2.4, recup: 0.8, phase: 2 },
    ], phases: [{ seuil: 0.66, message: 'Orochimaru mue !', action: 'mue' }, { seuil: 0.33, message: 'Il mue encore… huit têtes se dressent !', action: 'mue' }], desc: 'À chaque mue, la peau abandonnée devient hostile et il réapparaît ailleurs.' });
  // ── Étage 7 ──
  B('BOS_015', 'Deidara', 'L’art est une explosion', 7, 460, { sprite: N('anbu', { t: '#1e1e28', T: '#121218' }, { nuages: true, cheveux: { h: '#f0d060', g: '#fff090' } }), vol: true, vitesse: 2.0, deplacement: 'errance',
    attaques: [
      { id: 'araignees', type: 'invocation', id: 'ENM_072', n: 3, max: 5, tele: 0.5, recup: 0.4 },
      { id: 'oiseaux', type: 'invocation', id: 'ENM_071', n: 2, max: 4, tele: 0.5, recup: 0.4 },
      { id: 'bombes', type: 'pluie', n: 8, delai: 1, r: 1.1, intervalle: 0.15, tele: 0.5, recup: 0.6, son: 'explosion' },
      { id: 'c3', type: 'special', nom: 'c3', tele: 0.4, duree: 3.0, recup: 1.0, phase: 1 },
    ], phases: [{ seuil: 0.35, message: 'Deidara prépare sa grande œuvre (C3) !', action: 'c3' }], desc: 'Argile explosive sous toutes ses formes ; C3 : mettez-vous à l’abri derrière un bloc.' });
  B('BOS_016', 'Itachi', 'Les illusions du corbeau', 7, 480, { sprite: N('anbu', { t: '#1e1e28', T: '#121218' }, { nuages: true, cheveux: { h: '#1a1a22' }, yeux: 'sharingan' }), vitesse: 1.6, init: 'itachi',
    attaques: [
      { id: 'clones', type: 'special', nom: 'clones_corbeaux', tele: 0.5, duree: 2.0, recup: 0.5 },
      { id: 'boule', type: 'salve', n: 1, v: 3.5, taille: 3, tele: 0.6, recup: 0.6, proj: 'feu' },
      { id: 'flammes', type: 'zone', zone: 'feu_ennemi', n: 3, r: 1, dureeZone: 6, surJoueur: true, tele: 0.7, recup: 0.6, son: 'feu' },
      { id: 'tsukuyomi', type: 'special', nom: 'lune_rouge', tele: 0.8, duree: 3.0, recup: 0.8, phase: 1 },
    ], phases: [{ seuil: 0.4, message: 'Un guerrier spectral se dresse (miroir frontal).', action: 'susanoo' }], desc: 'Seul le vrai Itachi projette une ombre ; ses clones éclatent en corbeaux.' });
  B('BOS_017', 'Kakuzu', 'Les cinq cœurs', 7, 300, { sprite: N('ame', { t: '#1e1e28', T: '#121218' }, { nuages: true }), vitesse: 1.4, init: 'kakuzu',
    attaques: [
      { id: 'poing', type: 'charge', vCharge: 9, tele: 0.5, duree: 1, recup: 0.8 },
      { id: 'durcir', type: 'special', nom: 'durcissement', tele: 0.2, duree: 1.8, recup: 0.3 },
      { id: 'fils', type: 'salve', n: 6, v: 4.6, ecart: 0.25, tele: 0.5, recup: 0.6 },
    ], desc: 'Trois masques élémentaires l’accompagnent ; sa peau durcie (grise) réduit les dégâts de 70 % pendant 1,8 s, visiblement.' });
  // ── Étage 8 ──
  B('BOS_018', 'Pain', 'Les forces d’attraction', 8, 560, { sprite: N('anbu', { t: '#1e1e28', T: '#121218' }, { nuages: true, cheveux: { h: '#e87a2a', g: '#ffa050' }, yeux: 'rinnegan' }), vitesse: 1.2,
    attaques: [
      { id: 'repulsion', type: 'repulsion', tele: 0.8, duree: 0.3, recup: 0.8 },
      { id: 'attraction', type: 'attraction', force: 2.3, tele: 0.6, duree: 2.0, recup: 0.6 },
      { id: 'tiges', type: 'salve', n: 3, v: 7, ecart: 0.15, rafales: 3, intervalle: 0.25, tele: 0.45, recup: 0.5, proj: 'kunai_ennemi' },
      { id: 'betes', type: 'invocation', id: 'ENM_074', n: 1, max: 2, tele: 0.6, recup: 0.4, phase: 1 },
      { id: 'sphere', type: 'special', nom: 'chibaku', tele: 0.8, duree: 3.2, recup: 1, phase: 1 },
    ], phases: [{ seuil: 0.5, message: 'Une sphère attire les rochers vers le ciel !', action: 'accelerer' }], desc: 'Repousse (et détruit vos tirs), attire en tirant en anneau, puis crée une sphère d’attraction.' });
  B('BOS_019', 'Obito', 'Les changements de présence', 8, 540, { sprite: N('anbu', { t: '#1e1e28', T: '#121218' }, { nuages: true, cheveux: { h: '#2a2a34' } }), init: 'obito', vitesse: 1.6,
    attaques: [
      { id: 'saisie', type: 'special', nom: 'saisie_obito', tele: 0.2, duree: 1.3, recup: 0.9 },
      { id: 'boule', type: 'salve', n: 3, v: 4, ecart: 0.3, taille: 2, tele: 0.6, recup: 0.6, proj: 'feu' },
      { id: 'vortex', type: 'special', nom: 'vortex', tele: 0.6, duree: 1.8, recup: 0.6 },
      { id: 'chaines', type: 'rayon', couleur: '#8a8a98', duree: 0.6, balaye: 1.2, tele: 0.8, recup: 0.6, phase: 1 },
    ], phases: [{ seuil: 0.5, message: 'Le masque se fissure.', action: 'accelerer' }], desc: 'Intangible sauf quand il se matérialise pour attaquer (contour plein).' });
  // ── Branches et fins avancées ──
  B('BOS_020', 'Le Gardien du Sceau', 'Celui qui tient le labyrinthe', 9, 800, { sprite: { type: 'carte', cle: 'masque', couleurs: { m: '#f0e8d0', d: '#c8c0a8', r: '#e8c050', f: '#fff8d0' } }, echelleSprite: 3, r: 20, vol: true, statut: 'création originale', deplacement: 'errance', vitesse: 1.0, terminal: true,
    attaques: [
      { id: 'chaines', type: 'rayon', couleur: '#e8c050', duree: 0.8, balaye: 0.9, tele: 0.9, recup: 0.6 },
      { id: 'anneaux', type: 'onde', n: 3, vOnde: 3.2, tele: 0.6, recup: 0.6 },
      { id: 'spirale', type: 'spirale', duree: 2.5, bras: 3, v: 3.6, intervalle: 0.12, tele: 0.6, recup: 0.6 },
      { id: 'arene', type: 'special', nom: 'arene_change', tele: 0.6, duree: 0.6, recup: 0.4 },
    ], phases: [{ seuil: 0.66, message: 'Le labyrinthe se réarrange !', action: 'arene' }, { seuil: 0.33, message: 'Le sceau vacille !', action: 'arene' }], desc: 'Arène évolutive : des blocs apparaissent entre les phases ; chaînes balayantes.' });
  B('BOS_021', 'Madara (empreinte)', 'L’ancien rival', 9, 900, { sprite: N('anbu', { t: '#8a2a2a', T: '#6a1a1a', a: '#8a2a2a', A: '#6a1a1a' }, { cheveux: { h: '#1a1a22', g: '#3a3a44' }, yeux: 'rinnegan' }), vitesse: 1.6, terminal: true,
    attaques: [
      { id: 'meteore', type: 'meteore', r: 3, tele: 1.6, duree: 0.2, recup: 0.8 },
      { id: 'feu', type: 'spirale', duree: 2, bras: 4, v: 4, intervalle: 0.1, pas: 0.25, tele: 0.6, recup: 0.6, proj: 'feu' },
      { id: 'bois', type: 'special', nom: 'dragons_bois', tele: 0.6, duree: 1.6, recup: 0.6 },
      { id: 'sabre', type: 'lame', portee: 3.2, arc: 180, tele: 0.7, recup: 0.8, vague: true },
    ], phases: [{ seuil: 0.5, message: 'Un guerrier géant l’entoure.', action: 'accelerer' }], desc: 'Attaques massives : météore (abri : loin du centre marqué), dragons de bois, grands balayages.' });
  B('BOS_022', 'Empreinte des Dix Queues', 'La brèche instable', 8, 1000, { sprite: { type: 'carte', cle: 'ombre', couleurs: { o: '#4a3a5a', l: '#8a6a9a', r: '#ff2a2a' } }, echelleSprite: 4, r: 26, statut: 'création originale d’après une créature célèbre', deplacement: 'aucun', terminal: true, contact: 2,
    attaques: [
      { id: 'queues', type: 'special', nom: 'balayage_queues', tele: 0.8, duree: 1.2, recup: 0.6 },
      { id: 'bombe', type: 'rayon', couleur: '#b050e0', duree: 0.8, tele: 1.2, recup: 1 },
      { id: 'pluie', type: 'pluie', n: 14, delai: 0.9, r: 1, intervalle: 0.1, tele: 0.5, recup: 0.6 },
      { id: 'anneau', type: 'anneau', n: 18, v: 3.4, trou: true, largeurTrou: 2, vagues: 3, intervalle: 0.5, tele: 0.6, recup: 0.6 },
    ], desc: 'Immobile et gigantesque : queues balayantes, rayon, anneaux à brèche.' });
  // ── Mini-boss de statues ──
  B('BOS_M01', 'Mue gardienne', 'Gardienne du pacte', 0, 150, { sprite: { type: 'carte', cle: 'serpent', couleurs: { s: '#8a7a9a', d: '#5a4a6a' } }, echelleSprite: 2, mini: true, statut: 'création originale',
    attaques: [{ id: 'charge', type: 'charge', vCharge: 9, tele: 0.55, duree: 1, recup: 0.8 }, { id: 'anneau', type: 'anneau', n: 10, v: 4, tele: 0.5, recup: 0.6 }] });
  B('BOS_M02', 'Crapaud gardien', 'Gardien du sanctuaire', 0, 150, { sprite: { type: 'carte', cle: 'crapaud_gardien' }, echelleSprite: 2, mini: true, statut: 'création originale',
    attaques: [{ id: 'saut', type: 'saut', r: 1.6, tele: 0.5, duree: 0.7, recup: 0.7, anneau: 8 }, { id: 'langue', type: 'salve', n: 1, v: 9, tele: 0.4, recup: 0.5 }] });
  for (const b of DON.boss) { b.comportement = 'boss'; b.vol = !!b.vol; }
})();
