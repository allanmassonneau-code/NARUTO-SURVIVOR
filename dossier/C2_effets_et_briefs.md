# C2. Fiches d'effets visuels (VFX) et briefs d'écrans (ART)

Briefs de production. Dimensions en pixels de la résolution interne (640 × 360). Frames à 24 i/s sauf mention. « Couches » : F = fond (sous les entités), C = corps (tri en Y), L = lumière additive (cœur), T = télégraphe/indicateur. Ancrages : main D/G, bouche, pieds, centre, cible, sol. Les variantes allégées sont celles du réglage « particules allégées » ; elles ne changent jamais la forme ni la durée de la zone de gameplay.

## VFX — 20 fiches

### VFX_001 — Rasengan (JUT_281, EVO_084)
| Champ | Spécification |
|---|---|
| Dimensions | Orbe S 12 × 12, M (Ōdama) 24 × 24, L 32 × 32 ; anneaux jusqu'à 48 × 48 ; fragments 3 × 3 |
| Durée | Concentration 300 ms · boucle de rotation (tenue jusqu'à l'impact) · impact 170 ms · dissipation 125 ms |
| Étapes | 1) 4 filaments de 1 px convergent vers la paume (4 frames) ; 2) sphère : 3 anneaux décalés (bleu clair, blanc, bleu moyen) tournent (6 frames en boucle) ; 3) impact : écrasement en ellipse 2 frames ; 4) anneaux de pression 3 × concentriques, épaisseur 2 → 1 px (4 frames) ; 5) 6 fragments de chakra dans l'axe du coup ; 6) spirale de retour au calme 3 frames |
| Frames à produire | 4 + 6 + 2 + 4 + 3 = 19 (× 3 tailles pour la sphère : 6 × 3 = 18 frames de boucle) |
| Couches | C (sphère), L (cœur blanc 4 × 4), F (anneaux au sol) |
| Ancrages | Main D (décalage +6 px devant la paume) ; cible (impact) |
| Son | Boucle aiguë de rotation (monte en volume pendant la concentration) + impact « whoomp » (4 variantes) |
| Simultanéité | 1 Rasengan du joueur + 8 Rasengan de clones max ; au-delà : clones à 1 anneau sans fragments |
| Variante allégée | Pas de fragments, 2 anneaux au lieu de 3, spirale finale supprimée |

### VFX_002 — Clone de l'ombre : apparition, action, disparition (JUT_217)
| Champ | Spécification |
|---|---|
| Dimensions | Nuage 24 × 24 ; clone = sprite du personnage (28 px) |
| Durée | Apparition 250 ms · révélation 83 ms · « pouf » final 170 ms |
| Étapes | 1) Nuage blanc-gris en 6 frames (bouffée qui gonfle puis s'effiloche vers le haut) ; 2) silhouette révélée en 2 frames (palette désaturée de 15 %, contour bleu clair 1 px) ; 3) pose de combat 1 frame ; 4) action ; 5) disparition : nuage 4 frames, le clone s'efface à la 2e frame |
| Frames | 6 + 4 (nuages, réutilisés par tous les clones) ; palette de clone générée par script (pas de redessin) |
| Couches | F (ombre du nuage), C (nuage et clone) — la fumée est dessinée **sous** les télégraphes |
| Ancrages | Pieds (apparition) ; centre (disparition) |
| Son | « Pouf » (3 variantes) ; regroupé si plusieurs clones dans la même frame (un seul son + 1 dB par clone, max +4 dB) |
| Simultanéité | 8 nuages simultanés max ; au-delà, nuage réduit à 3 frames |
| Variante allégée | Nuage 3 frames, pas d'effilochage |

### VFX_003 — Frappe physique lourde (JUT_107, JUT_286, JUT_175)
| Champ | Spécification |
|---|---|
| Dimensions | Poing de pierre 16 × 16 (×1,5 pose d'impact = sprite dédié 24 × 24) ; poussière 40 × 16 en éventail |
| Durée | Anticipation 250 ms · pose d'impact tenue 100 ms · recul des cibles 200 ms · poussière 250 ms |
| Étapes | 1) Épaule reculée, poing ×1,2 (sprite dédié), poussière aux pieds ; 2) pose tenue 2 frames, arc de mouvement en 2 traits ; 3) cibles écrasées horizontalement 2 frames (squash 120 % × 80 %) ; 4) poussière dirigée dans l'axe (8 particules) ; 5) recul ease-out |
| Frames | 3 (anticipation) + 2 (impact) + 4 (poussière) |
| Couches | C, F (poussière au sol) |
| Ancrages | Main D (poing), pieds (poussière), cible |
| Son | Impact sourd grave + craquement (2 couches), 4 variantes |
| Simultanéité | Micro-pause locale 60 ms sur 6 cibles max |
| Variante allégée | Poussière 4 particules ; squash conservé (information de poids) |

