# NARUTO: SHINOBI SURVIVORS — dossier de préproduction

Projet créatif **non officiel** : dossier de conception d'un roguelite de type « survivors » en pixel art dans l'univers de *Naruto* et *Naruto Shippuden*. Ce dépôt ne contient **pas** de jeu : il contient la conception (règles, bible artistique, catalogues, architecture, plan de production) et un outillage qui vérifie la cohérence des catalogues. Tous les chiffres sont des hypothèses à tester. Les droits d'exploitation de la licence sont un prérequis non traité (risque R-01).

## Lire le dossier

| Ordre | Partie | Fichier |
|---|---|---|
| 0 | Registre des conventions (unités, identifiants, tags, emplacements) | [`dossier/00_registre_conventions.md`](dossier/00_registre_conventions.md) |
| A | Vision et décisions structurantes | [`dossier/A_vision.md`](dossier/A_vision.md) |
| B | Systèmes jouables (contrôles, combat, statistiques, hasard, évolutions, synergies) | [`dossier/B_systemes.md`](dossier/B_systemes.md) |
| C | Bible artistique ; fiches VFX et briefs d'écrans | [`dossier/C_bible_artistique.md`](dossier/C_bible_artistique.md), [`dossier/C2_effets_et_briefs.md`](dossier/C2_effets_et_briefs.md) |
| D | Contenu et situations (cartes, boss, ennemis, méta, rangs, modes) | [`dossier/D_contenu.md`](dossier/D_contenu.md) |
| E | Catalogues exhaustifs (générés) et fiches approfondies | [`dossier/E_catalogues/README.md`](dossier/E_catalogues/README.md) |
| F | Trois runs commentées | [`dossier/F_runs.md`](dossier/F_runs.md) |
| G | Préproduction technique (architecture, données, pseudocode, sauvegardes) | [`dossier/G_technique.md`](dossier/G_technique.md) |
| H | Production et validation | [`dossier/H_production.md`](dossier/H_production.md) |
| Z | Audit synthétique (comptes réels, contradictions résolues, reste à faire) | [`dossier/Z_audit.md`](dossier/Z_audit.md) |

## Contenu du catalogue

80 entrées jouables (56 personnages + 24 variantes) · 320 techniques · 120 évolutions, fusions et éveils · 80 synergies · 60 passifs · 40 équipements · 24 transformations · 44 ultimes · 20 cartes · 40 boss · 100 ennemis (25 élites) · 200 missions · 60 secrets · 40 builds · 48 fiches de techniques sur 8 niveaux · 24 fiches de personnages · 20 fiches VFX · 12 briefs d'écrans.

## Arborescence

```
data/          Source de vérité (YAML) + schémas JSON (data/schemas/)
catalogues/    Exports générés : CSV (séparateur « ; ») et JSON
dossier/       Documents de conception ; E_catalogues/ contient les tableaux générés et les fiches rédigées
outils/        commun.py, valider.py, generer.py, sauvegarde.py, tests_validateur.py
```

## Outils

Prérequis : Python 3.10+ et PyYAML.

```bash
python3 outils/valider.py            # cohérence : identifiants, références, accès, recettes, cycles, déblocages, builds, vagues
python3 outils/tests_validateur.py   # tests négatifs du validateur + migration de sauvegarde
python3 outils/generer.py            # régénère dossier/E_catalogues/*.md et catalogues/*.csv|json
```

Règle de modification (registre §R13) : modifier le registre si nécessaire, puis `data/`, lancer la validation, puis la génération ; ne jamais éditer à la main les fichiers générés.
