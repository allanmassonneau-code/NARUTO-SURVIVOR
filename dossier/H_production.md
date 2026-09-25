# H. Production et validation

Toutes les durées et charges sont des **estimations de préproduction à affiner** après le prototype ; aucun test de jeu n'a été réalisé.

## H1. Quatre périmètres

| Périmètre | Contenu | Objectif | Sortie |
|---|---|---|---|
| **Prototype technique** | Naruto (JUT_217, JUT_281, JUT_185), Zabuza (BOS_001), carte grise, 5 ennemis ordinaires, placeholders marqués « PH » | Déplacement, ciblage, dégâts, montée de niveau, performance | Critères §H2 (sprint 1–3) |
| **Tranche verticale** | Naruto, Sasuke, Gaara ; 12 techniques ; 6 passifs ; 4 évolutions ; MAP_002 ; Haku et Zabuza ; 10 min d'expédition soignée | Qualité finale : impacts, montée en puissance, lisibilité de fin de partie | Test des 3 s ≥ 80 % ; 90 % des morts comprises |
| **Version 1.0** | Évaluée au §H4 | Jeu premium complet hors ligne | — |
| **Bibliothèque complète** | Catalogue de ce dossier | Extensions | Validation `outils/valider.py` (0 erreur) |

**Contenu exact de la tranche verticale** :

| Catégorie | Identifiants |
|---|---|
| Personnages | CHR_001 Naruto, CHR_004 Sasuke, CHR_012 Gaara |
| Techniques (12) | JUT_217, JUT_218, JUT_281, JUT_185 (Naruto/commune) ; JUT_001, JUT_049, JUT_059, JUT_002 (Sasuke) ; JUT_131, JUT_134, JUT_135, JUT_087 (Gaara) |
| Passifs (6) | PAS_001, PAS_002, PAS_030, PAS_060, PAS_023, PAS_051 |
| Évolutions (4) | EVO_069 (Kage Bunshin), EVO_018 (Chidori), EVO_045 (Suna no Tate), EVO_084 (Ōdama Rasengan) |
| Équipements (4) | EQP_004, EQP_019, EQP_003, EQP_006 |
| Ennemis | ENM_002, ENM_003, ENM_011, ENM_019, ENM_020, ENM_029, ENM_037, ENM_047, ENM_072 ; élite ENM_077 |
| Boss | BOS_002 Haku (lieutenant à 05:00 en expédition), BOS_001 Zabuza (final à 10:00) |
| Ultime / transformation | ULT_001, ULT_004, ULT_010 ; TRF_001, TRF_005, TRF_011 |
| VFX | VFX_001, 002, 003, 004, 005, 008, 014, 017, 018, 019, 020 |
| Écrans | ART_003, 004, 005, 006, 008, 009, 011, 012 |

## H2. Plan de sprints (critères observables)

