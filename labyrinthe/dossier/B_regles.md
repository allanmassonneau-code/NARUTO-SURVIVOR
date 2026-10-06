# B — Règles détaillées

Toutes les valeurs ci-dessous sont celles du code livré (fichiers cités entre parenthèses). Ce sont des **réglages initiaux du projet**, à ajuster par tests de jeu ; aucune n’est une mesure.

## B1. Commandes (brief §05) — `21_entrees.js`

### B1.1 Tableau de référence

Les boutons sont désignés par **position** (disposition « standard » de l’API Gamepad) ; les libellés de fabricant ne servent qu’à l’affichage.

| Action logique | Position | Xbox | PlayStation | Nintendo | Générique | Clavier (secours) |
|---|---|---|---|---|---|---|
| Déplacement analogique | Stick gauche | Stick G | Stick G | Stick G | Stick G | W A S D (Z Q S D affichés en AZERTY) |
| Direction de tir / tir maintenu | Stick droit **et boutons de face** (profil par défaut) | Stick D, Y A X B | Stick D, Triangle Croix Carré Rond | Stick D, X B Y A | Stick D, faces | Flèches |
| Tir, profil « stick + croix » | Croix directionnelle | Croix | Croix | Croix | Croix | — |
| Technique scellée (actif) | Gâchette gauche | LT | L2 | ZL | Gâchette G | Espace |
| Poser un parchemin explosif | Bouton supérieur droit | RB | R1 | R | Haut droit | E |
| Utiliser la poche | Gâchette droite | RT | R2 | ZR | Gâchette D | Q (A en AZERTY) |
| Interagir / confirmer | Face bas | A | Croix | B | Face bas | Entrée ou F |
| Retour / annuler | Face droite | B | Rond | A | Face droite | Échap (ou Retour arrière) |
| Description d’un objet proche (si la fiche automatique est coupée) | Face haut | Y | Triangle | X | Face haut | R |
| Carte étendue (maintien) | Vue | View | Create | − | Vue | Tab |
| Pause | Menu | Menu | Options | + | Menu | Échap ou P |
| Échanger (actifs, marionnettes) | Bouton supérieur gauche | LB | L1 | L | Haut gauche | Maj |
| Déposer talisman / poche | Face gauche, **maintien 0,8 s** | X | Carré | Y | Face gauche | Ctrl (maintien) |

**En jeu, avec le profil par défaut** (« stick + boutons », comme *Isaac*), les quatre boutons de face tirent (haut, bas, gauche, droite) : les actions qu’ils portent passent sur la croix — interagir et confirmer ↓, description ↑, déposer ← (maintien), retour →. Les menus gardent la table ci-dessus (A confirme, B revient).

Les gâchettes analogiques s’activent au-delà de 0,35. Le type de manette est détecté par l’identifiant (Xbox, PlayStation, Nintendo, sinon générique) ; les glyphes affichés suivent le **dernier périphérique utilisé**. Toutes les actions sont réassignables dans *Options → Commandes* (manette et clavier séparément) ; les liaisons sont stockées dans les réglages, pas dans le profil ni dans la partie.

### B1.2 Profils de tir

- **Stick + boutons** (défaut, comme *Isaac*) : stick droit et boutons de face tirent tous deux ; la dernière direction enfoncée l’emporte ; en jeu, interagir, description, déposer et retour passent sur la croix ; les menus ne changent pas. Les réglages enregistrés avec l’ancien défaut (stick + croix) passent à ce profil.
- **Stick + croix** : stick droit et croix tirent ; si les deux sont utilisés, la croix l’emporte (entrée numérique explicite) ; les boutons de face gardent leurs actions.
- **Stick seul** ou **croix seule** : réglables. Le profil croix ne crée aucun conflit : en jeu, la croix n’a pas d’autre action ; dans les menus, elle navigue.
- Aucune action de combat essentielle n’exige de lâcher les deux sticks : actif, explosif et poche sont sur les gâchettes et boutons supérieurs.

### B1.3 Consommation des entrées au changement de contexte

À chaque ouverture ou fermeture de menu, prise d’objet majeur, transition de salle et reprise après pause, **toutes les actions maintenues sont consommées** : elles doivent être relâchées avant d’agir de nouveau. La **visée** n’est consommée qu’aux menus et à la reprise : tenue à travers une porte, une prise d’objet ou l’intro d’un boss, elle continue de tirer (test « mecaniques »). Fermer un menu avec le bouton de validation ne pose donc jamais d’explosif ni n’utilise l’actif (test automatique « manette »).

### B1.4 Attaques chargées, salles, pause

