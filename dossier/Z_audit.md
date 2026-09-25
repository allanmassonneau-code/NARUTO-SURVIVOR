# Audit synthétique

État au terme de cette version du dossier. Les comptes proviennent de `outils/generer.py` ; les contrôles de `outils/valider.py` (0 erreur, 0 avertissement) et de `outils/tests_validateur.py` (10/10). Ces contrôles portent sur la **cohérence des données**, pas sur un jeu jouable : aucun test de jeu n'a été réalisé.

## Z1. Comptes réels du catalogue

| Catalogue | Cible du brief | Réel | Statut |
|---|---|---|---|
| Entrées jouables | 80 (≥ 40 distincts) | 80 (56 distincts + 24 variantes) | ✔ |
| Fiches approfondies de personnages | 24 | 24 | ✔ |
| Techniques de base | 320 | 320 (répartition exacte §R6) | ✔ |
| Fiches approfondies de techniques (8 niveaux) | 48 | 48 | ✔ |
| Évolutions et fusions | 120 | 120 (95 évolutions, 17 fusions, 8 éveils) | ✔ |
| Synergies | 80 | 80 | ✔ |
| Passifs | 60 | 60 | ✔ |
| Équipements | 40 | 40 (21 ordinaires, 14 rares, 5 interdits) | ✔ |
| Transformations | ≥ 24 | 24 | ✔ |
| Ultimes | ≥ 40 | 44 | ✔ |
| Cartes (dont intégrales) | 20 (4) | 20 (4 : MAP_001, 002, 006, 012) | ✔ |
| Boss (dont intégraux) | 40 (6) | 40 (6 intégraux, 6 détaillés) | ✔ |
| Archétypes ennemis (dont élites) | 100 (25) | 100 (25) | ✔ |
| Missions | 200 | 200 (toutes atteignables) | ✔ |
| Secrets | 60 | 60 | ✔ |
| Builds assemblés | 40 (tous les prioritaires) | 40 (24 prioritaires couverts) | ✔ |
| Fiches VFX | 20 | 20 | ✔ |
| Briefs d'écrans/scènes | 12 | 12 | ✔ |
| Runs commentées | 3 | 3 | ✔ |

**Statuts de fidélité** — techniques : 192 œuvre adaptée (OA), 108 création originale (CO), 20 attribution à vérifier (AV) ; recettes : 10 OA, 107 CO, 3 AV.

**Répartition des livraisons** (320 techniques) : CONTACT 49, DIFFERE 45, ZONE 44, INVOCATION 37, PROJECTILE 34, SALVE 24, ONDE 24, RAYON 15, CONE 14, ORBITE 12, CHAINE 12, PIEGE 10.

## Z2. Contradictions résolues et modifications reportées

| Sujet | Résolution | Fichiers mis à jour |
|---|---|---|
| Exemple « JUT_001 Kage Bunshin » | Devient **JUT_217** (numérotation par familles) ; valeurs conservées ; règle de plafond explicitée : **rafraîchissement du clone le plus ancien** | Registre §R1, techniques, fiche approfondie, G8.1 |
| Exemple « SYN_001 Conduction » | Conservé ; comportement contre boss isolé ajouté (1 arc à 40 %) | Synergies, G8.1 |
| Rasengan et Rasenshuriken | Rasengan en famille « Clan et héritage » avec aptitude `APT_RASEN` ; Rasenshuriken = **fusion** (EVO_096), pas une technique de base | Registre §R5/§R6 |
| « Laser Circus » | Technique de **Ranton** de Darui (vérifiée) : JUT_151 ; l'entrée Raiton JUT_065 est devenue la création originale « Traits chercheurs » | Techniques |
| Boss de la mission d'introduction | Kakashi (test des clochettes, 25 % PV) au lieu de Zabuza ; le prototype garde Zabuza ; la tranche verticale utilise MAP_002 (Haku + Zabuza) | A6, B2.5, H1 |
| Nombre d'ultimes | 44 (≥ 40) pour éviter des partages artificiels | Registre §R1 |
| Taille des pools | Les pools admissibles vont de 26 à 147 techniques : ajout d'un **échantillonnage stratifié plafonné à 40** | B6.3 |
| Synergies inactives en mode principal | SYN_016, 022, 023, 024, 033 remplacées par des synergies utilisables par au moins un personnage | Synergies |
| Genjutsu de Kakashi | Ajout de `APT_GEN` à Kakashi (Narakumi) | Personnages |
| Rouleau interdit sans transformation admissible | Choix entre deux objets interdits ; refus toujours possible | B6.8 |
| Doublons de récompense | Rang S+ et mode Expérimental n'étaient débloqués qu'une fois (MIS_020 pour S+, SEC_042 pour Expérimental) ; SEC_041 devient « Variantes de cartes » | Missions, secrets |
| Chakra | Rôle unique : jauge d'ultime ; aucune attaque automatique ne le consomme | B4.7 |
| Anti-synergies | Interactions négatives intentionnelles documentées (glace sur eau, feu sur bois, recul dans les zones, Évaporation contre Conduction) | B8.4, synergies |

