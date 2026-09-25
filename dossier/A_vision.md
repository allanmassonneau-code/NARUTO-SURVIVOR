# A. Vision et décisions structurantes

> Projet créatif **non officiel**, dossier de préproduction. Tous les chiffres sont des **hypothèses de conception à tester**, jamais des résultats mesurés. Les conventions (unités, identifiants, tags, emplacements) sont centralisées dans [`00_registre_conventions.md`](00_registre_conventions.md) ; toute modification s'y reporte d'abord.

## A1. Promesse

**« Quelques minutes pour comprendre. Des dizaines d'heures pour découvrir les builds. Une montée en puissance que l'on voit, entend et ressent. »**

| Ce que fait le joueur | Ce que fait le jeu |
|---|---|
| Se déplace (et esquive, facultatif) | Lance les techniques automatiquement, choisit les cibles |
| Choisit 1 carte sur 3 à chaque niveau | Garantit des choix lisibles et pertinents (anti-série, §B6) |
| Assemble un build de 6 techniques, 6 passifs, 2 équipements | Révèle évolutions, fusions et synergies par des signaux visibles |
| Survit 20 minutes puis bat le boss final | Teste le build avec des comportements, pas seulement des PV |

**Test des trois secondes (critère de validation artistique)** : sur un extrait vidéo de 3 s pris au hasard dans une run, un spectateur doit pouvoir (1) nommer ou décrire le shinobi, (2) décrire son attaque principale, (3) dire si le build est « faible », « en montée » ou « dominant ». Protocole au §H6.

## A2. Priorités et arbitrages

Les priorités s'appliquent dans cet ordre ; en cas de conflit, la plus haute gagne.

1. **Jouabilité immédiate** — un seul input obligatoire (déplacement).
2. **Lisibilité et équité** — aucun danger létal invisible, aucune règle cachée qui contredit l'interface.
3. **Satisfaction audiovisuelle** — pixel art dessiné, impacts, montée sonore.
4. **Profondeur des builds** — interactions entre techniques, états et terrain.
5. **Volume et extensibilité** — un contenu n'entre au catalogue que s'il a une différence fonctionnelle défendable.

Exemples d'arbitrage déjà tranchés :

| Conflit | Décision | Priorité gagnante |
|---|---|---|
| Effets alliés énormes vs lecture des projectiles ennemis | Transparence dynamique des effets alliés (jusqu'à 35 % d'opacité) quand un projectile hostile les traverse | 2 > 3 |
| Chakra ressource vs attaques auto permanentes | Le chakra n'alimente **que** l'ultime ; aucune technique automatique ne consomme de chakra | 1 > 4 |
| Contrôle sur boss vs spectacle de boss | Rendements décroissants + conversion en vulnérabilité, jamais d'immunité totale | 4 = 2 |
| 320 techniques vs diversité réelle | Chaque entrée a un comportement mécanique distinct ; les variantes cosmétiques ne sont pas comptées | 5 subordonnée à 4 |
| Cinématique de boss vs rejouabilité | Entrée de boss ≤ 2,5 s, passable, jamais bloquante après la première fois | 1 > 3 |

## A3. Cadre Naruto

**Périmètre** : *Naruto* et *Naruto Shippuden*. *Boruto* est hors périmètre initial.

**Cadre de jeu — la Simulation de missions** : le joueur lance des missions dans une salle d'entraînement de Konoha qui reproduit des combats issus d'archives (« simulation de missions »). Ce prétexte léger autorise les équipes et affrontements hors chronologie (Minato contre Pain, Haku dans la Vallée de la Fin). Aucun dialogue obligatoire avant la première partie ; une ligne de texte par mission suffit.

**Statuts de fidélité** (colonne obligatoire dans chaque catalogue) :

| Code | Signification | Exemple |
|---|---|---|
| `OA` | Technique ou élément **de l'œuvre**, dont le comportement est une **adaptation de gameplay** | Katon — Gōkakyū no Jutsu |
| `CO` | **Création originale** du projet ; nom français clair, jamais un faux nom japonais | « Braises en éventail » |
| `AV` | Élément de l'œuvre dont **l'attribution ou le détail est à vérifier** | Utilisation d'une technique par un personnage précis |

> **Vérification des sources** : les attributions de ce dossier ont été rédigées **de mémoire, sans consultation de sources** pendant la rédaction. Elles ne sont **pas vérifiées**. Toute entrée `OA` doit passer une relecture documentaire (tâche H-DOC-01) avant publication ; les doutes identifiés sont déjà marqués `AV`.

**Règle d'or des recettes** : une recette d'évolution, une fusion ou une synergie est **une règle du jeu**, jamais une explication officielle du fonctionnement de l'univers.

