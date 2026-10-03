import { currentSeason, type PassTier, type SeasonDef } from '../data/seasons';
import { spendCurrency, type Result } from './economy';
import type { PlayerProfile } from './profile';
import { grantReward } from './rewards';
import type { Reward } from './types';

/** Réinitialise la progression du passe au changement de saison. */
export function syncPassSeason(profile: PlayerProfile, now: number): SeasonDef {
  const season = currentSeason(now);
  if (profile.pass.seasonId !== season.id) {
    profile.pass = { seasonId: season.id, xp: 0, premium: false, claimedFree: [], claimedPremium: [] };
  }
  return season;
}

export function addPassXp(profile: PlayerProfile, amount: number, now: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  syncPassSeason(profile, now);
  profile.pass.xp += Math.floor(amount);
  return Math.floor(amount);
}

export interface PassTierView {
  tier: PassTier;
  reached: boolean;
  freeClaimed: boolean;
  premiumClaimed: boolean;
}

export interface PassView {
  season: SeasonDef;
  level: number;
  xpInTier: number;
  xpPerTier: number;
  premium: boolean;
  tiers: PassTierView[];
  claimable: number;
}

export function passView(profile: PlayerProfile, now: number): PassView {
  const season = syncPassSeason(profile, now);
  const { tiers, xpPerTier } = season.battlePass;
  const level = Math.min(tiers.length, Math.floor(profile.pass.xp / xpPerTier));
  const views = tiers.map((tier) => ({
    tier,
    reached: tier.level <= level,
    freeClaimed: profile.pass.claimedFree.includes(tier.level),
    premiumClaimed: profile.pass.claimedPremium.includes(tier.level),
  }));
  const claimable = views.filter(
    (v) =>
      v.reached && ((v.tier.free && !v.freeClaimed) || (profile.pass.premium && v.tier.premium && !v.premiumClaimed)),
  ).length;
  return {
    season,
    level,
    xpInTier: level >= tiers.length ? 0 : profile.pass.xp % xpPerTier,
    xpPerTier,
    premium: profile.pass.premium,
    tiers: views,
    claimable,
  };
}

export function claimPassTier(
  profile: PlayerProfile,
  level: number,
  track: 'free' | 'premium',
  now: number,
): Result<{ reward: Reward }> {
  const view = passView(profile, now).tiers.find((t) => t.tier.level === level);
  if (!view) return { ok: false, error: 'Palier inconnu' };
  if (!view.reached) return { ok: false, error: 'Palier pas encore atteint' };
  const reward = track === 'free' ? view.tier.free : view.tier.premium;
  if (!reward) return { ok: false, error: 'Aucune récompense ici' };
  if (track === 'premium' && !profile.pass.premium) return { ok: false, error: 'Passe premium requis' };
  const claimed = track === 'free' ? profile.pass.claimedFree : profile.pass.claimedPremium;
  if (claimed.includes(level)) return { ok: false, error: 'Déjà récupéré' };
  claimed.push(level);
  grantReward(profile, reward);
  return { ok: true, reward };
}

export function claimAllPass(profile: PlayerProfile, now: number): Reward[] {
  const rewards: Reward[] = [];
  for (const view of passView(profile, now).tiers) {
    if (!view.reached) break;
    for (const track of ['free', 'premium'] as const) {
      const result = claimPassTier(profile, view.tier.level, track, now);
      if (result.ok) rewards.push(result.reward);
    }
  }
  return rewards;
}

export function buyPremiumPass(profile: PlayerProfile, now: number): Result {
  const season = syncPassSeason(profile, now);
  if (profile.pass.premium) return { ok: false, error: 'Passe premium déjà actif' };
  const paid = spendCurrency(profile, 'jade', season.battlePass.premiumPrice);
  if (!paid.ok) return paid;
  profile.pass.premium = true;
  return { ok: true };
}
