# D. Contenu et situations

Catalogues complets en E (`E_catalogues/`). Cette partie donne les règles de contenu et développe intégralement **4 cartes** et **6 boss** (données brutes dans `data/cartes.yaml` et `data/boss_*.yaml`).

## D1. Roster

* **80 entrées jouables** : 56 personnages distincts + 24 variantes (`E_catalogues/personnages.md`). 24 fiches approfondies (`fiches_personnages.md`).
* **Départ** : Naruto (CHR_001), Sasuke (CHR_004), Sakura (CHR_007). **Kakashi** (CHR_008) après la première run qui dépasse 03:00 (victoire ou défaite).
* **Variante vs transformation** : une **variante** est une entrée sélectionnable avec une autre technique de départ, un autre passif exclusif et un autre ultime ou transformation ; une **transformation** est acquise pendant une run. Une même expérience n'est jamais comptée deux fois : par exemple, Naruto (base) a le Manteau du Kyūbi comme transformation, alors que la variante « Chakra de Kurama » démarre avec les clones de masse et le double ultime, et a sa propre transformation (Mode Kurama, puis Avatar).
* **Rôles de soutien en solo** : chaque personnage axé sur le soin, le contrôle ou la défense convertit son rôle en élimination par un mécanisme propre (fiches approfondies) : Hinata affaiblit pour rester au centre de la horde ; Shikamaru convertit l'immobilisation en exécution et en pièges ; Kurenai fait s'entretuer les ennemis (SYN_036) ; Tsunade transforme l'encaissement en frappes lourdes ; Gaara prépare les exécutions par l'Ensablé. Aucun ne reçoit « les mêmes explosions ».
* **Déblocages** : 76 entrées par mission (MIS_101–180), 3 au départ, 1 à la première run. Aucune mission ne demande de posséder l'entrée qu'elle débloque (vérifié automatiquement) ; les variantes demandent l'entrée de base à un niveau de maîtrise donné.

## D2. Cartes

### D2.1 Règles de level design (toutes cartes)

