# Registre des conventions

Document de référence unique. Toute règle citée ailleurs renvoie ici ; en cas de contradiction, **ce registre fait foi** et l'autre document est corrigé (procédure au §R13).

## R1. Identifiants

Format : `PRÉFIXE_NNN` (3 chiffres, zéros à gauche). Un identifiant est **stable** : il n'est jamais réattribué, même si l'entrée est supprimée (elle passe alors au statut `retiré`).

| Préfixe | Objet | Plage réservée | Fichier source |
|---|---|---|---|
| `CHR` | Entrée jouable (personnage ou variante) | 001–080 | `data/personnages.yaml` |
| `JUT` | Technique de base | 001–320 | `data/techniques_*.yaml` |
| `EVO` | Évolution ou fusion | 001–120 | `data/evolutions.yaml` |
| `SYN` | Synergie | 001–080 | `data/synergies.yaml` |
| `PAS` | Passif | 001–060 | `data/passifs.yaml` |
| `EQP` | Équipement | 001–040 | `data/equipements.yaml` |
| `TRF` | Transformation | 001–024 | `data/transformations.yaml` |
| `ULT` | Ultime | 001–044 (cible du brief : ≥ 40) | `data/ultimes.yaml` |
| `STA` | État (statut) | 01–24 | ce registre §R7 |
| `MAP` | Carte | 001–020 | `data/cartes.yaml` |
| `BOS` | Boss | 001–040 | `data/boss.yaml` |
| `ENM` | Archétype ennemi (élites = `ENM_076`–`ENM_100`) | 001–100 | `data/ennemis.yaml` |
| `MIS` | Mission | 001–200 | `data/missions.yaml` |
| `SEC` | Secret | 001–060 | `data/secrets.yaml` |
| `BLD` | Build assemblé | 001–040 | `data/builds.yaml` |
| `VAG` | Vague (script de chronologie) | libre | `data/vagues.yaml` |
| `VFX` | Fiche d'effet visuel | 001–020 | `C2_effets_et_briefs.md` |
| `ART` | Brief d'écran / scène | 001–012 | `C2_effets_et_briefs.md` |
| `CPX` | Passif exclusif de personnage | = numéro du `CHR` | `data/personnages.yaml` |

**Modifications apportées aux exemples du brief** (reportées partout) :
* L'exemple « JUT_001 — Kage Bunshin » devient **`JUT_217`** : la numérotation `JUT` suit les familles primaires (Katon = 001–024, etc., §R6). Ses valeurs sont conservées et sa règle de plafond est explicitée (fiche approfondie).
* L'exemple « SYN_001 — Conduction » conserve son identifiant **`SYN_001`**.

## R2. Unités et temps

| Grandeur | Unité de données | Conversion | Arrondi |
|---|---|---|---|
| Distance | mètre de jeu (m) | **1 m = 16 px** de la résolution interne 640×360 (écran = 40 × 22,5 m) | Simulation en flottant ; affichage à l'entier de pixel le plus proche |
| Vitesse | m/s | 1 m/s = 16 px/s | — |
| Temps | seconde (s) | Simulation à pas fixe **1/60 s** (« tick ») | Durées arrondies au tick supérieur |
| Angle | degrés | 0° = droite, sens trigonométrique | — |
| Dégâts | points entiers | Calcul en flottant, **arrondi à l'entier le plus proche en fin de calcul, minimum 1** | §B4.2 |
| Pourcentages | stockés en fraction (0,25 = 25 %) | Affichés en % entier | Au plus proche |

Tailles de référence : tuile **16 px = 1 m** ; silhouette humaine **28 px** de hauteur utile (1,75 m) ; hitbox du joueur **cercle de rayon 0,375 m (6 px)** centré sur le bassin.

## R3. Emplacements

