# D — Bible pixel art, animations, effets, interface, audio et confort

Tous les visuels du jeu sont **produits par le code** à partir de cartes de caractères (« pixel art ASCII ») : aucun fichier image externe, aucune ressource d’*Isaac* ou de *Naruto*. Modules : `23_pixel.js` (outils), `24_sprites_persos.js`, `25_sprites_ennemis.js`, `26_sprites_objets.js`, `27_sprites_decor.js`, `28_dessin.js`, `29_effets.js`, `45_rendu.js`, `46_hud.js`, `22_audio.js`.

## D1. Direction

Langage de la famille *Rebirth* : petits personnages caricaturaux à **grosse tête**, corps compact, regard lisible, salles cadrées vues de dessus légèrement de face. Identité *Naruto* par la **silhouette capillaire**, le **bandeau**, la **couleur de tenue** et un **accessoire** (gourde de Gaara, capuche de Kankurō, masque de Kakashi, manteau à nuages). Ambiance étrange mais colorée avec retenue : sceaux, laboratoires, marionnettes, chaînes ; pas de gore détaillé, pas d’imagerie religieuse ni scatologique transposée.

## D2. Spécifications (brief §30)

| Élément | Valeur |
|---|---|
| Résolution interne | 640 × 360 |
| Tuile | 32 px |
| Salle 1×1 | intérieur 13 × 7 tuiles = 416 × 224 px, placé en (112, 72) ; murs compris 480 × 288 à (80, 40) |
| Mise à l’échelle | facteur **entier** par défaut (×3 en 1920 × 1080, ×4 en 2560 × 1440), sans lissage ; option « ajustée » (facteur réel) |
| Écrans ultralarges | bandes noires : on ne voit jamais davantage de salles ni d’ennemis |
| Grandes salles (2×1, 1×2, 2×2, L) | caméra locale qui suit le joueur, butées aux murs ; l’échelle des personnages ne change pas |
| Joueur | canevas visuel ≈ 32 × 32 (tête 26 × 22 posée sur un corps 14 × 11) ; **collision : cercle de 7 px aux pieds**, indépendante de la tête et des accessoires ; rayon de touche des projectiles ennemis 5 px |
| Rendu | positions arrondies au pixel au moment du dessin ; simulation en flottants à 60 Hz ; aucun filtrage des sprites |

### Zones d’écran (640 × 360)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│[ACTIF]▮ ♥♥♥♥♥♥  ×2                                          [MINICARTE]       │  y 3–34
│ 00 Ryō                                                       Étage 5          │
│ 01 explosifs   ┌──────────────── mur ─────────── porte ────────────────┐       │
│ 00 clés        │                                                       │       │
│ Dég 3,5        │                                                       │       │
│ Cad 2,5        │             salle 13 × 7 tuiles (416 × 224)            │       │
│ Por 6  …       │                                                       │       │
│                │                                                       │       │
│                └───────────────────────── porte ───────────────────────┘       │
│[TALISMAN]                   Nom du boss ████████████          [POCHE] Rouleau │  y 328–350
└──────────────────────────────────────────────────────────────────────────────┘
```

Aucun élément de HUD ne recouvre une porte ; la barre de boss (bas, centre) ne s’affiche qu’en combat de boss ; les statistiques détaillées sont masquables (option).

## D3. Proportions, contours, densité

| Catégorie | Taille | Règle |
|---|---|---|
| Personnages jouables | tête 26 × 22, corps 14 × 11 ; 3 vues (face, côté, dos) + miroir | tête ≈ 2/3 de la hauteur ; yeux de 2 px, pupilles lisibles |
| Ennemis humanoïdes | même gabarit (32 × 34 avec armes) | recolorés par tenue, **plus coiffure et masque propres** |
| Créatures | 6 à 30 px | silhouette qui annonce la fonction (C3 ennemis) |
| Boss | agrandis par **Scale2x** (×2) ou deux passes (×4 pour les géants) | pas de pixels « gonflés » : Scale2x adoucit les diagonales sans flou ; sprites dédiés plus grands pour le Serpent géant et les Dix Queues |
| Objets (icônes) | 16 × 16 | forme + 3 couleurs (a, b, c) ; contour clair sur fond sombre |
| Projectiles | 5 à 12 px | contour clair (joueur) ou sombre pulsant (ennemi) |

**Contour** : 1 px, couleur commune `#1c1420`, calculé automatiquement autour des pixels opaques (pas de diagonales). **Ombres** : ellipse sombre au sol sous chaque entité. **Lumière** : venant du haut-gauche (reflets `l` clairs en haut à gauche des volumes, ombres `d` en bas à droite). **Densité** : 3 à 4 teintes par matériau ; les sols ont 4 variantes de tuile peu contrastées.

