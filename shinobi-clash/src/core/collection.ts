import { RARITIES } from '../data/rarities';
import { getShinobi } from '../data/shinobi';
import type { Result } from './economy';
import { MAX_STARS, starUpCost } from './progression';
import type { PlayerProfile } from './profile';

export interface CardGain {
  defId: string;
  isNew: boolean;
  /** Fragments reçus si c'est un doublon. */
  fragments: number;
}

/** Ajoute un shinobi ; un doublon se transforme en fragments (jamais inutile). */
export function addShinobi(profile: PlayerProfile, defId: string, now: number): CardGain {
  const def = getShinobi(defId);
  const owned = profile.collection[defId];
  if (!owned) {
    profile.collection[defId] = { defId, level: 1, xp: 0, stars: 1, fragments: 0, obtainedAt: now, isNew: true };
    fillActiveTeam(profile, defId);
    return { defId, isNew: true, fragments: 0 };
  }
  const fragments = RARITIES[def.rarity].dupeFragments;
  owned.fragments += fragments;
  return { defId, isNew: false, fragments };
}

/** Un nouveau shinobi rejoint l'équipe active s'il reste une place. */
function fillActiveTeam(profile: PlayerProfile, defId: string): void {
  const team = profile.teams[profile.activeTeam];
  if (!team || team.members.includes(defId)) return;
  const slot = team.members.indexOf(null);
  if (slot >= 0) team.members[slot] = defId;
}

export function starUp(profile: PlayerProfile, defId: string): Result<{ stars: number }> {
  const owned = profile.collection[defId];
  if (!owned) return { ok: false, error: 'Shinobi non possédé' };
  if (owned.stars >= MAX_STARS) return { ok: false, error: 'Étoiles au maximum' };
  const cost = starUpCost(getShinobi(defId).rarity, owned.stars);
  if (owned.fragments < cost) return { ok: false, error: 'Fragments insuffisants' };
  owned.fragments -= cost;
  owned.stars++;
  return { ok: true, stars: owned.stars };
}

/** Place `defId` (ou vide l'emplacement si null). Un shinobi déjà présent échange sa place. */
export function setTeamMember(profile: PlayerProfile, teamIndex: number, slot: number, defId: string | null): Result {
  const team = profile.teams[teamIndex];
  if (!team || slot < 0 || slot > 2) return { ok: false, error: 'Équipe invalide' };
  if (defId && !profile.collection[defId]) return { ok: false, error: 'Shinobi non possédé' };
  if (defId) {
    const current = team.members.indexOf(defId);
    if (current >= 0) team.members[current] = team.members[slot] ?? null;
  }
  team.members[slot] = defId;
  return { ok: true };
}

export function markSeen(profile: PlayerProfile, defId: string): void {
  const owned = profile.collection[defId];
  if (owned) owned.isNew = false;
}