| Emplacement | Nombre | Contenu | Règle |
|---|---|---|---|
| Technique | **6** | Techniques de base, évolutions, fusions, techniques d'invocation | L'emplacement 1 contient la **technique signature** ; elle peut évoluer mais pas être bannie ni fusionnée en entrée secondaire |
| Passif | **6** | Passifs `PAS` | Un catalyseur reste équipé après évolution |
| Équipement | **2** | Équipements `EQP` | Remplaçable à tout moment depuis un Rouleau (l'ancien est perdu, confirmation requise) |
| Ultime | 1 (dédié) | Ultime `ULT` du personnage | Fixe par entrée jouable |
| Transformation | 1 (dédié) | Transformation `TRF` | Obtenue en partie (Rouleau interdit ou palier) ; certaines entrées n'en ont pas (compensation §B4.8) |
| Passif exclusif | 1 (implicite) | `CPX` du personnage | Toujours actif, n'occupe pas d'emplacement |

Un compagnon (clone, animal, marionnette) **occupe l'emplacement de la technique qui l'invoque**. Plafond global : **8 unités alliées logiques actives** toutes sources confondues (hors invocation géante, plafonnée à 1).

## R4. Ressources et récompenses

| Nom | Nature | Portée | Ne pas confondre avec |
|---|---|---|---|
| **Fragment d'expérience** | Ramassable ; bleu = 1, vert = 5, rouge = 25, doré = 100 XP | Run | Chakra |
| **Chakra** | Jauge 0–100 de l'ultime, **non ramassable** | Run | Fragments |
| **Ryō** | Seule monnaie dépensable | Permanente | Maîtrise |
| **Maîtrise** | Progression par personnage, niveaux 1–10 | Permanente | Ryō (ne se dépense pas) |
| **Coffre** | Récompense d'élite/boss : améliorations de techniques/passifs **ou** évolution admissible | Run | Rouleau |
| **Rouleau** | Point d'intérêt de carte : choix de 1 équipement parmi 3 | Run | Coffre |
| **Rouleau interdit** | Événement rare : transformation ou objet interdit, **coût annoncé** | Run | Rouleau |
| **Relance / Bannissement / Passage** | Charges de contrôle du hasard | Run (base débloquée en méta) | — |
| Ration de soldat | Soin 20 PV | Run | — |
| Sceau d'attraction | Attire tous les fragments de l'écran | Run | — |

Le mot « parchemin » n'est **pas utilisé** dans l'interface.

## R5. Aptitudes (compatibilités)

Une technique indique une **expression d'accès** : `LIBRE`, un code, une conjonction `A+B`, ou une alternative `A|B` (le `+` est prioritaire). Un personnage possède une liste d'aptitudes.

| Groupe | Codes |
|---|---|
| Éléments de base | `ELEM_KATON`, `ELEM_SUITON`, `ELEM_RAITON`, `ELEM_FUTON`, `ELEM_DOTON` |
| Affinités rares | `KG_MOKUTON`, `KG_HYOTON`, `KG_SABLE`, `KG_JITON`, `KG_SHAKUTON`, `KG_YOTON`, `KG_BAKUTON`, `KG_RANTON`, `KG_ENTON`, `KG_FUTTON`, `KG_JINTON` |
| Clans | `CLAN_UCHIHA`, `CLAN_HYUGA`, `CLAN_NARA`, `CLAN_AKIMICHI`, `CLAN_YAMANAKA`, `CLAN_ABURAME`, `CLAN_INUZUKA`, `CLAN_UZUMAKI`, `CLAN_SENJU`, `CLAN_KAGUYA`, `CLAN_HOZUKI`, `CLAN_SARUTOBI` |
| Dōjutsu | `DOJ_SHARINGAN`, `DOJ_MANGEKYO`, `DOJ_BYAKUGAN`, `DOJ_RINNEGAN` |
| Aptitudes | `APT_FUIN` (sceaux), `APT_GEN` (genjutsu), `APT_MED` (médical), `APT_KENJ` (kenjutsu), `APT_MARIO` (marionnettes), `APT_SENJ` (senjutsu), `APT_PORTES` (Portes internes), `APT_JINCH` (jinchūriki), `APT_ENCRE` (encre de Sai), `APT_PAPIER` (papier de Konan), `APT_CORPS` (techniques corporelles d'Orochimaru/Kakuzu/Hidan), `APT_RASEN` (lignée du Rasengan : techniques transmises de maître à élève) |
| Contrats | `CTR_CRAPAUD`, `CTR_SERPENT`, `CTR_LIMACE`, `CTR_CHIEN`, `CTR_SINGE`, `CTR_FAUCON`, `CTR_BELETTE`, `CTR_REQUIN`, `CTR_CORBEAU`, `CTR_PALOURDE` |
| Personnel | `CHR_NNN` (réservé à une entrée) |

## R6. Familles primaires (décompte exclusif)

| Famille | Code | Plage `JUT` | Nombre |
|---|---|---|---|
| Katon | `KATON` | 001–024 | 24 |
| Suiton | `SUITON` | 025–048 | 24 |
| Raiton | `RAITON` | 049–072 | 24 |
| Fūton | `FUTON` | 073–096 | 24 |
| Doton | `DOTON` | 097–120 | 24 |
| Affinités rares | `RARE` | 121–160 | 40 |
| Taijutsu | `TAIJUTSU` | 161–184 | 24 |
| Armes et outils | `OUTIL` | 185–216 | 32 |
| Invocations et clones | `INVOC` | 217–248 | 32 |
| Genjutsu | `GENJUTSU` | 249–264 | 16 |
| Sceaux | `SCEAU` | 265–280 | 16 |
| Clan et héritage | `CLAN` | 281–304 | 24 |
| Oculaire | `OCULAIRE` | 305–320 | 16 |
| **Total** | | | **320** |

La **famille** (décompte), l'**affinité élémentaire** (tag `E_*`), le **mode de livraison** (catégorie d'attaque) et l'**accès** sont quatre champs séparés. Exemple : un kunai enflammé est famille `OUTIL`, tag `E_KATON`, livraison `PROJECTILE`, accès `ELEM_KATON`.

## R7. États (`STA`)

Valeurs de base ; les techniques peuvent préciser des variantes. « Contrôle » = soumis à la résistance de contrôle des boss (§B4.10).

| ID | Nom | Effet | Durée | Cumul | Contrôle |
|---|---|---|---|---|---|
| STA_01 | Brûlure | 3 dégâts/s par cumul × multiplicateur de Puissance du propriétaire | 3 s (rafraîchie) | 5 | Non |
| STA_02 | Imbibé d'huile | Aucun effet seul ; condition de SYN (huile + feu) | 5 s | 1 | Non |
| STA_03 | Trempé (Conducteur) | −10 % vitesse ; condition de Conduction | 2 s | 1 | Non |
| STA_04 | Électrisé | Micro-étourdissement 0,2 s ; 1 fois/s/cible | instantané | — | Oui |
| STA_05 | Refroidi | −10 % vitesse par cumul ; à 3 cumuls → **Gelé** 1,0 s puis immunité 2 s | 3 s | 3 | Gel : oui |
| STA_06 | Ensablé | −8 % vitesse par cumul ; à 3 cumuls → **Enseveli** (immobile) 1,2 s | 3 s | 3 | Enseveli : oui |
| STA_07 | Lié par l'ombre | Immobile, ne peut attaquer | technique | 1 | Oui |
| STA_08 | Empoisonné | 2 dégâts/s par cumul, **ignore la résistance** des boss | 5 s | 10 | Non |
| STA_09 | Marqué (sceau) | Cible des pièges, sceaux et téléportations | 6 s | 1 | Non |
| STA_10 | Confus (genjutsu) | Erre, attaque l'ennemi le plus proche à 50 % | 2 s | 1 | Oui |
| STA_11 | Étourdi | Aucune action | technique | 1 | Oui |
| STA_12 | Vulnérable | +X % dégâts subis ; **somme plafonnée à +50 %** | technique | additif | Non |
| STA_13 | Repoussé | Déplacement forcé ; boss ×0,2 distance | instantané | — | Oui (distance) |
| STA_14 | Parasité (insectes) | 1 dégât/s par cumul ; −2 % vitesse par cumul ; à la mort, 1 insecte rejoint l'essaim du propriétaire | 6 s | 10 | Non |
| STA_15 | Charge d'argile | Explose 1,5 s après application (dégâts de la technique) | 1,5 s | 3 | Non |
| STA_16 | Aveuglé | Tireurs : dispersion ±25° ; poursuivants perdent la cible 0,8 s | 2 s | 1 | Oui |
| STA_17 | Corrodé | −15 points de résistance (min 0) ; ennemis ordinaires : +10 % dégâts subis | 4 s | 1 | Non |
| STA_18 | Entaillé (saignement) | 4 dégâts par mètre parcouru par la cible | 4 s | 3 | Non |
| STA_19 | Entravé (racines) | Immobile, peut attaquer à distance | technique | 1 | Oui |
| STA_20 | Lien maudit (Jashin) | Une fraction des dégâts subis par le lanceur est reproduite sur la cible | technique | 1 | Non |
| STA_21 | Encré | Ralenti 15 % ; les créatures d'encre ciblent en priorité | 3 s | 1 | Non |
| STA_22 | Aimanté (Jiton) | Attiré de 0,5 m/s vers le noyau magnétique le plus proche | 3 s | 1 | Non |
| STA_23 | Vapeur | −20 % dégâts infligés par l'ennemi | 3 s | 1 | Non |
| STA_24 | Pétrifié léger (Jinton exclu) | Réservé aux boss scénarisés | — | — | — |

## R8. Tags (nomenclature fixe)

**Catégories d'attaque (livraison, exactement une par technique)** : `PROJECTILE`, `SALVE`, `CONE`, `ONDE`, `CONTACT`, `ORBITE`, `ZONE`, `PIEGE`, `RAYON`, `CHAINE`, `INVOCATION`, `DIFFERE`. Règles au §B5.

**Affinités** : `E_KATON`, `E_SUITON`, `E_RAITON`, `E_FUTON`, `E_DOTON`, `E_MOKUTON`, `E_HYOTON`, `E_SABLE`, `E_JITON`, `E_SHAKUTON`, `E_YOTON`, `E_BAKUTON`, `E_RANTON`, `E_ENTON`, `E_FUTTON`, `E_JINTON`, `E_NEUTRE`.

**Tags d'effet** (effet défini, utilisables par synergies et passifs) :

| Tag | Effet mécanique |
|---|---|
| `UNITE_ALLIEE` | Entité alliée logique ; hérite selon §R9 ; compte dans le plafond de 8 ; ne bloque pas le joueur |
| `CLONE` | Sous-type d'unité ; ne peut **jamais** créer de clone ni copier un effet qui s'auto-déclenche |
| `ANIMAL` | Sous-type d'unité ; comportement propre ; Quantité du joueur limitée à +1 |
| `MARIONNETTE` | Sous-type d'unité relié par fils (portée 7 m) ; hérite de la Zone pour sa portée |
| `GEANT` | Invocation géante (plafond 1), règles §B9.4 |
| `SECONDAIRE` | Effet produit par un déclenchement ; profondeur de chaîne limitée (§B8.3) |
| `PERSISTANT` | Zone au sol durable ; plafond d'instances par technique |
| `TERRAIN` | Crée une surface (huile, eau, sable, ombre, bois, glace) interrogeable par les synergies |
| `PERCANT` | Traverse les cibles jusqu'à sa limite de touches |
| `REBOND` | Rebondit vers une nouvelle cible (jamais deux fois la même d'affilée) |
| `CONTROLE` | Applique un état de contrôle (§R7) |
| `MARQUE` | Applique ou consomme `STA_09` |
| `SOIN` | Rend des PV au joueur ; soumis au plafond de soin §B4.9 |
| `BOUCLIER` | Octroie un bouclier temporaire ; plafond §B4.9 |
| `SACRIFICE` | Coûte des PV ; **ne peut jamais tuer** (plancher 1 PV) |
| `EXPLOSIF` | Dégâts en zone à l'impact ; peut détruire les obstacles destructibles |
| `ATTRACTION` | Tire les ennemis ordinaires vers un point |
| `MOBILE` | La technique déplace l'effet, **jamais** le joueur sans action de sa part |
| `SENSEUR` | Révèle ennemis/pièges hors écran dans le rayon indiqué |

## R9. Héritage des unités alliées

| Type | Puissance | Chance crit. | Dégâts crit. | Cadence | Durée | Quantité | Zone | Déplacement | Effets à l'impact du propriétaire |
|---|---|---|---|---|---|---|---|---|---|
| `CLONE` | 75 % | 100 % | 100 % | 50 % | 100 % | selon technique | 50 % | 100 % | États élémentaires de sa propre attaque uniquement |
| `ANIMAL` | 100 % | 50 % | 50 % | 25 % | 100 % | +1 max | 100 % | 100 % | Aucun |
| `MARIONNETTE` | 100 % | 100 % | 100 % | 100 % | — | 0 | 100 % (portée) | — | États de poison et de fil |
| `GEANT` | 50 % | 0 % | — | 0 % | 50 % | 0 | 25 % | — | Aucun |
| Invocation d'ultime | valeurs fixes de l'ultime | — | — | — | — | — | — | — | Aucun |

Une unité **ne recopie pas** les passifs du joueur au-delà de ces coefficients ; elle n'hérite **jamais** de la Régénération, de l'Armure, du Rayon de collecte, du vol de vie ni des effets sur élimination.

## R10. Durées de référence

| Élément | Valeur |
|---|---|
| Run Standard | boss final à **20:00**, fin cible 22–25:00, prolongation jusqu'à **28:00** max |
| Expédition courte | boss à 10:00, fin ≤ 14:00 |
| Invulnérabilité après coup lourd (≥ 20 % PV max) | 0,6 s |
| Fenêtre de contact globale | 0,35 s entre deux impacts de contact |
| Esquive | 3 m en 0,18 s ; invulnérable 0,25 s ; recharge 4,0 s |
| Évolution (séquence) | 900 ms, accélérable à 300 ms |
| Ouverture de coffre | 1,2 s standard ; 0,4 s rapide ; 0 s désactivée |
| Entrée de boss | ≤ 2,5 s, passable |

## R11. Recettes

* **Évolution** `EVO` de type `EVOLUTION` : 1 technique niv. 8 + 1 catalyseur (`PAS` ou `EQP`) équipé ; remplace la technique ; catalyseur conservé.
* **Fusion** `EVO` de type `FUSION` : 2 techniques niv. 8 (+ catalyseur éventuel) ; consomme les deux, libère 1 emplacement ; le résultat est niveau « Évolué » (non améliorable, voir §B7.4 pour la compensation).
* **Éveil tardif** `EVO` de type `EVEIL` : 1 évolution + condition de temps (≥ 15:00) + transformation active ou objet interdit ; profondeur maximale d'une chaîne = **2** (base → évolution → éveil).
* **Synergie** `SYN` : aucune consommation ; condition + effet borné.

## R12. Rareté

La rareté ne s'applique **qu'aux équipements** et aux coffres, jamais aux techniques.

| Rareté | Couleur de cadre + motif | Rôle |
|---|---|---|
| Ordinaire | Cadre bois, motif uni | Effet simple et fiable |
| Rare | Cadre laqué, motif en losanges | Change une décision ou un comportement |
| Interdit | Cadre noir à sceaux rouges, motif hachuré | Avantage fort + **contrainte annoncée** |

## R13. Procédure de modification

1. Modifier ce registre. 2. Modifier `data/*.yaml`. 3. Lancer `python3 outils/valider.py` puis `python3 outils/generer.py`. 4. Corriger les exemples textuels (B, F, G). 5. Noter la modification dans `Z_audit.md`.
