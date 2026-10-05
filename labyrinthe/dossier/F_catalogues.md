# F — Catalogues générés depuis les données du jeu

> Fichier produit par `outils/catalogues.mjs` à partir de `jeu/src/1x_donnees_*.js` (données v12, jeu 1.0.0). Ne pas l’éditer à la main : modifier les données puis relancer l’outil. Les mêmes tables existent en CSV (séparateur « ; ») et en JSON complet dans `catalogues/`.

Validation : **0 erreur(s)**, 3 avertissement(s) (identifiants, références, pools, effets implémentés, navigabilité des salles).

## Compteurs par lot

| Ensemble | Produit et jouable | Cible v1.0 (brief §44) | Bibliothèque complète (brief §35) |
|---|---|---|---|
| Personnages de base | 12 | 12 | 40 |
| Variantes altérées | 6 | 6 | 40 |
| Objets passifs | 158 | 150 | 480 |
| Objets actifs | 33 | 30 | 120 |
| Talismans | 35 | 35 | 100 |
| Consommables (rouleaux, sceaux) | 30 | 30 | 80 |
| Pilules (effets) | 15 | — | — |
| Familiers (comportements distincts) | 16 | — | — |
| Synergies documentées | 96 | 60 | 300 |
| Transformations d’ensemble | 13 | 12 | 40 |
| Thèmes d’étage | 10 | 6 | 12 |
| Variantes d’étage | 18 | 12 | 24 |
| Boss (dont mini-boss) | 24 | 25 | 70 |
| Archétypes ennemis | 75 | 60 | 140 |
| Modèles de salles | 120 | 120 | 500 |
| Objectifs de déblocage | 60 | 80 | 250 |
| Défis jouables | 12 | 30 | 80 |
| Secrets documentés | 15 | — | 60 |
| Routes et fins | 6 | — | — |

Taille des pools (objets de poids non nul) : heritage 145, boss 55, boutique 68, pacte 44, sanctuaire 27, cache 9, isolee 3, bibliotheque 39, defi 3, coffre 8, machine 6.

## Personnages et variantes — 18

| ID | Nom | Parent | Santé | Dég. | Cad. | Portée | Vit. | Tir | Actif | Règle | Déblocage |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CHR_001 | Naruto |  | 3 | 3.5 | 2.5 | 6 | 4.5 | projectile / kunai | Multi-clonage | Obstination : à la dernière demi-unité de santé, +1 dégâts jusqu’à la fin de la salle. | départ |
| CHR_002 | Sasuke |  | 3 | 3.5 | 2.5 | 6.5 | 4.6 | charge_libre / shuriken | Chidori | Foudre concentrée : le tir se charge (maintenir, relâcher). Dégâts ×0,5 à ×3 ; à pleine charge, le shuriken perce et enchaîne la foudre. | départ |
| CHR_003 | Sakura |  | 3 | 4 | 2.2 | 4.5 | 4.4 | projectile / poing | Ōkashō | Contrôle du chakra : les soins excédentaires sont stockés (6 demis au plus) et renforcent Ōkashō. Elle peut ramasser la vitalité à pleine santé. | départ |
| CHR_004 | Kakashi |  | 3 | 3.5 | 2.5 | 6.5 | 4.6 | projectile / kunai | Invocation des chiens ninja | Ninja copieur : deux emplacements d’actif (échange avec le bouton supérieur gauche). Pakkun signale les murs secrets de la salle. | OBJ_004 |
| CHR_005 | Rock Lee |  | 3 | 5 | 2.4 | 1.7 | 5.2 | lame / coup | Porte de l’Ouverture | Taijutsu pur : frappe au corps-à-corps (arc de 100°). Les coups détruisent les projectiles ennemis ordinaires. Les objets de tir sont convertis (table de conversion). | OBJ_009 |
| CHR_006 | Hinata |  | 3 | 3 | 2.6 | 4.5 | 4.5 | projectile / paume | Protection des huit trigrammes | Byakugan : le plan de l’étage et la cache de renseignements sont révélés. Ses paumes percent les ennemis. | OBJ_012 |
| CHR_007 | Shikamaru |  | 2+1p | 3.2 | 2.3 | 6 | 4.3 | projectile / kunai_ombre | Manipulation des ombres | Stratège : chaque salle d’héritage propose deux objets au choix ; ses kunai immobilisent parfois (15 % + 3 % par point de chance, 50 % au plus). | OBJ_015 |
| CHR_008 | Gaara |  | 2+2p | 3.8 | 2 | 6 | 3.7 | projectile / sable | Cercueil de sable | Bouclier de sable : absorbe le premier coup reçu dans chaque salle de combat non nettoyée ; vitesse de base réduite. | OBJ_018 |
| CHR_009 | Kankurō |  | 3 | 3.4 | 2.4 | 6.5 | 4.3 | projectile / lame_poison | Kuroari : piège | Marionnettiste : ses tirs partent de Karasu, qui flotte entre lui et la direction visée et bloque les projectiles qui le touchent. | OBJ_021 |
| CHR_010 | Kiba |  | 3 | 3.8 | 2.4 | 4 | 4.8 | projectile / griffe | Crocs sur crocs | Flair : Akamaru attaque au contact et creuse (10 % de trouver une ressource à la fin d’une salle nettoyée). | OBJ_024 |
| CHR_011 | Sasori |  | 0+3p | 3.5 | 2.5 | 6 | 4.4 | projectile / senbon | Pluie de senbon empoisonnés | Corps de marionnette : aucun contenant de vitalité. Les contenants obtenus deviennent une réserve de chakra ; la vitalité au sol est ignorée. Senbon empoisonnés (35 %). | OBJ_027 |
| CHR_012 | Kakuzu |  | 2 | 3.4 | 2.2 | 6 | 4.3 | projectile / element | Fils de Jiongu | Avarice : trois tirs élémentaires en éventail. Blessé, chaque Ryō ramassé soigne une demi-unité au lieu d’être gardé. Trois contenants au plus ; pactes payés 15 Ryō par contenant. | OBJ_030 |
| ALT_001 | Naruto — Réceptacle fissuré | CHR_001 | 1 | 3.5 | 2.5 | 6 | 4.5 | projectile / kunai | Relais | Clones comme ressource : jusqu’à 4 clones l’accompagnent et tirent (35 % des dégâts). Un coup reçu fait disparaître un clone avant la santé. Chaque salle de combat nettoyée rend un clone. | OBJ_040 |
| ALT_002 | Sasuke — Serment de vengeance | CHR_002 | 1+2i | 3.5 | 2.5 | 6 | 4.5 | charge_libre / shuriken | Chidori | Pactes spécifiques : après chaque boss, une salle de pacte s’ouvre toujours, jamais un sanctuaire. Un pacte lui coûte 3 demis de chakra instable par contenant. +0,5 dégâts par pacte conclu. | OBJ_041 |
| ALT_003 | Sakura — Sceau de la centaine | CHR_003 | 2 | 4 | 2.2 | 4.5 | 4.4 | projectile / poing | Ōkashō | Santé fragmentée : deux contenants au plus. Tout soin au-delà remplit le sceau (12 demis) qui rend automatiquement la santé quand elle tombe à la dernière demi-unité. | OBJ_042 |
| ALT_004 | Gaara — Shukaku déchaîné | CHR_008 | 1+3p | 3.8 | 2 | 6 | 3.5 | projectile / sable | Cercueil de sable | Tirs différés : le sable s’arrête à mi-course et reste suspendu (12 grains au plus). Relâcher la visée fait converger tous les grains vers la dernière direction. | OBJ_043 |
| ALT_005 | Kankurō — Trois marionnettes | CHR_009 | 3 | 3.4 | 2.4 | 6.5 | 4.3 | projectile / lame_poison | Kuroari : piège | Marionnettes échangeables (bouton supérieur gauche) : Karasu (éventail de lames), Kuroari (orbe lent qui immobilise), Sanshōuo (bouclier frontal, tir faible). | OBJ_044 |
| ALT_006 | Kakuzu — Cinq cœurs | CHR_012 | 1 | 3.4 | 2.2 | 6 | 4.3 | projectile / element | Fils de Jiongu | Inventaire reconstruit : à chaque nouvel étage, un passif au hasard est remplacé par un autre de même qualité. Quatre cœurs de réserve : à la mort, il se relève avec un contenant et en perd un. | OBJ_045 |

## Objets passifs (PSV) — 158

