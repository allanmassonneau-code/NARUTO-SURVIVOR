# B. Systèmes jouables

Toutes les valeurs sont des **hypothèses de départ à tester**. Unités : registre §R2 (1 m = 16 px, tick = 1/60 s).

## B1. Contrôles

### B1.1 Commandes

| Action | Clavier | Manette | Obligatoire |
|---|---|---|---|
| Déplacement | ZQSD / WASD / flèches (détection de la disposition) | Stick gauche | Oui |
| Esquive | Espace | A / Croix | Non |
| Ultime manuel | E | Y / Triangle | Non (automatique par défaut) |
| Transformation manuelle | R | B / Rond | Non (automatique par défaut) |
| Pause (immédiate, 1 frame) | Échap / P | Start | — |
| Écran de build | Tab (maintien ou bascule, réglable) | Select | — |
| Relance / Bannissement / Passage (écran de niveau) | 1 / 2 / 3 | X / RB / LB | — |

Toutes les touches sont reconfigurables ; chaque action « maintien » propose un mode « appui bascule ».

### B1.2 Déplacement

* **Vitesse de base** : 4,5 m/s (72 px/s). Accélération jusqu'à la vitesse cible en **0,06 s**, décélération en **0,08 s** : le personnage répond immédiatement sans patiner.
* **Diagonales normalisées** : le vecteur d'entrée est normalisé (clavier : `(1,1)` → `(0,707 ; 0,707)`). Au stick : zone morte radiale de 0,18, courbe linéaire de 0,18 à 0,95, saturation au-delà ; l'amplitude module la vitesse (marche possible à la manette).
* **Obstacles** : collision cercle (rayon 0,375 m) contre formes convexes. Le mouvement **glisse** le long de la normale (projection du vecteur sur la tangente). Coins : si le joueur pousse contre un angle saillant à moins de 0,25 m du bord, une correction latérale de 0,1 m/tick l'aide à contourner. Aucun obstacle de décor ne crée de cul-de-sac inférieur à 2 m de large (règle de level design, §D2).
* **Ennemis** : les ennemis ordinaires **ne bloquent pas** le joueur ; ils exercent une poussée douce (séparation 1,5 m/s max) qui ne peut jamais l'emprisonner. Seuls les **Protecteurs** et certains boss ont une collision solide, signalée par un contour épais.
* **Compagnons** : jamais de collision avec le joueur.

### B1.3 Ciblage automatique

Chaque technique déclare une **règle de ciblage** (codes de données : `plus_proche`, `plus_dense`, `plus_menacant`, `direction`, `aleatoire_pondere`, `marque`, `chemin` — position prévue sur le trajet des ennemis —, `aucune`). Règles communes :

1. **Candidats** : ennemis visibles à l'écran ou à ≤ 2 m du bord, ciblables, hors état « apparition » (0,4 s d'invulnérabilité à l'apparition, signalée par un cercle d'invocation).
2. **Priorité globale** (départage) : cible « menace immédiate » (assassin en préparation, lanceur de projectile télégraphiant) > élite > boss > ordinaire ; puis distance.
3. `plus_dense` : cellule de 3 × 3 m de la grille spatiale contenant le plus d'ennemis, dans la portée.
4. **Changement de cible** : une technique conserve sa cible tant qu'elle est valide et à portée ; elle la change si la cible meurt, sort de portée ou si une menace immédiate apparaît à < 4 m (hystérésis de 0,3 s pour éviter l'oscillation).
5. **Direction d'attaque à l'arrêt** : les techniques `direction` (cônes, rayons, taijutsu frontal) utilisent la **dernière direction de déplacement non nulle** ; à la manette, le stick droit peut orienter manuellement (option « Visée assistée au stick droit », désactivée par défaut).
6. **Aucune cible** : les techniques à cible attendent (le délai continue à courir mais s'arrête à 0 ; la technique part dès qu'une cible apparaît). Les orbites, zones autour du joueur et invocations fonctionnent normalement.

### B1.4 Esquive

