# Shinobi Clash

Jeu de collection et de combat shinobi au tour par tour, en pixel art façon Game Boy Advance. Web / PWA, souris, tactile et clavier.

> **Projet de fan non officiel**, sans lien avec les ayants droit de *Naruto*. Les sprites, décors, sons et musiques sont générés par le code du jeu : aucune ressource commerciale n'est extraite.

La boucle : **ouvrir → collectionner → composer → combattre → gagner → améliorer → recommencer**.

## Lancer le jeu

```bash
cd shinobi-clash
npm install
npm run dev          # http://localhost:5173 (ajouter ?dev pour le menu développeur)
npm run server       # serveur PvP sur ws://localhost:8787 (facultatif)
```

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement Vite |
| `npm run build` | vérification TypeScript stricte puis build de production dans `dist/` |
| `npm run preview` | sert le build |
| `npm run test` | tests Vitest (moteur, parchemins, économie, sauvegarde, missions, serveur PvP) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run simulate -- 3000 ranked` | simulation d'équilibrage IA contre IA, rapport dans `simulation-report.txt` |
| `npm run server` | serveur PvP autoritaire (WebSocket + classement HTTP) |
| `npm run e2e` | parcours complet dans Chromium (nécessite `npm run preview` en parallèle) |

Le build se sert depuis n'importe quel dossier (chemins relatifs) et fonctionne hors ligne grâce au service worker.

## Contenu

- **20 shinobis jouables** (5 raretés, 8 rôles, 5 éléments + taijutsu), chacun avec 4 jutsus et un passif propre, plus un adversaire PNJ.
- **Combat** : 3 contre 3, un actif, substitution prioritaire, chakra (10 max, +2 par tour, +1 en réserve), priorités, vitesse, 10 statuts avec immunité anti-chaîne, boucliers, clones, gardes, synergies d'équipe, limite de 12 tours avec départage (shinobis debout puis PV).
- **IA** facile, normale et difficile, sans information cachée.
- **Aventure** : 7 arènes de 3 combats sur une carte du monde, récompenses de première victoire.
- **Parchemins** : 3 types, probabilités affichées, pity dur et doux, doublons convertis en fragments, ouverture interactive (sceau à briser, fausses pistes, révélation carte par carte, mise en scène légendaire).
- **Progression** : XP et niveaux (30 max), éveil ★1 à ★5 plafonné à +16 %, niveau de joueur, missions quotidiennes et hebdomadaires, 23 succès, passe de combat gratuit et premium, cadres et titres cosmétiques.
- **PvP** : amical et classé (niveaux normalisés, sans objets), MMR Elo et 7 ligues, serveur autoritaire, reconnexion, abandon après 30 s d'absence, historique et **replays** déterministes.
- **Économie** : Ryō (gratuit), Jade (achats simulés par `MockPurchaseProvider`), points de chaîne (intégration Twitch simulée).
- **Accessibilité** : volumes, vibrations, secousses et animations réduites, vitesse de combat, mode daltonien, texte agrandi.

## Architecture

```
src/
  core/            Règles pures, sans DOM : importables par le serveur et les outils
    battle/        moteur déterministe (engine), contexte et dégâts, passifs, IA, création, replays
    rng.ts         RNG à graine et état sérialisable
    gacha.ts       tirages, pity, achat et ouverture de parchemins
    progression.ts collection.ts records.ts missions.ts battlePass.ts achievements.ts economy.ts rewards.ts
    profile.ts     profil joueur ; save.ts : versions et migrations de sauvegarde
  data/            Contenu : shinobis, jutsus, éléments, statuts, synergies, arènes, parchemins, missions…
  services/        Service de jeu (rôle du futur serveur), sauvegarde, audio, achats, analytics, points de chaîne
  net/             Protocole PvP partagé et client WebSocket
  game/            Rendu Phaser : scène de combat, sprites procéduraux, décors, animations de jutsus, contrôleurs
  ui/              Interface DOM : composants, routeur, écrans, HUD de combat, ouverture de parchemins
  styles/          CSS (jetons de design, composants, écrans), dans l'ordre de cascade
