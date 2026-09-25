# Fiches approfondies — 48 techniques sur 8 niveaux

Ces fiches développent des entrées **existantes** du catalogue (elles ne créent pas de nouvelles techniques). Valeurs de niveau 1 identiques à `data/techniques_*.yaml`. Les niveaux indiquent le **changement** puis la valeur résultante. Toutes les valeurs sont des hypothèses à tester.

Conventions de fiche :
* **Collision** : forme, dimensions, touches max par cible, intervalle.
* **Stats** : statistiques qui s'appliquent (§B5.1) ; celles qui ne s'appliquent pas sont indiquées pour exclure les cartes sans effet.
* **Animation** : étapes préparation → lancement → trajet → impact → dissipation, en frames dessinées et en millisecondes (12 i/s pour les poses de personnage, 24 i/s pour les effets rapides, sauf mention).
* **Budget d'effets** : particules décoratives max, instances logiques max, voix sonores max.
* **Test** : critère observable à vérifier en playtest.

Sommaire : Katon (JUT_001, 002, 004, 007, 010) · Suiton (025, 026, 027, 028, 043) · Raiton (049, 050, 054, 059) · Fūton (073, 074, 080, 081) · Doton (097, 099, 105, 107) · Rares (121, 127, 131, 134, 147) · Taijutsu (161, 162, 167, 184) · Outils (185, 189, 202) · Invocations (217, 218, 224, 229) · Genjutsu (249, 264) · Sceaux (265, 270) · Clan (281, 282, 291, 297) · Oculaire (309, 313).

---

## JUT_001 — Katon — Gōkakyū no Jutsu (Grande boule de feu) · œuvre adaptée

Famille KATON · PROJECTILE · cible `plus_dense` · accès `ELEM_KATON` · évolution EVO_001 « Soleil de l'Uchiha » (catalyseur PAS_021) · fusion EVO_097 « Tempête de feu » (avec JUT_073).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Impact 30, explosion 12 (r 1,5 m), délai 2,0 s, vitesse 6 m/s, flaque 1 s |
| 2 | La boule grossit en vol : rayon 0,8 → 1,1 m à 7 m | Couverture de la trajectoire +35 % |
| 3 | Dégâts | Impact 38, explosion 16 |
| 4 | **Perce** le premier ennemi ordinaire avant d'exploser | Traverse 1 ordinaire, explose sur le 2e ou à 7 m |
| 5 | Flaque de feu 1 → 2,5 s et Brûlure +1 → +2 | Zone de refus derrière l'impact |
| 6 | Délai 2,0 → 1,6 s | Cadence de base +25 % |
| 7 | Explosion 1,5 → 2,2 m et léger recul (0,6 m) | Ouvre un passage dans la horde |
| 8 | **Deuxième boule** lancée 0,3 s après vers la 2e zone la plus dense | 2 boules par cycle |

