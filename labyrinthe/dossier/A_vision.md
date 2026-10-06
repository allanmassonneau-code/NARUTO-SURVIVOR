# A — Vision jouable, décisions structurantes et transposition

## A1. La promesse, telle que le jeu la tient

> « Je descends dans un labyrinthe shinobi. Chaque objet modifie ce que je suis, chaque porte est un choix et chaque combinaison peut transformer une partie ordinaire en découverte mémorable. »

Une partie standard traverse **8 étages** (quatre chapitres de deux étages) après déblocage progressif, puis un **9ᵉ étage** de branche (Lumière ou Ombre). Chaque étage est un graphe de 8 à 18 salles fermées ; on y vide des rencontres conçues à la main, on dépense ou garde ses Ryō, clés et parchemins explosifs, on ramasse des objets qui transforment le tir et l’apparence du shinobi, puis on affronte le gardien de l’étage.

Les quatre piliers et leur traduction mécanique :

| Pilier | Ce qui le porte dans le jeu |
|---|---|
| Précision du déplacement et du tir | Accélération 0,08 s et freinage 0,07 s ; tir cardinal avec hystérésis ; collision du joueur limitée aux pieds (cercle de 7 px) ; télégraphes de 0,2 à 0,9 s sur les attaques ennemies (0,35 à 0,7 s pour les ennemis ordinaires) ; pas de simulation fixe à 60 Hz. |
| Décisions de ressources | Trois ressources visibles (Ryō, clés, explosifs) à usages multiples ; salles verrouillées dès l’étage 2 ; pactes payés en contenants ; soins non automatiques ; charges d’actif par salle. |
| Surprise des objets et interactions | 158 passifs composables (formes, trajectoires, impacts, statuts, familiers), 13 formes de tir qui se combinent par priorité et contributions secondaires, 96 synergies documentées (dont 9 fusions de natures façon kekkei genkai et 3 trios), 13 transformations. |
| Apprentissage | 120 modèles de salles (dont deux salles propres à chaque thème et des grandes salles dessinées pour chaque forme), 76 ennemis à silhouette fonctionnelle, 25 boss aux motifs lisibles, routes et secrets à indices consultables (registre des missions). |

Le joueur comprend les commandes en quelques secondes (bouger, viser, tirer, poser un explosif, utiliser l’actif) ; la profondeur vient des objets. La première victoire (fin RTE_01, étage 6) n’ouvre que la suite : deux chapitres, puis deux branches, puis deux défis chronométrés.

**Hiérarchie de décision appliquée** : expérience d’Isaac > combat lisible et juste > adaptation Naruto convaincante > pixel art satisfaisant > volume de contenu. Exemple d’arbitrage : Rock Lee frappe au corps-à-corps (identité), mais ses coups détruisent les projectiles ordinaires et les objets de tir sont convertis par une table explicite — le personnage reste jouable avec n’importe quel tirage.

## A2. Contrat de fidélité : décision → application

| Décision du brief (§02) | Application dans le jeu | Module |
|---|---|---|
| Visée et tir volontaires, pas d’auto-ciblage | Stick droit ou boutons de face, comme *Isaac* (ou croix, ou flèches) ; le retour au centre arrête le tir. La visée libre à 360° n’existe que pour la sphère contrôlée (option `viseeLibreControle`). | `21_entrees.js`, `34_tir.js` |
| Déplacement libre, tir cardinal | Quantification en 4 directions avec hystérésis de 12° ; les objets modifient la géométrie (éventail, croix, arrière, orbite). | `21_entrees.js`, `34_tir.js` |
| Pas d’expérience ni de montée de niveau | Aucune ; les ennemis ne lâchent que des ressources selon les tables de salle. | `38_monde.js` |
| Puissance par objets, échanges, transformations, exploration | Passifs illimités, 1 actif, 1 talisman, 1 poche (extensibles par objets). | `37_objets.js` |
| Passifs sans limite de 6 emplacements | Liste illimitée ; l’interface de pause les affiche par pages. | `47_menus.js` |
| Attaques composées et transformées | Profil d’attaque recalculé à chaque acquisition : forme principale par priorité + contributions secondaires. | `37_objets.js` §R17 |
| Salles conçues assemblées en étages procéduraux | Graphe sur grille 13×13, gabarits validés, 60 essais puis plan de secours. | `31_etage.js` |
| Portes fermées pendant les rencontres | Verrouillage 0,25 s après l’entrée si des ennemis sont présents ; ouverture à la mort du dernier ennemi. | `38_monde.js` |
| Objets refusables, contreparties | Piédestaux physiques : on observe (description), on prend ou on part ; les choix liés disparaissent ensemble. | `39_speciales.js` |
| Ressources non distribuées à chaque salle | Tirage de fin de salle : environ 35 % de « rien » à chance 0, 7 % à chance 10 (§R10). | `38_monde.js` |
| Pas d’esquive / parade / substitution universelle | Substitution, dash, intangibilité, rotation : uniquement par objets ou personnage. | `40_actifs.js` |
| Blessures conservées, pas de soin intégral après boss | Récompense de boss : un objet + un cœur **ou** une réserve de chakra (50/50). | `43_boss.js` |
| Fin par victoire, défaite ou sortie | Aucun chronomètre imposé au mode principal ; les routes chronométrées sont facultatives. | `39_speciales.js` |
| La mort fait perdre le build, pas les déblocages | Profil séparé de la partie suspendue ; la mort efface la partie, garde objectifs et marques. | `48_sauvegarde.js`, `49_progression.js` |
| Progression qui ouvre, sans +1 % de dégâts | Déblocages de personnages, objets, défis, routes ; la caisse des marchands n’augmente que la variété de l’échoppe. | `49_progression.js` |

