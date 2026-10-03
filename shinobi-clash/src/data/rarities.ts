import type { Rarity } from '../core/types';

export interface RarityDef {
  id: Rarity;
  name: string;
  color: string;
  glow: string;
  order: number;
  /** Fragments reçus pour un doublon. */
  dupeFragments: number;
}

export const RARITIES: Record<Rarity, RarityDef> = {
  common: { id: 'common', name: 'Commun', color: '#b8b2a2', glow: '#e9e3d0', order: 0, dupeFragments: 5 },
  uncommon: { id: 'uncommon', name: 'Peu commun', color: '#5dbb63', glow: '#a4f0a0', order: 1, dupeFragments: 8 },
  rare: { id: 'rare', name: 'Rare', color: '#3f8ef0', glow: '#8cc4ff', order: 2, dupeFragments: 12 },
  epic: { id: 'epic', name: 'Épique', color: '#a34ff0', glow: '#d59bff', order: 3, dupeFragments: 20 },
  legendary: { id: 'legendary', name: 'Légendaire', color: '#f0b429', glow: '#ffe28a', order: 4, dupeFragments: 40 },
};

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export function rarityAtLeast(rarity: Rarity, min: Rarity): boolean {
  return RARITIES[rarity].order >= RARITIES[min].order;
}
