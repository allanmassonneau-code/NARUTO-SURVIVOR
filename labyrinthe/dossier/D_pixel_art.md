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
| Obstacles | boîte de collision **plus petite que la tuile**, calée sur le dessin (marges gauche / haut / droite / bas) : rocher et rocher à sceau 4 / 8 / 4 / 2 px, totem 6 / 8 / 6 / 2, bloc 3 / 7 / 3 / 2, jarre 7 / 13 / 7 / 1, caisse 5 / 11 / 5 / 1, feu 6 / 9 / 6 / 2, fosse 3 / 4 / 3 / 3 ; on frôle sans s’accrocher aux coins et l’on passe derrière la moitié haute (tri en profondeur) ; murs et portes gardent la tuile entière |
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
| Objets (icônes) | 16 × 16 + contour, dans une case de 20 × 20 | **une peinture par objet** (352 : passifs, actifs, talismans, consommables, transformations, éveils) qui montre ce que fait l'objet ; voir « Icônes » ci-dessous |
| Projectiles | 5 à 12 px | contour clair (joueur) ou sombre pulsant (ennemi) |

**Contour** : 1 px, couleur commune `#1c1420`, calculé automatiquement autour des pixels opaques (pas de diagonales). **Ombres** : ellipse sombre au sol sous chaque entité. **Lumière** : venant du haut-gauche (reflets `l` clairs en haut à gauche des volumes, ombres `d` en bas à droite). **Densité** : 3 à 4 teintes par matériau ; les sols ont 4 variantes de tuile peu contrastées.

### Icônes (`26_icones.js`, `26_icones_recettes.js`)

