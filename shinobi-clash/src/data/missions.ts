import type { Reward } from '../core/types';

export type MissionMetric = 'battles' | 'wins' | 'jutsus' | 'swaps' | 'crits' | 'packsOpened' | 'pveClears';

export interface MissionDef {
  id: string;
  name: string;
  metric: MissionMetric;
  target: number;
  reward: Reward;
}

/** Missions quotidiennes : courtes, pour encourager à jouer sans obliger à jouer des heures. */
export const DAILY_MISSIONS: MissionDef[] = [
  { id: 'd_battles', name: 'Terminer 3 combats', metric: 'battles', target: 3, reward: { currencies: { ryo: 250 } } },
  { id: 'd_wins', name: 'Gagner 2 combats', metric: 'wins', target: 2, reward: { currencies: { ryo: 300 } } },
  { id: 'd_jutsus', name: 'Utiliser 15 jutsus', metric: 'jutsus', target: 15, reward: { currencies: { ryo: 200 } } },
  { id: 'd_swaps', name: 'Substituer 3 fois', metric: 'swaps', target: 3, reward: { currencies: { jade: 10 } } },
  {
    id: 'd_crit',
    name: 'Infliger 2 coups critiques',
    metric: 'crits',
    target: 2,
    reward: { currencies: { ryo: 150 } },
  },
  { id: 'd_pack', name: 'Ouvrir un parchemin', metric: 'packsOpened', target: 1, reward: { currencies: { jade: 15 } } },
];

export const WEEKLY_MISSIONS: MissionDef[] = [
  {
    id: 'w_wins',
    name: 'Gagner 15 combats',
    metric: 'wins',
    target: 15,
    reward: { packs: { standard: 1 }, currencies: { jade: 30 } },
  },
  {
    id: 'w_packs',
    name: 'Ouvrir 5 parchemins',
    metric: 'packsOpened',
    target: 5,
    reward: { currencies: { ryo: 1200 } },
  },
  {
    id: 'w_clears',
    name: 'Remporter 6 combats en arène',
    metric: 'pveClears',
    target: 6,
    reward: { packs: { elite: 1 } },
  },
];