* Déplacement de 3 m en 0,18 s dans la direction d'entrée (ou la direction courante), **invulnérabilité 0,25 s** (commence au premier tick).
* Recharge 4,0 s ; une seule charge de base (+1 charge via PAS_031 « Pas de l'ombre »).
* **Esquive parfaite** : si une attaque télégraphiée aurait touché pendant l'invulnérabilité, +5 chakra et une image rémanente bleue ; limite 1 fois par seconde.
* L'esquive **n'interrompt pas** les attaques automatiques.
* Les techniques ne déplacent jamais le joueur à son insu : les dashs offensifs (taijutsu) déplacent une **image d'attaque** (unité logique de frappe) et non le personnage, sauf les techniques marquées « déplacement volontaire », qui se déclenchent uniquement à l'esquive (ex. JUT_164 « Konoha Senpū »).

### B1.5 Invulnérabilité et impacts

| Source | Règle |
|---|---|
| Contact | Un même ennemi touche au plus 1 fois / 0,5 s ; **fenêtre globale** : après un impact de contact, aucun autre impact de contact pendant 0,35 s (≈ 3 impacts/s maximum, jamais vingt) |
| Projectiles et zones | Chaque source a son propre intervalle ; les zones persistantes hostiles touchent au plus 1 fois / 0,5 s |
| Coup lourd (≥ 20 % PV max après réduction) | Invulnérabilité totale 0,6 s |
| Esquive | 0,25 s |
| Activation de transformation | 0,8 s |
| Fin de transformation | 1,0 s |
| Montée de niveau / coffre | 0,5 s à la reprise |

**Signal visuel** : pendant l'invulnérabilité, le sprite alterne toutes les 4 frames (66 ms) entre sa palette normale et une palette « claire » (+2 crans de valeur), avec un **contour blanc de 1 px** continu ; le personnage ne disparaît **jamais**. Son : souffle bref à l'entrée. Option d'accessibilité « sans clignotement » : contour seul + anneau au sol pointillé.

### B1.6 Assistance

Distincte des rangs de difficulté, affichée dans l'écran de résultat (icône « Assisté »), n'invalide aucun déblocage **sauf** les secrets marqués « Épreuve ».

| Aide | Effet |
|---|---|
| **Mode déplacement seul** | Esquive automatique contre les attaques télégraphiées (recharge ×2), ultime et transformation automatiques, cartes de niveau choisies automatiquement avec possibilité de corriger pendant 3 s |
| Choix automatique | Sélection de la carte recommandée (pondération du build) |
| Ralentissement | Vitesse de jeu 80 % ou 65 % |
| Télégraphes renforcés | Durée d'avertissement +30 % et contour épaissi |
| PV d'assistance | +50 % PV max |

### B1.7 Tutoriel intégré (mission d'introduction MIS_001)

Aucun texte bloquant. Séquence de 90 s :
1. 0–10 s : 4 ennemis lents apparaissent loin ; icône de déplacement animée près du personnage, disparaît au premier mouvement.
2. 10–25 s : les attaques automatiques tuent ; libellé bref « Attaque automatique » pointé sur le premier impact (1,5 s).
3. 25–40 s : les fragments tombent ; le rayon de collecte s'affiche une fois en pointillé.
4. Premier niveau : trois cartes, la recommandée pulse légèrement. Texte : « Choisissez une amélioration ».
5. 60–90 s : premier mini-élite, première esquive suggérée (« Espace / A pour esquiver », 2 s, une fois).

## B2. Boucles et structure d'une partie

### B2.1 Cinq échelles de boucle

| Échelle | Durée | Contenu | Récompense perçue |
|---|---|---|---|
| Impact | 0,05–0,5 s | Touche, réaction ennemie, chiffre facultatif, son | Poids, précision |
| Élimination-récupération | 2–10 s | Tuer un groupe, fragments, attraction | Flux continu de progression |
| Montée de niveau | 20–60 s | Choix de carte | Direction de build |
| Build | 3–20 min | Remplir emplacements, évolutions, synergies | Identité, domination |
| Méta | Entre parties | Ryō, maîtrise, déblocages, archives | Curiosité, nouvelles options |

### B2.2 Chronologie de la run Standard (25 min)

La difficulté monte par **composition** (rôles), **pression spatiale** et **événements**, en plus des PV.

| Temps | Vagues (rôles dominants) | Élites / événements | Opportunités de build | Respiration |
|---|---|---|---|---|
| 00:00–01:30 | Poursuivants lents (1 PV-coup) | — | 3–4 niveaux rapides | — |
| 01:30–03:00 | + Chargeurs | 02:30 Rouleau visible sur la carte | Premier équipement | — |
| 03:00–05:00 | + Tireurs à longue préparation | 04:30 **Élite 1** (coffre simple) | 1re amélioration forte | 05:00–05:30 creux |
| 05:30–08:00 | Encerclement léger (anneaux de poursuivants) | 07:00 Événement de carte 1 | Nouvelles familles proposées | — |
| 08:00–10:00 | + Poseurs de pièges, Protecteurs | 09:30 **Lieutenant** (mini-boss, coffre 1–3) | 1re évolution possible (rare) | 10:30–11:00 creux |
| 11:00–13:00 | + Soigneurs, Contrôleurs | 12:00 Rouleau interdit possible | Transformation | — |
| 13:00–15:00 | Mélanges : protecteurs + tireurs | 14:30 **Élite 2 + Élite 3** simultanées | Évolutions principales | 15:00–15:30 creux |
| 15:30–18:00 | + Invocateurs, Assassins | 16:30 Événement de carte 2 (majeur) | Éveil tardif (≥ 15:00) | — |
| 18:00–19:40 | Vague d'apogée, densité maximale | 19:00 Élite 4 | Finitions | 19:40–20:00 **dégagement** (les ordinaires fuient) |
| **20:00** | Arrivée du **boss final** ; les ordinaires se réduisent à 25 % de densité, rôles de soutien du boss | Phases du boss | — | — |
| 20:00–25:00 | Combat de boss (durée visée 2–4 min) | Victoire à la mort du boss | — | — |
| 25:00–28:00 | **Prolongation** : le boss passe en rage (motifs plus serrés, pas de PV en plus), densité ordinaire 60 % | — | — | — |
| **28:00** | **Retraite forcée** : mission échouée ; Ryō et maîtrise acquis conservés | — | — | — |

Le mode **Endless** est un mode séparé (§D9) : pas de boss final, boss tournants toutes les 10 min, croissance sans limite de temps.

**Suspension** : montée de niveau, coffre, rouleau, évolution et pause suspendent **tous** les chronomètres de gameplay (vagues, délais de techniques, télégraphes, projectiles, états). Les télégraphes reprennent avec le même temps restant, et 0,5 s d'invulnérabilité est accordée.

### B2.3 États du jeu

| État | Entrées | Sorties | Sauvegarde |
|---|---|---|---|
| Titre | Lancement | Village | — |
| Village (hub) | Titre, fin de run | Sélection, Archives, Entraînement, Missions, Maîtrise | Profil |
| Sélection | Village / « Rejouer » | Lancement | — |
| Lancement | Sélection | Combat (1,0 s de fondu, carte déjà chargée) | Création de la **sauvegarde de reprise** |
| Combat | Lancement, retours | Pause, Niveau, Récompense, Événement, Boss, Défaite | Reprise auto toutes les 60 s et à chaque retour de menu |
| Pause | Combat, perte de focus, débranchement manette | Combat, Abandon | Reprise |
| Montée de niveau | Combat (XP) | Combat ou niveau suivant en file | — |
| Ouverture de récompense | Combat (coffre/rouleau) | Combat, Évolution | — |
| Évolution | Récompense | Combat | — |
| Événement | Combat (déclencheur) | Combat | — |
| Boss | Combat (20:00) | Victoire, Défaite, Prolongation | Reprise |
| Victoire | Boss vaincu | Résultats → Village / Rejouer | Profil (atomique) |
| Défaite | PV = 0, retraite forcée | Résultats → Village / Rejouer | Profil (atomique) |
| Retour au village | Résultats | Village | — |

Plusieurs montées de niveau simultanées sont mises en **file** (compteur « +2 » visible) et enchaînées sans retour au combat.

### B2.4 Écran de fin (défaite comme victoire)

**Un seul écran**, bouton **Rejouer** focalisé par défaut dès 0,5 s :
* Cause de la mort : nom de la source, image figée de 1 s avant la mort (mini-vignette), type de dégât.
* Top 5 des sources de dégâts du joueur (dégâts totaux, DPS moyen, éliminations).
* Progression : Ryō gagnés, maîtrise, déblocages (icônes cliquables vers les Archives).
* Boutons : Rejouer (même personnage, même carte), Changer de personnage, Village.

### B2.5 Mission d'introduction et première défaite

* **MIS_001 « Examen d'entrée à la simulation »** : Expédition de 8 min sur `MAP_001`, boss réduit (Zabuza en version « entraînement »). Sa réussite affiche « Examen réussi » et **pas** « Jeu terminé ».
* **Règle de déblocage de la première défaite** : toute run terminée (victoire ou défaite) après **03:00** de jeu débloque **Kakashi** (`CHR_008`) et la technique `JUT_185` (Kunai en éventail) dans le pool commun. Une défaite avant 03:00 débloque la variante d'aide « Conseil de Kakashi » (un indice des Archives). Aucune condition n'exige de posséder l'entrée débloquée.

## B3. Emplacements

Voir registre §R3. Règles complémentaires :

* **Emplacement plein** : les cartes de nouvelles techniques ne sont plus proposées (exclusion avant tirage, §B6.3). Aucune proposition « remplacer » n'existe en combat, sauf via la **fusion** qui libère un emplacement.
* **Technique au niveau 8** : ses cartes d'amélioration disparaissent ; si une évolution est admissible, l'icône de la technique **scintille** dans le HUD et le prochain coffre la garantit.
* **Passifs** : niveau max **5**. Un passif maximal quitte le pool.
* **Équipement** : obtenu seulement via Rouleau ; 2 emplacements ; remplacer un équipement catalyseur d'une évolution déjà réalisée **ne défait pas** l'évolution (l'évolution est acquise), mais bloque les recettes futures qui en dépendent (avertissement affiché).
* **Signature** : la technique de l'emplacement 1 ne peut pas être bannie ; elle peut évoluer, et peut être l'**entrée principale** d'une fusion (le résultat reste en emplacement 1).

## B4. Statistiques, dégâts et défense

### B4.1 Statistiques principales

Présentation HUD : aucune ; écran pause/build : valeur totale + détail au survol. Tous les bonus en % sont **additifs entre eux** au sein d'une statistique, sauf mention « multiplicatif ».

| Statistique | Départ | Unité | Formule d'application | Limites | Arrondi | Affichage |
|---|---|---|---|---|---|---|
| PV max | 100 (varie par perso, 70–150) | points | `base × (1 + ΣPV%) + ΣPV_plats` | ≤ 400 | entier inférieur | « 120 PV » |
| Puissance | 0 % | % | Multiplie les dégâts de base (§B4.2) | ≤ +300 % | — | « Puissance +45 % » |
| Cadence | 0 % | % | `délai = délai_base / (1 + Cadence)` | Cadence ≤ +150 % ; délai ≥ 0,10 s | au tick supérieur | « Cadence +50 % (délai −33 %) » |
| Zone | 0 % | % | Multiplie **les dimensions linéaires** (rayon, longueur, largeur) | ≤ +100 % | — | « Zone +30 % » ; aperçu du rayon en pause |
| Durée | 0 % | % | Multiplie la durée des effets persistants, états appliqués et unités | ≤ +100 % | au tick | « Durée +20 % » |
| Quantité | +0 | entier | Ajoute des projectiles / unités (dans la limite de chaque technique) | +3 via passifs, +1 via équipement | — | « Quantité +1 » |
| Vitesse des projectiles | 0 % | % | Multiplie la vitesse des `PROJECTILE`, `SALVE`, `CHAINE` (propagation) | −50 % / +100 % | — | « Vitesse proj. +25 % » |
| Chance critique | 5 % | % | Tirée par touche (flux RNG combat) | ≤ 60 % | — | « Critique 15 % » |
| Dégâts critiques | ×1,5 | multiplicateur | Remplace ×1 si critique | ≤ ×3,0 | — | « Crit. ×1,8 » |
| Déplacement | 4,5 m/s | m/s | `base × (1 + ΣDépl%)` | +60 % / −40 % | — | « 5,4 m/s » |
| Armure | 0 | points | Réduction plate par coup (§B4.4) | ≤ 15 | — | « Armure 4 » |
| Régénération | 0 | PV/s | Appliquée par tranches de 0,5 s | ≤ 3,0 PV/s | cumul flottant | « Régén 0,8/s » |
| Rayon de collecte | 1,5 m | m | `base × (1 + ΣCollecte%)` | ≤ +200 % (4,5 m) | — | Cercle pointillé en pause |

**Statistiques avancées** (détail de pause uniquement) : Réduction des dégâts (%, ≤ 60 %), Bouclier max (§B4.9), Chance (influence les pondérations de rareté des Rouleaux, +0 à +50 %), Gain d'XP (+0 à +50 %), Gain de chakra (+0 à +60 %), Résistance au contrôle (le joueur, −50 % de durée max), Charges d'esquive.

### B4.2 Ordre de calcul des dégâts infligés

```
1. Base          B  = dégâts de base de la technique au niveau courant (données)
2. Additif       A  = 1 + Σ(Puissance) + Σ(bonus additifs conditionnels : famille, élément, cible)
3. Multiplicatif M  = Π(multiplicateurs : évolution, synergie « ×», transformation « ×»)
4. Critique      C  = ×DégâtsCrit si le tirage réussit, sinon ×1
5. Vulnérabilité V  = 1 + min(0,50 ; Σ Vulnérable sur la cible)
6. Résistance    R  = 1 − min(0,50 ; résistance de la cible − corrosion)   (ennemis)
Final = max(1, arrondi(B × A × M × C × V × R))
```

* **Additif vs multiplicatif** : les passifs, équipements et bonus conditionnels « +X % » s'additionnent dans A. Les effets marqués « ×X » (évolutions, transformations, certaines synergies) se multiplient dans M. Aucun passif `PAS` n'est multiplicatif.
* Les **effets secondaires** (`SECONDAIRE`) calculent leurs dégâts à partir de **B de l'attaque déclenchante** × leur coefficient, puis appliquent A et V et R de la cible touchée ; ils **ne critiquent pas** sauf mention, et n'appliquent pas M (évite la double multiplication).
* Les **dégâts sur la durée** (Brûlure, Poison) sont calculés à l'application : valeur par seconde × A du propriétaire ; pas de critique ; V et R appliqués par tick de dégâts (0,5 s).

**Exemple vérifiable** — Rasengan (JUT_281, niveau 5) sur Kisame (BOS_007) :

| Étape | Valeur | Calcul |
|---|---|---|
| Base niveau 5 | 40 | données |
| Additif : Puissance +20 % (PAS_001 niv. 2) + « Chakra dense » +10 % (PAS_004 niv. 2, technique CONTACT) | ×1,30 | 40 × 1,30 = **52,0** |
| Multiplicatif : Manteau du Kyūbi (TRF_001) ×1,20 | ×1,20 | 52,0 × 1,20 = **62,4** |
| Critique réussi, dégâts crit. ×1,5 | ×1,5 | 62,4 × 1,5 = **93,6** |
| Vulnérable +20 % (STA_12 via Trempé-Conduction) | ×1,20 | 93,6 × 1,20 = **112,32** |
| Résistance de Kisame 25 % | ×0,75 | 112,32 × 0,75 = **84,24** |
| **Final** | **84** | arrondi au plus proche |

### B4.3 Cadence vs réduction du délai

La cadence augmente la **fréquence**. `+50 %` de cadence donne un délai `1/1,5 = 0,667` fois le délai de base, soit **−33 %** de délai. L'interface affiche toujours les deux : « Cadence +50 % (délai −33 %) ». Un passif qui réduit un délai (ex. PAS_012 « Sceaux rapides » : délai des sceaux −20 %) est affiché comme tel et appliqué **après** la cadence : `délai = base / (1 + Cadence) × (1 − Réduction)`, réduction plafonnée à 40 %.

### B4.4 Dégâts subis par le joueur — ordre de résolution

```
1. Brut          R0 = dégâts de l'attaque ennemie (× multiplicateur de rang)
2. Réduction %   R1 = R0 × (1 − min(0,60 ; Σ Réduction))
3. Armure        R2 = max(ceil(R1 × 0,25) ; R1 − Armure)       ← plancher 25 %
4. Bouclier      absorbe R2 d'abord ; reste R3
5. PV            PV −= R3 ; si PV ≤ 0 → vérifier « survie » (Kawarimi, etc.) puis défaite
6. Déclencheurs  contre-attaques, gains de chakra sur dégât subi, épines
7. Soins         appliqués en fin de tick (après les dégâts du même tick)
```

L'**armure ne peut pas rendre invulnérable** : un coup inflige toujours au moins 25 % de ses dégâts après réduction (arrondi supérieur, minimum 1). Exemple : ennemi 8 dégâts, Armure 10 → max(2 ; −2) = **2**.

### B4.5 Soins, boucliers, esquives et effets sur élimination

| Effet | Plafond | Justification |
|---|---|---|
| Soin total hors Régénération | **8 % PV max par seconde** (fenêtre glissante) | Empêche l'immortalité par vol de vie de masse |
| Vol de vie | 1 % des dégâts, **plafond 2 PV/s** | Réservé à quelques objets/techniques |
| Bouclier | ≤ 50 % PV max ; se dissipe de 5 %/s après 5 s sans recharge | Les builds défensifs restent actifs |
| Effets sur élimination | Chaque source : **1 déclenchement max par tick et 10 par seconde** | Évite les avalanches en horde |
| Esquive passive (chance d'annuler un coup) | **N'existe pas** : remplacée par des effets déterministes (Kawarimi, recharge) | Lisibilité |

### B4.7 Chakra (jauge d'ultime)

* **Rôle unique** : remplir la jauge d'ultime (0–100). Aucune technique automatique ne consomme de chakra : **il n'existe aucune période sans attaque**.
* Gains : 1 point par tranche de 150 dégâts infligés (toutes sources, avant résistance), 2 points par 10 % de PV max subis, 3 par élite tuée, 5 par esquive parfaite (max 1/s). Plafond de gain : 12 points/s.
* Distinction visuelle : le chakra est une **jauge circulaire** autour du portrait (bleu-cyan, remplissage en spirale) ; les fragments sont des **cristaux au sol** et une **barre horizontale** en haut d'écran.

### B4.8 Ultime et transformation

* **Ultime** : à 100, déclenchement automatique quand ≥ 6 ennemis sont à ≤ 8 m, ou une élite/boss à ≤ 10 m, ou si les PV < 30 % ; sinon il attend (jauge pleine, contour pulsant). Manuel : à tout moment à 100. Aucun ennemi : l'ultime ne part pas en automatique ; en manuel, il part (effet « à vide » réduit, jauge conservée à 50). Changement de phase de boss (invulnérable) : l'automatique attend la fin de la transition ; un ultime manuel lancé pendant la transition **reporte** ses dégâts à la sortie d'invulnérabilité (pas de gâchis). Événements simultanés (montée de niveau pendant l'ultime) : l'ultime est suspendu avec le reste du gameplay, puis reprend.
* **Transformation** : obtenue en partie ; chaque `TRF` précise durée, recharge (typiquement 60–120 s), déclencheur automatique (PV < 50 %, boss présent, ≥ 40 ennemis à l'écran) et coût. Entrées sans transformation : bonus « Maîtrise de l'ultime » — gain de chakra +30 % et second effet d'ultime (défini dans chaque `ULT`).

### B4.9 Soins et boucliers — ordre

Dans un même tick : dégâts entrants (§B4.4) → bouclier → PV → déclencheurs → soins → nouveaux boucliers. Un soin n'annule jamais une défaite déjà résolue dans le tick, sauf effets « survie » explicitement listés (PAS_039 Kawarimi, TRF_012 Byakugō).

### B4.10 Contrôle sur les boss

Chaque boss possède une **Résistance au contrôle** `Rc` (0 à 80 %). Durée d'un contrôle = durée × (1 − Rc). Chaque contrôle appliqué ajoute 20 points à `Rc` ; `Rc` décroît de 5 points/s. Si le contrôle est entièrement résisté (Rc = 80 % et durée résultante < 0,2 s), il est **converti** : Vulnérable +5 % pendant 2 s (cumulable jusqu'au plafond global de +50 %). Les ralentissements sur boss sont plafonnés à −30 %. Ainsi, un build de contrôle contribue toujours contre un boss isolé.

## B5. Catégories d'attaque

| Catégorie | Ciblage par défaut | Collision | Attribution et limites |
|---|---|---|---|
| `PROJECTILE` | plus proche | Cercle ou capsule ; détruit à la 1re touche sauf `PERCANT` (N touches) ; ignore les obstacles bas, s'arrête sur les hauts | 1 touche par cible par projectile |
| `SALVE` | plus proche / direction | Plusieurs projectiles émis en rafale (intervalle ≥ 0,05 s) ; dispersion angulaire | Chaque projectile compte séparément ; 1 touche/cible/projectile |
| `CONE` | direction ou plus dense | Secteur (angle, portée) évalué 1 fois ou par ticks | Intervalle par cible ≥ 0,25 s |
| `ONDE` | autour du joueur ou direction | Anneau qui s'étend (épaisseur 0,5 m) | 1 touche/cible/onde |
| `CONTACT` | plus proche à portée courte | Hitbox d'attaque (arc) projetée devant une **image de frappe** ; ne déplace pas le joueur | 1 touche/cible/coup ; combos : intervalles ≥ 0,1 s |
| `ORBITE` | aucune | Cercles tournant autour du joueur/unité | Intervalle par cible 0,5 s par élément orbital |
| `ZONE` | plus dense / sous le joueur | Disque ou rectangle persistant | Ticks de 0,5 s ; plafond d'instances par technique (souvent 3) |
| `PIEGE` | positions prévues (chemin des ennemis) | Déclenché par entrée d'ennemi ; armement 0,5 s | Plafond d'instances ; 1 déclenchement sauf mention |
| `RAYON` | direction ou plus menaçant | Segment de largeur fixe, instantané ou maintenu | Maintenu : ticks de 0,2 s ; s'arrête sur obstacles hauts sauf mention |
| `CHAINE` | plus proche puis voisins | Saut instantané vers la cible suivante à ≤ portée de saut | Pas deux fois la même cible dans une chaîne ; dégâts −X % par saut |
| `INVOCATION` | propre à l'unité | Unités logiques non bloquantes | Héritage §R9 ; éliminations attribuées à la technique d'invocation |
| `DIFFERE` | marquée ou position | Télégraphe allié (motif discret) puis impact après délai | Délai non modifié par Cadence ; Zone s'applique |

**Attribution** : toute élimination est attribuée à la technique qui a infligé le coup fatal ; un effet secondaire est attribué à sa technique **source** (ligne « dont effets secondaires » dans les statistiques de fin). Les dégâts d'états (Brûlure, Poison) sont attribués à la technique qui a posé le cumul le plus récent.

### B5.1 Statistiques applicables par catégorie

✔ = s'applique ; — = ne s'applique pas (la carte d'un passif sans effet sur **aucune** technique possédée voit son poids réduit à 0,3, et elle affiche « Aucun effet actuel » si elle apparaît quand même via une fonction de découverte).

| Catégorie | Puiss. | Cadence | Zone | Durée | Quantité | Vit. proj. | Crit |
|---|---|---|---|---|---|---|---|
| PROJECTILE | ✔ | ✔ | ✔ (taille) | — | ✔ | ✔ | ✔ |
| SALVE | ✔ | ✔ | ✔ | — | ✔ (+1 par salve) | ✔ | ✔ |
| CONE | ✔ | ✔ | ✔ (portée et angle ×½) | — | — | — | ✔ |
| ONDE | ✔ | ✔ | ✔ | — | ✔ (ondes successives) | — | ✔ |
| CONTACT | ✔ | ✔ | ✔ (arc) | — | ✔ (coups du combo) | — | ✔ |
| ORBITE | ✔ | ✔ (rotation) | ✔ (rayon d'orbite et taille) | ✔ | ✔ | — | ✔ |
| ZONE | ✔ | ✔ | ✔ | ✔ | ✔ (instances) | — | ✔ |
| PIEGE | ✔ | ✔ | ✔ | ✔ (armement max) | ✔ | — | ✔ |
| RAYON | ✔ | ✔ | ✔ (largeur, longueur) | ✔ (si maintenu) | ✔ (rayons) | — | ✔ |
| CHAINE | ✔ | ✔ | ✔ (portée de saut) | — | ✔ (sauts +1) | ✔ | ✔ |
| INVOCATION | via §R9 | via §R9 | via §R9 | ✔ | ✔ (plafond de l'unité) | — | via §R9 |
| DIFFERE | ✔ | ✔ | ✔ | — | ✔ | — | ✔ |

## B6. Expérience, choix et hasard

### B6.1 Courbe de niveau

XP requise pour passer du niveau L au niveau L+1 :

| Niveaux | Formule | Exemple |
|---|---|---|
| 1–20 | `5 + 6·L` | L1→2 : 11 ; L10→11 : 65 |
| 21–40 | `125 + 13·(L − 20)` | L30→31 : 255 |
| 41+ | `385 + 20·(L − 40)` | L50→51 : 585 |

Cumuls (calculés) : niveau 10 = 380 XP ; 20 = 1 360 ; 30 = 3 325 ; 40 = 6 590 ; 50 = 11 540. **Cibles de test** (joueur moyen, sans méta-progression) : niv. 10 vers 05:00, niv. 20 vers 10:00, niv. 30 vers 15:00, niv. 38–42 à 20:00. Soit ~45 montées de niveau + ~12 ouvertures de coffre pour ~77 améliorations possibles (6 techniques × 7 niveaux + 5 nouvelles + 6 passifs × 5 niveaux) : **le joueur ne peut pas tout maximiser**, les choix comptent.

### B6.2 Fragments et collecte

| Source | XP | Fragment |
|---|---|---|
| Poursuivant | 1 | bleu |
| Chargeur, Tireur | 2 | bleu ×2 fusionnés visuellement en un « bleu+ » |
| Contrôleur, Soigneur, Poseur de pièges | 3 | bleu+ |
| Protecteur, Invocateur | 4 | bleu+ |
| Assassin | 5 | vert |
| Élite | 60 | 2 rouges + 2 verts |
| Lieutenant | 150 | doré + 2 rouges |
| Multiplicateur par tranche de temps | ×1,0 (0–5 min) → ×1,5 (10) → ×2,0 (15) → ×2,5 (20) | appliqué à la valeur |

* **Rayon de collecte** 1,5 m : au-delà, les fragments restent au sol ; en deçà, attraction accélérée (0 → 14 m/s en 0,25 s, courbe ease-in) puis absorption nette (1 frame de flash local, pas de ralentissement).
* **Regroupement technique** : plafond de **300 fragments logiques**. Au-delà, chaque nouveau fragment ajoute sa valeur au **Fragment condensé** (cristal rouge sombre) le plus proche de l'apparition ; les fragments à plus de 30 m du joueur depuis plus de 20 s sont absorbés par le condensé le plus proche. Aucune XP n'est perdue.
* **Sceau d'attraction** (drop rare ~1 / 3 min) : attire tous les fragments en 0,8 s.

### B6.3 Pool de la run

Le catalogue global n'est **pas** le pool. Construction, dans cet ordre :

1. Techniques dont l'accès est satisfait par les aptitudes du personnage (§R5).
2. ∩ techniques débloquées (méta-progression) — la technique de départ et 8 techniques « de base » par personnage sont toujours débloquées.
3. ∩ techniques autorisées par la mission (ex. Défi élémentaire Katon).
4. ∪ bonus de **Doctrine** choisie avant la run (optionnelle, débloquée en maîtrise 2) : ajoute 3 techniques thématiques compatibles ou retire une famille entière.
5. Exclusions dynamiques : emplacement plein, niveau max, bannissement, recette déjà consommée.

**Taille cible** : 24–40 techniques et 30–40 passifs admissibles en début de run. Un pool < 18 techniques déclenche une alerte de validation de contenu (mesure actuelle par `outils/valider.py` : 26 à 147 techniques admissibles selon l'entrée, avant déblocages).

**Échantillonnage du pool (entrées très polyvalentes)** : si plus de 40 techniques restent admissibles après l'étape 5, le pool de la run est réduit à 40, de façon déterministe à partir de la graine de run :
1. on conserve toutes les techniques **exclusives** (accès nominatif `CHR_`, clan, dōjutsu, affinité rare, contrat) et la technique de départ ;
2. on complète par tirage **stratifié** : au moins 3 techniques par élément de base possédé, puis au moins 2 par famille non élémentaire représentée, puis le reste au hasard pondéré ;
3. la Doctrine choisie avant la run est appliquée **avant** l'échantillonnage (elle garantit ses techniques).

Les exceptions de personnage modifient ce plafond : Hiruzen (« Le Professeur ») 44, Kakashi +1 par élément possédé (44 au total). L'écran de sélection affiche « Pool : 40 techniques » et le détail par famille.

### B6.4 Tirage des cartes (sans doublon)

Trois cartes par niveau (quatrième : voir B6.5). Pour chaque carte, **en deux étapes** :

**Étape 1 — catégorie** (probabilités de base) :

| Catégorie | Probabilité | Condition d'existence |
|---|---|---|
| A. Amélioration d'une technique possédée | 40 % | ≥ 1 technique < niv. 8 |
| B. Nouvelle technique | 30 % | emplacement libre et ≥ 1 technique admissible |
| C. Amélioration d'un passif possédé | 15 % | ≥ 1 passif < niv. 5 |
| D. Nouveau passif | 15 % | emplacement libre et ≥ 1 passif admissible |

Une catégorie vide a une probabilité de 0 ; les autres sont **renormalisées proportionnellement** (ex. B et D vides → A = 40/55 = 72,7 %, C = 27,3 %).

**Étape 2 — objet**, tirage pondéré dans la catégorie après exclusions :

| Modificateur de poids (base 100) | Facteur |
|---|---|
| Partage un tag d'affinité ou de livraison avec ≥ 2 techniques possédées (« direction de build ») | ×1,3 |
| Catalyseur d'une évolution dont la technique source est possédée niv. ≥ 5 | ×1,5 |
| Technique signature (catégorie A) | ×1,2 |
| Passif sans effet sur aucune technique possédée | ×0,3 |
| Objet déjà proposé au niveau précédent et refusé | ×0,7 |

Les facteurs se multiplient ; aucun ne garantit une carte. L'objet tiré est retiré pour les cartes suivantes du même niveau (pas de doublon).

**Exemple (carte 1)** — Naruto (CHR_001) niv. 7 ; possède JUT_217 Kage Bunshin niv. 3 (signature, tag `CLONE`), JUT_281 Rasengan niv. 2, JUT_185 Kunai en éventail niv. 1, PAS_001 niv. 1 ; 3 emplacements de technique et 5 de passif libres ; 20 nouvelles techniques et 28 nouveaux passifs admissibles.

| Objet | Catégorie | Poids | Probabilité de la catégorie | Probabilité finale |
|---|---|---|---|---|
| Kage Bunshin (signature ×1,2) | A | 120 | 40 % × 120/320 | 15,00 % |
| Rasengan | A | 100 | 40 % × 100/320 | 12,50 % |
| Kunai en éventail | A | 100 | 40 % × 100/320 | 12,50 % |
| 20 nouvelles techniques | B | poids individuels (somme normalisée) | 30 % | 30,00 % |
| PAS_001 | C | 100 | 15 % × 100/100 | 15,00 % |
| 28 nouveaux passifs | D | poids individuels | 15 % | 15,00 % |
| **Total** | | | | **100,00 %** |

Aucune des trois techniques possédées ne partage de tag de livraison ou d'affinité avec deux autres : le facteur « direction de build » ne s'applique pas. Pour la **carte 2**, l'objet tiré en carte 1 est retiré et les probabilités sont recalculées (ex. si Kage Bunshin est sorti : A = Rasengan 20 % + Kunai 20 %, le reste inchangé, total 100 %).

### B6.5 Quatrième option (déblocage limité)

Débloquée en méta (« Voie du quatrième sceau », 1 500 Ryō). Aux niveaux multiples de 5, une quatrième carte apparaît, tirée **uniquement** dans la catégorie A ou C (améliorer ce que l'on possède). Elle ne peut jamais être une nouvelle technique.

### B6.6 Filet de pertinence (anti-série)

* Une carte est **pertinente** si elle améliore une technique ou un passif possédé, ou si c'est un catalyseur d'une technique possédée.
* Compteur `S` = nombre de montées consécutives **sans aucune carte pertinente proposée**.
* Si `S ≥ 2`, la carte 1 du niveau suivant est tirée dans A ∪ C ∪ {catalyseurs}. `S` revient à 0.
* Ce filet ne force **jamais** la carte optimale : la direction est favorisée, pas garantie.

### B6.7 Relance, Bannissement, Passage

| Commande | Acquisition | Effet | Portée | Limites | Sans proposition admissible |
|---|---|---|---|---|---|
| **Relance** | Méta : 0 → 3 par run (500 / 1 000 / 1 500 Ryō) ; +1 par coffre de lieutenant | Retire les 3 cartes et en tire 3 nouvelles (les anciennes restent éligibles au niveau suivant) | Écran de niveau | Max 5 en réserve | Grisée si le pool admissible < 4 |
| **Bannissement** | Méta : 0 → 3 ; +1 par secret de carte trouvé | Retire l'objet d'une carte **du pool pour toute la run** et remplace la carte | Écran de niveau | Max 5 ; signature et catalyseurs d'une évolution en cours non bannissables | Grisé si le remplacement est impossible |
| **Passage** | Méta : 0 → 3 | Ignore le niveau ; gain de 15 chakra | Écran de niveau | Max 5 | Toujours disponible |

Quand il ne reste **aucune** carte admissible : trois cartes de secours — « Ration de soldat » (+30 PV), « Bourse » (+30 Ryō), « Concentration » (+25 chakra).

### B6.8 Récompenses de combat

| Récompense | Source | Contenu | Interface | Animation |
|---|---|---|---|---|
| **Coffre simple** | Élite | 1 amélioration pertinente **ou** 1 évolution admissible (prioritaire) | Coffre au sol → écran compact | 1,2 s / 0,4 s rapide / désactivable |
| **Coffre de lieutenant** | Lieutenant 09:30, boss d'Endless | 1 (70 %) ou 3 (30 %) éléments ; +1 Relance | Idem, cartes révélées en éventail | 1,8 s / 0,6 s |
| **Rouleau** | Point d'intérêt de carte (2–3 par run) | **Choix** de 1 équipement parmi 3 (ordinaire 72 %, rare 28 % ; Chance modifie jusqu'à 55/45) | Écran de choix | 0,6 s |
| **Rouleau interdit** | Événement ≥ 12:00 (1 par run max) | Choix entre transformation admissible et objet interdit ; **coût affiché avant** | Écran de choix avec coût en rouge | 1,0 s |

Un coffre **ne donne jamais** de nouvelle technique ; un rouleau ne donne jamais d'amélioration. Garantie : si une évolution est admissible depuis 90 s sans coffre, l'élite suivante apparaît dans les 20 s.

## B7. Évolutions, fusions, éveils

### B7.1 Trois systèmes distincts

| Système | Entrées | Sortie | Consommation | Mot dans l'interface |
|---|---|---|---|---|
| **Évolution** | 1 technique niv. 8 + catalyseur | La technique est **remplacée** par sa forme évoluée | Catalyseur **conservé** | « Évolution » (icône rouleau qui s'ouvre) |
| **Fusion** | 2 techniques niv. 8 (+ catalyseur éventuel) | 1 nouvelle technique | Les 2 techniques ; **1 emplacement libéré** | « Fusion » (deux icônes qui se rejoignent) |
| **Éveil** | 1 évolution + condition tardive | La forme évoluée est remplacée | Aucune | « Éveil » (icône à contour noir-or) |
| *Synergie* (§B8) | Objets indépendants | Effet supplémentaire | Aucune | « Synergie » (lien entre deux icônes) |

### B7.2 Conditions

Une recette (`EVO`) déclare : `sources`, `catalyseurs`, `acces` (compatibilité), `niveau_requis` (8 par défaut), `temps_min` (éveils ≥ 15:00), `cartes_exclues`. Validation par pseudocode au §G7.3.

### B7.3 Recalcul (pas de double comptage)

* La forme évoluée possède **sa propre table de valeurs** ; les niveaux 1–8 de la source ne s'additionnent pas.
* Les statistiques globales (passifs, équipements) continuent de s'appliquer normalement.
* Les bonus **ciblés sur la source** (ex. équipement « +1 projectile au Kunai ») sont transférés si l'évolution conserve la catégorie de livraison concernée ; sinon ils sont convertis en +10 % de Puissance pour la forme évoluée (affiché).
* **Non-régression** (test automatique) : DPS théorique de la forme évoluée ≥ 125 % du DPS de la source niv. 8 sur cible unique **et** couverture (surface × fréquence) ≥ 100 %.

### B7.4 Équilibrage des fusions

La fusion libère un emplacement : c'est sa récompense principale. En contrepartie : (1) deux techniques niv. 8 = 14 améliorations investies, donc fusion rarement avant 13:00 ; (2) puissance cible de la sortie **100–115 %** de la somme des deux sources niv. 8 (pas davantage) ; (3) la technique fusionnée est non améliorable ; (4) l'emplacement libéré ne peut recevoir qu'une technique de niveau 1, qui arrive tard. Test : la fusion ne doit pas augmenter le DPS total de plus de 35 % dans les 3 minutes qui suivent (mesure en scène de référence).

### B7.5 Signal d'admissibilité

* Recette **connue** (déjà réalisée ou lue en Archives) : lien lumineux entre icônes dans l'écran de build ; la technique scintille au HUD.
* Recette **inconnue** : silhouette et indice (« Un Rasengan porté par le vent… ») si le joueur possède au moins une des sources.

## B8. Synergies et chaînes de déclenchement

### B8.1 Principe

Une synergie (`SYN`) ne remplace rien. Elle déclare : `sources` (tags, états, IDs), `declenchement`, `formule`, `limite` (délai interne par propriétaire), `plafond`, `compatibilite`, `contrepartie`, `manifestation`. Catalogue complet en E.

### B8.2 Règles de limite

1. **Profondeur** : coup primaire = 0 ; effet secondaire = 1 ; secondaire de secondaire = 2. **Un effet de profondeur 2 ne déclenche rien.**
2. **Anti-auto-déclenchement** : un effet porte l'identifiant de la synergie qui l'a produit ; il ne peut pas redéclencher cette même synergie.
3. **Délai interne (ICD)** par synergie et par propriétaire (0,3 à 2 s).
4. **Budget par tick** : 200 événements secondaires ; au-delà, les suivants sont reportés au tick suivant (3 ticks max) puis abandonnés. C'est une **règle de jeu constante**, identique sur toutes les machines.
5. **Clones** : un clone applique les états élémentaires de sa propre attaque ; il **ne déclenche pas** les synergies basées sur des passifs du propriétaire, sauf celles dont la source contient explicitement le tag `CLONE` (ex. SYN_041 « Attaque coordonnée »).
6. **Éliminations** : attribuées à la technique source (§B5).

### B8.3 Interactions de terrain

La carte possède une grille de surfaces de 1 m. Une cellule porte au plus une surface. Surfaces : `HUILE`, `EAU`, `SABLE`, `OMBRE`, `BOIS`, `GLACE`, `CENDRE`, `PAPIER`, `LAVE`. Durée de vie par défaut 6 s (plafond 400 cellules actives par surface ; les plus anciennes disparaissent en premier).

| Paire | Résultat (règle) | Synergie |
|---|---|---|
| Huile + feu | Embrasement : la cellule devient flamme 3 s (8 dégâts/0,5 s), Brûlure +2 cumuls | SYN_003 |
| Eau + foudre | La cellule transmet l'Électrisé à tous les ennemis dans la flaque (1 fois/s) | SYN_002 |
| Vent + flammes | Les zones Katon touchées par Fūton : rayon +30 %, durée +1 s, une fois par instance | SYN_004 |
| Sable + contrôle | Ensablé ×2 cumuls sur les cibles déjà contrôlées | SYN_012 |
| Ombre + immobilisation | Les techniques d'ombre se propagent gratuitement vers les cibles immobilisées à ≤ 3 m | SYN_015 |
| Sceaux + pièges | Les pièges posés sur une cible Marquée s'arment instantanément et touchent 2 fois | SYN_018 |
| Poison + marionnettes | Les marionnettes appliquent +1 cumul de Poison et +20 % dégâts aux Empoisonnés | SYN_021 |
| Clones + attaques coordonnées | Voir SYN_041 | SYN_041 |
| Eau + feu | Vapeur : cellule d'eau touchée par Katon → nuage 2 s, ennemis Vapeur (−20 % dégâts infligés). **Le feu n'est pas éteint.** | SYN_005 |

### B8.4 Anti-synergies

**Règle** : aucun effet allié n'annule silencieusement un autre effet allié. Les interactions négatives existantes sont **intentionnelles, documentées et signalées** :

| Interaction | Effet négatif | Contrepartie | Signal |
|---|---|---|---|
| Hyōton sur surface EAU | Devient GLACE : les ennemis y glissent (+20 % vitesse) | Refroidi +1 cumul par seconde passée dessus | Icône de glissade sur la carte d'un passif Hyōton si le joueur possède une technique Suiton |
| Katon sur surface BOIS (Mokuton) | Les murs de bois brûlent (perte de protection) | Grand embrasement : 30 dégâts/0,5 s pendant 3 s | Info-bulle « Brûle le bois » sur les cartes concernées |
| Fūton repoussant sur ennemis dans une ZONE alliée | Recul réduit de 70 % pour les ennemis dans une zone alliée persistante | Évite de vider ses propres zones | Pictogramme d'ancre dans la zone |
| Genjutsu Confus + Attraction | Les confus ignorent l'attraction | Les confus attaquent les attirés | Aucun (neutre) |

## B9. Ultimes, transformations et invocations géantes

### B9.1 Ultimes

Chaque `ULT` précise : coût (100 chakra), déclenchement automatique, effet, durée, comportement à vide, second effet (« Maîtrise de l'ultime » pour les entrées sans transformation). Pendant un ultime, le joueur reste contrôlable et **vulnérable** sauf mention (invulnérabilité ≤ 1,0 s si l'animation de lancement dépasse 0,4 s).

### B9.2 Transformations

Chaque `TRF` précise : accès (aptitude + mode d'obtention), durée, recharge, coût, statistiques, nouveaux comportements, limites, conséquences à la fin, et changements de **silhouette, aura, son et règle de combat** (les quatre sont obligatoires). Les transformations à coût (PV, PV max, ralentissement) affichent le coût sur la carte du Rouleau interdit et au déclenchement (jauge de coût rouge sous le portrait).

**Règle de sacrifice** : aucune transformation ni capacité sacrificielle ne peut tuer le joueur. Les coûts en PV s'arrêtent à 1 PV. À la fin, état **Épuisé** (déplacement −30 %, 3 s) précédé de 1,0 s d'invulnérabilité ; si les PV sont à 1, l'écran affiche « Épuisé — 1 PV » en lettres lisibles.

### B9.3 Transformation + ultime + événement simultanés

Priorité de résolution dans un tick : (1) pause/menus, (2) transitions de boss, (3) ultime, (4) transformation, (5) techniques. Un ultime ne se déclenche pas dans la même seconde qu'une activation de transformation (report de 1 s) pour que les deux signaux restent lisibles.

### B9.4 Invocations géantes

* **Simultanéité** : 1 invocation géante active au maximum (joueur). Une seconde demande est **mise en file** et part à la fin de la première.
* **Zone de présence** : l'invocation apparaît à 6 m du joueur, du côté le moins dense, et reste ancrée (elle ne suit pas le joueur au-delà de 12 m ; au-delà elle se téléporte en fumée).
* **Caméra** : pas de zoom (résolution entière). Décalage de caméra de 2 m vers l'invocation pendant l'apparition (0,5 s), retour progressif.
* **Transparence** : corps à 100 % hors conflit ; **55 %** d'opacité lorsqu'un projectile hostile, un télégraphe ou le joueur se trouve derrière ; télégraphes ennemis dessinés **au-dessus** de l'invocation.
* **Durée** : 8–12 s selon la technique ; attaques principales télégraphiées en couleur alliée.
* **Collision** : aucune collision avec le joueur ; les ennemis ordinaires contournent les pieds (hitbox de pieds uniquement, cercles de 1,5 m).