1. Couloirs ≥ 2 m partout ; aucun cul-de-sac de moins de 6 m de profondeur sans sortie.
2. Obstacles hauts (bloquent projectiles) et bas (bloquent déplacement ennemi seulement) visuellement distincts (hauteur de sprite ≥ 24 px vs ≤ 12 px).
3. Chaque carte a **1 contrainte de déplacement**, **1 événement signature**, **2–3 points d'intérêt** (Rouleaux, coffres, autels de secret) placés à 25–45 m du centre pour créer de petits choix de route sans exploration lente (un aller-retour ≤ 20 s).
4. Les objectifs secondaires ont un **risque visible** (zone marquée, ennemis supplémentaires annoncés), une récompense affichée et une possibilité de **renoncer** sans pénalité (l'objectif expire).
5. Aucune zone d'eau profonde, de lave ou de vide n'est létale : elles ralentissent ou blessent de façon annoncée, et le vide est bordé de rambardes.

### D2.2 MAP_001 — Konoha, terrains d'entraînement (intégrale)

```
N ┌────────────────────────── colline (Rouleau A) ─────────────────────────┐
  │   forêt claire        ○ souches (rations)          forêt claire        │
  │        ┌──────── clairière centrale (3 poteaux ▮▮▮) ────────┐          │
  │        │    stèle aux héros (secret) ◇                      │          │
  │  ══ gué ouest (Rouleau B) ═══ rivière E-O ═══ gué central ═══ gué est ══│
  │        forêt claire          ○            ○        forêt claire        │
  └──────────────────────────────── falaises douces ──────────────────────┘ S
  160 × 160 m, bornée. Apparition du joueur : clairière centrale.
```

| Élément | Détail |
|---|---|
| Tracé | Clairière (40 × 30 m) ; anneau de forêt claire (troncs de 1 m, couloirs ≥ 3 m) ; rivière est-ouest de 6 m de large, 3 gués de 4 m |
| Palette | Verts tendres désaturés (≤ 50 %), terre ocre, eau turquoise pâle |
| Obstacles | Faible densité : 1 obstacle / 60 m² hors clairière |
| Ressources | Rations dans 6 souches (1 / 3 min), Rouleau A (colline, 40 m nord), Rouleau B (gué ouest, 35 m) |
| Ennemis | Clone d'entraînement, Bandit déserteur, Sanglier, Lanceur de kunai, Sentinelle à fils, Démineur, élite Chūnin instructeur |
| Événement | **Test des clochettes** (08:00) : 3 clochettes sur 3 ennemis signalés ; toutes récupérées en 60 s → coffre de lieutenant ; échec : aucune pénalité |
| Boss | Kakashi (BOS_035) : 90 000 PV (rang C) ; version d'entraînement à 25 % dans MIS_001 |
| Secret | SEC_001 : frapper les 3 poteaux dans l'ordre gauche-centre-droite au CONTACT → stèle aux héros |
| Contrainte | Rivière : −25 % déplacement dans l'eau hors gués ; les gués sont des goulets |
| Choix de route | Rouleau A (colline, loin du flux ennemi, sûr mais lent) vs Rouleau B (gué, sur le flux, rapide mais exposé) |

### D2.3 MAP_002 — Pays des Vagues, pont inachevé (intégrale ; carte de la tranche verticale)

```
O ═╦═══════════════════════ pont (24 m de large, 320 m de long) ═══════════════╦═ E
   ║ îlot ouest  [grue 1] ▒trou▒  [grue 2]   piles d'eau ≈≈   [grue 3] ▒trou▒ [grue 4]  îlot est ║
   ║ (Rouleau A)          échafaudages (Rouleau B)                                ║
═══╩═══════════════════════════════════════════════════════════════════════════╩═══
 Bords nord/sud : rambardes (bornée). Extrémités ouest/est : boucle (on réapparaît de l'autre côté).
```

| Élément | Détail |
|---|---|
| Tracé | Bande de 24 m × 320 m ; deux îlots de 30 × 30 m aux extrémités ; 2 trous dans le pont (6 × 4 m, bordés de rambardes) ; échafaudages praticables (obstacles bas) |
| Palette | Bois gris-brun, mer bleu-gris, brume blanche ; contrastes renforcés sur les silhouettes |
| Obstacles | Moyenne : piles de planches destructibles (SYN_077), 4 grues (destructibles, 400 PV) |
| Ressources | Caisses d'outils (rations), Rouleau A (îlot ouest), Rouleau B (échafaudages au milieu), surface EAU permanente le long des piles (bords du pont) |
| Ennemis | Bandit, Nukenin de Kiri, Brute de Gatō, Arbalétrier, Lanceur, Filet d'eau, Porte-bouclier, Medic-nin, Chasseur de Kiri, élite Frères démons |
| Événement | **Brume de Kiri** (06:00, 16:30, 45 s) : visibilité 9 m ; ennemis contourés, télégraphes au-dessus |
| Boss | Lieutenant Haku (09:30) ; final Zabuza (20:00) |
| Secret | SEC_002 : détruire les 4 grues avant 12:00 → coffre du constructeur |
| Contrainte | Couloir long : impossible de tourner en rond, gestion des deux flancs (est/ouest) |
| Chronologie | Script VAG_001 (`data/vagues.yaml`) |

### D2.4 MAP_006 — Vallée de la Fin (intégrale)

```
            plateau nord (Rouleau A sur la tête de la statue de Madara)
   statue de Madara ▲                                   ▲ statue de Hashirama
          ╲            cascade ║║║ (bruit, gerbes)            ╱
   rive ouest (rochers)   ≈≈≈≈ bassin profond ≈≈≈≈   rive est (rochers)
   (rations)            ≈≈≈ (EAU, −40 % déplacement) ≈≈≈       (rations)
            plateau sud (Rouleau B sur la tête de la statue de Hashirama)
   180 × 140 m, bornée
```

| Élément | Détail |
|---|---|
| Tracé | Bassin central de 50 × 40 m, rives de 25 m, deux plateaux reliés par des escaliers de pierre (goulets de 3 m) |
| Palette | Gris-bleu, eau blanche, statues ocre, ciel orageux |
| Ressources | Rouleaux sur les têtes des statues (accès par escaliers, zones exposées) |
| Ennemis | Genin du Son, Zetsu blanc, Golem d'Iwa, Tireur de Kiri, Colosse de la cascade (élite), Medic-nin, Moine guérisseur |
| Événement | **Crue** (07:00, 15:00, 30 s) : le bassin s'étend de 8 m ; ligne d'écume 2 s avant |
| Boss | Rival miroir : Sasuke (BOS_025) si le joueur n'est pas une entrée de Sasuke, sinon Naruto (BOS_026) |
| Secret | SEC_006 : toucher les deux statues avec l'ultime dans la même run |
| Contrainte | Eau profonde au centre : combat de rives, synergies d'eau omniprésentes (Raiton favorisé pour le joueur **et** pour les ennemis de Kumo s'ils apparaissent en Endless) |

