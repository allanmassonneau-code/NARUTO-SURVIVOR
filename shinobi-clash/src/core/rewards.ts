import { addCurrency } from './economy';
import { playerXpToNext, type PlayerProfile } from './profile';
import type { CurrencyId, Reward } from './types';

export function grantReward(profile: PlayerProfile, reward: Reward): void {
  for (const [currency, amount] of Object.entries(reward.currencies ?? {})) {
    addCurrency(profile, currency as CurrencyId, amount ?? 0);
  }
  for (const [packId, count] of Object.entries(reward.packs ?? {})) {
    profile.packs[packId] = (profile.packs[packId] ?? 0) + count;
  }
  if (reward.xp) addPlayerXp(profile, reward.xp);
  for (const id of reward.cosmetics ?? []) {
    if (!profile.cosmetics.owned.includes(id)) profile.cosmetics.owned.push(id);
  }
}

/** Ajoute de l'XP de joueur ; renvoie le nombre de niveaux gagnés. */
export function addPlayerXp(profile: PlayerProfile, amount: number): number {
  const before = profile.level;
  profile.xp += amount;
  while (profile.xp >= playerXpToNext(profile.level)) {
    profile.xp -= playerXpToNext(profile.level);
    profile.level++;
  }
  return profile.level - before;
}
