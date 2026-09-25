<!-- Fichier généré par outils/generer.py depuis data/ — ne pas modifier à la main. -->

# Missions — 200 entrées

Toutes atteignables (vérifié par simulation de déblocage dans `outils/valider.py`).

| ID | Nom | Type / mode | Carte | Entrée requise | Rang | Condition | Récompenses | Dépendances |
|---|---|---|---|---|---|---|---|---|
| MIS_001 | **Examen d'entrée à la simulation** | scenario / Expedition | MAP_001 | TOUS | D | Survivre 8 min et vaincre Kakashi (version d'entraînement, 25 % PV). | 150 Ryō ; — ; Archives Ninja ; écran de Doctrine visible (verrouillé) | — |
| MIS_002 | **Rang C — Le pont de Tazuna** | scenario / Standard | MAP_002 | TOUS | D | Vaincre Zabuza. | 300 Ryō ; MAP_003 ; — | MIS_001 |
| MIS_003 | **Examen chūnin — La Forêt de la Mort** | scenario / Standard | MAP_003 | TOUS | D | Vaincre Orochimaru. | 350 Ryō ; MAP_004 ; Doctrine débloquée | MIS_002 |
| MIS_004 | **Examen chūnin — La finale** | scenario / Standard | MAP_004 | TOUS | D | Vaincre Gaara. | 400 Ryō ; MAP_005, MAP_008 ; — | MIS_003 |
| MIS_005 | **Poursuite de Sasuke** | scenario / Standard | MAP_005 | TOUS | C | Vaincre Kimimaro. | 400 Ryō ; MAP_006 ; — | MIS_004 |
| MIS_006 | **La Vallée de la Fin** | scenario / Standard | MAP_006 | TOUS | C | Vaincre le rival (Sasuke ou Naruto selon l'entrée jouée). | 450 Ryō ; MAP_007 ; Rang B | MIS_005 |
| MIS_007 | **Le repaire du serpent** | scenario / Standard | MAP_007 | TOUS | C | Vaincre Kabuto. | 450 Ryō ; MAP_009 ; — | MIS_006 |
| MIS_008 | **Sauvetage du Kazekage** | scenario / Standard | MAP_008 | TOUS | C | Vaincre Sasori. | 450 Ryō ; MAP_010, MAP_011 ; — | MIS_004 |
| MIS_009 | **Les frères Uchiha** | scenario / Standard | MAP_009 | TOUS | B | Vaincre Itachi. | 500 Ryō ; — ; Cosmétique : bandeau rayé | MIS_007 |
| MIS_010 | **La brume de Kiri** | scenario / Standard | MAP_010 | TOUS | B | Vaincre Kisame. | 500 Ryō ; MAP_018 ; — | MIS_008 |
| MIS_011 | **Le duo immortel** | scenario / Standard | MAP_011 | TOUS | B | Vaincre Kakuzu. | 500 Ryō ; MAP_012 ; — | MIS_008 |
| MIS_012 | **La pluie de Pain** | scenario / Standard | MAP_012 | TOUS | B | Vaincre Pain. | 550 Ryō ; MAP_013 ; Rang A | MIS_011 |
| MIS_013 | **La nuit du Kyūbi** | scenario / Standard | MAP_013 | TOUS | B | Vaincre Kurama. | 550 Ryō ; MAP_014 ; — | MIS_012 |
| MIS_014 | **Le Sommet des Kage** | scenario / Standard | MAP_014 | TOUS | A | Vaincre Danzō. | 600 Ryō ; MAP_015 ; — | MIS_013 |
| MIS_015 | **Les falaises de Kumo** | scenario / Standard | MAP_015 | TOUS | A | Vaincre Hachibi. | 600 Ryō ; MAP_016 ; — | MIS_014 |
| MIS_016 | **La quatrième grande guerre** | scenario / Standard | MAP_016 | TOUS | A | Vaincre Kinkaku et Ginkaku. | 650 Ryō ; MAP_017 ; Rang S | MIS_015 |
| MIS_017 | **La division du désert** | scenario / Standard | MAP_017 | TOUS | A | Vaincre Mū. | 650 Ryō ; MAP_019 ; — | MIS_016 |
| MIS_018 | **Le lac de la tortue** | scenario / Standard | MAP_018 | TOUS | A | Vaincre Sanbi. | 600 Ryō ; — ; Cosmétique : carapace | MIS_010 |
| MIS_019 | **L'autre dimension** | scenario / Standard | MAP_019 | TOUS | S | Vaincre Obito. | 700 Ryō ; MAP_020 ; — | MIS_017 |
| MIS_020 | **Le champ final** | scenario / Standard | MAP_020 | TOUS | S | Vaincre Madara. | 1000 Ryō ; — ; Mode Endless, Boss Rush, rang S+ | MIS_019 |
| MIS_021 | **Défi de clan — Uchiha** | defi_clan / Standard | MAP_009 | TOUS | C | Terminer avec 3 techniques exclusives au clan Uchiha équipées. | 400 Ryō ; — ; Technique de départ alternative Uchiha : JUT_002 pour Sasuke | MIS_009 |
| MIS_022 | **Défi de clan — Hyūga** | defi_clan / Standard | MAP_004 | TOUS | C | Terminer avec 3 techniques Hyūga ; aucun projectile possédé. | 400 Ryō ; — ; Doctrine « Poing souple » | MIS_004 |
| MIS_023 | **Défi de clan — Nara** | defi_clan / Standard | MAP_011 | TOUS | C | Lier 300 ennemis par l'ombre dans une run. | 400 Ryō ; — ; Doctrine « Stratège » | MIS_011 |
| MIS_024 | **Défi de clan — Akimichi** | defi_clan / Standard | MAP_005 | TOUS | C | Éliminer 500 ennemis au CONTACT. | 400 Ryō ; — ; Cosmétique Akimichi | MIS_005 |
| MIS_025 | **Défi de clan — Yamanaka** | defi_clan / Standard | MAP_013 | TOUS | C | Faire éliminer 200 ennemis par des ennemis confus. | 400 Ryō ; — ; Doctrine « Esprit » | MIS_013 |
| MIS_026 | **Défi de clan — Aburame** | defi_clan / Standard | MAP_003 | TOUS | C | Déclencher 100 Éclosions. | 400 Ryō ; — ; Cosmétique : lunettes noires | MIS_003 |
| MIS_027 | **Défi de clan — Inuzuka** | defi_clan / Standard | MAP_001 | TOUS | C | Avoir 3 unités ANIMAL simultanées pendant 60 s. | 400 Ryō ; — ; Doctrine « Meute » | MIS_002 |
| MIS_028 | **Défi de clan — Uzumaki** | defi_clan / Standard | MAP_013 | TOUS | B | Terminer avec un sceau et une technique d'héritage (Rasengan). | 450 Ryō ; — ; Relance +1 (permanent) | MIS_013 |
| MIS_029 | **Défi de clan — Senju** | defi_clan / Standard | MAP_020 | TOUS | B | Couvrir 300 cellules de BOIS simultanément. | 450 Ryō ; — ; Cosmétique : armure Senju | MIS_020 |
| MIS_030 | **Défi de clan — Kaguya** | defi_clan / Standard | MAP_005 | TOUS | B | Parer 150 projectiles. | 450 Ryō ; — ; Doctrine « Danse des os » | MIS_005 |
| MIS_031 | **Défi de clan — Hōzuki** | defi_clan / Standard | MAP_010 | TOUS | B | Terminer sans jamais subir de dégâts de contact deux fois en 3 s. | 450 Ryō ; — ; Cosmétique : gourde | MIS_010 |
| MIS_032 | **Défi de clan — Sarutobi** | defi_clan / Standard | MAP_001 | TOUS | B | Posséder 4 affinités élémentaires différentes à 15:00. | 450 Ryō ; — ; Doctrine « Professeur » | MIS_012 |
| MIS_033 | **Défi élémentaire — Katon** | defi_element / Standard | MAP_013 | TOUS | C | Pool restreint aux techniques E_KATON + OUTIL ; vaincre le boss. | 400 Ryō ; — ; Doctrine « Flamme » | MIS_013 |
| MIS_034 | **Défi élémentaire — Suiton** | defi_element / Standard | MAP_010 | TOUS | C | Pool Suiton + OUTIL ; vaincre le boss. | 400 Ryō ; — ; Doctrine « Marée » | MIS_010 |
| MIS_035 | **Défi élémentaire — Raiton** | defi_element / Standard | MAP_015 | TOUS | C | Pool Raiton + OUTIL ; vaincre le boss. | 400 Ryō ; — ; Doctrine « Foudre » | MIS_015 |
| MIS_036 | **Défi élémentaire — Fūton** | defi_element / Standard | MAP_008 | TOUS | C | Pool Fūton + OUTIL ; vaincre le boss. | 400 Ryō ; — ; Doctrine « Vent » | MIS_008 |
| MIS_037 | **Défi élémentaire — Doton** | defi_element / Standard | MAP_017 | TOUS | C | Pool Doton + OUTIL ; vaincre le boss. | 400 Ryō ; — ; Doctrine « Terre » | MIS_017 |
| MIS_038 | **Défi élémentaire — Conduction** | defi_element / Standard | MAP_012 | TOUS | B | Déclencher 500 Conductions. | 450 Ryō ; — ; Archive de synergie SYN_001 complète | MIS_012 |
| MIS_039 | **Défi élémentaire — Embrasement** | defi_element / Standard | MAP_003 | TOUS | B | Embraser 2 000 cellules d'huile. | 450 Ryō ; — ; EQP_029 ajouté au pool des Rouleaux | MIS_003 |
| MIS_040 | **Défi élémentaire — Affinités rares** | defi_element / Standard | MAP_016 | TOUS | B | Terminer avec 3 techniques de famille RARE. | 500 Ryō ; — ; Doctrine « Lignée » | MIS_016 |
| MIS_041 | **Défi élémentaire — Cinq natures** | defi_element / Standard | MAP_016 | TOUS | A | Activer SYN_071 avant 15:00. | 550 Ryō ; — ; EQP_033 ajouté au pool | MIS_016 |
| MIS_042 | **Défi élémentaire — Sans élément** | defi_element / Standard | MAP_004 | TOUS | B | Terminer avec uniquement des techniques E_NEUTRE. | 450 Ryō ; — ; Doctrine « Corps et outils » | MIS_004 |
| MIS_043 | **Boss Rush — Pays des Vagues à l'examen** | boss_rush / BossRush | MAP_004 | TOUS | C | Enchaîner BOS_002, BOS_001, BOS_003, BOS_004. | 600 Ryō ; — ; Passage +1 (permanent) | MIS_020 |
| MIS_044 | **Boss Rush — Akatsuki I** | boss_rush / BossRush | MAP_012 | TOUS | B | Enchaîner Deidara, Sasori, Hidan, Kakuzu. | 650 Ryō ; — ; Cosmétique : anneau | MIS_043 |
| MIS_045 | **Boss Rush — Akatsuki II** | boss_rush / BossRush | MAP_012 | TOUS | B | Enchaîner Kisame, Itachi, Konan, Pain. | 700 Ryō ; — ; Bannissement +1 (permanent) | MIS_044 |
| MIS_046 | **Boss Rush — Géants** | boss_rush / BossRush | MAP_020 | TOUS | A | Enchaîner Shukaku, Sanbi, Hachibi, Kurama. | 750 Ryō ; — ; Cosmétique : sceau | MIS_045 |
| MIS_047 | **Boss Rush — Guerre** | boss_rush / BossRush | MAP_016 | TOUS | A | Enchaîner Kinkaku et Ginkaku, Mū, Hanzō, Obito. | 800 Ryō ; — ; — | MIS_046 |
| MIS_048 | **Boss Rush — Légendes** | boss_rush / BossRush | MAP_020 | TOUS | S | Enchaîner Danzō, Madara, Madara (Dix-Queues). | 1000 Ryō ; — ; Titre « Légende » | MIS_047 |
| MIS_049 | **Draft — Premier tirage** | draft / Draft | MAP_002 | TOUS | C | Mode Draft : avant la run, choisir 6 techniques parmi 12 proposées (compatibles) ; aucune nouvelle technique en jeu ; vaincre le boss. | 500 Ryō ; — ; Mode Draft permanent | MIS_006 |
| MIS_050 | **Draft — Sans passifs** | draft / Draft | MAP_006 | TOUS | B | Draft ; passifs limités à 3. | 550 Ryō ; — ; — | MIS_049 |
| MIS_051 | **Draft — Aveugle** | draft / Draft | MAP_011 | TOUS | B | Draft : les 6 techniques sont tirées sans voir leur nom (icônes seules). | 550 Ryō ; — ; — | MIS_049 |
| MIS_052 | **Draft — Recette imposée** | draft / Draft | MAP_012 | TOUS | B | Réaliser la fusion proposée par le draft avant 16:00. | 600 Ryō ; — ; Indice de fusion aléatoire en Archives | MIS_049 |
| MIS_053 | **Draft — Équipe de trois** | draft / Draft | MAP_016 | TOUS | A | Trois runs courtes enchaînées avec trois entrées différentes (les deux autres donnent 1 passif chacune à la troisième). | 800 Ryō ; — ; Cosmétique : bannière d'équipe | MIS_050 |
| MIS_054 | **Draft — Maître du hasard** | draft / Draft | MAP_020 | TOUS | S | Draft rang S sans Relance ni Bannissement. | 900 Ryō ; — ; — | MIS_053 |
| MIS_055 | **Expédition — Terrains d'entraînement** | expedition / Expedition | MAP_001 | TOUS | C | Terminer l'expédition courte (12 min). | 250 Ryō ; — ; — | MIS_001 |
| MIS_056 | **Expédition — Pont** | expedition / Expedition | MAP_002 | TOUS | C | Terminer l'expédition courte. | 250 Ryō ; — ; — | MIS_002 |
| MIS_057 | **Expédition — Forêt de la Mort** | expedition / Expedition | MAP_003 | TOUS | C | Terminer l'expédition courte. | 250 Ryō ; — ; — | MIS_003 |
| MIS_058 | **Expédition — Stade** | expedition / Expedition | MAP_004 | TOUS | C | Terminer l'expédition courte. | 250 Ryō ; — ; — | MIS_004 |
| MIS_059 | **Expédition — Forêt frontalière** | expedition / Expedition | MAP_005 | TOUS | C | Terminer l'expédition courte. | 250 Ryō ; — ; — | MIS_005 |
| MIS_060 | **Expédition — Vallée de la Fin** | expedition / Expedition | MAP_006 | TOUS | C | Terminer l'expédition courte. | 300 Ryō ; — ; — | MIS_006 |
| MIS_061 | **Expédition — Suna** | expedition / Expedition | MAP_008 | TOUS | C | Terminer l'expédition courte. | 300 Ryō ; — ; — | MIS_008 |
| MIS_062 | **Expédition — Kiri** | expedition / Expedition | MAP_010 | TOUS | C | Terminer l'expédition courte. | 300 Ryō ; — ; — | MIS_010 |
| MIS_063 | **Expédition — Amegakure** | expedition / Expedition | MAP_012 | TOUS | C | Terminer l'expédition courte. | 300 Ryō ; — ; — | MIS_012 |
| MIS_064 | **Expédition — Plaine de la guerre** | expedition / Expedition | MAP_016 | TOUS | C | Terminer l'expédition courte. | 350 Ryō ; — ; — | MIS_016 |
| MIS_065 | **Endless — 30 minutes** | endless / Endless | MAP_016 | TOUS | C | Tenir 30 min en Endless. | 500 Ryō ; — ; — | MIS_020 |
| MIS_066 | **Endless — 45 minutes** | endless / Endless | MAP_016 | TOUS | C | Tenir 45 min. | 700 Ryō ; — ; — | MIS_065 |
| MIS_067 | **Endless — 60 minutes** | endless / Endless | MAP_020 | TOUS | C | Tenir 60 min. | 900 Ryō ; — ; Cosmétique : aura d'endurance | MIS_066 |
| MIS_068 | **Endless — Chasse aux boss** | endless / Endless | MAP_020 | TOUS | B | Vaincre 5 boss tournants dans une même partie Endless. | 800 Ryō ; — ; — | MIS_065 |
| MIS_069 | **Endless — Sans soin** | endless / Endless | MAP_012 | TOUS | B | Tenir 30 min sans soin (Régénération comprise). | 800 Ryō ; — ; — | MIS_065 |
| MIS_070 | **Endless — Dix mille** | endless / Endless | MAP_016 | TOUS | B | Éliminer 10 000 ennemis en une partie. | 900 Ryō ; — ; Titre « Catastrophe naturelle » | MIS_065 |
| MIS_071 | **Et si… Minato défendait le pont** | hors_chrono / Standard | MAP_002 | CHR_041 | B | Vaincre Zabuza avec Minato en rang B. | 500 Ryō ; — ; Cosmétique : cape de Hokage alternative | MIS_141 |
| MIS_072 | **Et si… Haku rencontrait Gaara** | hors_chrono / Standard | MAP_004 | CHR_053 | B | Vaincre Gaara avec Haku. | 500 Ryō ; — ; — | MIS_153 |
| MIS_073 | **Et si… les Sannin se retrouvaient** | hors_chrono / Standard | MAP_003 | CHR_027 | B | Vaincre Orochimaru avec Jiraiya en rang B. | 500 Ryō ; — ; — | MIS_127 |
| MIS_074 | **Et si… Itachi protégeait Konoha** | hors_chrono / Standard | MAP_013 | CHR_031 | A | Vaincre Kurama avec Itachi. | 600 Ryō ; — ; — | MIS_131 |
| MIS_075 | **Et si… Guy affrontait Madara plus tôt** | hors_chrono / Standard | MAP_020 | CHR_045 | A | Vaincre Madara avec Guy sans la Porte de la mort. | 800 Ryō ; — ; — | MIS_145 |
| MIS_076 | **Et si… le Tsuchikage défiait le joueur** | hors_chrono / Standard | MAP_017 | TOUS | A | Vaincre Ōnoki (boss de mission). | 600 Ryō ; — ; — | MIS_017 |
| MIS_077 | **Et si… Kushina gardait la nuit** | hors_chrono / Standard | MAP_013 | CHR_077 | A | Vaincre Kurama avec Kushina. | 600 Ryō ; — ; Cosmétique | MIS_177 |
| MIS_078 | **Et si… Sasori revenait à Suna** | hors_chrono / Standard | MAP_008 | CHR_037 | B | Vaincre Deidara (lieutenant promu boss) avec Sasori. | 500 Ryō ; — ; — | MIS_137 |
| MIS_079 | **Et si… Hashirama visitait la Vallée** | hors_chrono / Standard | MAP_006 | CHR_059 | A | Vaincre le rival avec Hashirama. | 600 Ryō ; — ; — | MIS_159 |
| MIS_080 | **Et si… Pain frappait Kiri** | hors_chrono / Standard | MAP_010 | CHR_039 | A | Vaincre Kisame avec Pain. | 600 Ryō ; — ; — | MIS_139 |
| MIS_081 | **Et si… Killer Bee chantait au Pays des Vagues** | hors_chrono / Standard | MAP_002 | CHR_058 | B | Terminer avec 100 coups sur le 4e temps. | 500 Ryō ; — ; — | MIS_158 |
| MIS_082 | **Et si… Kakashi ANBU surveillait Orochimaru** | hors_chrono / Standard | MAP_007 | CHR_010 | A | Vaincre Kabuto avec Kakashi ANBU. | 600 Ryō ; — ; — | MIS_110 |
| MIS_083 | **Et si… Tobirama sondait le lac** | hors_chrono / Standard | MAP_018 | CHR_060 | A | Vaincre Sanbi avec Tobirama. | 600 Ryō ; — ; — | MIS_160 |
| MIS_084 | **Et si… Shisui arrêtait la guerre** | hors_chrono / Standard | MAP_016 | CHR_078 | S | Vaincre Kinkaku et Ginkaku avec Shisui en rang S. | 800 Ryō ; — ; — | MIS_178 |
| MIS_085 | **Et si… Konohamaru passait l'examen** | hors_chrono / Standard | MAP_004 | CHR_079 | C | Vaincre Gaara avec Konohamaru. | 400 Ryō ; — ; Cosmétique : écharpe | MIS_179 |
| MIS_086 | **Maîtrise — Première évolution** | systeme / Standard | MAP_002 | TOUS | D | Réaliser une évolution. | 200 Ryō ; — ; Écran des recettes dans les Archives | MIS_002 |
| MIS_087 | **Maîtrise — Première fusion** | systeme / Standard | MAP_004 | TOUS | C | Réaliser une fusion. | 300 Ryō ; — ; Indice de fusion | MIS_086 |
| MIS_088 | **Maîtrise — Premier éveil** | systeme / Standard | MAP_012 | TOUS | B | Réaliser un éveil. | 500 Ryō ; — ; — | MIS_087 |
| MIS_089 | **Maîtrise — Rouleau interdit** | systeme / Standard | MAP_007 | TOUS | C | Accepter un Rouleau interdit et terminer la run. | 300 Ryō ; EQP_036 ; EQP_036 ajouté au pool des Rouleaux interdits | MIS_007 |
| MIS_090 | **Maîtrise — Vingt synergies** | systeme / Standard | MAP_012 | TOUS | C | Découvrir 20 synergies différentes (cumul). | 400 Ryō ; — ; Quatrième carte (Voie du quatrième sceau) achetable | MIS_086 |
| MIS_091 | **Maîtrise — Quarante synergies** | systeme / Standard | MAP_016 | TOUS | B | Découvrir 40 synergies (cumul). | 600 Ryō ; — ; Relance +1 (permanent) | MIS_090 |
| MIS_092 | **Maîtrise — Contrôle du hasard** | systeme / Standard | MAP_003 | TOUS | C | Utiliser 5 Bannissements dans une run et vaincre le boss. | 300 Ryō ; — ; — | MIS_045 |
| MIS_093 | **Maîtrise — Survie** | systeme / Standard | MAP_005 | TOUS | C | Déclencher Kawarimi 3 fois et survivre. | 300 Ryō ; — ; — | MIS_005 |
| MIS_094 | **Maîtrise — Géant** | systeme / Standard | MAP_009 | TOUS | B | Éliminer 100 ennemis avec une invocation géante. | 400 Ryō ; — ; — | MIS_009 |
| MIS_095 | **Maîtrise — Transformations** | systeme / Standard | MAP_013 | TOUS | B | Utiliser 10 transformations différentes (cumul). | 600 Ryō ; — ; — | MIS_013 |
| MIS_096 | **Maîtrise — Pacifiste temporaire** | systeme / Standard | MAP_001 | TOUS | D | Survivre la première minute sans éliminer d'ennemi (esquive seule). | 150 Ryō ; — ; Option d'assistance « déplacement seul » expliquée | MIS_001 |
| MIS_097 | **Maîtrise — Tous les rôles** | systeme / Standard | MAP_016 | TOUS | B | Éliminer au moins 50 ennemis de chacun des 9 rôles en une run. | 500 Ryō ; — ; — | MIS_016 |
| MIS_098 | **Maîtrise — Collection d'équipements** | systeme / Standard | MAP_008 | TOUS | C | Obtenir 25 équipements différents (cumul). | 500 Ryō ; EQP_031 ; — | MIS_008 |
| MIS_099 | **Maîtrise — Archives complètes du rang C** | systeme / Standard | MAP_004 | TOUS | C | Vaincre les 10 premiers boss au rang C. | 600 Ryō ; — ; Rang C+ en Boss Rush | MIS_010 |
| MIS_100 | **Maîtrise — Cent recettes** | systeme / Standard | MAP_020 | TOUS | A | Découvrir 100 recettes (évolutions, fusions, éveils). | 1500 Ryō ; — ; Prestige optionnel | MIS_088 |
| MIS_101 | **Maîtrise — Naruto Uzumaki** | maitrise / Standard | MAP_001 | CHR_001 | D | Atteindre le niveau de maîtrise 2 avec Naruto. | 300 Ryō ; — ; Technique de départ alternative et cosmétique de maîtrise | MIS_001 |
| MIS_102 | **Maîtrise avancée — Naruto — Mode Ermite** | recrutement / Standard | MAP_009 | CHR_001 | B | Avec Naruto (maîtrise 4) : rester immobile au total 120 s pendant une run réussie. | 250 Ryō ; CHR_002 ; Fiche d'Archives du personnage | MIS_009 |
| MIS_103 | **Maîtrise avancée — Naruto — Chakra de Kurama** | recrutement / Standard | MAP_013 | CHR_001 | B | Avec Naruto (maîtrise 7) : vaincre Kurama. | 250 Ryō ; CHR_003 ; Fiche d'Archives du personnage | MIS_013 |
| MIS_104 | **Maîtrise — Sasuke Uchiha** | maitrise / Standard | MAP_001 | CHR_004 | D | Atteindre le niveau de maîtrise 2 avec Sasuke. | 300 Ryō ; — ; Technique de départ alternative et cosmétique de maîtrise | MIS_001 |
| MIS_105 | **Maîtrise avancée — Sasuke — Taka** | recrutement / Standard | MAP_007 | CHR_004 | B | Avec Sasuke (maîtrise 4) : vaincre Kabuto avec une technique OUTIL de mêlée équipée. | 250 Ryō ; CHR_005 ; Fiche d'Archives du personnage | MIS_007 |
| MIS_106 | **Maîtrise avancée — Sasuke — Mangekyō éternel** | recrutement / Standard | MAP_009 | CHR_004 | B | Avec Sasuke (maîtrise 7) : vaincre Itachi. | 250 Ryō ; CHR_006 ; Fiche d'Archives du personnage | MIS_009 |
| MIS_107 | **Maîtrise — Sakura Haruno** | maitrise / Standard | MAP_001 | CHR_007 | D | Atteindre le niveau de maîtrise 2 avec Sakura. | 300 Ryō ; — ; Technique de départ alternative et cosmétique de maîtrise | MIS_001 |
| MIS_108 | **Maîtrise — Kakashi Hatake** | maitrise / Standard | MAP_001 | CHR_008 | D | Atteindre le niveau de maîtrise 2 avec Kakashi. | 300 Ryō ; — ; Technique de départ alternative et cosmétique de maîtrise | MIS_001 |
| MIS_109 | **Maîtrise avancée — Kakashi — Kamui** | recrutement / Standard | MAP_019 | CHR_008 | B | Avec Kakashi (maîtrise 6) : éliminer 300 ennemis par Kamui. | 250 Ryō ; CHR_009 ; Fiche d'Archives du personnage | MIS_019 |
| MIS_110 | **Maîtrise avancée — Kakashi — ANBU** | recrutement / Standard | MAP_014 | CHR_008 | B | Avec Kakashi (maîtrise 3) : terminer une run avec 50 éliminations de dos. | 250 Ryō ; CHR_010 ; Fiche d'Archives du personnage | MIS_014 |
| MIS_111 | **Maîtrise avancée — Sakura — Byakugō** | recrutement / Standard | MAP_016 | CHR_007 | B | Avec Sakura (maîtrise 5) : soigner 3 000 PV en une run. | 250 Ryō ; CHR_011 ; Fiche d'Archives du personnage | MIS_016 |
| MIS_112 | **Recrutement — Gaara** | recrutement / Standard | MAP_004 | TOUS | C | Vaincre Gaara (n'importe quelle entrée). | 250 Ryō ; CHR_012 ; Fiche d'Archives du personnage | MIS_004 |
| MIS_113 | **Maîtrise avancée — Gaara — Kazekage** | recrutement / Standard | MAP_008 | CHR_012 | B | Avec Gaara (maîtrise 5) : vaincre Sasori. | 250 Ryō ; CHR_013 ; Fiche d'Archives du personnage | MIS_008, MIS_112 |
| MIS_114 | **Recrutement — Rock Lee** | recrutement / Standard | MAP_004 | TOUS | C | Éliminer 1 000 ennemis au CONTACT (cumul, toutes entrées). | 250 Ryō ; CHR_014 ; Fiche d'Archives du personnage | MIS_003 |
| MIS_115 | **Maîtrise avancée — Rock Lee — Poing ivre** | recrutement / Standard | MAP_004 | CHR_014 | B | Avec Rock Lee (maîtrise 3) : terminer une run en ouvrant 5 Portes. | 250 Ryō ; CHR_015 ; Fiche d'Archives du personnage | MIS_004, MIS_114 |
| MIS_116 | **Recrutement — Neji Hyūga** | recrutement / Standard | MAP_004 | TOUS | C | Vaincre Gaara sans subir plus de 10 projectiles au boss. | 250 Ryō ; CHR_016 ; Fiche d'Archives du personnage | MIS_004 |
| MIS_117 | **Recrutement — Hinata Hyūga** | recrutement / Standard | MAP_004 | TOUS | C | Terminer une run en ayant bloqué 100 projectiles (boucliers). | 250 Ryō ; CHR_017 ; Fiche d'Archives du personnage | MIS_004 |
| MIS_118 | **Maîtrise avancée — Hinata — Poings de lion** | recrutement / Standard | MAP_012 | CHR_017 | B | Avec Hinata (maîtrise 4) : vaincre Pain. | 250 Ryō ; CHR_018 ; Fiche d'Archives du personnage | MIS_012, MIS_117 |
| MIS_119 | **Recrutement — Shikamaru Nara** | recrutement / Standard | MAP_005 | TOUS | C | Immobiliser 200 ennemis (toute source) dans une run réussie. | 250 Ryō ; CHR_019 ; Fiche d'Archives du personnage | MIS_005 |
| MIS_120 | **Maîtrise avancée — Shikamaru — Héritier d'Asuma** | recrutement / Standard | MAP_011 | CHR_019 | B | Avec Shikamaru (maîtrise 4) : vaincre Hidan. | 250 Ryō ; CHR_020 ; Fiche d'Archives du personnage | MIS_011, MIS_119 |
| MIS_121 | **Recrutement — Shino Aburame** | recrutement / Standard | MAP_003 | TOUS | C | Appliquer 2 000 cumuls de Parasité ou de Poison (cumul). | 250 Ryō ; CHR_021 ; Fiche d'Archives du personnage | MIS_003 |
| MIS_122 | **Recrutement — Kiba Inuzuka** | recrutement / Standard | MAP_001 | TOUS | C | Avoir 2 compagnons ANIMAL simultanés pendant 30 s. | 250 Ryō ; CHR_022 ; Fiche d'Archives du personnage | MIS_002 |
| MIS_123 | **Maîtrise avancée — Kiba — Garōga** | recrutement / Standard | MAP_005 | CHR_022 | B | Avec Kiba (maîtrise 5) : vaincre Kimimaro. | 250 Ryō ; CHR_023 ; Fiche d'Archives du personnage | MIS_005, MIS_122 |
| MIS_124 | **Recrutement — Kankurō** | recrutement / Standard | MAP_008 | TOUS | C | Éliminer 300 ennemis avec des unités alliées dans une run. | 250 Ryō ; CHR_024 ; Fiche d'Archives du personnage | MIS_004 |
| MIS_125 | **Maîtrise avancée — Kankurō — Marionnette de Sasori** | recrutement / Standard | MAP_008 | CHR_024 | B | Avec Kankurō (maîtrise 5) : vaincre Sasori. | 250 Ryō ; CHR_025 ; Fiche d'Archives du personnage | MIS_008, MIS_124 |
| MIS_126 | **Recrutement — Temari** | recrutement / Standard | MAP_004 | TOUS | C | Repousser 1 000 ennemis (recul) dans une run. | 250 Ryō ; CHR_026 ; Fiche d'Archives du personnage | MIS_004 |
| MIS_127 | **Recrutement — Jiraiya** | recrutement / Standard | MAP_003 | TOUS | C | Embraser 500 cellules d'huile (cumul). | 250 Ryō ; CHR_027 ; Fiche d'Archives du personnage | MIS_003 |
| MIS_128 | **Maîtrise avancée — Jiraiya — Mode Ermite** | recrutement / Standard | MAP_012 | CHR_027 | B | Avec Jiraiya (maîtrise 5) : vaincre Pain. | 250 Ryō ; CHR_028 ; Fiche d'Archives du personnage | MIS_012, MIS_127 |
| MIS_129 | **Recrutement — Tsunade** | recrutement / Standard | MAP_003 | TOUS | C | Terminer une run avec plus de 1 000 PV soignés. | 250 Ryō ; CHR_029 ; Fiche d'Archives du personnage | MIS_003 |
| MIS_130 | **Recrutement — Orochimaru** | recrutement / Standard | MAP_003 | TOUS | C | Vaincre Orochimaru au rang C. | 250 Ryō ; CHR_030 ; Fiche d'Archives du personnage | MIS_003 |
| MIS_131 | **Recrutement — Itachi Uchiha** | recrutement / Standard | MAP_009 | TOUS | C | Vaincre Itachi. | 250 Ryō ; CHR_031 ; Fiche d'Archives du personnage | MIS_009 |
| MIS_132 | **Maîtrise avancée — Itachi — Réanimé** | recrutement / Standard | MAP_016 | CHR_031 | B | Avec Itachi (maîtrise 6) : terminer la Plaine de la guerre. | 250 Ryō ; CHR_032 ; Fiche d'Archives du personnage | MIS_016, MIS_131 |
| MIS_133 | **Recrutement — Kisame Hoshigaki** | recrutement / Standard | MAP_010 | TOUS | C | Vaincre Kisame. | 250 Ryō ; CHR_033 ; Fiche d'Archives du personnage | MIS_010 |
| MIS_134 | **Maîtrise avancée — Kisame — Maître des requins** | recrutement / Standard | MAP_010 | CHR_033 | B | Avec Kisame (maîtrise 5) : maintenir 300 cellules d'EAU. | 250 Ryō ; CHR_034 ; Fiche d'Archives du personnage | MIS_010, MIS_133 |
| MIS_135 | **Recrutement — Deidara** | recrutement / Standard | MAP_008 | TOUS | C | Détruire 200 obstacles avec des explosions (cumul). | 250 Ryō ; CHR_035 ; Fiche d'Archives du personnage | MIS_008 |
| MIS_136 | **Maîtrise avancée — Deidara — Artiste aérien** | recrutement / Standard | MAP_015 | CHR_035 | B | Avec Deidara (maîtrise 6) : vaincre Hachibi. | 250 Ryō ; CHR_036 ; Fiche d'Archives du personnage | MIS_015, MIS_135 |
| MIS_137 | **Recrutement — Sasori** | recrutement / Standard | MAP_008 | TOUS | C | Vaincre Sasori. | 250 Ryō ; CHR_037 ; Fiche d'Archives du personnage | MIS_008 |
| MIS_138 | **Maîtrise avancée — Sasori — Troisième Kazekage** | recrutement / Standard | MAP_017 | CHR_037 | B | Avec Sasori (maîtrise 5) : vaincre Mū. | 250 Ryō ; CHR_038 ; Fiche d'Archives du personnage | MIS_017, MIS_137 |
| MIS_139 | **Recrutement — Pain (Chemin des Dieux)** | recrutement / Standard | MAP_012 | TOUS | C | Vaincre Pain. | 250 Ryō ; CHR_039 ; Fiche d'Archives du personnage | MIS_012 |
| MIS_140 | **Maîtrise avancée — Pain — Six Chemins** | recrutement / Standard | MAP_020 | CHR_039 | B | Avec Pain (maîtrise 6) : terminer le Champ final. | 250 Ryō ; CHR_040 ; Fiche d'Archives du personnage | MIS_020, MIS_139 |
| MIS_141 | **Recrutement — Minato Namikaze** | recrutement / Standard | MAP_013 | TOUS | C | Vaincre Kurama. | 250 Ryō ; CHR_041 ; Fiche d'Archives du personnage | MIS_013 |
| MIS_142 | **Maîtrise avancée — Minato — Chakra de Kurama** | recrutement / Standard | MAP_020 | CHR_041 | B | Avec Minato (maîtrise 6) : vaincre Madara. | 250 Ryō ; CHR_042 ; Fiche d'Archives du personnage | MIS_020, MIS_141 |
| MIS_143 | **Recrutement — Madara Uchiha** | recrutement / Standard | MAP_020 | TOUS | C | Vaincre Madara. | 250 Ryō ; CHR_043 ; Fiche d'Archives du personnage | MIS_020 |
| MIS_144 | **Maîtrise avancée — Madara — Rinnegan** | recrutement / Standard | MAP_020 | CHR_043 | B | Avec Madara (maîtrise 7) : vaincre Madara au rang S. | 250 Ryō ; CHR_044 ; Fiche d'Archives du personnage | MIS_020, MIS_143 |
| MIS_145 | **Recrutement — Might Guy** | recrutement / Standard | MAP_004 | TOUS | C | Avec Rock Lee : vaincre Gaara. | 250 Ryō ; CHR_045 ; Fiche d'Archives du personnage | MIS_004 |
| MIS_146 | **Recrutement — Ino Yamanaka** | recrutement / Standard | MAP_013 | TOUS | C | Faire éliminer 100 ennemis par des ennemis confus (cumul). | 250 Ryō ; CHR_046 ; Fiche d'Archives du personnage | MIS_013 |
| MIS_147 | **Recrutement — Chōji Akimichi** | recrutement / Standard | MAP_005 | TOUS | C | Terminer une run avec plus de 180 PV max. | 250 Ryō ; CHR_047 ; Fiche d'Archives du personnage | MIS_005 |
| MIS_148 | **Recrutement — Tenten** | recrutement / Standard | MAP_004 | TOUS | C | Lancer 5 000 projectiles OUTIL (cumul). | 250 Ryō ; CHR_048 ; Fiche d'Archives du personnage | MIS_004 |
| MIS_149 | **Maîtrise avancée — Tenten — Trésors du Sage** | recrutement / Standard | MAP_016 | CHR_048 | B | Avec Tenten (maîtrise 5) : vaincre Kinkaku et Ginkaku. | 250 Ryō ; CHR_049 ; Fiche d'Archives du personnage | MIS_016, MIS_148 |
| MIS_150 | **Recrutement — Sai** | recrutement / Standard | MAP_014 | TOUS | C | Éliminer 500 ennemis avec des unités alliées (cumul). | 250 Ryō ; CHR_050 ; Fiche d'Archives du personnage | MIS_014 |
| MIS_151 | **Recrutement — Yamato** | recrutement / Standard | MAP_013 | TOUS | C | Créer 200 structures (murs, cages, arbres) (cumul). | 250 Ryō ; CHR_051 ; Fiche d'Archives du personnage | MIS_012 |
| MIS_152 | **Recrutement — Asuma Sarutobi** | recrutement / Standard | MAP_011 | TOUS | C | Vaincre Kakuzu. | 250 Ryō ; CHR_052 ; Fiche d'Archives du personnage | MIS_011 |
| MIS_153 | **Recrutement — Haku** | recrutement / Standard | MAP_002 | TOUS | C | Vaincre Haku (lieutenant) sans être gelé ni entravé. | 250 Ryō ; CHR_053 ; Fiche d'Archives du personnage | MIS_002 |
| MIS_154 | **Recrutement — Zabuza Momochi** | recrutement / Standard | MAP_002 | TOUS | C | Vaincre Zabuza au rang C. | 250 Ryō ; CHR_054 ; Fiche d'Archives du personnage | MIS_002 |
| MIS_155 | **Recrutement — Konan** | recrutement / Standard | MAP_012 | TOUS | C | Vaincre Konan (lieutenant). | 250 Ryō ; CHR_055 ; Fiche d'Archives du personnage | MIS_012 |
| MIS_156 | **Recrutement — Hidan** | recrutement / Standard | MAP_011 | TOUS | C | Vaincre Hidan. | 250 Ryō ; CHR_056 ; Fiche d'Archives du personnage | MIS_011 |
| MIS_157 | **Recrutement — Kakuzu** | recrutement / Standard | MAP_011 | TOUS | C | Vaincre Kakuzu en détruisant ses 4 masques. | 250 Ryō ; CHR_057 ; Fiche d'Archives du personnage | MIS_011 |
| MIS_158 | **Recrutement — Killer Bee** | recrutement / Standard | MAP_015 | TOUS | C | Vaincre Killer Bee (lieutenant). | 250 Ryō ; CHR_058 ; Fiche d'Archives du personnage | MIS_015 |
| MIS_159 | **Recrutement — Hashirama Senju** | recrutement / Standard | MAP_020 | TOUS | C | Couvrir 100 cellules de BOIS (cumul, toutes entrées). | 250 Ryō ; CHR_059 ; Fiche d'Archives du personnage | MIS_020 |
| MIS_160 | **Recrutement — Tobirama Senju** | recrutement / Standard | MAP_016 | TOUS | C | Réaliser 50 esquives parfaites en une run. | 250 Ryō ; CHR_060 ; Fiche d'Archives du personnage | MIS_016 |
| MIS_161 | **Recrutement — Obito Uchiha (Tobi)** | recrutement / Standard | MAP_019 | TOUS | C | Vaincre Obito. | 250 Ryō ; CHR_061 ; Fiche d'Archives du personnage | MIS_019 |
| MIS_162 | **Maîtrise avancée — Obito — Jinchūriki du Dix-Queues** | recrutement / Standard | MAP_020 | CHR_061 | B | Avec Obito (maîtrise 7) : vaincre Madara. | 250 Ryō ; CHR_062 ; Fiche d'Archives du personnage | MIS_020, MIS_161 |
| MIS_163 | **Recrutement — Kabuto Yakushi** | recrutement / Standard | MAP_007 | TOUS | C | Vaincre Kabuto. | 250 Ryō ; CHR_063 ; Fiche d'Archives du personnage | MIS_007 |
| MIS_164 | **Maîtrise avancée — Kabuto — Mode Ermite serpent** | recrutement / Standard | MAP_016 | CHR_063 | B | Avec Kabuto (maîtrise 6) : sceller 20 réanimés. | 250 Ryō ; CHR_064 ; Fiche d'Archives du personnage | MIS_016, MIS_163 |
| MIS_165 | **Recrutement — Hiruzen Sarutobi** | recrutement / Standard | MAP_013 | TOUS | C | Posséder 4 affinités élémentaires dans une run réussie. | 250 Ryō ; CHR_065 ; Fiche d'Archives du personnage | MIS_013 |
| MIS_166 | **Recrutement — Kurenai Yūhi** | recrutement / Standard | MAP_013 | TOUS | C | Appliquer 500 contrôles de genjutsu (cumul). | 250 Ryō ; CHR_066 ; Fiche d'Archives du personnage | MIS_013 |
| MIS_167 | **Recrutement — Kimimaro Kaguya** | recrutement / Standard | MAP_005 | TOUS | C | Vaincre Kimimaro. | 250 Ryō ; CHR_067 ; Fiche d'Archives du personnage | MIS_005 |
| MIS_168 | **Recrutement — Mei Terumī** | recrutement / Standard | MAP_010 | TOUS | C | Corroder 300 ennemis (cumul). | 250 Ryō ; CHR_068 ; Fiche d'Archives du personnage | MIS_010 |
| MIS_169 | **Recrutement — Ōnoki** | recrutement / Standard | MAP_017 | TOUS | C | Vaincre Mū. | 250 Ryō ; CHR_069 ; Fiche d'Archives du personnage | MIS_017 |
| MIS_170 | **Recrutement — A (Quatrième Raikage)** | recrutement / Standard | MAP_014 | TOUS | C | Vaincre A (lieutenant) au Sommet des Kage. | 250 Ryō ; CHR_070 ; Fiche d'Archives du personnage | MIS_014 |
| MIS_171 | **Recrutement — Darui** | recrutement / Standard | MAP_015 | TOUS | C | Déclencher 300 Conductions (cumul). | 250 Ryō ; CHR_071 ; Fiche d'Archives du personnage | MIS_015 |
| MIS_172 | **Recrutement — Pakura** | recrutement / Standard | MAP_008 | TOUS | C | Terminer Suna avec une technique Katon et une Fūton. | 250 Ryō ; CHR_072 ; Fiche d'Archives du personnage | MIS_008 |
| MIS_173 | **Recrutement — Rasa (Quatrième Kazekage)** | recrutement / Standard | MAP_017 | TOUS | C | Aimanter 300 ennemis (cumul). | 250 Ryō ; CHR_073 ; Fiche d'Archives du personnage | MIS_017 |
| MIS_174 | **Recrutement — Chiyo** | recrutement / Standard | MAP_008 | TOUS | C | Avec une entrée APT_MARIO : vaincre Sasori. | 250 Ryō ; CHR_074 ; Fiche d'Archives du personnage | MIS_008 |
| MIS_175 | **Recrutement — Karin** | recrutement / Standard | MAP_007 | TOUS | C | Survivre 60 s sous 20 % de PV (cumul dans une run). | 250 Ryō ; CHR_075 ; Fiche d'Archives du personnage | MIS_007 |
| MIS_176 | **Recrutement — Suigetsu Hōzuki** | recrutement / Standard | MAP_007 | TOUS | C | Vaincre Jūgo (lieutenant). | 250 Ryō ; CHR_076 ; Fiche d'Archives du personnage | MIS_007 |
| MIS_177 | **Recrutement — Kushina Uzumaki** | recrutement / Standard | MAP_013 | TOUS | C | Entraver 300 ennemis (cumul). | 250 Ryō ; CHR_077 ; Fiche d'Archives du personnage | MIS_013 |
| MIS_178 | **Recrutement — Shisui Uchiha** | recrutement / Standard | MAP_009 | TOUS | C | Réaliser 30 esquives parfaites en une run. | 250 Ryō ; CHR_078 ; Fiche d'Archives du personnage | MIS_009 |
| MIS_179 | **Recrutement — Konohamaru Sarutobi** | recrutement / Standard | MAP_001 | TOUS | C | Réaliser 3 runs avec 3 entrées différentes. | 250 Ryō ; CHR_079 ; Fiche d'Archives du personnage | MIS_002 |
| MIS_180 | **Recrutement — Mū (Deuxième Tsuchikage)** | recrutement / Standard | MAP_017 | TOUS | C | Éliminer 200 ennemis avec des techniques Jinton ou Kamui (cumul). | 250 Ryō ; CHR_080 ; Fiche d'Archives du personnage | MIS_017 |
| MIS_181 | **Rang S — Pont sans brume** | expert / Standard | MAP_002 | TOUS | S | Vaincre Zabuza au rang S sans être touché par l'Assassinat silencieux. | 900 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_182 | **Rang S — Examen parfait** | expert / Standard | MAP_004 | TOUS | S | Vaincre Gaara au rang S en moins de 3 min de combat. | 900 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_183 | **Rang S — Vallée en crue** | expert / Standard | MAP_006 | TOUS | S | Terminer la Vallée de la Fin au rang S. | 900 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_184 | **Rang S — Pluie éternelle** | expert / Standard | MAP_012 | TOUS | S | Vaincre Pain au rang S. | 900 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_185 | **Rang S — Nuit rouge** | expert / Standard | MAP_013 | TOUS | S | Vaincre Kurama au rang S. | 900 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_186 | **Rang S — Sommet glacé** | expert / Standard | MAP_014 | TOUS | S | Vaincre Danzō au rang S. | 900 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_187 | **Rang S — Orage de Kumo** | expert / Standard | MAP_015 | TOUS | S | Vaincre Hachibi au rang S. | 900 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_188 | **Rang S — Champ final** | expert / Standard | MAP_020 | TOUS | S | Vaincre Madara au rang S. | 900 Ryō ; — ; Cosmétique d'expert | MIS_020 |
| MIS_189 | **Rang S+ — Champ final** | expert / Standard | MAP_020 | TOUS | S+ | Vaincre Madara (Dix-Queues) au rang S+. | 1100 Ryō ; — ; Cosmétique d'expert ; titre | MIS_188 |
| MIS_190 | **Rang S+ — Dimension de Kamui** | expert / Standard | MAP_019 | TOUS | S+ | Vaincre Obito au rang S+. | 1100 Ryō ; — ; Cosmétique d'expert ; titre | MIS_188 |
| MIS_191 | **Rang S+ — Amegakure** | expert / Standard | MAP_012 | TOUS | S+ | Vaincre Pain au rang S+. | 1100 Ryō ; — ; Cosmétique d'expert ; titre | MIS_188 |
| MIS_192 | **Rang S+ — Repaire Uchiha** | expert / Standard | MAP_009 | TOUS | S+ | Vaincre Itachi au rang S+. | 1100 Ryō ; — ; Cosmétique d'expert ; titre | MIS_188 |
| MIS_193 | **Expert — Sans évolution** | expert / Standard | MAP_016 | TOUS | A | Vaincre le boss au rang A sans évolution ni fusion. | 800 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_194 | **Expert — Signature seule niveau 8** | expert / Standard | MAP_010 | TOUS | A | Terminer au rang A en n'améliorant que la technique signature jusqu'à 15:00. | 800 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_195 | **Expert — Trois techniques** | expert / Standard | MAP_011 | TOUS | A | Terminer au rang A avec au plus 3 techniques. | 800 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_196 | **Expert — Sans esquive** | expert / Standard | MAP_008 | TOUS | A | Terminer au rang A sans utiliser l'esquive. | 800 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_197 | **Expert — Passifs interdits** | expert / Standard | MAP_018 | TOUS | A | Terminer au rang A sans aucun passif. | 800 Ryō ; — ; Cosmétique d'expert | MIS_016 |
| MIS_198 | **Expert — Aucun soin** | expert / Standard | MAP_017 | TOUS | S | Terminer au rang S sans aucun soin. | 900 Ryō ; — ; Cosmétique d'expert | MIS_188 |
| MIS_199 | **Expert — Toutes les cartes** | expert / Standard | MAP_020 | TOUS | A | Vaincre les 20 boss finaux au rang A (cumul). | 800 Ryō ; — ; Cosmétique d'expert | MIS_020 |
| MIS_200 | **Expert — Légende du shinobi** | expert / Standard | MAP_020 | TOUS | S+ | Vaincre Kaguya (secret SEC_020 requis). | 1100 Ryō ; — ; Cosmétique d'expert ; titre | MIS_189 |