- **Charge** : maintenir une direction charge ; la jauge apparaît sous le personnage. *Orbe* et *rayon* partent au relâchement si la charge est complète ; *charge libre* (Sasuke) part au relâchement quelle que soit la charge (×0,5 à ×3). Relâcher avant 20 % annule sans tirer pour les formes rendues « chargeables » par un objet secondaire. Option d’accessibilité *Charge automatique* : l’attaque part seule à pleine charge, au même cycle minimal.
- **Annulation** : retour du stick au centre avant la fin de la charge (orbe, rayon) ; changer de direction conserve la charge et vise la nouvelle direction (la tête du personnage la suit pendant la charge).
- **Changement de salle** : on franchit une porte ouverte en la touchant ; une aide d’alignement attire doucement vers l’axe de la porte quand on pousse vers elle (3 tuiles de portée, ±18 px). Une charge tenue traverse la porte : elle se poursuit dans la salle suivante et part au relâchement (de même pendant la prise d’un objet) ; les projectiles ne franchissent pas les portes.
- **Pause** : immédiate (Menu ou Échap), simulation gelée (y compris invulnérabilités, télégraphes et minuteries). La reprise consomme les entrées.

## B2. Sticks et comportements d’entrée (brief §06)

| Paramètre | Valeur | Réglable |
|---|---|---|
| Zone morte radiale, stick gauche | 0,18 | oui |
| Zone morte radiale, stick droit | 0,12 | oui |
| Saturation (bord extérieur) | 0,96 | non |
| Courbe de réponse du déplacement | exposant 1,0 (linéaire après zone morte) | oui |
| Diagonales du déplacement | vecteur normalisé si sa norme dépasse 1 | — |
| Visée : seuil d’activation | 0,5 | oui |
| Visée : seuil de retour au repos | 0,35 | oui |
| Visée : hystérésis angulaire | 12° (changement d’axe si la composante perpendiculaire dépasse tan 57° ≈ 1,54 fois l’autre) | oui |
| Égalité exacte des composantes | axe horizontal | — |
| Navigation des menus : seuil | 0,55 | — |
| Répétition des menus | première répétition 0,38 s, puis toutes les 0,085 s | — |

**Quantification cardinale** : tant qu’aucune direction n’est active, il faut dépasser 0,5 ; une fois active, la direction est conservée jusqu’à 0,35, et ne change d’axe que franchement (hystérésis) : un stick tenu près d’une diagonale ne fait pas osciller le tir (test « manette » : 0,62/0,60 puis 0,60/0,62 donnent la même direction).

**Visée libre** : le vecteur analogique brut est conservé à part ; seule la *sphère téléguidée* (PSV_021) peut l’utiliser, et seulement si l’option *Visée libre de la sphère* est active. La géométrie cardinale des salles n’est jamais remplacée silencieusement.

**Découplage** : le corps suit le déplacement, la tête suit la visée (on peut marcher à gauche en tirant vers le haut) ; hors tir, la tête revient dans le sens de la marche.

**Influence du mouvement sur le projectile** : 25 % de la vitesse perpendiculaire du joueur et 10 % de sa vitesse parallèle s’ajoutent au projectile. Le tir reste dans son couloir cardinal (déviation maximale ≈ 7° à vitesse maximale), mais courir pendant qu’on tire se voit.

**Périphériques** : plusieurs manettes branchées → la dernière qui a produit une entrée devient active. Déconnexion de la manette active → pause immédiate (aucun dommage possible pendant la pause) ; reprise après confirmation. Perte de focus de la fenêtre → pause et remise à zéro des touches. Noms de touches réels (AZERTY) lus via `navigator.keyboard.getLayoutMap` quand le navigateur le permet.

**Vibrations** (intensité globale réglable de 0 à 1, 0,7 par défaut ; jamais seule porteuse d’information) :

| Événement | Durée | Fort / faible | Intervalle minimal |
|---|---|---|---|
| Dégât reçu | 220 ms | 0,7 / 0,5 | 350 ms |
| Charge complète | 70 ms | 0 / 0,35 | 250 ms |
| Explosion | 260 ms | 0,9 / 0,4 | 200 ms |
| Objet majeur | 160 ms | 0,2 / 0,6 | 500 ms |
| Boss (intro, mort) | 400 ms | 0,8 / 0,8 | 900 ms |

## B3. Combat (brief §07) — `34_tir.js`, `35_ennemis.js`, `36_joueur.js`

### B3.1 Le tir ordinaire

| Propriété | Règle |
|---|---|
| Cadence | cycles par seconde (base 2,5) ; délai entre cycles = 1 / (cadence × coefficient de cadence du profil) |
| Portée et durée de vie | durée de vie = portée / vitesse du projectile ; aucune pénalité cachée : augmenter la vitesse ne réduit pas la distance parcourue |
| Vitesse | 9 tuiles/s de base (bornes 4–18) |
| Taille visuelle | coefficient de profil (1 par défaut ; ×1,5 « Pointe de précision », ×2 tirs lents) |
| Collision avec les ennemis | rayon = 4 + 2 × √(dégâts / 3,5) × taille (px) — un tir plus fort touche un peu plus large |
| Collision avec le décor | rayon fixe de 2 px (un gros tir ne s’accroche pas aux angles) ; murs : la tuile entière ; obstacles : leur **largeur dessinée** (un tir qui frôle une jarre passe) ; un tir tiré collé à un mur naît sous son arête, jamais dedans |
| Percement | nombre de cibles supplémentaires ; « perçant » = illimité ; un tir ne touche jamais deux fois la même cible (liste des cibles touchées par projectile) |
| Rebond | 3 rebonds par objet de ricochet, sur murs et obstacles |
| Recul | impulsion proportionnelle au coefficient de recul du profil (×2 à ×2,5 pour les objets lourds) ; aucun recul sur les boss, les ennemis lourds et fixes |
| Disparition | fin de durée de vie, mur, obstacle (sauf spectral), ou cible sans percement ; petite étincelle au sol |