## A3. Registre des conventions (règles arrêtées)

Le code cite ces règles par leur numéro (commentaires « registre §Rn ») ; toute modification doit être reportée ici et dans les exemples.

| Règle | Contenu arrêté |
|---|---|
| §R1 Grille et unités | Résolution interne 640 × 360 ; tuile 32 px ; cellule de salle 13 × 7 tuiles intérieures ; salle 1×1 dessinée à l’origine d’écran (80, 40) murs compris, intérieur à (112, 72) — conforme au brief §30. Temps de simulation fixe 1/60 s, au plus 5 pas par image. |
| §R5 Actions logiques | Les commandes sont liées à des actions (`actif`, `explosif`, `poche`, `interagir`, `retour`, `description`, `carte`, `pause`, `echanger`, `deposer`), jamais à des lettres de boutons. Liaisons par défaut en B1. |
| §R6 Quantification de visée | Activation 0,5 ; retour au repos 0,35 ; changement d’axe si la composante perpendiculaire dépasse tan(45° + 12°) ≈ 1,54 fois l’autre ; égalité exacte → axe horizontal. |
| §R8 Statistiques | `valeur = (base + Σ ajouts) × (1 + Σ pourcentages / 100) × Π multiplicateurs`, puis bornes (B4). Indépendant de l’ordre de ramassage (testé). |
| §R8c Charges | Temps de charge = base × 2,5 / cadence effective : un bonus de cadence réduit le temps de charge dans la même proportion que le délai entre tirs. |
| §R9 Santé | Demi-unités entières, 12 emplacements ; ordre des pertes : réserves (de droite à gauche) → enveloppes osseuses → sceau partiel → vitalité. |
| §R10 Récompenses de salle | Table pondérée, « rien » inclus ; la chance déplace la masse « rien » vers les coffres, consommables et talismans (plafond 10). |
| §R17 Priorité des formes | `frappe > controle > rayon > faisceau > orbe > charge_libre > lame_longue > lame > bombe > boomerang > laser > rotation > projectile`. Les formes non principales deviennent des contributions secondaires (table C3). |
| §R23 Opportunités | Probabilité d’opportunité après le boss puis choix de famille (pacte/sanctuaire) par poids renormalisés (E6). |
| §R24 Loterie | Issues publiques et fixes (B6), aucune probabilité cachée. |
| §R26 Ennemis | Aucun ennemi n’attaque pendant la transition ni pendant son apparition (0,25 s ajoutées) ; zone de sécurité de 2,6 tuiles autour du point d’entrée. |
| §R40 Événements | Vocabulaire commun (H3) ; les événements cosmétiques ne déclenchent jamais d’effet de jeu. |
| Noms de ressources | Ryō, clé de sceau, parchemin explosif, vitalité (contenants), réserve de chakra protecteur, chakra instable, sceau vital partiel, enveloppe osseuse, cicatrice de sceau, condensateur de chakra, charge (d’actif). |
| Hasard | Flux séparés par étage : topologie, gabarits, butin, récompenses, ennemis, combat ; le cosmétique utilise un flux non reproductible qui n’influence rien. |

## A4. Matrice de transposition fonctionnelle