### VFX_004 — Foudre construite (JUT_059, JUT_049, JUT_050)
| Champ | Spécification |
|---|---|
| Dimensions | Segment par saut ≤ 72 px (4,5 m) ; épaisseur tête 3 px, corps 2 px, ramifications 1 px |
| Durée | Construction : 1 frame par saut · ramifications : 1 frame après · point d'arrivée 2 frames · disparition 3 frames |
| Étapes | 1) Tête épaisse qui avance jusqu'à la cible suivante (tracé brisé à 3–5 angles vifs, généré par graine cosmétique) ; 2) ramifications secondaires décoratives (2–3 par segment) ; 3) étoile d'arrivée 5 × 5 ; 4) épaisseur 2 → 1 px puis disparition |
| Frames | Procédural (tracé) + 2 frames d'étoile + 3 d'étincelles |
| Couches | L (additif, cœur blanc), C (bord bleu) |
| Ancrages | Main (départ), cible (arrivée) |
| Son | Crépitement dont la hauteur monte à chaque saut (glissando), claquement final |
| Simultanéité | 3 chaînes × 16 segments |
| Variante allégée | Pas de ramifications secondaires ; tête et étoile conservées |

### VFX_005 — Grande boule de feu (JUT_001, EVO_001)
| Champ | Spécification |
|---|---|
| Dimensions | S 16 × 16, M 24 × 24 (grossit en vol), L 32 × 32 (évolution) ; explosion 48 × 48 |
| Durée | Préparation 250 ms · vol en boucle 4 frames · explosion 200 ms · fumée 150 ms |
| Étapes | Sceau du tigre, joues gonflées → souffle et anneau de chaleur → masse orange à cœur jaune pâle, langues vers l'arrière → fleur à 6 lobes → fumée brune et braises |
| Frames | 4 (préparation, poses du personnage) + 4 × 3 tailles (vol) + 5 (explosion) + 3 (fumée) |
| Couches | C (masse), L (cœur), F (flaque) |
| Ancrages | Bouche (départ) |
| Son | Souffle + explosion (3 variantes) |
| Simultanéité | 4 boules |
| Variante allégée | Braises 10 au lieu de 20 |

### VFX_006 — Dragon d'eau (JUT_025, EVO_009)
| Champ | Spécification |
|---|---|
| Dimensions | Tête 16 × 12, 5 segments de 12 × 10, gerbes 8 × 8 |
| Durée | Sortie de la flaque 125 ms · corps animé en boucle · dispersion 170 ms |
| Étapes | Flaque qui bouillonne → tête qui jaillit (3 frames) → corps segmenté ondulant (les segments suivent la trajectoire avec retard) → gerbes à chaque ondulation → dispersion en pluie |
| Frames | 3 + 4 (tête) + 2 (segment, alternés) + 4 (dispersion) |
| Couches | C (corps translucide 80 %), L (crête blanche) |
| Son | Torrent en boucle, splash final |
| Simultanéité | 3 dragons |
| Variante allégée | Gerbes supprimées |

### VFX_007 — Faux de vent (JUT_074, EVO_027)
| Champ | Spécification |
|---|---|
| Dimensions | Croissant 48 × 24 (S) à 80 × 32 (L) |
| Durée | Anticipation (éventail) 150 ms · déplacement ~0,9 s · entailles 80 ms |
| Étapes | Éventail qui s'ouvre (3 frames, 3 lunes) → croissant en 3 couches blanches décalées (opacité 50/70/90 %) → feuilles hachées en traîne → entailles en X sur les cibles |
| Frames | 3 + 3 + 2 |
| Couches | L (bord), C (feuilles) |
| Son | Sifflement + « tranche » groupée |
| Simultanéité | 2 croissants |
| Variante allégée | 2 couches au lieu de 3, pas de feuilles |