### B3.2 Corps-à-corps

Rock Lee (CHR_005) et les objets *lame* (PSV_018) et *lame longue* (PSV_017) : arc de 100° (140° pour la lame longue), portée égale à la statistique de portée pour Lee (1,7 tuile) ou 1,6 / 2,6 tuiles pour les objets. Coefficient par coup : ×2,2 pour un tireur qui prend une lame ou la lame longue ; pour Lee, dont la frappe est l'attaque native, ×1 et ×1,4 avec la lame longue (mesuré : ×3 lui faisait finir les boss de fin en deux secondes). Les coups au corps-à-corps peuvent être critiques comme les tirs. Anticipation 0,03 s, phase active 0,1 s, fin à 0,16 s ; aucun déplacement imposé, aucune invulnérabilité. Tous les coups détruisent les projectiles ennemis ordinaires présents dans l’arc (pas les projectiles lourds, les rayons ni les ondes) et déclenchent les effets d’impact du profil (budget de 6 par coup). Le joueur reste exposé au contact : les dégâts de contact s’appliquent normalement.

### B3.3 Capacités défensives acquises (jamais universelles)

| Capacité | Source | Traverse | Ne traverse pas |
|---|---|---|---|
| Dash foudroyant | ACT_003 Chidori | ennemis (les blesse), projectiles | murs, obstacles, fosses (sauf vol) |
| Intangibilité | ACT_021 Espace-temps intangible (3 s, sans tir), ACT_015 Parchemin de substitution (3 s, bûche-appât) | ennemis et projectiles | murs, obstacles |
| Substitution passive | PSV_096 (15 % + 3 %/chance, 50 % max) | le coup évité | — |
| Esquive éclair | TRF_016 Éclair jaune (une toutes les 8 s) | le coup évité ; téléportation de 3,2 tuiles loin de la source | murs, obstacles |
| Phénix | PSV_191 Bénédiction du phénix (une fois par étage) | un coup mortel : reste une demi-unité, 2 s d'invulnérabilité | un prix (pacte) ou un sacrifice mortel |
| Rotation défensive | ACT_008, PSV_022 | détruit les projectiles proches | — |
| Lévitation | PSV_115, PSV_116, TRF_007, TRF_010, CON_013 | fosses, pics, flaques, toiles, prix de sortie de la chambre maudite | murs, obstacles, projectiles, ennemis |
| Téléportation | CON_001/005/010/018/019, ACT_023 | tout (changement de salle) | — ; la salle quittée garde ses ennemis |

### B3.4 Collisions simultanées

Après un dégât, le joueur est invulnérable **1,0 s** (clignotement, désactivable en mode sans flash : silhouette pâle). Plusieurs contacts dans la même image ne comptent qu’une fois. Les surfaces persistantes frappent au plus toutes les 0,5 s. Un ennemi ne subit qu’une touche par projectile ; les tics de brûlure et de poison sont espacés de 0,5 s.

## B4. Statistiques et calculs (brief §08) — `37_objets.js`

### B4.1 Personnage de référence

Naruto (CHR_001) : 3 contenants de vitalité, 3,5 dégâts, 2,5 tirs/s, portée 6 tuiles, projectile 9 tuiles/s, déplacement 4,5 tuiles/s, chance 0.

### B4.2 Formule

Pour chaque statistique : `valeur = (base + Σ ajouts) × (1 + Σ pourcentages / 100) × Π multiplicateurs`, puis bornes :

| Statistique | Borne basse | Borne haute | Dépassement |
|---|---|---|---|
| Dégâts | 0,5 | 999 | — |
| Cadence | 0,4 | 5,0 | + « plafond de cadence » (TRF_012 Huit Portes : +1) |
| Portée | 2 | 16 | — |
| Vitesse du projectile | 4 | 18 | — |
| Déplacement | 2,5 | 7,0 | — |
| Chance | −10 | 20 | — |

Puis, dans cet ordre : +1 dégât d’Obstination (Naruto à la dernière demi-unité), +0,5 du Charme du plein (TAL_013 à pleine vitalité), ×1,5 (×1,6 en Sage imparfait) de l’énergie naturelle (PSV_144 immobile). Les dégâts sont arrondis au centième. **L’ordre de ramassage n’a aucun effet** (test « economie » : douze objets de statistiques ramassés dans les deux ordres donnent des statistiques identiques). Plusieurs copies d’un objet « cumul » se cumulent linéairement.

