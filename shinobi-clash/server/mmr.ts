/** Classement Elo : gain plus fort pendant les 10 premiers matchs (placement), puis K = 32. */
export function eloDelta(mmr: number, opponentMmr: number, score: 0 | 0.5 | 1, gamesPlayed: number): number {
  const expected = 1 / (1 + 10 ** ((opponentMmr - mmr) / 400));
  const k = gamesPlayed < 10 ? 48 : 32;
  return Math.round(k * (score - expected));
}

export { seasonReset } from '../src/core/ranked';