## Z3. Vérification des attributions

Les attributions ont d'abord été rédigées de mémoire. Une **vérification ciblée** a ensuite été faite sur Narutopedia pour les points les plus incertains ou structurants :

| Point vérifié | Résultat | Action |
|---|---|---|
| Laser Circus | Technique de Ranton de Darui | JUT_151 confirmé (OA) ; JUT_065 renommé en création originale |
| Suiton : Suidanha (Water Severing Wave) | Technique de Tobirama | Confirmé (signature de Tobirama) |
| Fūton : Shinkū Gyoku / Shinkū Taigyoku | Techniques existantes (Danzō cité pour la version « grande sphère ») | JUT_075 et JUT_077 passent en OA |
| Raiton : Shichū Shibari (Four Pillar Bind) | Existe ; 4 piliers reliés par des éclairs | JUT_058 passe en OA |
| Raiton : « Sandā Gēto » | Non confirmé sur la source officielle consultée | JUT_067 renommé « Porte du tonnerre » (création originale) |
| Hyōton : Tsubame Fubuki | Technique de Fubuki Kakuyoku (film) ; Haku seulement dans des jeux | JUT_130 annoté (adaptation assumée) |
| Poudre d'or de Rasa | « Magnet Release: Gold Dust Imperial Funeral » | JUT_138 renommé « Jiton — Sakin Taisō » (OA) |
| Sable de fer | « Iron Sand: World Order » = Satetsu Kaihō (sphère à pointes) ; « Gathering Assault » = Satetsu Kesshū | JUT_137 renommé ; EVO_046 renommé en création originale |
| « Mushidama » | Non vérifié | JUT_293 renommé « Balles d'insectes » (CO) |
| « Renkūdan » | Balle d'air associée à Shukaku ; correspondance du nom japonais non confirmée | JUT_079 annoté, reste AV |

