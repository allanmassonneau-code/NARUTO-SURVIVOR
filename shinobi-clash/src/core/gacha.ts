import { getPack, type PackDef } from '../data/packs';
import { RARITIES, RARITY_ORDER, rarityAtLeast } from '../data/rarities';
import { ROSTER } from '../data/shinobi';
import { addShinobi, type CardGain } from './collection';
import { spendCurrency, type Result } from './economy';
import { trackMetric } from './missions';
import type { PityState, PlayerProfile } from './profile';
import type { Rng } from './rng';
import type { CurrencyId, Rarity } from './types';

/** Probabilités effectives après pity doux (la chance de Légendaire monte, celle de Commun baisse). */
export function effectiveOdds(pack: PackDef, pity: PityState): Record<Rarity, number> {
  const odds = { ...pack.odds };
  const over = pity.sinceLegendary + 1 - pack.softPityStart;
  if (over > 0 && odds.legendary > 0) {
    const boost = over * pack.softPityStep;
    odds.legendary += boost;
    odds.common = Math.max(0, odds.common - boost);
  }
  return odds;
}

function idsOfRarity(rarity: Rarity): string[] {
  return ROSTER.filter((s) => s.rarity === rarity).map((s) => s.id);
}

function maxRarity(a: Rarity, b: Rarity): Rarity {
  return rarityAtLeast(a, b) ? a : b;
}

function rollRarity(odds: Record<Rarity, number>, min: Rarity, rng: Rng): Rarity {
  const allowed = Object.fromEntries(
    RARITY_ORDER.filter((r) => rarityAtLeast(r, min)).map((r) => [r, odds[r]]),
  ) as Partial<Record<Rarity, number>>;
  const total = Object.values(allowed).reduce((sum, w) => sum + (w ?? 0), 0);
  return total <= 0 ? min : rng.weighted(allowed);
}

export interface RollOptions {
  owned: Set<string>;
  forceRarity?: Rarity | null;
  forceLegendary?: boolean;
}

export interface RolledCard {
  defId: string;
  rarity: Rarity;
}

export interface PackRoll {
  cards: RolledCard[];
  pity: PityState;
  pityTriggered: 'epic' | 'legendary' | null;
}

/** Tire le contenu d'un parchemin. Cartes triées de la plus commune à la plus rare (révélation en crescendo). */
export function rollPack(pack: PackDef, pity: PityState, rng: Rng, options: RollOptions): PackRoll {
  const odds = effectiveOdds(pack, pity);
  const rarities: Rarity[] = [];
  for (let i = 0; i < pack.cards; i++) {
    rarities.push(rollRarity(odds, i === pack.cards - 1 ? pack.lastSlotMin : 'common', rng));
  }
  let pityTriggered: PackRoll['pityTriggered'] = null;
  const last = pack.cards - 1;
  if (!rarities.some((r) => r === 'legendary') && pity.sinceLegendary + 1 >= pack.legendaryPity) {
    rarities[last] = 'legendary';
    pityTriggered = 'legendary';
  } else if (!rarities.some((r) => rarityAtLeast(r, 'epic')) && pity.sinceEpic + 1 >= pack.epicPity) {
    rarities[last] = maxRarity(rarities[last], 'epic');
    pityTriggered = 'epic';
  }
  if (options.forceLegendary) rarities[last] = 'legendary';
  if (options.forceRarity) rarities.fill(options.forceRarity);

  const owned = new Set(options.owned);
  const cards: RolledCard[] = [];
  let newNeeded = pack.guaranteeNew ?? 0;
  rarities.forEach((rarity, index) => {
    let pool = idsOfRarity(rarity);
    const remaining = pack.cards - index;
    // Parchemin d'initiation : les dernières cartes sont forcées parmi les shinobis jamais obtenus.
    if (newNeeded > 0 && remaining <= newNeeded + 1) {
      const unseen = ROSTER.filter(
        (s) => !owned.has(s.id) && rarityAtLeast(rarity, s.rarity) && s.rarity !== 'legendary' && s.rarity !== 'epic',
      ).map((s) => s.id);
      if (unseen.length) pool = unseen;
    }
    if (!pool.length) pool = idsOfRarity('common');
    if (pack.distinct) {
      const taken = (id: string) => cards.some((c) => c.defId === id);
      let fresh = pool.filter((id) => !taken(id));
      if (!fresh.length) {
        fresh = ROSTER.filter((s) => (pack.odds[s.rarity] > 0 || s.rarity === pack.lastSlotMin) && !taken(s.id)).map(
          (s) => s.id,
        );
      }
      if (fresh.length) pool = fresh;
    }
    const defId = rng.pick(pool);
    const actual = ROSTER.find((s) => s.id === defId)!.rarity;
    if (!owned.has(defId)) newNeeded--;
    owned.add(defId);
    cards.push({ defId, rarity: actual });
  });
  cards.sort((a, b) => RARITIES[a.rarity].order - RARITIES[b.rarity].order);
  const gotLegendary = cards.some((c) => c.rarity === 'legendary');
  return {
    cards,
    pity: {
      sinceEpic: cards.some((c) => rarityAtLeast(c.rarity, 'epic')) ? 0 : pity.sinceEpic + 1,
      sinceLegendary: gotLegendary ? 0 : pity.sinceLegendary + 1,
    },
    pityTriggered,
  };
}

export function pityOf(profile: PlayerProfile, packId: string): PityState {
  return profile.pity[packId] ?? { sinceEpic: 0, sinceLegendary: 0 };
}

export function buyPack(profile: PlayerProfile, packId: string, currency: CurrencyId): Result {
  const pack = getPack(packId);
  const price = pack.prices[currency];
  if (!pack.inShop || price === undefined) {
    return { ok: false, error: "Ce parchemin ne s'achète pas avec cette monnaie" };
  }
  const paid = spendCurrency(profile, currency, price);
  if (!paid.ok) return paid;
  profile.packs[packId] = (profile.packs[packId] ?? 0) + 1;
  return { ok: true };
}

export type OpenedCard = CardGain & { rarity: Rarity };

export interface PackOpening {
  packId: string;
  cards: OpenedCard[];
  pityBefore: PityState;
  pityAfter: PityState;
  pityTriggered: PackRoll['pityTriggered'];
}

export function openPack(
  profile: PlayerProfile,
  packId: string,
  rng: Rng,
  now: number,
  debug: { forceRarity?: Rarity | null; forceLegendary?: boolean } = {},
): Result<{ opening: PackOpening }> {
  if ((profile.packs[packId] ?? 0) <= 0) return { ok: false, error: 'Aucun parchemin de ce type' };
  const pack = getPack(packId);
  const pityBefore = pityOf(profile, packId);
  const roll = rollPack(pack, pityBefore, rng, { owned: new Set(Object.keys(profile.collection)), ...debug });
  profile.packs[packId]--;
  profile.pity[packId] = roll.pity;
  profile.totalPacksOpened++;
  const cards = roll.cards.map((c) => ({ ...addShinobi(profile, c.defId, now), rarity: c.rarity }));
  profile.lifetime.legendaries += cards.filter((c) => c.rarity === 'legendary').length;
  trackMetric(profile, 'packsOpened', 1);
  if (packId === 'starter') profile.tutorial.firstPackOpened = true;
  return {
    ok: true,
    opening: { packId, cards, pityBefore, pityAfter: roll.pity, pityTriggered: roll.pityTriggered },
  };
}