Colonnes : fonction de gameplay conservée · équivalent dans le jeu (identifiants) · coût ou risque · interactions principales · raison de la conserver · état.

| Système de référence | Équivalent du labyrinthe | Coût / risque | Interactions | Pourquoi le garder | État |
|---|---|---|---|---|---|
| Tir principal | Kunai, shuriken, senbon, poings, sable, lames empoisonnées, griffes selon le personnage (CHR_001–012) | Aucun coût ; la cadence est la limite | Tous les passifs de projectile | Action répétable qui porte le buildcraft | Jouable |
| Objets passifs | Empreintes, reliques, équipements (PSV, 158) | Contreparties sur 1 objet sur 6 environ | Profil d’attaque, familiers, santé, économie | Accumulation qui transforme la partie | Jouable |
| Objets actifs | Techniques scellées (ACT, 33) | Charges 1–12 salles, recharge en combat ou usage unique | Condensateurs, Pile de chakra, surcharge | Pouvoir ponctuel à placer au bon moment | Jouable |
| Trinkets | Talismans ninja (TAL, 35) | Emplacement unique, échange = dépôt au sol | Effets de bombes, drops, protection conditionnelle | Petit effet échangeable | Jouable |
| Cartes et runes | Rouleaux tactiques (22) et sceaux (8) (CON) | Usage unique ; une poche | Téléportation, relance, révélation | Effet à garder pour le bon moment | Jouable |
| Pilules | Pilules militaires non identifiées (PIL, 15 effets, 15 apparences) | Effets négatifs possibles | Identification à l’usage, Gourde de saké | Prise de risque et apprentissage dans la partie | Jouable |
| Pièces | Ryō | Plafond 99 | Échoppe, machines, informateurs, Kakuzu | Arbitrage économique | Jouable |
| Bombes | Parchemins explosifs | Blessent le joueur (1 unité) | Rochers, rochers à sceau, murs secrets, coffres de pierre, machines, ponts sur fosse | Combat, accès, secrets | Jouable |
| Clés | Clés de sceau | Rares | Héritage, échoppe, bibliothèque, coffres verrouillés, blocs à clé | Accès limité | Jouable |
| Cœurs rouges | Vitalité en contenants | Se vide, se remplit | Soins, pactes, obstination | Réserve rechargeable | Jouable |
| Cœurs de protection | Réserves de chakra protecteur | Pas de contenant | Absorbent avant la vitalité | Protection consommable | Jouable |
| Protection offensive | Chakra instable | Idem | Rupture : 40 dégâts à tous les ennemis | Défense qui attaque | Jouable |
| Contenants spéciaux | Sceau vital partiel, enveloppes osseuses, cicatrices de sceau | Cicatrice : −1 emplacement | Deux sceaux partiels = un contenant ; enveloppe vide absorbe un coup entier | Gestion avancée | Jouable |
| Salle de trésor | Salle d’héritage ninja | Clé dès l’étage 2 | Pool héritage (145 objets) | Objet structurant | Jouable |
| Boutique | Échoppe clandestine | Ryō, clé dès l’étage 2 | Soldes, coupon, statue-tanuki | Conversion de Ryō | Jouable |
| Récompense de boss | Transmission de chakra | Combat obligatoire | Pool boss (55) | Progression après épreuve | Jouable |
| Salle secrète | Cache de renseignements | Un explosif | Indices topologiques (≥ 2 voisins) | Déduction | Jouable |
| Salle super-secrète | Chambre de scellement isolée | Un explosif, emplacement rare | Un seul voisin | Secret distinct | Jouable |
| Salle ultra-rare | Archive interdite | — | — | Découverte exceptionnelle | **Non produite** (cible) |
| Marché à coût vital | Pacte interdit | Contenants de vitalité (ou réserves) | Bloque la branche Lumière | Puissance contre survie | Jouable |
| Récompense de renoncement | Sanctuaire des ermites | Pas de pacte acheté | Clé des ermites (2 fragments) | Alternative au pacte | Jouable |
| Salle maudite | Chambre au sceau blessant | Sortir coûte une demi-unité (sauf lévitation) | Coffres piégés | Risque d’entrée/sortie | Jouable |
| Salle de sacrifice | Autel de tribut | Une demi-unité par passage | 12 paliers stockés | Série de paiements | Jouable |
| Salle de défi | Épreuve de l’examen chūnin | Trois vagues après la prise | Porte conditionnelle (santé pleine) | Récompense avant épreuve | Jouable |
| Défi de boss | Épreuve de jōnin | Deux boss affaiblis (60 %) | Porte conditionnelle | Rencontre supérieure | Jouable |
| Arcade et machines | Comptoir des contrebandiers (loterie, don vital, diseuse, soin, recharge, troc) | Ryō ou santé | Explosifs (destruction) | Conversion probabiliste | Jouable |
| Donateurs, quémandeurs | Informateurs : voyageur, marchand de clés, artificier | Ryō, clés, explosifs | Issues publiques | Échange répété | Jouable |
| Coffres | Coffre, coffre verrouillé, coffre piégé, coffre de pierre | Clé, explosif, santé | Crochetage | Loot local | Jouable |
| Obstacles destructibles | Rochers, jarres, caisses, totems, feux | — | Tirs, explosions | Lecture du décor | Jouable |
| Rochers remarquables | Rocher à sceau (spirale claire) | Un explosif | Récompense garantie | Observation | Jouable |
| Fosses et vol | Gouffres, lévitation de chakra | — | Ponts de débris | Accès spatial | Jouable |
| Surfaces dangereuses | Acide, huile, feu allié/ennemi, flaques, sables mouvants, toiles | — | Katon brûle toiles et huile | Contrôle de l’espace | Jouable |
| Familiers | Clones, Gamakichi, Katsuyu, Akamaru, Pakkun, insectes, marionnettes, fauves d’encre… (26 définitions, 16 comportements) | Rien | Talisman, familiers forts, marionnettes fortes | Attaques autonomes | Jouable |
| Orbitaux | Sable, kunai, serpent, papillons, miroir de glace | — | Blocage à fréquence bornée | Protection de proximité | Jouable |
| Transformations | Résonances de chakra (13) | 3 objets distincts | Couches visuelles | Récompense d’ensemble | Jouable |
| Relance d’objets | Réécriture d’empreinte (ACT_001), sceau de réécriture (CON_024) | 6 charges / consommable | Choix liés conservés | Modifier une récompense | Jouable |
| Relance du build | Rituel de permutation (ACT_031), sceau (CON_028) | Risque | Objets-clés exclus | Reconstruction risquée | Jouable |
| Sac à objets et recettes | Coffret de scellement combinatoire | — | — | Système avancé | **Non produit** (cible) |
| Routes alternatives | Branches Lumière (THM_MYO) / Ombre (THM_BIJ) | Lumière : aucun pacte | Clé des ermites | Choix de difficulté et de boss | Jouable |
| Boss Rush | Conseil des épreuves (RTE_05) | Boss de l’étage 6 avant 20:00 | Six boss en vagues | Défi optionnel | Jouable |
| Combat chronométré | Brèche instable (RTE_06, BOS_022) | Salle du boss 8 avant 30:00 | — | Objectif de vitesse | Jouable |
| Retour dans des étages altérés | Remontée des sceaux | — | — | Route secrète | **Non produite** (cible) |
| Variantes de personnages | Versions altérées (ALT, 6) | Règle nouvelle | Déblocage par première fin | Nouvelle règle, pas un skin | Jouable |
| Marques de complétion | Registre des missions (marques par route et personnage) | — | Séparation Standard / Difficile / Défi / Entraînement | Objectifs permanents | Jouable |
| Défis | Contrats de mission (DEF, 12) | Contrainte | Récompense ciblée | Runs contraintes | Jouable |
| Graines | Codes de mission (8 caractères, sans I, O, 0, 1) | Partie « entraînement » : pas de déblocage | Flux séparés | Reproductibilité | Jouable |
| Mode de vagues économique | Marché des mercenaires | — | — | Mode annexe | **Non produit** (cible) |

Les quatre lignes « non produites » sont des cibles de la bibliothèque complète ; elles ne sont ni simulées ni annoncées en jeu (voir I_audit.md §I3).

## A5. Ce que le jeu n’est pas

- Pas un *Survivors* : pas de horde continue, pas d’expérience, pas de choix de trois améliorations, pas d’arme qui monte au niveau 8. Les « transformations d’ensemble » remplacent explicitement les recettes « arme maximum + passif maximum » du concept Survivors antérieur (dossier racine du dépôt).
- Pas un action-RPG : ni arbre de compétences, ni armure, ni critique en pourcentage, ni résistances élémentaires en couches.
- Pas une reproduction : aucune salle, aucun sprite, aucun son d’*Isaac* ou de *Naruto* n’est repris ; les structures de jeu sont transposées, les contenus sont créés.
