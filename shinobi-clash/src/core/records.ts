import { STAGES, STAGE_ORDER } from '../data/arenas';
import { PASS_XP } from '../data/seasons';
import { addPassXp } from './battlePass';
import { addCurrency } from './economy';
import { trackMetric } from './missions';
import { addXp } from './progression';
import type { MatchRecord, PlayerProfile, ReplayData } from './profile';
import { addPlayerXp, grantReward } from './rewards';
import type { Reward } from './types';

const HISTORY_SIZE = 30;

/** Une étape est ouverte si c'est la première ou si la précédente a été gagnée. */
export function isStageUnlocked(profile: PlayerProfile, stageId: string): boolean {
  const index = STAGE_ORDER.indexOf(stageId);
  return index <= 0 ? index === 0 : (profile.pve.cleared[STAGE_ORDER[index - 1]] ?? 0) > 0;
}

export const TRAINING_REWARD = { ryo: 60, xp: 45 };

export interface BattleSummary {
  stageId: string | null;
  training: boolean;
  won: boolean;
  draw: boolean;
  team: string[];
  enemyTeam: string[];
  enemyName: string;
  turns: number;
  seed: number;
  stats: { jutsus: number; swaps: number; crits: number };
  replay?: ReplayData;
}

export interface UnitXpGain {
  defId: string;
  xp: number;
  levelsGained: number;
  newLevel: number;
}

export interface BattleRewards {
  ryo: number;
  playerXp: number;
  unitXp: UnitXpGain[];
  firstClear: Reward | null;
  playerLevelsGained: number;
  passXp: number;
}

/** Récompenses d'un combat PvE ou d'entraînement. Une défaite rapporte quand même un peu. */
export function recordBattle(profile: PlayerProfile, summary: BattleSummary, now: number): BattleRewards {
  const stage = summary.stageId ? STAGES[summary.stageId] : undefined;
  const baseRyo = summary.training ? TRAINING_REWARD.ryo : (stage?.reward.currencies?.ryo ?? 150);
  const ryo = summary.won ? baseRyo : Math.round(baseRyo * 0.3);
  const baseXp = summary.training ? TRAINING_REWARD.xp : (stage?.xp ?? 60);
  const xp = summary.won ? baseXp : Math.round(baseXp * 0.4);
  addCurrency(profile, 'ryo', ryo);

  const unitXp = summary.team
    .filter((id) => profile.collection[id])
    .map((defId) => ({ defId, xp, ...addXp(profile.collection[defId], xp) }));

  let firstClear: Reward | null = null;
  if (stage && summary.won) {
    if (!profile.pve.cleared[stage.id]) {
      firstClear = stage.firstClear;
      grantReward(profile, stage.firstClear);
    }
    profile.pve.cleared[stage.id] = (profile.pve.cleared[stage.id] ?? 0) + 1;
    trackMetric(profile, 'pveClears', 1);
  }

  const playerXp = summary.won ? 40 : 15;
  const playerLevelsGained = addPlayerXp(profile, playerXp);
  profile.lifetime.battles++;
  if (summary.won) profile.lifetime.wins++;
  if (summary.won && summary.training) profile.lifetime.trainingWins++;
  profile.lifetime.jutsus += summary.stats.jutsus;
  profile.lifetime.crits += summary.stats.crits;
  trackMetric(profile, 'battles', 1);
  if (summary.won) trackMetric(profile, 'wins', 1);
  trackMetric(profile, 'jutsus', summary.stats.jutsus);
  trackMetric(profile, 'swaps', summary.stats.swaps);
  trackMetric(profile, 'crits', summary.stats.crits);
  const passXp = addPassXp(profile, summary.won ? PASS_XP.win : PASS_XP.loss, now);

  pushHistory(profile, {
    id: `${now.toString(36)}-${summary.seed.toString(36)}`,
    date: now,
    mode: 'pve',
    opponent: summary.enemyName,
    result: summary.draw ? 'draw' : summary.won ? 'win' : 'loss',
    team: summary.team,
    enemyTeam: summary.enemyTeam,
    turns: summary.turns,
    mmrDelta: 0,
    seed: summary.seed,
    stageId: summary.stageId,
    training: summary.training || undefined,
    replay: summary.replay,
  });
  return { ryo, playerXp, unitXp, firstClear, playerLevelsGained, passXp };
}

export interface PvpResult {
  mode: 'casual' | 'ranked';
  result: 'win' | 'loss' | 'draw';
  ryo: number;
  /** MMR après le match, décidé par le serveur. */
  mmr: number;
  mmrDelta: number;
  opponent: string;
  team: string[];
  enemyTeam: string[];
  turns: number;
  stats: { jutsus: number; swaps: number; crits: number };
  replay?: ReplayData;
}

/** Enregistre un match PvP dont le résultat et les gains ont été calculés par le serveur. */
export function recordPvp(profile: PlayerProfile, r: PvpResult, now: number): void {
  addCurrency(profile, 'ryo', r.ryo);
  if (r.mode === 'ranked') {
    profile.rank.mmr = r.mmr;
    if (r.result === 'win') profile.rank.wins++;
    else if (r.result === 'loss') profile.rank.losses++;
  }
  addPlayerXp(profile, r.result === 'win' ? 50 : 20);
  addPassXp(profile, r.result === 'win' ? PASS_XP.win : PASS_XP.loss, now);
  profile.lifetime.battles++;
  if (r.result === 'win') {
    profile.lifetime.wins++;
    profile.lifetime.pvpWins++;
  }
  profile.lifetime.jutsus += r.stats.jutsus;
  profile.lifetime.crits += r.stats.crits;
  trackMetric(profile, 'battles', 1);
  if (r.result === 'win') trackMetric(profile, 'wins', 1);
  trackMetric(profile, 'jutsus', r.stats.jutsus);
  trackMetric(profile, 'swaps', r.stats.swaps);
  trackMetric(profile, 'crits', r.stats.crits);
  pushHistory(profile, {
    id: `${now.toString(36)}-pvp`,
    date: now,
    mode: r.mode,
    opponent: r.opponent,
    result: r.result,
    team: r.team,
    enemyTeam: r.enemyTeam,
    turns: r.turns,
    mmrDelta: r.mmrDelta,
    seed: 0,
    replay: r.replay,
  });
}

function pushHistory(profile: PlayerProfile, record: MatchRecord): void {
  profile.matchHistory.unshift(record);
  profile.matchHistory = profile.matchHistory.slice(0, HISTORY_SIZE);
}