| ID | Nom | Famille | Q | Pools (poids) | Effet | Cumul | Ensemble | Statut | Déblocage |
|---|---|---|---|---|---|---|---|---|---|
| PSV_001 | Empreinte du Rasengan | projectile | 3 | heritage 3, boss 1 | Tir chargé : une sphère de chakra qui comprime sa cible. | unique | renard | adaptation | — |
| PSV_002 | Encre de dédoublement | projectile | 2 | heritage 3, boutique 1 | Chaque tir se dédouble, un peu moins fort. | cumul |  | création originale | — |
| PSV_003 | Éventail de kunai | projectile | 2 | heritage 2, boutique 1, coffre 1 | Trois kunai en éventail. | cumul |  | création originale | — |
| PSV_004 | Parchemin des mille aiguilles | projectile | 3 | heritage 2, boss 1 | Quatre senbon partent à chaque tir. | cumul |  | création originale | — |
| PSV_005 | Kunai à marque de téléportation | projectile | 2 | heritage 2, bibliotheque 1 | Les tirs suivent légèrement leur cible. | cumul |  | adaptation | — |
| PSV_006 | Insectes traqueurs | projectile | 3 | heritage 2, boss 1 | Les tirs deviennent des insectes qui poursuivent les ennemis. | cumul | essaim | adaptation | — |
| PSV_007 | Fil de chakra | projectile | 1 | heritage 2, boutique 1, coffre 1 | Les tirs ricochent sur les murs et les obstacles. | cumul |  | création originale | OBJ_006 |
| PSV_008 | Senbon perforant | projectile | 2 | heritage 2, boutique 1 | Les tirs traversent les ennemis. | cumul |  | création originale | — |
| PSV_009 | Parchemin fantôme | projectile | 1 | heritage 2, bibliotheque 1 | Les tirs passent au-dessus des obstacles. | cumul |  | création originale | — |
| PSV_010 | Sable en orbite | projectile | 2 | heritage 2, bibliotheque 1 | Les tirs tournent autour de vous avant de se disperser. | cumul | sable | adaptation | — |
| PSV_011 | Onde de la vague | projectile | 1 | heritage 2, boutique 1 | Les tirs ondulent : couverture plus large, précision moindre. | cumul |  | création originale | — |
| PSV_012 | Baika (expansion) | projectile | 3 | heritage 2, boss 1 | Des tirs énormes et lents, deux fois plus forts. | cumul |  | adaptation | — |
| PSV_013 | Fūma shuriken | projectile | 3 | heritage 2, boss 1 | Lance un grand shuriken qui revient dans la main. | unique |  | adaptation | OBJ_002 |
| PSV_014 | Canon de chakra | projectile | 4 | pacte 2, heritage 1 | Charge un rayon rougeoyant qui traverse tout. | unique | renard | création originale | OBJ_029 |
| PSV_015 | Trait de chakra | projectile | 3 | heritage 2, boss 1 | Chaque tir devient un trait instantané. | unique |  | création originale | — |
| PSV_016 | Souffle continu | projectile | 3 | heritage 1, boss 1 | Maintenir la visée émet un faisceau continu. | unique |  | création originale | — |
| PSV_017 | Empreinte du Kubikiribōchō | projectile | 3 | heritage 1, boss 1, pacte 1 | Un grand sabre balaie devant vous. | unique |  | adaptation | OBJ_004 |
| PSV_018 | Tantō de l’ANBU | projectile | 2 | heritage 2, boutique 1 | Frappe courte au sabre : puissante mais exposée. | unique |  | adaptation | — |
| PSV_019 | Argile explosive C1 | projectile | 3 | pacte 1, heritage 1, boss 1 | Lance des bombes d’argile ; attention au souffle. Contrepartie : Les explosions peuvent vous blesser. | unique | argile | adaptation | OBJ_019 |
| PSV_020 | Chute céleste | projectile | 4 | pacte 2, boss 1 | Visez un point : une météorite s’y écrase. | unique |  | création originale d’après une technique célèbre (attribution à vérifier) | OBJ_028 ou OBJ_049 |
| PSV_021 | Sphère téléguidée | projectile | 3 | heritage 1, boss 1, bibliotheque 1 | Une seule sphère, guidée par la visée. | unique |  | adaptation | — |
| PSV_022 | Rotation céleste | projectile | 3 | heritage 1, sanctuaire 1 | Tournoyer détruit les tirs proches et blesse autour. | unique | yeux | adaptation (Hyūga) | — |
| PSV_023 | Clone de relais | familier | 3 | heritage 2, boss 1 | Un clone copie vos tirs (75 %). | cumul |  | adaptation | OBJ_056 |
| PSV_024 | Arsenal de Tenten (empreinte) | projectile | 2 | heritage 2, boutique 1, bibliotheque 1 | Chaque tir est suivi de deux autres (salve). | cumul |  | adaptation | — |
| PSV_025 | Œil arrière | projectile | 1 | heritage 2, boutique 1 | Tire aussi vers l’arrière. | cumul | yeux | création originale | — |
| PSV_026 | Croix de sceaux | projectile | 2 | heritage 2, bibliotheque 1 | Parfois, tire dans les quatre directions (20 % + 5 % par chance, 60 % au plus). | cumul |  | création originale | OBJ_001 |
| PSV_027 | Parchemins-pièges | projectile | 2 | heritage 2, boutique 1 | Au bout de leur course, les tirs deviennent des mines. | cumul |  | création originale | OBJ_001 |
| PSV_028 | Chidori nagashi (empreinte) | element | 3 | heritage 2, boss 1 | La foudre saute de la cible à deux ennemis proches. | cumul | tonnerre | adaptation | — |
| PSV_029 | Poing de Doton | projectile | 2 | heritage 2, boutique 1 | Chaque impact libère une petite onde de choc. | cumul |  | création originale | OBJ_008 |
| PSV_030 | Shuriken démultiplié | projectile | 2 | heritage 2, coffre 1 | Les tirs éclatent en quatre éclats à l’impact. | cumul |  | création originale | — |
| PSV_031 | Kunai du vent | projectile | 1 | heritage 2, boutique 1 | Les tirs accélèrent en vol. | cumul | renard | création originale | — |
| PSV_032 | Poids de plomb | projectile | 1 | heritage 2, boutique 1 | Des tirs lourds qui repoussent fort. | cumul | portes | création originale | — |
| PSV_033 | Senbon de précision | projectile | 1 | heritage 2, boutique 2 | Plus loin, plus vite. | cumul |  | adaptation | — |
| PSV_034 | Kunai lestés | projectile | 2 | heritage 3, boutique 1, coffre 1 | Des lames plus lourdes. | cumul |  | création originale | — |
| PSV_035 | Sandales de course | projectile | 1 | heritage 2, boutique 2 | Vous vous déplacez plus vite. | cumul |  | création originale | — |
| PSV_036 | Pilule du soldat (empreinte) | projectile | 2 | heritage 2, boutique 1, boss 1 | Cadence de tir augmentée. | cumul |  | adaptation | — |
| PSV_037 | Lunettes de visée | projectile | 1 | heritage 2, boutique 2 | Portée et vitesse des tirs accrues. | cumul |  | création originale | — |
| PSV_038 | Bandeau de Konoha | projectile | 2 | heritage 2, boss 2 | Un peu de tout : dégâts, cadence, portée, vitesse, chance. | cumul |  | canon adapté | — |
| PSV_039 | Masque de l’ANBU | projectile | 1 | heritage 2, boutique 1, cache 1 | Dégâts et chance. | cumul |  | adaptation | — |
| PSV_040 | Gants de taijutsu | projectile | 2 | heritage 2, boutique 1 | Dégâts +0,7 ; les frappes de mêlée gagnent en portée. | cumul | portes | création originale | OBJ_051 |
| PSV_041 | Cadence de la fleur de lotus | projectile | 2 | heritage 2, boutique 1 | Cadence très élevée, portée réduite. Contrepartie : Portée −2. | cumul | portes | création originale | — |
| PSV_042 | Pointe de précision | projectile | 2 | heritage 1, boutique 1, bibliotheque 1 | Les tirs grossissent : touchent mieux, plus lents. | cumul |  | création originale | — |
| PSV_043 | Grande boule de feu (empreinte) | element | 2 | heritage 2, boutique 1, boss 1 | Tirs de feu : 25 % de brûlure (+5 % par chance, 70 % au plus). | cumul |  | adaptation | — |
| PSV_044 | Chakra de l’eau | element | 1 | heritage 2, boutique 1 | Tirs d’eau : ralentissent (30 %), laissent de petites flaques. | cumul |  | création originale | — |
| PSV_045 | Courant foudroyant | element | 2 | heritage 2, boutique 1 | Tirs de foudre : 15 % d’immobiliser 0,3 s. | cumul | tonnerre | création originale | — |
| PSV_046 | Lame de vent | element | 2 | heritage 2, boutique 1 | Tirs de vent : perçants, portée accrue. | cumul | renard | création originale | — |
| PSV_047 | Poing de terre | element | 1 | heritage 2, boutique 1 | Recul énorme, dégâts +0,7. | cumul |  | création originale | — |
| PSV_048 | Poison de scorpion | element | 2 | heritage 2, boutique 1, cache 1 | 30 % d’empoisonner (+5 % par chance). | cumul | marionnette | création originale | — |
| PSV_049 | Genjutsu du regard | element | 2 | heritage 2, bibliotheque 1 | 15 % de plonger l’ennemi dans la confusion. | cumul | yeux | création originale | — |
| PSV_050 | Glace éternelle | element | 3 | heritage 1, boss 1, bibliotheque 1 | Gèle (15 %) ; un ennemi tué gelé éclate en six éclats. | cumul |  | adaptation | OBJ_005 |
| PSV_051 | Ombre liante | element | 2 | heritage 2, bibliotheque 1 | 12 % d’immobiliser 1,2 s (+3 % par chance). | cumul |  | adaptation | OBJ_015 |
| PSV_052 | Encre des bêtes | element | 2 | heritage 2, bibliotheque 1 | Tirs d’encre : 12 % de charmer 3 s. | cumul |  | adaptation | — |
| PSV_053 | Flammes noires | element | 4 | pacte 2 | Les brûlures durent trois fois plus et font 50 % de plus ; 20 % de brûler. | cumul | yeux | adaptation (attribution à vérifier) | OBJ_020 |
| PSV_054 | Marque de Jashin | contrepartie | 2 | pacte 2 | Quand vous êtes blessé, tous les ennemis subissent 15 dégâts. | cumul | interdit | adaptation | OBJ_016 |
| PSV_055 | Chakra du renard | element | 3 | heritage 1, boss 2, pacte 1 | Dégâts +1, vitesse +0,2 ; une queue de chakra apparaît. | cumul | renard | adaptation | — |
| PSV_056 | Bulle de chakra rouge | element | 3 | heritage 1, boss 1, pacte 1 | Blessé, vous libérez huit tirs de chakra. | cumul | renard | création originale | — |
| PSV_057 | Crapaud d’huile | element | 2 | heritage 1, bibliotheque 1, sanctuaire 1 | Les tirs laissent parfois de l’huile qui s’embrase au feu. | cumul | ermite | création originale | — |
| PSV_058 | Armure de foudre | element | 3 | heritage 1, boss 1 | Vitesse +0,5, cadence +0,3. | cumul | tonnerre | adaptation | — |
| PSV_059 | Racines du bois | element | 3 | heritage 1, boss 1, sanctuaire 1 | Les tirs font parfois jaillir des racines qui immobilisent (15 %). | cumul |  | adaptation (Mokuton) | — |
| PSV_060 | Os de l’ossature | element | 3 | heritage 1, boss 1, pacte 1 | Tirs d’os : perçants, un ricochet. | cumul | experimental | adaptation | OBJ_010 |
| PSV_061 | Clone de l’ombre | familier | 2 | heritage 2, boutique 1 | Un clone vous suit et tire des kunai. | cumul | meute | adaptation | — |
| PSV_062 | Gamakichi | familier | 2 | heritage 2, sanctuaire 1 | Un petit crapaud qui crache des bulles ralentissantes. | cumul | meute | canon adapté | — |
| PSV_063 | Katsuyu miniature | familier | 2 | heritage 2, sanctuaire 2 | Toutes les 5 salles nettoyées, une limace apporte un cœur. | cumul | meute | canon adapté | — |
| PSV_064 | Serpent des manches | familier | 2 | heritage 1, pacte 1 | Un serpent tourne autour de vous et mord. | cumul | experimental | adaptation | OBJ_003 |
| PSV_065 | Sable protecteur | familier | 2 | heritage 2, boss 1 | Deux orbitaux de sable bloquent les tirs ennemis. | cumul | sable | adaptation | — |
| PSV_066 | Kunai tournoyants | familier | 1 | heritage 2, boutique 1 | Trois kunai tournent autour de vous (ne bloquent pas). | cumul |  | création originale | — |
| PSV_067 | Corbeau messager | familier | 2 | heritage 1, bibliotheque 1, pacte 1 | Un corbeau aveugle les ennemis (confusion). | cumul | yeux | adaptation | — |
| PSV_068 | Pakkun | familier | 1 | heritage 2, boutique 1, bibliotheque 1 | Un chien ninja flaire les murs secrets. | cumul | meute | canon adapté | — |
| PSV_069 | Petit chien de chasse | familier | 2 | heritage 2, boutique 1 | Un chien fonce dans la direction de tir. | cumul | meute | création originale | — |
| PSV_070 | Kikaichū | familier | 2 | heritage 2, bibliotheque 1 | Un essaim ramasse les pièces et pique les ennemis. | cumul | essaim | canon adapté | — |
| PSV_071 | Oiseau d’argile | familier | 3 | heritage 1, boss 1, pacte 1 | Plonge sur un ennemi et explose toutes les 4 s. | cumul | argile | adaptation | OBJ_019 |
| PSV_072 | Karasu | familier | 2 | heritage 1, boss 1 | Une marionnette attaque au plus près. | cumul | marionnette | canon adapté | OBJ_007 |
| PSV_073 | Kuroari | familier | 2 | heritage 1, bibliotheque 1 | Une marionnette-piège capture un ennemi toutes les 8 s. | cumul | marionnette | canon adapté | OBJ_007 |
| PSV_074 | Sanshōuo | familier | 2 | heritage 1, sanctuaire 1 | Une marionnette-bouclier bloque les tirs devant vous. | cumul | marionnette | canon adapté | OBJ_007 |
| PSV_075 | Papillons de papier | familier | 2 | heritage 1, sanctuaire 1 | Quatre papillons tournent, bloquent et coupent. | cumul | papier | adaptation | — |
| PSV_076 | Tigres d’encre | familier | 2 | heritage 1, bibliotheque 1 | Deux fauves d’encre chassent vos ennemis. | cumul | meute | adaptation | — |
| PSV_077 | Clone de sable | familier | 3 | heritage 1, boss 1 | Un clone de sable copie vos tirs (60 %). | cumul | sable | création originale | — |
| PSV_078 | Serpent blanc | familier | 1 | heritage 2, pacte 1 | Un serpent albinos mord l’ennemi le plus proche. | cumul | experimental | création originale | OBJ_003 |
| PSV_079 | Luciole des ermites | familier | 1 | heritage 1, sanctuaire 2 | Une luciole éclaire la pénombre ; chance +1. | cumul | ermite | création originale | OBJ_052 |
| PSV_080 | Poupée d’entraînement | familier | 1 | heritage 1, boutique 1 | Une poupée attire l’attention des ennemis. | cumul |  | création originale | — |
| PSV_081 | Miroirs de glace | familier | 3 | heritage 1, boss 1 | Deux miroirs orbitaux renvoient les tirs ennemis. | cumul |  | adaptation | OBJ_005 |
| PSV_082 | Crapaud messager | familier | 1 | heritage 1, sanctuaire 1, bibliotheque 1 | Toutes les 6 salles nettoyées, un crapaud rapporte une clé. | cumul | ermite | création originale | — |
| PSV_083 | Bol de ramen d’Ichiraku | sante | 1 | heritage 1, boss 2, boutique 1 | Un contenant de vitalité et un soin complet. | cumul |  | canon adapté | — |
| PSV_084 | Onigiri | sante | 0 | heritage 1, boutique 2, boss 1 | Un contenant de vitalité. | cumul |  | création originale | — |
| PSV_085 | Dango | sante | 1 | heritage 1, boutique 2 | Un contenant de vitalité et un cœur de soin. | cumul |  | création originale | — |
| PSV_086 | Pilule écarlate | sante | 2 | heritage 1, pacte 1, boss 1 | Dégâts +1 et un contenant, mais un peu plus lent. Contrepartie : Vitesse −0,2. | cumul |  | création originale | — |
| PSV_087 | Sceau de régénération | sante | 3 | sanctuaire 2, boss 1 | Toutes les 3 salles nettoyées, soigne une demi-unité. | cumul |  | adaptation (Byakugō, attribution à vérifier) | OBJ_013 |
| PSV_088 | Cape de chakra protecteur | sante | 1 | sanctuaire 2, boutique 1, heritage 1 | Deux réserves de chakra protecteur. | cumul |  | création originale | — |
| PSV_089 | Cœur volé | sante | 3 | pacte 1, isolee 1, boss 1 | À votre mort, vous vous relevez avec un contenant (l’objet est consommé). | cumul |  | adaptation | OBJ_022 |
| PSV_090 | Ossature renforcée | sante | 2 | heritage 1, pacte 1 | Deux enveloppes osseuses. | cumul | experimental | adaptation | OBJ_010 |
| PSV_091 | Sceau maudit | contrepartie | 3 | pacte 3 | Deux réserves instables, dégâts +0,5 ; les pactes deviennent plus fréquents (+20 %). | cumul | interdit | adaptation | OBJ_032 |
| PSV_092 | Porte de la Vie | contrepartie | 3 | pacte 1, boss 1, defi 1 | Dégâts +1,5, cadence +0,4, mais un contenant en moins. Contrepartie : −1 contenant de vitalité. | cumul | portes | adaptation (Huit Portes) | OBJ_051 |
| PSV_093 | Chakra de la limace | sante | 2 | sanctuaire 2, heritage 1 | Les cœurs soignent deux fois plus. | cumul | ermite | création originale | — |
| PSV_094 | Trousse de terrain | sante | 1 | heritage 2, boutique 1 | Un contenant ; les cœurs lâchés sont parfois doublés. | cumul |  | création originale | — |
| PSV_095 | Sceau vital de la famille | sante | 2 | sanctuaire 1, heritage 1 | Un sceau vital partiel, puis un nouveau à chaque étage. | cumul |  | création originale | — |
| PSV_096 | Substitution instinctive | sante | 3 | heritage 1, sanctuaire 1 | 15 % + 3 % par chance d’esquiver un coup par une bûche (50 % au plus). | cumul |  | adaptation (Kawarimi) | OBJ_054 |
| PSV_097 | Armure de sable absolue | sante | 4 | boss 1, sanctuaire 1 | Les coups d’un cœur entier ne retirent qu’une demi-unité. Contrepartie : Vitesse −0,3. | cumul | sable | adaptation | OBJ_009 |
| PSV_098 | Chakra du démon scellé | contrepartie | 3 | pacte 2 | Trois réserves instables, mais un contenant en moins. Contrepartie : −1 contenant. | cumul | interdit | création originale | OBJ_058 |
| PSV_099 | Sac de parchemins | ressource | 1 | heritage 1, boutique 2, coffre 1 | Cinq parchemins explosifs. | cumul |  | création originale | — |
| PSV_100 | Parchemins à fragmentation | ressource | 2 | heritage 1, boutique 1 | Vos explosions projettent quatre kunai. | cumul |  | création originale | OBJ_055 |
| PSV_101 | Mèche longue | ressource | 1 | boutique 2, heritage 1 | Explosions plus larges, mèche plus longue. Contrepartie : Délai +0,5 s. | cumul |  | création originale | — |
| PSV_102 | Parchemins incendiaires | ressource | 2 | heritage 1, boutique 1 | Vos explosions laissent des flammes (alliées). | cumul |  | création originale | OBJ_055 |
| PSV_103 | Parchemins chercheurs | ressource | 2 | heritage 1, boutique 1 | Vos explosifs posés glissent vers les ennemis. | cumul |  | création originale | OBJ_055 |
| PSV_104 | Grand parchemin | ressource | 2 | heritage 1, boutique 1, coffre 1 | Explosions 50 % plus larges, +10 dégâts. | cumul |  | création originale | — |
| PSV_105 | Trousseau du geôlier | ressource | 1 | heritage 1, boutique 1, coffre 1 | Trois clés de sceau. | cumul |  | création originale | — |
| PSV_106 | Épingle de crochetage | ressource | 3 | cache 1, coffre 1, boutique 1 | Portes et coffres verrouillés s’ouvrent sans clé. | cumul |  | création originale | OBJ_033 |
| PSV_107 | Bourse-grenouille | ressource | 1 | heritage 1, boutique 1, machine 1 | +10 Ryō ; 20 % des Ryō ramassés comptent double. | cumul |  | canon adapté | — |
| PSV_108 | Aimant de chakra | ressource | 1 | boutique 2, heritage 1 | Attire Ryō, clés, explosifs et cœurs. | cumul |  | création originale | — |
| PSV_109 | Parchemin d’invocation vide | ressource | 1 | heritage 1, bibliotheque 1 | Un rouleau tactique à chaque nouvel étage. | cumul |  | création originale | OBJ_053 |
| PSV_110 | Argile infinie | ressource | 3 | pacte 1, boss 1, cache 1 | Dix explosifs ; vos explosions ne vous blessent plus. | cumul | argile | création originale | OBJ_019 |
| PSV_111 | Carte du labyrinthe | exploration | 1 | boutique 2, heritage 1, bibliotheque 1 | Révèle le plan de chaque étage (hors secrets). | cumul |  | création originale | — |
| PSV_112 | Boussole du sceau | exploration | 1 | boutique 2, heritage 1, bibliotheque 1 | Révèle l’emplacement des salles spéciales. | cumul |  | création originale | — |
| PSV_113 | Byakugan (empreinte) | exploration | 2 | heritage 1, bibliotheque 1, cache 1 | Voit tout l’étage, secrets compris. | cumul | yeux | adaptation | OBJ_012 |
| PSV_114 | Rouleau des voies secrètes | exploration | 2 | bibliotheque 2, cache 1 | Les murs secrets montrent une fissure. | cumul |  | création originale | OBJ_033 |
| PSV_115 | Lévitation de chakra | exploration | 3 | sanctuaire 2, boss 1 | Vous survolez fosses et pièges au sol. | cumul |  | création originale | OBJ_026 |
| PSV_116 | Ailes de papier | exploration | 3 | sanctuaire 1, pacte 1, boss 1 | Des ailes de papier : lévitation. | cumul | papier | adaptation | — |
| PSV_117 | Détecteur de pièges | exploration | 1 | boutique 2, heritage 1 | Immunité aux pics, flaques et sables mouvants. | cumul |  | création originale | — |
| PSV_118 | Grelot de l’examen | exploration | 1 | heritage 1, defi 2 | Les salles d’épreuve révèlent leur récompense ; chance +1. | cumul |  | création originale | — |
| PSV_119 | Sac à double fond | exploration | 2 | boutique 1, heritage 1 | Deux poches pour les consommables. | cumul |  | création originale | — |
| PSV_120 | Collier à deux charmes | exploration | 2 | boutique 1, cache 1 | Deux emplacements de talisman. | cumul |  | création originale | OBJ_031 |
| PSV_121 | Carte de membre de l’échoppe | economie | 3 | boutique 1, isolee 1 | Tous les prix de l’échoppe sont divisés par deux. | cumul |  | création originale | OBJ_030 |
| PSV_122 | Coupon du marchand | economie | 2 | boutique 1, machine 1 | Le premier achat de chaque étage est gratuit. | cumul |  | création originale | OBJ_035 |
| PSV_123 | Livret d’épargne | economie | 1 | boutique 1, machine 1 | À chaque étage, +10 % de vos Ryō (10 au plus). | cumul |  | création originale | OBJ_036 |
| PSV_124 | Réputation de client | economie | 2 | boutique 1 | Un étal d’objet supplémentaire dans chaque échoppe. | cumul |  | création originale | OBJ_035 |
| PSV_125 | Dés de la grande perdante | economie | 1 | machine 2, boutique 1 | Chance −1, mais les machines de loterie paient double. Contrepartie : Chance −1. | cumul |  | adaptation (surnom canonique) | OBJ_057 |
| PSV_126 | Livre de l’ermite | economie | 3 | bibliotheque 2, sanctuaire 1 | Les salles d’héritage proposent un second objet (choix). | cumul |  | création originale | OBJ_031 |
| PSV_127 | Sceau de réécriture | economie | 2 | bibliotheque 1, boutique 1 | Une relance ne peut plus donner un objet de qualité inférieure. | cumul |  | création originale | — |
| PSV_128 | Tampon du marchand | economie | 1 | boutique 1, machine 1 | Ramasser des Ryō donne parfois un rouleau (5 %). | cumul |  | création originale | — |
| PSV_129 | Contrat de Kakuzu | economie | 2 | pacte 1, machine 1 | Les pactes se paient en Ryō (20 par contenant) si vous les avez. | cumul | interdit | adaptation | OBJ_022 |
| PSV_130 | Bourse de l’organisation | economie | 1 | pacte 1, boutique 1 | +15 Ryō. | cumul |  | création originale | — |
| PSV_131 | Sceau de la mort (empreinte) | contrepartie | 4 | pacte 1 | Dégâts ×2, mais deux contenants en moins. Contrepartie : −2 contenants. | cumul | interdit | adaptation (attribution à vérifier) | OBJ_039 |
| PSV_132 | Rage du réceptacle | contrepartie | 2 | heritage 1, pacte 1 | Chaque blessure : +0,8 dégâts pour la salle (3 fois au plus). | cumul | renard | création originale | — |
| PSV_133 | Volonté du feu | contrepartie | 2 | heritage 1, sanctuaire 1 | Avec deux demi-unités ou moins, dégâts +2. | cumul |  | création originale | — |
| PSV_134 | Colère de la Racine | contrepartie | 2 | pacte 1, heritage 1 | Les ennemis tués lâchent parfois un demi-chakra instable (5 %). | cumul |  | création originale | — |
| PSV_135 | Rituel du sang | contrepartie | 2 | pacte 2 | Chaque tribut volontaire donne +0,25 dégâts permanents. | cumul | interdit | création originale | OBJ_016 |
| PSV_136 | Écailles de Samehada | contrepartie | 3 | heritage 1, boss 1, pacte 1 | Toutes les 12 éliminations, soigne une demi-unité ; dégâts +0,5. | cumul |  | adaptation | OBJ_014 |
| PSV_137 | Cadence frénétique | contrepartie | 2 | heritage 1, pacte 1 | Cadence ×1,4, dégâts −10 %. Contrepartie : Dégâts −10 %. | cumul |  | création originale | — |
| PSV_138 | Silence de la brume | contrepartie | 2 | heritage 1, cache 1 | En entrant dans une salle, les ennemis vous perdent de vue 2 s. | cumul |  | création originale | — |
| PSV_139 | Transfert du pacte | contrepartie | 2 | pacte 1 | Chaque pacte conclu : +1 dégât permanent. | cumul | interdit | création originale | OBJ_032 |
| PSV_140 | Réincarnation impure (empreinte) | contrepartie | 3 | pacte 2 | 10 % des ennemis tués reviennent comme alliés 10 s. | cumul | experimental | adaptation (attribution à vérifier) | OBJ_047 |
| PSV_141 | Cœur du réceptacle | contrepartie | 2 | boss 2 | Chaque boss vaincu donne un contenant de vitalité. | cumul |  | création originale | — |
| PSV_142 | Main du scorpion | contrepartie | 1 | heritage 1, pacte 1 | Le poison dure deux fois plus ; 10 % d’empoisonner. | cumul | marionnette | création originale | OBJ_011 |
| PSV_143 | Mue du serpent | contrepartie | 3 | pacte 1, boss 1 | Une fois par étage, quand votre dernière réserve de chakra se brise, vous gagnez une réserve. | cumul | experimental | création originale | OBJ_017 |
| PSV_144 | Nature du sage | hybride | 3 | sanctuaire 1, bibliotheque 1 | Immobile une seconde, vous accumulez l’énergie naturelle : dégâts ×1,5 jusqu’au prochain pas. | cumul | ermite | création originale | OBJ_046 |
| PSV_145 | Pluie d’armes | hybride | 3 | heritage 1, bibliotheque 1, boss 1 | Tous les 5 cycles de tir, huit armes tombent du ciel sur les ennemis. | cumul |  | adaptation | OBJ_038 |
| PSV_146 | Rasenshuriken (empreinte) | hybride | 4 | boss 1, heritage 1 | Vos orbes et charges explosent en tourbillon de vent. | cumul | renard | adaptation | OBJ_034 ou OBJ_060 |
| PSV_147 | Lance de foudre | hybride | 3 | heritage 1, boss 1 | Un trait de foudre accompagne chaque tir (×0,5). | cumul | tonnerre | adaptation | — |
| PSV_148 | Double dragon | hybride | 3 | heritage 1, bibliotheque 1 | Tir multiple et guidage léger réunis. | cumul |  | création originale | — |
| PSV_149 | Explosion de chakra | hybride | 3 | heritage 1, pacte 1 | Les tirs explosent à l’impact (souffle léger, ne vous blesse pas). | cumul | argile | création originale | — |
| PSV_150 | Tempête de sable | hybride | 3 | heritage 1, boss 1 | Tirs de sable qui ralentissent et tournent. | cumul | sable | création originale | OBJ_059 |
| PSV_151 | Chakra partagé | hybride | 2 | sanctuaire 1, heritage 1 | Vos familiers infligent 25 % de plus. | cumul | meute | création originale | — |
| PSV_152 | Encre vivante | hybride | 2 | bibliotheque 1, heritage 1 | Les ennemis tués laissent parfois un fauve d’encre pour la salle (10 %). | cumul |  | création originale | OBJ_034 |
| PSV_153 | Ruche de chakra | familier | 2 | heritage 1, bibliotheque 1 | À chaque élimination, l’essaim bourdonne : les ennemis à moins de 2 tuiles de vous sont empoisonnés. | cumul | essaim | adaptation (clan Aburame) | — |
| PSV_154 | Voile d’insectes | sante | 2 | heritage 1, sanctuaire 1 | Blessé, un nuage d’insectes ralentit les ennemis dans un rayon de 3 tuiles pendant 2 s. | cumul | essaim | adaptation (clan Aburame) | — |
| PSV_155 | Shuriken de papier | projectile | 2 | heritage 2, boutique 1 | Tirs de papier tranchant : dégâts +0,3, portée +1. | cumul | papier | adaptation | — |
| PSV_156 | Mer de papiers explosifs | ressource | 3 | pacte 1, boss 1 | Vos explosifs éclatent deux fois (la seconde, 0,4 s plus tard, à moitié de puissance) ; deux explosifs. Contrepartie : La seconde explosion blesse aussi (sauf immunité). | cumul | papier | adaptation | — |
| PSV_900 | Clé des ermites | exploration | 0 |  | Objet-clé : ouvre le rayon de la Lumière même après un pacte. | unique |  | création originale | — |
| PSV_901 | Fragment de la clé des ermites | exploration | 0 |  | Objet-clé : un second fragment formera la clé. | conversion |  | création originale | — |