## D4. Palettes des thèmes et budget de visibilité

| Thème | Sol (base) | Murs (face / dessus) | Matière des murs | Décor | Lumière |
|---|---|---|---|---|---|
| Sous-sols de l’Académie | `#5c4838` planches | `#7a6552` / `#3e3128` | briques | cibles, parchemins, lanternes | chaude |
| Forêt de la Mort | `#3e4a2c` terre | `#4c3a28` / `#243018` | palissade de racines, haie | champignons, fougères, os | verte |
| Cavernes de Suna | `#b08a58` sable | `#9a7248` / `#5a4028` | blocs de roche | os, jarres de sable, cristaux | chaude |
| Ateliers de marionnettes | `#4a3a44` dalles | `#5e4a52` / `#2c2228` | planches | bras, fils, lanternes | violette |
| Laboratoires d’Orochimaru | `#3c4046` métal | `#4c5058` / `#22262c` | plaques rivetées | cuves, tuyaux, mues | froide |
| Canaux de Kiri | `#3a4a52` pierre | `#4a5e66` / `#1e2c32` | roche | algues, chaînes, lanternes | froide |
| Repaires de l’Akatsuki | `#302a34` pierre | `#3e3440` / `#18141c` | roche | nuages rouges, anneaux, bougies | rouge |
| Champs de guerre scellés | `#4a4238` terre | `#5a5046` / `#28221c` | roche | armes, drapeaux, os | grise |
| Mont Myōboku (empreinte) | `#4a5a3a` mousse | `#6a7a5a` / `#303a26` | roche | champignons, lanternes, fougères | claire |
| Profondeurs du sceau des bijū | `#3a1e22` pierre | `#4c2a2e` / `#1c0c10` | plaques rivetées | chaînes, sceaux, bougies | rouge |

**Budget de visibilité** : écart de luminance faible entre variantes de sol (≤ 8 %) ; obstacles plus clairs que le sol avec un contour ; ennemis, projectiles et joueur toujours contourés ; les projectiles **ennemis** sont roses ou violets à cœur clair **et pulsent**, ceux du joueur ont un contour clair fixe — le rouge seul ne signifie jamais « ennemi » (un Katon allié est orange à cœur jaune).

### Lumière et ambiance (`45_lumiere.js`)

Une **carte de lumière** à demi-résolution est multipliée sur la salle à chaque image : teinte de pénombre propre au thème loin des sources, lumière d'ensemble de chaque cellule, flaques des feux, lanternes et bougies, **appliques murales animées**, halo du joueur, seuils colorés des portes spéciales, collectes et piédestaux. Viennent ensuite des **éclats additifs** (tirs, explosions, étoiles d'impact, orbes, faisceaux) puis l'**air du thème**.

| Thème | Pénombre | Lampe | Applique murale | Air |
|---|---|---|---|---|
| Sous-sols de l’Académie | `#7a6454` | `#ffae50` | torche | poussière |
| Forêt de la Mort | `#566a5c` | `#b4f070` | champignons luminescents | lucioles |
| Cavernes de Suna | `#94745c` | `#ffb458` | torche | sable porté par le vent |
| Ateliers de marionnettes | `#5e5270` | `#e0a0ff` | lanterne de papier | poussière |
| Laboratoires d’Orochimaru | `#4a5e66` | `#70f0d0` | tube de culture | spores |
| Canaux de Kiri | `#4a5e78` | `#88ccff` | lanterne de papier | bancs de brume |
| Repaires de l’Akatsuki | `#54445c` | `#ff6a50` | bougies | braises |
| Champs de guerre scellés | `#6a6058` | `#ffa458` | torche | cendres |
| Mont Myōboku (empreinte) | `#76866a` | `#fff0a0` | lanterne de papier | lucioles |
| Profondeurs du sceau des bijū | `#5e3c44` | `#ff5a3a` | sceau de papier pulsant | braises |