Les dégâts d’une émission : `dégâts × coefficient du profil × coefficient de charge × coefficient de multitir × coefficient d’attaque`, puis aucun système de résistance en couches : seules exceptions explicites, les boss (statuts de contrôle à 35 % de durée, immunité au charme et à la peur, immunité de contrôle 2 s après un contrôle) et quelques mécaniques affichées (bouclier frontal, aura de protecteur ×0,5, phases invulnérables courtes signalées par un anneau).

**Cadence et charges** (§R8c) : temps de charge = base × 2,5 / cadence effective. Un bonus de cadence de +20 % réduit donc le délai **et** le temps de charge de 1/1,2 (−16,7 %), jamais de « −20 % » par erreur.

**Chance** (liste fermée) : tirage de fin de salle (§R10), tirages de coffres (+4), probabilités d’objets qui l’indiquent (« +5 % par chance, 70 % au plus »), immobilisation de Shikamaru, tirs en croix. Elle n’influence ni la qualité des objets, ni les pactes, ni la santé.

### B4.3 Trois calculs chiffrés (théoriques, non mesurés)

**1. Tir simple avec deux bonus** — Naruto + *Kunai lestés* (PSV_034, dégâts +1) + *Cadence de la fleur de lotus* (PSV_041, cadence ×1,5, portée −2).
- Dégâts : (3,5 + 1) = 4,5. Cadence : 2,5 × 1,5 = 3,75 tirs/s (sous le plafond 5). Portée : 6 − 2 = 4 tuiles, durée de vie 4 / 9 = 0,44 s.
- Débit théorique monocible : 4,5 × 3,75 = **16,9** par seconde, soit ×1,93 par rapport à la base (8,75).
- Couverture : identique (un projectile). Dégâts pratiques : la portée de 4 tuiles (128 px) impose de s’approcher à moins d’un tiers de salle ; contre une tourelle dans un angle ou derrière des fosses, le gain réel est nul tant qu’on ne se déplace pas.

**2. Tir multiple avec ralentissement** — Naruto + *Éventail de kunai* (PSV_003 : +2 émissions, coefficient de cadence 0,85) + *Chakra de l’eau* (PSV_044 : 30 % de ralentir 2 s).
- Trois émissions à −10°, 0°, +10°, chacune à 3,5 × 0,58 = 2,03 dégâts ; cadence 2,5 × 0,85 = 2,125.
- Débit théorique si les trois touchent : 3 × 2,03 × 2,125 = **12,9** (×1,48).
- Un ennemi de rayon 9 px est touché par les trois émissions tant que l’écart latéral (distance × tan 10°) reste sous ≈ 14,5 px, c’est-à-dire **à moins de 2,6 tuiles** ; au-delà, seul le tir central touche une cible isolée : 2,03 × 2,125 = **4,3** (×0,49). Contre un groupe, la couverture triple.
- Ralentissement : probabilité qu’au moins une émission ralentisse lors d’un cycle où les trois touchent : 1 − 0,7³ = 65,7 %.

**3. Attaque chargée et effet secondaire** — Naruto + *Empreinte du Rasengan* (PSV_001 : orbe, charge 0,6 s, ×3, perce 2 cibles) + *Chidori nagashi* (PSV_028 : chaîne vers 2 ennemis à 3 tuiles, 50 %).
- Cycle : 0,6 s de charge (à cadence 2,5) + 0,14 s de récupération = 0,74 s.
- Impact : 3,5 × 3 = 10,5 par cible (deux cibles au plus), chaîne 2 × 5,25 sur des ennemis proches (génération 1, relançable une fois : génération maximale 2, budget de 14 déclenchements par cycle).
- Monocible : 10,5 / 0,74 = **14,2** (×1,62). Trois ennemis groupés : 10,5 + 2 × 5,25 = 21 par cycle, **28,4** par seconde répartis.
- Le cas du brief SYN_001 (Rasengan jumeau, PSV_001 + PSV_002) est implémenté tel quel : deux sphères à 3,5 × 3 × 0,70 = 7,35, cycle 0,6 / 0,9 = 0,667 s + récupération.

### B4.4 Résistance selon l'étage et banc d'équilibrage

La puissance du joueur (dégâts × cadence × multitir) passe d'environ 9 à l'étage 1 à 25–40 à l'étage 8 ; les PV adverses suivent donc l'étage :

- **Ennemis ordinaires** : PV × (1 + 0,10 × (étage − 1)), soit ×1,7 à l'étage 8 (`facteurPvEnnemi`).
- **Boss** : PV × facteur de l'étage où on les affronte (`FACTEUR_PV_BOSS`) — 0,85 / 0,95 / 1,15 / 1,35 / 1,55 / 1,75 / 2,2 / 2,6 pour les étages 1 à 8, 1,9 pour les boss terminaux (déjà 800 à 1 000 PV de base). Les vagues de boss des épreuves et les gardiens de statue suivent le même facteur.

Ces facteurs viennent du **banc d'équilibrage** (`outils/equilibrage.mjs`) : douze parties simulées (une par personnage), huit étages, joueur invulnérable mais chaque coup qui l'aurait touché est compté. Avant / après le réglage (médianes et moyennes sur 12 à 24 parties) :

