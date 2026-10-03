import { createBattle } from '../src/core/battle/setup';
import type { BattleConfig, TeamSpec } from '../src/core/types';
import { DEFAULT_BATTLE_CONFIG } from '../src/data/battleConfig';

export const team = (name: string, ...defIds: string[]): TeamSpec => ({
  name,
  units: defIds.map((defId) => ({ defId, level: 10, stars: 1 })),
});

export function battle(a: string[], b: string[], seed = 1, config: Partial<BattleConfig> = {}) {
  return createBattle(team('A', ...a), team('B', ...b), seed, { ...DEFAULT_BATTLE_CONFIG, ...config });
}

export const basic = (id: string) => ({ kind: 'jutsu' as const, jutsuId: id });