Sources consultées : [Storm Release: Laser Circus](https://naruto.fandom.com/wiki/Storm_Release:_Laser_Circus) · [Water Release: Water Severing Wave](https://naruto.fandom.com/wiki/Water_Release:_Water_Severing_Wave) · [Wind Release: Vacuum Sphere](https://naruto.fandom.com/wiki/Wind_Release:_Vacuum_Sphere) · [Wind Release: Vacuum Great Sphere](https://naruto.fandom.com/wiki/Wind_Release:_Vacuum_Great_Sphere) · [Lightning Release: Four Pillar Bind](https://naruto.fandom.com/wiki/Lightning_Release:_Four_Pillar_Bind) · [Ice Release: Swallow Snow Storm](https://naruto.fandom.com/wiki/Ice_Release:_Swallow_Snow_Storm) · [Magnet Release: Gold Dust Imperial Funeral](https://naruto.fandom.com/wiki/Magnet_Release:_Gold_Dust_Imperial_Funeral) · [Iron Sand Gathering Assault](https://naruto.fandom.com/wiki/Iron_Sand_Gathering_Assault) (résumés de recherche ; les pages n'ont pas été lues intégralement).

**Reste à vérifier** : les 20 techniques et 3 recettes marquées AV, ainsi que les **utilisateurs** attribués aux techniques OA (l'existence d'une technique a été vérifiée pour quelques-unes seulement). Tâche H-DOC-01 : relecture documentaire complète avant toute publication.

## Z4. Hypothèses restantes (à tester)

* Toutes les valeurs numériques : dégâts, délais, PV des ennemis et des boss, courbe d'XP (niv. 40 vers 20:00), durées de combat de boss (2–4 min), taux de réussite par rang, coûts de production (≈ 3 000 jours-personne pour la 1.0).
* Lisibilité à 28 px et à 640 × 360 : à confirmer sur la tranche verticale (captures ×1 et test des 3 secondes).
* Performance : 500 ennemis et 1 000 projectiles à 60 i/s sur la machine de référence (sprint 0).
* Plafonds (8 unités, 300 fragments, 200 événements secondaires par tick, 16 cibles par chaîne) : valeurs de départ, à ajuster sans changer leur nature de règle.
* Satisfaction : tous les indicateurs du §H6 sont des hypothèses d'observation.

## Z5. Ce qui n'est pas encore produit (explicitement)

| Élément | État |
|---|---|
| Tables numériques de 8 niveaux au format de production | Faites pour les 48 fiches approfondies (texte) et pour JUT_217 (format de données, §G8.1) ; **à produire** pour les 272 autres techniques (valeurs de niveau 1 et règles déjà définies) |
| Valeurs numériques structurées des 120 recettes | Décrites en texte ; format structuré à produire |
| Scripts de vagues | 2 écrits (VAG_001 MAP_002 Standard, VAG_002 MAP_001 expédition) ; **18 cartes restantes à scripter** |
| Schémas JSON formels | Techniques et recettes ; autres catalogues décrits en tableau (§G8) |
| Tests d'exécution (enfermement, solveur de zones sûres, déterminisme, budget par tick) | Spécifiés (§H7), non implémentés |
| Fiches VFX supplémentaires | 20 livrées ; une fiche par évolution sera nécessaire en production |
| Ressources artistiques et sonores | Aucune (dossier de préproduction) |
| Relecture juridique de la licence | Prérequis bloquant R-01, non traité |

## Z6. Risques majeurs

1. **Licence** (R-01) : bloquant pour toute publication.
2. **Lisibilité de fin de partie** (R-02) : c'est la promesse centrale ; tests dès la tranche verticale.
3. **Coût des boss immenses** (R-03) : réduction à 3 immenses en 1.0.
4. **Performance** (R-04) : mesure dès le sprint 0.
5. **Équilibrage d'un grand catalogue** (R-05) : 1.0 à 100 techniques, simulations automatiques.

## Z7. Critères de validation du prototype

1. **30 secondes agréables** : 6 testeurs sur 8 notent le déplacement et la première attaque ≥ 4/5.
2. **Aucune injustice de contrôle** : 0 blocage par obstacle ou ennemi en 20 runs ; les diagonales et l'arrêt se comportent comme décrit (§B1.2–B1.3).
3. **Clarté des dégâts** : les testeurs expliquent la cause de 90 % de leurs pertes de PV importantes.
4. **Montée de niveau fluide** : choix en < 5 s en moyenne dès le 3e niveau ; 0 carte sans effet proposée.
5. **Performance** : tick ≤ 4 ms (95e centile) avec 500 ennemis et 1 000 projectiles sur la machine de référence.
6. **Déterminisme** : même graine et mêmes entrées → même état après 5 minutes (même build, même plateforme).

## Z8. Point de reprise

Le catalogue demandé est complet dans cette version. Pour une continuation (« CONTINUE ») : reprendre au **tableau Z5**, en commençant par les deux techniques de la tranche verticale qui n'ont pas encore de fiche sur 8 niveaux (**JUT_135** Cascade de sable, puis **JUT_087** Œil du cyclone), puis les scripts de vagues de MAP_001 (Standard) et MAP_004. Décisions à conserver : registre des conventions, identifiants stables, validation obligatoire (`python3 outils/valider.py`) avant toute génération.