**Compatibilités** : clans, dōjutsu, transformations et affinités rares ne sont accessibles qu'aux personnages qui possèdent l'aptitude correspondante (registre §R5). Le **mode Expérimental** (optionnel, désactivé par défaut, marqué dans l'écran de résultat) lève ces restrictions sans modifier le mode principal ni ses succès.

**Ressources** : prototype et tranche verticale utilisent des sprites, musiques, voix et sons **originaux**. Aucune ressource d'autres jeux n'est extraite. Les autorisations d'exploitation de la licence sont un **prérequis bloquant à vérifier** avant toute publication (risque R-01, §H9).

## A4. Expérience cible

* **Plateforme** : PC, clavier/souris et manette. Solo, hors ligne, aucun service en ligne requis.
* **Vue** : 2D de dessus, profondeur suggérée par sprites en trois-quarts, ombres portées et tri en Y.
* **Session** : run Standard ≈ 25 min (boss final à 20:00). Expédition courte ≈ 12 min.
* **Courbe d'émotion d'une run** : vulnérable (0–3 min) → affirmé (3–8) → choix de direction (8–13) → combinaison reconnaissable (13–17) → domination sous pression (17–20) → test du boss (20–25).
* **Envie de relancer** : curiosité (recette entrevue, indice d'Archive), stratégie (« et si je tentais les sceaux avec Minato ? »), plaisir immédiat (bouton **Rejouer** disponible dès l'écran de défaite).

## A5. Règles centrales (résumé exécutif)

| Sujet | Règle de référence | Détail |
|---|---|---|
| Emplacements | 6 techniques (dont la signature), 6 passifs, 2 équipements, 1 ultime, 1 transformation | §B3 |
| Unités | 1 m de jeu = 16 px de la résolution interne 640×360 | §R2 |
| Simulation | Pas fixe de 1/60 s, indépendant de l'affichage | §G4 |
| Chakra | Jauge 0–100 réservée à l'ultime, remplie par les dégâts infligés et subis | §B4.7 |
| Expérience | Fragments (bleu 1, vert 5, rouge 25, doré 100) | §B6 |
| Monnaie | Une seule monnaie dépensable : les **Ryō** | §D7 |
| Récompenses | **Coffre** = améliorations/évolution ; **Rouleau** = équipement ; **Rouleau interdit** = transformation ou objet interdit avec coût | §B6.7 |
| Évolution | Technique niv. 8 + catalyseur équipé + compatibilité → la technique est remplacée ; catalyseur conservé | §B7 |
| Fusion | Deux techniques niv. 8 consommées → une technique, un emplacement libéré | §B7 |
| Synergie | Objets indépendants + condition → effet borné, pas de remplacement | §B8 |
| Contrôle sur boss | Résistance cumulative, plafonnée à 80 %, excédent converti en vulnérabilité | §B4.10 |
| Difficulté | Rangs D → S+ : comportements, contraintes spatiales, événements | §D8 |

## A6. Périmètres

| Périmètre | Contenu | But | Critère de sortie observable |
|---|---|---|---|
| **Prototype technique** | 1 personnage (Naruto), 3 techniques, 1 boss (Zabuza), placeholders **identifiés comme tels** | Déplacement, ciblage, dégâts, niveau | 5 testeurs sur 6 déclarent spontanément que les 30 premières secondes sont agréables ; 0 blocage de collision en 20 runs |
| **Tranche verticale** | 3 personnages (Naruto, Sasuke, Gaara), 12 techniques, 6 passifs, 4 évolutions, 1 carte (Konoha — Terrain d'entraînement), 2 boss (Zabuza, Gaara), 10 min soignées | Qualité finale : impacts, montée en puissance, lisibilité de fin de partie | Test des 3 s réussi à ≥ 80 % sur 20 extraits ; 90 % des morts attribuées correctement par le joueur |
| **Version 1.0** | Cible évaluée : 20 personnages, 100 techniques, 30 évolutions, 8 cartes, 15 boss, 60 ennemis, 80 missions | Jeu complet premium | Voir §H4 (analyse de coûts et contre-proposition) |
| **Bibliothèque complète** | 80 entrées jouables, 320 techniques, 120 évolutions/fusions, 80 synergies, 60 passifs, 40 équipements, 24 transformations, 40 ultimes, 20 cartes, 40 boss, 100 ennemis, 200 missions, 60 secrets, 40 builds | Vision long terme, extensions | Catalogue validé par `outils/valider.py` |

## A7. Ce que le jeu n'est pas

* Pas de gacha, d'énergie, de connexion quotidienne punitive, de progression payante, d'horaires imposés.
* Pas de campagne narrative lourde ni de dialogue long avant de jouer.
* Pas de coopération ni de service en ligne au lancement.
* Pas de « boule rouge / bleue / verte » : une technique qui ne diffère que par sa couleur n'est pas une technique.

## A8. Plan du dossier

| Partie | Fichier |
|---|---|
| Registre des conventions | [`00_registre_conventions.md`](00_registre_conventions.md) |
| A. Vision | ce fichier |
| B. Systèmes jouables | [`B_systemes.md`](B_systemes.md) |
| C. Bible artistique | [`C_bible_artistique.md`](C_bible_artistique.md), [`C2_effets_et_briefs.md`](C2_effets_et_briefs.md) |
| D. Contenu et situations | [`D_contenu.md`](D_contenu.md) |
| E. Catalogues exhaustifs | [`E_catalogues/`](E_catalogues/) (générés depuis `data/`) + fiches approfondies |
| F. Trois runs commentées | [`F_runs.md`](F_runs.md) |
| G. Préproduction technique | [`G_technique.md`](G_technique.md) |
| H. Production et validation | [`H_production.md`](H_production.md) |
| Audit final | [`Z_audit.md`](Z_audit.md) |
