import { ACHIEVEMENTS, ACHIEVEMENTS_BY_ID, type AchievementDef } from '../data/achievements';
import type { Result } from './economy';
import type { PlayerProfile } from './profile';
import { grantReward } from './rewards';
import type { Reward } from './types';

/** Débloque les succès atteints ; renvoie ceux qui viennent d'être débloqués. */
export function checkAchievements(profile: PlayerProfile): AchievementDef[] {
  const unlocked: AchievementDef[] = [];
  for (const def of ACHIEVEMENTS) {
    if (profile.achievements.includes(def.id)) continue;
    if (def.value(profile) >= def.target) {
      profile.achievements.push(def.id);
      unlocked.push(def);
    }
  }
  return unlocked;
}

export interface AchievementView {
  def: AchievementDef;
  progress: number;
  unlocked: boolean;
  claimed: boolean;
}

export function listAchievements(profile: PlayerProfile): AchievementView[] {
  return ACHIEVEMENTS.map((def) => {
    const unlocked = profile.achievements.includes(def.id);
    return {
      def,
      progress: unlocked ? def.target : Math.max(0, Math.min(def.target, def.value(profile))),
      unlocked,
      claimed: profile.achievementsClaimed.includes(def.id),
    };
  });
}

export function claimAchievement(profile: PlayerProfile, id: string): Result<{ reward: Reward }> {
  const def = ACHIEVEMENTS_BY_ID[id];
  if (!def) return { ok: false, error: 'Succès inconnu' };
  if (!profile.achievements.includes(id)) return { ok: false, error: 'Succès pas encore débloqué' };
  if (profile.achievementsClaimed.includes(id)) return { ok: false, error: 'Déjà récupéré' };
  profile.achievementsClaimed.push(id);
  grantReward(profile, def.reward);
  return { ok: true, reward: def.reward };
}
