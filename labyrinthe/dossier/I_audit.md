# I — Audit final : quantités, contradictions, hypothèses, références, manques

> Section I du dossier. Elle dit ce qui existe réellement, ce qui a été corrigé en route, ce qui reste une hypothèse et ce qui n'est pas produit. Les compteurs viennent de `catalogues/compteurs.json` (régénéré à chaque exécution de `outils/catalogues.mjs`).

## I1. Quantités produites face aux cibles

| Ensemble | Produit et jouable | Cible v1.0 de travail (brief §44) | Bibliothèque complète (brief §35) |
|---|---:|---:|---:|
| Personnages de base | 12 | 12 | 40 |
| Variantes altérées | 6 | 6 | 40 |
| Objets passifs | 158 | 150 | 480 |
| Objets actifs | 33 | 30 | 120 |
| Talismans | 35 | 35 | 100 |
| Consommables (rouleaux, sceaux) | 30 | 30 | 80 |
| Pilules (effets) | 15 | — | — |
| Familiers (comportements distincts) | 16 | — | — |
| Synergies documentées | 96 | 60 | 300 |
| Transformations d'ensemble | 13 | 12 | 40 |
| Thèmes d'étage | 10 | 6 | 12 |
| Variantes d'étage | 18 | 12 | 24 |
| Boss (dont mini-boss) | 25 | 25 | 70 |
| Archétypes ennemis | 76 | 60 | 140 |
| Modèles de salles | 120 | 120 | 500 |
| Objectifs de déblocage | 80 | 80 | 250 |
| Défis jouables | 30 | 30 | 80 |
| Secrets documentés | 15 | — | 60 |
| Routes et fins | 6 | — | — |
| Builds détaillés | 64 | — | 60 |
| Briefs d'écrans | 16 | — | 16 |
| Fiches d'effets (D) | 22 | — | 30 |

**Lecture honnête.** La cible « v1.0 de travail » est atteinte ou dépassée sur les 16 lots chiffrés. La **bibliothèque complète** reste une cible de conception : 600 collectibles, 500 salles, 70 boss, 140 ennemis et 80 personnages ne sont ni produits ni décrits fiche par fiche ; aucun document ne les présente comme faits. Les synergies documentées sont surtout des paires : 96 dont 9 fusions de natures et 3 trios ; les trios et combinaisons de quatre du brief (§35 : 90 et 30) restent très en deçà.

## I2. Contradictions trouvées et résolues

Le dossier a été relu contre le code, et le code contre le dossier. Chaque écart a été corrigé du côté qui avait tort ; les tests nommés entre crochets le verrouillent désormais.

**Mécaniques annoncées mais inactives** (le texte promettait, le code ne faisait rien) :

| Écart | Correction | Test |
|---|---|---|
| Susanoo d'Itachi, sable qui se referme sur l'arène de Gaara, cristaux des « Galeries de verre » : simples drapeaux | mécaniques jouées, visibles et bornées (E §3) | [mecaniques] |
| Refus de pacte sans effet (compteur jamais incrémenté) alors que le secret SEC_012 et la diseuse l'annonçaient | visite sans achat = +0,25 au poids du sanctuaire | [pactes] |
| Paliers d'échoppe inatteignables (aucun don possible) | offrande d'un Ryō au tanuki, cumul au profil | [economie] |
| Contrats : personnage et Difficile non imposés, pénombre, −30 %, chronomètre, condition d'étage absents | règles appliquées ; un contrat n'est inscrit que si ses conditions sont tenues | [defis] |
| Table de conversion de Rock Lee promise (A, fiche) mais absente | la mêlée reste principale, les formes de tir deviennent des contributions | [personnages] |
| Contribution « sphère contrôlée d'appoint » documentée (C) mais jamais créée | sphère orbitale ×0,5 | [personnages] |
| Indices de secrets non consultables en jeu | onglet « Secrets » du Registre, secrets inscrits à leur découverte | — |
| Chances d'opportunité non affichées | écran de pause, recalculées à chaque affichage | — |

**Défauts de jeu** :