| Étage | Durée médiane d'un boss avant | après | Secondes par salle avant | après |
|---|---|---|---|---|
| 1 | 36 s | 24 s | 7,7 | 6,8 |
| 2 | 34 s | 34 s | 15,3 | 8,8 |
| 3 | 23 s | 17 s | 12,5 | 10,7 |
| 4 | 19 s | 28 s | 11,1 | 10,0 |
| 5 | 17 s | 18 s | 9,3 | 11,8 |
| 6 | 16 s | 27 s | 9,3 | 8,1 |
| 7 | 14 s | 28 s | 6,7 | 7,2 |
| 8 | 11 s | 27 s | 5,3 | 7,4 |

La difficulté ne décroît plus en fin de partie. Le pilote n'esquive pas : les coups comptés mesurent une pression relative entre boss, pas la difficulté ressentie. Les PV de quinze boss ont été corrigés un par un d'après leurs durées (Mille-pattes, Haku, Zabuza, Sasori, Orochimaru, Temari, Kisame, Jūgo, Zetsu, Konan, Pain plus bas ; Kankurō, Obito plus hauts…) ; Tayuya fuit moins vite et invoque ses démons moins souvent. Personnages : Rock Lee 5 → 4,6 dégâts, Shikamaru 3,2 → 3,5 et cadence 2,3 → 2,4, Gaara cadence 2,0 → 2,2. Objets : la lame longue passe de ×3 à ×2,2 (×1,4 pour Lee), la lame de ×2,5 à ×2,2, la Pluie d'armes de huit armes tous les cinq cycles à six tous les sept (elle triplait à elle seule les dégâts).

## B5. Santé (brief §09) — `33_sante.js`

### B5.1 Modèle

Tout est compté en **demi-unités** entières. **12 emplacements** au plus :

| Élément | Emplacements | Comportement |
|---|---|---|
| Contenant de vitalité | 1 | 0, 1 ou 2 demis ; se remplit par les soins |
| Enveloppe osseuse | 1 | contient de la vitalité ; vide, elle **se rompt en absorbant un coup entier** |
| Réserve de chakra protecteur | 1 par 2 demis | consommable, sans contenant ; une réserve à moitié pleine accepte un demi sans emplacement supplémentaire |
| Chakra instable | 1 par 2 demis | comme la réserve ; une réserve instable **entièrement vidée** déclenche une impulsion de 40 dégâts à tous les ennemis de la salle |
| Sceau vital partiel | 0 | un demi de protection ; **deux sceaux partiels forment un contenant** ; au changement d’étage, un sceau partiel devient un contenant |
| Cicatrice de sceau | 1 | réduit la capacité ; en cas de débordement, retire d’abord des réserves, puis des contenants vides, puis pleins |

Affichage de gauche à droite : vitalité, enveloppes, réserves (bleues), instables (noires), cicatrices.

### B5.2 Ordre exact

**Pertes (dommage reçu)** : réserves de droite à gauche → enveloppes osseuses (leur vitalité, puis rupture d’une vide qui absorbe le reste du coup) → sceau partiel → vitalité de droite à gauche. Mort si la santé totale atteint 0.

**Soins** : remplissent la vitalité de gauche à droite (contenants puis enveloppes). Un cœur ramassé à pleine vitalité **reste au sol** (Sakura et Sakura altérée font exception : l’excédent est stocké). Un contenant reçu à capacité maximale est converti en soin d’un cœur (règle affichée).

**Résurrections**, dans l’ordre : cœur de réserve (Kakuzu altéré), puis *Cœur volé* (PSV_089, consommé), sinon mort.

### B5.3 Dommage, prix, sacrifice, destruction

| Événement | Déclencheurs « dégât reçu » (objets, talismans) | Compte pour les opportunités (« étage sans dégât à la vitalité ») | Événement émis |
|---|---|---|---|
| Dommage reçu (ennemi, piège, explosion) | oui | oui si la vitalité baisse | `degat_recu` |
| Prix payé (pacte, don vital, pilule amère) | non | non | `cout_paye` |
| Sacrifice volontaire (autel) | non | non | `sacrifice` |
| Destruction de contenant (prix de pacte, cicatrice) | non | non | `cout_paye` |

### B5.4 Cas particuliers

- **Sans vitalité rouge** (Sasori CHR_011) : les contenants obtenus deviennent des réserves ; la vitalité au sol est ignorée ; les pactes coûtent 2 réserves (4 demis) par contenant.
- **Protection seule** : un personnage à 0 vitalité et 1 réserve meurt au coup suivant ; l’épreuve chūnin exige alors au moins 2 réserves pleines au lieu de « vitalité pleine ».
- **Dernier demi-point** : Naruto gagne +1 dégât pour la salle (« Obstination ! »).
- **Contenant vide** : il compte pour la capacité et se remplit normalement ; l’épreuve chūnin exige que tous soient pleins.
- **Dégâts par étage** : une demi-unité par coup aux étages 1–4, **une unité** aux étages 5–9 (annoncé à l’entrée de l’étage 5, rappel « ×2 » près de la santé). Explosifs du joueur : une unité à tout étage. Pics : dégât de l’étage. Feu au contact : une demi-unité (contact avec la flamme, pas avec sa tuile).
- **Invulnérabilité** : 1,0 s après un dégât, visible, bornée, gelée pendant la pause.
- Les **charges d’actif** sont une jauge verticale segmentée à côté de l’icône de l’actif, jamais des cœurs : lancer une technique ne consomme aucune protection.