## Objets actifs — techniques scellées (ACT) — 33

| ID | Nom | Q | Pools (poids) | Recharge | Effet | Statut | Déblocage |
|---|---|---|---|---|---|---|---|
| ACT_001 | Réécriture d’empreinte | 3 | heritage 1, boutique 1, bibliotheque 1 | 6 charge(s) | Relance les objets sur piédestal de la salle, chacun depuis son pool. | création originale | — |
| ACT_002 | Multi-clonage | 2 | heritage 1, boutique 1 | 4 charge(s) | Deux clones copient vos tirs pour la salle (50 %) et disparaissent au premier coup. | adaptation | — |
| ACT_003 | Chidori | 3 | heritage 1, boss 1 | 3 charge(s) | Fonce en ligne droite : 6× dégâts aux ennemis traversés, invulnérable pendant l’élan. | adaptation | — |
| ACT_004 | Ōkashō | 2 | heritage 1 | 3 charge(s) | Frappe le sol : 12 dégâts + 4 par point de force stocké, brise rochers et murs fissurés proches. | adaptation | — |
| ACT_006 | Invocation des chiens ninja | 2 | heritage 1, bibliotheque 1 | 3 charge(s) | Des chiens surgissent et immobilisent tous les ennemis 3 s (boss : réduit). | adaptation | — |
| ACT_007 | Porte de l’Ouverture | 2 | heritage 1, boss 1 | 3 charge(s) | 8 s : dégâts ×1,5, vitesse +1, cadence ×1,3. | adaptation (Huit Portes) | — |
| ACT_008 | Protection des huit trigrammes | 3 | heritage 1, sanctuaire 1 | 2 charge(s) | Rotation de 1,2 s : détruit les tirs proches, repousse et blesse (6× dégâts au total). | adaptation (Hyūga) | — |
| ACT_009 | Manipulation des ombres | 2 | heritage 1, bibliotheque 1 | 3 charge(s) | Immobilise les trois ennemis les plus proches pendant 4 s (boss : 1,4 s). | adaptation | — |
| ACT_010 | Cercueil de sable | 3 | heritage 1, boss 1 | 3 charge(s) | Le sable écrase l’ennemi le plus proche : 10× dégâts (6× contre un boss). | adaptation | — |
| ACT_011 | Kuroari : piège | 2 | heritage 1, bibliotheque 1 | 3 charge(s) | Enferme l’ennemi non-boss le plus proche puis le transperce (8×). | adaptation | — |
| ACT_012 | Crocs sur crocs | 2 | heritage 1, boutique 1 | 3 charge(s) | Deux passes en vrille à travers la salle : 5× dégâts à chaque contact, invulnérable. | adaptation | — |
| ACT_013 | Pluie de senbon empoisonnés | 2 | heritage 1, pacte 1 | 2 charge(s) | Seize senbon empoisonnés partent en cercle. | création originale | — |
| ACT_014 | Fils de Jiongu | 2 | heritage 1, pacte 1 | 2 charge(s) | Attire tous les ramassables de la salle et lacère les ennemis proches (3×). | adaptation | — |
| ACT_015 | Parchemin de substitution | 2 | heritage 1, boutique 1, sanctuaire 1 | 2 charge(s) | Une bûche prend votre place : 3 s d’invisibilité, les ennemis frappent la bûche. | adaptation (Kawarimi) | — |
| ACT_016 | Invocation : grand crapaud | 4 | sanctuaire 1, boss 1, pacte 1 | 6 charge(s) | Un crapaud géant atterrit : 40 dégâts à tous les ennemis (25 aux boss), obstacles pulvérisés. | adaptation | OBJ_026 |
| ACT_017 | Amaterasu (empreinte) | 3 | pacte 2 | 4 charge(s) | Flammes noires sur tous les ennemis de la salle. | adaptation (attribution à vérifier) | OBJ_020 |
| ACT_018 | Tsukuyomi (empreinte) | 4 | pacte 1, boss 1 | 6 charge(s) | Le temps s’arrête pour vos ennemis et leurs tirs pendant 4 s (boss : 1,5 s). | adaptation (attribution à vérifier) | OBJ_020 |
| ACT_019 | Répulsion divine | 3 | pacte 1, boss 1 | 3 charge(s) | Repousse tous les ennemis, détruit tous leurs tirs, 3× dégâts. | adaptation | OBJ_023 |
| ACT_020 | Attraction céleste | 3 | pacte 1, boss 1 | 4 charge(s) | Attire les ennemis au centre puis les écrase (5×). | adaptation | OBJ_023 |
| ACT_021 | Espace-temps intangible | 3 | pacte 1, isolee 1 | 4 charge(s) | 3 s intangible : ennemis et tirs vous traversent (pas les murs) ; vous ne pouvez pas tirer. | adaptation | OBJ_025 ou OBJ_047 |
| ACT_022 | Pilule du soldat | 1 | boutique 2, heritage 1 | 1 charge(s) | Pour la salle : cadence +1. | adaptation | — |
| ACT_023 | Parchemin de téléportation | 1 | boutique 1, heritage 1 | 2 charge(s) | Vous téléporte dans une salle déjà visitée. | création originale | — |
| ACT_024 | Rasenshuriken | 4 | boss 1, heritage 1 | 4 charge(s) | Un immense shuriken de vent traverse tout et explose (15× autour). | adaptation | OBJ_037 |
| ACT_025 | Dragons de feu | 3 | heritage 1, boss 1 | 3 charge(s) | Quatre dragons de feu chercheurs (4×, brûlure). | création originale | OBJ_038 |
| ACT_026 | Forêt naissante | 3 | sanctuaire 1, boss 1 | 4 charge(s) | Des racines jaillissent sous chaque ennemi : immobilisation 2,5 s et dégâts répétés. | adaptation (Mokuton) | OBJ_028 |
| ACT_027 | Sceau de scellement | 4 | bibliotheque 1, sanctuaire 1 | 6 charge(s) | Scelle l’ennemi le plus proche (boss : 15 % de ses PV). | création originale | OBJ_037 ou OBJ_046 |
| ACT_028 | Invocation inversée | 2 | bibliotheque 1, heritage 1 | 3 charge(s) | Invoque un familier au hasard pour tout l’étage. | création originale | — |
| ACT_029 | Transfert d’esprit | 3 | bibliotheque 1, heritage 1 | 3 charge(s) | L’ennemi non-boss le plus proche combat pour vous jusqu’à sa mort. | adaptation | OBJ_039 |
| ACT_030 | Lotus primaire | 2 | heritage 1, defi 1 | 2 charge(s) | Saisit l’ennemi proche : 12× dégâts ; vous coûte une demi-unité si vous en avez plus d’une. | adaptation | — |
| ACT_031 | Rituel de permutation | 3 | pacte 1, cache 1 | usage unique | Usage unique : chaque passif (hors objets-clés) est remplacé par un autre. | création originale | OBJ_017 |
| ACT_032 | Genjutsu du temps suspendu | 2 | bibliotheque 1, boutique 1 | 4 charge(s) | Ralentit tous les ennemis de moitié pendant 6 s. | création originale | — |
| ACT_033 | Sablier du courant | 2 | heritage 1, bibliotheque 1 | recharge 20 s en combat | Recharge dans le temps (20 s en combat) : 6 s de vitesse +1,2. | création originale | — |
| ACT_050 | Relais | 0 |  | 1 charge(s) | Sacrifie un clone : explosion de chakra (5× dégâts autour). | création originale | — |

