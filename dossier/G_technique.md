# G. Préproduction technique

**Hypothèse de moteur** : Godot 4 (branche stable au moment du lancement de la production, version exacte à figer au sprint 0). Le dossier **ne dépend d'aucune fonctionnalité non vérifiée** : les principes (simulation à pas fixe, données déclaratives, pools d'objets, grille spatiale, flux aléatoires séparés) sont indépendants du moteur ; les points dépendants de Godot sont marqués **[Godot]** et doivent être validés par un prototype de mesure (§H2).

> Rien dans cette partie n'est une implémentation testée. Le pseudocode est une spécification. Le seul code exécuté est l'outillage de contenu de `outils/` (validation, génération, référence de sauvegarde).

## G1. Principes

1. **Séparation** : simulation (état de jeu, pas fixe) · données (catalogues immuables chargés au démarrage) · rendu (lecture seule de l'état, interpolation d'affichage) · interface · audio (événements) · sauvegarde.
2. **Données, pas scripts** : une technique est un enregistrement de données qui compose des **comportements génériques** (émetteur, projectile, zone, chaîne, unité, déclencheur) avec des paramètres par niveau. Les exceptions (≈ 10 % des techniques, ex. Kage Buyō, Edo Tensei) utilisent des **crochets** nommés (`hook: "reanimation_elite"`) implémentés une seule fois.
3. **Plafonds logiques = règles** : les limites (unités, projectiles, chaînes, budget d'événements par tick) sont des constantes de jeu, identiques sur toutes les machines. Les réglages graphiques ne touchent que la présentation.
4. **Déterminisme pratique** : même graine + mêmes entrées = même run sur la même version (voir limites §G6).

## G2. Architecture en modules

```
                ┌──────────── Données (catalogues YAML → ressources compilées) ────────────┐
                │ personnages · techniques · évolutions · synergies · passifs · objets ·   │
                │ états · ennemis · boss · cartes · vagues · missions                      │
                └───────────────┬───────────────────────────────────────┬────────────────┘
                                │ lecture seule                          │
 Entrées ─► [Commandes] ─► ┌────▼─────────── Simulation (tick 1/60 s) ───▼───────────────┐
 (clavier,   (tampon par    │ Mouvement · Ciblage · Attaques · Dégâts · États · Invocations│
  manette)    tick)         │ Vagues · Récompenses · Évolutions · Progression de run       │
                            │ Grille spatiale · Pools · Bus d'événements de gameplay       │
                            └────┬───────────────┬───────────────┬─────────────────────────┘
                                 │ instantané     │ événements    │ état de run
                        ┌────────▼──────┐ ┌──────▼──────┐ ┌──────▼────────┐
                        │ Présentation   │ │ Audio        │ │ Sauvegarde    │
                        │ (sprites, VFX, │ │ (priorités,  │ │ (profil,      │
                        │ caméra, HUD)   │ │ voix, musique│ │ reprise)      │
                        └────────────────┘ └──────────────┘ └───────────────┘
```

| Module | Responsabilité | Entrées | Sorties |
|---|---|---|---|
| Mouvement | Vitesse, normalisation, glissement sur obstacles, séparation douce des ennemis | Commandes, obstacles | Positions (flottants) |
| Ciblage | Règles `plus_proche`, `plus_dense`, `plus_menacant`, `direction`, `chemin`… avec hystérésis | Grille spatiale | Cible par instance de technique |
| Attaques | Émetteurs et instances (projectiles, zones, chaînes, contacts, pièges, unités) | Données de technique + niveau + statistiques | Demandes de dégâts, états |
| Dégâts | Ordre de calcul (§B4.2, §B4.4), critiques, résistances, boucliers, attributions | Demandes | Événements `degats`, `elimination` |
| États | Application, cumul, durée, résistance de contrôle | Événements | Modificateurs |
| Déclencheurs / synergies | Écoute du bus, conditions, ICD, profondeur, budget | Événements | Nouvelles demandes (SECONDAIRE) |
| Invocations | Unités alliées, héritage §R9, plafond global | Techniques d'invocation | Unités |
| Vagues | Script de segments, formations, règles de sécurité d'apparition | Données de vague, temps | Apparitions |
| Récompenses | Tirage des cartes, coffres, rouleaux, filet de pertinence | Pool, état de build | Propositions |
| Évolutions | Validation des recettes, remplacement, recalcul | Build, inventaire | Nouvelles techniques |
| Progression | XP, niveaux, chakra, ultime, transformation | Événements | État du joueur |
| Sauvegarde | Profil (atomique), reprise (instantané de run) | État | Fichiers |
| Présentation | Sprites, animation, VFX, transparence dynamique, LOD visuel | Instantané de simulation | Image |

## G3. Performance

**Objectif à tester** : 60 i/s stables dans la **scène de référence** : MAP_016, 500 ennemis simulés, 1 000 projectiles logiques, 8 unités alliées, 300 fragments, 1 500 particules décoratives.

**Machine de test de référence (à acquérir, hypothèse)** : processeur 6 cœurs de milieu de gamme de génération récente, 16 Go de RAM, carte graphique intégrée ou d'entrée de gamme, SSD, écran 1080p ; et une machine « basse » : 4 cœurs anciens, 8 Go.

| Budget par frame (16,6 ms) | Cible | Mesure |
|---|---|---|
| Simulation (1 tick) | ≤ 4 ms (machine de référence), ≤ 7 ms (basse) | Profilage par module, 95e centile sur 5 min |
| Rendu | ≤ 6 ms | Nombre de draw calls ≤ 300 (sprites groupés par atlas) |
| Audio | ≤ 1 ms | Voix actives ≤ 48 |
| Marge | ≥ 5 ms | — |

Techniques :
* **Pools d'objets** pour projectiles, zones, fragments, textes de dégâts, particules (pré-alloués au lancement de la run selon les plafonds logiques).
* **Grille spatiale** (hachage uniforme, cellules de 3 m) reconstruite chaque tick pour les ennemis ; requêtes de voisinage pour ciblage, chaînes, zones et séparation. Les projectiles testent seulement les cellules traversées.
* **Collisions réduites** : ennemis ordinaires = cercles sans physique générique ; pas de collision ennemi-ennemi exacte (séparation approximative par cellule) ; aucun corps physique par particule.
* **Regroupement des collectes** : 300 fragments logiques max (§B6.2), attraction calculée en lot.
* **Niveaux de détail visuels** : distance au joueur → frames d'animation réduites pour les ennemis lointains (8 i/s au lieu de 12), particules décoratives supprimées au-delà du bord ; **jamais** sur la logique.
* **Essaims et effets décoratifs** : boids calculés en présentation uniquement, sans collision (les 30 insectes de Kikaichū coûtent un seul disque logique).
* **[Godot]** rendu par lots : vérifier au prototype si des nœuds de sprites individuels suffisent pour 500 ennemis ou s'il faut un rendu d'instances multiples (MultiMesh ou équivalent) ; décision au sprint 0 sur mesure, pas sur hypothèse.

## G4. Boucle de simulation

```
tant que le jeu tourne :
    accumulateur += temps_réel_écoulé (plafonné à 0,25 s pour éviter la spirale)
    tant que accumulateur ≥ 1/60 :
        si état == COMBAT et non suspendu :
            tick_simulation(commandes_du_tick)
        accumulateur −= 1/60
    alpha = accumulateur / (1/60)
    rendre(interpoler(état_précédent, état_courant, alpha))   # position d'affichage arrondie au pixel
```

Le gameplay est indépendant du nombre d'images affichées : la même seconde de jeu contient toujours 60 ticks. Suspension (menus, montée de niveau, coffre, évolution) : aucun tick n'est exécuté, tous les chronomètres restent figés.

## G5. Distances logiques et apparition

Les règles d'apparition, de ciblage « à l'écran » et de détection utilisent des **distances logiques** exprimées en mètres (écran logique de référence 40 × 22,5 m), jamais la taille réelle de la fenêtre : un écran ultralarge montre davantage mais ne change ni l'apparition (≥ 24 m, hors du champ de référence) ni le ciblage (candidats limités au rectangle logique de référence + 2 m).

## G6. Aléatoire et reproductibilité

| Flux | Graine dérivée | Utilisé pour |
|---|---|---|
| `rng_run` | graine de run | Échantillonnage du pool, événements, tirage des élites |
| `rng_butin` | hachage(graine, « butin ») | Cartes de niveau, coffres, rouleaux (indépendant du combat : les dégâts n'influencent pas les cartes proposées) |
| `rng_combat` | hachage(graine, « combat ») | Critiques, trajets de foudre logiques, Suiken |
| `rng_vagues` | hachage(graine, « vagues ») | Positions d'apparition |
| `rng_cosmetique` | non sauvegardé | Variantes de sprites, sons, particules (libre de changer entre machines) |

Limites : la reproduction exacte n'est garantie que sur une même version et une même plateforme (les flottants peuvent diverger entre compilateurs) ; les replays ne sont pas un objectif de la 1.0. Le mode « Défi du jour » éventuel partagerait seulement la graine et le pool, pas une garantie bit à bit.

## G7. Pseudocode de référence

### G7.1 Tirage des récompenses de niveau

```
fonction proposer_cartes(build, pool, etat_rng, compteur_S):
    exclusions = techniques_max(build) ∪ passifs_max(build) ∪ bannis(build) ∪ recettes_consommées(build)
    candidats = {A: améliorations_techniques(build) \ exclusions,
                 B: si build.emplacements_tech_libres > 0 : pool.techniques \ possédées \ exclusions sinon ∅,
                 C: améliorations_passifs(build) \ exclusions,
                 D: si build.emplacements_pas_libres > 0 : pool.passifs \ possédés \ exclusions sinon ∅}
    proba_base = {A: 0,40, B: 0,30, C: 0,15, D: 0,15}
    cartes = []
    pour i de 1 à nb_cartes(build):                     # 3, ou 4 aux niveaux multiples de 5 si débloqué
        si i == 1 et compteur_S ≥ 2 et existe_pertinent(candidats):
            catégories_autorisées = {A, C} (+ catalyseurs de D)
        sinon: catégories_autorisées = {A, B, C, D}
        p = {k: proba_base[k] si candidats[k] non vide et k ∈ catégories_autorisées sinon 0}
        si somme(p) == 0: sortir de la boucle
        k = tirage_pondéré(normaliser(p), etat_rng.butin)
        poids = {x: 100 × facteurs(x, build) pour x dans candidats[k]}   # ×1,3 direction (hors E_NEUTRE), ×1,5 catalyseur,
                                                                          # ×1,2 signature, ×0,3 sans effet, ×0,7 refusé
        x = tirage_pondéré(poids, etat_rng.butin)
        cartes.ajouter(x); candidats[k].retirer(x)                       # pas de doublon
    si cartes est vide: cartes = [RATION, BOURSE, CONCENTRATION]
    compteur_S = 0 si une carte est pertinente sinon compteur_S + 1
    renvoyer cartes, compteur_S
```

### G7.2 Résolution d'une attaque

```
fonction resoudre_touche(source, cible, instance, profondeur):
    si cible.invulnérable ou déjà_touchée(instance, cible) : renvoyer
    B = instance.base_niveau
    A = 1 + somme(bonus_additifs(source, instance, cible))
    M = produit(multiplicateurs(source, instance))   si instance.secondaire == faux sinon 1
    C = source.dégâts_crit si (non instance.secondaire et tirage(rng_combat) < chance_crit(source, instance)) sinon 1
    V = 1 + min(0,50, somme(cible.vulnérable))
    R = 1 − min(0,50, max(0, cible.résistance − cible.corrosion))
    dégâts = max(1, arrondi(B × A × M × C × V × R))
    appliquer_dégâts(cible, dégâts, attribution = instance.technique_source)
    appliquer_états(instance.états, cible, résistance_contrôle = cible.Rc)
    publier(evenement("touche", source, cible, instance, dégâts, profondeur))
    si cible.PV ≤ 0 : publier(evenement("élimination", cible, instance.technique_source, profondeur))
```

Côté joueur (§B4.4) : réduction % (≤ 60 %) → armure avec plancher 25 % → bouclier → PV → vérification des effets de survie → déclencheurs → soins en fin de tick.

### G7.3 Limitation d'une chaîne d'effets

```
constante PROFONDEUR_MAX = 2 ; BUDGET_TICK = 200 ; REPORT_MAX = 3

fonction traiter_evenement(e):
    pour chaque synergie s abonnée à e.type :
        si e.profondeur ≥ PROFONDEUR_MAX : continuer               # un effet de profondeur 2 ne déclenche rien
        si s.id ∈ e.origines : continuer                             # anti-auto-déclenchement
        si maintenant < s.prochain_autorisé[e.propriétaire] : continuer   # ICD
        si non s.condition(e) : continuer
        si budget_tick_restant == 0 :
            file_report.ajouter(e, s, reports = e.reports + 1) si e.reports < REPORT_MAX
            continuer
        budget_tick_restant −= 1
        s.prochain_autorisé[e.propriétaire] = maintenant + s.icd
        pour chaque effet f produit par s.effet(e) :
            f.secondaire = vrai ; f.profondeur = e.profondeur + 1 ; f.origines = e.origines ∪ {s.id}
            f.technique_source = e.technique_source                   # attribution des éliminations
            planifier(f)
```

Les clones et unités ne relaient que les synergies qui listent explicitement leur tag (`CLONE`, `ANIMAL`…). Aucune unité ne peut créer une unité du même type (validation de données + garde d'exécution).

### G7.4 Validation d'une évolution (en run)

```
fonction recettes_admissibles(build, temps):
    liste = []
    pour chaque r dans catalogue.evolutions :
        si r.consommée(build) : continuer
        si r.type == EVOLUTION :
            ok = build.possède(r.source, niveau = 8) et tous(build.équipé(c) pour c dans r.catalyseurs)
        si r.type == FUSION :
            ok = tous(build.possède(s, niveau = 8) pour s dans r.sources) et tous(build.équipé(c) pour c dans r.catalyseurs)
        si r.type == EVEIL :
            ok = build.possède(r.source) et temps ≥ 15:00 et condition_tardive_satisfaite(r, build)
        ok = ok et accès_satisfait(r, build.personnage)                 # compatibilité, déjà garantie par le pool
        si ok : liste.ajouter(r)
    renvoyer liste

fonction appliquer_recette(r, build):
    si r.type == EVOLUTION : build.remplacer(r.source, r.id)             # même emplacement, table de valeurs propre
    si r.type == FUSION : build.retirer(r.sources[1]) ; build.remplacer(r.sources[0], r.id)  # 1 emplacement libéré
    si r.type == EVEIL : build.remplacer(r.source, r.id)
    transférer_bonus_ciblés(r, build)                                    # §B7.3, sinon +10 % Puissance affichés
    journal.découvrir(r.id)
```

La validation **hors ligne** (`outils/valider.py`) vérifie en plus : sources et catalyseurs existants, au moins un personnage capable de réaliser la recette (accès des sources, des catalyseurs et condition tardive), absence de cycles, profondeur ≤ 2, une seule évolution simple par technique.

## G8. Schémas de données

Types : `id` (motif `^[A-Z]{3}_\d{3}$`), `ref<X>` (identifiant existant du catalogue X), `m` (mètres, flottant ≥ 0), `s` (secondes, flottant ≥ 0, arrondi au tick), `%` (fraction), `int≥0`, `texte`, `enum{…}`, `liste<…>`, `?` = facultatif. Validation : `outils/valider.py` (références, plages, cohérence) ; schémas JSON formels fournis pour les techniques et les évolutions (`data/schemas/`).

| Catalogue | Champs (type) |
|---|---|
| **Personnage** | id ; nom (texte) ; type (enum BASE/VARIANTE) ; base? (ref CHR, obligatoire si VARIANTE) ; prioritaire? (booléen) ; identite (texte) ; depart (ref JUT, accessible) ; stats {pv int>0, depl m/s>0, notes?} ; cpx {nom, effet} ; faiblesse ; signature ; aptitudes (liste<enum §R5>) ; ultime (ref ULT, réciproque) ; transformations (liste<ref TRF>, réciproque) ; deblocage {type enum DEPART/PREMIERE_RUN/MISSION/MAITRISE, niveau? int 1–10, ref? ref MIS} ; orientations (liste ≥ 2) |
| **Technique** | id ; nom ; statut (enum OA/CO/AV) ; famille (enum §R6, cohérente avec la plage d'id) ; livraison (enum §R8) ; tags (liste<enum §R8>, ≥ 1 affinité) ; cible (enum ciblage) ; comportement ; valeurs (texte lisible au prototype → **table par niveau** en production : `niveaux: [ {degats int, delai s, portee m, …} × 8 ]`) ; visuel ; acces (expression §R5) ; limites? ; hook? (crochet nommé) |
| **Évolution** | id ; nom ; statut ; type (enum EVOLUTION/FUSION/EVEIL) ; sources (liste<ref JUT|EVO>, 1 ou 2) ; catalyseurs (liste<ref PAS|EQP>) ; condition_tardive? (expression TRF/EQP) ; comportement ; valeurs ; limites ; visuel |
| **Synergie** | id ; nom ; statut ; references (liste<ref|tag|STA|SURF>) ; condition ; effet (formule) ; limite (ICD) ; plafond ; compatibilite ; contrepartie ; manifestation ; boss_isole |
| **Passif** | id ; nom ; statut ; acces ; stat ; par_niveau (5 niveaux) ; applique_a (liste de catégories/tags) |
| **Équipement** | id ; nom ; rarete (enum Ordinaire/Rare/Interdit) ; statut ; acces ; role (enum) ; effet ; contrainte (obligatoire si Interdit) |
| **État** (`STA`) | id ; nom ; effet ; duree s ; cumul int ; controle (booléen) ; conversion_boss? |
| **Ennemi** | id ; nom ; statut ; role (enum 9 rôles) ; elite (booléen, cohérent avec la plage 076–100) ; modificateur? ; cartes (liste<ref MAP>) ; pv int>0 ; vitesse m/s ; degats int ; xp int ; comportement ; annonce |
| **Boss** | id ; nom ; statut ; niveau_detail (enum integral/detaille/identite) ; cartes ; role_carte ; pv ; resistance % ; silhouette ; hitbox ; entree (≤ 2,5 s) ; deplacement ; phases? (liste {seuil, changements}) ; attaques? (liste {nom, zone, avertissement s ≥ 0,5 si dégâts ≥ 20, active s, degats, recuperation s, reponse, info enum visible/apprise}) ; mecanique? ; vulnerabilites ; controle ; conclusion |
| **Carte** | id ; nom ; trace ; taille ; palette ; obstacles ; ressources ; ennemis (liste<ref ENM>) ; evenement ; boss (ref BOS) ; boss_secondaires (liste<ref BOS>) ; secret ; contrainte |
| **Vague** | id ; carte (ref MAP) ; mode ; segments (liste {debut s, fin s > debut, composition {ref ENM: poids, somme = 100}, taux ≥ 0, formation enum, plafond int, elites? [{t, id}], lieutenant? {t, id}, boss? {t, id}, evenements? [...]}) |
| **Mission** | id ; nom ; type ; mode ; carte (ref MAP) ; personnage (ref CHR ou TOUS, jamais débloqué par la mission elle-même) ; rang ; condition ; recompenses {ryo int, deblocages liste<ref>, autres} ; dependances (liste<ref MIS>) |

### G8.1 Exemple complet et cohérent

```yaml
# Personnage (extrait de data/personnages_1.yaml)
- id: CHR_001
  nom: "Naruto Uzumaki"
  type: BASE
  prioritaire: true
  depart: JUT_217
  stats: {pv: 120, depl: 4.5, notes: "Régénération +0,3/s de base (vitalité Uzumaki)"}
  cpx: {nom: "Volonté indomptable", effet: "Sous 30 % de PV : +15 % Cadence et +1 clone au plafond de JUT_217."}
  aptitudes: [ELEM_FUTON, CLAN_UZUMAKI, APT_RASEN, CTR_CRAPAUD, APT_JINCH]
  ultime: ULT_001
  transformations: [TRF_001, TRF_024]
  deblocage: {type: DEPART}

# Technique en format de production (table par niveau ; valeurs de la fiche approfondie)
- id: JUT_217
  famille: INVOC
  livraison: INVOCATION
  tags: [E_NEUTRE, UNITE_ALLIEE, CLONE]
  cible: plus_proche
  acces: "CHR_001|CHR_002|CHR_003|CHR_008|CHR_009|CHR_010|CHR_027|CHR_028|CHR_031|CHR_032|CHR_079"
  unite: {type: CLONE, plafond_regle: rafraichir_plus_ancien, frappe_intervalle: 0.9}
  niveaux:
    - {delai: 5.0, duree: 4.0, degats: 18, nombre: 1, plafond: 1}
    - {delai: 5.0, duree: 5.0, degats: 18, nombre: 1, plafond: 1}
    - {delai: 5.0, duree: 5.0, degats: 23, nombre: 1, plafond: 1}
    - {delai: 5.0, duree: 5.0, degats: 23, nombre: 2, plafond: 2}
    - {delai: 5.0, duree: 5.0, degats: 23, nombre: 2, plafond: 2, derniere_frappe_recul: 1.2}
    - {delai: 4.0, duree: 5.0, degats: 23, nombre: 2, plafond: 2, derniere_frappe_recul: 1.2}
    - {delai: 4.0, duree: 5.0, degats: 23, nombre: 2, plafond: 2, derniere_frappe_recul: 1.2, concentration: 2.0}
    - {delai: 4.0, duree: 5.0, degats: 23, nombre: 3, plafond: 3, derniere_frappe_recul: 1.2, concentration: 2.0}

# Évolution
- id: EVO_069
  type: EVOLUTION
  sources: [JUT_217]
  catalyseurs: [PAS_060]
  valeurs_evoluees: {delai: 4.0, duree: 6.0, degats: 30, nombre: 4, plafond: 4,
                     coordonne: {intervalle: 6.0, degats: 50, par_clone: 1}}

# Synergie
- id: SYN_001
  references: [E_SUITON, E_RAITON, STA_03]
  declencheur: {evenement: touche, tags_requis: [E_RAITON], cible_etat: STA_03, secondaire: false}
  effet: {type: arcs, nombre: 2, portee: 4.0, coefficient_base: 0.30, applique: [A, V, R], critique: false,
          consomme: STA_03, boss_isole: {arcs: 1, coefficient_base: 0.40, prolonge_etat: 0.5}}
  icd: 0.6

# Vague (extrait de data/vagues.yaml)
- id: VAG_001
  carte: MAP_002
  mode: Standard
  segments:
    - {debut: 180, fin: 300, composition: {ENM_003: 45, ENM_011: 20, ENM_019: 20, ENM_020: 15},
       taux: 2.0, formation: pinces, plafond: 120, elites: [{t: 270, id: ENM_077}]}
```

## G9. Sauvegardes

| Élément | Décision |
|---|---|
| Fichiers | `profil.json` (déblocages, Ryō, maîtrise, Archives, réglages) ; `reprise.json` (instantané de run) |
| Versionnement | Champ `version` (entier) ; migrations successives v(n) → v(n+1) ; implémentation de référence : `outils/sauvegarde.py` (v1 → v3, testée par `outils/tests_validateur.py`) |
| Écriture atomique | Fichier temporaire du même dossier → `fsync` → renommage ; l'ancienne version devient `.bak` ; lecture de secours sur `.bak` si le fichier est corrompu |
| Moments | Profil : fin de run, achats, changements de réglages. Reprise : lancement de run, toutes les 60 s, à chaque ouverture de menu, à la perte de focus |
| Reprise d'une run | Instantané complet (graine, flux RNG, temps, build, positions, ennemis, états) ; reprise dans l'état exact, en pause ; une reprise n'est jamais migrée entre versions **majeures** (abandon propre avec Ryō acquis crédités) |
| Mise à jour de contenu | Les identifiants sont stables (jamais réattribués) ; une entrée retirée devient `retiré` et ses déblocages sont conservés sous forme de compensation (Ryō ou cosmétique) ; les nouvelles entrées de départ sont ajoutées par migration |
| Accessibilité | Réglages dans le profil, appliqués avant l'écran titre (pas de flash avant lecture des réglages) |
| Sauvegarde manuelle | Non nécessaire : pause immédiate + reprise automatique |

## G10. Pipeline artistique

1. **Palette maîtresse** (64 couleurs) et rampes par matériau ; vérification automatique : un script refuse toute couleur hors palette dans les sprites de production.
2. **Esquisses de silhouette** à 28 px sur fond gris moyen, test de reconnaissance en noir pur (silhouette seule) : ≥ 80 % de reconnaissance entre personnages du roster voisins.
3. **Poses clés** (attente, course, attaque signature) → animation → découpage haut/bas du corps → points d'ancrage exportés en métadonnées (main D/G, bouche, pieds, centre, tête).
4. **Export** : feuilles de sprites par personnage (atlas 1 024 × 1 024), métadonnées JSON (frames, durées, ancrages) ; génération automatique des palettes de clone (désaturation 15 % + contour bleu) et des palettes d'états (blessé, invulnérable).
5. **Effets** : tailles S/M/L dessinées, modules pour les rayons et murs, variantes allégées marquées.
6. **Contrôles automatiques** : dimensions multiples de 16 pour les tuiles, canevas standards (48, 64, 96, 128), absence de semi-transparence hors couches autorisées, absence de pixels isolés hors palette.
7. **Revue** : capture comparative à la résolution interne ×1 (pas seulement ×3) pour juger la lisibilité réelle.