## B6. Ressources de la partie (brief §10)

### B6.1 Trois ressources visibles

| Ressource | Plafond | Usages | Variantes |
|---|---|---|---|
| Ryō | 99 | échoppe, machines, informateurs, source chaude (5), soins Kakuzu, contrat de Kakuzu (pactes à 20 Ryō par contenant) | pièce 1, bourse 5, lingot 10 |
| Clé de sceau | 99 | portes d’héritage, échoppe, bibliothèque, coffres forts, source chaude (dès l’étage 2), coffres verrouillés, blocs à clé | double ; clés dorées (infinies pour l’étage) |
| Parchemin explosif | 99 | dégâts (30, rayon 1,6 tuile), rochers, rochers à sceau, murs secrets, coffres de pierre, machines, statues, ponts de débris | double ; explosifs dorés (infinis pour l’étage) |

Aucune conversion automatique des Ryō en statistiques. La **caisse des marchands** (offrande d’un Ryō au tanuki de l’échoppe, bouton d’interaction ; cumul inscrit au profil) améliore le service entre les parties : paliers à 50, 150 et 300 Ryō donnés ; chaque palier ajoute 4 % de chance de solde par étal (10 % de base), et dès le deuxième palier l’échoppe propose un objet supplémentaire. Jamais un bonus de statistique.

### B6.2 Récompense de fin de salle (§R10) — `38_monde.js`

Tirée une seule fois par salle (flux reproductible propre à la salle) ; poids avant normalisation, *c* = chance bornée entre 0 et 10 :

| Issue | Poids | À chance 0 | À chance 10 |
|---|---|---|---|
| Rien | 36 − 3c (+12 en Difficile) | 33,5 % | 6,5 % |
| Ryō (12 % bourse, 3 % lingot, 26 % paire de pièces) | 28 | 26,0 % | 30,3 % |
| Cœur (25 % demi, 8 % double) | 11 | 10,2 % | 11,9 % |
| Clé (10 % double) | 8 | 7,4 % | 8,6 % |
| Explosif (10 % double) | 8 | 7,4 % | 8,6 % |
| Coffre (25 % verrouillé, 12 % piégé) | 5 + 0,6c | 4,7 % | 11,9 % |
| Consommable (45 % pilule) | 5 + 0,6c | 4,7 % | 11,9 % |
| Condensateur | 2 | 1,9 % | 2,2 % |
| Talisman | 1,5 + 0,3c | 1,4 % | 4,9 % |
| Réserve de chakra (20 % instable) | 3 | 2,8 % | 3,2 % |

Chaque boss vaincu lâche en plus 2 à 4 pièces. Espérance par étage, tout ramassé : environ 6,5 Ryō de fin de salle, 1 à 2 des jarres et 3 du boss, soit une dizaine (un objet de qualité 2 tous les un étage et demi). Le banc d'équilibrage (B4.4) mesurait 5 Ryō par étage avant ce réglage.

La génération garantit que la **route obligatoire vers le boss ne demande aucune clé** (test « generation » sur 400 étages). Les routes facultatives (héritage, échoppe dès l’étage 2) peuvent être refusées faute de clé.

### B6.3 Huit dilemmes chiffrés

| # | Dilemme | Chiffres |
|---|---|---|
| 1 | Ouvrir la salle d’héritage ou un coffre verrouillé avec son unique clé | Héritage : un objet du pool héritage (145 objets, qualité 2 en moyenne). Coffre verrouillé : 12 % d’objet du pool coffre, sinon 2 à 4 ressources (chance +4) et 12 % de talisman. |
| 2 | Acheter un soin ou un objet | Cœur 3 Ryō, réserve de chakra 5 ; objet de qualité 1–4 : 10, 15, 20 ou 25 Ryō. Avec 15 Ryō et une demi-unité restante : un objet de qualité 2 ou cinq cœurs. |
| 3 | Garder un explosif pour une cache | Une cache demande 1 explosif (mur voisin d’au moins deux salles) ; un rocher à sceau en demande 1 aussi pour une réserve, une clé, deux explosifs, une bourse ou un rouleau. |
| 4 | Payer un informateur | Voyageur : 1 Ryō par paiement, 12 % d’objet (il part), 20 % d’un petit présent. Espérance ≈ 8 paiements pour un objet. |
| 5 | Accès alternatif | L’épreuve chūnin n’ouvre qu’à vitalité pleine : dépenser un cœur maintenant ou garder la porte ouverte. |
| 6 | Préserver la santé pour un pacte | Pacte de qualité ≤ 2 : 1 contenant ; qualité 3–4 : 2 contenants (1 avec le Nuage écarlate) ; pacte de sang et pari : 1 contenant ; troc : un de vos objets, sans santé. Un pacte acheté ferme la branche Lumière et le sanctuaire des étages suivants. |
| 7 | Relancer un objet | *Réécriture d’empreinte* : 6 salles de charge ; la relance peut donner mieux ou pire (même pool). |
| 8 | Abandonner l’exploration pour une route chronométrée | Conseil des épreuves : boss de l’étage 6 vaincu avant 20:00 ; Brèche : salle du boss 8 atteinte avant 30:00. Une salle vidée coûte 15 à 40 s. |

