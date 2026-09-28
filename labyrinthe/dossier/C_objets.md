# C — Bible des objets : pipeline de tir, pools, inventaire, synergies

Implémentation : `37_objets.js` (profil, statistiques, pools), `34_tir.js` (émission, trajectoires, impacts), `40_actifs.js`, `41_familiers.js`, `42_evenements.js`. Les listes complètes sont dans [F_catalogues.md](F_catalogues.md).

## C1. Pipeline de tir

Un objet modifie **une étape** sans réécrire les autres. Le profil d’attaque est recalculé à chaque acquisition, retrait, bonus temporaire ou changement de talisman.

| Étape | Données du profil | Exemples d’objets |
|---|---|---|
| 1. Source | joueur, marionnette (Kankurō : tirs depuis Karasu), familiers copieurs | PSV_023 clone de relais, FAM_CLONE_SABLE |
| 2. Lancement (forme principale) | une forme parmi 13 (C3) | PSV_001 orbe, PSV_014 rayon, PSV_016 faisceau, PSV_013 boomerang… |
| 3. Géométrie du cycle | `multi` (émissions), `arriere`, `croix`, `salve` | PSV_002/003/004, PSV_025, PSV_026, PSV_024 |
| 4. Trajectoire | `guidage`, `rebond`, `percant`, `spectral`, `orbite`, `onde`, `lent`, `acceleration`, `retour`, `continu`, `arc` | PSV_005–012, PSV_031 |
| 5. Collisions | rayon ennemi (dépend des dégâts et de la taille), rayon décor 2 px, percement, cibles déjà touchées | PSV_008, PSV_042 |
| 6. Impact | `explosion`, `chaine`, `eclat`, `onde`, `mine`, `flamme`, `flaque` | PSV_027–030, PSV_149 |
| 7. Effets secondaires | statuts : brûlure, poison, ralenti, immobilisé, confus, charme, peur, gel | PSV_043–053 |

**Émission** : `dégâts d’émission = dégâts × coefDégâts du profil × coefficient de charge × coefficient de multitir`.

**Budget et générations** (anti-récursion, §R40) : chaque cycle porte un identifiant, un budget de **14 déclenchements secondaires** et chaque effet une **génération**. Génération maximale par type d’impact : explosion 2, chaîne 2, onde 2, flamme 2, flaque 2, éclat 1, mine 1. Un éclat n’éclate pas, une mine ne pose pas de mine (SYN_038). Quand le budget est épuisé, les impacts restants du cycle ne déclenchent plus d’effet secondaire — l’impact primaire, lui, s’applique toujours (aucune attaque supprimée au hasard).

## C2. Les 24 comportements majeurs (brief §17)

| Comportement | Objet de référence | Forme ou propriété |
|---|---|---|
| Tir simple | tir de base de tous les personnages | `projectile` |
| Salve | PSV_024 Arsenal de Tenten (empreinte) | `salve` +2 (tirs à 0,07 s d’intervalle, cadence ×0,8) |
| Éventail | PSV_003 Éventail de kunai | `multi` +2, pas de 10° |
| Tir arrière | PSV_025 Œil arrière | `arriere` 0,8 |
| Croix | PSV_026 Croix de sceaux | `croix` 20 % + 5 %/chance (60 % max) |
| Charge | PSV_001 Empreinte du Rasengan ; Sasuke | `orbe` ; `charge_libre` |
| Rayon | PSV_014 Canon de chakra | `rayon` (charge 1,0 s, 0,33 s actif) |
| Faisceau continu | PSV_016 Souffle continu | `faisceau` (tics de 0,1 s tant que la visée est tenue) |
| Orbe lent | PSV_012 Baika (expansion) | trajectoire `lent` (vitesse ×0,55, taille ×2, dégâts ×2) |
| Boomerang | PSV_013 Fūma shuriken | `boomerang` (perce tout, revient) |
| Ricochet | PSV_007 Fil de chakra | `rebond` (3 rebonds) |
| Percement | PSV_008 Senbon perforant | `percant` |
| Guidage | PSV_005, PSV_006 | `guidage` (force 1 ou 2,5) |
| Orbite | PSV_010 Sable en orbite | `orbite` |
| Attaque circulaire | PSV_022 Rotation céleste | `rotation` |
| Frappe courte | PSV_018 Tantō de l’ANBU ; Rock Lee | `lame` |
| Frappe étendue | PSV_017 Empreinte du Kubikiribōchō | `lame_longue` |
| Bombe lancée | PSV_019 Argile explosive C1 | `bombe` (trajectoire en arc, explosion 1,3 tuile) |
| Mine | PSV_027 Parchemins-pièges | impact `mine` |
| Chaîne | PSV_028 Chidori nagashi (empreinte) | impact `chaine` (2 sauts, 3 tuiles, 50 %) |
| Onde | PSV_029 Poing de Doton | impact `onde` (1,2 tuile, 50 %) |
| Frappe différée au sol | PSV_020 Chute céleste | `frappe` (réticule, ×8) |
| Tir depuis familier | PSV_023 Clone de relais | familier `copieur` (75 %) |
| Émission contrôlée à distance | PSV_021 Sphère téléguidée | `controle` |