## Talismans (TAL) — 35

| ID | Nom | Effet | Statut | Déblocage |
|---|---|---|---|---|
| TAL_001 | Ryō cousu dans la manche | Blessé, vous perdez un Ryō… qui tombe à vos pieds (et un autre avec). | création originale | — |
| TAL_002 | Épingle à cheveux | Les coffres verrouillés s’ouvrent sans clé (pas les portes). | création originale | — |
| TAL_003 | Pile de chakra | Les actifs demandent une charge de moins. | création originale | — |
| TAL_004 | Perles du moine | Les sanctuaires sont plus probables (+0,15 au poids). | création originale | — |
| TAL_005 | Baguettes d’Ichiraku | 8 % de soigner une demi-unité à chaque salle nettoyée. | création originale | — |
| TAL_006 | Masque d’oni | Toucher un ennemi le terrifie parfois (25 %). | création originale | — |
| TAL_007 | Talisman de protection | Blessé : 10 % (+2 % par chance) d’une réserve de chakra en demi. | création originale | — |
| TAL_008 | Bandeau rayé | Dégâts +10 % contre les boss. | création originale | — |
| TAL_009 | Grelot du flair | Signale les murs secrets de la salle en entrant. | création originale | — |
| TAL_010 | Poignée de sable | Un orbital de sable temporaire à chaque salle de combat. | création originale | — |
| TAL_011 | Mèche courte | Vos explosifs explosent plus vite (mèche de 0,85 s au lieu de 1,4 s). | création originale | — |
| TAL_012 | Mèche longue | Explosions 50 % plus larges ; délai +0,5 s. | création originale | — |
| TAL_013 | Charme du plein | À pleine vitalité, dégâts +0,5. | création originale | — |
| TAL_014 | Gourde de saké | Identifie les pilules ; les pilules négatives deviennent leur contraire. | création originale | — |
| TAL_015 | Bague de l’organisation | Les pactes sont plus fréquents (+5 %). | création originale | — |
| TAL_016 | Plume de la pluie | 10 % de tirs spectraux. | création originale | — |
| TAL_017 | Écaille de requin | 3 % des coups portés soignent une demi-unité. | création originale | — |
| TAL_018 | Gant d’armurière | 10 % d’un tir supplémentaire. | création originale | — |
| TAL_019 | Bandage de lutteur | Vitesse +0,3. | création originale | — |
| TAL_020 | Lunettes noires | Vos familiers infligent 20 % de plus. | création originale | — |
| TAL_021 | Fleur de la boutique | 5 % de charmer 3 s. | création originale | — |
| TAL_022 | Jeton de tripot | Loteries un peu plus généreuses (+10 %). | création originale | — |
| TAL_023 | Dent de requin | Vos explosions infligent 5 dégâts de plus. | création originale | — |
| TAL_024 | Kunai rouillé | 8 % de brûler. | création originale | — |
| TAL_025 | Clochette du chat fugueur | Chance +1 pour les récompenses de fin de salle. | clin d’œil (mission du chat) | — |
| TAL_026 | Graine de bois | Toutes les 10 salles nettoyées, un contenant vide. | création originale | — |
| TAL_027 | Sceau d’eau | Immunité aux flaques et sables mouvants. | création originale | — |
| TAL_028 | Poids d’entraînement | Vitesse −0,3, dégâts +0,5. | création originale | — |
| TAL_029 | Pétale de papier | Vos explosions projettent des papiers tranchants. | création originale | — |
| TAL_030 | Mèche de cheveux blancs | Chance +1. | création originale | — |
| TAL_031 | Encre sèche | 15 % de ne pas consommer un rouleau ou une pilule. | création originale | — |
| TAL_032 | Médaille de l’examen | Les portes d’épreuve s’ouvrent toujours. | création originale | — |
| TAL_033 | Omamori | Une fois par étage, annule un coup. | création originale | — |
| TAL_034 | Tatouage de l’ANBU | Dégâts +10 % dans les salles de boss. | création originale | — |
| TAL_035 | Masque de chat | Portes secrètes : une fissure est visible en passant. | création originale | — |

## Consommables : rouleaux et sceaux (CON) — 30

| ID | Nom | Famille | Effet | Poids |
|---|---|---|---|---|
| CON_001 | Rouleau du retour | rouleau | Vous renvoie à la salle de départ. | 1 |
| CON_002 | Rouleau du marionnettiste | rouleau | Pour la salle : vos tirs se guident. | 1 |
| CON_003 | Rouleau de l’ombre | rouleau | Immobilise tous les ennemis 4 s. | 1 |
| CON_004 | Rouleau du chef de village | rouleau | Pour la salle : dégâts +1,5. | 1 |
| CON_005 | Rouleau d’escorte | rouleau | Vous téléporte devant le boss de l’étage. | 1 |
| CON_006 | Rouleau de soin | rouleau | Deux réserves de chakra protecteur. | 1 |
| CON_007 | Rouleau du ramen | rouleau | Deux cœurs de vitalité apparaissent. | 1 |
| CON_008 | Rouleau de la jeunesse | rouleau | 6 s : invulnérable et rapide. | 1 |
| CON_009 | Rouleau de l’équilibre | rouleau | Un Ryō, une clé, un explosif et une demi-unité de soin. | 1 |
| CON_010 | Rouleau du colporteur | rouleau | Vous téléporte à l’échoppe. | 1 |
| CON_011 | Rouleau du tripot | rouleau | Fait apparaître une machine de loterie. | 1 |
| CON_012 | Rouleau de la force | rouleau | Pour la salle : dégâts ×1,5. | 1 |
| CON_013 | Rouleau de lévitation | rouleau | Pour la salle : lévitation. | 1 |
| CON_014 | Rouleau funeste | rouleau | 40 dégâts à tous les ennemis de la salle. | 1 |
| CON_015 | Rouleau de l’autel | rouleau | Fait apparaître un autel de don vital. | 1 |
| CON_016 | Rouleau interdit | rouleau | Pour la salle : dégâts +2. | 1 |
| CON_017 | Rouleau explosif | rouleau | Six explosions éclatent dans la salle (elles ne vous blessent pas). | 1 |
| CON_018 | Rouleau de l’héritage | rouleau | Vous téléporte à la salle d’héritage. | 1 |
| CON_019 | Rouleau de la lune | rouleau | Vous téléporte à la cache de renseignements. | 1 |
| CON_020 | Rouleau du soleil | rouleau | Soin complet, plan révélé, 3 dégâts à tous. | 1 |
| CON_021 | Rouleau du mendiant | rouleau | Fait apparaître un voyageur. | 1 |
| CON_022 | Rouleau du monde | rouleau | Révèle le plan de l’étage. | 1 |
| CON_023 | Sceau de destruction | sceau | Détruit tous les obstacles et révèle les murs secrets de la salle. | 1 |
| CON_024 | Sceau de réécriture | sceau | Relance les objets sur piédestal de la salle. | 1 |
| CON_025 | Sceau de duplication | sceau | Double les ressources au sol dans la salle. | 1 |
| CON_026 | Sceau de clairvoyance | sceau | Révèle tout l’étage, secrets compris. | 1 |
| CON_027 | Sceau de multiplication | sceau | Trois clones pour la salle. | 1 |
| CON_028 | Sceau de permutation | sceau | Relance tous vos passifs (hors objets-clés). | 0.3 |
| CON_029 | Sceau protecteur | sceau | 6 s d’invulnérabilité. | 1 |
| CON_030 | Sceau de passage | sceau | Ouvre une trappe vers l’étage suivant (sans récompense de boss). | 0.5 |

## Pilules militaires (PIL, apparence tirée par partie) — 15

| ID | Nom | Effet | Négative | Neutralisée en |
|---|---|---|---|---|
| PIL_01 | Pilule de régénération | Soin complet. | non | — |
| PIL_02 | Pilule de force | Dégâts +0,5. | non | — |
| PIL_03 | Pilule de faiblesse | Dégâts −0,3. | oui | Pilule de force |
| PIL_04 | Pilule de vitesse | Vitesse +0,2. | non | — |
| PIL_05 | Pilule de lenteur | Vitesse −0,15. | oui | Pilule de vitesse |
| PIL_06 | Pilule de cadence | Cadence +0,25. | non | — |
| PIL_07 | Pilule de portée | Portée +1. | non | — |
| PIL_08 | Pilule de myopie | Portée −1. | oui | Pilule de portée |
| PIL_09 | Pilule de chance | Chance +1. | non | — |
| PIL_10 | Pilule de malchance | Chance −1. | oui | Pilule de chance |
| PIL_11 | Pilule de chakra | Recharge complète de l’actif. | non | — |
| PIL_12 | Pilule amère | Coûte une demi-unité (jamais mortelle). | oui | Pilule de régénération |
| PIL_13 | Pilule de l’ermite | Révèle le plan. | non | — |
| PIL_14 | Pilule d’oubli | Efface les salles non visitées de la carte. | oui | Pilule de l’ermite |
| PIL_15 | Pilule volcanique | Trois explosions autour de vous (sans vous blesser). | non | — |

## Familiers (FAM) — 26

| ID | Nom | Comportement | Dégâts | Cadence / recharge | Particularité |
|---|---|---|---|---|---|
| FAM_CLONE | Clone de l’ombre | suiveur_tireur | 3.5 | 1.8 /s | — |
| FAM_RELAIS | Clone de relais | copieur | ×0.75 du tir | — | — |
| FAM_CLONE_TEMP | Clone (salle) | clone_temp | ×0.5 du tir | — | — |
| FAM_CLONE_RES | Clone de réserve | clone_res | ×0.35 dégâts | 2.2 /s | — |
| FAM_CLONE_SABLE | Clone de sable | copieur | ×0.6 du tir | — | — |
| FAM_GAMAKICHI | Gamakichi | suiveur_tireur | 3 | 1.3 /s | statut ralenti |
| FAM_KATSUYU | Katsuyu miniature | soutien | — | toutes les 5 salles | donne coeur |
| FAM_CRAPAUD_CLE | Crapaud messager | soutien | — | toutes les 6 salles | donne cle |
| FAM_SERPENT | Serpent | orbital | 5 | — | bloque les tirs |
| FAM_SABLE | Sable protecteur | orbital | 2 | — | bloque les tirs |
| FAM_KUNAI_ORB | Kunai tournoyant | orbital | 2 | — | — |
| FAM_PAPIER | Papillon de papier | orbital | 1.5 | — | bloque les tirs |
| FAM_MIROIR | Miroir de glace | orbital | 0 | — | bloque les tirs, renvoie les tirs |
| FAM_CORBEAU | Corbeau | aveugleur | 2 | 3 s | statut confus |
| FAM_PAKKUN | Pakkun | pakkun | — | — | — |
| FAM_AKAMARU | Akamaru | contact | 6 | 1.2 s | — |
| FAM_INSECTES | Kikaichū | collecteur | 1.5 | — | — |
| FAM_OISEAU_ARGILE | Oiseau d’argile | kamikaze | — | 4 s | — |
| FAM_KARASU_ATT | Karasu | chasseur | 4 | 1.6 /s | statut poison, marionnette |
| FAM_KARASU | Karasu (marionnette) | marionnette | — | — | bloque les tirs, marionnette |
| FAM_KUROARI | Kuroari | pieges | — | 8 s | marionnette |
| FAM_SANSHOUO | Sanshōuo | bloqueur | — | — | bloque les tirs, marionnette |
| FAM_TIGRE_ENCRE | Fauve d’encre | chasseur | 4 | 1.5 /s | — |
| FAM_SERPENT_BLANC | Serpent blanc | chasseur | 3 | 1.2 /s | — |
| FAM_LUCIOLE | Luciole | luciole | — | — | — |
| FAM_POUPEE | Poupée d’entraînement | bloqueur | — | — | bloque les tirs |

## Ennemis (ENM) — 75

