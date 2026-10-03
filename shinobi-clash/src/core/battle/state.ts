import type { BattlePhase, BattleSide, BattleState, BattleUnit, Side, StatusId } from '../types';

export function activeUnit(state: BattleState, side: Side): BattleUnit {
  const s = state.sides[side];
  return s.units[s.active];
}

export function opponentOf(side: Side): Side {
  return side === 0 ? 1 : 0;
}

export function aliveCount(side: BattleSide): number {
  return side.units.filter((u) => !u.fainted).length;
}

export function hasStatus(unit: BattleUnit, status: StatusId): boolean {
  return unit.statuses.some((s) => s.id === status);
}

/** Statuts qui empêchent ou perturbent l'action (utilisés par Stratège). */
export const DISABLING_STATUSES: StatusId[] = ['stun', 'paralysis', 'sleep'];
/** Dégâts sur la durée (utilisés par Flair des Inuzuka). */
export const DOT_STATUSES: StatusId[] = ['burn', 'poison', 'bleed'];

/** Lecture de phase non rétrécie par TypeScript : la phase change au fil des appels de résolution. */
export function phaseOf(state: BattleState): BattlePhase {
  return state.phase;
}
