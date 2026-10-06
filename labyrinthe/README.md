# NARUTO — Le Labyrinthe des Sceaux

Roguelike de salles en pixel art, jouable à la manette, dans l'univers de *Naruto* et *Naruto Shippuden*. Il reprend le langage de *The Binding of Isaac* : un étage de salles fermées à nettoyer, un tir à quatre directions, des objets qui changent réellement l'attaque et s'additionnent, des salles spéciales, des pactes, des boss, puis l'étage suivant.

> **Projet créatif non officiel.** Tous les sprites, sons, musiques, la police et les salles ont été créés pour le projet ; aucune ressource commerciale n'est extraite. Les noms et personnages appartiennent à leurs ayants droit : toute diffusion publique suppose une autorisation **à vérifier**.

## Jouer

Ouvrez **[`jeu/index.html`](jeu/index.html)** dans un navigateur récent (Chrome, Edge, Firefox). Un seul fichier, aucune installation, fonctionne hors ligne. Branchez une manette avant ou pendant la partie.

| Action | Manette | Clavier |
|---|---|---|
| Se déplacer | stick gauche | Z Q S D (W A S D en QWERTY) |
| Tirer (quatre directions) | stick droit ou A B X Y, comme dans Isaac | flèches |
| Technique (actif) | LT | Espace |
| Explosif | RB | E |
| Consommable de poche | RT | Q (A en AZERTY) |
| Interagir, acheter | croix ↓ (A dans les menus) | Entrée ou F |
| Retour | B dans les menus | Retour arrière |
| Description d'un objet proche | automatique, comme le mod External Item Descriptions d'Isaac | automatique |
| Échanger d'actif (Kakashi, Kankurō altéré) | LB | Maj |
| Déposer talisman ou consommable (maintenir) | croix ← | Ctrl |
| Carte | Vue | Tab |
| Pause | Menu | Échap ou P |

Le profil de tir se change dans Options (stick + boutons par défaut, ou stick + croix, où les boutons de face gardent interagir, description et déposer). Toutes les touches se reconfigurent (Options → Commandes). Réglages de zones mortes, vibrations, secousses, mode confort, « sans flash » et éclairage dynamique dans les Options.

## Ce qu'il y a dans le jeu

- **18 personnages jouables** : 12 personnages et 6 variantes altérées, chacun avec une règle propre (Naruto, Sasuke, Sakura, Kakashi, Rock Lee, Hinata, Shikamaru, Gaara, Kankurō, Kiba, et les experts Sasori et Kakuzu).
- **9 étages, 10 thèmes, 18 variantes** qui changent une règle de terrain (flaques, toiles, cristaux, brume, pénombre…), générés à partir d'un code de mission reproductible ; **120 modèles de salles**, dont deux salles propres à chaque thème et des grandes salles dessinées pour chaque forme.
- **158 objets passifs, 33 techniques actives, 35 talismans, 30 consommables, 15 pilules**, 96 synergies (dont 9 fusions de natures et 3 trios) et 13 transformations d'ensemble.
- **25 boss** (Mizuki, Zabuza, Haku, Gaara, Orochimaru, Itachi, Pain, Konan, Obito, Madara…) et **76 ennemis**, avec champions.
- **Pactes et sanctuaires**, échoppes, informateurs, machines, autel de tribut, chambres maudites, épreuves.
- **Ressenti** : éclairage dynamique, éclats et débris à la mort des ennemis, écrasement au coup reçu, onde et carillon quand une salle est nettoyée, portes animées, mort de boss au ralenti, compteurs du HUD qui réagissent, commandes peintes au sol de la première salle.
- **6 routes et fins**, Boss Rush (Conseil des épreuves), rencontre chronométrée, **30 contrats** (défis), **80 objectifs**, **15 secrets** avec indices consultables, sauvegarde de partie suspendue.

## Dossier de conception

Le dossier complet (sections A à I du brief) est dans [`dossier/`](dossier/README.md) : vision, règles, objets, bible pixel art, contenu, catalogues générés, builds et parties commentées, architecture, audit.

## Outils (Node.js 18+)

```bash
node labyrinthe/outils/construire.mjs              # assemble jeu/src/*.js en jeu/index.html
node labyrinthe/outils/catalogues.mjs              # valide les données, écrit catalogues/ et dossier/F_*.md, E_fiches.md
node labyrinthe/outils/tests_jeu.mjs [sections…]   # banc de tests Playwright (Chromium) : 18 sections
node labyrinthe/outils/journal_partie.mjs CHR_001 PARC2345 6   # journal reproductible d'une mission à code
```

Le banc de tests joue réellement le jeu dans un navigateur sans écran : génération de 400 étages, trois parties complètes, chaque objet, actif, boss, ennemi et personnage, sauvegarde, manette simulée, économie, pactes, contrats, mécaniques de boss et visibilité des sprites.
