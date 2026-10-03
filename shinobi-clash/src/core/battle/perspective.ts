import type { BattleEvent, BattleState, Side } from '../types';

const flipSide = (side: Side): Side => (side === 0 ? 1 : 0);

/**
 * Le serveur PvP raisonne en camps 0/1 ; chaque client se voit toujours en camp 0.
 * Ces fonctions retournent l'état et les événements pour le joueur du camp 1.
 */
export function flipState(state: BattleState): BattleState {
  const flipped = structuredClone(state);
  flipped.sides = [flipped.sides[1], flipped.sides[0]];
  for (const team of flipped.sides) for (const unit of team.units) unit.side = flipSide(unit.side);
  flipped.pendingReplace = [flipped.pendingReplace[1], flipped.pendingReplace[0]];
  if (flipped.winner === 0 || flipped.winner === 1) flipped.winner = flipSide(flipped.winner);
  const swap = (pair: [number, number]): [number, number] => [pair[1], pair[0]];
  flipped.stats = {
    jutsusUsed: swap(flipped.stats.jutsusUsed),
    swaps: swap(flipped.stats.swaps),
    crits: swap(flipped.stats.crits),
    damageDealt: swap(flipped.stats.damageDealt),
  };
  return flipped;
}

export function flipEvents(events: BattleEvent[]): BattleEvent[] {
  return events.map((e) => {
    if (e.t === 'end') return { ...e, winner: e.winner === 'draw' ? 'draw' : flipSide(e.winner) };
    if ('side' in e) return { ...e, side: flipSide(e.side) };
    return e;
  });
}
