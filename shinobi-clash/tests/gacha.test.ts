import { describe, expect, it } from 'vitest';
import { buyPack, effectiveOdds, openPack, rollPack } from '../src/core/gacha';
import { newProfile } from '../src/core/profile';
import { Rng } from '../src/core/rng';
import type { Rarity } from '../src/core/types';
import { getPack } from '../src/data/packs';
import { RARITIES, rarityAtLeast } from '../src/data/rarities';
import { ROSTER } from '../src/data/shinobi';

const noPity = { sinceEpic: 0, sinceLegendary: 0 };

describe('tirage des parchemins', () => {
  it('respecte les probabilités affichées (hors dernière carte)', () => {
    const pack = getPack('standard');
    const rng = new Rng(123);
    const counts: Record<Rarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    const N = 20000;
    for (let i = 0; i < N; i++) {
      const roll = rollPack(pack, noPity, rng, { owned: new Set() });
      // La dernière carte a un minimum : on mesure les quatre premières, triées par rareté → on compte tout sauf la plus rare.
      const sorted = [...roll.cards].sort((a, b) => RARITIES[a.rarity].order - RARITIES[b.rarity].order);
      for (const c of sorted.slice(0, 3)) counts[c.rarity]++;
    }
    // Les 3 cartes les moins rares d'un tirage sont majoritairement des communes.
    expect(counts.common / (N * 3)).toBeGreaterThan(0.55);
    expect(counts.legendary).toBeLessThan(N * 3 * 0.01);
  });

  it('la fréquence d’Épiques et Légendaires reste proche des chances annoncées', () => {
    const pack = getPack('standard');
    const rng = new Rng(77);
    let legendary = 0;
    let epic = 0;
    const N = 5000;
    for (let i = 0; i < N; i++) {
      for (const c of rollPack(pack, noPity, rng, { owned: new Set() }).cards) {
        if (c.rarity === 'legendary') legendary++;
        if (c.rarity === 'epic') epic++;
      }
    }
    const cards = N * pack.cards;
    expect(legendary / cards).toBeGreaterThan(0.005);
    expect(legendary / cards).toBeLessThan(0.02);
    expect(epic / cards).toBeGreaterThan(0.025);
    expect(epic / cards).toBeLessThan(0.06);
  });

  it('la dernière carte respecte la rareté minimale', () => {
    const pack = getPack('elite');
    const rng = new Rng(5);
    for (let i = 0; i < 500; i++) {
      const roll = rollPack(pack, noPity, rng, { owned: new Set() });
      expect(roll.cards.some((c) => rarityAtLeast(c.rarity, pack.lastSlotMin))).toBe(true);
    }
  });

  it('pity dur : Épique garantie au palier, Légendaire garantie au palier', () => {
    const pack = getPack('standard');
    const rng = new Rng(1);
    for (let i = 0; i < 200; i++) {
      const epic = rollPack(pack, { sinceEpic: pack.epicPity - 1, sinceLegendary: 0 }, rng, { owned: new Set() });
      expect(epic.cards.some((c) => rarityAtLeast(c.rarity, 'epic'))).toBe(true);
      expect(epic.pity.sinceEpic).toBe(0);
      const legendary = rollPack(pack, { sinceEpic: 0, sinceLegendary: pack.legendaryPity - 1 }, rng, {
        owned: new Set(),
      });
      expect(legendary.cards.some((c) => c.rarity === 'legendary')).toBe(true);
      expect(legendary.pity.sinceLegendary).toBe(0);
    }
  });

  it('les compteurs de pity progressent sans Épique ni Légendaire', () => {
    const pack = getPack('standard');
    const roll = rollPack(pack, noPity, new Rng(3), { owned: new Set(), forceRarity: 'common' });
    expect(roll.pity).toEqual({ sinceEpic: 1, sinceLegendary: 1 });
  });

  it('pity doux : la chance de Légendaire monte au-delà du seuil', () => {
    const pack = getPack('standard');
    const before = effectiveOdds(pack, { sinceEpic: 0, sinceLegendary: pack.softPityStart - 2 });
    const after = effectiveOdds(pack, { sinceEpic: 0, sinceLegendary: pack.softPityStart + 4 });
    expect(before.legendary).toBe(pack.odds.legendary);
    expect(after.legendary).toBeCloseTo(pack.odds.legendary + 5 * pack.softPityStep, 5);
  });

  it('le parchemin d’initiation donne au moins deux shinobis jamais obtenus, sans doublon', () => {
    const pack = getPack('starter');
    for (let seed = 0; seed < 200; seed++) {
      const owned = new Set(['naruto']);
      const roll = rollPack(pack, noPity, new Rng(seed), { owned });
      const ids = roll.cards.map((c) => c.defId);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.filter((id) => !owned.has(id)).length).toBeGreaterThanOrEqual(2);
      expect(roll.cards.every((c) => c.rarity !== 'legendary' && c.rarity !== 'epic')).toBe(true);
    }
  });
});

describe('ouverture et collection', () => {
  it('consomme le parchemin, ajoute les shinobis et convertit les doublons en fragments', () => {
    const profile = newProfile(0);
    profile.packs.standard = 2;
    const all = ROSTER.map((s) => s.id);
    const first = openPack(profile, 'standard', new Rng(10), 0);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(profile.packs.standard).toBe(1);
    expect(profile.totalPacksOpened).toBe(1);
    for (const c of first.opening.cards) expect(profile.collection[c.defId]).toBeTruthy();
    // On possède tout : la seconde ouverture ne donne que des fragments.
    for (const id of all)
      profile.collection[id] ??= { defId: id, level: 1, xp: 0, stars: 1, fragments: 0, obtainedAt: 0, isNew: false };
    const second = openPack(profile, 'standard', new Rng(11), 0);
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    for (const c of second.opening.cards) {
      expect(c.isNew).toBe(false);
      expect(c.fragments).toBe(RARITIES[c.rarity].dupeFragments);
    }
  });

  it('refuse d’ouvrir sans parchemin', () => {
    const profile = newProfile(0);
    expect(openPack(profile, 'standard', new Rng(1), 0)).toEqual({ ok: false, error: 'Aucun parchemin de ce type' });
  });

  it('achat : débite la monnaie et refuse sans ressources', () => {
    const profile = newProfile(0);
    profile.currencies.ryo = 600;
    expect(buyPack(profile, 'standard', 'ryo').ok).toBe(true);
    expect(profile.currencies.ryo).toBe(0);
    expect(profile.packs.standard).toBe(1);
    expect(buyPack(profile, 'standard', 'ryo')).toEqual({ ok: false, error: 'Ressources insuffisantes' });
    expect(buyPack(profile, 'starter', 'ryo').ok).toBe(false);
  });
});
