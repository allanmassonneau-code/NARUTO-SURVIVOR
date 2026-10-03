import { describe, expect, it } from 'vitest';
import { addCurrency, canAfford, spendCurrency } from '../src/core/economy';
import { newProfile } from '../src/core/profile';
import { addPlayerXp, grantReward } from '../src/core/rewards';
import { addShinobi, setTeamMember, starUp } from '../src/core/collection';
import { addXp, MAX_LEVEL, starUpCost, statsAt } from '../src/core/progression';
import { getShinobi } from '../src/data/shinobi';

describe('monnaies', () => {
  it('ajoute, dépense et refuse un achat impossible', () => {
    const p = newProfile(0);
    addCurrency(p, 'ryo', 100);
    expect(p.currencies.ryo).toBe(600);
    expect(spendCurrency(p, 'ryo', 600)).toEqual({ ok: true });
    expect(p.currencies.ryo).toBe(0);
    expect(spendCurrency(p, 'ryo', 1)).toEqual({ ok: false, error: 'Ressources insuffisantes' });
    expect(canAfford(p, 'jade', 50)).toBe(true);
  });

  it('rejette les montants négatifs ou invalides', () => {
    const p = newProfile(0);
    expect(() => addCurrency(p, 'ryo', -5)).toThrow();
    expect(() => addCurrency(p, 'ryo', Number.NaN)).toThrow();
    expect(spendCurrency(p, 'ryo', -5).ok).toBe(false);
  });

  it('distribue une récompense composite', () => {
    const p = newProfile(0);
    grantReward(p, { currencies: { jade: 10 }, packs: { elite: 2 }, cosmetics: ['frame_leaf', 'frame_leaf'], xp: 150 });
    expect(p.currencies.jade).toBe(60);
    expect(p.packs.elite).toBe(2);
    expect(p.cosmetics.owned).toEqual(['frame_leaf']);
    expect(p.level).toBe(2);
  });
});

describe('progression', () => {
  it('niveaux d’un shinobi plafonnés à 30', () => {
    const unit = { level: 1, xp: 0 };
    const gained = addXp(unit, 100000);
    expect(unit.level).toBe(MAX_LEVEL);
    expect(unit.xp).toBe(0);
    expect(gained.levelsGained).toBe(MAX_LEVEL - 1);
  });

  it('l’éveil coûte des fragments et ne donne que +4 % par étoile', () => {
    const p = newProfile(0);
    addShinobi(p, 'naruto', 0);
    const cost = starUpCost('rare', 1);
    expect(starUp(p, 'naruto')).toEqual({ ok: false, error: 'Fragments insuffisants' });
    p.collection.naruto.fragments = cost;
    expect(starUp(p, 'naruto')).toEqual({ ok: true, stars: 2 });
    const def = getShinobi('naruto');
    expect(statsAt(def, 1, 5).hp / statsAt(def, 1, 1).hp).toBeCloseTo(1.16, 2);
  });

  it('XP de joueur : paliers croissants', () => {
    const p = newProfile(0);
    expect(addPlayerXp(p, 149)).toBe(0);
    expect(addPlayerXp(p, 1)).toBe(1);
  });

  it('équipe : un nouveau shinobi comble une place, un déplacement échange les places', () => {
    const p = newProfile(0);
    addShinobi(p, 'naruto', 0);
    addShinobi(p, 'sakura', 0);
    expect(p.teams[0].members).toEqual(['naruto', 'sakura', null]);
    setTeamMember(p, 0, 2, 'naruto');
    expect(p.teams[0].members).toEqual([null, 'sakura', 'naruto']);
    expect(setTeamMember(p, 0, 0, 'itachi').ok).toBe(false);
  });
});
