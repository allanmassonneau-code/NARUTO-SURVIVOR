/** Classement Elo : gain plus fort pendant les 10 premiers matchs (placement), puis K = 32. */
export function eloDelta(mmr: number, opponentMmr: number, score: 0 | 0.5 | 1, gamesPlayed: number): number {
  const expected = 1 / (1 + 10 ** ((opponentMmr - mmr) / 400));
  const k = gamesPlayed < 10 ? 48 : 32;
  return Math.round(k * (score - expected));
}

/** Remise à niveau partielle de fin de saison : on se rapproche de 1000 sans tout perdre. */
export function seasonReset(mmr: number): number {
  return Math.round(1000 + (mmr - 1000) * 0.6);
}