## C3. Priorité des remplacements et contributions secondaires (§R17)

Quand plusieurs formes sont possédées, **la plus prioritaire devient le tir principal** ; les autres ne disparaissent pas, elles apportent une contribution définie :

| Priorité | Forme | Si elle est seulement secondaire… |
|---|---|---|
| 1 | frappe (réticule, météore) | un cycle sur trois déclenche aussi une frappe au sol |
| 2 | controle (sphère guidée) | une sphère contrôlée d’appoint (×0,5) |
| 3 | rayon | le tir principal devient spectral, perce tout, dégâts ×1,3 |
| 4 | faisceau | les impacts laissent un court faisceau |
| 5 | orbe | le tir principal devient chargeable |
| 6 | charge_libre | idem (chargeable) |
| 7 | lame_longue | coup d’appoint devant soi à chaque cycle |
| 8 | lame | coup d’appoint devant soi à chaque cycle |
| 9 | bombe | explosion d’impact (rayon 1 tuile, ×0,5) |
| 10 | boomerang | les tirs reviennent |
| 11 | laser | un trait d’appoint par cycle (×0,5) |
| 12 | rotation | tirer dévie les projectiles ennemis proches |
| 13 | projectile | — |

Les deux ordres de ramassage donnent le même profil (le calcul part toujours de la liste complète).

## C4. Compatibilités entre la forme principale et les modificateurs

| Forme principale | + multitir | + guidage | + percement | + élément / statut | + impact |
|---|---|---|---|---|---|
| projectile | n émissions (coefficient C5) | oui | oui | oui | oui |
| orbe | n sphères partagent la charge (SYN_001) | oui (SYN_002) | cumul avec les 2 cibles de base | oui | oui (SYN_003) |
| charge_libre | n shuriken chargés | oui | pleine charge : perce 2 + chaîne | oui | oui |
| rayon | **n rayons en éventail** (±0,16 rad), chacun au coefficient (SYN_005) | sans effet (règle affichée) | le rayon traverse déjà : +20 % de dégâts (SYN_006) | oui | chaîne à chaque tic |
| faisceau | **n faisceaux en éventail**, chacun au coefficient | sans effet | déjà traversant | oui | — |
| laser | n traits (SYN_029) | sans effet | déjà traversant | oui | oui |
| boomerang | n fūma | suit la cible puis revient (SYN_007) | déjà perce tout | oui | à chaque contact, budget 14 (SYN_039) |
| bombe | n bombes | oui | sans effet (la bombe explose au contact) | l’élément modifie l’explosion (SYN_009) | cumul |
| lame / lame_longue | un seul coup : arc +20° et dégâts +15 % par émission supplémentaire | sans effet | sans effet | oui | impacts au contact |
| frappe | **sans effet** : un seul météore (SYN_035, affiché) | le réticule ne se guide pas (SYN_057) | sans effet | oui (SYN_010) | oui |
| controle | la sphère gagne le coefficient total de multitir (SYN_034) | sans effet | sans effet | oui | oui |
| rotation | sans effet | sans effet | sans effet | oui | — |