### D2.5 MAP_012 — Amegakure, tour de pluie (intégrale)

```
   toits (Rouleaux)   ┌cheminées┐   ateliers couverts (abris : pas de pluie)
   rue ─────────── place centrale (sous la tour de Pain) ─────────── rue
   conduites basses (obstacles bas)       8 abris couverts répartis
   200 × 200 m, en boucle
```

| Élément | Détail |
|---|---|
| Tracé | Place centrale de 50 m, grille de rues de 6–8 m, 8 abris couverts (rayon 4 m), toits accessibles par 4 escaliers |
| Palette | Gris-bleus, métal rouillé, pluie en traits clairs (2 couches de parallaxe), lumières industrielles jaunes |
| Ressources | Rouleaux sur 2 toits, rations dans les ateliers |
| Ennemis | Ninja d'Ame, Rhinocéros invoqué, Ninja aux aiguilles de pluie, Parapluie, Poseur d'étiquettes, Invocateur de chiens de l'enfer, Assassin de papier, élite Gardien d'Ame (réflecteur) |
| Événement | **Pluie sensorielle** (permanente) : en extérieur, tout (joueur et ennemis) est Trempé toutes les 3 s ; les ennemis Raiton profitent aussi de la Conduction contre le joueur (règle symétrique, affichée) |
| Boss | Lieutenants Konan (09:30) ; Hanzō en Boss Rush ; final Pain (20:00) |
| Secret | SEC_012 : 3 fleurs de papier sur des toits |
| Contrainte | Katon −10 % de rayon en extérieur ; abris : pas de pluie (ni Trempé) |
| Choix de route | Rester sous les abris (sécurité contre la Conduction ennemie, perte des synergies d'eau du joueur) vs rester dehors (synergies fortes, risque accru) |

### D2.6 Autres cartes

Les 16 autres cartes ont chacune un tracé, une palette, une contrainte et un événement distincts (`E_catalogues/cartes.md`). Aucune ne diffère seulement par son sol : par exemple la Forêt frontalière (MAP_005) impose un **défilement forcé**, le Repaire d'Orochimaru (MAP_007) des **portes coulissantes**, la Dimension de Kamui (MAP_019) des **cubes qui se déplacent**, le Pays du Fer (MAP_014) un **blizzard** qui ralentit hors des braseros.

## D3. Événements

| Type | Exemples | Règle de sécurité |
|---|---|---|
| Embuscade | Invasion du Son (MAP_004), réanimés (MAP_016) | Ennemis annoncés au bord 2 s avant, jamais dans le champ proche |
| Brouillard | Brume de Kiri (MAP_002, MAP_010) | Ennemis contourés, télégraphes au-dessus, assassins révélés à 6 m |
| Examens | Test des clochettes (MAP_001), Épreuve des rouleaux (MAP_003) | Objectif facultatif, abandon sans pénalité |
| Invocations | Manda (MAP_007), queue de Kurama (MAP_013) | Ombre au sol ≥ 2 s avant tout impact |
| Rouleaux interdits | ≥ 12:00, 1 par run | Coût affiché avant acceptation |
| Passage de créature géante | Dix-Queues (MAP_020), réveil du Sanbi (MAP_018) | Silhouette annoncée au bord 4 s avant ; bande de danger au sol |

Aucun événement obligatoire ne rend une attaque létale invisible : une attaque qui peut infliger ≥ 20 % des PV max du joueur a toujours un télégraphe visible ≥ 0,8 s (≥ 1,2 s au rang D).

## D4. Boss

### D4.1 Règles communes

* **Silhouette** identifiable, **entrée courte** (≤ 2,5 s, passable), **télégraphes** (zone remplie hachurée), **fenêtres de vulnérabilité** explicites (icône + bonus de dégâts affiché), **transitions** de phase (invulnérabilité ≤ 1,5 s, annoncée par une onde et un nom de phase), **stratégie de déplacement** identifiable (fiche).
* Pour chaque attaque : forme de zone, avertissement, durée active, dégâts, récupération, réponse attendue, et **information visible** (lisible sans l'avoir vue) ou **apprise** (motif à mémoriser, jamais létal seul au rang D).
* **Boss immenses** : parties décoratives (aucune collision), ciblables (hitbox dédiée, surlignée quand vulnérable) et dangereuses (seulement pendant leur attaque, télégraphiées). La collision ne correspond **jamais** au rectangle du sprite.
* **Contrôles** : résistance de contrôle cumulative (§B4.10) ; aucun boss n'est totalement immunisé (conversion en vulnérabilité).
* **PV au rang C** : finals 90 000–160 000 (cible de durée de combat 2–4 min pour un build moyen à 20:00, **à mesurer**) ; lieutenants 12 000–20 000 (45–90 s à 09:30).

### D4.2 Six boss intégraux

Les tableaux d'attaques complets sont dans `data/boss_1.yaml` et `data/boss_2.yaml` et rendus dans `E_catalogues/boss.md`. Synthèse de lecture :

| Boss | Stratégie de déplacement | Information visible | Information apprise | Fenêtre de vulnérabilité |
|---|---|---|---|---|
| **Zabuza** (BOS_001) | De brume en brume à 5–7 m, fonce pour trancher | Arcs du couperet, ligne du lancer, enveloppe sinusoïdale du dragon | Prison aqueuse (cercle qui suit puis se fige), assassinat silencieux (croix derrière le joueur + son) | Désarmé après le lancer (+25 % 2 s), sortie de brume (+15 % 1 s) |
| **Haku** (BOS_002) | Distant, puis de miroir en miroir | Éventails, couronne d'aiguilles, lignes pointillées de la tempête (toujours un secteur libre de 30°) | Miroir actif (plus lumineux) | Sort 3 s après la tempête (+30 %) ; miroirs destructibles (400 PV) |
| **Gaara** (BOS_004) | Immobile (phase 1), lent (phase 2), fixe (phase 3) | Cercueil qui suit, griffes, balles d'air, îlots sûrs de l'enterrement | Rotation du bouclier (120°/s) en phase 1 | Dos découvert 0,5 s ; front lumineux en phase 3 (+50 %) |
| **Itachi** (BOS_008) | 5 m, ne poursuit jamais, se repositionne par corbeaux | Gōkakyū, point fixé d'Amaterasu, ligne de Totsuka, miroir brillant | Vrai clone (ombre au sol), cône de Tsukuyomi (s'en détourner réduit l'effet) | Toux toutes les 45 s (+30 % 2 s) |
| **Pain** (BOS_013) | Anneau de 6 corps à 8–10 m, rotation du chemin actif toutes les 6 s | Rhinocéros, missiles, bulle d'absorption, onde de Shinra Tensei, 4 piliers sûrs de Chibaku | Moment de l'esquive contre Bansho Ten'in ; priorité au chemin de l'Enfer | Recharge de 5 s après Shinra Tensei (compteur visible) ; immobile pendant Chibaku |
| **Madara** (BOS_016) | Mêlée agressive → distance → fixe (Susanoo) | Mur de feu et ses 2 brèches, cercles sûrs du Mokuton, ombres de météores (toujours à ≥ 4 m du bord) | Retour en arc du sabre (pointillé dès l'avertissement), second météore | Canalisation après Tengai Shinsei (+25 % 4 s), sabres plantés (+30 % 2 s) |

### D4.3 Six boss détaillés et le reste du roster

Orochimaru (mues interruptibles), Kisame (drain de chakra et dôme d'eau à 3 brèches), Deidara (recharge au sol), Sasori (cœur exposé après chaque vague), Obito (rythme d'intangibilité visible), Kabuto (boucle d'Izanami à rompre) ont chacun 3 attaques complètement spécifiées. Les 28 autres possèdent une mécanique et une identité distinctes (`boss.md`), par exemple : Kakashi (clochettes qui désactivent ses techniques), Danzō (compteur d'yeux d'Izanagi), Kinkaku et Ginkaku (corde qui punit la répétition d'une même famille), Mū (deux moitiés à abattre à 10 s d'intervalle), Kaguya (quatre dimensions de 45 s).

## D5. Ennemis

### D5.1 Rôles et lecture

| Rôle | Annonce visuelle avant la 1re attaque | Menace | Réponse |
|---|---|---|---|
| Poursuivant | Silhouette penchée, bras en avant | Masse | Zones, orbites |
| Chargeur | Tête baissée, grattage / pose figée 0,6–1 s | Burst en ligne | Esquive latérale, obstacles (étourdis s'ils percutent) |
| Tireur | Arme/geste de visée, ligne pointillée | Projectiles | Mobilité, boucliers, renvoi |
| Contrôleur | Accessoire de contrôle (fil, filet, flûte, glyphes) | Ralentit/entrave | Éviter les zones annoncées |
| Protecteur | Bouclier, anneau au sol, contour épais | Réduit les dégâts des voisins | Le contourner, frapper de dos |
| Soigneur | Croix verte, lueur verte, fuit le joueur | Prolonge les combats | Le prioriser (ciblage « menace immédiate » s'il soigne une élite) |
| Poseur de pièges | Pose accroupie, liasse d'étiquettes | Zones retardées | Lire les cercles rouges |
| Invocateur | Bourgeons/rouleau/sceau au sol avant l'invocation | Multiplication | Le tuer coupe les invocations |
| Assassin | Posture basse, scintillement, marqueur au sol 0,7 s | Burst depuis l'angle mort | Esquive sur marqueur |

### D5.2 Mise à l'échelle

PV = base × (1 + 0,10 × minute) × multiplicateur de rang ; dégâts = base × (1 + 0,04 × minute) × multiplicateur de rang ; vitesse inchangée par le temps (la pression vient de la composition). Exemple : Nukenin de Kiri (14 PV) à 15:00 au rang C : 14 × 2,5 = 35 PV.

### D5.3 Élites

25 élites (ENM_076–100) = un comportement + un modificateur, avec contour doré, icône du modificateur et fragments dorés. Exemples : Frères démons (chaîne liée : tuer les deux à 5 s d'intervalle), Marionnette à trois bras (dédoublement à 50 %), Capitaine samouraï (blindé frontal −70 %, vulnérable de dos), Garde de la Racine (sceau qui suspend le gain de chakra du joueur). Le modificateur Vampire est contré par le Poison/Brûlure (−50 % de soin), Réflecteur par les attaques CONTACT/DIFFERE : chaque modificateur a une réponse de build, pas seulement « plus de PV ».

## D6. Protections d'équité (systèmes)

| Risque | Protection |
|---|---|
| Apparition sur le joueur | Aucune apparition à < 12 m ni dans le champ visible à moins de 2 m du bord ; cercle d'invocation de 0,4 s (ennemi invulnérable et inoffensif pendant ce temps) |
| Projectiles hors écran | Tout projectile hostile entrant dans le champ est annoncé par un chevron au bord 0,5 s avant (vitesse max des projectiles ordinaires 12 m/s, donc ≥ 6 m d'anticipation) |
| Enfermement | Test automatique de chemin (§H7) : après chaque apparition de mur/structure (alliée ou ennemie), le joueur doit disposer d'au moins 2 sorties de 2 m ; sinon la structure la plus récente est déplacée ou annulée |
| Patterns sans solution | Chaque motif de boss déclare ses zones sûres ; un solveur hors ligne (§H7) vérifie pour chaque combinaison possible de 2 attaques simultanées qu'il existe une zone sûre atteignable à vitesse de base en moins de 80 % de l'avertissement |
| Contacts multiples | Fenêtre de contact globale (§B1.5) |
| Mort incompréhensible | Écran de défaite avec vignette et source ; aucune capacité sacrificielle ne tue |

## D7. Village, monnaie et méta-progression

* **Village (hub léger)** : lancement rapide (dernier personnage, dernière carte), sélection, Archives, Entraînement (salle d'essai : mannequins, statistiques en direct, toutes les techniques débloquées testables), Missions, Maîtrise. Déplacement physique optionnel ; un menu donne accès direct à chaque fonction.
* **Monnaie unique : Ryō** (≈ 250–700 par run Standard selon la durée et le rang, à mesurer). La **maîtrise** est une progression par personnage (niveaux 1–10, gagnée en jouant ce personnage) ; elle ne se dépense pas.
* **Cartes initiales** : MAP_001 et MAP_002. Les autres se débloquent par les missions de scénario.

| Achat (Ryō) | Coût | Effet | Plafond |
|---|---|---|---|
| Relance (1/2/3 par run) | 500 / 1 000 / 1 500 | Contrôle du hasard | 3 (+ missions/secrets) |
| Bannissement (1/2/3) | 600 / 1 200 / 1 800 | Contrôle du hasard | 3 |
| Passage (1/2/3) | 300 / 600 / 900 | Contrôle du hasard | 3 |
| Voie du quatrième sceau | 1 500 | Quatrième carte aux niveaux multiples de 5 | — |
| Doctrine (déblocage de l'écran) | par MIS_003 | Choix de doctrine avant la run | — |
| Entraînement de base (PV, Puissance, Déplacement) | 200 → 1 200 | +2 % par palier | **+10 % maximum** par statistique (bruts modestes et plafonnés) |
| Techniques de départ alternatives | 400–800 | 1 alternative par personnage (débloquée par maîtrise 3) | — |
| Cosmétiques | 100–1 000 | Palettes, poses de victoire, auras | — |

**Maîtrise** (par personnage) : niv. 2 Doctrine du personnage ; niv. 3 technique de départ alternative achetable ; niv. 4–7 déblocage des variantes (selon l'entrée) ; niv. 5 palette alternative ; niv. 8 pose de victoire ; niv. 10 titre. Aucune récompense de maîtrise n'augmente la puissance brute au-delà de l'entraînement plafonné : un personnage récemment débloqué n'est pas durablement pénible à jouer.

**Garantie anti-« perdre dix fois »** : avec 0 Ryō dépensé, un joueur du profil « moyen » (§D8) doit pouvoir terminer MIS_002 (Zabuza, rang D) — cible de test : ≥ 50 % de réussite à la 3e tentative.

## D8. Rangs de difficulté

Les rangs ajoutent surtout **comportements, contraintes spatiales, événements et combinaisons**.

| Rang | PV/dégâts ennemis | Changements précis |
|---|---|---|
| **D** (découverte) | ×0,8 / ×0,7 | Télégraphes +50 % de durée ; élites sans modificateur jusqu'à 10:00 ; assassins absents avant 08:00 ; boss : une seule attaque « apprise » par phase |
| **C** (référence) | ×1,0 / ×1,0 | Règles nominales de ce dossier |
| **B** | ×1,15 / ×1,1 | Élites avec modificateur dès 04:30 ; tireurs qui visent la position anticipée ; 1 événement supplémentaire par run ; boss : récupérations −10 % |
| **A** | ×1,3 / ×1,2 | Formations en pinces et anneaux doublées ; soigneurs prioritaires sur les élites ; poseurs de pièges dès 03:00 ; boss : 2 attaques simultanées possibles (toujours solubles, §D6) ; Shukaku remplace la phase 3 de Gaara |
| **S** | ×1,45 / ×1,3 | Élites en paires avec 2 modificateurs ; zones persistantes ennemies (feu, poison) ; brouillard ou pluie sur toutes les cartes compatibles ; boss : phase de rage à 15 % (motifs resserrés) |
| **S+** | ×1,6 / ×1,4 | Arène réduite de 20 % pendant le boss (bords marqués, jamais sans sortie) ; un « mutateur » de carte tiré au sort (ex. pas de rations, vent latéral permanent) ; boss alternatifs (Madara Dix-Queues) ; aucun Rouleau interdit gratuit |

**Taux de réussite souhaités (cibles de test, non mesurés)** — profil de joueur de test : « moyen » = 5–15 h de jeux d'action roguelite, connaît les bases du genre ; « expert » = 50 h+ du genre et 20 h du jeu.

| Rang | Moyen, 1re semaine | Expert |
|---|---|---|
| D | 60–75 % | > 95 % |
| C | 30–45 % | 85–95 % |
| B | 15–25 % | 70–85 % |
| A | 5–12 % | 50–70 % |
| S | < 5 % | 25–40 % |
| S+ | — | 10–20 % |

## D9. Modes

| Mode | Règles | Réutilise |
|---|---|---|
| **Standard** | 25 min, boss à 20:00, prolongation jusqu'à 28:00 | — |
| **Expédition courte** | 12 min, boss à 10:00 (lieutenant promu), XP ×1,6 | Chronologie compressée |
| **Endless** | Pas de fin ; boss tournant toutes les 10 min ; PV ×(1 + 0,15 × minute) ; nouveaux élites combinés après 30 min ; Rouleau interdit toutes les 15 min | Vagues, boss, élites |
| **Boss Rush** | 4–6 boss enchaînés ; niveau de départ 30 ; 3 cartes entre chaque boss | Boss |
| **Missions scénarisées** | Simulation (MIS_001–020) et « Et si… » hors chronologie (MIS_071–085) | Cartes, boss |
| **Draft** | 6 techniques choisies parmi 12 avant la run, aucune nouvelle technique en jeu | Pool |
| **Défis de clan** | Pool ou objectif centré sur un clan (MIS_021–032) | Pool, tags |
| **Défis élémentaires** | Pool restreint à un élément + outils (MIS_033–042) | Pool |
| **Expérimental** (optionnel) | Compatibilités levées ; résultats marqués ; ne compte ni pour les missions expertes (MIS_181–200) ni pour les déblocages de personnages | Tout |

## D10. Endgame et prestige

* Défis (rangs S/S+, missions expertes MIS_181–200), builds rares (éveils, fusions à 4 techniques), **variantes de cartes** (SEC_041 : météo et heure alternatives qui changent la contrainte : Pont de nuit sans brume mais avec assassins, etc.), objectifs experts (sans évolution, trois techniques…).
* **Prestige** (optionnel, débloqué par MIS_100) : recommencer la campagne de missions avec des **contraintes de départ** au choix (« Doctrine imposée », « Rouleaux interdits seulement »), une **palette de prestige** et des Archives de commentaires de conception. Il ne supprime **aucun** déblocage ni personnage, et n'est pas un simple multiplicateur de PV.

## D11. Secrets et Archives

60 secrets (`secrets.md`) : 20 secrets de carte, 10 découvertes de recettes, 10 interactions de personnages, 10 options/modes, 10 énigmes **volontairement obscures**. Les secrets **guidés** ont 3 indices progressifs (Archives → surlignage discret en jeu après 3 runs → condition exacte après 6 runs) ; les secrets **obscurs** n'ont que 2 indices et ne donnent que des récompenses cosmétiques. Aucun secret ne débloque de personnage ni de puissance brute.
