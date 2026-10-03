import { leagueFor } from '../data/leagues';
import { currentSeason, SEASONS, type SeasonDef } from '../data/seasons';
import type { PlayerProfile } from './profile';
import { grantReward } from './rewards';
import type { Reward } from './types';

/** Remise à niveau partielle de fin de saison : on se rapproche de 1000 sans repartir de zéro. */
export function seasonReset(mmr: number): number {
  return Math.round(1000 + (mmr - 1000) * 0.6);
}

export interface SeasonSettlement {
  seasonId: string;
  seasonName: string;
  league: string;
  reward: Reward | null;
  mmrBefore: number;
  mmrAfter: number;
}

/**
 * Clôture la saison classée précédente si la saison courante a changé : récompense de la ligue atteinte
 * (seulement si le joueur a joué en classé), badge dans l'historique, remise à niveau du MMR.
 */
export function settleRankedSeason(
  profile: PlayerProfile,
  now: number,
  seasons: SeasonDef[] = SEASONS,
): SeasonSettlement | null {
  const season = currentSeason(now);
  if (profile.rank.seasonId === season.id) return null;
  const previous = seasons.find((s) => s.id === profile.rank.seasonId);
  const played = profile.rank.wins + profile.rank.losses > 0;
  const league = leagueFor(profile.rank.mmr);
  const reward = played && previous ? (previous.rankRewards[league.name] ?? null) : null;
  if (reward) grantReward(profile, reward);
  const settlement: SeasonSettlement = {
    seasonId: profile.rank.seasonId,
    seasonName: previous?.name ?? profile.rank.seasonId,
    league: league.name,
    reward,
    mmrBefore: profile.rank.mmr,
    mmrAfter: seasonReset(profile.rank.mmr),
  };
  if (played) profile.rank.history.push({ seasonId: settlement.seasonId, league: league.name, mmr: profile.rank.mmr });
  profile.rank = { ...profile.rank, mmr: settlement.mmrAfter, seasonId: season.id, wins: 0, losses: 0 };
  return played ? settlement : null;
}
