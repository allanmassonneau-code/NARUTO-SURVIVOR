# E bis — Fiches de contenu générées

> Produit par `outils/catalogues.mjs` depuis les données du jeu (v12). Ne pas éditer : modifier les données puis relancer. Le texte d’analyse (pactes, économie, routes, secrets) est dans `E_contenu.md`.

Unités : santé en demis (1 contenant = 2 demis) ; distances en tuiles de 32 px (t) ; vitesses en tuiles par seconde ; durées en secondes. « Coup d’étage » = ½ unité aux étages 1 à 4, 1 unité aux étages 5 et plus.

## 1. Roster jouable — 12 personnages et 6 variantes altérées

### CHR_001 — Naruto

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | 3 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | kunai, projectile simple |
| Statistiques | Dég. 3,5 · Cad. 2,5 tirs/s · Portée 6 t · Vit. tir 9 t/s · Vit. 4,5 t/s · Chance 0 |
| Actif de départ | ACT_002 Multi-clonage |
| Règle exclusive | Obstination : à la dernière demi-unité de santé, +1 dégâts jusqu’à la fin de la salle. |
| Faiblesse | Aucune : personnage de référence. |
| Difficulté | ★☆☆ |
| Déblocage | disponible dès le départ |
| Identité visuelle | Cheveux en pointes blonds, bandeau, tenue orange. Deux signes : silhouette capillaire et orange. |
| Directions de build | 1. Armée de clones (Multi-clonage + familiers tireurs) 2. Orbe chargé (Empreinte du Rasengan) 3. Vent tranchant (Fūton, percement) |

### CHR_002 — Sasuke

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | 3 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | shuriken, forme charge_libre |
| Statistiques | Dég. 3,5 · Cad. 2,5 tirs/s · Portée 6,5 t · Vit. tir 10 t/s · Vit. 4,6 t/s · Chance 0 |
| Actif de départ | ACT_003 Chidori |
| Règle exclusive | Foudre concentrée : le tir se charge (maintenir, relâcher). Dégâts ×0,5 à ×3 ; à pleine charge, le shuriken perce et enchaîne la foudre. |
| Faiblesse | Tir rapide faible sans charge ; exige de relâcher au bon moment. |
| Difficulté | ★★☆ |
| Déblocage | disponible dès le départ |
| Identité visuelle | Cheveux sombres en pointes arrière, tenue bleu nuit, shuriken tournoyants. |
| Directions de build | 1. Foudre en chaîne (Raiton + charge) 2. Rayon chargé (fusion de charges) 3. Frappe éclair (actif Chidori + protection) |

### CHR_003 — Sakura

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | 3 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | poing, projectile simple |
| Statistiques | Dég. 4 · Cad. 2,2 tirs/s · Portée 4,5 t · Vit. tir 8 t/s · Vit. 4,4 t/s · Chance 0 |
| Actif de départ | ACT_004 Ōkashō |
| Règle exclusive | Contrôle du chakra : les soins excédentaires sont stockés (6 demis au plus) et renforcent Ōkashō. Elle peut ramasser la vitalité à pleine santé. |
| Faiblesse | Courte portée. |
| Difficulté | ★☆☆ |
| Déblocage | disponible dès le départ |
| Identité visuelle | Cheveux roses courts, bandeau en serre-tête, tenue rouge. |
| Directions de build | 1. Réserve de soins (cœurs + actif) 2. Frappe courte renforcée 3. Sanctuaires (santé pleine préservée) |

### CHR_004 — Kakashi

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | 3 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | kunai, projectile simple |
| Statistiques | Dég. 3,5 · Cad. 2,5 tirs/s · Portée 6,5 t · Vit. tir 9,5 t/s · Vit. 4,6 t/s · Chance 1 |
| Actif de départ | ACT_006 Invocation des chiens ninja |
| Départ | FAM_PAKKUN Pakkun |
| Règle exclusive | Ninja copieur : deux emplacements d’actif (échange avec le bouton supérieur gauche). Pakkun signale les murs secrets de la salle. |
| Faiblesse | Statistiques moyennes : sa force vient des actifs. |
| Difficulté | ★★☆ |
| Déblocage | OBJ_004 « Le démon du brouillard » : vaincre Zabuza |
| Identité visuelle | Cheveux argentés inclinés, masque, bandeau sur l’œil, gilet vert. |
| Directions de build | 1. Double actif (Réécriture d’empreinte + actif offensif) 2. Foudre (Raikiri) 3. Chasse aux secrets |

### CHR_005 — Rock Lee

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | 3 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | coup, forme lame |
| Statistiques | Dég. 5 · Cad. 2,4 tirs/s · Portée 1,7 t · Vit. tir 9 t/s · Vit. 5,2 t/s · Chance 0 |
| Actif de départ | ACT_007 Porte de l’Ouverture |
| Règle exclusive | Taijutsu pur : frappe au corps-à-corps (arc de 100°). Les coups détruisent les projectiles ennemis ordinaires. Les objets de tir sont convertis (table de conversion). |
| Faiblesse | Exposition au contact ; pas de tir à distance sans objet. |
| Difficulté | ★★☆ |
| Déblocage | OBJ_009 « Le sable se tait » : vaincre Gaara |
| Identité visuelle | Coupe au bol, sourcils épais, combinaison verte, jambières orange. |
| Directions de build | 1. Huit Portes (actif + vitesse) 2. Frappe étendue (lame longue) 3. Contre-attaque (protections + contact) |

### CHR_006 — Hinata

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | 3 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | paume, projectile simple |
| Statistiques | Dég. 3 · Cad. 2,6 tirs/s · Portée 4,5 t · Vit. tir 9 t/s · Vit. 4,5 t/s · Chance 0 |
| Actif de départ | ACT_008 Protection des huit trigrammes |
| Règle exclusive | Byakugan : le plan de l’étage et la cache de renseignements sont révélés. Ses paumes percent les ennemis. |
| Faiblesse | Dégâts faibles. |
| Difficulté | ★☆☆ |
| Déblocage | OBJ_012 « Regard perçant » : secretsTrouves ≥ 5 (cumulé) |
| Identité visuelle | Longs cheveux indigo, yeux pâles sans pupille, veste lavande. |
| Directions de build | 1. Percement multiple 2. Défense rotative (actif + orbitaux) 3. Exploration totale |

### CHR_007 — Shikamaru

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | 2 contenant(s) de vitalité, 2 demis de protection |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | kunai_ombre, projectile simple |
| Statistiques | Dég. 3,2 · Cad. 2,3 tirs/s · Portée 6 t · Vit. tir 8,5 t/s · Vit. 4,3 t/s · Chance 1 |
| Actif de départ | ACT_009 Manipulation des ombres |
| Règle exclusive | Stratège : chaque salle d’héritage propose deux objets au choix ; ses kunai immobilisent parfois (15 % + 3 % par point de chance, 50 % au plus). |
| Faiblesse | Peu de vitalité, dégâts modestes. |
| Difficulté | ★★☆ |
| Déblocage | OBJ_015 « Stratégie de l’examen » : epreuvesChunin ≥ 2 (cumulé) |
| Identité visuelle | Queue de cheval en ananas, gilet vert, regard las. |
| Directions de build | 1. Contrôle (immobilisation + dégâts de zone) 2. Choix multiples (pools riches) 3. Pièges et mines |