server/            Serveur PvP Node : appariement, matchs autoritaires, MMR, persistance JSON
tests/             Tests Vitest
tools/             Simulation d'équilibrage, parcours de bout en bout
```

Décisions importantes :

- **Le moteur de combat est pur et déterministe.** Il prend un état et deux actions et renvoie une liste d'événements. Le même code tourne dans le client (contre l'IA), dans le serveur (PvP) et dans les outils (simulation, replays).
- **Le client ne s'attribue jamais rien.** L'interface demande au `GameService` d'ouvrir un parchemin ou de terminer un combat. Pour un combat, le service rejoue la graine et le journal d'actions et calcule lui-même l'issue : une victoire envoyée par un client modifié est ignorée. En PvP, c'est le serveur qui résout les tours et décide du MMR et des gains.
- **L'écran rejoue les événements un par un** (texte, animation, barres), pendant que l'état du moteur est déjà en fin de tour : c'est ce décalage qui donne le rythme d'un combat GBA.
- **Phaser ne dessine que le terrain** (240×160, sans lissage). Menus, HUD et textes sont en DOM pour rester nets et lisibles sur mobile.
- **Tous les visuels sont générés** à partir des données (`look` d'un shinobi, palette d'un décor). `SPRITE_OVERRIDES` permet de remplacer un sprite par un dessin fait main.
- **La sauvegarde est versionnée** (`saveVersion`) avec migrations, derrière l'interface `SaveRepository` (localStorage aujourd'hui, API demain).

## Ajouter du contenu

**Un shinobi** : une entrée dans `src/data/shinobi.ts` (statistiques, éléments, rôle, passif, jutsus, tags de synergie, apparence `look`). Le sprite, la carte, la fiche et les parchemins le prennent en compte automatiquement.

```ts
{
  id: 'shisui', name: 'Shisui', variant: 'Jônin', village: 'Konoha', clan: 'Uchiha',
  rarity: 'epic', role: 'speedster', elements: ['katon'],
  stats: { hp: 430, attack: 88, defense: 60, speed: 92, critRate: 0.08 },
  passive: 'sharingan', jutsus: ['lion_combo', 'gokakyu', 'tsukuyomi', 'amaterasu'],
  tags: ['konoha', 'uchiha'], lore: '…',
  look: { skin: '#f0cfae', hair: '#23233a', hairStyle: 'messy', outfit: '#2a2a3a', outfitAlt: '#3a3a4a',
          accent: '#8b93a8', eyes: '#d0283a', headband: 'forehead', features: ['sharingan'] },
}
```

**Un jutsu** : une entrée `jutsu({...})` dans `src/data/jutsus.ts`. Les effets se composent (`status`, `buff`, `heal`, `shield`, `clone`, `protect`, `chakra`, `cleanse`, `dispel`, `drain`, `selfDamage`, `detonate`) ; `animationId` choisit la mise en scène dans `src/game/gfx/animations.ts`.

**Un passif** : son texte dans `src/data/passiveInfo.ts`, ses crochets (`onDamaged`, `onSwitchIn`, `outgoingMult`…) dans `src/core/battle/passives.ts`.

**Un parchemin** : une entrée dans `src/data/packs.ts` (cartes, probabilités, rareté minimale de la dernière carte, pity, prix).

**Une arène** : une entrée dans `src/data/arenas.ts` et sa position dans `MAP_MARKERS` (`src/ui/screens/arenas.ts`) ; un nouveau décor se déclare dans `BACKGROUNDS` (`src/game/gfx/backgrounds.ts`).

## Outils de développement

Ouvrir le jeu avec `?dev` (ou `#dev`) ajoute l'entrée **DEV** au menu : monnaies, points de chaîne, rédemptions Twitch simulées, parchemins, rareté forcée, légendaire forcée, don de shinobis, niveau 30 ★5, victoire instantanée, déblocage des arènes, adversaire forcé, graine RNG, journal analytics, réinitialisation.

## Historique

Les sources de cette version avaient été perdues : seul le build publié avait survécu (conservé dans `build-recupere/`). Elles ont été reconstruites à partir de ce build ; le moteur reconstruit produit exactement les mêmes combats que l'original (vérifié sur 3 000 combats) et les sprites sont identiques au pixel près.