Chaque objet a sa propre **recette** : un petit programme de dessin sur une grille de 16 × 16 qui montre ce que fait l'objet (le fil de chakra rebondit entre deux murs, le senbon perforant traverse sa cible, le Kubikiribōchō a son trou et son encoche, la carte de membre porte une pièce barrée…). Aucune icône n'est partagée : le test `icones` vérifie qu'il n'y a ni doublon au pixel près ni paire trop proche (moins de 3 % d'écart), ni icône presque vide.

- **Peintre** : primitives à plat (disques, ellipses, anneaux, polygones, traits épais, arcs, étoiles), tournables (un kunai se dessine dans n'importe quelle direction), motifs pixel par pixel pour les formes délicates (poing, tête de ninja, sandale), objets de base réutilisés (kunai, shuriken, fūma, rouleau, étiquette, flamme, goutte, œil — normal, Sharingan, Mangekyō, Byakugan, Rinnegan, œil de sage, œil de renard —, crâne, os, orbe, crapaud, serpent, insecte, chien, oiseau, marionnette, clé, bourse, cloche, bouclier, masque, bandeau, gourde…).
- **Ombrage automatique** : lumière en haut à gauche ; un pixel au bord éclairé (haut ou gauche à découvert) s'éclaircit, un pixel au bord ombré s'assombrit : chaque forme prend du volume sans retouche. Puis contour `#1c1420`.
- **Badges** : un glyphe de 5 × 5 cerné de sombre dans le coin (chiffre, flèche, goutte, cible, horloge…) distingue les variantes d'une famille : Porte de l'Ouverture « 1 », Porte de la Vie « 3 », Sixième porte « 6 », Huit Portes « 8 ».
- **Pictogrammes incrustés** : sur les rouleaux, les sceaux de poche et les marques de sang, le pictogramme est dessiné à part puis posé cerné d'encre, lisible sur le papier.
- **Familles** : rouleaux de poche (papier et bâtons à la couleur du rouleau, pictogramme de l'effet), sceaux de poche (pierre cerclée de la couleur du sceau), marques de sang (tache et symbole de la statistique), bénédictions (halo d'or au-dessus de la créature), éveils (ce qui s'éveille : Sharingan, sceau Byakugō, pièce de shōgi, tête de Shukaku…), talismans (l'objet lui-même : épingle, perles du moine, masque d'oni, gourde de saké, jeton de tripot…).
- **Où** : HUD (actif, talismans, poche), piédestaux et étals, fiche de l'objet proche, objet brandi, inventaire, registre, écran de mort, carte de sélection ; les talismans au sol montrent leur icône. Les familiers qui empruntent la silhouette d'un objet gardent la forme simple d'origine (`iconeForme`), sans décor ni badge.

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

**Sols peints à l’échelle de la salle** (`27_sols.js`). La matière du thème couvre tout le sol d’un seul tenant, sans damier de tuiles : longues planches clouées et veinées (Académie), terre en plaques et herbe (Forêt), terre brûlée (champs de guerre), sable ridé par le vent (Suna), dalles biseautées (ateliers), plaques rivetées et tôle striée tachée de rouille (laboratoires), pavés irréguliers à joints de mortier (Kiri, Akatsuki, sceau des bijū), mousse (Myōboku). Calcul pixel par pixel, tramé en Bayer 4×4 par pas de 3 % de luminosité (contraste faible : le décor reste sous les personnages), bruits basse résolution lus en bilinéaire ; le sol est gardé avec la salle, et le fond d’une salle voisine se construit en avance hors combat (pas d’à-coup au passage d’une porte). **Fosses** : paroi lointaine visible (matière du thème, strates, racines, filets de sable, rivets), lèvres de sol claires, coins adoucis, fond propre au thème (eau sombre à vaguelettes à Kiri, lueur rouge du sceau, brume acide des laboratoires, spores). **Hors de la salle** (couloirs, salles en L), la roche du thème remplace le noir. **Obstacles** : rochers éclairés en cinq tons au contour irrégulier, fissurés, avec mousse, humidité ou lichen selon le thème ; souches à cernes ; pierres taillées (grès en strates à Suna, veines rouges au sceau) ; blocs de chêne cerclés de fer (ateliers) ; cuves de verre à spécimen (laboratoires) ; le rocher à sceau porte une étiquette de papier ; le **bloc indestructible** prend la pierre du thème renforcée de cornières de fer rivetées, pour ne jamais le confondre avec un rocher qu’un explosif brise.

**Matière.** Le sol reçoit des taches d'usure en dégradé doux et des détails du thème (nœuds et clous de planches, touffes d'herbe et feuilles, rides de sable, grilles et flaques d'acide, flaques d'eau, fissures, fleurs, veines rougeoyantes), jamais sous un obstacle ni dans une fosse ; les murs gagnent un volume (face qui s'assombrit vers le sol, arête éclairée), une ombre portée en dégradé sur trois côtés et des détails (lierre, suintements, tuyau continu, dunes au pied du mur, chaînes, avis placardés, fils) ; les obstacles ont une ombre de contact, les fosses une paroi striée. Les tirs alliés laissent deux images fantômes le long de leur vitesse (sauf *Confort*).

### Shinobi ennemis : un personnage par ennemi (`25_shinobi.js`)

Les 31 shinobi hostiles ne partagent plus le petit corps des héros : chacun est **un personnage à part** (création originale), avec son gabarit, sa posture, sa tenue, sa tête et son accessoire. Proportions moins « chibi » que les héros (tête ≈ un tiers de la hauteur) : on distingue au premier regard un ennemi d’un allié.

**Technique.** Un petit peintre de volumes : boules (têtes, mains, épaulières, jarres), membres (segments arrondis éclairés comme des cylindres), troncs (torse, robes, manteaux éclairés en cylindre vertical), polygones (capes, chapeaux, lames, éventails). Lumière en haut à gauche, rampe de cinq tons par matière (ombres froides, lumières chaudes, éclat réservé au métal, au verre et à la glace), **trait intérieur** quand une pièce passe devant une autre, contour sombre commun à tous les sprites ; les lueurs (fils de chakra, mains de soin, sceaux) sont posées après le contour, fines et lumineuses. Trois images, recadrées ensemble autour de l’axe du corps (miroir quand l’ennemi va à gauche) : deux de marche et **une d’attaque, montrée pendant le télégraphe**. Construits une fois (2 à 10 ms), puis préchauffés un par un hors combat.

**La posture dit la mécanique** :

| Comportement | Langage du corps | Image d’attaque |
|---|---|---|
| Poursuivant (fonce au contact) | penché en pleine course, une jambe tendue en arrière | arme pointée devant lui |
| Chargeur | épaules énormes ou arme longue tenue basse | se ramasse, lame ou lance couchée vers la cible |
| Tireur en ligne | projectiles en main (kunai en éventail, éventail fermé, aiguilles de glace) | bras armé levé, éventail ouvert en demi-roue |
| Tireur qui anticipe | arme d’épaule (tube à eau, gantelet sonore, corne, ombrelle) | épaule et vise ; ondes ou gouttes à la bouche de l’arme |
| Lanceur en cloche | énorme jarre sur le dos | brandit une jarrette au-dessus de la tête |
| Poseur de pièges | accroupi, étiquette à la main, besace ou plastron d’explosifs | — |
| Lourd | colosse, poings ou bras multiples | poings levés au-dessus de la tête |
| Invocateur | fils de chakra, bâton, tiges, seringue ; cercle violet au sol | mains levées, fils tendus, sceau violet |
| Soigneur | robe ou blouse claire, mains vertes ; cercle vert au sol | deux mains levées, lueur verte |
| Embusqué | tapi sous une cape, ou à demi enraciné (Zetsu) | jaillit, bras levés ou salve d’aiguilles |

**Le roster.** Académie et Forêt : genin renégat (écharpe rouge qui claque, bandeau rayé), lanceur de kunai (demi-masque, chignon, bandoulière), ninja de la pluie (imperméable, respirateur, tube à eau), instructeur déchu (vieux, cicatrice, gilet déchiré, fils de chakra vers ses poupées), gardien des archives (colosse au crâne rasé, chapelet, pile de rouleaux sanglée dans le dos), genin fonceur (trapu, casque rembourré, gantelets de fer), invocateur d’herbes hautes (manteau d’herbes, chapeau de paille hérissé, yeux jaunes, serpent sur les épaules). Suna : ninja à l’éventail (tunique, voile, éventail géant), lanceur de jarres (porteur voûté, turban, moustache), marionnettiste caché (capuche, visage peint, coffre dans le dos), ninja du Son (visage bandé, col de fourrure, gantelet percé), poseur de sceaux de sable (petit, accroupi, lunettes orange), médecin de Suna (vieil homme, barbiche, bâton à clochettes). Laboratoires et Kiri : porteur du sceau maudit (brute aux marques noires qui rougeoient à l’attaque), Zetsu blanc (créature végétale, pousses sur le crâne, racines aux jambes), garde du Son (griffes d’acier), tireur du Son (cheveux longs, corne de chasse), assistant de laboratoire (blouse, lunettes rondes, seringue géante), poseur de parchemins explosifs (masque animal, plastron d’étiquettes), ninja médical (chignon à aiguilles, masque chirurgical), ninja de la brume (poncho effiloché, masque à gaz, brume aux pieds), clone de glace (cristal facetté), déserteur au sabre (rōnin, manteau en lambeaux, long sabre), assassin de la brume (masque blanc, cape sarcelle). Repaires et champs de guerre : Zetsu de l’armée (gilet volé, en course), marionnette humaine (bois articulé, six bras, mâchoire à charnière, sable de fer), sentinelle de la pluie (grande ombrelle qui se referme en canon), invocateur aux tiges (cheveux orange, tiges de métal, sceau au sol), shinobi de l’Alliance égaré (tête bandée, lance), poseur d’argile (tablier taché, oiseau d’argile sur l’épaule), Zetsu soigneur (grand bourgeon rose).

### Boss peints (`25_shinobi_boss.js`, `_1.js`, `_2.js`)

Les 37 boss quittent le constructeur des héros : chacun est peint par le même peintre de volumes que le bestiaire, mais **deux fois plus finement** (échelle 2 : chaque unité de la toile 52 × 60 vaut 2 × 2 pixels, et les détails se posent au pixel près). Ils mesurent donc environ le double d'un ennemi (≈ 70 px pour un humain, jusqu'à 112 px pour les géants) avec un contour d'un pixel, comme tout le jeu.

- **Visages au pixel** : gabarits d'yeux (iris, pupille, reflet ; yeux rouges à virgule, yeux à cercles concentriques, yeux blancs sans pupille, yeux fendus de serpent, yeux cernés de noir), sourcils selon l'humeur, bouches (trait, rictus, dents, crocs de requin) ; l'ombre du visage ne mord que le bord opposé à la lumière.
- **Tenues et motifs** : manteau à haut col doublé de rouge et nuages rouges cernés de blanc (peints pixel par pixel), gilets à rouleaux, cordes nouées dans le dos, bandeaux gravés ou rayés, bandages en spirale, armures à plaques lacées.
- **Armes signatures** : grand couperet percé, épée bandée puis à écailles, faux à trois lames, éventail géant qui s'ouvre en demi-lune, arc d'or, éventail-feuille, gourde, queue mécanique, flûte.
- **Trois images par forme** : deux de marche, une **d'attaque montrée dès l'annonce** d'une attaque et pendant son exécution. Un boss qui attaque, ou qui ne bouge pas, **fait face au joueur**.
- **Formes** (toutes recadrées ensemble, même ancrage) : les deux frères démons (une corne, deux cornes), le trio du Son (Dosu, Zaku, Kin), Sasori (carapace bossue, puis le marionnettiste révélé), Hidan (corps noirci aux os peints pendant le rituel), Jūgo (calme, puis enragé : marque grise, bras-massue), Sakon et Ukon (deux têtes, puis chacun seul), la chimère (de plus en plus mutée), Zetsu (entier, puis chaque moitié), Danzō (bras dévoilé après l'Izanagi), Kinkaku et Ginkaku.
- **Géants et créatures** : serpent géant (tête dressée sur un cou à ventre clair ; le reste du corps suit en **anneaux peints**), mue gardienne (même silhouette en peau pâle), mille-pattes géant (mandibules, antennes, anneaux à pattes), Empreinte des Dix Queues (œil unique cerclé, queues épaisses en éventail), Gardien du Sceau (masque cérémoniel blanc et or, halo de talismans, robe flottante), crapaud gardien (corde sacrée et papiers pliés), Karasu (la marionnette de Kankurō, trois yeux et quatre bras armés).
- **Intro de boss** : le boss peint entre par la droite dans le bandeau, arme levée.
- **Coût** : 5 à 27 ms par boss (toutes ses formes) ; le boss de l'étage est préchauffé en premier, hors combat.

Les illusions d'Itachi reprennent son sprite trait pour trait (seul le vrai projette une ombre).

### Créatures peintes (`25_creatures.js`)

Les 31 formes de créatures ennemies passent par le **même peintre de volumes** que les shinobi (mêmes lumières, rampes, traits intérieurs, contour) : tout le bestiaire parle la même langue. Chacune est dessinée **à la taille de sa zone de contact** (plus de cartes de 12 pixels doublées) et garde son image d’attaque.

| Forme | Dessin | Variantes et image d’attaque |
|---|---|---|
| Poupée d’entraînement | sac de toile cousu sur un pieu, cible peinte, bras de bois | sautille sur son pieu |
| Rat, moustiques, serpenteaux, araignées mécanique et d’argile | petits, de profil ou vus de dessus | pattes en vague ; mèche allumée (argile) |
| Chauve-souris, hirondelle, oiseaux, papillon de papier | ailes qui battent (haut/bas) | oiseau d’argile kamikaze : mèche ; marionnette volante : fils |
| Crapauds | trapus, yeux saillants, ventre clair | s’aplatissent avant de bondir ; le cracheur gonfle un goitre d’huile ; le gardien de Myōboku porte plaque et pans de bandeau |
| Serpents | corps qui ondule au sol, cou dressé | le chargeur a une crête et ouvre la gueule avant de charger |
| Sangsue, mille-pattes, ver, requin | annelés, luisants, de profil | se dressent, gueule ronde cerclée de dents, aileron |
| Tigre, bête invoquée | quadrupèdes de profil, pattes alternées | le tigre se ramasse, gueule ouverte ; la bête porte les tiges noires de son invocateur |
| Araignée tisseuse | huit pattes articulées, sablier rouge | fil de soie |
| Jarre hantée | jarre aux yeux mi-clos qui luisent | éveillée : tremble, couvercle soulevé, yeux grands ouverts |
| Racine griffue, esprit de sable, ombre, méduse, queue de chakra | silhouettes organiques | branches levées et épines ; queue enroulée avant de fouetter |
| Scorpion | pinces en avant, queue arquée | dard qui se dresse |
| Momies | bandelettes, un œil rouge | la lourde lève des poings de pierre ; le sujet qui se divise porte une couture |
| Marionnettes | bois articulé à rotules, masque blanc | lames dépliées (chargeuse), socle et tubes à senbon (lanceuse), saccades (errante), fils et croix (inerte) |
| Cuves | verre cerclé de métal, créature qui flotte | buse d’acide qui bouillonne ; têtes de serpenteaux (nid) |
| Masques flottants | grand masque ovale | talismans et rouleaux (archives), couronne de flammes (élémentaire) ; orbites qui s’illuminent |
| Statues | corps massif taillé | pavois à sceau (frontale), massue levée (géante), runes et couronne bleues (aura) |

Les couleurs propres à chaque ennemi (crapauds, marionnettes, chauve-souris…) passent par les mêmes clés qu’avant. Les **familiers** passent par le même peintre (deux images, plus petits quand la forme en dépend ; chiens ninjas pour Pakkun et Akamaru, limace bleue et blanche pour Katsuyu, luciole qui luit). Les ennemis peints se construisent une fois (≈ 250 ms pour les 76, 8 ms au plus chacun) et se préchauffent un par un hors combat, ceux du thème de l’étage d’abord. **Les volants flottent** 5 px au-dessus d’une ombre plus petite, avec un léger balancement ; leur point d’impact est relevé d’autant.

**Télégraphes lisibles** (dessinés après l’éclairage, jamais assombris) : ligne de charge rouge qui s’allonge devant le chargeur, ligne de visée pointillée du tireur qui anticipe, éclat qui grossit sur l’arme du tireur, anneau qui se resserre au point de chute du sauteur, poussière du sauteur qui se ramasse.

**Tirs ennemis par attaque** : chacun garde le double contour sombre, l’anneau clair pulsant et un **point rose au cœur** (signature ennemie), mais sa forme dit d’où il vient — kunai, aiguilles (marionnette lanceuse, assassin de la brume), lames de vent (éventail de Suna), ondes sonores, gouttes (ninjas de la pluie, requin), éclats de glace, épines (racine griffue), éclats de jarre (lanceur de jarres, marionnette géante), os, flammes, motte de terre (mille-pattes), sable (ver), sable de fer (marionnette humaine), boue (crapauds), acide (cuve), huile (crapaud cracheur), talismans de papier (tourelle à parchemins, gardien des archives), flèche d'or (Kidōmaru), spores (Zetsu). Les gros tirs de boss sont agrandis par un facteur entier.

## D5. Animations

| Animation | Règle |
|---|---|
| Attente | corps frame 0, clignement des yeux toutes les 2 à 6 s (0,12 s) |
| Marche | 4 frames par vue, cadence proportionnelle à la vitesse (×1,6 par tuile/s) ; balancement de la tête d’1 px sur les frames impaires ; petite poussière à chaque appui de pied (pas en vol, pas en mode confort) |
| Tir | tête en pose « tir » (yeux plissés, bouche) 1 px plus bas pendant 0,1 s ; la tête suit la visée, le corps la marche |
| Charge | jauge sous le personnage ; la silhouette ne change pas |
| Dégâts | clignotement pendant l’invulnérabilité (1 s) ou silhouette pâle (mode sans flash) ; bordure rouge brève à l’écran |
| Prise d’objet majeur | pose face, objet brandi au-dessus de la tête, nom + phrase ; **0,8 s** (0,55 s en confort), accélérable ×2,5 avec *Interagir* ; le jeu est suspendu de façon cohérente, rien n’avance |
| Mort | effondrement puis écran de défaite après 1,4 s |
| Ennemi touché | silhouette blanche 0,08 s et **écrasement** bref (largeur +20 %, hauteur −15 %, 0,1 s ; ×0,4 sur un boss, ×0,5 en confort) |
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
| 2 | Explosion | parchemin, argile | 0,5 | cercle blanc → orange, cœur clair, onde de choc qui s’élargit, fumée sombre qui monte, 10 fragments, décalque brûlé | `explosion` + secousse 6 | sans secousse |
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
| 14 | Mort de boss | boss vaincu | 1,1 + 1,2 | la dépouille vacille, clignote, rougeoie et s’affaisse sous de petites explosions, puis éclat final (anneau blanc, débris aux couleurs du boss) ; **ralenti** de 1,2 s (×0,25 → ×1) s’il s’agit du dernier boss | `boss_mort` + secousse 8, puis `explosion` + secousse 10 | pas de ralenti, moins d’explosions, pas de clignotement sans flash |
| 15 | Résurrection | cœur de réserve, Cœur volé | 1,0 | colonne claire | `transformation` | — |
| 16 | Coffre ouvert | ouverture | 0,6 | couvercle, éclat, projection des ressources | `coffre` | — |
| 17 | Fissure (embusqué, Zabuza) | surgissement | 0,4–0,55 | fissures au sol + terre qui remue | `rocher` | toujours visible |
| 18 | Indice secret | grelot, Pakkun | 2,2 | fissure lumineuse sur le mur | `secret` | — |
| 19 | Sphère noire (attraction) | ACT_020 | 1,1 | disque sombre qui aspire | `vent` | — |
| 20 | Tsukuyomi | Itachi | 3,0 | voile rouge, lune | `gong` | voile atténué |
| 21 | Aura du sage | énergie naturelle | 0,5 | anneau orange + pigment au sol | `charge_pleine` | — |
| 22 | Flammes noires | Amaterasu | persistant | flammes noires contourées de violet (lisibles sur sol sombre) | `feu` | — |
| 23 | Mort d’un ennemi | élimination | 0,16 + 0,9 | silhouette blanche qui s’évase, fumée, 8 à 14 éclats aux couleurs du sprite qui retombent et rebondissent, tache au sol ; secousse 2 pour les gros | `ennemi_mort`, plus grave pour les gros | 4 éclats, silhouette pâle sans flash |
| 24 | Salle nettoyée | dernier ennemi vaincu (hors boss) | 0,9 | onde dorée depuis le dernier ennemi, lueur chaude qui balaie la salle, portes qui s’illuminent | `nettoyee` (trois notes) + `porte_ouvre` | onde seule |
| 25 | Battants de porte | fermeture au combat, ouverture | 0,12 / 0,34 | les barreaux retombent d’un coup (poussière) et glissent dans le mur à l’ouverture | `porte_ferme` / `porte_ouvre` | sans poussière |
| 26 | Fusions de natures | impacts des synergies | 0,6–2,4 | lave (croûte, bulles), vapeur (bouffées), flaque électrisée (étincelles), sable de fer (grains qui convergent), racines (couronne qui jaillit), rayon Jinton (faisceau blanc, cube) | `feu`, `eau`, `eclair`, `laser` | — |
| 27 | Mur secret ouvert | explosion contre un mur secret, entrée dans une cache | 0,6 | brèche dentelée et gravats dessinés **des deux côtés** du mur, fumée, débris, secousse 4 | `secret` | sans secousse |
| 28 | Tirs de nature | objets d’élément (Katon, Raiton, Suiton, Fūton, Doton, Hyōton) | durée du tir | lueur additive et teinte de la nature sur le tir ; flammèches (Katon), arcs brisés (Raiton), gouttes (Suiton), tourbillon (Fūton), mottes qui retombent (Doton), givre et cristaux (Hyōton) ; la Grande boule de feu a son propre dessin | — | particules réduites |
| 29 | Impact de nature | tir élémentaire qui touche | 0,16–0,26 | gerbe propre à la nature : étincelles qui montent, trois arcs, éclaboussure en anneau, spirale, mottes, quatre cristaux | — | — |
| 30 | Frappe de mêlée | formes lame, mêlée | 0,19 | croissant net qui balaie l’arc en quatre étapes : tranchant blanc, corps translucide à la couleur de la nature, queue qui s’estompe | `impact` | — |
| 31 | Rayons et faisceaux | formes rayon, laser, faisceau | durée du rayon | éclair à la source, gerbe au point d’arrêt, éclats qui filent le long du rayon | `laser` | sans éclair |
| 32 | Objet brandi | prise d’un objet | 0,8 | halo et huit rayons qui tournent derrière l’objet, poussière dorée | `objet` | sans halo |
| 33 | Statuts sur le corps | brûlure, poison, gel, ralenti, immobilisé, charme, confus, peur | durée du statut | teinte de la nature du statut sur la silhouette (le gel la givre franchement), flammèches, bulles, éclats de givre, gouttes, anneau d’ombre aux pieds, cœurs, étoiles qui tournent, volutes sombres — en plus des symboles | — | particules réduites |

**Combinaisons d’effets** (au moins dix) : Rasengan + foudre (sphère spiralée puis arcs vers deux cibles) ; argile + Katon (explosion ronde puis zone de feu allié) ; météore + glace (réticule puis sol gelé) ; boomerang + explosion (une petite explosion par contact, budget 14) ; faisceau + multitir (faisceaux en éventail) ; rayon + percement (rayon plus épais, +20 %) ; sable en orbite + poison (grains verts) ; éventail + Katon (trois flammes) ; chaîne + onde (onde puis arcs, budget partagé) ; mines + lévitation (mines au-dessus du vide) ; réserve instable rompue + bulle rouge (onde noire + huit tirs).

## D9. Interface et menus

- **Titre** : scène de crépuscule originale (ciel tramé en Bayer 4×4, lune, trois plans de montagnes, toits d'un village imaginaire aux fenêtres chaudes, nuages, brume, feuilles et pétales), logo en dégradé à reflet et double contour, sceau tournant en lueur, menu (Continuer, Nouvelle partie, Défis, Mission à code, Registre des missions, Options) dans un cadre serti, personnages sur un faîtage ; navigation manette complète. Le même décor, assombri, habille tous les menus.
- **HUD** : plaques translucides à liseré (santé et actif, ressources et statistiques, minicarte et étage, talisman, poche), écrin de l'actif qui s'illumine quand il est prêt, barre de boss ornée avec **traîne des dégâts récents**, bandeaux à bords estompés (étage, objets, intro de boss), lueur rouge des cœurs en santé critique et vignette rouge au coup reçu (sauf *Sans flash*). Les compteurs **sautent** quand ils changent (or au gain, rouge à la perte, 0,3 s) ; les cœurs tremblent à la perte et s’illuminent au gain.
- **Première salle** : les commandes sont peintes au sol de la salle de départ du premier étage (déplacement, tir, technique, parchemin explosif), selon le dernier périphérique utilisé et la disposition du clavier.
- **Sélection** : carrousel des 12 personnages ; ▲▼ bascule vers la variante altérée ; fiche (santé, statistiques, actif, règle, faiblesse, marques de fin) ; « Description » bascule Standard/Difficile.
- **Mission à code** : clavier virtuel de 32 caractères (sans I, O, 0, 1), saisie entièrement à la manette.
- **Pause** : reprendre, objets et mutations (inventaire par pages avec descriptions à deux niveaux), options, sauvegarder et quitter, abandonner (confirmation) ; la carte étendue reste au maintien de *Carte*.
- **Fiche de l’objet proche** (façon *External Item Descriptions* d’*Isaac*) : à moins de 72 px (2,25 tuiles) d’un piédestal, d’un article d’échoppe, d’un talisman, d’un rouleau ou d’une pilule, un cadre s’affiche de lui-même en haut à gauche (à droite si l’objet ou le joueur seraient dessous, en bas en dernier recours ; masqué pendant les bandeaux) : icône, nom, type, qualité (★), « nouveau » si l’objet n’a jamais été obtenu, phrase, valeurs calculées depuis les données, progression d’ensemble (« 1/3 → 2/3 », « se déclenche ! »), synergies avec ce que vous portez (ou ce qui manque encore), fusion de natures complétée, ce qu’il remplacerait, prix, choix lié, délai d’actif. Une pilule inconnue garde son effet secret ; sous la malédiction aveugle, l’objet reste voilé. Liseré par type (passif or, actif bleu, talisman rose, poche vert, ressource vert clair). Option *Descriptions automatiques* (sinon : au maintien de *Description*).
- **Achat** : panneau d’achat qui affiche le **résultat exact** d’un pacte (contenants restants, santé après paiement, risque de mort, confirmation à deux temps si mortel) ; la fiche porte la description.
- **Carte** : minicarte (salles aperçues, pictogrammes des spéciales : étoile dorée pour l’héritage, pièce verte pour l’échoppe, crâne pour le boss), carte étendue au maintien (légende aux mêmes pictogrammes, code de mission, temps).
- **Échoppe et héritage** : deux lieux qu’on reconnaît dès la porte. L’**échoppe** est un marché : porte brune à seuil vert flanquée de deux lanternes de papier rouges, tapis rouge, étals à auvent rayé vert et blanc, étagères de marchandises, lanternes, piédestaux en étals de bois à nappe verte avec le prix en Ryō. L’**héritage** est un sanctuaire : porte dorée flanquée de deux flammes, cercle de sceau doré au sol, quatre bougies, corde sacrée à papiers pliés, puits de lumière dorée, piédestal unique à liseré doré.
- **Salles spéciales** : chacune a un sol marqué, un mobilier mural et une lumière propres. Chambre maudite : pénombre cramoisie, double sceau et fissures rayonnantes, chaînes pendues, amas de crânes, bougies, **pointes d’os aux portes** (sortir coûte une demi-unité). Autel de tribut : estrade de pierre et rigole de sang, bougies rouges en arc, lanternes de pierre. Épreuve chūnin : arène tracée à la craie, bannières aux kunai croisés ; épreuve jōnin : arène sombre, double sceau pourpre, bannières au crâne. Bibliothèque : étagères, tapis sous les choix, piles de rouleaux. Chambre forte : barreaux, tas d’or aux angles. Source chaude : bassin cerclé de pierres, ponton, bambous, lanternes de pierre. Comptoir : grand tapis, lanternes rouges, tonneaux. Cache : pénombre, toiles d’araignée aux angles, tonneaux. Chambre isolée : chaînes au sol vers le sceau bleuté. Pacte : tentures violettes, serpents de pierre aux yeux violets. Sanctuaire des ermites : sceau de jade, crapauds de pierre, étangs aux nénuphars (distinct de l’héritage doré).

## D10. Audio (brief §34) — `22_audio.js`

Tout est **synthétisé** (WebAudio) ; aucune musique ni aucun son n’est importé.

- **Effets** : chaque son a un intervalle minimal, un nombre maximal de voix simultanées et une priorité ; **budget global de 22 voix** : une voix moins prioritaire est coupée, jamais un avertissement de boss. Hauteur variée de ±5 % à chaque lecture pour éviter la répétition mécanique (tirs, impacts, pièces).
- **Fabrication des effets** : chaque effet est une petite partition de couches — attaque, corps (ton qui glisse, bruit blanc ou brun filtré qui balaie), queue (crépitement, réverbération). Cinq familles de timbres : **cordes pincées** (Karplus-Strong, façon koto : cœurs, objets, menus, salle nettoyée, secret), **cloches** (partiels inharmoniques : pièces, clés ; les sons fréquents — tir, lame, alerte — n'ont plus d'éclat métallique), **chocs** passés dans une saturation douce (impacts, explosions, portes, pas lourds, taiko), **souffles** (vent, feu, eau, sable, fumée) et une **voix à formants** pour le rire des boss. Les chocs graves ont toujours une couche entre 200 et 450 Hz, audible sur les petits haut-parleurs. Les 50 effets sont rendus hors ligne au banc de vérification : crête, niveau efficace, durée et spectrogramme, sans clic de fin.
- **Musique** : générée depuis une graine fixe par thème, en gammes japonaises (*in*, *yo*, *ryūkyū*, *sombre*), timbre koto (corde pincée Karplus-Strong + sinus doux) ou flûte (sinus à vibrato léger + souffle), tempo 72 à 100 ; une couche de percussions (taiko) s’ajoute en combat et se retire en douceur au nettoyage ; les boss ont une piste propre (+22 battements par minute, gamme sombre). Aucune mélodie connue n’est reprise.
- L’audio démarre au premier clic ou appui clavier (contrainte des navigateurs : un bouton de manette ne suffit pas) ; le jeu retente à chaque appui de manette et affiche une invite (haut-parleur barré) au titre et en jeu tant que le son attend.
- **Ressenti** : carillon de trois notes quand une salle est nettoyée ; pouls sourd toutes les 1,15 s en combat quand il ne reste qu’un cœur (si l’on en a eu au moins deux) ; mort d’ennemi plus grave pour les gros.
- **Mixage** (mesuré hors ligne par `OfflineAudioContext`, effets et musique séparés) : gain maître modéré, compression légère (−16 dB, 2:1) et limiteur de sécurité (−3 dB) ; les effets passent par une **douceur** (aigus −6 dB au-dessus de 4 kHz, rien au-dessus de 9 kHz) ; réverbération partagée (salle de pierre de 2,2 s).
- **Hiérarchie** : chaque effet a un niveau calibré vers une cible par catégorie (RMS maximal sur 400 ms) — texture du combat discrète (tir −38 dB, impact −36, tir ennemi −39, menu −38), retours de jeu nets (alerte d'attaque −32, cœur −30, dégât reçu −26), grands moments présents (explosion −22, entrée de boss −20, objet −23). Un même son répété en rafale s'atténue (×0,74 à 2,5 lectures par seconde, ×0,63 à 4).
- **Avant / après la passe de confort** (le joueur trouvait les sons insupportables) : mélange de combat de −14 à −27 dB efficaces, crêtes de −0,8 à −5,5 dB, part d'énergie au-dessus de 4 kHz du tir de 30 % à 7 %, des pics de 71 % à 8 %, de la mèche de 92 % à 32 % ; le pouls de vie basse passe de −14 à −34 dB et l'alerte d'attaque devient deux coups de bois ronds au lieu d'un double tintement métallique. Effets et musique de combat ensemble : ≈ −24,5 dB, le niveau des jeux de salon.
- **Packs personnels** (`sons_perso.js`) : chaque fichier est normalisé à son chargement (≈ −18 dB efficaces, crête sous −1 dB) avant de recevoir le niveau de son effet.

## D11. Confort et accessibilité

| Option | Défaut | Effet |
|---|---|---|
| Volumes général / musique / effets | 0,8 / 0,45 / 0,6 | séparés ; les volumes enregistrés avant le nouveau mixage redescendent une fois à ces défauts |
| Vibrations | 0,7 | 0 = désactivées |
| Secousses | 0,7 | 0 = désactivées ; plafonnées et directionnelles |
| Sans flash | non | supprime flashs et clignotements (silhouette pâle) |
| Confort | non | transitions 0,18 s, animation d’objet 0,55 s, pas de ralenti décoratif (mort de boss), moins d’éclats, pas de poussière de pas, écrasement réduit |
| Éclairage dynamique | oui | lumières, halos et air du thème (décoratifs) ; à couper sur une machine modeste |
| Zones mortes, seuils de visée, hystérésis | B2 | réglables |
| Profil de tir | stick + boutons (comme *Isaac*) | stick + croix, stick seul, croix seule |
| Descriptions automatiques | oui | fiche de l’objet proche ; sinon au maintien de *Description* |
| Charge automatique | non | tir à pleine charge sans relâcher |
| Statistiques à l’écran | oui | masquables |
| Chiffres de dégâts | non | nombres au-dessus des ennemis |
| Échelle | entière | ou ajustée |
| Visée libre de la sphère | non | pour PSV_021 uniquement |

Les options se règlent entièrement à la manette et sont conservées à part du profil et des parties.
