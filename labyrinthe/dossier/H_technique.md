# H — Architecture technique, données, pseudocode, tests, performances, sauvegarde, production

> Section H du dossier. Tout ce qui est décrit ici existe dans `labyrinthe/` ; les mesures ont été prises sur ce code (Chromium sans écran, machine de développement, valeurs indicatives). Les résultats de tests cités sont ceux de la dernière exécution complète de `outils/tests_jeu.mjs`.

## Sommaire

1. [Architecture](#h1-architecture)
2. [Schémas de données](#h2-schémas-de-données)
3. [Vocabulaire d'événements](#h3-vocabulaire-dévénements)
4. [Huit pseudocodes](#h4-huit-pseudocodes)
5. [Tests automatisés et recette](#h5-tests-automatisés-et-recette)
6. [Performances](#h6-performances)
7. [Sauvegardes](#h7-sauvegardes)
8. [Plan de production](#h8-plan-de-production)

---

## H1. Architecture

**Livraison.** Un seul fichier autonome, `jeu/index.html` (≈ 815 Kio), qui s'ouvre hors ligne dans un navigateur : aucune dépendance, aucun serveur, aucune ressource externe. Il est assemblé par `outils/construire.mjs` à partir des 44 modules de `jeu/src/`, concaténés dans l'ordre de leurs préfixes, enveloppés dans une fonction en mode strict, puis vérifiés syntaxiquement avant écriture.

**Couches** (un module ne dépend que des couches précédentes, sauf la boucle de jeu qui les orchestre) :

| Couche | Modules | Rôle |
|---|---|---|
| Noyau | `00_noyau` | constantes (tuile 32 px, salle 13×7, 60 Hz), utilitaires, hasard (sfc32 + cyrb128), codes de mission, index des données |
| Données | `10`–`19` | données **déclaratives** : personnages, objets, actifs, poche, ennemis, boss, salles, étages, progression ; validées hors navigateur par `outils/catalogues.mjs` |
| Présentation de base | `20`–`29` | police bitmap, entrées (manette, clavier), audio synthétisé, outils pixel, sprites, dessin, effets |
| Simulation | `30`–`38` | salle et collisions, génération d'étage, santé, pipeline de tir, ennemis, joueur, objets et profil, monde (étages, salles, portes, ramassables) |
| Systèmes | `39`–`44` | salles spéciales et économie, actifs, familiers, événements, boss et mécaniques signatures, variantes d'étage |
| Interface | `45`–`49` | rendu, lumière et ambiance, HUD, décor des menus, menus, sauvegardes, progression durable |
| Jeu | `50_jeu`, `99_demarrage` | état global `G`, pas de simulation, scènes de jeu, boucle, interface de test |

**Boucle.** `requestAnimationFrame` alimente un accumulateur ; la simulation avance par **pas fixes de 1/60 s** (5 pas au plus par image, l'excédent est abandonné), indépendamment de la fréquence d'affichage. Le rendu se fait sur un écran interne de 640×360 présenté à l'échelle entière (×2, ×3…) sans lissage. Les scènes forment une pile (`aller`, `empiler`, `dépiler`) ; tout changement de scène **consomme** les entrées maintenues, qui doivent être relâchées avant d'agir à nouveau (pas de tir involontaire en fermant un menu).

**Ordre d'un pas de jeu** (`majJeu`) : bannières → fondu → transition de porte → mort → pause → intro de boss → animation d'objet → temps et invulnérabilité → actions (explosif, actif, poche, échange, dépôt) → bonus → déplacement → tir → familiers → ennemis → projectiles, faisceaux, mêlées, bombes, arcs, attraction, minuteries → effets, ramassables, piédestaux, dispositifs, autel, source, sorties → dangers de terrain, blocs à clé, portes, secours, nettoyage, secousse → variantes, bande de sable → notifications.

**Hasard.** Chaque partie a un code de 8 signes (alphabet sans I, O, 0, 1). Les flux sont dérivés par étage : `fluxEtage(code, n, nom)` pour le thème, le butin, les récompenses, les ennemis et le combat ; les tirages sensibles ont leur propre graine (opportunité après le boss : `code|opportunite|étage` ; autel : `code|autel|étage|palier`), si bien que recharger ne permet pas de retenter. Les variations fines de combat (décalage d'un anneau, points d'une pluie) et le cosmétique utilisent un hasard non graine : une mission à code reproduit la structure et les offres, pas chaque projectile.

**Interface de test.** `window.LDS` expose l'état et quelques fonctions au banc de test Playwright ; le jeu ne dépend jamais de ce banc.

## H2. Schémas de données

Les objets de données sont de simples littéraux ; les champs facultatifs sont en italique. Les identifiants sont stables (A, registre).

| Type | Champs |
|---|---|
| Personnage (CHR, ALT) | `id, nom, cle` (visuel), *`parent`*, `sante {vitalite, protection, instable}`, `ressources {ryo, cles, explosifs}`, `stats {degats, cadence, portee, vitesseTir, vitesse, chance}`, `tir {apparence, forme, multi, source, differe}`, *`actif`*, `passifs[]`, *`familiersDepart[]`*, `regle, regleCode, faiblesse, difficulte (1–3)`, *`expert`*, *`deblocage {objectif}`*, `identite, builds[3], statut` |
| Objet passif (PSV) | `id, nom, famille, qualite (0–4)`, `pools` (code : lettre de pool + poids, ex. « H2 S1 »), `desc, effets[]` (langage ci-dessous), `cumul` (cumul, conversion, unique), *`ensemble`*, *`exclusion[]`*, *`contrepartie`*, *`cle`* (objet-clé), `statut, icone` |
| Actif (ACT) | comme un passif, plus `charges` ou `recharge` (s) ou `unique`, `effet` (nom de comportement), `params` |
| Talisman, consommable, pilule | `id, nom, desc, effets[]` ; consommable : `famille, poids` ; pilule : `negatif, contraire` |
| Familier (FAM) | `id, nom, comportement` (16 comportements), `degats` ou `coef`, cadence, portée, drapeaux (`bloque, reflet, marionnette`) |
| Synergie (SYN) | `id, nom, composants[]` (identifiants existants), `type` (émergente, dédiée), `desc`, *`effets[]`*, `test` (critère d'acceptation) |
| Transformation (TRF) | `id, nom, ensemble, seuil` (3 identifiants distincts acquis), `desc, effets[]` |
| Ennemi (ENM) | `id, nom, role` (lettre de gabarit), `comportement, pv, vitesse, r, sprite, params`, `contact`, *`mort`* (division, salve8, explose, flaque, glace), *`fixe`*, `desc` |
| Boss (BOS) | `id, nom, titre, etage, pv, r, hauteur, vitesse, deplacement, ia`, *`init`*, `attaques[{id, type, tele, duree, recup, …, phase, recharge, maxUsages}]`, `phases[{seuil, message, action, invulnerable}]`, `sprite`, *`echelleSprite, mini, terminal`* |
| Salle (ROM) | `id, nom, type, forme` (1×1, 2×1, 1×2, 2×2, L1–L4), `grille` (13×7 par cellule, légende en F bis), *`portes[]`*, *`etages[]`*, *`poids`* |
| Thème (THM) / variante (FLR) | thème : `visuel {sol, mur, rocher, fosse, deco, lumiere}`, `musique {gamme, racine, tempo, timbre}`, `roles {lettre → ennemis}` ; variante : `theme, nom, mod {règle: probabilité}, desc` |
| Route (RTE) | `bifurcation, prerequis, boss, etages, recompense, marque, indice` |
| Objectif (OBJ) / défi (DEF) / secret (SEC) | objectif : `condition {type: boss, compteur, etat, fin}`, `recompense {debloque[]}` ; défi : règles (`perso, sansHeritage, obscurite, bonus, chrono, etageCible, objetsMin, difficile, epreuves`…), `recompenseTexte` ; secret : `indice, solution` |

**Langage d'effets** (objets, talismans, synergies, transformations) : `{s, a|p|m}` statistique (additif, pourcentage, multiplicatif) ; `{forme}` forme de tir et paramètres ; `{multi}`, `{salve}`, `{arriere}`, `{croix}` ; `{traj, force}` trajectoire ; `{impact, r, coef}` réaction à l'impact (budget) ; `{statut, chance, duree, max, chanceParChance}` ; `{sante: {cont, prot, instable, os, partiel, soin, soinTotal, retraitCont}}` ; `{res}` ressources ; `{familier}` ; `{drapeau}` règle spéciale ; `{quand, si, chance, faire: {type, …}}` déclencheur d'événement. Le validateur refuse une statistique inconnue, un familier inconnu, un événement jamais émis ou une action non implémentée.

## H3. Vocabulaire d'événements

Les événements de gameplay passent par `evenement(nom, données)` : la progression les observe, puis chaque objet, talisman, transformation ou synergie possédé qui déclare `quand: nom` réagit. Les événements cosmétiques (particules, sons) ne déclenchent jamais d'effet de jeu.

| Événement | Émis quand | Abonnés dans les données |
|---|---|---|
| `entree_salle` | entrée dans une salle | 3 (ex. Silence de la brume) |
| `salle_nettoyee` | dernière menace vaincue | 5 (ex. Sceau de régénération) |
| `emission_primaire` | un cycle d'attaque part | 2 |
| `impact` | un tir touche | 1 |
| `elimination` | un ennemi meurt (4 sources) | 6 (ex. Encre vivante, Ruche) |
| `degat_recu` | le joueur perd de la santé | 11 (ex. Marque de Jashin, Mue du serpent) |
| `cout_paye` | prix payé en santé (pacte, don) | 1 |
| `sacrifice` | tribut à l'autel | 1 (Rituel du sang) |
| `objet_acquis`, `objet_retire` | inventaire | progression |
| `transformation` | seuil d'ensemble atteint | progression |
| `ryo_ramasse`, `achat` | économie | 1 (Tampon du marchand) |
| `etage` | nouvel étage | 3 (ex. Sceau vital de la famille) |
| `explosion`, `explosif_pose` | explosifs | progression |
| `actif_utilise`, `consommable_utilise` | actions | progression |
| `substitution`, `soin_excedentaire` | règles de personnage | progression |
| `secret_trouve`, `boss_vaincu` | exploration | 1 (Cœur du réceptacle) |

## H4. Huit pseudocodes

**1. Statistiques** (`calculerStats`, indépendant de l'ordre d'acquisition — test [economie])

```
pour chaque statistique k :
  A ← somme des ajouts a ; P ← somme des pourcentages p ; M ← produit des multiplicateurs m
  valeur ← (base_k + A) × (1 + P / 100) × M
  puis bonus d'état (Obstination, Charme du plein, énergie naturelle) et bornes du registre
```

**2. Profil d'attaque** (`calculerProfil`)

```
formes ← {forme du personnage} ∪ formes des effets possédés
principale ← première forme de PRIORITÉ présente
  (Rock Lee : première parmi lame longue, lame — table de conversion)
pour chaque autre forme f : appliquer sa contribution (§R17b)
  orbe/charge → tir chargeable ; rayon → perçant, ×1,3 ; laser → trait d'appoint ×0,5
  faisceau → impacts prolongés ; boomerang → retour ; lame → coup d'appoint
  bombe → explosion d'impact ×0,5 ; frappe → frappe au sol 1 cycle sur 3
  contrôle → sphère d'appoint ×0,5 ; rotation → déviation des tirs proches
multi ← min(8, 1 + Σ multi) ; coefMulti ← coefficient global selon multi
```

**3. Cycle d'attaque** (`cycleAttaque`, `emettre`)

```
si visée tenue et délai écoulé :
  budget ← 14 réactivations pour tout le cycle ; cycle ← nouvel identifiant
  pour chaque géométrie (multi, éventail, arrière, croix) : émettre selon la forme principale
  salves en file (0,07 s) ; contributions d'appoint (laser, coup, frappe)
à l'impact : effets d'impact tant que génération < GEN_MAX[impact] et budget > 0
```

**4. Santé : pertes et prix** (`blesserJoueur`, `payerSante`, `sacrifier`)

```
dommage : protections acquises (bouclier de sable, substitution, omamori, clone)
  sinon perte en demis : protections d'abord, puis vitalité ; invulnérabilité 1 s
  si vitalité perdue : l'étage perd le bonus « vitalité intacte » ; dans la salle du boss : « aucun coup »
prix (pacte, don, passage maudit) : même perte, sans aucun déclencheur de dommage
sacrifice (autel) : même perte, événement « sacrifice »
santé nulle → résurrections dans l'ordre (cœur de réserve, cœur volé) → mort
```

**5. Tirage d'objet** (`tirerObjet`)

```
candidats ← objets du pool, débloqués, non retirés de la partie, non exclus pour ce personnage,
             de qualité ≥ qualité minimale demandée (relance protégée par le Sceau de réécriture)
poids ← poids de l'objet dans ce pool
tirage pondéré dans le flux de butin de l'étage
l'objet est retiré de tous les pools pour le reste de la partie (épuisement)
pool épuisé → repli sur le pool d'héritage, puis Bol de ramen (PSV_083)
```

**6. Cycle d'un boss** (`IA_BOSS.generique`, `choisirAttaque`)

```
choix : attaques disponibles = phase atteinte ∧ pas la précédente
        ∧ recharge écoulée ∧ usages < maxUsages ; tirage pondéré
télégraphe (tele / accélération) → phase active (durée) → récupération (vulnérable) → pause
à chaque dégât : pour chaque seuil franchi, message + action de phase (+ invulnérabilité courte)
```

**7. Secours des ennemis inaccessibles** (`secoursEnnemisInaccessibles`)

```
chaque seconde : cases accessibles à pied depuis le joueur
pour chaque ennemi au sol (ni volant, ni caché, ni boss) sans case accessible autour de lui :
  compteur + 1 ; au 8e contrôle consécutif, le déplacer sur la case accessible la plus proche de lui
  et à plus de 2,5 tuiles du joueur, avec un effet visible
  (garantit qu'aucune salle ne reste bloquée par un gabarit ou une variante)
```

**8. Sauvegarde atomique** (`Stockage.ecrire`, `lire`, `effacer`)

```
écrire(clé, objet) : texte ← JSON ; clé_tmp ← texte ; clé_bak ← ancienne valeur ; clé ← texte ; supprimer clé_tmp
lire(clé) : essayer clé, puis clé_tmp, puis clé_bak (texte corrompu → valeur suivante)
effacer(clé) : supprimer clé, clé_tmp et clé_bak (une partie perdue ne revient jamais)
```

La génération d'étage (graphe de salles sur grille 13×13, grandes salles, spéciales, secrets, 60 essais puis plan de secours) est détaillée en B §7.

## H5. Tests automatisés et recette

**Banc** : `node labyrinthe/outils/tests_jeu.mjs [sections…]` (Playwright + Chromium, sans écran). Chaque section s'exécute dans la vraie page du jeu ; toute erreur de page fait échouer le banc. Codes de mission fixes et valides (une graine aléatoire rendait certains tests instables).

| Section | Ce qui est vérifié | Dernier résultat |
|---|---|---|
| generation | 400 étages : boss présent, salles reliées, route du boss sans clé, portes secrètes réciproques, devants de porte libres | 0 erreur, 1,2 essai en moyenne, 0 plan de secours |
| parcours ×3 | Naruto, Rock Lee, Sasuke jouent 9 étages : chaque salle nettoyée, objets pris, boss vaincus, sortie empruntée | 0 erreur |
| objets | chacun des 157 passifs : acquisition, 6 s de combat, dégâts infligés | 157 ; seul PSV_014 (rayon à charger) sans dégât dans la fenêtre |
| actifs | 33 actifs utilisés en salle | 33 |
| boss | 24 boss vaincus par le pilote renforcé en moins de 150 s | 24, de 8 à 98 s |
| ennemis | 75 archétypes, 12 s de combat | 0 erreur ; 4 à 6 embusqués ou invocateurs parfois non vaincus dans la fenêtre |
| personnages | 18 entrées jouables ; conversion de Rock Lee ; sphère d'appoint | 18 |
| sauvegarde | reprise d'une partie suspendue, taille, effacement sans résurrection | ≈ 14 Kio |
| manette | démarrage à la manette, pause, retour, tir au stick, hystérésis, consommation, déconnexion | 0 erreur |
| economie | ordre des stats, ordre des pertes, prix ≠ dommage, soldes, coupon, contrats, contreparties sans contenant, offrande | 21 vérifications |
| secours | ennemi sur une île : déplacé après 8 s, une seule fois | 0 erreur |
| visibilite | chacun des 99 ennemis et boss dessine des pixels | 99 |
| mecaniques | bande de sable de Gaara, Susanoo, cristaux, zones télégraphiées | 0 erreur |
| pactes | 8 scénarios chiffrés (E §6), événements comptés, refus, tirage figé | 0 erreur |
| defis | règles et conditions de réussite des contrats | 10 vérifications |

**Validation des données** : `node labyrinthe/outils/catalogues.mjs --verifier` (identifiants, références, pools, effets implémentés, fiches de boss complètes, navigabilité des 66 gabarits) : 0 erreur, 3 avertissements (objets-clés et actif de variante hors pools, attendu).

**Ce que les tests ne prouvent pas.** Le pilote est invulnérable : il prouve qu'un combat se termine, pas qu'un humain esquive tout. La manette est simulée par l'API Gamepad du navigateur, pas testée sur matériel. L'équilibrage n'a été réglé qu'avec le pilote. Recette manuelle à faire : H §8, jalon « recette ».

## H6. Performances

| Mesure | Valeur | Conditions |
|---|---|---|
| Simulation d'un pas | ≈ 0,06 ms | combat contre les Dix Queues, 12 objets de tir multiple, 5 familiers, 900 pas |
| Rendu d'une image | ≈ 2,4 ms en moyenne avec l'éclairage dynamique (≈ 1,5 ms sans) ; 99e centile ≈ 21 ms (≈ 14 ms sans) ; pire ≈ 23 ms | même scène, écran interne 640×360, rendu **logiciel** de Chromium sans écran (un navigateur accéléré par la carte graphique fait mieux) |
| Génération d'un étage | ≈ 0,75 ms | 400 étages en 0,3 s |
| Fichier du jeu | ≈ 815 Kio | un seul HTML, sans ressource externe |
| Partie suspendue | ≈ 14 Kio | étage et joueur sérialisés |

**Garde-fous** : particules plafonnées (260, 120 en mode confort) ; budget de 14 réactivations par cycle de tir et générations d'impact bornées (`GEN_MAX`) ; multitir plafonné à 8 ; caches de sprites (par objet sprite et échelle), de silhouettes, de disques, ellipses et anneaux ; fond de salle mis en cache et redessiné seulement quand sa version change ; pas de simulation borné à 5 par image. Éclairage : part fixe de la carte de lumière (pénombre, cellules, sources immobiles) en cache par salle, carte à demi-résolution, multiplication limitée à la salle visible et agrandie au plus proche voisin, halos pré-dimensionnés par paliers (réduire un grand halo avec lissage coûte cher en rendu logiciel), décor des menus pré-rendu une fois ; l'option *Éclairage dynamique* le coupe entièrement. Les pics du 99e centile viennent surtout de la création paresseuse des sprites au premier affichage.

## H7. Sauvegardes

Trois stockages indépendants (`localStorage`) : **réglages** (`lds_reglages`), **profil de progression** (`lds_profil` : objectifs, marques, découvertes, compteurs, offrandes, meilleurs parcours) et **partie suspendue** (`lds_partie`). Écriture atomique avec copie de secours (H4 §8). La partie suspendue contient : version de sauvegarde, version des données et du jeu, partie (code, étage, route, chronomètre, pactes achetés et refusés…), étage complet (plan, salles et leur état, opportunité, drapeaux d'étage), joueur (santé, ressources, inventaire, actifs et charges, familiers permanents) et états des flux de hasard. Les champs préfixés `_` (caches, bande de sable) ne sont jamais écrits ; une phase de boss se rejoue au retour. Une partie finie (mort, abandon, victoire) efface la sauvegarde **et sa copie de secours**. Une sauvegarde ancienne est migrée (v1 → v3 : santé en tableau, poches multiples) ; une reprise qui échoue efface la partie suspendue plutôt que de charger un état incohérent.

## H8. Plan de production

| Jalon | Contenu | État |
|---|---|---|
| Prototype | déplacement, tir cardinal, une salle, un boss, manette | fait |
| Tranche verticale | 6 étages, 3 personnages, pools, boutique, pacte, sanctuaire, sauvegarde | fait |
| Version 1.0 de travail | 9 étages et 6 routes, 18 entrées jouables, 158 passifs, 33 actifs, 24 boss, 75 ennemis, 10 thèmes, 66 salles, défis, secrets, registre, dossier A à I | fait sauf 66 salles sur 120, 60 objectifs sur 80, 12 défis sur 30 (I) |
| Recette | 20 heures de jeu humain à la manette sur 3 manettes (Xbox, DualSense, générique), réglage des boss les plus longs, vérification des télégraphes à vitesse minimale, lecture daltonisme et mode confort | à faire |
| Extension | 22 personnages et 34 variantes de plus, bibliothèque complète (600 collectibles, 500 salles, 70 boss…), remontée secrète, Marché des mercenaires | à faire (I) |
| Diffusion | vérification des droits d'exploitation de la licence | **préalable non levé** |

**Critères d'acceptation de chaque jalon** : banc de tests vert (toutes sections), validateur sans erreur, aucune erreur de page, dossier régénéré (F, E bis), et pour la recette : aucune mort jugée injuste sur un échantillon de parties, aucun écran inaccessible à la manette.
