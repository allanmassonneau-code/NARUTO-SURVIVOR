import type { PlayerProfile } from '../core/profile';
import type { Reward } from '../core/types';
import { ARENAS } from './arenas';
import { LEAGUES } from './leagues';
import { ROSTER } from './shinobi';

export type AchievementCategory = 'combat' | 'aventure' | 'collection' | 'pvp';

export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, string> = {
  combat: 'Combat',
  aventure: 'Aventure',
  collection: 'Collection',
  pvp: 'Duels',
};

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  target: number;
  /** Valeur courante lue dans le profil. */
  value: (profile: PlayerProfile) => number;
  reward: Reward;
}

const owned = (p: PlayerProfile) => Object.values(p.collection);
const arenaCleared = (arenaId: string) => (p: PlayerProfile) =>
  ARENAS.find((a) => a.id === arenaId)!.stages.filter((s) => (p.pve.cleared[s.id] ?? 0) > 0).length;
const arenaSize = (arenaId: string) => ARENAS.find((a) => a.id === arenaId)!.stages.length;
const GOLD_MMR = LEAGUES.find((l) => l.name === 'Or')!.min;

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_win',
    name: 'Premier sang',
    description: 'Gagner un combat.',
    category: 'combat',
    target: 1,
    value: (p) => p.lifetime.wins,
    reward: { currencies: { ryo: 150 } },
  },
  {
    id: 'wins_25',
    name: 'Guerrier aguerri',
    description: 'Gagner 25 combats.',
    category: 'combat',
    target: 25,
    value: (p) => p.lifetime.wins,
    reward: { currencies: { jade: 30 } },
  },
  {
    id: 'wins_100',
    name: 'Centurion',
    description: 'Gagner 100 combats.',
    category: 'combat',
    target: 100,
    value: (p) => p.lifetime.wins,
    reward: { packs: { elite: 1 }, cosmetics: ['title_centurion'] },
  },
  {
    id: 'crits_50',
    name: 'Œil perçant',
    description: 'Infliger 50 coups critiques.',
    category: 'combat',
    target: 50,
    value: (p) => p.lifetime.crits,
    reward: { currencies: { ryo: 400 } },
  },
  {
    id: 'jutsus_300',
    name: 'Maître des arts',
    description: 'Utiliser 300 jutsus.',
    category: 'combat',
    target: 300,
    value: (p) => p.lifetime.jutsus,
    reward: { currencies: { jade: 40 } },
  },
  {
    id: 'arena_academy',
    name: 'Diplômé',
    description: 'Remporter tous les combats de l’Académie.',
    category: 'aventure',
    target: arenaSize('academy'),
    value: arenaCleared('academy'),
    reward: { currencies: { ryo: 300 } },
  },
  {
    id: 'arena_forest',
    name: 'Survivant de la Forêt',
    description: 'Remporter tous les combats de la Forêt.',
    category: 'aventure',
    target: arenaSize('forest'),
    value: arenaCleared('forest'),
    reward: { packs: { standard: 1 } },
  },
  {
    id: 'arena_exam',
    name: 'Examen réussi',
    description: 'Remporter tous les combats de l’Examen.',
    category: 'aventure',
    target: arenaSize('exam'),
    value: arenaCleared('exam'),
    reward: { currencies: { jade: 40 } },
  },
  {
    id: 'arena_desert',
    name: 'Vent du désert',
    description: 'Remporter tous les combats du Désert.',
    category: 'aventure',
    target: arenaSize('desert'),
    value: arenaCleared('desert'),
    reward: { packs: { standard: 1 }, currencies: { jade: 30 } },
  },
  {
    id: 'arena_valley',
    name: 'Vallée de la Fin',
    description: 'Remporter tous les combats de la Vallée.',
    category: 'aventure',
    target: arenaSize('valley'),
    value: arenaCleared('valley'),
    reward: { packs: { elite: 1 }, cosmetics: ['title_valley'] },
  },
  {
    id: 'arena_wave',
    name: 'Pont dégagé',
    description: 'Remporter tous les combats du Pays des Vagues.',
    category: 'aventure',
    target: arenaSize('wave'),
    value: arenaCleared('wave'),
    reward: { currencies: { jade: 50 } },
  },
  {
    id: 'arena_akatsuki',
    name: 'Fin de l’Akatsuki',
    description: 'Remporter tous les combats du Repaire de l’Akatsuki.',
    category: 'aventure',
    target: arenaSize('akatsuki'),
    value: arenaCleared('akatsuki'),
    reward: { packs: { elite: 1 }, currencies: { jade: 50 } },
  },
  {
    id: 'player_10',
    name: 'Ninja confirmé',
    description: 'Atteindre le niveau de joueur 10.',
    category: 'aventure',
    target: 10,
    value: (p) => p.level,
    reward: { currencies: { jade: 50 } },
  },
  {
    id: 'collect_6',
    name: 'Collectionneur',
    description: 'Posséder 6 shinobis.',
    category: 'collection',
    target: 6,
    value: (p) => owned(p).length,
    reward: { currencies: { ryo: 300 } },
  },
  {
    id: 'collect_all',
    name: 'Archiviste',
    description: 'Posséder tous les shinobis.',
    category: 'collection',
    target: ROSTER.length,
    value: (p) => ROSTER.filter((s) => p.collection[s.id]).length,
    reward: { packs: { elite: 1 }, cosmetics: ['title_archivist'] },
  },
  {
    id: 'legendary_1',
    name: 'Légende vivante',
    description: 'Obtenir un shinobi légendaire.',
    category: 'collection',
    target: 1,
    value: (p) => p.lifetime.legendaries,
    reward: { currencies: { jade: 30 } },
  },
  {
    id: 'packs_25',
    name: 'Briseur de sceaux',
    description: 'Ouvrir 25 parchemins.',
    category: 'collection',
    target: 25,
    value: (p) => p.totalPacksOpened,
    reward: { packs: { standard: 1 } },
  },
  {
    id: 'awaken_1',
    name: 'Éveil',
    description: 'Porter un shinobi à ★5.',
    category: 'collection',
    target: 1,
    value: (p) => owned(p).filter((u) => u.stars >= 5).length,
    reward: { currencies: { jade: 60 }, cosmetics: ['frame_gold'] },
  },
  {
    id: 'level_30',
    name: 'Force de Kage',
    description: 'Monter un shinobi au niveau 30.',
    category: 'collection',
    target: 30,
    value: (p) => Math.max(0, ...owned(p).map((u) => u.level)),
    reward: { currencies: { jade: 60 } },
  },
  {
    id: 'training_10',
    name: 'Partenaire d’entraînement',
    description: 'Gagner 10 entraînements contre l’IA.',
    category: 'pvp',
    target: 10,
    value: (p) => p.lifetime.trainingWins,
    reward: { currencies: { ryo: 300 } },
  },
  {
    id: 'pvp_first',
    name: 'Premier duel',
    description: 'Gagner un match PvP en ligne.',
    category: 'pvp',
    target: 1,
    value: (p) => p.lifetime.pvpWins,
    reward: { currencies: { ryo: 200, jade: 10 } },
  },
  {
    id: 'league_gold',
    name: 'Challenger d’Or',
    description: 'Atteindre la ligue Or en classé.',
    category: 'pvp',
    target: GOLD_MMR,
    value: (p) => p.rank.mmr,
    reward: { currencies: { jade: 60 }, cosmetics: ['title_gold'] },
  },
];

export const ACHIEVEMENTS_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
