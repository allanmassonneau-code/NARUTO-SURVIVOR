# F. Trois runs commentées

Runs **fictives de conception** (aucune n'a été jouée : le jeu n'existe pas). Elles n'utilisent que des personnages, objets, recettes et règles déjà définis ; les numéros de niveau suivent la courbe du §B6.1 et le script de vagues VAG_001. Elles servent à vérifier que les règles s'enchaînent et à formuler des hypothèses de test.

---

## F1. Victoire — Naruto, « Armée de clones » (MAP_002, rang C)

**Entrée** : CHR_001 Naruto · carte MAP_002 Pays des Vagues · méta : 1 Relance, 1 Bannissement, 0 Passage achetés · Doctrine : aucune. Build visé : BLD_001 (non garanti).

| Temps | Niveau | Situation | Choix (refusés entre parenthèses) | Commentaire de conception |
|---|---|---|---|---|
| 00:00 | 1 | Naruto au centre du pont, 1 clone toutes les 5 s | — | Le clone (contour bleu) frappe les bandits à 1 m : l'attaque automatique est comprise sans texte |
| 00:25 | 2 | Premières cartes | **Kunai en éventail** (Passif PAS_010 ; Lames de vent) | Choix sûr : une attaque à distance tôt. Refuser les Lames de vent retarde le Rasenshuriken — assumé |
| 00:50 | 3 | Flux par l'est | **Kage Bunshin niv. 2** (PAS_001 ; Daitoppa) | Durée des clones 5 s : deux clones se chevauchent déjà parfois |
| 01:20 | 4 | Brutes de Gatō (chargeurs) | **PAS_030 Esprit d'équipe** (Kunai niv. 2 ; PAS_015) | Anticipation du build de clones |
| 02:10 | 5 | Rouleau B visible sur les échafaudages | Détour de 15 s pour le Rouleau → **EQP_004 Rouleau d'invocation vierge** (EQP_005 ; EQP_006) | Petit choix de route : risque (flux ennemi) contre récompense |
| 03:00 | 6–7 | Tireurs | Kage Bunshin niv. 3 ; **Rasengan** (JUT_281) | Rasengan arrive : les clones qui disparaissent le lancent (CPX) — petites ondes bleues en périphérie : **le visuel confirme la synergie** |
| 04:30 | 8 | **Élite Frères démons** | — | Erreur du joueur : il frappe un frère, l'autre se relève à 50 % (règle de chaîne) ; il se repositionne et tue les deux à 3 s d'intervalle |
| 04:45 | — | Coffre simple | Kage Bunshin niv. 4 : **deux clones** | Premier saut de puissance lisible (2 silhouettes en permanence) |
| 05:30 | 10 | Creux de récupération | PAS_029 Contrat de sang (Kunai niv. 3 ; PAS_002) | Le creux permet de ramasser les fragments laissés près des rambardes |
| 06:00 | — | **Brume de Kiri** (45 s) | — | Visibilité 9 m ; les ennemis restent contourés. Les clones continuent, le joueur survit en restant au centre |
| 07:40 | 12–13 | Anneaux de poursuivants | **Tajū Kage Bunshin** (JUT_218) (Mizu Bunshin non accessible : pas de Suiton) ; PAS_002 | Le pool ne propose que des techniques compatibles (§B6.3) |
| 08:30 | 13–14 | Deux niveaux sans carte pertinente (PAS_018, PAS_017, JUT_245 puis PAS_014, PAS_013, JUT_191) | Choix par défaut : PAS_017 puis Passage refusé (aucune charge) → PAS_014 | Le **filet de pertinence** (S = 2) s'active : au niveau 15, la carte 1 est tirée dans A ∪ C → Kage Bunshin niv. 5 |
| 09:30 | 15–16 | **Lieutenant Haku** | Kage Bunshin niv. 5 (repoussement de la dernière frappe) | Haku en miroirs : Naruto sort par une brèche ; les clones brisent 2 miroirs (400 PV) — fenêtre de 3 s exploitée au Rasengan |
| 10:10 | — | Coffre de lieutenant (3 éléments, +1 Relance) | Tajū niv. 2, Kage Bunshin niv. 6, PAS_030 niv. 2 | 3 éléments : le coffre ne donne jamais de nouvelle technique (règle) |
| 11:00 | 18 | — | **Relance** utilisée (cartes : PAS_019, PAS_013, Kunai niv. 4) → PAS_060, PAS_001, JUT_225 | Choix : **PAS_060** (catalyseur d'EVO_069) plutôt que Crapauds (JUT_225, refusés pour cette fois) |
| 12:00 | 20 | **Rouleau interdit** | Proposé : TRF_001 Manteau du Kyūbi **ou** EQP_036 Rouleau interdit de Konoha (−20 % PV max) → TRF_001 | EQP_036 n'est pas encore débloqué dans ce profil (MIS_089) : le rouleau propose alors la transformation et un autre interdit admissible (EQP_037), refusé car −3 PV/s |
| 13:30 | 23–24 | Kage Bunshin niv. 7 (concentration) ; Tajū niv. 4 | Crapauds de combat enfin pris (JUT_225) | Palier « jōnin » : triangle bleu discret au-dessus des élites, les clones y convergent |
| 14:30 | 26 | **Élites ×2** (Frères démons + Chūnin instructeur) | Manteau du Kyūbi déclenché automatiquement (boss absent, PV < 50 %) | Risque pris : le joueur est à 45 % PV ; la transformation (0,8 s d'invulnérabilité) retourne la situation |
| 15:10 | — | Coffre | **Évolution EVO_069** (Kage Bunshin niv. 8 + PAS_060 équipé) | Séquence de 900 ms ; la première convergence de Rasengan coordonné part 0,4 s après la reprise : confirmation immédiate |
| 16:30 | 30 | Brume de Kiri 2 | Tajū niv. 6 ; Daitoppa (JUT_073) | Daitoppa en dernier emplacement pour dégager les flancs |
| 17:40 | — | Coffre | Tajū niv. 8 + PAS_030 → **EVO_070 Marée de clones** | Vague de 12 clones en V : l'écran dit « armée » ; unités logiques toujours ≤ 8 |
| 18:20 | 34 | — | Transformation réactivée (recharge 75 s) pendant l'élite 4 → **éveil EVO_117 Armée du Kyūbi** (EVO_069 + TRF_001 active, ≥ 15:00) | Palier « kage » : clones auréolés d'orange |
| 19:40 | 36 | Dégagement | Ramassage des fragments | Les ordinaires fuient : respiration avant le boss |
| 20:00 | 37 | **Zabuza** | — | Zabuza lance son couperet (ligne de 14 m) : Naruto esquive latéralement ; désarmé 2 s → 6 Rasengan coordonnés |
| 21:10 | — | Phase 2 (brume totale, 2 clones d'eau) | Ultime ULT_001 déclenché automatiquement sur les clones d'eau | L'ultime part quand ≥ 6 ennemis ou une élite/boss est à portée (règle) |
| 22:05 | — | Phase 3 (démon de la brume) | — | Erreur : pris dans une Prison aqueuse (1,5 s) ; les ordinaires reculent, aucun combo garanti ; −28 PV sur une tranche |
| 22:48 | — | **Victoire** | — | Conclusion 1,2 s ; écran de victoire ; **Rejouer** disponible |

**Top des sources** (hypothèse) : Kage Bunshin évolué 38 %, Marée de clones 22 %, Rasengan (dont clones) 17 %, Kunai 8 %, autres 15 %. **Progression** : +520 Ryō, maîtrise Naruto niv. 2, MIS_002 accomplie → MAP_003 débloquée, MIS_086 (première évolution) accomplie.

**Hypothèses à tester** : (1) la fenêtre de 09:30 à 11:00 est-elle trop confortable avec 3 éléments de coffre ? (2) l'éveil à 18:20 est-il atteignable sans Relance ? (3) les joueurs comprennent-ils que les clones n'ont pas copié le Rasengan « gratuitement » mais via le CPX ?

---

## F2. Défaite instructive — Sasuke, Amegakure (MAP_012, rang B)

**Entrée** : CHR_004 Sasuke · MAP_012 · objectif du joueur : « Tempête de foudre » (BLD_004) sur la carte de la pluie, pensant profiter de la Conduction.

| Temps | Niveau | Situation | Choix | Commentaire |
|---|---|---|---|---|
| 00:00–03:00 | 1–6 | Pluie : tout est Trempé en extérieur | Chidori, Arc en chaîne, PAS_023 | La Conduction fonctionne très bien : les arcs sautent partout — **le visuel valide le pari** |
| 04:30 | 8 | Élite Gardien d'Ame (**réflecteur**) | Le joueur continue de tirer des Gōkakyū de face | Erreur : les boules sont renvoyées (en couleur ennemie, contour épais) ; −35 % PV. La carte d'élite l'annonçait (icône réflecteur) |
| 06:00 | 10 | Les ennemis d'Ame à attaques électriques profitent aussi de la pluie : la Conduction s'applique au joueur Trempé (règle symétrique de la carte) | PAS_031 (Pas de l'ombre) refusé au profit de PAS_009 (Frappe vitale) | Choix risqué : aucune défense ; Sasuke a 100 PV |
| 09:30 | 15 | Lieutenant Konan | Kirin (JUT_054) | Le joueur reste dehors (sous la pluie) pour ses synergies ; Konan déclenche une mer d'étiquettes, le joueur trouve un couloir sûr |
| 12:00 | 20 | Rouleau interdit : TRF_005 Marque maudite (−2 PV/s pendant l'effet) | Accepté | Coût affiché ; ne peut pas tuer (plancher 1 PV) |
| 14:30 | 25 | Deux élites | EVO_018 obtenue | Pic de dégâts ; l'écran est parcouru d'arcs courts (1 px, 2 frames) : ennemis toujours lisibles |
| 17:00 | 30 | Invocateurs de chiens de l'enfer | Le joueur ignore l'invocateur | Erreur : les chiens se divisent à chaque coup (Arc en chaîne les touche tous) : 16 chiens à l'écran |
| 20:00 | 34 | **Pain** | — | Phase 1 correcte (esquive des missiles en virages serrés) |
| 21:40 | — | Phase 2 : le chemin de l'Enfer ressuscite | Le joueur ne priorise pas le corps à bordure verte | Les soins de Pain prolongent la phase de 40 s |
| 22:50 | — | **Mort** | — | Bansho Ten'in attire Sasuke (esquive trop tardive : la traction était annoncée par une ligne de force), puis missiles d'Asura au point d'arrivée, puis contact des chiens |

**Écran de défaite (un seul écran)** :
* **Cause** : « Missiles du Chemin d'Asura (18) après Bansho Ten'in » ; vignette figée de la dernière seconde avec la ligne de traction et les 3 missiles entourés.
* **Sources de dégâts du joueur** : Arc en chaîne 31 %, Chidori évolué 24 %, Conduction (SYN_001, effets secondaires) 19 %, Kirin 14 %, Gōkakyū 12 % (dont 0 % sur le Gardien réflecteur).
* **Progression** : +310 Ryō, maîtrise Sasuke niv. 3, Archives : entrée « Bansho Ten'in » débloquée avec la phrase « Esquiver au moment de l'attraction annule la traction ».
* **Bouton Rejouer** focalisé à 0,5 s.

**Ce que le joueur apprend (et ce que le jeu doit rendre évident)** : (1) sous la pluie, la Conduction est symétrique ; les abris coupent la pluie ; (2) l'esquive annule Bansho Ten'in ; (3) les invocateurs doivent être priorisés ; (4) Sasuke a besoin d'au moins une défense (PAS_031 ou EQP_035). **Test associé** : 80 % des joueurs doivent citer correctement la cause de leur mort après avoir vu l'écran (§H6).

---

## F3. Réussite d'un build inattendu — Kurenai, « Contagion d'illusions » (MAP_016, rang A)

**Entrée** : CHR_066 Kurenai (débloquée par MIS_166) · MAP_016 Plaine de la guerre (densité maximale) · Doctrine « Esprit » (MIS_025) : +3 techniques de genjutsu garanties dans le pool.

Réputation supposée : « personnage de contrôle, trop faible pour les hordes de la guerre ». Hypothèse de conception à vérifier : la **discorde** (SYN_036) transforme la densité en avantage.

| Temps | Niveau | Situation | Choix | Commentaire |
|---|---|---|---|---|
| 00:00 | 1 | Jubaku Satsu (arbre enserrant) | — | Démarrage lent, assumé ; Zetsu blancs en masse |
| 01:10 | 3 | — | **Contagion d'illusion** (JUT_264) (Vision de l'enfer ; PAS_050) | Le niveau 4 de Contagion la rendra autonome ; au niveau 1, elle a besoin d'un Confus (aucun encore) → le joueur prend ensuite Genjutsu sonore |
| 02:30 | 5 | — | Genjutsu sonore (JUT_253) | 1 ennemi sur 3 touché devient Confus : la contagion démarre ; les premiers Zetsu se frappent entre eux — **visuel : spirales violettes, éclats violets sur les coups entre ennemis** |
| 05:00 | 9 | Ralentissement de la progression | Contagion niv. 4 ; PAS_032 | Discorde : les éliminations d'ennemis confus sont attribuées à Kurenai (Contagion) et remplissent le chakra |
| 07:30 | 12 | Premier ultime (Illusion collective) | — | Tous les ordinaires confus 4 s : la horde s'entre-déchire ; **moment où le joueur comprend le build** |
| 09:30 | 15 | Lieutenant : Armée de Zetsu (Zetsu mère) | Chemin des ténèbres (JUT_251) | Boss isolé derrière une marée : les Zetsu confus ouvrent une brèche dans la marée |
| 12:00 | 19 | Rouleau interdit | Aucune transformation pour Kurenai → objets interdits seulement : EQP_039 Sharingan greffé (5 passifs) refusé ; EQP_037 refusé ; **renoncement** | Possibilité raisonnable de renoncer (aucune pénalité) |
| 13:40 | 22 | — | Marque de cauchemar (JUT_263) sur les élites | Préparation du boss : Vulnérable +25 % |
| 15:20 | — | Coffre | **EVO_080 Épidémie d'illusions** | Propagation à 2 voisins, confus +30 % contre leurs alliés : la plaine devient une mêlée générale |
| 17:00 | 28 | Réanimés (événement) | Vision de l'enfer ; EVO_079 | Les réanimés (élites Edo) se reconstituent sauf s'ils sont tués par une explosion ou scellés : ici, ce sont d'autres ennemis confus qui les tuent → ils se reconstituent. **Limite du build révélée** : Kurenai n'a pas d'explosion ; elle contourne les réanimés |
| 20:00 | 32 | **Kinkaku et Ginkaku** | — | Boss isolés : peu d'ennemis à confondre. La conversion contrôle → Vulnérable (+8 % pour Kurenai, CPX) prend le relais ; Marque de cauchemar + Kōkinjō : le joueur **varie ses familles** (genjutsu, puis Jubaku Satsu, puis ultime) pour éviter la corde |
| 23:10 | — | **Victoire** (combat long : 3 min 10) | — | La durée est dans la plage cible (2–4 min) mais au-dessus de la moyenne : à surveiller |

**Leçons de conception** : le contrôle devient une capacité d'élimination grâce à SYN_036 et aux ultimes, sans « explosions » ; la faiblesse contre les boss isolés est réelle mais surmontable (conversion en vulnérabilité). **Hypothèses à tester** : la plage de 20–40 % d'éliminations par ennemis confus (fiche JUT_264) ; le temps de combat contre un boss isolé ≤ 4 min au rang A pour un joueur expert.