| Sprint | But | Critère de validation observable (pas une liste de fonctionnalités) |
|---|---|---|
| 0 (2 sem.) | Mesures moteur | Scène vide avec 500 cercles ennemis + 1 000 projectiles : temps de tick ≤ 4 ms au 95e centile sur la machine de référence ; décision sur le rendu par lots |
| **1 (2 sem.)** | **30 secondes agréables** | 6 testeurs sur 8 notent le déplacement et la première attaque ≥ 4/5 ; aucun testeur ne se dit « bloqué » par un obstacle ou un ennemi ; 0 glissement de pieds visible |
| 2 | Boucle de niveau | Les testeurs choisissent une carte en < 5 s en moyenne dès le 3e niveau ; 0 carte « sans effet » proposée en 50 niveaux (journal) |
| 3 | Première évolution | 7 testeurs sur 8 remarquent le changement de comportement de Kage Bunshin après EVO_069 sans explication |
| 4 | Un boss (Zabuza) | 90 % des morts contre Zabuza sont attribuées par le joueur à la bonne attaque ; durée de combat 2–4 min pour un build moyen |
| 5 | Un build complet (BLD_001) | Les 5 paliers de puissance (§C12.1) sont reconnus sur vidéo par des spectateurs (≥ 70 % d'accord) |
| 6–8 | Diversité (Sasuke, Gaara) | Les trois personnages sont décrits par des mots différents (analyse des verbatims) ; aucun build ne dépasse 40 % des victoires sur 60 runs internes |
| 9–10 | Tranche verticale | Test des 3 s ≥ 80 % ; lecture en combat dense ≥ 90 % ; 60 i/s sur la machine de référence |

## H3. Dépendances et coûts relatifs

Hypothèse d'équipe pour la 1.0 : 9 personnes (2 game design, 3 programmation, 2 pixel art, 1 VFX/tech art, 1 audio) + tests externes ponctuels.

| Élément | Design | Animation | VFX | Programmation | Son | Tests | Total (jours-personne, estimation) |
|---|---|---|---|---|---|---|---|
| Personnage de base | 3 | 8 | 1 | 1 | 1 | 1 | ≈ 15 |
| Variante | 2 | 4 | 0,5 | 0,5 | 0,5 | 1 | ≈ 8,5 |
| Technique générique (comportement existant) | 0,5 | 0 | 1,5 | 0,2 | 0,3 | 0,5 | ≈ 3 |
| Technique à crochet (nouveau comportement) | 1 | 0,5 | 2 | 2 | 0,5 | 1 | ≈ 7 |
| Évolution / fusion | 0,5 | 0 | 2 | 0,3 | 0,3 | 0,5 | ≈ 3,6 |
| Ennemi ordinaire | 0,5 | 2 | 0,3 | 0,3 | 0,2 | 0,3 | ≈ 3,6 |
| Élite | 0,5 | 1 (retouche) | 0,5 | 0,5 | 0,2 | 0,5 | ≈ 3,2 |
| Boss humain | 3 | 8 | 4 | 4 | 2 | 3 | ≈ 24 |
| Boss immense | 4 | 12 | 5 | 6 | 2 | 4 | ≈ 33 |
| Carte | 3 | 10 (tuiles, décor) | 1 | 2 | 2 | 2 | ≈ 20 |
| Mission | 0,3 | 0 | 0 | 0,1 | 0 | 0,2 | ≈ 0,6 |

**Dépendances** : grammaire VFX par famille (§C9) → toutes les techniques de la famille ; comportements génériques (émetteurs) → techniques de données ; système de vagues → cartes ; boss → systèmes de télégraphes et de zones sûres (solveur) ; méta-progression → sauvegarde versionnée.

**Réutilisations sans reskin** : squelette de poses partagé (proportions, découpage haut/bas) mais silhouettes et accessoires redessinés ; palettes de clone et d'états générées automatiquement ; comportements génériques partagés par famille (un « projectile sinueux » sert au dragon d'eau et au dragon de bois avec des paramètres et visuels différents) ; ennemis déclinés par carte avec **accessoire de rôle** différent (pas de simple changement de couleur).

## H4. Évaluation du périmètre 1.0

Cible demandée : 20 personnages, 100 techniques, 30 évolutions, 8 cartes, 15 boss, 60 ennemis, 80 missions.

| Élément | Quantité | Coût unitaire | Total |
|---|---|---|---|
| Personnages (16 base + 4 variantes) | 20 | 15 / 8,5 | ≈ 274 |
| Techniques (70 génériques + 30 à crochet) | 100 | 3 / 7 | ≈ 420 |
| Évolutions et fusions | 30 | 3,6 | ≈ 108 |
| Cartes | 8 | 20 | ≈ 160 |
| Boss (11 humains + 4 immenses) | 15 | 24 / 33 | ≈ 396 |
| Ennemis (48 + 12 élites) | 60 | 3,6 / 3,2 | ≈ 211 |
| Missions | 80 | 0,6 | ≈ 48 |
| Systèmes, interface, audio, sauvegarde, outils, localisation | — | — | ≈ 1 400 |
| **Total** | | | **≈ 3 000 jours-personne** (≈ 15 mois pour 9 personnes à 220 j/an, hors marge) |

