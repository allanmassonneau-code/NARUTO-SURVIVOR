# NARUTO — LE LABYRINTHE DES SCEAUX · Dossier de conception

Projet créatif **non officiel**. Toutes les ressources (sprites, sons, musique, police, salles) sont créées pour le projet ; aucune ressource commerciale n’est extraite. Les autorisations nécessaires à une diffusion publique sont **à vérifier** : leur existence n’est pas supposée.

Ce dossier accompagne un jeu **réellement jouable** (`../jeu/index.html`). Il décrit les règles telles qu’elles sont appliquées par le code, signale ce qui reste une cible de conception et donne l’état d’avancement chiffré. Les valeurs numériques (dégâts, probabilités, durées) sont des **décisions du projet** : elles ne prétendent reproduire ni les constantes de *The Binding of Isaac*, ni des données officielles de *Naruto*. Aucun chiffre n’est présenté comme mesuré auprès de joueurs.

## Ordre de lecture (brief §45)

| Section | Fichier | Contenu |
|---|---|---|
| A | [A_vision.md](A_vision.md) | Vision jouable, décisions structurantes, registre des conventions, matrice de transposition |
| B | [B_regles.md](B_regles.md) | Commandes, sticks, combat, statistiques, santé, ressources, salles, génération, progression |
| C | [C_objets.md](C_objets.md) | Pipeline de tir, priorités et compatibilités, pools, inventaire, actifs, talismans, consommables, familiers, synergies, transformations, exemples chiffrés |
| D | [D_pixel_art.md](D_pixel_art.md) | Bible pixel art, animations, mutations, langage des jutsu, effets, interface, audio, confort |
| E | [E_contenu.md](E_contenu.md) · [E_fiches.md](E_fiches.md) | Roster, ennemis, boss, thèmes, routes, pactes, économie, secrets, contrats ; fiches générées (18 personnages, 24 boss attaque par attaque, ennemis par fonction, thèmes) |
| F | [F_catalogues.md](F_catalogues.md) · [F_salles.md](F_salles.md) | Catalogues **générés depuis les données du jeu** (compteurs, tables complètes, grilles de salles) |
| G | [G_builds_parties_briefs.md](G_builds_parties_briefs.md) · [G_journaux.md](G_journaux.md) | 64 builds, trois parties commentées (missions à code réelles, journaux bruts reproductibles), seize briefs d’écrans illustrés ([images/](images/)) |
| H | [H_technique.md](H_technique.md) | Architecture, données, pseudocode, tests (exécutés), performances, sauvegarde, production |
| I | [I_audit.md](I_audit.md) | Contradictions résolues, hypothèses, références manquantes, quantités réellement produites |

Les catalogues machine (JSON complets et CSV séparés par « ; ») sont dans [`../catalogues/`](../catalogues/). Ils sont régénérés par :

```bash
node labyrinthe/outils/catalogues.mjs            # valide les données puis écrit catalogues/ et dossier/F_*.md
node labyrinthe/outils/catalogues.mjs --verifier # validation seule (code de sortie 1 en cas d'erreur)
```

## État d’avancement en une ligne

Le jeu jouable couvre le périmètre **« version 1.0 de travail »** du brief (§44) sur la plupart des lots — 18 personnages jouables, 158 passifs, 33 actifs, 35 talismans, 30 consommables, 96 synergies, 13 transformations, 24 boss, 75 ennemis, 10 thèmes et 18 variantes d’étage — mais **pas** sur les modèles de salles (66 sur 120 visés), les objectifs (60 sur 80) ni les défis (12 sur 30). La **bibliothèque complète** (600 collectibles, 500 salles, 70 boss…) reste une cible de conception : elle n’est pas produite et n’est pas présentée comme telle. Le détail est dans [I_audit.md](I_audit.md) et, lot par lot, dans [F_catalogues.md](F_catalogues.md).

## Conventions de rédaction

- « **Canon adapté** » : nom ou élément reconnaissable de l’œuvre, règle de jeu inventée. « **Adaptation** » : technique célèbre transformée en mécanique. « **Création originale** » : invention du projet. « **Attribution à vérifier** » : rattachement canonique incertain.
- Les identifiants (CHR, ALT, PSV, ACT, TAL, CON, PIL, FAM, SYN, TRF, ENM, BOS, ROM, THM, FLR, RTE, OBJ, DEF, SEC) sont ceux des fichiers de données du jeu ; les tables générées les listent tous.
- Unités : distances en **tuiles** de 32 px (sauf mention « px »), temps en secondes, santé en **demi-unités** entières, cadence en **cycles par seconde**.