### B6.4 Audit des boucles économiques

| Boucle | Coût / limite | Classement |
|---|---|---|
| Don vital → Ryō → soin à la source | 6 dons au plus par autel, prix payé réel | Combo autorisé (lent, risqué) |
| Artificier : rendre ses explosifs au double | 30 % par explosif donné, départ après un objet | Combo autorisé |
| *Sceau de duplication* (CON_025) sur les ressources au sol | Consommable unique, coffres exclus | Autorisé |
| Contrat de Kakuzu + Bourse (SYN_044) | Pactes payés en Ryō, ressource finie | Combinaison volontairement dominante mais rare |
| Loterie à gains doublés (PSV_125) | 1 Ryō par tirage, 62 % de perte (56 % avec TAL_022) | Espérance proche de zéro : autorisé |
| Recharger un actif en attendant | **Impossible** : les actifs à recharge ne progressent qu’en combat ; une salle ne recharge qu’une fois | Bug évité |

## B7. Salles (brief §13–§14) — `38_monde.js`, `39_speciales.js`

### B7.1 Machine d’états

`inconnue → aperçue (voisine d’une salle visitée) → visitée → en combat → nettoyée → récompensée → quittée → revisitée`.

| Transition | Règle |
|---|---|
| Entrée | Joueur placé devant la porte d’arrivée, jamais sur une fosse, un obstacle ou un piédestal ; ennemis à moins de 2,6 tuiles déplacés (position symétrique ou case libre éloignée) ; aucune attaque pendant la transition ni l’apparition (+0,25 s). |
| Combat | Portes verrouillées 0,25 s après l’entrée si des ennemis sont présents (son de fermeture). |
| Nettoyage | Mort du dernier ennemi comptant (les miroirs, illusions et invocations liées ne comptent pas) : portes ouvertes, tirage de récompense unique, **une charge d’actif** (deux pour une grande salle), événement `salle_nettoyee`, sauvegarde de la partie. |
| Revisite | Ni ennemis, ni loot, ni charge ; objets au sol, rochers détruits, coffres ouverts et achats conservés. |
| Fuite par téléportation | Les ennemis restants sont conservés à leur position ; un boss garde ses PV (proportion) : pas d’effacement de phase. |

**Secours d’un ennemi réellement inaccessible** (§R26b) : un ennemi terrestre qu’aucun chemin praticable ne relie au joueur pendant 8 s de combat est replacé sur la case libre accessible la plus proche (fumée visible). Il n’est ni tué ni affaibli ; chaque secours est compté et journalisé en test (section « secours »). Les ennemis volants, cachés, les boss et le joueur en lévitation en sont exclus. Les **embusqués** surgissent d’eux-mêmes après 3,5 s si le joueur ne s’approche pas.

### B7.2 Types de salle

| Type | Fréquence / condition | Coût d’accès | Risque | Pool / contenu | Pictogramme de carte | Revisite |
|---|---|---|---|---|---|---|
| Départ | 1 par étage | — | — | Plan de l’étage (bannière) | point clair | libre |
| Combat | le reste | — | ennemis | tirage de fin | — | vide |
| Héritage | 1 par étage | clé dès l’étage 2 | — | héritage (1 objet, 2 au choix pour Shikamaru) | étoile dorée | objet restant |
| Échoppe | 1 par étage | clé dès l’étage 2 | — | boutique : 2 objets (3 avec *Réputation*) + ressources ; statue-tanuki | pièce verte | achats conservés |
| Boss | 1, cul-de-sac le plus éloigné (≥ 3 à l’étage 1, ≥ 4 ensuite) | — | boss | boss + cœur ou réserve | crâne | sorties |
| Cache | case vide voisine d’au moins 2 salles ordinaires | explosif | — | cache (objet ou ressources) | — (secrète) | — |
| Chambre isolée | case vide voisine d’une seule salle de combat 1×1 | explosif | — | isolée (objet 75 %) | — | — |
| Pacte / sanctuaire | opportunité après le boss (étages 2–8) | santé / aucun pacte acheté | santé | pacte / sanctuaire | serpent / crapaud | — |
| Chambre maudite | 30 à 45 % selon l’étage | libre | sortir coûte une demi-unité (sauf lévitation) | coffres piégés | pics | — |
| Autel de tribut | 12 % | — | santé | 12 paliers stockés | goutte | paliers conservés |
| Épreuve chūnin | 25 % | vitalité pleine | 3 vagues | défi | kunai croisés | — |
| Épreuve jōnin | 20 à 25 % (étages 4, 6, 8) | vitalité pleine | 2 boss à 60 % | défi | kunai croisés violets | — |
| Comptoir (dispositifs) | 30 à 40 % | libre dès l’étage 2 | — | machines et informateurs | dé | machines conservées |
| Bibliothèque | 10 à 15 % | clé | — | bibliothèque (2 objets liés) | rouleau | — |
| Chambre forte | 10 à 15 % | clé | — | 6 coffres | coffre | — |
| Source chaude | 15 à 20 % (étage 3+) | clé ; 5 Ryō ou 1 clé pour l’usage | — | soin conditionnel, une fois | goutte bleue | utilisée |