### CHR_008 — Gaara

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | 2 contenant(s) de vitalité, 4 demis de protection |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | sable, projectile simple |
| Statistiques | Dég. 3,8 · Cad. 2 tirs/s · Portée 6 t · Vit. tir 7,5 t/s · Vit. 3,7 t/s · Chance 0 |
| Actif de départ | ACT_010 Cercueil de sable |
| Règle exclusive | Bouclier de sable : absorbe le premier coup reçu dans chaque salle de combat non nettoyée ; vitesse de base réduite. |
| Faiblesse | Lent : difficile d’esquiver les charges. |
| Difficulté | ★★☆ |
| Déblocage | OBJ_018 « Protection absolue » : état : protections3 |
| Identité visuelle | Cheveux rouges, cernes sombres, marque au front, gourde dans le dos. |
| Directions de build | 1. Armure de sable (orbitaux) 2. Frappe différée (sable qui tombe) 3. Protection cumulée |

### CHR_009 — Kankurō

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | 3 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | lame_poison, projectile simple, émis depuis la marionnette |
| Statistiques | Dég. 3,4 · Cad. 2,4 tirs/s · Portée 6,5 t · Vit. tir 9 t/s · Vit. 4,3 t/s · Chance 0 |
| Actif de départ | ACT_011 Kuroari : piège |
| Départ | FAM_KARASU Karasu (marionnette) |
| Règle exclusive | Marionnettiste : ses tirs partent de Karasu, qui flotte entre lui et la direction visée et bloque les projectiles qui le touchent. |
| Faiblesse | Point d’émission décalé ; Karasu peut être contourné. |
| Difficulté | ★★☆ |
| Déblocage | OBJ_021 « Marionnettiste » : état : familiers3 |
| Identité visuelle | Capuche noire à oreilles, peintures violettes, marionnette bandée dans le dos. |
| Directions de build | 1. Arsenal de marionnettiste 2. Poison cumulé 3. Familiers tireurs |

### CHR_010 — Kiba

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | 3 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | griffe, projectile simple |
| Statistiques | Dég. 3,8 · Cad. 2,4 tirs/s · Portée 4 t · Vit. tir 9 t/s · Vit. 4,8 t/s · Chance 0 |
| Actif de départ | ACT_012 Crocs sur crocs |
| Départ | FAM_AKAMARU Akamaru |
| Règle exclusive | Flair : Akamaru attaque au contact et creuse (10 % de trouver une ressource à la fin d’une salle nettoyée). |
| Faiblesse | Portée courte. |
| Difficulté | ★☆☆ |
| Déblocage | OBJ_024 « Compagnon fidèle » : sallesFamiliers ≥ 30 (cumulé) |
| Identité visuelle | Cheveux bruns en bataille, crocs rouges sur les joues, veste grise, Akamaru. |
| Directions de build | 1. Meute d’invocation 2. Charge de contact 3. Économie (fouille) |

### CHR_011 — Sasori

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | aucun contenant de vitalité, 6 demis de protection |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | senbon, projectile simple |
| Statistiques | Dég. 3,5 · Cad. 2,5 tirs/s · Portée 6 t · Vit. tir 9 t/s · Vit. 4,4 t/s · Chance 0 |
| Actif de départ | ACT_013 Pluie de senbon empoisonnés |
| Règle exclusive | Corps de marionnette : aucun contenant de vitalité. Les contenants obtenus deviennent une réserve de chakra ; la vitalité au sol est ignorée. Senbon empoisonnés (35 %). |
| Faiblesse | Aucun soin de vitalité ; les pactes coûtent des réserves. |
| Difficulté | ★★★ (expert) |
| Déblocage | OBJ_027 « Maître des marionnettes » : vaincre Sasori sans dégâts |
| Identité visuelle | Cheveux roux, manteau noir à nuages rouges, regard vide. |
| Directions de build | 1. Réserve de protection 2. Poison et marionnettes 3. Pactes payés en réserves |

### CHR_012 — Kakuzu

| | |
|---|---|
| Statut | personnage canonique — règles adaptées au labyrinthe |
| Santé initiale | 2 contenant(s) de vitalité |
| Ressources | 10 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | element, projectile simple, 3 tirs en éventail |
| Statistiques | Dég. 3,4 · Cad. 2,2 tirs/s · Portée 6 t · Vit. tir 9 t/s · Vit. 4,3 t/s · Chance 0 |
| Actif de départ | ACT_014 Fils de Jiongu |
| Règle exclusive | Avarice : trois tirs élémentaires en éventail. Blessé, chaque Ryō ramassé soigne une demi-unité au lieu d’être gardé. Trois contenants au plus ; pactes payés 15 Ryō par contenant. |
| Faiblesse | Santé plafonnée, dépend de l’économie. |
| Difficulté | ★★★ (expert) |
| Déblocage | OBJ_030 « Fortune » : état : ryo50 |
| Identité visuelle | Capuche et masque sombres, yeux verts sur fond rouge, manteau à nuages. |
| Directions de build | 1. Boutique et relances 2. Machines et informateurs 3. Tir multiple élémentaire |

### ALT_001 — Naruto — Réceptacle fissuré (variante de Naruto)

| | |
|---|---|
| Statut | variante altérée — création originale |
| Santé initiale | 1 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | kunai, projectile simple |
| Statistiques | Dég. 3,5 · Cad. 2,5 tirs/s · Portée 6 t · Vit. tir 9 t/s · Vit. 4,5 t/s · Chance 0 |
| Actif de départ | ACT_050 Relais |
| Règle nouvelle | Clones comme ressource : jusqu’à 4 clones l’accompagnent et tirent (35 % des dégâts). Un coup reçu fait disparaître un clone avant la santé. Chaque salle de combat nettoyée rend un clone. |
| Faiblesse | Un seul contenant ; perdre tous les clones laisse très exposé. |
| Difficulté | ★★★ (expert) |
| Déblocage | OBJ_040 « Réceptacle » : fin RTE_01 avec Naruto |
| Identité visuelle | Silhouette de Naruto, teinte #6a2a1a |
| Directions de build | 1. Armée permanente 2. Explosion de relais 3. Protection par le nombre |

### ALT_002 — Sasuke — Serment de vengeance (variante de Sasuke)

| | |
|---|---|
| Statut | variante altérée — création originale |
| Santé initiale | 1 contenant(s) de vitalité, 4 demis de chakra instable |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | shuriken, forme charge_libre |
| Statistiques | Dég. 3,5 · Cad. 2,5 tirs/s · Portée 6 t · Vit. tir 9 t/s · Vit. 4,5 t/s · Chance 0 |
| Actif de départ | ACT_003 Chidori |
| Règle nouvelle | Pactes spécifiques : après chaque boss, une salle de pacte s’ouvre toujours, jamais un sanctuaire. Un pacte lui coûte 3 demis de chakra instable par contenant. +0,5 dégâts par pacte conclu. |
| Faiblesse | Aucun sanctuaire ; vitalité quasi nulle. |
| Difficulté | ★★★ (expert) |
| Déblocage | OBJ_041 « Vengeance » : fin RTE_01 avec Sasuke |
| Identité visuelle | Silhouette de Sasuke, teinte #3a1a4a |
| Directions de build | 1. Collection de pactes 2. Chakra instable 3. Charge démesurée |

### ALT_003 — Sakura — Sceau de la centaine (variante de Sakura)

| | |
|---|---|
| Statut | variante altérée — création originale |
| Santé initiale | 2 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | poing, projectile simple |
| Statistiques | Dég. 4 · Cad. 2,2 tirs/s · Portée 4,5 t · Vit. tir 8 t/s · Vit. 4,4 t/s · Chance 0 |
| Actif de départ | ACT_004 Ōkashō |
| Règle nouvelle | Santé fragmentée : deux contenants au plus. Tout soin au-delà remplit le sceau (12 demis) qui rend automatiquement la santé quand elle tombe à la dernière demi-unité. |
| Faiblesse | Plafond de deux contenants : les pactes sont très coûteux. |
| Difficulté | ★★☆ |
| Déblocage | OBJ_042 « Centaine » : fin RTE_01 avec Sakura |
| Identité visuelle | Silhouette de Sakura, teinte #4a1a3a |
| Directions de build | 1. Réserve infinie de soins 2. Évitement de pactes 3. Ōkashō chargé |

