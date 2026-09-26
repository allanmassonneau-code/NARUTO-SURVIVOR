// ═══════════════════════════════════════════════════════════════════════════
// Personnages (CHR) et variantes altérées (ALT). Valeurs de départ du projet,
// pas une transcription du canon : le labyrinthe impose ses règles.
// Statistiques : dégâts / cadence (tirs par s) / portée (tuiles) /
// vitesse des projectiles (tuiles par s) / vitesse (tuiles par s) / chance.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const REF = { degats: 3.5, cadence: 2.5, portee: 6, vitesseTir: 9, vitesse: 4.5, chance: 0 };
  const P = o => DON.personnages.push(Object.assign({ ressources: { ryo: 0, cles: 0, explosifs: 1 }, passifs: [], statut: 'personnage canonique — règles adaptées au labyrinthe' }, o, { stats: Object.assign({}, REF, o.stats || {}) }));

  P({ id: 'CHR_001', nom: 'Naruto', cle: 'naruto', sante: { vitalite: 3 }, tir: { apparence: 'kunai' }, actif: 'ACT_002',
    regle: 'Obstination : à la dernière demi-unité de santé, +1 dégâts jusqu’à la fin de la salle.', regleCode: 'obstination',
    faiblesse: 'Aucune : personnage de référence.', difficulte: 1, deblocage: null,
    identite: 'Cheveux en pointes blonds, bandeau, tenue orange. Deux signes : silhouette capillaire et orange.',
    builds: ['Armée de clones (Multi-clonage + familiers tireurs)', 'Orbe chargé (Empreinte du Rasengan)', 'Vent tranchant (Fūton, percement)'] });
  P({ id: 'CHR_002', nom: 'Sasuke', cle: 'sasuke', sante: { vitalite: 3 }, tir: { apparence: 'shuriken', forme: 'charge_libre' }, actif: 'ACT_003',
    stats: { portee: 6.5, vitesseTir: 10, vitesse: 4.6 },
    regle: 'Foudre concentrée : le tir se charge (maintenir, relâcher). Dégâts ×0,5 à ×3 ; à pleine charge, le shuriken perce et enchaîne la foudre.', regleCode: 'foudre_concentree',
    faiblesse: 'Tir rapide faible sans charge ; exige de relâcher au bon moment.', difficulte: 2, deblocage: null,
    identite: 'Cheveux sombres en pointes arrière, tenue bleu nuit, shuriken tournoyants.',
    builds: ['Foudre en chaîne (Raiton + charge)', 'Rayon chargé (fusion de charges)', 'Frappe éclair (actif Chidori + protection)'] });
  P({ id: 'CHR_003', nom: 'Sakura', cle: 'sakura', sante: { vitalite: 3 }, tir: { apparence: 'poing' }, actif: 'ACT_004',
    stats: { degats: 4, cadence: 2.2, portee: 4.5, vitesseTir: 8, vitesse: 4.4 },
    regle: 'Contrôle du chakra : les soins excédentaires sont stockés (6 demis au plus) et renforcent Ōkashō. Elle peut ramasser la vitalité à pleine santé.', regleCode: 'controle_chakra',
    faiblesse: 'Courte portée.', difficulte: 1, deblocage: null,
    identite: 'Cheveux roses courts, bandeau en serre-tête, tenue rouge.',
    builds: ['Réserve de soins (cœurs + actif)', 'Frappe courte renforcée', 'Sanctuaires (santé pleine préservée)'] });
  P({ id: 'CHR_004', nom: 'Kakashi', cle: 'kakashi', sante: { vitalite: 3 }, tir: { apparence: 'kunai' }, actif: 'ACT_006',
    stats: { portee: 6.5, vitesseTir: 9.5, vitesse: 4.6, chance: 1 }, familiersDepart: ['FAM_PAKKUN'],
    regle: 'Ninja copieur : deux emplacements d’actif (échange avec le bouton supérieur gauche). Pakkun signale les murs secrets de la salle.', regleCode: 'ninja_copieur',
    faiblesse: 'Statistiques moyennes : sa force vient des actifs.', difficulte: 2, deblocage: { objectif: 'OBJ_004' },
    identite: 'Cheveux argentés inclinés, masque, bandeau sur l’œil, gilet vert.',
    builds: ['Double actif (Réécriture d’empreinte + actif offensif)', 'Foudre (Raikiri)', 'Chasse aux secrets'] });
  P({ id: 'CHR_005', nom: 'Rock Lee', cle: 'lee', sante: { vitalite: 3 }, tir: { apparence: 'coup', forme: 'lame' }, actif: 'ACT_007',
    stats: { degats: 5, cadence: 2.4, portee: 1.7, vitesse: 5.2 },
    regle: 'Taijutsu pur : frappe au corps-à-corps (arc de 100°). Les coups détruisent les projectiles ennemis ordinaires. Les objets de tir sont convertis (table de conversion).', regleCode: 'taijutsu',
    faiblesse: 'Exposition au contact ; pas de tir à distance sans objet.', difficulte: 2, deblocage: { objectif: 'OBJ_009' },
    identite: 'Coupe au bol, sourcils épais, combinaison verte, jambières orange.',
    builds: ['Huit Portes (actif + vitesse)', 'Frappe étendue (lame longue)', 'Contre-attaque (protections + contact)'] });
  P({ id: 'CHR_006', nom: 'Hinata', cle: 'hinata', sante: { vitalite: 3 }, tir: { apparence: 'paume' }, actif: 'ACT_008',
    stats: { degats: 3, cadence: 2.6, portee: 4.5, vitesse: 4.5 }, passifs: [],
    regle: 'Byakugan : le plan de l’étage et la cache de renseignements sont révélés. Ses paumes percent les ennemis.', regleCode: 'byakugan',
    faiblesse: 'Dégâts faibles.', difficulte: 1, deblocage: { objectif: 'OBJ_012' },
    identite: 'Longs cheveux indigo, yeux pâles sans pupille, veste lavande.',
    builds: ['Percement multiple', 'Défense rotative (actif + orbitaux)', 'Exploration totale'] });
  P({ id: 'CHR_007', nom: 'Shikamaru', cle: 'shikamaru', sante: { vitalite: 2, protection: 1 }, tir: { apparence: 'kunai_ombre' }, actif: 'ACT_009',
    stats: { degats: 3.2, cadence: 2.3, portee: 6, vitesseTir: 8.5, vitesse: 4.3, chance: 1 },
    regle: 'Stratège : chaque salle d’héritage propose deux objets au choix ; ses kunai immobilisent parfois (15 % + 3 % par point de chance, 50 % au plus).', regleCode: 'stratege',
    faiblesse: 'Peu de vitalité, dégâts modestes.', difficulte: 2, deblocage: { objectif: 'OBJ_015' },
    identite: 'Queue de cheval en ananas, gilet vert, regard las.',
    builds: ['Contrôle (immobilisation + dégâts de zone)', 'Choix multiples (pools riches)', 'Pièges et mines'] });
  P({ id: 'CHR_008', nom: 'Gaara', cle: 'gaara', sante: { vitalite: 2, protection: 2 }, tir: { apparence: 'sable' }, actif: 'ACT_010',
    stats: { degats: 3.8, cadence: 2, portee: 6, vitesseTir: 7.5, vitesse: 3.7 },
    regle: 'Bouclier de sable : absorbe le premier coup reçu dans chaque salle de combat non nettoyée ; vitesse de base réduite.', regleCode: 'bouclier_sable',
    faiblesse: 'Lent : difficile d’esquiver les charges.', difficulte: 2, deblocage: { objectif: 'OBJ_018' },
    identite: 'Cheveux rouges, cernes sombres, marque au front, gourde dans le dos.',
    builds: ['Armure de sable (orbitaux)', 'Frappe différée (sable qui tombe)', 'Protection cumulée'] });
  P({ id: 'CHR_009', nom: 'Kankurō', cle: 'kankuro', sante: { vitalite: 3 }, tir: { apparence: 'lame_poison', source: 'marionnette' }, actif: 'ACT_011',
    stats: { degats: 3.4, cadence: 2.4, portee: 6.5, vitesse: 4.3 }, familiersDepart: ['FAM_KARASU'],
    regle: 'Marionnettiste : ses tirs partent de Karasu, qui flotte entre lui et la direction visée et bloque les projectiles qui le touchent.', regleCode: 'marionnettiste',
    faiblesse: 'Point d’émission décalé ; Karasu peut être contourné.', difficulte: 2, deblocage: { objectif: 'OBJ_021' },
    identite: 'Capuche noire à oreilles, peintures violettes, marionnette bandée dans le dos.',
    builds: ['Arsenal de marionnettiste', 'Poison cumulé', 'Familiers tireurs'] });
  P({ id: 'CHR_010', nom: 'Kiba', cle: 'kiba', sante: { vitalite: 3 }, tir: { apparence: 'griffe' }, actif: 'ACT_012',
    stats: { degats: 3.8, cadence: 2.4, portee: 4, vitesse: 4.8 }, familiersDepart: ['FAM_AKAMARU'],
    regle: 'Flair : Akamaru attaque au contact et creuse (10 % de trouver une ressource à la fin d’une salle nettoyée).', regleCode: 'flair',
    faiblesse: 'Portée courte.', difficulte: 1, deblocage: { objectif: 'OBJ_024' },
    identite: 'Cheveux bruns en bataille, crocs rouges sur les joues, veste grise, Akamaru.',
    builds: ['Meute d’invocation', 'Charge de contact', 'Économie (fouille)'] });
  P({ id: 'CHR_011', nom: 'Sasori', cle: 'sasori', sante: { vitalite: 0, protection: 3 }, tir: { apparence: 'senbon' }, actif: 'ACT_013',
    stats: { cadence: 2.5, vitesse: 4.4 }, expert: true,
    regle: 'Corps de marionnette : aucun contenant de vitalité. Les contenants obtenus deviennent une réserve de chakra ; la vitalité au sol est ignorée. Senbon empoisonnés (35 %).', regleCode: 'corps_marionnette',
    faiblesse: 'Aucun soin de vitalité ; les pactes coûtent des réserves.', difficulte: 3, deblocage: { objectif: 'OBJ_027' },
    identite: 'Cheveux roux, manteau noir à nuages rouges, regard vide.',
    builds: ['Réserve de protection', 'Poison et marionnettes', 'Pactes payés en réserves'] });
  P({ id: 'CHR_012', nom: 'Kakuzu', cle: 'kakuzu', sante: { vitalite: 2 }, tir: { apparence: 'element', multi: 3 }, actif: 'ACT_014',
    ressources: { ryo: 10, cles: 0, explosifs: 1 }, stats: { degats: 3.4, cadence: 2.2, vitesse: 4.3 }, expert: true,
    regle: 'Avarice : trois tirs élémentaires en éventail. Blessé, chaque Ryō ramassé soigne une demi-unité au lieu d’être gardé. Trois contenants au plus ; pactes payés 15 Ryō par contenant.', regleCode: 'avarice',
    faiblesse: 'Santé plafonnée, dépend de l’économie.', difficulte: 3, deblocage: { objectif: 'OBJ_030' },
    identite: 'Capuche et masque sombres, yeux verts sur fond rouge, manteau à nuages.',
    builds: ['Boutique et relances', 'Machines et informateurs', 'Tir multiple élémentaire'] });

  // ── Variantes altérées : une règle de jeu nouvelle, identité parent explicite ──
  const A = o => DON.personnages.push(Object.assign({ ressources: { ryo: 0, cles: 0, explosifs: 1 }, passifs: [], variante: true, statut: 'variante altérée — création originale' }, o, { stats: Object.assign({}, REF, o.stats || {}) }));
  A({ id: 'ALT_001', parent: 'CHR_001', nom: 'Naruto — Réceptacle fissuré', cle: 'naruto', teinte: '#6a2a1a', sante: { vitalite: 1 }, tir: { apparence: 'kunai' }, actif: 'ACT_050',
    regle: 'Clones comme ressource : jusqu’à 4 clones l’accompagnent et tirent (35 % des dégâts). Un coup reçu fait disparaître un clone avant la santé. Chaque salle de combat nettoyée rend un clone.', regleCode: 'clones_ressource',
    faiblesse: 'Un seul contenant ; perdre tous les clones laisse très exposé.', difficulte: 3, deblocage: { objectif: 'OBJ_040' }, expert: true,
    builds: ['Armée permanente', 'Explosion de relais', 'Protection par le nombre'] });
  A({ id: 'ALT_002', parent: 'CHR_002', nom: 'Sasuke — Serment de vengeance', cle: 'sasuke', teinte: '#3a1a4a', sante: { vitalite: 1, instable: 2 }, tir: { apparence: 'shuriken', forme: 'charge_libre' }, actif: 'ACT_003',
    regle: 'Pactes spécifiques : après chaque boss, une salle de pacte s’ouvre toujours, jamais un sanctuaire. Un pacte lui coûte 3 demis de chakra instable par contenant. +0,5 dégâts par pacte conclu.', regleCode: 'serment',
    faiblesse: 'Aucun sanctuaire ; vitalité quasi nulle.', difficulte: 3, deblocage: { objectif: 'OBJ_041' }, expert: true,
    builds: ['Collection de pactes', 'Chakra instable', 'Charge démesurée'] });
  A({ id: 'ALT_003', parent: 'CHR_003', nom: 'Sakura — Sceau de la centaine', cle: 'sakura', teinte: '#4a1a3a', sante: { vitalite: 2 }, tir: { apparence: 'poing' }, actif: 'ACT_004',
    stats: { degats: 4, cadence: 2.2, portee: 4.5, vitesseTir: 8, vitesse: 4.4 },
    regle: 'Santé fragmentée : deux contenants au plus. Tout soin au-delà remplit le sceau (12 demis) qui rend automatiquement la santé quand elle tombe à la dernière demi-unité.', regleCode: 'sceau_centaine',
    faiblesse: 'Plafond de deux contenants : les pactes sont très coûteux.', difficulte: 2, deblocage: { objectif: 'OBJ_042' },
    builds: ['Réserve infinie de soins', 'Évitement de pactes', 'Ōkashō chargé'] });
  A({ id: 'ALT_004', parent: 'CHR_008', nom: 'Gaara — Shukaku déchaîné', cle: 'gaara', teinte: '#5a4a1a', sante: { vitalite: 1, protection: 3 }, tir: { apparence: 'sable', differe: true }, actif: 'ACT_010',
    stats: { degats: 3.8, cadence: 2, portee: 6, vitesseTir: 7.5, vitesse: 3.5 },
    regle: 'Tirs différés : le sable s’arrête à mi-course et reste suspendu (12 grains au plus). Relâcher la visée fait converger tous les grains vers la dernière direction.', regleCode: 'tirs_differes',
    faiblesse: 'Demande d’anticiper ; peu efficace contre les cibles rapides.', difficulte: 3, deblocage: { objectif: 'OBJ_043' }, expert: true,
    builds: ['Nuage de sable', 'Pièges suspendus', 'Explosion de grains'] });
  A({ id: 'ALT_005', parent: 'CHR_009', nom: 'Kankurō — Trois marionnettes', cle: 'kankuro', teinte: '#2a3a4a', sante: { vitalite: 3 }, tir: { apparence: 'lame_poison', source: 'marionnette' }, actif: 'ACT_011',
    stats: { degats: 3.4, cadence: 2.4, portee: 6.5, vitesse: 4.3 }, familiersDepart: ['FAM_KARASU'],
    regle: 'Marionnettes échangeables (bouton supérieur gauche) : Karasu (éventail de lames), Kuroari (orbe lent qui immobilise), Sanshōuo (bouclier frontal, tir faible).', regleCode: 'trois_marionnettes',
    faiblesse: 'Changer de marionnette coûte 0,5 s sans tir.', difficulte: 2, deblocage: { objectif: 'OBJ_044' },
    builds: ['Rotation des trois', 'Bouclier permanent', 'Immobilisation + poison'] });
  A({ id: 'ALT_006', parent: 'CHR_012', nom: 'Kakuzu — Cinq cœurs', cle: 'kakuzu', teinte: '#1a3a2a', sante: { vitalite: 1 }, tir: { apparence: 'element', multi: 3 }, actif: 'ACT_014',
    stats: { degats: 3.4, cadence: 2.2, vitesse: 4.3 },
    regle: 'Inventaire reconstruit : à chaque nouvel étage, un passif au hasard est remplacé par un autre de même qualité. Quatre cœurs de réserve : à la mort, il se relève avec un contenant et en perd un.', regleCode: 'cinq_coeurs',
    faiblesse: 'Le build change sans cesse ; un seul contenant.', difficulte: 3, deblocage: { objectif: 'OBJ_045' }, expert: true,
    builds: ['Adaptation permanente', 'Qualité élevée', 'Survie par résurrections'] });
})();