| ID | Nom | Rôle | Comportement | PV | Vitesse | Rayon | Thèmes | Description |
|---|---|---|---|---|---|---|---|---|
| ENM_001 | Poupée d’entraînement animée | p | poursuivant | 8 | 1.1 | 9 | ACA | Un mannequin réveillé par un sceau égaré. Lent, avance droit sur vous. |
| ENM_002 | Genin renégat | p | poursuivant | 10 | 1.7 | 9 | ACA FOR | Bandeau rayé, fonce au contact. |
| ENM_003 | Lanceur de kunai | t | tireur | 9 | 1 | 9 | ACA | Tire quand vous êtes aligné sur sa ligne ou sa colonne. |
| ENM_004 | Rat des sous-sols | n | errant | 4 | 3 | 6 | ACA | Rapide et erratique, fragile. |
| ENM_005 | Chauve-souris | v | volant | 5 | 2.3 | 7 | ACA FOR | Vole au-dessus des fosses et obstacles. |
| ENM_006 | Crapaud d’égout | s | sauteur | 12 | 1 | 9 | ACA FOR | Bondit vers vous ; ses atterrissages éclaboussent en quatre directions. |
| ENM_007 | Serpent de la forêt | p | poursuivant | 9 | 2 | 8 | FOR | Ondule en approchant. |
| ENM_008 | Sangsue géante | l | lourd | 22 | 0.8 | 12 | FOR | Lente ; écrase le sol quand vous approchez. |
| ENM_009 | Mille-pattes fouisseur | r | rampant | 14 | 2.2 | 9 | ACA FOR | Circule sous terre (sol qui remue) et surgit près de vous. |
| ENM_010 | Tigre de la forêt | c | chargeur | 14 | 1.4 | 11 | FOR | Charge en ligne droite quand vous êtes aligné ; étourdi contre un mur. |
| ENM_011 | Ninja de la pluie | q | tireur_predictif | 10 | 1.4 | 9 | FOR | Anticipe vos déplacements. |
| ENM_012 | Nuée de moustiques | n | nuee | 3 | 2.6 | 5 | FOR | Trois par nuée ; très fragiles. |
| ENM_013 | Araignée tisseuse | m | poseur | 10 | 1.3 | 9 | ACA FOR | Tend des toiles qui ralentissent. |
| ENM_014 | Jarre hantée | e | inerte | 8 | 2.2 | 8 | ACA | Ressemble à une jarre… jusqu’à ce que vous approchiez. |
| ENM_015 | Instructeur déchu | i | invocateur | 18 | 0.9 | 9 | ACA | Anime des poupées ; les tuer d’abord libère la salle. |
| ENM_016 | Tourelle à parchemins | f | tourelle | 12 | 0 | 10 | ACA FOR | Fixe ; tire en croix, puis en diagonale. |
| ENM_017 | Gardien des archives | l | lourd | 26 | 0.9 | 11 | ACA | Massif ; frappe le sol en onde et en anneau. |
| ENM_018 | Genin fonceur | c | chargeur | 11 | 1.5 | 9 | ACA | Charge dès que vous êtes aligné. |
| ENM_019 | Invocateur d’herbes hautes | i | invocateur | 16 | 1 | 9 | FOR | Invoque des serpents. |
| ENM_020 | Racine griffue | e | embusque | 12 | 1.6 | 9 | FOR | Surgit du sol à distance (le sol se fissure avant). |
| ENM_030 | Scorpion des sables | p | poursuivant | 14 | 1.9 | 9 | SUN MAR | Rapide ; son dard empoisonne au contact. |
| ENM_031 | Momie de sable | l | lourd | 30 | 0.8 | 11 | SUN | Lente, écrase le sol. |
| ENM_032 | Ver des sables | r | rampant | 18 | 2.4 | 9 | SUN MAR | Traverse le sable et jaillit sous vos pieds. |
| ENM_033 | Ninja de Suna à l’éventail | t | tireur | 14 | 1.1 | 9 | SUN | Lames de vent en éventail. |
| ENM_034 | Esprit de sable | v | volant | 8 | 2.1 | 8 | SUN | Volant, imprévisible. |
| ENM_035 | Marionnette à lames | c | chargeur | 16 | 1.3 | 9 | SUN MAR | Charge avec des lames dépliées. |
| ENM_036 | Lanceur de jarres | s | lanceur_arc | 14 | 0.8 | 9 | SUN MAR | Lance des jarres en cloche : leur point de chute est marqué. |
| ENM_037 | Marionnette lanceuse | f | tourelle | 16 | 0 | 9 | SUN MAR | Fixe ; senbon dans huit directions. |
| ENM_038 | Marionnettiste caché | i | invocateur | 20 | 1 | 9 | SUN MAR | Ses marionnettes tombent quand il meurt. |
| ENM_039 | Araignée mécanique | n | nuee | 5 | 2.4 | 6 | SUN MAR | Trois par groupe. |
| ENM_040 | Ninja du Son | q | tireur_predictif | 14 | 1.3 | 9 | SUN MAR | Ondes sonores visées. |
| ENM_041 | Poseur de sceaux de sable | m | poseur | 14 | 1.2 | 9 | SUN MAR | Pose des parchemins qui explosent quand vous passez. |
| ENM_042 | Marionnette bouclier | g | protecteur | 22 | 0.9 | 11 | SUN MAR | Bloque les tirs de face : contournez-la. |
| ENM_043 | Médecin de Suna | h | guerisseur | 12 | 1.4 | 9 | SUN MAR | Soigne ses alliés (cercle vert) ; fuit. |
| ENM_044 | Marionnette errante | p | poursuivant | 14 | 1.6 | 9 | MAR | Avance par saccades. |
| ENM_045 | Marionnette volante | v | volant | 10 | 2 | 9 | MAR | Plane au-dessus des fosses. |
| ENM_046 | Marionnette inerte | e | inerte | 16 | 1.8 | 9 | MAR | Immobile… jusqu’à ce qu’on s’approche ou qu’on la frappe. |
| ENM_047 | Marionnette géante | l | lourd | 34 | 0.8 | 12 | MAR | Écrase le sol. |
| ENM_050 | Sujet expérimental | p | poursuivant | 18 | 1.7 | 9 | ORO KIR | Se divise en deux à sa mort. |
| ENM_051 | Serpent blanc géant | c | chargeur | 18 | 1.5 | 10 | ORO | Charge en ligne. |
| ENM_052 | Porteur du sceau maudit | l | lourd | 36 | 1 | 11 | ORO KIR | S’enrage sous la moitié de ses PV. |
| ENM_053 | Zetsu blanc | e | embusque | 20 | 1.6 | 9 | ORO | Émerge du sol près de vous et poursuit. |
| ENM_054 | Cuve vivante | s | lanceur_arc | 20 | 0 | 12 | ORO KIR | Crache de l’acide en cloche (flaque au point de chute). |
| ENM_055 | Garde du Son | p | poursuivant | 16 | 1.8 | 9 | ORO | Rapide au contact. |
| ENM_056 | Tireur du Son | q | tireur_predictif | 16 | 1.3 | 9 | ORO KIR | Tirs visés. |
| ENM_057 | Chauve-souris d’expérience | v | volant | 10 | 2.5 | 7 | ORO |  |
| ENM_058 | Assistant de laboratoire | i | invocateur | 24 | 1 | 9 | ORO KIR | Réanime des sujets. |
| ENM_059 | Nuée de serpenteaux | n | nuee | 5 | 2.4 | 5 | ORO KIR |  |
| ENM_060 | Poseur de parchemins explosifs | m | poseur | 16 | 1.3 | 9 | ORO KIR | Pièges explosifs (cercle d’alerte). |
| ENM_061 | Ninja médical | h | guerisseur | 16 | 1.4 | 9 | ORO KIR |  |
| ENM_062 | Ninja de la brume | p | poursuivant | 16 | 1.8 | 9 | KIR | Silhouette contourée dans la brume. |
| ENM_063 | Clone de glace | t | tireur | 16 | 1.1 | 9 | KIR | Salves de senbon de glace ; laisse du verglas. |
| ENM_064 | Méduse de chakra | v | volant | 12 | 1.5 | 9 | KIR | Flotte lentement. |
| ENM_065 | Déserteur au sabre | c | chargeur | 18 | 1.5 | 9 | KIR | Charge sabre en avant. |
| ENM_066 | Assassin de la brume | e | embusque | 16 | 1.8 | 9 | KIR |  |
| ENM_067 | Requin des canaux | r | rampant | 22 | 2.6 | 9 | KIR MYO BIJ | Son aileron trahit sa position. |
| ENM_068 | Nid de serpenteaux | i | invocateur | 20 | 0 | 11 | invocation | Libère des serpenteaux ; les détruit en mourant. |
| ENM_070 | Zetsu blanc (armée) | p | poursuivant | 24 | 1.7 | 9 | AKA GUE MYO BIJ | En nombre, sans relâche. |
| ENM_071 | Oiseau d’argile | v | kamikaze | 12 | 2.4 | 8 | AKA GUE BIJ | Plonge et explose (il clignote avant). |
| ENM_072 | Araignée d’argile | n | kamikaze | 6 | 2.6 | 6 | AKA GUE MYO BIJ | Explose au contact (mèche visible). |
| ENM_073 | Marionnette humaine | l | lourd | 44 | 1 | 12 | AKA GUE MYO BIJ | Écrase le sol et projette du sable de fer. |
| ENM_074 | Bête invoquée | p | poursuivant | 20 | 2.1 | 11 | AKA GUE MYO | Rapide et massive. |
| ENM_075 | Sentinelle de la pluie | q | tireur_predictif | 22 | 1.4 | 9 | AKA GUE MYO BIJ |  |
| ENM_076 | Invocateur aux tiges | i | invocateur | 30 | 1 | 9 | AKA GUE MYO BIJ | Invoque des bêtes. |
| ENM_077 | Masque élémentaire | f | tourelle | 26 | 0 | 10 | AKA GUE BIJ | Flotte, émet des anneaux de feu (un espace toujours libre). |
| ENM_078 | Shinobi de l’Alliance égaré | c | chargeur | 24 | 1.6 | 9 | AKA GUE MYO |  |
| ENM_079 | Poseur d’argile | m | poseur | 20 | 1.3 | 9 | AKA GUE MYO BIJ |  |
| ENM_080 | Statue de pierre | g | protecteur | 40 | 0.7 | 12 | AKA GUE MYO BIJ | Ses alliés proches subissent moitié moins de dégâts (anneau bleu). |
| ENM_081 | Zetsu soigneur | h | guerisseur | 20 | 1.4 | 9 | AKA GUE MYO BIJ |  |
| ENM_090 | Crapaud gardien | p | sauteur | 30 | 1.2 | 11 | MYO |  |
| ENM_091 | Crapaud cracheur d’huile | t | lanceur_arc | 26 | 0.9 | 10 | MYO |  |
| ENM_092 | Hirondelle des ermites | v | volant | 16 | 2.6 | 8 | MYO |  |
| ENM_093 | Crapaud bondissant | s | sauteur | 28 | 1.1 | 10 | MYO |  |
| ENM_094 | Ombre de chakra | p | poursuivant | 30 | 1.9 | 10 | BIJ |  |
| ENM_095 | Queue de chakra | c | chargeur | 30 | 1.6 | 10 | BIJ |  |

## Boss (BOS) — 24

| ID | Nom | Titre | Étage | PV | Attaques | Phases | Mécanique |
|---|---|---|---|---|---|---|---|
| BOS_001 | Mizuki | Le traître de l’Académie | 1 | 170 | salve, fuma, charge | 50 % | Kunai en éventail, grand shuriken revenant, charges. |
| BOS_002 | Serpent géant | Gardien de la Forêt de la Mort | 1 | 200 | charge, terrier, crachat | — | Charges, plongée sous terre et crachats en éventail. |
| BOS_003 | Les frères démons | Duo aux griffes enchaînées | 1 | 110 | charge, griffe | — | Deux adversaires reliés par une chaîne dangereuse quand elle se tend. |
| BOS_004 | Zabuza | Le démon du brouillard | 2 | 300 | sabre, brume, dragon, clones | 45 % | Disparaît dans la brume (yeux visibles) et réapparaît sabre levé. |
| BOS_005 | Haku | Les miroirs de glace | 2 | 260 | saut, senbon, salve | 50 % | Passe de miroir en miroir ; les miroirs se brisent sous les coups. |
| BOS_006 | Kankurō et Karasu | Le marionnettiste | 3 | 140 | gaz, salve | — | Frappez le marionnettiste caché : sa marionnette tombera. |
| BOS_007 | Le trio du Son | Trois épreuves en une | 3 | 95 | onde, salve | — | Trois adversaires aux rôles distincts : ondes, souffle, clochettes. |
| BOS_008 | Kimimaro | La danse des os | 3 | 340 | balles, lances, danse | 40 % | Balles d’os, lances qui percent le sol en lignes, danse circulaire. |
| BOS_009 | Gaara | L’enfermement de sable | 4 | 380 | cercueil, shuriken, vague, pluie | 50 % | Le sable enferme l’arène : cercueils au sol, vagues avec une brèche, pluie de sable. |
| BOS_010 | Sasori | Le maître des marionnettes | 4 | 360 | queue, aiguilles, sable_fer, anneau | 55 % | Carapace blindée puis sable de fer. |
| BOS_011 | Kabuto | Le médecin des ombres | 5 | 380 | scalpel, cadavres, soin, salve | — | Se soigne de 10 % en canalisant 2 s (20 dégâts l’interrompent ; trois fois au plus, espacées de 10 s) ; réanime des sujets. |
| BOS_012 | Kisame | Le requin de la brume | 5 | 440 | requins, inondation, samehada, prison | — | Inonde l’arène (l’eau vous ralentit, pas lui) ; requins d’eau chercheurs. |
| BOS_013 | Hidan | Le rituel immortel | 5 | 400 | faux, rituel, charge | — | Si sa faux vous touche, il vous marque ; dans son cercle, il se blesse… et vous aussi. Interrompez le rituel (25 dégâts pendant sa canalisation). |
| BOS_014 | Orochimaru | Les mues du serpent | 6 | 520 | serpents, epee, invocation, huit | 66 %, 33 % | À chaque mue, la peau abandonnée devient hostile et il réapparaît ailleurs. |
| BOS_015 | Deidara | L’art est une explosion | 7 | 460 | araignees, oiseaux, bombes, c3 | 35 % | Argile explosive sous toutes ses formes ; C3 : mettez-vous à l’abri derrière un bloc. |
| BOS_016 | Itachi | Les illusions du corbeau | 7 | 480 | clones, boule, flammes, tsukuyomi | 40 % | Seul le vrai Itachi projette une ombre ; ses clones éclatent en corbeaux. |
| BOS_017 | Kakuzu | Les cinq cœurs | 7 | 300 | poing, durcir, fils | — | Trois masques élémentaires l’accompagnent ; sa peau durcie (grise) réduit les dégâts de 70 % pendant 1,8 s, visiblement. |
| BOS_018 | Pain | Les forces d’attraction | 8 | 560 | repulsion, attraction, tiges, betes, sphere | 50 % | Repousse (et détruit vos tirs), attire en tirant en anneau, puis crée une sphère d’attraction. |
| BOS_019 | Obito | Les changements de présence | 8 | 460 | saisie, boule, vortex, chaines | 50 % | Intangible sauf quand il se matérialise pour attaquer (annonce, attaque, récupération). |
| BOS_020 | Le Gardien du Sceau | Celui qui tient le labyrinthe | 9 | 800 | chaines, anneaux, spirale, arene | 66 %, 33 % | Arène évolutive : des blocs apparaissent entre les phases ; chaînes balayantes. |
| BOS_021 | Madara (empreinte) | L’ancien rival | 9 | 900 | meteore, feu, bois, sabre | 50 % | Attaques massives : météore (abri : loin du centre marqué), dragons de bois, grands balayages. |
| BOS_022 | Empreinte des Dix Queues | La brèche instable | 8 | 1000 | queues, bombe, pluie, anneau | — | Immobile et gigantesque : queues balayantes, rayon, anneaux à brèche. |
| BOS_M01 | Mue gardienne | Gardienne du pacte | mini-boss | 150 | charge, anneau | — | — |
| BOS_M02 | Crapaud gardien | Gardien du sanctuaire | mini-boss | 150 | saut, langue | — | — |