### ALT_004 — Gaara — Shukaku déchaîné (variante de Gaara)

| | |
|---|---|
| Statut | variante altérée — création originale |
| Santé initiale | 1 contenant(s) de vitalité, 6 demis de protection |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | sable, projectile simple, tir différé |
| Statistiques | Dég. 3,8 · Cad. 2 tirs/s · Portée 6 t · Vit. tir 7,5 t/s · Vit. 3,5 t/s · Chance 0 |
| Actif de départ | ACT_010 Cercueil de sable |
| Règle nouvelle | Tirs différés : le sable s’arrête à mi-course et reste suspendu (12 grains au plus). Relâcher la visée fait converger tous les grains vers la dernière direction. |
| Faiblesse | Demande d’anticiper ; peu efficace contre les cibles rapides. |
| Difficulté | ★★★ (expert) |
| Déblocage | OBJ_043 « Shukaku » : fin RTE_01 avec Gaara |
| Identité visuelle | Silhouette de Gaara, teinte #5a4a1a |
| Directions de build | 1. Nuage de sable 2. Pièges suspendus 3. Explosion de grains |

### ALT_005 — Kankurō — Trois marionnettes (variante de Kankurō)

| | |
|---|---|
| Statut | variante altérée — création originale |
| Santé initiale | 3 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | lame_poison, projectile simple, émis depuis la marionnette |
| Statistiques | Dég. 3,4 · Cad. 2,4 tirs/s · Portée 6,5 t · Vit. tir 9 t/s · Vit. 4,3 t/s · Chance 0 |
| Actif de départ | ACT_011 Kuroari : piège |
| Départ | FAM_KARASU Karasu (marionnette) |
| Règle nouvelle | Marionnettes échangeables (bouton supérieur gauche) : Karasu (éventail de lames), Kuroari (orbe lent qui immobilise), Sanshōuo (bouclier frontal, tir faible). |
| Faiblesse | Changer de marionnette coûte 0,5 s sans tir. |
| Difficulté | ★★☆ |
| Déblocage | OBJ_044 « Trois marionnettes » : fin RTE_01 avec Kankurō |
| Identité visuelle | Silhouette de Kankurō, teinte #2a3a4a |
| Directions de build | 1. Rotation des trois 2. Bouclier permanent 3. Immobilisation + poison |

### ALT_006 — Kakuzu — Cinq cœurs (variante de Kakuzu)

| | |
|---|---|
| Statut | variante altérée — création originale |
| Santé initiale | 1 contenant(s) de vitalité |
| Ressources | 0 Ryō, 0 clé(s), 1 explosif(s) |
| Tir principal | element, projectile simple, 3 tirs en éventail |
| Statistiques | Dég. 3,4 · Cad. 2,2 tirs/s · Portée 6 t · Vit. tir 9 t/s · Vit. 4,3 t/s · Chance 0 |
| Actif de départ | ACT_014 Fils de Jiongu |
| Règle nouvelle | Inventaire reconstruit : à chaque nouvel étage, un passif au hasard est remplacé par un autre de même qualité. Quatre cœurs de réserve : à la mort, il se relève avec un contenant et en perd un. |
| Faiblesse | Le build change sans cesse ; un seul contenant. |
| Difficulté | ★★★ (expert) |
| Déblocage | OBJ_045 « Cœurs de réserve » : fin RTE_01 avec Kakuzu |
| Identité visuelle | Silhouette de Kakuzu, teinte #1a3a2a |
| Directions de build | 1. Adaptation permanente 2. Qualité élevée 3. Survie par résurrections |

## 2. Boss — 25 fiches, attaque par attaque

Chaque attaque suit le même cycle : **préparation** (télégraphe visible et sonore), **phase active**, **récupération** (boss vulnérable et immobile), puis une pause de 0,6 s par défaut. Aucune attaque n’exige un objet : toutes s’esquivent à la vitesse de base (4,5 t/s) et avec le tir de départ. Les attaques ne se répètent jamais deux fois de suite ; une « recharge » impose un délai minimal entre deux usages.

### BOS_001 — Mizuki, « Le traître de l’Académie »