**Règle de lisibilité.** L'ombre ne touche que le décor et les personnages ; les tirs (alliés et ennemis), les effets, les particules, les textes et le HUD sont dessinés après elle, et les télégraphes rouges (cercles, lignes, arcs, frappes au sol) **émettent leur propre lumière** : l'ambiance ne masque jamais un danger. Tout est décoratif (aucun effet de jeu) et se coupe dans Options → *Éclairage dynamique* ; *Sans flash* adoucit les éclats et fige le vacillement des flammes, *Confort* réduit l'air du thème. Les variantes « pénombre » et « brume » gardent leur propre voile, percé par les appliques et les lanternes.

**Matière.** Le sol reçoit des taches d'usure en dégradé doux et des détails du thème (nœuds et clous de planches, touffes d'herbe et feuilles, rides de sable, grilles et flaques d'acide, flaques d'eau, fissures, fleurs, veines rougeoyantes), jamais sous un obstacle ni dans une fosse ; les murs gagnent un volume (face qui s'assombrit vers le sol, arête éclairée), une ombre portée en dégradé sur trois côtés et des détails (lierre, suintements, tuyau continu, dunes au pied du mur, chaînes, avis placardés, fils) ; les obstacles ont une ombre de contact, les fosses une paroi striée. Les tirs alliés laissent deux images fantômes le long de leur vitesse (sauf *Confort*).

### Équipement par comportement (`25_sprites_ennemis.js`)

Règle : **un comportement d'attaque = une silhouette**. Les shinobi hostiles partagent le corps du chibi ; la faction se lit à la coiffure et aux couleurs, le **comportement à l'équipement**, dessiné dans le sprite (aucun coût à l'image) :

| Comportement | Équipement | Variante d'attaque |
|---|---|---|
| Poursuivant | bandages aux poings, kunai | — |
| Chargeur | épaulières, grande lame en avant | — |
| Tireur en ligne | bandoulière | kunai (ligne), éventail rouge (éventail), cristaux (salves de glace) |
| Tireur qui anticipe | visière à lentille rouge | arbalète, ou amplificateur au bras (ondes sonores) |
| Lanceur en cloche | jarre sur le dos, petite jarre en main | — |
| Poseur de pièges | sacoche, parchemins pendus à la ceinture | — |
| Lourd | plastron riveté, massue | — |
| Invocateur | grand rouleau dans le dos, cercle violet au sol, lueur violette | — |
| Soigneur | tablier à croix verte, mains vertes, cercle vert au sol, lueur verte | — |
| Embusqué | cape à capuche (seul le visage reste visible) | — |

Les créatures qui partageaient une forme reçoivent un accessoire d'attaque : marionnette à lames (lames dépliées), marionnette lanceuse (tubes et socle), marionnette inerte (fils et croix de manipulation), marionnette volante (fils), oiseau d'argile kamikaze (mèche allumée, marque rouge), statue bouclier (grand pavois), statue d'aura (runes et couronne bleues, lueur), statue géante (massue), crapaud cracheur (goitre d'huile), sujet qui se divise (couture médiane), momie lourde (poings de pierre), serpent chargeur (crête), cuve d'acide (buse), nid de serpenteaux (têtes qui dépassent), masque de feu (couronne de flammes, lueur), tourelle à parchemins (bandes de papier).

## D5. Animations

| Animation | Règle |
|---|---|
| Attente | corps frame 0, clignement des yeux toutes les 2 à 6 s (0,12 s) |
| Marche | 4 frames par vue, cadence proportionnelle à la vitesse (×1,6 par tuile/s) ; balancement de la tête d’1 px sur les frames impaires |
| Tir | tête en pose « tir » (yeux plissés, bouche) 1 px plus bas pendant 0,1 s ; la tête suit la visée, le corps la marche |
| Charge | jauge sous le personnage ; la silhouette ne change pas |
| Dégâts | clignotement pendant l’invulnérabilité (1 s) ou silhouette pâle (mode sans flash) ; bordure rouge brève à l’écran |
| Prise d’objet majeur | pose face, objet brandi au-dessus de la tête, nom + phrase ; **0,8 s** (0,55 s en confort), accélérable ×2,5 avec *Interagir* ; le jeu est suspendu de façon cohérente, rien n’avance |
| Mort | effondrement puis écran de défaite après 1,4 s |
| Transformation | anneau et étincelles 1 s, bannière dorée 2,6 s, sans figer le combat |
| Célébration | écran de victoire avec le personnage et ses mutations |

## D6. Mutations cumulatives (brief §31)

Les objets majeurs portent un champ `visuel` : couche, motif, couleur, priorité. **Sept couches** : `aura`, `peau`, `yeux`, `tete`, `bras`, `corps`, `dos` ; plus les **orbitaux** et **familiers** dessinés à part. Règle de composition : **une mutation visible par couche**, la plus prioritaire (les transformations ont la priorité 10, les objets 1 à 5) ; les autres restent actives mécaniquement et sont listées dans *Pause → Objets et mutations*. Le personnage garde toujours coiffure et couleur de tenue (deux signes d’identité). Les clones et les variantes altérées portent un liseré de teinte (Naruto altéré : brun-rouge) pour distinguer le vrai personnage, sans transparence excessive.

Motifs disponibles (exemples) : lueur des poings (Rasengan), yeux rouges (Canon de chakra, Résonance des yeux), maquillage d’ermite, marque au front, cornes (Reliques interdites), queues de chakra (Manteau du renard), insectes en aura, sable flottant, bras de marionnette, plumes de papier dans le dos, cape, masque, bandeau au bras.

## D7. Langage visuel des jutsu (brief §32)

| Famille | Forme et rythme | Apparences de projectile |
|---|---|---|
| Kunai / senbon / shuriken | lames grises à pointe claire, rotation pour les shuriken (16 orientations) | `kunai`, `senbon`, `shuriken`, `fuma` |
| Katon | volumes irréguliers, cœur jaune, braises ; zones de feu allié orange | `sphere_feu`, `dragon_feu` |
| Suiton | gouttes et arcs bleus, flaques | `eau`, `glace` (hyōton : éclats blancs) |
| Raiton | tracés anguleux, arcs brefs entre cibles (chaîne) | contour électrique, `eclair` |
| Fūton | lames courbes vert pâle, poussière directionnelle | `vent` |
| Doton | blocs, fissures, ondes de choc | `poing`, `onde` |
| Sable | grains qui tournent, nuages granulaires | `sable` |
| Chakra (orbe) | sphère spiralée à anneau, compression à l’impact | `orbe`, `rasenshuriken` |
| Paume / taijutsu | halo clair, coup en arc de 100° | `paume`, `coup`, `griffe` |
| Papier, encre, insectes, os | feuilles pliées, taches d’encre, essaims orientés, esquilles | `papier`, `encre`, `insecte`, `os` |
| Argile | oiseaux blancs, explosion à silhouette ronde et fumée claire | `argile` |

Les **télégraphes ennemis** ont des formes distinctes : cercle rouge clignotant (impact au sol), ligne rouge (charge ou tir linéaire), arc (balayage), anneau (onde), aura dorée (préparation d’attaque), sceau au sol (invocation). Les décors ne reprennent jamais ces formes.

## D8. Fiches d’effets (brief §33 et §39)

Durées en secondes, arrondies depuis le code ; « version allégée » = mode confort ou densité élevée (particules et secousses réduites, jamais les zones dangereuses).

| # | Effet | Déclencheur | Durée | Couches / forme | Son | Version allégée |
|---|---|---|---|---|---|---|
| 1 | Étincelle d’impact | projectile qui touche | 0,1 | 3 × 3 px | `impact` (budget) | inchangée |
| 2 | Explosion | parchemin, argile | 0,5 | cercle blanc → orange, 10 fragments, décalque brûlé | `explosion` + secousse 6 | sans secousse |
| 3 | Petite explosion | mines, éclats | 0,3 | cercle orange | `impact` grave | — |
| 4 | Fumée | apparition, disparition, mort | 0,4–0,5 | 3 bouffées grises | `fumee` | — |
| 5 | Anneau d’impact | orbe, rotation | 0,3 | anneau clair qui s’élargit | `impact` | — |
| 6 | Chaîne de foudre | impact `chaine` | 0,18 | segments anguleux entre les cibles | `foudre` | — |
| 7 | Onde de choc | impact `onde`, onde noire | 0,3 | anneau épais | `rocher` | — |
| 8 | Frappe au sol (météore) | Chute céleste | 0,75 | réticule orange → impact | `telegraphe` puis `explosion` | — |
| 9 | Cercle de danger | attaque ennemie au sol | = préparation | disque rouge 35 % + anneau clignotant | `telegraphe` | **toujours visible** |
| 10 | Ligne de danger | charge, rayon ennemi | = préparation | bande rouge + tirets | `telegraphe` | toujours visible |
| 11 | Aura de préparation | attaque de boss | 0,3–0,9 | anneau doré pulsant | — | toujours visible |
| 12 | Transformation | ensemble complet | 1,0 | anneau + étincelles + bannière dorée | `transformation` | sans secousse |
| 13 | Réécriture | relance d’objet | 0,45 | le rouleau s’efface et se réécrit | `sceau` | — |
| 14 | Mort de boss | boss vaincu | 1,2 | anneau blanc expansif + particules | `boss_mort` + secousse 10 | secousse 2 |
| 15 | Résurrection | cœur de réserve, Cœur volé | 1,0 | colonne claire | `transformation` | — |
| 16 | Coffre ouvert | ouverture | 0,6 | couvercle, éclat, projection des ressources | `coffre` | — |
| 17 | Fissure (embusqué, Zabuza) | surgissement | 0,4–0,55 | fissures au sol + terre qui remue | `rocher` | toujours visible |
| 18 | Indice secret | grelot, Pakkun | 2,2 | fissure lumineuse sur le mur | `secret` | — |
| 19 | Sphère noire (attraction) | ACT_020 | 1,1 | disque sombre qui aspire | `vent` | — |
| 20 | Tsukuyomi | Itachi | 3,0 | voile rouge, lune | `gong` | voile atténué |
| 21 | Aura du sage | énergie naturelle | 0,5 | anneau orange + pigment au sol | `charge_pleine` | — |
| 22 | Flammes noires | Amaterasu | persistant | flammes noires contourées de violet (lisibles sur sol sombre) | `feu` | — |

**Combinaisons d’effets** (au moins dix) : Rasengan + foudre (sphère spiralée puis arcs vers deux cibles) ; argile + Katon (explosion ronde puis zone de feu allié) ; météore + glace (réticule puis sol gelé) ; boomerang + explosion (une petite explosion par contact, budget 14) ; faisceau + multitir (faisceaux en éventail) ; rayon + percement (rayon plus épais, +20 %) ; sable en orbite + poison (grains verts) ; éventail + Katon (trois flammes) ; chaîne + onde (onde puis arcs, budget partagé) ; mines + lévitation (mines au-dessus du vide) ; réserve instable rompue + bulle rouge (onde noire + huit tirs).

## D9. Interface et menus

- **Titre** : scène de crépuscule originale (ciel tramé en Bayer 4×4, lune, trois plans de montagnes, toits d'un village imaginaire aux fenêtres chaudes, nuages, brume, feuilles et pétales), logo en dégradé à reflet et double contour, sceau tournant en lueur, menu (Continuer, Nouvelle partie, Défis, Mission à code, Registre des missions, Options) dans un cadre serti, personnages sur un faîtage ; navigation manette complète. Le même décor, assombri, habille tous les menus.
- **HUD** : plaques translucides à liseré (santé et actif, ressources et statistiques, minicarte et étage, talisman, poche), écrin de l'actif qui s'illumine quand il est prêt, barre de boss ornée avec **traîne des dégâts récents**, bandeaux à bords estompés (étage, objets, intro de boss), lueur rouge des cœurs en santé critique et vignette rouge au coup reçu (sauf *Sans flash*).
- **Sélection** : carrousel des 12 personnages ; ▲▼ bascule vers la variante altérée ; fiche (santé, statistiques, actif, règle, faiblesse, marques de fin) ; « Description » bascule Standard/Difficile.
- **Mission à code** : clavier virtuel de 32 caractères (sans I, O, 0, 1), saisie entièrement à la manette.
- **Pause** : reprendre, objets et mutations (inventaire par pages avec descriptions à deux niveaux), options, sauvegarder et quitter, abandonner (confirmation) ; la carte étendue reste au maintien de *Carte*.
- **Descriptions** : bouton *Description* près d’un piédestal → phrase courte, puis valeurs et interactions découvertes ; panneau d’achat qui affiche le **résultat exact** d’un pacte (contenants restants, santé après paiement, risque de mort, confirmation à deux temps si mortel).
- **Carte** : minicarte (salles aperçues, pictogrammes des spéciales), carte étendue au maintien (légende, code de mission, temps).

## D10. Audio (brief §34) — `22_audio.js`

Tout est **synthétisé** (WebAudio) ; aucune musique ni aucun son n’est importé.

- **Effets** : chaque son a un intervalle minimal, un nombre maximal de voix simultanées et une priorité ; **budget global de 22 voix** : une voix moins prioritaire est coupée, jamais un avertissement de boss. Hauteur variée de ±6 % à chaque lecture pour éviter la répétition mécanique (tirs, impacts, pièces).
- **Musique** : générée depuis une graine fixe par thème, en gammes japonaises (*in*, *yo*, *ryūkyū*, *sombre*), timbre koto (triangle + harmonique) ou flûte (sinus + souffle), tempo 72 à 100 ; une couche de percussions (taiko) s’ajoute en combat et se retire en douceur au nettoyage ; les boss ont une piste propre (+22 battements par minute, gamme sombre). Aucune mélodie connue n’est reprise.
- L’audio démarre au premier clic ou appui clavier (contrainte des navigateurs : un bouton de manette ne suffit pas) ; le jeu retente à chaque appui de manette et affiche une invite (haut-parleur barré) au titre et en jeu tant que le son attend.
- **Mixage** : gain maître, compresseur de cohésion et limiteur (crêtes ≈ −5 dB, niveau efficace ≈ −18 dB mesurés), réverbération synthétique partagée (salle de pierre de 2,6 s) et nappe tenue sous la musique.

## D11. Confort et accessibilité

| Option | Défaut | Effet |
|---|---|---|
| Volumes musique / effets | 0,6 / 0,8 | séparés |
| Vibrations | 0,7 | 0 = désactivées |
| Secousses | 0,7 | 0 = désactivées ; plafonnées et directionnelles |
| Sans flash | non | supprime flashs et clignotements (silhouette pâle) |
| Confort | non | transitions 0,18 s, animation d’objet 0,55 s, pas de ralenti décoratif |
| Éclairage dynamique | oui | lumières, halos et air du thème (décoratifs) ; à couper sur une machine modeste |
| Zones mortes, seuils de visée, hystérésis | B2 | réglables |
| Profil de tir | stick + croix | stick seul, croix seule |
| Charge automatique | non | tir à pleine charge sans relâcher |
| Statistiques à l’écran | oui | masquables |
| Chiffres de dégâts | non | nombres au-dessus des ennemis |
| Échelle | entière | ou ajustée |
| Visée libre de la sphère | non | pour PSV_021 uniquement |

Les options se règlent entièrement à la manette et sont conservées à part du profil et des parties.
