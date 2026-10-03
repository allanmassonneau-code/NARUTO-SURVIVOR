import type { BattleConfig, BattleMode } from '../core/types';

/** Règles de combat par défaut (PvE et entraînement). */
export const DEFAULT_BATTLE_CONFIG: BattleConfig = {
  maxTurns: 12,
  chakraMax: 10,
  startChakra: 3,
  regenActive: 2,
  regenBench: 1,
  basicChakraGain: 1,
  itemsAllowed: true,
  normalizeLevel: null,
};

/** Classé : pas d'objets, niveaux normalisés pour que la collection ne soit pas un portefeuille. */
export const RANKED_BATTLE_CONFIG: BattleConfig = {
  ...DEFAULT_BATTLE_CONFIG,
  itemsAllowed: false,
  normalizeLevel: 30,
};

export const CASUAL_BATTLE_CONFIG: BattleConfig = { ...DEFAULT_BATTLE_CONFIG, itemsAllowed: false };

export function configForMode(mode: BattleMode | string): BattleConfig {
  return mode === 'ranked' ? RANKED_BATTLE_CONFIG : mode === 'casual' ? CASUAL_BATTLE_CONFIG : DEFAULT_BATTLE_CONFIG;
}
