# Fiches approfondies — 24 personnages prioritaires

Développement des entrées de base marquées ★ dans `personnages.md`. Les chiffres (PV, vitesse) et les identifiants viennent de `data/personnages_*.yaml`. Chaque fiche ajoute : lecture de gameplay, conversion du rôle en capacité à éliminer des hordes, points d'animation spécifiques, variantes et builds de référence.

Rappel : sprites humains de 28 px de hauteur utile dans un canevas de 48 × 48 px (§C3), 8 directions pour le déplacement (5 dessinées + 3 miroirs, sauf accessoires asymétriques : 8 dessinées).

---

## CHR_001 — Naruto Uzumaki

* **Identité** : submerger par le nombre. Le joueur apprend que la quantité (clones, crapauds) compense des dégâts individuels faibles.
* **Départ** : JUT_217 Kage Bunshin · PV 120 · 4,5 m/s · Régénération +0,3/s.
* **Passif exclusif** « Volonté indomptable » : sous 30 % PV, +15 % Cadence et +1 au plafond de clones. Signal : contour orange pulsé autour du portrait.
* **Signature** : les clones portent le Rasengan (60 % à leur disparition, 1 fois par clone) si JUT_281 est possédé.
* **Faiblesse** : puissance individuelle faible avant 8 min ; aucun contrôle natif.
* **Compatibilités** : Fūton, Uzumaki, lignée du Rasengan, crapauds, jinchūriki (pas de Katon, pas de genjutsu).
* **Ultime / transformation** : ULT_001 Barrage de Rasengan des clones ; TRF_001 Manteau du Kyūbi (une queue), TRF_024 Forme à quatre queues (risquée, perte de contrôle partielle annoncée).
* **Déblocage** : disponible au départ.
* **Orientations** : Armée de clones (BLD_001), Rasengan porté par le vent → Rasenshuriken (BLD_002), Invocations de crapauds (BLD_030).
* **Animation** : course penchée en avant (4 frames), bras en arrière (pose reconnaissable) ; bandeau et veste orange-bleu ; clones à palette désaturée de 15 % et contour bleu clair.
* **Variantes** : CHR_002 Mode Ermite (mêlée + immobilité), CHR_003 Chakra de Kurama (vitesse, double ultime).

## CHR_004 — Sasuke Uchiha

* **Identité** : précision. Flammes à distance, foudre en réponse au danger ; récompense l'esquive parfaite.
* **Départ** : JUT_001 Gōkakyū · PV 100 · 4,7 m/s · +5 % critique.
* **Passif exclusif** « Sharingan (3 tomoe) » : télégraphes des ordinaires vus 0,15 s plus tôt ; fenêtre d'esquive parfaite +0,1 s.
* **Signature** : chaque esquive parfaite réduit de moitié le délai restant de la technique Raiton la plus lente.
* **Faiblesse** : PV faibles, pas de soin natif.
* **Compatibilités** : Katon, Raiton, Uchiha, Sharingan, faucon, kenjutsu.
* **Ultime / transformation** : ULT_004 Tempête des mille oiseaux ; TRF_005 Marque maudite (drain annoncé).
* **Déblocage** : départ.
* **Orientations** : Tempête de foudre (BLD_004), Flammes Uchiha (BLD_005).
* **Animation** : pose de sceaux rapide (3 frames), col montant, emblème Uchiha visible en vue de dos ; Chidori tenu main gauche (accessoire asymétrique : 8 directions dessinées).
* **Variantes** : CHR_005 Taka (kenjutsu électrique), CHR_006 Mangekyō éternel (Enton, Susanoo).

## CHR_007 — Sakura Haruno

