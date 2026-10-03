import { describe, expect, it } from 'vitest';
import { computeDamage, stageMultiplier, DAMAGE_CONFIG } from '../src/core/battle/damage';
import { elementMultiplier, effectivenessOf } from '../src/data/elements';

const base = {
  power: 60,
  attack: 80,
  defense: 80,
  attackStage: 0,
  defenseStage: 0,
  elementMult: 1,
  stab: false,
  crit: false,
  extraMult: 1,
  roll: 1,
};

describe('formule de dégâts', () => {
  it('donne puissance × K à statistiques égales et variance maximale', () => {
    expect(computeDamage(base)).toBe(Math.round(60 * DAMAGE_CONFIG.K));
  });

  it('applique le multiplicateur élémentaire', () => {
    const neutral = computeDamage(base);
    expect(computeDamage({ ...base, elementMult: 1.5 })).toBe(Math.round(neutral * 1.5));
    expect(computeDamage({ ...base, elementMult: 0.7 })).toBeLessThan(neutral);
  });

  it('le critique multiplie et ignore les buffs de défense, pas les débuffs', () => {
    const crit = computeDamage({ ...base, crit: true });
    expect(crit).toBe(Math.round(60 * DAMAGE_CONFIG.K * DAMAGE_CONFIG.critMult));
    expect(computeDamage({ ...base, crit: true, defenseStage: 3 })).toBe(crit);
    expect(computeDamage({ ...base, crit: true, defenseStage: -2 })).toBeGreaterThan(crit);
  });

  it('écrase le rapport ATK/DEF (exposant < 1)', () => {
    const doubled = computeDamage({ ...base, attack: 160 });
    expect(doubled / computeDamage(base)).toBeCloseTo(2 ** DAMAGE_CONFIG.ratioExponent, 1);
  });

  it('borne les paliers à ±3', () => {
    expect(stageMultiplier(5)).toBe(stageMultiplier(3));
    expect(stageMultiplier(-5)).toBe(stageMultiplier(-3));
    expect(stageMultiplier(0)).toBe(1);
    expect(stageMultiplier(-1)).toBeCloseTo(1 / stageMultiplier(1), 5);
  });

  it('inflige toujours au moins 1', () => {
    expect(computeDamage({ ...base, power: 1, attack: 1, defense: 999, roll: 0 })).toBe(1);
  });
});

describe('affinités élémentaires', () => {
  it('suit le cycle Katon > Fûton > Raiton > Doton > Suiton > Katon', () => {
    expect(elementMultiplier('katon', ['futon'])).toBe(1.5);
    expect(elementMultiplier('futon', ['raiton'])).toBe(1.5);
    expect(elementMultiplier('raiton', ['doton'])).toBe(1.5);
    expect(elementMultiplier('doton', ['suiton'])).toBe(1.5);
    expect(elementMultiplier('suiton', ['katon'])).toBe(1.5);
    expect(elementMultiplier('futon', ['katon'])).toBe(0.7);
  });

  it('le taijutsu est neutre et les doubles éléments se cumulent dans [0,5 ; 2]', () => {
    expect(elementMultiplier('neutral', ['katon', 'doton'])).toBe(1);
    expect(elementMultiplier('raiton', ['doton', 'doton'])).toBe(2);
    expect(elementMultiplier('futon', ['katon', 'katon'])).toBe(0.5);
    expect(effectivenessOf(1.5)).toBe('strong');
    expect(effectivenessOf(0.7)).toBe('weak');
    expect(effectivenessOf(1)).toBe('normal');
  });
});