Un « sans effet » est une **règle affichée** dans la description détaillée de l’objet (bouton Description), jamais une suppression silencieuse.

## C5. Multitir

Coefficient par émission selon le nombre total d’émissions *n* : 1 → 1 ; 2 → 0,70 ; 3 → 0,58 ; 4 → 0,50 ; 5 → 0,45 ; 6 → 0,42 ; 7 → 0,40 ; 8 et plus → 0,38 (plafond de 8 émissions). Deux émissions partent en parallèle (décalage latéral ±5 px, ±2°) ; à partir de trois, en éventail de pas min(10°, 60° / (n − 1)). Le débit monocible augmente seulement si les émissions touchent la même cible (B4.3, calcul 2).

## C6. Pools, poids et déplétion (brief §18)

| Pool | Source | Objets de poids non nul |
|---|---|---|
| heritage | salle d’héritage, repli général | 145 |
| boss | récompense de boss, épreuve de jōnin | 55 |
| boutique | échoppe | 68 |
| pacte | pacte interdit, coffres piégés (35 %) | 44 |
| sanctuaire | sanctuaire des ermites | 27 |
| bibliotheque | bibliothèque d’empreintes (choix lié de 2) | 39 |
| cache | cache de renseignements | 9 |
| coffre | coffre verrouillé (12 %) | 8 |
| machine | loterie (1,5 %), informateurs | 6 |
| isolee | chambre isolée (75 %) | 3 |
| defi | épreuve chūnin | 3 |

Un objet appartient à plusieurs pools avec des poids différents (notation des données `H3 B1` : héritage 3, boss 1) et n’est compté qu’une fois dans le catalogue.

**Cycle de vie d’un objet dans une partie** :

| État | Définition | Effet sur les pools |
|---|---|---|
| Aperçu | vu sur un piédestal (journal « vus ») | aucun |
| Généré | tiré pour un piédestal | **retiré de tous les pools pour la partie** (déplétion au tirage) |
| Pris | acquis par le joueur | reste retiré ; compte pour les ensembles |
| Relancé | remplacé sur son piédestal | l’ancien reste retiré ; le nouveau est tiré du **même pool** |
| Retiré | perdu (permutation, Kakuzu altéré) | reste retiré ; compte toujours pour les ensembles déjà acquis |

**Filtres avant tirage** (et seulement ceux-là) : objet déjà généré ; contenu non débloqué ; objet réservé à un autre personnage ; objet réellement sans fonction pour ce personnage (liste `exclusion` de drapeaux : le Sceau de régénération PSV_087 et les talismans TAL_005, TAL_013, TAL_017, qui ne font que soigner ou dépendre de la vitalité, ne sont jamais tirés pour Sasori). Les récompenses ne sont pas filtrées pour « construire » le build : on garde la surprise et le compromis.

**Sélection** : tirage pondéré sur les candidats restants (poids du pool, normalisés après filtrage ; poids nuls exclus). **Épuisement** : si un pool est vide, repli sur le pool héritage ; s’il est vide aussi, *Bol de ramen* (PSV_083 : +1 contenant, soin complet), qui peut apparaître plusieurs fois.

**Qualité interne 0–4** : sert aux prix (10, 10, 15, 20, 25 Ryō ; pacte : 1 contenant jusqu’à la qualité 2, 2 contenants au-delà), aux filtres de certaines relances et aux tests. Elle n’est **pas affichée** comme une rareté de loot.

**Relances** : piédestal ou salle (*Réécriture d’empreinte* ACT_001, *Sceau de réécriture* CON_024) — chaque objet est retiré depuis son propre pool ; les choix liés restent liés ; les objets-clés de route (PSV_900, PSV_901) ne sont jamais relancés ; les prix de l’échoppe sont recalculés selon la qualité du nouvel objet (règle système), une solde est conservée ; sans piédestal admissible, l’activation n’est **pas consommée**. *Rituel de permutation* (ACT_031, CON_028) remplace chaque passif possédé (hors objets-clés) par un passif tiré du pool héritage ; les compagnons suivent leur objet, les contenants et ressources déjà donnés ne sont ni repris ni redonnés, et les objets perdus restent comptés pour les ensembles.

