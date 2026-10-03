export interface League {
  name: string;
  min: number;
  color: string;
}

/** Ligues affichées ; le MMR reste interne. */
export const LEAGUES: League[] = [
  { name: 'Bronze', min: 0, color: '#b0764a' },
  { name: 'Argent', min: 1100, color: '#b8c0d0' },
  { name: 'Or', min: 1250, color: '#f0c050' },
  { name: 'Platine', min: 1400, color: '#6ad0c8' },
  { name: 'Diamant', min: 1600, color: '#8ab8ff' },
  { name: 'Maître', min: 1800, color: '#c080ff' },
  { name: 'Kage', min: 2000, color: '#ff6a4a' },
];

export function leagueFor(mmr: number): League {
  return [...LEAGUES].reverse().find((l) => mmr >= l.min) ?? LEAGUES[0];
}