## B8. Génération (brief §12) — `31_etage.js`

**Entrées** : code de mission, numéro d’étage, configuration (fourchette de salles, spéciales et probabilités, boss, distance minimale du boss, part de grandes salles). **Flux** : `topologie`, `gabarits`, `butin`, `recompenses`, `ennemis`, `combat` dérivés de `code | version des données | étage | nom du flux`.

```text
planEtage(alea, cfg):
  N ← entier dans cfg.salles ; placer DÉPART en (6,6) sur une grille 13×13 ; file ← [départ]
  tant que |salles| < N et garde < 400 :
    si file vide : y remettre une salle existante au hasard
    r ← file.défiler() ; pour chaque cellule de r et chaque direction (ordre mélangé) :
      case voisine libre, dans la grille, touchant une seule salle, et 50 % de chance ;
      avec probabilité cfg.grandes (10 % à l'étage 1, 20 % ensuite) : essayer une grande forme
        (2×1, 1×2, 2×2, L1-L4) dont une cellule couvre la case et qui ne touche que r ;
      sinon salle 1×1 ; l'ajouter à la file
  si |salles| < N → échec « nombre de salles »
  adjacences ; distances depuis le départ (parcours en largeur)
  culs-de-sac ← salles 1×1 à un seul voisin (hors départ), triées par distance décroissante
  échec si aucun ; boss ← le plus éloigné ; échec si distance < cfg.distBossMin ou voisin du départ
  spéciales demandées ← obligatoires (héritage, échoppe) + tirages de probabilité, par priorité
  échec si culs-de-sac restants < obligatoires ; attribuer en évitant les voisins du boss
  cache ← case vide voisine de ≥ 2 salles ordinaires (préférer 3), jamais du boss
  isolée ← case vide voisine d'exactement une salle de combat 1×1 (préférer les plus éloignées)
  échec si une spéciale obligatoire manque
genererEtage : jusqu'à 60 essais de planEtage ; sinon planSecours (croix fixe valide) et diagnostic « SECOURS »
  portes par paires ; secrets : portes secrètes seulement côté ordinaire ; verrous (héritage, échoppe,
  bibliothèque, chambre forte, source : dès l'étage 2) ; épreuves : porte conditionnelle
  gabarits : type, forme, étages, thème et portes compatibles ; pas de répétition dans l'étage si possible
```

**Critères de rejet** : nombre de salles insuffisant, aucun cul-de-sac, boss trop proche ou voisin du départ, spéciales obligatoires impossibles, cache obligatoire introuvable. **Diagnostics** enregistrés avec l’étage (liste des échecs, nombre d’essais). Résultat mesuré par le test automatique sur 400 étages : 1,2 essai en moyenne, **aucun plan de secours** nécessaire, aucune salle isolée du graphe, aucun boss inaccessible sans clé, toutes les portes secrètes réciproques, tous les devants de porte praticables.

**Gabarits** : chaque modèle déclare type, forme, grille (collision, apparitions par rôle, points spéciaux), étages admis, portes imposées (couloirs), poids. L’outil `catalogues.mjs` vérifie la navigabilité : portes reliées entre elles, points d’apparition au sol et piédestaux atteignables (sinon erreur pour une salle de combat, avertissement pour une récompense facultative). Les grandes salles utilisent une **caméra locale** qui suit le joueur avec des butées aux murs ; l’échelle des personnages ne change jamais.

**Ennemis** : chaque point d’apparition tire un ennemi du rôle demandé dans la liste du thème ; champion à 5 % (10 % en Difficile, +2 % dès l’étage 5).

## B9. Progression (brief §28) — `49_progression.js`, `48_sauvegarde.js`

| Mode | Effet | Déblocages |
|---|---|---|
| Standard | règles de référence | oui |
| Difficile | PV ennemis ×1,2, projectiles ennemis ×1,12, une salle de plus par étage, champions ×2, récompenses de fin de salle plus rares (+12 au poids « rien ») | oui ; marque dorée |
| Défis (contrats) | départ, restrictions ou règles propres | récompense du contrat |
| Mission à code | graine saisie (partage, entraînement) | **aucun déblocage** (annoncé à l’écran) |

Le profil enregistre objectifs accomplis, marques par personnage et par route (Standard, Difficile, Défi séparés ; l’entraînement n’en donne pas), meilleurs étages et temps, découvertes, compteurs cumulés et dons. La sauvegarde de partie suspendue est distincte (H6).