**Flux** : le butin utilise le flux `butin` de l’étage ; les récompenses de fin de salle, un flux dérivé de la salle ; particules et sons n’ont aucune influence.

## C7. Inventaire (brief §16)

| Emplacement | Par défaut | Extensions | Remplacement |
|---|---|---|---|
| Passifs | illimités | — | ne se déséquipent pas (sauf permutation, rituels) |
| Actif | 1 | Kakashi : 2 (échange avec le bouton supérieur gauche) | l’ancien actif reste sur le piédestal **avec ses charges** (anti-duplication) |
| Talisman | 1 | « talisman double » : 2 | l’ancien tombe à vos pieds |
| Poche | 1 | « poche double » : 2 | l’ancien consommable tombe à vos pieds |

**Doublons** — trois catégories : *cumul* (effet additionné ; la plupart des objets de statistiques), *conversion* (le doublon est converti en un effet documenté ; 1 objet), *unique* (jamais proposé une seconde fois : 12 passifs, surtout les formes de tir, et tous les actifs). Comme tout objet généré est retiré des pools, un doublon ne peut venir que d’une source exceptionnelle (départ de contrat, permutation). **Un doublon ne compte jamais deux fois pour un ensemble.**

**Dépôt** : maintenir *Déposer* 0,8 s pose le talisman (ou, à défaut, le consommable) au sol, avec jauge de confirmation ; un passif ne se dépose pas.

## C8. Actifs (brief §19) — `40_actifs.js`

- **Charges de salle** : 1 à 12 ; une salle de combat nettoyée donne **1 charge (2 pour une grande salle)**, une seule fois ; épreuves, vagues et boss : 1 (2 en grande arène).
- **Recharge temporelle** : quelques actifs se rechargent en secondes, **seulement pendant un combat** ; pas de recharge en attendant dans une salle vide.
- **Usage unique** : l’actif disparaît après usage.
- **Condensateurs de chakra** : petit (+2 charges), grand (plein). À charge pleine, le condensateur reste au sol. *Surcharge* (drapeau) : capacité doublée.
- **Sans cible** : si l’effet n’a pas de cible valable (aucun ennemi, aucun piédestal), l’activation n’est pas consommée et un son de refus l’indique.
- *Pile de chakra* (TAL_003) : une charge de moins requise (jamais moins de 1).

## C9. Talismans, consommables, pilules

- **Talismans (35)** : effets variés, jamais tous des pourcentages de dégâts : détection (TAL_009 grelot, TAL_035 masque de chat), drops (TAL_001, TAL_025), protection conditionnelle (TAL_007, TAL_033 *Omamori*), bombes (TAL_011, TAL_012, TAL_023, TAL_029), boutique et pactes (TAL_015, TAL_022), compagnons (TAL_010, TAL_020).
- **Consommables (30)** : 22 rouleaux tactiques et 8 sceaux ; icône de rouleau ou de sceau et cadre « poche » distincts des passifs. Effets : téléportation (départ, boss, échoppe, héritage, cache), révélation, bonus de salle ou temporaire, ressources, machines, relance, duplication, permutation, passage.
- **Pilules (15 effets, 15 apparences)** : la correspondance apparence → effet est tirée **par partie** (flux du code de mission). Une pilule prise est identifiée pour toute la partie (les autres exemplaires affichent leur nom). Effets négatifs : faiblesse, lenteur, myopie, malchance, pilule amère (prix d’une demi-unité, jamais mortel), oubli. *Gourde de saké* (TAL_014) identifie toutes les pilules et transforme une pilule négative en son contraire.

## C10. Familiers (brief §20) — `41_familiers.js`