## Thèmes (THM) et variantes d’étage (FLR) — 10

| ID | Nom | Chapitre | Sol / murs | Décor | Musique | Variantes (règle) |
|---|---|---|---|---|---|---|
| THM_ACA | Sous-sols de l’Académie | 1 | planches / briques | cible, parchemin, lanterne | yo, 88 bpm, koto | Salles d’entraînement : Jarres et caisses fréquentes : plus de ressources cachées, moins de couverture solide. ; Archives inondées : Des flaques d’eau ralentissent la marche (pas le vol). |
| THM_FOR | Forêt de la Mort | 1 | terre / racines | champignon, fougere, os | in, 80 bpm, flute | Sous-bois : Des toiles collantes ralentissent ; le feu les détruit. ; Racines géantes : Plus d’obstacles : couverture abondante, lignes de tir coupées. |
| THM_SUN | Cavernes de Suna | 2 | sable / roche | os, jarre_sable, cristal | ryukyu, 92 bpm, koto | Grottes de sable : Des sables mouvants ralentissent et attirent vers leur centre. ; Galeries de verre : Des cristaux font rebondir les projectiles (alliés et ennemis). |
| THM_MAR | Ateliers de marionnettes | 2 | dalles / planches | bras, fil, lanterne | in, 96 bpm, koto | Atelier : Des pics mécaniques sortent et rentrent selon un cycle visible. ; Entrepôt des cent marionnettes : Des marionnettes inertes bloquent le passage ; certaines s’animent. |
| THM_ORO | Laboratoires d’Orochimaru | 3 | metal / metal | cuve, tuyau, mue | sombre, 76 bpm, flute | Salle des cuves : Des flaques d’acide blessent au contact (pas en vol). ; Serpentarium : Des nids de serpenteaux libèrent des nuées quand on les frappe. |
| THM_KIR | Canaux de Kiri | 3 | pierre / roche | algue, chaine, lanterne | in, 72 bpm, flute | Canaux brumeux : Brume : visibilité réduite autour du shinobi ; les ennemis restent contourés. ; Écluses : Des courants poussent dans une direction affichée. |
| THM_AKA | Repaires de l’Akatsuki | 4 | pierre / roche | nuage, anneau, bougie | sombre, 84 bpm, koto | Grotte du scellement : Pénombre : les lanternes et le feu éclairent ; les dangers restent lisibles. ; Tour d’Ame : Pluie : flaques conductrices (la foudre s’y propage), le feu y dure moitié moins. |
| THM_GUE | Champs de guerre scellés | 4 | terre / roche | arme, drapeau, os | in, 100 bpm, koto | Plaine de cratères : Cratères (fosses) : le vol devient précieux, les explosifs créent des ponts. ; Forêt de Zetsu : Des Zetsu blancs surgissent du sol en renfort pendant les combats. |
| THM_MYO | Mont Myōboku (empreinte) | 5 | mousse / roche | champignon, lanterne, fougere | yo, 76 bpm, flute | Sentiers des crapauds : Flaques d’huile des crapauds : le Katon les embrase. |
| THM_BIJ | Profondeurs du sceau des bijū | 5 | pierre / metal | chaine, sceau, bougie | sombre, 88 bpm, koto | Chambre des chaînes : Chaînes de sceau : murs temporaires qui s’ouvrent quand la salle est nettoyée. |

## Routes et fins (RTE) — 6

| ID | Nom | Bifurcation | Prérequis | Boss | Récompense | Marque |
|---|---|---|---|---|---|---|
| RTE_01 | Première fin : le sceau fissuré | étage 6 | aucun | Orochimaru | Ouvre les étages 7-8 (chapitre IV) ; Mue du serpent (PSV_143) et Rituel de permutation (ACT_031) via OBJ_017 | Serpent |
| RTE_02 | Deuxième fin : la pluie sans fin | étage 8 | RTE_01 accomplie | Pain / Obito | Ouvre les deux branches de l’étage 9 ; Sceau de la mort (PSV_131) et Transfert d’esprit (ACT_029) via OBJ_039 | Nuage rouge |
| RTE_03 | Branche de la Lumière : Mont Myōboku | après le boss de l’étage 8 | RTE_02 accomplie ; aucun pacte interdit acheté pendant la partie | Le Gardien du Sceau | Nature du sage (PSV_144) et Sceau de scellement (ACT_027) ajoutés aux pools (OBJ_046) | Crapaud |
| RTE_04 | Branche de l’Ombre : Profondeurs du sceau | après le boss de l’étage 8 | RTE_02 accomplie | Madara (empreinte) | Réincarnation impure (PSV_140) et Espace-temps intangible (ACT_021) ajoutés aux pools (OBJ_047) | Éventail |
| RTE_05 | Conseil des épreuves (Boss Rush) | étage 6 | boss de l’étage 6 vaincu en moins de 20:00 (chronomètre de partie) | vagues de boss | Défis « Course de l’examen » (DEF_010) et « Collectionneur pressé » (DEF_011) (OBJ_048) | Parchemin d’or |
| RTE_06 | Brèche instable | étage 8 | salle du boss de l’étage 8 atteinte en moins de 30:00 | Empreinte des Dix Queues | Chute céleste (PSV_020) ajoutée aux pools (OBJ_049) | Dix queues |

## Transformations d’ensemble (TRF) — 13

| ID | Nom | Ensemble | Seuil | Effet | Objets de l’ensemble |
|---|---|---|---|---|---|
| TRF_001 | Manteau du renard | renard | 3 distincts | Aura de chakra : les ennemis à votre contact brûlent ; dégâts +1. | PSV_001, PSV_014, PSV_031, PSV_046, PSV_055, PSV_056, PSV_132, PSV_146, ACT_024 |
| TRF_002 | Sage imparfait | ermite | 3 distincts | Immobile 0,6 s : dégâts ×1,6 jusqu’au prochain pas ; portée +2. | PSV_057, PSV_079, PSV_082, PSV_093, PSV_144, ACT_016 |
| TRF_003 | Essaim Aburame | essaim | 3 distincts | Vos tirs deviennent des insectes chercheurs ; un essaim vous accompagne. | PSV_006, PSV_070, PSV_153, PSV_154 |
| TRF_004 | Arsenal du marionnettiste | marionnette | 3 distincts | Une marionnette d’attaque supplémentaire ; vos marionnettes frappent 50 % plus fort. | PSV_048, PSV_072, PSV_073, PSV_074, PSV_142, ACT_011, ACT_013 |
| TRF_005 | Résonance des yeux | yeux | 3 distincts | Barres de vie ennemies visibles, fissures des murs secrets révélées, chance +2, léger guidage. | PSV_022, PSV_025, PSV_049, PSV_053, PSV_067, PSV_113, ACT_008, ACT_017, ACT_018 |
| TRF_006 | Armure de sable | sable | 3 distincts | Trois orbitaux de sable ; les coups d’un cœur entier ne retirent qu’une demi-unité. | PSV_010, PSV_065, PSV_077, PSV_097, PSV_150, ACT_010 |
| TRF_007 | Reliques interdites | interdit | 3 distincts | Lévitation, deux réserves instables, dégâts +1. | PSV_054, PSV_091, PSV_098, PSV_129, PSV_131, PSV_135, PSV_139 |
| TRF_008 | Outils du tonnerre | tonnerre | 3 distincts | Chaque tir enchaîne la foudre sur un ennemi proche ; cadence +0,3. | PSV_028, PSV_045, PSV_058, PSV_147, ACT_003 |
| TRF_009 | Corps expérimental | experimental | 3 distincts | Un contenant de plus ; blessé, deux serpents vous défendent pour la salle. | PSV_060, PSV_064, PSV_078, PSV_090, PSV_140, PSV_143 |
| TRF_010 | Messager de papier | papier | 3 distincts | Lévitation, quatre papillons protecteurs, tirs de papier. | PSV_075, PSV_116, PSV_155, PSV_156 |
| TRF_011 | Meute d’invocation | meute | 3 distincts | Deux compagnons supplémentaires ; tous les familiers +25 %. | PSV_061, PSV_062, PSV_063, PSV_068, PSV_069, PSV_076, PSV_151, ACT_006, ACT_012 |
| TRF_012 | Huit Portes | portes | 3 distincts | Plafond de cadence +1, vitesse +0,5, dégâts +1 ; vapeur verte. | PSV_032, PSV_040, PSV_041, PSV_092, ACT_007, ACT_030 |
| TRF_013 | Artiste explosif | argile | 3 distincts | Vos tirs explosent légèrement ; vos explosions ne vous blessent plus. | PSV_019, PSV_071, PSV_110, PSV_149 |

## Synergies documentées (SYN) — 96