**Challenge et recommandation** : le périmètre demandé est atteignable en ~18–20 mois avec marge de 25 %, mais le risque principal est la **qualité d'animation des boss** (30 % du budget). Proposition de référence : **1.0 = 20 personnages, 100 techniques, 30 évolutions, 8 cartes, 12 boss (dont 3 immenses), 60 ennemis, 80 missions**, les 3 boss manquants passant en première extension. Cette réduction ne supprime rien de la vision complète : les données existent déjà et sont validées.

Sélection proposée pour la 1.0 : les 24 personnages prioritaires moins 8 (restent 16 bases) + 4 variantes à fort contraste (CHR_002, CHR_006, CHR_013, CHR_015) ; cartes MAP_001, 002, 003, 004, 006, 008, 012, 016.

## H5. Équilibrage

**Axes de comparaison** (évalués par technique et par build sur une grille 1–5, puis mesurés) : portée, couverture (surface × fréquence), dégâts cible unique, dégâts de zone, sécurité (défense, évitement), mobilité, contrôle, montée en puissance (ratio DPS 20:00 / 05:00), coût d'opportunité (emplacements, dépendance à une recette).

**Règles** :
* Les builds puissants sont souhaités ; **aucun build ne doit dominer toutes les situations** : mesure de la part de victoires par build (sur 200 runs automatisées ou de testeurs) ; alerte si un build dépasse 25 % des victoires au rang A, ou si un build gagne sur toutes les cartes avec un écart de temps de boss > 30 % sur le deuxième.
* Chaque famille doit avoir au moins un build viable au rang A (cible), et chaque personnage au moins deux (§E builds).
* Les évolutions respectent la non-régression (§B7.3) et la fusion ne dépasse pas +35 % de DPS total en 3 min (§B7.4).

**Tests d'équilibrage (plages attendues à vérifier)** :

| Test | Conditions | Plage attendue |
|---|---|---|
| Début sans méta-progression | Rang D, 0 Ryō dépensé, profil moyen | Survie jusqu'à 10:00 dans 70–85 % des runs |
| Corps-à-corps | Lee BLD_010, rang C | Victoire 35–50 % (profil moyen après 5 runs) |
| Boss isolé | Kurenai BLD_040 contre Kinkaku et Ginkaku | Durée de combat 2,5–4 min |
| Build d'invocation | Naruto BLD_001 | Unités logiques ≤ 8 en permanence ; DPS des unités 50–70 % du total |
| Faible chance | Graine « malchanceuse » (catalyseurs tirés en dernier) | Au moins 1 évolution avant 18:00 dans 80 % des runs grâce au filet et aux coffres |
| Mauvaises propositions | 5 niveaux consécutifs imposés sans carte pertinente | Le filet de pertinence propose une carte A/C au 3e niveau (100 %) |
| Rouleau interdit refusé | Refus systématique | Taux de victoire −5 à −10 points seulement (le refus reste viable) |

## H6. Indicateurs de satisfaction (hypothèses à observer)

Ces indicateurs sont des **hypothèses** ; aucune explication psychologique n'est présentée comme certaine.

| Indicateur | Mesure proposée | Cible hypothétique |
|---|---|---|
| Envie de relancer | Part des défaites suivies d'un « Rejouer » dans les 10 s | ≥ 60 % |
| Compréhension des morts | Question « Qu'est-ce qui vous a tué ? » comparée au journal | ≥ 80 % de réponses correctes |
| Diversité des choix | Entropie des techniques choisies par personnage sur 100 runs | Aucune technique non signature > 60 % de présence |
| Reconnaissance des évolutions | « Qu'est-ce qui a changé ? » après une évolution | ≥ 75 % décrivent le nouveau comportement |
| Poids des attaques | Échelle 1–5 sur Poing de pierre, Rasengan, Gōkakyū (sans secousse) | ≥ 4 en moyenne |
| Test des 3 secondes | 20 extraits, 3 questions (§A1) | ≥ 80 % de réponses correctes aux 3 questions |

## H7. Tests automatiques