| Comportement | Exemples | Règles |
|---|---|---|
| Suiveur tireur | FAM_CLONE, FAM_GAMAKICHI | chaîne de suiveurs derrière le joueur ; tire dans la direction de visée ; dégâts propres (3 à 3,5) |
| Copieur | FAM_RELAIS (75 %), FAM_CLONE_SABLE (60 %) | copie le tir du joueur (impacts, statuts, trajectoires) au coefficient indiqué, **génération 1** : une copie n’est jamais recopiée |
| Clone de salle | FAM_CLONE_TEMP (50 %) | disparaît au premier coup reçu ou à la sortie de la salle |
| Orbital | FAM_SABLE, FAM_KUNAI_ORB, FAM_SERPENT, FAM_PAPIER, FAM_MIROIR | rayon 0,9 à 1,5 tuile, vitesse de rotation, sens ; bloque les projectiles s’il est « bloquant » ; frappe un même ennemi au plus toutes les 0,3 s |
| Contact | FAM_AKAMARU | charge dans la direction visée, revient, recharge 1,2 s |
| Chasseur | FAM_KARASU_ATT, FAM_TIGRE_ENCRE, FAM_SERPENT_BLANC | poursuit l’ennemi le plus proche, morsure à cadence propre |
| Collecteur | FAM_INSECTES | ramasse Ryō, clés, explosifs ; pique au contact |
| Soutien | FAM_KATSUYU, FAM_CRAPAUD_CLE | toutes les N salles nettoyées, donne une ressource |
| Bloqueur | FAM_SANSHOUO, FAM_POUPEE | se place entre le joueur et l’ennemi le plus proche |
| Kamikaze | FAM_OISEAU_ARGILE | plonge et explose (×3), recharge 4 s (2 s avec SYN_023) |
| Piégeur | FAM_KUROARI | enferme un ennemi non-boss 3 s puis le transperce (×4), recharge 8 s |
| Aveugleur | FAM_CORBEAU | confond un ennemi, recharge 3 s |
| Marionnette | FAM_KARASU (Kankurō) | se place entre le joueur et la direction visée ; source des tirs |
| Pakkun, luciole | FAM_PAKKUN, FAM_LUCIOLE | signal des murs secrets ; lumière dans la pénombre |

Les familiers ne bloquent pas les portes, ne poussent pas le joueur, se replacent à l’entrée de chaque salle. **Multiplicateurs** : *Lunettes noires* (TAL_020) ×1,2 ; *familiers forts* (PSV_151, TRF_011) ×1,25 ; *marionnettes fortes* (TRF_004) ×1,5 sur les marionnettes ; Gamakichi ×1,5 à l’arrêt avec *Nature du sage* (SYN_052). Un essaim décoratif peut compter beaucoup d’insectes dessinés mais **un seul agent logique** par familier.

## C11. Synergies (brief §21)

- **Émergentes** (40) : découlent des règles générales (C1–C5) ; elles sont documentées pour fixer le résultat attendu et le test.
- **Dédiées** (20) : ajoutent un effet déclaré (liste `effets`), actif **dès que tous les composants sont possédés**, quel que soit l’ordre.
- Chaque synergie a un test d’acceptation (catalogue F). Les combinaisons à trois ou quatre objets sont déterministes car le profil se recalcule toujours depuis la liste complète.
- Les déclencheurs (`quand`) utilisent le vocabulaire d’événements (H3), avec chance (éventuellement modulée par la chance, bornée), cooldown, « toutes les N occurrences », condition (santé basse, combat, boss…). Les événements cosmétiques ne déclenchent rien.

### Vingt anti-synergies et compromis intentionnels