* **Collision** : cercle (rayon courant) ; 1 touche d'impact par cible ; explosion = cercle instantané ; flaque = ticks 0,5 s, 1 touche/tick/cible. Obstacles hauts : explose au contact.
* **Stats** : Puissance, Cadence, Zone (rayon boule, explosion, flaque), Durée (flaque), Quantité (+1 boule par point, max 4), Vitesse proj., Critique (impact seulement ; l'explosion est SECONDAIRE, sans critique).
* **Effets secondaires** : explosion et flaque portent SECONDAIRE ; elles appliquent Brûlure et peuvent déclencher SYN_003/SYN_005 (profondeur 1).
* **Animation** (personnage 40 × 40 px, effet 32 × 32 px en vol) : préparation 4 frames/250 ms (mains en sceau du tigre, joues gonflées) ; lancement 2 frames/80 ms (souffle, anneau de chaleur) ; trajet boucle de 4 frames (langues de feu vers l'arrière, cœur jaune pâle) ; impact 5 frames/200 ms (fleur à 6 lobes 48 × 48 px) ; dissipation 3 frames/150 ms (fumée brune qui monte, braises 6 px).
* **Budget** : 20 braises décoratives par boule (10 en mode allégé), 4 boules logiques max, 2 voix « souffle » et 3 voix « explosion » simultanées.
* **Synergies** : SYN_003 Embrasement (flaque sur huile), SYN_004 Flammes attisées (la flaque grossit sous un Fūton).
* **Risque** : niveau 8 + Quantité +3 = 5 boules ⇒ couverture d'écran excessive vers 15 min. Garde-fou : les boules supplémentaires visent des zones distinctes (≥ 4 m d'écart) et la flaque ne se cumule pas sur elle-même.
* **Test** : en scène de référence (100 poursuivants), le niveau 4 doit tuer ≥ 2 ennemis par boule en moyenne sur 60 s ; les joueurs doivent décrire « une grosse boule qui traverse » après une vidéo de 3 s.

## JUT_002 — Katon — Hōsenka no Jutsu (Fleurs de phénix) · œuvre adaptée

Famille KATON · SALVE · `plus_proche` · `ELEM_KATON` · évolution EVO_002 « Nuée de phénix » (PAS_007).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 5 flammes × 9, éventail 60°, délai 1,4 s, portée 8 m |
| 2 | +1 flamme | 6 flammes |
| 3 | Guidage plus fort (virage 120 → 200°/s) | Moins de flammes perdues |
| 4 | Dégâts | 12 par flamme |
| 5 | +2 flammes | 8 flammes |
| 6 | Chaque flamme laisse une braise au sol 1 s (4/0,5 s) | Couverture résiduelle |
| 7 | Délai 1,4 → 1,1 s | — |
| 8 | Réciblage : une flamme dont la cible meurt en vol reprend la plus proche | Aucune flamme gâchée |

* **Collision** : cercle 0,25 m, 1 touche puis disparition ; max 2 flammes par cible et par salve (répartition).
* **Stats** : Puissance, Cadence, Zone (taille), Quantité (+1 flamme), Vitesse proj., Critique. Durée : braises seulement (niv. 6+).
* **Animation** : préparation 3 frames/180 ms ; lancement éventail 2 frames ; flammes 8 × 6 px en boucle 3 frames ; impact étoile 4 frames/120 ms ; dissipation 2 frames.
* **Budget** : 3 particules par flamme ; 24 flammes logiques max ; son groupé (un seul « souffle » par salve, variations de hauteur ±2 demi-tons).
* **Synergies** : SYN_003 (les braises niv. 6 embrasent l'huile), SYN_031 Plaies brûlantes avec Fūton tranchant.
* **Risque** : très efficace sur les petits groupes, faible sur boss (répartition). C'est voulu : documenté sur la carte « Répartit ses flammes ».
* **Test** : contre un boss isolé, 8 flammes doivent toutes toucher (répartition désactivée s'il n'y a qu'une cible) ; vérifier dans le journal de combat.

## JUT_004 — Katon — Karyū Endan (Balles de flammes du dragon) · œuvre adaptée

Famille KATON · CONE · `direction` · `ELEM_KATON` · évolution EVO_003 (EQP_018).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Cône 70° × 4 m, 1 s, 5 par 0,25 s, délai 2,5 s |
| 2 | Portée 4 → 5 m | — |
| 3 | Dégâts | 7 par tick |
| 4 | Durée du souffle 1 → 1,4 s | +40 % de ticks |
| 5 | Le cône suit lentement l'ennemi le plus dense (±20°) quand le joueur est immobile | Utile à l'arrêt |
| 6 | Brûlure +1 par tick (au lieu d'un tick sur deux) | — |
| 7 | Angle 70 → 90° | — |
| 8 | En fin de souffle, une vague de feu part du bout du cône (6 m, 20) | Allonge finale |

* **Collision** : secteur évalué chaque 0,25 s ; intervalle par cible 0,25 s. Obstacles hauts : ombre de cône (pas de dégâts derrière).
* **Stats** : Puissance, Cadence, Zone (portée ; angle ×½ de la Zone), Durée (souffle), Critique. **Pas** de Quantité ni de Vitesse proj. : les cartes correspondantes affichent « sans effet sur Karyū Endan ».
* **Animation** : préparation 3 frames (inspiration), souffle en nappe de 3 couches animées à 24 i/s ; bordures dentelées ; dissipation en fumée 4 frames.
* **Budget** : 30 particules max par cône ; 1 instance ; 1 voix de souffle continue + 1 crépitement.
* **Synergies** : SYN_031 Plaies brûlantes (cibles Brûlées et Entaillées), SYN_038 Combustion toxique (cibles très empoisonnées).
* **Risque** : dépend de la direction de course ; les joueurs qui fuient tirent vers l'avant et laissent l'arrière. Le niveau 5 aide à l'arrêt.
* **Test** : sur 20 runs, ≥ 60 % des éliminations de Karyū Endan doivent se produire pendant que le joueur se déplace (confirme la lecture « souffle devant moi »).

## JUT_007 — Katon — Gōka Mekkyaku (Destruction par le grand feu) · œuvre adaptée

Famille KATON · ONDE · `direction` · `ELEM_KATON+CLAN_UCHIHA` · pas d'évolution simple (puissance déjà élevée) ; synergies de zone.

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Mur 10 m × avance 8 m, 40, délai 6,0 s, Brûlure +2 |
| 2 | Avance 8 → 10 m | — |
| 3 | Dégâts | 52 |
| 4 | Le mur laisse une bande de sol brûlant 2 s derrière lui | Zone de refus |
| 5 | Délai 6,0 → 5,0 s | — |
| 6 | Largeur 10 → 13 m | Couvre un couloir de pont entier (MAP_002) |
| 7 | Brûlure +2 → +3 et recul 1 m | — |
| 8 | Second mur en sens inverse (derrière le joueur) 0,5 s après | Couverture à 360° par l'axe |

* **Collision** : rectangle mobile d'épaisseur 0,8 m ; 1 touche par cible par mur ; ne traverse pas les obstacles hauts (le mur se fend autour).
* **Stats** : Puissance, Cadence, Zone (largeur et avance), Durée (sol brûlant), Quantité (murs supplémentaires décalés de 30°), Critique.
* **Animation** : préparation 5 frames/400 ms (grande inspiration, aura) ; front de feu 16 px de haut en 3 couches ; arrière qui noircit ; dissipation en fumée qui s'élève 6 frames.
* **Budget** : 60 particules par mur (25 allégé) ; 2 murs max ; 1 voix grave « rugissement » par mur.
* **Synergies** : SYN_004 (le sol brûlant niv. 4 est une zone Katon), SYN_072 (réduit la construction de Kirin).
* **Risque** : masque potentiellement les projectiles ennemis. Règle de lisibilité : les projectiles hostiles sont dessinés au-dessus et le mur passe à 35 % d'opacité quand il les recouvre.
* **Test** : test de lecture en combat dense — 10 testeurs identifient les projectiles ennemis traversant le mur dans 90 % des cas.

## JUT_010 — Katon — Gamayu Endan (Flammes à l'huile de crapaud) · œuvre adaptée

Famille KATON · CONE · `plus_dense` · `ELEM_KATON+CTR_CRAPAUD` · évolution EVO_004 (EQP_029) · fusion EVO_104 (avec JUT_225).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Huile (cône 50° × 5 m) puis embrasement 0,5 s après : 30 + Brûlure +2, délai 4,5 s |
| 2 | L'huile reste 2 s après l'embrasement si elle n'a pas été entièrement brûlée | Combo avec d'autres Katon |
| 3 | Dégâts | 40 |
| 4 | Portée 5 → 6,5 m | — |
| 5 | Délai d'embrasement 0,5 → 0,3 s | Moins d'ennemis sortent de l'huile |
| 6 | Angle 50 → 70° | — |
| 7 | Délai 4,5 → 3,6 s | — |
| 8 | Deuxième gerbe latérale (à ±45°) | Double cône |

* **Collision** : secteur (huile = surface HUILE, cellules de 1 m) ; embrasement = SYN_003 garanti une fois par utilisation.
* **Stats** : Puissance, Cadence, Zone, Durée (huile), Critique (embrasement).
* **Animation** : gerbe brun-jaune luisante 4 frames, pause visuelle 0,5 s (le joueur voit la nappe), vague de feu épaisse qui suit exactement la nappe 6 frames.
* **Budget** : 40 cellules d'huile par cône ; particules 30 ; 2 voix (gerbe, embrasement).
* **Synergies** : SYN_003 (intégrée), SYN_005 si la gerbe traverse de l'eau (vapeur).
* **Risque** : l'huile consommée prive les autres techniques d'huile : documenté (SYN_003 contrepartie).
* **Test** : la moitié des testeurs doit décrire la séquence « huile puis feu » après l'avoir vue 3 fois.

## JUT_025 — Suiton — Suiryūdan no Jutsu (Dragon d'eau) · œuvre adaptée

Famille SUITON · PROJECTILE · `plus_dense` · `ELEM_SUITON` · évolution EVO_009 (PAS_022).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 22, perce 3, sinusoïde 1 m, 8 m/s, portée 11 m, Trempé 2 s, délai 2,2 s |
| 2 | Perce 3 → 5 | — |
| 3 | Amplitude 1 → 1,5 m | Couverture +50 % |
| 4 | Dégâts | 30 |
| 5 | Laisse une traînée d'EAU 3 s | Terrain pour SYN_002 |
| 6 | Délai 2,2 → 1,8 s | — |
| 7 | Perce illimitée | — |
| 8 | À la fin de sa course, le dragon plonge et crée un geyser (25, r 1,2 m) | Impact final |

* **Collision** : capsule 0,6 × 1,4 m suivant la sinusoïde ; 1 touche par cible par dragon.
* **Stats** : Puissance, Cadence, Zone (largeur et amplitude), Quantité (dragons décalés de 15°), Vitesse proj., Critique, Durée (traînée, niv. 5).
* **Animation** : préparation 4 frames (sceaux), apparition du dragon depuis une flaque 3 frames, corps de 5 segments animés 24 i/s, gerbes à chaque ondulation, dispersion en pluie 4 frames.
* **Budget** : 25 gouttes décoratives ; 3 dragons max ; 1 voix « torrent ».
* **Synergies** : SYN_001 Conduction (Trempé), SYN_002 Flaque électrique (traînée).
* **Risque** : combiné à Conduction, peut rendre Raiton trivial. Garde-fou : ICD de SYN_001 (0,6 s).
* **Test** : dans un build Suiton + Raiton, les arcs de Conduction doivent représenter 15–30 % des dégâts totaux (plage cible).

## JUT_026 — Suiton — Suijinheki (Mur d'eau) · œuvre adaptée

Famille SUITON · ONDE · `aucune` · `ELEM_SUITON` · évolution EVO_010 (PAS_051).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 12, recul 2 m, détruit 10 projectiles, délai 7 s, anneau d'EAU 4 s |
| 2 | Détruit 10 → 16 projectiles | — |
| 3 | Rayon 2,5 → 3 m | — |
| 4 | Dégâts | 20 |
| 5 | Se déclenche automatiquement (en plus du cycle) quand ≥ 6 projectiles ennemis sont à 3 m (1 fois / 10 s) | Défense réactive |
| 6 | Délai 7 → 5,5 s | — |
| 7 | Bouclier de 8 % PV max 2 s à l'activation | — |
| 8 | Le mur se reforme une seconde fois 0,6 s plus tard | Double onde |

* **Collision** : anneau en expansion (épaisseur 0,5 m) ; 1 touche par cible par onde ; destruction des projectiles ordinaires uniquement (les télégraphes de boss passent).
* **Stats** : Puissance, Cadence, Zone, Durée (surface), Quantité (ondes supplémentaires à 0,6 s d'intervalle). Pas de critique sur la destruction.
* **Animation** : 3 frames montantes, crête d'écume dessinée, retombée en pluie 5 frames ; pas de secousse.
* **Budget** : 40 gouttes ; 1 instance ; 1 voix « déferlante ».
* **Synergies** : SYN_002 (anneau d'eau), SYN_009 Embourbement avec Doton.
* **Risque** : défense trop forte contre les tireurs → le niveau 5 est limité à 1 fois / 10 s.
* **Test** : les joueurs doivent pouvoir expliquer que « le mur d'eau détruit les petits projectiles mais pas les grosses attaques de boss » (lisibilité de règle).

## JUT_027 — Suiton — Suirō no Jutsu (Prison aqueuse) · œuvre adaptée

Famille SUITON · ZONE · `plus_menacant` · `ELEM_SUITON` · évolution EVO_011 (PAS_050).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 10 / 0,5 s, 2,5 s, délai 6 s, 1 prison |
| 2 | Durée 2,5 → 3 s | — |
| 3 | Dégâts | 14 / 0,5 s |
| 4 | La prison attire légèrement les ennemis ordinaires voisins (0,5 m/s, r 2 m) | Groupe autour |
| 5 | +1 prison simultanée | 2 prisons |
| 6 | Délai 6 → 5 s | — |
| 7 | Cible emprisonnée Vulnérable +10 % | — |
| 8 | À la fin, la prison éclate et Trempe à 2 m (15) | Préparation Raiton |

* **Collision** : sphère attachée à la cible (0,8 m) ; ticks 0,5 s ; contrôle soumis à la résistance des boss (§B4.10).
* **Stats** : Puissance, Cadence, Durée, Quantité (prisons), Zone (niv. 4 et 8), Critique.
* **Animation** : sphère qui se forme en 4 frames autour de la cible, reflets en boucle, silhouette déformée (décalage horizontal de 1 px alterné), éclatement 4 frames.
* **Budget** : bulles 8 par prison ; 3 prisons max ; 1 voix « glouglou » par prison (limitée à 2).
* **Synergies** : SYN_001 (Trempé à l'éclatement), SYN_012 Sable et contrôle.
* **Risque** : contrôle permanent d'une élite. Garde-fou : Rc des élites (20 %) et plafond 3 prisons.
* **Test** : contre une élite, la prison ne doit jamais la maintenir plus de 55 % du temps sur 30 s (mesure).

## JUT_028 — Suiton — Kirigakure no Jutsu (Brume dissimulatrice) · œuvre adaptée

Famille SUITON · ZONE · `aucune` · `ELEM_SUITON` · évolution EVO_012 (EQP_016) · fusion EVO_098 (avec JUT_015).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Rayon 4 m autour du joueur, 4 s, Aveuglé, +15 % crit sur cibles dedans, délai 10 s |
| 2 | Durée 4 → 5 s | — |
| 3 | Rayon 4 → 5 m | — |
| 4 | Crit dedans +15 → +20 % | — |
| 5 | Les ennemis qui entrent sont ralentis 15 % | — |
| 6 | Délai 10 → 8 s | — |
| 7 | La brume suit le joueur à 50 % de sa vitesse (elle traîne derrière) | Mobile |
| 8 | Les attaques sur cible Aveuglée dans la brume ont +20 % de dégâts critiques | — |

* **Collision** : disque ; l'aveuglement s'applique à l'entrée puis toutes les 1 s.
* **Stats** : Zone, Durée, Cadence ; **pas** de Puissance (aucun dégât) : les cartes de Puissance affichent « aucun effet direct ».
* **Animation** : brume en tramage à 2 niveaux d'opacité, bords diffus en dithering, animation lente 6 frames/s ; le joueur et les télégraphes restent au-dessus.
* **Budget** : 1 calque de brume (pas de particules physiques) ; mode allégé : bord net sans dithering.
* **Synergies** : SYN_026 Brume conductrice, SYN_035 Point aveugle.
* **Risque** : réduction de lisibilité pour le joueur. Règle : les ennemis gardent un contour clair et la brume ne dépasse jamais 40 % d'opacité.
* **Test** : lecture en combat dense — les testeurs doivent localiser 9 ennemis sur 10 dans la brume sur capture d'écran.

## JUT_043 — Sensatsu Suishō (Mille aiguilles d'eau) · œuvre adaptée

Famille SUITON · DIFFERE · `plus_menacant` · `ELEM_SUITON` · évolution EVO_016 (PAS_008).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 12 aiguilles × 3 en couronne de 2 m, convergence 0,5 s, délai 2,8 s |
| 2 | +4 aiguilles | 16 |
| 3 | Dégâts | 4 par aiguille |
| 4 | Bonus sur surface EAU ×1,5 → ×1,8 | — |
| 5 | +1 couronne sur la 2e cible la plus menaçante | 2 cibles |
| 6 | Délai 2,8 → 2,3 s | — |
| 7 | Les aiguilles Trempent la cible principale | Prépare Conduction |
| 8 | Critique garanti sur la cible principale si elle est Trempée | — |

* **Collision** : chaque aiguille = segment 0,1 × 0,5 m ; touche la cible principale et à 50 % les ennemis traversés ; 1 touche par aiguille.
* **Stats** : Puissance, Cadence, Zone (rayon de la couronne), Quantité (couronnes), Critique. Pas de Vitesse proj. (délai fixe de convergence).
* **Animation** : aiguilles de 3 px qui apparaissent en couronne sur 3 frames, pause 0,2 s, convergence 3 frames, éclat en étoile.
* **Budget** : 40 aiguilles logiques max ; 1 voix « sifflement » groupée.
* **Synergies** : SYN_001, SYN_033 Aiguilles de givre (pour Haku, avec les Senbon).
* **Risque** : très fort contre boss sur l'eau (MAP_010). Surveillé en test de boss isolé.
* **Test** : dégâts sur Kisame (BOS_007) par cette technique ≤ 25 % des dégâts totaux dans un build diversifié.

## JUT_049 — Chidori (Mille oiseaux) · œuvre adaptée

Famille RAITON · CONTACT · `plus_menacant` · `ELEM_RAITON+DOJ_SHARINGAN` · évolution EVO_018 (PAS_023).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Frappe 48, décharge 14 (1,2 m), charge 0,4 s, lancée 4 m, délai 2,8 s |
| 2 | Portée de l'image de frappe 4 → 5 m | — |
| 3 | Dégâts | 60 |
| 4 | La décharge passe à 2 m et Électrise | — |
| 5 | L'image transperce jusqu'à 3 ennemis sur sa ligne | — |
| 6 | Délai 2,8 → 2,3 s | — |
| 7 | Chance critique +25 % sur cette technique | — |
| 8 | Après l'impact, l'image rebondit vers une 2e cible à 4 m (70 %) | Deux frappes |

* **Collision** : image de frappe = capsule 0,5 m de large sur sa trajectoire ; décharge = cercle à l'impact ; le joueur ne bouge pas.
* **Stats** : Puissance, Cadence, Zone (décharge, longueur de ligne ×½), Critique. Pas de Quantité (une seule main), pas de Vitesse proj.
* **Animation** : main du personnage : sphère de filaments 12 × 12 px avec 3 branches animées (6 frames à 24 i/s) pendant la charge ; image bleutée à 60 % d'opacité en pose de course (2 frames) ; impact : flash local blanc 1 frame + 3 frames d'arcs ; dissipation : filaments qui retombent 3 frames. Micro-pause locale 40 ms sur la cible.
* **Budget** : 12 arcs décoratifs ; 1 instance ; voix « gazouillis » (synthèse originale) + « claquement ».
* **Synergies** : SYN_001 Conduction, SYN_032 Surcharge.
* **Risque** : l'image de frappe peut donner l'illusion que le joueur se déplace. Test explicite ci-dessous.
* **Test** : 10 testeurs sur 10 doivent confirmer que « le personnage n'a pas bougé » après une salve de Chidori.

## JUT_050 — Raikiri (Tranche-foudre) · œuvre adaptée

Famille RAITON · RAYON · `plus_menacant` · accès réservé aux entrées de Kakashi · évolution EVO_019 « Shiden » (PAS_043).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 60 sur trait de 4 m, sillage 6 (0,5 s), crit +20 %, délai 3,5 s |
| 2 | Longueur 4 → 5 m | — |
| 3 | Dégâts | 75 |
| 4 | Sillage 0,5 → 1 s et Électrisé | — |
| 5 | Délai 3,5 → 3,0 s | — |
| 6 | Priorité absolue aux élites à l'écran | Tueur d'élites |
| 7 | Dégâts | 90 |
| 8 | Si la cible meurt, un second trait part immédiatement vers la plus menaçante suivante | Enchaînement |

* **Collision** : segment de 0,4 m de large instantané ; 1 touche par cible ; sillage = zone persistante mince.
* **Stats** : Puissance, Cadence, Zone (longueur, largeur), Durée (sillage), Critique.
* **Animation** : préparation 3 frames (main levée, crépitement), trait brisé anguleux 1 frame blanche + 2 frames bleues, sillage crépitant 4 frames.
* **Budget** : 8 étincelles ; 2 traits max (niv. 8) ; 1 voix « tranche ».
* **Synergies** : SYN_032, SYN_020 Fil conducteur.
* **Risque** : trivialise les élites. Garde-fou : délai de 3 s et PV des élites ≥ 4 traits au niveau 8 à 15 min.
* **Test** : temps moyen pour abattre une élite à 14:30 : 3–6 s (plage cible), pas moins de 2 s.

## JUT_054 — Kirin · œuvre adaptée

Famille RAITON · DIFFERE · `plus_dense` · `ELEM_RAITON+ELEM_KATON+CLAN_UCHIHA` · évolution EVO_022 (EQP_034) → éveil EVO_115.

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 120 (r 3,5 m), construction 6 s, délai 14 s |
| 2 | Construction 6 → 5 s | — |
| 3 | Dégâts | 150 |
| 4 | Le nuage suit lentement le groupe le plus dense pendant la construction (1 m/s) | Moins de ratés |
| 5 | Rayon 3,5 → 4,2 m | — |
| 6 | Délai 14 → 12 s | — |
| 7 | La foudre laisse des arcs au sol 1,5 s (10 / 0,5 s) | Zone résiduelle |
| 8 | Dégâts | 190 |

* **Collision** : cercle instantané ; 1 touche par cible ; arcs = zone persistante.
* **Stats** : Puissance, Cadence (délai, pas la construction), Zone, Durée (arcs), Critique. La construction est réduite uniquement par SYN_072 (zones Katon) et les niveaux.
* **Animation** : nuage sombre à contour clair qui grossit en 4 paliers pendant la construction (lisible à tout moment : l'information « bientôt » est visible) ; bête de foudre 64 × 96 px en 3 frames ; onde au sol 5 frames ; aucune secousse globale, micro-pause locale 50 ms.
* **Budget** : 40 arcs décoratifs ; 1 instance ; voix : grondement de construction (boucle) + impact unique ; priorité audio haute (ne masque jamais un avertissement de boss : volume −6 dB si un avertissement est en cours).
* **Synergies** : SYN_072 Nuages de feu pour Kirin, SYN_032 Surcharge (cibles étourdies).
* **Risque** : pic de dégâts énorme mais rare ; excellent contre boss immobiles (Chibaku Tensei de Pain). Acceptable, contrebalancé par le délai.
* **Test** : les testeurs doivent anticiper l'impact du Kirin (≥ 80 % disent « il va tomber » avant l'impact) grâce au nuage.

## JUT_059 — Arc en chaîne · création originale

Famille RAITON · CHAINE · `plus_proche` · `ELEM_RAITON` · évolution EVO_024 (EQP_019) · fusion EVO_099 (avec JUT_039).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 18, 5 sauts, portée 3,5 m, −12 %/saut, délai 1,5 s |
| 2 | +1 saut | 6 |
| 3 | Dégâts | 22 |
| 4 | Perte par saut −12 → −8 % | — |
| 5 | +2 sauts | 8 |
| 6 | Portée de saut 3,5 → 4,5 m | — |
| 7 | Délai 1,5 → 1,2 s | — |
| 8 | Chaque cible Trempée ne compte pas comme saut | Chaînes longues sous la pluie |

* **Collision** : aucune géométrie : sélection de la cible suivante non touchée la plus proche dans la portée (grille spatiale) ; jamais deux fois la même cible.
* **Stats** : Puissance, Cadence, Zone (portée de saut), Quantité (+1 saut par point), Vitesse proj. (vitesse de propagation, cosmétique au-delà de 1 saut/tick), Critique (par cible).
* **Animation** : tracé construit en 2 frames (tête épaisse puis ramifications secondaires décoratives), disparition 3 frames ; chaque saut a 1 frame de retard (lisibilité).
* **Budget** : 8 sauts logiques par chaîne, 3 chaînes simultanées max ; 1 voix « crépitement » par chaîne, hauteur qui monte à chaque saut (« glissando » agréable).
* **Synergies** : SYN_001 (déclencheur Raiton direct), SYN_002 Flaque électrique.
* **Risque** : niveau 8 sous Averse = chaînes quasi infinies. Plafond : 16 cibles par chaîne, toujours.
* **Test** : vérifier qu'aucune chaîne ne dépasse 16 cibles sur 1 000 déclenchements (test automatique de simulation).

## JUT_073 — Fūton — Daitoppa (Grande percée) · œuvre adaptée

Famille FUTON · CONE · `plus_dense` · `ELEM_FUTON` · évolution EVO_028 (PAS_003) · fusion EVO_097 (avec JUT_001).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 10, recul 3,5 m, cône 60° × 6 m, délai 3,0 s |
| 2 | Recul 3,5 → 4,5 m | — |
| 3 | Dégâts | 14 |
| 4 | Les ennemis repoussés contre un obstacle sont étourdis 0,5 s | Utilise le décor |
| 5 | Angle 60 → 80° | — |
| 6 | Délai 3,0 → 2,4 s | — |
| 7 | Détruit les projectiles ennemis ordinaires dans le cône | Défense |
| 8 | Les ennemis repoussés deviennent des projectiles (20 aux ennemis qu'ils percutent) | Effet « quilles » |

* **Collision** : secteur instantané ; 1 touche par cible par souffle ; recul réduit de 70 % dans les zones alliées persistantes (§B8.4).
* **Stats** : Puissance, Cadence, Zone (portée, angle), Critique. Pas de Durée.
* **Animation** : lignes de vent courbes blanches à 50 % d'opacité, feuilles et poussière entraînées ; aucune couleur de danger (le vent allié est blanc-vert, le vent ennemi gris-violet).
* **Budget** : 30 particules (feuilles, poussière) ; 1 voix « bourrasque ».
* **Synergies** : SYN_004 Flammes attisées (avec zones Katon), SYN_057 Courant porteur.
* **Risque** : disperse les ennemis hors des zones du joueur. Atténuation documentée et visible (ancre).
* **Test** : dans un build de zones, le recul ne doit pas réduire les dégâts de zone de plus de 10 % (comparaison avec/sans Daitoppa).

## JUT_074 — Fūton — Kamaitachi no Jutsu (Faux de la belette) · œuvre adaptée

Famille FUTON · ONDE · `direction` · `ELEM_FUTON` · évolution EVO_027 « Daikamaitachi » (EQP_020).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Croissant 120° sur 9 m, 3 × 8, Entaillé +1, délai 2,6 s |
| 2 | Portée 9 → 11 m | — |
| 3 | Dégâts | 3 × 11 |
| 4 | 4 coupes au lieu de 3 | — |
| 5 | Angle 120 → 150° | — |
| 6 | Délai 2,6 → 2,1 s | — |
| 7 | Entaillé +1 → +2 | — |
| 8 | Un second croissant part vers l'arrière | Couverture arrière |

* **Collision** : arc d'épaisseur 0,6 m qui avance à 10 m/s ; 3–4 coupes à 0,1 s d'intervalle par cible traversée.
* **Stats** : Puissance, Cadence, Zone, Quantité (croissants supplémentaires décalés), Critique.
* **Animation** : Temari : éventail ouvert en 3 frames (pose d'anticipation 150 ms), rubans blancs en 3 couches décalées, entailles en X sur les cibles (2 frames).
* **Budget** : 20 feuilles hachées ; 2 croissants ; 1 voix « sifflement » + « tranche » groupée.
* **Synergies** : SYN_031 Plaies brûlantes, SYN_025 Nuée toxique.
* **Risque** : très bon contre les hordes frontales, faible derrière (corrigé au niv. 8).
* **Test** : vidéo de 3 s : les spectateurs identifient « un grand coup de vent tranchant » dans ≥ 80 % des cas.

## JUT_080 — Lames de vent · création originale

Famille FUTON · ORBITE · `aucune` · `ELEM_FUTON` · évolution EVO_031 (PAS_024) · fusion EVO_096 « Rasenshuriken » (avec JUT_281).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 4 lames × 7, orbite 2,2 m, 1 tour/1,2 s, 4 s, délai 6 s |
| 2 | Durée 4 → 5 s | — |
| 3 | +1 lame | 5 |
| 4 | Dégâts | 10 |
| 5 | Rayon d'orbite 2,2 → 2,8 m | — |
| 6 | Délai 6 → 4,5 s | Presque permanente |
| 7 | +1 lame | 6 |
| 8 | Les lames renvoient les petits projectiles ennemis (1 / lame / s) | Défense |

* **Collision** : cercle 0,35 m par lame ; intervalle 0,5 s par lame et par cible.
* **Stats** : Puissance, Cadence (rotation), Zone (rayon et taille), Durée, Quantité, Critique.
* **Animation** : croissants de 10 px à 3 frames de rotation, feuilles aspirées dans la ronde ; en fin de durée, les lames s'étirent et se dispersent (3 frames).
* **Budget** : 6 lames logiques ; 12 feuilles décoratives ; son de rotation unique (boucle douce, −12 dB).
* **Synergies** : SYN_031 Plaies brûlantes (Entaillé + Brûlure), SYN_035 Point aveugle (cibles Aveuglées).
* **Risque** : orbites trop sûres pour le joueur passif. Rayon limité et dégâts faibles : doit être complétée.
* **Test** : une run avec uniquement Lames de vent doit échouer avant 10:00 (elle n'est pas un build complet).

## JUT_081 — Tornade errante · création originale

Famille FUTON · ZONE · `plus_dense` · `ELEM_FUTON` · évolution EVO_030 « Ouragan » (PAS_005) · fusion EVO_102 (avec JUT_133).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 6 / 0,3 s, r 1,6 m, 3 m/s, 5 s, délai 9 s |
| 2 | Durée 5 → 6 s | — |
| 3 | Rayon 1,6 → 2 m | — |
| 4 | Dégâts | 8 / 0,3 s |
| 5 | Aspire les fragments d'XP qu'elle traverse vers le joueur | Confort |
| 6 | Délai 9 → 7 s | — |
| 7 | Soulève aussi les élites 0,3 s | — |
| 8 | +1 tornade | 2 tornades |

* **Collision** : disque mobile ; ticks 0,3 s ; soulèvement = contrôle (Rc sur boss : aucun soulèvement, conversion en Vulnérable).
* **Stats** : Puissance, Cadence, Zone, Durée, Quantité, Critique.
* **Animation** : entonnoir 24 × 40 px à 6 frames, bandes de vent, débris orbitaux ; ombre au sol pour situer la base.
* **Budget** : 25 débris ; 2 tornades ; 1 voix de vent en boucle par tornade (max 2).
* **Synergies** : SYN_079 Tornade électrique, SYN_010 Tempête de sable.
* **Risque** : errance imprévisible → comportement pondéré vers les groupes et jamais à plus de 12 m du joueur.
* **Test** : la tornade doit passer ≥ 70 % de sa durée à moins de 3 m d'au moins 3 ennemis.

## JUT_097 — Doton — Doryūheki (Mur de terre) · œuvre adaptée

Famille DOTON · ZONE · `aucune` · `ELEM_DOTON` · évolution EVO_034 « Forteresse de terre » (PAS_011).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Mur incurvé 4 m derrière le joueur, 15 à l'émergence, 150 PV, 5 s, délai 10 s |
| 2 | PV 150 → 220 | — |
| 3 | Émergence 15 → 25 et recul | — |
| 4 | Longueur 4 → 5,5 m | — |
| 5 | Les projectiles ennemis bloqués blessent les ennemis proches du mur (éclats 8) | — |
| 6 | Délai 10 → 8 s | — |
| 7 | Durée 5 → 7 s | — |
| 8 | Deux murs (arrière et latéral le plus menacé) | — |

* **Collision** : obstacle solide pour les ennemis et leurs projectiles ordinaires ; **jamais** placé à < 2 m d'un autre obstacle (anti-enfermement) ; le joueur le traverse s'il y est collé (glissement doux 0,3 s).
* **Stats** : Puissance (émergence), Cadence, Zone (longueur), Durée, Quantité, PV du mur via Bouclier (PAS_051 +10 %/niv).
* **Animation** : émergence 4 frames (éclats, poussière), 3 strates de pierre à ombre marquée ; fissures en 3 paliers selon les PV ; effondrement 5 frames.
* **Budget** : 2 murs ; 15 éclats ; 1 voix « grondement ».
* **Synergies** : SYN_058 Impact sismique, SYN_009 Embourbement.
* **Risque** : enfermer les ennemis ou le joueur. Règles de placement strictes (test automatique de chemin : le joueur a toujours ≥ 2 sorties de 2 m).
* **Test** : test automatique de 10 000 placements aléatoires : 0 enfermement.

## JUT_099 — Doton — Yomi Numa (Marais des enfers) · œuvre adaptée

Famille DOTON · ZONE · `plus_dense` · `ELEM_DOTON` · évolution EVO_036 (PAS_048) · fusion EVO_101 (avec JUT_040).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Marécage 4 m, −60 % vitesse, 6 / 0,5 s, engloutit < 20 % PV, 4 s, délai 11 s |
| 2 | Durée 4 → 5 s | — |
| 3 | Rayon 4 → 5 m | — |
| 4 | Seuil d'engloutissement 20 → 25 % | — |
| 5 | Dégâts | 9 / 0,5 s |
| 6 | Délai 11 → 9 s | — |
| 7 | Les élites sont ralenties 30 → 45 % | — |
| 8 | Le marais laisse une surface de boue 3 s (Ensablé +1/s) | — |

* **Collision** : disque ; engloutissement = élimination immédiate des ordinaires sous le seuil (animation 0,5 s, XP conservée).
* **Stats** : Puissance, Cadence, Zone, Durée, Quantité (marais supplémentaires), Critique (ticks).
* **Animation** : sol brun-violet ondulant (boucle 4 frames), bulles, silhouettes qui s'enfoncent de 4 px par frame ; bord net pour la lisibilité.
* **Budget** : 20 bulles ; 3 marais ; 1 voix « succion » groupée.
* **Synergies** : SYN_012 (contrôle), SYN_063 Attraction dans le piège.
* **Risque** : l'élimination sous seuil + attraction = nettoyage massif. Plafond : 12 engloutissements/s.
* **Test** : la carte doit afficher clairement le seuil (icône crâne au-dessus des ordinaires sous 20 % dans le marais).

## JUT_105 — Ligne de pics · création originale

Famille DOTON · ONDE · `plus_dense` · `ELEM_DOTON` · évolution EVO_037 « Étoile de pics » (PAS_006).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 7 pics × 22 en ligne de 7 m, écart 0,06 s, délai 2,4 s |
| 2 | +2 pics (9 m) | — |
| 3 | Dégâts | 28 |
| 4 | Les pics restent 1 s comme obstacles bas | Ralentit les chargeurs |
| 5 | Largeur de pic 0,8 → 1,1 m | — |
| 6 | Délai 2,4 → 2,0 s | — |
| 7 | La ligne bifurque en Y au dernier tiers | Couverture |
| 8 | Chaque pic étourdit 0,2 s | — |

* **Collision** : suite de cercles instantanés ; 1 touche par cible et par ligne.
* **Stats** : Puissance, Cadence, Zone (longueur, largeur), Quantité (lignes), Durée (obstacles), Critique.
* **Animation** : fissure en zigzag tracée 2 frames avant chaque pic ; pics anguleux gris-brun en 3 frames ; retombée de gravats.
* **Budget** : 12 pics ; 2 lignes ; son : « crac » répété avec variation de hauteur.
* **Synergies** : SYN_058 Impact sismique (structure de terre proche), SYN_009 Embourbement (pics sur l'eau).
* **Risque** : faible, technique de base solide.
* **Test** : lisibilité — la direction de la ligne doit être prévisible (ciblage `plus_dense` affiché par la fissure).

## JUT_107 — Poing de pierre · création originale

Famille DOTON · CONTACT · `plus_proche` · `ELEM_DOTON` · évolution EVO_038 « Poing de montagne » (PAS_027).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 46 en cône de 2 m, recul 3 m, délai 2,2 s |
| 2 | Portée 2 → 2,5 m | — |
| 3 | Dégâts | 58 |
| 4 | Les ennemis repoussés percutent les autres (16) | Quilles |
| 5 | Délai 2,2 → 1,9 s | — |
| 6 | Onde de terre à l'impact (r 1,5 m, 20) | — |
| 7 | Dégâts | 72 |
| 8 | Critique garanti sur élites | — |

* **Collision** : secteur 60° instantané ; 1 touche par cible.
* **Stats** : Puissance, Cadence, Zone, Critique. Pas de Quantité.
* **Animation** (référence d'attaque physique lourde) : **anticipation** 3 frames/250 ms (épaule reculée, poing agrandi 1,2×, poussière aux pieds) ; **pose d'impact** tenue 2 frames/100 ms (poing ×1,5, bras tendu) ; **déformation** des ennemis touchés : écrasement horizontal 2 frames ; **poussière** en éventail dirigé (8 particules) ; **recul** des ennemis sur 0,2 s (ease-out) ; micro-pause locale 60 ms sur les cibles uniquement ; pas de secousse caméra par défaut (option : secousse directionnelle 2 px, 80 ms).
* **Budget** : 8 poussières ; 1 voix « impact sourd » + 1 « craquement ».
* **Synergies** : SYN_058 Impact sismique, SYN_060 Élan.
* **Risque** : portée courte = dangerosité ; le recul protège.
* **Test** : perception du poids — 8 testeurs sur 10 notent le coup comme « lourd » (échelle 1–5 ≥ 4) sans secousse de caméra.

## JUT_121 — Mokuton — Jukai Kōtan (Naissance de la forêt) · œuvre adaptée

Famille RARE · ZONE · `plus_dense` · `KG_MOKUTON` · évolution EVO_041 « Shinrin Kōtan » (PAS_048) → éveil EVO_120.

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Forêt 5 m : 30 à l'émergence, Entravé 1,5 s, 4 / 0,5 s, surface BOIS 5 s, délai 12 s |
| 2 | Rayon 5 → 6 m | — |
| 3 | Dégâts | 40 |
| 4 | Entravé 1,5 → 2 s | — |
| 5 | Durée 5 → 7 s | — |
| 6 | Délai 12 → 10 s | — |
| 7 | Les arbres lancent des pieux (5 × 12) toutes les 2 s | — |
| 8 | La forêt pousse en 2 vagues (0 s et 1 s) | — |

* **Collision** : disque à l'émergence ; surface BOIS ; arbres décoratifs sauf 6 troncs logiques (obstacles bas pour les ennemis, transparents pour le joueur).
* **Stats** : Puissance, Cadence, Zone, Durée, Quantité, Critique.
* **Animation** : troncs qui poussent en 4 frames avec branches en spirale, feuillage sombre à contour vert clair, transparence dynamique quand le joueur est derrière.
* **Budget** : 6 troncs logiques + 20 arbres décoratifs (8 allégé) ; 1 voix « craquement de croissance ».
* **Synergies** : SYN_014 Racines humides, SYN_076 Forêt nourricière (et interaction négative SYN_029 documentée).
* **Risque** : masquage du champ par le feuillage. Règle : feuillage à 50 % d'opacité autour du joueur (5 m) et au-dessus des télégraphes.
* **Test** : repérer une attaque ennemie télégraphiée sous la forêt dans 95 % des cas.

## JUT_127 — Hyōton — Makyō Hyōshō (Miroirs de glace démoniaques) · œuvre adaptée

Famille RARE · ZONE · `plus_menacant` · `KG_HYOTON` · évolution EVO_043 « Palais de miroirs » (PAS_050).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 6 miroirs (r 2,5 m), 12 aiguilles/s × 6, Refroidi +1, 3 s, délai 10 s |
| 2 | Durée 3 → 4 s | — |
| 3 | Aiguilles/s 12 → 16 | — |
| 4 | 8 miroirs, rayon 3 m | — |
| 5 | Dégâts | 8 par aiguille |
| 6 | Délai 10 → 8 s | — |
| 7 | Les miroirs bloquent les projectiles ennemis qui les touchent | — |
| 8 | Un ennemi Gelé dans le cercle éclate en éclats (30, r 1,5 m) | — |

* **Collision** : aiguilles = segments entre miroirs choisis aléatoirement (flux RNG combat) ; brèches de 0,8 m entre miroirs (les ennemis peuvent sortir, c'est voulu).
* **Stats** : Puissance, Cadence (aiguilles/s), Zone, Durée, Quantité (cercles), Critique.
* **Animation** : miroirs 12 × 18 px bleu pâle, reflet animé (le personnage se reflète : sprite réduit), aiguilles en traits croisés 1 frame, éclat cristallin.
* **Budget** : 16 aiguilles logiques/s par cercle ; 2 cercles ; son cristallin groupé (1 voix par cercle).
* **Synergies** : SYN_007 Gel rapide, SYN_030 Blizzard.
* **Risque** : zone très dense = aucune lecture de ce qui se passe à l'intérieur. Opacité des aiguilles 70 %, jamais au-dessus des télégraphes.
* **Test** : contrôle des élites piégées : ≤ 50 % du temps de présence dans le cercle.

## JUT_131 — Sabaku Kyū (Cercueil de sable) · œuvre adaptée

Famille RARE · DIFFERE · `plus_menacant` · `KG_SABLE` · évolution EVO_044 (EQP_003) → éveil EVO_118 · fusion EVO_108 (avec JUT_132).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Enveloppe 1 s puis broyage 45 ; Ensablé +3 aux voisins à 1,5 m ; délai 3,5 s |
| 2 | Dégâts | 55 |
| 3 | Rayon d'Ensablé 1,5 → 2 m | — |
| 4 | +1 cible enveloppée simultanément (2e plus menaçante) | 2 cercueils |
| 5 | Enveloppe 1 → 0,8 s | — |
| 6 | Délai 3,5 → 3,0 s | — |
| 7 | Le broyage laisse une surface SABLE 3 s | Terrain |
| 8 | Dégâts | 75 |

* **Collision** : attaché à la cible (0,8 m) ; immobilisation = contrôle (boss : Vulnérable +10 % 2 s au lieu d'immobiliser).
* **Stats** : Puissance, Cadence, Zone (Ensablé, surface), Quantité (cercueils), Durée (surface), Critique (broyage).
* **Animation** : flux granulaire qui grimpe en spirale (5 frames, grains en tramage 2 tons), fermeture en poing 2 frames, broyage : compression verticale 2 frames, grains qui retombent en cône.
* **Budget** : 40 grains décoratifs par cercueil (15 allégé) ; 3 cercueils ; son « crissement » + « craquement » groupé.
* **Synergies** : SYN_012 Sable et contrôle, SYN_059 Riposte blindée (via Suna no Tate dans le même build).
* **Risque** : exécution des élites trop sûre. L'enveloppe est interrompue si l'élite subit un recul.
* **Test** : visuel — les testeurs distinguent l'enveloppe (sable qui monte) de l'Ensablé (sable aux pieds) sur 3 s de vidéo.

## JUT_134 — Suna no Tate (Bouclier de sable) · œuvre adaptée

Famille RARE · ORBITE · `aucune` · `KG_SABLE` · évolution EVO_045 « Shukaku no Tate » (PAS_051).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 1 charge / 4 s (max 2), absorbe 100 % d'un coup ≤ 30 (50 % au-delà), contre 15 |
| 2 | Contre 15 → 22 | — |
| 3 | Recharge 4 → 3,5 s | — |
| 4 | Max 2 → 3 charges | — |
| 5 | Seuil d'absorption totale 30 → 40 | — |
| 6 | Le contre frappe en zone (r 1,5 m) | — |
| 7 | Recharge 3,5 → 3 s | — |
| 8 | Une charge consommée donne 0,5 s d'invulnérabilité aux projectiles | — |

* **Collision** : aucune hitbox offensive propre ; interception déclenchée par l'impact entrant (avant réduction, §B4.4 étape 0) ; ne couvre pas les télégraphes majeurs (réduits de 50 %).
* **Stats** : Cadence (recharge), Quantité (charges), Puissance (contre), Zone (contre niv. 6). Durée non applicable.
* **Animation** : ruban de sable qui tourne près du joueur (1 frame par 83 ms), jaillissement en paroi à l'impact 3 frames, retombée 3 frames.
* **Budget** : 12 grains ; 1 voix « paroi » (priorité haute : confirme au joueur qu'un coup a été bloqué).
* **Synergies** : SYN_059 Riposte blindée (prochain CONTACT +30 %), SYN_012 Sable et contrôle (le contre applique Ensablé +1 à partir du niveau 6).
* **Risque** : invulnérabilité apparente contre les petites hordes. Le plafond de charges et la recharge limitent à ~0,5 coup/s absorbé.
* **Test** : sous 200 poursuivants, les PV du joueur doivent quand même baisser (≥ 1 PV/s perdu en moyenne au rang C sans soin) : le bouclier ne rend pas invulnérable.

## JUT_147 — Bakuton — C1 (Araignées et oiseaux d'argile) · œuvre adaptée

Famille RARE · PROJECTILE · `plus_proche` · `KG_BAKUTON` · évolution EVO_047 « Nuée d'argile » (PAS_049).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 3 créatures × 20 (r 1,3 m), 7 m/s, délai 1,6 s, mines 4 s (max 6) |
| 2 | +1 créature | 4 |
| 3 | Dégâts | 26 |
| 4 | Les oiseaux (1 sur 2) volent au-dessus des obstacles | — |
| 5 | Rayon 1,3 → 1,6 m | — |
| 6 | Délai 1,6 → 1,3 s | — |
| 7 | +2 créatures | 6 |
| 8 | Les mines durent 4 → 8 s et se déplacent de 1 m vers un ennemi proche | — |

* **Collision** : créature = cercle 0,3 m ; explosion = cercle instantané ; mine = déclencheur 0,8 m.
* **Stats** : Puissance, Cadence, Zone, Quantité, Vitesse proj., Durée (mines), Critique.
* **Animation** : créatures blanches de 6 px en 4 frames de marche/vol, geste de sceau « Katsu » du personnage (pose dédiée, sans texte), explosion blanc-orange en boule 4 frames, fumée 3 frames.
* **Budget** : 12 créatures logiques, 10 mines ; sons groupés par tick (max 3 explosions audibles simultanées, les suivantes fusionnées en « rafale »).
* **Synergies** : SYN_019 Réaction d'argile en chaîne, SYN_077 Éclats de décor.
* **Risque** : bruit visuel des explosions répétées. Variante allégée : explosions à 3 frames et 50 % de fumée.
* **Test** : fatigue visuelle — après 20 min, ≤ 2 testeurs sur 10 signalent une gêne due aux explosions (option allégée activée pour eux).

## JUT_161 — Konoha Reppū (Rafale de la feuille) · œuvre adaptée

Famille TAIJUTSU · CONTACT · `plus_proche` · `LIBRE` · évolution EVO_054 « Konoha Daisenpū » (PAS_027).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 14, cône 100° × 1,6 m, Étourdi 0,3 s, délai 1,1 s |
| 2 | Portée 1,6 → 2 m | — |
| 3 | Dégâts | 18 |
| 4 | Frappe aussi derrière (balayage complet 360° une fois sur deux) | — |
| 5 | Délai 1,1 → 0,9 s | — |
| 6 | Étourdi 0,3 → 0,5 s | — |
| 7 | Dégâts | 24 |
| 8 | Chaque 4e balayage soulève les ordinaires 0,6 s (compatible Kage Buyō) | — |

* **Collision** : secteur devant l'image de frappe (qui reste collée au joueur) ; 1 touche par cible par balayage.
* **Stats** : Puissance, Cadence, Zone (arc), Critique. Pas de Quantité ni Durée.
* **Animation** : jambe tendue en 3 frames (anticipation 1 frame de 83 ms), arc de poussière rasant, ennemis basculés 1 frame (rotation de 15°).
* **Budget** : 6 poussières ; 1 voix « balayage » avec 3 variantes aléatoires (flux cosmétique).
* **Synergies** : SYN_053 Jonglage (niv. 8), SYN_060 Élan.
* **Risque** : trop faible seul au rang C tardif ; c'est une technique d'ancrage, pas de nettoyage.
* **Test** : 30 premières secondes avec Lee : les testeurs jugent l'attaque « satisfaisante » (≥ 4/5) — critère du premier sprint.

## JUT_162 — Omote Renge (Lotus primaire) · œuvre adaptée

Famille TAIJUTSU · CONTACT · `plus_menacant` · `APT_PORTES` · évolution EVO_055 (PAS_054) → éveil EVO_119.

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Saisie à 5 m, 70 + onde 25 (r 2 m), délai 8 s |
| 2 | Onde 2 → 2,5 m | — |
| 3 | Dégâts | 90 + 30 |
| 4 | Ignore les protecteurs (saisit derrière un bouclier frontal) | — |
| 5 | Délai 8 → 7 s | — |
| 6 | Le cratère étourdit les ordinaires 0,8 s | — |
| 7 | Dégâts | 110 + 40 |
| 8 | Sous Portes ≥ 1 : délai réduit de moitié | Synergie de transformation |

* **Collision** : saisie = sélection de cible (pas de géométrie) ; onde = cercle à l'impact ; boss : pas de saisie (frappe verticale + Vulnérable +10 %).
* **Stats** : Puissance, Cadence, Zone (onde), Critique.
* **Animation** : bandages qui se déroulent en ruban (4 frames, 24 i/s), vrille ascendante 6 frames (la cible et l'image sortent du cadre par le haut de 24 px), chute 3 frames, cratère et anneau de poussière 5 frames. Le personnage réel reste au sol (image de frappe teintée).
* **Budget** : 20 poussières ; 1 instance ; voix « vrille » + « impact » ; micro-pause locale 60 ms.
* **Synergies** : SYN_054 Élan des Portes, SYN_058 Impact sismique.
* **Risque** : la saisie peut retirer une élite dangereuse du combat → délai long compensatoire.
* **Test** : la saisie doit toujours être visible : 0 cas de « l'élite a disparu » signalé en test.

## JUT_167 — Asa Kujaku (Paon du matin) · œuvre adaptée

Famille TAIJUTSU · CONE · `plus_dense` · `APT_PORTES` · évolution EVO_056 « Paon flamboyant » (PAS_042).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 12 coups × 6 en cône 80° × 4 m, Brûlure +1 / 3 coups, délai 5 s |
| 2 | +4 coups | 16 |
| 3 | Portée 4 → 5 m | — |
| 4 | Dégâts | 8 |
| 5 | Angle 80 → 100° | — |
| 6 | Délai 5 → 4 s | — |
| 7 | Brûlure +1 / 2 coups | — |
| 8 | Le dernier coup projette une traînée de feu de friction (ligne 6 m, 30) | — |

* **Collision** : secteur, 1 touche par coup par cible (intervalle 0,05 s entre coups).
* **Stats** : Puissance, Cadence, Zone, Quantité (+2 coups par point), Critique. **Pas** de tag Katon : ne compte pas pour SYN_003/004/005 (affiché).
* **Animation** : éventail de poings stylisés en plumes de paon, montée en intensité (3 paliers de couleur, pas de flash), dissipation en étincelles.
* **Budget** : 40 étincelles ; 1 voix « rafale » à cadence croissante.
* **Synergies** : SYN_031 Plaies brûlantes (Brûlure), SYN_054 Élan des Portes.
* **Risque** : confusion d'élément (couleur orange sans tag Katon). Signalée explicitement sur la carte et dans les Archives (règle §R6).
* **Test** : 7 testeurs sur 10 comprennent, après lecture de la carte, que le Paon « n'est pas du Katon ».

## JUT_184 — Kenatsu (Pression des poings) · création originale

Famille TAIJUTSU · CONTACT · `plus_proche` · `LIBRE`.

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Contact 20 à 1,5 m, sinon onde 12 jusqu'à 5 m, délai 0,9 s |
| 2 | Onde 5 → 6 m | — |
| 3 | Dégâts | 26 / 15 |
| 4 | L'onde perce 2 ennemis | — |
| 5 | Délai 0,9 → 0,75 s | — |
| 6 | Le contact repousse 1 m | — |
| 7 | Dégâts | 32 / 19 |
| 8 | Chaque 3e coup est double (contact et onde) | — |

* **Collision** : contact = arc 90° ; onde = capsule 0,6 m de large.
* **Stats** : Puissance, Cadence, Zone, Critique ; Vitesse proj. pour l'onde uniquement.
* **Animation** : poing avec anneau de pression 2 frames ; onde en croissant transparent 3 frames.
* **Budget** : 4 particules ; son sec avec 4 variations.
* **Synergies** : SYN_060 Élan, SYN_053 Jonglage.
* **Risque** : rend la mêlée trop sûre. Onde volontairement faible.
* **Test** : un build de mêlée débutant tient 5 min au rang D sans autre technique à distance (garantie d'accessibilité).

## JUT_185 — Kunai en éventail · création originale

Famille OUTIL · SALVE · `plus_proche` · `LIBRE` · évolution EVO_060 « Tempête de kunai » (EQP_002).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 3 kunai × 10, éventail 30°, délai 1,0 s, 14 m/s |
| 2 | +1 kunai | 4 |
| 3 | Dégâts | 13 |
| 4 | Perce 1 ennemi | — |
| 5 | +1 kunai | 5 |
| 6 | Délai 1,0 → 0,8 s | — |
| 7 | Les kunai plantés au sol restent 2 s et blessent au passage (5) | — |
| 8 | Tir double : un éventail vers la 2e cible la plus proche | — |

* **Collision** : segment 0,15 × 0,4 m ; 1 touche puis disparition (sauf perce).
* **Stats** : Puissance, Cadence, Zone, Quantité, Vitesse proj., Critique.
* **Animation** : bras qui lance 2 frames (côté du holster, accessoire asymétrique respecté selon la direction), kunai noirs 6 px, reflet 1 px, planté au sol 0,3 s.
* **Budget** : 20 kunai logiques ; son « lancer » groupé par salve.
* **Synergies** : SYN_051 Kunai de marquage universel (Minato), SYN_052 Kunai et étiquettes.
* **Risque** : technique de base commune : ne doit pas éclipser les signatures. Dégâts modestes.
* **Test** : sur 100 runs, Kunai en éventail ne doit pas figurer dans > 50 % des builds gagnants (diversité).

## JUT_189 — Kibaku Fuda (Étiquette explosive) · œuvre adaptée

Famille OUTIL · DIFFERE · `plus_dense` · `LIBRE` · évolution EVO_062 « Mille étiquettes » (PAS_049).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 32 (r 2 m) après 1 s, délai 2,5 s |
| 2 | Rayon 2 → 2,4 m | — |
| 3 | Dégâts | 40 |
| 4 | +1 étiquette (2 groupes) | — |
| 5 | Délai d'explosion 1 → 0,7 s | — |
| 6 | Délai 2,5 → 2,1 s | — |
| 7 | Détruit aussi les projectiles ennemis dans la zone | — |
| 8 | Chaque explosion laisse une étiquette secondaire (60 %) 1 s plus tard | Double impact |

* **Collision** : cercle instantané après délai ; le télégraphe allié (cercle pointillé blanc) est distinct du rouge ennemi.
* **Stats** : Puissance, Cadence, Zone, Quantité, Critique. Le délai d'explosion n'est pas modifié par la Cadence (règle DIFFERE).
* **Animation** : kunai planté, étiquette qui se consume en 3 frames (grésillement), explosion en boule 5 frames, fumée 4 frames.
* **Budget** : 6 étiquettes actives ; 3 explosions audibles simultanées max.
* **Synergies** : SYN_052 Kunai et étiquettes, SYN_077 Éclats de décor.
* **Risque** : confusion télégraphe allié/ennemi. Règle graphique : allié = blanc pointillé + motif de sceau ; ennemi = rouge plein + hachures.
* **Test** : test de couleurs proches : les daltoniens (deutéranopie simulée) distinguent télégraphe allié et ennemi à 95 %.

## JUT_202 — Karasu (Marionnette du corbeau) · œuvre adaptée

Famille OUTIL · INVOCATION · `plus_proche` · `APT_MARIO` · évolution EVO_063 « Corbeau d'acier » (PAS_046) · fusion EVO_105 (avec JUT_203).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 14 + Empoisonné +1, intervalle 0,7 s, fils 7 m, permanente |
| 2 | Intervalle 0,7 → 0,6 s | — |
| 3 | Dégâts | 18 |
| 4 | Lance 3 aiguilles empoisonnées toutes les 3 s (6 chacune) | Attaque à distance |
| 5 | Portée des fils 7 → 9 m | — |
| 6 | Empoisonné +1 → +2 | — |
| 7 | Dégâts | 22 |
| 8 | Karasu se sépare brièvement (2 s toutes les 8 s) pour frapper 3 cibles | Aperçu de l'évolution |

* **Collision** : unité MARIONNETTE (hitbox d'attaque arc 1,2 m) ; non bloquante ; fils rompus au-delà de la portée (la marionnette revient au joueur, pas de perte).
* **Stats** : via héritage MARIONNETTE (§R9) : Puissance 100 %, Cadence 100 %, Critique 100 %, Zone 100 % (portée), pas de Quantité.
* **Animation** : poses mécaniques **sans interpolation** (changements de pose nets en 1 frame, cadence 8 i/s), bras articulés, 3 yeux qui s'allument à l'attaque ; fils bleus de 1 px tracés du bout des doigts du personnage (ancrages : main gauche et droite selon la direction).
* **Budget** : 1 unité ; 4 aiguilles ; son « claquement de bois » + « lame ».
* **Synergies** : SYN_021 Poison et marionnettes, SYN_045 Marionnettes gardiennes.
* **Risque** : invocation permanente « gratuite » — elle occupe un emplacement de technique (règle §R3).
* **Test** : les testeurs identifient la marionnette comme alliée (contour bleu) dans 100 % des captures.

## JUT_217 — Kage Bunshin no Jutsu (Multiclonage) · œuvre adaptée

Famille INVOC · INVOCATION · `plus_proche` · accès : entrées de Naruto, Kakashi, Jiraiya, Itachi, Konohamaru · évolution EVO_069 (PAS_060) → éveil EVO_117. (Exemple du brief, identifiant modifié : ancien « JUT_001 ».)

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 1 clone toutes les 5 s, durée 4 s, 18 par frappe, intervalle 0,9 s, plafond 1 |
| 2 | Durée 4 → 5 s | — |
| 3 | Dégâts | 23 par frappe |
| 4 | **Deux clones** invoqués, plafond 2 | — |
| 5 | La dernière frappe avant disparition **repousse** les ennemis ordinaires (1,2 m) | — |
| 6 | Délai d'invocation 5 → 4 s | — |
| 7 | Les clones **concentrent** brièvement leurs attaques (2 s) sur une cible prioritaire choisie automatiquement (élite > menace immédiate > plus dense) | Signal discret commun |
| 8 | **Trois clones** invoqués, plafond 3 | — |

* **Règle de plafond (explicite)** : quand une nouvelle invocation rencontre le plafond, elle **rafraîchit la durée du clone le plus ancien** (il ne disparaît pas, il n'est pas remplacé, l'invocation n'attend pas). Le rafraîchissement joue une petite bouffée de fumée sur ce clone. Justification : pas de clignotement de disparition/réapparition, pas de perte de dégâts.
* **Collision** : unité CLONE, hitbox d'attaque arc 100° × 1,2 m ; ne bloque ni le joueur ni les autres clones ; les ennemis peuvent cibler les clones (provocation faible : 25 % des poursuivants à 3 m).
* **Héritage** (§R9) : Puissance 75 %, chance crit. 100 %, dégâts crit. 100 %, Cadence 50 %, Durée 100 %, Zone 50 %. Aucun héritage de Régénération, Armure, vol de vie ni effets sur élimination.
* **Non-récursion** : un clone ne peut ni invoquer un clone ni reproduire un effet qui s'auto-déclenche (Retour de foudre, Kawarimi, contre-attaques). Il ne copie pas les techniques du joueur, sauf règle explicite (CPX de Naruto : Rasengan à 60 % à sa disparition, 1 fois par clone ; EVO_069 : Rasengan coordonné).
* **Stats** : Puissance/Cadence/Critique via héritage ; Durée ; Quantité (+1 clone invoqué et +1 plafond par point, dans la limite globale de 8 unités).
* **Animation** : **apparition** nuage de fumée bref (6 frames, 250 ms) ; **révélation** de la silhouette 2 frames (contour bleu clair 1 px, palette désaturée de 15 %, bandeau et couleurs reconnaissables) ; **entrée en action** pose de combat 1 frame puis course ; **disparition** « pouf » de fumée 4 frames, la fumée ne masque pas les télégraphes (dessinée sous eux). Le joueur principal garde son contour blanc et son anneau au sol : jamais confondu avec un clone.
* **Attaque coordonnée (niv. 7)** : un seul petit triangle bleu au-dessus de la cible (signal discret commun) et un trait fin depuis chaque clone ; pas de flash.
* **Budget** : 3 clones logiques (plafond global 8) ; fumée 12 particules par apparition (6 allégé) ; sons : « pouf » groupé si plusieurs clones apparaissent dans la même frame.
* **Synergies** : SYN_041 Attaque coordonnée, SYN_042 Clones et fumée.
* **Risque** : avec EQP_036 + PAS_030 niv. 5 + niv. 8, plafond 5 : saturation d'unités. Le plafond global de 8 et la baisse de Cadence héritée (50 %) contiennent la puissance.
* **Test** : un spectateur doit dire « Naruto et ses clones » sur une vidéo de 3 s (≥ 90 %), et distinguer le vrai Naruto (≥ 95 %).

## JUT_218 — Tajū Kage Bunshin (Multiclonage de masse) · œuvre adaptée

Famille INVOC · INVOCATION · `plus_dense` · entrées de Naruto · évolution EVO_070 « Marée de clones » (PAS_030).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 6 clones × 14 (1 frappe chacun), charge vers le plus dense, délai 9 s |
| 2 | +2 clones | 8 |
| 3 | Dégâts | 18 |
| 4 | Chaque clone frappe 2 fois | — |
| 5 | Les clones chargent en formation en V (couvre un couloir) | — |
| 6 | Délai 9 → 7,5 s | — |
| 7 | +2 clones | 10 |
| 8 | Le dernier clone de la vague lance un Rasengan (si JUT_281 possédé : 50 %) | — |

* **Collision** : chaque clone = hitbox d'attaque arc 1 m ; la vague entière compte **1 emplacement** du plafond d'unités (clones éphémères ≤ 2 s).
* **Héritage** : CLONE (§R9).
* **Animation** : explosion de fumée en rangée (8 frames), silhouettes en course 4 frames, disparitions en chaîne de 0,05 s (son « pouf » en rafale unique).
* **Budget** : 10 clones éphémères ; fumée 30 particules par vague (12 allégé).
* **Synergies** : SYN_042 Clones et fumée, SYN_043 Clones et crapauds.
* **Risque** : bruit visuel massif. Mode allégé : clones à 2 frames de course et fumée réduite.
* **Test** : performance — une vague de 10 clones + 500 ennemis ne fait pas passer la frame de simulation au-dessus de 4 ms sur la machine de référence (§H8).

## JUT_224 — Kuchiyose — Gamabunta · œuvre adaptée

Famille INVOC · INVOCATION (GEANT) · `plus_dense` · `CTR_CRAPAUD` · évolution EVO_071 (PAS_029).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Atterrissage 60 (r 4 m), 2 sabres × 70 (arc 8 m), 8 s, délai 60 s |
| 2 | Délai 60 → 54 s | — |
| 3 | Dégâts | 75 / 85 |
| 4 | 3 coups de sabre | — |
| 5 | Jet d'eau en fin de présence (Trempé en cône de 8 m) | Prépare Conduction |
| 6 | Durée 8 → 10 s | — |
| 7 | Délai 54 → 48 s | — |
| 8 | L'atterrissage étourdit les ordinaires 1 s | — |

* **Règles d'invocation géante** (§B9.4) : 1 géant max ; apparition à 6 m du joueur côté le moins dense ; ancré ; transparence 55 % quand un projectile hostile, un télégraphe ou le joueur est derrière ; télégraphes ennemis toujours au-dessus ; hitbox de pieds uniquement (2 cercles de 1,5 m) pour la circulation des ennemis ; aucune collision avec le joueur.
* **Séquence** : **annonce** (motif de contrat au sol 1,2 s, cercle de 5 m allié) → **apparition** (nuage 8 frames, atterrissage : onde) → **attaque principale** (sabres télégraphiés en arc allié bleu-blanc 0,4 s avant) → **retrait** (fumée 6 frames).
* **Héritage** : GEANT (Puissance 50 %, pas de critique).
* **Caméra** : décalage de 2 m vers le crapaud pendant 0,5 s, aucun zoom.
* **Budget** : sprite 96 × 96 px ; 30 particules à l'atterrissage ; 1 voix d'arrivée (priorité moyenne, abaissée si avertissement de boss).
* **Synergies** : SYN_046 Contrat scellé, SYN_001 (jet d'eau niv. 5).
* **Risque** : masquage du champ. Test de lisibilité dédié.
* **Test** : pendant les 8 s, 100 % des attaques télégraphiées de boss restent identifiables sur vidéo.

## JUT_229 — Kuchiyose — Meute de ninken · œuvre adaptée

Famille INVOC · INVOCATION (ANIMAL) · `plus_menacant` · `CTR_CHIEN` · évolution EVO_072 (PAS_053).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 8 chiens × 12, Entravé 1,5 s, délai 12 s |
| 2 | Entravé 1,5 → 2 s | — |
| 3 | Dégâts | 16 |
| 4 | Les chiens restent 3 s et mordent (10 / 0,6 s) | — |
| 5 | Délai 12 → 10 s | — |
| 6 | La morsure initiale étourdit 0,5 s avant l'entrave ; priorité aux tireurs et assassins | — |
| 7 | Dégâts | 20 |
| 8 | Pakkun signale le prochain coffre et le prochain élite (indicateur de bord) | Utilitaire |

* **Collision** : chaque chien sort du sol sous sa cible (cercle 0,6 m) ; la meute compte 1 emplacement d'unité.
* **Héritage** : ANIMAL.
* **Animation** : chiens de 10 px distincts (8 silhouettes et couleurs différentes), sortie du sol 3 frames, morsure 2 frames.
* **Budget** : 8 chiens ; poussière 4 par chien ; aboiements groupés (2 voix max).
* **Synergies** : SYN_044 Meute (avec d'autres unités ANIMAL), SYN_032 Surcharge (le Raikiri frappe les cibles étourdies par la morsure initiale du niveau 6).
* **Risque** : contrôle multi-cibles fort ; soumis à la résistance.
* **Test** : immobilisation des tireurs mesurée : ≥ 50 % des tireurs à l'écran immobilisés par invocation.

## JUT_249 — Magen — Narakumi no Jutsu (Vision de l'enfer) · œuvre adaptée

Famille GENJUTSU · CONE · `plus_dense` · `APT_GEN` · évolution EVO_077 (PAS_032).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Cône 70° × 5 m, 5, Étourdi 1 s, coups suivants ×1,2, délai 5 s |
| 2 | Portée 5 → 6 m | — |
| 3 | Étourdi 1 → 1,3 s | — |
| 4 | Les figés deviennent Vulnérables +10 % | — |
| 5 | Délai 5 → 4 s | — |
| 6 | Angle 70 → 90° | — |
| 7 | Un ennemi qui meurt figé propage la terreur à 1 voisin (0,5 s) | — |
| 8 | Étourdi 1,3 → 1,6 s | — |

* **Collision** : secteur instantané ; contrôle (Rc des boss) ; converti en Vulnérable si résisté.
* **Stats** : Zone, Durée (contrôle), Cadence, Puissance (faible), Critique.
* **Animation** : feuilles qui tourbillonnent autour des cibles (répétition localisée 4 frames), silhouettes tremblantes (décalage ±1 px), aucune déformation plein écran.
* **Budget** : 6 feuilles par cible (max 60) ; son grave « souffle d'illusion » unique.
* **Synergies** : SYN_037 Marque de mort (cible figée Marquée et Vulnérable ≥ 20 %), SYN_032 Surcharge (Raiton sur cibles figées, pour Kakashi).
* **Risque** : contrôle de masse contre les hordes → Étourdi court.
* **Test** : les figés sont identifiés comme « figés » (pas « morts ») par 9 testeurs sur 10.

## JUT_264 — Contagion d'illusion · création originale

Famille GENJUTSU · CHAINE · `marque` · `APT_GEN` · évolution EVO_080 « Épidémie d'illusions » (PAS_032).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Toutes les 3 s, chaque Confus propage Confus 1,5 s à 1 voisin (2,5 m), max 8/cycle |
| 2 | Durée propagée 1,5 → 2 s | — |
| 3 | Portée 2,5 → 3 m | — |
| 4 | Sans aucun ennemi Confus, la technique en crée un (le plus dense) | Autonomie |
| 5 | Délai 3 → 2,5 s | — |
| 6 | Max 8 → 12 propagations par cycle | — |
| 7 | Les propagés reçoivent 10 dégâts | — |
| 8 | Chaque propagation touche 2 voisins | — |

* **Collision** : sélection de voisins non confus (grille spatiale) ; contrôle, Rc des boss.
* **Stats** : Zone (portée), Durée, Cadence, Quantité (+2 propagations par point). Puissance seulement au niveau 7.
* **Animation** : fil violet pâle tracé entre cibles 2 frames, spirale au-dessus des têtes (3 frames en boucle) ; la couleur violette est réservée aux illusions alliées (les illusions ennemies sont gris-vert).
* **Budget** : 16 fils ; 1 voix « carillon » par cycle.
* **Synergies** : SYN_036 Discorde (les confus combattent pour le joueur), SYN_061 Illusion du Sharingan (Itachi, Shisui).
* **Risque** : désactive des hordes entières. Plafond par cycle et Rc.
* **Test** : dans BLD_040, 20–40 % des éliminations doivent venir d'ennemis confus (plage cible).

## JUT_265 — Hiraishin — Kunai de marquage · œuvre adaptée

Famille SCEAU · CHAINE · `plus_dense` · Minato, Tobirama · évolution EVO_081 « Réseau céleste » (PAS_033).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Max 3 kunai plantés ; toutes les 3 s, image-éclair qui frappe autour de chacun (22, r 1,5 m) |
| 2 | Rayon 1,5 → 1,8 m | — |
| 3 | +1 kunai (4) | — |
| 4 | Dégâts | 30 |
| 5 | L'image-éclair Marque les ennemis touchés | — |
| 6 | Cycle 3 → 2,5 s | — |
| 7 | +1 kunai (5) | — |
| 8 | Les kunai se replantent automatiquement près des groupes quand aucun ennemi n'est proche d'eux 4 s | Autonomie |

* **Collision** : cercles autour des kunai ; l'image-éclair n'est pas une unité (aucun héritage) et n'est pas le joueur.
* **Stats** : Puissance, Cadence, Zone, Quantité (kunai), Critique.
* **Animation** : kunai à trois pointes avec formule (8 × 8 px), trait jaune-blanc en zigzag entre les kunai 1 frame par saut, arc de coupe 2 frames.
* **Budget** : 5 kunai ; 1 voix « éclair » par cycle (pas par kunai).
* **Synergies** : SYN_051 Kunai de marquage universel, SYN_069 Rasengan éclair.
* **Risque** : dépend du positionnement des kunai : le niveau 8 évite les réseaux inutiles.
* **Test** : les joueurs comprennent que « les kunai sont des relais » après 2 minutes (question ouverte post-run).

## JUT_270 — Réseau d'étiquettes · création originale

Famille SCEAU · PIEGE · `chemin` · `APT_FUIN` · évolution EVO_082 (PAS_049).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Grille 3 × 3 (espacement 1,5 m), 20 par étiquette (r 1,3 m), cascade 0,08 s, délai 8 s |
| 2 | Dégâts | 26 |
| 3 | Espacement 1,5 → 1,8 m | Grille plus grande |
| 4 | Armement 0,5 → 0,3 s | — |
| 5 | Grille 4 × 3 | — |
| 6 | Délai 8 → 6,5 s | — |
| 7 | Chaque étiquette Marque (STA_09) avant d'exploser | Relie les sceaux |
| 8 | Grille 4 × 4 | — |

* **Collision** : chaque étiquette est un déclencheur (0,6 m) ; cascade vers les voisines orthogonales ; une étiquette n'explose qu'une fois.
* **Stats** : Puissance, Cadence, Zone (rayon et espacement), Quantité (+1 rangée), Durée (armement max), Critique.
* **Animation** : étiquettes reliées par des lignes fines (1 px), cascade en vague diagonale ; explosions 3 frames chacune ; son groupé (une seule rafale croissante).
* **Budget** : 16 étiquettes ; 3 explosions audibles simultanées puis fusion.
* **Synergies** : SYN_018 Sceaux et pièges, SYN_077 Éclats de décor.
* **Risque** : pose sur « chemin » mal prédit. La pose vise la zone de 6 m devant la trajectoire du groupe le plus dense.
* **Test** : ≥ 70 % des grilles doivent exploser dans les 5 s suivant la pose.

## JUT_281 — Rasengan (Orbe tourbillonnant) · œuvre adaptée

Famille CLAN (héritage) · CONTACT · `plus_menacant` · `APT_RASEN` · évolution EVO_084 « Ōdama Rasengan » (PAS_060) → éveil EVO_114 · fusion EVO_096 « Rasenshuriken » (avec JUT_080).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Impact 26, onde 10 (r 1,5 m), recul 1,5 m, concentration 0,3 s, délai 2,2 s |
| 2 | Onde 1,5 → 2 m | — |
| 3 | Dégâts | Impact 33, onde 12 |
| 4 | Délai 2,2 → 1,8 s | — |
| 5 | Dégâts | **Impact 40** (valeur de l'exemple §B4.2), onde 15 |
| 6 | L'orbe continue de forer 0,4 s dans la cible (4 ticks × 6) | Rotation visible |
| 7 | Les cibles touchées sont Vulnérables +5 % 2 s | — |
| 8 | Dégâts | Impact 48, onde 18 ; recul 2,5 m |

* **Collision** : image de frappe jusqu'à 3 m de la cible la plus proche dans l'arc avant ; impact = cercle 0,6 m ; onde = cercle instantané SECONDAIRE.
* **Stats** : Puissance, Cadence, Zone (onde), Critique (impact). Pas de Quantité (une seule main) ; pas de Vitesse proj.
* **Animation (fiche de référence)** : **concentration** 0,3 s — le chakra converge en 4 filaments vers la paume (4 frames), puis sphère de 12 px ; **rotation interne** : 6 frames en boucle (3 anneaux décalés, bleu clair/blanc), le personnage reste entièrement visible (l'orbe est tenu devant la main, décalé de 6 px) ; **impact** : l'orbe se déforme en ellipse 2 frames (écrasement contre la cible), **anneaux de pression** 3 anneaux concentriques en 4 frames (épaisseur 2 → 1 px) ; **fragments projetés** : 6 éclats de chakra en éventail dans l'axe du coup ; **retour au calme** : l'orbe se dissipe en spirale 3 frames, 2 particules restent 200 ms. Micro-pause locale 50 ms sur la cible uniquement.
* **Budget** : 10 particules ; 1 instance ; voix « rotation » (boucle courte pendant la concentration) + « impact » (4 variantes).
* **Synergies** : SYN_069 Rasengan éclair (Minato), SYN_060 Élan.
* **Risque** : les clones de Naruto (CPX) multiplient les Rasengan : plafond d'un Rasengan par clone et à 60 %.
* **Test** : vidéo de 3 s — « orbe bleu qui tourne » reconnu par ≥ 90 % des spectateurs familiers de l'œuvre, et le personnage reste identifiable pendant l'animation.

## JUT_282 — Kagemane no Jutsu (Imitation d'ombre) · œuvre adaptée

Famille CLAN · RAYON · `plus_menacant` · `CLAN_NARA` · évolution EVO_085 « Toile d'ombres » (PAS_050) · fusion EVO_107 (avec JUT_283).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Ombre de 7 m, Lié 2 s, ramification vers 1 cible à 2 m, délai 5 s, surface OMBRE |
| 2 | Portée 7 → 8,5 m | — |
| 3 | Lié 2 → 2,5 s | — |
| 4 | +1 ramification | 2 cibles supplémentaires |
| 5 | Délai 5 → 4,2 s | — |
| 6 | Les liés sont Vulnérables +10 % | — |
| 7 | +1 ramification | 3 |
| 8 | L'ombre reste 3 s et lie toute nouvelle cible qui y entre (1 fois / cible) | Zone de piège |

* **Collision** : segment de 0,5 m de large ; ne traverse pas les obstacles hauts (l'ombre les contourne sur 1 m maximum).
* **Stats** : Zone (portée, largeur), Durée (liaison), Cadence, Quantité (+1 ramification). Aucun dégât : Puissance « sans effet direct » (utile via SYN_034).
* **Animation** : ruban noir plat au sol (surface graphique, bords nets, aucune texture), extension en 4 frames ; jonction en crochet sur la cible ; les liés prennent la pose miroir du joueur (répétition de pose, 1 frame de retard).
* **Budget** : 0 particule (effet graphique pur) ; 1 voix « glissement ».
* **Synergies** : SYN_015 Ombre et immobilisation, SYN_034 Coup de grâce de l'ombre.
* **Risque** : l'ombre noire sur fond sombre (MAP_013) : contour violet de 1 px ajouté sur les cartes nocturnes.
* **Test** : lisibilité — l'ombre est visible sur les 20 cartes (capture de référence par carte).

## JUT_291 — Kikaichū (Essaim d'insectes) · œuvre adaptée

Famille CLAN · INVOCATION · `plus_dense` · `CLAN_ABURAME` · évolution EVO_086 « Essaim royal » (PAS_029).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | 1 essaim (r 1,5 m), 3 / 0,5 s + Parasité +1, permanente |
| 2 | Rayon 1,5 → 1,8 m | — |
| 3 | Dégâts | 4 / 0,5 s |
| 4 | L'essaim se déplace 30 % plus vite | — |
| 5 | Parasité +1 → +2 par tick | — |
| 6 | L'essaim se divise en 2 moitiés quand deux groupes sont éloignés de > 6 m (moitiés à 60 %) | — |
| 7 | Dégâts | 5 / 0,5 s |
| 8 | Les ennemis à 10 cumuls de Parasité sont vidés de leur chakra : Étourdi 0,5 s | — |

* **Collision** : disque mobile (1 unité logique) ; les 30 insectes visibles sont des **particules décoratives** (boids) sans collision (§G5).
* **Héritage** : UNITE_ALLIEE générique (Puissance 100 %, Durée 100 %).
* **Animation** : nuée en formation (boids à 3 règles : cohésion, séparation, alignement), points de 1–2 px sombres à contour clair ; le son est un bourdonnement unique dont le volume suit la taille de l'essaim.
* **Budget** : 30 insectes décoratifs par essaim (12 allégé), 2 essaims ; 1 voix.
* **Synergies** : SYN_039 Éclosion, SYN_050 Ruche.
* **Risque** : dégâts diffus peu lisibles ; les chiffres de dégâts sont regroupés (1 chiffre par seconde et par cible).
* **Test** : performance : 2 essaims + 500 ennemis sans surcoût mesurable par rapport à 0 essaim (< 0,3 ms).

## JUT_297 — Hakkeshō Kaiten (Rotation céleste) · œuvre adaptée

Famille CLAN · ONDE · `aucune` · `CLAN_HYUGA` · évolution EVO_087 « Grande rotation » (PAS_051) · fusion EVO_106 (avec JUT_299).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Dôme 2,2 m, 24, recul 2,5 m, détruit les projectiles ordinaires, délai 6 s |
| 2 | Rayon 2,2 → 2,6 m | — |
| 3 | Dégâts | 32 |
| 4 | Se déclenche aussi en réaction quand un assassin apparaît à ≤ 3 m (1 fois / 8 s) | — |
| 5 | Délai 6 → 5 s | — |
| 6 | Durée du dôme 0,4 → 0,8 s (touche 2 fois) | — |
| 7 | Si la rotation détruit au moins un projectile, elle compte comme un bouclier ayant absorbé un coup | Active SYN_059 |
| 8 | Recul 2,5 → 3,5 m et Étourdi 0,4 s | — |

* **Collision** : sphère autour du joueur ; destruction des projectiles ordinaires (pas des télégraphes de boss) ; recul réduit dans les zones alliées.
* **Stats** : Puissance, Cadence, Zone, Durée (dôme), Critique.
* **Animation** : dôme bleu clair strié en rotation (4 frames, 24 i/s), sol creusé en cercle (décalque temporaire 2 s), poussière tangentielle ; le personnage pivote au centre (animation dédiée 8 directions → rotation continue en 8 poses).
* **Budget** : 16 poussières ; 1 voix « tourbillon ».
* **Synergies** : SYN_059 Riposte blindée (niv. 7), SYN_062 Points fermés (Jūken sur les cibles marquées juste après).
* **Risque** : défense forte contre les tireurs ; délai de 5 s minimum.
* **Test** : en mode déplacement seul, Neji doit survivre 5 min au rang D grâce à la Rotation (accessibilité).

## JUT_309 — Amaterasu · œuvre adaptée

Famille OCULAIRE · DIFFERE · `plus_menacant` · Itachi (2 entrées), Sasuke Mangekyō éternel · évolution EVO_091 (PAS_035) → éveil EVO_116 · fusion EVO_111 (avec JUT_154).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Brûlure noire 5 cumuls (×2), 2 transmissions à la mort, délai 8 s |
| 2 | Délai 8 → 7 s | — |
| 3 | +1 transmission | 3 |
| 4 | Les flammes noires laissent une flaque 1,5 s à la mort de la cible | — |
| 5 | +1 cible initiale (2e plus menaçante) | — |
| 6 | Délai 7 → 6 s | — |
| 7 | Brûlure noire cumul max 5 → 6 | — |
| 8 | Transmission : 2 voisins au lieu d'1 | — |

* **Collision** : aucune géométrie (application directe) ; la fixation du regard dure 0,3 s (œil du portrait qui saigne, signal visuel sobre).
* **Stats** : Puissance (dégâts de Brûlure), Cadence, Durée (Brûlure), Quantité (cibles initiales). Pas de Zone sauf flaque. Pas de critique (dégâts sur la durée).
* **Lisibilité** : flammes noires à **contour blanc de 1 px** et liseré rouge, silhouette de flamme plus haute que la Brûlure normale (8 px au lieu de 5) ; restent lisibles sur fond sombre.
* **Animation** : apparition instantanée sur la cible (2 frames), boucle 4 frames, transmission : trait noir sinueux de la cible morte à la suivante (3 frames).
* **Budget** : 6 flammes par cible, 20 cibles brûlantes max ; son grave continu unique (volume selon le nombre de cibles).
* **Synergies** : SYN_064 Flèches de flammes noires (Sasuke), SYN_031 Plaies brûlantes (Brûlure noire compte comme Brûlure).
* **Risque** : dégâts sur la durée illimités par transmission → plafonds de transmissions et de cibles.
* **Test** : daltonisme et fond sombre : sur MAP_009 et MAP_013, les flammes noires sont repérées en < 1 s par 9 testeurs sur 10.

## JUT_313 — Rinnegan — Shinra Tensei (Répulsion divine) · œuvre adaptée

Famille OCULAIRE · ONDE · `aucune` · `DOJ_RINNEGAN` · évolution EVO_093 (PAS_035) · fusion EVO_112 (avec JUT_314).

| Niv | Changement | Résultat |
|---|---|---|
| 1 | Base | Onde 6 m, 30, recul 4 m, détruit les projectiles ordinaires, délai 10 s |
| 2 | Dégâts | 40 |
| 3 | Rayon 6 → 7 m | — |
| 4 | Les ennemis repoussés contre un obstacle subissent un choc (25) | — |
| 5 | Délai 10 → 8,5 s | — |
| 6 | Si l'onde détruit au moins un projectile, elle compte comme un bouclier ayant absorbé un coup | Active SYN_059 |
| 7 | Dégâts | 52 |
| 8 | Se déclenche automatiquement (hors cycle) si ≥ 25 ennemis sont à 3 m (1 fois / 15 s) | Sécurité |

* **Collision** : anneau instantané de 0 à 6 m en 0,15 s ; recul réduit de 70 % dans les zones alliées.
* **Stats** : Puissance, Cadence, Zone, Critique. Pas de Durée.
* **Animation** : anneau blanc qui plie le décor (distorsion locale de 2 px sur 3 frames, jamais plein écran), débris projetés, cratère temporaire 2 s ; son sourd suivi d'un silence de 150 ms (contraste).
* **Budget** : 30 débris ; 1 voix ; distorsion désactivée en mode confort (remplacée par un anneau net).
* **Synergies** : SYN_059 Riposte blindée (niv. 6), SYN_063 Attraction dans le piège (avec Bansho Ten'in dans le même build).
* **Risque** : vide l'écran → casse le rythme de collecte. Les fragments ne sont pas repoussés (ils restent en place).
* **Test** : après un Shinra Tensei, le joueur doit pouvoir récupérer ≥ 80 % des fragments libérés dans les 5 s.