| Test | État | Où |
|---|---|---|
| Doublons d'identifiants | **Implémenté** | `outils/valider.py`, `outils/tests_validateur.py` |
| Recettes inaccessibles (aucun personnage ne peut réunir sources, catalyseurs, condition) | **Implémenté** | idem |
| Cycles de déblocage et missions inatteignables (simulation de déblocage avec cartes) | **Implémenté** | idem |
| Dépassements d'emplacements dans les builds | **Implémenté** | idem |
| Probabilités incorrectes (exemple §B6.4 = 100 %) | **Implémenté** | idem |
| Effets récursifs (profondeur de recette > 2) | **Implémenté** (données) ; garde d'exécution à implémenter en jeu | idem ; §G7.3 |
| Valeurs négatives (PV, vitesses, taux) | **Implémenté** (partiel) | idem |
| Sauvegardes anciennes (migration v1 → v3) | **Implémenté** (référence) | `outils/sauvegarde.py` |
| Compositions de vagues (somme des poids = 100, références) | **Implémenté** | `outils/valider.py` |
| Boss : champs d'attaque complets, avertissement ≥ 0,5 s pour attaques lourdes | **Implémenté** | idem |
| Enfermement (chemins de sortie ≥ 2 × 2 m) | À implémenter en jeu | test de simulation |
| Solveur de zones sûres des boss (2 attaques simultanées) | À implémenter | outil hors ligne |
| Chaînes ≤ 16 cibles, budget par tick | À implémenter en jeu | test de simulation |
| Déterminisme (même graine → même état après 10 min) | À implémenter | test d'intégration |

Résultat actuel de `python3 outils/valider.py` : **0 erreur, 0 avertissement** ; `python3 outils/tests_validateur.py` : **10/10** (ces résultats portent sur la cohérence des données, pas sur le jeu).

## H8. Tests manuels (prévus, non réalisés)

* **Lecture en combat dense** : captures à 19:30 sur MAP_016, MAP_012, MAP_013 ; les testeurs pointent le joueur, les projectiles hostiles et les télégraphes en < 2 s.
* **Couleurs proches** : simulation de deutéranopie, protanopie, tritanopie ; télégraphes alliés vs ennemis, flammes noires sur fond sombre.
* **Désactivation des particules** : la puissance du build reste compréhensible (questionnaire avant/après).
* **Manette** : zone morte, visée assistée au stick droit, vibrations plafonnées, déconnexion → pause.
* **Reprise après pause** : les télégraphes reprennent avec le même temps restant (enregistrement image par image).
* **Fatigue visuelle** : sessions de 60 min, questionnaire (gêne, éblouissement) ; options de confort activées pour les testeurs sensibles.
* **Performance** : machine de référence et machine basse, scène de référence, 10 min, 95e centile du temps de frame.

## H9. Risques

| ID | Risque | Probabilité | Impact | Réponse |
|---|---|---|---|---|
| R-01 | **Licence** : droits d'exploitation de l'univers Naruto non acquis | Élevée | Bloquant pour la publication | Prérequis avant toute communication publique ; prototype interne seulement ; plan B : univers original « shinobi » avec les mêmes systèmes |
| R-02 | Lisibilité de fin de partie (effets trop denses) | Moyenne | Élevé | Transparence dynamique, hiérarchie de rendu, tests dédiés dès la tranche verticale |
| R-03 | Coût d'animation des boss immenses | Élevée | Élevé | Découpage en parties, réduction à 3 immenses en 1.0 |
| R-04 | Performance avec 500 ennemis | Moyenne | Élevé | Sprint 0 de mesure, grille spatiale, rendu par lots |
| R-05 | Équilibrage d'un catalogue de 320 techniques | Élevée | Moyen | Données + simulations automatiques, 1.0 à 100 techniques |
| R-06 | Attributions non vérifiées (noms, utilisateurs de techniques) | Moyenne | Moyen | Relecture documentaire H-DOC-01 ; marquage AV maintenu |
| R-07 | Synergies inactives pour certains personnages | Faible | Faible | Toutes les synergies ont au moins un personnage compatible (revue manuelle ; à automatiser) |
| R-08 | Méta-progression perçue comme obligatoire | Faible | Moyen | Bonus bruts plafonnés à +10 %, test « sans méta » |
