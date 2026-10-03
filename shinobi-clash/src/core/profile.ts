import type { BattleMode, CurrencyId, Side, TeamSpec, TurnLogEntry } from './types';

export const SAVE_VERSION = 3;

export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  vibration: boolean;
  reduceShake: boolean;
  reduceMotion: boolean;
  /** Multiplicateur de vitesse des animations de combat. */
  battleSpeed: number;
  colorblind: boolean;
  largeText: boolean;
  /** Graine imposée (menu développeur) ; null = aléatoire. */
  seedOverride: number | null;
}

export const DEFAULT_SETTINGS: Settings = {
  musicVolume: 0.5,
  sfxVolume: 0.8,
  vibration: true,
  reduceShake: false,
  reduceMotion: false,
  battleSpeed: 1,
  colorblind: false,
  largeText: false,
  seedOverride: null,
};

export interface OwnedShinobi {
  defId: string;
  level: number;
  xp: number;
  stars: number;
  fragments: number;
  obtainedAt: number;
  isNew: boolean;
}

export interface TeamSlot {
  id: string;
  name: string;
  members: (string | null)[];
}

/** Données suffisantes pour rejouer un combat à l'identique. */
export interface ReplayData {
  v: 1;
  seed: number;
  mode: BattleMode;
  teams: [TeamSpec, TeamSpec];
  log: TurnLogEntry[];
  /** Camp du joueur dans `teams`. */
  you: Side;
}

export type MatchResult = 'win' | 'loss' | 'draw';

export interface MatchRecord {
  id: string;
  date: number;
  mode: 'pve' | 'casual' | 'ranked';
  opponent: string;
  result: MatchResult;
  team: string[];
  enemyTeam: string[];
  turns: number;
  mmrDelta: number;
  seed: number;
  stageId?: string | null;
  training?: boolean;
  replay?: ReplayData;
}

export interface MissionPeriodState {
  key: string;
  progress: Record<string, number>;
  claimed: string[];
}

export interface PlayerProfile {
  saveVersion: number;
  id: string;
  username: string;
  /** Shinobi affiché comme avatar. */
  avatar: string;
  level: number;
  xp: number;
  createdAt: number;
  currencies: Record<CurrencyId, number>;
  collection: Record<string, OwnedShinobi>;
  teams: TeamSlot[];
  activeTeam: number;
  /** Parchemins non ouverts, par type. */
  packs: Record<string, number>;
  pity: Record<string, PityState>;
  totalPacksOpened: number;
  missions: { daily: MissionPeriodState; weekly: MissionPeriodState };
  pve: { cleared: Record<string, number> };
  matchHistory: MatchRecord[];
  rank: { mmr: number; seasonId: string; wins: number; losses: number };
  achievements: string[];
  achievementsClaimed: string[];
  pass: { seasonId: string; xp: number; premium: boolean; claimedFree: number[]; claimedPremium: number[] };
  cosmetics: { owned: string[]; frame: string | null; title: string | null };
  tutorial: { starterChosen: boolean; firstPackOpened: boolean; done: boolean };
  settings: Settings;
  lifetime: {
    battles: number;
    wins: number;
    legendaries: number;
    jutsus: number;
    crits: number;
    trainingWins: number;
    pvpWins: number;
  };
}

export interface PityState {
  sinceEpic: number;
  sinceLegendary: number;
}

export function newProfile(now: number, id = `local-${now.toString(36)}`): PlayerProfile {
  return {
    saveVersion: SAVE_VERSION,
    id,
    username: 'Genin',
    avatar: 'naruto',
    level: 1,
    xp: 0,
    createdAt: now,
    currencies: { ryo: 500, jade: 50, chainPoints: 0 },
    collection: {},
    teams: [
      { id: 't1', name: 'Équipe 1', members: [null, null, null] },
      { id: 't2', name: 'Équipe 2', members: [null, null, null] },
      { id: 't3', name: 'PvP', members: [null, null, null] },
      { id: 't4', name: 'Farm', members: [null, null, null] },
    ],
    activeTeam: 0,
    packs: {},
    pity: {},
    totalPacksOpened: 0,
    missions: {
      daily: { key: '', progress: {}, claimed: [] },
      weekly: { key: '', progress: {}, claimed: [] },
    },
    pve: { cleared: {} },
    matchHistory: [],
    rank: { mmr: 1000, seasonId: 's1', wins: 0, losses: 0 },
    achievements: [],
    achievementsClaimed: [],
    pass: { seasonId: 's1', xp: 0, premium: false, claimedFree: [], claimedPremium: [] },
    cosmetics: { owned: [], frame: null, title: null },
    tutorial: { starterChosen: false, firstPackOpened: false, done: false },
    settings: { ...DEFAULT_SETTINGS },
    lifetime: { battles: 0, wins: 0, legendaries: 0, jutsus: 0, crits: 0, trainingWins: 0, pvpWins: 0 },
  };
}

/** Membres possédés de l'équipe active. */
export function activeTeamMembers(profile: PlayerProfile): string[] {
  return (profile.teams[profile.activeTeam]?.members ?? []).filter(
    (id): id is string => !!id && !!profile.collection[id],
  );
}

export function playerXpToNext(level: number): number {
  return 100 + level * 50;
}
