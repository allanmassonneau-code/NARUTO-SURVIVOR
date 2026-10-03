import { DAILY_MISSIONS, WEEKLY_MISSIONS, type MissionDef, type MissionMetric } from '../data/missions';
import { PASS_XP } from '../data/seasons';
import { addPassXp } from './battlePass';
import type { Result } from './economy';
import type { PlayerProfile } from './profile';
import { grantReward } from './rewards';
import type { Reward } from './types';

/** Clé du jour local (les missions se réinitialisent à minuit, heure du joueur). */
export function dayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Clé de la semaine : le lundi qui la commence. */
export function weekKey(now: number): string {
  const d = new Date(now);
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return `W${dayKey(monday.getTime())}`;
}

export function refreshMissions(profile: PlayerProfile, now: number): void {
  const day = dayKey(now);
  if (profile.missions.daily.key !== day) profile.missions.daily = { key: day, progress: {}, claimed: [] };
  const week = weekKey(now);
  if (profile.missions.weekly.key !== week) profile.missions.weekly = { key: week, progress: {}, claimed: [] };
}

export function trackMetric(profile: PlayerProfile, metric: MissionMetric, amount: number): void {
  if (amount <= 0) return;
  for (const period of [profile.missions.daily, profile.missions.weekly]) {
    period.progress[metric] = (period.progress[metric] ?? 0) + amount;
  }
}

export interface MissionView {
  def: MissionDef;
  period: 'daily' | 'weekly';
  progress: number;
  done: boolean;
  claimed: boolean;
}

export function listMissions(profile: PlayerProfile): MissionView[] {
  const views: MissionView[] = [];
  for (const [period, defs] of [
    ['daily', DAILY_MISSIONS],
    ['weekly', WEEKLY_MISSIONS],
  ] as const) {
    const state = profile.missions[period];
    for (const def of defs) {
      const progress = Math.min(def.target, state.progress[def.metric] ?? 0);
      views.push({ def, period, progress, done: progress >= def.target, claimed: state.claimed.includes(def.id) });
    }
  }
  return views;
}

export function claimMission(
  profile: PlayerProfile,
  id: string,
  now: number,
): Result<{ reward: Reward; passXp: number }> {
  const view = listMissions(profile).find((m) => m.def.id === id);
  if (!view) return { ok: false, error: 'Mission inconnue' };
  if (!view.done) return { ok: false, error: 'Mission non terminée' };
  if (view.claimed) return { ok: false, error: 'Déjà réclamée' };
  profile.missions[view.period].claimed.push(id);
  grantReward(profile, view.def.reward);
  const passXp = addPassXp(profile, view.period === 'daily' ? PASS_XP.dailyMission : PASS_XP.weeklyMission, now);
  return { ok: true, reward: view.def.reward, passXp };
}
