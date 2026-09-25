# C. Bible artistique

La direction artistique est une exigence de conception, pas une finition. Les règles ci-dessous sont des **décisions de référence** ; chaque valeur est à valider sur la tranche verticale (§H3). Les fiches d'effets (VFX) et les briefs d'écrans (ART) sont dans [`C2_effets_et_briefs.md`](C2_effets_et_briefs.md).

**Ce qui est interdit dans la tranche verticale** : formes géométriques servant de personnages, emojis, sprites temporaires présentés comme finalisés, images simplement pixelisées (photo ou 3D réduite), mélange de résolutions (un sprite dessiné à 2× à côté d'un sprite à 1×), rotation libre de sprites de personnages (sauf projectiles prévus pour), mise à l'échelle non entière d'un sprite. Le prototype technique peut utiliser des placeholders **marqués** (damier magenta en coin + étiquette « PH ») pour qu'aucune capture ne les fasse passer pour définitifs.

## C1. Direction générale

* **Ton** : aventure shinobi contrastée et colorée. Personnages immédiatement reconnaissables par silhouette et couleurs signature ; environnements **moins saturés** que les actions importantes (saturation moyenne du décor ≤ 55 %, effets de gameplay 70–100 %).
* **Valeurs** : les zones sombres conservent une plage de valeurs qui laisse lire ennemis et projectiles (le décor le plus sombre reste ≥ 12 % de luminance ; les ennemis ont un contour 2 crans plus clair ou plus foncé que le fond local).
* **Lumière** : direction unique de **haut-gauche** (≈ 10 h). Ombres portées au sol en ellipse (personnages) ou en projection simple (décors), sans ombres dynamiques multiples.
* **Signature du jeu** : un contour coloré (« selout ») sur les personnages, des effets à cœur lumineux et bord graphique, et des impacts qui déforment brièvement les formes plutôt que de flasher l'écran.

## C2. Résolution, écrans et caméra

| Point | Décision | Justification |
|---|---|---|
| Résolution interne | **640 × 360** | 16:9, ×3 = 1080p et ×4 = 1440p exactement ; champ de 40 × 22,5 m (1 m = 16 px) suffisant pour lire une horde sans microscopie |
| Mise à l'échelle | Entière uniquement (×2, ×3, ×4, ×6) ; filtrage « nearest » | Pas de flou, pas de pixels de tailles différentes |
| 1920 × 1080 | ×3, plein écran | — |
| 2560 × 1440 | ×4, plein écran | — |
| 3840 × 2160 | ×6 | — |
| 1366 × 768, 1600 × 900 | ×2 (1280 × 720) + bandes noires fines (option « mise à l'échelle entière » activée par défaut) ; option « étirer proprement » : ×2 puis rendu à la résolution d'écran avec un filtre « sharp bilinear » documenté comme exception | Préserve les proportions |
| 16:10 (1920 × 1200) | ×3 + bandes horizontales (60 px) utilisées pour le HUD étendu | — |
| Ultralarge 21:9 (2560 × 1080, 3440 × 1440) | Champ horizontal étendu jusqu'à **720 px internes** (+12,5 %, 45 m) ; au-delà, bandes latérales décorées (motif de rouleau) | Équité : les règles d'apparition utilisent des **distances logiques fixes** (§G5) indépendantes de l'écran ; un joueur en ultralarge voit 2,5 m de plus de chaque côté mais les ennemis apparaissent toujours à ≥ 24 m du joueur, donc hors champ, et les indicateurs hors écran fonctionnent pareil |
| Caméra | Position calculée en flottant, **arrondie au pixel interne** au rendu ; suivi amorti (lerp 0,15 par tick) avec zone morte de 8 px | Les pixels ne vibrent pas ; séparation simulation / affichage |
| Sprites | Positions de simulation en flottant, **affichage arrondi à l'entier** ; sous-pixel interdit pour les sprites (autorisé pour les particules additives de 1 px) | Stabilité visuelle |
| Zoom | Aucun zoom dynamique (incompatible avec l'échelle entière) ; les invocations géantes utilisent un décalage de caméra (§B9.4) | — |

## C3. Grille, tailles et proportions

| Élément | Taille | Canevas | Notes |
|---|---|---|---|
| Tuile de sol | **16 × 16 px** (1 m) | — | Tuiles de transition 16 × 16 ; grands éléments en modules de 32 × 32 |
| Personnage humain | **28 px** de hauteur utile (±2 px selon la stature : Ōnoki 22, Chōji large 26 × 24, A 32) | 48 × 48 px | Place réservée aux poses étendues (coups de pied, armes) ; ancrage aux pieds |
| Proportions | ~3,5 têtes ; tête de 9–10 px de haut | — | Lisibilité des visages (yeux sur 2 px, bandeau sur 2 px) |
| Hitbox joueur | cercle 6 px (0,375 m) au bassin | — | Affichée en option (point blanc) ; indépendante de la taille visuelle |
| Ennemis ordinaires | 20–32 px | 48 × 48 | Rôle lisible par silhouette (§D5) |
| Élites | +20 % de hauteur **dessinée** (sprite dédié, jamais un agrandissement) + contour doré 1 px | 64 × 64 | — |
| Boss humains | 30–36 px + armes/effets | 96 × 64 à 128 × 96 | Identiques en échelle aux personnages : ils dominent par la mise en scène, pas par la taille |
| Boss immenses | 96–320 px (partiellement hors champ) | par parties | Découpage en parties décoratives / ciblables / dangereuses (§D4) |
| Invocations géantes | 96–160 px | par parties | Transparence 55 % sur conflit |
| Icônes | 24 × 24 (cartes, HUD) et 16 × 16 (listes) | — | Distinctes par **forme**, pas seulement par couleur |
| Portraits | 64 × 64 (sélection, dialogue bref) ; 32 × 32 (HUD) | — | — |

**Pourquoi 28 px** : à 640 × 360, 28 px occupent 7,8 % de la hauteur, soit ~84 px physiques en 1080p : assez pour reconnaître un personnage dans une vidéo de 3 s, assez petit pour garder 40 m de champ. Coût de production : un personnage complet ≈ 190 frames (§C6) à 28 px reste réaliste pour un pixel artiste (estimation à valider : 6–9 jours par personnage de base).

## C4. Palette et rendu

* **Palette maîtresse** : 64 couleurs (fichier `palette_maitresse.gpl`, à produire) organisées en **rampes par matériau** ; chaque sprite utilise un sous-ensemble.
* **Teintes par matériau** : peau 4 (ombre, base, lumière, reflet) ; tissu 3–4 ; métal 4 + 1 reflet ; cheveux 3–4 ; chakra/effets 3 + blanc de cœur.
* **Contours** : personnages et ennemis : contour de 1 px **coloré** (teinte la plus sombre de la rampe voisine, pas du noir pur) ; côté éclairé, contour éclairci (selout). Décors : **pas de contour** (sauf objets interactifs : contour 1 px discret). Effets alliés : bord graphique net, cœur lumineux.
* **Ombres** : ellipse au sol 50 % de la largeur du sprite, 3 px de haut, couleur d'ombre de la carte (pas de noir), opacité 60 % ; une seule ombre par entité.
* **Contraste** : hiérarchie de valeurs décor < ennemis < effets alliés < télégraphes ennemis < joueur (§C10).
* **Densité de détail** : 1 détail signature par personnage à 28 px (bandeau, gourde, éventail, masque) ; pas de texture de bruit sur les grandes surfaces (aplats + 1 motif).
* **Tramage** : autorisé pour les brumes, ombres de canopée, transitions de sol ; motif ordonné (Bayer 2 × 2 ou 4 × 4), jamais de bruit aléatoire animé (scintillement désagréable).

## C5. Bibliothèque cohérente

| Catégorie | Règles communes |
|---|---|
| Personnages | 28 px, contour coloré, 5 directions dessinées + miroirs (8 si accessoire asymétrique) |
| Ennemis | Mêmes règles ; accessoire de rôle lisible (bouclier, arc, bâton de soin, flûte…) |
| Armes | Dessinées à l'échelle du personnage (kunai 6 px, couperet 32 px) ; pas d'arme agrandie arbitrairement |
| Effets | Palette par famille (§C9), 3 couches max (fond, corps, cœur) ; tailles S/M/L dessinées |
| Décors | Tuiles 16 px, modules 32 px, sans contour, saturation ≤ 55 % |
| Icônes | Cadre commun par type (technique : cercle ; passif : carré ; équipement : losange ; ultime : hexagone ; transformation : étoile à 5 branches) |
| Cadres de récompense | Bois (ordinaire), laque à losanges (rare), noir à sceaux rouges hachuré (interdit) |
| Portraits | 64 × 64, fond neutre, éclairage haut-gauche, expression par état (neutre, blessé, déterminé) |
| Typographie | Police bitmap originale « Kōyō 8 » (8 px de haut, accents français complets, chiffres tabulaires) pour le HUD ; « Kōyō 12 » pour les titres ; option de police lisible non pixelisée pour l'accessibilité |

## C6. Animation des personnages

L'animation dessinée utilise **peu d'images** (poses fortes, tenues) tandis que la position est simulée à 60 Hz : le personnage glisse de façon fluide entre des poses nettes. Un faible nombre de dessins n'implique pas un jeu saccadé.

| Pose | Directions | Frames | Durée par frame | Points d'ancrage | Notes |
|---|---|---|---|---|---|
| Attente | 5 (+3 miroirs) | 4 | 180 ms | pieds, centre, tête | Respiration 1 px |
| Déplacement | 5 (+3) | 6 | 83 ms (12 i/s) ; adapté à la vitesse : la cadence d'animation suit la vitesse réelle (±30 %) | pieds (glissement interdit : la foulée correspond à la distance) | Course ninja penchée |
| Attaque générique (lancer) | 5 (+3) | 3 | 60 / 80 / 120 ms | main droite, main gauche | Réutilisée par les techniques sans pose dédiée |
| Sceaux (préparation) | 3 (face, profil, dos) | 3 | 80 ms | mains | Ne bloque pas le déplacement : la moitié haute du corps joue les sceaux, la moitié basse continue la course (sprites en 2 parties) |
| Attaque signature | 5 (+3) | 4–6 | 50–120 ms | main, bouche (Katon) | Pose d'impact tenue 2 frames |
| Dégâts | 5 | 2 | 60 ms | centre | Palette « blessé » 1 frame ; pas de recul du joueur |
| Esquive | 8 | 3 | 60 ms | pieds | Images rémanentes 2 × (couleur de chakra) |
| Transformation | 1 (face) | 6 | 80 ms | centre, tête | Joué pendant l'invulnérabilité d'activation (0,8 s) |
| Victoire | 1 | 6 | 120 ms | — | Pose signature (pouce levé de Guy, livre de Kakashi…) |
| Défaite | 1 | 4 | 150 ms | — | Genou à terre, pas de mort graphique |

Total indicatif : ≈ 190 frames par personnage de base (variantes : 60–120 frames supplémentaires, puisque la silhouette de base est réutilisée seulement si la variante garde la même tenue).

**Accessoires asymétriques** (bandeau de Kakashi sur l'œil gauche, gourde de Gaara, éventail de Temari, holster de kunai à la cuisse droite) : les 3 directions miroirs sont **redessinées** pour ces personnages (8 directions dessinées). Règle de coût : +40 % sur les poses de déplacement et d'attente seulement.

**Deux parties de corps** : pour que les sceaux et attaques ne figent jamais la course, les sprites de personnage sont découpés au bassin (haut 18 px / bas 10 px) avec un point d'ancrage commun ; les deux moitiés sont animées indépendamment.

## C7. Environnements

* **Relief suggéré** : falaises en 2 hauteurs (16 et 32 px) avec faces verticales plus sombres ; plates-formes surélevées signalées par une arête claire.
* **Couches** : (1) sol et surfaces de terrain, (2) décalques temporaires (traces), (3) objets au sol bas, (4) entités triées en Y, (5) premier plan (feuillage, toits) avec transparence, (6) effets alliés, (7) télégraphes et projectiles ennemis, (8) joueur et indicateurs, (9) HUD. Détail au §C10.
* **Tri de profondeur** : tri en Y sur le point d'ancrage au sol ; les objets hauts (arbres, colonnes) ont un point de tri à leur base.
* **Passer derrière un objet** : quand le joueur (ou un ennemi en préparation d'attaque) est masqué, l'objet de premier plan passe en tramage 50 % dans un cercle de 3 m autour de lui, et la silhouette du joueur est redessinée en contour blanc par-dessus (jamais perdue).
* **Végétation** : balancement de 3 frames à 4 i/s, désynchronisé par une graine de position ; réagit aux effets Fūton (couchée 0,5 s).
* **Eau** : boucle de 4 frames, reflets en bandes claires ; surface EAU de gameplay distinguée de l'eau décorative par un liseré clair continu.
* **Traces de combat** : décalques (brûlures, cratères, fissures) de 2 à 10 s ; plafond de 200 décalques ; les plus anciens s'effacent en fondu de 4 frames ; désactivables.

## C8. Techniques qui grandissent

Une technique qui gagne de la Zone ne se contente pas d'agrandir sa texture :

| Palier de taille | Méthode |
|---|---|
| ×1,0–1,3 | Mise à l'échelle **entière interdite** : on utilise le sprite S tel quel et on agrandit sa hitbox ; l'écart visuel est comblé par des particules de bord |
| ×1,3–1,7 | Sprite **M** dessiné (plus de détails, même grammaire) |
| ×1,7–2,0 | Sprite **L** dessiné + couche de cœur supplémentaire |
| Rayons et murs | Construction **modulaire** : tête + segments répétés + queue ; la longueur change sans étirer |
| Zones au sol | Tuiles d'effet de 16 px assemblées selon la forme (bord, coin, centre) |

## C9. Grammaire visuelle des familles

| Famille | Palette | Forme dominante | Rythme | Trajectoire | Texture | Impact | Départ → évolution |
|---|---|---|---|---|---|---|---|
| **Katon** | Rouges-orangés, cœur jaune pâle, fumée brune | Masses irrégulières, langues de feu | Gonflement puis relâche | Balistique lente, nappes | Braises, fumée | Combustion : fleur à lobes, braises retombantes | Boule simple → boule qui traverse et se divise, fumée noire, sol calciné |
| **Suiton** | Bleus translucides, écume blanche | Volumes fluides, arcs | Ondulation continue | Sinusoïdes, vagues | Reflets, gouttes | Éclaboussure en éventail, flaque | Jet → dragons jumeaux, raz-de-marée à 2 vagues |
| **Raiton** | Blanc-bleu, cœur blanc, pointes violettes | Branches nerveuses, angles vifs | Ruptures brèves (1–2 frames) | Instantanée, zigzag | Filaments | Impact sec, étincelles radiales | Arc simple → arbre ramifié construit par générations |
| **Fūton** | Blancs et verts pâles à 50 % d'opacité, feuilles | Lames aériennes, rubans | Rapide, fluide | Croissants, spirales | Lignes de flux, poussière directionnelle | Entailles en X, recul | Croissant → double croissant en V et feuilles hachées |
| **Doton** | Ocres, gris, bruns | Masses lourdes, fragments anguleux | Anticipation longue, impact net | Émergence, lob | Fissures, gravats | Retombées, poussière lourde | Pic → étoile de pics et poing de montagne |
| **Sable** | Ocre clair à sable foncé | Flux granulaires | Ruissellement | Enveloppement, vagues | Grains en tramage | Compression, accumulation au sol | Cercueil → six cercueils simultanés, sol entier sableux |
| **Ombre (Nara)** | Noir plat + contour violet (fonds sombres) | Surfaces plates, extensions graphiques | Glissement | Lignes au sol | Aucune (aplat) | Crochet, mains plates | Ruban → toile ramifiée |
| **Insectes** | Noirs à contour clair | Essaim organisé (boids) | Pulsation | Nuée | Points | Enveloppement | Nuée → deux nuées et reine esquissée |
| **Marionnettes** | Bois, laque, fils bleus | Poses mécaniques | Saccadé volontaire (changement de pose net) | Fils tendus | Articulations | Lames qui sortent | Une marionnette → parties séparées reliées par fils |
| **Illusions** | Violet pâle, répétitions | Déformations localisées | Lent, répétitif | Sur place | Échos, images rémanentes | Spirales au-dessus des têtes | Cône → cercle, fils de contagion ramifiés |
| **Sceaux** | Encre noire, lumière violette | Glyphes, cercles | Séquences horlogères | Au sol | Traits calligraphiques | Colonnes brèves | Glyphe → réseau et horloge de sceaux |
| **Flammes noires (Enton/Amaterasu)** | Noir, **contour blanc 1 px**, liseré rouge | Flammes hautes (8 px) | Lent, persistant | Collées aux cibles | Silhouette nette | Propagation par trait noir | Flamme → anneau autour du joueur |
| **Lumière / blanc (Jinton, Shinra)** | Blanc cassé (jamais blanc pur plein écran) | Cubes, anneaux | Formation lente | Au point | Quadrillage | Désintégration en pixels | Cube → cube résiduel |

**Lisibilité des effets sombres et clairs** : les flammes noires restent visibles grâce à leur contour blanc et leur silhouette haute ; les attaques blanches n'utilisent jamais le blanc pur sur plus de 20 % de l'écran et ne recouvrent jamais les télégraphes (ordre des couches).

**Allié vs ennemi (même élément)** :

| Indice | Allié | Ennemi |
|---|---|---|
| Contour | Blanc ou couleur claire de la famille | **Contour sombre épais (2 px)** + liseré rouge-violet |
| Motif | Motif de famille (spirale, glyphe) | Hachures diagonales |
| Animation | Fluide, s'éloigne du joueur | Pulsation d'avertissement (2 Hz) avant l'impact |
| Télégraphe | Pointillé blanc discret, jamais rempli | Zone **remplie** à 35 % + bord plein + hachures |
| Son | Timbre clair | Grave, précédé d'un signal d'avertissement |

Le rouge n'est pas « la couleur ennemie » (le joueur lance du feu rouge) : c'est le **motif hachuré + contour épais + pulsation** qui signale le danger.

## C10. Hiérarchie de rendu et lisibilité

Ordre de priorité de lecture et de rendu (du plus important au moins important) :

1. **Personnage joueur et état vital** — contour blanc 1 px, anneau au sol (cercle de 12 px, couleur de l'entrée), barre de PV sous le portrait ; toujours au-dessus des effets alliés.
2. **Dangers immédiats** — télégraphes ennemis (couche 7), zones remplies hachurées.
3. **Projectiles hostiles** — contour sombre épais, taille minimale 4 × 4 px, jamais transparents.
4. **Boss** — contour épais, barre de PV en haut d'écran.
5. **Ennemis** — contour coloré, ombres.
6. **Effets alliés** — **transparence dynamique** : 100 % par défaut, 35 % sur les pixels qui recouvrent un projectile hostile, un télégraphe ou le joueur ; réglage global « densité des effets alliés » 100 / 70 / 40 %.
7. **Décor** — saturation réduite, premier plan transparent autour des entités.

Règles complémentaires :
* **Forme évoluée immense ≠ hitbox immense** : la hitbox du joueur reste 0,375 m même dans l'Avatar de Kurama ou le Susanoo parfait ; l'anneau au sol et un point central (option) la rendent explicite.
* **Indicateurs hors écran** : flèches au bord (élites dorées, boss rouges, coffres bois, projectiles lourds entrants : chevron qui clignote 0,5 s avant l'entrée) ; aucune attaque létale n'entre dans le champ sans indicateur préalable (§D6).
* **Réduction automatique de charge visuelle** : si > 1 500 particules ou > 400 sprites d'effets, le système réduit **d'abord** les particules décoratives (braises, poussière, feuilles), **puis** les décalques, **puis** la densité des effets alliés ; il ne touche **jamais** aux télégraphes, projectiles hostiles, hitbox et chiffres de gameplay. La baisse de qualité ne réduit aucun dégât.

## C11. Satisfaction : animations et impacts

### C11.1 Structure d'une attaque importante

Préparation lisible → lancement → trajet ou déploiement → impact → dissipation. Les attaques rapides (kunai, senbon) compressent préparation et lancement en 1–2 frames mais gardent une silhouette identifiable. Détails image par image dans les fiches VFX (`C2_effets_et_briefs.md`) ; résumé des séquences de référence demandées :

| Séquence | Étapes (durées) | Décision visible |
|---|---|---|
| **Rasengan** | Concentration 300 ms (4 filaments convergent) → rotation interne en boucle (6 frames) → déformation en ellipse à l'impact (2 frames) → 3 anneaux de pression (4 frames) → 6 fragments projetés dans l'axe → retour au calme en spirale (3 frames) | Personnage toujours visible (orbe décalé de 6 px devant la main) — VFX_001 |
| **Clone** | Fumée 250 ms (6 frames) → révélation de la silhouette (2 frames, contour bleu clair) → pose de combat 1 frame → action → « pouf » 4 frames | Clone désaturé de 15 % + contour bleu ; joueur contour blanc + anneau — VFX_002 |
| **Attaque physique lourde** | Anticipation 250 ms (épaule reculée, poing ×1,2) → pose d'impact tenue 100 ms (×1,5) → écrasement horizontal des cibles 2 frames → poussière dirigée → recul ease-out 200 ms | Le poids vient de l'anticipation, de la pose tenue et de la déformation ; secousse facultative — VFX_003 |
| **Foudre** | Construction du trajet (tête épaisse qui avance en 1 frame par saut) → ramifications secondaires décoratives (1 frame après) → point d'arrivée (étoile 2 frames) → disparition en 3 frames (épaisseur 2 → 1 px) | Jamais un trait statique : la tête se déplace — VFX_004 |
| **Invocation géante** | Annonce 1,2 s (motif de contrat au sol) → apparition (fumée 8 frames, onde) → attaque principale télégraphiée en couleur alliée → retrait (fumée 6 frames) | Attaques ennemies au-dessus pendant toute la séquence — VFX_010 |

### C11.2 Éliminations

| Type | Signature | Durée |
|---|---|---|
| Ordinaire | 1 frame de flash local (palette claire), éclatement en 3 frames (fumée ou poussière selon le type), fragment qui jaillit en arc | 150 ms |
| Élite | Figée 2 frames, contour doré qui se brise en 6 éclats, fragments dorés en fontaine, son dédié (accord de 3 notes) | 400 ms (pas de ralentissement global) |
| Boss | Conclusion spécifique (1–2,5 s, raccourcie après la 1re victoire), ralenti global 30 % pendant 0,5 s puis retour, aucun écran noir | voir fiches de boss |

### C11.3 Fragments d'expérience

Apparition : petit arc de 0,25 s (hauteur 6 px, ombre au sol qui reste), rebond de 1 px. Attraction : ease-in de 0 à 14 m/s en 0,25 s quand le joueur entre dans le rayon. Absorption : 1 frame de scintillement sur le joueur + « tic » sonore dont la hauteur monte avec la série (voir C14). Aucune animation ne retarde l'ajout de l'XP : l'XP est créditée au contact logique, l'étincelle est décorative.

### C11.4 Trois intensités de feedback

| Événement | Intensité | Visuel | Son | Durée |
|---|---|---|---|---|
| Montée de niveau | 1 (légère) | Anneau doux autour du joueur (2 frames), cartes qui glissent depuis le bas | Carillon court | 250 ms avant l'écran de cartes |
| Évolution | 2 (moyenne) | Séquence de 900 ms (ci-dessous), icône transformée, silhouette animée de la technique | Impact sonore unique + motif de la famille | 900 ms (300 ms en rapide) |
| Transformation | 3 (forte) | Pose dédiée 6 frames, aura qui naît du sol, silhouette changée, onde au sol (pas de flash plein écran) | Thème du personnage (4 s), voix d'activation | 800 ms d'invulnérabilité |

**Séquence d'évolution (référence de 900 ms)** : 0–150 ms arrêt du gameplay, icône existante mise en valeur, détails de fond réduits (−40 % de luminosité du décor, pas de flash) ; 150–420 ms ouverture graphique d'un rouleau, motif de la famille, transformation de l'icône ; 420–720 ms nouveau nom + brève silhouette animée de la technique, impact sonore unique ; 720–900 ms retour à l'interface ; les télégraphes et projectiles reprennent avec le **même temps restant** ; 0,5 s d'invulnérabilité à la reprise. La première attaque de la technique évoluée part dans les 0,5 s pour confirmer le changement.

### C11.5 Micro-pauses (hitstop)

* **Locales par défaut** : seule la cible (et l'image de frappe) se fige 40–60 ms ; le reste du monde continue.
* **Globales** (monde entier figé) : réservées à 3 événements rares — élimination d'élite (0 ms global, locale 80 ms), coup final d'un boss (120 ms), fin de transformation sacrificielle (80 ms).
* **Fréquence** : au plus 1 micro-pause locale par cible toutes les 0,3 s, et 6 cibles figées simultanément max ; aucune micro-pause sur les coups des hordes ordinaires quand > 30 ennemis sont touchés dans la même seconde.
* **Chronomètres** : une micro-pause globale suspend les chronomètres de gameplay (télégraphes compris) ; une micro-pause locale ne suspend que l'animation et le mouvement de la cible (ses télégraphes éventuels continuent : pas d'abus de gel des attaques ennemies).

### C11.6 Caméra, vibrations, variations

* **Secousse** : directionnelle (dans l'axe de l'impact), amplitude max 3 px internes, 120 ms, décroissance exponentielle ; plafond d'une secousse toutes les 0,5 s ; désactivable et réglable (0–100 %). Les grandes attaques utilisent d'abord poussière, recul des ennemis et onde au sol.
* **Vibration manette** : 3 profils (léger 40 ms, moyen 80 ms, fort 150 ms) avec plafond de 4 impulsions/s ; intensité réglable ; aucune vibration pour les impacts ordinaires en horde (au-delà de 10 impacts/s).
* **Variations** : chaque effet fréquent a 2–4 variantes de sprite (rotation par pas de 90°, miroir, décalage de phase) et 3–5 variantes sonores tirées dans le **flux RNG cosmétique** (§G6) ; les particules ont une durée de vie ±20 %.

### C11.7 Confort et accessibilité visuelle

Réglages : supprimer les flashs (flash local remplacé par un contour), réduire les secousses, alléger les particules (−60 %), raccourcir les animations (évolution 300 ms, coffre 0,4 s ou instantané, entrée de boss passable), sans clignotement (invulnérabilité = contour + anneau pointillé). Avec tous ces réglages, la puissance du build reste compréhensible : les dégâts, la forme des zones, les chiffres (optionnels) et les icônes d'état ne changent pas.

## C12. Progression visuelle de la puissance

### C12.1 Cinq paliers de présentation

Repères de mise en scène (pas des statistiques).

| Palier | Moment typique | Silhouette du joueur | Taille relative des effets | Éléments actifs simultanés | Richesse d'animation | Intensité sonore | Part du champ couverte par les effets alliés |
|---|---|---|---|---|---|---|---|
| Débutant | 0–3 min | Sprite de base | S (≤ 1,5 m) | 1–3 | Poses simples | Sons secs isolés | ≤ 10 % |
| Shinobi confirmé | 3–8 min | + aura faible sur les techniques signature | S/M | 4–8 | Anticipations visibles | Premiers accords | 10–20 % |
| Jōnin | 8–14 min | + accessoires de build (clones, marionnettes, essaim) | M | 8–15 | Combinaisons reconnaissables | Couches rythmiques | 20–35 % |
| Kage | 14–20 min | Évolutions, formes nouvelles | M/L modulaires | 15–30 | Enchaînements coordonnés | Motif de personnage dans la musique | 35–50 % (transparence dynamique active) |
| Légendaire | Boss final, éveils, transformations | Silhouette transformée | L + géants | 30+ (plafonds logiques) | Séquences signatures | Thème complet | 50 % max hors ultime ; l'ultime peut couvrir 70 % pendant ≤ 2 s |

Règle : même au palier Légendaire, les menaces majeures (télégraphes de boss, projectiles lourds) restent au-dessus et entières.

### C12.2 Séquence 1 — Naruto et son armée de clones (BLD_001)

| Moment | Composition de l'image | Comportement réel |
|---|---|---|
| **00:30** | Naruto seul au centre, 1 clone contouré bleu qui frappe un poursuivant à 1 m ; 3 kunai en éventail ; 6 ennemis gris | 1 clone (plafond 1), Kunai en éventail niv. 1 : l'écran est calme, les fumées sont brèves |
| **05:00** | 2 clones en course de part et d'autre, fumées d'apparition régulières (toutes les 5 s), un Rasengan bleu dans la main de Naruto ; la horde forme un arc autour | Kage Bunshin niv. 4, Rasengan niv. 2 ; les clones qui disparaissent lancent un Rasengan à 60 % (CPX) : petites ondes bleues à la périphérie |
| **12:00** | Vague de 8 clones en V qui traverse l'écran (Tajū), 2 crapauds de combat qui bondissent, 3 clones permanents qui convergent sur une élite (triangle bleu au-dessus) | Tajū niv. 5, Kage Bunshin niv. 7 (concentration), SYN_041 ; le joueur lit « une armée » mais les unités logiques restent ≤ 8 |
| **20:00** | Manteau orange du Kyūbi sur Naruto et sur ses clones (éveil EVO_117), 6 clones qui frappent de bras de chakra, Rasengan coordonnés en Ōdama à intervalles réguliers | Plafond global 8 unités atteint ; transparence des effets alliés à 35 % sur les projectiles ennemis |
| **Boss final** | Les clones encerclent le boss à distance (2 m), convergence toutes les 6 s (4 orbes bleues synchrones), Naruto garde son anneau au sol visible au milieu | Le boss reste lisible : ses télégraphes sont au-dessus des clones ; les clones évitent de rester dans les zones télégraphiées (IA de clones : sortent des zones remplies) |

### C12.3 Séquence 2 — Sasuke et sa tempête de foudre (BLD_004)

| Moment | Composition | Comportement |
|---|---|---|
| **00:30** | Une boule de feu lente traverse l'écran, Sasuke au centre ; pas encore de foudre | Gōkakyū niv. 1 |
| **05:00** | Chidori : l'image bleutée fonce sur les menaces, arcs courts au sol, une chaîne d'éclairs saute entre 5 ennemis | Chidori niv. 3, Arc en chaîne niv. 2 |
| **12:00** | Un nuage d'orage grandit au-dessus d'un groupe (construction lisible), couronne de courant autour de Sasuke toutes les 1,2 s, arbres de foudre à plusieurs générations | Kirin niv. 4, Chidori Nagashi, Tempête ramifiée ; le nuage prévient 5 s à l'avance |
| **20:00** | Marque maudite (ailes-mains, peau grise), orage permanent (EVO_022), deux bêtes de foudre qui tombent (éveil EVO_115), l'écran est parcouru d'arcs courts qui ne masquent pas les ennemis (épaisseur 1 px, durée 2 frames) | Pic de dégâts ; lisibilité assurée par la brièveté des arcs |
| **Boss final** | Les éclairs se concentrent sur le boss (priorité), les arcs secondaires frappent les soutiens ; la silhouette de Sasuke reste contourée blanc au centre d'un cercle de courant | Kirin synchronisé avec les fenêtres de vulnérabilité (le joueur l'observe) |

### C12.4 Séquence 3 — Gaara et sa forteresse de sable (BLD_008)

| Moment | Composition | Comportement |
|---|---|---|
| **00:30** | Gaara immobile, un ruban de sable tourne près de lui et jaillit en paroi quand un ennemi le touche ; un cercueil se referme sur une cible | CPX Suna no Tate (1 charge), Sabaku Kyū niv. 1 |
| **05:00** | Anneau de sable au sol autour de Gaara (surfaces SABLE), ennemis ralentis dans le sable, cœur de cyclone qui dévie les projectiles | Suna no Tate équipé (3 charges), Œil du cyclone |
| **12:00** | Raz-de-marée de sable qui submerge un couloir, clones de sable qui s'effritent, sol à 30 % couvert de sable | Cascade de sable, Suna Bunshin ; Gaara se déplace plus vite sur le sable (signature) |
| **20:00** | Armure de sable (bras et queue surdimensionnés), six cercueils qui se ferment en même temps (son groupé), bouclier de Shukaku (silhouette de tanuki esquissée à chaque blocage) | EVO_045, EVO_044, TRF_011 |
| **Boss final** | Tout l'écran devient sable (éveil Désert impérial) ; les cercueils partent chaque seconde sur les soutiens ; le boss se détache sur un sol ocre uniforme (contraste maximal) | Désert impérial ; lisibilité : le sol uniforme **améliore** la lecture des télégraphes |

### C12.5 Logique, décoratif, indicateur

| Couche | Exemples | Règle |
|---|---|---|
| **Unités logiques** (collision, dégâts) | Clones, projectiles, zones, essaim (1 unité) | Plafonnées par les règles de jeu, identiques sur toutes les machines |
| **Particules décoratives** | Braises, feuilles, insectes de l'essaim, fumée, débris | Aucune collision, réductibles par les réglages ; ne doivent jamais ressembler à une attaque (pas de contour de danger, pas de forme de projectile) |
| **Indicateurs de gameplay** | Télégraphes, anneau du joueur, triangle de cible prioritaire, marques | Jamais réduits ; formes et couleurs réservées |

Un effet décoratif ne doit pas faire croire à une attaque inexistante : par exemple, les 30 insectes de l'essaim n'ont pas d'ombre au sol et se déplacent en nuage (un seul contour), tandis que les attaques réelles ont une ombre ou un contour.

## C13. Interface

### C13.1 HUD de combat

| Zone | Contenu | Taille (px internes) |
|---|---|---|
| Haut gauche | Portrait 32 × 32 + jauge circulaire de chakra autour ; PV (barre 96 × 6 + chiffres) ; bouclier (segment doré) | 140 × 40 |
| Haut centre | Chronomètre (Kōyō 12), barre d'XP pleine largeur (4 px) avec niveau | 640 × 16 |
| Haut droite | Ryō de la run, éliminations (option) | 80 × 20 |
| Bas gauche | 6 icônes de techniques 16 × 16 (niveau en pips, scintillement d'évolution admissible) ; transformation (étoile) avec jauge de recharge | 150 × 20 |
| Bas droite | Relance / Bannissement / Passage (compteurs), équipements (2 losanges) | 100 × 20 |
| Contextuel | Barre de boss (haut, 400 × 6), avertissement d'événement (bandeau 1,5 s), indicateurs hors écran | — |

Les détails de statistiques restent dans la pause ou au survol (souris) / maintien de Select (manette).

### C13.2 Cartes d'amélioration

Contenu obligatoire : nom, icône 24 × 24, niveau (pips « 3 → 4 »), **bénéfice principal en une phrase**, différence avant/après chiffrée (« Clones : 1 → 2 »), compatibilités utiles (pastilles : « + Conduction », « Catalyseur de EVO_069 »), avertissements (« Consomme Trempé », « Aucun effet actuel »). Les icônes sont distinctes par forme (cadres §C5) et motif, pas seulement par couleur.

### C13.3 Écrans (contenu prioritaire, action principale, durée d'animation cible)

| Écran | Contenu prioritaire | Action principale | Animation cible |
|---|---|---|---|
| Titre | Logo original du projet, fond animé du village | « Jouer » (reprise auto de la dernière run si présente) | Entrée 1,5 s, passable |
| Sélection | Portrait 64 px, technique de départ, ultime, 2 orientations, maîtrise | « Lancer » | Changement de personnage 150 ms |
| Carte (village/missions) | Liste des cartes et missions, rang, récompense | « Choisir » | 200 ms |
| Combat | HUD §C13.1 | — | — |
| Amélioration | 3 (ou 4) cartes | Choisir (1/2/3), Relance, Bannissement, Passage | Apparition 250 ms |
| Coffre | Contenu du coffre (1, 3 ou 5) | « Prendre » | 1,2 s / 0,4 s / instantané |
| Évolution | Ancienne → nouvelle icône, nom, silhouette animée | Automatique | 900 ms / 300 ms |
| Pause | Build, statistiques détaillées, recettes connues | Reprendre | Immédiate (1 frame) |
| Défaite | Cause de la mort, top 5 sources, progression | **Rejouer** (focalisé à 0,5 s) | 0,5 s |
| Victoire | Temps, boss vaincu, top 5, progression, déblocages | Rejouer / Village | 1,5 s (passable) |
| Maîtrise | Niveaux 1–10 du personnage, récompenses | Équiper une option | 200 ms |
| Archives | Personnages, techniques, ennemis, synergies, recettes, secrets (indices) | Consulter | 150 ms |

### C13.4 Écran de build et Archives

* **Build** (Tab/Select) : 6 + 6 + 2 emplacements, ultime et transformation ; liens lumineux entre objets d'une recette **connue** ; silhouette + indice pour une recette **inconnue** dont on possède au moins une source.
* **Archives Ninja** : entrées débloquées à la première rencontre (ennemi vu, technique obtenue, synergie déclenchée). Les secrets affichent leurs indices progressifs (§D11) sans divulguer la condition exacte avant l'étape 3 ; les secrets « obscurs » n'ont pas de 3e indice.

## C14. Audio

### C14.1 Familles et priorités

| Famille | Priorité (1 = jamais coupé) | Voix simultanées max | Règle de regroupement |
|---|---|---|---|
| Avertissements de boss et d'événement | 1 | 4 | Jamais coupés ; les autres familles baissent de 6 dB pendant 0,4 s (ducking) |
| Dégâts subis par le joueur, coup lourd | 2 | 2 | — |
| Ultimes, transformations, évolutions | 3 | 2 | — |
| Techniques du joueur (lancement) | 4 | 12 (3 par technique) | Au-delà : la variation la plus ancienne est coupée |
| Impacts du joueur | 5 | 10 | Impacts du même type dans la même frame : un seul son plus fort (+2 dB) |
| Éliminations | 6 | 6 | Regroupement par fenêtre de 50 ms |
| Collecte de fragments | 7 | 2 | **Montée sonore** : hauteur +1 demi-ton par fragment dans une série (fenêtre 150 ms), plafonnée à +12, puis accord de résolution ; 100 fragments = une gamme montante, pas 100 sons identiques |
| Récompenses (coffre, rouleau) | 3 | 1 | — |
| Ambiance de carte | 8 | 3 | — |

### C14.2 Musique

Compositions **originales** (aucun morceau ni voix extraits de l'anime). Structure adaptative à 4 couches (percussions, basse, mélodie, motif du personnage) ; transitions à la mesure, déclenchées par des paliers (entrée en vague d'apogée, élite, boss, transformation), jamais par de petites variations (hystérésis de 8 s). Boss : thème propre avec intro de 2 s synchronisée sur l'entrée. Victoire : cadence de 4 s ; défaite : accord suspendu de 2 s puis silence léger (le bouton Rejouer ne coupe pas la musique brutalement).

### C14.3 Voix

Voix originales enregistrées pour le prototype (texte bref : noms de techniques, interjections) ; fréquence plafonnée (1 réplique / 8 s par personnage), désactivable ; langue japonaise ou française au choix, sous-titres optionnels. L'utilisation de voix de doublage officielles n'est pas supposée.

## C15. Accessibilité (récapitulatif)

Taille du texte (100 / 125 / 150 %, police lisible non pixelisée en option), contraste renforcé du HUD, remappage complet, maintien ou bascule pour chaque action à maintien, pause immédiate (et automatique à la perte de focus ou au débranchement de la manette), sauvegarde de reprise, signaux multicanaux (chaque danger important a une forme + un mouvement + un son ; les événements ont un bandeau texte court), modes daltoniens (les télégraphes reposent déjà sur les hachures, les palettes de famille sont vérifiées en deutéranopie, protanopie et tritanopie), réglages de confort (§C11.7), assistance au déplacement seul (§B1.6).