| # | Combinaison | Compromis visible |
|---|---|---|
| 1 | Cadence de la fleur de lotus (PSV_041) | cadence ×1,5, **portée −2** |
| 2 | Éventail (PSV_003) contre une cible isolée lointaine | seul le tir central touche : débit ×0,49 |
| 3 | Argile explosive (PSV_019) dans une salle étroite | ses explosions vous blessent (sans TRF_013 / PSV_110) |
| 4 | Baika (PSV_012) | dégâts ×2 mais vitesse ×0,55 : cibles mobiles manquées |
| 5 | Onde de la vague (PSV_011) | couverture accrue, précision réduite |
| 6 | Poids de plomb (PSV_032) | recul énorme qui éloigne les cibles de la mêlée |
| 7 | Rotation céleste (PSV_022) | défense forte, **aucun tir à distance** |
| 8 | Chute céleste (PSV_020) + multitir | aucun gain (un seul météore) |
| 9 | Frappe courte (PSV_018) | forte mais exposée au contact |
| 10 | Chakra du démon (PSV_098) | trois réserves instables contre un contenant |
| 11 | Sceau de la mort (PSV_131) + Canon (PSV_014) | dégâts doublés, deux contenants de moins (SYN_056) |
| 12 | Pactes et branche Lumière | un seul pacte ferme la branche et les sanctuaires |
| 13 | Dés de la grande perdante (PSV_125) | chance −1 pour une loterie à gains doublés |
| 14 | Ailes de papier (PSV_116) | lévitation, portée −0,5 |
| 15 | Nombreux familiers + tir concentré | les familiers dispersent la cible, les coups de mêlée se perdent |
| 16 | Kamui (ACT_021) | intangible 3 s mais **impossible de tirer** |
| 17 | Mèche longue (TAL_012) | explosions plus larges, délai +0,5 s |
| 18 | Sasori (CHR_011) et objets de soin rouge | les soins de vitalité sont ignorés |
| 19 | Kakuzu (CHR_012) blessé | chaque Ryō soigne au lieu d’être gardé : l’économie baisse |
| 20 | Mer de papiers explosifs (PSV_156) | la seconde explosion blesse aussi, en retard |
| 21 | Porte de la Vie (PSV_092) + Lotus (ACT_030) | le lotus coûte de la santé (prix, pas dommage) |

## C12. Transformations d’ensemble (brief §22)

**Ce qui compte** : le nombre d’**identifiants distincts acquis pendant la partie** (liste `acquis`) appartenant à l’ensemble, qu’ils soient encore possédés ou non (un objet relancé ou perdu reste acquis). Un actif compte à sa première prise ; le reprendre sur un piédestal ne compte pas une seconde fois ; un talisman ne compte jamais. Seuil : **3** pour les 13 ensembles. Une transformation obtenue est définitive pour la partie.

Chaque transformation apporte une règle perceptible (tableau F), une **couche de costume** (aura de queues, maquillage, bras de marionnette, cornes, ailes de papier…), un son dédié et une annonce **brève** (bannière de 2,6 s, sans figer le combat).

## C13. Exemples étalons (brief §38)

### PSV_001 — Empreinte du Rasengan (adaptation, héritage 3 / boss 1, qualité 3)

Remplace le tir par une sphère chargée : charge 0,6 s à cadence 2,5 (règle §R8c), dégâts ×3 par cible, portée 5,5 tuiles (+0,5 par tuile de portée au-delà de 6), vitesse 8 tuiles/s, deux cibles distinctes au plus. Maintenir charge, relâcher après charge complète déclenche dans la dernière direction valide ; relâcher avant annule ; *Charge automatique* possible en option. Une sphère ne touche pas deux fois la même cible (liste par projectile). Priorité : orbe (rang 5). Visuel : sphère spiralée pendant la charge, compression à l’impact, anneau bref. Unique.

### PSV_002 — Encre de dédoublement (création originale, héritage 3 / échoppe 1, qualité 2)

+1 émission (deux au total), chacune à 70 %, cadence ×0,90. Débit monocible si les deux touchent : 2 × 0,70 × 0,90 = 1,26 fois la base. Les deux projectiles partent avec ±5 px de décalage latéral et ±2° ; budget d’effets par cycle partagé.

### SYN_001 — Rasengan jumeau (émergente)

PSV_001 + PSV_002 : deux sphères partagent une charge ; 3,5 × 3 × 0,70 = 7,35 par sphère ; charge 0,6 / 0,9 = 0,667 s. Le premier objet fixe la forme, le second la géométrie ; les deux ordres donnent le même profil.

### ACT_001 — Réécriture d’empreinte (création originale, 6 charges)

Relance chaque objet sur piédestal de la salle depuis son propre pool ; pas les ressources, ni les objets-clés, ni les objets acquis. Aucune cible : activation non consommée. Choix liés conservés. Prix de l’échoppe recalculés (règle système). La salle revisitée ne rend aucune charge. Testé automatiquement (actifs, sauvegarde/reprise).