| ID | Nom | Composants | Type | Effet | Test d’acceptation |
|---|---|---|---|---|---|
| SYN_001 | Rasengan jumeau | PSV_001 Empreinte du Rasengan + PSV_002 Encre de dédoublement | emergente | Deux sphères partagent la charge : 3,5 × 3 × 0,70 = 7,35 dégâts chacune ; cycle 0,6 / 0,9 ≈ 0,667 s. | Cible immobile : deux sphères, dégâts et cycle attendus, arrêt au mur, rien au changement de salle. |
| SYN_002 | Sphère chercheuse | PSV_001 Empreinte du Rasengan + PSV_005 Kunai à marque de téléportation | emergente | Les sphères chargées se guident vers la cible. | Cible latérale touchée sans alignement parfait. |
| SYN_003 | Sphère orageuse | PSV_001 Empreinte du Rasengan + PSV_028 Chidori nagashi (empreinte) | emergente | Chaque sphère enchaîne la foudre sur deux ennemis. | Groupe de trois : trois cibles blessées par une sphère. |
| SYN_004 | Tourbillon de vent complet | PSV_001 Empreinte du Rasengan + PSV_146 Rasenshuriken (empreinte) | dediee | L’explosion de vent des sphères s’élargit (rayon 2). | Rayon d’explosion mesuré à 2 tuiles. |
| SYN_005 | Canons en éventail | PSV_014 Canon de chakra + PSV_003 Éventail de kunai | emergente | Trois rayons en éventail, chacun au coefficient de multitir (0,58). | Trois faisceaux, dégâts par rayon = 58 %. |
| SYN_006 | Rayon perçant | PSV_014 Canon de chakra + PSV_008 Senbon perforant | dediee | Le rayon traverse déjà tout : le percement devient +20 % de dégâts. | Dégâts par tic ×1,2. |
| SYN_007 | Retour guidé | PSV_013 Fūma shuriken + PSV_005 Kunai à marque de téléportation | emergente | Le fūma suit sa cible à l’aller, puis revient. | Trajet courbe puis retour à la main. |
| SYN_008 | Fūma foudroyant | PSV_013 Fūma shuriken + PSV_028 Chidori nagashi (empreinte) | emergente | Chaque passage du fūma enchaîne la foudre. | Deux chaînes par lancer (aller et retour). |
| SYN_009 | Argile incendiaire | PSV_019 Argile explosive C1 + PSV_043 Grande boule de feu (empreinte) | dediee | Les bombes d’argile laissent des flammes alliées. | Zone de feu après chaque explosion. |
| SYN_010 | Météore gelé | PSV_020 Chute céleste + PSV_050 Glace éternelle | dediee | Les frappes au sol gèlent à coup sûr. | Ennemi gelé après une frappe. |
| SYN_011 | Sphère d’encre | PSV_021 Sphère téléguidée + PSV_052 Encre des bêtes | dediee | La sphère guidée charme plus souvent (+20 %). | Charme observé en moins de 10 contacts. |
| SYN_012 | Souffle du vent | PSV_016 Souffle continu + PSV_046 Lame de vent | dediee | Le faisceau continu porte deux tuiles plus loin. | Longueur du faisceau +2 tuiles. |
| SYN_013 | Tempête orbitale | PSV_010 Sable en orbite + PSV_065 Sable protecteur | dediee | Un orbital de sable supplémentaire. | Trois orbitaux. |
| SYN_014 | Ricochet détonant | PSV_007 Fil de chakra + PSV_149 Explosion de chakra | dediee | Un ricochet de plus ; l’explosion survient au dernier contact. | Trois ricochets puis explosion. |
| SYN_015 | Mille aiguilles empoisonnées | PSV_004 Parchemin des mille aiguilles + PSV_048 Poison de scorpion | dediee | Poison +20 %. | Taux de poison sur 50 tirs. |
| SYN_016 | Éventail de feu | PSV_003 Éventail de kunai + PSV_043 Grande boule de feu (empreinte) | dediee | Brûlure +10 %. | Taux de brûlure sur 50 tirs. |
| SYN_017 | Le vent attise le feu | PSV_043 Grande boule de feu (empreinte) + PSV_046 Lame de vent | dediee | Les impacts laissent des flammes ; dégâts +0,5. | Zones de feu à l’impact. |
| SYN_018 | Eau conductrice | PSV_044 Chakra de l’eau + PSV_045 Courant foudroyant | dediee | La foudre se propage par l’eau : un saut de chaîne. | Chaîne vers un ennemi proche. |
| SYN_019 | Boue | PSV_047 Poing de terre + PSV_044 Chakra de l’eau | dediee | Ralentissement +30 %. | Taux de ralenti. |
| SYN_020 | Ombre lestée | PSV_051 Ombre liante + PSV_034 Kunai lestés | dediee | Immobilisation +10 %. | Taux d’immobilisation. |
| SYN_021 | Clones à l’encre | PSV_061 Clone de l’ombre + PSV_002 Encre de dédoublement | dediee | Un second clone rejoint le premier. | Deux clones suiveurs. |
| SYN_022 | Flair de la meute | PSV_068 Pakkun + PSV_069 Petit chien de chasse | dediee | Toutes les 6 salles nettoyées, les chiens déterrent une ressource. | Ressource à la 6e salle. |
| SYN_023 | Envolée d’argile | PSV_019 Argile explosive C1 + PSV_071 Oiseau d’argile | dediee | L’oiseau d’argile se recharge deux fois plus vite. | Plongeon toutes les 2 s. |
| SYN_024 | Grand sabre vorace | PSV_136 Écailles de Samehada + PSV_017 Empreinte du Kubikiribōchō | dediee | Soin toutes les 8 éliminations au lieu de 12. | Soin à la 8e élimination. |
| SYN_025 | Malédiction partagée | PSV_091 Sceau maudit + PSV_054 Marque de Jashin | dediee | La marque de Jashin inflige 10 dégâts de plus. | Dégâts de salle 25. |
| SYN_026 | Rotation clairvoyante | PSV_113 Byakugan (empreinte) + PSV_022 Rotation céleste | dediee | La rotation couvre une portée plus large. | Rayon de rotation +0,5 tuile. |
| SYN_027 | Miroirs gelés | PSV_050 Glace éternelle + PSV_081 Miroirs de glace | emergente | Les tirs renvoyés par les miroirs sont de glace (élément hyoton). | Tir renvoyé gèle parfois. |
| SYN_028 | Lames tournoyantes | PSV_018 Tantō de l’ANBU + PSV_022 Rotation céleste | emergente | Frappe courte + rotation : la rotation domine, la lame devient un coup d’appoint. | Priorité rotation, coup d’appoint présent. |
| SYN_029 | Laser en éventail | PSV_015 Trait de chakra + PSV_003 Éventail de kunai | emergente | Trois traits instantanés. | Trois lignes par cycle. |
| SYN_030 | Faisceau ondulant | PSV_016 Souffle continu + PSV_011 Onde de la vague | emergente | Le faisceau ignore l’ondulation (trajectoire d’un faisceau) : l’onde devient +0,3 dégâts seulement. | Pas de déformation du faisceau. |
| SYN_031 | Frappe de sabre explosive | PSV_017 Empreinte du Kubikiribōchō + PSV_149 Explosion de chakra | emergente | Chaque coup de sabre déclenche l’explosion d’impact. | Explosion au contact du sabre. |
| SYN_032 | Orbe lent chercheur | PSV_012 Baika (expansion) + PSV_006 Insectes traqueurs | emergente | Énormes insectes lents qui traquent. | Guidage visible sur tirs lents. |
| SYN_033 | Orbite empoisonnée | PSV_010 Sable en orbite + PSV_048 Poison de scorpion | emergente | Les tirs en orbite empoisonnent au passage. | Poison sur ennemi au contact de l’orbite. |
| SYN_034 | Contrôle multiple | PSV_021 Sphère téléguidée + PSV_002 Encre de dédoublement | emergente | La sphère guidée gagne le coefficient de multitir total (1,4×). | Dégâts de contact ×1,4. |
| SYN_035 | Frappe au sol multiple | PSV_020 Chute céleste + PSV_003 Éventail de kunai | emergente | Le météore reste unique : le multitir ne multiplie pas la frappe (règle affichée), il n’a pas d’effet. | Une seule frappe par cycle. |
| SYN_036 | Bombes en salve | PSV_019 Argile explosive C1 + PSV_024 Arsenal de Tenten (empreinte) | emergente | Trois bombes par cycle, plus faibles (0,6). | Trois explosions échelonnées. |
| SYN_037 | Croix de foudre | PSV_026 Croix de sceaux + PSV_028 Chidori nagashi (empreinte) | emergente | Les tirs en croix enchaînent aussi la foudre. | Chaînes dans quatre directions. |
| SYN_038 | Mines éclatantes | PSV_027 Parchemins-pièges + PSV_030 Shuriken démultiplié | emergente | Les mines ne se divisent pas (génération bornée) : l’éclat ne s’applique qu’aux tirs primaires. | Aucun éclat issu d’une mine. |
| SYN_039 | Boomerang explosif | PSV_013 Fūma shuriken + PSV_149 Explosion de chakra | emergente | Chaque contact du fūma explose (budget par cycle : 14 déclenchements). | Nombre d’explosions ≤ 14 par lancer. |
| SYN_040 | Taijutsu enflammé | PSV_018 Tantō de l’ANBU + PSV_043 Grande boule de feu (empreinte) | emergente | La frappe courte applique la brûlure du Katon. | Brûlure sur frappe. |
| SYN_041 | Rotation et miroirs | PSV_022 Rotation céleste + PSV_081 Miroirs de glace | emergente | Défense quasi totale mais sans tir à distance : les miroirs ne bloquent qu’au contact (fréquence bornée). | Quelques tirs passent encore. |
| SYN_042 | Coups de sable | PSV_150 Tempête de sable + PSV_065 Sable protecteur | emergente | Tempête de sable + orbitaux : couverture défensive dense. | Projectiles ennemis interceptés. |
| SYN_043 | Nuée d’encre | PSV_052 Encre des bêtes + PSV_076 Tigres d’encre | emergente | Les fauves d’encre profitent des ennemis charmés. | Ennemis charmés attaqués. |
| SYN_044 | Voleur de pacte | PSV_129 Contrat de Kakuzu + PSV_107 Bourse-grenouille | emergente | Payer ses pactes en Ryō avec une bourse qui double parfois les pièces. | Achat d’un pacte en Ryō. |
| SYN_045 | Marchand avisé | PSV_121 Carte de membre de l’échoppe + PSV_124 Réputation de client | emergente | Soldes et étal supplémentaire : l’échoppe devient une salle d’héritage payante. | Trois objets à moitié prix. |
| SYN_046 | Économie de relance | ACT_001 Réécriture d’empreinte + PSV_127 Sceau de réécriture | emergente | Relances qui ne descendent jamais en qualité. | Qualité ≥ initiale après relance. |
| SYN_047 | Sceau éternel | PSV_095 Sceau vital de la famille + PSV_083 Bol de ramen d’Ichiraku | emergente | Sceaux partiels + soins : la vitalité monte d’étage en étage. | Contenant ajouté à l’étage suivant. |
| SYN_048 | Réserve inépuisable | PSV_087 Sceau de régénération + PSV_093 Chakra de la limace | emergente | Régénération doublée par le chakra de la limace. | Soin de 2 demis toutes les 3 salles. |
| SYN_049 | Protection du démon | PSV_098 Chakra du démon scellé + PSV_056 Bulle de chakra rouge | emergente | Réserves instables + bulle rouge : chaque rupture déclenche aussi huit tirs. | Impulsion + huit tirs. |
| SYN_050 | Substitution et appât | PSV_096 Substitution instinctive + PSV_080 Poupée d’entraînement | emergente | Deux sources d’esquive indépendantes (bûche puis poupée). | Coups évités cumulés. |
| SYN_051 | Lévitation minée | PSV_115 Lévitation de chakra + PSV_027 Parchemins-pièges | emergente | Au-dessus des fosses, vos mines restent au-dessus du vide (elles fonctionnent). | Mine active au-dessus d’une fosse. |
| SYN_052 | Sage des crapauds | PSV_144 Nature du sage + PSV_062 Gamakichi | emergente | Immobile, Gamakichi et vous frappez plus fort. | Bonus ×1,5 actif à l’arrêt. |
| SYN_053 | Portes et lotus | PSV_092 Porte de la Vie + ACT_030 Lotus primaire | emergente | Le lotus coûte de la santé : dangereux avec un contenant en moins. | Coût payé, pas un dommage. |
| SYN_054 | Fil et fūma | PSV_007 Fil de chakra + PSV_013 Fūma shuriken | emergente | Le fūma revient déjà : le ricochet ajoute trois rebonds à l’aller. | Rebonds avant retour. |
| SYN_055 | Arsenal complet | PSV_024 Arsenal de Tenten (empreinte) + PSV_004 Parchemin des mille aiguilles | emergente | Salves de quatre senbon : couverture maximale, dégâts unitaires faibles. | Douze projectiles par cycle. |
| SYN_056 | Canon et sceau de la mort | PSV_014 Canon de chakra + PSV_131 Sceau de la mort (empreinte) | emergente | Rayon ×2 de dégâts, santé réduite : combinaison volontairement dominante mais fragile. | Dégâts doublés, deux contenants de moins. |
| SYN_057 | Frappe céleste guidée | PSV_020 Chute céleste + PSV_005 Kunai à marque de téléportation | emergente | Le réticule ne se guide pas (règle) : le guidage n’a pas d’effet sur la frappe. | Réticule inchangé. |
| SYN_058 | Clone de relais armé | PSV_023 Clone de relais + PSV_028 Chidori nagashi (empreinte) | emergente | Le clone copie les impacts : sa foudre s’enchaîne aussi (génération 1). | Chaîne issue du clone. |
| SYN_059 | Onde et chaîne | PSV_029 Poing de Doton + PSV_028 Chidori nagashi (empreinte) | emergente | Chaque impact : onde puis chaîne (budget partagé). | Deux effets secondaires par impact. |
| SYN_060 | Artiste complet | PSV_110 Argile infinie + PSV_019 Argile explosive C1 | emergente | Bombes d’argile sans risque pour vous (immunité aux explosions). | Aucun dégât subi par ses propres bombes. |
| SYN_061 | Yōton — Lave | natures : katon + doton | fusion | Feu et terre : vos impacts laissent une coulée de lave qui brûle et ralentit. | Flaque de lave à l’impact, brûlure et ralentissement. |
| SYN_062 | Futton — Vapeur | natures : katon + suiton | fusion | Feu et eau : vos impacts libèrent une vapeur brûlante qui ronge et ralentit. | Nuage de vapeur à l’impact, dégâts par seconde. |
| SYN_063 | Shakuton — Incandescence | natures : katon + futon | fusion | Feu et vent : les ennemis en feu subissent 40 % de dégâts en plus ; en mourant, ils embrasent leurs voisins. | Dégâts ×1,4 sur cible brûlée ; brûlure propagée à la mort. |
| SYN_064 | Ranton — Tempête | natures : raiton + suiton | fusion | Foudre et eau : vos impacts laissent une flaque électrisée qui foudroie ce qui s’y tient. | Flaque électrique : décharges et paralysie brève. |
| SYN_065 | Jiton — Sable de fer | natures : futon + doton | fusion | Vent et terre : vos impacts aimantent les ennemis proches vers le point touché ; tirs légèrement guidés. | Ennemis attirés vers l’impact. |
| SYN_066 | Mokuton — Bois | natures : doton + suiton | fusion | Terre et eau : des racines jaillissent à l’impact (30 %) et immobilisent la cible et ses voisins. | Immobilisation de groupe à l’impact. |
| SYN_067 | Hyōton — Glace | natures : futon + suiton | fusion | Vent et eau : vos tirs gèlent (20 %) ; un ennemi gelé éclate en éclats de glace. | Gel puis éclats à la mort. |
| SYN_068 | Bakuton — Explosion | natures : doton + raiton | fusion | Terre et foudre : chaque impact déclenche une petite détonation. | Explosion à chaque impact. |
| SYN_069 | Jinton — Particule | natures : katon + futon + doton | fusion | Feu, vent et terre : toutes les six émissions, un rayon de particules désintègre tout ce qu’il traverse. | Rayon blanc perçant ×3 tous les six tirs. |
| SYN_070 | Éclair jaune de Konoha | PSV_005 Kunai à marque de téléportation + PSV_031 Kunai du vent | dediee | Marque et vent : tirs bien plus rapides et guidés, déplacement +0,3. | Vitesse de tir +2, guidage visible. |
| SYN_071 | Manteau à une queue | PSV_055 Chakra du renard + PSV_056 Bulle de chakra rouge | dediee | Blessé, le chakra du renard vous enveloppe 5 s : dégâts +1, vitesse +0,4, brûlure au contact. | Manteau visible après un coup reçu. |
| SYN_072 | Gamayu Endan | PSV_057 Crapaud d’huile + PSV_043 Grande boule de feu (empreinte) | dediee | Huile et feu : vos impacts s’embrasent en larges nappes de feu. | Nappe de feu large à l’impact. |
| SYN_073 | Danse du camélia | PSV_060 Os de l’ossature + PSV_090 Ossature renforcée | dediee | Os renforcés : trois ricochets de plus et dégâts +0,8. | Os qui ricochent davantage. |
| SYN_074 | Amaterasu et Tsukuyomi | PSV_053 Flammes noires + PSV_049 Genjutsu du regard | dediee | Le regard qui brûle : les ennemis confus subissent 25 % de dégâts en plus ; confusion +8 %. | Dégâts ×1,25 sur cible confuse. |
| SYN_075 | Corbeaux d’illusion | PSV_067 Corbeau messager + PSV_049 Genjutsu du regard | dediee | Chaque élimination a 25 % de chances de rendre confus les ennemis proches. | Confusion de groupe après une élimination. |
| SYN_076 | Ange de papier | PSV_075 Papillons de papier + PSV_116 Ailes de papier | dediee | Toutes les six émissions, une pluie de shuriken de papier s’abat sur les ennemis. | Pluie tous les six tirs. |
| SYN_077 | Mer de papiers | PSV_155 Shuriken de papier + PSV_156 Mer de papiers explosifs | dediee | Vos papiers sont piégés : chaque impact détone. | Explosion à l’impact des papiers. |
| SYN_078 | Culte de Jashin | PSV_054 Marque de Jashin + PSV_135 Rituel du sang | dediee | Chaque coup reçu : dégâts +0,5 pour la salle (jusqu’à quatre fois). | Bonus cumulé après plusieurs coups. |
| SYN_079 | Les cinq cœurs | PSV_129 Contrat de Kakuzu + PSV_089 Cœur volé | dediee | Chaque boss vaincu vous offre un contenant de vitalité. | Contenant ajouté après un boss. |
| SYN_080 | Maîtresse des armes | PSV_145 Pluie d’armes + PSV_024 Arsenal de Tenten (empreinte) | dediee | La pluie d’armes tombe deux fois plus souvent. | Pluie supplémentaire tous les cinq tirs. |
| SYN_081 | Kirin | PSV_147 Lance de foudre + PSV_028 Chidori nagashi (empreinte) | dediee | Toutes les huit émissions, la foudre tombe du ciel sur l’ennemi le plus proche (×4) et s’enchaîne. | Éclair céleste tous les huit tirs. |
| SYN_082 | Armure du Raikage | PSV_058 Armure de foudre + PSV_045 Courant foudroyant | dediee | Vitesse +0,3 ; quand on vous frappe, une décharge paralyse les ennemis proches. | Paralysie de groupe après un coup reçu. |
| SYN_083 | Rasenshuriken parfait | PSV_146 Rasenshuriken (empreinte) + PSV_144 Nature du sage | dediee | Le tourbillon de vent s’élargit : explosions de rayon 2,2. | Rayon d’explosion mesuré à 2,2 tuiles. |
| SYN_084 | Réceptacle éveillé | PSV_141 Cœur du réceptacle + PSV_132 Rage du réceptacle | dediee | À santé basse, chaque coup reçu réveille le manteau de la bête (8 s). | Manteau à santé basse. |
| SYN_085 | Venin de Sasori | PSV_048 Poison de scorpion + PSV_142 Main du scorpion | dediee | Un ennemi empoisonné qui meurt libère un nuage de venin sur ses voisins. | Poison propagé à la mort. |
| SYN_086 | Les trois Sannin | PSV_062 Gamakichi + PSV_063 Katsuyu miniature + PSV_064 Serpent des manches | dediee | Crapaud, limace et serpent : familiers +25 % et un demi-cœur rendu toutes les quatre salles. | Soin à la 4e salle, familiers renforcés. |
| SYN_087 | Équipe 7 | PSV_001 Empreinte du Rasengan + PSV_028 Chidori nagashi (empreinte) + PSV_040 Gants de taijutsu | dediee | Rasengan, Chidori et force de Sakura : dégâts +1,5, cadence +0,3. | Statistiques augmentées. |
| SYN_088 | Ino-Shika-Chō | PSV_051 Ombre liante + PSV_012 Baika (expansion) + PSV_049 Genjutsu du regard | dediee | Ombre, expansion et esprit : les ennemis immobilisés subissent 50 % de dégâts en plus. | Dégâts ×1,5 sur cible immobilisée. |
| SYN_089 | Ruche d’Aburame | PSV_070 Kikaichū + PSV_153 Ruche de chakra | dediee | Poison +15 % ; une élimination sur cinq libère un essaim pour la salle. | Essaim temporaire après une élimination. |
| SYN_090 | Défense absolue du sable | PSV_150 Tempête de sable + PSV_097 Armure de sable absolue | dediee | Un orbital de sable de plus ; ralentissement +20 %. | Orbitaux supplémentaires, ralenti fréquent. |
| SYN_091 | Lame du vent | PSV_017 Empreinte du Kubikiribōchō + PSV_046 Lame de vent | dediee | Le grand sabre porte le vent : portée +1, dégâts ×1,15. | Frappe étendue plus longue. |
| SYN_092 | Lotus de la porte | PSV_092 Porte de la Vie + PSV_041 Cadence de la fleur de lotus | dediee | Cadence ×1,15 et vitesse +0,4. | Cadence et vitesse augmentées. |
| SYN_093 | Poing souple | PSV_113 Byakugan (empreinte) + PSV_040 Gants de taijutsu | dediee | Vos coups ferment les points de chakra : ralentissement 25 %, dégâts +0,4. | Ralenti fréquent. |
| SYN_094 | Gardiens de Katsuyu | PSV_063 Katsuyu miniature + PSV_093 Chakra de la limace | dediee | Katsuyu soigne un demi-cœur toutes les quatre salles (doublé par la limace). | Soin à la 4e salle. |
| SYN_095 | Sceau maudit, niveau 2 | PSV_091 Sceau maudit + PSV_133 Volonté du feu | dediee | À santé basse, un coup reçu déploie les ailes du sceau : lévitation et dégâts +1 pour la salle. | Lévitation à santé basse. |
| SYN_096 | Onde du démon | PSV_055 Chakra du renard + PSV_098 Chakra du démon scellé | dediee | Dégâts +1 ; chaque coup reçu libère une onde de chakra rouge autour de vous. | Explosion autour du joueur après un coup. |

