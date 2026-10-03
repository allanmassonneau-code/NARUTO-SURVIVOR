import { ROSTER } from '../data/shinobi';
import type { Rng } from './rng';
import type { TeamMemberSpec } from './types';

/** Noms des adversaires d'entraînement générés. */
export const TRAINING_OPPONENT_NAMES = [
  'Ninja errant',
  'Déserteur de Kiri',
  'Chûnin de garde',
  'Espion du Son',
  'Garde de Suna',
  'Jônin masqué',
  'Mercenaire de la Pluie',
];

export function averageLevel(team: { level: number }[]): number {
  return team.length ? Math.max(1, Math.round(team.reduce((sum, m) => sum + m.level, 0) / team.length)) : 1;
}

/** Équipe aléatoire de 3 shinobis distincts du roster, au niveau donné. */
export function randomTeam(rng: Rng, level: number): TeamMemberSpec[] {
  const pool = ROSTER.map((s) => s.id);
  const team: TeamMemberSpec[] = [];
  while (team.length < 3 && pool.length) {
    const defId = pool.splice(rng.int(0, pool.length - 1), 1)[0];
    team.push({ defId, level: Math.max(1, level), stars: 1 });
  }
  return team;
}