Étage 1 · 170 PV · déplacement errance (1,8 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Kunai en éventail, grand shuriken revenant, charges.

Phases :

- à 50 % des PV — « Mizuki perd son sang-froid ! » : le boss accélère : déplacements, préparations, récupérations et projectiles ×1,25.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| salve | 3 projectile(s) visé(s) × 2 rafales, écart 0,25 rad, 5,5 t/s | 0,45 s | 0,5 s | 0,5 s | coup d’étage | se décaler perpendiculairement |
| fuma | grand shuriken (2,2×) vers vous, 1,6 s, qui revient vers le lanceur | 0,6 s | 1,6 s | 0,6 s | coup d’étage | esquiver l’aller, puis le retour qui recoupe la salle |
| charge | charge en ligne droite (8,5 t/s) jusqu’au mur | 0,55 s | 1,2 s | 0,9 s | coup d’étage | sortir de la ligne annoncée ; frapper pendant la récupération |

### BOS_002 — Serpent géant, « Gardien de la Forêt de la Mort »

Étage 1 · 200 PV · déplacement errance (1,4 t/s) · contact coup d’étage · création originale.

Charges, plongée sous terre et crachats en éventail.

Mise en place : corps de 6 anneaux qui suivent la tête et blessent au contact (dessinés, avec ombre).

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| charge | charge en ligne droite (9 t/s) jusqu’au mur, anneau à l’impact | 0,6 s | 1,3 s | 1 s | coup d’étage | sortir de la ligne annoncée ; frapper pendant la récupération |
| terrier | le boss s’enfouit et vous suit sous terre (90 px/s) ; fissure 0,5 s avant la sortie, puis anneau de 8 | 0,3 s | 1,6 s | 0,8 s | coup d’étage | bouger dès que le sol se fend ; traverser l’anneau |
| crachat | 5 projectile(s) visé(s), écart 0,3 rad, 4,5 t/s | 0,5 s | 0,5 s | 0,6 s | coup d’étage | se décaler perpendiculairement |

### BOS_003 — Les frères démons, « Duo aux griffes enchaînées »

Étage 1 · 110 PV · déplacement poursuite (1,9 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Deux adversaires reliés par une chaîne dangereuse quand elle se tend.

Mise en place : deux frères liés par une chaîne : grise au repos, orange au-delà de 90 px, rouge clignotant et blessante au-delà de 110 px.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| charge | charge en ligne droite (8 t/s) jusqu’au mur | 0,55 s | 1,1 s | 0,8 s | coup d’étage | sortir de la ligne annoncée ; frapper pendant la récupération |
| griffe | arc de 120° à 1,8 tuiles | 0,45 s | 0,5 s | 0,5 s | coup d’étage | reculer hors de l’arc |

### BOS_004 — Zabuza, « Le démon du brouillard »

Étage 2 · 300 PV · déplacement errance (1,6 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Disparaît dans la brume (yeux visibles) et réapparaît sabre levé.

Mise en place : se fond dans la brume pendant son attaque de disparition (yeux rouges visibles).

Phases :

- à 45 % des PV — « Le brouillard s’épaissit… » : le boss accélère : déplacements, préparations, récupérations et projectiles ×1,25.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| sabre | arc de 150° à 2,8 tuiles + 3 lames projetées | 0,55 s | 0,5 s | 0,7 s | coup d’étage | reculer hors de l’arc |
| brume | invisible et intangible (seuls les yeux rouges trahissent sa position) ; réapparaît derrière vous et enchaîne une attaque annoncée 0,6 s | 0,4 s | 1,8 s | 0,3 s | selon l’attaque enchaînée | suivre les yeux ; se retourner et sortir de l’arc annoncé |
| dragon | 3 projectile(s) visé(s) × 3 rafales, écart 0,18 rad, 4,2 t/s | 0,6 s | 0,5 s | 0,6 s | coup d’étage | se décaler perpendiculairement |
| clones | appelle 2 × Ninja de la brume (2 au plus) | 0,6 s | 0,5 s | 0,4 s | — | éliminer ou contourner les invocations |

### BOS_005 — Haku, « Les miroirs de glace »

Étage 2 · 260 PV · déplacement aucun (2,2 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Passe de miroir en miroir ; les miroirs se brisent sous les coups.

Mise en place : 6 miroirs de glace (22 PV, sans contact) disposés en cercle ; ils ne comptent pas pour nettoyer la salle.

Phases :

- à 50 % des PV — « Le cercle de miroirs se resserre ! » : le boss accélère : déplacements, préparations, récupérations et projectiles ×1,25.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| saut | passe d’un miroir intact à un autre | 0,3 s | 0,4 s | 0,3 s | — | briser les miroirs (22 PV) réduit ses positions |
| senbon | chaque miroir intact tire un senbon vers vous (5,5 t/s), un toutes les 0,15 s | 0,5 s | 1,2 s | 0,6 s | coup d’étage | se placer pour que les tirs viennent du même côté ; briser des miroirs |
| salve | 5 projectile(s) visé(s), écart 0,12 rad, 6 t/s | 0,5 s | 0,5 s | 0,5 s | coup d’étage | se décaler perpendiculairement |

### BOS_006 — Kankurō et Karasu, « Le marionnettiste »

Étage 3 · 140 PV · déplacement fuite (1,4 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Frappez le marionnettiste caché : sa marionnette tombera.

Mise en place : Kankurō se cache loin de vous ; Karasu (marionnette, 5× PV) attaque ; vaincre Kankurō fait tomber Karasu.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| gaz | 2 flaque(s) acide de 1,2 tuile(s), 5 s | 0,6 s | 0,5 s | 1,2 s | coup d’étage | éviter les flaques (elles blessent après 0,6 s de formation) |
| salve | 3 projectile(s) visé(s), écart 0,25 rad, 5 t/s | 0,5 s | 0,5 s | 0,8 s | coup d’étage | se décaler perpendiculairement |

### BOS_007 — Le trio du Son, « Trois épreuves en une »

Étage 3 · 95 PV · déplacement errance (1,6 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Trois adversaires aux rôles distincts : ondes, souffle, clochettes.

Mise en place : trois boss liés : Dosu (ondes), Zaku (souffle en spirale), Kin (clochettes acides, senbon) ; la salle se termine quand les trois tombent.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| onde | 1 onde(s) en expansion à brèche (3,4 t/s) | 0,6 s | 0,5 s | 0,8 s | coup d’étage | traverser par la brèche |
| salve | 3 projectile(s) visé(s), écart 0,2 rad, 5,5 t/s | 0,4 s | 0,5 s | 0,6 s | coup d’étage | se décaler perpendiculairement |

### BOS_008 — Kimimaro, « La danse des os »

Étage 3 · 340 PV · déplacement poursuite (1,8 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Balles d’os, lances qui percent le sol en lignes, danse circulaire.

Phases :

- à 40 % des PV — « Une forêt d’os jaillit ! » : le boss accélère : déplacements, préparations, récupérations et projectiles ×1,25.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| balles | 1 projectile(s) visé(s) × 5 rafales, écart 0,22 rad, 8 t/s | 0,45 s | 0,5 s | 0,6 s | coup d’étage | se décaler perpendiculairement |
| lances | 7 impacts en ligne vers vous (210 px, r 14 px, préavis 0,55 s), puis 5 sur une seconde ligne décalée | 0,4 s | 1,4 s | 0,6 s | coup d’étage | sortir latéralement de la ligne |
| danse | arc de 360° à 2 tuiles | 0,6 s | 0,5 s | 0,8 s | coup d’étage | reculer hors de l’arc |

### BOS_009 — Gaara, « L’enfermement de sable »

Étage 4 · 380 PV · déplacement aucun (1 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Le sable enferme l’arène : cercueils au sol, vagues avec une brèche, pluie de sable.

Mise en place : parure de sable en orbite (visuelle ; aucune réduction de dégâts).

Phases :

- à 50 % des PV — « Le sable se referme sur l’arène ! » : une bande de sable d’une tuile avance depuis les murs en 2,5 s (sans effet pendant l’avancée) ; dedans, vitesse ×0,55 et, après 1,2 s sans en sortir, une touche (un anneau se referme sous les pieds) ; elle se retire à la mort de Gaara.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| cercueil | cercle de 26 px sous vos pieds, se referme en 0,9 s | 0,2 s | 1,2 s | 0,6 s | 2 coups d’étage | sortir du cercle avant la fermeture |
| shuriken | 5 projectile(s) visé(s), écart 0,22 rad, 4,8 t/s | 0,45 s | 0,5 s | 0,5 s | coup d’étage | se décaler perpendiculairement |
| vague | 3 anneaux de sable en expansion sur toute la salle, 0,7 s d’écart, chacun avec une brèche | 0,7 s | 2,2 s | 0,6 s | coup d’étage | passer par la brèche (orientée vers vous, ± aléa) |
| pluie | 10 impacts (r 0,8 t, préavis 0,8 s), un sur trois sur vous | 0,5 s | 0,5 s | 0,6 s | coup d’étage | rester mobile hors des cercles |

### BOS_010 — Sasori, « Le maître des marionnettes »

Étage 4 · 360 PV · déplacement errance (1 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Carapace blindée puis sable de fer.

Mise en place : carapace d’Hiruko : dégâts subis ×0,5 (teinte brune visible) jusqu’à sa rupture.

Phases :

- à 55 % des PV — « L’armure d’Hiruko se brise ! » : la carapace se brise : plus de réduction de dégâts, nouvelles attaques de sable de fer ; invulnérable 0,6 s (anneau visible).

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| queue | charge en ligne droite (7 t/s) jusqu’au mur | 0,6 s | 1 s | 0,8 s | coup d’étage | sortir de la ligne annoncée ; frapper pendant la récupération |
| aiguilles | 7 projectile(s) visé(s), écart 0,14 rad, 5 t/s | 0,55 s | 0,5 s | 0,6 s | coup d’étage | se décaler perpendiculairement |
| sable_fer (phase 2) | 3 flaque(s) acide de 1 tuile(s), 4 s | 0,6 s | 0,5 s | 0,6 s | coup d’étage | éviter les flaques (elles blessent après 0,6 s de formation) |
| anneau (phase 2) | anneau de 14 à brèche × 2 vagues, 3,8 t/s | 0,5 s | 0,5 s | 0,7 s | coup d’étage | passer par la brèche |

### BOS_011 — Kabuto, « Le médecin des ombres »

Étage 5 · 380 PV · déplacement poursuite (1,7 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Se soigne de 10 % en canalisant 2 s (20 dégâts l’interrompent ; trois fois au plus, espacées de 10 s) ; réanime des sujets.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| scalpel | charge en ligne droite (10 t/s) jusqu’au mur | 0,45 s | 0,8 s | 0,6 s | coup d’étage | sortir de la ligne annoncée ; frapper pendant la récupération |
| cadavres — recharge 8 s | appelle 2 × Sujet expérimental (3 au plus) | 0,7 s | 0,5 s | 0,4 s | — | éliminer ou contourner les invocations |
| soin — recharge 10 s — 3 fois au plus | cercle vert : canalise 2 s un soin de 10 % des PV max (20 dégâts l’interrompent) | 0,2 s | 2 s | 0,5 s | — (soin) | concentrer les tirs pendant la canalisation |
| salve | 3 projectile(s) visé(s) × 2 rafales, écart 0,2 rad, 6 t/s | 0,4 s | 0,5 s | 0,5 s | coup d’étage | se décaler perpendiculairement |

### BOS_012 — Kisame, « Le requin de la brume »

Étage 5 · 440 PV · déplacement poursuite (1,7 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Inonde l’arène (l’eau vous ralentit, pas lui) ; requins d’eau chercheurs.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| requins | 4 requins d’eau chercheurs (guidage 1,4 rad/s, 3 s), 0,25 s d’écart | 0,5 s | 1,5 s | 0,6 s | coup d’étage | tourner autour, les faire percuter les obstacles |
| inondation | 3 flaque(s) eau de 1,6 tuile(s), 8 s | 0,6 s | 0,5 s | 0,4 s | coup d’étage | éviter les flaques (elles blessent après 0,6 s de formation) |
| samehada | arc de 160° à 2,6 tuiles | 0,55 s | 0,5 s | 0,7 s | coup d’étage | reculer hors de l’arc |
| prison | cercle de 22 px sous vous (préavis 0,8 s), puis flaque lente 5 s | 0,2 s | 1,4 s | 0,6 s | coup d’étage, puis ralentissement | sortir du cercle ; éviter la flaque ensuite |

### BOS_013 — Hidan, « Le rituel immortel »

Étage 5 · 400 PV · déplacement poursuite (1,7 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Si sa faux vous touche, il vous marque ; dans son cercle, il se blesse… et vous aussi. Interrompez le rituel (25 dégâts pendant sa canalisation).

Mise en place : cercle rituel au centre de l’arène.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| faux | faux lancée vers vous, aller-retour ; si elle touche, vous êtes marqué 8 s | 0,6 s | 1,4 s | 0,6 s | coup d’étage + marque | esquiver aller et retour ; sans marque, le rituel échoue |
| rituel | si vous êtes marqué : canalisation de 2,2 s dans son cercle (25 dégâts l’interrompent) | 0,3 s | 2,2 s | 0,6 s | 1 unité à terme | frapper le boss pendant la canalisation, ou éviter la marque |
| charge | charge en ligne droite (8,5 t/s) jusqu’au mur | 0,5 s | 1 s | 0,8 s | coup d’étage | sortir de la ligne annoncée ; frapper pendant la récupération |

### BOS_014 — Orochimaru, « Les mues du serpent »

Étage 6 · 520 PV · déplacement errance (1,7 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

À chaque mue, la peau abandonnée devient hostile et il réapparaît ailleurs.

Phases :

- à 66 % des PV — « Orochimaru mue ! » : la peau abandonnée devient une Mue hostile (30 PV) ; le boss réapparaît ailleurs, invulnérable 0,8 s.
- à 33 % des PV — « Il mue encore… huit têtes se dressent ! » : la peau abandonnée devient une Mue hostile (30 PV) ; le boss réapparaît ailleurs, invulnérable 0,8 s.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| serpents | 5 projectile(s) visé(s) × 2 rafales, écart 0,18 rad, 5 t/s | 0,5 s | 0,5 s | 0,6 s | coup d’étage | se décaler perpendiculairement |
| epee | ligne annoncée 0,5 s puis lame jusqu’au mur (6 px) | 0,7 s | 0,5 s | 0,7 s | coup d’étage | sortir de la ligne |
| invocation | appelle 2 × Serpent blanc géant (2 au plus) | 0,6 s | 0,5 s | 0,4 s | — | éliminer ou contourner les invocations |
| huit (phase 3) | 8 lignes de serpents en étoile (18 px × 300 px), une toutes les 0,22 s, préavis 0,55 s chacune | 0,8 s | 2,4 s | 0,8 s | coup d’étage | se placer entre deux lignes annoncées |

### BOS_015 — Deidara, « L’art est une explosion »

Étage 7 · 460 PV · déplacement errance (2 t/s) · volant · contact coup d’étage · personnage canonique — motifs de combat originaux.

Argile explosive sous toutes ses formes ; C3 : mettez-vous à l’abri derrière un bloc.

Phases :

- à 35 % des PV — « Deidara prépare sa grande œuvre (C3) ! » : débloque la grande œuvre C3.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| araignees | appelle 3 × Araignée d’argile (5 au plus) | 0,5 s | 0,5 s | 0,4 s | — | éliminer ou contourner les invocations |
| oiseaux | appelle 2 × Oiseau d’argile (4 au plus) | 0,5 s | 0,5 s | 0,4 s | — | éliminer ou contourner les invocations |
| bombes | 8 impacts (r 1,1 t, préavis 1 s), un sur trois sur vous | 0,5 s | 0,5 s | 0,6 s | coup d’étage | rester mobile hors des cercles |
| c3 (phase 2) | cercle sur toute la salle 2,8 s ; des blocs apparaissent aux quatre coins | 0,4 s | 3 s | 1 s | 2 unités si le boss vous voit | se cacher derrière un bloc (ligne de vue coupée) |

### BOS_016 — Itachi, « Les illusions du corbeau »

Étage 7 · 480 PV · déplacement errance (1,6 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Seul le vrai Itachi projette une ombre ; ses clones éclatent en corbeaux.

Mise en place : seul le vrai Itachi projette une ombre ; les illusions n’en ont pas.

Phases :

- à 40 % des PV — « Un guerrier spectral se dresse (miroir frontal). » : rempart spectral frontal (±60°) qui arrête tirs, rayons et frappes venant de face (pas les explosions) ; il pivote vers vous à 1,1 rad/s ; dressé 4 s (vacille les 0,6 dernières), dissipé 2,5 s.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| clones | 3 illusions (1 PV, sans ombre) tirent des projectiles visés ; le vrai se téléporte | 0,5 s | 2 s | 0,5 s | coup d’étage (tirs des illusions) | repérer celui qui projette une ombre |
| boule | 1 projectile(s) visé(s), écart 0,22 rad, 3,5 t/s | 0,6 s | 0,5 s | 0,6 s | coup d’étage | se décaler perpendiculairement |
| flammes | 3 flaque(s) feu_ennemi de 1 tuile(s), 6 s, la première sous vous | 0,7 s | 0,5 s | 0,6 s | coup d’étage | éviter les flaques (elles blessent après 0,6 s de formation) |
| tsukuyomi (phase 2) | écran rouge 3 s ; 5 anneaux de 12 à brèche, un toutes les 0,55 s | 0,8 s | 3 s | 0,8 s | coup d’étage | enchaîner les brèches |

### BOS_017 — Kakuzu, « Les cinq cœurs »

Étage 7 · 300 PV · déplacement errance (1,4 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Trois masques élémentaires l’accompagnent ; sa peau durcie (grise) réduit les dégâts de 70 % pendant 1,8 s, visiblement.

Mise en place : 3 masques élémentaires (feu en anneau, vent en éventail, foudre visée) ; la peau durcie grise signale la réduction ×0,3.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| poing | charge en ligne droite (9 t/s) jusqu’au mur | 0,5 s | 1 s | 0,8 s | coup d’étage | sortir de la ligne annoncée ; frapper pendant la récupération |
| durcir | peau grise 1,8 s : dégâts subis ×0,3 (visible) | 0,2 s | 1,8 s | 0,3 s | — | esquiver, garder ses ressources pour après |
| fils | 6 projectile(s) visé(s), écart 0,25 rad, 4,6 t/s | 0,5 s | 0,5 s | 0,6 s | coup d’étage | se décaler perpendiculairement |

### BOS_018 — Pain, « Les forces d’attraction »

Étage 8 · 560 PV · déplacement errance (1,2 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Repousse (et détruit vos tirs), attire en tirant en anneau, puis crée une sphère d’attraction.

Phases :

- à 50 % des PV — « Une sphère attire les rochers vers le ciel ! » : le boss accélère : déplacements, préparations, récupérations et projectiles ×1,25.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| repulsion | vous repousse, efface vos tirs en vol ; touche à moins de 2 tuiles | 0,8 s | 0,3 s | 0,8 s | coup d’étage | ne pas rester collé au boss |
| attraction | vous attire (force 2,3) et tire des anneaux de 10 | 0,6 s | 2 s | 0,6 s | coup d’étage | marcher contre la force entre les anneaux |
| tiges | 3 projectile(s) visé(s) × 3 rafales, écart 0,15 rad, 7 t/s | 0,45 s | 0,5 s | 0,5 s | coup d’étage | se décaler perpendiculairement |
| betes (phase 2) | appelle 1 × Bête invoquée (2 au plus) | 0,6 s | 0,5 s | 0,4 s | — | éliminer ou contourner les invocations |
| sphere (phase 2) | noyau central (60 PV) qui vous attire pendant 3,2 s ; s’il survit, il explose (2 tuiles) | 0,8 s | 3,2 s | 1 s | 1 unité (explosion) | marcher contre la force, détruire le noyau ou s’éloigner en fin |

### BOS_023 — Konan, « L’ange de papier »

Étage 8 · 520 PV · déplacement errance (1,7 t/s) · volant · contact coup d’étage · personnage canonique — motifs de combat originaux.

Éventails de shuriken de papier, papillons qui explosent au contact, pluie d’étiquettes explosives ; à 40 % la mer de papiers et des charges ailées.

Phases :

- à 40 % des PV — « Une mer de papiers explosifs recouvre la salle ! » : le boss accélère : déplacements, préparations, récupérations et projectiles ×1,25.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| shuriken | 5 projectile(s) visé(s) × 2 rafales, écart 0,2 rad, 5,5 t/s | 0,45 s | 0,5 s | 0,5 s | coup d’étage | se décaler perpendiculairement |
| papillons | appelle 3 × Papillon de papier (6 au plus) | 0,5 s | 0,5 s | 0,4 s | — | éliminer ou contourner les invocations |
| etiquettes | 9 impacts (r 1 t, préavis 1 s), un sur trois sur vous | 0,5 s | 0,5 s | 0,6 s | coup d’étage | rester mobile hors des cercles |
| ailes | anneau de 14 à brèche × 2 vagues, 4,2 t/s | 0,6 s | 0,5 s | 0,6 s | coup d’étage | passer par la brèche |
| lance (phase 2) | charge en ligne droite (9,5 t/s) jusqu’au mur | 0,55 s | 1 s | 0,8 s | coup d’étage | sortir de la ligne annoncée ; frapper pendant la récupération |
| mer (phase 2) | 20 impacts (r 1,1 t, préavis 1,1 s), un sur trois sur vous | 0,7 s | 0,5 s | 1 s | coup d’étage | rester mobile hors des cercles |

### BOS_019 — Obito, « Les changements de présence »

Étage 8 · 460 PV · déplacement errance (1,6 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Intangible sauf quand il se matérialise pour attaquer (annonce, attaque, récupération).

Mise en place : intangible hors de ses attaques : il se matérialise dès l’annonce et jusqu’à la fin de la récupération.

Phases :

- à 50 % des PV — « Le masque se fissure. » : le boss accélère : déplacements, préparations, récupérations et projectiles ×1,25.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| saisie | se matérialise près de vous 1,4 s ; cercle de 34 px 0,35 s plus tard (préavis 0,45 s) | 0,2 s | 1,3 s | 0,9 s | coup d’étage | sortir du cercle puis le frapper tant qu’il est matériel |
| boule | 3 projectile(s) visé(s), écart 0,3 rad, 4 t/s | 0,6 s | 0,5 s | 0,6 s | coup d’étage | se décaler perpendiculairement |
| vortex | matérialisé 2 s, absorbe vos tirs à moins de 40 px puis les renvoie en anneau (3 + absorbés, 12 au plus) | 0,6 s | 1,8 s | 0,6 s | coup d’étage | cesser de tirer à bout portant ; passer entre les tirs renvoyés |
| chaines (phase 2) | rayon jusqu’au mur (14 px), balayage 1,2 rad/s | 0,8 s | 0,6 s | 0,6 s | coup d’étage | sortir de la ligne, puis devancer le balayage |

### BOS_020 — Le Gardien du Sceau, « Celui qui tient le labyrinthe »

Étage 9 (terminal) · 800 PV · déplacement errance (1 t/s) · volant · contact coup d’étage · création originale.

Arène évolutive : des blocs apparaissent entre les phases ; chaînes balayantes.

Phases :

- à 66 % des PV — « Le labyrinthe se réarrange ! » : les blocs de l’arène sont redistribués (jamais à moins de 2 tuiles de vous).
- à 33 % des PV — « Le sceau vacille ! » : les blocs de l’arène sont redistribués (jamais à moins de 2 tuiles de vous).

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| chaines | rayon jusqu’au mur (14 px), balayage 0,9 rad/s | 0,9 s | 0,8 s | 0,6 s | coup d’étage | sortir de la ligne, puis devancer le balayage |
| anneaux | 3 onde(s) en expansion à brèche (3,2 t/s) | 0,6 s | 0,5 s | 0,6 s | coup d’étage | traverser par la brèche |
| spirale | spirale à 3 bras, un tir toutes les 0,12 s | 0,6 s | 2,5 s | 0,6 s | coup d’étage | tourner dans le sens de la spirale à distance |
| arene | les blocs de l’arène sont redistribués (jamais à moins de 2 tuiles de vous) | 0,6 s | 0,6 s | 0,4 s | — | se repositionner, rechercher les nouvelles lignes de tir |

### BOS_021 — Madara (empreinte), « L’ancien rival »

Étage 9 (terminal) · 900 PV · déplacement errance (1,6 t/s) · contact coup d’étage · personnage canonique — motifs de combat originaux.

Attaques massives : météore (abri : loin du centre marqué), dragons de bois, grands balayages.

Phases :

- à 50 % des PV — « Un guerrier géant l’entoure. » : le boss accélère : déplacements, préparations, récupérations et projectiles ×1,25.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| meteore | cercle de 3 tuiles sur votre position, 10 projectiles à l’impact | 1,6 s | 0,2 s | 0,8 s | 2 unités | quitter le cercle, puis esquiver les éclats |
| feu | spirale à 4 bras, un tir toutes les 0,1 s | 0,6 s | 2 s | 0,6 s | coup d’étage | tourner dans le sens de la spirale à distance |
| bois | 3 dragons de bois chercheurs (2,4×, guidage 1 rad/s, 3,2 s), ils brisent les obstacles | 0,6 s | 1,6 s | 0,6 s | coup d’étage | les attirer en arc large ; ne pas compter sur la couverture |
| sabre | arc de 180° à 3,2 tuiles + 3 lames projetées | 0,7 s | 0,5 s | 0,8 s | coup d’étage | reculer hors de l’arc |

### BOS_022 — Empreinte des Dix Queues, « La brèche instable »

Étage 8 (terminal) · 1000 PV · déplacement aucun (1,4 t/s) · contact 1 unité · création originale d’après une créature célèbre.

Immobile et gigantesque : queues balayantes, rayon, anneaux à brèche.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| queues | 3 balayages de queue (arc 40°, 200 px) décalés de 0,35 s, préavis 0,5 s chacun | 0,8 s | 1,2 s | 0,6 s | 1 unité | sortir des arcs annoncés, se rapprocher entre deux |
| bombe | rayon jusqu’au mur (14 px) | 1,2 s | 0,8 s | 1 s | coup d’étage | sortir de la ligne |
| pluie | 14 impacts (r 1 t, préavis 0,9 s), un sur trois sur vous | 0,5 s | 0,5 s | 0,6 s | coup d’étage | rester mobile hors des cercles |
| anneau | anneau de 18 à brèche × 3 vagues, 3,4 t/s | 0,6 s | 0,5 s | 0,6 s | coup d’étage | passer par la brèche |

### BOS_M01 — Mue gardienne, « Gardienne du pacte »

Mini-boss de statue · 150 PV · déplacement errance (1,4 t/s) · contact coup d’étage · création originale.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| charge | charge en ligne droite (9 t/s) jusqu’au mur | 0,55 s | 1 s | 0,8 s | coup d’étage | sortir de la ligne annoncée ; frapper pendant la récupération |
| anneau | anneau de 10, 4 t/s | 0,5 s | 0,5 s | 0,6 s | coup d’étage | se glisser entre deux projectiles |

### BOS_M02 — Crapaud gardien, « Gardien du sanctuaire »

Mini-boss de statue · 150 PV · déplacement errance (1,4 t/s) · contact coup d’étage · création originale.

| Attaque | Zone | Prépa. | Active | Récup. | Dégâts | Réponse attendue |
|---|---|---|---|---|---|---|
| saut | saut sur votre position, cercle de 1,6 tuiles, anneau de 8 à l’atterrissage | 0,5 s | 0,7 s | 0,7 s | coup d’étage | quitter le cercle annoncé |
| langue | 1 projectile(s) visé(s), écart 0,22 rad, 9 t/s | 0,4 s | 0,5 s | 0,5 s | coup d’étage | se décaler perpendiculairement |

## 3. Ennemis par fonction — 76 archétypes

La silhouette annonce la fonction (voir D §3). Les chiffres sont ceux des données : PV bruts avant multiplicateurs de champion.

| Comportement | Nombre | PV | Vitesse (t/s) | Archétypes |
|---|---|---|---|---|
| poursuivant | 11 | 8–30 | 1,1–2,1 | ENM_001 Poupée d’entraînement animée, ENM_002 Genin renégat, ENM_007 Serpent de la forêt, ENM_030 Scorpion des sables, ENM_044 Marionnette errante, ENM_050 Sujet expérimental, ENM_055 Garde du Son, ENM_062 Ninja de la brume, ENM_070 Zetsu blanc (armée), ENM_074 Bête invoquée, ENM_094 Ombre de chakra |
| chargeur | 7 | 11–30 | 1,3–1,6 | ENM_010 Tigre de la forêt, ENM_018 Genin fonceur, ENM_035 Marionnette à lames, ENM_051 Serpent blanc géant, ENM_065 Déserteur au sabre, ENM_078 Shinobi de l’Alliance égaré, ENM_095 Queue de chakra |
| volant | 6 | 5–16 | 1,5–2,6 | ENM_005 Chauve-souris, ENM_034 Esprit de sable, ENM_045 Marionnette volante, ENM_057 Chauve-souris d’expérience, ENM_064 Méduse de chakra, ENM_092 Hirondelle des ermites |
| lourd | 6 | 22–44 | 0,8–1 | ENM_008 Sangsue géante, ENM_017 Gardien des archives, ENM_031 Momie de sable, ENM_047 Marionnette géante, ENM_052 Porteur du sceau maudit, ENM_073 Marionnette humaine |
| invocateur | 6 | 16–30 | 0–1 | ENM_015 Instructeur déchu, ENM_019 Invocateur d’herbes hautes, ENM_038 Marionnettiste caché, ENM_058 Assistant de laboratoire, ENM_068 Nid de serpenteaux, ENM_076 Invocateur aux tiges |
| tireur_predictif | 4 | 10–22 | 1,3–1,4 | ENM_011 Ninja de la pluie, ENM_040 Ninja du Son, ENM_056 Tireur du Son, ENM_075 Sentinelle de la pluie |
| poseur | 4 | 10–20 | 1,2–1,3 | ENM_013 Araignée tisseuse, ENM_041 Poseur de sceaux de sable, ENM_060 Poseur de parchemins explosifs, ENM_079 Poseur d’argile |
| tireur | 3 | 9–16 | 1–1,1 | ENM_003 Lanceur de kunai, ENM_033 Ninja de Suna à l’éventail, ENM_063 Clone de glace |
| sauteur | 3 | 12–30 | 1–1,2 | ENM_006 Crapaud d’égout, ENM_090 Crapaud gardien, ENM_093 Crapaud bondissant |
| rampant | 3 | 14–22 | 2,2–2,6 | ENM_009 Mille-pattes fouisseur, ENM_032 Ver des sables, ENM_067 Requin des canaux |
| nuee | 3 | 3–5 | 2,4–2,6 | ENM_012 Nuée de moustiques, ENM_039 Araignée mécanique, ENM_059 Nuée de serpenteaux |
| tourelle | 3 | 12–26 | 0–0 | ENM_016 Tourelle à parchemins, ENM_037 Marionnette lanceuse, ENM_077 Masque élémentaire |
| embusque | 3 | 12–20 | 1,6–1,8 | ENM_020 Racine griffue, ENM_053 Zetsu blanc, ENM_066 Assassin de la brume |
| lanceur_arc | 3 | 14–26 | 0–0,9 | ENM_036 Lanceur de jarres, ENM_054 Cuve vivante, ENM_091 Crapaud cracheur d’huile |
| guerisseur | 3 | 12–20 | 1,4–1,4 | ENM_043 Médecin de Suna, ENM_061 Ninja médical, ENM_081 Zetsu soigneur |
| kamikaze | 3 | 6–12 | 2,4–2,8 | ENM_071 Oiseau d’argile, ENM_072 Araignée d’argile, ENM_096 Papillon de papier |
| inerte | 2 | 8–16 | 1,8–2,2 | ENM_014 Jarre hantée, ENM_046 Marionnette inerte |
| protecteur | 2 | 22–40 | 0,7–0,9 | ENM_042 Marionnette bouclier, ENM_080 Statue de pierre |
| errant | 1 | 4–4 | 3–3 | ENM_004 Rat des sous-sols |

## 4. Thèmes et variantes d’étage — 10 thèmes, 18 variantes

### THM_ACA — Sous-sols de l’Académie (chapitre 1)

| | |
|---|---|
| Sol / murs | planches / briques ; obstacles : rond ; lumière chaude |
| Décor | cible, parchemin, lanterne |
| Musique | gamme yo, 88 bpm, timbre koto |
| Ennemis par rôle | p : ENM_002/ENM_001 · t : ENM_003 · v : ENM_005 · c : ENM_018 · s : ENM_006 · i : ENM_015 · e : ENM_014 · f : ENM_016 · n : ENM_004 · q : ENM_003 · l : ENM_017 · m : ENM_013 · r : ENM_009 · g : ENM_001 · h : ENM_002 |
| Variantes | FLR_ACA_1 « Salles d’entraînement » — Jarres et caisses fréquentes : plus de ressources cachées, moins de couverture solide. ; FLR_ACA_2 « Archives inondées » — Des flaques d’eau ralentissent la marche (pas le vol). |

### THM_FOR — Forêt de la Mort (chapitre 1)

| | |
|---|---|
| Sol / murs | terre / racines ; obstacles : souche ; lumière verte |
| Décor | champignon, fougere, os |
| Musique | gamme in, 80 bpm, timbre flute |
| Ennemis par rôle | p : ENM_007/ENM_002 · t : ENM_011 · v : ENM_005/ENM_012 · c : ENM_010 · s : ENM_006 · i : ENM_019 · e : ENM_020 · f : ENM_016 · n : ENM_012 · q : ENM_011 · l : ENM_008 · m : ENM_013 · r : ENM_009 · g : ENM_008 · h : ENM_002 |
| Variantes | FLR_FOR_1 « Sous-bois » — Des toiles collantes ralentissent ; le feu les détruit. ; FLR_FOR_2 « Racines géantes » — Plus d’obstacles : couverture abondante, lignes de tir coupées. |

### THM_SUN — Cavernes de Suna (chapitre 2)

| | |
|---|---|
| Sol / murs | sable / roche ; obstacles : bloc ; lumière chaude |
| Décor | os, jarre_sable, cristal |
| Musique | gamme ryukyu, 92 bpm, timbre koto |
| Ennemis par rôle | p : ENM_030/ENM_031 · t : ENM_033 · v : ENM_034 · c : ENM_035 · s : ENM_036 · i : ENM_038 · e : ENM_032 · f : ENM_037 · n : ENM_039 · q : ENM_040 · l : ENM_031 · m : ENM_041 · r : ENM_032 · g : ENM_042 · h : ENM_043 |
| Variantes | FLR_SUN_1 « Grottes de sable » — Des sables mouvants ralentissent et attirent vers leur centre. ; FLR_SUN_2 « Galeries de verre » — Des cristaux font rebondir les projectiles (alliés et ennemis). |

### THM_MAR — Ateliers de marionnettes (chapitre 2)

| | |
|---|---|
| Sol / murs | dalles / planches ; obstacles : caisse ; lumière violette |
| Décor | bras, fil, lanterne |
| Musique | gamme in, 96 bpm, timbre koto |
| Ennemis par rôle | p : ENM_044/ENM_030 · t : ENM_037 · v : ENM_045 · c : ENM_035 · s : ENM_036 · i : ENM_038 · e : ENM_046 · f : ENM_037 · n : ENM_039 · q : ENM_040 · l : ENM_047 · m : ENM_041 · r : ENM_032 · g : ENM_042 · h : ENM_043 |
| Variantes | FLR_MAR_1 « Atelier » — Des pics mécaniques sortent et rentrent selon un cycle visible. ; FLR_MAR_2 « Entrepôt des cent marionnettes » — Des marionnettes inertes bloquent le passage ; certaines s’animent. |

### THM_ORO — Laboratoires d’Orochimaru (chapitre 3)

| | |
|---|---|
| Sol / murs | metal / metal ; obstacles : cuve ; lumière froide |
| Décor | cuve, tuyau, mue |
| Musique | gamme sombre, 76 bpm, timbre flute |
| Ennemis par rôle | p : ENM_050/ENM_055 · t : ENM_056 · v : ENM_057 · c : ENM_051 · s : ENM_054 · i : ENM_058 · e : ENM_053 · f : ENM_054 · n : ENM_059 · q : ENM_056 · l : ENM_052 · m : ENM_060 · r : ENM_051 · g : ENM_052 · h : ENM_061 |
| Variantes | FLR_ORO_1 « Salle des cuves » — Des flaques d’acide blessent au contact (pas en vol). ; FLR_ORO_2 « Serpentarium » — Des nids de serpenteaux libèrent des nuées quand on les frappe. |

### THM_KIR — Canaux de Kiri (chapitre 3)

| | |
|---|---|
| Sol / murs | pierre / roche ; obstacles : rond ; lumière froide |
| Décor | algue, chaine, lanterne |
| Musique | gamme in, 72 bpm, timbre flute |
| Ennemis par rôle | p : ENM_062/ENM_050 · t : ENM_063 · v : ENM_064 · c : ENM_065 · s : ENM_054 · i : ENM_058 · e : ENM_066 · f : ENM_063 · n : ENM_059 · q : ENM_056 · l : ENM_052 · m : ENM_060 · r : ENM_067 · g : ENM_052 · h : ENM_061 |
| Variantes | FLR_KIR_1 « Canaux brumeux » — Brume : visibilité réduite autour du shinobi ; les ennemis restent contourés. ; FLR_KIR_2 « Écluses » — Des courants poussent dans une direction affichée. |

### THM_AKA — Repaires de l’Akatsuki (chapitre 4)

| | |
|---|---|
| Sol / murs | pierre / roche ; obstacles : rond ; lumière rouge |
| Décor | nuage, anneau, bougie |
| Musique | gamme sombre, 84 bpm, timbre koto |
| Ennemis par rôle | p : ENM_070/ENM_074 · t : ENM_075 · v : ENM_071 · c : ENM_078 · s : ENM_077 · i : ENM_076 · e : ENM_070 · f : ENM_077 · n : ENM_072 · q : ENM_075 · l : ENM_073 · m : ENM_079 · r : ENM_070 · g : ENM_080 · h : ENM_081 |
| Variantes | FLR_AKA_1 « Grotte du scellement » — Pénombre : les lanternes et le feu éclairent ; les dangers restent lisibles. ; FLR_AKA_2 « Tour d’Ame » — Pluie : flaques conductrices (la foudre s’y propage), le feu y dure moitié moins. |

### THM_GUE — Champs de guerre scellés (chapitre 4)

| | |
|---|---|
| Sol / murs | terre / roche ; obstacles : bloc ; lumière grise |
| Décor | arme, drapeau, os |
| Musique | gamme in, 100 bpm, timbre koto |
| Ennemis par rôle | p : ENM_074/ENM_070 · t : ENM_075 · v : ENM_071 · c : ENM_078 · s : ENM_077 · i : ENM_076 · e : ENM_070 · f : ENM_077 · n : ENM_072 · q : ENM_075 · l : ENM_073 · m : ENM_079 · r : ENM_070 · g : ENM_080 · h : ENM_081 |
| Variantes | FLR_GUE_1 « Plaine de cratères » — Cratères (fosses) : le vol devient précieux, les explosifs créent des ponts. ; FLR_GUE_2 « Forêt de Zetsu » — Des Zetsu blancs surgissent du sol en renfort pendant les combats. |

### THM_MYO — Mont Myōboku (empreinte) (chapitre 5)

| | |
|---|---|
| Sol / murs | mousse / roche ; obstacles : rond ; lumière claire |
| Décor | champignon, lanterne, fougere |
| Musique | gamme yo, 76 bpm, timbre flute |
| Ennemis par rôle | p : ENM_090/ENM_074 · t : ENM_091 · v : ENM_092 · c : ENM_078 · s : ENM_093 · i : ENM_076 · e : ENM_070 · f : ENM_091 · n : ENM_072 · q : ENM_075 · l : ENM_073 · m : ENM_079 · r : ENM_067 · g : ENM_080 · h : ENM_081 |
| Variantes | FLR_MYO_1 « Sentiers des crapauds » — Flaques d’huile des crapauds : le Katon les embrase. |

### THM_BIJ — Profondeurs du sceau des bijū (chapitre 5)

| | |
|---|---|
| Sol / murs | pierre / metal ; obstacles : bloc ; lumière rouge |
| Décor | chaine, sceau, bougie |
| Musique | gamme sombre, 88 bpm, timbre koto |
| Ennemis par rôle | p : ENM_094/ENM_070 · t : ENM_075 · v : ENM_071 · c : ENM_095 · s : ENM_077 · i : ENM_076 · e : ENM_070 · f : ENM_077 · n : ENM_072 · q : ENM_075 · l : ENM_073 · m : ENM_079 · r : ENM_067 · g : ENM_080 · h : ENM_081 |
| Variantes | FLR_BIJ_1 « Chambre des chaînes » — Chaînes de sceau : murs temporaires qui s’ouvrent quand la salle est nettoyée. |