* **Identité** : force contrôlée. Peu de coups, tous décisifs ; soins mesurés.
* **Départ** : JUT_175 Ōkashō · PV 110 · 4,4 m/s · soins reçus +20 %.
* **Passif exclusif** « Contrôle précis du chakra » : les critiques de taijutsu libèrent une onde de 1,5 m (40 %).
* **Signature** : élite éliminée → soin 8 % PV max (plafonné).
* **Conversion en élimination** : ses ondes de critique et Séisme transforment chaque coup en dégâts de zone ; ses soins lui permettent de rester au contact, là où ses techniques sont les plus efficaces.
* **Faiblesse** : portée courte.
* **Compatibilités** : Doton, médical, limaces, genjutsu.
* **Ultime** : ULT_006 Coup de poing tectonique (Maîtrise de l'ultime : plaques-obstacles).
* **Orientations** : Frappes tectoniques (BLD_006), soutien médical et genjutsu défensif (Katsuyu + Kyōten Chiten).
* **Variante** : CHR_011 Byakugō (réserve de soins convertie en frappe ×3).

## CHR_008 — Kakashi Hatake

* **Identité** : ninja aux mille techniques ; polyvalence élémentaire et chasse aux élites.
* **Départ** : JUT_050 Raikiri · PV 105 · 4,6 m/s · pool +1 par élément possédé.
* **Passif exclusif** « Copie du Sharingan » : après avoir vu 3 fois une technique d'élite, carte bonus d'une technique de même famille.
* **Signature** : « Polyvalence » : +10 % Puissance à deux techniques d'éléments différents.
* **Faiblesse** : gain de chakra −15 %.
* **Compatibilités** : Raiton, Doton, Suiton, Katon, Sharingan, ninken, kenjutsu, genjutsu.
* **Ultime** : ULT_008 Meute traqueuse.
* **Déblocage** : toute run terminée après 03:00 (règle de première défaite).
* **Orientations** : Raiton et meute (BLD_007), mosaïque Suiton-Doton (Mur d'eau + Mur de terre + Conduction).
* **Animation** : main dans la poche en attente, bandeau sur l'œil gauche (asymétrique), Raikiri main droite.
* **Variantes** : CHR_009 Kamui (effacement spatial), CHR_010 ANBU (dos et leurres).

## CHR_012 — Gaara

* **Identité** : défense mobile automatique puis contrôle de zone.
* **Départ** : JUT_131 Sabaku Kyū · PV 110 · 4,1 m/s · Armure +2.
* **Passif exclusif** « Défense absolue » : Suna no Tate actif avec 1 charge sans occuper d'emplacement.
* **Signature** : surfaces SABLE du joueur : ennemis ralentis, joueur +10 % vitesse dessus.
* **Conversion en élimination** : le contrôle (Ensablé → Enseveli) prépare les exécutions du cercueil et de l'enterrement ; les contre-attaques du bouclier frappent les poursuivants.
* **Faiblesse** : lenteur, projectiles lents.
* **Compatibilités** : sable, Fūton, jinchūriki.
* **Ultime / transformation** : ULT_010 Sabaku Taisō ; TRF_011 Armure de sable (coût : −15 % déplacement, soins −50 %).
* **Déblocage** : MIS_112 (vaincre Gaara).
* **Orientations** : Forteresse mobile (BLD_008), Désert contrôlé (BLD_009).
* **Animation** : gourde dans le dos (volume qui dépasse de 6 px), bras croisés à l'attente ; sable en flux granulaire animé à 12 i/s.

## CHR_014 — Rock Lee

* **Identité** : vitesse et engagement au contact ; aucun ninjutsu.
* **Départ** : JUT_161 Konoha Reppū · PV 125 · 5,2 m/s.
* **Passif exclusif** « Fleur de la jeunesse » : +3 % Cadence par ennemi touché au contact dans les 2 s (max +30 %).
* **Signature** : poids aux chevilles (+1 charge d'esquive) qui tombent à la première Porte (+15 % déplacement).
* **Faiblesse** : tireurs lointains ; zones ennemies.
* **Compatibilités** : Portes internes (plus LIBRE : taijutsu, outils de base).
* **Ultime / transformation** : ULT_011 Tourbillon de la jeunesse ; TRF_009 Portes (6 max).
* **Orientations** : Tourbillon de contact (BLD_010), Portes et Lotus (BLD_011).
* **Animation** : garde caractéristique (paume ouverte en avant), sourcils épais lisibles à 28 px grâce à 2 px noirs ; tenue verte à contour sombre ; sprite de course plus long (6 frames) pour la vitesse.
* **Variante** : CHR_015 Poing ivre (frappes erratiques, compteur d'ivresse visible).

## CHR_016 — Neji Hyūga

* **Identité** : sanctuaire à 360° et points vitaux.
* **Départ** : JUT_297 Kaiten · PV 110 · 4,5 m/s.
* **Passif exclusif** « Byakugan » : ciblage à 360° sans angle mort ; Marque automatique d'une élite toutes les 8 s.
* **Signature** : chaque Rotation prépare le Champ des trigrammes (prochain CONTACT touche 2 fois).
* **Conversion en élimination** : la rotation repousse puis le double coup nettoie les groupes rapprochés.
* **Faiblesse** : zone lointaine faible.
* **Compatibilités** : Hyūga, Byakugan.
* **Ultime** : ULT_012 Champ des trigrammes.
* **Orientations** : Sanctuaire rotatif (BLD_012), 64 paumes et points vitaux.
* **Animation** : cheveux longs (volume animé 2 frames), veines du Byakugan visibles en gros plan de portrait uniquement (pas à 28 px).

## CHR_017 — Hinata Hyūga

* **Identité** : protectrice ; affaiblir la horde plutôt que la détruire.
* **Départ** : JUT_296 Jūken · PV 105 · 4,5 m/s · réduction des dégâts +5 %.
* **Passif exclusif** « Détermination » : −2 % dégâts subis par ennemi affaibli à 3 m (max −10 %).
* **Signature** : ses boucliers durent 50 % plus longtemps.
* **Conversion en élimination** : les ennemis affaiblis (−20 % dégâts) lui permettent de rester au centre de la horde, où 64 paumes et Rotation touchent le plus de cibles.
* **Faiblesse** : lente à nettoyer avant 10 min.
* **Ultime** : ULT_012.
* **Orientations** : Affaiblissement de masse (BLD_013), Protection des 64 paumes.
* **Variante** : CHR_018 Poings de lion (drain de chakra, cycle d'ultime).

## CHR_019 — Shikamaru Nara

* **Identité** : stratège ; immobiliser puis exécuter.
* **Départ** : JUT_282 Kagemane · PV 100 · 4,3 m/s.
* **Passif exclusif** « Plan à 200 coups » : aperçu grisé d'une carte de la proposition suivante.
* **Signature** : OMBRE +2 s ; liés Vulnérables +15 %.
* **Conversion en élimination** : les pièges posés sur l'ombre (SYN_016) et les étranglements convertissent le contrôle en dégâts ; Vulnérable profite à toutes ses explosions.
* **Faiblesse** : dégâts directs faibles.
* **Compatibilités** : Nara, Katon (mines), sceaux.
* **Ultime** : ULT_014 Filet d'ombres total.
* **Orientations** : Exécution des ombres (BLD_014), champ de pièges.
* **Variante** : CHR_020 Héritier d'Asuma (lames de vent).

## CHR_021 — Shino Aburame

* **Identité** : patience ; la nuée grandit à chaque ennemi parasité qui meurt.
* **Départ** : JUT_291 Kikaichū · PV 105 · 4,2 m/s.
* **Passif exclusif** « Ruche vivante » : +2 % dégâts d'essaim par mort parasitée (max +60 %).
* **Signature** : essaim = 1 unité logique, insectes décoratifs.
* **Conversion en élimination** : dégâts continus + Éclosion (SYN_039) = propagation virale dans les hordes.
* **Faiblesse** : démarrage lent ; pas d'explosion.
* **Ultime** : ULT_015 Nuée dévorante.
* **Orientations** : Nuée croissante (BLD_015), dômes et contre-attaques.
* **Animation** : col haut, lunettes noires ; les mains restent dans les manches (l'essaim sort des manches).

## CHR_022 — Kiba Inuzuka

* **Identité** : duo mobile avec Akamaru.
* **Départ** : JUT_294 Gatsūga · PV 115 · 4,8 m/s.
* **Passif exclusif** « Flair » : élites et coffres hors écran signalés ; Akamaru offert au niveau 3.
* **Signature** : Gatsūga part d'Akamaru : deux angles.
* **Faiblesse** : couverture arrière dépendante d'Akamaru.
* **Ultime** : ULT_016 Gatsūga en rafale.
* **Orientations** : Vrilles croisées (BLD_016), Meute.
* **Variante** : CHR_023 Garōga (forage lourd, tranchées).

## CHR_024 — Kankurō

* **Identité** : marionnettiste ; trois marionnettes spécialisées.
* **Départ** : JUT_202 Karasu · PV 100 · 4,2 m/s · fils +2 m.
* **Passif exclusif** « Maître des fils » : marionnettes comptées pour 1/2 dans le plafond d'unités.
* **Signature** : combo Kuroari + Karasu ×2.
* **Faiblesse** : rester à moins de 9 m de ses marionnettes.
* **Ultime** : ULT_025 Cent marionnettes.
* **Orientations** : Trio de marionnettes (BLD_017), poison et pièges.
* **Animation** : maquillage violet (2 px sur le visage), capuche à oreilles ; fils de 10 doigts (ancrages main gauche/droite).
* **Variante** : CHR_025 Marionnette de Sasori (retournement des ennemis).

## CHR_026 — Temari

* **Identité** : contrôle au vent ; dégager le champ.
* **Départ** : JUT_074 Kamaitachi · PV 100 · 4,5 m/s · Zone +10 %.
* **Passif exclusif** « Grand éventail » : Fūton +1 m ; Frappe d'éventail réduit les délais.
* **Signature** : Kamatari gratuit toutes les 3 Kamaitachi.
* **Faiblesse** : dégâts modérés par coup.
* **Ultime** : ULT_018 Tempête tranchante.
* **Orientations** : Faux de vent (BLD_018), vent attiseur (avec les passifs de terrain).
* **Animation** : éventail géant replié dans le dos (asymétrique), déploiement en 3 frames (3 lunes visibles).

## CHR_027 — Jiraiya

* **Identité** : Sannin polyvalent : huile, feu, crapauds, cheveux.
* **Départ** : JUT_010 Gamayu Endan · PV 130 · 4,3 m/s.
* **Passif exclusif** « Ermite des crapauds (Gama Sennin) » : huile +2 s ; +1 Rouleau par run.
* **Signature** : Maîtrise de l'ultime (Hari Jizō riposte à 3 contacts).
* **Faiblesse** : pas de transformation dans cette version.
* **Compatibilités** : Katon, Doton, Fūton, crapauds, Rasengan, sceaux.
* **Ultime** : ULT_019 Hari Jizō.
* **Orientations** : Huile et feu (BLD_019), crapauds et Rasengan.
* **Variante** : CHR_028 Mode Ermite (anciens sur les épaules).

## CHR_029 — Tsunade

* **Identité** : force sannin et longévité : soigne en frappant, gagne en encaissant.
* **Départ** : JUT_174 Tsūtenkyaku · PV 150 · 4,2 m/s · Régénération +0,5/s.
* **Passif exclusif** « Hémophobie vaincue » : sous 50 % PV, taijutsu +25 %.
* **Signature** : chaque coup lourd (≥ 40) soigne 1 PV.
* **Conversion en élimination** : sa survie lui permet de rester au centre, là où ses talons et séismes touchent le plus d'ennemis.
* **Faiblesse** : lente, peu d'outils à distance.
* **Ultime / transformation** : ULT_007 Katsuyu ; TRF_012 Byakugō.
* **Orientations** : Talon céleste et régénération (BLD_020), Katsuyu de soutien.

## CHR_030 — Orochimaru

* **Identité** : serpents, poison, invocations interdites ; puissance tardive.
* **Départ** : JUT_227 Sen'ei Tajashu · PV 110 · 4,4 m/s.
* **Passif exclusif** « Mue » : une fois par run, annule un coup fatal (1 → 40 % PV, 1,5 s d'invulnérabilité).
* **Signature** : morsures empoisonnées ; cibles à 5 cumuls attirent les serpents.
* **Faiblesse** : démarrage lent.
* **Compatibilités** : Fūton, serpents, corps modifié, sceaux, kenjutsu.
* **Ultime** : ULT_020 Yamata no Jutsu.
* **Orientations** : Nids de serpents et réanimés (BLD_021), sceaux interdits (Gogyō Fūin, Rashōmon).

## CHR_031 — Itachi Uchiha

* **Identité** : illusionniste économe : leurres, corbeaux, frappes rares et décisives.
* **Départ** : JUT_223 Karasu Bunshin · PV 95 · 4,6 m/s · +10 % critique.
* **Passif exclusif** « Maladie » : PV max −10 %, techniques Oculaires −15 % de délai.
* **Signature** : ses leurres provoquent aussi les élites.
* **Faiblesse** : fragile.
* **Ultime / transformation** : ULT_021 Épée de Totsuka ; TRF_007 Susanoo (drain annoncé pour la version de base).
* **Orientations** : Corbeaux et flammes noires (BLD_022), genjutsu (Tsukuyomi + Hypnose).
* **Variante** : CHR_032 Réanimé (pas de soins, reconstitution).

## CHR_033 — Kisame Hoshigaki

* **Identité** : réserve de chakra infinie, drain au contact.
* **Départ** : JUT_198 Samehada · PV 140 · 4,3 m/s · chakra +20 %.
* **Passif exclusif** « Bête à queues sans queue » : 100 chakra dépensés → 10 % PV.
* **Signature** : sur EAU, +20 % déplacement et +15 % Suiton.
* **Faiblesse** : portée courte hors eau.
* **Ultime / transformation** : ULT_022 Danse des requins ; TRF_018 Fusion Samehada.
* **Orientations** : Arène aquatique (BLD_023), drain Samehada.
* **Variante** : CHR_034 Maître des requins (inondation et invocations).

## CHR_035 — Deidara

* **Identité** : l'art est une explosion : créatures d'argile, bombes différées.
* **Départ** : JUT_147 C1 · PV 95 · 4,5 m/s.
* **Passif exclusif** « Katsu ! » : les créatures non explosées explosent quand même (50 %).
* **Signature** : explosions qui détruisent obstacles et projectiles ennemis.
* **Faiblesse** : chargeurs rapides.
* **Ultime** : ULT_023 C0 (coût annoncé, jamais mortel).
* **Orientations** : Tapis de mines (BLD_024), grandes bombes C3.
* **Variante** : CHR_036 Artiste aérien (survole, C4 exclusif).
* **Animation** : bouches dans les paumes visibles en portrait seulement ; mèche sur l'œil ; pose « Katsu » à deux doigts levés.

## CHR_037 — Sasori

* **Identité** : poison absolu, marionnettes humaines.
* **Départ** : JUT_205 Hiruko · PV 100 · 4,1 m/s.
* **Passif exclusif** « Poison de Sasori » : Poison jusqu'à 15 cumuls, 2,5/s par cumul.
* **Signature** : marionnettes jamais rompues (fils 12 m).
* **Conversion en élimination** : le poison ignore la résistance des boss et se propage (SYN_025 avec Fūton) ; les marionnettes font le nettoyage.
* **Faiblesse** : mise en place longue.
* **Ultime** : ULT_025 Cent marionnettes.
* **Orientations** : Poison maximal (BLD_025), armée de marionnettes.
* **Variante** : CHR_038 Troisième Kazekage (sable de fer).

## CHR_039 — Pain (Chemin des Dieux)

* **Identité** : contrôler l'espace autour de soi : repousser, attirer.
* **Départ** : JUT_313 Shinra Tensei · PV 115 · 4,2 m/s.
* **Passif exclusif** « Intervalle de cinq secondes » : attraction/répulsion partagent 1 s de délai mais font +30 %.
* **Signature** : alternance affichée sur l'icône (repousser puis attirer = bonus).
* **Faiblesse** : créneaux de vulnérabilité.
* **Ultime** : ULT_026 Chibaku Tensei.
* **Orientations** : Répulsion-attraction (BLD_026), bestiaire des chemins.
* **Variante** : CHR_040 Six Chemins (corps logiques qui lancent depuis d'autres angles).
* **Animation** : piercings (2 px clairs), manteau d'Akatsuki à nuages rouges contourés blanc ; Rinnegan en portrait.

## CHR_041 — Minato Namikaze

* **Identité** : Éclair jaune ; kunai de marquage et téléportation **volontaire** (uniquement à l'esquive).
* **Départ** : JUT_265 Hiraishin — Kunai de marquage · PV 105 · 5,0 m/s · recharge d'esquive −25 %.
* **Passif exclusif** « Dieu du tonnerre volant » : chaque esquive laisse un kunai de marquage.
* **Signature** : esquive vers un kunai (sans dégâts de base, avec dégâts via JUT_266).
* **Faiblesse** : dépend des kunai sur le terrain.
* **Compatibilités** : Fūton, Katon, Raiton, sceaux, Rasengan, crapauds.
* **Ultime** : ULT_027 Danse éclair.
* **Orientations** : Réseau de kunai (BLD_027), Rasengan et sceaux.
* **Variante** : CHR_042 Chakra de Kurama (Rasengan téléporté).
* **Animation** : cape de Hokage à flammes (pan de cape en 3 frames de retard pour le mouvement) ; éclair jaune de 1 frame à la téléportation (pas de flash plein écran).

## CHR_043 — Madara Uchiha

* **Identité** : légende armée ; feu de masse, éventail de guerre, Susanoo.
* **Départ** : JUT_007 Gōka Mekkyaku · PV 130 · 4,5 m/s · Puissance +10 %.
* **Passif exclusif** « Danse » : +5 % Puissance par élite éliminée (max +30 %).
* **Signature** : Gunbai renvoie aussi les projectiles de boss mineurs.
* **Faiblesse** : délais longs, mobilité défensive faible.
* **Ultime / transformation** : ULT_028 Gōka Messhitsu ; TRF_008 Susanoo parfait (collecte suspendue).
* **Orientations** : Extinction par le feu (BLD_028), Susanoo et gunbai.
* **Variante** : CHR_044 Rinnegan (Mokuton, météores).

## CHR_045 — Might Guy

* **Identité** : Bête verte : ouvrir les Portes au bon moment puis tout balayer.
* **Départ** : JUT_166 Dynamic Entry · PV 135 · 5,1 m/s.
* **Passif exclusif** « Rival éternel » : chaque élite éliminée au contact ouvre une Porte de plus.
* **Signature** : Portes par paliers visibles (1 à 7 ; 8e via TRF_010, sacrifice annoncé et non mortel).
* **Faiblesse** : coût en PV, pas de contrôle à distance.
* **Ultime / transformations** : ULT_011 ; TRF_009 Portes, TRF_010 Porte de la mort.
* **Orientations** : Paon, tigre et éléphant (BLD_029), tortue et nunchaku (défense).
* **Animation** : pose « Nice guy » (pouce levé) en victoire ; Porte 7 : vapeur verte, sprite dédié (pas de filtre coloré).