### VFX_008 — Cercueil de sable (JUT_131, EVO_044, EVO_118)
| Champ | Spécification |
|---|---|
| Dimensions | Colonne de sable 16 × 32 autour de la cible ; accumulation au sol 24 × 8 |
| Durée | Enveloppement 1 s (5 frames lentes) · fermeture 2 frames · broyage 2 frames · retombée 4 frames |
| Étapes | Grains en tramage 2 tons qui grimpent en spirale → fermeture en poing → compression verticale → grains qui retombent en cône et forment une accumulation au sol |
| Couches | C (sable), F (accumulation) |
| Son | Crissement montant, craquement sourd |
| Simultanéité | 6 cercueils (évolution) ; son groupé |
| Variante allégée | Tramage 1 ton, retombée 2 frames |

### VFX_009 — Kirin (JUT_054, EVO_022, EVO_115)
| Champ | Spécification |
|---|---|
| Dimensions | Nuage 64 × 24 → 96 × 32 (4 paliers) ; bête de foudre 64 × 96 ; onde au sol 112 × 56 |
| Durée | Construction 6 s (4 paliers visibles) · chute 125 ms · impact 250 ms · dissipation 300 ms |
| Étapes | Nuage sombre à contour clair qui grossit par paliers (lisible à tout moment) → 1 frame de pré-éclair (trait fin) → bête en 3 frames → onde au sol 5 frames → arcs résiduels |
| Couches | F (ombre du nuage au sol : indique la zone), L (bête), T (cercle d'impact allié pointillé pendant la dernière seconde) |
| Son | Grondement de construction (boucle croissante), impact unique ; −6 dB si un avertissement de boss est en cours |
| Simultanéité | 1 Kirin (2 avec l'éveil, décalés de 0,5 s) |
| Variante allégée | Arcs résiduels supprimés ; ombre au sol conservée (information) |

### VFX_010 — Invocation géante (JUT_224 Gamabunta ; modèle pour tous les géants)
| Champ | Spécification |
|---|---|
| Dimensions | Motif de contrat au sol 80 × 40 ; nuage 128 × 96 ; crapaud 96 × 96 ; arcs de sabre 128 × 64 |
| Durée | Annonce 1,2 s · apparition 330 ms · présence 8 s · retrait 250 ms |
| Étapes | Motif de contrat (cercle et caractères) qui se dessine au sol → nuage massif → atterrissage (onde au sol, poussière) → attaques télégraphiées en arc allié pointillé 0,4 s → retrait en fumée |
| Couches | F (motif, onde), C (géant, **opacité 55 %** quand un projectile hostile, un télégraphe ou le joueur est derrière), T ennemis toujours au-dessus |
| Ancrages | Sol à 6 m du joueur (côté le moins dense) |
| Son | Arrivée grave (priorité moyenne), coups de sabre |
| Simultanéité | 1 géant |
| Variante allégée | Poussière réduite ; transparence conservée |

### VFX_011 — Flammes noires (JUT_309, JUT_154, EVO_091)
| Champ | Spécification |
|---|---|
| Dimensions | Flamme 6 × 8 par cumul (collée à la cible), sol noirci 16 × 8 |
| Durée | Apparition 2 frames · boucle 4 frames · transmission 3 frames |
| Étapes | Apparition instantanée (pas de projectile) → flammes noires hautes à **contour blanc 1 px** et liseré rouge → à la mort, trait noir sinueux vers la cible suivante |
| Couches | C (flammes), L (liseré rouge faible) |
| Son | Grondement grave continu (volume selon le nombre de cibles) |
| Simultanéité | 20 cibles brûlantes |
| Variante allégée | 1 flamme par cible au lieu de 1 par cumul ; contour blanc conservé |

### VFX_012 — Imitation d'ombre (JUT_282)
| Champ | Spécification |
|---|---|
| Dimensions | Ruban de 8 px de large, jusqu'à 136 px de long (modules de 16 px) |
| Durée | Extension 170 ms (4 frames) · tenue · retrait 125 ms |
| Étapes | L'ombre du joueur s'étire (aplat noir, bords nets) → crochet sur la cible → la cible prend la pose miroir du joueur → retrait |
| Couches | F (surface), contour violet 1 px sur les cartes sombres |
| Son | Glissement sourd, « tac » de liaison |
| Simultanéité | 6 liaisons |
| Variante allégée | Aucune (effet sans particule) |

### VFX_013 — Essaim d'insectes (JUT_291)
| Champ | Spécification |
|---|---|
| Dimensions | Nuage logique 48 × 48 ; insectes 1–2 px |
| Durée | Permanent |
| Étapes | 30 boids (cohésion, séparation, alignement) autour du centre logique ; enveloppement : les boids se resserrent sur la cible |
| Couches | C (insectes à contour clair) ; pas d'ombre (signale le décoratif) |
| Son | Bourdonnement unique, volume selon la taille |
| Simultanéité | 2 essaims (60 boids) |
| Variante allégée | 12 boids par essaim |

### VFX_014 — Étiquette explosive (JUT_189, JUT_270)
| Champ | Spécification |
|---|---|
| Dimensions | Étiquette 6 × 10 ; explosion 32 × 32 ; fumée 32 × 24 |
| Durée | Combustion 3 frames (grésillement) · explosion 5 frames · fumée 4 frames |
| Étapes | Kunai planté → étiquette qui se consume du bas vers le haut → boule orange-blanc → fumée grise |
| Couches | T (cercle allié pointillé blanc + motif de sceau pendant la combustion), C, L |
| Son | Grésillement + explosion (3 variantes) ; cascade : une rafale unique croissante |
| Simultanéité | 3 explosions audibles, 16 visuelles |
| Variante allégée | Fumée 2 frames |

### VFX_015 — Répulsion divine (JUT_313, EVO_093)
| Champ | Spécification |
|---|---|
| Dimensions | Anneau jusqu'à 192 px de diamètre (6 m) |
| Durée | 150 ms d'expansion · cratère 2 s |
| Étapes | Anneau blanc cassé qui s'étend, distorsion locale de 2 px sur le décor (3 frames), débris projetés, cratère temporaire, silence de 150 ms |
| Couches | L (anneau), F (cratère) |
| Son | Coup sourd puis silence bref (contraste) |
| Simultanéité | 1 |
| Variante allégée | Distorsion remplacée par un anneau net (mode confort) |

### VFX_016 — Rasenshuriken (EVO_096)
| Champ | Spécification |
|---|---|
| Dimensions | Projectile 32 × 32 (orbe 12 px + 4 lames de 10 px) ; dôme 96 × 96 |
| Durée | Lancer 170 ms · vol · dôme 1 s |
| Étapes | Orbe + lames en rotation rapide (4 frames) → impact → dôme blanc strié (lignes de micro-lames en rotation, 6 frames en boucle) → effondrement du dôme en 3 frames |
| Couches | L (dôme, opacité 70 % : les ennemis dedans restent visibles), C |
| Son | Sifflement aigu continu qui monte, dôme « grondement strié » |
| Simultanéité | 2 |
| Variante allégée | Dôme à 4 frames, sans lignes secondaires |

### VFX_017 — Activation du Manteau du Kyūbi (TRF_001)
| Champ | Spécification |
|---|---|
| Dimensions | Aura 40 × 40 autour du sprite ; oreilles et queue de chakra +6 px |
| Durée | Activation 800 ms (invulnérable) · boucle d'aura · fin 400 ms |
| Étapes | Pose dédiée 6 frames (accroupi → dressé), bulles de chakra qui montent du sol, silhouette de renard qui se forme en 3 frames, onde au sol (pas de flash) ; fin : l'aura s'évapore en bulles |
| Couches | F (onde), C (aura derrière et devant le sprite, sprite toujours lisible) |
| Son | Grondement grave, souffle, thème du personnage en couche musicale |
| Simultanéité | 1 |
| Variante allégée | Bulles réduites de 60 % ; silhouette de renard conservée |

### VFX_018 — Fragments d'expérience et collecte
| Champ | Spécification |
|---|---|
| Dimensions | Bleu 4 × 4, bleu+ 5 × 5, vert 6 × 6, rouge 7 × 7, doré 9 × 9, condensé 11 × 11 |
| Durée | Arc d'apparition 250 ms · attraction 250 ms (ease-in) · absorption 1 frame |
| Étapes | Jaillissement en arc (hauteur 6 px, ombre au sol) → rebond 1 px → scintillement lent (1 frame / 500 ms) → attraction → étincelle sur le joueur |
| Couches | C (cristal), L (scintillement) |
| Son | « Tic » dont la hauteur monte dans une série (fenêtre 150 ms), plafond +12 demi-tons, accord de résolution |
| Simultanéité | 300 fragments logiques ; au-delà, fragment condensé (§B6.2) |
| Variante allégée | Pas de scintillement ; formes conservées (distinction par forme : losange, hexagone, étoile) |

### VFX_019 — Télégraphe ennemi et attaque de boss (Tranche du couperet de Zabuza)
| Champ | Spécification |
|---|---|
| Dimensions | Arc de 150° × 3,5 m (112 px de rayon) |
| Durée | Avertissement 700 ms · actif 200 ms · récupération 1 s |
| Étapes | Zone remplie à 35 % + bord plein + hachures diagonales qui défilent (vitesse croissante sur la fin) → pulsation 2 Hz → trait de lame blanc sur toute la zone (1 frame) → poussière → la zone disparaît en 2 frames |
| Couches | T (au-dessus de tous les effets alliés et du géant) |
| Son | Signal d'avertissement (sifflement métallique) au début, coup au déclenchement |
| Simultanéité | 8 télégraphes ennemis visibles ; jamais réduits par les réglages |
| Variante allégée | Aucune (information de gameplay) ; option « télégraphes renforcés » : +30 % de durée et bord 2 px |

### VFX_020 — Élimination d'élite et coffre
| Champ | Spécification |
|---|---|
| Dimensions | Éclats dorés 3 × 3 (6), coffre 16 × 12, halo 24 × 24 |
| Durée | Élite : 400 ms ; coffre : chute 250 ms, ouverture 1,2 s / 0,4 s / 0 s |
| Étapes | Élite figée 2 frames, contour doré qui se brise en 6 éclats, fontaine de fragments dorés, coffre qui tombe (ombre) ; à l'ouverture : couvercle 3 frames, rayons selon le contenu (1, 3 ou 5 cartes en éventail), cartes qui se retournent |
| Couches | C, L (halo), interface |
| Son | Accord de 3 notes (élite) ; ouverture : cliquetis + note par carte |
| Simultanéité | 2 coffres au sol max (le 3e s'ouvre automatiquement en file) |
| Variante allégée | Ouverture 0,4 s par défaut après la 3e ouverture de la run |

## ART — 12 briefs d'écrans et de scènes

### ART_001 — Écran de titre
* **Composition** : falaise des visages (création originale, sans reproduire l'œuvre à l'identique) au loin, toits de village au premier plan, Naruto, Sasuke et Sakura de dos en silhouette sur un toit à gauche (règle des tiers), titre original du projet à droite.
* **Palette** : ciel d'aube (orangés désaturés), toits bleu-gris, silhouettes sombres à contour clair.
* **Tailles** : personnages 48 px (sprites de titre dédiés, pas agrandis), titre 160 × 48.
* **Animation** : nuages en parallaxe 3 couches, feuilles qui traversent, cape/écharpe au vent (4 frames).
* **Priorité** : « Jouer » (reprise automatique si une run existe) ; options, Archives.
* **Ressources** : 3 couches de décor 640 × 360, 3 sprites de titre, logo, 12 feuilles.

### ART_002 — Sélection du personnage
* **Composition** : grille de portraits 32 × 32 à gauche (8 colonnes), grand portrait 64 × 64 et sprite en animation d'attente au centre, fiche à droite (technique de départ, ultime, 2 orientations, maîtrise).
* **Palette** : fond neutre papier (beige désaturé), cadres par rareté de déblocage.
* **Animation** : le sprite joue sa pose de victoire en boucle lente au survol ; changement en 150 ms.
* **Priorité** : « Lancer » ; aperçu du pool (« Pool : 40 techniques »).
* **Ressources** : 80 portraits, cadre de sélection, icônes de familles.

### ART_003 — Début de run (00:30, MAP_002 Pont)
* **Composition** : le pont occupe une bande horizontale de 24 m ; le joueur au centre, 6–10 ennemis lointains, brume légère aux bords.
* **Palette** : bois gris-brun, mer bleu-gris ; les ennemis se détachent par contour.
* **Tailles** : joueur 28 px, poursuivants 24 px ; 3 kunai en vol.
* **Animation** : vagues sous le pont (boucle 4 frames), cordages qui oscillent.
* **Priorité** : lisibilité du déplacement et des premières attaques ; icône de déplacement (tutoriel) à la première run.
* **Ressources** : tileset du pont (48 tuiles), mer (4 frames), 2 ennemis, grues.

### ART_004 — Fin de run (19:30, vague d'apogée)
* **Composition** : 250–300 ennemis en anneau, effets alliés couvrant 40 % du champ en transparence dynamique, deux élites dorées signalées au bord.
* **Palette** : décor assombri de 10 % (réglage automatique en vague d'apogée) pour faire ressortir les effets.
* **Animation** : aucune secousse persistante ; les chiffres de dégâts (si activés) sont regroupés.
* **Priorité** : le joueur (anneau + contour), les projectiles hostiles, le chronomètre.
* **Ressources** : aucun asset spécifique ; test de performance et de lisibilité (capture de référence).

### ART_005 — Montée de niveau
* **Composition** : jeu figé et assombri de 40 %, 3 cartes 120 × 160 en bas-centre, compteurs Relance/Bannissement/Passage au-dessus.
* **Palette** : cartes couleur papier, cadre par type (technique : cercle, passif : carré).
* **Animation** : anneau doux autour du joueur (2 frames), cartes qui glissent en 250 ms ; carte survolée soulevée de 4 px.
* **Priorité** : bénéfice principal en une phrase, différence avant/après.
* **Ressources** : cadres de cartes (4 types), 3 icônes de contrôle du hasard.

### ART_006 — Évolution
* **Composition** : centre de l'écran, rouleau qui s'ouvre horizontalement (240 × 64), icône d'origine à gauche → icône évoluée au centre, nom au-dessus.
* **Palette** : motif de la famille (flammes, vagues…) en filigrane sur le rouleau.
* **Animation** : séquence de 900 ms (§C11.4) ; silhouette animée de la technique évoluée (32 × 32, 6 frames).
* **Priorité** : nom et changement de comportement (une ligne).
* **Ressources** : rouleau (8 frames), 13 motifs de famille, 120 icônes évoluées et silhouettes animées (production à étaler).

### ART_007 — Transformation (Manteau du Kyūbi)
* **Composition** : pas d'écran séparé : pose de transformation en jeu, onde au sol, bandeau de nom 1,5 s en haut.
* **Palette** : aura orange-rouge sur un décor momentanément désaturé de 20 % (0,8 s).
* **Animation** : VFX_017.
* **Priorité** : le coût éventuel (jauge rouge sous le portrait) et la durée restante (jauge étoile).
* **Ressources** : 24 poses de transformation, 24 auras, bandeaux.

### ART_008 — Boss (entrée et combat de Zabuza)
* **Composition** : brume qui se lève, Zabuza sur un pilier à 10 m, couperet planté ; barre de PV en haut avec nom et icône.
* **Palette** : brume blanche, silhouette sombre à contour clair.
* **Animation** : entrée 2,0 s passable ; télégraphes §VFX_019.
* **Priorité** : lecture des attaques (zones remplies hachurées), fenêtre de vulnérabilité (icône de couperet barré quand il est désarmé).
* **Ressources** : Zabuza (≈ 120 frames), couperet (rotation 8 frames), brume (calque), 5 télégraphes.

### ART_009 — Coffre
* **Composition** : coffre au centre 32 × 24 (version d'écran), cartes en éventail au-dessus (1, 3 ou 5).
* **Palette** : bois (simple), laque rouge (lieutenant), or (évolution garantie).
* **Animation** : 1,2 s / 0,4 s / instantané ; évolution : bascule directe sur ART_006.
* **Priorité** : contenu, pas l'animation.
* **Ressources** : 3 coffres × 6 frames, rayons, dos de carte.

### ART_010 — Archives Ninja
* **Composition** : bibliothèque en rayonnages (onglets à gauche : Personnages, Techniques, Ennemis, Synergies, Recettes, Secrets), fiche à droite avec sprite animé et texte.
* **Palette** : bois chaud, papier, encre.
* **Animation** : page qui tourne 150 ms.
* **Priorité** : recherche, filtres, indices de secrets par étapes.
* **Ressources** : fond, 6 onglets, cadres de fiches, silhouettes « non découvert ».

### ART_011 — Défaite
* **Composition** : vignette figée de la dernière seconde (160 × 90) en haut à gauche avec la source des dégâts entourée, top 5 des sources à droite, progression en bas, bouton **Rejouer** focalisé.
* **Palette** : désaturée, accents rouges discrets.
* **Animation** : 0,5 s d'apparition ; pose de défaite du personnage (4 frames).
* **Priorité** : comprendre la mort (cause, type de dégâts), relancer.
* **Ressources** : cadre, pictogrammes de types de dégâts.

### ART_012 — Victoire
* **Composition** : pose de victoire du personnage au centre sur le décor de la carte, boss vaincu en silhouette à genoux au second plan, statistiques et déblocages à droite.
* **Palette** : lumière chaude, saturation légèrement augmentée.
* **Animation** : 1,5 s passable ; déblocages qui apparaissent en icônes (100 ms chacun).
* **Priorité** : déblocages obtenus, Rejouer / Village.
* **Ressources** : 80 poses de victoire, cadres de déblocage.