| Écart | Correction |
|---|---|
| Tous les ennemis et boss à sprite « ninja » invisibles (décalage non numérique) | variable d'échelle corrigée ; test [visibilite] sur les 99 sprites |
| Corps du serpent géant et chaîne des frères démons blessants mais non dessinés | dessinés, avec états d'alerte |
| Zones ennemies blessantes pendant leur apparition | la naissance devient un télégraphe |
| Tir arrêté (bouclier, Susanoo) appliquant quand même statuts et déclencheurs | seul l'impact physique a lieu |
| Transition de porte d'une partie précédente finissant dans la suivante | état transitoire remis à zéro à chaque nouvelle partie |
| Partie perdue ressuscitée par la copie de secours de sauvegarde | effacement complet [sauvegarde] |
| Tir qui revient privé de sa compensation de portée quand une autre forme domine | compensation liée à la trajectoire |
| Contreparties « −1 contenant » gratuites sans contenant (Sasori) | 4 demis de réserve par contenant manquant [economie] |
| Échoppe et récompense de boss offrant des cœurs à un personnage sans vitalité | protection à la place |
| Kabuto : soin presque impossible à interrompre, combats de plus de 2 min | seuil 20, 10 %, trois fois au plus, recharges ; invocations espacées |
| Attaques d'invocation déclarant deux fois la clé `id` | champ `ennemi` distinct |
| Nom de talisman divergent entre code et dossier (TAL_015) | « Bague de l'organisation » partout |
| Ponctuation française orpheline en début de ligne | règle de coupure |
| Texte de récompense débordant de l'écran de victoire | coupure centrée |
| Salles de pacte et de sanctuaire sans identité visuelle | décors propres (G §3, briefs 10-11) |
| Son jamais démarré en jouant à la manette seule (le navigateur exige un clic ou une touche) ; mixage trop faible (crêtes à −25 dB) | nouvel essai à chaque appui de manette, invite visible tant que le son attend, gain maître, compresseur et limiteur (crêtes ≈ −5 dB), réverbération |
| Ennemis de comportements différents visuellement identiques (même corps de shinobi, couleurs seules ; même marionnette pour quatre comportements, même oiseau pour un volant et un kamikaze) | équipement par comportement et accessoire d'attaque pour les créatures (D §4) |
| Échange d'actif en boucle : l'ancien actif reposé sur le piédestal était repris dès la fin de l'animation si l'on restait dessus (délai décompté au dessin, écoulé pendant l'animation) ; même va-et-vient avec un talisman ou un consommable lâché | un objet reposé ou lâché ne se reprend qu'après s'en être éloigné ; délai décompté par la simulation [actifs] |
| Actif pris puis aussitôt échangé contre un actif voisin (deux piédestaux d'actif proches) | délai de 2 s après chaque prise d'actif, pendant lequel aucun actif ne se prend ni ne s'achète ; actifs indisponibles pâlis [actifs] |
| Tir de côté détruit à sa naissance quand on est collé au mur du haut (origine 12 px au-dessus des pieds, donc dans le mur) ; la vitesse poussée contre un mur déviait les tirs | origine redescendue sous l'arête du mur ou de l'obstacle ; vitesse annulée sur l'axe bloqué [mecaniques] |
| Visée tenue ignorée après une porte, une prise d'objet ou l'intro d'un boss : il fallait relâcher le stick pour tirer de nouveau (le bot restait bloqué dans une salle) | la visée n'est plus consommée en jeu, seulement aux menus et à la reprise [mecaniques] |
| Mur secret ouvert à l'explosif sans ouverture visible (fond de salle en cache non redessiné) | fond redessiné des deux côtés ; brèche dentelée, gravats, fumée et secousse |
| Obstacles qui accrochent : boîte de collision de la tuile entière (32 px) pour des jarres, feux et rochers dessinés plus petits ; feu qui brûlait à 7 px de sa flamme ; tirs arrêtés à côté d'une jarre | boîtes rentrées calées sur le dessin (D §2), brûlure au contact de la flamme, tirs arrêtés par la largeur dessinée [mecaniques] |
| Échoppe et salle d'héritage trop proches (même porte dorée, décors voisins, pictogrammes de carte ressemblants) | échoppe en marché, héritage en sanctuaire, portes et pictogrammes distincts (D §9) |
| Revue de captures (chaque thème, type de salle, boss, état du HUD, menu) : textes d'entrée de salle hors écran, messages d'écran superposés, notifications par-dessus les bandeaux, télégraphes sur le HUD, onglets du registre qui se chevauchent, texte de mission à code qui déborde, carte de pause décentrée, poussières au-dessus du vide, couloirs sans appliques, brume et pénombre qui débordaient de la salle | textes empilés et coupés, notifications retenues, dessin de la salle découpé à ses murs, appliques par cellule |
| Bandeau d'une synergie ou d'une transformation écrasé par celui de l'objet qui la complète ; bandeaux d'objet dessinés par-dessus le titre d'étage | file de bandeaux : l'objet d'abord, puis transformation et synergie ; file retenue pendant le titre d'étage et l'intro de boss [synergies] |
| Messages d'écran identiques empilés (avertissement « coups d'un cœur entier » répété) | un message encore affiché est remplacé, jamais dupliqué |

**Défauts du banc de test** : huit codes de mission invalides tombaient sur une graine aléatoire (tests instables) ; le test manette dépendait de l'ordre d'exécution ; le test de secours ne mesurait que l'écart horizontal ; le pilote employait le *Parchemin de téléportation* au milieu d'un combat de boss (comportement voulu du jeu, mais le parcours ne finissait plus l'étage). Tous corrigés.

Les écarts plus anciens (pics devant des portes, familiers accumulés, faisceau continu qui ne blessait qu'une fois, transformations impossibles à compléter, récompenses de route citant des personnages absents, second talisman ignoré, île inaccessible dans ROM_012…) sont consignés dans le registre de A et dans l'historique des commits.

## I3. Hypothèses (valeurs de projet, non mesurées)

- **Tous les nombres de jeu** — dégâts, cadences, PV, prix, probabilités d'opportunité, paliers de l'autel, chances de champion, durées de télégraphe — sont des décisions de conception. Aucun n'est présenté comme une constante de *The Binding of Isaac* ni comme une donnée officielle de *Naruto*.
- **Équilibrage** réglé avec un pilote automatique invulnérable : il montre que chaque combat se termine (boss de 8 à 98 s avec un tir renforcé), pas qu'il est juste pour un humain. Les boss les plus longs (Dix Queues, Madara, Kabuto) sont les premiers à vérifier en recette.
- **Esquivabilité** garantie par construction (une attaque active par boss, préavis ≥ 0,2 s, brèches d'au moins trois projectiles), pas prouvée par un test.
- **Manette** : disposition « standard » de l'API Gamepad ; les zones mortes et l'hystérésis sont des valeurs de départ réglables, non calibrées sur matériel.
- **Chances « sans coup » d'opportunité** : les parties commentées (pilote invulnérable) les montrent toujours acquises ; en jeu réel elles le seront moins souvent.

## I4. Références et attributions à vérifier

| Élément | Statut dans les données | Point à vérifier |
|---|---|---|
| PSV_020 Chute céleste | création originale d'après une technique célèbre | rapprochement avec une technique précise |
| PSV_053 Flammes noires, ACT_017 Amaterasu, ACT_018 Tsukuyomi | adaptation | fidélité des effets et des noms |
| PSV_087 Sceau de régénération | adaptation (Byakugō) | rattachement du nom |
| PSV_131 Sceau de la mort, PSV_140 Réincarnation impure | adaptation | nom et usage |
| BOS_022 Empreinte des Dix Queues | création originale d'après une créature célèbre | représentation |
| Tous les personnages (18) | canon adapté : règles inventées | aucune règle ne prétend être canonique |

**Droits.** Le projet est non officiel. Il n'utilise aucune ressource extraite (sprites, sons, musique, police et salles sont créés pour lui), mais les noms et personnages restent la propriété de leurs ayants droit. Toute diffusion publique suppose une autorisation **à vérifier** ; son existence n'est pas supposée.

## I5. Systèmes non produits

| Système (brief) | État | Raison ou piste |
|---|---|---|
| Remontée secrète (§27) | non produite | route supplémentaire après la Lumière et l'Ombre |
| Marché des mercenaires (mode de vagues économique, §24 et §28) | non produit | réutiliserait les épreuves chūnin et l'échoppe |
| Archive interdite, Coffret de scellement (matrice de A) | non produits | salles spéciales supplémentaires |
| 22 personnages de base et 34 variantes de la cible (§25) | non produits | les 12 produits couvrent les familles de règles |
| Coopération locale (§28) | non produite, non annoncée | spécification à écrire (butin, santé, caméra, portes) |
| Courses quotidiennes (§28) | non produites | extension possible, sans récompense exclusive |
| Trios et quatuors de synergies (§35) | 3 trios, aucun quatuor | 84 paires et 9 fusions de natures (dont une à trois natures) |
| Vingt-quatre variantes d'étage (§35) | 18 | 10 thèmes sur 12 ; les deux thèmes de l'étage 9 (Mont Myōboku, Profondeurs du sceau) n'ont qu'une variante |

## I6. Capacités présentes dans le moteur mais sans contenu

- **Surcharge d'actif** (`surcharge` : jusqu'au double des charges) : gérée par le moteur, portée par aucun objet.
- **Visée libre de la sphère contrôlée** : réglage présent, désactivé par défaut (tir cardinal, fidèle au modèle).
- **Migration de sauvegarde** v1 → v3 : présente, jamais sollicitée par une version publiée.

## I7. Risques ouverts

1. **Droits d'exploitation** (bloquant pour toute diffusion publique).
2. **Recette humaine** absente : sensations, lisibilité et difficulté réelles restent à confirmer (H §8).
3. **Matériel** : manettes réelles, écrans à fréquence élevée, machines modestes (en rendu logiciel, le 99e centile approche 21 ms sur la scène la plus chargée avec l'éclairage dynamique, 14 ms sans ; l'option se coupe dans les réglages).
4. **Accessibilité** : mode confort, sans flash, icônes redondantes et remappage existent ; une revue par des joueurs concernés reste à faire.
5. **Volume** : l'écart entre la version de travail et la bibliothèque complète est d'un ordre de grandeur ; toute extension doit passer par le validateur et le banc de test, qui restent la condition d'entrée de chaque lot.