## Objectifs de déblocage (OBJ) — 60

| ID | Nom | Condition | Débloque |
|---|---|---|---|
| OBJ_001 | Premier sceau brisé | bossVaincus ≥ 1 (cumulé) | PSV_026 Croix de sceaux, PSV_027 Parchemins-pièges |
| OBJ_002 | Le traître démasqué | vaincre Mizuki | PSV_013 Fūma shuriken |
| OBJ_003 | Hors de la forêt | vaincre Serpent géant | PSV_064 Serpent des manches, PSV_078 Serpent blanc |
| OBJ_004 | Le démon du brouillard | vaincre Zabuza | CHR_004 Kakashi, PSV_017 Empreinte du Kubikiribōchō |
| OBJ_005 | Miroirs brisés | vaincre Haku | PSV_081 Miroirs de glace, PSV_050 Glace éternelle |
| OBJ_006 | Les frères démons | vaincre Les frères démons | PSV_007 Fil de chakra |
| OBJ_007 | Fils coupés | vaincre Kankurō et Karasu | PSV_072 Karasu, PSV_073 Kuroari, PSV_074 Sanshōuo |
| OBJ_008 | Trio dissonant | vaincre Le trio du Son | PSV_029 Poing de Doton |
| OBJ_009 | Le sable se tait | vaincre Gaara | CHR_005 Rock Lee, PSV_097 Armure de sable absolue |
| OBJ_010 | Os brisés | vaincre Kimimaro | PSV_060 Os de l’ossature, PSV_090 Ossature renforcée |
| OBJ_011 | La carapace tombe | vaincre Sasori | PSV_142 Main du scorpion |
| OBJ_012 | Regard perçant | secretsTrouves ≥ 5 (cumulé) | CHR_006 Hinata, PSV_113 Byakugan (empreinte) |
| OBJ_013 | Soigneur démasqué | vaincre Kabuto | PSV_087 Sceau de régénération |
| OBJ_014 | Requin échoué | vaincre Kisame | PSV_136 Écailles de Samehada |
| OBJ_015 | Stratégie de l’examen | epreuvesChunin ≥ 2 (cumulé) | CHR_007 Shikamaru, PSV_051 Ombre liante |
| OBJ_016 | Rituel rompu | vaincre Hidan | PSV_054 Marque de Jashin, PSV_135 Rituel du sang |
| OBJ_017 | Première fin | vaincre Orochimaru | PSV_143 Mue du serpent, ACT_031 Rituel de permutation |
| OBJ_018 | Protection absolue | état : protections3 | CHR_008 Gaara |
| OBJ_019 | L’art éclate | vaincre Deidara | PSV_019 Argile explosive C1, PSV_071 Oiseau d’argile, PSV_110 Argile infinie |
| OBJ_020 | Au-delà de l’illusion | vaincre Itachi | PSV_053 Flammes noires, ACT_017 Amaterasu (empreinte), ACT_018 Tsukuyomi (empreinte) |
| OBJ_021 | Marionnettiste | état : familiers3 | CHR_009 Kankurō |
| OBJ_022 | Cinq cœurs | vaincre Kakuzu | PSV_089 Cœur volé, PSV_129 Contrat de Kakuzu |
| OBJ_023 | La douleur apaisée | vaincre Pain | ACT_019 Répulsion divine, ACT_020 Attraction céleste |
| OBJ_024 | Compagnon fidèle | sallesFamiliers ≥ 30 (cumulé) | CHR_010 Kiba |
| OBJ_025 | Masque brisé | vaincre Obito | ACT_021 Espace-temps intangible |
| OBJ_026 | Gardien apaisé | vaincre Le Gardien du Sceau | ACT_016 Invocation : grand crapaud, PSV_115 Lévitation de chakra |
| OBJ_027 | Maître des marionnettes | vaincre Sasori sans dégâts | CHR_011 Sasori |
| OBJ_028 | Rival ancien | vaincre Madara (empreinte) | PSV_020 Chute céleste, ACT_026 Forêt naissante |
| OBJ_029 | Dix queues | vaincre Empreinte des Dix Queues | PSV_014 Canon de chakra |
| OBJ_030 | Fortune | état : ryo50 | CHR_012 Kakuzu, PSV_121 Carte de membre de l’échoppe |
| OBJ_031 | Collectionneur | état : objets12 | PSV_126 Livre de l’ermite, PSV_120 Collier à deux charmes |
| OBJ_032 | Premier pacte | pactes ≥ 1 (cumulé) | PSV_091 Sceau maudit, PSV_139 Transfert du pacte |
| OBJ_033 | Explorateur | rochersSceau ≥ 10 (cumulé) | PSV_114 Rouleau des voies secrètes, PSV_106 Épingle de crochetage |
| OBJ_034 | Métamorphose | transformations ≥ 1 (cumulé) | PSV_146 Rasenshuriken (empreinte), PSV_152 Encre vivante |
| OBJ_035 | Client fidèle | achats ≥ 15 (cumulé) | PSV_124 Réputation de client, PSV_122 Coupon du marchand |
| OBJ_036 | Donateur | dons ≥ 50 (cumulé) | PSV_123 Livret d’épargne |
| OBJ_037 | Technique scellée | actifsUtilises ≥ 30 (cumulé) | ACT_024 Rasenshuriken, ACT_027 Sceau de scellement |
| OBJ_038 | Chasseur | eliminations ≥ 500 (cumulé) | PSV_145 Pluie d’armes, ACT_025 Dragons de feu |
| OBJ_039 | Deuxième fin | fin RTE_02 | PSV_131 Sceau de la mort (empreinte), ACT_029 Transfert d’esprit |
| OBJ_040 | Réceptacle | fin RTE_01 avec Naruto | ALT_001 Naruto — Réceptacle fissuré |
| OBJ_041 | Vengeance | fin RTE_01 avec Sasuke | ALT_002 Sasuke — Serment de vengeance |
| OBJ_042 | Centaine | fin RTE_01 avec Sakura | ALT_003 Sakura — Sceau de la centaine |
| OBJ_043 | Shukaku | fin RTE_01 avec Gaara | ALT_004 Gaara — Shukaku déchaîné |
| OBJ_044 | Trois marionnettes | fin RTE_01 avec Kankurō | ALT_005 Kankurō — Trois marionnettes |
| OBJ_045 | Cœurs de réserve | fin RTE_01 avec Kakuzu | ALT_006 Kakuzu — Cinq cœurs |
| OBJ_046 | Lumière | fin RTE_03 | PSV_144 Nature du sage, ACT_027 Sceau de scellement |
| OBJ_047 | Ombre | fin RTE_04 | PSV_140 Réincarnation impure (empreinte), ACT_021 Espace-temps intangible |
| OBJ_048 | Conseil | fin RTE_05 | DEF_010 Course de l’examen, DEF_011 Collectionneur pressé |
| OBJ_049 | Brèche | fin RTE_06 | PSV_020 Chute céleste |
| OBJ_050 | Difficile | fin  en Difficile | DEF_012 Examen de jōnin |
| OBJ_051 | Défi : taijutsu | fin  du défi DEF_001 | PSV_040 Gants de taijutsu, PSV_092 Porte de la Vie |
| OBJ_052 | Défi : obscurité | fin  du défi DEF_002 | PSV_079 Luciole des ermites |
| OBJ_053 | Défi : sans héritage | fin  du défi DEF_003 | PSV_109 Parchemin d’invocation vide |
| OBJ_054 | Défi : un seul cœur | fin  du défi DEF_004 | PSV_096 Substitution instinctive |
| OBJ_055 | Défi : explosifs | fin  du défi DEF_005 | PSV_100 Parchemins à fragmentation, PSV_102 Parchemins incendiaires, PSV_103 Parchemins chercheurs |
| OBJ_056 | Défi : clones | fin  du défi DEF_006 | PSV_023 Clone de relais |
| OBJ_057 | Défi : marchand | fin  du défi DEF_007 | PSV_125 Dés de la grande perdante |
| OBJ_058 | Défi : pacte | fin  du défi DEF_008 | PSV_098 Chakra du démon scellé |
| OBJ_059 | Défi : sable | fin  du défi DEF_009 | PSV_150 Tempête de sable |
| OBJ_060 | Défi : conseil | fin  du défi DEF_012 | PSV_146 Rasenshuriken (empreinte) |

## Défis — contrats de mission (DEF) — 12

| ID | Nom | Règles | Récompense |
|---|---|---|---|
| DEF_001 | Taijutsu pur | Rock Lee imposé ; aucune salle d’héritage. Atteindre la première fin. | Gants de taijutsu, Porte de la Vie |
| DEF_002 | Nuit sans lune | Tous les étages sont plongés dans la pénombre. Première fin. | Luciole |
| DEF_003 | Mains vides | Aucune salle d’héritage ; les boss donnent tout. Première fin. | Parchemin vide |
| DEF_004 | Un souffle | Un seul contenant, jamais plus ; les contenants deviennent des réserves. | Substitution instinctive |
| DEF_005 | Artificier | Départ avec Argile explosive et Argile infinie ; première fin. | Parchemins spéciaux |
| DEF_006 | Mille clones | Naruto imposé, départ avec deux Clones de l’ombre et Multi-clonage ; dégâts −30 %. Première fin. | Clone de relais |
| DEF_007 | Tout s’achète | Départ avec 50 Ryō et la Carte de membre ; aucune salle d’héritage. | Dés de la grande perdante |
| DEF_008 | Sang pour sang | Chaque boss ouvre un pacte ; aucun sanctuaire. | Chakra du démon |
| DEF_009 | Tempête du désert | Gaara imposé avec Sable en orbite et Sable protecteur ; première fin. | Tempête de sable |
| DEF_010 | Course de l’examen | Première fin en moins de 20 minutes (chronomètre de partie). | Marque de vitesse |
| DEF_011 | Collectionneur pressé | Atteindre l’étage 6 avec au moins 10 objets passifs (réussi dès l’arrivée). | Défi |
| DEF_012 | Examen de jōnin | Mode Difficile imposé ; une salle d’épreuve à chaque étage (à partir du 2), une épreuve de boss aux étages 4, 6 et 8. Première fin. | Rasenshuriken |

## Secrets (SEC) — 15

| ID | Nom | Indice en jeu | Solution |
|---|---|---|---|
| SEC_001 | Cache de renseignements | Deux salles partagent un mur où rien ne passe… | Emplacement voisin d’au moins deux salles ordinaires (souvent trois) ; un explosif contre le mur l’ouvre. |
| SEC_002 | Chambre isolée | Une salle ordinaire, un seul voisin : le vide derrière elle. | Case voisine d’exactement une salle de combat et de rien d’autre. |
| SEC_003 | Rocher à sceau | Une spirale claire sur un rocher. | Un explosif le brise : réserve, clé, explosifs ou Ryō. |
| SEC_004 | Statue du pacte | Le serpent de pierre du laboratoire regarde vers vous. | Un explosif réveille une mue gardienne qui garde un objet de pacte. |
| SEC_005 | Statue du sanctuaire | Le crapaud de pierre semble dormir. | Un explosif le réveille ; vaincu, il laisse un fragment de la clé des ermites. |
| SEC_006 | Clé des ermites | Deux fragments font une clé. | Deux crapauds gardiens vaincus : la clé ouvre le rayon de la Lumière même après un pacte. |
| SEC_007 | Autel de tribut | Le sang nourrit la pierre, par paliers. | Paliers stockés (1 à 12) : Ryō, coffres, réserves, objets du sanctuaire, faveur, puis objet de pacte avec cicatrice. |
| SEC_008 | Brèche instable | Arriver tôt au dernier gardien. | Salle du boss de l’étage 8 atteinte en moins de 30:00 : une fissure s’ouvre après la victoire. |
| SEC_009 | Conseil des épreuves | Les juges n’attendent pas les retardataires. | Boss de l’étage 6 vaincu en moins de 20:00. |
| SEC_010 | Pont de débris | Un rocher près d’une fosse… | Faire exploser un rocher adjacent à une fosse la comble (pont). |
| SEC_011 | Pakkun le fin limier | Les chiens ont du flair. | Kakashi et Pakkun signalent un mur secret en entrant dans une salle qui en possède un. |
| SEC_012 | Refuser un pacte | Les ermites observent ceux qui repartent les mains vides. | Visiter une salle de pacte sans acheter augmente le poids du sanctuaire (+0,25 par refus). |
| SEC_013 | Machines fragiles | Une loterie n’aime pas les explosions. | Un explosif détruit une machine : 2 à 4 Ryō ou demi-cœurs. |
| SEC_014 | Marchand de pierre | La statue de l’échoppe cache sa caisse. | Un explosif sur la statue libère 3 à 6 Ryō (une fois). |
| SEC_015 | Chaînes de la fin | Dans les profondeurs, les chaînes cèdent après le combat. | Variante « Chambre des chaînes » : les blocs de chaîne s’effacent quand la salle est nettoyée. |

## Avertissements de validation

- PSV_900 : dans aucun pool (obtenable seulement par une source spéciale)
- PSV_901 : dans aucun pool (obtenable seulement par une source spéciale)
- ACT_050 : dans aucun pool (obtenable seulement par une source spéciale)
